import { z } from 'zod';

// Extraemos el esquema para probarlo de forma aislada
export const registerSchema = z.object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Formato de correo inválido"),
    password: z.string().min(8, "La contraseña debe tener 8 caracteres").regex(/[0-9]/, "Debe incluir al menos un número"),
});

// Función de lógica de negocio: Valida si un saldo es positivo (Ejemplo para test)
export const esSaldoValido = (saldo: number): boolean => {
    return saldo >= 0;
};

// Función para formatear moneda (Transformación de datos)
export const formatearMoneda = (valor: number): string => {
    return `$ ${valor.toFixed(2)}`;
};