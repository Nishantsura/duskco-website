// Mint one reusable access code per waitlist member and store it in Upstash.
//
//   node scripts/mint-codes.mjs            # dry run — prints the email→code map
//   node scripts/mint-codes.mjs --write    # write codes to Upstash Redis
//   node scripts/mint-codes.mjs --write --send   # also email codes via Resend
//
// Reads the waitlist from SheetDB (the durable source of leads). Codes are
// per-person and reusable during the drop window (they aren't burned on use).

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

// Unambiguous alphabet (no O/0/I/1) for codes people may type by hand.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `DUSK-${s}`;
}

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
    if (!email || seen.has(email)) continue;
    seen.add(email);
    people.push({ email, name: (r.Name || r.name || "").trim() });
  }
  return people;
}

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

async function sendEmail(person, code) {
  const key = ENV.RESEND_API_KEY;
  const site = ENV.NEXT_PUBLIC_SITE_URL || "https://dusk.co";
  const link = `${site}/access?code=${encodeURIComponent(code)}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "DUSK&CO <drop@duskxco.com>",
      to: person.email,
      subject: "Your Stage One access code",
      html: `<p>Stage One is open.</p><p>Your access code: <strong>${code}</strong></p><p><a href="${link}">Unlock the drop →</a></p>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

const people = await fetchWaitlist();
console.log(`Waitlist: ${people.length} unique members\n`);

const map = [];
for (const p of people) {
  const code = makeCode();
  map.push({ ...p, code });
  if (WRITE) {
    await upstash(["SET", `access:code:${code}`, JSON.stringify({ email: p.email })]);
  }
  if (WRITE && SEND) {
    try {
      await sendEmail(p, code);
      console.log(`  ✉  ${p.email}  ${code}`);
    } catch (e) {
      console.log(`  ✗  ${p.email}  ${code}  (email failed: ${e.message})`);
    }
  } else {
    console.log(`  ${WRITE ? "✔" : "·"}  ${p.email.padEnd(32)} ${code}`);
  }
}

console.log(
  `\n${WRITE ? "Wrote" : "Would write"} ${map.length} codes${
    WRITE ? " to Upstash" : " (dry run — pass --write to persist)"
  }.`
);
if (!SEND) console.log("No emails sent (pass --write --send to email codes).");
