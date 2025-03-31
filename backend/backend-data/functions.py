import os
import googleapiclient.discovery
from googleapiclient.discovery import build
import googleapiclient.errors
from flask import jsonify
import requests

api_service_name = "youtube"
api_version = "v3"

# Channel is not available in frontend
def channel_lookup(usernames, DEVELOPER_KEY):
    # Disable OAuthlib's HTTPS verification when running locally.
    # *DO NOT* leave this option enabled in production.
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
    IDs = []

    try:
        #Connect to api endpoint
        youtube = googleapiclient.discovery.build(
            api_service_name, api_version, developerKey=DEVELOPER_KEY)
    except Exception as e:
        print(f"An error occurred: {e}")
        return

    for username in usernames:
        try:
            # Lookup the id of each channel
            request = youtube.channels().list(
                part="id",
                forHandle=username,
            )
            response = request.execute()
            if "items" in response and len(response["items"]) > 0:
                # Add each of the IDs to the IDs list
                id = response["items"][0]["id"]
                IDs.append(id)
            else:
                print(f"Channel not found for username: {username}")
        except Exception as e:
            print(f"An error occurred: {e}")
    return IDs



def youtube_videos(max_results, API_KEY, channelNames=None, query=None):
    
    #Connect to API endpoint
    youtube = build(api_service_name, api_version,
                    developerKey=API_KEY)

    # To store all the links
    video_links = []


    # Handle getting videos from the requested channel
    # CHANNELS ARE NOT AVAILABLE IN THE FRONT END
    if channelNames and channelNames != []:
        ChannelIDs = channel_lookup(usernames=channelNames, DEVELOPER_KEY=API_KEY)
        for ID in ChannelIDs:
            request = youtube.search().list(
                part="id",
                channelId=ID,
                maxResults=max_results,
                q=query,
                type="video",
                videoDuration="short",
                videoEmbeddable="true",
                videoSyndicated="true", #recently added
            )
            try:
                response = request.execute()
                # Add links to video links
                for item in response.get("items", []):
                    if "id" in item and "videoId" in item["id"]:
                        video_id = item["id"]["videoId"]
                        video_links.append(f"https://www.youtube.com/watch?v={video_id}")
            except Exception as e:
                print(f"An error occurred: {e}")

    # Handle requesting viddeos with queries
    if query:
        request = youtube.search().list(
            part="id",
            maxResults=max_results,
            q=query,
            type="video",
            videoDuration="short",
            videoEmbeddable= "true",
        )
        try:
            response = request.execute()
            # Append to video links
            for item in response.get("items", []):
                if "id" in item and "videoId" in item["id"]:
                    video_id = item["id"]["videoId"]
                    video_links.append(f"https://www.youtube.com/embed/{video_id}")
        except Exception as e:
            if e.status_code == 403:
                raise Exception("quota exceeds")
            print (f'exception{e}')
            

    if not query and not channelNames:
        print("Please provide a query or channel name")

    # REturn the video_links array
    return video_links