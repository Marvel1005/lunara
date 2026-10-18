import { withSupabase } from "npm:@supabase/server@^1";
import { createClient } from "npm:@supabase/supabase-js@2";

// ─────────────────────────────────────────────────────────────────────────────
// DELETE ACCOUNT
// Verifies the caller's session, then deletes the auth user via the admin
// API. Every app table references auth.users(id) ON DELETE CASCADE, so this
// removes the profile, all health logs, partner connections, and watchlist
// rows in one go. Irreversible by design.
// ─────────────────────────────────────────────────────────────────────────────

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
      }

      const {
        data: { user },
      } = await ctx.supabase.auth.getUser();

      if (!user) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !serviceRoleKey) {
        console.error("[delete-account] missing service-role configuration");
        return Response.json(
          { error: "Account deletion is not configured" },
          { status: 500 }
        );
      }

      const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) {
        // Message-only log — never full error objects.
        console.error("[delete-account] deleteUser failed:", error.message);
        return Response.json(
          { error: "We couldn't delete the account. Please try again later." },
          { status: 500 }
        );
      }

      return Response.json({ success: true });
    }
  ),
};
