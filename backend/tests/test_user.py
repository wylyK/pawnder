from api.users import users_api
import pytest
from unittest.mock import patch, MagicMock 
from flask import Flask
import os
from firebase_admin import firestore

@pytest.fixture
def client():
    app = Flask(__name__)
    app.secret_key = "test_secret_key"  # Required for session handling in testing login
    app.register_blueprint(users_api)
    app.testing = True
    return app.test_client()

# Test 1: create user with sucess ------------------------------------------------------------
def test_create_user_success(client, mocker):
    user_data = {
        "FName": "John",
        "LName": "Doe",
        "Email": "john.doe@example.com",
        "Password": "securepassword123",
        "Location": "N/A", 
        "Role": "Owner"
    }
    # Mock Firebase Auth and Firestore
    mock_create_user = mocker.patch("firebase_admin.auth.create_user")
    mock_create_user.return_value = mocker.Mock(uid="12345")

    response = client.post('/users', json=user_data)
    assert response.status_code == 201
    assert "User 12345 created successfully" in response.get_json()["message"]


# Test 2: create user with error (invalid email) ------------------------------------------------------------
def test_create_user_firebase_error(client, mocker):
    user_data = {
        "FName": "John",
        "LName": "Doe",
        "Email": "invalid-email",
        "Password": "securepassword123",
        "Location": "N/A", 
        "Role": "Owner"
    }
    mock_create_user = mocker.patch("firebase_admin.auth.create_user")
    mock_create_user.side_effect = Exception("Invalid email")

    response = client.post('/users', json=user_data)
    assert response.status_code == 400
    assert "Invalid email" in response.get_json()["error"]
    

# Test 3: create user with error (email duplication) ------------------------------------------------------------
def test_create_user_email_duplication(client, mocker):
    user_data = {
        "FName": "John",
        "LName": "Doe",
        "Email": "john.doe@example.com",
        "Password": "securepassword123",
        "Location": "New York",
        "Role": "User",
        "PetId": [],
        "Avatar": ""
    }

    # Mock Firebase Auth to raise an email duplication error
    mock_create_user = mocker.patch("firebase_admin.auth.create_user")
    mock_create_user.side_effect = Exception("auth/email-already-exists")

    # Test the API
    response = client.post('/users', json=user_data)

    # Assertions
    assert response.status_code == 400
    assert "auth/email-already-exists" in response.get_json()["error"]

    # Ensure `create_user` was called
    mock_create_user.assert_called_once_with(email=user_data["Email"], password=user_data["Password"])
    

# Test 4: update user with sucess ------------------------------------------------------------
def test_update_user_success(client, mocker):
    user_id = "12345"
    update_data = {"FName": "Jane", "Location": "Boston"}

    # Mock Firestore
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_document = MagicMock()
    mock_user_ref.return_value = mock_document
    mock_document.get.return_value.exists = True  # Simulate user existence
    mock_document.update.return_value = None      # Simulate update success

    response = client.put(f'/users/{user_id}', json=update_data)

    # Assertions
    assert response.status_code == 200
    assert f"User {user_id} updated successfully" in response.get_json()["message"]
    mock_user_ref.assert_called_once_with(user_id)
    mock_document.update.assert_called_once_with(update_data)
    

# Test 5: update user with error ------------------------------------------------------------
def test_update_user_not_found(client, mocker):
    user_id = "12345"
    update_data = {"FName": "Jane", "Location": "Boston"}

    # Mock Firestore
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_document = MagicMock()
    mock_user_ref.return_value = mock_document
    mock_document.get.return_value.exists = False  # Simulate user does not exist

    response = client.put(f'/users/{user_id}', json=update_data)

    # Assertions
    assert response.status_code == 404
    assert "User not found" in response.get_json()["error"]
    mock_user_ref.assert_called_once_with(user_id)
    mock_document.update.assert_not_called()


# Test 6: delete user with sucess ------------------------------------------------------------
def test_delete_user_success(client, mocker):
    user_id = "12345"

    # Mock Firebase Auth
    mock_delete_auth = mocker.patch("firebase_admin.auth.delete_user")
    mock_delete_auth.return_value = None  # Simulate successful Firebase deletion

    # Mock Firestore
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_document = MagicMock()
    mock_user_ref.return_value = mock_document
    mock_document.get.return_value.exists = True  # Simulate user exists
    mock_document.delete.return_value = None  # Simulate successful Firestore deletion

    response = client.delete(f'/users/{user_id}')

    # Assertions
    assert response.status_code == 200
    assert f"User {user_id} deleted successfully" in response.get_json()["message"]
    mock_delete_auth.assert_called_once_with(user_id)
    mock_user_ref.assert_called_once_with(user_id)
    mock_document.delete.assert_called_once()


