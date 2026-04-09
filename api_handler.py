"""
API处理模块 - 更多代码质量问题
"""

import http.server
import urllib.parse
import json

class APIHandler(http.server.BaseHTTPRequestHandler):
    """API处理器"""
    
    routes={}
    
    @classmethod
    def register(cls,path,handler):
        cls.routes[path]=handler
    
    def do_GET(self):
        """处理GET请求"""
        parsed=urllib.parse.urlparse(self.path)
        path=parsed.path
        query=urllib.parse.parse_qs(parsed.query)
        
        if path in self.routes:
            try:
                result=self.routes[path](query)
                self.send_response(200)
                self.send_header('Content-Type','application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
            except Exception as e:
                self.send_error(500,str(e))
        else:
            self.send_error(404,'Not Found')
    
    def do_POST(self):
        """处理POST请求"""
        content_length=int(self.headers.get('Content-Length',0))
        body=self.rfile.read(content_length)
        
        try:
            data=json.loads(body)
        except:
            data={}
        
        parsed=urllib.parse.urlparse(self.path)
        path=parsed.path
        
        if path=='/api/users':
            # 问题：没有权限检查
            self.create_user(data)
        elif path=='/api/login':
            self.login(data)
        else:
            self.send_error(404,'Not Found')
    
    def create_user(self,data):
        """创建用户"""
        # 问题：没有输入验证
        # 问题：没有事务处理
        from bad_code_example import manager
        
        name=data.get('name')
        pwd=data.get('password')
        email=data.get('email')
        
        if name and pwd and email:
            user=manager.addUser(name,pwd,email)
            self.send_response(201)
            self.send_header('Content-Type','application/json')
            self.end_headers()
            self.wfile.write(json.dumps(user).encode())
        else:
            self.send_error(400,'Missing required fields')
    
    def login(self,data):
        """登录"""
        from bad_code_example import manager
        
        name=data.get('name')
        pwd=data.get('password')
        
        if manager.login(name,pwd):
            # 问题：没有使用安全的session管理
            self.send_response(200)
            self.send_header('Set-Cookie','session=abc123')
            self.end_headers()
            self.wfile.write(b'{"success":true}')
        else:
            self.send_error(401,'Unauthorized')
    
    def log_message(self,format,*args):
        """日志记录"""
        # 问题：敏感信息可能泄露到日志
        print(format%args)


class OrderService:
    """订单服务 - 业务逻辑问题"""
    
    def __init__(self):
        self.orders=[]
    
    def create_order(self,user_id,items):
        """创建订单"""
        # 问题：没有库存检查
        # 问题：没有价格计算
        # 问题：没有并发控制
        
        order={
            'id':random.randint(1000,9999),
            'user_id':user_id,
            'items':items,
            'status':'pending'
        }
        self.orders.append(order)
        return order
    
    def cancel_order(self,order_id,user_id):
        """取消订单"""
        for order in self.orders:
            if order['id']==order_id:
                # 问题：没有验证用户是否有权取消
                order['status']='cancelled'
                return True
        return False
    
    def get_order_total(self,order_id):
        """获取订单总价"""
        for order in self.orders:
            if order['id']==order_id:
                total=0
                for item in order['items']:
                    # 问题：可能KeyError
                    total+=item['price']*item['quantity']
                return total
        return 0

import random
