# Abby Tran
## Backend
- Set up Flask for backend
- Connect Firebase with Flask
- Create CRUD API endpoint for user
- Create API endpoint for matching pets, unmatch pet, get all pending match request, accept or reject a request
- Create data model for Match object for matching pet
- Connect with Firebase Storage
- Add endpoint to allow user to upload avatar picture for pet and user profile
- Add COR policy to allow fronted to call endpoint from backend

## Frontend
- Create Navigation bar
- Create basic skeleton for Home Page
- Create User Profile page
- Set up frontend folder structure with Next.js
- Hook up the frontend for login signup page to call endpoint from backend
- Create UserContext to hold the currently authenticated user
- Create a button in Pet Profile and user Profile to allow uploading avatar picture. Hook up with backend to call the endpoint and store the picture in Firebase Storage
  
## Testing
- Add 23 tests for testing backend endpoints raising test coverage by 20%
  
# Anh Pham
## Backend
- Updated CRUD API endpoints for user (after changing database schema and model)
- User model
- User login/logout
- Connect Vet and Pet function 
- Updated CRUD API endpoints for pet health

## Testing
- Added 62 tests for tesing backend endpoints (go over all functions)
- Added all frontend tests 
  
# Sowrathi Somasundaram
- Pet Owner Landing/Home Page Frontend
- Pet Overview Feature
- Pet Profile Feature
- Add Pet Feature
- Calendar Frontend
- Vet Home Page(Pet Overview + Pet Profile)
  
# Trung Nguyen
## Backend
- Implement pet model, event model, reminder model, health model
- Develop endpoints for CRUD operations on pets
- Create API endpoints to get events by pet, get events by status, create event for vet, update event, and delete event
- Create API endpoints to get reminders, create reminder, update reminder, delete reminder

## Frontend
- Integrate Calendar Feature
- Add filter events on Calendar by Pet
- Integrate Reminder Feature
- Designe a form allowing pet owners to either create new reminders or retrieve existing events directly from the calendar
- Integrate User Profile Feature

## CI/CD
- Configured a GitHub Actions workflow to automate code quality checks, ensuring error-free code before integration

## Documents
- Authored a comprehensive development document to assist team members in setting up the codebase
- Included step-by-step instructions on the processes to follow before merging code into the main branch

# Willy Chen

## Frontend
- Designed the UI for Reminders and implemented a delete reminders function
- Designed the UI for Login and Signup pages
- Designed an animated loading page
- Organized the Codebase by breaking down React omponents down into smaller reusable components
- Created the matchmaking page that fetches from the db a list of pets that the user's pets can potentially match with,
  a list of incoming match requests, and a list of pets already matched;
  And implemented match/accept/reject/remove functions, allowing the user to send match requests to another user's pet, accept/reject an incoming request, and remove a current match
- Implemented filtering matchmaker, allowing the user to filter the rendered list of pets by breed, age, and/or tags.
