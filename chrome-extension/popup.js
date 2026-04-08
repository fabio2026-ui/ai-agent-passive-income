// Search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const articles = document.querySelectorAll('.article-item');
  
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    
    articles.forEach(article => {
      const title = article.querySelector('.article-title').textContent.toLowerCase();
      const desc = article.querySelector('.article-desc').textContent.toLowerCase();
      
      if (title.includes(query) || desc.includes(query)) {
        article.style.display = 'flex';
      } else {
        article.style.display = 'none';
      }
    });
    
    // Hide empty categories
    document.querySelectorAll('.category').forEach(category => {
      const visibleArticles = category.querySelectorAll('.article-item[style="display: flex;"], .article-item:not([style*="none"])');
      category.style.display = visibleArticles.length > 0 ? 'block' : 'none';
    });
  });
  
  // Track article clicks
  articles.forEach(article => {
    article.addEventListener('click', function() {
      const title = this.querySelector('.article-title').textContent;
      console.log('Article clicked:', title);
      // Could send analytics here
    });
  });
});
