// Drop-day code blast. Pick a RANDOM subset of the Shopify waitlist, mint each
// winner a stable access code in Upstash, email it to them, and tag them
// "code-sent" in Shopify so a later run never picks them again.
//
//   node scripts/send-codes.mjs                       # show eligible pool size
//   node scripts/send-codes.mjs --select 50           # dry run: preview 50 random picks + codes
//   node scripts/send-codes.mjs --select 50 --send    # mint, email, and tag those 50
//   node scripts/send-codes.mjs --select 50 --send --test-to you@you.com
//                                                     # rehearsal: route every email to one inbox,
//                                                     # and DON'T tag/log (so it stays repeatable)
//   node scripts/send-codes.mjs --resend-failed --send
//                                                     # retry people picked earlier whose email failed
//
// The waitlist lives in Shopify as customers tagged "waitlist" (written by
// src/app/api/waitlist/route.ts). Eligible = tagged "waitlist" AND NOT "code-sent".
// Codes are per-person, reusable for the whole drop (not burned on use), and STABLE
// via a reverse index access:email:<email> → CODE, so a member keeps one code.
//
// Upstash keys:
//   access:code:<CODE>   → JSON { email }   (read by the gate to validate)
//   access:email:<email> → <CODE>           (reverse index, keeps codes stable)
// Shopify marker:
//   customer tag "code-sent"                (excludes them from future --select)

import fs from "fs";

const ENV = Object.fromEntries(
  fs
    .readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

// ── args ──────────────────────────────────────────────────────────────────────
const SEND = process.argv.includes("--send");
const RESEND_FAILED = process.argv.includes("--resend-failed");
const TEST_TO = (() => {
  const i = process.argv.indexOf("--test-to");
  return i !== -1 ? process.argv[i + 1] : null;
})();
const SELECT = (() => {
  const i = process.argv.indexOf("--select");
  if (i === -1) return null;
  const n = parseInt(process.argv[i + 1], 10);
  if (!Number.isInteger(n) || n <= 0) {
    console.error("--select needs a positive integer, e.g. --select 50");
    process.exit(1);
  }
  return n;
})();
// Persisting codes + tagging happens only for a real send (never in test mode).
const COMMIT = SEND && !TEST_TO;

const SITE =
  ENV.DROP_SITE_URL || ENV.NEXT_PUBLIC_SITE_URL || "https://duskco-website-orpin.vercel.app";
const FROM = ENV.RESEND_FROM || "DUSK&CO <onboarding@resend.dev>";
const LOG_PATH = new URL("./.mint-send-log.json", import.meta.url);
const API_VERSION = ENV.SHOPIFY_API_VERSION || "2025-04";
const SHOP = ENV.SHOPIFY_STORE_DOMAIN;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1
function makeCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `DUSK-${s}`;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Shopify admin ───────────────────────────────────────────────────────────
// Dev Dashboard apps don't issue permanent tokens, so mint a short-lived one from
// the client credentials (same as src/lib/shopify/admin.ts). A static
// SHOPIFY_ADMIN_TOKEN, if set, wins.
let _adminToken = null;
async function adminToken() {
  if (_adminToken) return _adminToken;
  if (ENV.SHOPIFY_ADMIN_TOKEN) return (_adminToken = ENV.SHOPIFY_ADMIN_TOKEN);
  if (!SHOP || !ENV.SHOPIFY_CLIENT_ID || !ENV.SHOPIFY_CLIENT_SECRET)
    throw new Error("Set SHOPIFY_ADMIN_TOKEN, or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET.");
  const res = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: ENV.SHOPIFY_CLIENT_ID,
      client_secret: ENV.SHOPIFY_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error(`Shopify token mint ${res.status}: ${await res.text()}`);
  return (_adminToken = (await res.json()).access_token);
}

async function shopifyGraphQL(query, variables = {}) {
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": await adminToken(),
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`Shopify GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data;
}

// All waitlist customers who have NOT already been sent a code.
async function fetchEligible() {
  const people = [];
  let cursor = null;
  const q = `query($cursor: String) {
    customers(first: 250, after: $cursor, query: "tag:waitlist") {
      edges { node { id email firstName displayName tags } }
      pageInfo { hasNextPage endCursor }
    }
  }`;
  do {
    const data = await shopifyGraphQL(q, { cursor });
    for (const { node } of data.customers.edges) {
      const email = (node.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) continue;
      // Exclude anyone already sent a code (client-side, so tag spelling can't bite us).
      if ((node.tags || []).some((t) => t.toLowerCase() === "code-sent")) continue;
      people.push({ id: node.id, email, name: (node.firstName || node.displayName || "").trim() });
    }
    cursor = data.customers.pageInfo.hasNextPage ? data.customers.pageInfo.endCursor : null;
  } while (cursor);
  // De-dup by email (a customer could in theory appear once, but be safe).
  const seen = new Set();
  return people.filter((p) => (seen.has(p.email) ? false : seen.add(p.email)));
}

async function tagCodeSent(customerId) {
  const data = await shopifyGraphQL(
    `mutation($id: ID!, $tags: [String!]!) {
       tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
     }`,
    { id: customerId, tags: ["code-sent"] }
  );
  const errs = data.tagsAdd.userErrors;
  if (errs.length) throw new Error(`tagsAdd: ${JSON.stringify(errs)}`);
}

// ── Upstash ───────────────────────────────────────────────────────────────────
async function upstash(command) {
  const url = ENV.UPSTASH_REDIS_REST_URL;
  const token = ENV.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("UPSTASH_REDIS_REST_URL / _TOKEN not set.");
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`);
  const j = await res.json();
  if (j.error) throw new Error(`Upstash error: ${j.error}`);
  return j.result;
}

