// Web Components 정의 및 메인 로직

/**
 * Theme Toggle Component
 * 다크모드/라이트모드 전환 스위치
 */
class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    this.updateIcon();
  }

  get currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    this.updateIcon();
  }

  updateIcon() {
    const btn = this.shadowRoot.querySelector('button');
    if (!btn) return;
    const isDark = this.currentTheme === 'dark';
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }

  setupListeners() {
    this.shadowRoot.querySelector('button').addEventListener('click', () => this.toggleTheme());
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        button {
          background: none;
          border: 1px solid var(--border-color, #ccc);
          color: var(--text-main, #333);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 8px;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, transform 0.2s;
        }
        button:hover {
          background-color: var(--border-color, #eee);
          transform: rotate(15deg);
        }
      </style>
      <button type="button" aria-label="Toggle Theme">🌙</button>
    `;
  }
}

// Custom Element 등록
customElements.define('theme-toggle', ThemeToggle);

/**
 * 초기 테마 설정 로직
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderContent();
  
  // 스크롤 시 헤더 스타일 변경
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});

/**
 * Product Card Component
 * 뉴스레터, 강의, 전자책을 표시하는 범용 카드
 */
class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const title = this.getAttribute('title');
    const subtitle = this.getAttribute('subtitle'); // Date or Description
    const price = this.getAttribute('price');
    const type = this.getAttribute('type'); // 'newsletter', 'course', 'book'
    const imageColor = this.getAttribute('image-color') || 'var(--border-color)';

    this.render(title, subtitle, price, type, imageColor);
  }

  render(title, subtitle, price, type, imageColor) {
    const isProduct = type === 'course' || type === 'book';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; height: 100%; }
        .card {
          background: var(--bg-card, #fff);
          border: 1px solid var(--border-color, #eee);
          border-radius: 12px;
          padding: 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          cursor: pointer;
          box-sizing: border-box;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow, 0 4px 12px rgba(0,0,0,0.1));
          border-color: var(--accent-color, blue);
        }
        .card-image {
          height: 160px;
          background-color: ${imageColor};
          border-radius: 8px;
          margin-bottom: 16px;
          opacity: 0.8;
        }
        .meta {
          font-size: 0.85rem;
          color: var(--accent-color, blue);
          font-weight: 600;
          margin-bottom: 8px;
        }
        h3 {
          font-size: 1.25rem;
          margin: 0 0 10px 0;
          line-height: 1.4;
          color: var(--text-main, #333);
        }
        p {
          font-size: 0.95rem;
          color: var(--text-muted, #666);
          margin: 0;
          flex-grow: 1;
          line-height: 1.5;
        }
        .price {
          margin-top: 16px;
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-main, #333);
          text-align: right;
        }
      </style>
      
      <div class="card">
        ${isProduct ? `<div class="card-image"></div>` : ''}
        ${!isProduct ? `<div class="meta">${subtitle}</div>` : ''}
        <h3>${title}</h3>
        <p>${isProduct ? subtitle : '' /* Description for products */}</p>
        ${isProduct ? `<div class="price">${price}</div>` : ''}
        ${!isProduct ? `<p>${this.getAttribute('desc') || ''}</p>` : ''}
      </div>
    `;
  }
}
customElements.define('product-card', ProductCard);

// Data
const db = {
  newsletters: [
    { title: "솔로프리너의 시간 관리법", date: "Jan 12, 2026", desc: "혼자 일할 때 가장 중요한 것은 시간 관리입니다. 뽀모도로 기법부터 딥워크까지." },
    { title: "MVP를 빠르게 런칭하는 5가지 툴", date: "Jan 05, 2026", desc: "코드 없이, 혹은 최소한의 코드로 아이디어를 검증하는 노코딩 툴 가이드." },
    { title: "2026년 1인 개발 트렌드", date: "Dec 28, 2025", desc: "AI와 함께하는 개발 생산성 혁명, 그리고 새로운 기회들." }
  ],
  courses: [
    { title: "SaaS 런칭 마스터클래스", desc: "아이디어 발굴부터 결제 연동, 마케팅 자동화까지 A to Z.", price: "₩150,000", color: "oklch(85% 0.1 200)" },
    { title: "AI 에이전트 개발 입문", desc: "나만의 AI 비서를 만들고 업무를 자동화하세요.", price: "₩120,000", color: "oklch(85% 0.1 150)" }
  ],
  books: [
    { title: "1인 개발자 생존 가이드", desc: "실패하지 않는 프리랜서/1인 개발자가 되기 위한 실전 전략서.", price: "₩25,000", color: "oklch(85% 0.1 30)" },
    { title: "팔리는 글쓰기", desc: "고객의 마음을 움직이는 카피라이팅의 모든 것.", price: "₩18,000", color: "oklch(85% 0.1 300)" }
  ]
};

function renderContent() {
  const newsList = document.getElementById('newsletter-list');
  const courseList = document.getElementById('course-list');
  const bookList = document.getElementById('book-list');

  // Render Newsletters
  db.newsletters.forEach(item => {
    const el = document.createElement('product-card');
    el.setAttribute('type', 'newsletter');
    el.setAttribute('title', item.title);
    el.setAttribute('subtitle', item.date);
    el.setAttribute('desc', item.desc);
    newsList.appendChild(el);
  });

  // Render Courses
  db.courses.forEach(item => {
    const el = document.createElement('product-card');
    el.setAttribute('type', 'course');
    el.setAttribute('title', item.title);
    el.setAttribute('subtitle', item.desc);
    el.setAttribute('price', item.price);
    el.setAttribute('image-color', item.color);
    courseList.appendChild(el);
  });

  // Render Books
  db.books.forEach(item => {
    const el = document.createElement('product-card');
    el.setAttribute('type', 'book');
    el.setAttribute('title', item.title);
    el.setAttribute('subtitle', item.desc);
    el.setAttribute('price', item.price);
    el.setAttribute('image-color', item.color);
    bookList.appendChild(el);
  });
}
