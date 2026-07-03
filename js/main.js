'use strict';

/* CONFIGURAÇÃO */
const CONFIG = {
  whatsappNumber: '5575992889592',
};

/* HELPERS */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ANO NO RODAPÉ */
(function setFooterYear() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* BARRA DE PROGRESSO DE SCROLL */
(function progressBar() {
  const bar = $('#progressBar');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${clamp(pct, 0, 100)}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* CURSOR GLOW (efeito que segue o mouse) */
(function cursorGlow() {
  const glow = $('#cursorGlow');
  if (!glow || window.matchMedia('(hover: none)').matches) return;

  let targetX = -500, targetY = -500;
  let currentX = -500, currentY = -500;
  let raf = null;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!raf) raf = requestAnimationFrame(render);
  }, { passive: true });

  function render() {
    // suaviza o movimento (lerp) para um efeito mais elegante
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    glow.style.left = `${currentX}px`;
    glow.style.top = `${currentY}px`;

    if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
      raf = requestAnimationFrame(render);
    } else {
      raf = null;
    }
  }
})();

/* HEADER — estado "scrolled", menu mobile e link ativo */
(function header() {
  const header = $('#siteHeader');
  const menuToggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');
  const navLinks = $$('.nav-link', header || document);
  const mobileLinks = $$('.mobile-nav-link');
  const sections = $$('main .section, main .hero');

  // estado ao rolar a página
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // menu mobile
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        menuToggle.classList.remove('is-active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // link ativo conforme a seção visível
  if ('IntersectionObserver' in window && sections.length) {
    const setActive = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.section === id);
      });
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((section) => {
      if (section.id) sectionObserver.observe(section);
    });
  }
})();

