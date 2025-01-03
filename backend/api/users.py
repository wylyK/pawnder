from flask import Blueprint, jsonify, request, session, current_app
from firebase_admin import firestore, auth, storage
from dotenv import load_dotenv
import os
import requests
from models.user import User
from api.petHealth import get_health, create_health, update_health
from firestore_client import db
from urllib.parse import quote

users_api = Blueprint('users_api', __name__)
user_db = db.collection("USER")
pet_db = db.collection("PET")
# Bucket to store data in Firebase storage
bucket = storage.bucket()
load_dotenv()

#GET /vets/<vet_id>/pets

@users_api.get('/vets/<vet_id>/pets')
def get_pets_by_vet_id(vet_id):
    try:
        # Query pets that have this vet in their HEALTH subcollection
        pets = []
        pet_docs = pet_db.stream()
        
        for pet_doc in pet_docs:
            health_docs = pet_doc.reference.collection("HEALTH").stream()
            for health_doc in health_docs:
                health_data = health_doc.to_dict()
                if health_data.get("VetId") == vet_id:  # Match vet_id
                    pets.append({"id": pet_doc.id, **pet_doc.to_dict()})
                    break  # No need to check other health docs for this pet
        
        if not pets:
            return jsonify({"message": "No pets found for this vet."}), 404
        
        return jsonify(pets), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@users_api.put('/connect_vet/')
