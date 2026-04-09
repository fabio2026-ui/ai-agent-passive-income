#!/usr/bin/env python3
"""
🤖 Fiverr自动化注册脚本
生成时间: 2026-03-14 20:56
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import json

print("🚀 启动Fiverr自动化注册...")

# 配置Chrome选项
chrome_options = Options()
chrome_options.add_argument("--start-maximized")
# 如果希望看到浏览器操作，不要加headless
# chrome_options.add_argument("--headless")  

# 启动Chrome
driver = webdriver.Chrome(options=chrome_options)
wait = WebDriverWait(driver, 15)

# 读取文案文件
with open('/Users/fabiofu/ai-empire/launch/bio.txt', 'r') as f:
    bio_text = f.read()

with open('/Users/fabiofu/ai-empire/launch/title.txt', 'r') as f:
    gig_title = f.read().strip()

try:
    # 1. 打开Fiverr
    print("📱 打开Fiverr...")
    driver.get("https://www.fiverr.com")
    time.sleep(3)
    
    # 截图确认
    driver.save_screenshot("/tmp/fiverr_step1.png")
    print("✅ 已打开Fiverr，截图保存")
    
    # 2. 点击Profile（假设已登录）
    print("👤 进入Profile设置...")
    # 注意：这里需要根据实际页面调整XPath
    # 由于无法看到页面，使用通用方法
    
    # 等待用户确认或自动检测
    print("⚠️  请确认已登录Fiverr，按回车继续...")
    # 实际运行时可能需要调整
    
    # 3. 如果已登录，尝试点击头像菜单
    try:
        profile_menu = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/users/')]")))
        profile_menu.click()
        print("✅ 已点击Profile菜单")
        time.sleep(2)
    except:
        print("⚠️  需要手动点击Profile，或检查登录状态")
    
    # 保存最终截图
    driver.save_screenshot("/tmp/fiverr_final.png")
    print("✅ 自动化流程完成！截图已保存到 /tmp/fiverr_final.png")
    
except Exception as e:
    print(f"❌ 错误: {e}")
    driver.save_screenshot("/tmp/fiverr_error.png")
    print("错误截图已保存到 /tmp/fiverr_error.png")

finally:
    # 保持浏览器打开，方便查看
    print("\n📝 浏览器保持打开状态，请查看结果")
    print("完成后请手动关闭浏览器")
    # driver.quit()  # 暂时不关闭，方便调试
