### Backend

- Move into the backend folder and run `PYTHONPATH=$(pwd) pytest tests` (for Mac)
- Move into backend and run `$env:PYTHONPATH = (Get-Location).Path; pytest` (for Window powershell)
- This command will run all current tests cases
- As of now, there are 6 different test files correspond to 6 API files
- We use pytest for these tests

### Frontend

- Move into the frontend folder 
- In `tsconfig.js`, change "jsx": "react-jsx" (the original value is "preserve"). Each time you run `npm run dev`, the value will be changed back to "preserve". So, remember to change it to "react-jsx" when testing.
- Run `npx jest tests/components`

