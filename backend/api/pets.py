from flask import Blueprint, jsonify, request
from firebase_admin import firestore
from connect_firebase import PawnderFirebase
from models.pet import Pet

pets_api = Blueprint('pets_api', __name__)
pawnder_firebase = PawnderFirebase()
pet_db = firestore.client()

# GET pet profile by ID
@pets_api.get('/pets/<pet_id>')
def get_pet_by_id(pet_id):
    pet_ref = pet_db.collection("PET").document(pet_id)
    pet_doc = pet_ref.get()

    if pet_doc.exists:
        return jsonify({pet_doc.id: pet_doc.to_dict()}), 200  
    else:
        return jsonify({"error": "Pet not found"}), 404
    
# POST create new pet profile
@pets_api.post('/pets/create')
def create_pet():
    data = request.json

    name = data['Name']
    age = data['Age']
    breed = data['Breed']
    avatar = data['Avatar']
    location = data['Location']
    description = data['Description']
    userId = data['UserId']

    try: 
        pet = Pet(name, age, breed, avatar, location, description, userId)
        print(pet.to_dict())
        pet_ref = pet_db.collection("PET").document()
        pet_ref.set(pet.to_dict())
        return jsonify({"message": f"Pet {pet_ref.id} created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# PUT update pet profile data by ID
@pets_api.put('/pets/<pet_id>')
def update_pet_by_id(pet_id):
    data = request.json
    pet_ref = pet_db.collection("PET").document(pet_id)
    pet_doc = pet_ref.get()

    if pet_doc.exists:
        pet = Pet.from_dict(pet_doc.to_dict())
        pet.name = data['Name']
        pet.age = data['Age']
        pet.breed = data['Breed']
        pet.avatar = data['Avatar']
        pet.location = data['Location']
        pet.description = data['Description']
        pet.userId = data['UserId']

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