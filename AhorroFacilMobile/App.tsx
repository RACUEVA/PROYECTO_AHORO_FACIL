import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator, Image, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, Modal, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

import { formatearMoneda, registerSchema } from './src/utils/ValidationUtils';
import NativeService from './src/services/NativeService';
import ApiService from './src/services/ApiService';

import { Home, Receipt, Camera, User, Lock, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, Edit2, Check, X, UserX, MapPin, FileText, Wallet, Landmark, Mail, Image as ImageIcon, XCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';

// --- 1. INTERFAZ ---
interface Usuario {
  id: number;
  name: string;
  email: string;
  saldo: number;
  foto_perfil?: string | null;
}

// --- 2. ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  containerCentered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  containerWhite: { flex: 1, backgroundColor: '#fff' },
  scrollFull: { flexGrow: 1 },
  fullWidthContent: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#2ecc71', paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 15 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  scrollContainer: { padding: 20, paddingBottom: 160 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 25, marginBottom: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2c3e50', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '800', color: '#2c3e50', textAlign: 'center', marginBottom: 10 },
  titleAuth: { fontSize: 28, fontWeight: '800', color: '#2c3e50', marginBottom: 30 },
  description: { fontSize: 15, color: '#7f8c8d', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#95a5a6', marginBottom: 8 },
  saldo: { fontSize: 36, fontWeight: '900', color: '#2ecc71', marginBottom: 15 },
  inputContainerClean: { width: '100%', marginBottom: 15 },
  inputClean: { width: '100%', height: 55, backgroundColor: '#f8f9fa', borderRadius: 12, paddingHorizontal: 20, marginBottom: 15, borderWidth: 1, borderColor: '#edf2f7' },
  inputError: { borderColor: '#e74c3c', borderWidth: 1.5 },
  errorText: { color: '#e74c3c', fontSize: 12, marginTop: -10, marginBottom: 10, marginLeft: 5, fontWeight: '600' },
  mainButtonRounded: { width: '100%', height: 55, backgroundColor: '#2ecc71', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  linkText: { color: '#3498db', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 20 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 85, backgroundColor: 'white', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingBottom: 20 },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabLabel: { fontSize: 11, color: '#bdc3c7', marginTop: 4 },
  tabActive: { color: '#2ecc71' },
  quickAccess: { width: 40, height: 40, borderRadius: 12, overflow: 'hidden', backgroundColor: '#e0e0e0' },
  miniBadge: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  miniBadgeText: { color: 'white', fontWeight: 'bold' },
  miniFoto: { width: '100%', height: '100%' },
  galleryWrapper: { height: 350, width: '100%', justifyContent: 'center' },
  slide: { alignItems: 'center', padding: 20 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e8f8f0', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  navContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  navArrow: { padding: 10 },
  dotsRow: { flexDirection: 'row', marginHorizontal: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e0e0e0', marginHorizontal: 4 },
  dotActive: { width: 24, backgroundColor: '#2ecc71' },
  inputContainer: { marginBottom: 15 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center' },
  movimientoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  movimientoDesc: { flex: 1, marginHorizontal: 15, color: '#34495e' },
  movimientoMonto: { fontWeight: '700' },
  captureButton: { backgroundColor: '#3498db', flexDirection: 'row', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  profileBadge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2ecc71', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  profileInitial: { color: 'white', fontSize: 40, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#bdc3c7', marginTop: 10 },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  inputEdit: { fontSize: 20, fontWeight: '700', color: '#2c3e50', borderBottomWidth: 1, borderBottomColor: '#2ecc71', paddingHorizontal: 10, minWidth: 150, textAlign: 'center' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, padding: 10 },
  deleteText: { color: '#e74c3c', fontWeight: '700', marginLeft: 8 },
  optionalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  optionalBtn: { flex: 0.48, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#3498db', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  reportButtonContainer: { marginTop: 10, width: '100%' },
  reportButton: { backgroundColor: '#34495e', flexDirection: 'row', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  debtBox: { backgroundColor: '#fff5f5', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  patrimonioLabel: { fontSize: 16, color: '#34495e', fontWeight: '600' },
  emailProfile: { fontSize: 14, color: '#7f8c8d', textAlign: 'center', marginBottom: 20, fontWeight: '500' },
  profileImage: { width: '100%', height: '100%', borderRadius: 50 },
  placeholderIcon: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: 'rgba(0,0,0,0.9)' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  closeButton: { padding: 10 },
  flatListContent: { padding: 10 },
  imagenItem: { margin: 5, borderRadius: 10, overflow: 'hidden', backgroundColor: '#f0f0f0', elevation: 3 },
  imagenGaleria: { width: '100%', height: '100%' },
  botonGaleria: { backgroundColor: '#3498db', flexDirection: 'row', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  fotoInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8 },
  fotoInfoText: { color: 'white', fontSize: 11, textAlign: 'center' },
  previewContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f8f0', padding: 10, borderRadius: 10, marginBottom: 10 },
  previewImage: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
  previewText: { flex: 1, fontSize: 12, color: '#2c3e50' },
  removePhoto: { padding: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15, marginBottom: 10 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  statLabel: { fontSize: 12, color: '#7f8c8d', marginTop: 5 },
  diagnosticButton: { backgroundColor: '#f39c12', flexDirection: 'row', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 10, marginTop: 10 },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: 'transparent',
  }
});

const App = () => {
  // --- ESTADOS PRINCIPALES ---
  const [usuariosRegistrados, setUsuariosRegistrados] = useState<any[]>([
    { email: 'admin@gmail.com', nombre: 'Andres', password: '12345678', presupuesto: '500' },
    { email: 'usuario@gmail.com', nombre: 'UEA', password: '12345678', presupuesto: '0' }
  ]);

  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('welcome');
  const [activeTab, setActiveTab] = useState('resumen');
  const [welcomeStep, setWelcomeStep] = useState(1);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [presupuestoInicial, setPresupuestoInicial] = useState('');

  const [tempFoto, setTempFoto] = useState<string | null>(null);
  const [tempUbicacion, setTempUbicacion] = useState<string | null>(null);

  const [deudas, setDeudas] = useState<any[]>([]);
  const [montoDeuda, setMontoDeuda] = useState('');
  const [descDeuda, setDescDeuda] = useState('');

  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [fotoKey, setFotoKey] = useState(Date.now());

  const [galeriaVisible, setGaleriaVisible] = useState(false);
  const [fotosConMovimientos, setFotosConMovimientos] = useState<any[]>([]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  const [sincronizando, setSincronizando] = useState(false);

  // --- CARGA INICIAL DE SESION ---
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const savedUser = await AsyncStorage.getItem('userData');
        
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          ApiService.setToken(token);
          await cargarDatosBackend();
          await cargarDatosDesdeFirebase(userData.email);
        }
        
      } catch (e) {
        console.error("Error cargando sesion", e);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // --- VALIDACION DE CORREO EN TIEMPO REAL ---
  const validarEmail = (text: string) => {
    setEmail(text);
    if (screen === 'register') {
      if (text.length === 0) {
        setEmailError('');
      } else if (!validateEmail(text)) {
        setEmailError('Formato de correo invalido');
      } else {
        const existe = usuariosRegistrados.some(u => u.email?.toLowerCase() === text.toLowerCase());
        if (existe) {
          setEmailError('Este correo ya esta registrado');
        } else {
          setEmailError('');
        }
      }
    }
  };

  // --- VALIDACION DE NOMBRE DE USUARIO EN TIEMPO REAL ---
  const validarNombre = (text: string) => {
    setNombre(text);
    if (screen === 'register') {
      if (text.length === 0) {
        setNombreError('');
      } else if (text.length < 3) {
        setNombreError('El nombre debe tener al menos 3 caracteres');
      } else {
        const existe = usuariosRegistrados.some(u => u.nombre?.toLowerCase() === text.toLowerCase());
        if (existe) {
          setNombreError('Este nombre de usuario ya esta registrado');
        } else {
          setNombreError('');
        }
      }
    }
  };

  // --- CARGAR DATOS DESDE BACKEND (SQLite) ---
  const cargarDatosBackend = async () => {
    try {
      const movimientosData = await ApiService.getMovimientos();
      setMovimientos(Array.isArray(movimientosData) ? movimientosData : []);
      const deudasData = await ApiService.getDeudas();
      setDeudas(Array.isArray(deudasData) ? deudasData : []);
    } catch (error: any) {
      console.error('Error:', error.message);
      setMovimientos([]);
      setDeudas([]);
    }
  };

  // --- CARGAR DATOS DESDE FIREBASE (NUBE) ---
  const cargarDatosDesdeFirebase = async (userEmail: string) => {
    try {
      const firebaseData = await ApiService.loadFromFirebase(userEmail);
      if (firebaseData && firebaseData.movimientos.length > 0) {
        if (user) {
          const updatedUser = { ...user, saldo: firebaseData.saldo };
          setUser(updatedUser);
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        }
        setMovimientos(firebaseData.movimientos);
        setDeudas(firebaseData.deudas);
        console.log(`Datos cargados desde Firebase para ${userEmail}`);
      }
    } catch (error) {
      console.error('Error cargando desde Firebase:', error);
    }
  };

  // --- FUNCION PARA CARGAR DATOS DE LA NUBE (MANUAL) ---
  const loadFromFirebase = async () => {
    if (!user) return;
    try {
      const data = await ApiService.loadFromFirebase(user.email);
      if (data && data.movimientos.length > 0) {
        Alert.alert(
          "Datos en la nube",
          `Se encontraron ${data.movimientos.length} movimientos y ${data.deudas.length} deudas. Deseas cargarlos?`,
          [
            { text: "No", style: "cancel" },
            { 
              text: "Si, cargar", 
              onPress: () => {
                setMovimientos(data.movimientos);
                setDeudas(data.deudas);
                if (user) setUser({ ...user, saldo: data.saldo });
                Alert.alert("Exito", "Datos cargados desde la nube");
              }
            }
          ]
        );
      } else {
        Alert.alert("Sin datos", "No hay datos guardados en la nube para este usuario");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar los datos desde la nube");
    }
  };

  // --- ACTUALIZAR GALERIA ---
  useEffect(() => {
    const fotos = movimientos.filter(m => m.foto && m.foto !== null && m.foto !== '');
    setFotosConMovimientos(fotos);
  }, [movimientos]);

  // --- LOGICA DE PATRIMONIO ---
  const totalDeudas = deudas.reduce((acc, d) => acc + (d.monto || 0), 0);
  const patrimonioNeto = (user?.saldo || 0) - totalDeudas;
  const totalIngresos = movimientos.filter(m => m.tipo === 'Ingreso').reduce((acc, m) => acc + (m.monto || 0), 0);
  const totalEgresos = movimientos.filter(m => m.tipo === 'Egreso').reduce((acc, m) => acc + (m.monto || 0), 0);
  const movimientosConFoto = movimientos.filter(m => m.foto && m.foto !== null).length;

  // --- VALIDACIONES ---
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // --- REGISTRO ---
  const handleRegister = async () => {
    if (!nombre || !email || !password || !confirmPassword || !presupuestoInicial) {
      return Alert.alert("Campos incompletos", "Por favor, completa todos los campos.");
    }
    if (emailError) return Alert.alert("Correo invalido", emailError);
    if (nombreError) return Alert.alert("Nombre invalido", nombreError);
    if (password.length < 8) return Alert.alert("Contrasena debil", "La contrasena debe tener al menos 8 caracteres.");
    if (password !== confirmPassword) return Alert.alert("Error", "Las contrasenas no coinciden.");

    setLoading(true);
    try {
      await ApiService.register(email, nombre, password, parseFloat(presupuestoInicial));
      
      const nuevoUsuario = { email, nombre, password, presupuesto: presupuestoInicial };
      const nuevosUsuarios = [...usuariosRegistrados, nuevoUsuario];
      setUsuariosRegistrados(nuevosUsuarios);
      await AsyncStorage.setItem('listaUsuariosRegistrados', JSON.stringify(nuevosUsuarios));
      
      const userRef = firestore().collection('usuarios').doc(email);
      await userRef.set({
        email: email,
        nombre: nombre,
        saldo: parseFloat(presupuestoInicial),
        fechaRegistro: new Date().toISOString()
      });
      
      Alert.alert("Exito", "Cuenta creada. Ahora puedes iniciar sesion.");
      setScreen('login');
      setPassword('');
      setConfirmPassword('');
      setEmailError('');
      setNombreError('');
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN ---
  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Atencion", "Completa tus credenciales.");
    setLoading(true);

    try {
      const data = await ApiService.login(email, password);
      
      if (!data || !data.user) {
        throw new Error("Usuario no encontrado");
      }
      
      const userData: Usuario = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        saldo: data.user.saldo || 0,
        foto_perfil: data.user.foto_perfil
      };

      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      if (data.user.foto_perfil) setFotoPerfil(data.user.foto_perfil);
      
      await cargarDatosDesdeFirebase(userData.email);
      await cargarDatosBackend();
      
      Alert.alert("Bienvenido", `Has iniciado sesion como ${userData.name}`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    Alert.alert("Confirmacion", "Cerrar sesion?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir", style: "destructive", onPress: async () => {
          setLoading(true);
          await AsyncStorage.multiRemove(['userToken', 'userData']);
          ApiService.setToken(null);
          setUser(null);
          setScreen('welcome');
          setFotoPerfil(null);
          setMovimientos([]);
          setDeudas([]);
          setActiveTab('resumen');
          setLoading(false);
        }
      }
    ]);
  };

  // --- ELIMINAR CUENTA ---
  const handleDeleteAccount = () => {
    Alert.alert(
      "ELIMINAR CUENTA",
      "Estas completamente seguro? Esta accion borrara todos tus datos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar", style: "destructive", onPress: async () => {
            setLoading(true);
            try {
              await ApiService.deleteAccount();
              if (user) {
                const userRef = firestore().collection('usuarios').doc(user.email);
                await userRef.delete();
              }
              await AsyncStorage.multiRemove(['userToken', 'userData']);
              ApiService.setToken(null);
              
              const nuevosUsuarios = usuariosRegistrados.filter(u => u.email !== user?.email);
              setUsuariosRegistrados(nuevosUsuarios);
              await AsyncStorage.setItem('listaUsuariosRegistrados', JSON.stringify(nuevosUsuarios));
              
              setUser(null);
              setMovimientos([]);
              setDeudas([]);
              setScreen('welcome');
              Alert.alert("Exito", "Cuenta eliminada");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la cuenta");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // --- ACTUALIZAR NOMBRE ---
  const updateUserName = async () => {
    if (!tempName.trim()) return Alert.alert("Error", "El nombre no puede estar vacio.");
    if (user) {
      try {
        await ApiService.updateProfile({ name: tempName });
        
        const updatedUser = { ...user, name: tempName };
        setUser(updatedUser);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        
        const userRef = firestore().collection('usuarios').doc(user.email);
        await userRef.set({ nombre: tempName }, { merge: true });
        
        setIsEditingName(false);
        Alert.alert("Exito", "Nombre actualizado");
      } catch (error) {
        Alert.alert("Error", "No se pudo actualizar el nombre");
      }
    }
  };

  // --- GUARDAR MOVIMIENTO ---
  const guardarMovimiento = async (tipo: string) => {
    const valorMonto = parseFloat(monto);
    if (!monto || isNaN(valorMonto) || valorMonto <= 0 || !descripcion) {
      return Alert.alert("Error", "Ingresa un monto y descripcion valida.");
    }

    if (user) {
      try {
        const nuevoMovimiento = {
          monto: valorMonto,
          descripcion: descripcion.trim(),
          tipo,
          fecha: new Date().toLocaleString(),
          foto: tempFoto || null,
          ubicacion: tempUbicacion || null
        };
        
        const response = await ApiService.createMovimiento(nuevoMovimiento);
        const movimientoConId = { id: Date.now(), ...nuevoMovimiento };
        setMovimientos([movimientoConId, ...movimientos]);
        
        const updatedUser = { ...user, saldo: response.nuevo_saldo };
        setUser(updatedUser);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        
        setMonto('');
        setDescripcion('');
        setTempFoto(null);
        setTempUbicacion(null);
        
        Alert.alert("Exito", `${tipo} registrado. Nuevo saldo: ${formatearMoneda(response.nuevo_saldo)}`);
      } catch (error: any) {
        Alert.alert("Error", error.message || "No se pudo registrar");
      }
    }
  };

  // --- AGREGAR DEUDA ---
  const agregarDeuda = async () => {
    const valor = parseFloat(montoDeuda);
    if (!valor || !descDeuda) return Alert.alert("Error", "Completa los datos de la deuda.");
    
    try {
      await ApiService.createDeuda(valor, descDeuda);
      const nuevaDeuda = { id: Date.now(), monto: valor, descripcion: descDeuda };
      setDeudas([nuevaDeuda, ...deudas]);
      setMontoDeuda('');
      setDescDeuda('');
      Alert.alert("Exito", "Deuda registrada");
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar la deuda");
    }
  };

  // --- TOMAR FOTO DE PERFIL ---
  const tomarFotoPerfil = async () => {
    try {
      const result = await NativeService.tomarFoto();
      if (result && result.uri) {
        setFotoPerfil(result.uri);
        await ApiService.updateProfile({ foto_perfil: result.uri });
        const updatedUser = { ...user, foto_perfil: result.uri };
        setUser(updatedUser as Usuario);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setFotoKey(Date.now());
        Alert.alert("Exito", "Foto de perfil actualizada");
      } else {
        Alert.alert("Info", "No se tomo ninguna foto");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  // --- TOMAR FOTO EN MOVIMIENTOS ---
  const tomarFotoMovimiento = async () => {
    try {
      const result = await NativeService.tomarFoto();
      if (result && result.uri) {
        setTempFoto(result.uri);
        Alert.alert("Exito", "Foto capturada correctamente");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  // --- DIAGNOSTICO FINANCIERO ---
  const diagnosticarDatos = () => {
    Alert.alert(
      "DIAGNOSTICO FINANCIERO",
      `ESTADO ACTUAL:\n\n` +
      `Saldo: ${formatearMoneda(user?.saldo || 0)}\n` +
      `Ingresos: ${formatearMoneda(totalIngresos)}\n` +
      `Egresos: ${formatearMoneda(totalEgresos)}\n` +
      `Movimientos: ${movimientos.length}\n` +
      `Con foto: ${movimientosConFoto}\n` +
      `Deudas: ${formatearMoneda(totalDeudas)}\n` +
      `Patrimonio: ${formatearMoneda(patrimonioNeto)}`,
      [{ text: "OK" }]
    );
  };

  // --- GENERAR REPORTE ---
  const generarReporte = () => {
    const reporteTexto = 
      `AHORROFACIL PRO - REPORTE\n` +
      `-----------------------\n\n` +
      `USUARIO: ${user?.name || 'No especificado'}\n` +
      `EMAIL: ${user?.email || 'No especificado'}\n` +
      `FECHA: ${new Date().toLocaleString()}\n\n` +
      `CAPITAL DISPONIBLE: ${formatearMoneda(user?.saldo || 0)}\n` +
      `INGRESOS TOTALES: ${formatearMoneda(totalIngresos)}\n` +
      `EGRESOS TOTALES: ${formatearMoneda(totalEgresos)}\n` +
      `TOTAL DEUDAS: ${formatearMoneda(totalDeudas)}\n` +
      `PATRIMONIO NETO: ${formatearMoneda(patrimonioNeto)}\n` +
      `Movimientos: ${movimientos.length}\n` +
      `Con foto: ${movimientosConFoto}\n\n` +
      `AhorroFacil Pro - Tu dinero, tu control`;
    
    Alert.alert("Reporte Financiero", reporteTexto, [{ text: "OK" }]);
  };

  // --- COMPONENTE GALERIA ---
  const GaleriaFotos = () => (
    <Modal
      visible={galeriaVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setGaleriaVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Mis Fotos</Text>
          <TouchableOpacity onPress={() => setGaleriaVisible(false)} style={styles.closeButton}>
            <XCircle color="white" size={30} />
          </TouchableOpacity>
        </View>

        {fotosConMovimientos.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ImageIcon color="white" size={80} />
            <Text style={{ color: 'white', marginTop: 20, fontSize: 16 }}>No hay fotos registradas</Text>
            <Text style={{ color: '#bdc3c7', marginTop: 10, textAlign: 'center' }}>
              Toma una foto al registrar un movimiento
            </Text>
          </View>
        ) : (
          <FlatList
            data={fotosConMovimientos}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.flatListContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.imagenItem, { width: '47%', aspectRatio: 1, margin: '1.5%' }]}
                onPress={() => {
                  Alert.alert(
                    item.descripcion || 'Movimiento',
                    `Monto: ${formatearMoneda(item.monto)}\n` +
                    `Fecha: ${item.fecha || 'No registrada'}\n` +
                    `Tipo: ${item.tipo === 'Ingreso' ? 'Ingreso (+)' : 'Egreso (-)'}`
                  );
                }}
              >
                <Image source={{ uri: item.foto }} style={styles.imagenGaleria} />
                <View style={styles.fotoInfo}>
                  <Text style={styles.fotoInfoText} numberOfLines={1}>
                    {item.descripcion || 'Sin descripcion'}
                  </Text>
                  <Text style={[styles.fotoInfoText, { fontSize: 10, color: '#2ecc71' }]}>
                    {formatearMoneda(item.monto)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={{ marginTop: 15 }}>Validando sesion...</Text>
      </View>
    );
  }

  // --- VISTA DE ACCESO ---
  if (!user) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.containerWhite}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.scrollFull}>
          {screen === 'welcome' ? (
            <View style={styles.fullWidthContent}>
              <View style={styles.galleryWrapper}>
                {welcomeStep === 1 && (
                  <View style={styles.slide}>
                    <View style={styles.iconCircle}><Text style={{ fontSize: 50 }}>💰</Text></View>
                    <Text style={styles.title}>AhorroFacil Pro</Text>
                    <Text style={styles.description}>Gestion financiera avanzada</Text>
                  </View>
                )}
                {welcomeStep === 2 && (
                  <View style={styles.slide}>
                    <View style={[styles.iconCircle, { backgroundColor: '#e3f2fd' }]}><Text style={{ fontSize: 50 }}>🛡️</Text></View>
                    <Text style={styles.title}>Seguridad Total</Text>
                    <Text style={styles.description}>Tus datos protegidos con JWT</Text>
                  </View>
                )}
                {welcomeStep === 3 && (
                  <View style={styles.slide}>
                    <View style={[styles.iconCircle, { backgroundColor: '#fff3e0' }]}><Text style={{ fontSize: 50 }}>📊</Text></View>
                    <Text style={styles.title}>Reportes Listos</Text>
                    <Text style={styles.description}>Digitaliza tus comprobantes</Text>
                  </View>
                )}
              </View>
              <View style={styles.navContainer}>
                <TouchableOpacity onPress={() => setWelcomeStep(Math.max(1, welcomeStep - 1))} style={styles.navArrow}>
                  <ChevronLeft color="#2ecc71" size={28} />
                </TouchableOpacity>
                <View style={styles.dotsRow}>
                  {[1, 2, 3].map(i => <View key={i} style={[styles.dot, welcomeStep === i && styles.dotActive]} />)}
                </View>
                <TouchableOpacity onPress={() => setWelcomeStep(Math.min(3, welcomeStep + 1))} style={styles.navArrow}>
                  <ChevronRight color="#2ecc71" size={28} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.mainButtonRounded} onPress={() => setScreen('register')}>
                <Text style={styles.buttonText}>EMPEZAR AHORA</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScreen('login')} style={{ marginTop: 25 }}>
                <Text style={styles.linkText}>Ya tengo cuenta. Iniciar Sesion</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fullWidthContent}>
              <Text style={styles.titleAuth}>{screen === 'register' ? 'Crear Cuenta' : 'Acceso Seguro'}</Text>
              <View style={styles.inputContainerClean}>
                {screen === 'register' && (
                  <>
                    <TextInput 
                      style={[styles.inputClean, nombreError ? styles.inputError : null]} 
                      placeholder="Nombre Completo" 
                      value={nombre} 
                      onChangeText={validarNombre} 
                    />
                    {nombreError ? <Text style={styles.errorText}>{nombreError}</Text> : null}
                    <TextInput 
                      style={styles.inputClean} 
                      placeholder="Presupuesto inicial" 
                      value={presupuestoInicial} 
                      onChangeText={setPresupuestoInicial} 
                      keyboardType="numeric" 
                    />
                  </>
                )}
                <TextInput 
                  style={[styles.inputClean, emailError ? styles.inputError : null]} 
                  placeholder="Email" 
                  value={email} 
                  onChangeText={validarEmail} 
                  autoCapitalize="none" 
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                <TextInput 
                  style={styles.inputClean} 
                  placeholder="Contrasena" 
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry 
                />
                {screen === 'register' && (
                  <TextInput 
                    style={styles.inputClean} 
                    placeholder="Confirmar Contrasena" 
                    value={confirmPassword} 
                    onChangeText={setConfirmPassword} 
                    secureTextEntry 
                  />
                )}
              </View>
              <TouchableOpacity 
                style={[styles.mainButtonRounded, (emailError || nombreError) && { backgroundColor: '#bdc3c7' }]} 
                onPress={screen === 'register' ? handleRegister : handleLogin}
                disabled={!!emailError || !!nombreError}
              >
                <Text style={styles.buttonText}>{screen === 'register' ? 'REGISTRARSE' : 'INGRESAR'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setScreen(screen === 'register' ? 'login' : 'register'); setEmailError(''); setNombreError(''); }} style={{ marginTop: 25 }}>
                <Text style={styles.linkText}>
                  {screen === 'register' ? 'Ya tienes cuenta? Inicia Sesion' : 'No tienes cuenta? Registrate'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // --- VISTA DASHBOARD PRINCIPAL ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.quickAccess} onPress={() => setActiveTab('perfil')}>
          <View style={styles.miniBadge}>
            {fotoPerfil ? (
              <Image key={`mini-${fotoKey}`} source={{ uri: fotoPerfil }} style={styles.miniFoto} />
            ) : (
              <Text style={styles.miniBadgeText}>{user?.name ? user.name[0].toUpperCase() : '?'}</Text>
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AhorroFacil Pro</Text>
        <Lock color="white" size={20} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* TAB RESUMEN */}
        {activeTab === 'resumen' && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Balance Consolidado</Text>
              <Text style={styles.label}>Activos (Capital disponible)</Text>
              <Text style={styles.saldo}>{formatearMoneda(user?.saldo || 0)}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <TrendingUp size={24} color="#2ecc71" />
                  <Text style={styles.statValue}>{formatearMoneda(totalIngresos)}</Text>
                  <Text style={styles.statLabel}>Ingresos</Text>
                </View>
                <View style={styles.statBox}>
                  <TrendingDown size={24} color="#e74c3c" />
                  <Text style={styles.statValue}>{formatearMoneda(totalEgresos)}</Text>
                  <Text style={styles.statLabel}>Egresos</Text>
                </View>
                <View style={styles.statBox}>
                  <DollarSign size={24} color="#3498db" />
                  <Text style={styles.statValue}>{movimientos.length}</Text>
                  <Text style={styles.statLabel}>Movimientos</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              <Text style={styles.patrimonioLabel}>Resumen de Patrimonio</Text>
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: '#2ecc71' }}>Activos: {formatearMoneda(user?.saldo || 0)}</Text>
                <Text style={{ color: '#e74c3c' }}>Pasivos: {formatearMoneda(totalDeudas)}</Text>
                <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />
                <Text style={{ fontWeight: '800', fontSize: 18, color: '#34495e' }}>Patrimonio Neto: {formatearMoneda(patrimonioNeto)}</Text>
              </View>
            </View>

            <View style={styles.reportButtonContainer}>
              <TouchableOpacity style={styles.reportButton} onPress={generarReporte}>
                <FileText color="white" size={20} />
                <Text style={[styles.buttonText, { marginLeft: 10 }]}>GENERAR REPORTE</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.diagnosticButton} onPress={diagnosticarDatos}>
              <Text style={styles.buttonText}>DIAGNOSTICAR DATOS</Text>
            </TouchableOpacity>
          </>
        )}

        {/* TAB MOVIMIENTOS */}
        {activeTab === 'movimientos' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Registrar Movimiento</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="Monto (0.00)" keyboardType="numeric" value={monto} onChangeText={setMonto} />
              <TextInput style={styles.input} placeholder="Descripcion" value={descripcion} onChangeText={setDescripcion} />
            </View>

            {tempFoto && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: tempFoto }} style={styles.previewImage} />
                <Text style={styles.previewText}>Foto adjunta</Text>
                <TouchableOpacity onPress={() => setTempFoto(null)} style={styles.removePhoto}>
                  <X color="#e74c3c" size={20} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.optionalRow}>
              <TouchableOpacity style={[styles.optionalBtn, tempFoto && { backgroundColor: '#e8f8f0' }]} onPress={tomarFotoMovimiento}>
                <Camera size={18} color="#3498db" />
                <Text style={{ fontSize: 12, marginLeft: 5 }}>{tempFoto ? 'Foto Lista' : 'Tomar Foto'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optionalBtn, tempUbicacion && { backgroundColor: '#e8f8f0' }]} onPress={() => {
                setTempUbicacion("Tena, Napo");
                Alert.alert("Ubicacion", "Ubicacion detectada correctamente");
              }}>
                <MapPin size={18} color="#3498db" />
                <Text style={{ fontSize: 12, marginLeft: 5 }}>{tempUbicacion ? 'Ubicado' : 'Anadir GPS'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2ecc71' }]} onPress={() => guardarMovimiento('Ingreso')}>
                <ArrowUpCircle color="white" size={20} /><Text style={styles.buttonText}>Ingreso</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#e74c3c' }]} onPress={() => guardarMovimiento('Egreso')}>
                <ArrowDownCircle color="white" size={20} /><Text style={styles.buttonText}>Egreso</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.botonGaleria} onPress={() => setGaleriaVisible(true)}>
              <ImageIcon color="white" size={20} />
              <Text style={[styles.buttonText, { marginLeft: 10 }]}>VER MIS FOTOS ({fotosConMovimientos.length})</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
            <Text style={styles.label}>Historial:</Text>
            {movimientos.length === 0 ? (
              <Text style={styles.emptyText}>Sin registros</Text>
            ) : (
              movimientos.map(m => (
                <View key={m.id} style={styles.movimientoItem}>
                  <View style={{ flexDirection: 'row', width: 40 }}>
                    <Text style={{ color: m.tipo === 'Ingreso' ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                      {m.tipo === 'Ingreso' ? '+' : '-'}
                    </Text>
                    {m.foto && <Camera size={12} color="#3498db" style={{ marginLeft: 5 }} />}
                  </View>
                  <Text style={styles.movimientoDesc}>{m.descripcion}</Text>
                  <Text style={[styles.movimientoMonto, { color: m.tipo === 'Ingreso' ? '#2ecc71' : '#e74c3c' }]}>
                    ${m.monto?.toFixed(2) || '0.00'}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB DEUDAS */}
        {activeTab === 'deudas' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Control de Deudas</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="Monto" keyboardType="numeric" value={montoDeuda} onChangeText={setMontoDeuda} />
              <TextInput style={styles.input} placeholder="A quien le debes?" value={descDeuda} onChangeText={setDescDeuda} />
            </View>
            <TouchableOpacity style={[styles.mainButtonRounded, { backgroundColor: '#e74c3c' }]} onPress={agregarDeuda}>
              <Landmark color="white" size={20} /><Text style={[styles.buttonText, { marginLeft: 10 }]}>REGISTRAR</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            {deudas.length === 0 ? (
              <Text style={styles.emptyText}>Sin deudas</Text>
            ) : (
              deudas.map(d => (
                <View key={d.id} style={styles.debtBox}>
                  <Text style={{ fontWeight: '700' }}>{d.descripcion}</Text>
                  <Text style={{ color: '#e74c3c' }}>{formatearMoneda(d.monto)}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB PERFIL */}
        {activeTab === 'perfil' && (
          <View style={styles.card}>
            <TouchableOpacity onPress={tomarFotoPerfil} style={styles.profileBadge}>
              {fotoPerfil ? (
                <Image key={fotoKey} source={{ uri: fotoPerfil }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderIcon}>
                  <Text style={styles.profileInitial}>{user?.name ? user.name[0].toUpperCase() : '?'}</Text>
                </View>
              )}
            </TouchableOpacity>

            {isEditingName ? (
              <View style={styles.editRow}>
                <TextInput style={styles.inputEdit} value={tempName} onChangeText={setTempName} autoFocus />
                <TouchableOpacity onPress={updateUserName}><Check color="#2ecc71" size={24} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditingName(false)}><X color="#e74c3c" size={24} /></TouchableOpacity>
              </View>
            ) : (
              <View style={styles.editRow}>
                <Text style={styles.title}>{user?.name}</Text>
                <TouchableOpacity onPress={() => { setTempName(user?.name || ''); setIsEditingName(true); }}>
                  <Edit2 color="#bdc3c7" size={18} />
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.emailProfile}><Mail size={14} /> {user?.email}</Text>

            {/* Boton para cargar datos de la nube */}
            <TouchableOpacity 
              style={[styles.mainButtonRounded, { backgroundColor: '#3498db', marginTop: 10 }]} 
              onPress={loadFromFirebase}
            >
              <Text style={styles.buttonText}>CARGAR DATOS DE LA NUBE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.mainButtonRounded, { backgroundColor: '#34495e', marginTop: 10 }]} onPress={handleLogout}>
              <Text style={styles.buttonText}>CERRAR SESION</Text>
            </TouchableOpacity>
            
            {/* Boton eliminar cuenta - SOLO TEXTO ROJO */}
            <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
              <UserX color="#e74c3c" size={18} />
              <Text style={[styles.deleteText, { marginLeft: 8, fontSize: 16 }]}>Eliminar cuenta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <GaleriaFotos />

      <View style={styles.tabBar}>
        {[
          { id: 'resumen', label: 'Inicio', icon: Home },
          { id: 'movimientos', label: 'Datos', icon: Receipt },
          { id: 'deudas', label: 'Deudas', icon: Wallet },
          { id: 'perfil', label: 'Perfil', icon: User }
        ].map((tab) => (
          <TouchableOpacity key={tab.id} style={styles.tabItem} onPress={() => setActiveTab(tab.id)}>
            <tab.icon size={22} color={activeTab === tab.id ? '#2ecc71' : '#bdc3c7'} />
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default App;