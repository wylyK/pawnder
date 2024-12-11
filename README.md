# Pawnder - Pet Care App

Pawnder is a web application designed to simplify pet care management for both pet owners and veterinarians. It serves as a one-stop solution to organize and track all pet-related needs with ease. From scheduling and tracking appointments—such as vet visits, grooming, and vaccinations—to maintaining a detailed pet profile, Pawnder keeps everything in one place. Each pet profile includes essential health records such as diet plans, prescriptions, insurance details, and more.

Pawnder also has a unique social feature: Pet Tinder—a playful element that matches pets with other pets, just like a social media platform for furry friends!

The goal of Pawnder is to eliminate the confusion and hassle often associated with managing pet care. With a clean, user-friendly interface and straightforward features, it ensures an enjoyable experience for both pet owners and vets, while keeping pets’ needs at the forefront.

# Demo
## Link to our demo: [Pawnder](https://drive.google.com/file/d/1boloLyCnhHhj62U_65z99DMxEe1RRSGX/view?usp=drive_link)
![image](https://github.com/user-attachments/assets/5bc4d238-e406-4909-8b1c-4db1833c1e22)

# Installation Instructions and Configuration

## [Development](./docs/development.md)

Get start with developing Pawnder.

### Install dependencies

#### Frontend

This app uses `npm` for frontend development. To install dependencies, go the the frontend directory of the project and use the following command:

```sh
# Install dependencies
npm install
```

#### Backend

This app uses `pip` for backend development. To install dependencies, go the the backend directory of the project and use the following command:

```sh
# Install dependencies
pip install -r requirements.txt
```

### Setting Up Environment Variables

To ensure the app works correctly, you must configure .env files for both the frontend and backend. These files provide the necessary environment variables.

#### Frontend and Backend .env Files

In the frontend and backend directories, create .env files and add the content from the .env file in the respective directories.

`https://drive.google.com/drive/folders/1YbB_pWQInPr7gTW5FliuprQDy7g_-TJE?usp=drive_link`

This sets the backend API URL for the frontend during development.
Ensure the file pawnder-firebase-adminsdk.json (used by GOOGLE_APPLICATION_CREDENTIALS) is placed in the backend directory. This file is critical for Firebase operations.

### Login Credentials for Testing

To test the app, use the following login credentials:

Pet Owner login: `testuser@gmail.com` / `123456`
Vet login: `vet@gmail.com` / `123asd`

### Setup backend

This project uses Flask for the backend. You need to create a virtual environment to manage dependencies and run the backend.

#### 1. Install `virtualenv`

First, you need to install the `virtualenv` package:

```sh
pip install virtualenv
```

#### 2. Create new Virtural Environment

```sh
python -m venv ${VIRTUAL_ENV_NAME}
```

```sh
python -m venv venv
```

If the virtual environment name is different from venv, add it to the `.env` file for consistency.

#### 3. Activate virtualenv

```Window
${VIRTUAL_ENV_NAME}\Scripts\activate
```

```Mac
source ${VIRTUAL_ENV_NAME}/bin/activate
```

### Run development mode

To begin running development mode:

#### Frontend:

```sh
npm run dev
```

#### Backend:

```sh
flask run
```

If live reloading isn’t working

```sh
flask --app app run --debug
```

### Development workflow

Before starting your work, create a new branch (or an issue, then create a branch for it). Run:
Run `git fetch origin`
Run `git checkout -b ${YOUR_NEW_BRANCH}`
Ensure all dependencies are installed in the respective frontend and backend directories

As you (and other developers) make changes to the code base, there are some steps you should do before create a pull request (PR). At the directory of the project, run the following command to format code consistently: `npx prettier . --write`. Currently, CI/CD workflows are configured to check CSS formatting, TypeScript formatting, indentation, and syntax in the frontend.

Then, run `git add .` to stage your changes
Next, run `git commit -m ${YOUR_MESSAGE}` to commit with a descriptive message
Next, run `git pull origin main`
Next, run `git push origin ${YOUR_BRANCH}`


## [API Instruction](./docs/api_instructions.md)

### Collection

#### User Collection

##### What

- **GET**
  - `/users/<user_id>`
  - `/users/<user_id>/events`
  - `/users/<user_id>/events/status?status=<status>`
- **POST**
  - `/users/login`
  - `/users/logout`
  - `/users`
- **PUT**
  - `/connect_vet/`
  - `/users/<user_id>`
- **DELETE** `/users/<user_id>`

##### Details

- **GET**
  - `/users/<user_id>`: Retrieves the info of user using user_id (return type is dict)
  - `/users/<user_id>/events`: Fetches all events associated with the user, either owner or vet
  - `/users/<user_id>/events/status?status=<status>`: Fetches events by status (e.g., `scheduled`) for the user.
- **POST**
  - `/users/login`: Sending in a request (with 'Username' and 'Password') to login
  - `/users/logout`: Logout by clearing the current session
- **PUT**
  - `/connect_vet/`: With request ("PetId" and "VetId"), add in the VetId into health table of the pet, and add in the PetId into the User's PetId field. Only the Role "Vet" can perform this action
  - `/users/<user_id>`: Update the user's info
- **DELETE** `/pets/<petId>`: Deletes user profile

#### Pet Collection

##### What

- **GET**
  - `/pets/type?type={Typy}`
  - `/pets/location?location={location}`
  - `/pets`
  - `/pets/<pet_id>`
- **POST** `/pets/create`
- **PUT** `/pets/<petId>`
- **DELETE** `/pets/<petId>`

##### Details

- **GET**
  - - `/pets/type?type={Type}`: Retrieves list of pet ids of type {Type}
    - `/pets/location?location={Location}`: Retrieves list of pet ids of location {Location}
    - `/pets`: Retrieves all the pets
    - `/pets/<pet_id>`: Retrieves pet by doc Id
- **POST** `/pets/create`: Adds a new pet profile with basic information
- **PUT** `/pets/<petId>`: Updates pet profile
- **DELETE** `/pets/<petId>`: Deletes pet profile

#### Match Collection

##### What

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

##### Details

- **GET**
  - `/pets/<petId>/matches?status=pending` : Get all the ID of pets that have sent a matching request to pet with petId. Using this we can display all match request so our pet can accept or reject the request
  - `/pets/<petId>/matches?status=matched` : Get all the ID of pets that have matched status with petId
- **POST** `/pets/<petId>/matches` : Send a match request to another pet. This will create a Match entry with pending status in the other pet MATCH collection
- **PUT** `/pets/<petId>/matches?action=accept` : Accept a matching request from another pet. This will create update the status of the Match entry in my pet MATCH collection and create a Match entry with matched status in the other pet MATCH collection
- **DELETE**
  - `/pets/<petId>/matches?action=unmatch` : Unmatch with the other pet that petId have sent a request to or already matched with. If unmatch with a pet that my pet have only sent a request to, we just delete the Match entry in the other pet MATCH collection. If we have already match with the pet then delete the Match entry in both pets MATCH collection
  - `/pets/<petId>/matches?action=reject` : Reject a matching request from another pet. We just have to delete the Match entry in my pet MATCH collection

#### Health Collection

##### What

- Create 4 API endpoints
  - **GET** `/pets/<petId>/health`
  - **POST** `/pets/<petId>/health`
  - **PUT** `/pets/<petId>/health`
  - **DELETE** `/pets/<petId>/health`

##### Details

- **GET** `/pets/<petId>/health`: Retrieves the health records for the specified pet.
- **POST** `/pets/<petId>/health`: Adds a new health record to the pet’s collection.
- **PUT** `/pets/<petId>/health`: Updates existing health information for the pet.
- **DELETE** `/pets/<petId>/health`: Deletes all health records for the pet.

#### Event Collection

##### Details

- **GET**
  - `/pets/<petId>/events`: Fetches all documents from the EVENT subcollection of the specified pet.
  - `/pets/<petId>/events/status?status={status}`: Filters events in the EVENT subcollection of the pet based on the Status field.
  - `/pets/<petId>/events/type?type={type}`: Filters events in the EVENT subcollection of the pet based on the Type field.
- **POST** `/pets/<petId>/events`: Adds a document to the EVENT subcollection of the specified pet with fields like CreatedAt (timestamp), Name, Type, and Status
- **PUT** `/pets/<petId>/events/<eventId>`: Modifies fields in an event document identified by eventId in the EVENT subcollection
- **DELETE** `/pets/<petId>/events/<eventId>`: Removes a document identified by eventId from the EVENT subcollection

### Testing

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/21134493-168fae25-5c38-41e0-aad5-6cef3190b6f4?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D21134493-168fae25-5c38-41e0-aad5-6cef3190b6f4%26entityType%3Dcollection%26workspaceId%3D4906f7d8-066c-4f82-aff0-8850ec269345)



## [Testing Instruction](./docs/testing_instruction.md)

### Backend

- Move into the backend folder and run `PYTHONPATH=$(pwd) pytest tests` (for Mac)
- Move into backend and run `$env:PYTHONPATH = (Get-Location).Path; pytest` (for Window powershell)
- This command will run all current tests cases
- As of now, there are 6 different test files correspond to 6 API files

### Frontend

- Move into the frontend folder and run `npx jest tests/components`
