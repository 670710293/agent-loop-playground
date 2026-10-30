const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
const LABEL = { think: "คิด", tool: "เรียกเครื่องมือ", observe: "ดูผลลัพธ์", answer: "ตอบ" };
const EXAMPLES = ["การสังเคราะห์แสง", "สงครามโลกครั้งที่สอง", "Recursion", "กฎการเคลื่อนที่ของนิวตัน"];
let runId = 0, lastMd = "";

// ---------- เครื่องมือของ agent ----------
const TOOLS = {
  // เครื่องมือจริง: เรียก Wikipedia API (รองรับ CORS ด้วย origin=*)
  async search_wikipedia({ q, lang }) {
    const u = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json&origin=*`;
    const r = await fetch(u); if (!r.ok) throw new Error("HTTP " + r.status);
    return ((await r.json()).query?.search || []).map((x) => x.title);
  },
  async fetch_extract({ title, lang }) {
    const u = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&redirects=1&titles=${encodeURIComponent(title)}&format=json&origin=*`;
    const r = await fetch(u); if (!r.ok) throw new Error("HTTP " + r.status);
    const p = Object.values((await r.json()).query.pages)[0];
    return { title: p.title, text: p.extract || "", url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}` };
  },
  // ประมวลผลในเบราว์เซอร์: นับความถี่คำ เลือกประโยคสำคัญ ประมาณเวลาอ่าน
  analyze_text({ text }) {
    const th = /[\u0E00-\u0E7F]/.test(text);
    const chunks = text.split(/\n+/).flatMap((p) => p.split(/(?<=[.!?])\s+/)).map((s) => s.trim()).filter((s) => s.length > 30);
    const words = typeof Intl.Segmenter === "function"
      ? [...new Intl.Segmenter(th ? "th" : "en", { granularity: "word" }).segment(text)].filter((s) => s.isWordLike).map((s) => s.segment.toLowerCase())
      : text.toLowerCase().match(/\p{L}+/gu) || [];
    const stop = new Set("the and for with that this was are from his her has have its also which ที่ และ ของ ใน เป็น การ ความ ได้ จาก มี ซึ่ง โดย กับ หรือ".split(" "));
    const freq = {};
    words.filter((w) => w.length >= 3 && !stop.has(w) && !/^\d+$/.test(w)).forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    const keywords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map((e) => e[0]);
    const score = (s) => keywords.filter((k) => s.toLowerCase().includes(k)).length;
    const picks = chunks.slice(0, 12).map((s, i) => ({ s, i, sc: score(s) })).sort((a, b) => b.sc - a.sc || a.i - b.i).slice(0, 4).sort((a, b) => a.i - b.i)
      .map((x) => (x.s.length > 320 ? x.s.slice(0, 320) + "…" : x.s));
    return { keywords, points: picks, minutes: Math.max(1, Math.round(words.length / (th ? 250 : 200))), words: words.length };
  },
  // TODO (roadmap): llm_summarize({ text }) เรียก /api/summarize (serverless) เพื่อสรุปด้วย LLM แทนกฎด้านบน
};

// ---------- UI ----------
function step(type, text, code) {
  const li = document.createElement("li"); li.className = "step " + type;
  const b = document.createElement("b"); b.textContent = LABEL[type];
  const p = document.createElement("p"); p.textContent = text; li.append(b, p);
  if (code) { const c = document.createElement("code"); c.textContent = code; li.append(c); }
  $("trace").append(li); li.scrollIntoView({ block: "nearest" });
}
const el = (tag, text, cls) => { const e = document.createElement(tag); e.textContent = text; if (cls) e.className = cls; return e; };

function renderSheet(title, a, url, lang) {
  const s = $("sheet"); s.textContent = "";
  s.append(el("h3", title), el("h4", "ประเด็นหลัก"));
  const ul = el("ul", ""); a.points.forEach((x) => ul.append(el("li", x))); s.append(ul);
  s.append(el("h4", "คำสำคัญ"), el("p", a.keywords.join(" · ")), el("h4", "ทบทวนตัวเอง"));
  const ol = el("ol", ""); a.keywords.slice(0, 3).forEach((k) => ol.append(el("li", `อธิบาย "${k}" ด้วยคำพูดของตัวเอง`))); s.append(ol);
  s.append(el("h4", "แหล่งอ้างอิง"));
  const src = el("p", ""), link = el("a", `Wikipedia (${lang}): ${title}`); link.href = url; link.target = "_blank"; link.rel = "noopener";
  src.append(link); s.append(src, el("p", `เนื้อหาประมาณ ${a.words} คำ อ่านราว ${a.minutes} นาที · ตรวจกับต้นฉบับก่อนใช้จริง`, "note"));
  lastMd = `# ชีทสรุป: ${title}\n\n## ประเด็นหลัก\n${a.points.map((x) => "- " + x).join("\n")}\n\n## คำสำคัญ\n${a.keywords.join(", ")}\n\n## ทบทวนตัวเอง\n${a.keywords.slice(0, 3).map((k, i) => `${i + 1}. อธิบาย "${k}" ด้วยคำพูดของตัวเอง`).join("\n")}\n\n## แหล่งอ้างอิง\n- Wikipedia (${lang}): ${title} — ${url}\n`;
  $("acts").hidden = false;
}

async function run(q) {
  const id = ++runId, live = () => id === runId;
  $("trace").textContent = ""; $("sheet").textContent = ""; $("acts").hidden = true; $("round").textContent = ""; $("go").disabled = true;
  try {
    const first = /[\u0E00-\u0E7F]/.test(q) ? "th" : "en";
    $("round").textContent = "รอบที่ 1"; step("think", `หัวข้อ "${q}" ต้องมีแหล่งอ้างอิงที่ตรวจสอบได้ จะเริ่มจากค้น Wikipedia ภาษา ${first}`);
    let lang = first, hits = [];
    for (const l of first === "th" ? ["th", "en"] : ["en"]) {
      lang = l; await sleep(500); if (!live()) return;
      step("tool", "search_wikipedia()", JSON.stringify({ q, lang: l }));
      hits = await TOOLS.search_wikipedia({ q, lang: l }); if (!live()) return;
      step("observe", hits.length ? `พบ ${hits.length} ผลลัพธ์: ${hits.join(" | ")}` : "ไม่พบผลลัพธ์");
      if (hits.length) break;
      if (l === "th") { $("round").textContent = "รอบที่ 2"; step("think", "ไม่พบในภาษาไทย ลองค้นภาษาอังกฤษแทน"); }
    }
    if (!hits.length) { step("answer", "ไม่พบข้อมูลสำหรับหัวข้อนี้ ลองเปลี่ยนคำค้นให้กว้างขึ้น"); return; }
    await sleep(500); step("think", `เลือกผลลัพธ์อันดับแรก "${hits[0]}" แล้วอ่านเนื้อหา`);
    step("tool", "fetch_extract()", JSON.stringify({ title: hits[0], lang }));
    const page = await TOOLS.fetch_extract({ title: hits[0], lang }); if (!live()) return;
    step("observe", `ได้เนื้อหา ${page.text.length} ตัวอักษร จาก ${page.url}`);
    if (page.text.length < 80) { step("answer", "เนื้อหาสั้นเกินไปที่จะทำชีท ลองหัวข้ออื่น"); return; }
    await sleep(500); step("think", "ได้ข้อมูลดิบแล้ว ต้องประมวลผลเองต่อ: หาคำสำคัญ เลือกประโยคหลัก แล้วจัดเป็นชีท");
    step("tool", "analyze_text()", "{ text: <" + page.text.length + " chars> }");
    const a = TOOLS.analyze_text({ text: page.text }); await sleep(500); if (!live()) return;
    step("observe", `คำสำคัญ: ${a.keywords.join(", ")} · ประโยคหลัก ${a.points.length} ข้อ`);
    step("answer", "สร้างชีทสรุปเสร็จแล้ว ดูทางขวา"); renderSheet(page.title, a, page.url, lang);
  } catch (e) {
    step("observe", `เกิดข้อผิดพลาด: ${e.message} (ตรวจอินเทอร์เน็ตแล้วลองใหม่)`);
  } finally { if (live()) $("go").disabled = false; }
}

EXAMPLES.forEach((t) => { const b = el("button", t, "chip"); b.type = "button"; b.onclick = () => { $("q").value = t; run(t); }; $("chips").append(b); });
$("form").addEventListener("submit", (e) => { e.preventDefault(); const q = $("q").value.trim(); if (q) run(q); });
$("copy").onclick = async () => { try { await navigator.clipboard.writeText(lastMd); $("copy").textContent = "คัดลอกแล้ว"; } catch { $("copy").textContent = "คัดลอกไม่ได้"; } setTimeout(() => ($("copy").textContent = "คัดลอก Markdown"), 1500); };
$("dl").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([lastMd], { type: "text/markdown" })); a.download = "study-sheet.md"; a.click(); URL.revokeObjectURL(a.href); };
