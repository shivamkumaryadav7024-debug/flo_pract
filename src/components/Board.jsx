import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import Column from "./Column";
import TaskCard from "./TaskCard";
import { moveTaskApi } from "../utils/mockApi";

const COLUMNS    = ["todo", "inProgress", "done"];
const COL_LABELS = { todo:"To Do", inProgress:"In Progress", done:"Done" };
const COL_ACCENT = {
  todo:       { dot:"#818cf8", glow:"rgba(99,102,241,0.5)",  tab:"rgba(99,102,241,0.13)", tabBorder:"rgba(99,102,241,0.35)", tabText:"#a5b4fc" },
  inProgress: { dot:"#fbbf24", glow:"rgba(245,158,11,0.5)",  tab:"rgba(245,158,11,0.13)", tabBorder:"rgba(245,158,11,0.35)", tabText:"#fde68a" },
  done:       { dot:"#34d399", glow:"rgba(16,185,129,0.5)",  tab:"rgba(16,185,129,0.13)", tabBorder:"rgba(16,185,129,0.35)", tabText:"#6ee7b7" },
};
const TEAM = [
  { name:"Alex",   g:["#7c3aed","#9333ea"] },
  { name:"Morgan", g:["#0891b2","#2563eb"] },
  { name:"Jordan", g:["#e11d48","#db2777"] },
  { name:"Sam",    g:["#d97706","#ea580c"] },
  { name:"Riley",  g:["#059669","#0d9488"] },
  { name:"Casey",  g:["#4f46e5","#2563eb"] },
];

const INITIAL_TASKS = {
  todo: [
    { id:"task-001", title:"Design system audit & component refactor",  description:"Review all UI components for consistency and update to the new design tokens.",             priority:"high",   tags:["Design","Frontend"], assignee:"Alex",   dueDate:"Apr 10" },
    { id:"task-002", title:"Set up CI/CD pipeline for staging",          description:"Configure GitHub Actions to auto-deploy to staging on every merge to main.",                priority:"medium", tags:["DevOps","CI/CD"],   assignee:"Morgan", dueDate:"Apr 12" },
    { id:"task-003", title:"Write unit tests for auth module",            description:"Cover edge cases for OAuth flow and token refresh logic.",                                  priority:"low",    tags:["Testing"],          assignee:"Jordan", dueDate:"Apr 15" },
    { id:"task-004", title:"Accessibility review — WCAG 2.1 AA",         description:"Run axe-core audit and fix all critical accessibility violations.",                         priority:"high",   tags:["a11y","QA"],        assignee:"Sam",    dueDate:"Apr 8"  },
  ],
  inProgress: [
    { id:"task-005", title:"Kanban board — optimistic UI drag & drop",   description:"Implement card dragging with instant optimistic updates and rollback on API failure.",      priority:"high",   tags:["React","UX"],       assignee:"Riley",  dueDate:"Apr 6"  },
    { id:"task-006", title:"API rate limiting & caching layer",           description:"Add Redis-based caching to reduce DB load on high-traffic endpoints.",                     priority:"medium", tags:["Backend","Redis"],  assignee:"Casey",  dueDate:"Apr 9"  },
    { id:"task-007", title:"Mobile responsive layout fixes",              description:"Fix overflow issues on small screens and update breakpoint logic.",                         priority:"low",    tags:["CSS","Mobile"],     assignee:"Alex",   dueDate:"Apr 11" },
  ],
  done: [
    { id:"task-008", title:"User authentication with JWT",               description:"Complete login/register flows with secure token storage and rotation.",                     priority:"high",   tags:["Auth","Security"],  assignee:"Morgan", dueDate:"Apr 1"  },
    { id:"task-009", title:"Database schema migration v2",               description:"Migrated all legacy tables to the new normalized schema with zero downtime.",               priority:"medium", tags:["Database"],         assignee:"Jordan", dueDate:"Apr 2"  },
    { id:"task-010", title:"Product requirements doc — Q2 roadmap",      description:"Drafted and approved Q2 feature roadmap with stakeholder sign-off.",                        priority:"low",    tags:["Planning"],         assignee:"Sam",    dueDate:"Mar 30" },
  ],
};

