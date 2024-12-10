
from api.petMatch import pet_match_api
import pytest
from unittest.mock import MagicMock 
from flask import Flask

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(pet_match_api)
    app.testing = True
    return app.test_client()

# Test 1: match with success ------------------------------------------------------------
def test_match_success(client, mocker):
    pet_id = "pet123"
    other_pet_id = "pet456"
    match_data = {"PetId": other_pet_id}

    # Mock Firestore
    mock_pet_doc = mocker.patch("api.petMatch.pet_db.document")
    mock_pet_doc.return_value.collection.return_value.add.return_value = None

    response = client.post(f'/pets/{pet_id}/matches', json=match_data)

    # Assertions
    assert response.status_code == 201
    assert f"Match successfully with pet of PetID {other_pet_id}" in response.get_json()["message"]
 

# Test 2: match with error (missing id) ------------------------------------------------------------
def test_match_missing_pet_id(client, mocker):
    pet_id = "pet123"
    match_data = {"PetId": "pet456"}

    # Mock Firestore to throw an exception
    mock_pet_doc = mocker.patch("api.petMatch.pet_db.document")
    mock_pet_doc.return_value.collection.return_value.add.side_effect = Exception("Pet not found")

    response = client.post(f'/pets/{pet_id}/matches', json=match_data)

    # Assertions
    assert response.status_code == 500
    assert "Pet not found" in response.get_json()["error"]


# Test 3: get all matched with sucess ------------------------------------------------------------
def test_get_all_matched_success(client, mocker):
    pet_id = "pet123"
    status = "matched"
    mock_match_docs = [
        MagicMock(to_dict=lambda: {"PetId": "pet456", "Status": "matched"}),
        MagicMock(to_dict=lambda: {"PetId": "pet789", "Status": "matched"})
    ]

    # Mock Firestore
    mock_pet_doc = mocker.patch("api.petMatch.pet_db.document")
    mock_pet_doc.return_value.collection.return_value.where.return_value.get.return_value = mock_match_docs

    response = client.get(f'/pets/{pet_id}/matches?status={status}')

    # Assertions
    assert response.status_code == 200
    assert response.get_json() == ["pet456", "pet789"]

# Test 4: get all pending matches with success ------------------------------------------------------------
def test_get_all_pending_success(client, mocker):
    pet_id = "pet123"
    status = "pending"
    mock_pending_docs = [
        MagicMock(to_dict=lambda: {"PetId": "pet456", "Status": "pending"}),
        MagicMock(to_dict=lambda: {"PetId": "pet789", "Status": "pending"})
    ]

    mock_pet_doc = mocker.patch("api.petMatch.pet_db.document")
    mock_pet_doc.return_value.collection.return_value.where.return_value.get.return_value = mock_pending_docs

    response = client.get(f'/pets/{pet_id}/matches?status={status}')

    assert response.status_code == 200
    assert response.get_json() == ["pet456", "pet789"]


# Test 5: accepting pending with sucess ------------------------------------------------------------
def test_accept_pending_match_success(client, mocker):
    pet_id = "pet123"
    other_pet_id = "pet456"
    match_data = {"PetId": other_pet_id}

    # Mock Firestore
    mock_pet_doc = mocker.patch("api.petMatch.pet_db.document")
    mock_match_doc = MagicMock(reference=MagicMock())
    mock_pet_doc.return_value.collection.return_value.where.return_value.get.return_value = [mock_match_doc]
    mock_match_doc.reference.update.return_value = None

    response = client.put(f'/pets/{pet_id}/matches?action=accept', json=match_data)

    # Assertions
    assert response.status_code == 200
    assert f"Match status updated to 'matched' with petID {other_pet_id}" in response.get_json()["message"]


# Test 6: accept pending with error (no id) ------------------------------------------------------------
def test_accept_pending_match_missing_other_pet_id(client, mocker):
    pet_id = "pet123"
    match_data = {"PetId": "pet456"}

    # Mock Firestore to throw an exception
    mock_pet_doc = mocker.patch("api.petMatch.pet_db.document")
    mock_pet_doc.return_value.collection.return_value.where.return_value.get.side_effect = IndexError("No pending match found")

    response = client.put(f'/pets/{pet_id}/matches?action=accept', json=match_data)

    # Assertions
    assert response.status_code == 500
    assert "No pending match found" in response.get_json()["error"]


