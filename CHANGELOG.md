# บันทึกการเปลี่ยนแปลง — v8

## Model Explorer แบบเฉพาะทาง
ปรับจากหมวดกว้างที่มีโมเดลแชททั่วไปซ้ำกัน มาเป็น 6 หมวดตามลักษณะงาน:
1. Coding & Software Engineering
2. Image Generation & Editing
3. Audio & Speech
4. Search & Research
5. Embeddings & Reranking
6. Vision & Document Understanding

แต่ละหมวดมี 3 รายการ รวม 18 รายการ โดยครอบคลุมผู้พัฒนาและระบบนิเวศโมเดล 12 กลุ่ม

## เอกสารภาษาไทย
- แปล `README.md`
- แปล `PROJECT_PLAN.md`
- แปล `PROJECT_STATUS.md`
- แปลเอกสาร Phase 0–5 ใน `docs/`

## หมายเหตุ
รายการโมเดลเป็นตัวอย่างเฉพาะทาง ไม่ใช่การจัดอันดับ บางรายการเป็นตระกูลโมเดล บางรายการเป็น API หรือชุดเครื่องมือที่ใช้โมเดลอยู่เบื้องหลัง ควรตรวจชื่อรุ่น การเข้าถึง License และเอกสารทางการก่อนนำไปใช้งานจริง

## v8.1 — Question Relevance Loop
- แยกโหมดผลลัพธ์ภาษาไทยและ English พร้อม Auto detect
- ปรับ Researcher ให้รวบรวมหลายคำค้นและไม่ลองบทความเดิมซ้ำ
- ปรับ Analyst ให้จัดอันดับประโยคโดยอิงคำจากคำถาม
- ปรับ Reviewer ให้ตรวจความเกี่ยวข้องของแหล่งข้อมูลและสรุปกับคำถามต้นฉบับ
- เพิ่มวงจร retry เมื่อไม่ผ่าน และหยุดโดยไม่ส่งสรุปที่ไม่ผ่าน


## v8.2 — Multi-Source Researcher
- Added topic classification and provider routing for GitHub, Crossref, PubMed, GDELT, World Bank Open Data and Wikipedia.
- Added URL deduplication, provider status traces and fallback behavior.
- Kept Thai-language retrieval on Thai Wikipedia; clearly labels English source text and the lack of automatic translation.
- Updated project status and documentation with API/CORS and heuristic limitations.
