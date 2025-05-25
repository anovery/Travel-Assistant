# app/routes.py
from flask import Blueprint, request, jsonify
from .weather_api import get_weather_forecast
import  requests
import json
from datetime import datetime,timedelta
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path='../.env')
#加载load_dotenv方法
#转换时间
def to_utc_iso(date_str, hour=0):
    # date_str: "2025-05-19", hour: 0 或 23
    local_time = datetime.strptime(date_str, "%Y-%m-%d").replace(hour=hour)
    # 假设本地时间是北京时间 UTC+8，减去 8 小时得到 UTC
    utc_time = local_time - timedelta(hours=8)
    return utc_time.strftime("%Y-%m-%dT%H:%M:%SZ")
routes = Blueprint('routes', __name__)

@routes.route('/api/weather', methods=['POST'])
def weather():
    data = request.get_json()
    location = data.get("location")
    start = to_utc_iso(data.get("start_date"), hour=0)   # 00:00
    end = to_utc_iso(data.get("end_date"), hour=23)     # 23:00

    if not location or not start or not end:
        return jsonify({"error": "缺少参数"}), 400

    result = get_weather_forecast(location, start, end)
    print("返回的天气数据：", result)
    return jsonify(result)

@routes.route('/api/advice', methods=['POST'])
def get_advice():
    data = request.get_json()
    weather_data = data.get("weather")

    if not weather_data:
        return jsonify({"error": "缺少天气数据"}), 400
    # 读取 .env 中的 key
    moonshot_api_key = os.getenv("MOONSHOT_API_KEY")
    if not moonshot_api_key:
        return jsonify({"error": "后端配置错误，缺少 Kimi API Key"}), 500
    # 构造简洁 prompt，总结天气 + 请求建议
    prompt = "我将在以下时间段出行，总结一些天气状况，并请根据天气数据给出穿衣建议和行李建议：\n\n"
    for item in weather_data[:6]:  # 取前6个小时数据防止 prompt 太长
        time = item.get("time", "未知时间")
        temp = item.get("temperature", "未知")
        rain = item.get("precipitationProbability", "未知")
        prompt += f"时间：{time}，温度：{temp}℃，降雨概率：{rain}%\n"

    prompt += "\n请告诉我该穿什么、是否需要带伞或其他物品，简洁清晰，分点给出回答，每一点换一行"

    url = "https://api.moonshot.cn/v1/chat/completions"
    headers = {
        "Authorization": f"{moonshot_api_key}",  # ← 替换为你的实际密钥
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
