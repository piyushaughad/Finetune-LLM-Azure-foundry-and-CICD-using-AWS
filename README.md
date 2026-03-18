# SupportAI – Customer Support Chatbot

A premium AI customer support bot powered by your **fine-tuned Azure OpenAI GPT-4o** model. Built with React + Vite, featuring real-time streaming responses, multi-turn conversation history, and a stunning dark glassmorphism UI — deployable to S3 as a static site.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ and npm ([Download](https://nodejs.org/))
- Your **Azure OpenAI API key** (from Azure AI Foundry)

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

On first open, a **configuration modal** will appear. Enter:
- Your **Azure OpenAI API key**
- The endpoint, deployment, and other fields are **pre-filled** for your resource

### 3. Build for production (S3 deploy)

```bash
npm run build
```

Upload the contents of the `dist/` folder to your S3 bucket with **static website hosting** enabled.

---

## ⚙️ Azure OpenAI Configuration

| Field | Value (pre-filled) |
|---|---|
| Endpoint | `https://piyushaughad-0261-resource.cognitiveservices.azure.com/` |
| Deployment | `gpt-4o-2024-08-06.ft-df8c04a860cc42c08fcf58a8bda4bbc3` |
| API Version | `2024-12-01-preview` |
| API Key | **Enter in the UI** |

> **Security**: Your API key is stored only in browser memory (React state) and sent directly to Azure — no intermediary server.

---

## ✨ Features

- 🤖 **Fine-tuned GPT-4o** via Azure OpenAI
- ⚡ **Real-time streaming** responses with animated cursor
- 💬 **Multi-turn conversation** history preserved in session
- 🎨 **Dark glassmorphism UI** with animated background orbs
- 📝 **Markdown rendering** in bot responses (lists, code blocks, bold, etc.)
- 💡 **Suggestion chips** on welcome screen for quick prompts
- 🔐 **API key input via UI** — no environment variables needed
- 📱 **Responsive** — works on mobile and desktop
- 🗑️ **Clear chat** button to start fresh

---

## 📁 Project Structure

```
src/
├── main.jsx                 # React entry point
├── index.css                # Full design system & CSS
├── App.jsx                  # Main app + Azure OpenAI integration
└── components/
    ├── ChatMessage.jsx      # Message bubbles + typing indicator
    └── SettingsModal.jsx    # API configuration modal
```

---

## 🚢 Deploying to AWS S3

1. Build: `npm run build`
2. Create an S3 bucket with **Static website hosting** enabled
3. Upload all files from `dist/` to the bucket root
4. Set **index document** to `index.html`
5. Set **error document** to `index.html` (for SPA routing)
6. Configure bucket policy for public read access
