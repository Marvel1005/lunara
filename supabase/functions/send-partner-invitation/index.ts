// supabase/functions/send-partner-invitation/index.ts
// Supabase Edge Function — runs on Deno, uses SMTP for email delivery.
// Configure SMTP via Supabase Dashboard → Project Settings → Edge Functions → Secrets:
//   SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, EMAIL_FROM, NEXT_PUBLIC_APP_URL

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Email HTML Builder ────────────────────────────────────────────────────────
function buildInvitationEmail(params: {
  inviteeLinkUrl: string;
  partnerName: string;
  expiresAt: string;
}): string {
  const expiryDate = new Date(params.expiresAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to support someone on Lunara</title>
</head>
<body style="margin:0;padding:0;background-color:#FDFBF7;font-family:'Inter',Arial,sans-serif;color:#2D2628;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background-color:#FFFFFF;border-radius:24px;border:1px solid #EFE8DF;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#FAF7F2,#F6ECEE);padding:32px 40px 24px;text-align:center;">
              <div style="font-size:32px;margin-bottom:8px;">🌙</div>
              <p style="margin:0;font-size:22px;font-weight:700;color:#2D2628;letter-spacing:-0.5px;">Lunara</p>
              <p style="margin:4px 0 0;font-size:13px;color:#7A6F73;">Your cycle. Your comfort.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#2D2628;line-height:1.3;">
                ${params.partnerName ? `${params.partnerName} has` : 'Someone has'} invited you to support them on Lunara
              </h1>

              <p style="margin:0 0 20px;font-size:14px;color:#7A6F73;line-height:1.7;">
                Lunara is a private wellness companion that helps people understand and manage their menstrual cycle and comfort.
              </p>

              <p style="margin:0 0 20px;font-size:14px;color:#7A6F73;line-height:1.7;">
                Your partner has chosen to invite you so you can offer support on harder days — like knowing when they might need a little more patience, a warm drink, or just some quiet company.
              </p>

              <!-- What this means card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F6ECEE;border-radius:16px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#2D2628;">What connecting means</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#6B555B;">✓ &nbsp;Connecting is completely voluntary.</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#6B555B;">✓ &nbsp;You only see information they choose to share.</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#6B555B;">✓ &nbsp;They can change or revoke access at any time.</p>
                    <p style="margin:0;font-size:13px;color:#6B555B;">✓ &nbsp;No private health information is in this email.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${params.inviteeLinkUrl}" style="display:inline-block;padding:16px 36px;background-color:#C08594;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;border-radius:16px;letter-spacing:0.2px;">
                      Accept Partner Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:12px;color:#9C8E92;text-align:center;">
                This invitation expires on <strong>${expiryDate}</strong> and can only be used once.
              </p>
              <p style="margin:0 0 24px;font-size:12px;color:#9C8E92;text-align:center;">
                You will need to sign in to Lunara with the email address this invitation was sent to.
              </p>

              <!-- Link fallback -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F3F0;border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#5A5056;">If the button above doesn't work, copy this link:</p>
                    <p style="margin:0;font-size:11px;color:#9C8E92;word-break:break-all;">${params.inviteeLinkUrl}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #EFE8DF;">
              <p style="margin:0;font-size:11px;color:#B0A8AC;text-align:center;line-height:1.6;">
                Lunara does not share any private health or cycle information in invitations.<br />
                If you did not expect this invitation, you can safely ignore it. No account will be created on your behalf.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Main Handler ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Extract and verify the user's JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Missing token.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Create a Supabase client scoped to the user's JWT (respects RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Please sign in.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Parse request body
    const body = await req.json();
    const { invitee_email, partner_name } = body as {
      invitee_email?: string;
      partner_name?: string;
    };

    if (!invitee_email || !invitee_email.includes('@') || invitee_email.trim().length < 5) {
      return new Response(JSON.stringify({ error: 'Please provide a valid email address.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanEmail = invitee_email.trim().toLowerCase();
    const cleanPartnerName = partner_name?.trim() || null;

    // Prevent self-invitation
    if (user.email && user.email.toLowerCase() === cleanEmail) {
      return new Response(JSON.stringify({ error: 'You cannot invite yourself.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Create invitation via RPC (enforces RLS + uniqueness constraints server-side)
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_partner_invitation', {
      p_invitee_email: cleanEmail,
      p_partner_name: cleanPartnerName,
    });

    if (rpcError || !rpcData) {
      const msg = rpcError?.message || 'Failed to create partner invitation.';
      if (msg.includes('already')) {
        return new Response(
          JSON.stringify({ error: 'This email is already connected or has a pending invite.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invitation_id, raw_token, expires_at } = rpcData as {
      invitation_id: string;
      raw_token: string;
      expires_at: string;
    };

    // 5. Build the acceptance link for the authorized inviter
    const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
    const inviteeLinkUrl = `${appUrl}/partner/accept?token=${raw_token}`;

    // 6. Optional Gmail SMTP delivery using Google App Password
    // Secret names: GMAIL_USER, GMAIL_APP_PASSWORD (with backward-compatible SMTP_* fallbacks)
    const gmailUser = Deno.env.get('GMAIL_USER') || Deno.env.get('SMTP_USERNAME');
    const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD') || Deno.env.get('SMTP_PASSWORD');
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const emailFrom = Deno.env.get('EMAIL_FROM') || (gmailUser ? `Lunara <${gmailUser}>` : undefined);

    let emailSent = false;

    if (gmailUser && gmailAppPassword) {
      try {
        const client = new SmtpClient();
        if (smtpPort === 465) {
          await client.connectTLS({
            hostname: smtpHost,
            port: smtpPort,
            username: gmailUser,
            password: gmailAppPassword,
          });
        } else {
          await client.connect({
            hostname: smtpHost,
            port: smtpPort,
          });
          await client.startTLS({
            hostname: smtpHost,
            username: gmailUser,
            password: gmailAppPassword,
          });
        }

        await client.send({
          from: emailFrom || gmailUser,
          to: cleanEmail,
          subject: `${cleanPartnerName ? `${cleanPartnerName} wants` : 'Someone wants'} to support you on Lunara`,
          html: buildInvitationEmail({
            inviteeLinkUrl,
            partnerName: cleanPartnerName || '',
            expiresAt: expires_at,
          }),
        });

        await client.close();
        emailSent = true;
      } catch (smtpError) {
        // Non-fatal: Gmail SMTP delivery failure must NOT destroy an otherwise valid invitation.
        // We log a safe warning without exposing credentials or tokens, and keep the invitation active.
        console.warn(
          '[send-partner-invitation] Email delivery failed or unavailable. Falling back to secure link sharing.'
        );
        emailSent = false;
      }
    }

    // 7. Return usable invitation info to the authorized inviter
    // Safe: Invitation URL contains token for the inviter to copy/share directly.
    return new Response(
      JSON.stringify({
        success: true,
        invitation_id,
        invitation_url: inviteeLinkUrl,
        expires_at,
        email_sent: emailSent,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[send-partner-invitation] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
