// External data access and deterministic in-browser text analysis.
const TOOLS = {
  async search_wikipedia({ q, lang }) {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json&origin=*`;
    const response = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined });
    if (!response.ok) throw new Error(`Wikipedia search failed (HTTP ${response.status})`);
    const data = await response.json();
    return (data.query?.search || []).map((item) => item.title);
  },
  async fetch_extract({ title, lang }) {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&redirects=1&titles=${encodeURIComponent(title)}&format=json&origin=*`;
    const response = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined });
    if (!response.ok) throw new Error(`Wikipedia extract failed (HTTP ${response.status})`);
    const data = await response.json();
    const page = Object.values(data.query?.pages || {})[0];
    if (!page || page.missing !== undefined || !page.extract) throw new Error("บทความนี้ไม่มีเนื้อหาบทนำให้ดึง");
    return { title: page.title, text: page.extract, url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}` };
  },
  analyze_text({ text }) {
    const thai = /[\u0E00-\u0E7F]/.test(text);
    const segments = typeof Intl.Segmenter === "function"
      ? [...new Intl.Segmenter(thai ? "th" : "en", { granularity: "word" }).segment(text)].filter((s) => s.isWordLike).map((s) => s.segment.toLowerCase())
      : (text.toLowerCase().match(/[a-zA-Zก-๙]+/g) || []);
    const stop = new Set("the and for with that this was are from his her has have its also which ที่ และ ของ ใน เป็น การ ความ ได้ จาก มี ซึ่ง โดย กับ หรือ แล้ว คือ".split(" "));
    const frequencies = new Map();
    for (const word of segments) {
      if (word.length >= 2 && !stop.has(word) && !/^\d+$/.test(word)) frequencies.set(word, (frequencies.get(word) || 0) + 1);
    }
    const keywords = [...frequencies.entries()].sort((a,b) => b[1]-a[1]).slice(0,6).map(([word]) => word);
    const sentences = text.split(/\n+/).flatMap((p) => p.split(/(?<=[.!?。])\s+/)).map((s) => s.trim()).filter((s) => s.length > 35);
    const score = (sentence) => keywords.reduce((sum, word) => sum + (sentence.toLowerCase().includes(word) ? 1 : 0), 0);
    const points = sentences.map((sentence, index) => ({ sentence, index, score: score(sentence) }))
      .sort((a,b) => b.score-a.score || a.index-b.index).slice(0,5).sort((a,b) => a.index-b.index)
      .map(({sentence}) => sentence.length > 360 ? sentence.slice(0,357) + "..." : sentence);
    return { keywords, points, minutes: Math.max(1, Math.round(segments.length / (thai ? 250 : 200))), words: segments.length };
  }
};
