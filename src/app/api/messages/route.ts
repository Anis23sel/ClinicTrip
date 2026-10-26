import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

// Handle POST requests to send a new secure message
export async function POST(request: Request) {
  try {
    // 1. Initialize Supabase server client using cookies
    const supabase = createClient(await cookies());

    // 2. Authenticate the current user making the request
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 3. Reject the request if the user is not authenticated
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. Extract required fields from the request body
    const { requestId, receiverId, content } = await request.json();

    // 5. Validate that all required payload fields are present and valid
    if (!requestId || !receiverId || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 6. Securely insert the message into the database
    // Note: sender_id is explicitly set to the authenticated user's ID for security
    const { data, error } = await supabase
      .from("messages")
      .insert({
        request_id: requestId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        is_read: false,
      })
      .select()
      .single();

    // 7. Handle any database insertion errors
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 8. Return success response with the created message data
    return NextResponse.json({ success: true, message: data });
    
  } catch (err) {
    // 9. Handle unexpected server or runtime errors
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}