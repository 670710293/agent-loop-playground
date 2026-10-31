const $ = id => document.getElementById(id);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pause = ms => new Promise(resolve => setTimeout(resolve, reducedMotion ? 0 : ms));
const EXAMPLES = ["อธิบายการสังเคราะห์แสงและขั้นตอนสำคัญ", "อธิบาย Recursion ใน Java พร้อมตัวอย่าง", "สรุปสาเหตุและผลกระทบของสงครามโลกครั้งที่สอง", "Explain Newton's laws of motion with examples", "Latest news about renewable energy"];
let currentRun = 0, lastMarkdown = "";
const make = (tag, text, className) => { const n = document.createElement(tag); if (text != null) n.textContent = text; if (className) n.className = className; return n; };
const agentName = id => id === "user" ? "ผู้ใช้" : (AGENTS.find(a => a.id === id)?.name || id);
function addTrace(kind, who, message, detail) { const item = make("li", null, `step ${kind}`); item.append(make("b", who), make("p", message)); if (detail) item.append(make("code", detail)); $("trace").append(item); $("status").textContent = `· ${$("trace").children.length} ขั้นตอน`; }
function setStage(id) { const items = [...$("pipe").children], index = id === "user" ? items.length : items.findIndex(x => x.dataset.id === id); items.forEach((x,i) => { x.className = i < index ? "done" : i === index ? "active" : ""; if (i === index) x.setAttribute("aria-current","step"); else x.removeAttribute("aria-current"); }); }
function failStage() { const a = $("pipe").querySelector(".active"); if (a) { a.className = "fail"; a.removeAttribute("aria-current"); } }
function handoff(from,to,message) { setStage(to); addTrace("msg",`${agentName(from)} → ${agentName(to)}`,message); }
function withTimeout(promise, ms) { return new Promise((resolve,reject) => { const timer = setTimeout(() => reject(new Error("หมดเวลารอแหล่งข้อมูล (timeout)")),ms); promise.then(v=>{clearTimeout(timer);resolve(v);},e=>{clearTimeout(timer);reject(e);}); }); }
function makeReflection(question) {
  return [
    `ลองอธิบายคำตอบของคำถามนี้ด้วยคำพูดของตัวเอง: ${question}`,
    "มีหลักฐานหรือข้อมูลส่วนใดในสรุปที่สนับสนุนคำตอบของคุณ?"
  ];
}
function orderThaiPoints(points) {
  const rank = text => {
    if (/(คือ|หมายถึง|เป็นกระบวนการ|เรียกว่า|ประกอบด้วย)/.test(text)) return 0;
    if (/(เพราะ|เนื่องจาก|โดย|ผ่าน|ใช้|ทำงาน|ขั้นตอน|ประกอบ)/.test(text)) return 1;
    if (/(ส่งผล|ทำให้|ดังนั้น|ผลลัพธ์|ประโยชน์|สามารถ|จึง)/.test(text)) return 2;
    return 1;
  };
  return points.map((text,index)=>({text,index,rank:rank(text)})).sort((a,b)=>a.rank-b.rank || a.index-b.index).map(x=>x.text);
}
function composeSheet(question, sources, points, translatedCount) {
  const questions = makeReflection(question);
  const sourceList = sources.map((s,i)=>`- [${i+1}] ${s.provider}: ${s.title} — ${s.url}`).join("\n");
  const markdown = `# ชีทสรุป\n\n**คำถาม:** ${question}\n\n## สรุปคำตอบ\n${points.map(p=>`- ${p}`).join("\n")}\n\n## ทบทวนความเข้าใจ\n${questions.map((q,i)=>`${i+1}. ${q}`).join("\n")}\n\n## แหล่งอ้างอิง\n${sourceList}\n\n> หมายเหตุ: ค้นทั้งภาษาไทยและอังกฤษ และแปลข้อความภาษาอังกฤษเป็นไทยด้วยบริการแปลภายนอก การคัดเลือกประเด็นและ Reviewer ใช้กฎใน JavaScript ไม่ใช่ LLM หรือการตรวจสอบข้อเท็จจริงเชิงความหมาย\n`;
  return { question, sources, points, questions, markdown, translatedCount };
}
function reviewEvidence(question, sources, points) {
  const issues = [];
  if (!sources.length) issues.push("ไม่พบแหล่งข้อมูลที่มีเนื้อหาเพียงพอ");
  if (!points.length) issues.push("ไม่สามารถดึงประเด็นที่เกี่ยวข้องได้");
  const uniquePoints = new Set(points.map(p=>p.toLocaleLowerCase().replace(/\s+/g," ").trim()));
  if (uniquePoints.size < points.length) issues.push("พบประเด็นซ้ำ");
  if (sources.some(s=>!/^https:\/\//.test(s.url))) issues.push("พบ URL อ้างอิงไม่ถูกต้อง");
  return { issues, passed: issues.length===0 };
}
function renderSheet(sheet) {
  const box = $("sheet");
  box.replaceChildren(make("h3","สรุปคำตอบ"),make("p",sheet.question,"question-line"),make("h4","ประเด็นสำคัญ"));
  const ul=make("ul"); sheet.points.forEach(p=>ul.append(make("li",p)));
  box.append(ul,make("h4","ทบทวนความเข้าใจ"));
  const qs=make("ol"); sheet.questions.forEach(q=>qs.append(make("li",q)));
  box.append(qs,make("h4","แหล่งอ้างอิง"));
  const sources=make("ol");
  sheet.sources.forEach(s=>{const li=make("li");const a=make("a",`${s.provider}: ${s.title}`);a.href=s.url;a.target="_blank";a.rel="noopener noreferrer";li.append(a);sources.append(li);});
  box.append(sources,make("p",`ค้นพบ ${sheet.sources.length} แหล่ง · แปลจากอังกฤษเป็นไทย ${sheet.translatedCount} ประเด็น · สรุปภาษาไทย`,"note"));
  lastMarkdown=sheet.markdown; $("sheetBox").hidden=false;
}
async function run(input) {
  const runId=++currentRun, isCurrent=()=>runId===currentRun;
  $("chat").hidden=false; $("ubub").textContent=input; $("trace").replaceChildren(); $("sheetBox").hidden=true; $("proc").open=false;
  $("answer").textContent="กำลังค้นข้อมูลทั้งภาษาไทยและอังกฤษ ตรวจหลักฐาน และเรียบเรียงเป็นภาษาไทย…"; $("answer").className="busy"; $("status").textContent=""; $("go").disabled=true; lastMarkdown=""; setStage("planner");
  try {
    const question=input.replace(/\s+/g," ").trim();
    const category=TOOLS.classify(question);
    handoff("user","planner","เก็บคำถามต้นฉบับ วิเคราะห์หัวข้อและเจตนาของคำถาม โดยไม่ให้ผู้ใช้ต้องเลือกภาษา");
    addTrace("observe","Planner",`หมวดที่ประเมิน: ${category} · ภาษาผลลัพธ์: ไทย`);
    await pause(100); handoff("planner","researcher","สร้างคำค้นภาษาไทยและอังกฤษ แล้วค้นทั้งสองภาษาโดยอัตโนมัติ");
    const research=await withTimeout(TOOLS.searchSources({question}),32000); if(!isCurrent())return;
    research.translationNotes.forEach(note=>addTrace("observe","Researcher",note));
    research.attempts.forEach(a=>addTrace(a.ok?(a.count?"tool":"observe"):"observe","Researcher",`${a.name}: ${a.ok?`พบ ${a.count} รายการ`:"เรียกใช้ไม่ได้"}${a.error?` (${a.error})`:""}`));
    addTrace("observe","Researcher",`พบผลลัพธ์ไม่ซ้ำ ${research.candidates.length} รายการ`);

    handoff("researcher","analyst","คัดเฉพาะแหล่งที่มีเนื้อหาจริง ไม่ใช้แค่ชื่อบทความหรือ Metadata เป็นคำตอบ");
    const ranked=[];
    for(const page of research.candidates){
      if(!page.evidence || !page.text || page.text.trim().length<70) continue;
      const sourceQuestion=page.lang==="th"?research.thQuery:research.enQuery;
      if(!sourceQuestion) continue;
      const check=TOOLS.relevance({question:sourceQuestion,title:page.title,text:page.text,lang:page.lang});
      const analysis=TOOLS.analyze_text({text:page.text,question:sourceQuestion,lang:page.lang});
      if(check.coverage>=.18 && analysis.points.length){ranked.push({page,check,analysis,sourceQuestion});}
    }
    ranked.sort((a,b)=>b.check.score-a.check.score || b.analysis.points.length-a.analysis.points.length);
    const selected=ranked.slice(0,3);
    addTrace("observe","Analyst",`เลือกหลักฐานจาก ${selected.length} แหล่งที่ผ่านเกณฑ์เบื้องต้น จาก ${research.candidates.length} ผลลัพธ์`);
    if(!selected.length){
      failStage();
      $("answer").textContent="ค้นข้อมูลแล้ว แต่ยังไม่พบแหล่งที่มีเนื้อหาเพียงพอและสัมพันธ์กับคำถาม จึงไม่สร้างคำตอบที่อาจคลาดเคลื่อน ลองเพิ่มบริบทหรือระบุหัวข้อให้ชัดขึ้นได้ครับ";
      addTrace("observe","Reviewer","ไม่พบหลักฐานเพียงพอ · หยุดโดยไม่แต่งคำตอบ");
      return;
    }

    handoff("analyst","writer","รวมประเด็นจากหลายแหล่ง ตัดข้อความซ้ำ และแปลเนื้อหาภาษาอังกฤษเป็นภาษาไทย");
    const allPoints=[]; const usedSources=[]; let translatedCount=0; let translationFailures=0;
    for(const item of selected){
      const rawPoints=item.analysis.points.slice(0,3);
      let translated;
      if(item.page.lang==="th") translated=rawPoints;
      else {
        const outcomes=await Promise.all(rawPoints.map(point=>TOOLS.translate(point.slice(0,470),"en","th").then(value=>({value})).catch(()=>({value:""}))));
        translated=outcomes.map(x=>x.value);
        translatedCount+=translated.filter(Boolean).length;
        translationFailures+=translated.filter(x=>!x).length;
      }
      const clean=translated.filter(Boolean);
      if(clean.length){usedSources.push(item.page); allPoints.push(...clean);}
    }
    const uniquePoints=orderThaiPoints([...new Set(allPoints.map(p=>p.replace(/\s+/g," ").trim()))]).slice(0,8);
    if(!uniquePoints.length){
      failStage();
      $("answer").textContent="ค้นพบแหล่งข้อมูลแล้ว แต่บริการแปลภาษาไม่พร้อมใช้งานในขณะนี้ จึงยังไม่สามารถจัดทำสรุปภาษาไทยที่เชื่อถือได้ ลองอีกครั้งภายหลังได้ครับ";
      addTrace("observe","Writer",`แปลไม่สำเร็จ ${translationFailures} ประเด็น · ไม่แสดงข้อความอังกฤษปะปน`);
      return;
    }
    addTrace("observe","Writer",`เรียบเรียง ${uniquePoints.length} ประเด็นเป็นภาษาไทย · จัดลำดับคำอธิบาย → กลไก/เหตุผล → ผลลัพธ์ · แปลสำเร็จ ${translatedCount} ประเด็น`);
    handoff("writer","reviewer","ตรวจว่ามีเนื้อหา มีแหล่งอ้างอิง และไม่มีประเด็นซ้ำ");
    await pause(100);
    const thaiQuestion=research.detected==="en" && research.thQuery ? research.thQuery : question;
    const draft=composeSheet(thaiQuestion,usedSources,uniquePoints,translatedCount);
    const review=reviewEvidence(question,usedSources,uniquePoints);
    addTrace("observe","Reviewer",`ตรวจ ${usedSources.length} แหล่ง · ${uniquePoints.length} ประเด็น · ${review.passed?"ผ่านเกณฑ์โครงสร้าง":"ไม่ผ่าน"}`);
    if(!review.passed){
      failStage(); $("answer").textContent="ร่างคำตอบยังไม่ผ่านการตรวจสอบโครงสร้าง จึงไม่ส่งสรุปที่อาจทำให้เข้าใจผิดครับ";
      addTrace("observe","Reviewer",review.issues.join("; ")); return;
    }
    addTrace("observe","Reviewer","ผ่านการตรวจเบื้องต้น · ไม่ได้ยืนยันความถูกต้องเชิงความหมาย");
    handoff("reviewer","user","ส่งสรุปภาษาไทยพร้อมแหล่งอ้างอิงหลายแหล่ง");
    renderSheet(draft);
    $("answer").textContent=`สรุปภาษาไทยจาก ${usedSources.length} แหล่งข้อมูล · ค้นทั้งภาษาไทยและอังกฤษ · ตรวจโครงสร้างเรียบร้อย`;
    if(translationFailures) addTrace("observe","Writer",`มี ${translationFailures} ประเด็นที่แปลไม่ได้และถูกตัดออก`);
  }catch(error){
    if(!isCurrent())return;
    failStage(); addTrace("observe","ระบบ",`หยุดการทำงานอย่างปลอดภัย: ${error.message}`);
    $("answer").textContent="ระบบค้นหาหรือประมวลผลใช้เวลานานเกินไป หรือ API บางแหล่งไม่พร้อมใช้งาน ไม่มีการส่งคำตอบที่ยังไม่ได้ตรวจ กรุณาลองใหม่อีกครั้ง";
  }finally{
    if(isCurrent()){$("go").disabled=false;$("answer").className="";}
  }
}
AGENTS.forEach(a=>{const item=make("li",a.name);item.dataset.id=a.id;item.title=a.role;$("pipe").append(item);});
EXAMPLES.forEach(example=>{const b=make("button",example,"chip");b.type="button";b.addEventListener("click",()=>{$("q").value=example;$("q").focus();});$("chips").append(b);});
$("form").addEventListener("submit",e=>{e.preventDefault();const q=$("q").value.trim();if(q)run(q);});
$("copy").addEventListener("click",async()=>{if(!lastMarkdown)return;try{await navigator.clipboard.writeText(lastMarkdown);$("copy").textContent="คัดลอกแล้ว";}catch{$("copy").textContent="เบราว์เซอร์ไม่อนุญาตให้คัดลอก";}window.setTimeout(()=>{$("copy").textContent="คัดลอก Markdown";},1800);});
$("dl").addEventListener("click",()=>{if(!lastMarkdown)return;const url=URL.createObjectURL(new Blob([lastMarkdown],{type:"text/markdown;charset=utf-8"}));const a=make("a");a.href=url;a.download="agent-loop-study-sheet.md";document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);});
