'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, RotateCcw, Send, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDeadline } from '@/lib/format'
import type { AgentReply } from '@/lib/agent/types'

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; reply: AgentReply }

const STORAGE_KEY = 'find-chat-v1'
const MAX_STORED = 30

const STARTERS = [
  'Find fully funded scholarships',
  'Show deadlines closing soon',
  'What are my application deadlines?',
]

function load(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : []
    return Array.isArray(parsed) ? parsed.slice(-MAX_STORED) : []
  } catch {
    return []
  }
}

/**
 * Find Chatbot. Talks to /api/chat (read-only agent). The transcript lives only in
 * this browser tab (sessionStorage); server-side history needs a database migration.
 * Enabled by NEXT_PUBLIC_ENABLE_CHATBOT=true (see app/layout.tsx).
 */
export function ChatWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastText, setLastText] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  useEffect(() => {
    setMessages(load())
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)))
    } catch {
      /* storage unavailable: transcript simply is not kept */
    }
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = useCallback(async (text: string) => {
    const message = text.trim()
    if (!message || loading) return

    setError(null)
    setLastText(message)
    setMessages((current) => [...current, { id: `u${++idRef.current}-${Date.now()}`, role: 'user', text: message }])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = (await response.json().catch(() => ({}))) as { reply?: AgentReply; error?: string }

      if (!response.ok || !data.reply) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        const reply = data.reply
        setMessages((current) => [...current, { id: `a${++idRef.current}-${Date.now()}`, role: 'assistant', reply }])
      }
    } catch {
      setError('We couldn’t reach Find. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [loading])

  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Find assistant"
          className="fixed bottom-4 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MessageCircle className="size-6" aria-hidden="true" />
        </button>
      ) : (
        <div
          role="dialog"
          aria-label="Find assistant"
          onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
          className="fixed inset-x-2 bottom-2 z-50 flex max-h-[80dvh] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[390px]"
        >
          <div className="flex items-center justify-between border-b border-border p-3">
            <div>
              <p className="text-sm font-semibold">Find assistant</p>
              <p className="text-xs text-muted-foreground">Searches published opportunities. It can’t submit applications or change your data.</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="New conversation" onClick={() => { setMessages([]); setError(null) }} className="rounded-md p-2 hover:bg-muted">
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
              <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-muted">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
            {messages.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Try one of these:</p>
                <div className="flex flex-wrap gap-2">
                  {STARTERS.map((starter) => (
                    <button key={starter} type="button" onClick={() => send(starter)} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) =>
              message.role === 'user' ? (
                <div key={message.id} className="ml-auto max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground">
                  {message.text}
                </div>
              ) : (
                <div key={message.id} className="max-w-[95%] space-y-2 text-sm">
                  <p className="whitespace-pre-line rounded-2xl bg-muted px-3 py-2">{message.reply.text}</p>
                  {message.reply.cards.map((card) => (
                    <Link key={card.id} href={card.href} className="block rounded-xl border border-border p-3 hover:bg-muted/50">
                      <span className="block font-medium">{card.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {card.organization}{card.country ? ` · ${card.country}` : ''} · Deadline {formatDeadline(card.deadline)}
                      </span>
                    </Link>
                  ))}
                  {message.reply.links.length ? (
                    <div className="flex flex-wrap gap-2">
                      {message.reply.links.map((link) => (
                        <Link key={link.href} href={link.href} className="text-xs underline underline-offset-4" {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {message.reply.suggestions.length ? (
                    <div className="flex flex-wrap gap-2">
                      {message.reply.suggestions.map((suggestion) => (
                        <button key={suggestion} type="button" onClick={() => send(suggestion)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ),
            )}

            {loading ? <p className="text-xs text-muted-foreground" role="status">Find is typing…</p> : null}
            {error ? (
              <div role="alert" className="rounded-lg border border-destructive/40 p-2 text-xs">
                {error}{' '}
                {lastText ? (
                  <button type="button" className="underline" onClick={() => send(lastText)}>Retry</button>
                ) : null}
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(event) => { event.preventDefault(); void send(input) }}
            className="flex gap-2 border-t border-border p-3"
          >
            <label htmlFor="find-chat-input" className="sr-only">Message</label>
            <input
              id="find-chat-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={1000}
              placeholder="Ask about opportunities…"
              className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