// This member's existing code, or a fresh one. Persisted only when `persist`.
async function ensureCode(email, persist) {
  const existing = await upstash(["GET", `access:email:${email}`]);
  if (existing) return { code: existing, fresh: false };
  const code = makeCode();
  if (persist) {
    await upstash(["SET", `access:code:${code}`, JSON.stringify({ email })]);
    await upstash(["SET", `access:email:${email}`, code]);
  }
  return { code, fresh: true };
}

// ── email ───────────────────────────────────────────────────────────────────
function emailHtml(code, link) {
  return `
  <div style="margin:0;padding:0;background:#050505;">
    <div style="max-width:520px;margin:0 auto;padding:48px 32px;font-family:Georgia,'Times New Roman',serif;color:#dededd;">
      <p style="font-size:11px;letter-spacing:4px;font-weight:300;color:#808081;margin:0 0 40px;">DUSK&amp;CO — STAGE ONE</p>
      <h1 style="font-size:26px;line-height:1.2;font-weight:400;margin:0 0 16px;color:#f4f4f2;">The vault is open.</h1>
      <p style="font-size:15px;line-height:1.7;color:#b8b8b6;margin:0 0 32px;">
        You've been selected from the waitlist. Use the code below to unlock Stage One.
      </p>
      <div style="border:1px solid #2c8f7f;border-radius:10px;padding:22px;text-align:center;margin:0 0 28px;background:rgba(44,143,127,0.06);">
        <p style="font-size:10px;letter-spacing:3px;color:#808081;margin:0 0 10px;">YOUR ACCESS CODE</p>
        <p style="font-size:28px;letter-spacing:6px;font-family:'Courier New',monospace;color:#7fe3cf;margin:0;">${code}</p>
      </div>
      <a href="${link}" style="display:block;text-align:center;background:#7fe3cf;color:#050505;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;padding:16px;border-radius:999px;">
        UNLOCK THE DROP →
      </a>
      <p style="font-size:12px;line-height:1.6;color:#5c5c5c;margin:32px 0 0;">
        Or enter the code manually at <a href="${SITE}/access" style="color:#808081;">${SITE.replace(/^https?:\/\//, "")}/access</a>.
        This code is tied to your invite — please don't share it.
      </p>
      <hr style="border:none;border-top:1px solid #1c1c1c;margin:32px 0 16px;" />
      <p style="font-size:11px;letter-spacing:2px;color:#5c5c5c;margin:0;">WEAR THE DIFFERENCE.</p>
    </div>
  </div>`;
}

async function sendEmail(person, code) {
  const key = ENV.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set — can't send emails.");
  const link = `${SITE}/access?code=${encodeURIComponent(code)}`;
  const to = TEST_TO || person.email;
  const subject = TEST_TO
    ? `[TEST → ${person.email}] Your Stage One access code`
    : "Your Stage One access code";
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html: emailHtml(code, link) }),
    });
    if (res.ok) return;
    if (res.status === 429 && attempt === 0) {
      const wait = Number(res.headers.get("retry-after")) * 1000 || 1200;
      await sleep(wait);
      continue;
    }
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}

