from api.pets import pets_api
import pytest
from unittest.mock import patch, MagicMock 
from flask import Flask
import os
from firebase_admin import firestore

@pytest.fixture
def client():
    app = Flask(__name__)
    app.secret_key = "test_secret_key"  # Required for session handling in testing login
    app.register_blueprint(pets_api)
    app.testing = True
    return app.test_client()

