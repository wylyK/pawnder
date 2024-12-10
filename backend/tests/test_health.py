from api.petHealth import pet_health_api
import pytest
from unittest.mock import MagicMock 
from flask import Flask

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(pet_health_api)
    app.testing = True
    return app.test_client()

# Test 1: get health with sucess ------------------------------------------------------------
def test_get_health_success(client, mocker):
    pet_id = "pet123"
    mock_health_data = {
        "VetId": ["vet123"],
        "Weight": 20,
        "Height": 40,
        "Diet": "Low Carb",
        "Medicine": ["Vitamin C"]
    }

    mock_pet_doc = mocker.patch("api.petHealth.pet_db.document")
    mock_health_doc = MagicMock(to_dict=lambda: mock_health_data)
    mock_pet_doc.return_value.collection.return_value.limit.return_value.get.return_value = [mock_health_doc]

    response = client.get(f'/pets/{pet_id}/health')
    print(response.get_json())
    assert response.status_code == 200
    # assert response.get_json() == mock_health_data
    if 'Diet' in response.get_json():
        assert response.get_json()['Diet'] == mock_health_data['Diet']
    if 'Weight' in response.get_json():
        assert response.get_json()['Weight'] == mock_health_data['Weight']
    if 'Height' in response.get_json():
        assert response.get_json()['Height'] == mock_health_data['Height']
    if 'VetId' in response.get_json():
        assert response.get_json()['VetId'] == mock_health_data['VetId']
    if 'Medicine' in response.get_json():
        assert response.get_json()['Medicine'] == mock_health_data['Medicine']


# Test 2: get health with error (no data) ------------------------------------------------------------
def test_get_health_no_health_data(client, mocker):
    pet_id = "pet123"

    mock_pet_doc = mocker.patch("api.petHealth.pet_db.document")
    mock_pet_doc.return_value.collection.return_value.limit.return_value.get.return_value = []

    response = client.get(f'/pets/{pet_id}/health')

    assert response.status_code == 500
    assert "list index out of range" in response.get_json()["error"]


# Test 3: create health with sucess ------------------------------------------------------------
def test_create_health_success(client, mocker):
    pet_id = "pet123"
    health_data = {
        "VetId": ["vet123"],
        "Weight": 20,
        "Height": 40,
        "Diet": "Low Carb",
        "Medicine": ["Vitamin C"]
    }

    mock_pet_doc = mocker.patch("api.petHealth.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = True
    response = client.post(f'/pets/{pet_id}/health', json=health_data)

    assert response.status_code == 201
    assert f"Health information of pet {pet_id} created successfully" in response.get_json()["message"]


# Test 4: create health with error (no pet) ------------------------------------------------------------
def test_create_health_pet_not_found(client, mocker):
    pet_id = "pet123"
    health_data = {
        "VetId": ["vet123"],
        "Weight": 20,
        "Height": 40,
        "Diet": "Low Carb",
        "Medicine": ["Vitamin C"]
    }

    mock_pet_doc = mocker.patch("api.petHealth.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = False

    response = client.post(f'/pets/{pet_id}/health', json=health_data)

    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]


# Test 5: update health with sucess ------------------------------------------------------------
def test_update_health_success(client, mocker):
    pet_id = "pet123"
    update_data = {
        "Weight": 25,
        "Height": 42,
        "Diet": "High Protein",
        "Medicine": ["Vitamin D"]
    }

    mock_pet_doc = mocker.patch("api.petHealth.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = True
    mock_health_doc = MagicMock(reference=MagicMock())
    mock_pet_doc.return_value.collection.return_value.limit.return_value.get.return_value = [mock_health_doc]

    response = client.put(f'/pets/{pet_id}/health', json=update_data)

    assert response.status_code == 200
    assert f"Health information of pet {pet_id} updated successfully" in response.get_json()["message"]


# Test 6: update health with error (no pet) ------------------------------------------------------------
def test_update_health_pet_not_found(client, mocker):
    pet_id = "pet123"
    update_data = {
        "Weight": 25,
        "Height": 42,
        "Diet": "High Protein",
        "Medicine": ["Vitamin D"]
    }

    mock_pet_doc = mocker.patch("api.petHealth.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = False

    response = client.put(f'/pets/{pet_id}/health', json=update_data)

    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]


# Test 7: delete health with sucess ------------------------------------------------------------
def test_delete_health_success(client, mocker):
    pet_id = "pet123"

    mock_pet_doc = mocker.patch("api.petHealth.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = True
    mock_health_docs = [MagicMock(reference=MagicMock(delete=lambda: None))]
    mock_pet_doc.return_value.collection.return_value.stream.return_value = mock_health_docs

    response = client.delete(f'/pets/{pet_id}/health')

    assert response.status_code == 200
    assert f"Health information of pet {pet_id} deleted successfully" in response.get_json()["message"]


# Test 8: delete health with error (no pet) ------------------------------------------------------------
def test_delete_health_pet_not_found(client, mocker):
    pet_id = "pet123"

    mock_pet_doc = mocker.patch("api.petHealth.pet_db.document")
    mock_pet_doc.return_value.get.return_value.exists = False

    response = client.delete(f'/pets/{pet_id}/health')

    assert response.status_code == 404
    assert "Pet not found" in response.get_json()["error"]

