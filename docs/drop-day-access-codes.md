# Drop day — emailing access codes to the waitlist

On drop day you send every waitlist member a personal **access code** that
unlocks the invite-only Stage One drop (`/shop`, `/collections/*`, `/products/*`).
This doc is the runbook.

## How the pieces fit

- **Waitlist store:** Google Sheet via SheetDB (`SHEETDB_API_URL`). Source of
  truth for who gets a code. See [waitlist-google-sheets.md](./waitlist-google-sheets.md).
- **Code store:** Upstash Redis. `scripts/mint-codes.mjs` writes each code here;
  the live gate on Vercel reads from the **same** Upstash DB to validate.
  - `access:code:<CODE>` → `{ "email": "..." }` — what the gate checks.
  - `access:email:<email>` → `<CODE>` — reverse index that keeps codes **stable**.
- **Gate:** `src/proxy.ts` redirects un-unlocked visitors to `/access`; entering a
  valid code sets a signed cookie (`src/app/api/access/validate/route.ts`).
- **Email:** Resend, sent from your machine by the mint script (not from Vercel).

Codes are **per-person, reusable** for the whole drop (not burned on use). The
drop is **open-on-send**: a code works the moment it's in Upstash and stays valid
until you close the drop (see below). `DROP_OPENS_AT` / `DROP_CLOSES_AT` are left
blank on purpose.

## One-time setup (before drop day)

1. **Resend account + API key.** Sign up at resend.com, create an API key, put it
   in `.env.local` as `RESEND_API_KEY=re_...`.
2. **Verify the sending domain.** Add `duskxco.com` in Resend → Domains and add the
   DNS records they give you. Until it's verified you can only *rehearse* (see
   Test mode). Once verified, set in `.env.local`:
   ```
   RESEND_FROM=DUSK&CO <drop@duskxco.com>
   ```
3. **Confirm Upstash is shared with prod.** The `UPSTASH_REDIS_REST_URL` /
   `_TOKEN` in `.env.local` must be the same DB configured in the Vercel project's
   Production env. (They were pushed from this `.env.local`, so they match — verify
   in Vercel → Settings → Environment Variables if unsure.)
4. **Point the emailed link at a LIVE deployment.** `DROP_SITE_URL` in `.env.local`
   is the URL put in every code email — it MUST be a deployment that has the Upstash
   env (i.e. actually validates codes). Currently the customer-facing URL is
   `https://duskco-website-orpin.vercel.app` (the wired project). Change `DROP_SITE_URL`
   to `https://duskxco.com` only after that domain is connected to this Vercel project.

> ⚠️ **Lookalike-domain trap.** `https://duskco-website.vercel.app` (no `-orpin`)
> is a *different, lost* Vercel project on an account we don't control. It serves
> the same UI but has NO Upstash env, so it rejects every valid code. Never send
> customers that URL — always the `-orpin` one (or `duskxco.com` once connected).

## Rehearse first (test mode) — works before the domain is verified

Routes **every** email to one inbox (your Resend account email) so you can see
exactly what members will get, without touching the real list's send log:

```bash
node scripts/mint-codes.mjs --send --test-to you@youremail.com
```

- Uses `onboarding@resend.dev` as the sender (no domain verification needed).
- Subject is prefixed `[TEST → real@member.com]` so you can see who it was for.
- Does **not** record anyone as "sent" — the real blast is unaffected.

## Dry run — preview the map, persist nothing

```bash
node scripts/mint-codes.mjs
```

Prints each `email → CODE`. Codes already in Upstash show as existing; new ones
are marked `(new)` but not saved.

## Persist codes (no email)

```bash
node scripts/mint-codes.mjs --write
```

Writes/keeps one stable code per member in Upstash. Safe to run repeatedly —
existing members keep their code, only genuinely new emails get a fresh one.

## The real drop-day blast

```bash
node scripts/mint-codes.mjs --write --send
```

- Ensures every member has a persisted code, then emails it from `RESEND_FROM`.
- Throttled to stay under Resend's ~2 requests/sec, with one retry on rate-limit.
- Writes `scripts/.mint-send-log.json` (git-ignored). **Anyone already emailed is
  skipped** on re-runs — so if the blast dies halfway, just run it again to resume.
- Members who signed up *after* the blast: run it again; only they get emailed.

To force a re-send to everyone (e.g. resend the whole list): add `--resend-all`.

## Closing the drop

Because the window is open-on-send, close it one of two ways:

- **Timed close:** set `DROP_CLOSES_AT` (ISO 8601 w/ IST offset, e.g.
  `2026-08-20T23:59:00+05:30`) in the Vercel Production env and redeploy. The gate
  and validate route both refuse after that instant.
- **Hard close now:** delete the code keys from Upstash. The gate then rejects
  every code immediately (existing unlocked sessions still expire within 12h).

## Troubleshooting

- **"RESEND_API_KEY not set"** — add the key to `.env.local`.
- **Resend 403 / domain error** — `duskxco.com` isn't verified yet; use `--test-to`
  until it is, or send from `onboarding@resend.dev` to your own address only.
- **Code rejected on the live site** — confirm the mint script and Vercel point at
  the same Upstash DB, and that `DROP_CLOSES_AT` (if set in Vercel) hasn't passed.
- **Someone emailed twice** — check `scripts/.mint-send-log.json`; delete their
  entry only if you intend to re-send.
