from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允许所有跨域请求

saved_spots = []

@app.route('/api/saved_spots', methods=['GET'])
def get_saved_spots():
    user_id = request.args.get('user_id', default=1, type=int)
    user_spots = [spot for spot in saved_spots if spot['user_id'] == user_id]
    return jsonify(user_spots)

@app.route('/api/saved_spots', methods=['POST'])
def add_saved_spot():
    data = request.get_json()
    new_spot = {
        "id": len(saved_spots) + 1,
        "name": data['name'],
        "user_id": data.get('user_id', 1)
    }
    saved_spots.append(new_spot)
    return jsonify(new_spot), 201

@app.route('/api/saved_spots/<int:spot_id>', methods=['DELETE'])
def delete_saved_spot(spot_id):
    global saved_spots  

    spot_to_delete = next((spot for spot in saved_spots if spot['id'] == spot_id), None)
    
    if not spot_to_delete:
        return jsonify({"error": "Spot not found"}), 404

    saved_spots = [spot for spot in saved_spots if spot['id'] != spot_id]
    
    return jsonify({"message": "Spot deleted successfully"}), 200

@app.route('/api/ai/suggest', methods=['POST'])
def ai_suggest():

    # 这里只是模拟推荐结果，改为调用真实 AI 模型
    return jsonify({ 'suggestion': '你可以去张家界，风景很美！' })

if __name__ == '__main__':
    app.run(debug=True)