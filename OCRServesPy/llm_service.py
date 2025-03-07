from transformers import pipeline
from flask import Flask, request, jsonify

app = Flask(__name__)

# טוענים את המודל "distilgpt2" – גרסה מוקטנת של GPT‑2 המתאימה יותר לסביבות עם משאבים מוגבלים
generator = pipeline("text-generation", model="distilgpt2")

@app.route('/api/llm', methods=['POST'])
def llm_endpoint():
    try:
        data = request.json
        prompt = data.get("prompt", "")
        if not prompt:
            return jsonify({"error": "Missing prompt"}), 400

        # מפעילים את המודל עם max_length נמוך יותר (לדוגמה 100) כדי לחסוך במשאבים
        response = generator(prompt, max_length=100, num_return_sequences=1)
        generated_text = response[0]["generated_text"]

        return jsonify({"response": generated_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
