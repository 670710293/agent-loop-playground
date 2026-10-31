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

## v8.3 — Thai-first bilingual research and response reliability
- Removed the language selector; the user no longer needs to choose an input/output language.
- Search now attempts Thai and English in parallel (with query translation where available).
- Added DuckDuckGo Instant Answer as a lightweight general fallback and OpenAlex for research discovery.
- PubMed now attempts to retrieve abstracts via EFetch instead of relying only on bibliographic metadata.
- Only sources with substantive text are eligible to support the summary; metadata-only results remain trace/context and are not treated as evidence.
- Removed keyword clouds and keyword-generated self-review questions from the study sheet.
- English evidence is translated into Thai through MyMemory before the final Thai-first summary is assembled.
- The writer merges and deduplicates relevant points from up to three sources; the reviewer checks output structure and provenance.
- Added per-request timeouts, provider-level error isolation, and clear user-facing failure messages so a stalled API does not leave the submit button disabled indefinitely.
- Limitations: translation and public API availability/rate limits/CORS are external dependencies; reviewer remains heuristic and does not semantically fact-check claims. No LLM or backend was added.
