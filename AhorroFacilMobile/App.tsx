import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para persistencia segura
import { NativeService } from './src/services/NativeService'; // IMPORTACIÓN DEL SERVICIO NATIVO

const API_URL = 'http://10.0.2.2:5000'; 

const registerSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Formato de correo inválido"),
  password: z.string().min(8, "La contraseña debe tener 8 caracteres").regex(/[0-9]/, "Debe incluir al menos un número"),
});

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null); 
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  
  // NUEVO ESTADO PARA LA SEMANA 13
  const [location, setLocation] = useState<any>(null);

  // 1. PERSISTENCIA: Cargar sesión al abrir la App (Punto D del taller)
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('userData');
        const token = await AsyncStorage.getItem('userToken');
        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
          console.log("Sesión restaurada con token JWT");
        }
      } catch (e) {
        console.error("Error cargando persistencia", e);
      }
    };
    loadStorageData();
  }, []);

  // 2. PROTECCIÓN: Probar acceso a ruta protegida (Punto B y C del taller)
  const testProtectedRoute = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/protected`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // Header requerido por el taller
        }
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Acceso Autorizado", data.message);
      } else {
        Alert.alert("Error de Autorización", "Token inválido o expirado");
      }
    } catch (error) {
      Alert.alert("Error", "No hay conexión con el servidor");
    }
  };

  // --- NUEVAS FUNCIONES SEMANA 13 (CAPA DE PRESENTACIÓN) ---
  
  const handleCamara = async () => {
    const fotoUri = await NativeService.tomarFoto();
    if (fotoUri) {
      console.log("Ruta de la foto: ", fotoUri);
      Alert.alert("Cámara", "Foto del recibo vinculada correctamente.");
    }
  };

  const handleUbicacion = async () => {
    const coords = await NativeService.obtenerUbicacion();
    if (coords) {
      setLocation(coords);
      Alert.alert("📍 Ubicación", `Gasto registrado en:\nLat: ${coords.latitude}\nLon: ${coords.longitude}`);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, salir", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.multiRemove(['userToken', 'userData']); // Limpiar todo
            setUser(null);
            setLocation(null); // Limpiar ubicación al salir
          } 
        }
      ]
    );
  };

  const handleAction = async () => {
    setLoading(true);
    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      if (!isLogin) registerSchema.parse(form);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: form.email,
            password: form.password,
            username: form.fullName
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // GUARDAR TOKEN Y DATOS (Punto D del taller)
          await AsyncStorage.setItem('userToken', data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
          
          setUser(data.user);
          Alert.alert("Bienvenido", `Hola ${data.user.username}\nToken JWT generado.`);
        } else {
          Alert.alert("Éxito", "Usuario registrado correctamente.");
          setIsLogin(true); 
        }
      } else {
        Alert.alert("Error", data.message || "Ocurrió un problema");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        Alert.alert("Validación", err.errors[0].message);
      } else {
        Alert.alert("Conexión", "No se pudo conectar con el servidor Flask.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>AhorroFácil</Text>
        <View style={styles.card}>
            <Text style={styles.subtitle}>¡Hola, {user.username}!</Text>
            <Text style={styles.cardTitle}>Tu saldo actual es:</Text>
            <Text style={styles.balance}>$ 0.00</Text>
            
            {/* BOTONES SEMANA 13: FUNCIONALIDADES NATIVAS */}
            <View style={styles.nativeActions}>
              <TouchableOpacity 
                style={[styles.testButton, {backgroundColor: '#9b59b6'}]} 
                onPress={handleCamara}
              >
                <Text style={styles.buttonTextSmall}>📸 Tomar Foto Recibo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.testButton, {backgroundColor: '#f39c12'}]} 
                onPress={handleUbicacion}
              >
                <Text style={styles.buttonTextSmall}>📍 Registrar Ubicación</Text>
              </TouchableOpacity>

              {/* BOTÓN PARA EVIDENCIA SEMANA 12 */}
              <TouchableOpacity 
                style={styles.testButton} 
                onPress={testProtectedRoute}
              >
                <Text style={styles.buttonTextSmall}>🔒 Probar Ruta Protegida (JWT)</Text>
              </TouchableOpacity>
            </View>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('./assets/logotipo.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>{isLogin ? 'Iniciar Sesión' : 'Crea tu cuenta'}</Text>
      
      {!isLogin && (
        <TextInput 
          placeholder="Nombre Completo" 
          style={styles.input} 
          onChangeText={(t) => setForm({...form, fullName: t})} 
        />
      )}

      <TextInput 
        placeholder="Correo Electrónico" 
        style={styles.input} 
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(t) => setForm({...form, email: t})} 
      />

      <TextInput 
        placeholder="Contraseña" 
        secureTextEntry 
        style={styles.input} 
        onChangeText={(t) => setForm({...form, password: t})} 
      />

      <TouchableOpacity style={styles.button} onPress={handleAction} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'Ingresar' : 'Registrar'}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{marginTop: 20}}>
        <Text style={styles.linkText}>
            {isLogin ? "¿No tienes cuenta? Regístrate aquí" : "Ya tengo cuenta, volver al Login"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, backgroundColor: '#fff', justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 100, height: 100, borderRadius: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#2ecc71', marginBottom: 20 },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 10, fontWeight: '600' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 20, padding: 10, fontSize: 16 },
  button: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 25, alignItems: 'center' },
  testButton: { backgroundColor: '#3498db', padding: 12, borderRadius: 15, marginTop: 10, width: '100%', alignItems: 'center' },
  logoutButton: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 25, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  buttonTextSmall: { color: '#fff', fontWeight: '500', fontSize: 14 },
  linkText: { color: '#3498db', textAlign: 'center', fontWeight: '500' },
  card: { backgroundColor: '#f8f9fa', padding: 25, borderRadius: 20, alignItems: 'center', elevation: 4 },
  cardTitle: { fontSize: 16, color: '#666', marginTop: 10 },
  balance: { fontSize: 36, fontWeight: 'bold', color: '#2ecc71', marginTop: 5 },
  nativeActions: { width: '100%', marginTop: 10, flexDirection: 'column' } 
});

