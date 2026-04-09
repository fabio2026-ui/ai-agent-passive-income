#!/usr/bin/env python3
"""
AI Life Copilot - iOS TestFlight打包助手
生成完整的Xcode项目，用WKWebView包装Web App
最快方式：不用重写，直接包装现有Web代码
"""

import os
import json

def generate_ios_project():
    """生成iOS项目结构"""
    
    project_dir = "/root/ai-empire/ios/AI-Life-Copilot"
    os.makedirs(f"{project_dir}/AI-Life-Copilot", exist_ok=True)
    
    # 1. AppDelegate.swift
    app_delegate = '''import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
}
'''
    
    # 2. SceneDelegate.swift
    scene_delegate = '''import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        window = UIWindow(windowScene: windowScene)
        let vc = ViewController()
        window?.rootViewController = vc
        window?.makeKeyAndVisible()
    }
}
'''
    
    # 3. ViewController.swift - WKWebView包装
    view_controller = '''import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate {
    
    var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // WKWebView配置
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        
        // 支持本地存储
        let preferences = WKPreferences()
        preferences.javaScriptEnabled = true
        config.preferences = preferences
        
        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.navigationDelegate = self
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(webView)
        
        // 加载本地HTML
        if let htmlPath = Bundle.main.path(forResource: "index", ofType: "html") {
            let url = URL(fileURLWithPath: htmlPath)
            let request = URLRequest(url: url)
            webView.load(request)
        }
    }
    
    // 支持全屏显示（隐藏状态栏）
    override var prefersStatusBarHidden: Bool {
        return false
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
}
'''
    
    # 4. Info.plist
    info_plist = '''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>zh_CN</string>
    <key>CFBundleDisplayName</key>
    <string>AI Life Copilot</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>com.aiempire.lifecopilot</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIApplicationSceneManifest</key>
    <dict>
        <key>UIApplicationSupportsMultipleScenes</key>
        <false/>
        <key>UISceneConfigurations</key>
        <dict>
            <key>UIWindowSceneSessionRoleApplication</key>
            <array>
                <dict>
                    <key>UISceneConfigurationName</key>
                    <string>Default Configuration</string>
                    <key>UISceneDelegateClassName</key>
                    <string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
                </dict>
            </array>
        </dict>
    </dict>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
</dict>
</plist>
'''
    
    # 5. 复制Web App HTML
    webapp_html = open('/root/ai-empire/webapp/index.html').read()
    
    # 保存所有文件
    with open(f"{project_dir}/AI-Life-Copilot/AppDelegate.swift", 'w') as f:
        f.write(app_delegate)
    
    with open(f"{project_dir}/AI-Life-Copilot/SceneDelegate.swift", 'w') as f:
        f.write(scene_delegate)
        
    with open(f"{project_dir}/AI-Life-Copilot/ViewController.swift", 'w') as f:
        f.write(view_controller)
    
    with open(f"{project_dir}/AI-Life-Copilot/Info.plist", 'w') as f:
        f.write(info_plist)
    
    with open(f"{project_dir}/AI-Life-Copilot/index.html", 'w') as f:
        f.write(webapp_html)
    
    # 6. 生成项目文件
    generate_xcode_project(project_dir)
    
    return project_dir

