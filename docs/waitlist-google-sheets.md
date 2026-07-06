# Waitlist → Google Sheets setup (via SheetDB)

The waitlist API (`src/app/api/waitlist/route.ts`) stores each signup in a Google
Sheet through **SheetDB** (https://sheetdb.io), which turns a Google Sheet into a
writable REST API. This avoids Google Apps Script / Google Cloud entirely (handy
when multiple Google accounts in one browser break the Apps Script editor).

Once set up, a signup is considered successful as soon as the row is written, so
the form works even while Shopify customer writes are still pending merchant
approval.

## Steps

1. **Create the Sheet.** New Google Sheet. In row 1 add these exact headers
   (case-sensitive — SheetDB maps them to columns):
   `Name` | `Email` | `Timestamp`

2. **Connect SheetDB.** Go to https://sheetdb.io and **sign in with Google**
   (use the account that owns the Sheet). Click **Create new API**, then connect
   / paste your Google Sheet URL and grant access.

3. **Copy the API URL.** SheetDB gives you an endpoint like:
   `https://sheetdb.io/api/v1/abc123xyz`

4. **Add it to the app.** In `.env.local`:

   ```
   SHEETDB_API_URL=https://sheetdb.io/api/v1/abc123xyz
   ```

   Restart the dev server (env vars are read at boot).

## Verify

Submit the waitlist form (or POST to `/api/waitlist`). A new row should appear in
the Sheet and the API should return `{ success: true }`.

## Request/response contract (for reference)

The route POSTs:

```json
{ "data": [ { "Name": "Ada", "Email": "ada@x.com", "Timestamp": "2026-..." } ] }
```

SheetDB responds `201 { "created": 1 }` on success. The `Name`/`Email`/`Timestamp`
keys must match the Sheet's header row exactly.

## Notes

- **Free tier has a monthly request cap** — fine for an early waitlist. Check the
  current limit when you sign up; upgrade or migrate later if volume grows.
- To view leads: just open the Sheet. Export to CSV any time.
- Shopify customer creation is still attempted on every signup; the moment
  protected customer data access is approved, leads also flow into Shopify with
  no code change.
- Sheety is an equivalent alternative (different payload shape); if you prefer it,
  say so and the route can be adjusted.
