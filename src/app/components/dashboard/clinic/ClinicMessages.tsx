"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MessageSquare, Calendar, Info, User, DollarSign, Stethoscope } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

const supabase = createClient();

type PatientRequestItem = {
  id: string;
  patientName: string;
  procedure: string;
  patientUserId: string; 
  startDate: string;
  endDate: string;
  price: number | null;
  status: string;
  hasUnread: boolean;
  lastMessageAt: string;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read?: boolean;
};

interface ClinicMessagesProps {
  clinicId: string;
  initialRequestId?: string | null;
}

export default function ClinicMessages({ clinicId, initialRequestId }: ClinicMessagesProps) {
  const [requests, setRequests] = useState<PatientRequestItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);

const selectedRequestIdRef = useRef(selectedRequestId);
  const currentUserIdRef = useRef(currentUserId);

  useEffect(() => {
    selectedRequestIdRef.current = selectedRequestId;
    currentUserIdRef.current = currentUserId;
  }, [selectedRequestId, currentUserId]);

  // Reference to the bottom of the messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  // Function to mark messages as read for a specific request and user
  const markMessagesAsRead = async (requestId: string, userId: string) => {
    if (!requestId || !userId) return;

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("request_id", requestId)
      .eq("receiver_id", userId)
      .eq("is_read", false);

    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, hasUnread: false } : req))
    );
  };

  // 1. Fetch clinic requests and their messages on component mount
  useEffect(() => {
    const fetchClinicRequests = async () => {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      const { data: reqs, error: reqError } = await supabase
        .from("Patient_request")
        .select("id, id_patient, procedure, start_date, end_date, price, clinic_decision, patient_decision, created_at")
        .eq("id_clinic", clinicId);

      if (reqError || !reqs) {
        setLoading(false);
        return;
      }

      if (reqs.length > 0) {
        const { data: messagesData } = await supabase
          .from("messages")
          .select("request_id, receiver_id, sender_id, is_read, created_at");

        const activeRequestIds = new Set((messagesData || []).map((m) => m.request_id));

        const unreadRequestIds = new Set(
          (messagesData || [])
            .filter((m) => m.receiver_id === user.id && m.is_read === false)
            .map((m) => m.request_id)
        );

        const filteredReqs = reqs.filter(
          (r) => activeRequestIds.has(r.id) || (initialRequestId && r.id === initialRequestId)
        );

        const formattedReqs = await Promise.all(
          filteredReqs.map(async (r) => {
            const { data: patient } = await supabase
              .from("patients")
              .select("first_name, last_name, profile_id")
              .eq("id", r.id_patient)
              .single();

            let patientUserId = "";
            if (patient?.profile_id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("user_id")
                .eq("id", patient.profile_id)
                .single();
              if (profile) patientUserId = profile.user_id;
            }

            const patientName = patient ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() : "Patient";

            const reqMessages = (messagesData || []).filter((m) => m.request_id === r.id);
            let latestTime = r.created_at || new Date().toISOString();

            if (reqMessages.length > 0) {
              reqMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              latestTime = reqMessages[0].created_at;
            }

            return {
              id: String(r.id),
              patientName: patientName || "Patient",
              procedure: r.procedure || "Consultation",
              patientUserId: patientUserId,
              startDate: r.start_date || "Not specified",
              endDate: r.end_date || "Not specified",
              price: r.price !== null ? Number(r.price) : null,
              status: r.clinic_decision && r.patient_decision ? "Accepted" : "Pending",
              hasUnread: unreadRequestIds.has(r.id),
              lastMessageAt: latestTime,
            };
          })
        );

        formattedReqs.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

        setRequests(formattedReqs);

        if (initialRequestId && formattedReqs.some((r) => r.id === initialRequestId)) {
          setSelectedRequestId(initialRequestId);
        } else if (formattedReqs.length > 0) {
          setSelectedRequestId(formattedReqs[0].id);
        }
      }
      setLoading(false);
    };

    fetchClinicRequests();
  }, [clinicId, initialRequestId]);

  // 2. Fetch messages for the selected request and set up a real-time subscription
  useEffect(() => {
    if (!currentUserId) return;

    const fetchMessages = async () => {
      if (!selectedRequestId) return;
      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at, is_read")
        .eq("request_id", selectedRequestId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
        setTimeout(() => scrollToBottom(), 100);
      }

      await markMessagesAsRead(selectedRequestId, currentUserId);
    };

    fetchMessages();

    // Set up a real-time subscription to listen for new messages
    const channel = supabase
      .channel(`clinic-messages-global-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMsg = payload.new as Message & { request_id: string };
          const activeId = selectedRequestIdRef.current;
          const userId = currentUserIdRef.current;

          // Only update messages if the new message belongs to the currently selected request and is not sent by the clinic user
          if (String(newMsg.request_id) === String(activeId)) {
            if (newMsg.sender_id !== userId) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              setTimeout(() => scrollToBottom(), 50);

              // Mark the new message as read since the clinic user is viewing it
              await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", newMsg.id);
            }
          }

          // Update the requests list to reflect the latest message timestamp and unread status
          setRequests((prev) => {
            const updated = prev.map((r) => {
              if (r.id === String(newMsg.request_id)) {
                return {
                  ...r,
                  lastMessageAt: newMsg.created_at,
                  hasUnread: r.id === activeId ? false : newMsg.sender_id !== userId,
                };
              }
              return r;
            });
            updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRequestId, currentUserId]);

  // 3. Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRequestId || !currentUserId) return;

    const currentReq = requests.find((r) => r.id === selectedRequestId);
    if (!currentReq || !currentReq.patientUserId) return;

    // Call to the /api/messages API route
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: selectedRequestId,
        receiverId: currentReq.patientUserId,
        content: newMessage,
      }),
    });

    if (response.ok) {
      const nowIso = new Date().toISOString();
      await markMessagesAsRead(selectedRequestId, currentUserId);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender_id: currentUserId,
          content: newMessage.trim(),
          created_at: nowIso,
          is_read: false,
        },
      ]);
      setNewMessage("");

      setTimeout(() => scrollToBottom(), 50);

      setRequests((prev) => {
        const updated = prev.map((r) => 
          r.id === selectedRequestId 
            ? { ...r, lastMessageAt: nowIso, hasUnread: false } 
            : r
        );
        updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        return updated;
      });
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading messages...</p>;
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <MessageSquare className="mx-auto mb-2 text-muted-foreground" size={32} />
        <p className="text-muted-foreground">No patient conversations available yet.</p>
      </div>
    );
  }

  const activeRequest = requests.find((r) => r.id === selectedRequestId);

  return (
    <div className="grid h-[650px] grid-cols-1 md:grid-cols-12 rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      
      {/* ================= COLUMN 1 : Patient List ================= */}
      <div className="md:col-span-3 border-r border-border flex flex-col h-full bg-card overflow-hidden">
        <div className="p-4 border-b border-border font-semibold text-lg shrink-0">
          <span>Patient Messages</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {requests.map((req) => (
            <button
              key={req.id}
              onClick={() => setSelectedRequestId(req.id)}
              className={`w-full text-left p-4 transition-colors border-b border-border/50 block ${
                selectedRequestId === req.id 
                  ? "bg-accent/70 font-medium" 
                  : req.hasUnread 
                  ? "bg-primary/10 font-semibold hover:bg-primary/15" 
                  : "hover:bg-accent/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground truncate">{req.patientName}</p>
                {req.hasUnread && (
                  <span className="flex h-2 w-2 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{req.procedure}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ================= COLUMN 2 : Discussion Area ================= */}
      <div className={`${showDetails ? "md:col-span-6" : "md:col-span-9"} flex flex-col justify-between bg-muted/5 transition-all duration-300 h-full overflow-hidden`}>
        
        <div className="p-4 border-b border-border bg-card flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-semibold">{activeRequest?.patientName}</h3>
            <p className="text-xs text-muted-foreground">{activeRequest?.procedure}</p>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors"
          >
            <Info size={14} />
            {showDetails ? "Hide Consultation Details" : "See Consultation Details"}
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground mt-10">
              No messages yet with this patient. Send a message below.
            </p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card flex gap-2 shrink-0">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => markMessagesAsRead(selectedRequestId!, currentUserId!)}
            placeholder="Type your message to the patient..."
            className="flex-1 rounded-lg border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>

      {/* ================= COLUMN 3 : Consultation Details ================= */}
      {showDetails && activeRequest && (
        <div className="md:col-span-3 border-l border-border bg-card p-4 overflow-y-auto flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-semibold text-sm">Consultation Info</h4>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <User size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium">{activeRequest.patientName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Stethoscope size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Procedure</p>
                  <p className="font-medium">{activeRequest.procedure}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Dates</p>
                  <p className="font-medium text-xs">
                    {activeRequest.startDate} {activeRequest.endDate !== activeRequest.startDate ? `to ${activeRequest.endDate}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <DollarSign size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Price Proposed</p>
                  <p className="font-medium text-primary">
                    {activeRequest.price !== null ? `$${activeRequest.price.toLocaleString()}` : "TBD"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {activeRequest.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}