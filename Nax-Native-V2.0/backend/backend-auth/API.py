from flask import Flask, request, jsonify
from googleapiclient.discovery import build
import functions
from flask_cors import CORS, cross_origin
import uuid
import random
from cs50 import SQL

app = Flask(__name__)
CORS(app)

