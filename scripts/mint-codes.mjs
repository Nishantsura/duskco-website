// Mint one STABLE access code per waitlist member, store it in Upstash, and
// (optionally) email each member their code via Resend.
//
//   node scripts/mint-codes.mjs                    # dry run — print the email→code map
//   node scripts/mint-codes.mjs --write            # persist codes to Upstash (idempotent)
//   node scripts/mint-codes.mjs --write --send      # also email each member their code
//   node scripts/mint-codes.mjs --send --test-to you@you.com
//                                                  # rehearsal: route EVERY email to one inbox
//   node scripts/mint-codes.mjs --send --resend-all # re-send even to already-emailed members
//
// Reads the waitlist from SheetDB (the durable lead store). Codes are:
//   • per-person and reusable for the whole drop (not burned on use), and
//   • STABLE — a member keeps the same code across runs, via a reverse index
//     access:email:<email> → CODE. Re-running never mints a second code.
// A send log at scripts/.mint-send-log.json makes the drop-day blast resumable:
// by default nobody who already received their code is emailed twice.
//
// Storage keys in Upstash:
//   access:code:<CODE>   → JSON { email }     (read by the gate to validate)
//   access:email:<email> → <CODE>             (reverse index, keeps codes stable)

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

const WRITE = process.argv.includes("--write");
const SEND = process.argv.includes("--send");
const RESEND_ALL = process.argv.includes("--resend-all");
const TEST_TO = (() => {
  const i = process.argv.indexOf("--test-to");
  return i !== -1 ? process.argv[i + 1] : null;
})();
// Sending implies the codes must exist in Upstash, so --send ensures writes too.
const PERSIST = WRITE || SEND;

// The URL emailed to members — must be a LIVE, wired deployment. This is kept
// separate from NEXT_PUBLIC_SITE_URL (the site's aspirational canonical) so the
// emailed link always points somewhere that actually validates codes. Set
// DROP_SITE_URL to duskxco.com once that domain is connected to the project.
const SITE =
  ENV.DROP_SITE_URL || ENV.NEXT_PUBLIC_SITE_URL || "https://duskco-website-orpin.vercel.app";
// Until duskxco.com is verified in Resend, use their shared onboarding sender —
// which can only deliver to your own Resend account email (perfect for --test-to).
const FROM = ENV.RESEND_FROM || "DUSK&CO <onboarding@resend.dev>";
const LOG_PATH = new URL("./.mint-send-log.json", import.meta.url);

// Unambiguous alphabet (no O/0/I/1) for codes people may type by hand.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `DUSK-${s}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── waitlist ────────────────────────────────────────────────────────────────
async function fetchWaitlist() {
  const url = ENV.SHEETDB_API_URL;
  if (!url) throw new Error("SHEETDB_API_URL not set — can't read the waitlist.");
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`SheetDB ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  const seen = new Set();
  const people = [];
  for (const r of rows) {
    const email = (r.Email || r.email || "").trim().toLowerCase();
    if (!email || !email.includes("@") || seen.has(email)) continue;
    seen.add(email);
    people.push({ email, name: (r.Name || r.name || "").trim() });
  }
  return people;
}

// ── upstash ─────────────────────────────────────────────────────────────────
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

// Return this member's existing code, or mint+persist a fresh one. Idempotent:
// the reverse index means the same email always resolves to the same code.
async function ensureCode(email) {
  const existing = await upstash(["GET", `access:email:${email}`]);
  if (existing) return { code: existing, fresh: false };

  const code = makeCode();
  if (PERSIST) {
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
        You're on the list, so the drop is yours to see. Use the code below to unlock Stage One.
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

  // Retry once on a 429 (Resend rate limit), honouring Retry-After.
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

// ── send log (resumable blasts) ──────────────────────────────────────────────
function loadLog() {
  try {
    return JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
  } catch {
    return {};
  }
}
function saveLog(log) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

// ── run ──────────────────────────────────────────────────────────────────────
const people = await fetchWaitlist();
console.log(`Waitlist: ${people.length} unique members`);
if (TEST_TO) console.log(`TEST MODE → every email routed to ${TEST_TO}\n`);
else if (SEND) console.log(`Sending from ${FROM}\n`);
else console.log("");

const log = loadLog();
let minted = 0;
let reused = 0;
let sent = 0;
let skipped = 0;
let failed = 0;

for (const p of people) {
  const { code, fresh } = await ensureCode(p.email);
  fresh ? minted++ : reused++;

  if (!SEND) {
    const mark = PERSIST ? (fresh ? "＋" : "✔") : "·";
    console.log(`  ${mark}  ${p.email.padEnd(34)} ${code}${fresh ? "  (new)" : ""}`);
    continue;
  }

  // --send path
  const already = log[p.email]?.sentAt;
  if (already && !RESEND_ALL && !TEST_TO) {
    skipped++;
    console.log(`  ⇢  ${p.email.padEnd(34)} ${code}  (already sent ${already})`);
    continue;
  }

  try {
    await sendEmail(p, code);
    sent++;
    if (!TEST_TO) {
      log[p.email] = { code, sentAt: new Date().toISOString() };
      saveLog(log);
    }
    console.log(`  ✉  ${p.email.padEnd(34)} ${code}${TEST_TO ? "  (test)" : ""}`);
  } catch (e) {
    failed++;
    if (!TEST_TO) log[p.email] = { code, error: String(e.message), failedAt: new Date().toISOString() };
    saveLog(log);
    console.log(`  ✗  ${p.email.padEnd(34)} ${code}  (${e.message})`);
  }

  // Stay under Resend's ~2 req/sec limit.
  await sleep(600);
}

console.log("\n──────────────────────────────────────────");
console.log(`Codes:  ${minted} new, ${reused} existing${PERSIST ? " (persisted to Upstash)" : " (dry run — pass --write)"}`);
if (SEND) {
  console.log(`Emails: ${sent} sent, ${skipped} skipped, ${failed} failed${TEST_TO ? "  [TEST MODE]" : ""}`);
  if (!TEST_TO) console.log(`Send log: scripts/.mint-send-log.json`);
} else {
  console.log("Emails: none (pass --send to email codes)");
}
