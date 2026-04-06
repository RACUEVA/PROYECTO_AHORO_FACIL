// src/utils/ValidationUtils.ts
import { z } from 'zod';

export const registerSchema = z.object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Ingresa un correo electrónico válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[0-9]/, "La contraseña debe incluir al menos un número"),
    confirmPassword: z.string().min(8, "La confirmación debe tener al menos 8 caracteres")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export const esSaldoValido = (saldo: number): boolean => {
    return saldo >= 0;
};

export const formatearMoneda = (valor: number): string => {
    return `$ ${valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};