def connect_vet():
    try:
        data = request.json 
        vet_id = data.get("VetId")
        pet_id = data.get("PetId")
        
        vet_doc_ref = user_db.document(vet_id) 
        pet_doc_ref = pet_db.document(pet_id)
        
        vet_doc = vet_doc_ref.get()
        if not vet_doc.exists:
            return jsonify({"error": f"Vet {vet_id} not found"}), 404

        vet_data = vet_doc.to_dict()
        if vet_data.get("Role") != "Vet":
            return jsonify({"error": "Access denied: User is not a Vet"}), 403
        
        health_docs = pet_doc_ref.collection("HEALTH").limit(1).get()
        if not health_docs:
            with current_app.test_request_context(json={"VetId": [vet_id]}):
                create_response = create_health(pet_id)
                if create_response[1] != 201:  # Assuming create_health returns a tuple (response, status_code)
                    return create_response  # Return early if creation fails
        else:
            health_doc_ref = health_docs[0].reference
            
            health_doc_ref.update({
                "VetId": firestore.ArrayUnion([vet_id])
            })
        vet_doc_ref.update({
            "PetId": firestore.ArrayUnion([pet_id])
        })

        return jsonify({"message": f"Vet {vet_id} successfully connected to Pet {pet_id}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# POST login user by email and password
@users_api.post('/users/login')
def login():
    data = request.json
    email = data.get('Email')
    password = data.get('Password')
    
    if not email or not password: 
        return jsonify({"error": "Email and Password are required"}), 400
    
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

            # Retrieve user details from Firestore
            user_ref = user_db.document(local_id)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return jsonify({"error": "User record not found"}), 404
            
            user_data = user_doc.to_dict()
            
            # Store user info in session
            session['user_id'] = local_id
            session['email'] = email

            return jsonify({
                "message": "Login successful",
                "user": {
                    "Id": local_id,
                    "FName": user_data.get('FName'),
                    "LName": user_data.get('LName'),
                    "Email": email,
                    "Location": user_data.get('Location', ""),
                    "Role": user_data.get('Role'),
                    "PetId": user_data.get('PetId', []),
                    "Avatar": user_data.get('Avatar', ""),
                },
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
    user_ref = user_db.document(user_id)
    user_doc = user_ref.get()

    if user_doc.exists:
        return jsonify({user_doc.id: user_doc.to_dict()}), 200  
    else:
        return jsonify({"error": "User not found"}), 404
    

# GET users by IDs
# /users/ids?ids=userId1,userId2
@users_api.get('/users/ids')
def get_users_by_ids():
    user_ids = request.args.get('ids')
    if not user_ids:
        return jsonify({"error": "No user IDs provided"}), 400
    user_ids_list = user_ids.split(',')
    users = {}
    for user_id in user_ids_list:
        user_ref = user_db.document(user_id)
        user_doc = user_ref.get()

        if user_doc.exists:
            users[user_id] = user_doc.to_dict()
        else:
            users[user_id] = {"error": "User not found"}

    return jsonify(users), 200

# GET users (vet) by PetId
# /users/petId/<petId> 
@users_api.get('/users/petId/<petId>')
def get_users_by_pet_id(petId):
    user_refs = user_db.where("Role", "==", "Vet").where("PetId", "array_contains", petId).stream()
    users = {user.id: user.to_dict() for user in user_refs}
    if not users:
        return jsonify({"message": "No users found for this petId"}), 404
    return jsonify(users), 200

# Get all events by userId
@users_api.get('/users/<user_id>/events')
def get_events_by_user_id(user_id):
    user_ref = user_db.document(user_id)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        return jsonify({"error": "User not found"}), 404
    
    user_data = user_doc.to_dict()
    user_role = user_data.get('Role', '')

    if user_role == 'Owner':
        try:
            pet_docs = pet_db.where("UserId", "==", user_id).stream()
            events = []
            for pet_doc in pet_docs:
                pet_id = pet_doc.id
                event_docs = pet_doc.reference.collection("EVENT").stream()
                for event_doc in event_docs:
                    event_data = event_doc.to_dict() or {}
                    event_data['Id'] = event_doc.id
                    event_data['PetId'] = pet_id
                    events.append(event_data)
            
            return jsonify(events), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        pet_ids = user_data.get('PetId', [])
        events = []
        for pet_id in pet_ids:
            pet_doc_ref = pet_db.document(pet_id)
            event_docs = pet_doc_ref.collection("EVENT").stream()
            for event_doc in event_docs:
                event_data = event_doc.to_dict() or {}
                event_data['Id'] = event_doc.id
                event_data['PetId'] = pet_id
                events.append(event_data)

        return jsonify(events), 200
    
# GET all reminders by userId
@users_api.get('/users/<user_id>/reminders')
def get_reminders_by_user_id(user_id):
    user_ref = user_db.document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return jsonify({"error": "User not found"}), 404
    
    user_data = user_doc.to_dict()
    user_role = user_data.get('Role', '')

    if user_role == 'Owner':
        try:
            pet_docs = pet_db.where("UserId", "==", user_id).stream()
            reminders = []
            for pet_doc in pet_docs:
                pet_id = pet_doc.id
                reminder_docs = pet_doc.reference.collection("REMINDER").stream()
                for reminder_doc in reminder_docs:
                    reminder_data = reminder_doc.to_dict() or {}
                    reminder_data['Id'] = reminder_doc.id
                    reminder_data['PetId'] = pet_id
                    reminders.append(reminder_data)
            
            return jsonify(reminders), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        pet_ids = user_data.get('PetId', [])
        reminders = []
        for pet_id in pet_ids:
            pet_doc_ref = pet_db.document(pet_id)
            reminder_docs = pet_doc_ref.collection("REMINDER").stream()
            for reminder_doc in reminder_docs:
                reminder_data = reminder_doc.to_dict() or {}
                reminder_data['Id'] = reminder_doc.id
                reminder_data['PetId'] = pet_id
                reminders.append(reminder_data)

        return jsonify(reminders), 200

# GET all petids by userId
@users_api.get('/users/<user_id>/pets')
def get_pets_by_user_id(user_id):
    user_ref = user_db.document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        if user_data.get('Role') == 'Owner':
            try:
                pet_docs = pet_db.where("UserId", "==", user_id).stream()
                pet_ids = [pet.id for pet in pet_docs]
                return jsonify(pet_ids), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        else:
            return jsonify(user_data.get('PetId')), 200
    else:
        return jsonify({"error": "User not found"}), 404

# Get all events by userId and status
# /users/<userId>/events/status?status=scheduled
@users_api.get('/users/<user_id>/events/status')
def get_events_by_user_id_and_status(user_id):
    status = request.args.get('status')
    user_ref = user_db.document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        if user_data.get('Role') == 'Owner':
            try:
                pet_docs = pet_db.where("UserId", "==", user_id).stream()
                pet_ids = [pet.id for pet in pet_docs]
                event_docs = []
                for pet_id in pet_ids:
                    pet_doc_ref = pet_db.document(pet_id)
                    event_docs.extend(pet_doc_ref.collection("EVENT").where("Status", "==", status).stream())
                events = [event.to_dict() for event in event_docs]
                return jsonify(events), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        else:
            pet_ids = user_data.get('PetId')
            event_docs = []
            for pet_id in pet_ids:
                pet_doc_ref = pet_db.document(pet_id)
                event_docs.extend(pet_doc_ref.collection("EVENT").where("Status", "==", status).stream())
            events = [event.to_dict() for event in event_docs]
            return jsonify(events), 200
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
        user_ref = user_db.document(user_id)
        create.Id = user_id
        user_profile_data = User.to_dict(create)
        user_ref.set(user_profile_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": f"User {user_id} created successfully with Firebase Auth and Firestore"}), 201
    
# PUT update user profile data by ID
@users_api.put('/users/<user_id>')
def update_user_by_id(user_id):
    data = request.form
    
    user_ref = user_db.document(user_id)
    user_doc = user_ref.get()

    if user_doc.exists:
        user = User.from_dict(user_doc.to_dict())
        user.FName = data.get('FName', user.FName)
        user.LName = data.get('LName', user.LName)
        user.Location = data.get('Location', user.Location)
        user.PetId = data.get('PetId', user.PetId)
        
        if 'Avatar' in request.files:
            image_file = request.files['Avatar']
            #If user upload a file
            if image_file.filename != '':
                try:
                    file_extension = image_file.filename.rsplit('.', 1)[-1].lower()
                    file_path = f"userImages/{user_id}.{file_extension}"

                    # Define the path for the image in Firebase Storage
                    blob = bucket.blob(file_path)

                    # Upload the file with the pet_id as the filename
                    blob.upload_from_file(image_file)

                    encoded_file_path = quote(file_path, safe='')
                    download_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{encoded_file_path}?alt=media"
                    user.Avatar = download_url 
                except Exception as e:
                    return jsonify({"error": f"Image upload failed: {str(e)}"}), 500

        try:
            user_ref.update(user.to_dict())
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
    user_ref = user_db.document(user_id)
    user_doc = user_ref.get()

    if user_doc.exists:
        try:
            user_ref.delete()
            return jsonify({"message": f"User {user_id} deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": f"Error deleting user profile: {str(e)}"}), 500
    else:
        return jsonify({"error": "User not found"}), 404