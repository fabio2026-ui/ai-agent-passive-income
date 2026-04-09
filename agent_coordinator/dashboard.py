"""
Web Dashboard服务器
提供实时监控界面
"""
import asyncio
import json
from aiohttp import web
from typing import Set


class DashboardServer:
    """Dashboard Web服务器"""
    
    def __init__(self, coordinator, port: int = 8080):
        self.coordinator = coordinator
        self.port = port
        self.app = web.Application()
        self.websockets: Set[web.WebSocketResponse] = set()
        self._setup_routes()
        
    def _setup_routes(self):
        """设置路由"""
        self.app.router.add_get("/", self.index)
        self.app.router.add_get("/api/status", self.api_status)
        self.app.router.add_get("/api/agents", self.api_agents)
        self.app.router.add_get("/api/tasks", self.api_tasks)
        self.app.router.add_post("/api/tasks", self.api_create_task)
        self.app.router.add_post("/api/agents/{session_key}/kill", self.api_kill_agent)
        self.app.router.add_post("/api/agents/{session_key}/steer", self.api_steer_agent)
        self.app.router.add_get("/ws", self.websocket_handler)
        self.app.router.add_static("/static", "/root/.openclaw/workspace/agent_coordinator/static")
        
    async def start(self):
        """启动服务器"""
        runner = web.AppRunner(self.app)
        await runner.setup()
        site = web.TCPSite(runner, "0.0.0.0", self.port)
        await site.start()
        print(f"[Dashboard] Running at http://0.0.0.0:{self.port}")
        
        # 启动广播循环
        asyncio.create_task(self._broadcast_loop())
        
    async def index(self, request):
        """首页"""
        return web.FileResponse("/root/.openclaw/workspace/agent_coordinator/static/index.html")
        
    async def api_status(self, request):
        """API: 系统状态"""
        return web.json_response(self.coordinator.get_system_status())
        
    async def api_agents(self, request):
        """API: 获取所有Agent"""
        return web.json_response({
            "agents": self.coordinator.get_all_agents()
        })
        
    async def api_tasks(self, request):
        """API: 获取所有任务"""
        return web.json_response(self.coordinator.get_all_tasks())
        
    async def api_create_task(self, request):
        """API: 创建任务"""
        try:
            data = await request.json()
            task_id = await self.coordinator.submit_task(
                title=data.get("title", ""),
                description=data.get("description", ""),
                priority=data.get("priority", 3)
            )
            return web.json_response({"success": True, "task_id": task_id})
        except Exception as e:
            return web.json_response({"success": False, "error": str(e)}, status=400)
            
    async def api_kill_agent(self, request):
        """API: 终止Agent"""
        session_key = request.match_info["session_key"]
        result = await self.coordinator.kill_agent(session_key)
        return web.json_response(result)
        
    async def api_steer_agent(self, request):
        """API: 向Agent发送指令"""
        session_key = request.match_info["session_key"]
        try:
            data = await request.json()
            result = await self.coordinator.steer_agent(session_key, data.get("message", ""))
            return web.json_response(result)
        except Exception as e:
            return web.json_response({"success": False, "error": str(e)}, status=400)
            
    async def websocket_handler(self, request):
        """WebSocket处理"""
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        self.websockets.add(ws)
        
        try:
            async for msg in ws:
                if msg.type == web.WSMsgType.TEXT:
                    # 处理客户端消息
                    try:
                        data = json.loads(msg.data)
                        await self._handle_ws_message(ws, data)
                    except:
                        pass
                elif msg.type == web.WSMsgType.ERROR:
                    print(f"[Dashboard] WebSocket error: {ws.exception()}")
        finally:
            self.websockets.discard(ws)
            
        return ws
        
    async def _handle_ws_message(self, ws: web.WebSocketResponse, data: dict):
        """处理WebSocket消息"""
        action = data.get("action")
        
        if action == "ping":
            await ws.send_json({"type": "pong", "time": data.get("time")})
        elif action == "get_status":
            await ws.send_json({
                "type": "status",
                "data": self.coordinator.get_system_status()
            })
            
    async def _broadcast_loop(self):
        """广播循环"""
        while True:
            try:
                if self.websockets:
                    message = {
                        "type": "update",
                        "data": {
                            "agents": self.coordinator.get_all_agents(),
                            "tasks": self.coordinator.get_all_tasks(),
                            "status": self.coordinator.get_system_status()
                        }
                    }
                    
                    # 广播给所有客户端
                    disconnected = set()
                    for ws in self.websockets:
                        try:
                            await ws.send_json(message)
                        except:
                            disconnected.add(ws)
                            
                    # 清理断开的连接
                    self.websockets -= disconnected
                    
                await asyncio.sleep(2)  # 每2秒更新一次
            except Exception as e:
                print(f"[Dashboard] Broadcast error: {e}")
                await asyncio.sleep(1)
