from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import uuid
import cs50
import uuid
import os

# Set up flask app
app = Flask(__name__)
CORS(app)


# Get credentials from .env
try:
    username = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
except Exception as e:
    print(f'error: {e}')

# Route /api/keys for registring an api_key
@app.route("/api/keys", methods=["POST"])
@cross_origin()
def handle_key():
    if request.method == "POST":
        data = request.get_json(force=True)
        #Get the frontID
        frontID = data.get("frontID")

        # Generate an API Key
        API_Key = str(uuid.uuid4())
        try:
            # Connect to postgresql database 
            db = cs50.SQL(f"postgresql://{username}:{password}@database:5432/api_keys")
            # Add the credentials to the database
            db.execute("INSERT INTO APIs (frontid, api_key) VALUES (?, ?)", frontID, API_Key)
        except Exception as e:
            print(f'Exception in database: {e}')

        # Return the api key 
        return jsonify({"api_key": API_Key})
    else:
        return jsonify({"message": "Method not allowed"})
    

# Turn debug off iin production deployment
if __name__ == "__main__":
    app.run(host= '0.0.0.0', port= 1028, debug=True)