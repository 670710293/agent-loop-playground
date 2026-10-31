// Shared, static content for the Agent Loop demo.
// Model entries describe model families, not a live ranking or a specific SKU.
const AGENTS = [
  { id: "planner", name: "Planner", role: "เก็บคำถามและกำหนดแผน", duty: "เก็บคำถามต้นฉบับ แยกภาษา และเตรียมคำค้นโดยไม่ทิ้งเจตนาของคำถาม", sources: "ข้อความที่ผู้ใช้พิมพ์", steps: ["เก็บคำถามต้นฉบับไว้เป็นเกณฑ์ตรวจ", "เลือกภาษาไทยหรืออังกฤษ", "เตรียมคำค้นหลายรูปแบบ"], from: "ผู้ใช้", to: "Researcher", example: "คำถามเดิม + ภาษา + คำค้น" },
  { id: "researcher", name: "Researcher", role: "ค้นหาและคัดกรองแหล่งข้อมูล", duty: "เลือก API ตามหมวด เช่น GitHub, Crossref, PubMed, GDELT, World Bank หรือ Wikipedia ให้คะแนนความเกี่ยวข้อง และข้าม URL ที่เคยลองแล้ว", sources: "Topic-specific public APIs", steps: ["เลือกแหล่งตามหมวดและรวบรวมผลค้นหา", "คัดกรองชื่อและข้อความกับคำถาม", "เมื่อไม่ผ่านให้ลองแหล่งใหม่ที่ไม่ซ้ำ"], from: "Planner / Reviewer", to: "Analyst", example: "บทความที่ผ่านการคัดกรองเบื้องต้น" },
  { id: "analyst", name: "Analyst", role: "วิเคราะห์ข้อความตามคำถาม", duty: "จัดอันดับประโยคจากความเชื่อมโยงกับคำถามและคำสำคัญ", sources: "ข้อความจาก Researcher + คำถามเดิม", steps: ["แบ่งคำตามภาษา", "จัดอันดับประโยคโดยให้น้ำหนักคำจากคำถาม", "ส่งเฉพาะประเด็นที่มีความเกี่ยวข้อง"], from: "Researcher", to: "Writer", example: "คำสำคัญและประเด็นที่เกี่ยวข้อง" },
  { id: "writer", name: "Writer", role: "เรียบเรียงเป็นชีท", duty: "จัดข้อมูลที่ Analyst ส่งมาเป็นโครงสร้างชีทสรุป", sources: "ผลวิเคราะห์และ URL จาก Researcher", steps: ["จัดประเด็นหลักและคำสำคัญ", "สร้างคำถามทบทวนจากคำสำคัญ", "แนบแหล่งอ้างอิง"], from: "Analyst", to: "Reviewer", example: "ร่าง Learning Sheet ในรูปแบบ Markdown" },
  { id: "reviewer", name: "Reviewer", role: "ตรวจความตรงกับคำถาม", duty: "เปรียบเทียบคำถามต้นฉบับกับแหล่งข้อมูลและประเด็นสรุปด้วยเกณฑ์ความเกี่ยวข้องแบบ heuristic", sources: "คำถามเดิม + ร่างชีท + แหล่งอ้างอิง", steps: ["ตรวจว่าบทความเกี่ยวข้องกับคำถาม", "ตรวจว่าประเด็นสรุปครอบคลุมคำถาม", "ไม่ผ่านให้ย้อนกลับไปหาแหล่งใหม่ที่ไม่เคยลอง"], from: "Writer", to: "ผู้ใช้ / Researcher", example: "ผ่านแล้วส่ง หรือไม่ผ่านแล้ววนค้นใหม่" }
];

