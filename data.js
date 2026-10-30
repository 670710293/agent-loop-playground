// Shared, static content for the Agent Loop demo.
// Model entries describe model families, not a live ranking or a specific SKU.
const AGENTS = [
  { id: "planner", name: "Planner", role: "ตีความคำขอและกำหนดแผน", duty: "แยกหัวข้อหลักจากข้อความผู้ใช้และเลือกภาษาสำหรับการค้นหา", sources: "ข้อความที่ผู้ใช้พิมพ์", steps: ["ตัดคำนำและคำลงท้ายที่พบบ่อย", "ตรวจภาษาจากตัวอักษร", "ส่งหัวข้อให้ Researcher"], from: "ผู้ใช้", to: "Researcher", example: "หัวข้อ + ภาษาที่ตรวจพบ" },
  { id: "researcher", name: "Researcher", role: "ค้นหาและอ่านแหล่งข้อมูล", duty: "ค้น Wikipedia และดึงบทนำของบทความที่เกี่ยวข้อง", sources: "Wikipedia API", steps: ["ค้นหาบทความสูงสุด 3 รายการ", "ดึงบทนำของบทความที่เลือก", "ส่งข้อความดิบให้ Analyst"], from: "Planner", to: "Analyst", example: "ชื่อบทความ เนื้อหา และ URL" },
  { id: "analyst", name: "Analyst", role: "วิเคราะห์ข้อความ", duty: "แบ่งคำ นับความถี่ และเลือกประโยคที่มีคำสำคัญ", sources: "ข้อความจาก Researcher", steps: ["แบ่งคำด้วย Intl.Segmenter เมื่อรองรับ", "นับความถี่คำและตัด stop words เบื้องต้น", "เลือกประโยคตามคะแนนคำสำคัญ"], from: "Researcher", to: "Writer", example: "คำสำคัญและประโยคที่คัดเลือก" },
  { id: "writer", name: "Writer", role: "เรียบเรียงเป็นชีท", duty: "จัดข้อมูลที่ Analyst ส่งมาเป็นโครงสร้างชีทสรุป", sources: "ผลวิเคราะห์และ URL จาก Researcher", steps: ["จัดประเด็นหลักและคำสำคัญ", "สร้างคำถามทบทวนจากคำสำคัญ", "แนบแหล่งอ้างอิง"], from: "Analyst", to: "Reviewer", example: "ร่าง Learning Sheet ในรูปแบบ Markdown" },
  { id: "reviewer", name: "Reviewer", role: "ตรวจเงื่อนไขก่อนส่ง", duty: "ตรวจจำนวนประเด็น คำสำคัญ และรูปแบบ URL ไม่ใช่การตรวจข้อเท็จจริงเชิงความหมาย", sources: "ร่างชีทจาก Writer", steps: ["ตรวจว่ามีประเด็นหลักอย่างน้อย 3 ข้อ", "ตรวจว่ามีคำสำคัญอย่างน้อย 3 คำ", "ตรวจว่ามี URL อ้างอิงแบบ HTTPS"], from: "Writer", to: "ผู้ใช้", example: "ผ่าน/ไม่ผ่านตามเกณฑ์พื้นฐาน" }
];

