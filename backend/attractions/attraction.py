from flask import Blueprint, jsonify, request
from openai import OpenAI

attraction_bp = Blueprint('attraction', __name__)

# 用于存储景点的内存列表
saved_spots = []
next_id = 1

@attraction_bp.route('/api/saved_spots', methods=['GET'])
def get_saved_spots():
    return jsonify(saved_spots)

@attraction_bp.route('/api/saved_spots', methods=['POST'])
def add_saved_spot():
    global next_id
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({'error': '景点名称不能为空'}), 400
    spot = {'id': next_id, 'name': name}
    saved_spots.append(spot)
    next_id += 1
    return jsonify({'success': True, 'spot': spot})

@attraction_bp.route('/api/saved_spots/<int:spot_id>', methods=['DELETE'])
def delete_saved_spot(spot_id):
    global saved_spots
    saved_spots = [spot for spot in saved_spots if spot['id'] != spot_id]
    return jsonify({'success': True})

@attraction_bp.route('/api/ai/suggest', methods=['POST'])
def ai_suggest():
    data = request.get_json()
    location = data.get('location')
    if not location:
        return jsonify({'error': '缺少location参数'}), 400
    suggestion = get_ai_suggestion(location)
    return jsonify({'suggestion': suggestion})

def get_ai_suggestion(location):
    prompt = (
        f"请只返回{location}最值得推荐的3个著名旅游景点的名称，"
        f"不要用markdown语法，用中文逗号分隔，每个景点加编号和一句简短的介绍（例如：1. 外滩，上海的地标性景点，欣赏黄浦江两岸的壮丽景色。2. 豫园，江南古典园林的代表，体验传统建筑和园林艺术。3. 东方明珠塔，上海的象征之一，俯瞰城市全景的绝佳地点。）每个景点之间有回车换行隔开。"
    )
    try:
        client = OpenAI(api_key="sk-e64095753f90402a9d418a96ff941658", base_url="https://api.deepseek.com")
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个旅游助手，只返回景点名称。"},
                {"role": "user", "content": prompt},
            ],
            stream=False
        )
        result = response.choices[0].message.content.strip()
        spots = [name.strip() for name in result.split('，') if name.strip()]
        return '，'.join(spots)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return f"{location}推荐景点：景点A，景点B，景点C（AI调用失败：{e}）" 