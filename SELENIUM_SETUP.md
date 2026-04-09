# 🔧 Selenium浏览器自动化安装指南

========================================
📦 安装步骤
========================================

## 步骤1: 安装Selenium

在你的Mac终端执行：

```bash
pip3 install selenium
```

## 步骤2: 安装ChromeDriver

ChromeDriver是Chrome浏览器的自动化驱动。

### 方法A: 使用Homebrew安装（推荐）
```bash
brew install chromedriver
```

### 方法B: 手动下载安装
1. 查看Chrome版本：打开Chrome → 地址栏输入 `chrome://version`
2. 下载对应版本的ChromeDriver：https://chromedriver.chromium.org/downloads
3. 解压并移动到PATH：
```bash
mv chromedriver /usr/local/bin/
chmod +x /usr/local/bin/chromedriver
```

## 步骤3: 验证安装

```bash
chromedriver --version
selenium --version 2>/dev/null || python3 -c "import selenium; print(selenium.__version__)"
```

========================================
🤖 创建浏览器控制脚本
========================================

创建文件 `~/browser_bot.py`：

```python
#!/usr/bin/env python3
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

class BrowserBot:
    def __init__(self):
        # 配置Chrome选项
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        # chrome_options.add_argument("--headless")  # 无头模式（不显示窗口）
        
        # 启动Chrome
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
    
    def open_url(self, url):
        """打开网页"""
        self.driver.get(url)
        print(f"✅ 已打开: {url}")
    
    def find_element(self, by, value):
        """查找元素"""
        return self.wait.until(EC.presence_of_element_located((by, value)))
    
    def click(self, xpath):
        """点击元素"""
        element = self.find_element(By.XPATH, xpath)
        element.click()
        print(f"✅ 已点击: {xpath}")
    
    def type_text(self, xpath, text):
        """输入文本"""
        element = self.find_element(By.XPATH, xpath)
        element.clear()
        element.send_keys(text)
        print(f"✅ 已输入: {text}")
    
    def get_page_source(self):
        """获取页面HTML"""
        return self.driver.page_source
    
    def screenshot(self, filename):
        """截图"""
        self.driver.save_screenshot(filename)
        print(f"✅ 截图已保存: {filename}")
    
    def close(self):
        """关闭浏览器"""
        self.driver.quit()
        print("✅ 浏览器已关闭")

# 测试代码
if __name__ == "__main__":
    bot = BrowserBot()
    bot.open_url("https://www.fiverr.com")
    time.sleep(3)
    bot.screenshot("~/fiverr_test.png")
    bot.close()
```

========================================
⚡ 安装执行命令
========================================

**一键安装（复制粘贴执行）：**

```bash
# 1. 安装selenium
pip3 install selenium

# 2. 安装ChromeDriver
brew install chromedriver 2>/dev/null || echo "手动安装ChromeDriver"

# 3. 创建浏览器控制脚本
cat > ~/browser_bot.py << 'EOF'
#!/usr/bin/env python3
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

class BrowserBot:
    def __init__(self):
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
    
    def open_url(self, url):
        self.driver.get(url)
        print(f"已打开: {url}")
    
    def click(self, xpath):
        element = self.wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
        element.click()
        print(f"已点击: {xpath}")
    
    def type_text(self, xpath, text):
        element = self.wait.until(EC.presence_of_element_located((By.XPATH, xpath)))
        element.clear()
        element.send_keys(text)
        print(f"已输入: {text}")
    
    def screenshot(self, filename):
        self.driver.save_screenshot(filename)
        print(f"截图: {filename}")
    
    def close(self):
        self.driver.quit()

if __name__ == "__main__":
    bot = BrowserBot()
    bot.open_url("https://www.fiverr.com")
    time.sleep(3)
    bot.screenshot("/tmp/fiverr_test.png")
    bot.close()
EOF

# 4. 测试
python3 ~/browser_bot.py
```

========================================
🎯 安装后我能做什么
========================================

**Selenium可以让我：**
1. ✅ 打开Chrome浏览器
2. ✅ 访问Fiverr网站
3. ✅ 点击按钮和链接
4. ✅ 输入文本（Profile描述、Gig标题等）
5. ✅ 上传图片
6. ✅ 截图验证
7. ✅ 自动完成整个注册流程

**你只需：**
1. 安装Selenium和ChromeDriver（5分钟）
2. 运行我生成的Python脚本
3. 看着浏览器自动操作

========================================
⚡ 现在执行
========================================

**复制粘贴执行安装命令：**

```bash
pip3 install selenium && brew install chromedriver
```

**然后告诉我：**
- 安装成功了吗？
- 有什么错误提示？

========================================
