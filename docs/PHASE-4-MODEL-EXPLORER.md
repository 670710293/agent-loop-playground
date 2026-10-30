# Phase 4 — Model Explorer แบบเฉพาะทาง

## เป้าหมาย
เปลี่ยน Model Explorer จากการแนะนำโมเดลแชททั่วไปที่ซ้ำกันหลายหมวด ให้เป็นแผนที่สำรวจโมเดลตามงานเฉพาะทาง โดยยังคง 6 หมวด และจำกัดจำนวน 2–3 รายการต่อหมวด

## หมวดหมู่และตัวอย่างรายการ
1. **Coding & Software Engineering:** Qwen3-Coder, DeepSeek-Coder, Codestral
2. **Image Generation & Editing:** FLUX.2, GPT Image, Imagen
3. **Audio & Speech:** Whisper, ElevenLabs Scribe, ElevenLabs Text to Speech
4. **Search & Research:** Perplexity Sonar, Gemini with Google Search Grounding, Grok with Web Search
5. **Embeddings & Reranking:** Cohere Embed/Rerank, BGE-M3/BGE Reranker, OpenAI Embeddings
6. **Vision & Document Understanding:** Qwen3-VL, Mistral OCR, PaddleOCR

## ข้อมูลในการ์ด
- ชื่อโมเดลหรือตระกูลโมเดล
- ผู้พัฒนา
- ประเภทงานที่เหมาะสม
- จุดเด่น
- ข้อควรพิจารณา
- ประเภทการเข้าถึง เช่น Hosted API หรือ Open-weight
- ลิงก์เอกสารทางการ

## หลักเกณฑ์การนำเสนอ
- เป็นรายการตัวอย่างที่คัดเลือก ไม่ใช่การจัดอันดับ
- แยกโมเดลออกจากผลิตภัณฑ์และเครื่องมือให้ชัด
- Search Grounding เป็นความสามารถที่เกิดจากโมเดลร่วมกับเครื่องมือค้นหา ไม่ใช่โมเดลค้นหาอิสระเสมอไป
- Embeddings, Reranking, OCR, Speech-to-Text และ Text-to-Speech เป็นงานคนละประเภท
- ไม่ใส่ราคา Benchmark หรือความสามารถที่ไม่มีแหล่งยืนยัน
- ตรวจรุ่นและ License ก่อนใช้งานจริง
- Open-weight ไม่ได้แปลว่าใช้งานเชิงพาณิชย์ได้โดยไม่มีข้อจำกัด

## ตรวจสอบ
- [x] มี 6 หมวดเฉพาะทาง
- [x] แต่ละหมวดมีไม่เกิน 3 รายการ
- [x] ลดการใช้โมเดลแชททั่วไปซ้ำกันในทุกหมวด
- [x] แต่ละการ์ดมีลิงก์เอกสารผู้พัฒนา
- [ ] ตรวจหน้าเอกสารและสถานะโมเดลอีกครั้งก่อนนำเสนอจริง เพราะ Catalog เปลี่ยนแปลงได้
