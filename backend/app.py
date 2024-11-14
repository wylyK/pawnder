"""
Entrypoint to Flask backend server
"""

from flask import Flask
from api.users import users_api
from api.pets import pets_api
from api.petMatch import pet_match_api
import os

app = Flask(__name__)
app.register_blueprint(users_api)
app.register_blueprint(pets_api)
app.register_blueprint(pet_match_api)
app.secret_key = os.getenv('SECRET_KEY')

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True)