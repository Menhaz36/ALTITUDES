import { useState, useRef, useEffect } from "react";
import axios from "axios";
import api from "../utils/api";

const SUGGESTIONS = [
  "Search flights from Delhi to Mumbai tomorrow",
  "Show my bookings",
  "Find cheapest flight to Bangalore next week",
];

// ── helpers ──────────────────────────────────────────────────────────────

// Parse "2026-03-20T14:25:00" safely without timezone shifts
const parseISOLocal = (str) => {
    if (!str) return null;
    // If it's already HH:MM just return it
    if (/^\d{2}:\d{2}$/.test(str)) return str;
    // Extract time portion directly from the string — avoid Date() UTC conversion
    const timePart = str.slice(11, 16); // "14:25"
    if (timePart && timePart.includes(':')) return timePart;
    return null;
};

const fmtTime = (str) => parseISOLocal(str) ?? '--:--';

const fmtDate = (str) => {
    if (!str) return '--';
    // Parse YYYY-MM-DD as local to avoid UTC offset shifting the day
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return str;
    const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const shouldHide = (m) => {
    if (m.role === "tool") return true;
    if (m.role === "assistant") {
        if (m.tool_calls?.length > 0) return true;
        if (Array.isArray(m.content) && !m.content.some(b => b.type === "text" && b.text?.trim())) return true;
        if (typeof m.content === "string" && m.content.trim().startsWith("<function")) return true;
    }
    return false;
};

const extractText = (m) => {
    if (typeof m.content === "string") return m.content;
    if (Array.isArray(m.content)) return m.content.find(b => b.type === "text")?.text ?? "";
    return null;
};

// ── Payment card ──────────────────────────────────────────────────────────
const PaymentCard = ({ payment, onConfirm, onCancel }) => (
  <div style={{ background: "#111", border: "1px solid rgba(6,182,212,0.4)", borderRadius: "12px", padding: "14px", margin: "8px 0", maxWidth: "270px" }}>
    <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#06b6d4", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Payment Required</p>
    <div style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)", paddingBottom: "10px", marginBottom: "10px" }}>
      <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>✈ {payment.flightName}</p>
      <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#94a3b8" }}>{payment.source} → {payment.destination}</p>
      <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
        {fmtDate(payment.date)}{payment.departureTime ? ` · ${fmtTime(payment.departureTime)}` : ""}
      </p>
    </div>
    <div style={{ marginBottom: "10px" }}>
      {payment.seats?.map((s, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginBottom: "2px" }}>
          <span>Seat {s.label} ({s.category})</span>
          <span>₹{s.price}</span>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
      <span style={{ fontSize: "12px", color: "#94a3b8" }}>Total</span>
      <span style={{ fontSize: "18px", fontWeight: 500, color: "#06b6d4" }}>₹{payment.totalPrice}</span>
    </div>
    <div style={{ display: "flex", gap: "8px" }}>
      <button onClick={onConfirm} style={{ flex: 1, background: "#0e7490", border: "none", borderRadius: "8px", padding: "8px", color: "#fff", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "Montserrat, sans-serif" }}>
        Pay ₹{payment.totalPrice}
      </button>
      <button onClick={onCancel} style={{ flex: 1, background: "none", border: "0.5px solid rgba(239,68,68,0.5)", borderRadius: "8px", padding: "8px", color: "#f87171", fontSize: "12px", cursor: "pointer", fontFamily: "Montserrat, sans-serif" }}>
        Cancel
      </button>
    </div>
  </div>
);

// ── Ticket card ───────────────────────────────────────────────────────────
const TicketCard = ({ booking }) => (
  <div style={{ background: "#0a0a0a", border: "1px solid rgba(6,182,212,0.35)", borderRadius: "12px", overflow: "hidden", maxWidth: "270px", margin: "8px 0", fontFamily: "Montserrat, sans-serif" }}>
    <div style={{ background: "linear-gradient(135deg,#0e7490,#0c4a6e)", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "11px", fontWeight: 500, color: "#cffafe", letterSpacing: "0.05em", textTransform: "uppercase" }}>Booking Confirmed</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    </div>
    <div style={{ padding: "12px 14px" }}>
      {/* Route row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: 500, color: "#e2e8f0" }}>{booking.source}</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#06b6d4" }}>{fmtTime(booking.departureTime)}</p>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 8px" }}>
          <div style={{ width: "100%", height: "1px", background: "rgba(6,182,212,0.3)", position: "relative" }}>
            <span style={{ position: "absolute", top: "-9px", left: "50%", transform: "translateX(-50%)", fontSize: "16px" }}>✈</span>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: 500, color: "#e2e8f0" }}>{booking.destination}</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#06b6d4" }}>{fmtTime(booking.arrivalTime)}</p>
        </div>
      </div>

      {/* Details */}
      <div style={{ background: "#111", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
        {[
          ["Airline",     booking.flightName],
          ["Date",        fmtDate(booking.date)],
          ["Seats",       booking.seats?.map(s => s.label).join(", ")],
          ["Booking ID",  booking.bookingId?.slice(-8).toUpperCase()],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>{label}</span>
            <span style={{ fontSize: "11px", color: label === "Booking ID" ? "#06b6d4" : "#cbd5e1", wordBreak: "break-all" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Passengers */}
      {booking.passengers?.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <p style={{ margin: "0 0 6px", fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>Passengers</p>
          {booking.passengers.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginBottom: "2px" }}>
              <span>{p.name}</span>
              <span>{p.age}y · {p.gender}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: "1px dashed rgba(6,182,212,0.2)", margin: "10px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "#64748b" }}>Total Paid</span>
        <span style={{ fontSize: "16px", fontWeight: 500, color: "#06b6d4" }}>₹{booking.totalPrice}</span>
      </div>
    </div>
  </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────
const Avatar = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#0e7490,#0c4a6e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={size * 0.47} height={size * 0.47} viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.9 13.46a19.79 19.79 0 0 1-3-8.59A2 2 0 0 1 3.92 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 5.99 6l1.07-1.07a2 2 0 0 1 2.12-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18z"/>
    </svg>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────
const AgentChat = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your flight assistant. I can search flights, manage bookings, and help with your travel plans." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [pendingPayment, setPendingPayment] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, pendingPayment]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content) return;
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    const userMsg = { role: "user", content };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      const token = localStorage.getItem("accessToken");
      //comment out for deployment
      // const { data } = await axios.post(
      //   "/api/agent",
      //   { messages: updatedMessages },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
       const { data } = await api.post(
        "/api/agent",
        { messages: updatedMessages },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      const newMessages = [...data.messages];
      if (data.reply) newMessages.push({ role: "assistant", content: data.reply });
      setMessages(newMessages);

      if (data.pendingPayment) setPendingPayment(data.pendingPayment);
      if (data.confirmedBooking) {
        setPendingPayment(null);
        setMessages(prev => [...prev, { role: "ticket", content: data.confirmedBooking }]);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.message ?? "Sorry, something went wrong. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayConfirm = () => { setPendingPayment(null); sendMessage("Yes, confirm the payment and book the ticket"); };
  const handlePayCancel  = () => { setPendingPayment(null); sendMessage("No, cancel the booking"); };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div style={{ width: "320px", background: "#0d0d0d", border: "0.5px solid rgba(6,182,212,0.25)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column" }}>

          {/* Header */}
          <div style={{ background: "#0a0a0a", borderBottom: "0.5px solid rgba(6,182,212,0.2)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Avatar size={32} />
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#e2e8f0", fontFamily: "Montserrat, sans-serif" }}>Flight Assistant</p>
                <p style={{ margin: 0, fontSize: "11px", color: "#06b6d4" }}>{loading ? "Thinking..." : "Online"}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "4px", display: "flex" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ height: "340px", overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px", background: "#0d0d0d" }}>
            {messages.map((m, i) => {
              if (m.role === "ticket") return (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <Avatar size={24} />
                  <TicketCard booking={m.content} />
                </div>
              );
              if (shouldHide(m)) return null;
              const text = extractText(m);
              if (!text?.trim()) return null;
              const isUser = m.role === "user";
              return (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row" }}>
                  {!isUser && <Avatar size={24} />}
                  <div style={{ background: isUser ? "#0e4f5f" : "#1a1a1a", border: isUser ? "0.5px solid rgba(6,182,212,0.3)" : "0.5px solid rgba(255,255,255,0.07)", borderRadius: isUser ? "10px 0 10px 10px" : "0 10px 10px 10px", padding: "8px 12px", maxWidth: "250px" }}>
                    <p style={{ margin: 0, fontSize: "12px", color: isUser ? "#e0f7fa" : "#cbd5e1", lineHeight: 1.5, fontFamily: "Montserrat, sans-serif", whiteSpace: "pre-wrap" }}>{text}</p>
                  </div>
                </div>
              );
            })}

            {pendingPayment && (
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <Avatar size={24} />
                <PaymentCard payment={pendingPayment} onConfirm={handlePayConfirm} onCancel={handlePayCancel} />
              </div>
            )}

            {loading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Avatar size={24} />
                <div style={{ background: "#1a1a1a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: "0 10px 10px 10px", padding: "8px 14px", display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0,1,2].map(d => <span key={d} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#06b6d4", display: "block", animation: `pulse 1.2s ease-in-out ${d*0.2}s infinite` }} />)}
                </div>
              </div>
            )}

            {showSuggestions && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "32px" }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} style={{ background: "none", border: "0.5px solid rgba(6,182,212,0.35)", borderRadius: "20px", padding: "5px 12px", fontSize: "11px", color: "#06b6d4", cursor: "pointer", textAlign: "left", fontFamily: "Montserrat, sans-serif" }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ background: "#0a0a0a", borderTop: "0.5px solid rgba(6,182,212,0.2)", padding: "10px 12px", display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={pendingPayment ? "Use buttons above to confirm or cancel..." : "Ask me anything..."}
              disabled={!!pendingPayment}
              style={{ flex: 1, background: "#1a1a1a", border: "0.5px solid rgba(6,182,212,0.25)", borderRadius: "20px", padding: "8px 14px", fontSize: "12px", color: pendingPayment ? "#475569" : "#e2e8f0", outline: "none", fontFamily: "Montserrat, sans-serif" }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim() || !!pendingPayment}
              style={{ width: "32px", height: "32px", borderRadius: "50%", background: (loading || !input.trim() || !!pendingPayment) ? "#1a3a40" : "#0e7490", border: "none", cursor: (loading || !input.trim() || !!pendingPayment) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setIsOpen(o => !o)}
        style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg,#0e7490,#0c4a6e)", border: "1.5px solid rgba(6,182,212,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(6,182,212,0.2)", transition: "transform 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        {isOpen
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.9 13.46a19.79 19.79 0 0 1-3-8.59A2 2 0 0 1 3.92 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 5.99 6l1.07-1.07a2 2 0 0 1 2.12-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18z"/></svg>
        }
      </button>
    </div>
  );
};

export default AgentChat;