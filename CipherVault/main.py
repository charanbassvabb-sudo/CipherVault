import os
import mysql.connector
from mysql.connector import errorcode

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select, Relationship
from cryptography.fernet import Fernet
from typing import Optional, List
from pydantic import BaseModel, constr, validator

# ---------- Database Setup & Auto-Creation ----------
DB_NAME = "cipher_vault"
DB_USER = "root"
DB_PASSWORD = "*Charan987"
DB_HOST = "localhost"

def create_database_if_not_exists():
    try:
        conn = mysql.connector.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' is ready.")
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Error creating database: {err}")

create_database_if_not_exists()

# ---------- Database URL and Engine ----------
DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

# ---------- FastAPI App Setup ----------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Encryption Setup ----------
SECRET_KEY = os.getenv("ENCRYPTION_KEY", "9wQhebj6TZ4lev_Ofcf3Wv1vMExAszRtuuGHgtDFjCA=")
cipher = Fernet(SECRET_KEY.encode())

# ---------- Database Models ----------
class UserPassword(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    password_id: int = Field(foreign_key="storedpassword.id")

    user: Optional["User"] = Relationship(back_populates="user_passwords")
    stored_password: Optional["StoredPassword"] = Relationship(back_populates="user_passwords")


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    password: str

    user_passwords: List["UserPassword"] = Relationship(back_populates="user")


class StoredPassword(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password: str
    website: str
    username: str

    user_passwords: List["UserPassword"] = Relationship(back_populates="stored_password")

# ---------- Pydantic Models ----------
from pydantic import BaseModel, constr, validator

class UserCreateRequest(BaseModel):
    username: constr(strip_whitespace=True, min_length=1)
    password: constr(strip_whitespace=True, min_length=1)

    @validator("username", "password")
    def no_whitespace_only(cls, value):
        if value.strip() == "":
            raise ValueError("Fields cannot be only whitespace.")
        return value


class PasswordRequest(BaseModel):
    website: constr(strip_whitespace=True, min_length=1)
    site_username: constr(strip_whitespace=True, min_length=1)
    password: constr(strip_whitespace=True, min_length=1)

    @validator("website", "site_username", "password")
    def no_whitespace_only(cls, value):
        if value.strip() == "":
            raise ValueError("Fields cannot be only whitespace.")
        return value


# ---------- Create Tables ----------
SQLModel.metadata.create_all(engine)

# ---------- DB Session Dependency ----------
def get_session():
    with Session(engine) as session:
        yield session

# ---------- Utility Functions ----------
def encrypt_password(password: str) -> str:
    return cipher.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    return cipher.decrypt(encrypted_password.encode()).decode()

# ---------- API Routes ----------
@app.post("/users/")
def create_user(user_data: UserCreateRequest, session: Session = Depends(get_session)):
    username = user_data.username
    password = user_data.password

    existing_user = session.exec(select(User).filter(User.username == username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(username=username, password=encrypt_password(password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message": "User created successfully", "username": user.username}


@app.post("/login/")
def login(username: str, password: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).filter(User.username == username)).first()
    if not user or decrypt_password(user.password) != password:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    return {"message": "Login successful", "username": user.username}


@app.post("/users/{username}/passwords/")
def store_password(username: str, data: PasswordRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).filter(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    encrypted_password = encrypt_password(data.password)
    stored_password = StoredPassword(
        password=encrypted_password,
        website=data.website,
        username=data.site_username
    )
    session.add(stored_password)
    session.commit()
    session.refresh(stored_password)

    user_password = UserPassword(user_id=user.id, password_id=stored_password.id)
    session.add(user_password)
    session.commit()

    return {"message": "Password stored successfully"}


@app.get("/users/{username}/passwords/")
def get_stored_passwords(username: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).filter(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_passwords = session.exec(select(UserPassword).filter(UserPassword.user_id == user.id)).all()
    stored_passwords = [session.get(StoredPassword, up.password_id) for up in user_passwords]

    if not stored_passwords:
        raise HTTPException(status_code=404, detail="No passwords found for this user")

    return [
        {
            "website": stored.website,
            "username": stored.username,
            "password": decrypt_password(stored.password)
        }
        for stored in stored_passwords
    ]


@app.get("/users/{username}", response_model=User)
def get_user(username: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).filter(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.delete("/users/{username}")
def delete_user(username: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).filter(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_passwords = session.exec(select(UserPassword).filter(UserPassword.user_id == user.id)).all()
    for user_password in user_passwords:
        stored_password = session.get(StoredPassword, user_password.password_id)
        if stored_password:
            session.delete(stored_password)
        session.delete(user_password)

    session.delete(user)
    session.commit()

    return {"message": f"User '{username}' and their associated passwords have been deleted successfully"}


@app.delete("/users/{username}/passwords/")
def delete_stored_password(username: str, data: PasswordRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).filter(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_passwords = session.exec(select(UserPassword).filter(UserPassword.user_id == user.id)).all()
    stored_passwords = [session.get(StoredPassword, up.password_id) for up in user_passwords]

    stored_password = next((sp for sp in stored_passwords if sp and decrypt_password(sp.password) == data.password), None)

    if not stored_password:
        raise HTTPException(status_code=404, detail="Password not found")

    user_password = session.exec(
        select(UserPassword).filter(UserPassword.password_id == stored_password.id)
    ).first()

    if user_password:
        session.delete(user_password)
    session.delete(stored_password)
    session.commit()

    return {"message": "Password deleted successfully"}