function findCol(tasks, id) {
  for (const c of COLUMNS) if (tasks[c].find((t) => t.id === id)) return c;
  return null;
}

/* ── Breakpoint hook ─────────────────────────────────────────────────────── */
function useBreakpoint() {
  const get = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1280;
    return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
  };
  const [bp, setBp] = useState(get);
  useEffect(() => {
    const fn = () => setBp(get());
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return bp;
}

const toastStyle = {
  background:"#161d2e", color:"#e2e8f0",
  border:"1px solid rgba(99,102,241,0.22)", borderRadius:"10px",
  fontSize:"13px", padding:"10px 14px",
  boxShadow:"0 16px 48px rgba(0,0,0,0.55)",
};

/* ════════════════════════════════════════════════════════════════════════════
   BOARD
═══════════════════════════════════════════════════════════════════════════════ */
export default function Board() {
  const [tasks,        setTasks]        = useState(INITIAL_TASKS);
  const [activeTask,   setActiveTask]   = useState(null);
  const [pendingTasks, setPendingTasks] = useState(new Set());
  const [mobileTab,    setMobileTab]    = useState("todo");
  const bp = useBreakpoint();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint:{ distance:6 } }),
    useSensor(TouchSensor,   { activationConstraint:{ delay:200, tolerance:6 } }),
  );

  const handleDragStart = useCallback(({ active }) => {
    const col = findCol(tasks, active.id);
    if (col) setActiveTask(tasks[col].find((t) => t.id === active.id));
  }, [tasks]);

  const handleDragOver = useCallback(({ active, over }) => {
    if (!over) return;
    const from = findCol(tasks, active.id);
    const to   = COLUMNS.includes(over.id) ? over.id : findCol(tasks, over.id);
    if (!from || !to || from === to) return;
    setTasks((prev) => {
      const aI = [...prev[from]];
      const oI = [...prev[to]];
      const d  = aI.find((t) => t.id === active.id);
      if (!d) return prev;
      const nA = aI.filter((t) => t.id !== active.id);
      const oi = oI.findIndex((t) => t.id === over.id);
      const nO = [...oI.slice(0, oi >= 0 ? oi : oI.length), d, ...oI.slice(oi >= 0 ? oi : oI.length)];
      return { ...prev, [from]:nA, [to]:nO };
    });
  }, [tasks]);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveTask(null);
    if (!over) return;
    const from = findCol(tasks, active.id);
    const to   = COLUMNS.includes(over.id) ? over.id : findCol(tasks, over.id);
    if (!from || !to) return;

    if (from === to) {
      setTasks((prev) => {
        const items = [...prev[from]];
        const oi = items.findIndex((t) => t.id === active.id);
        const ni = items.findIndex((t) => t.id === over.id);
        if (oi === ni) return prev;
        return { ...prev, [from]:arrayMove(items, oi, ni) };
      });
      return;
    }

    const snap = structuredClone(tasks);
    setPendingTasks((p) => new Set([...p, active.id]));
    const tid = toast.loading(<span>Moving to <b>{COL_LABELS[to]}</b>…</span>, { style:toastStyle });

    moveTaskApi(active.id, from, to)
      .then(()    => toast.success(<span>Moved to <b>{COL_LABELS[to]}</b> ✓</span>, { id:tid, style:toastStyle }))
      .catch((e)  => { setTasks(snap); toast.error(<span>{e.message}</span>, { id:tid, style:toastStyle, duration:4500 }); })
      .finally(() => setPendingTasks((p) => { const n=new Set(p); n.delete(active.id); return n; }));
  }, [tasks]);

  const total    = COLUMNS.reduce((s, c) => s + tasks[c].length, 0);
  const done     = tasks.done.length;
  const progress = Math.round((done / total) * 100);

  /* ── Layout config per breakpoint ── */
  // mobile:  1 col, tab switcher
  // tablet:  2 col top row (todo + inProgress), done full width below
  // desktop: 3 col
  const renderDesktop = bp === "desktop";
  const renderTablet  = bp === "tablet";
  const renderMobile  = bp === "mobile";

  const px = renderMobile ? "16px" : renderTablet ? "24px" : "32px";

  return (
    <div style={{ minHeight:"100svh", display:"flex", flexDirection:"column", background:"#0d1117", color:"white" }}>

      {/* ── Blobs ── */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-120px", right:"-60px",  width:"480px", height:"480px", background:"radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 68%)" }}/>
        <div style={{ position:"absolute", bottom:"-80px", left:"6%",   width:"400px", height:"400px", background:"radial-gradient(circle,rgba(16,185,129,0.055) 0%,transparent 68%)" }}/>
        <div style={{ position:"absolute", top:"40%", left:"-50px",     width:"360px", height:"360px", background:"radial-gradient(circle,rgba(139,92,246,0.05) 0%,transparent 68%)" }}/>
      </div>

      {/* ══════════════════ HEADER ══════════════════ */}
      <header style={{
        position:"sticky", top:0, zIndex:50,
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(13,17,23,0.93)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      }}>
        <div style={{ maxWidth:"1280px", margin:"0 auto", padding:`0 ${px}` }}>

          {/* Main row */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            gap:"12px", paddingTop:"13px", paddingBottom:"11px",
          }}>
            {/* Brand */}
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{
                width:"34px", height:"34px", borderRadius:"10px", flexShrink:0,
                background:"rgba(99,102,241,0.14)", border:"1px solid rgba(99,102,241,0.28)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width:"15px", height:"15px", color:"#818cf8" }} stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 6h12M4 10h8M4 14h5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.18em", color:"#4b5563", textTransform:"uppercase", lineHeight:1, margin:"0 0 3px" }}>Project Atlas</p>
                <p style={{ fontSize: renderMobile ? "15px" : "17px", fontWeight:800, color:"#f1f5f9", lineHeight:1, margin:0 }}>Sprint Board</p>
              </div>
            </div>

            {/* Right */}
            <div style={{ display:"flex", alignItems:"center", gap: renderMobile ? "10px" : "20px" }}>
              {/* Progress */}
              <div>
                {!renderMobile && (
                  <p style={{ fontSize:"9px", fontWeight:600, letterSpacing:"0.14em", color:"#4b5563", textTransform:"uppercase", marginBottom:"5px" }}>
                    Sprint Progress
                  </p>
                )}
                <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                  <div style={{ width: renderMobile ? "72px" : "108px", height:"5px", borderRadius:"999px", background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:"999px", background:"linear-gradient(90deg,#6366f1,#8b5cf6,#10b981)", width:`${progress}%`, transition:"width 0.7s ease" }}/>
                  </div>
                  <span style={{ fontSize:"12px", fontWeight:600, color:"#cbd5e1", whiteSpace:"nowrap" }}>
                    {done}<span style={{ color:"#374151" }}>/{total}</span>
                  </span>
                  {!renderMobile && <span style={{ fontSize:"11px", color:"#6366f1", fontWeight:700 }}>{progress}%</span>}
                </div>
              </div>

              {!renderMobile && <div style={{ width:"1px", height:"28px", background:"rgba(255,255,255,0.07)" }}/>}

              {/* Avatars */}
              <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                <div style={{ display:"flex" }}>
                  {TEAM.slice(0, renderMobile ? 4 : 6).map(({ name, g }, i) => (
                    <div key={name} title={name} style={{
                      width:"28px", height:"28px", borderRadius:"50%",
                      background:`linear-gradient(135deg,${g[0]},${g[1]})`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"10px", fontWeight:700, color:"white",
                      border:"2px solid #0d1117",
                      marginLeft: i === 0 ? 0 : "-7px",
                      position:"relative", zIndex:10 - i,
                    }}>{name[0]}</div>
                  ))}
                </div>
                {!renderMobile && <span style={{ fontSize:"11px", color:"#6b7280" }}>{TEAM.length} members</span>}
              </div>
            </div>
          </div>

          {/* Sub-bar */}
          <div style={{
            display:"flex", alignItems:"center", flexWrap:"wrap", gap:"6px",
            paddingBottom:"8px", borderTop:"1px solid rgba(255,255,255,0.04)", paddingTop:"7px",
          }}>
            {!renderMobile && <>
              <span style={{ fontSize:"11px", color:"#374151" }}>Drag &amp; drop cards</span>
              <span style={{ color:"#1f2937" }}>·</span>
              <span style={{ fontSize:"11px", color:"#374151" }}>Optimistic UI with rollback</span>
              <span style={{ color:"#1f2937" }}>·</span>
            </>}
            <span style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:"rgba(245,158,11,0.8)" }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#f59e0b", animation:"pulse 2s infinite" }}/>
              20% simulated API failure
            </span>
            {renderMobile && <>
              <span style={{ color:"#1f2937" }}>·</span>
              <span style={{ fontSize:"11px", color:"#374151" }}>Tap tabs to switch columns</span>
            </>}
          </div>
        </div>
      </header>

      {/* ══════════════════ MOBILE TABS ══════════════════ */}
      {renderMobile && (
        <div style={{
          position:"sticky", top:"86px", zIndex:40,
          background:"rgba(13,17,23,0.96)",
          backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
          borderBottom:"1px solid rgba(255,255,255,0.05)",
          padding:"10px 16px",
          display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"7px",
        }}>
          {COLUMNS.map((col) => {
            const ac      = COL_ACCENT[col];
            const active  = mobileTab === col;
            const count   = tasks[col].length;
            return (
              <button key={col} onClick={() => setMobileTab(col)} style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:"5px",
                padding:"8px 6px", borderRadius:"9px",
                border:`1px solid ${active ? ac.tabBorder : "rgba(255,255,255,0.06)"}`,
                background: active ? ac.tab : "transparent",
                color: active ? ac.tabText : "#4b5563",
                fontSize:"12px", fontWeight:700,
                cursor:"pointer", transition:"all 0.16s",
                outline:"none", WebkitTapHighlightColor:"transparent",
              }}>
                <span style={{
                  width:"6px", height:"6px", borderRadius:"50%", flexShrink:0,
                  background: active ? ac.dot : "#2d3748",
                  boxShadow: active ? `0 0 6px ${ac.glow}` : "none",
                  transition:"all 0.16s",
                }}/>
                {COL_LABELS[col]}
                <span style={{
                  minWidth:"17px", height:"17px", borderRadius:"999px",
                  background: active ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.05)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"10px", fontWeight:700,
                  color: active ? ac.tabText : "#374151",
                  padding:"0 4px",
                }}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ══════════════════ BOARD ══════════════════ */}
      <main style={{
        position:"relative", zIndex:10, flex:1,
        maxWidth:"1280px", width:"100%", margin:"0 auto",
        padding: renderMobile ? "14px 12px 40px" : renderTablet ? "20px 24px 48px" : "24px 32px 56px",
      }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* ── DESKTOP: 3-col grid ── */}
          {renderDesktop && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px", alignItems:"start" }}>
              {COLUMNS.map((id) => (
                <Column key={id} id={id} tasks={tasks[id]} pendingTasks={pendingTasks} />
              ))}
            </div>
          )}

          {/* ── TABLET: 2-col top row + full-width Done below ── */}
          {renderTablet && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"16px", alignItems:"start" }}>
                <Column id="todo"       tasks={tasks.todo}       pendingTasks={pendingTasks} />
                <Column id="inProgress" tasks={tasks.inProgress} pendingTasks={pendingTasks} />
              </div>
              {/* Done — horizontal card grid */}
              <Column id="done" tasks={tasks.done} pendingTasks={pendingTasks} horizontal />
            </div>
          )}

          {/* ── MOBILE: single column with tab switcher ── */}
          {renderMobile && (
            <div>
              <Column id={mobileTab} tasks={tasks[mobileTab]} pendingTasks={pendingTasks} compact />
            </div>
          )}

          <DragOverlay dropAnimation={{ duration:180, easing:"cubic-bezier(0.18,0.67,0.6,1.22)" }}>
            {activeTask && (
              <div style={{ transform:"rotate(1.5deg) scale(1.02)", opacity:0.93, filter:"drop-shadow(0 20px 40px rgba(99,102,241,0.25))" }}>
                <TaskCard task={activeTask} isPending={false} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}