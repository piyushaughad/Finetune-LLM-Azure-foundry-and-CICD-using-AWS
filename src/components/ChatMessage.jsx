import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User } from 'lucide-react'

function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function TypingIndicator() {
  return (
    <div className="message-row bot">
      <div className="message-avatar bot">
        <Bot size={16} />
      </div>
      <div className="message-content-wrap">
        <div className="message-meta">
          <span className="message-sender">SupportAI</span>
        </div>
        <div className="message-bubble" style={{ padding: '12px 18px' }}>
          <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const isStreaming = message.streaming

  return (
    <div className={`message-row ${isUser ? 'user' : 'bot'}`}>
      <div className={`message-avatar ${isUser ? 'user' : 'bot'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="message-content-wrap">
        <div className="message-meta">
          <span className="message-sender">{isUser ? 'You' : 'SupportAI'}</span>
          <span className="message-time">{formatTime(new Date(message.timestamp))}</span>
        </div>
        <div className="message-bubble">
          {isUser ? (
            <span>{message.content}</span>
          ) : (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content || ''}
              </ReactMarkdown>
              {isStreaming && <span className="streaming-cursor" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
