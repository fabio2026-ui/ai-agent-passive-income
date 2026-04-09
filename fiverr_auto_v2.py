#!/usr/bin/env python3
"""
🤖 Fiverr自动化操作脚本
假设：已经登录Fiverr
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

print("🚀 开始Fiverr自动化操作...")

# 启动Chrome（假设已经有一个浏览器实例，或者新建）
# 如果用户已经有一个浏览器开着，我们需要连接到它
# 但通常Selenium会启动新的，所以我们新建一个

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 15)

try:
    # 1. 打开Fiverr
    print("📱 打开Fiverr...")
    driver.get("https://www.fiverr.com")
    time.sleep(3)
    
    # 2. 点击头像/用户名打开菜单
    print("👤 点击用户菜单...")
    # 通常头像在右上角
    try:
        profile_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@data-testid='user-menu-button'] | //a[contains(@href, '/users/')] | //div[contains(@class, 'user-menu')]")))
        profile_button.click()
        print("✅ 已点击用户菜单")
        time.sleep(2)
    except:
        print("⚠️  尝试其他方式找到Profile链接...")
        # 尝试直接访问Profile页面
        driver.get("https://www.fiverr.com/users/fabiofu/profile")  # 假设用户名是fabiofu
        print("✅ 直接访问Profile页面")
    
    # 3. 点击Profile或Edit Profile
    print("📝 寻找Edit Profile按钮...")
    try:
        edit_profile = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Edit Profile')] | //button[contains(text(), 'Edit Profile')]")))
        edit_profile.click()
        print("✅ 已点击Edit Profile")
        time.sleep(3)
    except:
        print("⚠️  可能需要手动点击Edit Profile")
    
    # 4. 填写Profile描述
    print("📄 填写Profile描述...")
    bio_text = """🎬 AI Video Growth Specialist | Helping Creators & Brands Go Viral

I'm not just a video editor—I'm your AI-powered video growth partner.

With 3+ years of experience and cutting-edge AI tools, I help content creators and businesses:
✓ Increase video engagement by 300%
✓ Grow follower count by 10K+/month
✓ Achieve 1M+ views on viral content
✓ Convert viewers into customers

My AI-Enhanced Workflow Delivers:
🤖 Smart editing that learns what works
📊 Data-driven content optimization
⚡ 24-hour turnaround guaranteed
🎯 Platform-specific optimization (TikTok/Reels/Shorts)
📈 Viral hook formulas based on trending data

Let's turn your content into a growth machine! 🚀"""
    
    try:
        bio_field = wait.until(EC.presence_of_element_located((By.XPATH, "//textarea[contains(@name, 'description')] | //textarea[contains(@id, 'description')] | //div[@contenteditable='true']")))
        bio_field.clear()
        bio_field.send_keys(bio_text)
        print("✅ 已填写Profile描述")
    except:
        print("⚠️  需要手动填写Profile描述")
    
    # 5. 截图确认
    driver.save_screenshot("/tmp/fiverr_profile_filled.png")
    print("✅ 截图已保存到 /tmp/fiverr_profile_filled.png")
    
    print("\n🎉 自动化操作完成！")
    print("请检查：")
    print("1. Profile描述是否已填写")
    print("2. 点击Save按钮保存")
    print("3. 然后继续创建Gig")
    
    # 保持浏览器打开
    input("\n按回车关闭浏览器...")
    
except Exception as e:
    print(f"❌ 错误: {e}")
    driver.save_screenshot("/tmp/fiverr_error.png")
    print("错误截图已保存")
    
finally:
    driver.quit()
    print("✅ 浏览器已关闭")
