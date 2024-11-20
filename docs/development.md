# Development

Get start with developing Pawnder.

## Install dependencies

### Frontend

This app uses `npm` for frontend development. To install dependencies, go the the frontend directory of the project and use the following command:

```sh
# Install dependencies
npm install
```

### Backend

This app uses `pip` for backend development. To install dependencies, go the the backend directory of the project and use the following command:

```sh
# Install dependencies
pip install -r requirements.txt
```

## Setup backend

This project uses Flask for the backend. You need to create a virtual environment to manage dependencies and run the backend.

### 1. Install `virtualenv`

First, you need to install the `virtualenv` package:

```sh
pip install virtualenv
```

### 2. Create new Virtural Environment

```sh
python -m venv ${VIRTUAL_ENV_NAME}
```

```sh
python -m venv venv
```

If the virtual environment name is different from venv, add it to the `.env` file for consistency.

### 3. Activate virtualenv

```Window
${VIRTUAL_ENV_NAME}\Scripts\activate
```

```Mac
source ${VIRTUAL_ENV_NAME}/bin/activate
```

## Run development mode

To begin running development mode:

### Frontend:

```sh
npm run dev
```

### Backend:

```sh
flask run
```

If live reloading isn’t working

```sh
flask --app app run --debug
```

## Development workflow

Before starting your work, create a new branch (or an issue, then create a branch for it). Run:
Run `git fetch origin`
Run `git checkout -b ${YOUR_NEW_BRANCH}`
Ensure all dependencies are installed in the respective frontend and backend directories

As you (and other developers) make changes to the code base, there are some steps you should do before create a pull request (PR). At the directory of the project, run the following command to format code consistently: `npx prettier . --write`. Currently, CI/CD workflows are configured to check CSS formatting, TypeScript formatting, indentation, and syntax in the frontend.

Then, run `git add .` to stage your changes
Next, run `git commit -m ${YOUR_MESSAGE}` to commit with a descriptive message
Next, run `git pull origin main`
Next, run `git push origin ${YOUR_BRANCH}`

Before merging, request a code review from other team members to ensure code quality and alignment with project standards.
