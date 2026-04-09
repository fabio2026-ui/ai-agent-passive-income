.PHONY: help preview deploy-ipfs deploy-github deploy-netlify deploy-surge deploy-all

help:
	@echo "ContentAI Code Review - 部署工具"
	@echo ""
	@echo "可用命令:"
	@echo "  make preview          - 本地预览"
	@echo "  make deploy-ipfs      - 部署到IPFS (Pinata)"
	@echo "  make deploy-github    - 部署到GitHub Pages"
	@echo "  make deploy-netlify   - 部署到Netlify"
	@echo "  make deploy-surge     - 部署到Surge"
	@echo "  make build            - 构建（检查文件）"
	@echo "  make clean            - 清理临时文件"

preview:
	@echo "启动本地服务器..."
	@python3 -m http.server 8080 || python -m SimpleHTTPServer 8080 || echo "请手动用浏览器打开index.html"

deploy-ipfs:
	@bash deploy.sh

deploy-github:
	@echo "GitHub Pages部署步骤:"
	@echo "1. 创建GitHub仓库"
	@echo "2. 推送代码: git push origin main"
	@echo "3. 在Settings -> Pages中启用"

deploy-netlify:
	@echo "Netlify部署步骤:"
	@echo "1. 访问 https://app.netlify.com/drop"
	@echo "2. 拖拽index.html"

deploy-surge:
	@which surge > /dev/null || npm install -g surge
	@surge

build:
	@echo "检查文件..."
	@test -f index.html && echo "✅ index.html 存在" || echo "❌ index.html 缺失"
	@echo "文件大小: $$(ls -lh index.html | awk '{print $$5}')"
	@echo "行数: $$(wc -l < index.html)"

clean:
	@rm -rf .tmp *.tmp
	@echo "清理完成"