// ── send log (resumable) ──────────────────────────────────────────────────────
const loadLog = () => {
  try {
    return JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
  } catch {
    return {};
  }
};
const saveLog = (log) => fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));

// Fisher-Yates, then take the first n.
function pickRandom(arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

// ── run ──────────────────────────────────────────────────────────────────────
if (!SHOP) {
  console.error("SHOPIFY_STORE_DOMAIN not set.");
  process.exit(1);
}

const log = loadLog();

// Retry mode: re-send to people chosen earlier whose email failed (from the log).
if (RESEND_FAILED) {
  const failed = Object.entries(log).filter(([, v]) => v.error && !v.sentAt);
  console.log(`Retry: ${failed.length} previously-failed sends\n`);
  let sent = 0,
    still = 0;
  for (const [email, v] of failed) {
    try {
      await sendEmail({ email, name: "" }, v.code);
      sent++;
      log[email] = { code: v.code, sentAt: new Date().toISOString() };
      saveLog(log);
      console.log(`  ✉  ${email.padEnd(34)} ${v.code}`);
    } catch (e) {
      still++;
      log[email] = { code: v.code, error: String(e.message), failedAt: new Date().toISOString() };
      saveLog(log);
      console.log(`  ✗  ${email.padEnd(34)} ${v.code}  (${e.message})`);
    }
    await sleep(600);
  }
  console.log(`\nRetried: ${sent} sent, ${still} still failing.`);
  process.exit(0);
}

const pool = await fetchEligible();
console.log(`Eligible waitlist (not yet sent a code): ${pool.length}\n`);

if (SELECT === null) {
  console.log("Pass --select N to choose N random winners, then --send to email them.");
  console.log("  Preview:  node scripts/send-codes.mjs --select 50");
  console.log("  Send:     node scripts/send-codes.mjs --select 50 --send");
  process.exit(0);
}

if (pool.length === 0) {
  console.log("Nobody eligible — waitlist is empty or everyone already has a code.");
  process.exit(0);
}

const n = Math.min(SELECT, pool.length);
if (n < SELECT) console.log(`Only ${pool.length} eligible — selecting all ${n}.\n`);
const winners = pickRandom(pool, n);

if (!SEND) {
  console.log(`DRY RUN — ${n} random picks (codes shown; nothing persisted or emailed):\n`);
}
if (TEST_TO) console.log(`TEST MODE → every email routed to ${TEST_TO} (no tagging/logging)\n`);
else if (SEND) console.log(`Sending from ${FROM}, tagging winners "code-sent" in Shopify\n`);

let minted = 0,
  reused = 0,
  sent = 0,
  failed = 0;

for (const p of winners) {
  const { code, fresh } = await ensureCode(p.email, COMMIT);
  fresh ? minted++ : reused++;

  if (!SEND) {
    console.log(`  ·  ${p.email.padEnd(34)} ${code}${fresh ? "  (new)" : "  (existing)"}`);
    continue;
  }

  try {
    await sendEmail(p, code);
    if (COMMIT) {
      await tagCodeSent(p.id);
      log[p.email] = { code, sentAt: new Date().toISOString() };
      saveLog(log);
    }
    sent++;
    console.log(`  ✉  ${p.email.padEnd(34)} ${code}${TEST_TO ? "  (test)" : ""}`);
  } catch (e) {
    failed++;
    if (COMMIT) {
      log[p.email] = { code, error: String(e.message), failedAt: new Date().toISOString() };
      saveLog(log);
    }
    console.log(`  ✗  ${p.email.padEnd(34)} ${code}  (${e.message})`);
  }
  await sleep(600); // stay under Resend's ~2 req/sec
}

console.log("\n──────────────────────────────────────────");
console.log(`Picked: ${n} of ${pool.length} eligible`);
console.log(`Codes:  ${minted} new, ${reused} existing${COMMIT ? " (persisted to Upstash)" : SEND ? "" : " (dry run)"}`);
if (SEND) {
  console.log(`Emails: ${sent} sent, ${failed} failed${TEST_TO ? "  [TEST MODE]" : ""}`);
  if (COMMIT) {
    console.log(`Tagged "code-sent": ${sent}`);
    console.log(`Send log: scripts/.mint-send-log.json`);
    if (failed) console.log(`Retry failures: node scripts/send-codes.mjs --resend-failed --send`);
  }
} else {
  console.log("Emails: none (add --send to email these winners)");
}
