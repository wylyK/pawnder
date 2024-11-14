from flask import Blueprint, jsonify, request, session
from firebase_admin import firestore, auth
from connect_firebase import PawnderFirebase
from dotenv import load_dotenv
import os
import requests
from models.user import User

users_api = Blueprint('users_api', __name__)
pawnder_firebase = PawnderFirebase()
user_db = firestore.client()
load_dotenv()

config = {
    "apiKey": os.getenv("FIREBASE_API_KEY"),
    "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN"),
    "projectId": os.getenv("FIREBASE_PROJECT_ID"),
    "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET"),
    "messagingSenderId": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
    "appId": os.getenv("FIREBASE_APP_ID"),
    "measurementId": os.getenv("FIREBASE_MEASUREMENT_ID")
}
# POST login user by email and password
@users_api.post('/users/login')
def login():
    data = request.json
    email = data.get('Username')
    password = data.get('Password')
    
    if not email or not password: 
        return jsonify({"error": "Username and Password are required"}), 400
    
    firebase_api_key = os.getenv('FIREBASE_API_KEY')
    
    if not firebase_api_key:
        return jsonify({"error": "API key not configured"}), 500
    
    sign_in_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}"
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }

    try:
        response = requests.post(sign_in_url, json=payload)
        response_data = response.json()

        if response.status_code == 200:
            id_token = response_data.get('idToken')
            refresh_token = response_data.get('refreshToken')
            expires_in = response_data.get('expiresIn')
            local_id = response_data.get('localId')
            
            # Store user info in session
            session['user_id'] = local_id
            session['email'] = email

            return jsonify({
                "message": "Login successful",
                "idToken": id_token,
                "refreshToken": refresh_token,
                "expiresIn": expires_in
            }), 200
        else:
            error_message = response_data.get('error', {}).get('message', 'Login failed')
            return jsonify({"error": error_message}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@users_api.post('/users/logout')
def logout():
    try:
        session.clear() # logout user by clearning the session
        return jsonify({"message": "Logout successful."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# GET user by ID
@users_api.get('/users/<user_id>')
def get_user_by_id(user_id):
    user_ref = user_db.collection("USER").document(user_id)
    user_doc = user_ref.get()

    if user_doc.exists:
        return jsonify({user_doc.id: user_doc.to_dict()}), 200  
    else:
        return jsonify({"error": "User not found"}), 404
    
# POST create new user through Firebase authentication
@users_api.post('/users')
def create_user():
    data = request.json
    create = User.from_dict(data)
    password = data['Password']
    
    # Create user with Firebase Authentication
    try:
        user = auth.create_user(email=create.Email, password=password)
        user_id = user.uid
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Store user profile data in Firestore
    try:
        user_ref = user_db.collection("USER").document(user_id)
        create.Id = user_id
        user_profile_data = User.to_dict(create)
        user_ref.set(user_profile_data)
        return jsonify({"message": f"User {user_id} created successfully with Firebase Auth and Firestore"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# PUT update user profile data by ID
@users_api.put('/users/<user_id>')
def update_user_by_id(user_id):
    data = request.json
    user_ref = user_db.collection("USER").document(user_id)
    user_doc = user_ref.get()

    if user_doc.exists:
        try:
            user_ref.update(data)
            return jsonify({"message": f"User {user_id} updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": f"Error updating user: {str(e)}"}), 500
    else:
        return jsonify({"error": "User not found"}), 404
    
# DELETE a user by ID
@users_api.delete('/users/<user_id>')
def delete_user_by_id(user_id):
    # Delete user from Firebase Authentication
    try:
        auth.delete_user(user_id)
    except Exception as e:
        return jsonify({"error": f"Error deleting user in Firebase Auth: {str(e)}"}), 500

    # Delete user profile data from Firestore
    user_ref = user_db.collection("USER").document(user_id)
    user_doc = user_ref.get()

    if user_doc.exists:
        try:
            user_ref.delete()
            return jsonify({"message": f"User {user_id} deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": f"Error deleting user profile: {str(e)}"}), 500
    else:
        return jsonify({"error": "User not found"}), 404