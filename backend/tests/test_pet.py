from api.pets import pets_api
import pytest
from unittest.mock import MagicMock 
from flask import Flask

# @pytest.fixture
# def client():
#     app = Flask(__name__)
#     app.register_blueprint(pets_api)
#     app.testing = True
#     return app.test_client()

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(pets_api)
    app.config.update({"TESTING": True})
    return app

@pytest.fixture
def client(app):
    return app.test_client()


# Test 1: create pet with sucess ------------------------------------------------------------
def test_create_pet_success(client, mocker):
    data = {
        "Name": "Buddy",
        "Age": 3,
        "Breed": "Golden Retriever",
        "Type": "Dog",
        "Avatar": "avatar_url",
        "Description": "Friendly dog",
        "Tag": ["friendly", "golden"],
        "UserId": "user123"
    }

    # Mock Firestore
    mock_pet_ref = mocker.patch("api.pets.db.collection")
    mock_document = MagicMock()
    mock_pet_ref.return_value.document.return_value = mock_document
    mock_document.set.return_value = None  # Simulate successful Firestore write

    response = client.post('/pets/create', json=data)

    # Assertions
    assert response.status_code == 201
    assert "Pet" in response.get_json()["message"]
    mock_pet_ref.assert_called_once_with("PET")
    mock_document.set.assert_called_once()


# Test 2: create pet with error (missing fields) ------------------------------------------------------------
def test_create_pet_missing_fields(client):
    data = {
        "Age": 3,
        "Breed": "Golden Retriever",
        "Type": "Dog"
        # Missing required fields like 'Name' and 'UserId'
    }

    response = client.post('/pets/create', json=data)

    # Assertions
    assert response.status_code == 500
    assert "error" in response.get_json()


# Test 3: create pet with exception ------------------------------------------------------------
def test_create_pet_exception(client, mocker):
    data = {
        "Name": "Buddy",
        "Age": 3,
        "Breed": "Golden Retriever",
        "Type": "Dog",
        "Avatar": "avatar_url",
        "Description": "Friendly dog",
        "Tag": ["friendly", "golden"],
        "UserId": "user123"
    }

    mock_pet_ref = mocker.patch("api.pets.db.collection")
    mock_pet_ref.side_effect = Exception("Unexpected error")  # Throw Exception

    response = client.post('/pets/create', json=data)

    assert response.status_code == 500
    assert "Unexpected error" in response.get_json()["error"]


# Test 4: update pet with sucess ------------------------------------------------------------
def test_update_pet_success(client, mocker):
    pet_id = "pet123"
    data = {"Name": "Buddy Updated", "Age": 4}

    mock_pet_ref = mocker.patch("api.pets.db.collection")
    mock_document = MagicMock()
    mock_pet_ref.return_value.document.return_value = mock_document
    mock_document.get.return_value.exists = True  # Simulate pet exists
    mock_document.get.return_value.to_dict.return_value = {
        "Name": "Buddy",
        "Age": 3,
        "Breed": "Golden Retriever",
        "Type": "Dog",
        "Avatar": "avatar_url",
        "UserId": "user123"
    }

    response = client.put(f'/pets/{pet_id}', json=data)

    assert response.status_code == 200
    # assert f"Pet {pet_id} updated successfully" in response.get_json()["message"]
    mock_pet_ref.assert_called_once_with("PET")
    mock_document.set.assert_called_once()


# Test 5: update pet with error (no pet) ------------------------------------------------------------
def test_update_pet_not_found(client, mocker):
    pet_id = "pet123"
    data = {"Name": "Buddy Updated", "Age": 4}

    mock_pet_ref = mocker.patch("api.pets.db.collection")
    mock_document = MagicMock()
    mock_pet_ref.return_value.document.return_value = mock_document
    mock_document.get.return_value.exists = False  # Simulate pet does not exist

    response = client.put(f'/pets/{pet_id}', json=data)

    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]
    mock_pet_ref.assert_called_once_with("PET")
    mock_document.set.assert_not_called()
    
    
# Test 6: delete pet with sucess ------------------------------------------------------------
def test_delete_pet_success(client, mocker):
    pet_id = "pet123"

    mock_pet_ref = mocker.patch("api.pets.db.collection")
    mock_document = MagicMock()
    mock_pet_ref.return_value.document.return_value = mock_document
    mock_document.get.return_value.exists = True   # Simulate pet exists
    mock_document.delete.return_value = None   # Simulate successful deletion

    response = client.delete(f'/pets/{pet_id}')

    assert response.status_code == 200
    assert f"Pet {pet_id} deleted successfully" in response.get_json()["message"]

    # Ensure Firestore was called correctly
    mock_pet_ref.assert_called_once_with("PET")
    mock_document.delete.assert_called_once()


# Test 7: delete pet with error (no pet) ------------------------------------------------------------
def test_delete_pet_not_found(client, mocker):
    pet_id = "pet123"

    mock_pet_ref = mocker.patch("api.pets.db.collection")
    mock_document = MagicMock()
    mock_pet_ref.return_value.document.return_value = mock_document
    mock_document.get.return_value.exists = False  

    response = client.delete(f'/pets/{pet_id}')

    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]

    mock_pet_ref.assert_called_once_with("PET")
    mock_document.delete.assert_not_called()


