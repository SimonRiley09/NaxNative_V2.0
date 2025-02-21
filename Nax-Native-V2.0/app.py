import os
from flask import Flask, flash, redirect, render_template, request, session, jsonify
#from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from googleapiclient.discovery import build
import functions
from flask_cors import CORS, cross_origin
import uuid  # Add this import

# Configure application
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

#Get the API key from the environment
API_KEY = "AIzaSyA586g4wab4jL3qBffHb4OZ-XAjobwbuy0"
print(API_KEY)

"""@app.after_request
def after_request(response):
    #Ensure responses aren't cached
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    # Add CORS headers:
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response"""

Data = {}

@app.before_request
def log_request():
    print(f"Incoming request: {request.method} {request.path}")


@app.route("/api/settings", methods=["GET", "POST", "OPTIONS"])
@cross_origin()
def settings_api():
    data = request.get_json(force=True)
    number_of_shorts = data.get("number_of_shorts")
    query = data.get("query")
    channel = data.get("channel")

    if data and number_of_shorts:
        if query and channel:
            return({"error":"only one of the components should be present"}), 400
        elif channel:
            response = functions.youtube_videos(API_KEY=API_KEY, max_results=number_of_shorts, channelNames=channel, query=None)
        elif query:
            response = functions.youtube_videos(API_KEY=API_KEY, max_results=number_of_shorts, channelNames=None, query=query)
    else:
        return({"error":"one of the components not found"}), 400

    token = str(uuid.uuid4())
    print("token: ", token)

    # Store in our Data dictionary
    Data[token] = response
    print(response)

    # Return JSON with the token
    return jsonify({"token": token})


@app.route("/api/data", methods=["GET", "OPTIONS"])
@cross_origin()
def get_data():
    token = request.args.get("token")
    if token and token in Data:
        # Return only the data associated with this token
        return jsonify(Data[token])
    else:
        return jsonify({"error": "No data found for this token"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)