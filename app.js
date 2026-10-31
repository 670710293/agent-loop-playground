const $ = id => document.getElementById(id);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pause = ms => new Promise(resolve => setTimeout(resolve, reducedMotion ? 0 : ms));
const EXAMPLES = ["ขอชีทสรุปเรื่อง การสังเคราะห์แสง", "อธิบาย Recursion ให้เข้าใจง่าย", "สรุปสงครามโลกครั้งที่สอง", "Explain Newton's laws of motion", "Latest news about renewable energy"];
let currentRun = 0, lastMarkdown = "";
const make = (tag, text, className) => { const n = document.createElement(tag); if (text != null) n.textContent = text; if (className) n.className = className; return n; };
const agentName = id => id === "user" ? "ผู้ใช้" : (AGENTS.find(a => a.id === id)?.name || id);
function addTrace(kind, who, message, detail) { const item = make("li", null, `step ${kind}`); item.append(make("b", who), make("p", message)); if (detail) item.append(make("code", detail)); $("trace").append(item); $("status").textContent = `· ${$("trace").children.length} ขั้นตอน`; }
function setStage(id) { const items = [...$("pipe").children], index = id === "user" ? items.length : items.findIndex(x => x.dataset.id === id); items.forEach((x,i) => { x.className = i < index ? "done" : i === index ? "active" : ""; if (i === index) x.setAttribute("aria-current","step"); else x.removeAttribute("aria-current"); }); }
function failStage() { const a = $("pipe").querySelector(".active"); if (a) { a.className = "fail"; a.removeAttribute("aria-current"); } }
function handoff(from,to,message) { setStage(to); addTrace("msg",`${agentName(from)} → ${agentName(to)}`,message); }
function detectLanguage(q) { return /[\u0E00-\u0E7F]/.test(q) ? "th" : "en"; }
function composeSheet(page, analysis, language, relevance) {
  const thai = language === "th", sourceLang = page.lang === "th" ? "ไทย" : "English";
  const questions = analysis.keywords.slice(0,3).map(w => thai ? `อธิบาย "${w}" ด้วยคำพูดของตัวเอง` : `Explain "${w}" in your own words.`);
  const markdown = thai
    ? `# ชีทสรุป: ${page.title}\n\n> Agent Loop Demo · Rule-based workflow\n\n## ประเด็นจากแหล่งข้อมูล (${sourceLang})\n${analysis.points.map(p=>`- ${p}`).join("\n")}\n\n## คำสำคัญ\n${analysis.keywords.join(", ")}\n\n## ทบทวนตัวเอง\n${questions.map((q,i)=>`${i+1}. ${q}`).join("\n")}\n\n## แหล่งอ้างอิง\n- ${page.provider}: ${page.title} — ${page.url}\n\n> หมายเหตุ: ระบบใช้การจับคู่คำและจัดอันดับข้อความ ไม่ใช่ LLM; เนื้อหาสรุปคงภาษาต้นฉบับของแหล่งข้อมูล ไม่ได้แปลอัตโนมัติ\n`
    : `# Study notes: ${page.title}\n\n> Agent Loop Demo · Rule-based workflow\n\n## Key points (${sourceLang} source)\n${analysis.points.map(p=>`- ${p}`).join("\n")}\n\n## Keywords\n${analysis.keywords.join(", ")}\n\n## Self-review\n${questions.map((q,i)=>`${i+1}. ${q}`).join("\n")}\n\n## Sources\n- ${page.provider}: ${page.title} — ${page.url}\n\n> Note: This demo uses keyword matching, not an LLM. Source text is not automatically translated.\n`;
  return { ...analysis, title: page.title, url: page.url, provider: page.provider, sourceLang, language, questions, markdown, relevance };
}
function reviewSheet(sheet, question) {
  const issues = [], thai = sheet.language === "th";
  const relevance = TOOLS.relevance({ question, title: sheet.title, text: sheet.points.join(" "), lang: sheet.language });
  if (!sheet.points.length) issues.push(thai ? "แหล่งข้อมูลไม่มีประเด็นที่ดึงมาใช้ได้" : "No usable points were extracted");
  if (sheet.keywords.length < 2) issues.push(thai ? "คำสำคัญน้อยเกินไป" : "Too few keywords");
  if (!/^https:\/\//.test(sheet.url)) issues.push("Invalid source URL");
  if (sheet.relevance.coverage < .25 || sheet.relevance.score < .2) issues.push(thai ? "แหล่งข้อมูลไม่ตรงคำถามพอ" : "Source relevance is too low");
  if (relevance.coverage < .3) issues.push(thai ? "ประเด็นสรุปไม่ครอบคลุมคำถาม" : "Summary does not cover the question");
  return { issues, score: Math.min(sheet.relevance.score,relevance.score), coverage: relevance.coverage };
}
function renderSheet(sheet) {
  const thai = sheet.language === "th", box = $("sheet");
  box.replaceChildren(make("h3",sheet.title),make("h4",thai?"ประเด็นจากแหล่งข้อมูล":"Key points"));
  const ul=make("ul"); sheet.points.forEach(p=>ul.append(make("li",p)));
  const kws=make("div",null,"kws"); sheet.keywords.forEach(w=>kws.append(make("span",w,"kw")));
  box.append(ul,make("h4",thai?"คำสำคัญ":"Keywords"),kws,make("h4",thai?"ทบทวนตัวเอง":"Self-review"));
  const qs=make("ol"); sheet.questions.forEach(q=>qs.append(make("li",q)));
  const link=make("a",`${sheet.provider}: ${sheet.title}`); link.href=sheet.url; link.target="_blank"; link.rel="noopener noreferrer";
  box.append(qs,make("h4",thai?"แหล่งอ้างอิง":"Source"),link,make("p",`${sheet.sourceLang} · ${sheet.words.toLocaleString()} ${thai?"คำ":"words"} · ${thai?"เวลาอ่านโดยประมาณ":"estimated reading time"}: ${sheet.minutes} ${thai?"นาที":"min"}`,"note"));
  lastMarkdown=sheet.markdown; $("sheetBox").hidden=false;
}
async function run(input) {
  const runId=++currentRun, isCurrent=()=>runId===currentRun;
  $("chat").hidden=false; $("ubub").textContent=input; $("trace").replaceChildren(); $("sheetBox").hidden=true; $("proc").open=false;
  $("answer").textContent="กำลังวิเคราะห์หัวข้อ เลือกแหล่งข้อมูล และตรวจความเกี่ยวข้อง…"; $("answer").className="busy"; $("status").textContent=""; $("go").disabled=true; lastMarkdown=""; setStage("planner");
  try {
    const question=input.replace(/\s+/g," ").trim(), selected=$("language").value, language=selected==="auto"?detectLanguage(question):selected, thai=language==="th";
    const category=TOOLS.classify(question);
    handoff("user","planner",thai?"เก็บคำถามต้นฉบับและเลือกหมวดความรู้ก่อนค้นหา":"Keep the original question and classify its research domain.");
    addTrace("observe","Planner",`${thai?"หมวดที่ประเมิน":"Detected topic"}: ${category} · ${thai?"ภาษา":"Language"}: ${thai?"ไทย":"English"}`);
    await pause(120); handoff("planner","researcher",thai?"เลือกแหล่งข้อมูลที่เหมาะกับหมวด พร้อมแหล่งสำรอง":"Select topic-specific providers with a fallback source.");
    const research=await TOOLS.searchSources({question,lang:language}); if(!isCurrent())return;
    research.attempts.forEach(a=>addTrace(a.ok?"tool":"observe","Researcher",`${a.name}: ${a.ok?(thai?`พบ ${a.count} รายการ`:`${a.count} results`):(thai?"เรียกใช้ไม่ได้":"unavailable")}${a.error?` (${a.error})`:""}`));
    addTrace("observe","Researcher",`${thai?"แหล่งที่ไม่ซ้ำ":"Unique source records"}: ${research.candidates.length}`);
    const attempted=new Set(); let accepted=null;
    for(let i=0;i<research.candidates.length;i++){
      const page=research.candidates[i], key=page.url.toLowerCase(); if(attempted.has(key))continue; attempted.add(key);
      addTrace("tool","Researcher",`${thai?"ตรวจแหล่ง":"Review source"} ${i+1}/${research.candidates.length}: ${page.provider} · ${page.title}`);
      if(!page.text || page.text.trim().length<45){addTrace("observe","Researcher",thai?"ข้อมูลมีน้อยเกินไป ข้ามไปแหล่งถัดไป":"Too little source text; skipping.");continue;}
      // Thai queries stay with Thai Wikipedia to avoid presenting untranslated English snippets as Thai answers.
      if(thai && page.lang!=="th"){addTrace("observe","Researcher","ข้ามแหล่งภาษาอังกฤษเพื่อไม่ให้ปะปนกับผลสรุปภาษาไทย");continue;}
      const sourceCheck=TOOLS.relevance({question,title:page.title,text:page.text,lang:language});
      addTrace("observe","Researcher",`${thai?"ความเกี่ยวข้องเบื้องต้น":"Initial relevance"}: ${Math.round(sourceCheck.score*100)}% · ${thai?"คำที่ตรง":"matched terms"}: ${sourceCheck.matched.join(", ")||"—"}`);
      if(sourceCheck.coverage<.25){addTrace("observe","Researcher",thai?"ไม่ตรงคำถามพอ ข้ามไปแหล่งใหม่":"Insufficient overlap; trying another source.");continue;}
      handoff("researcher","analyst",thai?"ส่งข้อความจากแหล่งที่ผ่านการคัดกรองให้ Analyst":"Send screened source text to Analyst.");
      const analysis=TOOLS.analyze_text({text:page.text,question,lang:language});
      addTrace("observe","Analyst",`${thai?"ประเด็นที่ดึงได้":"Extracted points"}: ${analysis.points.length}`);
      handoff("analyst","writer",thai?"เรียบเรียงเฉพาะข้อมูลที่ดึงได้และแนบที่มา":"Format extracted evidence and retain its source.");
      const draft=composeSheet(page,analysis,language,sourceCheck);
      handoff("writer","reviewer",thai?"ตรวจร่างเทียบกับคำถามต้นฉบับ":"Compare the draft with the original question."); await pause(140);
      const review=reviewSheet(draft,question);
      addTrace("observe","Reviewer",`${thai?"คะแนนความตรง":"Relevance score"}: ${Math.round(review.score*100)}% · ${thai?"ความครอบคลุม":"coverage"}: ${Math.round(review.coverage*100)}%`);
      if(!review.issues.length){accepted=draft;addTrace("observe","Reviewer",thai?"ผ่านเกณฑ์เบื้องต้น":"Passed heuristic checks.");handoff("reviewer","user",thai?"ส่งผลสรุปพร้อมแหล่งอ้างอิง":"Deliver summary with its source.");break;}
      addTrace("observe","Reviewer",`${thai?"ไม่ผ่าน":"Rejected"}: ${review.issues.join("; ")}`);
      if(i<research.candidates.length-1)handoff("reviewer","researcher",thai?`ค้นแหล่งถัดไป โดยไม่ใช้ URL ซ้ำ (${attempted.size} รายการที่ลองแล้ว)`:`Try another source; exclude previously attempted URLs (${attempted.size} tried).`);
    }
    if(!accepted){failStage();$("answer").textContent=thai?`ยังไม่พบแหล่งข้อมูลที่ผ่านเกณฑ์ หลังตรวจ ${attempted.size} รายการ ระบบจึงไม่สร้างสรุปที่อาจไม่ตรงคำถาม ลองปรับคำถามให้เฉพาะเจาะจงขึ้น`:`No source passed the checks after ${attempted.size} attempts. The system withheld an unrelated summary; try a more specific question.`;addTrace("observe","Reviewer",thai?"หยุดโดยไม่ส่งร่างที่ไม่ผ่าน":"Stopped without delivering a rejected draft.");return;}
    renderSheet(accepted); $("answer").textContent=thai?`ตรวจความเกี่ยวข้องเบื้องต้นแล้ว · ${accepted.provider} · เนื้อหาต้นฉบับภาษา${accepted.sourceLang}`:`Passed heuristic relevance checks · ${accepted.provider} · ${accepted.sourceLang} source text`;
  }catch(error){if(!isCurrent())return;failStage();addTrace("observe","ระบบ",`ทำงานไม่สำเร็จ: ${error.message}`);$("answer").textContent="เชื่อมต่อแหล่งข้อมูลไม่สำเร็จ อาจเกิดจากเครือข่ายหรือข้อจำกัด API/CORS โปรดลองอีกครั้ง";}
  finally{if(isCurrent()){$("go").disabled=false;$("answer").className="";}}
}
AGENTS.forEach(a=>{const item=make("li",a.name);item.dataset.id=a.id;item.title=a.role;$("pipe").append(item);});
EXAMPLES.forEach(example=>{const b=make("button",example,"chip");b.type="button";b.addEventListener("click",()=>{$("q").value=example;$("q").focus();});$("chips").append(b);});
$("form").addEventListener("submit",e=>{e.preventDefault();const q=$("q").value.trim();if(q)run(q);});
$("copy").addEventListener("click",async()=>{if(!lastMarkdown)return;try{await navigator.clipboard.writeText(lastMarkdown);$("copy").textContent="คัดลอกแล้ว";}catch{$("copy").textContent="เบราว์เซอร์ไม่อนุญาตให้คัดลอก";}window.setTimeout(()=>{$("copy").textContent="คัดลอก Markdown";},1800);});
$("dl").addEventListener("click",()=>{if(!lastMarkdown)return;const url=URL.createObjectURL(new Blob([lastMarkdown],{type:"text/markdown;charset=utf-8"}));const a=make("a");a.href=url;a.download="agent-loop-study-sheet.md";document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);});
