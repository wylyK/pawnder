from enum import Enum
from flask import Blueprint, jsonify, request, session
from firebase_admin import firestore, auth
from connect_firebase import PawnderFirebase

pet_match_api = Blueprint('pet_match_api', __name__)
pawnder_firebase = PawnderFirebase()
db = firestore.client()
match_db = db.collection("MATCH")

class Status(Enum):
    PENDING = "pending"
    MATCHED = "matched"

# Match with a pet
@pet_match_api.post('/match')
def match():
    data = request.json

    myPetID = data['myPetID']
    petID = data['petID']
    status = Status.PENDING.value

    match_data = {
        "myPetID": myPetID,
        "petID": petID,
        "status": status
    }

    try:
        match_db.document().set(match_data)
        return jsonify({"message": f"Match successfully with pet of petID {petID}"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

