import os 
import requests
from dotenv import load_dotenv 

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
            print(data['geocodes'][0]['location'])
            return data['geocodes'][0]['location']
        else:
            print(f"地理编码错误: {data}")
    except Exception as e:
        print(f"地理编码错误: {e}")
    
    # 如果无法获取坐标，返回空字符串
    print('无法获取坐标')
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
    
    print(path)
    return path

# 获取高德地图API密钥 
load_dotenv(dotenv_path='../.env')
AMAP_KEY = os.getenv('AMAP_BACKEND_KEY')

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
            print(route)
            return {
                'status': 'success',
                'duration': int(route['duration']) // 60,  # 转换为分钟
                'distance': float(route['distance']) / 1000,  # 转换为公里
                'path': parse_path(route['steps'])
            }
    except Exception as e:
        print(f"驾车路线查询错误: {e}")
    
    print('无法获取驾车路线')
    return {'status': 'error', 'message': '无法获取驾车路线'}

def main():
    city = '广州'
    origin = '广州站'
    destination = '广州南站'
    
    driving_route = get_driving_route(city, origin, destination)
    print(driving_route)
    
if __name__ == '__main__':
    main()
