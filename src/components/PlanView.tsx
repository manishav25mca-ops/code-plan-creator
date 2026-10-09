import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { splitSections } from "@/lib/plan-api";

const TOTAL = 9;

export function PlanView({ markdown, loading }: { markdown: string; loading: boolean }) {
  const sections = splitSections(markdown);
  const done = loading ? Math.max(0, sections.length - 1) : sections.length;
  const pct = Math.round((Math.min(done, TOTAL) / TOTAL) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold">Plan progress</span>
            <span className="font-mono text-muted-foreground">{Math.min(done, TOTAL)}/{TOTAL}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <nav className="mt-4 hidden space-y-1 lg:block">
            {sections.map((s, i) => (
              <a key={i} href={`#sec-${i}`} className="block truncate rounded px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        {sections.length === 0 && loading && (
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">The agent is analysing your idea…</p>
            <div className="mt-3 h-1 overflow-hidden rounded bg-muted"><div className="loading-bar h-full bg-accent" /></div>
          </div>
        )}
        {sections.map((s, i) => {
          const m = s.title.match(/^(\d+)\.\s*(.*)$/);
          const writing = loading && i === sections.length - 1;
          return (
            <section key={i} id={`sec-${i}`} className="scroll-mt-6 rounded-xl border bg-card shadow-sm">
              <header className="flex items-center gap-3 border-b px-5 py-3.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary font-mono text-sm text-primary-foreground">
                  {m ? m[1] : i + 1}
                </span>
                <h2 className="text-xl font-semibold">{m ? m[2] : s.title}</h2>
                {writing && <span className="ml-auto animate-pulse text-xs text-accent">writing…</span>}
              </header>
              <div className="plan-md px-5 py-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{ table: ({ children }) => <div className="table-wrap"><table>{children}</table></div> }}
                >
                  {s.body}
                </ReactMarkdown>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
