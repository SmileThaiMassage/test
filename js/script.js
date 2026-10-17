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

// Selettore lingua (Google Translate via cookie googtrans)
function linguaCorrente() {
  const m = document.cookie.match(/googtrans=\/it\/([a-z]{2})/);
  return m ? m[1] : 'it';
}
function evidenziaLingua() {
  const attiva = linguaCorrente();
  document.querySelectorAll('#langSwitch button').forEach(b => {
    b.classList.toggle('attivo', b.dataset.lang === attiva);
  });
}
evidenziaLingua();
document.querySelectorAll('#langSwitch button').forEach(b => {
  b.addEventListener('click', () => {
    const lang = b.dataset.lang;
    const dominio = location.hostname ? ';domain=' + location.hostname : '';
    if (lang === 'it') {
      document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/' + dominio;
    } else {
      document.cookie = 'googtrans=/it/' + lang + ';path=/' + dominio;
    }
    location.reload();
  });
});
