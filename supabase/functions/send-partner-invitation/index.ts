import { withSupabase } from "npm:@supabase/server@^1";
import nodemailer from "npm:nodemailer@^9";

const APP_URL = Deno.env.get("LUNARA_APP_URL");

const GMAIL_USER = Deno.env.get("GMAIL_USER");
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;

if (!APP_URL) {
  console.error("Missing LUNARA_APP_URL secret");
}

if (!GMAIL_USER) {
  console.error("Missing GMAIL_USER secret");
}

if (!GMAIL_APP_PASSWORD) {
  console.error("Missing GMAIL_APP_PASSWORD secret");
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
      }

      try {
        const body = await req.json();

        const email =
          typeof body.email === "string"
            ? body.email.trim().toLowerCase()
            : "";

        const partnerName =
          typeof body.partnerName === "string"
            ? body.partnerName.trim()
            : null;

        if (!email) {
          return Response.json(
            { error: "Partner email is required" },
            { status: 400 }
          );
        }

        if (!APP_URL) {
          return Response.json(
            { error: "Lunara app URL is not configured" },
            { status: 500 }
          );
        }

        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
          return Response.json(
            { error: "Email service is not configured" },
            { status: 500 }
          );
        }

        // ------------------------------------------------------------
        // 1. Create the secure invitation using Lunara's existing RPC
        // ------------------------------------------------------------

        const { data: invitation, error: invitationError } =
          await ctx.supabase.rpc("create_partner_invitation", {
            p_invitee_email: email,
            p_partner_name: partnerName,
          });

        if (invitationError) {
          console.error(
            "create_partner_invitation failed:",
            invitationError.message
          );

          return Response.json(
            {
              error: invitationError.message,
            },
            { status: 400 }
          );
        }

        if (!invitation?.raw_token) {
          console.error("Invitation RPC did not return raw_token");

          return Response.json(
            {
              error: "Invitation could not be created",
            },
            { status: 500 }
          );
        }

        // ------------------------------------------------------------
        // 2. Build the invitation URL
        // ------------------------------------------------------------

        const invitationUrl =
          `${APP_URL.replace(/\/$/, "")}/partner/accept?token=` +
          encodeURIComponent(invitation.raw_token);

        // ------------------------------------------------------------
        // 3. Send invitation through Gmail SMTP
        // ------------------------------------------------------------

        const displayName = partnerName || "there";

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lunara Partner Invitation</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background: #f7f4f1;
  font-family: Arial, Helvetica, sans-serif;
  color: #2f2925;
">
  <div style="
    max-width: 600px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 16px;
    padding: 40px 32px;
    box-sizing: border-box;
  ">

    <h1 style="
      margin: 0 0 20px;
      font-size: 28px;
      color: #6f5144;
    ">
      You're invited to Lunara
    </h1>

    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${escapeHtml(displayName)},
    </p>

    <p style="font-size: 16px; line-height: 1.6;">
      Someone has invited you to connect with them as a partner
      on Lunara.
    </p>

    <p style="font-size: 16px; line-height: 1.6;">
      Lunara lets the person inviting you choose exactly what
      wellness information they want to share with you.
      Nothing is shared unless they explicitly allow it.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a
        href="${escapeHtml(invitationUrl)}"
        style="
          display: inline-block;
          padding: 14px 24px;
          background: #6f5144;
          color: #ffffff;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
        "
      >
        Accept Lunara Invitation
      </a>
    </div>

    <p style="
      font-size: 13px;
      line-height: 1.5;
      color: #766d68;
    ">
      This invitation expires in 7 days and can only be accepted
      by the email address it was sent to.
    </p>

    <p style="
      font-size: 13px;
      line-height: 1.5;
      color: #766d68;
      word-break: break-all;
    ">
      If the button doesn't work, open this link:
      <br />
      ${escapeHtml(invitationUrl)}
    </p>

    <hr style="
      border: none;
      border-top: 1px solid #eee7e2;
      margin: 32px 0;
    " />

    <p style="
      font-size: 12px;
      color: #99918c;
      margin: 0;
    ">
      This email was sent by Lunara because someone invited you
      to Partner Support.
    </p>

  </div>
</body>
</html>
`;

        const text = `
You're invited to connect on Lunara.

Hi ${displayName},

Someone has invited you to connect with them as a partner on Lunara.

Accept the invitation here:

${invitationUrl}

This invitation expires in 7 days and can only be accepted by the email address it was sent to.

Lunara lets the person inviting you choose exactly what wellness information they want to share.
Nothing is shared unless they explicitly allow it.
`;

        try {
          await transporter.sendMail({
            from: `"Lunara" <${GMAIL_USER}>`,
            to: email,
            subject: "You're invited to connect on Lunara",
            text,
            html,
          });
        } catch (emailError) {
          console.error(
            "Gmail SMTP failed:",
            emailError instanceof Error
              ? emailError.message
              : "Unknown email error"
          );

          // IMPORTANT:
          // Do NOT delete the invitation.
          // The user can still copy/share this secure invitation URL.
          return Response.json(
            {
              success: false,
              emailSent: false,
              invitationCreated: true,
              invitationUrl,
              message:
                "Invitation created, but the email could not be sent. You can copy the invitation link and share it manually.",
            },
            { status: 502 }
          );
        }

        // ------------------------------------------------------------
        // 4. Success
        // ------------------------------------------------------------

        return Response.json({
          success: true,
          emailSent: true,
          invitationCreated: true,
          invitationId: invitation.invitation_id,
          expiresAt: invitation.expires_at,
          invitationUrl,
        });
      } catch (error) {
        console.error(
          "send-partner-invitation error:",
          error instanceof Error ? error.message : "Unknown error"
        );

        return Response.json(
          {
            error: "Unable to create or send the partner invitation",
          },
          { status: 500 }
        );
      }
    }
  ),
};

// Prevent HTML injection in partner name / URL output.
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
