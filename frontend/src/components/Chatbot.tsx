import { useEffect, useRef, useState } from 'react'
import { sendChat } from '../api/integration'

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    {
      role: 'ai',
      text: 'Xin chào! Tôi là trợ lý ảo ZakiBooking. Tôi có thể giúp gì cho chuyến du lịch tiếp theo của bạn?',
    },
  ])
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight)
  }, [messages, open])

  async function send(text: string) {
    if (!text.trim()) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    try {
      const reply = await sendChat(text)
      setMessages((m) => [...m, { role: 'ai', text: reply }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: 'Xin lỗi, trợ lý đang bận. Thử lại sau hoặc liên hệ hotline.' },
      ])
    }
  }

  const chips = [
    'Tour giá rẻ dưới 5 triệu',
    'Điểm đến hot nhất',
    'Tư vấn tour biển',
    'Tra cứu đơn hàng',
  ]

  return (
    <>
      <div className="ai-chat-trigger" id="chatbotTrigger" onClick={() => setOpen(true)} role="button" tabIndex={0}>
        <i className="bi bi-chat-dots-fill fs-3" />
      </div>
      <div className={`ai-chatbot-widget${open ? ' active' : ''}`} id="chatbotWidget">
        <div className="ai-chat-header">
          <div className="title">
            <i className="bi bi-robot fs-4" />
            <div>
              AI Assistant
              <span className="status">● Sẵn sàng hỗ trợ</span>
            </div>
          </div>
          <button type="button" className="btn p-0 border-0" onClick={() => setOpen(false)}>
            <i className="bi bi-x-lg chat-close-icon" />
          </button>
        </div>
        <div className="ai-chat-body" ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              {m.text}
            </div>
          ))}
          {messages.length === 1 && (
            <div className="chat-suggestions">
              {chips.map((c) => (
                <button key={c} type="button" className="suggestion-chip" onClick={() => send(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ai-chat-footer">
          <div className="ai-chat-input-wrapper">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
            />
            <button type="button" className="ai-send-btn" onClick={() => send(input)}>
              <i className="bi bi-send-fill chat-send-icon" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
