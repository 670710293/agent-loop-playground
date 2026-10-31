// Multi-source research adapters for the static demo.
// Searches Thai and English in parallel. Translation uses MyMemory's public endpoint;
// availability/rate limits/CORS can vary. This is still heuristic workflow, not an LLM.
const TOOLS = {
  async getJSON(url, timeoutMs = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally { clearTimeout(timer); }
  },
  async translate(text, from, to) {
    const value = String(text || "").trim();
    if (!value || from === to) return value;
    if (value.length > 480) throw new Error("ข้อความยาวเกินขีดจำกัดการแปลต่อครั้ง");
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(value)}&langpair=${from}|${to}`;
    const data = await this.getJSON(url, 9000);
    const translated = data.responseData?.translatedText;
    if (!translated || data.responseStatus !== 200) throw new Error(data.responseDetails || "Translation unavailable");
    return translated.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  },
  tokenize(text, lang) {
    const value = String(text || "").toLocaleLowerCase();
    if (typeof Intl.Segmenter === "function") return [...new Intl.Segmenter(lang === "th" ? "th" : "en", { granularity: "word" }).segment(value)].filter(p => p.isWordLike).map(p => p.segment);
    return value.match(/[a-z0-9ก-๙]+/g) || [];
  },
  questionTerms(question, lang) {
    const stop = new Set(lang === "th"
      ? "อะไร อย่างไร ทำไม คือ ที่ เป็น ของ ใน และ กับ ให้ หน่อย ช่วย ขอ สรุป อธิบาย เกี่ยวกับ เรื่อง เพราะว่า ได้ไหม อย่างไรบ้าง ถึง วิธี ความหมาย ช่วยที หน่อยครับ หน่อยค่ะ".split(" ")
      : "what why how explain describe summarize about the a an is are was were do does did to of in on for with and or please tell me difference between compare latest news".split(" "));
    return [...new Set(this.tokenize(question, lang).filter(w => w.length > 1 && !stop.has(w) && !/^\d+$/.test(w)))];
  },
  classify(question) {
    const q = question.toLowerCase();
    if (/pubmed|medical|health|disease|symptom|ยา|สุขภาพ|โรค|อาการ|การรักษา|โภชนาการ|ร่างกาย/.test(q)) return "health";
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
    const compact = terms.slice(0, 7).join(" ");
    return [...new Set([cleaned, compact].filter(q => q && q.length >= 2))];
  },
  relevance({ question, title, text, lang }) {
    const terms = this.questionTerms(question, lang);
    if (!terms.length) return { score: 0, matched: [], coverage: 0, terms };
    const titleTokens = new Set(this.tokenize(title, lang));
    const bodyTokens = new Set(this.tokenize(String(text || "").slice(0, 14000), lang));
    const matched = terms.filter(term => titleTokens.has(term) || bodyTokens.has(term));
    const titleMatches = terms.filter(term => titleTokens.has(term)).length;
    const coverage = matched.length / terms.length;
    return { score: Math.min(1, coverage * .65 + titleMatches / terms.length * .35), matched, coverage, titleMatches, terms };
  },
  async wikipediaSearch(q, lang) {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=5&format=json&origin=*`;
    const data = await this.getJSON(url);
    const rows = data.query?.search || [];
    const out = await Promise.all(rows.slice(0, 4).map(async row => {
      try {
        const detailUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=6500&redirects=1&titles=${encodeURIComponent(row.title)}&format=json&origin=*`;
        const detail = await this.getJSON(detailUrl, 9000);
        const page = Object.values(detail.query?.pages || {})[0];
        if (!page?.extract) return null;
        return { title: page.title, text: page.extract, url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`, provider: `Wikipedia (${lang})`, type: "encyclopedia", lang, evidence: true };
      } catch { return null; }
    }));
    return out.filter(Boolean);
  },
  async duckDuckGoSearch(q, lang) {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
    const data = await this.getJSON(url);
    const out = [];
    if (data.AbstractText) out.push({ title: data.Heading || q, text: data.AbstractText, url: data.AbstractURL || "https://duckduckgo.com/", provider: "DuckDuckGo Instant Answer", type: "web instant answer", lang, evidence: true });
    const flatten = items => (items || []).flatMap(x => x.Topics ? flatten(x.Topics) : [x]);
    for (const item of flatten(data.RelatedTopics).slice(0, 4)) {
      if (item.Text && item.FirstURL) out.push({ title: item.Text.split(" - ")[0].slice(0, 140), text: item.Text, url: item.FirstURL, provider: "DuckDuckGo related result", type: "web result", lang, evidence: true });
    }
    return out;
  },
  async githubSearch(q) {
    const data = await this.getJSON(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=5`);
    return (data.items || []).map(x => ({ title: x.full_name, text: `${x.description || "No repository description."}\nPrimary language: ${x.language || "Not specified"}. Topics: ${(x.topics || []).join(", ")}`, url: x.html_url, provider: "GitHub repository search", type: "repository metadata", lang: "en", evidence: false }));
  },
  async crossrefSearch(q) {
    const data = await this.getJSON(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(q)}&rows=5&select=title,author,published,abstract,URL,DOI,type`);
    return (data.message?.items || []).map(x => ({ title: (x.title || ["Untitled research work"])[0], text: `${x.abstract || "Abstract not supplied by Crossref."} Publication year: ${x.published?.["date-parts"]?.[0]?.[0] || "Unknown"}. Type: ${x.type || "Unknown"}.`, url: x.URL || (x.DOI ? `https://doi.org/${x.DOI}` : "https://search.crossref.org/"), provider: "Crossref metadata", type: "research metadata", lang: "en", evidence: Boolean(x.abstract) }));
  },
  async openAlexSearch(q) {
    const data = await this.getJSON(`https://api.openalex.org/works?search=${encodeURIComponent(q)}&per-page=5`);
    return (data.results || []).map(x => {
      let abstract = "";
      if (x.abstract_inverted_index) {
        const words = [];
        for (const [word, positions] of Object.entries(x.abstract_inverted_index)) for (const pos of positions) words[pos] = word;
        abstract = words.filter(Boolean).join(" ");
      }
      return { title: x.title || "Research work", text: abstract || `${x.title || ""}. Publication year: ${x.publication_year || "Unknown"}.`, url: x.doi || x.primary_location?.landing_page_url || x.id, provider: "OpenAlex", type: "research record", lang: "en", evidence: Boolean(abstract) };
    }).filter(x => /^https?:/.test(x.url));
  },
  async pubmedSearch(q) {
    const search = await this.getJSON(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=4&term=${encodeURIComponent(q)}`);
    const ids = search.esearchresult?.idlist || [];
    if (!ids.length) return [];
    const xml = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(",")}&retmode=xml`, { signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); });
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    return [...doc.querySelectorAll("PubmedArticle")].map(article => {
      const title = article.querySelector("ArticleTitle")?.textContent || "PubMed record";
      const abstract = [...article.querySelectorAll("AbstractText")].map(n => `${n.getAttribute("Label") || ""} ${n.textContent}`).join(" ").trim();
      const id = article.querySelector("PMID")?.textContent;
      return { title, text: abstract || title, url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, provider: "PubMed / NCBI", type: "biomedical article", lang: "en", evidence: Boolean(abstract) };
    });
  },
  async gdeltSearch(q) {
    const data = await this.getJSON(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=ArtList&format=json&maxrecords=6&sort=HybridRel`);
    return (data.articles || []).map(x => ({ title: x.title || "News article", text: `${x.title || ""}. Source: ${x.domain || "Unknown"}. Published: ${x.seendate || "Unknown"}.`, url: x.url, provider: `GDELT news index · ${x.domain || "publisher unknown"}`, type: "news index result", lang: "en", evidence: false }));
  },
  async worldBankSearch(q) {
    const data = await this.getJSON("https://api.worldbank.org/v2/indicator?format=json&per_page=100&source=2");
    const terms = q.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    return (data[1] || []).map(x => ({ x, score: terms.filter(t => `${x.name} ${x.sourceNote || ""}`.toLowerCase().includes(t)).length })).filter(x => x.score > 0).sort((a,b) => b.score-a.score).slice(0, 5).map(({x}) => ({ title: x.name, text: `${x.name}. ${x.sourceNote || "World Bank indicator; consult the indicator page for definition and methodology."} Unit: ${x.unit || "Not specified"}.`, url: `https://data.worldbank.org/indicator/${x.id}`, provider: "World Bank Open Data", type: "official statistical indicator", lang: "en", evidence: Boolean(x.sourceNote) }));
  },
  async searchSources({ question }) {
    const detected = /[\u0E00-\u0E7F]/.test(question) ? "th" : "en";
    const category = this.classify(question);
    const originalQueries = this.searchQueries(question, detected);
    let thQuery = detected === "th" ? originalQueries[0] : "";
    let enQuery = detected === "en" ? originalQueries[0] : "";
    const translationNotes = [];
    if (detected === "th") {
      try { enQuery = await this.translate(question, "th", "en"); translationNotes.push("แปลงคำถามไทยเป็นอังกฤษเพื่อค้นแหล่งสากล"); }
      catch { enQuery = question; translationNotes.push("แปลคำค้นเป็นอังกฤษไม่สำเร็จ ใช้คำถามต้นฉบับกับแหล่งไทยต่อ"); }
    } else {
      try { thQuery = await this.translate(question, "en", "th"); translationNotes.push("แปลงคำถามอังกฤษเป็นไทยเพื่อค้นแหล่งไทย"); }
      catch { thQuery = ""; translationNotes.push("แปลคำค้นเป็นไทยไม่สำเร็จ ใช้แหล่งอังกฤษต่อ"); }
    }
    const attempts = [];
    const thFallback = detected === "th" ? originalQueries[1] : "";
    const enFallback = detected === "en" ? originalQueries[1] : "";
    const wikipediaWithFallback = async (primary, fallback, lang) => {
      if (!primary) return [];
      const first = await this.wikipediaSearch(primary, lang);
      return first.length || !fallback || fallback === primary ? first : this.wikipediaSearch(fallback, lang);
    };
    const jobs = [
      ["Wikipedia ไทย", () => wikipediaWithFallback(thQuery, thFallback, "th")],
      ["Wikipedia English", () => wikipediaWithFallback(enQuery, enFallback, "en")],
      ["DuckDuckGo ไทย", () => thQuery ? this.duckDuckGoSearch(thQuery, "th") : Promise.resolve([])],
      ["DuckDuckGo English", () => enQuery ? this.duckDuckGoSearch(enQuery, "en") : Promise.resolve([])]
    ];
    if (category === "programming" && enQuery) jobs.push(["GitHub", () => this.githubSearch(enQuery)]);
    if (category === "science" && enQuery) { jobs.push(["Crossref", () => this.crossrefSearch(enQuery)]); jobs.push(["OpenAlex", () => this.openAlexSearch(enQuery)]); }
    if (category === "health" && enQuery) jobs.push(["PubMed", () => this.pubmedSearch(enQuery)]);
    if (category === "news" && enQuery) jobs.push(["GDELT", () => this.gdeltSearch(enQuery)]);
    if (category === "economy" && enQuery) jobs.push(["World Bank", () => this.worldBankSearch(enQuery)]);
    const results = await Promise.all(jobs.map(async ([name, fn]) => {
      try { const rows = await fn(); attempts.push({ name, ok: true, count: rows.length }); return rows; }
      catch (error) { attempts.push({ name, ok: false, count: 0, error: error.name === "AbortError" ? "timeout" : error.message }); return []; }
    }));
    const seen = new Set();
    const candidates = results.flat().filter(item => {
      const key = String(item.url || "").split("?")[0].replace(/\/$/, "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key); return true;
    });
    return { category, detected, thQuery, enQuery, translationNotes, attempts, candidates };
  },
  analyze_text({ text, question, lang }) {
    const sentences = String(text).replace(/\n+/g, " ").split(/(?<=[.!?。！？])\s+/).map(s => s.trim()).filter(s => s.length > 35);
    const terms = this.questionTerms(question, lang);
    const ranked = sentences.map((sentence,index) => {
      const tokens = new Set(this.tokenize(sentence, lang));
      const matches = terms.filter(t => tokens.has(t));
      return { sentence, index, score: matches.length, matches };
    }).filter(x => x.score > 0).sort((a,b) => b.score-a.score || a.index-b.index).slice(0,4).sort((a,b) => a.index-b.index);
    const points = ranked.map(x => x.sentence.length > 440 ? `${x.sentence.slice(0,437)}...` : x.sentence);
    return { points, minutes: Math.max(1, Math.round(this.tokenize(text, lang).length / 200)), words: this.tokenize(text, lang).length };
  }
};
