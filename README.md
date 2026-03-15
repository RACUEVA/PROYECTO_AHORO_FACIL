# 📱 AhorroFácil - Sistema Integral de Gestión Financiera

¡Bienvenido a **AhorroFácil**! Este proyecto es una solución Full Stack diseñada para ayudar a los usuarios a tomar el control de sus finanzas personales a través de una aplicación móvil segura, intuitiva y robusta.

---

## 🏗️ Arquitectura del Proyecto (Monorepo)

El proyecto utiliza una estructura de **Monorepo** para mantener sincronizados el cliente y el servidor:

* **`ahorrofacilmobile/`**: Aplicación móvil multiplataforma.
* **`Backendahorro/`**: API REST centralizada y gestión de base de datos.



---

## 🛠️ Tecnologías Utilizadas

### Frontend (Móvil)
* **Framework:** React Native (Expo)
* **Lenguaje:** TypeScript
* **Validación:** [Zod](https://zod.dev/) para esquemas de datos.
* **Estado y Efectos:** Hooks (`useState`, `useEffect`) con implementación de **Debounce** para optimizar llamadas a la API.

### Backend (Servidor)
* **Framework:** Flask (Python)
* **Base de Datos:** SQLite con SQLAlchemy.
* **Seguridad:** Validaciones de servidor (Error 400 por duplicidad) y CORS habilitado para comunicación móvil.

---

## 🔒 Características de Seguridad y UX

El proyecto se basa en tres pilares fundamentales que demuestro en el código:

1.  **Bienvenida (Onboarding):** Flujo dinámico de introducción para el usuario.
2.  **Seguridad Garantizada (Doble Validación):**
    * **Lado del Cliente:** Uso de **Zod** en `App.tsx` para validar formatos de email y fuerza de contraseñas antes del envío.
    * **Lado del Servidor:** Lógica en `app.py` que verifica la integridad de la base de datos y evita registros duplicados.
3.  **Control Total:** Dashboard con visualización de saldos y manejo de sesiones con alertas de confirmación nativas.

---

## 🚀 Instalación y Uso

### 1. Requisitos Previos
* Python 3.x instalado.
* Node.js y npm instalados.
* Expo Go en tu dispositivo móvil o emulador Android (usando IP `10.0.2.2`).

### 2. Configurar el Backend
```bash
cd Backendahorro
pip install flask flask-cors flask-sqlalchemy
python app.py
