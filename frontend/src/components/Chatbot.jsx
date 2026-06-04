import { useEffect, useRef, useState } from "react";
import { sendChat } from "../api/integration";
function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Xin ch\xE0o! T\xF4i l\xE0 tr\u1EE3 l\xFD \u1EA3o ZakiBooking. T\xF4i c\xF3 th\u1EC3 gi\xFAp g\xEC cho chuy\u1EBFn du l\u1ECBch ti\u1EBFp theo c\u1EE7a b\u1EA1n?"
    }
  ]);
  const bodyRef = useRef(null);
  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [messages, open]);
  async function send(text) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    try {
      const reply = await sendChat(text);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Xin l\u1ED7i, tr\u1EE3 l\xFD \u0111ang b\u1EADn. Th\u1EED l\u1EA1i sau ho\u1EB7c li\xEAn h\u1EC7 hotline." }
      ]);
    }
  }
  const chips = [
    "Tour gi\xE1 r\u1EBB d\u01B0\u1EDBi 5 tri\u1EC7u",
    "\u0110i\u1EC3m \u0111\u1EBFn hot nh\u1EA5t",
    "T\u01B0 v\u1EA5n tour bi\u1EC3n",
    "Tra c\u1EE9u \u0111\u01A1n h\xE0ng"
  ];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "ai-chat-trigger", id: "chatbotTrigger", onClick: () => setOpen(true), role: "button", tabIndex: 0 }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-chat-dots-fill fs-3" })), /* @__PURE__ */ React.createElement("div", { className: `ai-chatbot-widget${open ? " active" : ""}`, id: "chatbotWidget" }, /* @__PURE__ */ React.createElement("div", { className: "ai-chat-header" }, /* @__PURE__ */ React.createElement("div", { className: "title" }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-robot fs-4" }), /* @__PURE__ */ React.createElement("div", null, "AI Assistant", /* @__PURE__ */ React.createElement("span", { className: "status" }, "\u25CF S\u1EB5n s\xE0ng h\u1ED7 tr\u1EE3"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn p-0 border-0", onClick: () => setOpen(false) }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-x-lg chat-close-icon" }))), /* @__PURE__ */ React.createElement("div", { className: "ai-chat-body", ref: bodyRef }, messages.map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: `chat-bubble ${m.role}` }, m.text)), messages.length === 1 && /* @__PURE__ */ React.createElement("div", { className: "chat-suggestions" }, chips.map((c) => /* @__PURE__ */ React.createElement("button", { key: c, type: "button", className: "suggestion-chip", onClick: () => send(c) }, c)))), /* @__PURE__ */ React.createElement("div", { className: "ai-chat-footer" }, /* @__PURE__ */ React.createElement("div", { className: "ai-chat-input-wrapper" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Nh\u1EADp tin nh\u1EAFn...",
      value: input,
      onChange: (e) => setInput(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && send(input)
    }
  ), /* @__PURE__ */ React.createElement("button", { type: "button", className: "ai-send-btn", onClick: () => send(input) }, /* @__PURE__ */ React.createElement("i", { className: "bi bi-send-fill chat-send-icon" }))))));
}
export {
  Chatbot
};
