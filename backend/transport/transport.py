from flask import Blueprint, jsonify, request
import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

transport_bp = Blueprint('transport', __name__)

# 用于存储保存的交通方式
saved_routes = []
next_id = 1

# 获取高德地图API密钥 
load_dotenv(dotenv_path='../.env')
AMAP_KEY = os.getenv('AMAP_BACKEND_KEY')

@transport_bp.route('/api/transport/search', methods=['POST'])
def search_transport():
    data = request.get_json()
    city = data.get('city', '')
    origin = data.get('origin', '')
    destination = data.get('destination', '')
    departure_time = data.get('departureTime', '')
    
    if not city:
        return jsonify({'error': '城市不能为空'}), 400
    if not origin or not destination:
        return jsonify({'error': '起点和终点不能为空'}), 400
    
    # 处理出发时间，如果没有提供则使用当前时间
    if departure_time:
        try:
            hour, minute = map(int, departure_time.split(':'))
            if not (0 <= hour <= 23 and 0 <= minute <= 59):
                return jsonify({'error': '时间格式不正确，请使用HH:MM格式'}), 400
        except:
            return jsonify({'error': '时间格式不正确，请使用HH:MM格式'}), 400
    
    # 调用高德地图API获取路线
    routes = {
        'driving': get_driving_route(city, origin, destination),
        'transit': get_transit_route(city, origin, destination, departure_time),
        'walking': get_walking_route(city, origin, destination),
        'subway': get_subway_route(city, origin, destination, departure_time)
    }
    
    return jsonify(routes)

@transport_bp.route('/api/saved_routes', methods=['GET'])
def get_saved_routes():
    return jsonify(saved_routes)

