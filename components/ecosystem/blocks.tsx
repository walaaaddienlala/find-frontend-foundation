import Link from "next/link";
import type { ReactNode } from "react";

import { DemoForm } from "@/components/ecosystem/demo-form";
import { FullChat } from "@/components/ecosystem/full-chat";
import { AdvancedSearchLive, CategoriesLive, CategoryLive, DeadlineCalendarLive } from "@/components/ecosystem/live";
import { QuizBlock } from "@/components/ecosystem/quiz-block";
import { SampleBadge, StatusBadge } from "@/components/ecosystem/status";
import { ToolBlock } from "@/components/ecosystem/tool-block";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { collections } from "@/lib/ecosystem/demo";
import { childrenOf } from "@/lib/ecosystem/registry";
import { itemHref } from "@/lib/ecosystem/resolve";
import type { Block, CollectionId, DemoItem, PageDef } from "@/lib/ecosystem/types";

export type Search = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
const box = "rounded-xl border border-border p-4";

function Title({ children }: { children?: ReactNode }) {
  return children ? <h2 className="text-lg font-semibold">{children}</h2> : null;
}

function ItemCard({ collection, item }: { collection: CollectionId; item: DemoItem }) {
  return (
    <Link href={itemHref(collection, item.slug)} className={`${box} flex flex-col gap-2 hover:bg-muted/50`}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium">{item.title}</span>
        <SampleBadge />
      </div>
      <span className="text-sm text-muted-foreground">{item.subtitle}</span>
      <span className="text-sm">{item.summary}</span>
      <span className="mt-auto flex flex-wrap gap-x-3 text-xs text-muted-foreground">{item.meta.map(([k, v]) => <span key={k}>{k}: {v}</span>)}</span>
    </Link>
  );
}

function CollectionBlock({ block, path, search }: { block: Extract<Block, { kind: "collection" }>; path: string; search: Search }) {
  const all = collections[block.collection];
  const fixed = block.tag;
  const tag = fixed ?? one(search.tag);
  const q = one(search.q).toLowerCase().trim().slice(0, 80);
  const tags = Array.from(new Set(all.flatMap((item) => item.tags)));
  const shown = all
    .filter((item) => (!tag || item.tags.includes(tag)) && (!q || `${item.title} ${item.subtitle} ${item.summary}`.toLowerCase().includes(q)))
    .slice(0, block.limit ?? 100);

  return (
    <section className="flex flex-col gap-4">
      <Title>{block.title}</Title>
      {block.filter && !block.limit ? (
        <form method="get" action={path} className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor={`q-${block.collection}`}>Search</label>
          <input id={`q-${block.collection}`} name="q" defaultValue={q} placeholder="Search (sample data)" maxLength={80} className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
          {!fixed ? (
            <>
              <label className="sr-only" htmlFor={`t-${block.collection}`}>Filter</label>
              <select id={`t-${block.collection}`} name="tag" defaultValue={tag} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">All</option>
                {tags.map((t) => <option key={t} value={t}>{t.replace(/-/g, " ")}</option>)}
              </select>
            </>
          ) : null}
          <Button type="submit">Search</Button>
        </form>
      ) : null}
      {shown.length === 0 ? <EmptyState title="No sample entries match" description="Try a different search or filter." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((item) => <ItemCard key={item.slug} collection={block.collection} item={item} />)}</div>
      )}
    </section>
  );
}

function ItemBody({ page, item }: { page: PageDef; item: DemoItem }) {
  const collection = page.detailOf as CollectionId;
  const related = collections[collection].filter((other) => other.slug !== item.slug && other.tags.some((t) => item.tags.includes(t))).slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2"><SampleBadge />{item.tags.map((t) => <span key={t} className="text-xs text-muted-foreground">#{t}</span>)}</div>
      <p className="text-lg">{item.summary}</p>
      <dl className="grid gap-3 sm:grid-cols-2">{item.meta.map(([k, v]) => <div key={k} className={box}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
      {item.sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">{section.items.map((entry) => <li key={entry}>{entry}</li>)}</ul>
        </section>
      ))}
      {related.length ? (
        <section className="flex flex-col gap-3"><h2 className="text-lg font-semibold">Related (sample)</h2><div className="grid gap-4 sm:grid-cols-3">{related.map((other) => <ItemCard key={other.slug} collection={collection} item={other} />)}</div></section>
      ) : null}
    </div>
  );
}

