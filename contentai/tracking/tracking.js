/**
 * ContentAI 用户追踪系统
 * 集成UTM参数采集、用户行为追踪、转化归因
 * 
 * 使用方法:
 * 1. 在页面中引入: <script src="tracking.js"></script>
 * 2. 初始化: ContentAITracking.init()
 * 3. 记录转化: ContentAITracking.trackConversion('signup', { value: 0 })
 */

(function() {
    'use strict';

    const ContentAITracking = {
        config: {
            endpoint: '/api/track', // 数据上报接口
            cookieName: 'contentai_user_id',
            cookieExpiry: 365, // 天数
            debug: false
        },
        
        userId: null,
        sessionId: null,
        utmParams: {},

        /**
         * 初始化追踪系统
         */
        init: function(options) {
            Object.assign(this.config, options || {});
            
            // 获取或创建用户ID
            this.userId = this.getOrCreateUserId();
            
            // 生成会话ID
            this.sessionId = this.generateId();
            
            // 解析UTM参数
            this.utmParams = this.parseUtmParams();
            
            // 记录页面访问
            this.trackPageView();
            
            // 绑定事件监听
            this.bindEvents();
            
            if (this.config.debug) {
                console.log('[ContentAI Tracking] Initialized:', {
                    userId: this.userId,
                    sessionId: this.sessionId,
                    utmParams: this.utmParams
                });
            }
        },

        /**
         * 获取或创建用户ID
         */
        getOrCreateUserId: function() {
            let userId = this.getCookie(this.config.cookieName);
            if (!userId) {
                userId = this.generateId();
                this.setCookie(this.config.cookieName, userId, this.config.cookieExpiry);
            }
            return userId;
        },

        /**
         * 生成唯一ID
         */
        generateId: function() {
            return 'cai_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * 解析UTM参数
         */
        parseUtmParams: function() {
            const params = new URLSearchParams(window.location.search);
            return {
                source: params.get('utm_source') || 'direct',
                medium: params.get('utm_medium') || 'none',
                campaign: params.get('utm_campaign') || '',
                content: params.get('utm_content') || '',
                term: params.get('utm_term') || ''
            };
        },

        /**
         * 记录页面访问
         */
        trackPageView: function() {
            const data = {
                type: 'pageview',
                userId: this.userId,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                page: {
                    url: window.location.href,
                    path: window.location.pathname,
                    title: document.title,
                    referrer: document.referrer
                },
                utm: this.utmParams,
                device: this.getDeviceInfo()
            };
            
            this.send(data);
        },

        /**
         * 记录转化事件
         * @param {string} type - 转化类型: signup, purchase, etc.
         * @param {object} metadata - 额外数据
         */
        trackConversion: function(type, metadata) {
            metadata = metadata || {};
            
            const data = {
                type: 'conversion',
                userId: this.userId,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                conversion: {
                    type: type,
                    value: metadata.value || 0,
                    currency: metadata.currency || 'USD',
                    metadata: metadata
                },
                utm: this.utmParams,
                page: {
                    url: window.location.href,
                    path: window.location.pathname
                }
            };
            
            this.send(data);
            
            // 同时记录到本地存储用于调试
            this.logConversion(data);
        },

        /**
         * 记录收入
         * @param {number} amount - 金额
         * @param {string} productId - 产品ID
         * @param {object} metadata - 额外数据
         */
        trackRevenue: function(amount, productId, metadata) {
            metadata = metadata || {};
            
            const data = {
                type: 'revenue',
                userId: this.userId,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                revenue: {
                    amount: amount,
                    currency: metadata.currency || 'USD',
                    productId: productId,
                    productName: metadata.productName || '',
                    planType: metadata.planType || 'one_time',
                    metadata: metadata
                },
                utm: this.utmParams,
                page: {
                    url: window.location.href,
                    path: window.location.pathname
                }
            };
            
            this.send(data);
            this.logRevenue(data);
        },

        /**
         * 绑定事件监听
         */
        bindEvents: function() {
            // 追踪点击事件
            document.addEventListener('click', function(e) {
                const target = e.target.closest('a, button');
                if (target) {
                    ContentAITracking.trackEvent('click', {
                        element: target.tagName.toLowerCase(),
                        text: target.textContent.trim().substring(0, 50),
                        href: target.href || '',
                        id: target.id || '',
                        class: target.className || ''
                    });
                }
            });

            // 追踪表单提交
            document.addEventListener('submit', function(e) {
                const form = e.target;
                ContentAITracking.trackEvent('form_submit', {
                    formId: form.id || '',
                    formAction: form.action || '',
                    formMethod: form.method || 'get'
                });
            });

            // 页面卸载时发送剩余数据
            window.addEventListener('beforeunload', function() {
                ContentAITracking.flushQueue();
            });
        },

        /**
         * 记录自定义事件
         */
        trackEvent: function(eventName, properties) {
            const data = {
                type: 'event',
                userId: this.userId,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                event: {
                    name: eventName,
                    properties: properties || {}
                },
                utm: this.utmParams,
                page: {
                    url: window.location.href,
                    path: window.location.pathname
                }
            };
            
            this.send(data);
        },

        /**
         * 获取设备信息
         */
        getDeviceInfo: function() {
            const ua = navigator.userAgent;
            return {
                userAgent: ua,
                screenSize: screen.width + 'x' + screen.height,
                viewport: window.innerWidth + 'x' + window.innerHeight,
                language: navigator.language,
                platform: navigator.platform,
                deviceType: this.getDeviceType(ua),
                browser: this.getBrowser(ua),
                os: this.getOS(ua)
            };
        },

        /**
         * 判断设备类型
         */
        getDeviceType: function(ua) {
            if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
                return /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
            }
            return 'desktop';
        },

        /**
         * 获取浏览器信息
         */
        getBrowser: function(ua) {
            if (/Chrome/i.test(ua)) return 'Chrome';
            if (/Firefox/i.test(ua)) return 'Firefox';
            if (/Safari/i.test(ua)) return 'Safari';
            if (/Edge/i.test(ua)) return 'Edge';
            return 'Unknown';
        },

        /**
         * 获取操作系统
         */
        getOS: function(ua) {
            if (/Windows/i.test(ua)) return 'Windows';
            if (/Mac/i.test(ua)) return 'MacOS';
            if (/Linux/i.test(ua)) return 'Linux';
            if (/Android/i.test(ua)) return 'Android';
            if (/iOS|iPhone|iPad/i.test(ua)) return 'iOS';
            return 'Unknown';
        },

        /**
         * 发送数据到服务器
         */
        send: function(data) {
            // 使用 Beacon API 确保数据发送
            if (navigator.sendBeacon) {
                navigator.sendBeacon(this.config.endpoint, JSON.stringify(data));
            } else {
                // 降级使用 fetch
                fetch(this.config.endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    keepalive: true
                }).catch(function() {
                    // 失败时存入队列
                    ContentAITracking.queueData(data);
                });
            }
        },

        /**
         * 数据队列（用于离线或发送失败时）
         */
        dataQueue: [],
        
        queueData: function(data) {
            this.dataQueue.push(data);
            localStorage.setItem('contentai_tracking_queue', JSON.stringify(this.dataQueue));
        },

        flushQueue: function() {
            const queue = JSON.parse(localStorage.getItem('contentai_tracking_queue') || '[]');
            if (queue.length === 0) return;
            
            queue.forEach(function(data) {
                navigator.sendBeacon && navigator.sendBeacon(ContentAITracking.config.endpoint, JSON.stringify(data));
            });
            
            localStorage.removeItem('contentai_tracking_queue');
        },

        /**
         * Cookie 操作
         */
        getCookie: function(name) {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        },

        setCookie: function(name, value, days) {
            const expires = new Date(Date.now() + days * 864e5).toUTCString();
            document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
        },

        /**
         * 本地日志（用于调试）
         */
        logConversion: function(data) {
            const logs = JSON.parse(localStorage.getItem('contentai_conversions') || '[]');
            logs.push(data);
            localStorage.setItem('contentai_conversions', JSON.stringify(logs.slice(-50)));
        },

        logRevenue: function(data) {
            const logs = JSON.parse(localStorage.getItem('contentai_revenue') || '[]');
            logs.push(data);
            localStorage.setItem('contentai_revenue', JSON.stringify(logs.slice(-50)));
        },

        /**
         * 获取追踪数据摘要
         */
        getSummary: function() {
            return {
                userId: this.userId,
                sessionId: this.sessionId,
                utmParams: this.utmParams,
                conversions: JSON.parse(localStorage.getItem('contentai_conversions') || '[]'),
                revenue: JSON.parse(localStorage.getItem('contentai_revenue') || '[]')
            };
        }
    };

    // 暴露到全局
    window.ContentAITracking = ContentAITracking;

    // 自动初始化（如果不需要自定义配置）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ContentAITracking.init();
        });
    } else {
        ContentAITracking.init();
    }
})();

// ============================================
// 使用示例
// ============================================

// 基础初始化
// ContentAITracking.init();

// 带配置的初始化
// ContentAITracking.init({
//     endpoint: '/api/track',
//     debug: true
// });

// 记录注册转化
// ContentAITracking.trackConversion('signup');

// 记录付费转化
// ContentAITracking.trackConversion('purchase', {
//     value: 29,
//     currency: 'USD',
//     plan: 'monthly'
// });

// 记录收入
// ContentAITracking.trackRevenue(29, 'plan_monthly', {
//     productName: 'Monthly Plan',
//     planType: 'monthly'
// });

// 记录自定义事件
// ContentAITracking.trackEvent('video_play', {
//     videoId: 'intro_2024',
//     duration: 120
// });
