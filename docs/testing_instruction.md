### Backend

- Move into the backend folder and run `PYTHONPATH=$(pwd) pytest tests` (for Mac)
- Move into backend and run `$env:PYTHONPATH = (Get-Location).Path; pytest` (for Window powershell)
- This command will run all current tests cases
- As of now, there are 6 different test files correspond to 6 API files

### Frontend

- Move into the frontend folder and run `npx jest tests/components`
