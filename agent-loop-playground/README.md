# Agent Loop Playground

เว็บจำลองลูปการทำงานของ AI agent (คิด → เรียกเครื่องมือ → ดูผลลัพธ์ → ตอบ) เทียบกับ chatbot ที่ตอบครั้งเดียว
ผู้ใช้เลือกโจทย์ กดรัน แล้วดู agent ทำงานทีละขั้น

- **Live:** _ใส่ URL หลัง deploy_
- **Tech stack:** HTML, CSS, JavaScript (ไม่มี build step), Google Fonts

## รันในเครื่อง
```bash
python3 -m http.server 8000   # แล้วเปิด http://localhost:8000
```

## Deploy
- **GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / root
- **Netlify / Vercel:** import repo นี้ ไม่ต้องตั้งค่า build

## หมายเหตุการออกแบบ
- ใช้ข้อมูลสคริปต์ (mock) ใน `app.js` เพื่อให้เปิดได้เสถียรและไม่มีค่าใช้จ่าย
- เคารพ `prefers-reduced-motion` และใช้งานด้วยคีย์บอร์ดได้

## แผนต่อยอด
- ต่อ LLM API จริงผ่าน server-side route (ห้ามใส่ API key ในโค้ดฝั่ง client)
- ให้ผู้ใช้พิมพ์โจทย์เอง และเพิ่มรูปแบบ multi-agent

## ส่วนที่ใช้ AI ช่วย
_เขียนเองตอนก่อนสัมภาษณ์: AI ช่วยตรงไหน และเข้าใจโค้ดส่วนไหนเป็นพิเศษ_
