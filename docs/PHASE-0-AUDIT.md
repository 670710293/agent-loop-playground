# Phase 0 — ตรวจสอบโปรเจกต์และวางสถาปัตยกรรม

## ไฟล์ต้นฉบับที่ตรวจสอบ
ZIP ต้นฉบับ: `agent-loop-playground-v5.zip`

ไฟล์ที่พบ:
- `index.html`, `agents.html`
- `style.css`
- `app.js`, `agents.js`, `tools.js`, `data.js`
- `README.md`, `.gitignore`

## ผลการตรวจสอบ
- โปรเจกต์เดิมเป็น Static Website ที่ใช้ HTML/CSS/JavaScript ไม่มีขั้นตอน Build
- `index.html` มีช่องรับคำถาม Workflow 5 ขั้นตอน แผงแสดงรายละเอียด ชีทสรุป และ Export Markdown อยู่แล้ว
- `tools.js` เรียก Wikipedia Public API และวิเคราะห์ข้อความด้วยกฎที่ทำงานใน Browser
- `agents.html` รวมคำอธิบาย Agent และรายการโมเดลไว้ในแท็บเดียวกัน
- รูปแบบเดิมใช้ฟอนต์ Bricolage Grotesque, IBM Plex Sans Thai, สีม่วง การ์ดมุมโค้ง และ Workflow Stepper
- Logic ของ Agent เป็น Rule-based ไม่ได้เรียก LLM หลายตัวอย่างอิสระ
- Model Catalog เดิมเป็นภาพรวมตระกูลโมเดล/ผู้พัฒนา ไม่ใช่ผลจัดอันดับจากการทดสอบ

## ข้อตัดสินใจด้านสถาปัตยกรรม
คงโครงสร้าง Static Website และเอกลักษณ์ด้านภาพไว้ โดยจัดเป็น 2 หน้าหลัก:
1. `index.html`: Learning Assistant และคำอธิบาย Single AI vs Multi-Agent
2. `models.html`: Model Explorer

คง `agents.html` ไว้เพื่อเปลี่ยนเส้นทางจากลิงก์เก่า นำ `app.js`, `tools.js`, `data.js`, `style.css` เดิมมาต่อยอด และใช้ `models.js` สำหรับหน้า Model Explorer

## ความเสี่ยง
- Wikipedia API และ CORS/เครือข่ายเป็นบริการภายนอก
- คุณภาพการตัดคำภาษาไทยขึ้นกับการรองรับ `Intl.Segmenter` ของ Browser
- การสรุปด้วย Heuristics ไม่ใช่การตรวจสอบข้อเท็จจริงเชิงความหมาย
- ความสามารถโมเดลเปลี่ยนแปลงได้ ต้องตรวจเอกสารทางการก่อนระบุความสามารถเฉพาะรุ่น

## ผลลัพธ์ Phase 0
ตรวจสอบและกำหนดแนวทางแล้ว โดยไม่เพิ่ม Framework, Build Tool, Backend, API Key หรือ Runtime Dependency ใหม่
