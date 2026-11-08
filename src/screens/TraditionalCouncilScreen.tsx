import React, { useEffect, useRef } from 'react';
import { TRADITIONAL_COUNCIL_LOGO } from '../data/traditionalCouncilLogo';

/* Crown shows until a portrait is added. EDIT HERE: add or change members. Add a photo by setting photo:"images/igwe.jpg". Order = rank order. */
export const members = [
  {
    role: "Igwe",
    lead: true,
    name: "Nwosu Kelechi Kevin",
    title: "HRM Igwe Egbe Ana Agba Anyanwu Nke Mbụ, Elelie Nwa Ite Nke Mbụ na Statistics",
    photo: "",
    bio: "His Royal Majesty is the Igwe of the Nzenaozo Statistics Royal Family at Nnamdi Azikiwe University. He represents royal dignity, unity, cultural heritage, and the spirit of leadership within the Statistics Department.",
    speech: [
      "It is with great honour and a deep sense of responsibility that I stand as His Royal Majesty, Igwe Egbe Ana Agba Anyanwu Nke Mbụ, Elelie Nwa Ite Nke Mbụ na Statistics. To me, this royal institution represents more than a title; it represents unity, dignity, cultural pride, and a lasting bond among members of our great Statistics family.",
      "I believe that true leadership is demonstrated through humility, wisdom, respect, and service to others. As we uphold our traditions and celebrate our identity, may we continue to strengthen the unity that binds us together and build a legacy worthy of future generations.",
      "Long live Nzenaozo! Long live the Statistics family!"
    ]
  },
  {
    role: "Lolo",
    lead: true,
    name: "Asoh Sylvia Nmesoma",
    title: "Lolo Nwanyi Bu Ife Nke Mbụ na Statistics",
    photo: "",
    bio: "Her Royal Highness is the Lolo of the Nzenaozo Statistics Royal Family. She represents grace, dignity, cultural pride, and the importance of unity within the royal institution.",
    speech: [
      "It is a privilege and an honour to serve as Lolo Nwanyi Bu Ife Nke Mbụ na Statistics. I see our royal family as a symbol of togetherness, respect, and the beautiful cultural heritage that connects us as members of the Statistics Department."
    ]
  },
  {
    role: "Okpara",
    lead: false,
    name: "Nwangwu Evaristus Chidiebere",
    title: "Okpara Obiefuna",
    photo: "",
    bio: "A member of the Nzenaozo Statistics Royal Family. His title forms part of the institution’s distinctive royal identity and cultural heritage.",
    speech: [
      "I am honoured to be recognized as Okpara Obiefuna in the Nzenaozo Statistics Royal Family. I value the unity, respect, and cultural identity that our institution represents. To me, belonging to this royal family is an opportunity to uphold our traditions, encourage togetherness, and contribute positively to the legacy we are building."
    ]
  },
  {
    role: "Ada",
    lead: false,
    name: "Odigbo Onyebuchi Vivian Clare",
    title: "Ada Mmiri Mara Ugo",
    photo: "",
    bio: "A member of the Nzenaozo Statistics Royal Family. Her title contributes to the distinctive cultural expression and royal identity of the institution.",
    speech: [
      "I am proud to be known as Ada Mmiri Mara Ugo in the Nzenaozo Statistics Royal Family. I embrace the values of dignity, respect, unity, and cultural pride that our royal institution represents.",
      "May our unity remain strong, our heritage remain alive, and our royal family continue to shine."
    ]
  },
  {
    role: "Onowu",
    lead: false,
    name: "Onaga Chukwuemelie Francis",
    title: "Onowu Onagaruomee",
    photo: "",
    bio: "A member of the Nzenaozo Statistics Royal Family. His title forms part of the institution’s traditional identity and its representation of cultural heritage.",
    speech: [
      "It is an honour to be part of the Nzenaozo Statistics Royal Family as Onowu Onagaruomee. I recognize the importance of preserving our traditions, respecting our heritage, and maintaining the unity that connects every member of our institution."
    ]
  },
  {
    role: "Iyom",
    lead: false,
    name: "Okoye Ifunanya",
    title: "Iyom Chinyeluaku",
    photo: "",
    bio: "A member of the Nzenaozo Statistics Royal Family. Her title contributes to the institution’s distinctive royal identity and celebration of cultural heritage.",
    speech: [
      "I am delighted to be part of the Nzenaozo Statistics Royal Family as Iyom Chinyeluaku. To me, this institution represents unity, pride in our heritage, and the importance of maintaining the values that connect us as a family.",
      "May our heritage endure and our royal family continue to flourish."
    ]
  }
];

