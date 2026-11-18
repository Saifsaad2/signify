/* Signy — keyword-matching chatbot fed by data/qa.js
   Works offline, no API key. Handles Arabic + English. */
(() => {
  const log = document.getElementById('chatLog');
  const chips = document.getElementById('chips');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  let QA = null;

  const norm = (s) => (s || '').toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')   // tashkeel + tatweel
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

  function add(text, who) {
    const d = document.createElement('div');
    d.className = 'msg ' + who; d.dir = 'auto'; d.textContent = text;
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function reply(text) {
    const t = add('…', 'bot typing');
    setTimeout(() => { t.classList.remove('typing'); t.textContent = text; log.scrollTop = log.scrollHeight; }, 450);
  }

  function match(q) {
    const n = norm(q); if (!n) return null;
    if ((QA.greeting_keywords || []).some((g) => (' ' + n + ' ').includes(' ' + norm(g) + ' ')) && n.split(' ').length <= 3)
      return { answer: QA.welcome };
    let best = null, bestScore = 0;
    for (const item of QA.items) {
      let score = 0;
      for (const k of item.keywords || []) {
        const nk = norm(k); if (nk && n.includes(nk)) score += nk.length;
      }
      if (norm(item.question) === n) score += 100;
      if (score > bestScore) { bestScore = score; best = item; }
    }
    return best;
  }

  function ask(q) {
    if (!q.trim()) return;
    add(q, 'user');
    const m = match(q);
    reply(m ? m.answer : QA.fallback);
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; ask(v); });

  QA = window.SIGNIFY_QA;
  if (!QA) { add('تعذر تحميل Signy: تأكد من وجود الملف data/qa.js.', 'bot'); }
  else {
    add(QA.welcome, 'bot');
    QA.items.slice(0, 5).forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = it.question; b.dir = 'auto';
      b.addEventListener('click', () => ask(it.question));
      chips.appendChild(b);
    });
  }
})();
