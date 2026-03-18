import { useState, useRef, useEffect, useCallback } from 'react'
import { AzureOpenAI } from 'openai'
import {
  Bot, Settings, Trash2, SendHorizonal, AlertCircle, X,
  Sparkles, MessageCircle, HelpCircle, ShieldCheck, Clock
} from 'lucide-react'
import ChatMessage, { TypingIndicator } from './components/ChatMessage'
import SettingsModal from './components/SettingsModal'

// ─── Suggestion prompts ────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '🙋', text: 'How can you help me today?' },
  { icon: '📦', text: 'I have an issue with my order' },
  { icon: '💳', text: 'I need help with billing or payments' },
  { icon: '🔧', text: 'Something isn\'t working properly' },
]

// ─── Unique message ID ─────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function App() {
  const [config, setConfig] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const clientRef = useRef(null)

  // ── Build Azure OpenAI client whenever config changes ───────────────────
  useEffect(() => {
    if (config) {
      clientRef.current = new AzureOpenAI({
        apiVersion: config.apiVersion,
        endpoint: config.endpoint,
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true,
      })
    }
  }, [config])

  // ── Auto-scroll to bottom ─────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // ── Focus input on load ───────────────────────────────────────────────
  useEffect(() => {
    if (config && !showSettings) {
      inputRef.current?.focus()
    }
  }, [config, showSettings])

  // ── Handle config save ────────────────────────────────────────────────
  const handleConfigSave = (newConfig) => {
    setConfig(newConfig)
    setShowSettings(false)
    setError(null)
  }

  // ── Send message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading || !clientRef.current) return
    setError(null)

    const userMsg = {
      id: uid(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    // Build the messages payload (include conversation history)
    const apiMessages = [
      { role: 'system', content: config.systemPrompt },
      ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
    ]

    // Placeholder bot message for streaming
    const botMsgId = uid()
    const botMsg = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
    }

    setMessages(prev => [...prev, botMsg])
    setIsLoading(false)
    setIsStreaming(true)

    try {
      const stream = await clientRef.current.chat.completions.create({
        model: config.deployment,
        messages: apiMessages,
        max_tokens: Number(config.maxTokens),
        temperature: Number(config.temperature),
        top_p: 1.0,
        stream: true,
      })

      let accumulated = ''
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || ''
        accumulated += delta
        setMessages(prev =>
          prev.map(m =>
            m.id === botMsgId ? { ...m, content: accumulated } : m
          )
        )
      }

      // Mark streaming done
      setMessages(prev =>
        prev.map(m =>
          m.id === botMsgId ? { ...m, streaming: false } : m
        )
      )
    } catch (err) {
      console.error('Azure OpenAI error:', err)
      const errText = err?.message || 'An unexpected error occurred.'
      setError(errText.length > 200 ? errText.slice(0, 200) + '…' : errText)
      // Remove the empty bot message on error
      setMessages(prev => prev.filter(m => m.id !== botMsgId))
    } finally {
      setIsStreaming(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, isLoading, config])

  // ── Handle send button / Enter key ────────────────────────────────────
  const handleSend = () => sendMessage(input)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Auto-resize textarea ───────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }

  // ── Clear chat ─────────────────────────────────────────────────────────
  const clearChat = () => {
    setMessages([])
    setError(null)
    inputRef.current?.focus()
  }

  // ──────────────────────────────────────────────────────────────────────
  const isConnected = !!config
  const canSend = isConnected && input.trim().length > 0 && !isLoading && !isStreaming

  return (
    <>
      {/* Animated background orbs */}
      <div className="bg-effects" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className="app-layout">
        {/* ── Header ── */}
        <header className="app-header">
          <div className="header-brand">
            <div className="header-logo">
              <Bot />
            </div>
            <div>
              <div className="header-title">SupportAI</div>
              <div className="header-subtitle">Fine-tuned GPT-4o · Azure OpenAI</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Connection status */}
            <div className="header-status">
              <div className={`status-dot ${isConnected ? 'online' : ''}`} />
              {isConnected ? 'Connected' : 'Not connected'}
            </div>

            {/* Deployment badge */}
            {isConnected && (
              <div className="config-badge" title={config.deployment}>
                <Sparkles size={11} />
                <span>{config.deployment.split('.').pop()?.slice(0, 20) ?? config.deployment}</span>
              </div>
            )}

            {/* Clear chat */}
            {messages.length > 0 && (
              <button
                className="icon-btn danger"
                onClick={clearChat}
                title="Clear conversation"
                id="clear-chat-btn"
              >
                <Trash2 size={15} />
              </button>
            )}

            {/* Settings */}
            <button
              className="icon-btn"
              onClick={() => setShowSettings(true)}
              title="API Settings"
              id="settings-btn"
            >
              <Settings size={15} />
            </button>
          </div>
        </header>

        {/* ── Error banner ── */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <p>{error}</p>
            <button onClick={() => setError(null)} title="Dismiss">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Chat messages ── */}
        <main className="chat-container" id="chat-container">
          <div className="chat-inner">
            {messages.length === 0 ? (
              <div className="welcome-screen">
                <div className="welcome-avatar">
                  <Bot />
                </div>
                <div>
                  <h1 className="welcome-title">How can I help you?</h1>
                  <p className="welcome-subtitle">
                    {isConnected
                      ? "I'm your AI-powered support assistant, fine-tuned to help you efficiently. Ask me anything!"
                      : "Click the settings icon to connect your Azure OpenAI API key and start chatting."}
                  </p>
                </div>
                {isConnected && (
                  <div className="welcome-suggestions">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        className="suggestion-chip"
                        id={`suggestion-${i}`}
                        onClick={() => sendMessage(s.text)}
                      >
                        <span className="chip-icon">{s.icon}</span>
                        {s.text}
                      </button>
                    ))}
                  </div>
                )}
                {!isConnected && (
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '12px 28px', marginTop: 0 }}
                    onClick={() => setShowSettings(true)}
                    id="connect-btn"
                  >
                    <Settings size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                    Connect API Key
                  </button>
                )}
              </div>
            ) : (
              messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}

            {/* Typing indicator while waiting for first token */}
            {isLoading && <TypingIndicator />}

            <div ref={chatEndRef} />
          </div>
        </main>

        {/* ── Input area ── */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              id="chat-input"
              className="chat-input"
              placeholder={isConnected ? 'Type your message…  (Shift+Enter for new line)' : 'Configure API key to start chatting…'}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={!isConnected || isLoading || isStreaming}
              rows={1}
              aria-label="Message input"
            />
            <button
              id="send-btn"
              className="send-btn"
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              title="Send message"
            >
              <SendHorizonal size={17} />
            </button>
          </div>
          <p className="input-footer">
            AI-generated responses may contain inaccuracies. Verify important information.
          </p>
        </div>
      </div>

      {/* ── Settings Modal ── */}
      {(showSettings || !config) && (
        <SettingsModal
          config={config || {}}
          onSave={handleConfigSave}
          onClose={() => setShowSettings(false)}
          isInitial={!config}
        />
      )}
    </>
  )
}
