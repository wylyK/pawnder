"""
Entrypoint to Flask backend server
"""

from flask import Flask
from api.users import users_api
from api.pets import pets_api
from api.petMatch import pet_match_api
from api.petHealth import pet_health_api
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.register_blueprint(users_api)
app.register_blueprint(pets_api)
app.register_blueprint(pet_match_api)
app.register_blueprint(pet_health_api)
app.secret_key = os.getenv('SECRET_KEY')

@app.route("/")
def hello_world():
    return "<p>Hello, Weeorld!</p>"

if __name__ == "__main__":
    app.run(debug=True)