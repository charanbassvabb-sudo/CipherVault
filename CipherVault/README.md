# 🔐 CipherVault — Secure Password Manager

A full-stack password management system built with **FastAPI**, **MySQL**, and **Fernet symmetric encryption**. Users can register, log in, and securely store, retrieve, and delete credentials — all encrypted at rest.

Built as a final-year dissertation project at the University of Greenwich (BSc Computing & Cybersecurity, 2025). Awarded **Best Academic Student, Final Year**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI + Uvicorn |
| ORM | SQLModel (SQLAlchemy) |
| Database | MySQL |
| Encryption | Fernet (Python `cryptography` library) |
| Frontend | HTML, CSS, JavaScript |
| Server Launcher | Python Tkinter GUI (`start_server_gui.py`) |

---

## Features

- **User registration and login** with encrypted credential storage
- **Fernet symmetric encryption** — all stored passwords are encrypted at rest; plaintext never touches the database
- **Per-user vault** — credentials are linked to individual accounts via a join table
- **Full CRUD** — store, retrieve, and delete saved passwords
- **Input validation** via Pydantic models (whitespace-only inputs rejected)
- **Auto-creates the MySQL database** on first run if it doesn't exist
- **CORS enabled** for frontend integration
- **Auto-generated API docs** at `http://localhost:8000/docs` (Swagger UI)

---

## Project Structure

```
CipherVault/
├── main.py                  # FastAPI app — all routes, models, encryption logic
├── app.py                   # Fernet key generator utility
├── key.py                   # Alternative key generator script
├── start_server_gui.py      # Tkinter GUI launcher for the server
├── index.html               # Frontend — landing page
├── login.html               # Frontend — login
├── register.html            # Frontend — registration
├── vault.html               # Frontend — password vault
├── password.html            # Frontend — password management
├── profile.html             # Frontend — user profile
├── about.html               # Frontend — about page
├── scan.html                # Frontend — QR/scan feature
├── script.js                # Frontend JavaScript logic
├── styles.css               # Stylesheet
├── fonts/                   # Custom fonts
└── icons/                   # FontAwesome icon set
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- MySQL running locally (default: `localhost`, user: `root`)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/ciphervault
cd ciphervault

# Create and activate virtual environment
python -m venv .env
.env\Scripts\activate        # Windows
source .env/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Before running, set your encryption key as an environment variable (or the default hardcoded key will be used — **change this in production**):

```bash
# Generate a new key
python key.py

# Set it as an environment variable
set ENCRYPTION_KEY=your_generated_key_here       # Windows
export ENCRYPTION_KEY=your_generated_key_here    # macOS/Linux
```

Also update the database credentials in `main.py` if your MySQL setup differs:

```python
DB_USER = "root"
DB_PASSWORD = "your_password"
DB_HOST = "localhost"
```

### Run the server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.  
Swagger docs: `http://localhost:8000/docs`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/users/` | Register a new user |
| `POST` | `/login/` | Authenticate a user |
| `GET` | `/users/{username}` | Get user details |
| `DELETE` | `/users/{username}` | Delete a user and all their passwords |
| `POST` | `/users/{username}/passwords/` | Store a new credential |
| `GET` | `/users/{username}/passwords/` | Retrieve all stored credentials (decrypted) |
| `DELETE` | `/users/{username}/passwords/` | Delete a specific stored credential |

---

## Database Schema

Three tables are auto-created on startup via SQLModel:

- **`user`** — stores username and encrypted master password
- **`storedpassword`** — stores encrypted credentials (password, website, username)
- **`userpassword`** — join table linking users to their stored passwords

---

## Security Notes

- All passwords (master and stored) are encrypted using **Fernet symmetric encryption** before being written to the database
- The encryption key should be stored as an environment variable — never hardcoded in production
- Input validation is enforced via Pydantic on all endpoints
- Passwords are decrypted only at the point of retrieval and are never stored in plaintext

---

## Academic Context

**University of Greenwich** — BSc Computing & Cybersecurity (2025)  
Dissertation: *"Secure Password Management Using FastAPI & MySQL"*  
Award: Best Academic Student, Final Year  
Evaluated by the Final-Year Project Evaluation Panel

**Author:** Charan Basava — charanbassva.bb@gmail.com — Lusaka, Zambia