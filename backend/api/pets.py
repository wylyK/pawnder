from flask import Blueprint, jsonify, request
from firebase_admin import storage, auth
from models.pet import Pet
from firestore_client import db
from urllib.parse import quote

# Bucket to store data in Firebase storage
bucket = storage.bucket()

pets_api = Blueprint('pets_api', __name__)

# GET pets by type
# /pets/type?type=Dog
@pets_api.get('/pets/type')
def get_pets_by_type():
    pet_type = request.args.get('type')
    pet_ref = db.collection("PET")
    try:
        pet_docs = (
            pet_ref
            .where("Type", "==", pet_type)
            .stream()
        )
        pet_ids = [pet.id for pet in pet_docs]
        return jsonify(pet_ids), 200
    except Exception as e:
        return jsonify({"error": f"Error getting pets: {str(e)}"}), 500
    
# GET pets by location
# /pets/location?location=NY
@pets_api.get('/pets/location')
def get_pets_by_location():
    location = request.args.get('location')
    user_ref = db.collection("USER")
    try:
        user_docs = (
            user_ref
            .where("Role", "==", "Owner")
            .where("Location", "==", location)
            .stream()
        )
        user_ids = [user.id for user in user_docs]
        pet_ref = db.collection("PET")
        if user_ids == []:
            return jsonify([]), 200
        try:
            pet_docs = (
                pet_ref
                .where("UserId", "in", user_ids)
                .stream()
            )
            pet_ids = [pet.id for pet in pet_docs]
            return jsonify(pet_ids), 200
        except Exception as e:
            return jsonify({"error": f"Error getting pets: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error getting pets: {str(e)}"}), 500
    
# GET all pet profiles
@pets_api.get('/pets')
def get_all_pets():
    pets_ref = db.collection("PET")
    pets_docs = pets_ref.stream()
    try:
        pets = {}
        for pet in pets_docs:
            pet_data = pet.to_dict()
            pet_data['MatchRecords'] = [
                match.to_dict() for match in pet.reference.collection("MATCH").stream()
            ]
            pet_data['HealthRecords'] = [
                record.to_dict() for record in pet.reference.collection("HEALTH").stream()
            ]
            pet_data['EventRecords'] = [
                event.to_dict() for event in pet.reference.collection("EVENT").stream()
            ]
            pets[pet.id] = pet_data
        return jsonify(pets), 200
    except Exception as e:
        return jsonify({"error": f"Error getting pets: {str(e)}"}), 500

# GET pet profile by Firestore document ID
@pets_api.get('/pets/<pet_id>')
def get_pet_by_id(pet_id):
    pet_ref = db.collection("PET").document(pet_id)
    pet_doc = pet_ref.get()

    if pet_doc.exists:
        pet_data = pet_doc.to_dict()
        pet_data['MatchRecords'] = [
            match.to_dict() for match in pet_ref.collection("MATCH").stream()
        ]
        pet_data['HealthRecords'] = [
            record.to_dict() for record in pet_ref.collection("HEALTH").stream()
        ]
        pet_data['EventRecords'] = [
            event.to_dict() for event in pet_ref.collection("EVENT").stream()
        ]
        return jsonify({pet_id: pet_data}), 200
    else:
        return jsonify({"error": "Pet not found"}), 404

# POST create new pet profile with basic information
@pets_api.post('/pets/create')
def create_pet():
    data = request.json
    try: 
        pet = Pet(
            Name=data['Name'],
            Age=data['Age'],
            Breed=data['Breed'],
            Type=data['Type'],
            Avatar=data['Avatar'],
            Description=data.get('Description', ""),
            Tag=data.get('Tag', []),
            UserId=data['UserId']
        )
        pet_ref = db.collection("PET").document()
        pet_ref.set(pet.to_dict())
        return jsonify({"message": f"Pet {pet_ref.id} created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# PUT update pet profile data by Firestore document ID
@pets_api.put('/pets/<pet_id>')
def update_pet_by_id(pet_id):
    data = request.form
    pet_ref = db.collection("PET").document(pet_id)
    pet_doc = pet_ref.get()

    if pet_doc.exists:
        pet = Pet.from_dict(pet_doc.to_dict())
        pet.Name = data.get('Name', pet.Name)
        pet.Age = data.get('Age', pet.Age)
        pet.Breed = data.get('Breed', pet.Breed)
        pet.Type = data.get('Type', pet.Type)
        pet.Avatar = data.get('Avatar', pet.Avatar)
        pet.Description = data.get('Description', pet.Description)
        pet.Tag = data.get('Tag', pet.Tag)
        pet.UserId = data.get('UserId', pet.UserId)
        
        # request.files handle all the files sent along in the HTTP request
        if 'Avatar' in request.files:
            image_file = request.files['Avatar']
            #If user upload a file
            if image_file.filename != '':
                try:
                    file_extension = image_file.filename.rsplit('.', 1)[-1].lower()
                    file_path = f"petImages/{pet_id}.{file_extension}"

                    # Define the path for the image in Firebase Storage
                    blob = bucket.blob(file_path)

                    # Upload the file with the pet_id as the filename
                    blob.upload_from_file(image_file)

                    encoded_file_path = quote(file_path, safe='')
                    download_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{encoded_file_path}?alt=media"
                    pet.Avatar = download_url        
                except Exception as e:
                    return jsonify({"error": f"Image upload failed: {str(e)}"}), 500

        try:
            pet_ref.set(pet.to_dict())
            return jsonify({"message": f"Pet {pet_id} updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404

# DELETE pet profile by Firestore document ID
@pets_api.delete('/pets/<pet_id>')
def delete_pet_by_id(pet_id):
    pet_ref = db.collection("PET").document(pet_id)
    pet_doc = pet_ref.get()

    if pet_doc.exists:
        try:
            pet_ref.delete()
            return jsonify({"message": f"Pet {pet_id} deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": f"Error deleting pet profile: {str(e)}"}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404
