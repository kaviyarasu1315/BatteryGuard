import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Bot, User, Send, Loader2, BookOpen, ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react'
import { getRecommendation } from '../api/client'

const PRESET_QUERIES = [
  'Analyze this battery and give me maintenance recommendations.',
  'Is this battery safe to continue using at high charge rates?',
  'What is causing the capacity fade I am seeing?',
  'How should I adjust the charging protocol for this battery?',
  'Explain the anomalies detected and how to address them.',
]

function SourceCard({ source }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/8 rounded-lg overflow-hidden text-[11px]">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/3 transition-colors cursor-pointer text-left">
        <BookOpen size={10} className="text-amber-500 shrink-0" />
        <span className="text-slate-400 flex-1 truncate">{source.source.replace(/_/g, ' ')}</span>
        <span className="text-slate-600 shrink-0">{(source.similarity * 100).toFixed(0)}%</span>
        {open ? <ChevronUp size={10} className="text-slate-600" /> : <ChevronDown size={10} className="text-slate-600" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden">
            <p className="px-3 py-2 text-slate-600 border-t border-white/5 leading-relaxed">{source.excerpt}…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Message({ msg }) {
  const isAI = msg.role === 'assistant'
  return (
    <div className={`chat-message-enter flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
        isAI ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-700 border border-slate-600'
      }`}>
        {isAI ? <Bot size={13} className="text-amber-400" /> : <User size={13} className="text-slate-400" />}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[85%] ${isAI ? '' : 'flex flex-col items-end'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAI
            ? 'bg-white/4 border border-white/8 text-slate-300'
            : 'bg-amber-500/15 border border-amber-500/25 text-amber-100'
        }`}>
          {isAI ? (
            <div className="ai-response">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ) : (
            <p>{msg.content}</p>
          )}
        </div>

        {/* RAG sources */}
        {isAI && msg.sources?.length > 0 && (
          <div className="mt-2 w-full space-y-1">
            <p className="text-[10px] text-slate-600 flex items-center gap-1">
              <BookOpen size={9} /> {msg.sources.length} knowledge sources
            </p>
            {msg.sources.map((s, i) => <SourceCard key={i} source={s} />)}
          </div>
        )}

        {/* Token info */}
        {isAI && msg.tokens && (
          <p className="text-[10px] text-slate-700 mt-1.5 px-1">
            {msg.tokens.prompt + msg.tokens.completion} tokens · {msg.model}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Assistant({ batteryId }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '👋 Hello! I\'m **BatteryGuard AI**, your intelligent battery health assistant.\n\nI can analyze your battery\'s telemetry data and provide **grounded maintenance recommendations** based on retrieved knowledge from battery engineering documentation.\n\nSelect a battery and ask me anything!',
    sources: [],
  }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (query) => {
    if (!batteryId) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Please select a battery first from the sidebar.',
        sources: [],
      }])
      return
    }
    const q = query || input.trim()
    if (!q) return

    setMessages(prev => [...prev, { role: 'user', content: q }])
    setInput('')
    setLoading(true)

    try {
      const result = await getRecommendation(batteryId, q)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response,
        sources: result.rag_sources || [],
        tokens:  result.tokens_used,
        model:   result.model,
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error: ${e.response?.data?.error || e.message}\n\nPlease ensure the backend is running and the knowledge base is ingested.`,
        sources: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] animate-fade-in">
      {/* Header */}
      <div className="glass-card-amber p-4 mb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <Sparkles size={16} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-200">BatteryGuard AI</h2>
          <p className="text-[11px] text-slate-500">
            Powered by LLaMA 3.1 70B · RAG via NVIDIA NIM + ChromaDB
            {batteryId && <span className="text-amber-600 ml-1">· Analyzing {batteryId}</span>}
          </p>
        </div>
        <button onClick={() => setMessages([messages[0]])}
          className="ml-auto btn-ghost text-xs gap-1.5 py-1.5 px-3">
          <RefreshCw size={11} /> Clear
        </button>
      </div>

      {/* Preset queries */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_QUERIES.map((q, i) => (
            <button key={i} onClick={() => send(q)}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-white/8 text-slate-500
                         hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/5
                         transition-all cursor-pointer">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Bot size={13} className="text-amber-400" />
            </div>
            <div className="bg-white/4 border border-white/8 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin text-amber-400" />
              <span className="text-xs text-slate-500">Retrieving context & generating…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={batteryId ? `Ask about ${batteryId}…` : 'Select a battery first…'}
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-slate-200
                     placeholder:text-slate-700 focus:outline-none focus:border-amber-500/40
                     focus:bg-white/8 disabled:opacity-50 transition-all"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed py-3 px-4"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </div>
    </div>
  )
}
