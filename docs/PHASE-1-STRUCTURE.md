# Phase 1 — Navigation และโครงสร้างหน้าเว็บ

## สิ่งที่จัดทำ
- Navigation หลักมีเพียง Learning Assistant และ Model Explorer
- เพิ่มลิงก์ “ทำไมต้อง Multi-Agent?” เพื่อเลื่อนลงไปยังส่วนเปรียบเทียบในหน้าแรก
- เพิ่ม `models.html` เป็นหน้า Model Explorer โดยเฉพาะ
- คง `agents.html` เป็นหน้าเปลี่ยนเส้นทางเพื่อรองรับลิงก์เก่า
- รักษาฟอนต์เดิม รูปแบบการ์ด ปุ่มมุมโค้ง Workflow Stepper และสี Accent
- เก็บไฟล์ไว้ที่ Root ของ Repository เพื่อให้ GitHub Pages ใช้งานได้

## ไฟล์ที่เกี่ยวข้อง
- ปรับปรุง: `index.html`, `style.css`
- เพิ่ม: `models.html`, `models.js`
- รองรับลิงก์เดิม: `agents.html`

## เกณฑ์ตรวจรับ
- มีปลายทางหลักเพียง 2 หน้า
- ไม่ใช้ Client-side Router หรือ Build Step
- Navigation ใช้ Relative Paths หรือลิงก์ Anchor ภายในหน้า
