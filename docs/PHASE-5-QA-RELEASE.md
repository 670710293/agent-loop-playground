# Phase 5 — ตรวจสอบคุณภาพและเตรียมเผยแพร่บน GitHub Pages

## การตรวจสอบแบบ Static ที่ทำแล้ว
- หน้า HTML อ้างอิงไฟล์ CSS และ JavaScript ภายในด้วย Relative Paths
- โหลด Script หลัง Markup ของหน้าเว็บ
- ไม่ต้องใช้ Package Manager, Bundler หรือ Build Step
- ไม่มี API Key หรือ Secret ในโปรเจกต์
- `agents.html` รองรับลิงก์เดิมด้วยการเปลี่ยนเส้นทาง
- หน้าเว็บมี Breakpoints สำหรับมือถือและรองรับ Reduced Motion
- ลิงก์ภายนอกเปิดแท็บใหม่พร้อม `rel="noopener noreferrer"`

## การทดสอบด้วย Browser ที่ยังต้องทำจริง
- ส่งหัวข้อภาษาไทยและภาษาอังกฤษ
- ตรวจว่า Wikipedia Search และ Extract สำเร็จ
- ทดสอบกรณีไม่พบผลลัพธ์และเครือข่ายล้มเหลว
- ทดสอบ Copy/Download บน GitHub Pages ผ่าน HTTPS
- ทดสอบ Navigation Anchor จากทั้งสองหน้า
- ตรวจ Layout บนมือถือและ Desktop
- ตรวจ Browser Console และ Network Panel
- เปิดตรวจลิงก์เอกสารทางการของโมเดลใน Model Explorer

## วิธีเผยแพร่
1. แตกไฟล์ทั้งหมดในโฟลเดอร์โปรเจกต์ไปไว้ที่ Root ของ GitHub Repository
2. Commit และ Push ไปยัง Branch ที่ตั้งค่า GitHub Pages
3. ใน Repository Settings → Pages เลือก `main` และ `/ (root)` หากยังไม่ได้ตั้งค่า
4. รอ GitHub Pages Deploy แล้วทดสอบ URL ที่เผยแพร่

## ความซื่อตรงของผล QA
การตรวจแบบ Static ไม่สามารถแทนการทดสอบใน Browser ได้ จึงยังไม่อ้างว่าได้ทดสอบเว็บไซต์ GitHub Pages จริงจากสภาพแวดล้อมนี้แล้ว
