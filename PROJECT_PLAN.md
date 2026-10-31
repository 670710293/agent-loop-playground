# Agent Loop Playground — แผนโครงการ

**เอกสารสำหรับพัฒนา Live Demo บน GitHub Pages**  
**เวอร์ชัน:** v8 — Specialized Model Explorer

## 1. ทิศทางของโปรเจกต์

Agent Loop Playground เป็นเว็บสาธิตแนวคิดการแบ่งงานให้ AI Agent แต่ละตัวรับผิดชอบหน้าที่เฉพาะ เพื่อให้ผู้ใช้เห็นว่าการออกแบบ Workflow อาจสำคัญพอ ๆ กับการเลือกโมเดล

> **The right workflow can matter as much as the model itself.**  
> การออกแบบกระบวนการทำงานให้เหมาะสม อาจสำคัญพอ ๆ กับการเลือกโมเดล

Multi-Agent ไม่ได้ดีกว่า Single AI ในทุกสถานการณ์ โปรเจกต์ต้องอธิบายทั้งประโยชน์ ข้อจำกัด ความซับซ้อน เวลา และต้นทุนที่อาจเพิ่มขึ้น

## 2. ขอบเขตของ Live Demo

- มีหน้าหลักเพียง 2 หน้า: Learning Assistant และ Model Explorer
- หน้าแรกให้ผู้ใช้ทดลองส่งคำถาม ดู Workflow และรับชีทสรุป
- ส่วน Single AI vs Multi-Agent อยู่ใต้พื้นที่ถาม/ผลลัพธ์ในหน้าแรก
- มีลิงก์บน Navigation ให้เลื่อนลงไปยังส่วนเปรียบเทียบได้ทันที
- Model Explorer มี 6 หมวดเฉพาะทาง หมวดละ 2–3 รายการ
- ใช้ HTML, CSS และ Vanilla JavaScript
- เผยแพร่ด้วย GitHub Pages โดยไม่ต้องมีขั้นตอน Build
- ไม่มี Backend, Authentication หรือ API Key ใน Frontend

## 3. โครงสร้างเว็บไซต์

```text
Agent Loop Playground
│
├── 1. Learning Assistant (index.html)
│   ├── Hero / คำอธิบายโครงการ
│   ├── ช่องป้อนคำถามและตัวอย่างคำถาม
│   ├── สถานะ Agent Workflow
│   ├── ผลลัพธ์และ Learning Sheet
│   ├── แหล่งข้อมูลและรายละเอียดขั้นตอน
│   └── Single AI vs Multi-Agent (ส่วนล่างของหน้า)
│
└── 2. Model Explorer (models.html)
    ├── คำอธิบายวิธีเลือกโมเดล
    ├── 6 หมวดโมเดลเฉพาะทาง
    └── การ์ดโมเดล หมวดละ 2–3 รายการ
```

Navigation:
- **Learning Assistant** → `index.html`
- **Model Explorer** → `models.html`
- **ทำไมต้อง Multi-Agent?** → `index.html#approach-comparison`

ลิงก์เปรียบเทียบต้องเลื่อนลงไปยังเนื้อหา ไม่เปิด Popup หรือ Modal ที่บังช่องแชท

## 4. หน้าแรก — Learning Assistant

### เป้าหมาย
ให้ผู้ใช้เข้าใจทันทีว่าต้องพิมพ์คำถามตรงไหน และจะได้ผลลัพธ์อะไรกลับมา

### ส่วนประกอบและสถานะ
| ส่วน | หน้าที่ | สถานะ |
|---|---|---|
| Hero | ชื่อและคำอธิบายสั้น ๆ | LIVE |
| Prompt Input | รับหัวข้อหรือคำถาม | LIVE |
| Example Prompts | ตัวอย่างคำถามที่กดเลือกได้ | LIVE |
| Agent Workflow | แสดง Planner → Researcher → Analyst → Writer → Reviewer | LIVE — Rule-based |
| Learning Sheet | จัดเนื้อหาเป็นชีทสรุป | LIVE — Template/Rule-based |
| Sources | แสดงแหล่งข้อมูลที่เรียกใช้ | LIVE — Wikipedia |
| Process Details | ดูรายละเอียดการทำงานแต่ละขั้น | LIVE |
| Export | คัดลอกหรือดาวน์โหลด Markdown | LIVE |
| Single vs Multi | อธิบายข้อแตกต่างและกรณีใช้งาน | LIVE — เนื้อหาเชิงการศึกษา |