/* PARALLAX DO HERO (mouse move + leve parallax de scroll) */
(function heroParallax() {
  const hero = $('#hero');
  if (!hero || prefersReducedMotion) return;

  const depthEls = $$('[data-depth]', hero);
  if (!depthEls.length) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let raf = null;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    // posição do mouse relativa ao centro do hero, normalizada entre -1 e 1
    targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(render);
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    if (!raf) raf = requestAnimationFrame(render);
  });

  function render() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    depthEls.forEach((el) => {
      const depth = parseFloat(el.dataset.depth) || 0;
      const moveX = currentX * depth * 100;
      const moveY = currentY * depth * 100;
      el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
      raf = requestAnimationFrame(render);
    } else {
      raf = null;
    }
  }

  // parallax sutil ao rolar a página (blobs "respiram" com o scroll)
  const blobs = $$('.blob', hero);
  if (blobs.length) {
    const onScroll = () => {
      const scrollY = window.scrollY;
      blobs.forEach((blob, i) => {
        const speed = i % 2 === 0 ? 0.18 : 0.26;
        blob.style.setProperty('--scroll-shift', `${scrollY * speed}px`);
        blob.style.transform += ` translateY(${scrollY * speed * 0.15}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();

/* EFEITO DE DIGITAÇÃO NO TERMINAL (typed line) */
(function typedLine() {
  const el = $('#typedLine');
  if (!el) return;

  const phrases = [
    'Joalisson Pinto Maia',
    'Desenvolvedor Back-end',
    'Full Stack • Java / Angular',
    'SQL, PHP, Node.js & JavaScript',
  ];

  if (prefersReducedMotion) {
    el.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const TYPE_SPEED = 65;
  const DELETE_SPEED = 35;
  const PAUSE_AFTER_TYPE = 1800;
  const PAUSE_AFTER_DELETE = 400;

  function tick() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_AFTER_TYPE);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, PAUSE_AFTER_DELETE);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }

  tick();
})();

/* REVEAL ON SCROLL (.reveal-up) */
const revealObserver = (() => {
  if (prefersReducedMotion) {
    $$('.reveal-up').forEach((el) => el.classList.add('is-visible'));
    return null;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  $$('.reveal-up').forEach((el) => observer.observe(el));
  return observer;
})();

/* CONTADORES ANIMADOS (.stat-num) */
(function statCounters() {
  const stats = $$('.stat-num');
  if (!stats.length) return;

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || '';
    const isDecimal = String(el.dataset.count).includes('.');
    const duration = 1400;
    const start = performance.now();

    if (prefersReducedMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    function frame(now) {
      const progress = clamp((now - start) / duration, 0, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = `${isDecimal ? value.toFixed(1) : Math.round(value)}${suffix}`;

      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = `${isDecimal ? target.toFixed(1) : target}${suffix}`;
    }
    requestAnimationFrame(frame);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    stats.forEach((el) => observer.observe(el));
  } else {
    stats.forEach(animateCount);
  }
})();

/* MARQUEE DE HABILIDADES */
(function skillsMarquee() {
  const track1 = $('#marqueeTrack1');
  const track2 = $('#marqueeTrack2');
  if (!track1 || !track2) return;

  const iconSvg = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18 4 13l5-5M15 6l5 5-5 5" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const skillsRowA = ['HTML5', 'CSS3 / Sass', 'JavaScript', 'Angular', 'Node.js', 'JSON / REST'];
  const skillsRowB = ['Java', 'Spring Boot', 'SQL (Oracle)', 'PostgreSQL', 'Git', 'Python'];

  const buildChips = (list) => list.map((name) => `
    <div class="skill-chip">${iconSvg}<span>${name}</span></div>
  `).join('');

  const fillTrack = (marqueeEl, list) => {
    const tracks = $$('.marquee-track', marqueeEl);
    // duas faixas idênticas lado a lado para permitir o loop contínuo via CSS
    tracks.forEach((t) => { t.innerHTML = buildChips(list); });
  };

  fillTrack(track1, skillsRowA);
  fillTrack(track2, skillsRowB);
})();

/* PROJETOS */
(function projects() {
  const grid = $('#projectsGrid');
  const filterBar = $('#filterBar');
  if (!grid) return;

  const placeholderImg = (label, from, to) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${from}"/>
            <stop offset="100%" stop-color="${to}"/>
          </linearGradient>
        </defs>
        <rect width="640" height="400" fill="url(#g)"/>
        <text x="50%" y="52%" font-family="monospace" font-size="30" fill="rgba(255,255,255,0.92)"
          text-anchor="middle" dominant-baseline="middle">${label}</text>
      </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  const PROJECTS = [
    {
      title: 'Aplicativo Gestão de Estoque',
      description: 'Aplicativo PowerApps para controle de estoque, permite mapear produtos de inventário com local na empresa, e sem local, visualizar e criar saídas e entradas de materiais, o aplicativo conta com gestao de usuários, autenticação com usuário e senha, e integrado com o banco de dados Dataverse da próprio Microsoft Power Platform, além do Fluxo que permite salvar backup do banco a cada 3 dias no Google Drive como Google Planilhas.',
      tags: ['PowerApps', 'Dataverse'],
      category: 'fullstack',
      link: '#',
      img: placeholderImg('Full Stack • Gestão de Estoque', '#4C3B8F', '#201638'),
    },
    {
      title: 'Eclypse A Lenda do Caos (Site)',
      description: 'Site criado para o jogo em que estou desenvolvendo, um jogo TCG(Tracking Card Games) no modelo 2.5D, jogo visa trazer criaturas místicas e folclóricas não somente do Brasil, mas de todo mundo a cada temporada, podendo criar diversos tipos de decks, e enfrentar outros jogadores através de nossos torneios.',
      tags: ['Angular Framework', 'SCSS', 'TypeScript', 'SpringBoot', 'PostgreSQL'],
      category: 'fullstack',
      link: 'https://eclypse-a-lenda-do-caos.onrender.com/',
      img: placeholderImg('Full Stack • Eclypse', '#4C3B8F', '#201638'),
    },
    {
      title: 'Automação Vencimento Locação',
      description: 'Essa automação foi criada com foco em retornar por email os vencimentos de locação de empilhadeiras, e plataformas, para isso precisei fazer um script no ERP Sankhya através do dbexplorer, criar um template para o email, e entender como usar o Java 1.8 para se comunicar com o ERP Sankhya.',
      tags: ['Sankhya', 'Oracle', 'Java', 'HTML', 'CSS'],
      category: 'fullstack',
      link: '#',
      img: placeholderImg('Automação • Vencimento Locação', '#7C5CFF', '#2B1E52'),
    },
    {
      title: 'LW Montagens',
      description: 'Site criada para uma montadora de móveis que somente encontrava clientes a partir do boca a boca e do instagram, a criação do site foi feita com foco em aumentar a visibilidade da marca e gerar leads, com seções de destaque como antes e depois da montagem, gerando confiança para o cliente, além de depoimentos de clientes satisfeitos.',
      tags: ['Laravel', 'Vite', 'Docker', 'Blade'],
      category: 'frontend',
      link: 'https://lwmontagens.onrender.com/',
      img: placeholderImg('Frontend • LW Montagens', '#FFB454', '#4C3B8F'),
    },
    {
      title: 'Barbx',
      description: 'Site para barbearia, criada com foco em proporcionar uma experiência única e moderna para os clientes, além de permitir o contato da barbearia para marcação de horários via whatsapp.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      category: 'frontend',
      link: 'https://barbx.vercel.app/',
      img: placeholderImg('Landing Page • Barbx', '#25D366', '#1AA34A'),
    },
    {
      title: 'E-Consciência',
      description: 'Projeto de conscientização ambiental, desenvolvido com foco em educar e sensibilizar a população sobre práticas sustentáveis, este projeto visa promover ações concretas para a proteção do meio ambiente, foi doado a uma ONG junto a um jogo, através do projeto de extensão da UNEX.',
      tags: ['HTML', 'CSS', 'JavaScript'],
      category: 'frontend',
      link: 'https://desenvolvimento-sustentavel-educacao.onrender.com/',
      img: placeholderImg('Frontend • E-Consciência', '#201638', '#4C3B8F'),
    },
    {
      title: 'Eclypse A Lenda do Caos (Jogo)',
      description: 'Desenvolvimento de um jogo TCG em 2.5D, com foco em partidas rápidas e emocionantes, com deck composto por 20 cartas, onde suas cartas tem habilidades em conjunto, se possuir mais de 2 cartas da mesma região, você ganha bônus de poder, porém se seu inimigo também tiver cartas da mesma região que você, ele também ganha bônus, então o jogo é de estratégia e rapidez, vence quem tiver mais pontos até do tempo acabar ou zerar a vida do inimigo.',
      tags: ['Unity', 'C#', 'SpringBoot', 'PostgreSQL'],
      category: 'outros',
      link: '#',
      img: placeholderImg('Jogo • Eclypse', '#7C5CFF', '#0B0714'),
    },
    {
      title: 'Blog Pessoal',
      description: 'Meu desejo era ter um blog para centralizar tudo que eu faço, e a partir disso, compartilhar os eventos em que participo, notícias sobre meus jogos que estou desenvolvendo, além de compartilhar enquetes para deixar os próprios usuários do jogo decidir com quais artes, ele será feito, e até mesmo postar minhas reflexões e experiências.',
      tags: ['Angular Framework', 'SCSS', 'TypeScript', 'SpringBoot', 'PostgreSQL'],
      category: 'outros',
      link: '#',
      img: placeholderImg('Site • Blog Pessoal', '#FFB454', '#7C5CFF'),
    },
    {
      title: 'API Sistema de RH',
      description: 'Desenvolvimento de uma API para gerenciamento de recursos humanos, com funcionalidades de cadastro de funcionários, gestão de férias, equipe e controle de ponto.',
      tags: ['Spring Boot', 'Spring Security', 'MySQL', 'JUnit5'],
      category: 'backend',
      link: 'https://github.com/joalisson-p-maia/sistema-rh-api-spring',
      img: placeholderImg('Backend • API Sistema de RH', '#dc8719', '#3f23af'),
    },
  ];

  const linkArrowSvg = `
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const cardHtml = (project, index) => `
    <article class="project-card reveal-up" style="--delay:${(index % 3) * 90}ms" data-category="${project.category}">
      <div class="project-media">
        <img src="${project.img}" alt="Prévia do projeto ${project.title}" loading="lazy">
      </div>
      <div class="project-body">
        <div class="project-tags">
          ${project.tags.map((t) => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <a class="project-link" href="${project.link}" target="_blank" rel="noopener">
          Ver projeto ${linkArrowSvg}
        </a>
      </div>
    </article>
  `;

  grid.innerHTML = PROJECTS.map(cardHtml).join('');

  // observa os cards recém-criados para a animação de entrada
  const cardObserver = 'IntersectionObserver' in window && !prefersReducedMotion
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;

  const cards = $$('.project-card', grid);
  if (cardObserver) {
    cards.forEach((card) => cardObserver.observe(card));
  } else {
    cards.forEach((card) => card.classList.add('is-visible'));
  }

  // filtro de categorias
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      $$('.filter-btn', filterBar).forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const match = filter === 'todos' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !match);
        if (match) card.classList.add('is-visible');
      });
    });
  }
})();

