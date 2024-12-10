### Backend
- Go into backend folder `cd backend`
- Run test
  - Mac: `PYTHONPATH=$(pwd) pytest tests` 
  - Window `$env:PYTHONPATH = (Get-Location).Path; pytest` 
- After running the test you will see this
  ![image](https://github.com/user-attachments/assets/3ce7fbe6-7669-4f93-ae36-63fc4a2dff01)

### Frontend
- Go to frontend folder `cd frontend`
- In tsconfig.js, change to "jsx": "react-jsx" (the original value is "preserve"). - - Each time you run `npm run dev`, the value will be changed back to "preserve". So, remember to change it to "react-jsx" when testing.
- Run test `npx jest tests`
- After running test you will see this
![image](https://github.com/user-attachments/assets/af6dded9-4657-46e7-b8d7-cb8b10237177)
