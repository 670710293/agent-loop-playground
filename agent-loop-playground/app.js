const SCENARIOS = [
  {
    id: "weather", label: "อากาศวันนี้",
    task: "ตอนนี้ที่กรุงเทพอากาศเป็นยังไง ควรพกร่มไหม",
    bot: "ฉันไม่มีข้อมูลอากาศแบบเรียลไทม์ โดยทั่วไปกรุงเทพมักมีฝนตกช่วงบ่าย แนะนำให้พกร่มไว้ก่อน",
    steps: [
      ["think", "ต้องรู้อากาศตอนนี้จริงๆ เดาจากความจำไม่ได้ ควรเรียกเครื่องมืออากาศ"],
      ["tool", "get_weather", '{ "city": "Bangkok" }'],
      ["observe", "32°C, ความชื้น 78%, โอกาสฝน 70% ช่วง 15:00–18:00"],
      ["think", "โอกาสฝนสูงในช่วงบ่าย ข้อมูลพอตอบแล้ว"],
      ["answer", "ตอนนี้ 32°C และมีโอกาสฝน 70% ช่วงบ่ายถึงเย็น ควรพกร่มครับ"]
    ]
  },
  {
    id: "research", label: "สรุปจากเอกสาร",
    task: "สรุป 3 ข้อเด่นของ Next.js จากเอกสารทางการ",
    bot: "Next.js เด่นเรื่อง routing, SSR และการเพิ่มประสิทธิภาพ แต่ข้อมูลของฉันอาจไม่ใช่เวอร์ชันล่าสุด",
    steps: [
      ["think", "เอกสารอัปเดตบ่อย ควรค้นก่อนแล้วค่อยสรุป"],
      ["tool", "web_search", '{ "query": "Next.js documentation features" }'],
      ["observe", "พบหน้า docs อย่างเป็นทางการ 1 หน้า และบทความอื่นอีก 4 หน้า"],
      ["think", "เลือกหน้า docs ทางการ แล้วอ่านเนื้อหา"],
      ["tool", "read_page", '{ "url": "nextjs.org/docs" }'],
      ["observe", "เนื้อหาพูดถึง App Router, Server Components, การ optimize รูปและฟอนต์"],
      ["answer", "3 ข้อเด่นตามเอกสาร: 1) App Router 2) Server Components 3) การ optimize รูปและฟอนต์ในตัว"]
    ]
  },
  {
    id: "budget", label: "คำนวณงบทริป",
    task: "ทริปเชียงใหม่ 3 วัน งบ 6,000 บาท พอไหม",
    bot: "6,000 บาทน่าจะพอถ้าประหยัด แต่ขึ้นกับที่พักและการเดินทาง",
    steps: [
      ["think", "ต้องหาราคาจริงของที่พัก ค่ากิน ค่าเดินทาง แล้วรวมเลข"],
      ["tool", "search_prices", '{ "city": "Chiang Mai", "nights": 2 }'],
      ["observe", "ที่พัก 600/คืน, ค่ากิน 350/วัน, รถเช่า 400/วัน"],
      ["tool", "calculator", '{ "expr": "600*2 + 350*3 + 400*3" }'],
      ["observe", "3450"],
      ["think", "3,450 น้อยกว่า 6,000 เหลือราว 2,550 บาท"],
      ["answer", "พอครับ ประมาณ 3,450 บาท เหลืออีก 2,550 บาทสำหรับค่าเข้าชมและของฝาก"]
    ]
  }
];

const LABEL = { think: "คิด", tool: "เรียกเครื่องมือ", observe: "ดูผลลัพธ์", answer: "ตอบ" };
const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
let current = SCENARIOS[0], token = 0;

function select(s) {
  current = s; token++;
  $("task").textContent = s.task;
  $("bot").textContent = ""; $("trace").textContent = ""; $("round").textContent = "";
  $("run").disabled = false;
  document.querySelectorAll(".chip").forEach((c) =>
    c.setAttribute("aria-checked", String(c.dataset.id === s.id)));
}

function stepEl([type, text, args]) {
  const li = document.createElement("li");
  li.className = "step " + type;
  const b = document.createElement("b"); b.textContent = LABEL[type];
  const p = document.createElement("p");
  p.textContent = type === "tool" ? text + "()" : text;
  li.append(b, p);
  if (args) { const c = document.createElement("code"); c.textContent = args; li.append(c); }
  return li;
}

async function run() {
  const my = ++token, s = current;
  $("run").disabled = true;
  $("bot").textContent = ""; $("trace").textContent = ""; $("round").textContent = "";
  await wait(400);
  if (my !== token) return;
  $("bot").textContent = s.bot;
  let round = 0;
  for (const st of s.steps) {
    await wait(1000);
    if (my !== token) return;
    if (st[0] === "think") $("round").textContent = "รอบที่ " + ++round;
    $("trace").append(stepEl(st));
  }
  $("run").disabled = false;
  $("run").textContent = "รันอีกครั้ง";
}

SCENARIOS.forEach((s) => {
  const b = document.createElement("button");
  b.className = "chip"; b.type = "button"; b.dataset.id = s.id;
  b.setAttribute("role", "radio"); b.textContent = s.label;
  b.onclick = () => { $("run").textContent = "รันโจทย์นี้"; select(s); };
  $("chips").append(b);
});
$("run").onclick = run;
select(SCENARIOS[0]);
