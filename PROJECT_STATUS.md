# สถานะการพัฒนา — Agent Loop Playground v8

## ทิศทางโครงการ
- [x] เวอร์ชัน Live Demo แบบกระชับ (Focused MVP)
- [x] มีหน้าหลัก 2 หน้า: Learning Assistant และ Model Explorer
- [x] รักษารูปแบบและเทคโนโลยีเดิม
- [x] รองรับ GitHub Pages โดยไม่ต้อง Build
- [x] ไม่มี API Key ใน Frontend
- [x] Model Explorer ปรับเป็น 6 หมวดเฉพาะทาง

## สถานะ Phase
- [x] Phase 0 — ตรวจสอบโปรเจกต์และวางสถาปัตยกรรม
- [x] Phase 1 — Navigation และโครงสร้างหน้า
- [x] Phase 2 — ปรับ Learning Assistant
- [x] Phase 3 — เปรียบเทียบ Single AI กับ Multi-Agent
- [x] Phase 4 — Specialized Model Explorer
- [x] Phase 5 — ตรวจสอบโค้ดเบื้องต้นและเตรียมเผยแพร่

## ระบบปัจจุบัน
- Frontend: HTML, CSS, Vanilla JavaScript
- Hosting: GitHub Pages
- แหล่งค้นคว้าภายนอก: Wikipedia API
- การทำงานของ Agent: JavaScript แบบ Rule-based และให้ผลลัพธ์ซ้ำได้เมื่อป้อนข้อมูลเดิม
- การวิเคราะห์ข้อความ: Heuristics ใน Browser
- การเก็บข้อมูล: ยังไม่มีระบบบันทึกประวัติการสนทนา
- Model Explorer: รายการโมเดลเฉพาะทางแบบ Static พร้อมลิงก์เอกสารทางการ

## การตรวจสอบที่ทำแล้ว
- [x] ตรวจ Syntax ของ `app.js`, `tools.js`, `data.js`, `models.js`
- [x] ตรวจรายการโมเดล: 6 หมวด หมวดละ 2–3 รายการ
- [x] ตรวจไฟล์ HTML ว่าไม่มีการอ้างอิงไฟล์ภายในที่หายไป
- [x] ตรวจโครงสร้างไฟล์และลิงก์ Relative สำหรับ GitHub Pages
- [ ] ทดสอบการโต้ตอบใน Browser บน GitHub Pages จริง
- [ ] ทดสอบ Wikipedia API จาก Browser/เครือข่ายของผู้ใช้
- [ ] ตรวจหน้าตาบนมือถือและ Desktop ด้วยตนเองหลัง Deploy
- [ ] ยืนยันปุ่ม Copy/Download บน HTTPS ที่เผยแพร่จริง

## ข้อจำกัดที่ทราบ
- Agent แต่ละบทบาทยังไม่ใช่ LLM อิสระ
- Reviewer ตรวจรูปแบบ ไม่ได้ตรวจสอบข้อเท็จจริงของเนื้อหา
- Wikipedia เป็นแหล่งค้นคว้าภายนอกเพียงแหล่งเดียวในระบบปัจจุบัน
- รายการ Model Explorer เป็นตัวอย่างโมเดลเฉพาะทาง ไม่ใช่การจัดอันดับหรือ Benchmark
- ไม่มี Backend, ระบบสมาชิก, Cloud Sync, Tutor LLM หรือประวัติการสนทนา

## รายการก่อนเผยแพร่
1. แตกไฟล์ทั้งหมดในโฟลเดอร์นี้ไปไว้ที่ Root ของ GitHub Repository
2. Commit และ Push ไปยัง Branch ที่ตั้งค่า GitHub Pages
3. ตรวจว่า GitHub Pages ใช้ Repository Root (`/`) เป็นแหล่งเผยแพร่
4. ทดสอบหน้าแรก, Model Explorer, Wikipedia Search, ปุ่ม Export และ Navigation Anchor
5. เปิดลิงก์เอกสารทางการของโมเดลแต่ละรายการเพื่อตรวจชื่อรุ่นและสถานะการให้บริการก่อนนำเสนอ
