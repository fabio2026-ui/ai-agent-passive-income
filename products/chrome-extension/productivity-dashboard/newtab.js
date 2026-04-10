// Chrome Extension: Productivity Dashboard
// 小七团队开发
// 新标签页生产力仪表板

// manifest.json
const manifest = {
  "manifest_version": 3,
  "name": "Productivity Dashboard",
  "version": "1.0.0",
  "description": "自定义新标签页，提升生产力",
  "permissions": [
    "storage",
    "bookmarks",
    "topSites"
  ],
  "chrome_url_overrides": {
    "newtab": "newtab.html"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
};

// newtab.js - 新标签页逻辑
class ProductivityDashboard {
  constructor() {
    this.todos = [];
    this.notes = '';
    this.theme = 'light';
    this.links = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.render();
    this.setupEventListeners();
    this.startClock();
  }

  async loadData() {
    const data = await chrome.storage.sync.get([
      'todos', 'notes', 'theme', 'links', 'userName'
    ]);
    this.todos = data.todos || [];
    this.notes = data.notes || '';
    this.theme = data.theme || 'light';
    this.links = data.links || this.getDefaultLinks();
    this.userName = data.userName || '';
  }

  getDefaultLinks() {
    return [
      { title: 'Gmail', url: 'https://gmail.com', icon: '📧' },
      { title: 'Calendar', url: 'https://calendar.google.com', icon: '📅' },
      { title: 'Drive', url: 'https://drive.google.com', icon: '📁' },
      { title: 'GitHub', url: 'https://github.com', icon: '💻' },
      { title: 'Notion', url: 'https://notion.so', icon: '📝' },
      { title: 'Figma', url: 'https://figma.com', icon: '🎨' },
    ];
  }

  render() {
    document.body.className = this.theme;
    document.getElementById('app').innerHTML = `
      <div class="dashboard">
        ${this.renderHeader()}
        ${this.renderMain()}
      </div>
    `;
  }

  renderHeader() {
    const greeting = this.getGreeting();
    const date = new Date().toLocaleDateString('zh-CN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `
      <header class="header">
        <div class="greeting">
          <h1>${greeting}${this.userName ? ', ' + this.userName : ''} 👋</h1>
          <p class="date">${date}</p>
        </div>
        <div class="clock" id="clock">00:00</div>
        <button class="settings-btn" onclick="dashboard.toggleSettings()">⚙️</button>
      </header>
    `;
  }

  renderMain() {
    return `
      <main class="main">
        <div class="left-panel">
          ${this.renderTodos()}
          ${this.renderNotes()}
        </div>
        <div class="right-panel">
          ${this.renderQuickLinks()}
          ${this.renderBookmarks()}
        </div>
      </main>
    `;
  }

  renderTodos() {
    const todoList = this.todos.map((todo, index) => `
      <div class="todo-item ${todo.done ? 'done' : ''}">
        <input type="checkbox" ${todo.done ? 'checked' : ''} 
          onchange="dashboard.toggleTodo(${index})">
        <span>${todo.text}</span>
        <button onclick="dashboard.deleteTodo(${index})">×</button>
      </div>
    `).join('');

    return `
      <div class="card todos">
        <h3>✅ 待办事项</h3>
        <div class="todo-list">
          ${todoList || '<p class="empty">今天还没有待办事项</p>'}
        </div>
        <div class="todo-input">
          <input type="text" id="newTodo" placeholder="添加新任务..." 
            onkeypress="if(event.key==='Enter') dashboard.addTodo()">
          <button onclick="dashboard.addTodo()">添加</button>
        </div>
      </div>
    `;
  }

  renderNotes() {
    return `
      <div class="card notes">
        <h3>📝 快速笔记</h3>
        <textarea id="notes" placeholder="写下你的想法..."
          onblur="dashboard.saveNotes()">${this.notes}</textarea>
      </div>
    `;
  }

  renderQuickLinks() {
    const linksHtml = this.links.map((link, index) => `
      <a href="${link.url}" class="quick-link" target="_blank">
        <span class="icon">${link.icon}</span>
        <span class="title">${link.title}</span>
      </a>
    `).join('');

    return `
      <div class="card quick-links">
        <h3>🔗 快速访问</h3>
        <div class="links-grid">
          ${linksHtml}
        </div>
      </div>
    `;
  }

  renderBookmarks() {
    return `
      <div class="card bookmarks">
        <h3>⭐ 常用书签</h3>
        <div id="bookmarks-list" class="bookmarks-list">
          加载中...
        </div>
      </div>
    `;
  }

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }

  startClock() {
    const updateClock = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      const clockEl = document.getElementById('clock');
      if (clockEl) clockEl.textContent = time;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 待办事项操作
  addTodo() {
    const input = document.getElementById('newTodo');
    const text = input.value.trim();
    if (text) {
      this.todos.push({ text, done: false });
      this.saveData();
      this.render();
    }
  }

  toggleTodo(index) {
    this.todos[index].done = !this.todos[index].done;
    this.saveData();
    this.render();
  }

  deleteTodo(index) {
    this.todos.splice(index, 1);
    this.saveData();
    this.render();
  }

  saveNotes() {
    this.notes = document.getElementById('notes').value;
    this.saveData();
  }

  async saveData() {
    await chrome.storage.sync.set({
      todos: this.todos,
      notes: this.notes,
      theme: this.theme,
      links: this.links,
      userName: this.userName
    });
  }

  toggleSettings() {
    // 打开设置弹窗
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>设置</h2>
        <label>
          你的名字:
          <input type="text" id="userNameInput" value="${this.userName}"
            onchange="dashboard.userName = this.value; dashboard.saveData();">
        </label>
        <label>
          主题:
          <select onchange="dashboard.setTheme(this.value)">
            <option value="light" ${this.theme === 'light' ? 'selected' : ''}>浅色</option>
            <option value="dark" ${this.theme === 'dark' ? 'selected' : ''}>深色</option>
          </select>
        </label>
        <button onclick="this.parentElement.parentElement.remove()">关闭</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  setTheme(theme) {
    this.theme = theme;
    this.saveData();
    this.render();
  }

  setupEventListeners() {
    // 加载书签
    chrome.bookmarks.getTree((bookmarkTree) => {
      const bookmarksList = document.getElementById('bookmarks-list');
      if (bookmarksList) {
        const bookmarks = this.extractBookmarks(bookmarkTree);
        bookmarksList.innerHTML = bookmarks.slice(0, 10).map(b => `
          <a href="${b.url}" class="bookmark-link" target="_blank">
            ${b.title}
          </a>
        `).join('') || '<p class="empty">暂无书签</p>';
      }
    });
  }

  extractBookmarks(tree) {
    let bookmarks = [];
    for (const node of tree) {
      if (node.url) {
        bookmarks.push({ title: node.title, url: node.url });
      }
      if (node.children) {
        bookmarks = bookmarks.concat(this.extractBookmarks(node.children));
      }
    }
    return bookmarks;
  }
}

// 初始化
const dashboard = new ProductivityDashboard();
