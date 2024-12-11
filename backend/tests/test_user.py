from api.users import users_api
import pytest
from unittest.mock import MagicMock 
from flask import Flask
import os
from firebase_admin import firestore
from io import BytesIO

@pytest.fixture
def client():
    app = Flask(__name__)
    app.secret_key = "test_secret_key"  # Required for session handling in testing login
    app.register_blueprint(users_api)
    app.testing = True
    return app.test_client()

# Test -2: get pet by vet id success ------------------------------------------------------------
def test_get_pets_by_vet_id(client, mocker):
    mock_pet_db = mocker.patch("api.users.pet_db.stream")

    mock_pet_doc = MagicMock()
    mock_pet_doc.id = "pet1"
    mock_pet_doc.to_dict.return_value = {"Name": "Fluffy", "Type": "Dog"}

    mock_health_doc = MagicMock()
    mock_health_doc.to_dict.return_value = {"VetId": "12345"}

    mock_pet_doc.reference.collection.return_value.stream.return_value = [mock_health_doc]

    mock_pet_db.return_value = [mock_pet_doc]

    response = client.get('/vets/12345/pets')
    assert response.status_code == 200
    assert response.get_json() == [{"id": "pet1", "Name": "Fluffy", "Type": "Dog"}]


# Test -1: get pet by vet id failure (vet id not found) ------------------------------------------------------------
def test_get_pets_by_vet_id_not_found(client, mocker):
    mock_pet_db = mocker.patch("api.users.pet_db.stream")

    mock_pet_doc = MagicMock()
    mock_pet_doc.id = "pet1"
    mock_pet_doc.to_dict.return_value = {"Name": "Fluffy", "Type": "Dog"}

    mock_health_doc = MagicMock()
    mock_health_doc.to_dict.return_value = {"VetId": "99999"}  

    mock_pet_doc.reference.collection.return_value.stream.return_value = [mock_health_doc]

    mock_pet_db.return_value = [mock_pet_doc]

    response = client.get('/vets/12345/pets')  
    assert response.status_code == 404
    assert response.get_json() == {"message": "No pets found for this vet."}


# Test 0: get pet by vet id error ------------------------------------------------------------
def test_get_pets_by_vet_id_error(client, mocker):
    mock_pet_db = mocker.patch("api.users.pet_db.stream")
    mock_pet_db.side_effect = Exception("Firestore error")  

    response = client.get('/vets/12345/pets')  
    assert response.status_code == 500
    assert "error" in response.get_json()
    assert response.get_json()["error"] == "Firestore error"
 

# Test 1: create user with success ------------------------------------------------------------
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

    mock_create_user = mocker.patch("firebase_admin.auth.create_user")
    mock_create_user.side_effect = Exception("auth/email-already-exists")

    response = client.post('/users', json=user_data)

    assert response.status_code == 400
    assert "auth/email-already-exists" in response.get_json()["error"]

    # Ensure `create_user` was called
    mock_create_user.assert_called_once_with(email=user_data["Email"], password=user_data["Password"])
    

# Test 4: create user with error (no email or password) ------------------------------------------------------------
def test_login_missing_email_or_password(client):
    missing_email_data = {"Password": "securepassword123"}
    response = client.post('/users/login', json=missing_email_data)
    assert response.status_code == 400
    assert response.get_json()["error"] == "Email and Password are required"

    missing_password_data = {"Email": "test@example.com"}
    response = client.post('/users/login', json=missing_password_data)
    assert response.status_code == 400
    assert response.get_json()["error"] == "Email and Password are required"


# Test 5: create user with error (missing API key) ------------------------------------------------------------
def test_login_missing_firebase_api_key(client, mocker):
    mocker.patch("os.getenv", return_value=None)

    valid_data = {"Email": "test@example.com", "Password": "securepassword123"}

    response = client.post('/users/login', json=valid_data)
    assert response.status_code == 500
    assert response.get_json()["error"] == "API key not configured"


