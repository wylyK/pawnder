from flask import Blueprint, jsonify, request
from firebase_admin import firestore
from connect_firebase import PawnderFirebase
from models.match import Match
from models.match import Status

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
@pet_match_api.delete('/unmatch')
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
    
# Get all the ID of pets that have matched status with petID
@pet_match_api.get('/match/<myPetID>')
def get_all_matched(myPetID):
    try:
        pet_doc_ref = pet_db.document(myPetID)
        match_collection = pet_doc_ref.collection("MATCH")

        matched_docs = match_collection.where("status", "==", Status.MATCHED.value).get()
        matched_pet_ids = [match.petID for doc in matched_docs if (match := Match.from_dict(doc.to_dict()))]

        return jsonify(matched_pet_ids if matched_pet_ids else None), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get all the ID of pets that have pending status with petID
@pet_match_api.get('/match/pending/<myPetID>')
def get_all_pending(myPetID):
    try:
        pet_doc_ref = pet_db.document(myPetID)
        match_collection = pet_doc_ref.collection("MATCH")

        pending_docs = match_collection.where("status", "==", Status.PENDING.value).get()
        pending_pet_ids = [match.petID for doc in pending_docs if (match := Match.from_dict(doc.to_dict()))]

        return jsonify(pending_pet_ids if pending_pet_ids else None), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Accept a pending match request
@pet_match_api.put('/match/pending')
def accept_pending_match():
    data = request.json
    match = Match.from_dict(data)

    try:
        pet_doc_ref = pet_db.document(match.myPetID)
        match_collection = pet_doc_ref.collection("MATCH")
        match_doc_ref = match_collection.where("petID", "==", match.petID).get()[0].reference
        match_doc_ref.update({"status": Status.MATCHED.value})
        return jsonify({"message": f"Match status updated to 'matched' with petID {match.petID}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500