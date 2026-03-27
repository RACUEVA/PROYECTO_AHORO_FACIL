import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeService } from './src/services/NativeService.js'; 
import { registerSchema, formatearMoneda } from './src/utils/ValidationUtils'; 
import { z } from 'zod';


const API_URL = 'http://10.0.2.2:5000'; 

  
export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null); 
    const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [location, setLocation] = useState<any>(null);
  
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('userData');
        const token = await AsyncStorage.getItem('userToken');
        if (savedUser && token) {
        setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Error cargando persistencia", e);
      }
    };
    loadStorageData();
}, []);

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
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        setUser(data.user);
        } else {
          Alert.alert("Éxito", "Usuario registrado.");
          setIsLogin(true); 
        }
      } else {
        Alert.alert("Error", data.message || "Problema");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        Alert.alert("Validación", err.errors[0].message);
      } else {
        Alert.alert("Conexión", "Error de red");
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
            <Text style={styles.balance}>{formatearMoneda(0)}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => setUser(null)}>
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isLogin ? 'AhorroFácil' : 'Crea tu cuenta'}</Text>
      <TextInput placeholder="Correo Electrónico" style={styles.input} onChangeText={(t) => setForm({...form, email: t})} />
      <TextInput placeholder="Contraseña" secureTextEntry style={styles.input} onChangeText={(t) => setForm({...form, password: t})} />
      <TouchableOpacity style={styles.button} onPress={handleAction}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ingresar</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 30, 
    backgroundColor: '#fff', 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#2ecc71', 
    marginBottom: 20 
  },
  input: { 
    borderBottomWidth: 1, 
    borderColor: '#ccc', 
    marginBottom: 20, 
    padding: 10 
  },
  button: { 
    backgroundColor: '#2ecc71', 
    padding: 15, 
    borderRadius: 25, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  card: { 
    backgroundColor: '#f8f9fa', 
    padding: 25, 
    borderRadius: 20, 
    alignItems: 'center' 
  },
  balance: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: '#2ecc71' 
  },
  cardTitle: { 
    color: '#666' 
  },
  subtitle: { 
    fontSize: 18, 
    marginBottom: 10 
  },
  logoutButton: { 
    backgroundColor: '#e74c3c', 
    padding: 15, 
    borderRadius: 25, 
    marginTop: 20, 
    alignItems: 'center' 
  }
});