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
    const [shopifyResult, sheetResult, emailResult] = await Promise.allSettled([
      createShopifyCustomer({ email, name }),
      appendToGoogleSheet({ email, name, timestamp }),
      sendEmailNotification({ email, name, timestamp }),
    ]);

    if (shopifyResult.status === "rejected") {
      console.error("Shopify customer error:", shopifyResult.reason);
    }
    if (sheetResult.status === "rejected") {
      console.error("Google Sheets error:", sheetResult.reason);
    }
    if (emailResult.status === "rejected") {
      console.error("Email notification error:", emailResult.reason);
    }

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
      from: "DUSK&CO Waitlist <waitlist@duskxco.com>",
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
