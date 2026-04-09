/**
 * AI Agent被动收入系统 - 主脚本
 * 处理页面交互、文章加载和视图切换
 */

(function() {
    'use strict';

    // 状态
    let currentPage = 1;
    const articlesPerPage = 9;
    let currentView = 'grid';
    
    // DOM元素
    const articlesGrid = document.getElementById('articlesGrid');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const viewToggleBtns = document.querySelectorAll('.toggle-btn');
    
    // 初始化
    function init() {
        loadArticles();
        setupEventListeners();
        setupNavScroll();
    }
    
    // 加载文章
    function loadArticles() {
        if (!articlesGrid || typeof articlesData === 'undefined') return;
        
        const { articles, total, totalPages } = getArticlesPage(currentPage, articlesPerPage);
        
        renderArticles(articles);
        updatePagination(totalPages);
    }
    
    // 渲染文章列表
    function renderArticles(articles) {
        if (!articlesGrid) return;
        
        if (articles.length === 0) {
            articlesGrid.innerHTML = '<div class="no-articles">暂无文章</div>';
            return;
        }
        
        const html = articles.map(article => {
            // 提取excerpt的前100个字符
            const excerpt = article.excerpt.length > 100 
                ? article.excerpt.substring(0, 100) + '...' 
                : article.excerpt;
            
            return `
                <article class="article-card" data-id="${article.id}">
                    <div class="article-header">
                        <span class="article-category">${article.categoryName}</span>
                        <h3 class="article-title">${article.title}</h3>
                    </div>
                    <div class="article-body">
                        <p class="article-excerpt">${excerpt}</p>
                        <div class="article-footer">
                            <span class="article-date">${formatDate(article.date)}</span>
                            <span class="article-read">阅读全文 →</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
        
        articlesGrid.innerHTML = html;
        
        // 添加点击事件
        articlesGrid.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', () => {
                const articleId = card.dataset.id;
                goToArticle(articleId);
            });
        });
    }
    
    // 更新分页
    function updatePagination(totalPages) {
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage <= 1;
        }
        if (nextPageBtn) {
            nextPageBtn.disabled = currentPage >= totalPages;
        }
        if (pageInfo) {
            pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
        }
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 分页按钮
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    loadArticles();
                    scrollToArticles();
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const { totalPages } = getArticlesPage(currentPage, articlesPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    loadArticles();
                    scrollToArticles();
                }
            });
        }
        
        // 视图切换
        viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewToggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentView = btn.dataset.view;
                
                if (currentView === 'list') {
                    articlesGrid.classList.add('list-view');
                } else {
                    articlesGrid.classList.remove('list-view');
                }
            });
        });
    }
    
    // 导航栏滚动效果
    function setupNavScroll() {
        const nav = document.querySelector('.main-nav');
        if (!nav) return;
        
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // 滚动到文章区域
    function scrollToArticles() {
        const articlesSection = document.getElementById('articles');
        if (articlesSection) {
            const offset = 100;
            const elementPosition = articlesSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // 跳转到文章详情
    function goToArticle(articleId) {
        // 由于markdown文件需要转换，这里直接打开原始文件
        const article = articlesData.find(a => a.id === articleId);
        if (article) {
            window.open(`content/${article.fileName}`, '_blank');
        }
    }
    
    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // 获取分页文章
    function getArticlesPage(page = 1, perPage = 9) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return {
            articles: articlesData.slice(start, end),
            total: articlesData.length,
            totalPages: Math.ceil(articlesData.length / perPage),
            currentPage: page
        };
    }
    
    // 邮件订阅
    window.subscribeNewsletter = function(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;
        
        // 模拟订阅成功
        alert(`感谢订阅！我们会将最新资讯发送到 ${email}`);
        event.target.reset();
        return false;
    };
    
    // 显示关于弹窗
    window.showAbout = function() {
        alert('AI Agent被动收入系统\n\n由小七AI安全助手创建\n自动生成网络安全技术文章\n持续被动收入系统');
    };
    
    // 显示联系弹窗
    window.showContact = function() {
        alert('联系方式\n\n邮箱: contact@example.com\nGitHub: fabio2026-ui/ai-agent-passive-income');
    };
    
    // 显示隐私政策
    window.showPrivacy = function() {
        alert('隐私政策\n\n我们重视您的隐私。\n您的邮箱仅用于发送安全资讯，不会分享给第三方。');
    };
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 公开API
    window.MainAPI = {
        loadArticles: loadArticles,
        goToArticle: goToArticle,
        getArticlesPage: getArticlesPage
    };
})();
