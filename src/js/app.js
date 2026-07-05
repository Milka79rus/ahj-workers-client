import '../css/style.css';

const SERVER_URL = 'https://ahj-workers-serve-milka79rus.amvera.io/api/news';

const container = document.getElementById('news-container');
const errorBanner = document.getElementById('error-banner');
const reloadBtn = document.getElementById('reload-btn');

// 1. Функция отрисовки скелетонов (мерцающих заглушек)
function renderSkeletons() {
  container.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    container.innerHTML += `
      <div class="news-item">
        <div class="skeleton skeleton-img"></div>
        <div class="news-content">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-date"></div>
          <div class="skeleton skeleton-desc"></div>
        </div>
      </div>
    `;
  }
}

// 2. Функция отрисовки реальных новостей
function renderNews(newsArray) {
  container.innerHTML = '';
  newsArray.forEach((news) => {
    container.innerHTML += `
      <div class="news-item">
        <img src="${news.image}" class="news-img" alt="news">
        <div class="news-content">
          <h3 class="news-title">${news.title}</h3>
          <div class="news-date">${news.date}</div>
          <p class="news-desc">${news.description}</p>
        </div>
      </div>
    `;
  });
}

// 3. Главная функция загрузки новостей
async function loadNews() {
  errorBanner.classList.add('hidden');
  renderSkeletons();

  try {
    const response = await fetch(SERVER_URL);

    // Если сервер упал (500) И Service Worker НЕ смог вытащить ничего из кэша:
    if (!response.ok) throw new Error('Ошибка сервера');

    const result = await response.json();
    renderNews(result.data);
  } catch (error) {
    console.error(error);

    // Очищаем скелетоны, если данные совсем не удалось получить
    container.innerHTML = '<p style="text-align:center;">Новости временно недоступны.</p>';
    errorBanner.classList.remove('hidden');
  }
}

reloadBtn.addEventListener('click', loadNews);
document.addEventListener('DOMContentLoaded', loadNews);

// --- РЕГИСТРАЦИЯ SERVICE WORKER  ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then((reg) => console.log('SW запущен успешно:', reg.scope))
      .catch((err) => console.error('Ошибка SW:', err));
  });
}

// --- КОД ДЛЯ ЗАДАЧИ 2* (HASHER НА WEB WORKER) ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const algoSelect = document.getElementById('algo-select');
const hashResultBox = document.getElementById('hash-result-box');
const fileNameSpan = document.getElementById('file-name');
const hashOutput = document.getElementById('hash-output');

let currentFile = null;

// Инициализируем Web Worker через нативный синтаксис Webpack 5
const worker = new Worker(new URL('./hash.worker.js', import.meta.url));

// Слушаем ответы от воркера
worker.addEventListener('message', (event) => {
  const { status, hash, fileName, error } = event.data;
  if (status === 'success') {
    fileNameSpan.textContent = fileName;
    hashOutput.textContent = hash;
    hashResultBox.classList.remove('hidden');
  } else {
    alert(`Ошибка: ${error}`);
  }
});

// Отправка файла на расчет хеша
function startHashing() {
  if (!currentFile) return;
  hashOutput.textContent = '⏳ Вычисляю хеш в фоновом потоке...';
  hashResultBox.classList.remove('hidden');
  worker.postMessage({ file: currentFile, algorithm: algoSelect.value });
}

algoSelect.addEventListener('change', startHashing);
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    currentFile = e.target.files[0];
    startHashing();
  }
});

// Обработка Drag & Drop событий
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    currentFile = e.dataTransfer.files[0];
    startHashing();
  }
});
