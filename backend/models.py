from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    lastname = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default="patient")

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codDoc = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(200), nullable=False) 
 
    
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    doctor_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(50))

class Availability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=lunedì
    start_time = db.Column(db.String(5), nullable=False) # "09:00"
    end_time = db.Column(db.String(5), nullable=False)   # "17:00"

class TimeOff(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.String(10))  # 2026-04-01
    end_date = db.Column(db.String(10))    # 2026-04-10