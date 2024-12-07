from flask import Blueprint, jsonify, request
from models.reminder import Reminder
from firestore_client import db

pet_reminder_api = Blueprint('pet_reminder_api', __name__)
pet_db = db.collection("PET")
    
# Get all reminders by petId
@pet_reminder_api.get('/pets/<petId>/reminders')
def get_reminders_by_petid(petId):
    pet_doc_ref = pet_db.document(petId)
    pet_doc = pet_doc_ref.get()
    if pet_doc.exists:
        try:
            reminder_docs = pet_doc_ref.collection("REMINDER").stream()
            reminders = []
            for reminder_doc in reminder_docs:
                reminder_data = reminder_doc.to_dict()
                reminder_data['Id'] = reminder_doc.id
                reminders.append(reminder_data)
            return jsonify(reminders), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404

# Get reminder by ID
@pet_reminder_api.get('/reminders/<reminderId>')
def get_reminder_by_id(reminderId):
    pet_doc_ref = pet_db.stream()
    try:
        for pet in pet_doc_ref:
            pet_ref = pet_db.document(pet.id)
            reminder_ref = pet_ref.collection("REMINDER").document(reminderId)
            reminder_doc = reminder_ref.get()
            if reminder_doc.exists:
                reminder_data = reminder_doc.to_dict()
                reminder_data['Id'] = reminder_doc.id
                reminder_data['PetName'] = pet.to_dict()['Name']
                return jsonify(reminder_data), 200
        return jsonify({"error": "Reminder not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Create an reminder by a pet owner
@pet_reminder_api.post('/pets/<petId>/reminders')
def create_reminder(petId):
    data = request.json
    pet_doc_ref = pet_db.document(petId)
    pet_doc = pet_doc_ref.get()
    if pet_doc.exists:
        try:
            reminder_ref = pet_doc_ref.collection("REMINDER").document()
            reminder = Reminder.from_dict(data)
            reminder_ref.set(reminder.to_dict())
            return jsonify({"message": f"Reminder for pet {petId} created successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Pet not found"}), 404

# Delete an reminder by ID
@pet_reminder_api.delete('/pets/reminders/<reminderId>')
def delete_reminder_by_id(reminderId):
    pet_doc_ref = pet_db.stream()
    try:
        for pet in pet_doc_ref:
            pet_ref = pet_db.document(pet.id)
            reminder_ref = pet_ref.collection("REMINDER").document(reminderId)
            reminder_doc = reminder_ref.get()
            if reminder_doc.exists:
                reminder_ref.delete()
                return jsonify({"message": f"Reminder {reminderId} deleted successfully"}), 200
        return jsonify({"error": "Reminder not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@pet_reminder_api.delete('/pets/reminders/delete')
def delete_multiple_reminders():
    data = request.json
    reminder_ids = data.get('reminderIds', [])

    if not reminder_ids:
        return jsonify({"error": "No reminderIds provided"}), 400

    # We'll fetch all pets once. Note: If you have a large dataset, consider optimizing this.
    pet_docs = list(pet_db.stream())  # Convert to a list for re-iteration if needed

    deleted = []
    not_found = []

    try:
        # For each reminderId, try to find and delete it
        for reminder_id in reminder_ids:
            found = False
            # Search through all pets to find the reminder
            for pet in pet_docs:
                pet_ref = pet_db.document(pet.id)
                reminder_ref = pet_ref.collection("REMINDER").document(reminder_id)
                reminder_doc = reminder_ref.get()
                if reminder_doc.exists:
                    reminder_ref.delete()
                    deleted.append(reminder_id)
                    found = True
                    break
            if not found:
                not_found.append(reminder_id)

        return jsonify({
            "deleted": deleted,
            "not_found": not_found
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
