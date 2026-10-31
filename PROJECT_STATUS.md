# สถานะการพัฒนา — Agent Loop Playground v8.3

## Product direction
- [x] Learning Assistant + Model Explorer
- [x] HTML/CSS/Vanilla JavaScript และ GitHub Pages
- [x] ไม่มี API key ฝั่ง Frontend
- [x] แสดงข้อจำกัดของ Demo อย่างตรงไปตรงมา

## v8.3 — Bilingual Research, Thai-first Output, Reliability
- [x] นำตัวเลือกภาษาออก ผู้ใช้ไม่ต้องเลือกภาษาเอง
- [x] ตรวจภาษาคำถามและสร้างคำค้นอีกภาษาผ่านบริการแปลเมื่อใช้งานได้
- [x] ค้น Wikipedia ภาษาไทยและอังกฤษ และ DuckDuckGo Instant Answer ทั้งสองภาษา
- [x] เพิ่ม OpenAlex สำหรับงานวิจัย และดึง Abstract จาก PubMed EFetch เมื่อมี
- [x] แยกแหล่งที่เป็นเนื้อหาจริงออกจาก Metadata-only; Metadata ไม่ถูกนำไปเขียนเป็นคำตอบ
- [x] รวมประเด็นจากแหล่งที่ผ่านเกณฑ์ได้สูงสุด 3 แหล่ง และตัดข้อความซ้ำ
- [x] แปลข้อความอังกฤษเป็นไทยก่อนแสดงผล โดยไม่ปล่อยข้อความอังกฤษปะปนเมื่อแปลไม่สำเร็จ
- [x] เอา Keyword cloud และคำถามทบทวนที่สร้างจากคำถี่ออก
- [x] Self-review ใช้คำถามที่อิงคำถามต้นฉบับและหลักฐานในสรุป
- [x] เพิ่ม timeout, provider-level error isolation และข้อความแจ้งเมื่อค้นหา/แปลไม่สำเร็จ
- [x] ปลดล็อกปุ่มส่งใน finally แม้การค้นหาล้มเหลวหรือหมดเวลา

## Search sources
| แหล่ง | การใช้งาน | ข้อจำกัด |
|---|---|---|
| Wikipedia TH/EN | ค้นบทความและดึง extract | เป็นสารานุกรม; ไม่เหมาะแทนเอกสารทางการทุกหัวข้อ |
| DuckDuckGo Instant Answer | คำตอบ/Related Topics แบบเบา ๆ | ไม่ใช่ full web search; ผลลัพธ์อาจว่าง |
| GitHub | ค้น repository | ใช้ Metadata เป็นบริบทเท่านั้น ไม่ใช้เป็นหลักฐานสรุป |
| Crossref | ค้น metadata และ abstract ถ้ามี | Abstract อาจไม่มี; metadata ไม่เท่ากับ peer review |
| OpenAlex | ค้นงานวิจัยและ abstract เมื่อมี | abstract อาจไม่มี; ต้องตรวจแหล่งตีพิมพ์ |
| PubMed / NCBI | ค้นบทความและดึง abstract ผ่าน EFetch | ไม่ใช่คำแนะนำทางการแพทย์ |
| GDELT | ค้นดัชนีข่าว | เป็น metadata/index เท่านั้น ไม่ใช้เป็นหลักฐานสรุป |
| World Bank | ค้นตัวชี้วัดและคำอธิบาย | ยังไม่ได้ดึง time series/ค่าตัวเลขมาสรุป |

## QA performed in this package
- [ ] Browser live test of external APIs, translation, CORS and rate limits
- [ ] GitHub Pages deployment test
- [ ] Desktop/mobile visual test
- [ ] Manual test of all sample questions against real sources
- [ ] `node --check` and static HTML reference check (pending final run)

## Known limitations
- Agent roles are deterministic JavaScript workflow steps, not independent LLM agents.
- MyMemory is an external translation service; it may be unavailable, rate-limited, blocked by CORS, or mistranslate technical terms.
- DuckDuckGo Instant Answer is not a full web search engine. This version does not yet have a comprehensive web-search API.
- Research relevance uses lexical overlap against translated queries. It is not semantic relevance ranking and can miss synonyms/context.
- Reviewer checks output structure, deduplication, and source URLs; it does not fact-check claims or understand meaning like an LLM.
- Public APIs may fail due to CORS, rate limits, network conditions, or provider policy changes.
- A timeout produces an explicit message and re-enables the submit button; it cannot guarantee a successful answer when all providers fail.
- No backend, secret vault, LLM provider, semantic reranker, or persistent conversation history.

## Release checklist
1. Run `node --check` for `app.js`, `tools.js`, `data.js`, and `models.js`.
2. Check local HTML references and absence of obsolete language selector references.
3. Test live API and translation behavior in a real browser.
4. Test no-result, timeout, translation-failure, copy/download, and responsive states.
5. Deploy only after the checks above; this package has not been deployed.