### ลำดับการทำงาน
1. ผู้ใช้พิมพ์คำถามหรือเลือกตัวอย่าง
2. Planner แยกหัวข้อและตรวจภาษา
3. Researcher เลือกแหล่งข้อมูลตามหมวดคำถามจาก public APIs หลายแห่ง
4. Analyst วิเคราะห์ข้อความด้วย JavaScript heuristics
5. Writer สร้างชีทสรุป
6. Reviewer ตรวจรูปแบบพื้นฐานก่อนแสดงผล
7. ผู้ใช้เปิดดูแหล่งอ้างอิง รายละเอียดขั้นตอน และดาวน์โหลดชีทได้

### Single AI vs Multi-Agent
วางไว้ใต้พื้นที่ถามและผลลัพธ์ในหน้าแรก เพื่อไม่ขัดจังหวะผู้ใช้ที่ต้องการทดลองระบบ

เปรียบเทียบอย่างเป็นกลาง:
- **Single AI:** เรียบง่าย เหมาะกับงานสั้นหรืองานตรงไปตรงมา
- **Multi-Agent:** แบ่งงานหลายขั้นตอนและตรวจแต่ละขั้นได้ แต่เพิ่มความซับซ้อน เวลา และต้นทุนได้

ห้ามกล่าวว่า Multi-Agent ชนะทุกกรณี และห้ามสร้างคะแนนความแม่นยำ ความเร็ว หรือต้นทุนที่ไม่ได้วัดจริง ปัจจุบันเป็นการอธิบายแนวคิด ไม่ใช่ Benchmark

## 5. หน้า Model Explorer — โมเดลเฉพาะทาง

### หลักการจัดหมวด
เปลี่ยนจากหมวดกว้างที่มีโมเดลแชททั่วไปซ้ำกัน มาเป็นหมวดที่อธิบายความเชี่ยวชาญหรือหน้าที่เฉพาะของโมเดล ผู้ใช้ควรตอบได้ว่า “โมเดลนี้เหมาะกับงานอะไร” ภายในเวลาไม่นาน

### 6 หมวดหลัก

1. **Coding & Software Engineering** — เขียนโค้ด เติมโค้ด แก้บั๊ก และทำความเข้าใจโปรเจกต์
   - ตัวอย่าง: Qwen3-Coder, DeepSeek-Coder, Codestral

2. **Image Generation & Editing** — สร้างภาพจากข้อความและแก้ไขภาพ
   - ตัวอย่าง: FLUX.2, GPT Image, Imagen

3. **Audio & Speech** — แปลงเสียงเป็นข้อความและสร้างเสียงพูด
   - ตัวอย่าง: Whisper, ElevenLabs Scribe, ElevenLabs Text to Speech

4. **Search & Research** — ตอบคำถามโดยเชื่อมกับการค้นเว็บและข้อมูลอ้างอิง
   - ตัวอย่าง: Perplexity Sonar, Gemini with Google Search Grounding, Grok with Web Search

5. **Embeddings & Reranking** — Semantic Search, การจัดอันดับผลค้นหา และระบบ RAG
   - ตัวอย่าง: Cohere Embed/Rerank, BGE-M3/BGE Reranker, OpenAI Embeddings

6. **Vision & Document Understanding** — อ่านภาพ เอกสาร OCR และดึงข้อมูลจากไฟล์
   - ตัวอย่าง: Qwen3-VL, Mistral OCR, PaddleOCR

### ข้อควรระวังในการจัดรายการ
- รายการเป็นตัวอย่างโมเดล/ตระกูลโมเดลเฉพาะทาง ไม่ใช่ Leaderboard
- บางรายการเป็น Model Family, บางรายการเป็น API Model หรือชุดเครื่องมือที่มีโมเดลอยู่เบื้องหลัง ต้องระบุประเภทให้เข้าใจ ไม่ทำให้ผู้ใช้เข้าใจว่าเป็นสิ่งเดียวกันทั้งหมด
- Search Grounding เป็นความสามารถที่เกิดจากโมเดลร่วมกับเครื่องมือค้นหา ไม่ใช่โมเดลค้นหาอิสระเสมอไป
- Embeddings, Reranking, OCR, Speech-to-Text และ Text-to-Speech เป็นงานคนละประเภท
- ควรใช้ชื่อรุ่นที่ตรวจสอบได้ และตรวจเอกสารทางการก่อนนำเสนอ
- ไม่ใส่ราคา Benchmark หรือความสามารถเชิงตัวเลขหากไม่มีแหล่งข้อมูลที่ยืนยันได้