# Test 6: create user with error (user not found) ------------------------------------------------------------
def test_login_user_record_not_found(client, mocker):
    mocker.patch("os.getenv", return_value="fake_firebase_api_key")

    mock_requests_post = mocker.patch("requests.post")
    mock_requests_post.return_value.status_code = 200
    mock_requests_post.return_value.json.return_value = {
        "idToken": "fakeIdToken",
        "refreshToken": "fakeRefreshToken",
        "expiresIn": "3600",
        "localId": "user123"
    }

    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_user_doc = MagicMock()
    mock_user_doc.exists = False 
    mock_user_ref.return_value.get.return_value = mock_user_doc

    login_data = {
        "Email": "test@example.com",
        "Password": "securepassword123"
    }

    response = client.post('/users/login', json=login_data)

    assert response.status_code == 404
    assert response.get_json()["error"] == "User record not found"

    mock_requests_post.assert_called_once()
    mock_user_ref.assert_called_once_with("user123")


# Test 7: update user with success ------------------------------------------------------------
def test_update_user_success(client, mocker):
    user_id = "12345"
    update_data = {
        "FName": "Jane",
        "Location": "Boston",
        "Avatar": (BytesIO(b"fake image data"), "avatar.png")  # File upload simulated here
    }

    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_document = MagicMock()
    mock_user_ref.return_value = mock_document
    mock_document.get.return_value.exists = True  # Simulate user exists
    mock_document.get.return_value.to_dict.return_value = {
        "FName": "John",
        "LName": "Doe",
        "Email": "jdoe@gmail.com",
        "Location": "New York",
        "PetId": "pet456",
        "Avatar": "old_avatar_url"
    }
    mock_document.update.return_value = None  # Simulate successful update
    
    mock_bucket = mocker.patch("api.users.bucket")
    mock_blob = MagicMock()
    mock_bucket.blob.return_value = mock_blob
    mock_blob.upload_from_file.return_value = None
    mock_blob.name = "test_bucket"

    # Mock URL encoding
    mock_quote = mocker.patch("api.users.quote")
    mock_quote.return_value = "userImages%2F12345.png"

    # Make the request
    response = client.put(
        f'/users/{user_id}',
        data={
            "FName": update_data["FName"],
            "Location": update_data["Location"],
            "Avatar": update_data["Avatar"]  # Flask's test client processes this as a file
        },
        content_type="multipart/form-data"  # Ensure correct content type for file upload
    )

    assert response.status_code == 200
    assert f"User {user_id} updated successfully" in response.get_json()["message"]

    # Check Firestore interactions
    mock_user_ref.assert_called_once_with(user_id)
    mock_document.update.assert_called_once()

    # Check Firebase Storage interactions
    mock_bucket.blob.assert_called_once_with("userImages/12345.png")
    mock_blob.upload_from_file.assert_called_once()
    mock_quote.assert_called_once_with("userImages/12345.png", safe="")

    
# Test 8: update user with error ------------------------------------------------------------
def test_update_user_not_found(client, mocker):
    user_id = "12345"
    update_data = {"FName": "Jane", "Location": "Boston"}

    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_document = MagicMock()
    mock_user_ref.return_value = mock_document
    mock_document.get.return_value.exists = False  # Simulate user does not exist

    response = client.put(f'/users/{user_id}', json=update_data)

    assert response.status_code == 404
    assert "User not found" in response.get_json()["error"]
    mock_user_ref.assert_called_once_with(user_id)
    mock_document.update.assert_not_called()


# Test 9: delete user with sucess ------------------------------------------------------------
def test_delete_user_success(client, mocker):
    user_id = "12345"

    mock_delete_auth = mocker.patch("firebase_admin.auth.delete_user")
    mock_delete_auth.return_value = None  # Simulate successful Firebase deletion

    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_document = MagicMock()
    mock_user_ref.return_value = mock_document
    mock_document.get.return_value.exists = True  # Simulate user exists
    mock_document.delete.return_value = None  # Simulate successful Firestore deletion

    response = client.delete(f'/users/{user_id}')

    assert response.status_code == 200
    assert f"User {user_id} deleted successfully" in response.get_json()["message"]
    mock_delete_auth.assert_called_once_with(user_id)
    mock_user_ref.assert_called_once_with(user_id)
    mock_document.delete.assert_called_once()


