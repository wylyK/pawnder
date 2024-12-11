from api.petEvent import pet_event_api
import pytest
from unittest.mock import MagicMock 
from flask import Flask

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(pet_event_api)
    app.testing = True
    return app.test_client()

# Test 1: get event by petid with sucess ------------------------------------------------------------
def test_get_events_by_petid_success(client, mocker):
    pet_id = "pet123"
    mock_events = [
        {
            "Name": "Vaccination",
            "DateTime": "2024-12-10T10:00:00",
            "Description": "Annual vaccination appointment",
            "Location": "Vet Clinic"
        },
        {
            "Name": "Grooming",
            "DateTime": "2024-12-15T15:00:00",
            "Description": "Scheduled grooming session",
            "Location": "Pet Spa"
        }
    ]

    # Mock Firestore
    mock_pet_doc = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = True
    mock_event_docs = [
        MagicMock(id=f"event{i}", to_dict=lambda data=event: data)
        for i, event in enumerate(mock_events)
    ]
    mock_pet_doc.return_value.collection.return_value.stream.return_value = mock_event_docs

    # Make the request
    response = client.get(f'/pets/{pet_id}/events')

    # Assertions
    assert response.status_code == 200
    response_data = response.get_json()

    # Check the response matches the mock data
    for i, event in enumerate(mock_events):
        assert response_data[i]["Name"] == event["Name"]
        assert response_data[i]["DateTime"] == event["DateTime"]
        assert response_data[i]["Description"] == event["Description"]
        assert response_data[i]["Location"] == event["Location"]


# Test 2: get event by petid with error (no petid) ------------------------------------------------------------
def test_get_events_by_petid_pet_not_found(client, mocker):
    pet_id = "pet123"

    mock_pet_doc = MagicMock(exists=False)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_ref.return_value.get.return_value = mock_pet_doc

    response = client.get(f'/pets/{pet_id}/events')

    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]


# Test 3: get event by status with success ------------------------------------------------------------
def test_get_events_by_status_success(client, mocker):
    pet_id = "pet123"
    status = "Scheduled"
    mock_event_docs = [
        MagicMock(to_dict=lambda: {
            "Name": "Vaccination",
            "DateTime": "2024-11-25T10:00:00Z",
            "Duration": 60,
            "Location": "NY",
            "CreatedBy": "vet123",
            "CreatedAt": "2024-11-20T09:00:00Z",
            "VetAssigned": "vet123",
            "Type": "Vaccination",
            "Status": "Scheduled",
            "Description": "Rabies vaccination",
            "FollowUp": "None"
        })
    ]

    mock_pet_doc = MagicMock(exists=True)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_ref.return_value.get.return_value = mock_pet_doc
    mock_pet_ref.return_value.collection.return_value.where.return_value.stream.return_value = mock_event_docs

    response = client.get(f'/pets/{pet_id}/events/status?status={status}')

    assert response.status_code == 200
    assert response.get_json() == [
        {
            "Name": "Vaccination",
            "DateTime": "2024-11-25T10:00:00Z",
            "Duration": 60,
            "Location": "NY",
            "CreatedBy": "vet123",
            "CreatedAt": "2024-11-20T09:00:00Z",
            "VetAssigned": "vet123",
            "Type": "Vaccination",
            "Status": "Scheduled",
            "Description": "Rabies vaccination",
            "FollowUp": "None"
        }
    ]


# Test 4: get event by status with error (no petid) ------------------------------------------------------------
def test_get_events_by_status_pet_not_found(client, mocker):
    pet_id = "pet123"
    status = "Scheduled"

    mock_pet_doc = MagicMock(exists=False)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_ref.return_value.get.return_value = mock_pet_doc

    response = client.get(f'/pets/{pet_id}/events/status?status={status}')

    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]


# Test 5: create event with sucess ------------------------------------------------------------
def test_create_event_success(client, mocker):
    pet_id = "pet123"
    event_data = {
        "Name": "Vaccination",
        "DateTime": "2024-11-25T10:00:00Z",
        "Duration": 60,
        "Location": "NY",
        "CreatedBy": "vet123",
        "VetAssigned": "vet123",
        "Type": "Vaccination",
        "Description": "Rabies vaccination"
    }

    mock_pet_doc = MagicMock(exists=True)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_ref.return_value.get.return_value = mock_pet_doc
    mock_event_ref = MagicMock()
    mock_pet_ref.return_value.collection.return_value.document.return_value = mock_event_ref

    response = client.post(f'/pets/{pet_id}/events', json=event_data)

    assert response.status_code == 201
    assert f"Event for pet {pet_id} created successfully" in response.get_json()["message"]
    

# Test 6: create event with error (no pet) ------------------------------------------------------------
def test_create_event_pet_not_found(client, mocker):
    pet_id = "pet123"
    event_data = {
        "Name": "Vaccination",
        "DateTime": "2024-11-25T10:00:00Z",
        "Duration": 60,
        "Location": "NY",
        "CreatedBy": "vet123",
        "VetAssigned": "vet123",
        "Type": "Vaccination"
    }

    mock_pet_doc = MagicMock(exists=False)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_ref.return_value.get.return_value = mock_pet_doc

    response = client.post(f'/pets/{pet_id}/events', json=event_data)

    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]


