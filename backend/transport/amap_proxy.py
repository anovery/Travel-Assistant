from flask import Blueprint, request, Response
import os
import requests

amap_proxy_bp = Blueprint('amap_proxy', __name__)

# 获取后端安全密钥
AMAP_BACKEND_KEY = os.getenv('AMAP_BACKEND_KEY')
# 获取前端安全密钥（jscode）
AMAP_JS_SECURITY_KEY = os.getenv('AMAP_JS_SECURITY_KEY', '')

@amap_proxy_bp.route('/_AMapService/<path:path>', methods=['GET', 'POST'])
def proxy_amap_service(path):
    """
    代理高德地图API请求，自动添加安全密钥
    """
    # 构建目标URL
    if path.startswith('v4/map/styles'):
        # 自定义地图服务
        target_url = f'https://webapi.amap.com/v4/map/styles'
    elif path.startswith('v3/vectormap'):
        # 海外地图服务
        target_url = f'https://fmap01.amap.com/v3/vectormap'
    else:
        # Web服务API
        target_url = f'https://restapi.amap.com/{path}'
    
    # 获取请求参数
    args = request.args.copy()
    
    # 添加安全密钥
    args = dict(args)
    args['jscode'] = AMAP_JS_SECURITY_KEY
    
    # 添加客户端IP，解决IP定位问题
    remote_addr = request.remote_addr
    if remote_addr:
        args['ip'] = remote_addr
    
    # 根据请求方法发送代理请求
    if request.method == 'GET':
        resp = requests.get(target_url, params=args, headers=dict(request.headers))
    else:
        resp = requests.post(target_url, params=args, data=request.get_data(), headers=dict(request.headers))
    
    # 构建响应
    response = Response(
        resp.content,
        status=resp.status_code,
        content_type=resp.headers.get('Content-Type', 'application/json')
    )
    
    # 复制响应头
    for key, value in resp.headers.items():
        if key.lower() not in ('content-length', 'connection', 'content-encoding'):
            response.headers[key] = value
    
    return response 