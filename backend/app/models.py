from datetime import datetime
from sqlalchemy import Integer, String, Column, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from .database import Base

#designing user tabel
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index= True)
    full_name = Column(String, nullable= False)
    username = Column(String, unique= True, index= True,nullable=False)
    email = Column(String, unique= True, nullable= False, index= True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default= datetime.utcnow)

    profiles = relationship("Profile", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")

#designing profie table
class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index= True)
    user_id = Column(Integer, ForeignKey("users.id"),nullable= False)
    profile_name = Column(String,nullable=False)
    profile_type = Column(String,nullable=False)
    created_at = Column(DateTime, default= datetime.utcnow)

    user = relationship("User", back_populates="profiles")
    expenses = relationship("Expense", back_populates="profile", cascade="all, delete-orphan")

#designing profie table

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index= True)
    user_id = Column(Integer, ForeignKey("users.id"),nullable= False)
    profile_id = Column(Integer, ForeignKey("profiles.id"),nullable= False)
    title = Column(String,nullable=False)
    category = Column(String,nullable=False)
    payment_mode = Column(String,nullable=False)
    actual_amount = Column(Float,nullable=False)
    received_amount = Column(Float,nullable=True,default= 0)
    expense_date = Column(Date, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default= datetime.utcnow)

    user = relationship("User", back_populates="expenses")
    profile = relationship("Profile", back_populates="expenses")