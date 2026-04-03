from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from flask_cors import CORS
from functools import wraps
from models import db, User, Doctor, Appointment, Availability, TimeOff
from datetime import datetime, timedelta
import os

app = Flask(__name__)

# CONFIG
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['JWT_SECRET_KEY'] = 'SC_RE_CL_MedBookingApp_12345_SUPER_SECRET_KEY_56789'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# INIT
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# =========================
# INIT DB
# =========================
with app.app_context():
    db.create_all()

    if not User.query.filter_by(username="admin").first():
        admin = User(
            username="admin",
            password=bcrypt.generate_password_hash("1234").decode('utf-8'),
            name="Admin",
            lastname="Admin",
            role="admin"
        )
        db.session.add(admin)

    if not Doctor.query.first():
        db.session.add_all([
            Doctor(
                codDoc="drRossi",
                name="Rossi Mario",
                specialization="Cardiologia",
                password=bcrypt.generate_password_hash("1234").decode('utf-8')
            ),
            Doctor(
                codDoc="drVioli",
                name="Violi Viola",
                specialization="Psicologia",
                password=bcrypt.generate_password_hash("1234").decode('utf-8')
            ),
            Doctor(
                codDoc="drFiori",
                name="Fiori Fiorella",
                specialization="Dermatologia",
                password=bcrypt.generate_password_hash("1234").decode('utf-8')
            )
        ])
        db.session.commit()

    db.session.commit()

# =========================
# ROLE DECORATOR
# =========================
def role_required(role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") != role:
                return jsonify({"msg": "Accesso negato"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# =========================
# AUTH
# =========================
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"msg": "Dati mancanti"}), 400

    required_fields = ["name", "lastname", "username", "password"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"msg": f"Campo mancante: {field}"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "Username già esistente"}), 400

    user = User(
        name=data['name'],
        lastname=data['lastname'],
        username=data['username'],
        password=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
        role="patient"
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "Utente registrato"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"msg": "Username e password obbligatori"}), 400

    user = User.query.filter_by(username=data['username']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "role": user.role,
                "user_id": user.id
            }
        )

        return jsonify({
            "token": token,
            "role": user.role,
            "nomeUtenza": user.name,
            "cognUtenza": user.lastname
        }), 200

    return jsonify({"msg": "Credenziali errate"}), 401


@app.route('/doctor/login', methods=['POST'])
def doctor_login():
    data = request.get_json()

    if not data or not data.get("codDoc") or not data.get("password"):
        return jsonify({"msg": "Codice dottore e password obbligatori"}), 400

    doctor = Doctor.query.filter_by(codDoc=data['codDoc']).first()

    if doctor and bcrypt.check_password_hash(doctor.password, data['password']):
        token = create_access_token(
            identity=str(doctor.id),
            additional_claims={
                "role": "doctor",
                "doctor_id": doctor.id
            }
        )

        return jsonify({
            "token": token,
            "role": "doctor",
            "name": doctor.name
        }), 200

    return jsonify({"msg": "Credenziali errate"}), 401

