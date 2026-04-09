"""
事件总线 - 支持组件间通信
"""
import asyncio
from typing import Callable, Dict, List


class EventBus:
    """异步事件总线"""
    
    def __init__(self):
        self._handlers: Dict[str, List[Callable]] = {}
        self._lock = asyncio.Lock()
        
    async def on(self, event: str, handler: Callable):
        """订阅事件"""
        async with self._lock:
            if event not in self._handlers:
                self._handlers[event] = []
            self._handlers[event].append(handler)
            
    async def off(self, event: str, handler: Callable):
        """取消订阅"""
        async with self._lock:
            if event in self._handlers and handler in self._handlers[event]:
                self._handlers[event].remove(handler)
                
    async def emit(self, event: str, data: dict = None):
        """触发事件"""
        handlers = []
        async with self._lock:
            handlers = self._handlers.get(event, []).copy()
            
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    asyncio.create_task(handler(data))
                else:
                    handler(data)
            except Exception as e:
                print(f"[EventBus] Handler error for {event}: {e}")
