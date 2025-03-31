from flask import Flask, request, jsonify, render_template
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
    # Get the the credentials fron .env
    username = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
except Exception as e:
    print(f'error: {e}')

#Get the API key from the environment
API_KEY = os.getenv("FIRST_API")
API_KEY2 = os.getenv("SECOND_API")
current_api_key = API_KEY



@app.route("/api/settings", methods=["POST"])
@cross_origin()
def settings_api():
    # Get the api key and frontID
    api_key = request.headers.get("X-API-Key")
    frontID = request.headers.get("X-Front-ID")
    try: 
        #Connect to postgresql database
        db = cs50.SQL(f"postgresql://{username}:{password}@database:5432/api_keys")
        # Get the matching api_key for that frontID
        frontID_database = db.execute("SELECT api_key from APIs WHERE frontid = ?", (frontID,))
    except Exception as e:
        print(f'Exception in database: {e}')

    # If no api key was found for this frontID return UNAUTHORIZED
    if not frontID_database:
        return jsonify({"error": "API Key not found for this frontID"}), 401
    # If no api key was provided return UNAUTHORIZED
    elif not api_key:
        return jsonify({"error": "please provide the api key"}), 401
    # If the frontID and api key don't match return AUTHORIZATION FAILED
    elif frontID_database[0]['api_key'] != api_key:
        return jsonify({"error": "Authorization failed"}), 403
    
    data = request.get_json(force=True)
    # Get the request body
    number_of_shorts = data.get("number_of_shorts")
    query = data.get("query")
    # Channel is not available in frontend yet
    channel = data.get("channel")

    # If both data and number_of_shorts exist
    if data and number_of_shorts:
        # Can not accept both query and channel because the result will get too specific and most likely return None
        if query and channel:
            return({"error":"only one of the components should be present"}), 400
        
        #If channel Exist lookup channel id
        elif channel:
            response = functions.youtube_videos(API_KEY=API_KEY, max_results=number_of_shorts, channelNames=channel, query=None)
        #If query exist look up query
        elif query:
            global current_api_key
            # an array to hold all URLs
            allResponse= []
            # For every query in query
            for aQuery in query:
                try:
                    # Append every item from each query look up to allResponse
                    tempResponse = functions.youtube_videos(API_KEY=current_api_key, max_results=number_of_shorts, channelNames=None, query=aQuery)
                    for sublist in tempResponse:
                        allResponse.append(sublist)
                except Exception as e:
                    print(f"Exception: {e}")
                    # Handle quota exceeds
                    if e =="quota exceeds":
                        print("switching APIs")
                        print("Second attempt to make an API call. Should not see this more than once")
                        current_api_key = API_KEY2
                        try:
                            tempResponse = functions.youtube_videos(API_KEY=current_api_key, max_results=number_of_shorts, channelNames=None, query=aQuery)
                            for sublist in tempResponse:
                                allResponse.append(sublist)
                            
                        except Exception as e:
                            print(f'Error: {e}')
                            for sublist in tempResponse:
                                allResponse.append(sublist)
            
            # Shuffle allResponse
            random.shuffle(allResponse)
            # Get lis length
            list_length = len(allResponse)
            # Get only the number of videos the user requested from allResponse
            response = allResponse[:int(number_of_shorts)]

        # If query doens't exist return 400       
        elif not query:
            return({"error":"query not found"}), 400
    else:
        return({"error":"one of the components not found"}), 400



    # Return JSON with the token
    return jsonify({"data": response}), 200


# Turn debug off in production
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1025, debug=True)