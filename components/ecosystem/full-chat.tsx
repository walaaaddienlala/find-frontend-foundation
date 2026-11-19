'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDeadline } from '@/lib/format'
import type { AgentReply } from '@/lib/agent/types'

type Message = { id: string; role: 'user'; text: string } | { id: string; role: 'assistant'; reply: AgentReply }

const STARTERS = ['Find fully funded scholarships', 'Show deadlines closing soon', 'Tell me about internships', 'What are my application deadlines?']

/**
 * Full-page chat. Uses the same read-only /api/chat as the floating widget. If the
 * chatbot is not enabled for this environment the API answers 404 and we say so.
 * The transcript lives only in this tab.
 */
export function FullChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disabled, setDisabled] = useState(false)
  const [last, setLast] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const counter = useRef(0)

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [messages, loading])

  const send = useCallback(async (text: string) => {
    const message = text.trim()
    if (!message || loading) return
    setError(null); setLast(message); setInput(''); setLoading(true)
    setMessages((m) => [...m, { id: `u${++counter.current}`, role: 'user', text: message }])

    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) })
      const data = (await response.json().catch(() => ({}))) as { reply?: AgentReply; error?: string }

      if (response.status === 404) setDisabled(true)
      else if (!response.ok || !data.reply) setError(data.error ?? 'Something went wrong. Please try again.')
      else { const reply = data.reply; setMessages((m) => [...m, { id: `a${++counter.current}`, role: 'assistant', reply }]) }
    } catch {
      setError('We couldn’t reach Find. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [loading])

  if (disabled) {
    return (
      <div role="status" className="rounded-xl border border-border p-6 text-sm">
        <p className="font-medium">The chat is not enabled in this environment.</p>
        <p className="mt-1 text-muted-foreground">It is switched on at build time with <code>NEXT_PUBLIC_ENABLE_CHATBOT=true</code>. Everything else on this page is a preview.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[28rem] flex-col rounded-xl border border-border">
      <div className="border-b border-border p-4 text-sm text-muted-foreground">
        Searches published opportunities, explains and compares them, and shows deadlines. It is read-only, uses no AI model, and cannot submit applications or change your data. This conversation is kept only in this tab.
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted">{s}</button>)}
          </div>
        ) : null}
        {messages.map((message) => message.role === 'user' ? (
          <div key={message.id} className="ml-auto max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">{message.text}</div>
        ) : (
          <div key={message.id} className="max-w-[90%] space-y-2 text-sm">
            <p className="whitespace-pre-line rounded-2xl bg-muted px-4 py-2">{message.reply.text}</p>
            {message.reply.cards.map((card) => (
              <Link key={card.id} href={card.href} className="block rounded-xl border border-border p-3 hover:bg-muted/50">
                <span className="block font-medium">{card.title}</span>
                <span className="block text-xs text-muted-foreground">{card.organization}{card.country ? ` · ${card.country}` : ''} · Deadline {formatDeadline(card.deadline)}</span>
              </Link>
            ))}
            {message.reply.links.length ? <div className="flex flex-wrap gap-3">{message.reply.links.map((l) => <Link key={l.href} href={l.href} className="text-xs underline underline-offset-4" {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{l.label}</Link>)}</div> : null}
            {message.reply.suggestions.length ? <div className="flex flex-wrap gap-2">{message.reply.suggestions.map((s) => <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">{s}</button>)}</div> : null}
          </div>
        ))}
        {loading ? <p role="status" className="text-xs text-muted-foreground">Find is typing…</p> : null}
        {error ? <div role="alert" className="rounded-lg border border-destructive/40 p-2 text-xs">{error}{last ? <> <button type="button" className="underline" onClick={() => send(last)}>Retry</button></> : null}</div> : null}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); void send(input) }} className="flex gap-2 border-t border-border p-3">
        <label htmlFor="full-chat-input" className="sr-only">Message</label>
        <input id="full-chat-input" value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} placeholder="Ask about opportunities…" className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
        <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send message"><Send className="size-4" aria-hidden="true" /></Button>
      </form>
    </div>
  )
}
