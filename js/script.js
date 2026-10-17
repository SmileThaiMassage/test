// Attiva le animazioni solo se il JS gira: senza JS la pagina resta sempre visibile
document.body.classList.add('anim');

// Animazione fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: .05, rootMargin: '0px 0px -5% 0px' });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Mostra subito tutte le sezioni (anti-blocco se lo scroll arriva prima dell'animazione)
function mostraTutto() {
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
}

// Menu hamburger mobile
const hamburger = document.getElementById('hamburger');
const menuMobile = document.getElementById('menuMobile');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const aperto = menuMobile.classList.toggle('aperto');
    hamburger.classList.toggle('aperto', aperto);
    hamburger.setAttribute('aria-expanded', aperto);
  });
  // chiudi il menu quando si tocca un link e mostra subito la destinazione
  menuMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mostraTutto();
      menuMobile.classList.remove('aperto');
      hamburger.classList.remove('aperto');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// Link "Home": scroll esplicito all'inizio pagina (affidabile su ogni browser)
document.querySelectorAll('a[href="#top"]').forEach(a => {
  a.addEventListener('click', (ev) => {
    ev.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ===== Selettore lingua (Google Translate) =====
// Il cambio lingua avviene comandi diretti al menu nascosto di Google Translate:
// niente cookie scritti a mano (causa di blocchi), Google gestisce da sé traduzione e memoria.
function evidenziaLingua(lang) {
  document.querySelectorAll('#langSwitch button').forEach(b => {
    b.classList.toggle('attivo', b.dataset.lang === lang);
  });
}
function linguaDaCookie() {
  const m = document.cookie.match(/googtrans=\/it\/([a-z]{2})/);
  return m ? m[1] : 'it';
}
function comboGoogle() {
  return document.querySelector('#google_translate_element .goog-te-combo');
}
function cancellaCookieGoogtrans() {
  const host = location.hostname;
  const varianti = [';path=/'];
  if (host) {
    varianti.push(';path=/;domain=' + host);
    varianti.push(';path=/;domain=.' + host);
  }
  varianti.forEach(v => {
    document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC' + v;
  });
}
let tentativiCombo = 0;
function cambiaLingua(lang) {
  const combo = comboGoogle();
  if (!combo) {
    // widget di Google non ancora caricato: riprova per un massimo di ~6 secondi
    if (++tentativiCombo < 15) setTimeout(() => cambiaLingua(lang), 400);
    return;
  }
  tentativiCombo = 0;
  if (lang === 'it') {
    // già in italiano: niente da fare
    if (linguaDaCookie() === 'it') { evidenziaLingua('it'); return; }
    // unico metodo affidabile per tornare all'originale: cancellare il cookie
    // di traduzione e ricaricare dal server (il sito resta in italiano)
    evidenziaLingua('it');
    cancellaCookieGoogtrans();
    location.reload();
    return;
  }
  if (lang === linguaDaCookie()) { evidenziaLingua(lang); return; }
  combo.value = lang;
  combo.dispatchEvent(new Event('change'));
  evidenziaLingua(lang);
}
// stato iniziale: italiano, salvo cookie di traduzione già esistente
evidenziaLingua(linguaDaCookie());
// click gestito con delega: continua a funzionare anche dopo la traduzione della pagina
document.addEventListener('click', (e) => {
  const btn = e.target.closest ? e.target.closest('#langSwitch button') : null;
  if (btn) cambiaLingua(btn.dataset.lang);
});
