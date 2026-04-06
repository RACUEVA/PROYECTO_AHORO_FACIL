// src/services/ApiService.ts
import firestore from '@react-native-firebase/firestore';

// Configuración para DISPOSITIVO REAL (usa tu IP local)
const API_URL = 'http://192.168.1.7:5000';
const REQUEST_TIMEOUT = 10000;

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    console.log('🔑 Token actualizado');
  }

  private async request(endpoint: string, method: string = 'GET', body?: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log(`⏰ Timeout: ${endpoint}`);
    }, REQUEST_TIMEOUT);

    try {
      const url = `${API_URL}${endpoint}`;
      console.log(`📡 Request: ${method} ${url}`);
      
      const headers: any = { 'Content-Type': 'application/json' };
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const options: RequestInit = { 
        method, 
        headers, 
        signal: controller.signal 
      };
      if (body) options.body = JSON.stringify(body);

      const response = await fetch(url, options);
      clearTimeout(timeoutId);
      
      console.log(`📡 Status: ${response.status}`);

      const text = await response.text();
      console.log(`📡 Response: ${text.substring(0, 300)}`);

      if (!response.ok) {
        throw new Error(text || `Error ${response.status}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Respuesta no es JSON válido');
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('⏰ Timeout en la petición');
        throw new Error('El servidor no responde');
      }
      
      console.error('❌ Error en request:', error.message);
      throw error;
    }
  }

  // ========== USUARIOS ==========
  async register(email: string, name: string, password: string, presupuesto: number) {
    return this.request('/register', 'POST', { email, username: name, password, presupuesto });
  }

  async login(email: string, password: string) {
    const data = await this.request('/login', 'POST', { email, password });
    if (data && data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async updateProfile(data: any) {
    return this.request('/user/profile', 'PUT', data);
  }

  async deleteAccount() {
    return this.request('/user/account', 'DELETE');
  }

  // ========== MOVIMIENTOS ==========
  async getMovimientos() {
    return this.request('/movimientos', 'GET');
  }

  async createMovimiento(movimiento: any) {
    return this.request('/movimientos', 'POST', movimiento);
  }

  // ========== DEUDAS ==========
  async getDeudas() {
    return this.request('/deudas', 'GET');
  }

  async createDeuda(monto: number, descripcion: string) {
    return this.request('/deudas', 'POST', { monto, descripcion });
  }

  // ========== FIREBASE ==========
  async syncMovimientosToFirebase(userEmail: string, movimientos: any[]) {
    try {
      const userRef = firestore().collection('usuarios').doc(userEmail);
      await userRef.set({ email: userEmail }, { merge: true });
      
      for (const movimiento of movimientos) {
        await userRef.collection('movimientos').doc(movimiento.id.toString()).set(movimiento, { merge: true });
      }
      console.log('✅ Movimientos sincronizados con Firebase');
    } catch (error) {
      console.error('❌ Error Firebase (movimientos):', error);
    }
  }

  async syncDeudasToFirebase(userEmail: string, deudas: any[]) {
    try {
      const userRef = firestore().collection('usuarios').doc(userEmail);
      for (const deuda of deudas) {
        await userRef.collection('deudas').doc(deuda.id.toString()).set(deuda, { merge: true });
      }
      console.log('✅ Deudas sincronizadas con Firebase');
    } catch (error) {
      console.error('❌ Error Firebase (deudas):', error);
    }
  }

  async loadFromFirebase(userEmail: string): Promise<any> {
    try {
      const userRef = firestore().collection('usuarios').doc(userEmail);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        console.log(`📭 No hay datos en Firebase para ${userEmail}`);
        return null;
      }
      
      const movimientosSnapshot = await userRef.collection('movimientos').get();
      const movimientos = movimientosSnapshot.docs.map(doc => ({ 
        id: parseInt(doc.id) || Date.now(), 
        ...doc.data() 
      }));
      
      const deudasSnapshot = await userRef.collection('deudas').get();
      const deudas = deudasSnapshot.docs.map(doc => ({ 
        id: parseInt(doc.id) || Date.now(), 
        ...doc.data() 
      }));
      
      return { 
        movimientos, 
        deudas, 
        saldo: userDoc.data()?.saldo || 0 
      };
    } catch (error) {
      console.error('❌ Error Firebase (load):', error);
      return null;
    }
  }
}

export default new ApiService();