# Test 7: update event with success ------------------------------------------------------------
def test_update_event_by_id_success(client, mocker):
    pet_id = "pet123"
    event_id = "event456"
    update_data = {"Status": "Completed"}

    mock_pet_doc = MagicMock(exists=True)
    mock_event_doc = MagicMock(exists=True)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_ref.return_value.get.return_value = mock_pet_doc
    mock_pet_ref.return_value.collection.return_value.document.return_value.get.return_value = mock_event_doc

    response = client.put(f'/pets/{pet_id}/events/{event_id}', json=update_data)

    assert response.status_code == 200
    assert f"Event {event_id} updated successfully" in response.get_json()["message"]
    

# Test 8: update event with error (no pet) ------------------------------------------------------------
def test_update_event_by_id_pet_not_found(client, mocker):
    pet_id = "pet123"
    event_id = "event456"
    update_data = {"Status": "Completed"}

    mock_pet_doc = MagicMock(exists=False)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_ref.return_value.get.return_value = mock_pet_doc

    response = client.put(f'/pets/{pet_id}/events/{event_id}', json=update_data)

    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]
    

# Test 9: update event with error (no event) ------------------------------------------------------------
def test_update_event_by_id_event_not_found(client, mocker):
    pet_id = "pet123"
    event_id = "event456"
    update_data = {"Status": "Completed"}

    mock_pet_doc = MagicMock(exists=True)
    mock_event_doc = MagicMock(exists=False)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_ref.return_value.get.return_value = mock_pet_doc
    mock_pet_ref.return_value.collection.return_value.document.return_value.get.return_value = mock_event_doc

    response = client.put(f'/pets/{pet_id}/events/{event_id}', json=update_data)

    assert response.status_code == 404
    assert "Event not found" in response.get_json()["error"]
    
    
# Test 10: delete event with sucess ------------------------------------------------------------
def test_delete_event_by_id_success(client, mocker):
    event_id = "event123"

    # Mock Firestore
    mock_pet_docs = [
        MagicMock(id="pet123"),
        MagicMock(id="pet456"),
    ]
    mock_pet_db = mocker.patch("api.petEvent.pet_db.stream")
    mock_pet_db.return_value = mock_pet_docs

    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_event_doc = MagicMock()
    mock_event_doc.exists = True
    mock_pet_ref.return_value.collection.return_value.document.return_value.get.return_value = mock_event_doc
    mock_pet_ref.return_value.collection.return_value.document.return_value.delete.return_value = None

    # Make the request
    response = client.delete(f'/pets/events/{event_id}')

    # Assertions
    assert response.status_code == 200
    assert f"Event {event_id} deleted successfully" in response.get_json()["message"]
    


# Test 11: delete event with error (no pet) ------------------------------------------------------------
def test_delete_event_by_id_pet_not_found(client, mocker):
    event_id = "event123"

    mock_pet_stream = []
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.stream")
    mock_pet_ref.return_value = mock_pet_stream

    response = client.delete(f'/pets/events/{event_id}')

    assert response.status_code == 404
    assert "Event not found" in response.get_json()["error"]



# Test 12: delete event with error (no event) ------------------------------------------------------------
def test_delete_event_by_id_event_not_found(client, mocker):
    event_id = "event123"

    mock_pet_stream = [
        MagicMock(id="pet123", reference=mocker.MagicMock())
    ]
    mock_event_doc = MagicMock(exists=False)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.stream")
    mock_pet_ref.return_value = mock_pet_stream
    mock_pet_stream[0].reference.collection.return_value.document.return_value.get.return_value = mock_event_doc

    response = client.delete(f'/pets/events/{event_id}')

    assert response.status_code == 404
    assert "Event not found" in response.get_json()["error"]


# Test 13: get all event by type ------------------------------------------------------------
def test_get_events_by_type_success(client, mocker):
    pet_id = "pet123"
    event_type = "vaccination"

    # Mock Firestore pet document
    mock_pet_doc_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_doc = MagicMock()
    mock_pet_doc.exists = True
    mock_pet_doc_ref.return_value.get.return_value = mock_pet_doc

    # Mock event documents in the EVENT subcollection
    mock_event_doc = MagicMock()
    mock_event_doc.to_dict.return_value = {
        "Id": "event123",
        "Type": event_type,
        "Name": "Annual Checkup",
        "Date": "2024-01-01"
    }
    mock_event_collection = mock_pet_doc_ref.return_value.collection.return_value
    mock_event_collection.where.return_value.stream.return_value = [mock_event_doc]

    # Perform the GET request
    response = client.get(f"/pets/{pet_id}/events/type?type={event_type}")

    # Assertions
    assert response.status_code == 500
    mock_pet_doc_ref.assert_called_once_with(pet_id)
    mock_event_collection.where.assert_called_once_with("Type", "==", event_type)