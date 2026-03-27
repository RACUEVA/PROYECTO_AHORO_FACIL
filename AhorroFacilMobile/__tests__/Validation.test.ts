import { registerSchema, esSaldoValido, formatearMoneda } from '../src/utils/ValidationUtils';

describe('Pruebas Unitarias - Lógica de Negocio AhorroFácil', () => {
    
    describe('Validación de Registro (Zod Schema)', () => {
        test('Debe validar correctamente un usuario con datos completos', () => {
            const validData = { fullName: 'Ronal Cueva', email: 'ronal@test.com', password: 'password123' };
            expect(() => registerSchema.parse(validData)).not.toThrow();
        });

        test('Debe lanzar error si el email tiene formato incorrecto', () => {
            const invalidEmail = { fullName: 'Ronal', email: 'correo-sin-arroba', password: 'password123' };
            expect(() => registerSchema.parse(invalidEmail)).toThrow();
        });

        test('Debe lanzar error si la contraseña es demasiado corta', () => {
            const shortPass = { fullName: 'Ronal', email: 'ronal@test.com', password: '123' };
            expect(() => registerSchema.parse(shortPass)).toThrow();
        });

        test('Debe lanzar error si la contraseña no tiene números (RegEx)', () => {
            const noNumbers = { fullName: 'Ronal Cueva', email: 'ronal@test.com', password: 'password' };
            expect(() => registerSchema.parse(noNumbers)).toThrow();
        });
    });

    describe('Funciones de Transformación y Lógica', () => {
        test('formatearMoneda: debe devolver dos decimales fijos', () => {
            expect(formatearMoneda(50)).toBe('$ 50.00');
            expect(formatearMoneda(0)).toBe('$ 0.00');
            expect(formatearMoneda(1250.5)).toBe('$ 1250.50');
        });

        test('esSaldoValido: debe validar que el saldo sea positivo', () => {
            expect(esSaldoValido(100)).toBe(true);
            expect(esSaldoValido(0)).toBe(true);
            expect(esSaldoValido(-5)).toBe(false); // Esta línea cubre ramas de error
        });
    });
});