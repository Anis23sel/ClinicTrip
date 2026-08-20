import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(
              name,
              value,
              options
            );
          });
        },
      },
    }
  );

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * Only protect dashboard routes
   */
  if (request.nextUrl.pathname.startsWith("/dashboard")) {

    // --------------------------------
    // 1. User must be logged in
    // --------------------------------

    if (!user) {
      const url = request.nextUrl.clone();

      url.pathname = "/login";

      return NextResponse.redirect(url);
    }

    // --------------------------------
    // 2. Get user's role
    // --------------------------------

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error || !profile) {
      // Something is wrong with the user's profile
      await supabase.auth.signOut();

      const url = request.nextUrl.clone();
      url.pathname = "/login";

      return NextResponse.redirect(url);
    }

    const role = profile.role;

    // --------------------------------
    // 3. Patient dashboard
    // --------------------------------

    if (
      request.nextUrl.pathname.startsWith(
        "/dashboard/patient"
      )
    ) {
      if (role !== "patient") {
        return redirectToCorrectDashboard(
          request,
          role
        );
      }
    }

    // --------------------------------
    // 4. Clinic dashboard
    // --------------------------------

    if (
      request.nextUrl.pathname.startsWith(
        "/dashboard/clinic"
      )
    ) {
      if (role !== "clinic") {
        return redirectToCorrectDashboard(
          request,
          role
        );
      }
    }

    // --------------------------------
    // 5. Admin dashboard
    // --------------------------------

    if (
      request.nextUrl.pathname.startsWith(
        "/dashboard/admin"
      )
    ) {
      if (role !== "admin") {
        return redirectToCorrectDashboard(
          request,
          role
        );
      }
    }
  }

  return supabaseResponse;
}

/*
 * Redirect the user to the dashboard
 * that matches their actual role.
 */
function redirectToCorrectDashboard(
  request: NextRequest,
  role: string
) {
  const url = request.nextUrl.clone();

  if (role === "patient") {
    url.pathname = "/dashboard/patient";
  } else if (role === "clinic") {
    url.pathname = "/dashboard/clinic";
  } else if (role === "admin") {
    url.pathname = "/dashboard/admin";
  } else {
    url.pathname = "/login";
  }

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};