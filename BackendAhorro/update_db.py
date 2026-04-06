# update_db.py
import sqlite3

conn = sqlite3.connect('instance/ahorro_facil.db')
cursor = conn.cursor()

# Verificar columnas actuales
cursor.execute("PRAGMA table_info(user)")
columnas = cursor.fetchall()
print("Columnas actuales:", [(c[1], c[2]) for c in columnas])

# Agregar columna saldo si no existe
saldo_existe = any(c[1] == 'saldo' for c in columnas)
if not saldo_existe:
    cursor.execute("ALTER TABLE user ADD COLUMN saldo REAL DEFAULT 0")
    print("✅ Columna 'saldo' agregada")
else:
    print("⚠️ Columna 'saldo' ya existe")

# Agregar columna foto_perfil si no existe
foto_existe = any(c[1] == 'foto_perfil' for c in columnas)
if not foto_existe:
    cursor.execute("ALTER TABLE user ADD COLUMN foto_perfil TEXT")
    print("✅ Columna 'foto_perfil' agregada")
else:
    print("⚠️ Columna 'foto_perfil' ya existe")

# Actualizar saldo del usuario existente
cursor.execute("UPDATE user SET saldo = 500 WHERE email = 'admin@gmail.com'")
print("✅ Saldo actualizado a 500 para admin@gmail.com")

conn.commit()
conn.close()
print("\n✅ Base de datos actualizada correctamente")