export const TraditionalCouncilScreen: React.FC = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Dynamic strike function for authentic ogene sound
  const playOgene = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const strike = (freq: number, t: number) => {
        const ratios: [number, number][] = [
          [1, 0.5],
          [2.76, 0.25],
          [5.4, 0.12]
        ];
        ratios.forEach(([r, g]) => {
          const o = ctx.createOscillator();
          const a = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq * r;
          a.gain.setValueAtTime(g, t);
          a.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
          o.connect(a);
          a.connect(ctx.destination);
          o.start(t);
          o.stop(t + 1.2);
        });
      };

      const t = ctx.currentTime + 0.05;
      const strikes: [number, number][] = [
        [620, 0],
        [440, 0.32],
        [620, 0.64],
        [440, 0.96],
        [620, 1.28]
      ];
      strikes.forEach(([f, d]) => strike(f, t + d));
    } catch (e) {
      console.warn('Audio playback not supported:', e);
    }
  };

  // Scroll border draw-in animation with IntersectionObserver and document scroll enabling
  useEffect(() => {
    // Enable full-page natural scrolling on document and root
    document.documentElement.classList.add('tc-scrollable');
    document.body.classList.add('tc-scrollable');
    document.documentElement.style.setProperty('height', 'auto', 'important');
    document.documentElement.style.setProperty('overflow-y', 'auto', 'important');
    document.body.style.setProperty('height', 'auto', 'important');
    document.body.style.setProperty('min-height', '100vh', 'important');
    document.body.style.setProperty('overflow-y', 'auto', 'important');
    document.body.style.setProperty('touch-action', 'pan-y pinch-zoom', 'important');
    document.body.style.setProperty('user-select', 'auto', 'important');

    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.setProperty('height', 'auto', 'important');
      rootEl.style.setProperty('min-height', '100vh', 'important');
      rootEl.style.setProperty('overflow-y', 'visible', 'important');
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let io: IntersectionObserver | null = null;
    if (!prefersReducedMotion) {
      const bands = document.querySelectorAll('.tc-scope .band');
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      bands.forEach((b) => io?.observe(b));
    }

    return () => {
      document.documentElement.classList.remove('tc-scrollable');
      document.body.classList.remove('tc-scrollable');
      document.documentElement.style.removeProperty('height');
      document.documentElement.style.removeProperty('overflow-y');
      document.body.style.removeProperty('height');
      document.body.style.removeProperty('min-height');
      document.body.style.removeProperty('overflow-y');
      document.body.style.removeProperty('touch-action');
      document.body.style.removeProperty('user-select');
      if (rootEl) {
        rootEl.style.removeProperty('height');
        rootEl.style.removeProperty('min-height');
        rootEl.style.removeProperty('overflow-y');
      }
      if (io) {
        io.disconnect();
      }
    };
  }, []);

  return (
    <div
      className="tc-scope"
      style={{
        ['--logo' as string]: `url(${TRADITIONAL_COUNCIL_LOGO})`
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap"
        rel="stylesheet"
      />

      <style>{`
        html, body {
          overflow-y: auto !important;
          height: auto !important;
          min-height: 100vh !important;
          touch-action: pan-y pinch-zoom !important;
          -webkit-overflow-scrolling: touch !important;
        }

        #root {
          height: auto !important;
          min-height: 100vh !important;
          overflow: visible !important;
        }

        .tc-scope {
          --ink: #14100c;
          --ink2: #1e1812;
          --gold: #c9a24a;
          --gold2: #e6c878;
          --red: #8f1d1d;
          --cream: #f3e8d0;
          --muted: #cdbf9f;
          --palm: #3f7a3a;
          background: var(--ink);
          color: var(--cream);
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 1.15rem;
          font-weight: 500;
          line-height: 1.65;
          min-height: 100vh;
          width: 100%;
          position: relative;
          text-align: left;
          overflow-x: hidden;
          overflow-y: visible;
          touch-action: pan-y pinch-zoom;
          -webkit-overflow-scrolling: touch;
        }

        .tc-scope * {
          box-sizing: border-box;
          margin: 0;
        }

        .tc-scope h1,
        .tc-scope h2,
        .tc-scope h3 {
          font-family: Cinzel, Georgia, serif;
          font-weight: 700;
          line-height: 1.25;
          color: var(--gold2);
        }

        .tc-scope a {
          color: inherit;
        }

        .tc-scope .wrap {
          max-width: 68rem;
          margin: auto;
          padding: 0 1.25rem;
        }

        .tc-scope .band {
          height: 16px;
          background-color: var(--gold);
          background-image:
            linear-gradient(135deg, var(--red) 25%, transparent 25%),
            linear-gradient(225deg, var(--red) 25%, transparent 25%),
            linear-gradient(315deg, var(--red) 25%, transparent 25%),
            linear-gradient(45deg, var(--red) 25%, transparent 25%);
          background-size: 16px 16px;
          background-position: -8px 0, -8px 0, 0 0, 0 0;
          transform: scaleX(0);
          transition: transform 1.6s cubic-bezier(0.2, 0.7, 0.2, 1);
          transform-origin: center;
        }

        .tc-scope .band.in {
          transform: scaleX(1);
        }

        .tc-scope .hero {
          text-align: center;
          padding: 2.5rem 0 2rem;
          background: radial-gradient(ellipse at top, #3a2410 0, var(--ink) 70%);
          position: relative;
          overflow: hidden;
        }

        .tc-scope .hero > *:not(.feathers) {
          position: relative;
          z-index: 1;
        }

        .tc-scope .hero img.hero-logo {
          width: min(15rem, 62vw);
          height: auto;
          border-radius: 50%;
          box-shadow: 0 0 0 3px var(--gold), 0 0 40px rgba(201, 162, 74, 0.35);
          display: block;
          margin: 0 auto;
        }

        .tc-scope .hero h1 {
          font-size: clamp(1.6rem, 5.5vw, 2.8rem);
          margin: 1.4rem 0 0.3rem;
        }

        .tc-scope .hero p {
          max-width: 34rem;
          margin: auto;
          color: var(--muted);
          font-style: italic;
        }

        .tc-scope .feathers {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .tc-scope .feather {
          position: absolute;
          top: -4rem;
          width: 1.1rem;
          opacity: 0;
          animation: tc-fall linear infinite;
        }

        @keyframes tc-fall {
          0% {
            transform: translate(0, 0) rotate(-25deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            transform: translate(2.2rem, 14rem) rotate(30deg);
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translate(-1rem, 30rem) rotate(-30deg);
            opacity: 0;
          }
        }

        .tc-scope nav.tc-nav {
          position: sticky;
          top: 0;
          z-index: 5;
          background: var(--ink2);
          border-bottom: 2px solid var(--gold);
        }

        .tc-scope nav.tc-nav .wrap {
          display: flex;
          gap: 0.4rem 1.4rem;
          overflow-x: auto;
          padding-top: 0.7rem;
          padding-bottom: 0.7rem;
          white-space: nowrap;
          align-items: center;
        }

        .tc-scope nav.tc-nav a {
          font-family: Cinzel, Georgia, serif;
          font-size: 0.95rem;
          text-decoration: none;
          color: var(--gold2);
        }

        .tc-scope nav.tc-nav a:hover,
        .tc-scope nav.tc-nav a:focus-visible {
          text-decoration: underline;
          outline: none;
        }

        .tc-scope .brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: Cinzel, Georgia, serif;
          font-weight: 700;
          color: var(--cream) !important;
        }

        .tc-scope .brand img {
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 50%;
          box-shadow: 0 0 0 2px var(--gold);
        }

        @media (max-width: 40rem) {
          .tc-scope .brand span {
            display: none;
          }
        }

        .tc-scope section {
          padding: 3.2rem 0;
          scroll-margin-top: 3rem;
        }

        .tc-scope section h2 {
          font-size: clamp(1.4rem, 4vw, 2rem);
          margin-bottom: 1.1rem;
        }

        .tc-scope section > .wrap > p,
        .tc-scope .prose p {
          max-width: 44rem;
          margin-bottom: 1rem;
        }

        .tc-scope .alt {
          background: var(--ink2);
          border-block: 1px solid rgba(201, 162, 74, 0.35);
        }

        .tc-scope .sign {
          margin-top: 1.4rem;
          padding-left: 1rem;
          border-left: 3px solid var(--red);
          color: var(--muted);
        }

        .tc-scope .sign b {
          display: block;
          color: var(--cream);
          font-weight: 600;
        }

        .tc-scope .pic {
          display: block;
          width: min(16rem, 70vw);
          height: auto;
          margin: 0 auto 1.6rem;
          border-radius: 50%;
          box-shadow: 0 0 0 3px var(--gold), 0 0 30px rgba(201, 162, 74, 0.3);
        }

        .tc-scope .grid {
          display: grid;
          gap: 1.4rem;
          grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
        }

        .tc-scope .card {
          background: var(--ink2);
          border: 1px solid var(--gold);
          border-top: 6px solid var(--red);
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .tc-scope .card.lead {
          grid-column: 1 / -1;
          border-top-color: var(--gold);
        }

        .tc-scope .crest {
          width: 5.5rem;
          height: 5.5rem;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 3px double var(--gold);
          background: var(--ink);
          font-size: 2.5rem;
          line-height: 1;
        }

        .tc-scope .card img.photo {
          width: 5.5rem;
          height: 5.5rem;
          border-radius: 50%;
          object-fit: cover;
          border: 3px double var(--gold);
        }

        .tc-scope .card h3 {
          font-size: 1.1rem;
        }

        .tc-scope .rank {
          color: var(--gold);
          font-style: italic;
        }

        .tc-scope .card .title {
          font-size: 1rem;
          color: var(--muted);
        }

        .tc-scope details {
          margin-top: auto;
          border-top: 1px solid rgba(201, 162, 74, 0.4);
          padding-top: 0.6rem;
        }

        .tc-scope summary {
          cursor: pointer;
          font-family: Cinzel, serif;
          font-size: 0.9rem;
          color: var(--gold2);
        }

        .tc-scope summary:focus-visible {
          outline: 2px solid var(--gold2);
          outline-offset: 3px;
        }

        .tc-scope details p {
          margin-top: 0.7rem;
          font-style: italic;
        }

        .tc-scope .timeline {
          list-style: none;
          padding: 0;
          border-left: 3px solid var(--gold);
          max-width: 46rem;
        }

        .tc-scope .timeline li {
          position: relative;
          padding: 0 0 1.4rem 1.4rem;
        }

        .tc-scope .timeline li::before {
          content: "";
          position: absolute;
          left: -0.62rem;
          top: 0.5rem;
          width: 0.9rem;
          height: 0.9rem;
          transform: rotate(45deg);
          background: var(--red);
          border: 2px solid var(--gold);
        }

        .tc-scope .timeline b {
          display: block;
          font-family: Cinzel, serif;
          color: var(--gold2);
          font-weight: 700;
        }

        .tc-scope .emblem {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
        }

        .tc-scope .emblem div {
          border-left: 4px solid var(--palm);
          padding: 0.2rem 0 0.2rem 1rem;
        }

        .tc-scope .emblem h3 {
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }

        .tc-scope .motto {
          text-align: center;
          font-family: Cinzel, serif;
          color: var(--gold2);
          padding: 2.2rem 1rem;
        }

        .tc-scope footer.tc-footer {
          text-align: center;
          padding: 1.4rem 1rem 2rem;
          color: var(--muted);
          font-size: 1rem;
        }

        .tc-scope footer.tc-footer img {
          width: 3.2rem;
          height: 3.2rem;
          border-radius: 50%;
          display: block;
          margin: 0 auto 0.6rem;
          box-shadow: 0 0 0 2px var(--gold);
        }

        .tc-scope .mark {
          position: relative;
          overflow: hidden;
        }

        .tc-scope .mark::before {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--logo) center / min(30rem, 85%) no-repeat;
          opacity: 0.09;
          pointer-events: none;
        }

        .tc-scope .mark > .wrap {
          position: relative;
        }

        .tc-scope .seal {
          display: block;
          width: 6rem;
          height: 6rem;
          margin: 2rem auto 0;
          border-radius: 50%;
          box-shadow: 0 0 0 2px var(--gold);
        }

        .tc-scope .ogene {
          position: fixed;
          right: 1.25rem;
          bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
          z-index: 50;
          width: 3.4rem;
          height: 3.4rem;
          border-radius: 50%;
          border: 2px solid var(--gold);
          background: var(--ink2);
          color: var(--gold2);
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, transform 0.1s;
        }

        .tc-scope .ogene:hover,
        .tc-scope .ogene:focus-visible {
          background: var(--red);
          outline: 2px solid var(--gold2);
          outline-offset: 3px;
        }

        .tc-scope .ogene:active {
          transform: scale(0.95);
        }

        @media (prefers-reduced-motion: reduce) {
          .tc-scope {
            scroll-behavior: auto;
          }
          .tc-scope .feathers {
            display: none !important;
          }
          .tc-scope .band {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Top Band */}
      <div className="band"></div>

      {/* Hero Header */}
      <header className="hero" id="top">
        {/* Falling eagle feathers in header */}
        <div className="feathers" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const c = i % 3 === 0 ? '#14100c' : '#f3e8d0';
            return (
              <div
                key={i}
                className="feather"
                style={{
                  left: `${6 + i * 12}%`,
                  animationDuration: `${11 + ((i * 5) % 7)}s`,
                  animationDelay: `${-i * 2.3}s`
                }}
              >
                <svg viewBox="0 0 20 60">
                  <path
                    d="M10 2C22 18 20 44 10 58 0 44-2 18 10 2Z"
                    fill={c}
                    stroke="#c9a24a"
                    strokeWidth="1"
                  />
                  <path d="M10 4V58" stroke="#c9a24a" strokeWidth="1.2" />
                </svg>
              </div>
            );
          })}
        </div>

        <img
          src={TRADITIONAL_COUNCIL_LOGO}
          alt="Emblem of the NASS Traditional Council, Nnamdi Azikiwe University, Awka"
          className="hero-logo"
        />
        <h1>National Association of Statistics Students (NASS) Traditional Council</h1>
        <p>Nzenaozo UNIZIK Statistics Royal Family, Nnamdi Azikiwe University, Awka</p>
      </header>

      {/* Sticky In-Page Navigation */}
      <nav className="tc-nav" aria-label="Traditional Council Sections">
        <div className="wrap">
          <a className="brand" href="#top">
            <img src={TRADITIONAL_COUNCIL_LOGO} alt="NASS Traditional Council emblem" />
            <span>NASS Traditional Council</span>
          </a>
          <a href="#welcome">Royal Welcome</a>
          <a href="#family">The Royal Family</a>
          <a href="#about">About</a>
          <a href="#history">History</a>
          <a href="#emblem">The Emblem</a>
          <a href="/" style={{ marginLeft: 'auto', opacity: 0.85, fontSize: '0.85rem' }}>
            ← Back to Portal Home
          </a>
        </div>
      </nav>

      {/* Royal Welcome Section */}
      <section id="welcome" className="mark">
        <div className="wrap">
          <h2>A Royal Welcome</h2>
          <img
            className="pic"
            src={TRADITIONAL_COUNCIL_LOGO}
            alt="Emblem of the NASS Traditional Council"
          />
          <p>
            With great honour and immense joy, we welcome you to the official home of the Nzenaozo
            UNIZIK Statistics Royal Family.
          </p>
          <p>
            We are delighted to share with you our royal identity, heritage, values, and traditions.
            This platform represents our commitment to unity, dignity, cultural pride, and the
            continued growth of our great Statistics family.
          </p>
          <p>
            As we uphold the richness of our Igbo heritage and the spirit of togetherness, we invite
            you to explore our royal institution and discover the values and legacy we proudly
            represent.
          </p>
          <p>
            <i>
              Welcome to our royal world, where tradition meets excellence and unity strengthens our
              legacy.
            </i>
          </p>
          <div className="sign">
            <b>
              His Royal Majesty, HRM Igwe Egbe Ana Agba Anyanwu Nke Mbụ, Elelie Nwa Ite Nke Mbụ na
              Statistics
            </b>
            <b>Her Royal Highness, Lolo Nwanyi Bu Ife Nke Mbụ na Statistics</b>
          </div>
        </div>
      </section>

      <div className="band"></div>

      {/* Meet the Royal Family Section */}
      <section id="family" className="alt">
        <div className="wrap">
          <h2>Meet the Royal Family</h2>
          <div className="grid" id="members">
            {members.map((m, idx) => (
              <article key={idx} className={`card${m.lead ? ' lead' : ''}`}>
                {m.photo ? (
                  <img className="photo" src={m.photo} alt={`Portrait of ${m.name}`} />
                ) : (
                  <div className="crest">👑</div>
                )}
                <div className="rank">{m.role}</div>
                <h3>{m.name}</h3>
                <div className="title">{m.title}</div>
                <p>{m.bio}</p>
                <details>
                  <summary>Read the royal speech</summary>
                  {m.speech.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </details>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="band"></div>

      {/* About the Royal Family Section */}
      <section id="about">
        <div className="wrap prose">
          <h2>About the Royal Family</h2>
          <img
            className="pic"
            src={TRADITIONAL_COUNCIL_LOGO}
            alt="Emblem of the NASS Traditional Council"
          />
          <p>
            The National Association of Statistics Students (NASS) Traditional Council, Nnamdi
            Azikiwe University, Awka, represents cultural heritage, unity, dignity, and a shared
            sense of identity among its members.
          </p>
          <p>
            Rooted in the appreciation of Igbo tradition and cultural values, the royal institution
            is a platform for celebrating traditional titles, honouring cultural heritage, and
            promoting togetherness within the departmental community.
          </p>
          <p>
            Beyond its titles, Nzenaozo stands for mutual respect, responsibility, pride in one’s
            heritage, and the importance of preserving traditions for future generations.
          </p>
        </div>
      </section>

      <div className="band"></div>

      {/* Royal History and Heritage Section */}
      <section id="history" className="alt mark">
        <div className="wrap">
          <h2>Royal History and Heritage</h2>
          <ul className="timeline">
            <li>
              <b>Origin</b>The Statistics Department had a royal lineage in the past, but its
              continuity was interrupted for a period. The royal tradition was re-established to
              continue this heritage under a new line of succession.
            </li>
            <li>
              <b>The present dynasty</b>Established under HRM Igwe Egbe Ana Agba Anyanwu Nke Mbụ,
              personal royal name Elelie Nwa Ite Nke Mbụ na Statistics. His coronation took place on 2
              July 2026.
            </li>
            <li>
              <b>Dynastic names</b>Each royal position has its own dynasty name, taken from its
              first holder. Successors inherit the name, take the next ordinal number, and may add
              personal names.
            </li>
            <li>
              <b>Succession</b>Continuity is kept through a traditional process linked to the Ofala of
              the reigning Igwe. Aspiring candidates may be considered, and the dynasty names pass
              to the incoming holders.
            </li>
          </ul>
        </div>
      </section>

      <div className="band"></div>

      {/* Meaning of the Emblem Section */}
      <section id="emblem">
        <div className="wrap">
          <h2>Meaning of the Emblem</h2>
          <p>
            Each element of the emblem carries a meaning that together states the identity and
            values of the Council.
          </p>
          <div className="emblem">
            <div>
              <h3>The Royal Crown</h3>Traditional authority, kingship, dignity and sovereignty.
            </div>
            <div>
              <h3>Two Eagle Feathers</h3>Courage, strength, wisdom and excellence. The pair
              reflects unity and balance in leadership.
            </div>
            <div>
              <h3>Palm Leaves</h3>Peace, prosperity, victory, growth and abundance, and the place of
              the palm in Igbo life.
            </div>
            <div>
              <h3>The Wooden Stool</h3>The seat of authority and ancestral heritage, and the
              continuity of customs across generations.
            </div>
            <div>
              <h3>The Woven Fabric</h3>Igbo cultural identity, belonging, unity and the beauty of
              indigenous craftsmanship.
            </div>
            <div>
              <h3>Black and Gold Circle</h3>Unity and wholeness. Black for dignity and authority,
              gold for honour, prestige and royalty.
            </div>
            <div>
              <h3>Red and Gold Banner</h3>Red for courage and determination, gold for honour. It
              names the institution as the Traditional Council.
            </div>
          </div>
        </div>
      </section>

      <div className="band"></div>

      {/* Seal Emblem & Motto */}
      <img className="seal" src={TRADITIONAL_COUNCIL_LOGO} alt="Emblem of the NASS Traditional Council" />
      <p className="motto">Nzenaozo: A Heritage of Pride, a Bond of Unity, and a Legacy of Honour.</p>

      {/* Footer */}
      <footer className="tc-footer">
        <img src={TRADITIONAL_COUNCIL_LOGO} alt="" />
        NASS Traditional Council, Nnamdi Azikiwe University, Awka
      </footer>

      {/* Interactive Ogene Bell Button */}
      <button
        type="button"
        className="ogene"
        id="ogene"
        aria-label="Play the ogene bell"
        title="Tap to hear the ogene"
        onClick={playOgene}
      >
        🔔
      </button>
    </div>
  );
};

export default TraditionalCouncilScreen;
