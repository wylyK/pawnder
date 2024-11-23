"""
Entrypoint to Flask backend server
"""

from flask import Flask, session
from flask_cors import CORS
from api.users import users_api
from api.pets import pets_api
from api.petMatch import pet_match_api
from api.petHealth import pet_health_api
from api.petEvent import pet_event_api
import os

app = Flask(__name__)
CORS(app)
app.register_blueprint(users_api)
app.register_blueprint(pets_api)
app.register_blueprint(pet_match_api)
app.register_blueprint(pet_health_api)
app.register_blueprint(pet_event_api)
app.secret_key = os.urandom(24)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True)