# Test 7: delete user with error ------------------------------------------------------------
def test_delete_user_not_found(client, mocker):
    user_id = "12345"

    # Mock Firebase Auth
    mock_delete_auth = mocker.patch("firebase_admin.auth.delete_user")
    mock_delete_auth.return_value = None  # Simulate successful Firebase deletion

    # Mock Firestore
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_document = MagicMock()
    mock_user_ref.return_value = mock_document
    mock_document.get.return_value.exists = False  # Simulate user does not exist

    response = client.delete(f'/users/{user_id}')

    # Assertions
    assert response.status_code == 404
    assert "User not found" in response.get_json()["error"]
    mock_delete_auth.assert_called_once_with(user_id)
    mock_user_ref.assert_called_once_with(user_id)
    mock_document.delete.assert_not_called()
    

# Test 8: Login with sucess ------------------------------------------------------------
def test_login_success(client, mocker):
    login_data = {
        "Username": "john.doe@example.com",
        "Password": "securepassword123"
    }

    # Mock Firebase API key
    mocker.patch.dict(os.environ, {"FIREBASE_API_KEY": "mock_api_key"})

    # Mock `requests.post` in the correct namespace
    mock_post = mocker.patch("api.users.requests.post")
    mock_post.return_value = MagicMock(
        status_code=200,
        json=lambda: {
            "idToken": "mock_id_token",
            "refreshToken": "mock_refresh_token",
            "expiresIn": "3600",
            "localId": "12345"
        }
    )

    # Mock session to simulate user existence
    with client.session_transaction() as session:
        session['user_id'] = "12345"
        session['email'] = "john.doe@example.com"

    response = client.post('/users/login', json=login_data)

    # Assertions
    assert response.status_code == 200
    response_data = response.get_json()
    assert response_data["message"] == "Login successful"
    assert response_data["idToken"] == "mock_id_token"
    assert response_data["refreshToken"] == "mock_refresh_token"


# Test 9: Login with error (no user) ------------------------------------------------------------
def test_login_no_user(client, mocker):
    login_data = {
        "Username": "nonexistent@example.com",
        "Password": "password123"
    }

    # Mock Firebase API key
    mocker.patch.dict(os.environ, {"FIREBASE_API_KEY": "mock_api_key"})

    # Mock `requests.post` to simulate no user in Firebase
    mock_post = mocker.patch("api.users.requests.post")
    mock_post.return_value = MagicMock(
        status_code=400,
        json=lambda: {"error": {"message": "EMAIL_NOT_FOUND"}}
    )

    response = client.post('/users/login', json=login_data)

    # Assertions
    assert response.status_code == 400
    assert "EMAIL_NOT_FOUND" in response.get_json()["error"]


# Test 10: Login with error (wrong password) ------------------------------------------------------------
def test_login_invalid_credentials(client, mocker):
    login_data = {
        "Username": "john.doe@example.com",
        "Password": "wrongpassword"
    }

    # Mock Firebase API key
    mocker.patch.dict(os.environ, {"FIREBASE_API_KEY": "mock_api_key"})

    # Mock `requests.post` to simulate invalid credentials
    mock_post = mocker.patch("api.users.requests.post")
    mock_post.return_value = MagicMock(
        status_code=400,
        json=lambda: {"error": {"message": "INVALID_PASSWORD"}}
    )

    response = client.post('/users/login', json=login_data)

    # Assertions
    assert response.status_code == 400
    assert "INVALID_PASSWORD" in response.get_json()["error"]
    

# Test 11: Logout with success ------------------------------------------------------------
def test_logout_success(client):
    # Simulate an active session
    with client.session_transaction() as session:
        session['user_id'] = "12345"
        session['email'] = "john.doe@example.com"

    response = client.post('/users/logout')

    # Assertions
    assert response.status_code == 200
    assert response.get_json()["message"] == "Logout successful."
    with client.session_transaction() as session:
        assert 'user_id' not in session
        assert 'email' not in session


