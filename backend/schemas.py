from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# For creating a user
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# For reading user data (without password)
class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True # Changed from orm_mode = True

# For login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# For token response
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None 