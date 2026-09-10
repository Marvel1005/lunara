import { withSupabase } from "npm:@supabase/server@^1";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — read from Supabase Edge Function secrets
// ─────────────────────────────────────────────────────────────────────────────

const APP_URL = Deno.env.get("APP_URL");
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const PARTNER_INVITE_FROM_EMAIL = Deno.env.get("PARTNER_INVITE_FROM_EMAIL");
const PARTNER_INVITE_FROM_NAME = Deno.env.get("PARTNER_INVITE_FROM_NAME") ?? "Lunara";

// Startup checks — log to server only, never surfaced to clients
if (!APP_URL) console.error("[send-partner-invitation] Missing APP_URL secret");
if (!BREVO_API_KEY) console.error("[send-partner-invitation] Missing BREVO_API_KEY secret");
if (!PARTNER_INVITE_FROM_EMAIL) console.error("[send-partner-invitation] Missing PARTNER_INVITE_FROM_EMAIL secret");

// ─────────────────────────────────────────────────────────────────────────────
// EDGE FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
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

        // Validate all required server-side configuration is present
        if (!APP_URL) {
          return Response.json(
            { error: "Invitation service is not configured" },
            { status: 500 }
          );
        }

        if (!BREVO_API_KEY || !PARTNER_INVITE_FROM_EMAIL) {
          return Response.json(
            { error: "Email delivery service is not configured" },
            { status: 500 }
          );
        }

        // ──────────────────────────────────────────────────────────────────
        // 1. Create the secure invitation using the existing Lunara RPC
        //    This must happen BEFORE sending email.
        //    If email fails, the invitation remains valid.
        // ──────────────────────────────────────────────────────────────────

        const { data: invitation, error: invitationError } =
          await ctx.supabase.rpc("create_partner_invitation", {
            p_invitee_email: email,
            p_partner_name: partnerName,
          });

        if (invitationError) {
          console.error(
            "[send-partner-invitation] create_partner_invitation failed:",
            invitationError.message
          );

          return Response.json(
            { error: invitationError.message },
            { status: 400 }
          );
        }

        if (!invitation?.raw_token) {
          console.error("[send-partner-invitation] Invitation RPC did not return raw_token");
          return Response.json(
            { error: "Invitation could not be created" },
            { status: 500 }
          );
        }

        // ──────────────────────────────────────────────────────────────────
        // 2. Build invitation URL from APP_URL env var (never localhost in prod)
        // ──────────────────────────────────────────────────────────────────

        const invitationUrl =
          `${APP_URL.replace(/\/$/, "")}/partner/accept?token=` +
          encodeURIComponent(invitation.raw_token);

        // ──────────────────────────────────────────────────────────────────
        // 3. Build Brevo email payload
        // ──────────────────────────────────────────────────────────────────

        const displayName = escapeHtml(partnerName || "there");
        const safeUrl = escapeHtml(invitationUrl);

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to Lunara</title>
</head>
<body style="margin:0;padding:0;background:#f7f4f1;font-family:Arial,Helvetica,sans-serif;color:#2f2925;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;padding:40px 32px;box-sizing:border-box;">

    <div style="margin-bottom:24px;">
      <span style="font-size:28px;">🌙</span>
    </div>

    <h1 style="margin:0 0 8px;font-size:24px;color:#6f5144;font-weight:700;">
      You're invited to connect on Lunara
    </h1>

    <p style="font-size:15px;line-height:1.65;color:#4a3f3a;margin-bottom:16px;">
      Hi ${displayName},
    </p>

    <p style="font-size:15px;line-height:1.65;color:#4a3f3a;margin-bottom:16px;">
      Someone invited you to join them on Lunara as their partner.
      Lunara helps people stay connected and supportive through the moments that matter.
    </p>

    <p style="font-size:15px;line-height:1.65;color:#4a3f3a;margin-bottom:32px;">
      They choose exactly what to share with you — nothing is shared without their permission.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a
        href="${safeUrl}"
        style="display:inline-block;padding:16px 32px;background:#6f5144;color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.01em;"
      >
        Accept Invitation
      </a>
    </div>

    <p style="font-size:13px;line-height:1.6;color:#766d68;margin-bottom:12px;">
      This invitation expires in 7 days and can only be accepted by this email address.
    </p>

    <p style="font-size:13px;line-height:1.6;color:#766d68;word-break:break-all;margin-bottom:32px;">
      If the button doesn't work, copy and open this link:<br />
      <a href="${safeUrl}" style="color:#6f5144;">${safeUrl}</a>
    </p>

    <hr style="border:none;border-top:1px solid #eee7e2;margin:24px 0;" />

    <p style="font-size:12px;color:#99918c;margin:0;">
      This email was sent by Lunara because someone invited you to Partner Support.
      If you weren't expecting this, you can safely ignore it.
    </p>

  </div>
</body>
</html>`;

        const textContent = `You're invited to connect on Lunara

Hi ${partnerName || "there"},

Someone invited you to join them on Lunara as their partner.

Accept the invitation here:
${invitationUrl}

This invitation expires in 7 days and can only be accepted by this email address.

If you weren't expecting this, you can safely ignore it.`;

        // ──────────────────────────────────────────────────────────────────
        // 4. Call Brevo Transactional Email API
        //    If this fails, the invitation record REMAINS valid.
        //    The inviter can still share the link manually.
        // ──────────────────────────────────────────────────────────────────

        let emailSent = false;

        try {
          const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "content-type": "application/json",
              "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify({
              sender: {
                name: PARTNER_INVITE_FROM_NAME,
                email: PARTNER_INVITE_FROM_EMAIL,
              },
              to: [{ email }],
              subject: "You're invited to connect on Lunara",
              htmlContent,
              textContent,
            }),
          });

          if (brevoRes.ok) {
            emailSent = true;
          } else {
            // Log detailed error server-side only — never surface API details to the client
            const errBody = await brevoRes.text().catch(() => "(unreadable)");
            console.error(
              `[send-partner-invitation] Brevo API error ${brevoRes.status}:`,
              errBody
            );
          }
        } catch (emailErr: unknown) {
          // Network-level failure sending to Brevo — invitation still valid
          console.error(
            "[send-partner-invitation] Brevo fetch failed:",
            emailErr instanceof Error ? emailErr.message : "Unknown error"
          );
        }

        if (!emailSent) {
          // Invitation is valid — return 502 with the invitation URL so the
          // client can still display the copy-link option.
          return Response.json(
            {
              success: false,
              emailSent: false,
              invitationCreated: true,
              invitationUrl,
              message:
                "Invitation created, but the email could not be sent. Share the invitation link directly.",
            },
            { status: 502 }
          );
        }

        // ──────────────────────────────────────────────────────────────────
        // 5. Success — invitation created and email delivered
        // ──────────────────────────────────────────────────────────────────

        return Response.json({
          success: true,
          emailSent: true,
          invitationCreated: true,
          invitationId: invitation.invitation_id,
          expiresAt: invitation.expires_at,
          invitationUrl,
        });
      } catch (error: unknown) {
        console.error(
          "[send-partner-invitation] Unhandled error:",
          error instanceof Error ? error.message : "Unknown error"
        );

        return Response.json(
          { error: "Unable to create or send the partner invitation" },
          { status: 500 }
        );
      }
    }
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Prevent HTML injection in partner name / URL output within the email. */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