def generate_xcode_project(project_dir):
    """生成Xcode项目文件（简化版，需要手动打开）"""
    
    # 创建xcodeproj目录结构
    xcodeproj_dir = f"{project_dir}/AI-Life-Copilot.xcodeproj"
    os.makedirs(xcodeproj_dir, exist_ok=True)
    
    # project.pbxproj (简化模板)
    pbxproj_content = '''// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 55;
	objects = {

/* Begin PBXBuildFile section */
		AA0000001 /* AppDelegate.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0000002 /* AppDelegate.swift */; };
		AA0000003 /* SceneDelegate.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0000004 /* SceneDelegate.swift */; };
		AA0000005 /* ViewController.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0000006 /* ViewController.swift */; };
		AA0000007 /* index.html in Resources */ = {isa = PBXBuildFile; fileRef = AA0000008 /* index.html */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		AA0000000 /* AI-Life-Copilot.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "AI-Life-Copilot.app"; sourceTree = BUILT_PRODUCTS_DIR; };
		AA0000002 /* AppDelegate.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = AppDelegate.swift; sourceTree = "<group>"; };
		AA0000004 /* SceneDelegate.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = SceneDelegate.swift; sourceTree = "<group>"; };
		AA0000006 /* ViewController.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = ViewController.swift; sourceTree = "<group>"; };
		AA0000008 /* index.html */ = {isa = PBXFileReference; lastKnownFileType = text.html; path = index.html; sourceTree = "<group>"; };
		AA0000009 /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		AA0000010 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		AA0000011 = {
			isa = PBXGroup;
			children = (
				AA0000012 /* AI-Life-Copilot */,
				AA0000013 /* Products */,
			);
			sourceTree = "<group>";
		};
		AA0000012 /* AI-Life-Copilot */ = {
			isa = PBXGroup;
			children = (
				AA0000002 /* AppDelegate.swift */,
				AA0000004 /* SceneDelegate.swift */,
				AA0000006 /* ViewController.swift */,
				AA0000008 /* index.html */,
				AA0000009 /* Info.plist */,
			);
			path = "AI-Life-Copilot";
			sourceTree = "<group>";
		};
		AA0000013 /* Products */ = {
			isa = PBXGroup;
			children = (
				AA0000000 /* AI-Life-Copilot.app */,
			);
			name = Products;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		AA0000014 /* AI-Life-Copilot */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = AA0000015 /* Build configuration list for PBXNativeTarget "AI-Life-Copilot" */;
			buildPhases = (
				AA0000016 /* Sources */,
				AA0000010 /* Frameworks */,
				AA0000017 /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = "AI-Life-Copilot";
			productName = "AI-Life-Copilot";
			productReference = AA0000000 /* AI-Life-Copilot.app */;
			productType = "com.apple.product-type.application";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		AA0000018 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 1300;
				LastUpgradeCheck = 1300;
				TargetAttributes = {
					AA0000014 = {
						CreatedOnToolsVersion = 13.0;
					};
				};
			};
			buildConfigurationList = AA0000019 /* Build configuration list for PBXProject "AI-Life-Copilot" */;
			compatibilityVersion = "Xcode 13.0";
			developmentRegion = zhCN;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
				zhCN,
			);
			mainGroup = AA0000011;
			productRefGroup = AA0000013 /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				AA0000014 /* AI-Life-Copilot */,
			);
		};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		AA0000017 /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				AA0000007 /* index.html in Resources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		AA0000016 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				AA0000001 /* AppDelegate.swift in Sources */,
				AA0000003 /* SceneDelegate.swift in Sources */,
				AA0000005 /* ViewController.swift in Sources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		AA0000020 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++17";
				IPHONEOS_DEPLOYMENT_TARGET = 15.0;
				MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
				ONLY_ACTIVE_ARCH = YES;
				SDKROOT = iphoneos;
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG;
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
			};
			name = Debug;
		};
		AA0000021 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				IPHONEOS_DEPLOYMENT_TARGET = 15.0;
				SDKROOT = iphoneos;
				SWIFT_OPTIMIZATION_LEVEL = "-O";
			};
			name = Release;
		};
		AA0000022 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				INFOPLIST_FILE = "AI-Life-Copilot/Info.plist";
				IPHONEOS_DEPLOYMENT_TARGET = 15.0;
				MARKETING_VERSION = 1.0.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.aiempire.lifecopilot;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		AA0000023 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				INFOPLIST_FILE = "AI-Life-Copilot/Info.plist";
				IPHONEOS_DEPLOYMENT_TARGET = 15.0;
				MARKETING_VERSION = 1.0.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.aiempire.lifecopilot;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Release;
		};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		AA0000019 /* Build configuration list for PBXProject "AI-Life-Copilot" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				AA0000020 /* Debug */,
				AA0000021 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		AA0000015 /* Build configuration list for PBXNativeTarget "AI-Life-Copilot" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				AA0000022 /* Debug */,
				AA0000023 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
/* End XCConfigurationList section */
	};
	rootObject = AA0000018 /* Project object */;
}
'''
    
    with open(f"{xcodeproj_dir}/project.pbxproj", 'w') as f:
        f.write(pbxproj_content)

if __name__ == "__main__":
    project_path = generate_ios_project()
    print(f"✅ iOS项目已生成: {project_path}")
    print("\n📁 项目结构:")
    print("  AI-Life-Copilot.xcodeproj/  - Xcode项目文件")
    print("  AI-Life-Copilot/")
    print("    ├── AppDelegate.swift     - 应用入口")
    print("    ├── SceneDelegate.swift   - 场景管理")
    print("    ├── ViewController.swift  - WebView包装")
    print("    ├── index.html           - Web App代码")
    print("    └── Info.plist          - 应用配置")
    print("\n🚀 下一步: 用Xcode打开项目，连接iPhone，点击Run")