# =========================
# DOCTORS
# =========================
@app.route('/doctors', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()

    return jsonify([
        {
            "id": d.id,
            "name": d.name,
            "specialization": d.specialization
        } for d in doctors
    ]), 200

# =========================
# SLOT GENERATION
# =========================
@app.route('/doctor/<int:doctor_id>/slots', methods=['GET'])
def get_slots(doctor_id):
    date_str = request.args.get("date")

    if not date_str:
        return jsonify({"msg": "Parametro date mancante"}), 400

    date = datetime.strptime(date_str, "%Y-%m-%d")

    availability = Availability.query.filter_by(
        doctor_id=doctor_id,
        day_of_week=date.weekday()
    ).first()

    time_off = TimeOff.query.filter(
        TimeOff.doctor_id == doctor_id,
        TimeOff.start_date <= date_str,
        TimeOff.end_date >= date_str
    ).first()

    if time_off or not availability:
        return jsonify([]), 200

    booked_appointments = Appointment.query.filter(
        Appointment.doctor_id == doctor_id,
        Appointment.date.like(f"{date_str}%")
    ).all()

    booked_slots = [a.date for a in booked_appointments]

    slots = []
    start = datetime.strptime(availability.start_time, "%H:%M")
    end = datetime.strptime(availability.end_time, "%H:%M")

    while start < end:
        slot = f"{date_str} {start.strftime('%H:%M')}"
        if slot not in booked_slots:
            slots.append(slot)
        start += timedelta(minutes=30)

    return jsonify(slots), 200

# =========================
# APPOINTMENTS (PATIENT)
# =========================
@app.route('/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    data = request.get_json()
    claims = get_jwt()
    user_id = claims.get("user_id")
    role = claims.get("role")

    if role != "patient":
        return jsonify({"msg": "Non autorizzato"}), 403

    exists = Appointment.query.filter_by(
        doctor_id=data['doctor_id'],
        date=data['date']
    ).first()

    if exists:
        return jsonify({"msg": "Slot occupato"}), 400

    new_appointment = Appointment(
        user_id=user_id,
        doctor_id=data['doctor_id'],
        date=data['date']
    )

    db.session.add(new_appointment)
    db.session.commit()

    return jsonify({"msg": "Prenotato"}), 201


@app.route('/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    claims = get_jwt()
    user_id = claims.get("user_id")
    role = claims.get("role")

    if role != "patient":
        return jsonify({"msg": "Non autorizzato"}), 403

    appointments = Appointment.query.filter_by(user_id=user_id).all()

    result = []
    for a in appointments:
        doctor = Doctor.query.get(a.doctor_id)
        result.append({
            "id": a.id,
            "date": a.date,
            "doctor_name": doctor.name if doctor else "N/D",
            "specialization": doctor.specialization if doctor else "N/D"
        })

    return jsonify(result), 200


@app.route('/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    claims = get_jwt()
    role = claims.get("role")
    doctor_id = claims.get("doctor_id")
    user_id = claims.get("user_id")

    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({"msg": "Appuntamento non trovato"}), 404

    if role == "doctor":
        if appointment.doctor_id != doctor_id:
            return jsonify({"msg": "Non autorizzato"}), 403
    elif role == "patient":
        if appointment.user_id != user_id:
            return jsonify({"msg": "Non autorizzato"}), 403
    elif role != "admin":
        return jsonify({"msg": "Non autorizzato"}), 403

    db.session.delete(appointment)
    db.session.commit()

    return jsonify({"msg": "Appuntamento eliminato"}), 200

# =========================
# DOCTOR APPOINTMENTS
# =========================
@app.route('/doctor/appointments', methods=['GET'])
@jwt_required()
@role_required("doctor")
def doctor_appointments():
    claims = get_jwt()
    doctor_id = claims.get("doctor_id")

    appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()

    result = []
    for a in appointments:
        user = User.query.get(a.user_id)
        result.append({
            "id": a.id,
            "date": a.date,
            "patient": f"{user.name} {user.lastname}" if user else "N/D"
        })

    return jsonify(result), 200

# =========================
# ADMIN
# =========================
@app.route('/admin/stats', methods=['GET'])
@jwt_required()
@role_required("admin")
def admin_stats():
    return jsonify({
        "users": User.query.filter(User.role == "patient").count(),
        "doctors": Doctor.query.count(),
        "appointments": Appointment.query.count()
    }), 200


@app.route('/admin/users', methods=['GET'])
@jwt_required()
@role_required("admin")
def admin_get_users():
    users = User.query.filter(User.role == "patient").all()

    return jsonify([
        {
            "id": u.id,
            "name": u.name,
            "lastname": u.lastname,
            "username": u.username,
            "role": u.role
        }
        for u in users
    ]), 200


@app.route('/admin/doctors', methods=['GET'])
@jwt_required()
@role_required("admin")
def admin_get_doctors():
    doctors = Doctor.query.all()

    return jsonify([
        {
            "id": d.id,
            "name": d.name,
            "specialization": d.specialization
        } for d in doctors
    ]), 200


@app.route('/admin/doctors', methods=['POST'])
@jwt_required()
@role_required("admin")
def admin_create_doctor():
    data = request.json

    if not data.get("codDoc") or not data.get("name") or not data.get("specialization"):
        return jsonify({"msg": "Campi mancanti"}), 400

    if Doctor.query.filter_by(codDoc=data["codDoc"]).first():
        return jsonify({"msg": "Codice dottore già esistente"}), 400

    doctor = Doctor(
        codDoc=data["codDoc"],
        name=data["name"],
        specialization=data["specialization"],
        password=bcrypt.generate_password_hash("1234").decode('utf-8')
    )

    db.session.add(doctor)
    db.session.commit()

    return jsonify({"msg": "Doctor creato"}), 201


@app.route('/admin/appointments', methods=['GET'])
@jwt_required()
@role_required("admin")
def admin_get_appointments():
    appointments = Appointment.query.all()

    result = []
    for a in appointments:
        doctor = Doctor.query.get(a.doctor_id)
        user = User.query.get(a.user_id)

        result.append({
            "id": a.id,
            "date": a.date,
            "doctor": doctor.name if doctor else "N/D",
            "patient": f"{user.name} {user.lastname}" if user else "N/D"
        })

    return jsonify(result), 200


@app.route('/admin/availability', methods=['POST'])
@jwt_required()
@role_required("admin")
def add_availability():
    data = request.json

    availability = Availability(
        doctor_id=data['doctor_id'],
        day_of_week=data['day'],
        start_time=data['start'],
        end_time=data['end']
    )

    db.session.add(availability)
    db.session.commit()

    return jsonify({"msg": "Disponibilità salvata"}), 201


@app.route('/admin/timeoff', methods=['POST'])
@jwt_required()
@role_required("admin")
def add_timeoff():
    data = request.json

    t = TimeOff(
        doctor_id=data['doctor_id'],
        start_date=data['start'],
        end_date=data['end']
    )

    db.session.add(t)
    db.session.commit()

    return jsonify({"msg": "Ferie salvate"}), 201


@app.route('/admin/doctors/summary', methods=['GET'])
@jwt_required()
@role_required("admin")
def admin_doctors_summary():
    doctors = Doctor.query.all()
    result = []

    for d in doctors:
        availabilities = Availability.query.filter_by(doctor_id=d.id).all()
        timeoffs = TimeOff.query.filter_by(doctor_id=d.id).all()

        result.append({
            "id": d.id,
            "codDoc": d.codDoc,
            "name": d.name,
            "specialization": d.specialization,
            "availabilities": [
                {
                    "id": a.id,
                    "day_of_week": a.day_of_week,
                    "start_time": a.start_time,
                    "end_time": a.end_time
                }
                for a in availabilities
            ],
            "timeoffs": [
                {
                    "id": t.id,
                    "start_date": t.start_date,
                    "end_date": t.end_date
                }
                for t in timeoffs
            ]
        })

    return jsonify(result), 200

@app.route('/admin/availability/<int:availability_id>', methods=['DELETE'])
@jwt_required()
@role_required("admin")
def delete_availability(availability_id):
    availability = Availability.query.get(availability_id)

    if not availability:
        return jsonify({"msg": "Disponibilità non trovata"}), 404

    db.session.delete(availability)
    db.session.commit()

    return jsonify({"msg": "Disponibilità eliminata"}), 200


@app.route('/admin/timeoff/<int:timeoff_id>', methods=['DELETE'])
@jwt_required()
@role_required("admin")
def delete_timeoff(timeoff_id):
    timeoff = TimeOff.query.get(timeoff_id)

    if not timeoff:
        return jsonify({"msg": "Periodo ferie non trovato"}), 404

    db.session.delete(timeoff)
    db.session.commit()

    return jsonify({"msg": "Ferie eliminate"}), 200

if __name__ == '__main__':
    app.run(debug=True)