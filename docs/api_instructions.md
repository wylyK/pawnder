# Collection

## Pet Collection

### What

- **GET**
  - `/pets/type?type={Typy}`
  - `/pets/location?location={location}`
  - `/pets`
  - `/pets/<pet_id>`
- **POST** `/pets/create`
- **PUT** `/pets/<petId>`
- **DELETE** `/pets/<petId>`

### Details

- **GET**
  - - `/pets/type?type={Type}`: Retrieves list of pet ids of type {Type}
    - `/pets/location?location={Location}`: Retrieves list of pet ids of location {Location}
    - `/pets`: Retrieves all the pets
    - `/pets/<pet_id>`: Retrieves pet by doc Id
- **POST** `/pets/create`: Adds a new pet profile with basic information
- **PUT** `/pets/<petId>`: Updates pet profile
- **DELETE** `/pets/<petId>`: Deletes pet profile

## Match Collection

### What

- Create 4 API endpoints
  - **GET**
    - `/pets/<petId>/matches?status=pending`
    - `/pets/<petId>/matches?status=matched`
  - **POST** `/pets/<petId>/matches`
  - **PUT** `/pets/<petId>/matches?action=accept`
  - **DELETE**
    - `/pets/<petId>/matches?action=unmatch`
    - `/pets/<petId>/matches?action=reject`
- Create `firestore_client.py` to centralize the creation of Firestore client. Other file should import this instead of creating multiple instant of Firestore client which make querying for data less efficient

### Details

- **GET**
  - `/pets/<petId>/matches?status=pending` : Get all the ID of pets that have sent a matching request to pet with petId. Using this we can display all match request so our pet can accept or reject the request
  - `/pets/<petId>/matches?status=matched` : Get all the ID of pets that have matched status with petId
- **POST** `/pets/<petId>/matches` : Send a match request to another pet. This will create a Match entry with pending status in the other pet MATCH collection
- **PUT** `/pets/<petId>/matches?action=accept` : Accept a matching request from another pet. This will create update the status of the Match entry in my pet MATCH collection and create a Match entry with matched status in the other pet MATCH collection
- **DELETE**
  - `/pets/<petId>/matches?action=unmatch` : Unmatch with the other pet that petId have sent a request to or already matched with. If unmatch with a pet that my pet have only sent a request to, we just delete the Match entry in the other pet MATCH collection. If we have already match with the pet then delete the Match entry in both pets MATCH collection
  - `/pets/<petId>/matches?action=reject` : Reject a matching request from another pet. We just have to delete the Match entry in my pet MATCH collection

## Health Collection

### What

- Create 4 API endpoints
  - **GET** `/pets/<petId>/health`
  - **POST** `/pets/<petId>/health`
  - **PUT** `/pets/<petId>/health`
  - **DELETE** `/pets/<petId>/health`

### Details

- **GET** `/pets/<petId>/health`: Retrieves the health records for the specified pet.
- **POST** `/pets/<petId>/health`: Adds a new health record to the pet’s collection.
- **PUT** `/pets/<petId>/health`: Updates existing health information for the pet.
- **DELETE** `/pets/<petId>/health`: Deletes all health records for the pet.

## Event Collection

### Details

- **GET**
  - `/pets/<petId>/events`: Fetches all documents from the EVENT subcollection of the specified pet.
  - `/pets/<petId>/events/status?status={status}`: Filters events in the EVENT subcollection of the pet based on the Status field.
  - `/pets/<petId>/events/type?type={type}`: Filters events in the EVENT subcollection of the pet based on the Type field.
- **POST** `/pets/<petId>/events`: Adds a document to the EVENT subcollection of the specified pet with fields like CreatedAt (timestamp), Name, Type, and Status
- **PUT** `/pets/<petId>/events/<eventId>`: Modifies fields in an event document identified by eventId in the EVENT subcollection
- **DELETE** `/pets/<petId>/events/<eventId>`: Removes a document identified by eventId from the EVENT subcollection

## User Collection

### API Endpoints

#### **User Management**

1. **POST** `/users`

   - **What**: Creates a new user through Firebase Authentication and stores profile data in Firestore.
   - **Request Body**:
     ```json
     {
       "Email": "user@example.com",
       "Password": "securepassword",
       "Role": "Owner"
     }
     ```
   - **Response**: User created with Firebase Auth and Firestore.

2. **POST** `/users/login`

   - **What**: Logs in a user using email and password through Firebase Authentication.
   - **Request Body**:
     ```json
     {
       "Username": "user@example.com",
       "Password": "securepassword"
     }
     ```
   - **Response**: Returns tokens (`idToken`, `refreshToken`) and login status.

3. **POST** `/users/logout`

   - **What**: Logs out a user by clearing the session.
   - **Response**: Logout successful.

4. **GET** `/users/<user_id>`

   - **What**: Retrieves user profile data by user ID.
   - **Response**: Returns user details.

5. **PUT** `/users/<user_id>`

   - **What**: Updates user profile data.
   - **Request Body**: Fields to update.
   - **Response**: User profile updated successfully.

6. **DELETE** `/users/<user_id>`
   - **What**: Deletes a user from Firebase Authentication and Firestore.
   - **Response**: User deleted successfully.

#### **Event Management**

1. **GET** `/users/<user_id>/events`

   - **What**: Fetches all events associated with the user, either directly or through their pets.
   - **Response**: List of events.

2. **GET** `/users/<user_id>/events/status?status=<status>`
   - **What**: Fetches events by status (e.g., `scheduled`) for the user or their pets.
   - **Query Param**: `status`
   - **Response**: List of filtered events.

#### **Vet-Pet Connection**

1. **PUT** `/connect_vet/`
   - **What**: Connects a vet to a pet, updates the vet's `PetId` and the pet's `VetId` fields.
   - **Request Body**:
     ```json
     {
       "VetId": "vet123",
       "PetId": "pet456"
     }
     ```
   - **Response**: Vet connected to pet successfully.

# Testing

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/21134493-168fae25-5c38-41e0-aad5-6cef3190b6f4?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D21134493-168fae25-5c38-41e0-aad5-6cef3190b6f4%26entityType%3Dcollection%26workspaceId%3D4906f7d8-066c-4f82-aff0-8850ec269345)