@transport_bp.route('/api/saved_routes', methods=['POST'])
def save_route():
    global next_id
    data = request.get_json()
    
    route_data = {
        'id': next_id,
        'city': data.get('city', ''),
        'origin': data.get('origin', ''),
        'destination': data.get('destination', ''),
        'type': data.get('type', ''),
        'duration': data.get('duration', ''),
        'distance': data.get('distance', ''),
        'path': data.get('path', []),
        'saved_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    saved_routes.append(route_data)
    next_id += 1
    
    return jsonify({'success': True, 'route': route_data})

@transport_bp.route('/api/saved_routes/<int:route_id>', methods=['DELETE'])
def delete_saved_route(route_id):
    global saved_routes
    saved_routes = [route for route in saved_routes if route['id'] != route_id]
    return jsonify({'success': True})

def get_driving_route(city, origin, destination):
    """获取驾车路线"""
    url = "https://restapi.amap.com/v3/direction/driving"
    params = {
        'key': AMAP_KEY,
        'origin': get_location(city, origin),
        'destination': get_location(city, destination),
        'extensions': 'base',
        'strategy': 10  # 默认策略
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data.get('status') == '1' and data.get('count', '0') != '0':
            route = data['route']['paths'][0]
            return {
                'status': 'success',
                'duration': int(route['duration']) // 60,  # 转换为分钟
                'distance': float(route['distance']) / 1000,  # 转换为公里
                'path': parse_path(route['steps'])
            }
    except Exception as e:
        print(f"驾车路线查询错误: {e}")
    
    return {'status': 'error', 'message': '无法获取驾车路线'}

def get_transit_route(city, origin, destination, departure_time=None):
    """获取公交路线"""
    url = "https://restapi.amap.com/v3/direction/transit/integrated"
    
    # 处理出发时间
    time_params = {}
    if departure_time:
        current_date = datetime.now().strftime('%Y%m%d')
        time_params = {
            'departure_time': f"{current_date} {departure_time}"
        }
    
    params = {
        'key': AMAP_KEY,
        'origin': get_location(city, origin),
        'destination': get_location(city, destination),
        'city': city,
        'extensions': 'base',
        **time_params
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data.get('status') == '1' and data.get('count', '0') != '0':
            route = data['route']['transits'][0]
            return {
                'status': 'success',
                'duration': int(route['duration']) // 60,  # 转换为分钟
                'distance': float(route['distance']) / 1000,  # 转换为公里
                'path': parse_transit_path(route['segments'])
            }
    except Exception as e:
        print(f"公交路线查询错误: {e}")

    return {'status': 'error', 'message': '无法获取公交路线'}

def get_walking_route(city, origin, destination):
    """获取步行路线"""
    url = "https://restapi.amap.com/v3/direction/walking"
    params = {
        'key': AMAP_KEY,
        'origin': get_location(city, origin),
        'destination': get_location(city, destination)
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data.get('status') == '1' and data.get('count', '0') != '0':
            route = data['route']['paths'][0]
            return {
                'status': 'success',
                'duration': int(route['duration']) // 60,  # 转换为分钟
                'distance': float(route['distance']) / 1000,  # 转换为公里
                'path': parse_path(route['steps'])
            }
    except Exception as e:
        print(f"步行路线查询错误: {e}")
    
    return {'status': 'error', 'message': '无法获取步行路线'}

def get_subway_route(city, origin, destination, departure_time=None):
    """获取地铁路线 (实际上使用transit API，但过滤仅地铁)"""
    url = "https://restapi.amap.com/v3/direction/transit/integrated"
    
    # 处理出发时间
    time_params = {}
    if departure_time:
        current_date = datetime.now().strftime('%Y%m%d')
        time_params = {
            'departure_time': f"{current_date} {departure_time}"
        }
    
    params = {
        'key': AMAP_KEY,
        'origin': get_location(city, origin),
        'destination': get_location(city, destination),
        'city': city,
        'nightflag': '0',  # 不考虑夜班车
        'extensions': 'base',
        **time_params
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data.get('status') == '1' and data.get('count', '0') != '0':
            # 尝试查找包含地铁的路线
            for transit in data['route']['transits']:
                # 检查是否是地铁路线
                is_subway_route = False
                for segment in transit.get('segments', []):
                    for bus in segment.get('bus', {}).get('buslines', []):
                        if '地铁' in bus.get('name', ''):
                            is_subway_route = True
                            break
                    if is_subway_route:
                        break
                
                if is_subway_route:
                    return {
                        'status': 'success',
                        'duration': int(transit['duration']) // 60,  # 转换为分钟
                        'distance': float(transit['distance']) / 1000,  # 转换为公里
                        'path': parse_transit_path(transit['segments'])
                    }
    except Exception as e:
        print(f"地铁路线查询错误: {e}")
    
    return {'status': 'error', 'message': '无法获取地铁路线'}

def get_location(city, place):
    """获取地点的经纬度坐标"""
    # 如果place已经是经纬度坐标，则直接返回
    if ',' in place and len(place.split(',')) == 2:
        try:
            lng, lat = place.split(',')
            float(lng), float(lat)
            return place
        except:
            pass
    
    # 使用地理编码API获取坐标
    url = "https://restapi.amap.com/v3/geocode/geo"
    params = {
        'key': AMAP_KEY,
        'address': place,
        'city': city
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data.get('status') == '1' and data.get('count', '0') != '0':
            return data['geocodes'][0]['location']
    except Exception as e:
        print(f"地理编码错误: {e}")
    
    # 如果无法获取坐标，返回空字符串
    return ''

def parse_path(steps):
    """解析驾车和步行路径"""
    path = []
    for step in steps:
        coordinates = []
        polyline = step.get('polyline', '')
        if polyline:
            points = polyline.split(';')
            for point in points:
                lng, lat = point.split(',')
                coordinates.append([float(lng), float(lat)])
        
        instruction = step.get('instruction', '').replace('<b>', '').replace('</b>', '')
        
        path.append({
            'instruction': instruction,
            'coordinates': coordinates
        })
    
    return path

def parse_transit_path(segments):
    """解析公交路径"""
    path = []
    
    for segment in segments:
        # 步行部分
        if 'walking' in segment and segment['walking'].get('distance', '0') != '0':
            walk = segment['walking']
            steps = walk.get('steps', [])
            for step in steps:
                polyline = step.get('polyline', '')
                coordinates = []
                if polyline:
                    points = polyline.split(';')
                    for point in points:
                        lng, lat = point.split(',')
                        coordinates.append([float(lng), float(lat)])
                
                instruction = step.get('instruction', '').replace('<b>', '').replace('</b>', '')
                
                path.append({
                    'type': 'walking',
                    'instruction': instruction,
                    'coordinates': coordinates
                })
        
        # 公交部分
        if 'bus' in segment and segment['bus'].get('buslines'):
            for bus in segment['bus'].get('buslines', []):
                polyline = bus.get('polyline', '')
                coordinates = []
                if polyline:
                    points = polyline.split(';')
                    for point in points:
                        lng, lat = point.split(',')
                        coordinates.append([float(lng), float(lat)])
                
                name = bus.get('name', '')
                instruction = f"乘坐{name}，从{bus.get('departure_stop', {}).get('name', '')}到{bus.get('arrival_stop', {}).get('name', '')}"
                
                path.append({
                    'type': 'bus' if '地铁' not in name else 'subway',
                    'instruction': instruction,
                    'coordinates': coordinates
                })
    
    return path 