/* TOAST (aviso na tela) */
const showToast = (() => {
  let toastEl = $('.toast');

  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }

  let hideTimer = null;

  return function show(message, duration = 3600) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, duration);
  };
})();

/* FORMULÁRIO DE ORÇAMENTO -> WHATSAPP */
(function budgetForm() {
  const form = $('#budgetForm');
  if (!form) return;

  const fields = {
    companyName: $('#companyName', form),
    companyPhone: $('#companyPhone', form),
    companyEmail: $('#companyEmail', form),
    projectType: $('#projectType', form),
    budgetRange: $('#budgetRange', form),
    projectDescription: $('#projectDescription', form),
  };

  // remove o estado de erro assim que o usuário começa a corrigir o campo
  Object.values(fields).forEach((field) => {
    if (!field) return;
    field.addEventListener('input', () => field.classList.remove('field-error'));
    field.addEventListener('change', () => field.classList.remove('field-error'));
  });

  const validate = () => {
    let isValid = true;
    let firstInvalid = null;

    Object.values(fields).forEach((field) => {
      if (!field) return;
      const fieldValid = field.checkValidity();
      field.classList.toggle('field-error', !fieldValid);
      if (!fieldValid) {
        isValid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
    }

    return isValid;
  };

  const buildMessage = () => {
    const lines = [
      '👋 Olá, Joalisson! Vim pelo seu portfólio e gostaria de um orçamento.',
      '',
      `*Empresa:* ${fields.companyName.value.trim()}`,
      `*Telefone:* ${fields.companyPhone.value.trim()}`,
      `*E-mail:* ${fields.companyEmail.value.trim()}`,
      `*Tipo de projeto:* ${fields.projectType.value}`,
      `*Orçamento estimado:* ${fields.budgetRange.value}`,
      '',
      '*Descrição do projeto:*',
      fields.projectDescription.value.trim(),
    ];
    return lines.join('\n');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Preencha os campos obrigatórios antes de enviar.');
      return;
    }

    const message = buildMessage();
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener');
    showToast('Mensagem pronta! Abrindo o WhatsApp em uma nova aba…');

    form.reset();
    Object.values(fields).forEach((field) => field && field.classList.remove('field-error'));
  });
})();

/* WHATSAPP FAB — mostra depois que o usuário sai do hero */
(function whatsappFab() {
  const fab = $('#whatsappFab');
  const hero = $('#hero');
  if (!fab || !hero) return;

  if (!('IntersectionObserver' in window)) {
    fab.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    fab.classList.toggle('is-visible', !entry.isIntersecting);
  }, { threshold: 0 });

  observer.observe(hero);
})();
