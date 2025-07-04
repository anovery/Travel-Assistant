# app/routes.py

from flask import Blueprint, request, jsonify
from .weather_api import get_weather_forecast  # ✨ 确认这个导入是正确的
import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path='../.env')

def to_utc_iso(date_str, hour=0):
    # ... 此函数无需修改 ...
    local_time = datetime.strptime(date_str, "%Y-%m-%d").replace(hour=hour)
    utc_time = local_time - timedelta(hours=8)
    return utc_time.strftime("%Y-%m-%dT%H:%M:%SZ")

routes = Blueprint('routes', __name__)


@routes.route('/api/weather', methods=['POST'])
def weather():
    data = request.get_json()
    location = data.get("location")
    start = to_utc_iso(data.get("start_date"), hour=0)
    end = to_utc_iso(data.get("end_date"), hour=23)

    if not location or not start or not end:
        return jsonify({"error": "缺少参数"}), 400

    #  解包从 get_weather_forecast 返回的元组
    result_data, error_type = get_weather_forecast(location, start, end)

    #  根据 error_type 判断如何响应
    if error_type == "INVALID_LOCATION":
        # 如果是无效地点错误，返回我们和前端约定的JSON
        return jsonify({"error": "INVALID_LOCATION"}), 400
    
    elif error_type == "API_ERROR":
        # 如果是其他API错误，返回一个通用的服务器错误
        return jsonify({"error": "天气服务暂时不可用，请稍后再试"}), 503 # 503 Service Unavailable 更合适

    # 如果没有错误 (error_type is None)，正常返回天气数据
    print("返回的天气数据：", result_data)
    return jsonify(result_data)


# ... /api/advice 路由无需修改 ...
@routes.route('/api/advice', methods=['POST'])
def get_advice():
    # ... 此处代码保持不变 ...
    data = request.get_json()
    weather_data = data.get("weather")

    if not weather_data:
        return jsonify({"error": "缺少天气数据"}), 400
    
    moonshot_api_key = os.getenv("MOONSHOT_API_KEY")
    if not moonshot_api_key:
        return jsonify({"error": "后端配置错误，缺少 Kimi API Key"}), 500
    
    prompt = "我将在以下时间段出行，总结一些天气状况，并请根据天气数据给出穿衣建议和行李建议：\n\n"
    for item in weather_data[:6]:
        time = item.get("time", "未知时间")
        temp = item.get("temperature", "未知")
        rain = item.get("precipitationProbability", "未知")
        prompt += f"时间：{time}，温度：{temp}℃，降雨概率：{rain}%\n"

    prompt += "\n请告诉我该穿什么、是否需要带伞或其他物品，简洁清晰，分点给出回答，每一点换一行"

    url = "https://api.moonshot.cn/v1/chat/completions"
    headers = {
        "Authorization": f"{moonshot_api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "moonshot-v1-8k",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        return jsonify({"advice": result["choices"][0]["message"]["content"]})
    except requests.exceptions.RequestException as e:
        print("Moonshot API 调用失败：", e)
        return jsonify({"error": "获取出行建议失败，请稍后再试。"}), 500
