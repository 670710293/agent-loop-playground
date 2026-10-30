const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
const EXAMPLES = ["ขอชีทสรุปเรื่อง การสังเคราะห์แสง", "อธิบาย Recursion ให้เข้าใจง่าย", "สรุปสงครามโลกครั้งที่สอง", "Newton's laws of motion"];
let runId = 0, lastMd = "";
const nm = (id) => (id === "user" ? "ผู้ใช้" : AGENTS.find((a) => a.id === id).name);
const el = (tag, text, cls) => { const e = document.createElement(tag); e.textContent = text; if (cls) e.className = cls; return e; };

function log(kind, who, text, code) {
  const li = document.createElement("li"); li.className = "step " + kind;
  li.append(el("b", who), el("p", text));
  if (code) li.append(el("code", code));
  $("trace").append(li); $("status").textContent = "· " + who;
}
const say = (from, to, text) => log("msg", `${nm(from)} → ${nm(to)}`, text);

// Planner: ตัดคำนำ/คำลงท้ายเพื่อหาหัวข้อ
function plan(input) {
  const t = input.replace(/^(?:ช่วย|ขอ|อยากได้)?\s*(?:ชีทสรุป|สรุป|อธิบาย)?\s*(?:เรื่อง|หัวข้อ)?\s*/i, "").replace(/\s*(?:ให้เข้าใจง่าย|ให้หน่อย|หน่อย|ครับ|ค่ะ|นะ)+\s*$/, "").trim();
  return t || input.trim();
}
// Writer: ประกอบชีท
function compose(page, a, lang) {
  const q = a.keywords.slice(0, 3).map((k) => `อธิบาย "${k}" ด้วยคำพูดของตัวเอง`);
  const md = `# ชีทสรุป: ${page.title}\n\n## ประเด็นหลัก\n${a.points.map((x) => "- " + x).join("\n")}\n\n## คำสำคัญ\n${a.keywords.join(", ")}\n\n## ทบทวนตัวเอง\n${q.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\n## แหล่งอ้างอิง\n- Wikipedia (${lang}): ${page.title} — ${page.url}\n`;
  return { title: page.title, url: page.url, lang, points: a.points, keywords: a.keywords, questions: q, words: a.words, minutes: a.minutes, md };
}
// Reviewer: เกณฑ์ขั้นต่ำ
function review(d) {
  const bad = [];
  if (d.points.length < 3) bad.push("ประเด็นหลักน้อยกว่า 3 ข้อ");
  if (d.keywords.length < 3) bad.push("คำสำคัญน้อยกว่า 3 คำ");
  if (!d.url.startsWith("https://")) bad.push("ไม่มี URL อ้างอิง");
  return bad;
}
function renderSheet(d) {
  const s = $("sheet"); s.textContent = "";
  s.append(el("h3", d.title), el("h4", "ประเด็นหลัก"));
  const ul = el("ul", ""); d.points.forEach((x) => ul.append(el("li", x))); s.append(ul, el("h4", "คำสำคัญ"), el("p", d.keywords.join(" · ")), el("h4", "ทบทวนตัวเอง"));
  const ol = el("ol", ""); d.questions.forEach((x) => ol.append(el("li", x))); s.append(ol, el("h4", "แหล่งอ้างอิง"));
  const p = el("p", ""), a = el("a", `Wikipedia (${d.lang}): ${d.title}`); a.href = d.url; a.target = "_blank"; a.rel = "noopener"; p.append(a);
  s.append(p, el("p", `เนื้อหาประมาณ ${d.words} คำ อ่านราว ${d.minutes} นาที`, "note")); lastMd = d.md; $("sheetBox").hidden = false;
}

