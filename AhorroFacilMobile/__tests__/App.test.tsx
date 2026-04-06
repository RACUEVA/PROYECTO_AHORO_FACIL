import 'react-native'; 
import React from 'react';
import App from '../App';
import { render, screen, fireEvent } from '@testing-library/react-native'; // IMPORTAMOS fireEvent

// MOCK: Esto simula los servicios nativos para que el test pase
jest.mock('../src/services/NativeService.js', () => ({
  NativeService: {
    tomarFoto: jest.fn(() => Promise.resolve('uri_falsa')),
    obtenerUbicacion: jest.fn(() => Promise.resolve({ latitude: 0, longitude: 0 })),
  },
}));

// MOCK: Simula las alertas para que no bloqueen el test
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('Pruebas de Integración - Pantalla Principal', () => {
  // CORRECCIÓN: Ahora el test debe loguearse primero para ver el título "AhorroFácil"
  it('Debe mostrar el título de la aplicación después de iniciar sesión', () => {
    render(<App />);
    
    // 1. Simulamos que el usuario escribe sus credenciales
    fireEvent.changeText(screen.getByPlaceholderText(/Correo Electrónico/i), 'ronal@ejemplo.com');
    fireEvent.changeText(screen.getByPlaceholderText(/Contraseña/i), '123456');
    
    // 2. Simulamos el clic en el botón para entrar al Dashboard
    fireEvent.press(screen.getByText(/Ingresar/i));

    // 3. Ahora el Dashboard es visible y el test pasará
    const titulo = screen.getByText(/AhorroFácil/i);
    expect(titulo).toBeTruthy();
  });

  it('Debe renderizar los campos de Login por defecto', () => {
    render(<App />);
    const inputEmail = screen.getByPlaceholderText(/Correo Electrónico/i);
    const botonIngresar = screen.getByText(/Ingresar/i);
    
    expect(inputEmail).toBeTruthy();
    expect(botonIngresar).toBeTruthy();
  });
});