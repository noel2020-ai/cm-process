# Operations Data Dashboard

Full-stack dashboard for shared-folder ingestion, PostgreSQL CRUD, SQL Server read-only access, and API-based research workflows.

## Implementation Plan

1. Scan a configured shared folder for supported spreadsheet and CSV files.
2. Preview data, validate headers and basic column quality, then load data into PostgreSQL.
3. Provide CRUD, filtering, and export operations against PostgreSQL tables.
4. Restrict SQL Server access to validated single-statement `SELECT` operations only.
5. Route research searches through approved API integrations and store results in PostgreSQL.

## Required Environment Variables

Backend:

- `APP_ENV`
- `APP_NAME`
- `API_V1_PREFIX`
- `BACKEND_HOST`
- `BACKEND_PORT`
- `FRONTEND_ORIGIN`
- `CORS_ORIGINS`
- `SHARED_FOLDER_PATH`
- `POSTGRES_URL`
- `POSTGRES_SCHEMA`
- `SQLSERVER_HOST`
- `SQLSERVER_PORT`
- `SQLSERVER_DATABASE`
- `SQLSERVER_DRIVER`
- `SQLSERVER_TRUSTED_CONNECTION`
- `SQLSERVER_USERNAME`
- `SQLSERVER_PASSWORD`
- `GOOGLE_SEARCH_API_KEY`
- `GOOGLE_SEARCH_ENGINE_ID`
- `HOOVERS_API_BASE_URL`
- `HOOVERS_API_KEY`
- `LOG_LEVEL`
- `CONFIG_YAML_PATH`

Frontend:

- `VITE_API_BASE_URL`

## Folder Structure

```text
backend/
  app/
    api/
    models/
    services/
    utils/
frontend/
  src/
    api/
    components/
    pages/
    types/
```

## Setup Commands

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

## Run Commands

### Backend Run Command

```powershell
cd backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Run Command

```powershell
cd frontend
npm run dev
```

## Sample `.env` Values

### `backend/.env`

```env
APP_ENV=development
APP_NAME=Operations Data Dashboard
API_V1_PREFIX=/api/v1
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_ORIGIN=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
SHARED_FOLDER_PATH=C:/shared/data
POSTGRES_URL=postgresql+psycopg://postgres:postgres@localhost:5432/operations_dashboard
POSTGRES_SCHEMA=public
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_DATABASE=source_db
SQLSERVER_DRIVER=ODBC Driver 18 for SQL Server
SQLSERVER_TRUSTED_CONNECTION=true
SQLSERVER_USERNAME=
SQLSERVER_PASSWORD=
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
HOOVERS_API_BASE_URL=
HOOVERS_API_KEY=
LOG_LEVEL=INFO
CONFIG_YAML_PATH=
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Basic Test Steps

1. Start PostgreSQL and ensure the target database exists.
2. Start the backend and confirm `http://localhost:8000/health` returns success.
3. Start the frontend and open `http://localhost:5173`.
4. Place `.xlsx`, `.xls`, or `.csv` files into `SHARED_FOLDER_PATH`.
5. Use the File Ingestion page to scan, preview, validate, and load a file.
6. Use the PostgreSQL page to review, search, export, create, update, and delete records.
7. Use the SQL Server page to run a valid `SELECT` and verify blocked write statements return errors.
8. Use the Research page to run a search and confirm results are stored in PostgreSQL.

## Placeholder Integrations

- Google Search requires official API credentials before live search results will work.
- The secondary research integration is implemented as a placeholder interface until official credentials and endpoint contracts are available.

## Notes

- SQL Server protection is enforced in the application by rejecting non-`SELECT` statements, comments, and multi-statement execution.
- Shared-folder file access is validated against path traversal and allowed extensions.
- Ingestion activity is logged to PostgreSQL with filename, table, row count, status, timestamp, and errors.
