from flask import Blueprint, jsonify, request
from firebase_admin import firestore
from connect_firebase import PawnderFirebase
from models.match import Match

pet_match_api = Blueprint('pet_match_api', __name__)
pawnder_firebase = PawnderFirebase()
db = firestore.client()
pet_db = db.collection("PET")

# Match with a pet
@pet_match_api.post('/match')
def match():
    data = request.json
    match = Match.from_dict(data)

    try:
        pet_doc_ref = pet_db.document(match.myPetID)
        pet_doc_ref.collection("MATCH").add(match.to_dict())
        return jsonify({"message": f"Match successfully with pet of petID {match.petID}"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Unmatch with a pet
@pet_match_api.delete('/match')
def unmatch():
    data = request.json
    match = Match.from_dict(data)

    try:
        pet_doc_ref = pet_db.document(match.myPetID)
        match_collection = pet_doc_ref.collection("MATCH")
        match_doc_ref = match_collection.where("petID", "==", match.petID).get()[0].reference
        match_doc_ref.delete()
        return jsonify({"message": f"Unmatch successfully with pet of petID {match.petID}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500