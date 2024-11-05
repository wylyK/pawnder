from flask import Blueprint, jsonify, request
from firebase_admin import firestore
from connect_firebase import PawnderFirebase
from models.pet import Pet

pets_api = Blueprint('pets_api', __name__)
pawnder_firebase = PawnderFirebase()
pet_db = firestore.client()

# GET all pet profiles
@pets_api.get('/pets')
def get_all_pets():
    pets_ref = pet_db.collection("PET")
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

# GET pet profile by ID
@pets_api.get('/pets/<pet_id>')
def get_pet_by_id(pet_id):
    pet_ref = pet_db.collection("PET").document(pet_id)
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
        return jsonify({pet_doc.id: pet_data}), 200 
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
            Description=data.get('Description',""),
            Tag=data.get('Tag', []),
            UserID=data['UserID']
        )
        pet_ref = pet_db.collection("PET").document()
        pet_ref.set(pet.to_dict())
        return jsonify({"message": f"Pet {pet_ref.id} created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# POST add health record to pet profile by ID
    
# PUT update pet profile data by ID
@pets_api.put('/pets/<pet_id>')
def update_pet_by_id(pet_id):
    data = request.json
    pet_ref = pet_db.collection("PET").document(pet_id)
    pet_doc = pet_ref.get()

    if pet_doc.exists:
        pet = Pet.from_dict(pet_doc.to_dict())
        pet.Name = data['Name']
        pet.Age = data['Age']
        pet.Breed = data['Breed']
        pet.Type = data['Type']
        pet.Avatar = data['Avatar']
        pet.Description = data.get('Description', pet.Description)
        pet.Tag = data.get('Tag', pet.Tag)
        pet.UserID = data.get('UserID', pet.UserID)

        try:
            pet_ref.set(pet.to_dict())
            return jsonify({"message": f"Pet {pet_id} updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}),

# DELETE pet profile by ID
@pets_api.delete('/pets/<pet_id>')
def delete_pet_by_id(pet_id):
    pet_ref = pet_db.collection("PET").document(pet_id)
    pet_doc = pet_ref.get()

    if pet_doc.exists:
        try:
            pet_ref.delete()
            return jsonify({"message": f"Pet {pet_id} deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": f"Error deleting pet profile: {str(e)}"}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404