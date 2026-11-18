/* Signify — interactive map + video hotspots
   Hotspots come from data/hotspots.js (x,y in % of the map).
   Add ?edit=1 to the URL to place/move hotspots and attach videos. */
(() => {
  const CFG = {
    mapSrc: 'assets/map/map.jpg',
    mapFallback: 'assets/map/placeholder.svg',
    storageKey: 'signify.hotspots.v1'
  };
  const EDIT = new URLSearchParams(location.search).get('edit') === '1';

  const $ = (id) => document.getElementById(id);
  const stage = $('mapStage'), pins = $('pins'), mapImg = $('mapImg');
  let hotspots = [];
  let current = null;           // hotspot being edited
  const blobUrls = {};          // id -> object URL of locally uploaded video

  $('yr').textContent = new Date().getFullYear();

  /* ---------- map image with fallback ---------- */
  mapImg.src = CFG.mapSrc;
  mapImg.addEventListener('error', () => {
    if (!mapImg.src.endsWith('placeholder.svg')) mapImg.src = CFG.mapFallback;
  });

  /* ---------- IndexedDB for locally uploaded preview videos ---------- */
  const db = new Promise((res) => {
    try {
      const r = indexedDB.open('signify-videos', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('v');
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
    } catch { res(null); }
  });
  const idb = async (mode, fn) => {
    const d = await db; if (!d) return null;
    return new Promise((res) => {
      const tx = d.transaction('v', mode); const out = fn(tx.objectStore('v'));
      tx.oncomplete = () => res(out && out.result !== undefined ? out.result : null);
      tx.onerror = () => res(null);
    });
  };
  const saveBlob = (id, file) => idb('readwrite', (s) => s.put(file, id));
  const loadBlob = (id) => idb('readonly', (s) => s.get(id));
  const dropBlob = (id) => idb('readwrite', (s) => s.delete(id));

  /* ---------- load + save hotspots ---------- */
  async function load() {
    const saved = EDIT ? localStorage.getItem(CFG.storageKey) : null;
    if (saved) { try { hotspots = JSON.parse(saved); render(); return; } catch {} }
    hotspots = ((window.SIGNIFY_HOTSPOTS || {}).hotspots || []).map((h) => ({ ...h }));
    if (!hotspots.length) console.warn('لا توجد نقاط: تأكد من تحميل data/hotspots.js');
    render();
  }
  const persist = () => { if (EDIT) localStorage.setItem(CFG.storageKey, JSON.stringify(hotspots)); };

  /* ---------- render pins ---------- */
  function render() {
    pins.innerHTML = '';
    hotspots.forEach((h) => {
      const b = document.createElement('button');
      b.className = 'pin'; b.type = 'button';
      b.style.left = h.x + '%'; b.style.top = h.y + '%';
      b.setAttribute('aria-label', h.title);
      b.innerHTML = `<span class="tip"></span>`;
      b.querySelector('.tip').textContent = h.title;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (b.dataset.dragged) { delete b.dataset.dragged; return; }
        EDIT ? openEditor(h) : openVideo(h);
      });
      if (EDIT) enableDrag(b, h);
      pins.appendChild(b);
    });
  }

  /* ---------- YouTube URL helpers ---------- */
  function youtubeId(url) {
    if (!url) return null;
    const m = url.match(
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return m ? m[1] : null;
  }

  /* ---------- video modal ---------- */
  const modal = $('videoModal'), vid = $('mVideo'), frame = $('mFrame'), missing = $('mMissing');
  async function openVideo(h) {
    $('mTitle').textContent = h.title;
    $('mDesc').textContent = h.description || '';
    missing.hidden = true;
    let src = h.video;
    const blob = await loadBlob(h.id);
    if (EDIT && blob) { blobUrls[h.id] = URL.createObjectURL(blob); src = blobUrls[h.id]; }
    $('mPath').textContent = h.video || 'لم يتم تحديد فيديو';

    const ytId = youtubeId(src);
    if (ytId) {
      // YouTube: show iframe, hide <video>
      vid.hidden = true; vid.pause(); vid.removeAttribute('src');
      frame.hidden = false;
      frame.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
    } else if (src) {
      // Regular video file or direct URL
      frame.hidden = true; frame.src = '';
      vid.hidden = false;
      vid.src = src; vid.load();
      vid.onerror = () => { missing.hidden = false; };
      vid.play().catch(() => {});
    } else {
      frame.hidden = true; frame.src = '';
      vid.hidden = false; vid.removeAttribute('src');
      missing.hidden = false;
    }
    modal.showModal();
  }
  const closeVideo = () => {
    vid.pause(); vid.removeAttribute('src'); vid.load(); vid.hidden = false;
    frame.src = ''; frame.hidden = true;
    modal.close();
  };
  $('modalClose').addEventListener('click', closeVideo);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeVideo(); });
  modal.addEventListener('close', () => vid.pause());

  /* ---------- edit mode ---------- */
  if (EDIT) {
    document.body.classList.add('editing');
    $('editbar').hidden = false;

    stage.addEventListener('click', (e) => {
      if (e.target.closest('.pin')) return;
      const r = stage.getBoundingClientRect();
      const h = {
        id: 'hs-' + Date.now().toString(36),
        title: 'نقطة جديدة', description: '',
        x: +(((e.clientX - r.left) / r.width) * 100).toFixed(2),
        y: +(((e.clientY - r.top) / r.height) * 100).toFixed(2),
        video: ''
      };
      hotspots.push(h); persist(); render(); openEditor(h);
    });

    $('btn-export').addEventListener('click', () => {
      const out = '/* بيانات النقاط */\nwindow.SIGNIFY_HOTSPOTS = ' + JSON.stringify({ hotspots }, null, 2) + ';\n';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([out], { type: 'text/javascript' }));
      a.download = 'hotspots.js'; a.click();
      navigator.clipboard && navigator.clipboard.writeText(out).catch(() => {});
    });
    $('btn-reset').addEventListener('click', () => {
      if (confirm('هل تريد تجاهل تعديلاتك وإعادة تحميل data/hotspots.js؟')) { localStorage.removeItem(CFG.storageKey); load(); }
    });
  }

  function enableDrag(el, h) {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); el.setPointerCapture(e.pointerId);
      const r = stage.getBoundingClientRect(); let moved = false;
      const move = (ev) => {
        moved = true;
        h.x = +Math.min(100, Math.max(0, ((ev.clientX - r.left) / r.width) * 100)).toFixed(2);
        h.y = +Math.min(100, Math.max(0, ((ev.clientY - r.top) / r.height) * 100)).toFixed(2);
        el.style.left = h.x + '%'; el.style.top = h.y + '%';
      };
      const up = () => {
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up);
        if (moved) { el.dataset.dragged = '1'; persist(); }
      };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
    });
  }

  const em = $('editModal');
  function openEditor(h) {
    current = h;
    $('eTitle').value = h.title; $('eDesc').value = h.description || '';
    $('eVideo').value = h.video || ''; $('eFile').value = '';
    em.showModal();
  }
  $('eSave').addEventListener('click', async () => {
    if (!current) return;
    current.title = $('eTitle').value.trim() || 'نقطة';
    current.description = $('eDesc').value.trim();
    const f = $('eFile').files[0];
    if (f) {
      await saveBlob(current.id, f);
      if (!$('eVideo').value.trim()) $('eVideo').value = 'assets/videos/' + f.name;
    }
    current.video = $('eVideo').value.trim();
    persist(); render(); em.close();
  });
  $('eDelete').addEventListener('click', async () => {
    if (!current || !confirm('هل تريد حذف هذه النقطة؟')) return;
    hotspots = hotspots.filter((x) => x !== current);
    await dropBlob(current.id); persist(); render(); em.close();
  });
  $('eCancel').addEventListener('click', () => em.close());

  load();
})();
