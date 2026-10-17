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
// La lingua scelta è memorizzata dal sito in localStorage ("smileLingua") ed è lei
// la fonte di verità: l'italiano non dipende più da Google né dal suo widget.
// EN/TH vengono applicati con un comando diretto al menu nascosto di Google Translate.
const CHIAVE_LANG = 'smileLingua';

function leggiPreferenza() {
  try { return localStorage.getItem(CHIAVE_LANG); } catch (e) { return null; }
}
function salvaPreferenza(lang) {
  try { localStorage.setItem(CHIAVE_LANG, lang); } catch (e) {}
}
function evidenziaLingua(lang) {
  document.querySelectorAll('#langSwitch button').forEach(b => {
    b.classList.toggle('attivo', b.dataset.lang === lang);
  });
}
function linguaDaCookie() {
  const m = document.cookie.match(/googtrans=\/it\/([a-z]{2})/);
  return m ? m[1] : 'it';
}
function paginaTradotta() {
  return document.body.classList.contains('translated-ltr') ||
         document.body.classList.contains('translated-rtl');
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
  salvaPreferenza(lang);
  if (lang === 'it') {
    // già in italiano e pagina non tradotta: niente da fare
    if (linguaDaCookie() === 'it' && !paginaTradotta()) {
      evidenziaLingua('it');
      return;
    }
    // metodo sicuro e indipendente da Google: cancella il cookie di traduzione
    // e ricarica dal server (il sito resta in italiano)
    evidenziaLingua('it');
    cancellaCookieGoogtrans();
    location.reload();
    return;
  }
  // EN / TH: comando diretto al menu nascosto di Google Translate
  if (lang === linguaDaCookie() && paginaTradotta()) {
    evidenziaLingua(lang);
    return;
  }
  const combo = comboGoogle();
  if (!combo) {
    // widget non ancora caricato: riprova per ~6 secondi (la preferenza resta salvata)
    if (++tentativiCombo < 15) setTimeout(() => cambiaLingua(lang), 400);
    return;
  }
  tentativiCombo = 0;
  combo.value = lang;
  combo.dispatchEvent(new Event('change'));
  evidenziaLingua(lang);
}

// ===== avvio =====
// NB: i cookie di traduzione sono già stati cancellati nell'<head> se la preferenza
// è l'italiano (script inline), prima dell'inizializzazione del widget di Google.
const preferenza = leggiPreferenza();
if (!preferenza || preferenza === 'it') {
  cancellaCookieGoogtrans(); // doppia sicurezza, dopo il caricamento del DOM
  evidenziaLingua('it');
} else {
  evidenziaLingua(preferenza);
  // se il cookie di Google è sparito, riapplica la lingua preferita appena il widget è pronto
  if (linguaDaCookie() !== preferenza) {
    let n = 0;
    const timer = setInterval(() => {
      const c = comboGoogle();
      if (c) {
        clearInterval(timer);
        c.value = preferenza;
        c.dispatchEvent(new Event('change'));
      } else if (++n > 20) {
        clearInterval(timer);
      }
    }, 400);
  }
}

// click gestito con delega: continua a funzionare anche dopo la traduzione della pagina
document.addEventListener('click', (e) => {
  const btn = e.target.closest ? e.target.closest('#langSwitch button') : null;
  if (btn) cambiaLingua(btn.dataset.lang);
});
