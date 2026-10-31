// Multi-source research adapters. All requests are browser-side, public endpoints; no API keys.
// Availability and CORS policies can vary by provider/network. This is a heuristic demo, not an LLM.
const TOOLS = {
  async getJSON(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  tokenize(text, lang) {
    const value = String(text || "").toLocaleLowerCase();
    if (typeof Intl.Segmenter === "function") return [...new Intl.Segmenter(lang === "th" ? "th" : "en", { granularity: "word" }).segment(value)].filter(p => p.isWordLike).map(p => p.segment);
    return value.match(/[a-z0-9ก-๙]+/g) || [];
  },
  questionTerms(question, lang) {
    const stop = new Set(lang === "th"
      ? "อะไร อย่างไร ทำไม คือ ที่ เป็น ของ ใน และ กับ ให้ หน่อย ช่วย ขอ สรุป อธิบาย เกี่ยวกับ เรื่อง เพราะว่า ได้ไหม อย่างไรบ้าง ถึง วิธี ความหมาย ช่วยที".split(" ")
      : "what why how explain describe summarize about the a an is are was were do does did to of in on for with and or please tell me difference between compare latest news".split(" "));
    return [...new Set(this.tokenize(question, lang).filter(w => w.length > 1 && !stop.has(w) && !/^\d+$/.test(w)))];
  },
  classify(question) {
    const q = question.toLowerCase();
    if (/pubmed|medical|health|disease|symptom|ยา|สุขภาพ|โรค|อาการ|การรักษา|โภชนาการ/.test(q)) return "health";
    if (/research|paper|study|scientific|science|วิจัย|งานวิจัย|วิทยาศาสตร์|การทดลอง/.test(q)) return "science";
    if (/news|latest|today|breaking|ข่าว|ล่าสุด|วันนี้|เหตุการณ์/.test(q)) return "news";
    if (/gdp|inflation|econom|unemployment|population|statistic|เศรษฐกิจ|เงินเฟ้อ|จีดีพี|ประชากร|สถิติ/.test(q)) return "economy";
    if (/code|coding|program|javascript|python|java|c\+\+|html|css|api|github|algorithm|โค้ด|เขียนโปรแกรม|ภาษาโปรแกรม|อัลกอริทึม/.test(q)) return "programming";
    if (/history|historical|war|สงคราม|ประวัติศาสตร์|ประวัติ/.test(q)) return "history";
    return "general";
  },
  searchQueries(question, lang) {
    const terms = this.questionTerms(question, lang);
    const cleaned = question.replace(/[?？!！]/g, " ").replace(/\s+/g, " ").trim();
    return [...new Set([cleaned, terms.slice(0, 6).join(" ")].filter(q => q && q.length >= 2))];
  },
  relevance({ question, title, text, lang }) {
    const terms = this.questionTerms(question, lang);
    if (!terms.length) return { score: 0, matched: [], coverage: 0, terms };
    const titleTokens = new Set(this.tokenize(title, lang));
    const bodyTokens = new Set(this.tokenize(String(text || "").slice(0, 12000), lang));
    const matched = terms.filter(term => titleTokens.has(term) || bodyTokens.has(term));
    const titleMatches = terms.filter(term => titleTokens.has(term)).length;
    const coverage = matched.length / terms.length;
    return { score: Math.min(1, coverage * .65 + titleMatches / terms.length * .35), matched, coverage, titleMatches, terms };
  },
  async wikipediaSearch(q, lang) {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=6&format=json&origin=*`;
    const data = await this.getJSON(url);
    const rows = data.query?.search || [];
    const out = [];
    for (const row of rows.slice(0, 5)) {
      try {
        const pageUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=9000&redirects=1&titles=${encodeURIComponent(row.title)}&format=json&origin=*`;
        const detail = await this.getJSON(pageUrl);
        const page = Object.values(detail.query?.pages || {})[0];
        if (page?.extract) out.push({ title: page.title, text: page.extract, url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`, provider: `Wikipedia (${lang})`, type: "encyclopedia", lang });
      } catch { /* try remaining results */ }
    }
    return out;
  },
  async githubSearch(q) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=6`;
    const data = await this.getJSON(url);
    return (data.items || []).map(x => ({ title: x.full_name, text: `${x.description || "No repository description."}\nPrimary language: ${x.language || "Not specified"}. Stars: ${x.stargazers_count}. Topics: ${(x.topics || []).join(", ")}`, url: x.html_url, provider: "GitHub repository search", type: "community repository", lang: "en" }));
  },
  async crossrefSearch(q) {
    const url = `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(q)}&rows=6&select=title,author,published,abstract,URL,DOI,type`;
    const data = await this.getJSON(url);
    return (data.message?.items || []).map(x => ({ title: (x.title || ["Untitled research work"])[0], text: `${x.abstract || "Abstract not supplied by Crossref."} Publication year: ${x.published?.["date-parts"]?.[0]?.[0] || "Unknown"}. Type: ${x.type || "Unknown"}.`, url: x.URL || (x.DOI ? `https://doi.org/${x.DOI}` : "https://search.crossref.org/"), provider: "Crossref metadata", type: "research metadata", lang: "en" }));
  },
  async pubmedSearch(q) {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=5&term=${encodeURIComponent(q)}`;
    const search = await this.getJSON(searchUrl);
    const ids = search.esearchresult?.idlist || [];
    if (!ids.length) return [];
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`;
    const summary = await this.getJSON(summaryUrl);
    return ids.map(id => summary.result?.[id]).filter(Boolean).map(x => ({ title: x.title || "PubMed record", text: `${x.title || ""}. Journal: ${x.fulljournalname || "Unknown"}. Publication date: ${x.pubdate || "Unknown"}. Article type: ${(x.pubtype || []).join(", ")}. Abstract text may require opening the PubMed record.`, url: `https://pubmed.ncbi.nlm.nih.gov/${x.uid || x.id}/`, provider: "PubMed / NCBI", type: "biomedical record", lang: "en" }));
  },
  async gdeltSearch(q) {
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=ArtList&format=json&maxrecords=8&sort=HybridRel`;
    const data = await this.getJSON(url);
    return (data.articles || []).map(x => ({ title: x.title || "News article", text: `${x.title || ""}. Source: ${x.domain || "Unknown"}. Published: ${x.seendate || "Unknown"}. Language: ${x.language || "Unknown"}.`, url: x.url, provider: `GDELT news index · ${x.domain || "publisher unknown"}`, type: "news index result", lang: "en" }));
  },
  async worldBankSearch(q) {
    const url = `https://api.worldbank.org/v2/indicator?format=json&per_page=100&source=2`;
    const data = await this.getJSON(url);
    const terms = q.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const rows = (data[1] || []).map(x => ({ x, score: terms.filter(t => `${x.name} ${x.sourceNote || ""}`.toLowerCase().includes(t)).length })).filter(x => x.score > 0).sort((a,b) => b.score-a.score).slice(0, 6);
    return rows.map(({x}) => ({ title: x.name, text: `${x.name}. ${x.sourceNote || "World Bank indicator; consult the indicator page for definition and methodology."} Unit: ${x.unit || "Not specified"}.`, url: `https://data.worldbank.org/indicator/${x.id}`, provider: "World Bank Open Data", type: "official statistical indicator", lang: "en" }));
  },
  async searchSources({ question, lang }) {
    const category = this.classify(question);
    const queries = this.searchQueries(question, lang);
    const q = queries[0] || question;
    const attempts = [];
    const jobs = [];
    if (lang === "th") jobs.push([`Wikipedia ภาษาไทย`, () => this.wikipediaSearch(q, "th")]);
    if (category === "programming") jobs.push(["GitHub", () => this.githubSearch(q)]);
    if (category === "science") jobs.push(["Crossref", () => this.crossrefSearch(q)]);
    if (category === "health") jobs.push(["PubMed", () => this.pubmedSearch(q)]);
    if (category === "news") jobs.push(["GDELT", () => this.gdeltSearch(q)]);
    if (category === "economy") jobs.push(["World Bank", () => this.worldBankSearch(q)]);
    if (lang === "en" || category === "general" || category === "history" || !jobs.length) jobs.push([`Wikipedia ${lang}`, () => this.wikipediaSearch(q, lang)]);
    // Add a second query only for the primary provider, and keep provider/source URLs unique.
    const results = await Promise.all(jobs.map(async ([name, fn]) => {
      try { const rows = await fn(); attempts.push({ name, ok: true, count: rows.length }); return rows; }
      catch (error) { attempts.push({ name, ok: false, error: error.message }); return []; }
    }));
    const seen = new Set();
    const candidates = results.flat().filter(item => {
      const key = String(item.url || "").replace(/\/$/, "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key); return true;
    });
    return { category, queries, attempts, candidates };
  },
  analyze_text({ text, question, lang }) {
    const stop = new Set(lang === "th"
      ? "อะไร อย่างไร ทำไม คือ ที่ เป็น ของ ใน และ กับ ให้ หน่อย ช่วย ขอ สรุป อธิบาย เกี่ยวกับ เรื่อง จาก มี ได้ ซึ่ง โดย หรือ แล้ว".split(" ")
      : "the and for with that this was are from his her has have its also which a an is are to of in on by as it be".split(" "));
    const segments = this.tokenize(text, lang);
    const frequencies = new Map();
    for (const word of segments) if (word.length > 1 && !stop.has(word) && !/^\d+$/.test(word)) frequencies.set(word, (frequencies.get(word) || 0) + 1);
    const keywords = [...frequencies.entries()].sort((a,b) => b[1]-a[1]).slice(0,7).map(([word]) => word);
    const sentences = String(text).replace(/\n+/g, " ").split(/(?<=[.!?。！？])\s+/).map(s => s.trim()).filter(s => s.length > 25);
    const terms = this.questionTerms(question, lang);
    const ranked = sentences.map((sentence,index) => { const tokens = new Set(this.tokenize(sentence, lang)); return { sentence,index,score: terms.filter(t => tokens.has(t)).length * 4 + keywords.filter(t => tokens.has(t)).length }; }).filter(x => x.score > 0).sort((a,b) => b.score-a.score || a.index-b.index).slice(0,5).sort((a,b) => a.index-b.index);
    return { keywords, points: ranked.map(x => x.sentence.length > 420 ? `${x.sentence.slice(0,417)}...` : x.sentence), minutes: Math.max(1, Math.round(segments.length / (lang === "th" ? 250 : 200))), words: segments.length };
  }
};
