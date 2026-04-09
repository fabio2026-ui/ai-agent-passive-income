/**
 * AI Agent被动收入系统 - 搜索功能
 * 提供全文搜索和自动完成功能
 */

(function() {
    'use strict';

    // DOM元素
    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');
    
    // 搜索状态
    let searchTimeout = null;
    let selectedIndex = -1;
    
    // 初始化搜索
    function initSearch() {
        if (!searchInput || !searchResults) return;
        
        searchInput.addEventListener('input', handleInput);
        searchInput.addEventListener('keydown', handleKeydown);
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length >= 2) {
                performSearch(searchInput.value);
            }
        });
        
        // 点击外部关闭搜索结果
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                closeSearchResults();
            }
        });
    }
    
    // 处理输入
    function handleInput(e) {
        const query = e.target.value.trim();
        
        // 清除之前的定时器
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        if (query.length < 2) {
            closeSearchResults();
            return;
        }
        
        // 延迟搜索以提高性能
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 150);
    }
    
    // 处理键盘事件
    function handleKeydown(e) {
        const items = searchResults.querySelectorAll('.search-dropdown-item');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    items[selectedIndex].click();
                } else if (searchInput.value.trim()) {
                    // 如果没有选择项，执行搜索跳转
                    goToSearchPage(searchInput.value.trim());
                }
                break;
            case 'Escape':
                closeSearchResults();
                searchInput.blur();
                break;
        }
    }
    
    // 更新选择状态
    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.style.background = 'rgba(102, 126, 234, 0.1)';
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.background = '';
            }
        });
    }
    
    // 执行搜索
    function performSearch(query) {
        if (typeof articlesData === 'undefined') {
            console.warn('articlesData not loaded');
            return;
        }
        
        const results = searchArticles(query);
        renderSearchResults(results, query);
    }
    
    // 搜索文章
    function searchArticles(query) {
        const lowerQuery = query.toLowerCase();
        return articlesData.filter(article => 
            article.title.toLowerCase().includes(lowerQuery) ||
            article.excerpt.toLowerCase().includes(lowerQuery) ||
            article.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            article.categoryName.toLowerCase().includes(lowerQuery)
        ).slice(0, 8); // 最多显示8个结果
    }
    
    // 渲染搜索结果
    function renderSearchResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-dropdown-item">
                    <div class="title">未找到相关文章</div>
                    <div class="category">尝试其他关键词...</div>
                </div>
            `;
            searchResults.classList.add('active');
            return;
        }
        
        const html = results.map((article, index) => {
            // 高亮匹配的关键词
            const highlightedTitle = highlightText(article.title, query);
            
            return `
                <div class="search-dropdown-item" data-index="${index}" data-article-id="${article.id}">
                    <div class="title">${highlightedTitle}</div>
                    <div class="category">${article.categoryName} · ${article.tags.slice(0, 2).join(', ')}</div>
                </div>
            `;
        }).join('');
        
        searchResults.innerHTML = html;
        searchResults.classList.add('active');
        selectedIndex = -1;
        
        // 添加点击事件
        searchResults.querySelectorAll('.search-dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const articleId = item.dataset.articleId;
                goToArticle(articleId);
            });
        });
    }
    
    // 高亮文本
    function highlightText(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark style="background: rgba(102, 126, 234, 0.3); padding: 2px 4px; border-radius: 3px;">$1</mark>');
    }
    
    // 转义正则特殊字符
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // 关闭搜索结果
    function closeSearchResults() {
        searchResults.classList.remove('active');
        selectedIndex = -1;
    }
    
    // 跳转到文章
    function goToArticle(articleId) {
        const article = articlesData.find(a => a.id === articleId);
        if (article) {
            window.location.href = `article.html?id=${articleId}`;
        }
    }
    
    // 跳转到搜索页面
    function goToSearchPage(query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearch);
    } else {
        initSearch();
    }
    
    // 公开API
    window.SearchAPI = {
        search: searchArticles,
        goToArticle: goToArticle,
        goToSearchPage: goToSearchPage
    };
})();
