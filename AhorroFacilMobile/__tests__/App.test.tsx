import 'react-native'; 
import React from 'react';
import App from '../App';
import { render, screen } from '@testing-library/react-native';

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
  it('Debe mostrar el título de la aplicación', () => {
    render(<App />);
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