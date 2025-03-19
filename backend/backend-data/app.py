from flask import Flask, request, jsonify
from googleapiclient.discovery import build
import functions
from flask_cors import CORS, cross_origin
import uuid
import random
import os
import cs50


# Configure application
app = Flask(__name__)
CORS(app)

try:
    username = os.getenv("DB_USER")
    print(f'username: {username}')
    password = os.getenv("DB_PASSWORD")
    print(f'password: {password}')
except Exception as e:
    print(f'error: {e}')

print("hello world")
#Get the API key from the environment
API_KEY = os.getenv("FIRST_API")
API_KEY2 = os.getenv("SECOND_API")
current_api_key = API_KEY

print(f'api key: {API_KEY}')

# Data = {}

@app.before_request
def log_request():
    print(f"Incoming request: {request.method} {request.path}")


@app.route("/api/settings", methods=["POST"])
@cross_origin()
def settings_api():
    api_key = request.headers.get("X-API-Key")
    print(f'api_key: {api_key}')
    frontID = request.headers.get("X-Front-ID")
    print(f'frontID: {frontID}')
    try: 
        db = cs50.SQL(f"postgresql://{username}:{password}@database:5432/api_keys")  # For PostgreSQL
        frontID_database = db.execute("SELECT api_key from APIs WHERE frontid = ?", (frontID,))
    except Exception as e:
        print(f'Exception in database: {e}')
    print(f'frontID_database: {frontID_database[0]['api_key']}')
    if not frontID_database:
        return jsonify({"error": "API Key not found for this frontID"}), 401
    elif not api_key:
        return jsonify({"error": "please provide the api key"}), 401
    elif frontID_database[0]['api_key'] != api_key:
        return jsonify({"error": "Authorization failed"}), 403
    
    print(f'api_key: {api_key}')
    data = request.get_json(force=True)
    number_of_shorts = data.get("number_of_shorts")
    query = data.get("query")
    channel = data.get("channel")
    print(f'Query is: {query}')

    if data and number_of_shorts:
        if query and channel:
            return({"error":"only one of the components should be present"}), 400
        elif channel:
            response = functions.youtube_videos(API_KEY=API_KEY, max_results=number_of_shorts, channelNames=channel, query=None)
        elif query:
            global current_api_key
            allResponse= []
            for aQuery in query:
                try:
                    print("First attempt to make API call")
                    tempResponse = functions.youtube_videos(API_KEY=current_api_key, max_results=number_of_shorts, channelNames=None, query=aQuery)
                    print(f'tempReposne: {tempResponse}')
                    for sublist in tempResponse:
                        allResponse.append(sublist)
                except Exception as e:
                    print(f"Exception: {e}")
                    if e =="quota exceeds":
                        print("switching APIs")
                        print("Second attempt to make an API call. Should not see this more than once")
                        current_api_key = API_KEY2
                        try:
                            tempResponse = functions.youtube_videos(API_KEY=current_api_key, max_results=number_of_shorts, channelNames=None, query=aQuery)
                            print(f'Second tempResponse: {tempResponse}')
                            for sublist in tempResponse:
                                allResponse.append(sublist)
                            
                        except Exception as e:
                            print(f'man this one is serious: {e}')
                            for sublist in tempResponse:
                                allResponse.append(sublist)
            
            random.shuffle(allResponse)
            print(f'allResponse: {allResponse}')
            list_length = len(allResponse)
            print(f'list length: {list_length}')
            """divide = list_length // int(number_of_shorts)
            print(f'divide: {divide}')"""
            response = allResponse[:int(number_of_shorts)]
            print (f'response: {response}')
            
        elif not query:
            print(data)
            return({"error":"query not found"}), 400
    else:
        return({"error":"one of the components not found"}), 400


    # Store in our Data dictionary
    print(response)

    # Return JSON with the token
    return jsonify({"data": response}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1025, debug=True)