from flask import Blueprint, jsonify, request
from firebase_admin import auth, firestore
from connect_firebase import PawnderFirebase

users_api = Blueprint('users_api', __name__)
pawnder_firebase = PawnderFirebase()
user_db = firestore.client()

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

    contact = data['Contact']
    fname = data['FName']
    lname = data['LName']
    password = data['Password']
    username = data['Username']

    # Create user with Firebase Authentication
    try:
        user = auth.create_user(email=username, password=password)
        user_id = user.uid
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Store user profile data in Firestore
    try:
        user_ref = user_db.collection("USER").document(user_id)
        user_profile_data = {
            "Contact": contact,
            "FirstName": fname,
            "LastName": lname,
            "Username": username
        }
        user_ref.set(user_profile_data)
        return jsonify({"message": f"User {user_id} created successfully with Firebase Auth and Firestore"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500