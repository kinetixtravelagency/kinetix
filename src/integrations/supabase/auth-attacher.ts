import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

// Attaches the current session's bearer token to every server-function call
// so requireSupabaseAuth can validate it server-side.
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
