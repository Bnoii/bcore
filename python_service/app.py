from flask import Flask, request, jsonify, send_from_directory
import os
import uuid
from openvoice_handler import generate_voice

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(OUT_DIR, exist_ok=True)

@app.route("/clone", methods=["POST"])
def clone():
    if "voice" not in request.files:
        return jsonify({"error": "No voice file uploaded"}), 400
    text = request.form.get("text", "").strip()
    if not text:
        return jsonify({"error": "Text is required"}), 400

    f = request.files["voice"]
    tmp_id = str(uuid.uuid4())
    ref_path = os.path.join(OUT_DIR, f"ref_{tmp_id}_{f.filename}")
    f.save(ref_path)

    try:
        out_path = generate_voice(ref_path, text)
    except Exception as e:
        return jsonify({"error": f"Inference failed: {e}"}), 500

    fname = os.path.basename(out_path)
    return jsonify({"audio_url": f"/out/{fname}"}), 200

@app.route("/out/<path:filename>", methods=["GET"])
def out(filename):
    return send_from_directory(OUT_DIR, filename, as_attachment=False)

@app.get("/health")
def health():
    return {"ok": True}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)