### ข้อมูลในการ์ดโมเดล
- ชื่อโมเดล/ตระกูลโมเดล
- ผู้พัฒนา
- เหมาะกับงานอะไร
- จุดเด่น 2–3 ข้อ
- ข้อควรพิจารณา
- ประเภทการเข้าถึง เช่น Hosted API หรือ Open-weight
- ลิงก์เอกสารทางการ

ไม่จำเป็นต้องแสดง Technical Specification ทุกอย่างในการ์ดหลัก

## 6. โครงสร้างไฟล์

```text
agent-loop-playground/
├── index.html          # หน้า Learning Assistant และส่วนเปรียบเทียบ
├── models.html         # หน้า Model Explorer
├── agents.html         # เปลี่ยนเส้นทางลิงก์เก่าไปหน้า Model Explorer
├── style.css           # Design system และ Responsive layout
├── app.js              # UI และการทำงานหน้า Learning Assistant
├── tools.js            # Multi-source APIs และการวิเคราะห์ข้อความ
├── data.js             # ข้อมูล Agent และรายการโมเดล
├── models.js           # สร้างหมวดและการ์ด Model Explorer
├── README.md           # วิธีใช้งานและเผยแพร่
├── PROJECT_PLAN.md     # แผนโครงการ
├── PROJECT_STATUS.md   # สถานะและข้อจำกัด
└── docs/               # รายงาน Phase 0–5
```

ให้ตรวจสอบไฟล์เดิมก่อนย้ายหรือลบไฟล์ใด ๆ รักษา Script loading order และ Relative paths สำหรับ GitHub Pages

## 7. การระบุสถานะให้ตรงกับความจริง

- **LIVE:** ฟังก์ชันทำงานจริงใน Browser หรือเรียก API จริง เช่น Wikipedia Search, สร้างชีท, Export Markdown
- **DEMO:** การแสดง Workflow เพื่อสาธิตการแบ่งหน้าที่ โดยใช้ Rule-based JavaScript
- **PLANNED:** ฟีเจอร์อนาคต เช่น LLM Agent จริง, Backend, Login, Cloud Sync และการทดลอง Benchmark

ห้ามอธิบายว่า Agent ทั้ง 5 เป็น LLM อิสระที่ทำงานร่วมกัน เพราะเวอร์ชันนี้ยังไม่ใช่เช่นนั้น Reviewer ตรวจโครงสร้าง ไม่ได้ตรวจข้อเท็จจริงเชิงความหมาย

## 8. แผนพัฒนา Phase 0–5

### Phase 0 — ตรวจสอบและวางสถาปัตยกรรม
- ตรวจไฟล์และความสามารถเดิม
- ระบุส่วนหน้าตาและระบบที่ต้องรักษา
- วางแผนไฟล์ที่จะเก็บ แก้ เพิ่ม หรือลด
- ยังไม่แก้โค้ดจนกว่าจะอนุมัติแผน

### Phase 1 — โครงสร้างและ Navigation
- เหลือหน้าหลัก 2 หน้า
- เพิ่มหน้า Model Explorer
- ย้ายข้อมูล Agent มาอยู่ในหน้า Learning Assistant ตามความเหมาะสม
- ตรวจสอบลิงก์และ Relative paths

### Phase 2 — ปรับ Learning Assistant
- ปรับช่องถามและตัวอย่างคำถาม
- แสดง Workflow ตามลำดับที่โค้ดทำจริง
- จัดผลลัพธ์และชีทสรุปให้อ่านง่าย
- จัดการ API Error, No Result และ Network Failure
- ทดสอบ Copy/Download Markdown

### Phase 3 — Single AI vs Multi-Agent
- เพิ่มส่วนเปรียบเทียบใต้พื้นที่ถาม/ผลลัพธ์
- เพิ่ม Navigation Anchor
- เปรียบเทียบข้อดี ข้อจำกัด และกรณีใช้งาน
- ทำ Responsive สำหรับมือถือ
- ระบุว่าเป็นเนื้อหาเชิงแนวคิด ไม่ใช่ Benchmark

### Phase 4 — Specialized Model Explorer
- แสดง 6 หมวดเฉพาะทาง หมวดละ 2–3 รายการ
- กระจายประเภทงานให้แตกต่างกันจริง
- ใช้คำอธิบายสั้นและเข้าใจง่าย
- ใส่ลิงก์เอกสารทางการ
- ไม่แต่งราคา คะแนน หรือความสามารถที่ตรวจสอบไม่ได้

