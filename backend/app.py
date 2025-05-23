# backend/app.py

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# 景点模块（直接注册蓝图）
from attractions.attraction import attraction_bp

# 天气模块（调用 create_app() 得到 Flask 实例 + 蓝图）
from weather.app import create_app as create_weather_app

# 导入交通模块
from transport.transport import transport_bp

# 导入高德地图API代理模块
from transport.amap_proxy import amap_proxy_bp


def create_combined_app():
    # 创建主 Flask 应用
    app = Flask(__name__)
    CORS(app)

    # 注册 attractions 蓝图
    app.register_blueprint(attraction_bp)

    # 注册 transport 蓝图
    app.register_blueprint(transport_bp)
    
    # 注册 amap_proxy 蓝图
    app.register_blueprint(amap_proxy_bp)


    # 创建天气模块的子应用
    weather_app = create_weather_app()

    # 将天气模块的路由也注册到主 app
    # 把 weather_app 中已注册的蓝图逐个加入主 app
    for bp in weather_app.blueprints.values():
        app.register_blueprint(bp)

    return app

# 启动
if __name__ == '__main__':
    app = create_combined_app()
    app.run(debug=True)
