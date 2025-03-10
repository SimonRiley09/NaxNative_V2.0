from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import uuid
import cs50
import uuid
import os

#databse not loading

app = Flask(__name__)
CORS(app)
try:
    username = os.getenv("DB_USER")
    print(f'username: {username}')
    password = os.getenv("DB_PASSWORD")
    print(f'password: {password}')
except Exception as e:
    print(f'error: {e}')
API_KEYS = {}

@app.route("/api/keys", methods=["POST", "DELETE", "GET"])
@cross_origin()
def handle_key():
    if request.method == "POST":
        data = request.get_json(force=True)
        print(f'data: {data}')
        deviceID = data.get("deviceID")
        print(f'deviceID: {deviceID}')
        API_Key = str(uuid.uuid4)
        try:
            db = cs50.SQL(f"postgres://{username}:{password}@database:5432/api_keys")  # For PostgreSQL
            db.execute("INSERT INTO api_keys (device_id, api_key) VALUES (?, ?)", deviceID, API_Key)
        except Exception as e:
            print(f'Exception in database: {e}')
        API_KEYS[deviceID] = API_Key
        return jsonify({"api_keys": API_KEYS})
    elif request.method == "DELETE":
        data = request.get_json(force=True)
        deviceID = data.get["deviceID"]
        if deviceID in API_KEYS:
            del API_KEYS[deviceID]
            return jsonify({"message": "API key succefuly deleted"})
        else:
            return jsonify({"message": "API key not found"}), 404
    else:
        return jsonify({"message": "Method not allowed"})
    
if __name__ == "__main__":
    app.run(host= '0.0.0.0', port= 1028, debug=True)