const MODEL_CATEGORIES = [
  {
    id: "coding",
    title: "Coding & Software Engineering",
    description: "โมเดลที่เน้นการเขียนโค้ด แก้บั๊ก ทำความเข้าใจ Repository และช่วยทำงานพัฒนาซอฟต์แวร์",
    models: [
      { name: "Qwen3-Coder", provider: "Alibaba / Qwen", fit: "เหมาะกับงานเขียนโค้ดแบบหลายขั้นตอน การแก้ไขโค้ด และงานที่ต้องเข้าใจบริบทของโปรเจกต์", strengths: ["ออกแบบมาเพื่องาน Coding และ Agentic Coding", "มีตัวเลือกโมเดลแบบ Open-weight ในตระกูล"], caveat: "ประสิทธิภาพและเงื่อนไขการใช้งานขึ้นกับรุ่นย่อย ควรตรวจ License และทดสอบกับงานจริง", url: "https://qwenlm.github.io/blog/qwen3-coder/", access: "Open-weight / Hosted options" },
      { name: "DeepSeek-Coder", provider: "DeepSeek", fit: "เหมาะกับการสร้างโค้ด เติมโค้ด อธิบายโค้ด และงานเขียนโปรแกรม", strengths: ["มีตระกูลโมเดลที่พัฒนามาเพื่องาน Coding โดยตรง", "มีโครงการ Open-weight ให้ศึกษาและนำไปทดลอง"], caveat: "ตรวจรุ่นและสถานะการดูแลของแต่ละ checkpoint ก่อนเลือกใช้ในโปรเจกต์", url: "https://github.com/deepseek-ai/DeepSeek-Coder-V2", access: "Open-weight / API options" },
      { name: "Codestral", provider: "Mistral AI", fit: "เหมาะกับงานสร้างและเติมโค้ด โดยเฉพาะ workflow ที่ใช้ Code Completion", strengths: ["เป็นโมเดลที่เน้นงานเขียนโปรแกรม", "มีเอกสารสำหรับการใช้งานผ่าน API"], caveat: "เงื่อนไข License และการเข้าถึงอาจแตกต่างกันตามรุ่นและช่องทาง", url: "https://docs.mistral.ai/capabilities/code_generation/", access: "Hosted API / รุ่นที่มีเงื่อนไขเฉพาะ" }
    ]
  },
  {
    id: "image-generation",
    title: "Image Generation & Editing",
    description: "โมเดลสร้างภาพจากข้อความ แก้ไขภาพ และสร้างภาพโดยอ้างอิงภาพต้นฉบับ",
    models: [
      { name: "FLUX.2", provider: "Black Forest Labs", fit: "เหมาะกับการสร้างภาพและงานแก้ไขภาพที่ต้องควบคุมรายละเอียด", strengths: ["เป็นตระกูลโมเดลที่เน้น Image Generation", "มีเอกสารแยกสำหรับการสร้างและแก้ไขภาพ"], caveat: "รุ่นย่อยและช่องทางให้บริการอาจมีข้อจำกัดต่างกัน ตรวจ License ก่อนใช้งานเชิงพาณิชย์", url: "https://docs.bfl.ai/flux_2/overview", access: "API / รุ่น Open-weight บางรายการ" },
      { name: "GPT Image", provider: "OpenAI", fit: "เหมาะกับการสร้างภาพจากคำสั่งภาษาและการแก้ไขภาพผ่าน API", strengths: ["รองรับการสร้างภาพและงานแก้ไขตามความสามารถของรุ่น", "มีคู่มือ API และตัวอย่างการใช้งาน"], caveat: "ตรวจรุ่นที่เปิดให้ใช้ ข้อจำกัดการสร้างภาพ และนโยบายเนื้อหาก่อนใช้งาน", url: "https://platform.openai.com/docs/guides/image-generation", access: "Hosted API" },
      { name: "Imagen", provider: "Google", fit: "เหมาะกับการสร้างภาพจากข้อความผ่านบริการของ Google Cloud", strengths: ["เป็นตระกูลโมเดลสร้างภาพโดยเฉพาะ", "มีเอกสารการใช้งานผ่าน Vertex AI"], caveat: "รุ่นที่ให้บริการ ภูมิภาค และสิทธิ์เข้าถึงอาจแตกต่างกัน", url: "https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview", access: "Hosted API / Cloud service" }
    ]
  },
  {
    id: "audio",
    title: "Audio & Speech",
    description: "โมเดลแปลงเสียงเป็นข้อความ (Speech-to-Text) และสร้างเสียงพูด (Text-to-Speech)",
    models: [
      { name: "Whisper", provider: "OpenAI", fit: "เหมาะกับการถอดเสียงพูดเป็นข้อความและงานรู้จำเสียง", strengths: ["เป็นโมเดล Speech Recognition โดยเฉพาะ", "มีโครงการ Open-source ให้ติดตั้งและทดลอง"], caveat: "คุณภาพขึ้นกับภาษา สำเนียง เสียงรบกวน และการตั้งค่าการถอดเสียง", url: "https://github.com/openai/whisper", access: "Open-source" },
      { name: "Scribe", provider: "ElevenLabs", fit: "เหมาะกับการถอดเสียงและแปลงเสียงพูดเป็นข้อความ", strengths: ["ออกแบบมาสำหรับ Speech-to-Text", "มีเอกสาร API และความสามารถด้านการถอดเสียง"], caveat: "ตรวจภาษาที่รองรับ ราคา และข้อจำกัดการใช้งานในเอกสารปัจจุบัน", url: "https://elevenlabs.io/docs/models/speech-to-text", access: "Hosted API" },
      { name: "ElevenLabs Text to Speech", provider: "ElevenLabs", fit: "เหมาะกับการสร้างเสียงพูดจากข้อความและงาน Voice Generation", strengths: ["เน้นการสังเคราะห์เสียงพูด", "มีตัวเลือกเสียงและการตั้งค่าตามบริการ"], caveat: "เสียงที่ได้และสิทธิ์นำไปใช้ขึ้นกับ Voice, Plan และเงื่อนไขของบริการ", url: "https://elevenlabs.io/docs/models", access: "Hosted API" }
    ]
  },
  {
    id: "search-research",
    title: "Search & Research",
    description: "โมเดลหรือบริการที่ออกแบบให้ตอบคำถามโดยเชื่อมโยงกับการค้นเว็บและข้อมูลอ้างอิง",
    models: [
      { name: "Sonar", provider: "Perplexity", fit: "เหมาะกับคำถามที่ต้องค้นข้อมูลเว็บและสังเคราะห์คำตอบพร้อมแหล่งอ้างอิง", strengths: ["ออกแบบมาสำหรับงานตอบคำถามที่เชื่อมกับการค้นหา", "มี API และเอกสารอธิบายตระกูลโมเดล"], caveat: "การอ้างอิงไม่ได้รับประกันว่าทุกข้อความถูกต้อง ควรเปิดตรวจแหล่งต้นทาง", url: "https://docs.perplexity.ai/guides/model-cards", access: "Hosted API" },
      { name: "Gemini with Google Search Grounding", provider: "Google", fit: "เหมาะกับงานถามตอบที่ต้องใช้ข้อมูลเว็บประกอบผ่าน Search Grounding", strengths: ["เชื่อมการตอบของโมเดลกับผลค้นหาจาก Google Search ได้ในรุ่นที่รองรับ", "มีเอกสารอธิบายการเปิดใช้ Grounding"], caveat: "เป็นความสามารถของโมเดลร่วมกับเครื่องมือค้นหา ไม่ใช่โมเดลค้นหาอิสระทุกกรณี", url: "https://ai.google.dev/gemini-api/docs/google-search", access: "Hosted API / feature availability varies" },
      { name: "Grok with Web Search", provider: "xAI", fit: "เหมาะกับ workflow ที่ต้องให้โมเดลค้นเว็บเพื่อประกอบคำตอบ", strengths: ["มีเครื่องมือค้นหาให้เรียกใช้ใน API ตามรุ่นที่รองรับ", "เหมาะกับการทดลอง agent ที่ใช้ข้อมูลเว็บ"], caveat: "ความสามารถค้นหาเป็นเครื่องมือประกอบการเรียกโมเดล ควรตรวจแหล่งอ้างอิงเอง", url: "https://docs.x.ai/docs/guides/tools/search-tools", access: "Hosted API / tool-dependent" }
    ]
  },
  {
    id: "embeddings-reranking",
    title: "Embeddings & Reranking",
    description: "โมเดลเบื้องหลัง Semantic Search และ RAG ใช้แปลงข้อความเป็นเวกเตอร์หรือจัดอันดับผลค้นหา",
    models: [
      { name: "Embed + Rerank", provider: "Cohere", fit: "เหมาะกับระบบค้นคืนเอกสาร โดยใช้ Embeddings ค้นหาผู้สมัครและ Rerank จัดลำดับใหม่", strengths: ["มีโมเดลเฉพาะสำหรับ Embedding และ Reranking", "มีเอกสารสำหรับประกอบระบบ Retrieval/RAG"], caveat: "Embedding และ Reranking ทำหน้าที่ต่างกัน ต้องเลือกให้ตรงขั้นตอนของระบบ", url: "https://docs.cohere.com/docs/models", access: "Hosted API" },
      { name: "BGE-M3 & BGE Reranker", provider: "BAAI / FlagEmbedding", fit: "เหมาะกับผู้พัฒนาที่ต้องการทดลอง Semantic Retrieval และ Reranking ด้วยโมเดล Open-weight", strengths: ["มีโมเดล Embedding และ Reranker ใน ecosystem เดียวกัน", "สามารถนำไปทดลองติดตั้งในระบบของตนเองได้"], caveat: "ต้องประเมินคุณภาพกับชุดข้อมูลและภาษาที่ใช้งานจริง รวมถึงทรัพยากรเครื่อง", url: "https://huggingface.co/BAAI/bge-m3", access: "Open-weight" },
      { name: "Embedding Models", provider: "OpenAI", fit: "เหมาะกับการแปลงข้อความเป็นเวกเตอร์เพื่อใช้ค้นหาความหมายและจัดกลุ่ม", strengths: ["มี API สำหรับสร้าง Embeddings", "นำไปใช้เป็นส่วนหนึ่งของ Semantic Search และ RAG ได้"], caveat: "เป็นโมเดล Embedding ไม่ใช่โมเดลสร้างคำตอบหรือ Reranker โดยตรง", url: "https://platform.openai.com/docs/guides/embeddings", access: "Hosted API" }
    ]
  },
  {
    id: "vision-documents",
    title: "Vision & Document Understanding",
    description: "โมเดลอ่านภาพ เอกสาร ตาราง และดึงข้อมูลจากเนื้อหาที่ไม่ใช่ข้อความธรรมดา",
    models: [
      { name: "Qwen3-VL", provider: "Alibaba / Qwen", fit: "เหมาะกับการทำความเข้าใจภาพและข้อมูลภาพร่วมกับข้อความ", strengths: ["เป็นตระกูล Vision-Language โดยเฉพาะ", "มีตัวเลือกและเอกสารสำหรับนักพัฒนา"], caveat: "ความสามารถด้านภาพและวิดีโอขึ้นกับรุ่นย่อยและวิธี deploy", url: "https://qwenlm.github.io/blog/qwen3-vl/", access: "Open-weight / Hosted options" },
      { name: "Mistral OCR", provider: "Mistral AI", fit: "เหมาะกับการดึงข้อความและโครงสร้างจากเอกสาร เช่น PDF", strengths: ["เน้นงาน OCR และ Document Processing", "มี API สำหรับประมวลผลเอกสาร"], caveat: "ควรตรวจผล OCR กับเอกสารจริง โดยเฉพาะตาราง ภาษาไทย และเอกสารสแกนคุณภาพต่ำ", url: "https://docs.mistral.ai/capabilities/document/", access: "Hosted API" },
      { name: "PaddleOCR", provider: "PaddlePaddle", fit: "เหมาะกับงาน OCR และการดึงข้อความจากภาพหรือเอกสารในระบบที่ต้องการติดตั้งเอง", strengths: ["เป็นชุดเครื่องมือ OCR ที่มีโมเดลหลายแบบ", "มีโครงการ Open-source และเอกสารการใช้งาน"], caveat: "เป็น ecosystem ของ OCR ไม่ใช่โมเดลเดียว ต้องเลือก pipeline และภาษาที่รองรับ", url: "https://github.com/PaddlePaddle/PaddleOCR", access: "Open-source" }
    ]
  }
];
