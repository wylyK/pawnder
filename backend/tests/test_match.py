
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

# Test 1: match with sucess ------------------------------------------------------------
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


# Test 4: accepting pending with sucess ------------------------------------------------------------
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


# Test 5: accept pending with error (no id) ------------------------------------------------------------
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


# Test 7: unmatch with error (no id) ------------------------------------------------------------
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
