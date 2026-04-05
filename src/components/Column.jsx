import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

const CFG = {
  todo: {
    label:"To Do", icon:"📋",
    dot:"#818cf8", glow:"rgba(99,102,241,0.55)",
    border:"rgba(99,102,241,0.16)",   borderHover:"rgba(99,102,241,0.42)",
    headerBg:"rgba(99,102,241,0.07)", dropBg:"rgba(99,102,241,0.05)",
    countBg:"rgba(99,102,241,0.16)",  countBorder:"rgba(99,102,241,0.28)", countText:"#a5b4fc",
    emptyIcon:"📋", emptyMsg:"Drop tasks here",
    svgIcon: (
      <svg viewBox="0 0 16 16" fill="none" style={{ width:"13px", height:"13px" }} stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="2" width="12" height="12" rx="2"/>
        <path d="M5 8h6M5 5.5h6M5 10.5h4" strokeLinecap="round"/>
      </svg>
    ),
  },
  inProgress: {
    label:"In Progress", icon:"⚡",
    dot:"#fbbf24", glow:"rgba(245,158,11,0.55)",
    border:"rgba(245,158,11,0.16)",   borderHover:"rgba(245,158,11,0.42)",
    headerBg:"rgba(245,158,11,0.06)", dropBg:"rgba(245,158,11,0.04)",
    countBg:"rgba(245,158,11,0.15)",  countBorder:"rgba(245,158,11,0.28)", countText:"#fde68a",
    emptyIcon:"⚡", emptyMsg:"Nothing in progress",
    svgIcon: (
      <svg viewBox="0 0 16 16" fill="none" style={{ width:"13px", height:"13px" }} stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="8" r="5.5"/>
        <path d="M8 5v3l1.8 1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  done: {
    label:"Done", icon:" ",
    dot:"#34d399", glow:"rgba(16,185,129,0.55)",
    border:"rgba(16,185,129,0.16)",   borderHover:"rgba(16,185,129,0.42)",
    headerBg:"rgba(16,185,129,0.06)", dropBg:"rgba(16,185,129,0.04)",
    countBg:"rgba(16,185,129,0.14)",  countBorder:"rgba(16,185,129,0.28)", countText:"#6ee7b7",
    emptyIcon:" ", emptyMsg:"Completed tasks appear here",
    svgIcon: (
      <svg viewBox="0 0 16 16" fill="none" style={{ width:"13px", height:"13px" }} stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="8" r="5.5"/>
        <path d="M5.5 8l2 2L11 6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
};

export default function Column({ id, tasks, pendingTasks, compact = false, horizontal = false }) {
  const cfg = CFG[id];
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      borderRadius:"14px",
      border:`1px solid ${isOver ? cfg.borderHover : cfg.border}`,
      background: isOver
        ? `linear-gradient(180deg, ${cfg.dropBg} 0%, rgba(13,17,23,0.75) 100%)`
        : "rgba(14,19,29,0.7)",
      backdropFilter:"blur(16px)",
      WebkitBackdropFilter:"blur(16px)",
      boxShadow: isOver
        ? `0 0 0 1px ${cfg.borderHover}, 0 16px 40px rgba(0,0,0,0.35)`
        : "0 2px 16px rgba(0,0,0,0.28)",
      transform: isOver ? "scale(1.006)" : "scale(1)",
      transition:"border-color 0.18s, box-shadow 0.18s, background 0.18s, transform 0.18s",
      minHeight: compact ? "0" : "440px",
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: compact ? "13px 14px 11px" : "15px 16px 13px",
        background: cfg.headerBg,
        borderRadius:"14px 14px 0 0",
        borderBottom:"1px solid rgba(255,255,255,0.05)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
          <span style={{
            width:"7px", height:"7px", borderRadius:"50%", flexShrink:0,
            background:cfg.dot, boxShadow:`0 0 8px ${cfg.glow}`,
          }}/>
          <span style={{ color:cfg.dot, display:"flex", alignItems:"center" }}>{cfg.svgIcon}</span>
          <span style={{ fontSize: compact ? "13px" : "14px", fontWeight:700, color:"#e2e8f0", letterSpacing:"-0.01em" }}>
            {cfg.label}
          </span>
        </div>
        <span style={{
          padding:"2px 9px", borderRadius:"999px", lineHeight:"20px",
          background:cfg.countBg, border:`1px solid ${cfg.countBorder}`,
          color:cfg.countText, fontSize:"12px", fontWeight:700,
        }}>{tasks.length}</span>
      </div>

      {/* ── Card list ── */}
      <div
        ref={setNodeRef}
        style={{
          flex:1, padding: compact ? "10px" : "12px",
          display: horizontal ? "grid" : "flex",
          gridTemplateColumns: horizontal ? "repeat(auto-fill, minmax(280px, 1fr))" : undefined,
          flexDirection: horizontal ? undefined : "column",
          gap: compact ? "8px" : "10px",
          minHeight: compact ? "120px" : "320px",
          borderRadius:"0 0 14px 14px",
        }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isPending={pendingTasks.has(task.id)}
              compact={compact}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div style={{
            flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            borderRadius:"10px", border:`2px dashed ${isOver ? cfg.borderHover : "rgba(255,255,255,0.06)"}`,
            padding: compact ? "28px 16px" : "40px 20px",
            transition:"border-color 0.18s",
            minHeight: compact ? "100px" : "180px",
          }}>
            <span style={{ fontSize:"24px", opacity:0.2, marginBottom:"8px" }}>{cfg.emptyIcon}</span>
            <p style={{ fontSize:"12px", color:"#374151", textAlign:"center", margin:0 }}>
              {isOver ? "Release to drop here" : cfg.emptyMsg}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}