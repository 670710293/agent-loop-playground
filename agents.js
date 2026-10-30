// ข้อมูล agent ทั้งหมดอยู่ที่นี่ เพิ่มตัวใหม่ได้โดยเพิ่ม object ใน array
const AGENTS = [
  { name: "Research Scout", role: "ค้นและรวบรวมแหล่งข้อมูล", use: "หาข้อมูลตั้งต้นของหัวข้อใหม่พร้อมลิงก์อ้างอิง",
    tools: ["search_web", "fetch_page"],
    prompt: "คุณคือผู้ช่วยค้นคว้าสำหรับนักเรียน เมื่อได้รับหัวข้อ ให้ค้นอย่างน้อย 3 แหล่ง สรุปสิ่งที่พบ และแนบ URL ทุกข้ออ้างอิง ห้ามอ้างแหล่งที่ไม่ได้เปิดอ่านจริง",
    caution: "ต้องให้เครื่องมือค้นเว็บจริง ไม่เช่นนั้นโมเดลอาจแต่งแหล่งอ้างอิงขึ้นมาเอง" },
  { name: "Summary Smith", role: "ทำชีทสรุป", use: "ย่อบทเรียนยาวให้เป็นหัวข้อ ประเด็นหลัก และคำสำคัญ",
    tools: ["ไม่ต้องใช้ (รับข้อความเข้าตรงๆ)"],
    prompt: "สรุปเนื้อหาต่อไปนี้เป็นชีท: หัวข้อหลัก, 5 ประเด็นสำคัญ, คำศัพท์พร้อมนิยามสั้น ใช้ภาษาที่นักเรียน ม.ปลายอ่านเข้าใจ และห้ามเพิ่มข้อมูลที่ไม่อยู่ในเนื้อหา",
    caution: "ถ้าเนื้อหายาวมาก ควรแบ่งเป็นช่วงแล้วสรุปทีละช่วง" },
  { name: "Flashcard Forge", role: "สร้างแฟลชการ์ด", use: "เปลี่ยนชีทเป็นคำถาม-คำตอบสำหรับท่องจำ",
    tools: ["ไม่ต้องใช้"],
    prompt: "จากชีทสรุปนี้ สร้างแฟลชการ์ด 10 ใบ รูปแบบ JSON: [{\"q\":\"...\",\"a\":\"...\"}] คำถามต้องตอบได้จากชีทเท่านั้น",
    caution: "ให้ตอบเป็น JSON ล้วน แล้ว parse ในโค้ดเพื่อนำไปแสดงเป็นการ์ด" },
  { name: "Quiz Master", role: "ออกข้อสอบ", use: "ทดสอบความเข้าใจพร้อมเฉลยและคำอธิบาย",
    tools: ["ไม่ต้องใช้"],
    prompt: "ออกข้อสอบปรนัย 5 ข้อจากเนื้อหานี้ ข้อละ 4 ตัวเลือก ระบุข้อที่ถูก และอธิบายสั้นๆ ว่าทำไมตัวเลือกอื่นผิด",
    caution: "ควรให้ผู้ใช้ตอบก่อนแล้วค่อยแสดงเฉลย" },
  { name: "Study Planner", role: "วางแผนอ่านหนังสือ", use: "แบ่งหัวข้อและเวลาก่อนสอบ",
    tools: ["calculator", "calendar (ทางเลือก)"],
    prompt: "ผู้ใช้มีเวลาอ่านวันละ X ชั่วโมง สอบในอีก Y วัน หัวข้อมีดังนี้ จัดตารางอ่านรายวัน เผื่อเวลาทบทวน 20% และเรียงหัวข้อยากไว้ช่วงแรก",
    caution: "ให้โค้ดคำนวณจำนวนวันและชั่วโมงเอง อย่าให้โมเดลคิดเลขเอง" }
];
const grid = document.getElementById("grid");
AGENTS.forEach((a) => {
  const c = document.createElement("article"); c.className = "card";
  const h = document.createElement("h2"); h.textContent = a.name;
  const r = document.createElement("p"); r.className = "role"; r.textContent = a.role + " · " + a.use;
  const t = document.createElement("p"); t.className = "sub"; t.textContent = "เครื่องมือ: " + a.tools.join(", ");
  const pre = document.createElement("pre"); pre.textContent = a.prompt;
  const w = document.createElement("p"); w.className = "note"; w.textContent = "ข้อควรระวัง: " + a.caution;
  const b = document.createElement("button"); b.type = "button"; b.textContent = "คัดลอก prompt";
  b.onclick = async () => { try { await navigator.clipboard.writeText(a.prompt); b.textContent = "คัดลอกแล้ว"; } catch { b.textContent = "คัดลอกไม่ได้"; } setTimeout(() => (b.textContent = "คัดลอก prompt"), 1500); };
  c.append(h, r, t, pre, w, b); grid.append(c);
});
