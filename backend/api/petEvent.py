from flask import Blueprint, jsonify, request
from models.event import Event
from firestore_client import db
from firebase_admin import firestore

pet_event_api = Blueprint('pet_event_api', __name__)
pet_db = db.collection("PET")
    
# Get all events by petId
@pet_event_api.get('/pets/<petId>/events')
def get_events_by_petid(petId):
    pet_doc_ref = pet_db.document(petId)
    pet_doc = pet_doc_ref.get()
    if pet_doc.exists:
        try:
            event_docs = pet_doc_ref.collection("EVENT").stream()
            # events = [Event.from_dict(event.to_dict()) for event in event_docs]
            events = []
            for event_doc in event_docs:
                event_data = event_doc.to_dict()
                event_data['Id'] = event_doc.id
                events.append(event_data)
            return jsonify(events), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404

# Get all events by status
# /pets/<petId>/events/status?status=scheduled
@pet_event_api.get('/pets/<petId>/events/status')
def get_events_by_status(petId):
    status = request.args.get('status')
    pet_doc_ref = pet_db.document(petId)
    pet_doc = pet_doc_ref.get()
    if pet_doc.exists:
        try:
            event_docs = (
                pet_doc_ref
                .collection("EVENT")
                .where("Status", "==", status)
                .stream()
            )
            events = [Event.from_dict(event.to_dict()) for event in event_docs]
            return jsonify([event.to_dict() for event in events]), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404

# Get all events by type
# /pets/<petId>/events/type?type=vaccination
@pet_event_api.get('/pets/<petId>/events/type')
def get_events_by_type(petId):
    event_type = request.args.get('type')
    pet_doc_ref = pet_db.document(petId)
    pet_doc = pet_doc_ref.get()
    if pet_doc.exists:
        try:
            event_docs = (
                pet_doc_ref
                .collection("EVENT")
                .where("Type", "==", event_type)
                .stream()
            )
            events = [Event.from_dict(event.to_dict()) for event in event_docs]
            return jsonify([event.to_dict() for event in events]), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404
    
# Get all events by userId (vet)
    
# Create an event by a vet
@pet_event_api.post('/pets/<petId>/events')
def create_event(petId):
    data = request.json
    pet_doc_ref = pet_db.document(petId)
    pet_doc = pet_doc_ref.get()
    if pet_doc.exists:
        try:
            event_ref = pet_doc_ref.collection("EVENT").document()
            data["CreatedAt"] = firestore.SERVER_TIMESTAMP
            event = Event.from_dict(data)
            event_ref.set(event.to_dict())
            return jsonify({"message": f"Event for pet {petId} created successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404

# Update an event by ID
@pet_event_api.put('/pets/<petId>/events/<eventId>')
def update_event_by_id(petId, eventId):
    data = request.json
    pet_doc_ref = pet_db.document(petId)
    pet_doc = pet_doc_ref.get()
    if pet_doc.exists:
        event_ref = pet_doc_ref.collection("EVENT").document(eventId)
        event_doc = event_ref.get()
        if event_doc.exists:
            try:
                event_ref.update(data)
                return jsonify({"message": f"Event {eventId} updated successfully"}), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        else:
            return jsonify({"error": "Event not found"}), 404
    else:
        return jsonify({"error": "Pet not found"}), 404

# Delete an event by ID
@pet_event_api.delete('/pets/events/<eventId>')
def delete_event_by_id(eventId):
    pet_doc_ref = pet_db.stream()
    try:
        for pet in pet_doc_ref:
            pet_ref = pet_db.document(pet.id)
            event_ref = pet_ref.collection("EVENT").document(eventId)
            event_doc = event_ref.get()
            if event_doc.exists:
                event_ref.delete()
                return jsonify({"message": f"Event {eventId} deleted successfully"}), 200
        return jsonify({"error": "Event not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500