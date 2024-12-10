from flask import Blueprint, jsonify, request
from models.match import Match
from models.match import Status
from firestore_client import db

pet_match_api = Blueprint('pet_match_api', __name__)
pet_db = db.collection("PET")

# Send a match request to a pet
@pet_match_api.post('/pets/<petId>/matches')
def match(petId):
    data = request.json
    otherPetId = Match.from_dict(data).PetId
    match_data = Match(petId)

    try:
        pet_doc_ref = pet_db.document(otherPetId)
        pet_doc_ref.collection("MATCH").add(match_data.to_dict())
        return jsonify({"message": f"Match successfully with pet of PetID {otherPetId}"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
   
# Get all the ID of pets with different match status with my pet 
# /pets/<petID>/matches?status=matched
# /pets/<petID>/matches?status=pending
@pet_match_api.get('/pets/<petId>/matches')
def get_all_matched(petId):
    status = request.args.get('status') 
    if status == Status.MATCHED.value:
        try:
            pet_doc_ref = pet_db.document(petId)
            match_collection = pet_doc_ref.collection("MATCH")

            matched_docs = match_collection.where("Status", "==", Status.MATCHED.value).get()
            matched_pet_ids = []
            for doc in matched_docs:
                match = Match.from_dict(doc.to_dict())
                if match:
                    matched_pet_ids.append(match.PetId)

            return jsonify(matched_pet_ids if matched_pet_ids else None), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        try:
            pet_doc_ref = pet_db.document(petId)
            match_collection = pet_doc_ref.collection("MATCH")

            pending_docs = match_collection.where("Status", "==", Status.PENDING.value).get()
            pending_pet_ids = []
            for doc in pending_docs:
                match = Match.from_dict(doc.to_dict())
                if match:
                    pending_pet_ids.append(match.PetId)

            return jsonify(pending_pet_ids if pending_pet_ids else None), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
# Get all the ID of pets that is not currently matched with my pet
@pet_match_api.get('/pets/<petId>/not_match')
def get_all_not_match(petId):
    # Reference the specific pet document
    pet_doc_ref = pet_db.document(petId)
    match_collection = pet_doc_ref.collection("MATCH")

    # Get all matched pet IDs
    match_pet_ids = {doc.to_dict().get('PetId') for doc in match_collection.stream()}
    match_pet_ids = {pet_id for pet_id in match_pet_ids}
    match_pet_ids.add(petId)

    # Get all pet IDs
    pet_ids = {doc.id for doc in pet_db.stream()}  

    # Get IDs of pets not matched with the given pet
    unmatched_pet_ids = list(pet_ids - match_pet_ids)

    # Return as a JSON response
    return jsonify({"unmatched_pet_ids": unmatched_pet_ids}), 200


# /pets/<petId>/matches?action=accept Accept a pending match request
@pet_match_api.put('/pets/<petId>/matches')
def accept_pending_match(petId):
    data = request.json
    otherPetId = Match.from_dict(data).PetId
    action = request.args.get("action", "accept")

    if action == "accept":
        try:
            # Update my pet status with other pet to matched
            update_match_data = Match(otherPetId, Status.MATCHED.value)
            my_pet_doc_ref = pet_db.document(petId)
            match_collection = my_pet_doc_ref.collection("MATCH")
            
            match_doc_ref = match_collection.where("PetId", "==", otherPetId).get()[0].reference
            match_doc_ref.update(update_match_data.to_dict())

            # Create an entry in other pet MATCH collection
            match_data = Match(petId, Status.MATCHED.value)
            other_pet_doc_ref = pet_db.document(otherPetId)
            match_collection = other_pet_doc_ref.collection("MATCH").add(match_data.to_dict())
            return jsonify({"message": f"Match status updated to 'matched' with petID {otherPetId}"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Invalid action specified"}), 400


# Heler function to unmatch pet
def unmatch_pet(petId, otherPetId):
    try:
        other_pet_doc_ref = pet_db.document(otherPetId)
        other_match_collection = other_pet_doc_ref.collection("MATCH")
        other_match_doc_ref = other_match_collection.where("PetId", "==", petId).get()[0].reference
        
        # If the request is matched -> Need to delete the entry in my pet MATCH table as well
        if Match.from_dict(other_match_doc_ref.get().to_dict()).Status == Status.MATCHED.value:
            pet_doc_ref = pet_db.document(petId)
            match_collection = pet_doc_ref.collection("MATCH")
            match_doc_ref = match_collection.where("PetId", "==", otherPetId).get()[0].reference
            match_doc_ref.delete()
        
        # Delete Match entry in other pet MATCH table 
        other_match_doc_ref.delete()

        return jsonify({"message": f"Unmatch successfully with pet of petId {otherPetId}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Helper function to reject pet
def reject_pet(petId, otherPetId):
    try:
        pet_doc_ref = pet_db.document(petId)
        match_collection = pet_doc_ref.collection("MATCH")
        match_doc_ref = match_collection.where("PetId", "==", otherPetId).get()[0].reference
        match_doc_ref.delete()

        return jsonify({"message": f"Reject pet with petId {otherPetId}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# /pets/<petId>/matches?action=unmatch Unmatch with a pet that we have matched with or have sent a request
# /pets/<petId>/matches?action=reject  Reject a matching request from another pet
@pet_match_api.delete('/pets/<petId>/matches')
def unmatch(petId):
    data = request.json
    otherPetId = Match.from_dict(data).PetId
    action = request.args.get("action")

    if action == "unmatch":
        return unmatch_pet(petId, otherPetId)
    elif action == "reject":
        return reject_pet(petId, otherPetId)
    else:
        return jsonify({"error": "Invalid action specified"}), 400