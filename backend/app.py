"""
Entrypoint to Flask backend server
"""

from flask import Flask
from api.users import users_api

app = Flask(__name__)
app.register_blueprint(users_api)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True)

