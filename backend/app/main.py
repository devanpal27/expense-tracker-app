from fastapi import FastAPI,Depends,HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from . import models,schemas,crud

Base.metadata.create_all(bind = engine)

app = FastAPI(title="Expense Tracker app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")

def home():
    return{"message" : "API is running"}


@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400,detail="Email already exits")
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400,detail="username already exits")
    return crud.create_user(db, user)

@app.post("/login")
def login(user: schemas.UserLogin, db: Session=Depends(get_db)):
    db_user = crud.authenticate_user(db, user.login, user.password)

    if not db_user:
        raise HTTPException(status_code=401,detail="Invalid credentials") 
    
    return{
        "message":"Login successful",
        "user_id": db_user.id
    }

@app.post("/profiles", response_model=schemas.ProfileResponse)
def create_profile(profile : schemas.ProfileCreate, user_id: int, db : Session = Depends(get_db)):
    return crud.create_profile(db,user_id,profile)

@app.get("/profiles", response_model=list[schemas.ProfileResponse])
def get_profile( user_id: int, db : Session = Depends(get_db)):
    return crud.get_profile(db,user_id)

@app.post("/expenses", response_model=schemas.ExpenseResponse)
def add_expense(expense : schemas.ExpenseCreate, user_id: int, db : Session = Depends(get_db)):
    return crud.create_expense(db,user_id,expense)

@app.get("/expenses", response_model=list[schemas.ExpenseResponse])
def read_expense( user_id: int, db : Session = Depends(get_db)):
    return crud.get_expenses(db,user_id)

@app.put("/expenses/{expense_id}", response_model=schemas.ExpenseUpdate)
def update_expense(expense_id: int, expense: schemas.ExpenseUpdate, db: Session = Depends(get_db)):
    updated_expense = crud.update_expense_received_amount(db, expense_id, expense.received_amount)

    if not updated_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    return updated_expense
@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()

    return delete_expense