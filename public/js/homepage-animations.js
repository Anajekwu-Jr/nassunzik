/**
 * NASS PORTAL - INSTITUTIONAL HOMEPAGE ENHANCER
 * Department of Statistics, Nnamdi Azikiwe University (UNIZIK)
 * Clean, restrained, institutional presentation - No over-the-top animations or gimmicks
 */

(function () {
  'use strict';

  // 1. Immediate Failsafe Reveal (ensures zero content jank or delayed hidden text)
  function initContentDisplay() {
    const targets = document.querySelectorAll('.reveal-on-scroll');
    targets.forEach(el => el.classList.add('is-revealed'));
  }

  // 2. Departmental Bulletin Ticker (Clean factual announcements)
  function initNoticeboard() {
    const card = document.getElementById('heroAnnouncementCard');
    if (!card) return;

    let ticker = card.querySelector('.bulletin-ticker-strip');
    if (!ticker) {
      ticker = document.createElement('div');
      ticker.className = 'bulletin-ticker-strip';
      ticker.innerHTML = `
        <span class="bulletin-ticker-tag" style="border-radius: 4px;">
          NOTICE
        </span>
        <span class="bulletin-ticker-text" id="bulletinTickerMsg">Harmattan Semester 2026/2027 Academic Session Active · Lecture Timetables Published</span>
      `;
      const header = card.querySelector('.hero-card-header');
      if (header && header.nextSibling) {
        header.parentNode.insertBefore(ticker, header.nextSibling);
      }
    }
  }

  // 3. Initialize cleanly on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initContentDisplay();
      initNoticeboard();
    });
  } else {
    initContentDisplay();
    initNoticeboard();
  }

})();
