const el = (tag, text, cls) => { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; };
const list = (tag, items) => { const l = el(tag); items.forEach((x) => l.append(el("li", x))); return l; };
const p1 = document.getElementById("p1"), p2 = document.getElementById("p2");

// ---- แท็บ 1: agents ----
const flow = el("p", "", "flow");
["ผู้ใช้", ...AGENTS.filter((a) => a.status === "live").map((a) => a.name), "ผู้ใช้"].forEach((n, i) => { if (i) flow.append(el("span", "→", "arr")); flow.append(el("span", n, "node")); });
p1.append(flow, el("p", "Reviewer ตีกลับไป Researcher ได้ 1 ครั้งถ้าชีทไม่ผ่านเกณฑ์ Tutor (LLM) ยังเป็นแผน ไม่ได้ทำงานจริง", "note"));
const grid = el("div", "", "grid");
AGENTS.forEach((a) => {
  const c = el("article", "", "card" + (a.status === "planned" ? " planned" : ""));
  const h = el("h2", a.name); h.append(el("span", a.status === "live" ? "ทำงานจริง" : "แผนในอนาคต", "badge " + a.status));
  c.append(h, el("p", a.role, "role"), el("p", a.duty), el("h3", "แหล่งข้อมูล"), el("p", a.sources), el("h3", "ขั้นตอนประมวลผล"), list("ol", a.steps),
    el("h3", "คุยกับใคร"), el("p", `รับจาก: ${a.from} · ส่งต่อให้: ${a.to}`), el("code", "ตัวอย่างข้อความ: " + a.example));
  grid.append(c);
});
p1.append(grid);

// ---- แท็บ 2: โมเดล ----
p2.append(el("p", MODELS.note, "note"), el("h2", "เกณฑ์เลือกโมเดล"), list("ul", MODELS.criteria));
MODELS.groups.forEach((g) => {
  p2.append(el("h2", g.title)); const gr = el("div", "", "grid");
  g.items.forEach((m) => {
    const c = el("article", "", "card"); c.append(el("h2", m.name), el("p", "เหมาะกับ: " + m.fit), el("p", m.note, "sub"));
    if (m.url) { const a = el("a", "หน้าทางการ"); a.href = m.url; a.target = "_blank"; a.rel = "noopener"; c.append(a); }
    gr.append(c);
  });
  p2.append(gr);
});

// ---- tabs (คลิก + ลูกศรซ้ายขวา) ----
const tabs = [document.getElementById("t1"), document.getElementById("t2")], panels = [p1, p2];
function pick(i) { tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(i === j)); t.tabIndex = i === j ? 0 : -1; panels[j].hidden = i !== j; }); tabs[i].focus(); }
tabs.forEach((t, i) => { t.onclick = () => pick(i); t.onkeydown = (e) => { if (e.key === "ArrowRight") pick((i + 1) % 2); if (e.key === "ArrowLeft") pick((i + 1) % 2); }; });
