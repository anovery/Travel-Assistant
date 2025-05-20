from flask import Flask
from flask_cors import CORS
from attractions.attraction import attraction_bp

app = Flask(__name__)
CORS(app)  # 允许所有跨域请求

# 注册景点模块
app.register_blueprint(attraction_bp)

if __name__ == '__main__':
    app.run(debug=True)