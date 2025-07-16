// Validadores básicos
export const validators = {
  required: (value) => ({
    isValid: !!value.trim(),
    error: 'Este campo es requerido'
  }),

  minLength: (value, min) => ({
    isValid: value.length >= min,
    error: `Mínimo ${min} caracteres`
  }),

  maxLength: (value, max) => ({
    isValid: value.length <= max,
    error: `Maximos ${max} caracteres`
  }),

  email: (value) => ({
    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    error: 'Email inválido'
  }),

  alpha: (value) => ({
    isValid: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value),
    error: 'Solo letras permitidas'
  }),

  password: (value) => ({
    isValid: value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value),
    error: 'Debe tener 8+ caracteres, una mayúscula y un número'
  }),

  matches: (value, fieldId, form) => ({
    isValid: value === form.querySelector(`#${fieldId}`).value,
    error: 'Las contraseñas no coinciden'
  }),

  number: (value) => ({
    isValid: typeof value === 'number' && !isNaN(value) && value > 0,
    error: 'Debe ser un número válido y mayor que cero'
  })
};
