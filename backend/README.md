# culturelens backend

python fastapi backend for ai conversation analysis

## setup

### 1. install dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # on windows: venv\Scripts\activate
pip install -r requirements-dev.txt
```

### 2. environment variables

```bash
cp .env.example .env
# edit .env with your api keys
```

### 3. run development server

```bash
uvicorn app.main:app --reload --port 8000
```

api will be available at:
- http://localhost:8000
- docs: http://localhost:8000/docs
- redoc: http://localhost:8000/redoc

## linting & formatting

```bash
# check linting
ruff check .

# auto-fix linting issues
ruff check . --fix

# format code
ruff format .

# check formatting without changing files
ruff format . --check
```

## testing

```bash
pytest
```

## api endpoints

### health
- `GET /health` - health check
- `GET /health/ready` - readiness check

### sessions (v1)
- `POST /api/v1/sessions` - created new session
- `GET /api/v1/sessions` - list all sessions
- `GET /api/v1/sessions/{id}` - get session by id
- `DELETE /api/v1/sessions/{id}` - delete session

## project structure

```
backend/
├── app/
│   ├── api/            # api route handlers
│   ├── core/           # config & settings
│   ├── models/         # pydantic schemas
│   ├── services/       # business logic
│   └── main.py         # app entry point
├── tests/              # pytest tests
├── pyproject.toml      # python project config
└── requirements.txt    # dependencies
```
