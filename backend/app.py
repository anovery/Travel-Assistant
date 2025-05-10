# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允许跨域请求

@app.route('/api/greeting')
def greeting():
    return jsonify({"message": "Hello from Flask backend!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