# Test 12: connect vet with error (no vet) ------------------------------------------------------------
def test_connect_vet_not_found(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    # Mock Firestore for vet
    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_doc = MagicMock()
    mock_vet_ref.return_value = mock_vet_doc
    mock_vet_doc.get.return_value.exists = False  # Simulate vet does not exist

    response = client.put('/connect_vet/', json=data)

    # Assertions
    assert response.status_code == 404
    assert "Vet vet123 not found" in response.get_json()["error"]
    mock_vet_ref.assert_called_once_with("vet123")


# Test 13: connect vet error (wrong role) ------------------------------------------------------------
def test_connect_vet_not_a_vet(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    # Mock Firestore for vet
    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_doc = MagicMock()
    mock_vet_ref.return_value = mock_vet_doc
    mock_vet_doc.get.return_value.exists = True  # Simulate vet exists
    mock_vet_doc.get.return_value.to_dict.return_value = {"Role": "User"}  # Simulate non-Vet role

    response = client.put('/connect_vet/', json=data)

    # Assertions
    assert response.status_code == 403
    assert "Access denied: User is not a Vet" in response.get_json()["error"]
    mock_vet_ref.assert_called_once_with("vet123")


# Test 14: connect vet error (missing health doc) ------------------------------------------------------------
def test_connect_vet_create_health_success(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    # Mock Firestore for vet
    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_doc = MagicMock()
    mock_vet_ref.return_value = mock_vet_doc
    mock_vet_doc.get.return_value.exists = True  # Simulate vet exists
    mock_vet_doc.get.return_value.to_dict.return_value = {"Role": "Vet"}  # Simulate Vet role

    # Mock Firestore for pet
    mock_pet_ref = mocker.patch("api.users.pet_db.document")
    mock_pet_doc = MagicMock()
    mock_pet_ref.return_value = mock_pet_doc
    mock_pet_doc.collection.return_value.limit.return_value.get.return_value = []  # No health docs

    # Mock `create_health` to succeed
    mock_create_health = mocker.patch("api.users.create_health")
    mock_create_health.return_value = ({"message": "Health document created"}, 201)

    response = client.put('/connect_vet/', json=data)

    # Assertions
    assert response.status_code == 200
    assert "Vet vet123 successfully connected to Pet pet456" in response.get_json()["message"]
    mock_vet_ref.assert_called_once_with("vet123")
    mock_create_health.assert_called_once_with("pet456")


# Test 15: connect vet error (health doc creation error) ------------------------------------------------------------
def test_connect_vet_create_health_failure(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    # Mock Firestore for vet
    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_doc = MagicMock()
    mock_vet_ref.return_value = mock_vet_doc
    mock_vet_doc.get.return_value.exists = True  # Simulate vet exists
    mock_vet_doc.get.return_value.to_dict.return_value = {"Role": "Vet"}  # Simulate Vet role

    # Mock Firestore for pet
    mock_pet_ref = mocker.patch("api.users.pet_db.document")
    mock_pet_doc = MagicMock()
    mock_pet_ref.return_value = mock_pet_doc
    mock_pet_doc.collection.return_value.limit.return_value.get.return_value = []  # No health docs

    # Mock `create_health` to fail
    mock_create_health = mocker.patch("api.users.create_health")
    mock_create_health.return_value = ({"error": "Failed to create health document"}, 500)

    response = client.put('/connect_vet/', json=data)

    # Assertions
    assert response.status_code == 500
    assert "Failed to create health document" in response.get_json()["error"]
    mock_create_health.assert_called_once_with("pet456")


# Test 16: connect vet with success ------------------------------------------------------------
def test_connect_vet_success(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    # Mock Firestore for vet
    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_doc = MagicMock()
    mock_vet_ref.return_value = mock_vet_doc
    mock_vet_doc.get.return_value.exists = True  # Simulate vet exists
    mock_vet_doc.get.return_value.to_dict.return_value = {"Role": "Vet"}  # Simulate Vet role

    # Mock Firestore for pet
    mock_pet_ref = mocker.patch("api.users.pet_db.document")
    mock_pet_doc = MagicMock()
    mock_pet_ref.return_value = mock_pet_doc
    mock_health_doc = MagicMock()
    mock_pet_doc.collection.return_value.limit.return_value.get.return_value = [mock_health_doc]  # Health doc exists

    # Mock Firestore updates
    mock_health_doc.reference.update.return_value = None
    mock_vet_ref.return_value.update.return_value = None

    response = client.put('/connect_vet/', json=data)

    # Assertions
    assert response.status_code == 200
    assert "Vet vet123 successfully connected to Pet pet456" in response.get_json()["message"]
    mock_health_doc.reference.update.assert_called_once_with({
        "VetId": firestore.ArrayUnion(["vet123"])
    })
    mock_vet_ref.return_value.update.assert_called_once_with({
        "PetId": firestore.ArrayUnion(["pet456"])
    })
