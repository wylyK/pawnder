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
    mock_pet_doc = mocker.MagicMock(exists=True)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_ref.return_value.get.return_value = mock_pet_doc

    mock_event_docs = [
        mocker.MagicMock(
            to_dict=mocker.MagicMock(
                return_value={
                    "Name": "Vaccination",
                    "DateTime": "2024-11-25T10:00:00Z",
                    "Duration": 60,
                    "Location": "NY",
                    "CreatedBy": "vet123",
                    "CreatedAt": "2024-11-01T10:00:00Z",
                    "VetAssigned": "vet123",
                    "Type": "Vaccination",
                    "Status": "Scheduled",
                    "Description": "Rabies vaccination",
                    "FollowUp": "None",
                }
            )
        ),
        mocker.MagicMock(
            to_dict=mocker.MagicMock(
                return_value={
                    "Name": "Checkup",
                    "DateTime": "2024-12-01T14:00:00Z",
                    "Duration": 30,
                    "Location": "NY",
                    "CreatedBy": "vet123",
                    "CreatedAt": "2024-11-01T12:00:00Z",
                    "VetAssigned": "vet124",
                    "Type": "Routine",
                    "Status": "Scheduled",
                    "Description": "General checkup",
                    "FollowUp": "Revisit in a month",
                }
            )
        ),
    ]

    mock_pet_ref.return_value.collection.return_value.stream.return_value = mock_event_docs

    response = client.get("/pets/pet123/events")
    assert response.status_code == 200
    assert response.json == {
        "events": [
            {
                "Name": "Vaccination",
                "DateTime": "2024-11-25T10:00:00Z",
                "Duration": 60,
                "Location": "NY",
                "CreatedBy": "vet123",
                "CreatedAt": "2024-11-01T10:00:00Z",
                "VetAssigned": "vet123",
                "Type": "Vaccination",
                "Status": "Scheduled",
                "Description": "Rabies vaccination",
                "FollowUp": "None",
            },
            {
                "Name": "Checkup",
                "DateTime": "2024-12-01T14:00:00Z",
                "Duration": 30,
                "Location": "NY",
                "CreatedBy": "vet123",
                "CreatedAt": "2024-11-01T12:00:00Z",
                "VetAssigned": "vet124",
                "Type": "Routine",
                "Status": "Scheduled",
                "Description": "General checkup",
                "FollowUp": "Revisit in a month",
            },
        ]
    }


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


# Test 7: create pet with error (negative duration) ------------------------------------------------------------
def test_create_event_invalid_duration(client, mocker):
    pet_id = "pet123"
    event_data = {
        "Name": "Vaccination",
        "DateTime": "2024-11-25T10:00:00Z",
        "Duration": -60,  # Invalid negative duration
        "Location": "NY",
        "CreatedBy": "vet123",
        "VetAssigned": "vet123",
        "Type": "Vaccination"
    }

    # Mock Firestore
    mock_pet_doc = MagicMock(exists=True)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.document")
    mock_pet_ref.return_value.get.return_value = mock_pet_doc

    response = client.post(f'/pets/{pet_id}/events', json=event_data)

    # Assertions
    assert response.status_code == 500  # Assuming the API validates duration
    assert 'Duration must be more than 0' == response.get_json()["error"]


# Test 8: update event with success ------------------------------------------------------------
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
    

# Test 9: update event with error (no pet) ------------------------------------------------------------
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
    

# Test 10: update event with error (no event) ------------------------------------------------------------
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
    
    
# Test 11: delete event with sucess ------------------------------------------------------------
def test_delete_event_by_id_success(client, mocker):
    event_id = "event123"

    mock_pet_stream = [
        MagicMock(id="pet123", reference=mocker.MagicMock())
    ]
    mock_event_doc = MagicMock(exists=True)
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.stream")
    mock_pet_ref.return_value = mock_pet_stream
    mock_pet_stream[0].reference.collection.return_value.document.return_value.get.return_value = mock_event_doc

    response = client.delete(f'/pets/events/{event_id}')

    assert response.status_code == 200
    assert f"Event {event_id} deleted successfully" in response.get_json()["message"]

    


# Test 12: delete event with error (no pet) ------------------------------------------------------------
def test_delete_event_by_id_pet_not_found(client, mocker):
    event_id = "event123"

    mock_pet_stream = []
    mock_pet_ref = mocker.patch("api.petEvent.pet_db.stream")
    mock_pet_ref.return_value = mock_pet_stream

    response = client.delete(f'/pets/events/{event_id}')

    assert response.status_code == 404
    assert "Event not found" in response.get_json()["error"]



# Test 13: delete event with error (no event) ------------------------------------------------------------
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


