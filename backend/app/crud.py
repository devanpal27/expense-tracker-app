from sqlalchemy.orm import Session
from . import models
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated = "auto")

def hash_password(password : str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password,hashed_password)

def get_user_by_email(db:Session, email :str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db:Session, username :str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db:Session, user):
    hashed_password = hash_password(user.password)

    db_user = models.User(
        full_name = user.full_name,
        username = user.username,
        email = user.email,
        password_hash = hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db:Session, login:str, password:str):
    if '@' in login:
        user = get_user_by_email(db,login)
    else:
        user = get_user_by_username(db,login)
    
    if not user:
        return None
    
    if not verify_password (password , user.password_hash):
        return None
    
    return user

def create_profile(db: Session, user_id: int, profile):
    db_profile = models.Profile(
        user_id =user_id,
        profile_name = profile.profile_name,
        profile_type = profile.profile_type
    )

    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def get_profile(db:Session, user_id: int):
    return db.query(models.Profile).filter(models.Profile.user_id == user_id).all()

def create_expense(db: Session, user_id: int, expense):
    db_expense = models.Expense(
        user_id =user_id,
        profile_id = expense.profile_id,
        title = expense.title,
        category = expense.category,
        payment_mode = expense.payment_mode,
        actual_amount = expense.actual_amount,
        received_amount = expense.received_amount,
        expense_date = expense.expense_date,
        notes = expense.notes
    )

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_expenses(db : Session, user_id : int):
    return db.query(models.Expense).filter(models.Expense.user_id == user_id).all()

def update_expense_received_amount(db, expense_id: int, received_amount: float):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    if not expense:
        return None

    expense.received_amount = received_amount
    db.commit()
    db.refresh(expense)
    return expense

