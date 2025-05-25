import requests
from datetime import datetime
import os
from dotenv import load_dotenv

# 加载环境变量（注意路径，根据你的位置可能要写 '../.env'）
load_dotenv(dotenv_path='../.env')  # 如果 app.py 在 backend 文件夹里

API_KEY = os.getenv("TOMORROW_API_KEY")

def filter_by_time(data, start, end):
    start_dt = datetime.strptime(start, "%Y-%m-%dT%H:%M:%SZ")
    end_dt = datetime.strptime(end, "%Y-%m-%dT%H:%M:%SZ")

    return [item for item in data if start_dt <= datetime.strptime(item["time"], "%Y-%m-%dT%H:%M:%SZ") <= end_dt]
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
    if response.status_code != 200:
        return {"error": response.text}

    data = response.json()

    # 安全提取 hourly 数据
    hourly_data = data.get("timelines", {}).get("hourly", [])

    # 提取目标字段
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
    return {"weather": filtered_data}
