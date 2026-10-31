# สถานะการพัฒนา — Agent Loop Playground v8.2

## Product direction
- [x] Learning Assistant + Model Explorer
- [x] คง HTML/CSS/Vanilla JavaScript และ GitHub Pages
- [x] ไม่มี API key ฝั่ง Frontend
- [x] แสดงข้อจำกัดของ Demo อย่างตรงไปตรงมา

## v8.2 — Multi-Source Researcher
- [x] จำแนกหมวดคำถามเบื้องต้น: Programming, Science, Health, News, Economy, History และ General
- [x] เลือกแหล่งข้อมูลตามหมวด: GitHub repository search, Crossref, PubMed, GDELT, World Bank Open Data และ Wikipedia
- [x] แสดงชื่อ provider และจำนวนผลลัพธ์/สถานะการเรียกใช้ใน trace
- [x] ตัดผลลัพธ์ซ้ำด้วย URL และไม่ลอง URL เดิมซ้ำในรอบเดียวกัน
- [x] Reviewer ตรวจความเกี่ยวข้องเบื้องต้น และไม่ส่งร่างที่ไม่ผ่าน
- [x] ภาษาไทยใช้ Wikipedia ภาษาไทยเพื่อหลีกเลี่ยงการนำข้อความอังกฤษมาแสดงปะปน; แหล่ง API เฉพาะทางยังเน้นภาษาอังกฤษ
- [x] เพิ่มการแจ้งข้อจำกัดเมื่อ API ใช้งานไม่ได้

## Source routing
| หมวดคำถาม | แหล่งข้อมูลที่เรียกใช้ | หมายเหตุ |
|---|---|---|
| Programming | GitHub repository search + Wikipedia (ตามภาษา) | ผล GitHub เป็น metadata/คำอธิบาย repository ไม่ใช่การตรวจโค้ด |
| Science / Research | Crossref + Wikipedia (ตามภาษา) | Crossref ให้ metadata; abstract อาจไม่มี และไม่ใช่ทุกงานผ่าน peer review |
| Health | PubMed + Wikipedia (ตามภาษา) | ผล PubMed ที่ใช้ในรุ่นนี้เป็น metadata ไม่ใช่คำแนะนำทางการแพทย์ |
| News | GDELT + Wikipedia (ตามภาษา) | เป็นดัชนีข่าว ต้องเปิดตรวจสำนักข่าวต้นทางและเวลาเผยแพร่ |
| Economy / Statistics | World Bank Open Data + Wikipedia (ตามภาษา) | ค้นหาชื่อตัวชี้วัด ไม่ได้ดึงค่าข้อมูลอนุกรมเวลาในรุ่นนี้ |
| History / General | Wikipedia | ยังไม่มี search provider ทั่วไปแบบครอบคลุมเว็บทั้งหมด |

## QA performed
- [ ] `node --check` ผ่านสำหรับ app.js, tools.js, data.js, models.js
- [ ] ตรวจ API จริงจาก browser และเครือข่ายผู้ใช้
- [ ] ทดสอบ interaction บน GitHub Pages
- [ ] ตรวจภาพหน้าเว็บบน desktop/mobile

## Known limitations
- Agent roles เป็น workflow JavaScript แบบ deterministic ไม่ใช่ LLM หลายตัว
- Reviewer ใช้ keyword overlap heuristic ไม่เข้าใจความหมายเชิงลึกและไม่ใช่ fact-check
- API ภายนอกอาจมี CORS, rate limit, availability หรือ policy เปลี่ยนแปลง
- GitHub ให้ข้อมูล repository metadata; Crossref ให้ metadata/abstract เมื่อมี; PubMed รุ่นนี้ใช้ bibliographic summary; GDELT ให้ข่าวจากดัชนี; World Bank ค้นชื่อตัวชี้วัด
- แหล่งข้อมูลเฉพาะทางให้ผลภาษาอังกฤษเป็นหลัก; ไม่มีระบบแปลอัตโนมัติ
- ยังไม่มี generic web search API, backend proxy, API key vault, semantic reranker หรือ LLM
- เนื้อหาสรุปจำกัดตามข้อความที่ API ส่งกลับมา และอาจไม่เพียงพอ

## Release checklist
1. ตรวจ `node --check` และ local HTML references
2. เปิดทดสอบจาก browser จริงเพื่อยืนยัน CORS/response ของแต่ละ provider
3. ตรวจว่า trace แสดง provider ที่เรียกได้/ไม่ได้อย่างถูกต้อง
4. ทดสอบ copy/download และ responsive layout
5. ค่อย commit/push ไป GitHub Pages; ยังไม่ถือว่า deploy แล้ว
