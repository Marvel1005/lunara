import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const RESEND_API_URL = 'https://api.resend.com/emails';

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
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F3F0;border-radius:12px;margin-bottom:0;">
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

export async function POST(request: NextRequest) {
  // 1. Authenticate user via Supabase Server Session
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  // 2. Parse request body
  let body: { invitee_email?: string; partner_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const { invitee_email, partner_name } = body;
  if (!invitee_email || !invitee_email.includes('@') || invitee_email.trim().length < 5) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }

  const cleanEmail = invitee_email.trim().toLowerCase();
  const cleanPartnerName = partner_name?.trim() || null;

  // Prevent self-invitation
  if (user.email && user.email.toLowerCase() === cleanEmail) {
    return NextResponse.json({ error: 'You cannot invite yourself.' }, { status: 400 });
  }

  // 3. Create invitation via Supabase RPC (Trusted Server Execution)
  // RLS and database constraint logic ensure only the authenticated user creates this invitation.
  const { data: rpcData, error: rpcError } = await supabase.rpc('create_partner_invitation', {
    p_invitee_email: cleanEmail,
    p_partner_name: cleanPartnerName,
  });

  if (rpcError || !rpcData) {
    const msg = rpcError?.message || 'Failed to create partner invitation.';
    if (msg.includes('already')) {
      return NextResponse.json({ error: 'This email is already connected or has a pending invite.' }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { invitation_id, raw_token, expires_at } = rpcData as {
    invitation_id: string;
    invitee_email: string;
    raw_token: string;
    expires_at: string;
  };

  // 4. Build acceptance link using raw token on server only
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteeLinkUrl = `${appUrl}/partner/accept?token=${raw_token}`;

  // 5. Send Email via Resend API
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Lunara Support <onboarding@resend.dev>';

  if (!apiKey || apiKey.includes('placeholder')) {
    // If no real Resend key is configured, cleanup DB invitation and return informative error
    await supabase.rpc('cancel_partner_invitation', { p_invitation_id: invitation_id });
    return NextResponse.json(
      { error: 'Email service is not configured with a valid RESEND_API_KEY. The invitation was cancelled.' },
      { status: 503 }
    );
  }

  const htmlContent = buildInvitationEmail({
    inviteeLinkUrl,
    partnerName: cleanPartnerName || '',
    expiresAt: expires_at,
  });

  try {
    const resendRes = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [cleanEmail],
        subject: `${cleanPartnerName ? `${cleanPartnerName} wants` : 'Someone wants'} to support you on Lunara`,
        html: htmlContent,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('[send-invitation] Resend API error:', resendData);
      // Clean up database invitation record so no un-sent invitation lingers
      await supabase.rpc('cancel_partner_invitation', { p_invitation_id: invitation_id });
      return NextResponse.json(
        { error: `Email provider error: ${resendData?.message || 'Could not deliver email.'}` },
        { status: 502 }
      );
    }

    // Success — raw token is discarded and NEVER sent back to client JS or logged!
    return NextResponse.json(
      {
        success: true,
        invitation_id,
        email_id: resendData.id,
      },
      { status: 200 }
    );

  } catch (networkError) {
    console.error('[send-invitation] Network error contacting Resend:', networkError);
    await supabase.rpc('cancel_partner_invitation', { p_invitation_id: invitation_id });
    return NextResponse.json(
      { error: "Network error reaching email service. Invitation cancelled." },
      { status: 503 }
    );
  }
}
