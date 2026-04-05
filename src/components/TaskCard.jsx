import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY = {
  high:   { label:"High",   bg:"rgba(239,68,68,0.1)",  border:"rgba(239,68,68,0.25)",  text:"#f87171", dot:"#f87171" },
  medium: { label:"Medium", bg:"rgba(245,158,11,0.1)", border:"rgba(245,158,11,0.25)", text:"#fbbf24", dot:"#fbbf24" },
  low:    { label:"Low",    bg:"rgba(16,185,129,0.1)", border:"rgba(16,185,129,0.25)", text:"#34d399", dot:"#34d399" },
};

const AVG = [
  ["#7c3aed","#9333ea"],["#0891b2","#2563eb"],["#e11d48","#db2777"],
  ["#d97706","#ea580c"],["#059669","#0d9488"],["#4f46e5","#2563eb"],
];
const avatarGrad = (name) => {
  const i = ((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % AVG.length;
  return `linear-gradient(135deg,${AVG[i][0]},${AVG[i][1]})`;
};

export default function TaskCard({ task, isPending, compact = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const p = PRIORITY[task.priority] || PRIORITY.medium;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        borderRadius:"11px",
        border:`1px solid ${isDragging ? "rgba(99,102,241,0.5)" : isPending ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.07)"}`,
        background: isDragging ? "rgba(20,26,40,0.92)" : isPending ? "rgba(99,102,241,0.04)" : "rgba(255,255,255,0.028)",
        backdropFilter:"blur(8px)",
        padding: compact ? "11px 12px 10px" : "13px 14px 12px",
        cursor: isPending ? "wait" : isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.38 : isPending ? 0.62 : 1,
        boxShadow: isDragging ? "0 12px 32px rgba(0,0,0,0.45)" : "0 1px 4px rgba(0,0,0,0.18)",
        position:"relative", userSelect:"none", outline:"none",
        transition:`border-color 0.15s, background 0.15s, opacity 0.15s, box-shadow 0.15s`,
        WebkitTapHighlightColor:"transparent",
        touchAction:"none",
      }}
      {...attributes}
      {...listeners}
    >
      {/* Shimmer */}
      {isPending && (
        <div style={{ position:"absolute", inset:0, borderRadius:"11px", overflow:"hidden", pointerEvents:"none" }}>
          <div style={{
            position:"absolute", top:0, left:"-100%", width:"100%", height:"100%",
            background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.07),transparent)",
            animation:"shimmer 1.6s infinite",
          }}/>
        </div>
      )}

      {/* Row 1: ID + Priority */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: compact ? "7px" : "9px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          {/* Grip dots */}
          <svg viewBox="0 0 10 16" fill="currentColor" style={{ width:"7px", height:"12px", color:"rgba(255,255,255,0.16)", flexShrink:0 }}>
            <circle cx="3" cy="3"  r="1.4"/><circle cx="7" cy="3"  r="1.4"/>
            <circle cx="3" cy="8"  r="1.4"/><circle cx="7" cy="8"  r="1.4"/>
            <circle cx="3" cy="13" r="1.4"/><circle cx="7" cy="13" r="1.4"/>
          </svg>
          <span style={{ fontSize:"10px", fontFamily:"monospace", color:"#374151", fontWeight:600, letterSpacing:"0.04em" }}>
            #{task.id.slice(-3).toUpperCase()}
          </span>
        </div>
        <span style={{
          display:"inline-flex", alignItems:"center", gap:"4px",
          padding:"2px 7px", borderRadius:"999px",
          background:p.bg, border:`1px solid ${p.border}`,
          color:p.text, fontSize:"10px", fontWeight:700, lineHeight:1,
        }}>
          <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:p.dot, flexShrink:0 }}/>
          {p.label}
        </span>
      </div>

      {/* Row 2: Title */}
      <p style={{
        fontSize: compact ? "12.5px" : "13px",
        fontWeight:600, color:"#e2e8f0", lineHeight:"1.44",
        margin:`0 0 ${compact ? "5px" : "7px"} 0`, letterSpacing:"-0.01em",
      }}>
        {task.title}
      </p>

      {/* Row 3: Description — hide on compact if no room */}
      {task.description && !compact && (
        <p style={{
          fontSize:"11.5px", color:"#4b5563", lineHeight:"1.5",
          margin:"0 0 9px 0",
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>
          {task.description}
        </p>
      )}

      {/* Row 4: Tags */}
      {task.tags?.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:"4px", marginBottom: compact ? "8px" : "10px" }}>
          {task.tags.slice(0, compact ? 2 : 4).map((tag) => (
            <span key={tag} style={{
              display:"inline-flex", alignItems:"center",
              padding:"2px 7px", borderRadius:"5px",
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
              fontSize:"10px", fontWeight:500, color:"#94a3b8", lineHeight:"17px",
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ height:"1px", background:"rgba(255,255,255,0.05)", margin:`0 0 ${compact ? "8px" : "10px"} 0` }}/>

      {/* Row 5: Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
          <svg viewBox="0 0 16 16" fill="none" style={{ width:"11px", height:"11px", color:"#374151", flexShrink:0 }} stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="11" rx="2"/>
            <path d="M5 1v3M11 1v3M2 7h12" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize:"11px", color:"#4b5563", fontWeight:500 }}>{task.dueDate}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <div style={{
            width:"20px", height:"20px", borderRadius:"50%",
            background:avatarGrad(task.assignee),
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"9px", fontWeight:700, color:"white", flexShrink:0,
            boxShadow:"0 2px 6px rgba(0,0,0,0.3)",
          }}>{task.assignee[0]}</div>
          <span style={{ fontSize:"11px", color:"#6b7280", fontWeight:500 }}>{task.assignee}</span>
        </div>
      </div>

      {/* Pending badge */}
      {isPending && (
        <div style={{
          position:"absolute", top:"-6px", right:"-6px",
          width:"16px", height:"16px", borderRadius:"50%",
          background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 0 10px rgba(99,102,241,0.5)",
        }}>
          <div style={{
            width:"8px", height:"8px", borderRadius:"50%",
            border:"1.5px solid rgba(255,255,255,0.9)", borderTopColor:"transparent",
            animation:"spin 0.7s linear infinite",
          }}/>
        </div>
      )}
    </div>
  );
}