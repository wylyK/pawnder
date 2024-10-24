"""
Handles Firebase connection for the Pawnder app.
"""

import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials

load_dotenv()

class PawnderFirebase:
    """Initializes the Firebase connection using environment variables."""
    def __init__(self):
        self.firebase_config = {
            "apiKey": os.environ.get("FIREBASE_API_KEY"),
            "authDomain": os.environ.get("FIREBASE_AUTH_DOMAIN"),
            "databaseURL": "",
            "projectId": os.environ.get("FIREBASE_PROJECT_ID"),
            "storageBucket": os.environ.get("FIREBASE_STORAGE_BUCKET"),
            "messagingSenderId": os.environ.get("FIREBASE_MESSAGING_SENDER_ID"),
        }
        cred = credentials.Certificate(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"))

        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)

