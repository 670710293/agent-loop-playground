const $ = (id) => document.getElementById(id);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, reducedMotion ? 0 : ms));
const EXAMPLES = ["ขอชีทสรุปเรื่อง การสังเคราะห์แสง", "อธิบาย Recursion ให้เข้าใจง่าย", "สรุปสงครามโลกครั้งที่สอง", "Newton's laws of motion"];
let currentRun = 0;
let lastMarkdown = "";

const make = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const agentName = (id) => id === "user" ? "ผู้ใช้" : (AGENTS.find((agent) => agent.id === id)?.name || id);

function addTrace(kind, who, message, detail) {
  const item = make("li", null, `step ${kind}`);
  item.append(make("b", who), make("p", message));
  if (detail) item.append(make("code", detail));
  $("trace").append(item);
  $("status").textContent = `· ${$("trace").children.length} ขั้นตอน`;
}
function setStage(id) {
  const items = [...$("pipe").children];
  const index = id === "user" ? items.length : items.findIndex((item) => item.dataset.id === id);
  items.forEach((item, position) => {
    item.className = position < index ? "done" : position === index ? "active" : "";
    if (position === index) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
}
function failStage() {
  const active = $("pipe").querySelector(".active");
  if (active) { active.className = "fail"; active.removeAttribute("aria-current"); }
}
function handoff(from, to, message) {
  setStage(to);
  addTrace("msg", `${agentName(from)} → ${agentName(to)}`, message);
}
function extractTopic(input) {
  const cleaned = input
    .replace(/^(?:ช่วย|ขอ|อยากได้)?\s*(?:ชีทสรุป|สรุป|อธิบาย)?\s*(?:เรื่อง|หัวข้อ)?\s*/i, "")
    .replace(/\s*(?:ให้เข้าใจง่าย|ให้หน่อย|หน่อย|ครับ|ค่ะ|นะ)+\s*$/, "").trim();
  return cleaned || input.trim();
}
function composeSheet(page, analysis, language) {
  const questions = analysis.keywords.slice(0,3).map((word) => `อธิบาย "${word}" ด้วยคำพูดของตัวเอง`);
  const markdown = `# ชีทสรุป: ${page.title}\n\n> สร้างโดย Agent Loop Demo (Rule-based workflow)\n\n## ประเด็นหลัก\n${analysis.points.map((point) => `- ${point}`).join("\n")}\n\n## คำสำคัญ\n${analysis.keywords.join(", ")}\n\n## ทบทวนตัวเอง\n${questions.map((question,index) => `${index+1}. ${question}`).join("\n")}\n\n## แหล่งอ้างอิง\n- Wikipedia (${language}): ${page.title} — ${page.url}\n\n> หมายเหตุ: ชีทนี้คัดเลือกและจัดโครงสร้างข้อความด้วยกฎใน JavaScript ไม่ใช่การสรุปโดย LLM โปรดตรวจสอบแหล่งข้อมูลต้นฉบับ\n`;
  return { ...analysis, title: page.title, url: page.url, language, questions, markdown };
}
function reviewSheet(sheet) {
  const issues = [];
  if (sheet.points.length < 3) issues.push("ประเด็นหลักน้อยกว่า 3 ข้อ");
  if (sheet.keywords.length < 3) issues.push("คำสำคัญน้อยกว่า 3 คำ");
  if (!sheet.url.startsWith("https://")) issues.push("URL อ้างอิงไม่ถูกต้อง");
  return issues;
}
function renderSheet(sheet) {
  const container = $("sheet");
  container.replaceChildren(make("h3", sheet.title), make("h4", "ประเด็นหลัก"));
  const points = make("ul");
  sheet.points.forEach((point) => points.append(make("li", point)));
  const keywords = make("div", null, "kws");
  sheet.keywords.forEach((word) => keywords.append(make("span", word, "kw")));
  container.append(points, make("h4", "คำสำคัญ"), keywords, make("h4", "ทบทวนตัวเอง"));
  const questions = make("ol");
  sheet.questions.forEach((question) => questions.append(make("li", question)));
  const source = make("p");
  const link = make("a", `Wikipedia (${sheet.language}): ${sheet.title}`);
  link.href = sheet.url; link.target = "_blank"; link.rel = "noopener noreferrer";
  source.append(link);
  container.append(questions, make("h4", "แหล่งอ้างอิง"), source,
    make("p", `ประมาณ ${sheet.words} คำ · เวลาอ่านราว ${sheet.minutes} นาที`, "note"));
  lastMarkdown = sheet.markdown;
  $("sheetBox").hidden = false;
}
async function run(input) {
  const runId = ++currentRun;
  const isCurrent = () => runId === currentRun;
  $("chat").hidden = false;
  $("ubub").textContent = input;
  $("trace").replaceChildren();
  $("sheetBox").hidden = true;
  $("proc").open = false;
  $("answer").textContent = "กำลังดำเนิน workflow ตามลำดับ Agent…";
  $("answer").className = "busy";
  $("status").textContent = "";
  $("go").disabled = true;
  setStage("planner");

  try {
    const topic = extractTopic(input);
    const initialLanguage = /[\u0E00-\u0E7F]/.test(topic) ? "th" : "en";
    handoff("user", "planner", "Planner แยกหัวข้อและตรวจภาษาจากข้อความที่ได้รับ");
    addTrace("observe", "Planner", `หัวข้อ: ${topic} · ภาษา: ${initialLanguage}`);
    await pause(180);
    handoff("planner", "researcher", `ส่งหัวข้อ "${topic}" ให้ Researcher ค้น Wikipedia`);

    let candidates = [];
    const languages = initialLanguage === "th" ? ["th","en"] : ["en","th"];
    for (const language of languages) {
      addTrace("tool", "Researcher", `เรียก Wikipedia Search (${language})`, `query = ${JSON.stringify(topic)}`);
      const titles = await TOOLS.search_wikipedia({ q: topic, lang: language });
      if (!isCurrent()) return;
      addTrace("observe", "Researcher", titles.length ? `พบ ${titles.length} บทความ` : `ไม่พบผลลัพธ์ภาษา ${language}`);
      if (titles.length) { candidates = titles.slice(0,2).map((title) => ({ title, lang: language })); break; }
    }
    if (!candidates.length) {
      failStage();
      $("answer").textContent = "ยังไม่พบหัวข้อที่ตรงกัน ลองใช้คำค้นที่สั้นลงหรือเฉพาะเจาะจงขึ้น";
      addTrace("observe", "ระบบ", "ไม่พบผลการค้นหาจาก Wikipedia ทั้งสองภาษา");
      return;
    }

    let finalSheet = null;
    for (const candidate of candidates) {
      addTrace("tool", "Researcher", "ดึงบทนำของบทความ", JSON.stringify(candidate));
      const page = await TOOLS.fetch_extract({ title: candidate.title, lang: candidate.lang });
      if (!isCurrent()) return;
      if (page.text.trim().length < 100) {
        addTrace("observe", "Researcher", "บทความมีเนื้อหาสั้นเกินไป ข้ามไปยังผลลัพธ์สำรอง");
        continue;
      }
      addTrace("observe", "Researcher", `ดึงข้อความได้ ${page.text.length.toLocaleString()} ตัวอักษร`);
      handoff("researcher", "analyst", "ส่งข้อความจากแหล่งข้อมูลให้ Analyst ประมวลผล");
      await pause(180);
      addTrace("tool", "Analyst", "วิเคราะห์ข้อความใน Browser", `analyze_text(${page.text.length} chars)`);
      const analysis = TOOLS.analyze_text({ text: page.text });
      addTrace("observe", "Analyst", `พบคำสำคัญ ${analysis.keywords.length} คำ และคัดประเด็นได้ ${analysis.points.length} ข้อ`);
      handoff("analyst", "writer", "ส่งผลวิเคราะห์ให้ Writer จัดรูปแบบเป็นชีท");
      const draft = composeSheet(page, analysis, candidate.lang);
      handoff("writer", "reviewer", "ส่งร่างชีทให้ Reviewer ตรวจเกณฑ์พื้นฐาน");
      await pause(180);
      const issues = reviewSheet(draft);
      if (!issues.length) {
        finalSheet = draft;
        addTrace("observe", "Reviewer", "ผ่านเกณฑ์พื้นฐาน: มีประเด็น คำสำคัญ และ URL");
        handoff("reviewer", "user", "ส่งชีทสรุปให้ผู้ใช้");
        break;
      }
      addTrace("observe", "Reviewer", `พบข้อจำกัด: ${issues.join(", ")}`);
      if (candidate !== candidates[candidates.length-1]) {
        handoff("reviewer", "researcher", "ลองบทความสำรอง เนื่องจากร่างแรกไม่ผ่านเกณฑ์");
      } else {
        finalSheet = draft;
        handoff("reviewer", "user", "ส่งผลลัพธ์พร้อมแจ้งว่าตรวจไม่ผ่านบางเกณฑ์");
      }
    }
    if (!finalSheet) throw new Error("ไม่สามารถดึงเนื้อหาบทความที่ใช้ได้");
    renderSheet(finalSheet);
    const warning = reviewSheet(finalSheet);
    $("answer").textContent = warning.length
      ? `สร้างชีทได้ แต่ Reviewer พบข้อจำกัด: ${warning.join(", ")} โปรดตรวจสอบต้นฉบับ`
      : `พบข้อมูลจาก Wikipedia และจัดเป็นชีทสรุปให้แล้ว: ${finalSheet.points[0] || finalSheet.title}`;
  } catch (error) {
    if (!isCurrent()) return;
    failStage();
    addTrace("observe", "ระบบ", `ทำงานไม่สำเร็จ: ${error.message}`);
    $("answer").textContent = "เชื่อมต่อแหล่งข้อมูลไม่สำเร็จ โปรดตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง";
  } finally {
    if (isCurrent()) { $("go").disabled = false; $("answer").className = ""; }
  }
}

AGENTS.forEach((agent) => {
  const item = make("li", agent.name);
  item.dataset.id = agent.id;
  item.title = agent.role;
  $("pipe").append(item);
});
EXAMPLES.forEach((example) => {
  const button = make("button", example, "chip");
  button.type = "button";
  button.addEventListener("click", () => { $("q").value = example; $("q").focus(); });
  $("chips").append(button);
});
$("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const question = $("q").value.trim();
  if (question) run(question);
});
$("copy").addEventListener("click", async () => {
  if (!lastMarkdown) return;
  try {
    await navigator.clipboard.writeText(lastMarkdown);
    $("copy").textContent = "คัดลอกแล้ว";
  } catch {
    $("copy").textContent = "เบราว์เซอร์ไม่อนุญาตให้คัดลอก";
  }
  window.setTimeout(() => { $("copy").textContent = "คัดลอก Markdown"; }, 1800);
});
$("dl").addEventListener("click", () => {
  if (!lastMarkdown) return;
  const url = URL.createObjectURL(new Blob([lastMarkdown], { type: "text/markdown;charset=utf-8" }));
  const anchor = make("a");
  anchor.href = url; anchor.download = "agent-loop-study-sheet.md";
  document.body.append(anchor); anchor.click(); anchor.remove();
  URL.revokeObjectURL(url);
});
