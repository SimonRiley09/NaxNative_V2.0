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
#API_KEYS = {}

@app.route("/api/keys", methods=["POST", "DELETE", "GET"])
@cross_origin()
def handle_key():
    if request.method == "POST":
        data = request.get_json(force=True)
        print(f'data: {data}')
        frontID = data.get("frontID")
        print(f'frontID: {frontID}')
        API_Key = str(uuid.uuid4())
        try:
            db = cs50.SQL(f"postgresql://{username}:{password}@database:5432/api_keys")  # For PostgreSQL
            db.execute("INSERT INTO APIs (frontid, api_key) VALUES (?, ?)", frontID, API_Key)
            all_keys = db.execute("Select * FROM APIs")
            print(f'all: {all_keys}')
        except Exception as e:
            print(f'Exception in database: {e}')
        #API_KEYS[deviceID] = API_Key
        return jsonify({"api_key": API_Key})
    else:
        return jsonify({"message": "Method not allowed"})
    
if __name__ == "__main__":
    app.run(host= '0.0.0.0', port= 1028, debug=True)