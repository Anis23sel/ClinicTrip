import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/app/utils/supabase/server";
import {
  CONTACT_TOPICS,
  isContactSenderRole,
  type ContactSenderRole,
} from "@/app/contact/contactTopics";

type ContactIdentity = {
  user: User | null;
  profileId: string | null;
  senderRole: ContactSenderRole;
  fullName: string;
  email: string;
};

function getUserFullName(user: User) {
  for (const key of ["full_name", "name", "display_name"]) {
    const value = user.user_metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

async function getContactIdentity(
  supabase: ReturnType<typeof createClient>
): Promise<{ identity: ContactIdentity } | { error: string }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError && authError.name !== "AuthSessionMissingError") {
    console.error("Could not verify contact form user:", authError);
    return { error: "We could not verify your account. Please refresh and try again." };
  }

  if (!user) {
    return {
      identity: {
        user: null,
        profileId: null,
        senderRole: "guest",
        fullName: "",
        email: "",
      },
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Could not load contact form profile:", profileError);
    return { error: "We could not load your profile. Please try again." };
  }

  const hasContactRole =
    profile &&
    isContactSenderRole(profile.role) &&
    profile.role !== "guest";

  return {
    identity: {
      user,
      profileId: hasContactRole ? profile.id : null,
      senderRole: hasContactRole ? profile.role : "guest",
      fullName: getUserFullName(user),
      email: user.email ?? "",
    },
  };
}

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const result = await getContactIdentity(supabase);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const { fullName, email, senderRole } = result.identity;

    return NextResponse.json({ fullName, email, senderRole }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Contact profile request failed:", error);
    return NextResponse.json(
      { error: "We could not load your profile. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Please submit a valid contact form." },
        { status: 400 }
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Please submit a valid contact form." },
        { status: 400 }
      );
    }

    const fields = body as Record<string, unknown>;
    const fullName = typeof fields.fullName === "string" ? fields.fullName.trim() : "";
    const email = typeof fields.email === "string" ? fields.email.trim() : "";
    const phone = typeof fields.phone === "string" ? fields.phone.trim() : "";
    const topicValue = typeof fields.topic === "string" ? fields.topic : "";
    const otherSubject =
      typeof fields.otherSubject === "string" ? fields.otherSubject.trim() : "";
    const message = typeof fields.message === "string" ? fields.message.trim() : "";
    const topic = CONTACT_TOPICS.find((item) => item.value === topicValue);

    if (fullName.length < 2 || fullName.length > 120) {
      return NextResponse.json(
        { error: "Please enter your name (2 to 120 characters)." },
        { status: 400 }
      );
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (phone.length > 40) {
      return NextResponse.json(
        { error: "Phone number must be 40 characters or fewer." },
        { status: 400 }
      );
    }

    if (!topic) {
      return NextResponse.json(
        { error: "Please choose a subject." },
        { status: 400 }
      );
    }

    const subject = topic.value === "other" ? otherSubject : topic.subject;

    if (!subject || subject.length > 120) {
      return NextResponse.json(
        { error: "Please enter a subject (up to 120 characters)." },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: "Your message must be between 10 and 5,000 characters." },
        { status: 400 }
      );
    }

    const supabase = createClient(await cookies());
    const contactProfile = await getContactIdentity(supabase);

    if ("error" in contactProfile) {
      return NextResponse.json({ error: contactProfile.error }, { status: 500 });
    }

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        profile_id: contactProfile.identity.profileId,
        sender_role: contactProfile.identity.senderRole,
        full_name: fullName,
        email,
        phone: phone || null,
        category: topic.category,
        subject,
        message,
      });

    if (insertError) {
      console.error("Could not save contact message:", insertError);
      return NextResponse.json(
        { error: "We could not send your message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, senderRole: contactProfile.identity.senderRole },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact message submission failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while sending your message." },
      { status: 500 }
    );
  }
}