# Test 10: delete user with error ------------------------------------------------------------
def test_delete_user_not_found(client, mocker):
    user_id = "12345"

    mock_delete_auth = mocker.patch("firebase_admin.auth.delete_user")
    mock_delete_auth.return_value = None  # Simulate successful Firebase deletion

    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_document = MagicMock()
    mock_user_ref.return_value = mock_document
    mock_document.get.return_value.exists = False  # Simulate user does not exist

    response = client.delete(f'/users/{user_id}')

    assert response.status_code == 404
    assert "User not found" in response.get_json()["error"]
    mock_delete_auth.assert_called_once_with(user_id)
    mock_user_ref.assert_called_once_with(user_id)
    mock_document.delete.assert_not_called()
    

# Test 11: Login with sucess ------------------------------------------------------------
def test_login_success(client, mocker):
    login_data = {
        "Email": "john.doe@example.com",
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

    assert response.status_code == 200
    response_data = response.get_json()
    assert response_data["message"] == "Login successful"
    assert response_data["idToken"] == "mock_id_token"
    assert response_data["refreshToken"] == "mock_refresh_token"


# Test 12: Login with error (no user) ------------------------------------------------------------
def test_login_no_user(client, mocker):
    login_data = {
        "Email": "nonexistent@example.com",
        "Password": "password123"
    }

    mocker.patch.dict(os.environ, {"FIREBASE_API_KEY": "mock_api_key"})

    mock_post = mocker.patch("api.users.requests.post")
    mock_post.return_value = MagicMock(
        status_code=400,
        json=lambda: {"error": {"message": "EMAIL_NOT_FOUND"}}
    )

    response = client.post('/users/login', json=login_data)

    assert response.status_code == 400
    assert "EMAIL_NOT_FOUND" in response.get_json()["error"]


# Test 13: Login with error (wrong password) ------------------------------------------------------------
def test_login_invalid_credentials(client, mocker):
    login_data = {
        "Email": "john.doe@example.com",
        "Password": "wrongpassword"
    }

    mocker.patch.dict(os.environ, {"FIREBASE_API_KEY": "mock_api_key"})

    mock_post = mocker.patch("api.users.requests.post")
    mock_post.return_value = MagicMock(
        status_code=400,
        json=lambda: {"error": {"message": "INVALID_PASSWORD"}}
    )

    response = client.post('/users/login', json=login_data)

    assert response.status_code == 400
    assert "INVALID_PASSWORD" in response.get_json()["error"]
    

# Test 14: Logout with success ------------------------------------------------------------
def test_logout_success(client):
    with client.session_transaction() as session:
        session['user_id'] = "12345"
        session['email'] = "john.doe@example.com"

    response = client.post('/users/logout')

    assert response.status_code == 200
    assert response.get_json()["message"] == "Logout successful."
    with client.session_transaction() as session:
        assert 'user_id' not in session
        assert 'email' not in session


# Test 15: connect vet with error (no vet) ------------------------------------------------------------
def test_connect_vet_not_found(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_doc = MagicMock()
    mock_vet_ref.return_value = mock_vet_doc
    mock_vet_doc.get.return_value.exists = False  # Simulate vet does not exist

    response = client.put('/connect_vet/', json=data)

    assert response.status_code == 404
    assert "Vet vet123 not found" in response.get_json()["error"]
    mock_vet_ref.assert_called_once_with("vet123")


# Test 16: connect vet error (wrong role) ------------------------------------------------------------
def test_connect_vet_not_a_vet(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_doc = MagicMock()
    mock_vet_ref.return_value = mock_vet_doc
    mock_vet_doc.get.return_value.exists = True  # Simulate vet exists
    mock_vet_doc.get.return_value.to_dict.return_value = {"Role": "User"}  # Simulate non-Vet role

    response = client.put('/connect_vet/', json=data)

    assert response.status_code == 403
    assert "Access denied: User is not a Vet" in response.get_json()["error"]
    mock_vet_ref.assert_called_once_with("vet123")


# Test 17: connect vet error (missing health doc) ------------------------------------------------------------
def test_connect_vet_create_health_success(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_doc = MagicMock()
    mock_vet_ref.return_value = mock_vet_doc
    mock_vet_doc.get.return_value.exists = True  
    mock_vet_doc.get.return_value.to_dict.return_value = {"Role": "Vet"}  

    # Mock Firestore for pet
    mock_pet_ref = mocker.patch("api.users.pet_db.document")
    mock_pet_doc = MagicMock()
    mock_pet_ref.return_value = mock_pet_doc
    mock_pet_doc.collection.return_value.limit.return_value.get.return_value = []  # No health docs

    mock_create_health = mocker.patch("api.users.create_health")
    mock_create_health.return_value = ({"message": "Health document created"}, 201)

    response = client.put('/connect_vet/', json=data)

    assert response.status_code == 200
    assert "Vet vet123 successfully connected to Pet pet456" in response.get_json()["message"]
    mock_vet_ref.assert_called_once_with("vet123")
    mock_create_health.assert_called_once_with("pet456")


# Test 18: connect vet error (health doc creation error) ------------------------------------------------------------
def test_connect_vet_create_health_failure(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_doc = MagicMock()
    mock_vet_ref.return_value = mock_vet_doc
    mock_vet_doc.get.return_value.exists = True  # Simulate vet exists
    mock_vet_doc.get.return_value.to_dict.return_value = {"Role": "Vet"}  # Simulate Vet role

    mock_pet_ref = mocker.patch("api.users.pet_db.document")
    mock_pet_doc = MagicMock()
    mock_pet_ref.return_value = mock_pet_doc
    mock_pet_doc.collection.return_value.limit.return_value.get.return_value = []  # No health docs

    mock_create_health = mocker.patch("api.users.create_health")
    mock_create_health.return_value = ({"error": "Failed to create health document"}, 500)

    response = client.put('/connect_vet/', json=data)

    assert response.status_code == 500
    assert "Failed to create health document" in response.get_json()["error"]
    mock_create_health.assert_called_once_with("pet456")


# Test 19: connect vet with success ------------------------------------------------------------
def test_connect_vet_success(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_doc = MagicMock()
    mock_vet_ref.return_value = mock_vet_doc
    mock_vet_doc.get.return_value.exists = True  # Simulate vet exists
    mock_vet_doc.get.return_value.to_dict.return_value = {"Role": "Vet"}  # Simulate Vet role

    mock_pet_ref = mocker.patch("api.users.pet_db.document")
    mock_pet_doc = MagicMock()
    mock_pet_ref.return_value = mock_pet_doc
    mock_health_doc = MagicMock()
    mock_pet_doc.collection.return_value.limit.return_value.get.return_value = [mock_health_doc]  # Health doc exists

    mock_health_doc.reference.update.return_value = None
    mock_vet_ref.return_value.update.return_value = None

    response = client.put('/connect_vet/', json=data)

    assert response.status_code == 200
    assert "Vet vet123 successfully connected to Pet pet456" in response.get_json()["message"]
    mock_health_doc.reference.update.assert_called_once_with({
        "VetId": firestore.ArrayUnion(["vet123"])
    })
    mock_vet_ref.return_value.update.assert_called_once_with({
        "PetId": firestore.ArrayUnion(["pet456"])
    })


# Test 20: connect vet raise error ------------------------------------------------------------
def test_connect_vet_error(client, mocker):
    data = {"VetId": "vet123", "PetId": "pet456"}

    mock_vet_ref = mocker.patch("api.users.user_db.document")
    mock_vet_ref.side_effect = Exception("Simulated Firestore error")

    response = client.put('/connect_vet/', json=data)

    assert response.status_code == 500
    assert "error" in response.get_json()
    assert response.get_json()["error"] == "Simulated Firestore error"

    mock_vet_ref.assert_called_once_with("vet123")


# Test 21: get user by id success ------------------------------------------------------------
def test_get_user_by_id_user_found(client, mocker):
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_user_doc = MagicMock()
    mock_user_doc.exists = True  
    mock_user_doc.id = "user123"  
    mock_user_doc.to_dict.return_value = {
        "FName": "John",
        "LName": "Doe",
        "Email": "john.doe@example.com",
        "Role": "Owner"
    }
    mock_user_ref.return_value.get.return_value = mock_user_doc

    response = client.get('/users/user123')

    assert response.status_code == 200
    assert response.get_json() == {
        "user123": {
            "FName": "John",
            "LName": "Doe",
            "Email": "john.doe@example.com",
            "Role": "Owner"
        }
    }

    mock_user_ref.assert_called_once_with("user123")


# Test 22: get user by id error ------------------------------------------------------------
def test_get_user_by_id_user_not_found(client, mocker):
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_user_doc = MagicMock()
    mock_user_doc.exists = False  
    mock_user_ref.return_value.get.return_value = mock_user_doc

    response = client.get('/users/user123')

    assert response.status_code == 404
    assert response.get_json() == {"error": "User not found"}

    mock_user_ref.assert_called_once_with("user123")


# Test 22: get multiple users by id success ------------------------------------------------------------
def test_get_users_by_ids(client, mocker):
    mock_user_ref = mocker.patch("api.users.user_db.document")
    
    mock_user_doc1 = MagicMock()
    mock_user_doc1.exists = True
    mock_user_doc1.to_dict.return_value = {
        "FName": "John",
        "LName": "Doe",
        "Email": "john.doe@example.com",
        "Role": "Owner"
    }
    
    mock_user_doc2 = MagicMock()
    mock_user_doc2.exists = False  

    def mock_document(user_id):
        if user_id == "user123":
            return MagicMock(get=MagicMock(return_value=mock_user_doc1))
        elif user_id == "user456":
            return MagicMock(get=MagicMock(return_value=mock_user_doc2))
    
    mock_user_ref.side_effect = mock_document

    response = client.get('/users/ids?ids=user123,user456')

    assert response.status_code == 200
    assert response.get_json() == {
        "user123": {
            "FName": "John",
            "LName": "Doe",
            "Email": "john.doe@example.com",
            "Role": "Owner"
        },
        "user456": {"error": "User not found"}
    }

    mock_user_ref.assert_any_call("user123")
    mock_user_ref.assert_any_call("user456")
    assert mock_user_ref.call_count == 2


# Test 23: get user with ver role by pet id success ------------------------------------------------------------
def test_get_users_by_pet_id_users_found(client, mocker):
    mock_user_db = mocker.patch("api.users.user_db")
    
    mock_user_doc = MagicMock()
    mock_user_doc.id = "user123"
    mock_user_doc.to_dict.return_value = {
        "FName": "John",
        "LName": "Doe",
        "Email": "john.doe@example.com",
        "Role": "Vet",
        "PetId": ["pet456"]
    }

    mock_query = MagicMock()
    mock_query.stream.return_value = [mock_user_doc]  

    mock_user_db.where.return_value = mock_query
    mock_query.where.return_value = mock_query

    response = client.get('/users/petId/pet456')
    
    assert response.status_code == 200
    assert response.get_json() == {
        "user123": {
            "FName": "John",
            "LName": "Doe",
            "Email": "john.doe@example.com",
            "Role": "Vet",
            "PetId": ["pet456"]
        }
    }


# Test 24: get all event by user owner success (has event) ------------------------------------------------------------
def test_get_events_by_user_id_owner_with_events(client, mocker):
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_user_doc = MagicMock()
    mock_user_doc.exists = True
    mock_user_doc.to_dict.return_value = {"Role": "Owner"}
    mock_user_ref.return_value.get.return_value = mock_user_doc

    mock_pet_db = mocker.patch("api.users.pet_db.where")
    mock_pet_doc = MagicMock()
    mock_pet_doc.id = "pet123"
    mock_event_doc = MagicMock()
    mock_event_doc.id = "event123"
    mock_event_doc.to_dict.return_value = {"Name": "Vet Visit"}

    mock_pet_doc.reference.collection.return_value.stream.return_value = [mock_event_doc]
    mock_pet_db.return_value.stream.return_value = [mock_pet_doc]

    response = client.get('/users/user123/events')

    assert response.status_code == 200
    assert response.get_json() == [{"Id": "event123", "Name": "Vet Visit", "PetId": "pet123"}]


# Test 25: get all event by user owner success (no event) ------------------------------------------------------------
def test_get_events_by_user_id_owner_without_events(client, mocker):
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_user_doc = MagicMock()
    mock_user_doc.exists = True
    mock_user_doc.to_dict.return_value = {"Role": "Owner"}

    mock_pet_db = mocker.patch("api.users.pet_db.where")
    mock_pet_doc = MagicMock()
    mock_pet_doc.id = "pet123"
    mock_pet_doc.reference.collection.return_value.stream.return_value = []
    mock_pet_db.return_value.stream.return_value = [mock_pet_doc]

    response = client.get('/users/user123/events')

    assert response.status_code == 200
    assert response.get_json() == []


# Test 26: get all event by user vet success ------------------------------------------------------------
def test_get_events_by_user_id_non_owner_with_events(client, mocker):
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_user_doc = MagicMock()
    mock_user_doc.exists = True
    mock_user_doc.to_dict.return_value = {"Role": "Vet", "PetId": ["pet123"]}
    mock_user_ref.return_value.get.return_value = mock_user_doc

    mock_pet_db = mocker.patch("api.users.pet_db.document")
    mock_event_doc = MagicMock()
    mock_event_doc.id = "event123"
    mock_event_doc.to_dict.return_value = {"Name": "Playtime"}

    mock_pet_doc = MagicMock()
    mock_pet_doc.collection.return_value.stream.return_value = [mock_event_doc]
    mock_pet_db.return_value = mock_pet_doc

    response = client.get('/users/user123/events')

    assert response.status_code == 200
    assert response.get_json() == [
        {"Id": "event123", "Name": "Playtime", "PetId": "pet123"}
    ]


# Test 27: get all reminder by user id success ------------------------------------------------------------
def test_get_reminders_by_user_id_success_owner(client, mocker):
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_user_doc = MagicMock()
    mock_user_doc.exists = True
    mock_user_doc.to_dict.return_value = {"Role": "Owner"}
    mock_user_ref.return_value.get.return_value = mock_user_doc

    mock_pet_db = mocker.patch("api.users.pet_db.where")
    mock_pet_doc = MagicMock()
    mock_pet_doc.id = "pet123"
    mock_reminder_doc = MagicMock()
    mock_reminder_doc.id = "reminder123"
    mock_reminder_doc.to_dict.return_value = {"Name": "Vaccination"}

    mock_pet_doc.reference.collection.return_value.stream.return_value = [mock_reminder_doc]
    mock_pet_db.return_value.stream.return_value = [mock_pet_doc]

    response = client.get('/users/user123/reminders')

    assert response.status_code == 200
    assert response.get_json() == [
        {"Id": "reminder123", "Name": "Vaccination", "PetId": "pet123"}
    ]    


# Test 28: get all reminder by user vet id success ------------------------------------------------------------
def test_get_reminders_by_user_id_success_non_owner(client, mocker):
    # Mock Firestore user reference
    mock_user_ref = mocker.patch("api.users.user_db.document")
    mock_user_doc = MagicMock()
    mock_user_doc.exists = True
    mock_user_doc.to_dict.return_value = {
        "Role": "Vet",  # Non-owner role
        "PetId": ["pet123", "pet456"]
    }
    mock_user_ref.return_value.get.return_value = mock_user_doc

    # Mock Firestore pet document reference and REMINDER subcollection
    mock_pet_db = mocker.patch("api.users.pet_db.document")
    
    # Mock reminders for pet123
    mock_reminder_doc1 = MagicMock()
    mock_reminder_doc1.id = "reminder123"
    mock_reminder_doc1.to_dict.return_value = {"Name": "Vaccination"}
    mock_pet_doc1 = MagicMock()
    mock_pet_doc1.collection.return_value.stream.return_value = [mock_reminder_doc1]

    # Mock reminders for pet456
    mock_reminder_doc2 = MagicMock()
    mock_reminder_doc2.id = "reminder456"
    mock_reminder_doc2.to_dict.return_value = {"Name": "Check-up"}
    mock_pet_doc2 = MagicMock()
    mock_pet_doc2.collection.return_value.stream.return_value = [mock_reminder_doc2]

    # Configure pet_db.document to return different pet documents
    def mock_document(pet_id):
        if pet_id == "pet123":
            return mock_pet_doc1
        elif pet_id == "pet456":
            return mock_pet_doc2
        return MagicMock()

    mock_pet_db.side_effect = mock_document

    # Perform the GET request
    response = client.get('/users/user123/reminders')

    # Assertions
    assert response.status_code == 200
    assert response.get_json() == [
        {"Id": "reminder123", "Name": "Vaccination", "PetId": "pet123"},
        {"Id": "reminder456", "Name": "Check-up", "PetId": "pet456"}
    ]