from flask import Blueprint, jsonify, request
from firebase_admin import firestore
from connect_firebase import PawnderFirebase
from models.health import Health

pet_health_api = Blueprint('pet_health_api', __name__)
pawnder_firebase = PawnderFirebase()
db = firestore.client()
pet_db = db.collection("PET")

# Get the health information of a pet
@pet_health_api.get('/pets/<petId>/health')
def get_health(petId):
    try:
        pet_doc_ref = pet_db.document(petId)
        health_docs = pet_doc_ref.collection("HEALTH").limit(1).get()
        health_doc = health_docs[0].to_dict()
        health = Health.from_dict(health_doc)
        return jsonify(health.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Create the health information of a pet
@pet_health_api.post('/pets/<petId>/health')
def create_health(petId):
    data = request.json
    pet_doc_ref = pet_db.document(petId)
    pet_doc = pet_doc_ref.get()
    if pet_doc.exists:
        try:
            health_ref = pet_doc_ref.collection("HEALTH").document()  # Auto-generate a new document ID
            health = Health.from_dict(data)
            health_ref.set(health.to_dict())  # Use `set` to save the data
            return jsonify({"message": f"Health information of pet {petId} created successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404
    
# Update the health information of a pet
@pet_health_api.put('/pets/<petId>/health')
def update_health(petId):
    data = request.json
    pet_doc_ref = pet_db.document(petId)
    pet_doc = pet_doc_ref.get()
    if pet_doc.exists:
        try:
            health_docs = pet_doc_ref.collection("HEALTH").limit(1).get()
            health_doc_ref = health_docs[0].reference
            health = Health.from_dict(data)
            health_doc_ref.update(health.to_dict())
            return jsonify({"message": f"Health information of pet {petId} updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404
    
# Delete the health information of a pet
@pet_health_api.delete('/pets/<petId>/health')
def delete_health(petId):
    pet_doc_ref = pet_db.document(petId)
    pet_doc = pet_doc_ref.get()
    if pet_doc.exists:
        try:
            health_collection = pet_doc_ref.collection("HEALTH")
            health_collection_ref = health_collection.stream()
            for doc in health_collection_ref:
                doc.reference.delete()
            return jsonify({"message": f"Health information of pet {petId} deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404