function Pct({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
    </div>
  );
}

function CalendarBlock({ events }: { events: { day: number; title: string }[] }) {
  const offset = new Date(Date.UTC(2026, 11, 1)).getUTCDay();

  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-sm font-medium">December 2026 (sample month)</p>
      <div className="grid min-w-[640px] grid-cols-7 gap-px rounded-xl border border-border bg-border text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="bg-surface p-2 text-center font-medium">{d}</div>)}
        {Array.from({ length: offset }).map((_, i) => <div key={`o${i}`} className="bg-background p-2" />)}
        {Array.from({ length: 31 }).map((_, i) => (
          <div key={i} className="min-h-20 bg-background p-2">
            <span className="text-xs text-muted-foreground">{i + 1}</span>
            {events.filter((e) => e.day === i + 1).map((e) => <p key={e.title} className="mt-1 rounded bg-muted px-1 text-xs">{e.title} <span className="text-muted-foreground">(sample)</span></p>)}
          </div>
        ))}
      </div>
    </div>
  );
}

export async function Blocks({ blocks, page, path, params, item, search }: { blocks: Block[]; page: PageDef; path: string; params: Record<string, string>; item?: DemoItem; search: Search }) {
  const out: ReactNode[] = [];

  for (const [index, block] of blocks.entries()) {
    const key = `${block.kind}-${index}`;
    switch (block.kind) {
      case "text": out.push(<section key={key} className="flex flex-col gap-2"><Title>{block.title}</Title><p>{block.body}</p></section>); break;
      case "notice": out.push(<p key={key} role="note" className={`rounded-lg border p-3 text-sm ${block.tone === "warning" ? "border-destructive/40" : "border-border bg-muted/50"}`}>{block.body}</p>); break;
      case "cards": out.push(
        <section key={key} className="flex flex-col gap-3"><Title>{block.title}</Title>
          <div className={`grid gap-4 sm:grid-cols-2 ${block.cols === 4 ? "lg:grid-cols-4" : block.cols === 2 ? "" : "lg:grid-cols-3"}`}>
            {block.items.map((card) => {
              const body = <><div className="flex items-start justify-between gap-2"><span className="font-medium">{card.title}</span>{card.badge ? <span className="rounded-full border border-border px-2 text-xs">{card.badge}</span> : null}</div><span className="text-sm text-muted-foreground">{card.body}</span></>;
              return card.href ? <Link key={card.title} href={card.href} className={`${box} flex flex-col gap-1 hover:bg-muted/50`}>{body}</Link> : <div key={card.title} className={`${box} flex flex-col gap-1`}>{body}</div>;
            })}
          </div>
        </section>); break;
      case "stats": out.push(<div key={key} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{block.items.map((s) => <div key={s.label} className={box}><p className="text-3xl font-semibold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}{s.hint ? ` (${s.hint})` : ""}</p></div>)}</div>); break;
      case "list": out.push(
        <section key={key} className="flex flex-col gap-2"><Title>{block.title}</Title>
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">{block.items.map((entry) => (
            <li key={entry.title} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              {entry.href ? <Link href={entry.href} className="font-medium underline-offset-4 hover:underline">{entry.title}</Link> : <span>{entry.title}</span>}
              {entry.meta ? <span className="text-muted-foreground">{entry.meta}</span> : null}
            </li>))}</ul>
        </section>); break;
      case "table": out.push(
        <section key={key} className="flex flex-col gap-2"><Title>{block.title}</Title>
          <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-border bg-surface"><tr>{block.columns.map((c) => <th key={c} scope="col" className="p-3 font-medium">{c}</th>)}</tr></thead>
            <tbody>{block.rows.map((row, r) => <tr key={r} className="border-b border-border last:border-b-0">{row.map((cell, c) => <td key={c} className="p-3">{cell}</td>)}</tr>)}</tbody>
          </table></div>
        </section>); break;
      case "progress": out.push(<section key={key} className="flex max-w-2xl flex-col gap-3"><Title>{block.title}</Title>{block.items.map((p) => <div key={p.label} className="flex flex-col gap-1"><div className="flex justify-between text-sm"><span>{p.label}</span><span className="text-muted-foreground">{p.value}%</span></div><Pct value={p.value} /></div>)}</section>); break;
      case "steps": out.push(<section key={key} className="flex flex-col gap-3"><Title>{block.title}</Title><ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{block.items.map((s, i) => <li key={s.title} className={box}><p className="text-xs text-muted-foreground">Step {i + 1}</p><p className="font-medium">{s.title}</p><p className="text-sm text-muted-foreground">{s.body}</p></li>)}</ol></section>); break;
      case "gauge": out.push(<section key={key} className={`${box} max-w-md`}><p className="text-sm text-muted-foreground">{block.label}</p><p className="my-2 text-5xl font-semibold">{block.value}%</p><Pct value={block.value} /></section>); break;
      case "kanban": out.push(<div key={key} className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">{block.columns.map((col) => <div key={col.title} className={box}><p className="mb-2 font-medium">{col.title}</p>{col.items.length ? <ul className="flex flex-col gap-2 text-sm">{col.items.map((i) => <li key={i} className="rounded-lg bg-muted/60 p-2">{i}</li>)}</ul> : <p className="text-sm text-muted-foreground">Empty</p>}</div>)}</div>); break;
      case "form": out.push(<DemoForm key={key} title={block.title} fields={block.fields} submit={block.submit} note={block.note} />); break;
      case "tool": out.push(<ToolBlock key={key} fields={block.fields} runLabel={block.runLabel} sample={block.sample} />); break;
      case "quiz": out.push(<QuizBlock key={key} />); break;
      case "chat": out.push(<FullChat key={key} />); break;
      case "calendar": out.push(<CalendarBlock key={key} events={block.events} />); break;
      case "video": out.push(<div key={key} className="flex aspect-video max-w-3xl flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground"><p className="font-medium">Video player (not connected)</p><p>Video hosting requires integration.</p></div>); break;
      case "collection": out.push(<CollectionBlock key={key} block={block} path={path} search={search} />); break;
      case "item": if (item) out.push(<ItemBody key={key} page={page} item={item} />); break;
      case "children": {
        const kids = childrenOf(page.id);
        if (kids.length) out.push(
          <section key={key} className="flex flex-col gap-3"><Title>{block.title ?? "In this section"}</Title>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{kids.map((kid) => (
              <Link key={kid.id} href={kid.route.replace(/\[[^\]]+\]/, "")} className={`${box} flex flex-col gap-2 hover:bg-muted/50`}>
                <span className="font-medium">{kid.title}</span><span className="text-sm text-muted-foreground">{kid.summary}</span><span className="mt-auto"><StatusBadge status={kid.status} /></span>
              </Link>))}</div>
          </section>);
        break;
      }
      case "live":
        out.push(
          block.name === "categories" ? <CategoriesLive key={key} /> :
          block.name === "category" ? <CategoryLive key={key} slug={Object.values(params)[0] ?? ""} /> :
          block.name === "advanced-search" ? <AdvancedSearchLive key={key} searchParams={search} /> :
          <DeadlineCalendarLive key={key} searchParams={search} />);
        break;
    }
  }

  return <div className="flex flex-col gap-8">{out}</div>;
}