# Test 7: unmatch success ------------------------------------------------------------
def test_unmatch_pet_success(client, mocker):
    pet_id = "pet123"
    other_pet_id = "pet456"
    action = "unmatch"

    mock_pet_db = mocker.patch("api.petMatch.pet_db.document")

    mock_other_pet_match_doc = MagicMock()
    mock_other_pet_match_doc.reference.get.return_value.to_dict.return_value = {
        "PetId": pet_id,
        "Status": "matched"
    }
    mock_other_pet_match_doc.reference.delete.return_value = None

    mock_other_match_collection = MagicMock()
    mock_other_match_collection.where.return_value.get.return_value = [mock_other_pet_match_doc]

    mock_my_pet_match_doc = MagicMock()
    mock_my_pet_match_doc.reference.get.return_value.to_dict.return_value = {
        "PetId": other_pet_id,
        "Status": "matched"
    }
    mock_my_pet_match_doc.reference.delete.return_value = None

    mock_my_match_collection = MagicMock()
    mock_my_match_collection.where.return_value.get.return_value = [mock_my_pet_match_doc]

    def mock_collection(pet_id):
        if pet_id == "pet123":
            return mock_my_match_collection
        elif pet_id == "pet456":
            return mock_other_match_collection

    mock_pet_db.side_effect = lambda pet_id: MagicMock(
        collection=lambda collection_name: mock_collection(pet_id)
    )

    response = client.delete(
        f'/pets/{pet_id}/matches?action={action}',
        json={"PetId": other_pet_id}
    )

    # Assertions
    assert response.status_code == 200
    assert response.get_json() == {"message": f"Unmatch successfully with pet of petId {other_pet_id}"}
    mock_pet_db.assert_any_call(pet_id)
    mock_pet_db.assert_any_call(other_pet_id)
    mock_other_pet_match_doc.reference.delete.assert_called_once()
    mock_my_pet_match_doc.reference.delete.assert_called_once()


# Test 8: unmatch with error (no id) ------------------------------------------------------------
def test_unmatch_pet_not_found(client, mocker):
    pet_id = "pet123"
    match_data = {"PetId": "pet456"}

    # Mock Firestore to throw an exception
    mock_pet_doc = mocker.patch("api.petMatch.pet_db.document")
    mock_pet_doc.return_value.collection.return_value.where.return_value.get.side_effect = IndexError("No match found")

    response = client.delete(f'/pets/{pet_id}/matches?action=unmatch', json=match_data)

    # Assertions
    assert response.status_code == 500
    assert "No match found" in response.get_json()["error"]


# Test 9: get all not match success ------------------------------------------------------------
def test_get_all_not_match_success(client, mocker):
    # Mock Firestore pet document reference and collection
    mock_pet_doc_ref = mocker.patch("api.petMatch.pet_db.document")
    mock_match_collection = MagicMock()
    mock_pet_doc_ref.return_value.collection.return_value = mock_match_collection

    # Mock match collection stream (already matched pets)
    mock_match_collection.stream.return_value = [
        MagicMock(to_dict=lambda: {"PetId": "pet456"}),
        MagicMock(to_dict=lambda: {"PetId": "pet789"}),
    ]

    # Mock pet_db.stream() to return all pet IDs
    mock_pet_db = mocker.patch("api.petMatch.pet_db.stream")
    mock_pet_db.return_value = [
        MagicMock(id="pet123"),
        MagicMock(id="pet456"),
        MagicMock(id="pet789"),
        MagicMock(id="pet999"),
    ]

    # Perform the GET request
    response = client.get('/pets/pet123/not_match')

    # Assertions
    assert response.status_code == 200
    assert response.get_json() == {
        "unmatched_pet_ids": ["pet999"]
    }