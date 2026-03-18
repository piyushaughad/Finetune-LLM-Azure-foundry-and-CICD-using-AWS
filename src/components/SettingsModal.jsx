import { useState, useRef, useEffect } from 'react'
import { X, Key, Info, Zap } from 'lucide-react'

const DEFAULT_ENDPOINT = 'https://piyushaughad-0261-resource.cognitiveservices.azure.com/'
const DEFAULT_DEPLOYMENT = 'gpt-4o-2024-08-06.ft-df8c04a860cc42c08fcf58a8bda4bbc3'
const DEFAULT_API_VERSION = '2024-12-01-preview'
const DEFAULT_SYSTEM_PROMPT = 'You are a helpful, friendly, and professional customer support assistant. You help customers with their questions and issues efficiently and empathetically. Always be polite, clear, and solution-oriented.'

export default function SettingsModal({ config, onSave, onClose, isInitial }) {
  const [form, setForm] = useState({
    apiKey: config.apiKey || '',
    endpoint: config.endpoint || DEFAULT_ENDPOINT,
    deployment: config.deployment || DEFAULT_DEPLOYMENT,
    apiVersion: config.apiVersion || DEFAULT_API_VERSION,
    systemPrompt: config.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    temperature: config.temperature ?? 0.7,
    maxTokens: config.maxTokens ?? 2048,
  })
  const [showKey, setShowKey] = useState(false)
  const apiKeyRef = useRef(null)

  useEffect(() => {
    if (apiKeyRef.current) apiKeyRef.current.focus()
  }, [])

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
  }

  const handleSave = () => {
    if (!form.apiKey.trim()) {
      apiKeyRef.current?.focus()
      return
    }
    onSave(form)
  }

  const handleBackdrop = (e) => {
    if (!isInitial && e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="API Configuration">
        <div className="modal-header">
          <div className="modal-icon">
            <Key />
          </div>
          <div>
            <div className="modal-title">API Configuration</div>
            <div className="modal-subtitle">Connect to your Azure OpenAI deployment</div>
          </div>
          {!isInitial && (
            <button className="modal-close" onClick={onClose} aria-label="Close settings">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="info-banner">
          <Info size={15} />
          <p>Your API key is stored only in your browser's session memory and never sent anywhere except directly to Azure OpenAI.</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="api-key-input">Azure OpenAI API Key</label>
          <div style={{ position: 'relative' }}>
            <input
              id="api-key-input"
              ref={apiKeyRef}
              type={showKey ? 'text' : 'password'}
              className="form-input monospace"
              placeholder="Enter your API key..."
              value={form.apiKey}
              onChange={handleChange('apiKey')}
            />
            <button
              onClick={() => setShowKey(s => !s)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'var(--font-sans)',
                padding: '4px 6px'
              }}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="endpoint-input">Azure Endpoint URL</label>
          <input
            id="endpoint-input"
            type="url"
            className="form-input monospace"
            value={form.endpoint}
            onChange={handleChange('endpoint')}
            placeholder="https://your-resource.cognitiveservices.azure.com/"
          />
          <div className="form-hint">Pre-filled from your Azure resource</div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="deployment-input">Deployment Name</label>
          <input
            id="deployment-input"
            type="text"
            className="form-input monospace"
            value={form.deployment}
            onChange={handleChange('deployment')}
            placeholder="your-deployment-name"
          />
          <div className="form-hint">Your fine-tuned model deployment ID</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="api-version-input">API Version</label>
            <input
              id="api-version-input"
              type="text"
              className="form-input monospace"
              value={form.apiVersion}
              onChange={handleChange('apiVersion')}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="temperature-input">Temperature</label>
            <input
              id="temperature-input"
              type="number"
              className="form-input"
              value={form.temperature}
              onChange={handleChange('temperature')}
              min="0" max="2" step="0.1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="max-tokens-input">Max Tokens</label>
            <input
              id="max-tokens-input"
              type="number"
              className="form-input"
              value={form.maxTokens}
              onChange={handleChange('maxTokens')}
              min="256" max="4096" step="64"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="system-prompt-input">System Prompt</label>
            <textarea
              id="system-prompt-input"
              className="form-input"
              value={form.systemPrompt}
              onChange={handleChange('systemPrompt')}
              rows={2}
              style={{ resize: 'vertical', minHeight: '60px' }}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave} id="save-config-btn">
          <Zap size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          {isInitial ? 'Connect & Start Chatting' : 'Save Configuration'}
        </button>
      </div>
    </div>
  )
}
