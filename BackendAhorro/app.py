import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

# ========== INICIALIZAR APP ==========
app = Flask(__name__)

# CORS - Permitir conexiones desde cualquier origen
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuración JWT
app.config['JWT_SECRET_KEY'] = 'clave-secreta-del-ingeniero-julio'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)

# Configuración de Base de Datos
instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
os.makedirs(instance_path, exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "ahorro_facil.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ========== MODELOS ==========

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    saldo = db.Column(db.Float, default=0)
    foto_perfil = db.Column(db.String(500), nullable=True)

class Movimiento(db.Model):
    __tablename__ = 'movimientos'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    monto = db.Column(db.Float, nullable=False)
    descripcion = db.Column(db.String(200), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    fecha = db.Column(db.String(50), nullable=True)
    foto = db.Column(db.String(500), nullable=True)
    ubicacion = db.Column(db.String(200), nullable=True)

class Deuda(db.Model):
    __tablename__ = 'deudas'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    monto = db.Column(db.Float, nullable=False)
    descripcion = db.Column(db.String(200), nullable=False)
    pagada = db.Column(db.Boolean, default=False)

# Crear tablas
with app.app_context():
    db.create_all()
    print("✅ Base de datos inicializada correctamente")

# ========== ENDPOINTS DE AUTH ==========

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    print(f"📝 Registro intento: {data}")
    
    # Verificar si el correo ya existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "El correo ya está registrado"}), 400
    
    # Verificar si el nombre de usuario ya existe
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "El nombre de usuario ya está registrado"}), 400

    user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        saldo=data.get('presupuesto', 0)
    )
    db.session.add(user)
    db.session.commit()
    print(f"✅ Usuario creado: {user.email}")
    return jsonify({"message": "Usuario creado exitosamente"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    print(f"📝 Login intento: {data}")
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        print(f"❌ Usuario no encontrado: {data['email']}")
        return jsonify({"message": "Usuario no encontrado"}), 404
    
    print(f"👤 Usuario encontrado: {user.username}")
    
    if user and user.password == data['password']:
        print("✅ Contraseña correcta")
        token = create_access_token(identity=str(user.id))
        return jsonify({
            "token": token,
            "user": {
                "id": user.id,
                "name": user.username,
                "email": user.email,
                "saldo": user.saldo,
                "foto_perfil": user.foto_perfil
            }
        }), 200
    else:
        print("❌ Contraseña incorrecta")
        return jsonify({"message": "Credenciales incorrectas"}), 401

# ========== ENDPOINT PARA OBTENER TODOS LOS USUARIOS ==========
@app.route('/usuarios', methods=['GET'])
def get_all_users():
    usuarios = User.query.all()
    return jsonify([{
        "id": u.id,
        "email": u.email,
        "username": u.username,
        "saldo": u.saldo,
        "password": u.password
    } for u in usuarios]), 200

# ========== ENDPOINTS DE PERFIL ==========

@app.route('/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    uid = get_jwt_identity()
    user = User.query.get(uid)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404
    return jsonify({
        "id": user.id,
        "name": user.username,
        "email": user.email,
        "saldo": user.saldo,
        "foto_perfil": user.foto_perfil
    }), 200

@app.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    uid = get_jwt_identity()
    user = User.query.get(uid)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404
    
    data = request.json
    if 'name' in data:
        user.username = data['name']
    if 'foto_perfil' in data:
        user.foto_perfil = data['foto_perfil']
    
    db.session.commit()
    return jsonify({"message": "Perfil actualizado"}), 200

@app.route('/user/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    uid = get_jwt_identity()
    user = User.query.get(uid)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Cuenta eliminada"}), 200

# ========== ENDPOINTS DE MOVIMIENTOS ==========

@app.route('/movimientos', methods=['GET'])
@jwt_required()
def get_movimientos():
    uid = get_jwt_identity()
    movimientos = Movimiento.query.filter_by(usuario_id=uid).all()
    return jsonify([{
        "id": m.id,
        "monto": m.monto,
        "descripcion": m.descripcion,
        "tipo": m.tipo,
        "fecha": m.fecha,
        "foto": m.foto,
        "ubicacion": m.ubicacion
    } for m in movimientos]), 200

@app.route('/movimientos', methods=['POST'])
@jwt_required()
def create_movimiento():
    uid = get_jwt_identity()
    data = request.json
    print(f"📝 Nuevo movimiento: {data}")
    
    user = User.query.get(uid)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    if data['tipo'] == 'Ingreso':
        user.saldo += data['monto']
        print(f"💰 Ingreso: +{data['monto']}. Nuevo saldo: {user.saldo}")
    else:
        if data['monto'] > user.saldo:
            return jsonify({"message": "Saldo insuficiente"}), 400
        user.saldo -= data['monto']
        print(f"💸 Egreso: -{data['monto']}. Nuevo saldo: {user.saldo}")

    movimiento = Movimiento(
        usuario_id=uid,
        monto=data['monto'],
        descripcion=data['descripcion'],
        tipo=data['tipo'],
        fecha=data.get('fecha', ''),
        foto=data.get('foto'),
        ubicacion=data.get('ubicacion')
    )

    db.session.add(movimiento)
    db.session.commit()

    return jsonify({"nuevo_saldo": user.saldo}), 201

# ========== ENDPOINTS DE DEUDAS ==========

@app.route('/deudas', methods=['GET'])
@jwt_required()
def get_deudas():
    uid = get_jwt_identity()
    deudas = Deuda.query.filter_by(usuario_id=uid, pagada=False).all()
    return jsonify([{
        "id": d.id,
        "monto": d.monto,
        "descripcion": d.descripcion
    } for d in deudas]), 200

@app.route('/deudas', methods=['POST'])
@jwt_required()
def create_deuda():
    uid = get_jwt_identity()
    data = request.json
    print(f"📝 Nueva deuda: {data}")
    
    deuda = Deuda(
        usuario_id=uid,
        monto=data['monto'],
        descripcion=data['descripcion']
    )
    db.session.add(deuda)
    db.session.commit()
    return jsonify({"message": "Deuda creada"}), 201

@app.route('/deudas/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_deuda(id):
    uid = get_jwt_identity()
    deuda = Deuda.query.filter_by(id=id, usuario_id=uid).first()
    if not deuda:
        return jsonify({"message": "Deuda no encontrada"}), 404
    
    db.session.delete(deuda)
    db.session.commit()
    return jsonify({"message": "Deuda eliminada"}), 200

# ========== ENDPOINT DE PRUEBA ==========
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong", "status": "ok"}), 200

# ========== INICIAR SERVIDOR ==========
if __name__ == '__main__':
    print("🚀 Servidor Flask iniciado en http://0.0.0.0:5000")
    print("📋 Endpoints disponibles:")
    print("   POST   /register")
    print("   POST   /login")
    print("   GET    /usuarios")
    print("   GET    /user/profile")
    print("   PUT    /user/profile")
    print("   DELETE /user/account")
    print("   GET    /movimientos")
    print("   POST   /movimientos")
    print("   GET    /deudas")
    print("   POST   /deudas")
    print("   DELETE /deudas/<id>")
    print("   GET    /ping")
    
    app.run(host='0.0.0.0', port=5000, debug=False)