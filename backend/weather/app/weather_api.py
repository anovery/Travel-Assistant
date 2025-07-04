# weather_api.py

import requests
from datetime import datetime
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv(dotenv_path='../.env')

API_KEY = os.getenv("TOMORROW_API_KEY")

def filter_by_time(data, start, end):
    # ... 此函数无需修改 ...
    start_dt = datetime.strptime(start, "%Y-%m-%dT%H:%M:%SZ")
    end_dt = datetime.strptime(end, "%Y-%m-%dT%H:%M:%SZ")
    return [item for item in data if start_dt <= datetime.strptime(item["time"], "%Y-%m-%dT%H:%M:%SZ") <= end_dt]

# ✨ --- 修改 get_weather_forecast 函数 --- ✨
def get_weather_forecast(location, start_time, end_time):
    url = "https://api.tomorrow.io/v4/weather/forecast"
    params = {
        "location": location,
        "timesteps": "1h",
        "startTime": start_time,
        "endTime": end_time,
        "apikey": API_KEY,
        "fields": [
            "temperature",
            "weatherCode",
            "humidity",
            "precipitationProbability"
        ]
    }

    response = requests.get(url, params=params)
    
    # ✨ 关键：检查响应状态码
    if response.status_code == 400:
        # Tomorrow.io 通常用 400 状态码表示请求有问题，很可能是地点无效
        print(f"地点 '{location}' 可能无效，API返回400。响应: {response.text}")
        return None, "INVALID_LOCATION"
    
    if response.status_code != 200:
        # 处理其他非成功的状态码
        print(f"天气API请求失败，状态码: {response.status_code}。响应: {response.text}")
        return None, "API_ERROR"

    data = response.json()
    hourly_data = data.get("timelines", {}).get("hourly", [])

    # ✨ 再次检查：即使成功返回200，也可能因为地点问题而没有数据
    if not hourly_data:
        print(f"地点 '{location}' 返回了空的天气数据，可能无效。")
        return None, "INVALID_LOCATION"

    # ... 数据提取部分保持不变 ...
    simplified_data = []
    for item in hourly_data:
        values = item.get("values", {})
        simplified_data.append({
            "time": item.get("time"),
            "temperature": values.get("temperature"),
            "humidity": values.get("humidity"),
            "precipitationProbability": values.get("precipitationProbability"),
            "weatherCode": values.get("weatherCode")
        })
    
    filtered_data = filter_by_time(simplified_data, start_time, end_time)
    
    # ✨ 返回一个包含数据的字典和 None 表示成功
    return {"weather": filtered_data}, None
