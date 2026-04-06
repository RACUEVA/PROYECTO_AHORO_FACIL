from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    saldo = db.Column(db.Float, default=0)  # ← AGREGAR ESTA LÍNEA


# models.py - Agregar estos modelos

class Movimiento(db.Model):
    __tablename__ = 'movimientos'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    monto = db.Column(db.Float, nullable=False)
    descripcion = db.Column(db.String(200), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'Ingreso' o 'Egreso'
    fecha = db.Column(db.String(50), nullable=False)
    foto = db.Column(db.String(500), nullable=True)
    ubicacion = db.Column(db.String(200), nullable=True)
    sincronizado = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relación con Usuario
    usuario = db.relationship('User', backref=db.backref('movimientos', lazy=True))

class Deuda(db.Model):
    __tablename__ = 'deudas'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    monto = db.Column(db.Float, nullable=False)
    descripcion = db.Column(db.String(200), nullable=False)
    pagada = db.Column(db.Boolean, default=False)
    sincronizado = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relación con Usuario
    usuario = db.relationship('User', backref=db.backref('deudas', lazy=True))    