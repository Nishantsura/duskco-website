import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    const results = await Promise.allSettled([
      appendToGoogleSheet({ email, name, timestamp }),
      sendEmailNotification({ email, name, timestamp }),
    ]);

    const sheetResult = results[0];
    if (sheetResult.status === "rejected") {
      console.error("Google Sheets error:", sheetResult.reason);
    }

    const emailResult = results[1];
    if (emailResult.status === "rejected") {
      console.error("Email notification error:", emailResult.reason);
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

async function appendToGoogleSheet({
  email,
  name,
  timestamp,
}: {
  email: string;
  name: string;
  timestamp: string;
}) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Waitlist";

  if (!sheetId || !apiKey) {
    console.warn(
      "Google Sheets not configured. Set GOOGLE_SHEET_ID and GOOGLE_SHEETS_API_KEY."
    );
    return;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A:C:append?valueInputOption=USER_ENTERED&key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      values: [[name || "—", email, timestamp]],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Sheets API error: ${res.status} ${text}`);
  }
}

async function sendEmailNotification({
  email,
  name,
  timestamp,
}: {
  email: string;
  name: string;
  timestamp: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const founderEmails = process.env.FOUNDER_EMAILS;

  if (!resendApiKey || !founderEmails) {
    console.warn(
      "Email notifications not configured. Set RESEND_API_KEY and FOUNDER_EMAILS."
    );
    return;
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
}