async function run(input) {
  const id = ++runId, live = () => id === runId;
  $("chat").hidden = false; $("ubub").textContent = input; $("trace").textContent = ""; $("sheetBox").hidden = true; $("proc").open = false;
  $("answer").textContent = "กำลังให้ทีม agent ทำงาน… (กดดูขั้นตอนด้านล่างได้)"; $("status").textContent = ""; $("go").disabled = true;
  try {
    const topic = plan(input), lang0 = /[\u0E00-\u0E7F]/.test(topic) ? "th" : "en";
    say("user", "planner", input);
    say("planner", "researcher", `ผู้ใช้ต้องการชีทหมวดการเรียน หัวข้อ "${topic}" (ภาษา ${lang0}) ช่วยค้นแหล่งข้อมูลให้หน่อย`);
    let cands = [];
    for (const l of lang0 === "th" ? ["th", "en"] : ["en"]) {
      await sleep(400); log("tool", "Researcher", "เรียก search_wikipedia()", JSON.stringify({ q: topic, lang: l }));
      const t = await TOOLS.search_wikipedia({ q: topic, lang: l }); if (!live()) return;
      log("observe", "Researcher", t.length ? `พบ ${t.length} บทความ: ${t.join(" | ")}` : `ไม่พบผลลัพธ์ในภาษา ${l}`);
      if (t.length) { cands = t.slice(0, 2).map((title) => ({ title, lang: l })); break; }
    }
    if (!cands.length) { say("researcher", "user", "ไม่พบแหล่งข้อมูล ลองเปลี่ยนคำค้นให้กว้างขึ้น"); $("answer").textContent = "ไม่พบข้อมูลสำหรับหัวข้อนี้ ลองเปลี่ยนคำค้น"; return; }
    let final = null, last = null;
    for (let i = 0; i < cands.length && !final; i++) {
      log("tool", "Researcher", "เรียก fetch_extract()", JSON.stringify(cands[i]));
      const page = await TOOLS.fetch_extract(cands[i]); if (!live()) return;
      log("observe", "Researcher", `อ่านได้ ${page.text.length} ตัวอักษร จาก ${page.url}`);
      say("researcher", "analyst", "ส่งเนื้อหาดิบ ขอให้หาคำสำคัญและประโยคหลัก");
      await sleep(400); log("tool", "Analyst", "เรียก analyze_text()", `{ text: <${page.text.length} chars> }`);
      const a = TOOLS.analyze_text({ text: page.text });
      log("observe", "Analyst", `คำสำคัญ: ${a.keywords.join(", ")} · ประโยคหลัก ${a.points.length} ข้อ`);
      say("analyst", "writer", "ส่งคำสำคัญและประโยคหลัก ขอให้จัดเป็นชีท");
      last = compose(page, a, cands[i].lang); say("writer", "reviewer", "ส่งร่างชีทให้ตรวจ");
      const bad = review(last); await sleep(300); if (!live()) return;
      if (!bad.length) { final = last; say("reviewer", "user", "ผ่านการตรวจ: ประเด็น คำสำคัญ และแหล่งอ้างอิงครบ"); }
      else if (i + 1 < cands.length) say("reviewer", "researcher", `ตีกลับ: ${bad.join(", ")} ขอลองบทความสำรอง`);
      else { final = last; say("reviewer", "user", `ไม่มีตัวสำรองแล้ว ส่งฉบับนี้พร้อมคำเตือน: ${bad.join(", ")}`); }
    }
    $("answer").textContent = "สรุปสั้นๆ: " + (final.points[0] || "").slice(0, 220) + " ดูชีทเต็มด้านล่าง"; renderSheet(final);
  } catch (e) {
    log("observe", "ระบบ", `เกิดข้อผิดพลาด: ${e.message}`); $("answer").textContent = "ทำงานไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองใหม่ (เปิดดูขั้นตอนเพื่อดูสาเหตุ)";
  } finally { if (live()) $("go").disabled = false; }
}

EXAMPLES.forEach((t) => { const b = el("button", t, "chip"); b.type = "button"; b.onclick = () => { $("q").value = t; run(t); }; $("chips").append(b); });
$("form").addEventListener("submit", (e) => { e.preventDefault(); const q = $("q").value.trim(); if (q) run(q); });
$("copy").onclick = async () => { try { await navigator.clipboard.writeText(lastMd); $("copy").textContent = "คัดลอกแล้ว"; } catch { $("copy").textContent = "คัดลอกไม่ได้"; } setTimeout(() => ($("copy").textContent = "คัดลอก Markdown"), 1500); };
$("dl").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([lastMd], { type: "text/markdown" })); a.download = "study-sheet.md"; a.click(); URL.revokeObjectURL(a.href); };
