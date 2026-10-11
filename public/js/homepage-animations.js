/**
 * NASS PORTAL - HOMEPAGE ANIMATIONS & NOTICEBOARD ATTENTION CONTROLLER
 * Department of Statistics, Nnamdi Azikiwe University (UNIZIK)
 */

(function () {
  'use strict';

  // 1. Scroll-Triggered Reveal System
  function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal-on-scroll');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    targets.forEach(el => observer.observe(el));
  }

  // 2. Animated Numerical Counters
  function initStatCounters() {
    const statSection = document.getElementById('statisticsBannerSection');
    if (!statSection) return;

    let hasCounted = false;

    function animateNumber(element, start, end, duration, prefix = '', suffix = '') {
      const startTime = performance.now();
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const easeOut = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(start + (end - start) * easeOut);
        element.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = `${prefix}${end.toLocaleString()}${suffix}`;
        }
      }
      requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasCounted) {
          hasCounted = true;
          const statValues = statSection.querySelectorAll('.stat-value');
          statValues.forEach(el => {
            const rawText = el.textContent.trim();
            // Parse numeric component and suffix (+ or %)
            const match = rawText.match(/(\d+[\d,]*)(.*)/);
            if (match) {
              const num = parseInt(match[1].replace(/,/g, ''), 10);
              const suffix = match[2] || '';
              if (!isNaN(num)) {
                animateNumber(el, 0, num, 1600, '', suffix);
              }
            }
          });
        }
      });
    }, { threshold: 0.25 });

    observer.observe(statSection);
  }

  // 3. Dynamic Noticeboard Attention & Ticker Enhancer
  function enhanceNoticeboard() {
    const card = document.getElementById('heroAnnouncementCard');
    if (!card) return;

    // A. Inject Live Dispatch Ticker Bar if not already present
    let ticker = card.querySelector('.bulletin-ticker-strip');
    if (!ticker) {
      ticker = document.createElement('div');
      ticker.className = 'bulletin-ticker-strip';
      ticker.innerHTML = `
        <span class="bulletin-ticker-tag">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          DISPATCH
        </span>
        <span class="bulletin-ticker-text" id="bulletinTickerMsg">Harmattan Semester 2026/2027 Registration Active · Timetables Published</span>
      `;
      const header = card.querySelector('.hero-card-header');
      if (header && header.nextSibling) {
        header.parentNode.insertBefore(ticker, header.nextSibling);
      }
    }

    // B. Cycle Dispatch Messages every 4 seconds
    const messages = [
      'Harmattan Semester 2026/2027 Registration Active · Timetables Published',
      'Undergraduate Course Clearances Ongoing at Statistics Office Room 101',
      'SIWES Industrial Training Orientation for 300L Scheduled',
      'Past Questions Archive updated with recent departmental examinations',
      'UNIZIK CIRS faculty profile credentials synchronized for all 49 personnel'
    ];
    let msgIdx = 0;
    const tickerTextEl = document.getElementById('bulletinTickerMsg');
    if (tickerTextEl) {
      setInterval(() => {
        msgIdx = (msgIdx + 1) % messages.length;
        tickerTextEl.style.opacity = '0';
        tickerTextEl.style.transform = 'translateY(-4px)';
        tickerTextEl.style.transition = 'all 0.3s ease';
        setTimeout(() => {
          tickerTextEl.textContent = messages[msgIdx];
          tickerTextEl.style.opacity = '1';
          tickerTextEl.style.transform = 'translateY(0)';
        }, 300);
      }, 4500);
    }

    // C. Enhance Bulletin Items when rendered
    const list = document.getElementById('heroAnnouncementsList');
    if (list) {
      const applyItemAnimations = () => {
        const items = list.querySelectorAll('.bulletin-item');
        items.forEach((item, index) => {
          item.classList.add('bulletin-item-enter');
          item.style.animationDelay = `${index * 120}ms`;
        });
      };

      // Watch for dynamic population by API
      const observer = new MutationObserver(() => {
        applyItemAnimations();
      });
      observer.observe(list, { childList: true });
      applyItemAnimations();
    }
  }

  // 4. Initialize everything on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initStatCounters();
    enhanceNoticeboard();
  });

})();
