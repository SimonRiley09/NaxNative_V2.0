import os
import googleapiclient.discovery
from googleapiclient.discovery import build
import googleapiclient.errors
from flask import jsonify
import requests

api_service_name = "youtube"
api_version = "v3"

def channel_lookup(usernames, DEVELOPER_KEY):
    # Disable OAuthlib's HTTPS verification when running locally.
    # *DO NOT* leave this option enabled in production.
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
    IDs = []
    #clean_usernames = usernames.lstrip('@')

    try:
        youtube = googleapiclient.discovery.build(
            api_service_name, api_version, developerKey=DEVELOPER_KEY)
    except Exception as e:
        print(f"An error occurred: {e}")
        return

    for username in usernames:
        try:
            request = youtube.channels().list(
                part="id",
                forHandle=username,
            )
            response = request.execute()
            print(response)
            if "items" in response and len(response["items"]) > 0:
                id = response["items"][0]["id"]
                IDs.append(id)
            else:
                print(f"Channel not found for username: {username}")
        except Exception as e:
            print(f"An error occurred: {e}")
    return IDs

# -*- coding: utf-8 -*-

# Sample Python code for youtube.search.list
# See instructions for running these code samples locally:
# https://developers.google.com/explorer-help/code-samples#python

def youtube_videos(max_results, API_KEY, channelNames=None, query=None):
    
    youtube = build(api_service_name, api_version,
                    developerKey=API_KEY)

    video_links = []

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
                for item in response.get("items", []):
                    #print(item)
                    if "id" in item and "videoId" in item["id"]:
                        video_id = item["id"]["videoId"]
                        video_links.append(f"https://www.youtube.com/watch?v={video_id}")
            except Exception as e:
                print(f"An error occurred: {e}")

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

    return video_links