### Phase 5 — QA และเตรียมเผยแพร่
- ตรวจลิงก์และไฟล์ที่อ้างอิง
- ตรวจ Script loading order
- ทดสอบปุ่มและสถานะต่าง ๆ
- ทดสอบ Mobile/Desktop
- ตรวจ Console และ Network errors
- ตรวจการทำงานของ APIs แต่ละ provider (Wikipedia, GitHub, Crossref, PubMed, GDELT, World Bank)
- ตรวจว่าไม่มี API Key หรือ Secret ใน Repository
- อัปเดต README และ PROJECT_STATUS

## 9. เกณฑ์ตรวจรับก่อน Live Demo

- [ ] มีหน้าหลัก 2 หน้าและ Navigation ทำงาน
- [ ] รักษาเอกลักษณ์หน้าตาเดิม
- [ ] ส่งคำถามและเห็น Agent Workflow ได้
- [ ] แสดงแหล่งข้อมูลและข้อจำกัดตรงกับการทำงานจริง
- [ ] ดู Learning Sheet และ Source Link ได้
- [ ] Copy/Download Markdown ทำงาน
- [ ] Navigation เลื่อนไปส่วน Single AI vs Multi-Agent ได้
- [ ] ไม่กล่าวอ้างว่า Multi-Agent ดีกว่าทุกกรณี
- [ ] Model Explorer มี 6 หมวดเฉพาะทาง หมวดละ 2–3 รายการ
- [ ] การ์ดโมเดลมีคำอธิบายและลิงก์ทางการ
- [ ] Mobile Responsive
- [ ] GitHub Pages Deploy ได้โดยไม่ต้อง Build
- [ ] ไม่มี API Key หรือ Secret ใน Frontend

## 10. แนวทางต่อยอดในอนาคต

หลังจาก Live Demo ได้รับ Feedback แล้ว จึงค่อยพิจารณา:
- เชื่อม LLM ผ่าน Backend อย่างปลอดภัย
- เพิ่มแหล่งค้นคว้านอกเหนือจาก Wikipedia
- เพิ่ม Reviewer ที่ตรวจสอบ Claim กับแหล่งอ้างอิงจริง
- เพิ่มประวัติการสนทนาและ Contextual Follow-up
- ทดลอง Single AI vs Multi-Agent ด้วยชุดโจทย์และเกณฑ์ประเมินเดียวกัน
- เพิ่มหมวดโมเดลเมื่อมีเหตุผลและข้อมูลที่ตรวจสอบได้

**หลักการ:** ทำเวอร์ชัน Live Demo ให้กระชับ เข้าใจง่าย และซื่อสัตย์กับความสามารถจริงก่อน จากนั้นค่อยขยายตาม Feedback


## การปรับปรุง Learning Assistant v8.2
- เพิ่มตัวเลือกภาษาผลลัพธ์: ตรวจจับอัตโนมัติ / ภาษาไทย / English
- Researcher ค้นหลายคำค้น รวมผลลัพธ์แบบไม่ซ้ำ และบันทึกบทความที่ลองแล้ว
- Analyst จัดอันดับประโยคโดยใช้คำจากคำถามเป็นสัญญาณหลัก
- Reviewer ตรวจความเกี่ยวข้องของบทความและประเด็นสรุปกับคำถามต้นฉบับ
- เมื่อไม่ผ่านให้ย้อนกลับไป Researcher และข้ามบทความที่เคยลอง หากไม่มีแหล่งผ่านจะไม่ส่งชีทสรุป
- ข้อจำกัด: การตรวจเป็น heuristic จากการจับคู่คำ ไม่ใช่ semantic understanding หรือ fact-check โดย LLM


## v8.2 — Multi-Source Researcher (implemented, pending browser verification)
- Route topic categories to relevant public APIs: GitHub, Crossref, PubMed, GDELT, World Bank, Wikipedia.
- Deduplicate source URLs and skip attempted sources during one run.
- Retain the original question as the relevance target for Reviewer.
- Keep Thai queries on Thai Wikipedia; do not claim automatic translation of English API records.
- Future: add a backend search proxy, generic web search provider, semantic reranker/LLM, evidence-level citations and source quality scoring.


## สถานะที่ใช้แทนแผนภาษาเดิม (v8.3)
ตัวเลือกภาษาไทย/English/Auto ถูกนำออกแล้ว ระบบตรวจภาษาเบื้องหลังเพื่อสร้างคำค้นไทยและอังกฤษอัตโนมัติ และกำหนดผลลัพธ์เป็นภาษาไทยเสมอ โดยแปลหลักฐานอังกฤษผ่าน MyMemory ก่อน Writer เรียบเรียง ทั้งนี้บริการแปลและ Public API อาจไม่พร้อมใช้งาน จึงมี timeout และข้อความแจ้งข้อผิดพลาดแทนการปล่อยหน้าจอค้าง
