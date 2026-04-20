from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional

class UserCreate(BaseModel):
    full_name : str
    username : str
    email : EmailStr
    password : str

class UserLogin(BaseModel):
    login : str
    password : str

class UserResponse(BaseModel):
    id : int
    full_name : str
    username : str
    email : EmailStr

    class Config:
        from_attributes=True

class ProfileCreate(BaseModel):
    profile_name : str
    profile_type : str

class ProfileResponse(BaseModel):
    id : int
    profile_name : str
    profile_type : str

    class Config:
        from_attributes=True
    
class ExpenseCreate(BaseModel):
    profile_id : int
    title : str
    category : str
    payment_mode : str
    actual_amount : float
    received_amount : Optional[float] = 0
    expense_date : date
    notes : Optional[str] = None

class ExpenseResponse(BaseModel):
    id: int   # 👈 ADD THIS
    profile_id: int
    title: str
    category: str
    payment_mode: str
    actual_amount: float
    received_amount: float
    expense_date: date
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class ExpenseUpdate(BaseModel):
    received_amount: float