# Test 8: get pet by type with sucess ------------------------------------------------------------
def test_get_pets_by_type_success(client, mocker):
    pet_type = "Dog"
    expected_pet_ids = ["pet1", "pet2", "pet3"]

    mock_pet_ref = mocker.patch("api.pets.db.collection")
    mock_pet_docs = [MagicMock(id=pet_id) for pet_id in expected_pet_ids]
    mock_pet_ref.return_value.where.return_value.stream.return_value = mock_pet_docs

    response = client.get(f'/pets/type?type={pet_type}')

    assert response.status_code == 200
    assert response.get_json() == expected_pet_ids
    mock_pet_ref.assert_called_once_with("PET")


# Test 9: get pet by location with sucess ------------------------------------------------------------
def test_get_pets_by_location_success(client, mocker):
    location = "NY"
    user_ids = ["user1", "user2"]
    pet_ids = ["pet1", "pet2"]

    mock_user_ref = mocker.patch("api.users.db.collection")
    mock_user_collection = MagicMock()
    mock_pet_collection = MagicMock()

    mock_user_ref.side_effect = lambda collection_name: {
        "USER": mock_user_collection,
        "PET": mock_pet_collection
    }[collection_name]

    mock_user_docs = [MagicMock(id=user_id) for user_id in user_ids]
    mock_user_collection.where.return_value.where.return_value.stream.return_value = mock_user_docs

    mock_pet_docs = [MagicMock(id=pet_id) for pet_id in pet_ids]
    mock_pet_collection.where.return_value.stream.return_value = mock_pet_docs

    response = client.get(f'/pets/location?location={location}')

    assert response.status_code == 200
    assert response.get_json() == pet_ids

    # Check if calls to USER and PET collections are correct
    mock_user_ref.assert_any_call("USER")
    mock_user_ref.assert_any_call("PET")
    mock_user_collection.where.assert_called_with("Role", "==", "Owner")
    mock_user_collection.where.return_value.where.assert_called_with("Location", "==", location)
    mock_pet_collection.where.assert_called_with("UserId", "in", user_ids)


# Test 10: get pet by location with sucess 2------------------------------------------------------------
def test_get_pets_by_location_no_owners(client, mocker):
    location = "NY"

    mock_user_ref = mocker.patch("api.users.db.collection")
    mock_user_ref.return_value.where.return_value.where.return_value.stream.return_value = []

    response = client.get(f'/pets/location?location={location}')

    assert response.status_code == 200
    assert response.get_json() == []


# Test 11: get all pet with success ------------------------------------------------------------
def test_get_all_pets_success(client, mocker):
    expected_pets = {
        "pet1": {"Name": "Buddy", "MatchRecords": [], "HealthRecords": [], "EventRecords": []},
        "pet2": {"Name": "Max", "MatchRecords": [], "HealthRecords": [], "EventRecords": []}
    }

    mock_pet_ref = mocker.patch("api.pets.db.collection")
    mock_pet_docs = []
    for pet_id, pet_data in expected_pets.items():
        mock_doc = MagicMock()
        mock_doc.id = pet_id
        mock_doc.to_dict.return_value = {"Name": pet_data["Name"]}
        mock_pet_docs.append(mock_doc)
    mock_pet_ref.return_value.stream.return_value = mock_pet_docs

    # Mock Firestore sub-collections (MATCH, HEALTH, EVENT)
    for pet_doc in mock_pet_docs:
        pet_doc.reference.collection.return_value.stream.return_value = []

    response = client.get('/pets')

    assert response.status_code == 200
    assert response.get_json() == expected_pets
    mock_pet_ref.assert_called_once_with("PET")


# Test 12: get pet by id with success ------------------------------------------------------------
def test_get_pet_by_id_success(client, mocker):
    pet_id = "pet1"
    expected_pet_data = {
        "Name": "Buddy",
        "MatchRecords": [],
        "HealthRecords": [],
        "EventRecords": []
    }

    mock_pet_ref = mocker.patch("api.pets.db.collection")
    mock_pet_doc = MagicMock(
        exists=True,
        to_dict=lambda: {"Name": "Buddy"}
    )
    mock_pet_ref.return_value.document.return_value.get.return_value = mock_pet_doc

    mock_pet_doc.reference.collection.return_value.stream.return_value = []

    response = client.get(f'/pets/{pet_id}')

    assert response.status_code == 200
    assert response.get_json() == {pet_id: expected_pet_data}
    mock_pet_ref.assert_called_once_with("PET")


# Test 13: get pet by id with error (no id) ------------------------------------------------------------
def test_get_pet_by_id_not_found(client, mocker):
    pet_id = "pet1"

    mock_pet_ref = mocker.patch("api.pets.db.collection")
    mock_pet_doc = MagicMock(exists=False)
    mock_pet_ref.return_value.document.return_value.get.return_value = mock_pet_doc

    response = client.get(f'/pets/{pet_id}')

    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]
    mock_pet_ref.assert_called_once_with("PET")