const MODEL_CATEGORIES = [
  { id: "learning", title: "Learning & Research", description: "อธิบายแนวคิด สังเคราะห์ความรู้ และช่วยค้นคว้า", models: [
    { name: "Claude models", provider: "Anthropic", fit: "อ่านและอธิบายเนื้อหายาว รวมถึงช่วยเรียบเรียงแนวคิด", strengths: ["เหมาะกับการทำงานกับข้อความและเอกสาร", "ใช้ช่วยสรุปและอธิบายแนวคิดได้"], caveat: "ตรวจสอบข้อเท็จจริงและแหล่งอ้างอิงแยกต่างหาก", url: "https://docs.anthropic.com/" },
    { name: "Gemini models", provider: "Google", fit: "เรียนรู้จากข้อความและงานที่ต้องใช้ความสามารถหลายรูปแบบ", strengths: ["มีตระกูลโมเดลหลายระดับ", "รองรับงาน multimodal ในรุ่นที่กำหนด"], caveat: "ความสามารถขึ้นกับรุ่นและผลิตภัณฑ์ที่เลือก", url: "https://ai.google.dev/gemini-api/docs/models" }
  ]},
  { id: "general", title: "General Chat", description: "สนทนาทั่วไป ช่วยคิด และทำงานประจำวัน", models: [
    { name: "GPT models", provider: "OpenAI", fit: "ถามตอบทั่วไป ระดมความคิด และทำงานหลายรูปแบบ", strengths: ["มีโมเดลหลายระดับให้เลือก", "มีเอกสาร API และเครื่องมือสำหรับนักพัฒนา"], caveat: "ความสามารถและราคาแตกต่างกันตามรุ่นและแพ็กเกจ", url: "https://platform.openai.com/docs/models" },
    { name: "Claude models", provider: "Anthropic", fit: "สนทนาและช่วยจัดการงานที่มีบริบทยาว", strengths: ["เหมาะกับการทำงานกับข้อความ", "มีตัวเลือกหลายระดับประสิทธิภาพ"], caveat: "ควรตรวจข้อจำกัดของรุ่นที่ใช้งาน", url: "https://docs.anthropic.com/" }
  ]},
  { id: "coding", title: "Coding & Development", description: "ช่วยเขียนโค้ด อธิบาย Debug และทำความเข้าใจโปรเจกต์", models: [
    { name: "GPT models", provider: "OpenAI", fit: "ช่วยเขียนโค้ด อธิบายปัญหา และใช้เครื่องมือพัฒนา", strengths: ["มีเอกสาร API สำหรับเชื่อมเข้ากับ workflow", "รองรับงาน coding หลายลักษณะตามรุ่น"], caveat: "ต้องรันทดสอบโค้ดจริงก่อนนำไปใช้", url: "https://platform.openai.com/docs/models" },
    { name: "Claude models", provider: "Anthropic", fit: "อธิบายโค้ดและช่วยทำงานกับไฟล์หรือโปรเจกต์", strengths: ["เหมาะกับการอ่านและแก้ไขข้อความ/โค้ด", "มีเครื่องมือสำหรับ coding workflow"], caveat: "ผลลัพธ์อาจผิดพลาด ต้องตรวจ diff และทดสอบ", url: "https://docs.anthropic.com/" },
    { name: "Qwen models", provider: "Qwen / Alibaba", fit: "เป็นอีกตระกูลโมเดลที่มีตัวเลือกด้านการเขียนโค้ด", strengths: ["มีโมเดลหลายขนาดและตัวเลือกแบบเปิด", "เหมาะสำหรับผู้ที่ต้องการทดลอง self-hosting บางรุ่น"], caveat: "การติดตั้งและทรัพยากรขึ้นกับรุ่นที่เลือก", url: "https://qwen.readthedocs.io/" }
  ]},
  { id: "data", title: "Data Analysis", description: "ช่วยทำความเข้าใจข้อมูล ตาราง และวางแผนการวิเคราะห์", models: [
    { name: "GPT models", provider: "OpenAI", fit: "ช่วยเขียน Python/SQL และวางแผนวิเคราะห์ข้อมูล", strengths: ["ช่วยอธิบายขั้นตอนวิเคราะห์", "เชื่อมกับเครื่องมือได้ตามสภาพแวดล้อม"], caveat: "ควรใช้โค้ดหรือเครื่องมือคำนวณตรวจตัวเลข", url: "https://platform.openai.com/docs/models" },
    { name: "Gemini models", provider: "Google", fit: "ช่วยวิเคราะห์โจทย์ข้อมูลและทำงานกับอินพุตหลายรูปแบบ", strengths: ["มีตัวเลือกโมเดลหลายระดับ", "มีเอกสารสำหรับนักพัฒนา"], caveat: "การจัดการไฟล์และขนาดข้อมูลขึ้นกับรุ่น/แอป", url: "https://ai.google.dev/gemini-api/docs/models" }
  ]},
  { id: "long-context", title: "Long Context & Documents", description: "อ่านเอกสารยาว สรุปเนื้อหา และค้นประเด็นจากหลายส่วน", models: [
    { name: "Gemini models", provider: "Google", fit: "พิจารณาเมื่อโจทย์ต้องใช้ context ยาวหรือสื่อหลายรูปแบบ", strengths: ["บางรุ่นมี context window ขนาดใหญ่", "มีเอกสารระบุขีดจำกัดตามรุ่น"], caveat: "ตรวจ context limit ของรุ่นที่ใช้งานจริง", url: "https://ai.google.dev/gemini-api/docs/models" },
    { name: "Claude models", provider: "Anthropic", fit: "ทำงานกับเอกสารและบริบทยาว", strengths: ["เหมาะกับการอ่านและสังเคราะห์ข้อความ", "มีเอกสารอธิบายรุ่นและข้อจำกัด"], caveat: "context window และความพร้อมใช้งานขึ้นกับรุ่น", url: "https://docs.anthropic.com/" }
  ]},
  { id: "creative", title: "Creative & Multimodal", description: "สร้างสรรค์เนื้อหาและทำงานกับภาพ เสียง หรือสื่อหลายรูปแบบ", models: [
    { name: "GPT models", provider: "OpenAI", fit: "งานสร้างสรรค์และงานที่ผสมข้อความกับสื่ออื่น", strengths: ["มีโมเดลและผลิตภัณฑ์หลายรูปแบบ", "ความสามารถ multimodal ขึ้นกับรุ่น"], caveat: "ตรวจว่ารุ่นและ API ที่เลือกเปิด modality ที่ต้องการ", url: "https://platform.openai.com/docs/models" },
    { name: "Gemini models", provider: "Google", fit: "งานที่ต้องรับอินพุตหลายรูปแบบและสร้างผลลัพธ์ตามรุ่น", strengths: ["มีตระกูลโมเดล multimodal", "มีเอกสาร API สำหรับทดลอง"], caveat: "ฟีเจอร์ที่รองรับต่างกันในแต่ละรุ่น", url: "https://ai.google.dev/gemini-api/docs/models" }
  ]}
];
