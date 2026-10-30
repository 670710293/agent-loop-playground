// ---------- เครื่องมือของ agent ----------
const TOOLS = {
  // เครื่องมือจริง: เรียก Wikipedia API (รองรับ CORS ด้วย origin=*)
  async search_wikipedia({ q, lang }) {
    const u = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json&origin=*`;
    const r = await fetch(u); if (!r.ok) throw new Error("HTTP " + r.status);
    return ((await r.json()).query?.search || []).map((x) => x.title);
  },
  async fetch_extract({ title, lang }) {
    const u = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&redirects=1&titles=${encodeURIComponent(title)}&format=json&origin=*`;
    const r = await fetch(u); if (!r.ok) throw new Error("HTTP " + r.status);
    const p = Object.values((await r.json()).query.pages)[0];
    return { title: p.title, text: p.extract || "", url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}` };
  },
  // ประมวลผลในเบราว์เซอร์: นับความถี่คำ เลือกประโยคสำคัญ ประมาณเวลาอ่าน
  analyze_text({ text }) {
    const th = /[\u0E00-\u0E7F]/.test(text);
    const chunks = text.split(/\n+/).flatMap((p) => p.split(/(?<=[.!?])\s+/)).map((s) => s.trim()).filter((s) => s.length > 30);
    const words = typeof Intl.Segmenter === "function"
      ? [...new Intl.Segmenter(th ? "th" : "en", { granularity: "word" }).segment(text)].filter((s) => s.isWordLike).map((s) => s.segment.toLowerCase())
      : text.toLowerCase().match(/\p{L}+/gu) || [];
    const stop = new Set("the and for with that this was are from his her has have its also which ที่ และ ของ ใน เป็น การ ความ ได้ จาก มี ซึ่ง โดย กับ หรือ".split(" "));
    const freq = {};
    words.filter((w) => w.length >= 3 && !stop.has(w) && !/^\d+$/.test(w)).forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    const keywords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map((e) => e[0]);
    const score = (s) => keywords.filter((k) => s.toLowerCase().includes(k)).length;
    const picks = chunks.slice(0, 12).map((s, i) => ({ s, i, sc: score(s) })).sort((a, b) => b.sc - a.sc || a.i - b.i).slice(0, 4).sort((a, b) => a.i - b.i)
      .map((x) => (x.s.length > 320 ? x.s.slice(0, 320) + "…" : x.s));
    return { keywords, points: picks, minutes: Math.max(1, Math.round(words.length / (th ? 250 : 200))), words: words.length };
  },
  // TODO (roadmap): llm_summarize({ text }) เรียก /api/summarize (serverless) เพื่อสรุปด้วย LLM แทนกฎด้านบน
};

