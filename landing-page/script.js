/* 자연으로 싱크대 거름망 랜딩 페이지
   맡는 동작: ① 섹션 이동 후 초점 옮기기 ② FAQ 열기·닫기
             ③ CTA 클릭 시 안내 문구 표시 ④ 전후 화살표의 짧은 움직임
   그 밖에 사진을 불러오지 못하면 '이미지 준비 중' 틀로 바꾼다. */
(() => {
  'use strict';

  const CTA_MESSAGE = '아직 준비 중입니다.';
  const CTA_MESSAGE_MS = 4000;
  const MISSING_IMAGE_TEXT = '이미지 준비 중';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- ① 섹션 이동 + 초점 ---------- */
  function moveTo(id) {
    const target = document.getElementById(id);
    if (!target) return false;

    const behavior = reduceMotion.matches ? 'auto' : 'smooth';

    if (id === 'page-top') {
      window.scrollTo({ top: 0, behavior });
      target.focus({ preventScroll: true });
      return true;
    }

    // 제목이 헤더에 가리지 않는 위치(라벨+제목 묶음)로 이동하고, 초점은 제목으로 옮긴다.
    const anchor = target.querySelector('[data-scroll-anchor]') || target;
    const title = target.querySelector('[data-section-title]') || target;

    anchor.scrollIntoView({ behavior, block: 'start' });
    title.focus({ preventScroll: true });
    return true;
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    if (!id || !moveTo(id)) return;

    event.preventDefault();
    history.replaceState(null, '', `#${id}`);
  });

  /* ---------- ② FAQ 열기·닫기 ---------- */
  // 닫힌 답변 안의 사진은 loading="lazy"라서, 답변을 열어 화면에 나타날 때 불러온다.
  function setFaqState(item, open, animate) {
    const toggle = item.querySelector('.faq__toggle');
    const panel = item.querySelector('.faq__a');
    const state = item.querySelector('[data-faq-state]');

    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (state) state.textContent = open ? '답변 닫기' : '답변 열기';

    panel.classList.remove('is-opening');
    if (open && animate && !reduceMotion.matches) {
      // 다시 열 때도 애니메이션이 재생되도록 리플로우 후 클래스 추가
      void panel.offsetWidth;
      panel.classList.add('is-opening');
    }
  }

  document.querySelectorAll('[data-faq]').forEach((item) => {
    const toggle = item.querySelector('.faq__toggle');

    setFaqState(item, item.dataset.open === 'true', false);

    // 한 항목을 열어도 다른 항목은 닫지 않는다.
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setFaqState(item, !isOpen, true);
    });
  });

  /* ---------- ③ CTA 안내 문구 ---------- */
  // 제휴 링크 연결 전: 페이지를 이동하지 않고 버튼 아래 안내 자리에 문구만 보여준다.
  document.querySelectorAll('[data-cta-position]').forEach((button) => {
    const status = document.getElementById(button.getAttribute('aria-describedby'));
    if (!status) return;

    let hideTimer = 0;

    button.addEventListener('click', () => {
      window.clearTimeout(hideTimer);

      // 같은 문구라도 보조기술이 다시 읽도록 비웠다가 채운다.
      status.textContent = '';
      window.requestAnimationFrame(() => {
        status.textContent = CTA_MESSAGE;
        status.classList.add('is-visible');
      });

      hideTimer = window.setTimeout(() => {
        status.classList.remove('is-visible');
        status.textContent = '';
      }, CTA_MESSAGE_MS);
    });
  });

  /* ---------- ④ 전후 화살표: 화면에 들어올 때 한 번 ---------- */
  const inviewTargets = document.querySelectorAll('[data-inview]');

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-inview');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    inviewTargets.forEach((el) => observer.observe(el));
  }

  /* ---------- 사진을 불러오지 못했을 때 ---------- */
  function markMissing(img) {
    const frame = img.closest('[data-frame]');
    if (!frame || frame.classList.contains('is-missing')) return;

    frame.classList.add('is-missing');
    const note = document.createElement('span');
    note.textContent = MISSING_IMAGE_TEXT;
    frame.appendChild(note);
  }

  document.querySelectorAll('[data-frame] img').forEach((img) => {
    img.addEventListener('error', () => markMissing(img));
    if (img.getAttribute('src') && img.complete && img.naturalWidth === 0) {
      markMissing(img);
    }
  });
})();
