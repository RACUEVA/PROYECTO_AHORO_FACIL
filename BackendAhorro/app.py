import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models_user import db, User 
# 1. IMPORTAMOS JWT
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN JWT ---
app.config['JWT_SECRET_KEY'] = 'clave-secreta-del-ingeniero-julio' # Cambia esto por algo seguro
jwt = JWTManager(app)

# --- CONFIGURACIÓN DE BASE DE DATOS ---
instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "ahorro_facil.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# --- RUTAS ---

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username') or data.get('fullName')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "El correo ya está registrado"}), 400

    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "¡Registro exitoso!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()

    if user and user.password == data.get('password'):
        # 2. GENERAMOS EL TOKEN
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Bienvenido",
            "token": access_token, # Enviamos el token al celular
            "user": {"username": user.username, "email": user.email}
        }), 200
    
    return jsonify({"message": "Credenciales incorrectas"}), 401

# 3. ENDPOINT PROTEGIDO (Punto B y C del taller)
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    # Solo llega aquí si el token es válido
    user_id = get_jwt_identity()
    return jsonify({
        "message": "Acceso concedido al endpoint protegido",
        "user_id": user_id,
        "status": "success"
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)