import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/access/rate-limit";

export async function POST(request: Request) {
  try {
    // Throttle signups: 5 per minute per IP (spam / cost control).
    const limit = await rateLimit(`waitlist:${clientIp(request)}`, 5, 60);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const { email, name } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // Every configured channel is attempted. The signup succeeds as long as the
    // lead lands in at least one durable place, so a single channel being down
    // (e.g. Shopify customer writes pending merchant approval) never loses a lead.
    const [shopifyResult, sheetResult, emailResult, confirmResult] =
      await Promise.allSettled([
        createShopifyCustomer({ email, name }),
        appendToGoogleSheet({ email, name, timestamp }),
        sendEmailNotification({ email, name, timestamp }),
        sendClientConfirmation({ email, name }),
      ]);

    if (shopifyResult.status === "rejected") {
      console.error("Shopify customer error:", shopifyResult.reason);
    }
    if (sheetResult.status === "rejected") {
      console.error("Google Sheets error:", sheetResult.reason);
    }
    if (emailResult.status === "rejected") {
      console.error("Founder notification error:", emailResult.reason);
    }
    if (confirmResult.status === "rejected") {
      // Courtesy email only — a failure here never fails the signup.
      console.error("Client confirmation error:", confirmResult.reason);
    }

    // Lead capture is judged on durable stores only (Shopify / Sheet / founder
    // notification) — the client confirmation is a courtesy, not a lead store.
    const captured =
      shopifyResult.status === "fulfilled" ||
      (sheetResult.status === "fulfilled" && sheetResult.value === "stored") ||
      (emailResult.status === "fulfilled" && emailResult.value === "stored");

    if (!captured) {
      // Nothing stored the lead — either every channel failed or none is
      // configured. Don't tell the user they're on the list.
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}

async function createShopifyCustomer({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const [firstName, ...rest] = name.trim().split(" ");
  const lastName = rest.join(" ") || "";

  const res = await fetch(
    "https://duskco-brqicsmo.myshopify.com/admin/api/2025-04/customers.json",
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: {
          first_name: firstName,
          last_name: lastName,
          email,
          tags: "waitlist",
          send_email_welcome: false,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    // 422 = email already taken — not a real error for us
    if (res.status === 422 && err.errors?.email) return;
    throw new Error(`Shopify error ${res.status}: ${JSON.stringify(err)}`);
  }
}

// Appends the lead to a Google Sheet via SheetDB (https://sheetdb.io), which
// turns a Google Sheet into a writable REST API — no Google Cloud project or
// Apps Script deploy needed. The column keys below must match the Sheet's header
// row exactly (Name | Email | Timestamp). Returns "stored" on success, "skipped"
// if unconfigured, and throws on a real failure.
async function appendToGoogleSheet({
  email,
  name,
  timestamp,
}: {
  email: string;
  name: string;
  timestamp: string;
}): Promise<"stored" | "skipped"> {
  const apiUrl = process.env.SHEETDB_API_URL;

  if (!apiUrl) {
    console.warn(
      "Sheet storage not configured. Set SHEETDB_API_URL to your SheetDB API endpoint."
    );
    return "skipped";
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{ Name: name || "—", Email: email, Timestamp: timestamp }],
    }),
  });

  // SheetDB returns 201 { created: N } on success.
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SheetDB error: ${res.status} ${text}`);
  }

  return "stored";
}

async function sendEmailNotification({
  email,
  name,
  timestamp,
}: {
  email: string;
  name: string;
  timestamp: string;
}): Promise<"stored" | "skipped"> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const founderEmails = process.env.FOUNDER_EMAILS;

  if (!resendApiKey || !founderEmails) {
    console.warn(
      "Email notifications not configured. Set RESEND_API_KEY and FOUNDER_EMAILS."
    );
    return "skipped";
  }

  const recipients = founderEmails.split(",").map((e) => e.trim());

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: mailFrom(),
      to: recipients,
      subject: `New Waitlist Signup: ${email}`,
      html: `
        <div style="font-family: 'Georgia', serif; padding: 32px; background: #000; color: #dededd;">
          <h2 style="font-size: 14px; letter-spacing: 3px; font-weight: 300; margin-bottom: 24px;">DUSK&CO WAITLIST</h2>
          <p style="font-size: 16px; margin-bottom: 8px;"><strong>Name:</strong> ${name || "Not provided"}</p>
          <p style="font-size: 16px; margin-bottom: 8px;"><strong>Email:</strong> ${email}</p>
          <p style="font-size: 16px; margin-bottom: 24px;"><strong>Signed up:</strong> ${new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          <hr style="border: none; border-top: 1px solid #363636; margin: 24px 0;" />
          <p style="font-size: 12px; color: #808081;">Wear the difference.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error: ${res.status} ${text}`);
  }

  return "stored";
}

// Sender for outbound waitlist emails. Falls back to Resend's shared onboarding
// sender until a real domain (e.g. duskxco.com) is verified in Resend. IMPORTANT:
// the onboarding fallback can ONLY deliver to your own Resend account email, so
// confirmations reach arbitrary clients only once RESEND_FROM points at a
// verified domain (set RESEND_FROM=DUSK&CO <hello@yourdomain> then).
function mailFrom(): string {
  return process.env.RESEND_FROM || "DUSK&CO <onboarding@resend.dev>";
}

// Sends the person who just signed up an instant "you're on the list"
// confirmation. Courtesy only — a failure here never fails the signup, and it is
// NOT counted toward lead capture. Returns "sent"/"skipped"; throws on a real
// send failure so the caller can log it.
async function sendClientConfirmation({
  email,
  name,
}: {
  email: string;
  name: string;
}): Promise<"sent" | "skipped"> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("Client confirmation skipped: RESEND_API_KEY not set.");
    return "skipped";
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL || "https://duskco-website-orpin.vercel.app";
  const firstName = (name || "").trim().split(" ")[0];
  const greeting = firstName ? `${firstName},` : "You're in.";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: mailFrom(),
      to: email,
      subject: "You're on the list — DUSK&CO Stage One",
      html: `
      <div style="margin:0;padding:0;background:#050505;">
        <div style="max-width:520px;margin:0 auto;padding:48px 32px;font-family:Georgia,'Times New Roman',serif;color:#dededd;">
          <p style="font-size:11px;letter-spacing:4px;font-weight:300;color:#808081;margin:0 0 40px;">DUSK&amp;CO — STAGE ONE</p>
          <h1 style="font-size:26px;line-height:1.2;font-weight:400;margin:0 0 16px;color:#f4f4f2;">${greeting}</h1>
          <p style="font-size:15px;line-height:1.7;color:#b8b8b6;margin:0 0 24px;">
            You're on the waitlist for the Stage One drop. It's invite-only —
            when it opens, we'll email you a <strong style="color:#7fe3cf;">private access code</strong>
            to unlock it before anyone else.
          </p>
          <p style="font-size:15px;line-height:1.7;color:#b8b8b6;margin:0 0 32px;">
            Keep an eye on your inbox. The vault opens soon.
          </p>
          <a href="${site}" style="display:inline-block;background:#7fe3cf;color:#050505;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;padding:14px 28px;border-radius:999px;">
            VISIT DUSK&amp;CO →
          </a>
          <hr style="border:none;border-top:1px solid #1c1c1c;margin:36px 0 16px;" />
          <p style="font-size:11px;letter-spacing:2px;color:#5c5c5c;margin:0;">WEAR THE DIFFERENCE.</p>
        </div>
      </div>`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend (confirmation) ${res.status}: ${await res.text()}`);
  }

  return "sent";
}
