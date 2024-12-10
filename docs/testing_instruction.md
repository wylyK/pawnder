### Backend
- Go into backend folder `cd backend`
- Run test
  - Mac: `PYTHONPATH=$(pwd) pytest tests` 
  - Window `$env:PYTHONPATH = (Get-Location).Path; pytest` 

### Frontend
- Go to frontend folder `cd frontend`
- In tsconfig.js, change to "jsx": "react-jsx" (the original value is "preserve"). - - Each time you run `npm run dev`, the value will be changed back to "preserve". So, remember to change it to "react-jsx" when testing.
- Run test `npx jest tests`
