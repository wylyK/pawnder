# Collection

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

# Testing

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/21134493-168fae25-5c38-41e0-aad5-6cef3190b6f4?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D21134493-168fae25-5c38-41e0-aad5-6cef3190b6f4%26entityType%3Dcollection%26workspaceId%3D4906f7d8-066c-4f82-aff0-8850ec269345)
