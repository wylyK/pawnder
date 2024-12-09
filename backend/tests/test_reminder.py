from api.petReminder import pet_reminder_api
import pytest
from unittest.mock import MagicMock 
from flask import Flask

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(pet_reminder_api)
    app.testing = True
    return app.test_client()

# Test 1: get reminder with sucess ------------------------------------------------------------
def test_get_reminders_by_petid_success(client, mocker):
    pet_id = "pet123"
    mock_reminders = [
        {"Name": "Vaccination Reminder", "Date": "2024-12-10"},
    ]
    # Mock Firestore
    mock_pet_doc = mocker.patch("api.petReminder.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = True
    mock_reminder_docs = [MagicMock(id=f"reminder{i}", to_dict=lambda: data) for i, data in enumerate(mock_reminders)]
    mock_pet_doc.return_value.collection.return_value.stream.return_value = mock_reminder_docs

    response = client.get(f'/pets/{pet_id}/reminders')

    # Assertions
    assert response.status_code == 200
    response_data = response.get_json()
    for i, reminder in enumerate(mock_reminders):
        assert response_data[i]["Name"] == reminder["Name"]
        assert response_data[i]["Date"] == reminder["Date"]


# Test 2: get reminder with error (no id) ------------------------------------------------------------
def test_get_reminders_by_petid_not_found(client, mocker):
    pet_id = "pet123"

    # Mock Firestore
    mock_pet_doc = mocker.patch("api.petReminder.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = False

    response = client.get(f'/pets/{pet_id}/reminders')

    # Assertions
    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]


# Test 3: get reminder with sucess ------------------------------------------------------------
def test_get_reminder_by_id_success(client, mocker):
    reminder_id = "reminder123"
    reminder_data = {"Name": "Vaccination Reminder", "Date": "2024-12-10"}

    # Mock Firestore
    mock_pet_docs = [MagicMock(id="pet123", to_dict=lambda: {"Name": "Buddy"})]
    mock_reminder_doc = MagicMock(id=reminder_id, to_dict=lambda: reminder_data)
    mock_pet_db = mocker.patch("api.petReminder.pet_db.stream")
    mock_pet_db.return_value = mock_pet_docs

    mock_pet_ref = mocker.patch("api.petReminder.pet_db.document")
    mock_pet_ref.return_value.collection.return_value.document.return_value.get.return_value = mock_reminder_doc
    mock_reminder_doc.exists = True

    response = client.get(f'/reminders/{reminder_id}')

    # Assertions
    assert response.status_code == 200
    response_data = response.get_json()
    assert response_data["Name"] == reminder_data["Name"]
    assert response_data["Date"] == reminder_data["Date"]
    assert response_data["PetName"] == "Buddy"


# Test 4: get reminder with error (no event id) ------------------------------------------------------------
def test_get_reminder_by_id_not_found(client, mocker):
    reminder_id = "reminder123"

    # Mock Firestore
    mock_pet_docs = [MagicMock(id="pet123")]
    mock_pet_db = mocker.patch("api.petReminder.pet_db.stream")
    mock_pet_db.return_value = mock_pet_docs

    mock_pet_ref = mocker.patch("api.petReminder.pet_db.document")
    mock_pet_ref.return_value.collection.return_value.document.return_value.get.return_value.exists = False

    response = client.get(f'/reminders/{reminder_id}')

    # Assertions
    assert response.status_code == 404
    assert "Reminder not found" in response.get_json()["error"]
    

# Test 5: create reminder with sucess ------------------------------------------------------------
def test_create_reminder_success(client, mocker):
    pet_id = "pet123"
    reminder_data = {"Name": "Vaccination Reminder", "DateTime": "2024-12-10T10:00:00", "Description": "Get the annual vaccines."}

    # Mock Firestore
    mock_pet_doc = mocker.patch("api.petReminder.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = True
    mock_pet_doc.return_value.collection.return_value.document.return_value.set.return_value = None

    response = client.post(f'/pets/{pet_id}/reminders', json=reminder_data)

    # Assertions
    assert response.status_code == 201
    assert f"Reminder for pet {pet_id} created successfully" in response.get_json()["message"]
    

# Test 6: create reminder with error (no pet) ------------------------------------------------------------
def test_create_reminder_pet_not_found(client, mocker):
    pet_id = "pet123"
    reminder_data = {"Name": "Vaccination Reminder", "DateTime": "2024-12-10T10:00:00", "Description": "Get the annual vaccines."}

    # Mock Firestore
    mock_pet_doc = mocker.patch("api.petReminder.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = False

    response = client.post(f'/pets/{pet_id}/reminders', json=reminder_data)

    # Assertions
    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]
    
    
# Test 7: delete reminder with sucess ------------------------------------------------------------
def test_delete_reminder_by_id_success(client, mocker):
    reminder_id = "reminder123"

    # Mock Firestore
    mock_pet_docs = [MagicMock(id="pet123")]
    mock_pet_db = mocker.patch("api.petReminder.pet_db.stream")
    mock_pet_db.return_value = mock_pet_docs

    mock_pet_ref = mocker.patch("api.petReminder.pet_db.document")
    mock_pet_ref.return_value.collection.return_value.document.return_value.get.return_value.exists = True
    mock_pet_ref.return_value.collection.return_value.document.return_value.delete.return_value = None

    response = client.delete(f'/pets/reminders/{reminder_id}')

    # Assertions
    assert response.status_code == 200
    assert f"Reminder {reminder_id} deleted successfully" in response.get_json()["message"]


# Test 8: delete reminder with error (no id) ------------------------------------------------------------
def test_delete_reminder_by_id_not_found(client, mocker):
    reminder_id = "reminder123"

    # Mock Firestore
    mock_pet_docs = [MagicMock(id="pet123")]
    mock_pet_db = mocker.patch("api.petReminder.pet_db.stream")
    mock_pet_db.return_value = mock_pet_docs

    mock_pet_ref = mocker.patch("api.petReminder.pet_db.document")
    mock_pet_ref.return_value.collection.return_value.document.return_value.get.return_value.exists = False

    response = client.delete(f'/pets/reminders/{reminder_id}')

    # Assertions
    assert response.status_code == 404
    assert "Reminder not found" in response.get_json()["error"]

