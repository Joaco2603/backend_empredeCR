import { validators } from './validators.js'
import { users } from './mockups.js';

export class FormValidator {
    constructor(formId, schema, endPoint = '') {
        this.form = document.getElementById(formId);
        this.schema = schema;
        this.inputs = Array.from(this.form.querySelectorAll('input'));
        this.spanLabel;
        this.init();
    }

    init() {
        // Configurar eventos para cada input
        this.inputs.forEach(input => {
            // Seek the span
            const spanLabel = input.nextElementSibling;

            // Save original text
            if (!spanLabel.dataset.originalText) {
                spanLabel.dataset.originalText = spanLabel.textContent;
            }


            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('blur', () => this.validateInput(input));
        });

        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            } else {
               e.preventDefault();
                const data = this.form.querySelectorAll('input');

                console.log(data)
                console.log(users[1])

                if (users[0].email == data[0].value && users[0].password == data[1].value) {
                    // Aquí podrías agregar el envío real del formulario
                    localStorage.setItem('rol','admin')
                    localStorage.setItem('email', data[0].value)
                    localStorage.setItem('password', data[1].value)
                    window.location.replace('./welcomeAdmin.html');
                }
                if (users[1].email == data[0].value && users[1].password == data[1].value) {
                    // Aquí podrías agregar el envío real del formulario
                    localStorage.setItem('rol','entrepreneur')
                    localStorage.setItem('email', data[0].value)
                    localStorage.setItem('password', data[1].value)
                    window.location.replace('./welcomeEntrepreneur.html');
                } 
                if (users[2].email == data[0].value && users[2].password == data[1].value){
                    // Aquí podrías agregar el envío real del formulario
                    localStorage.setItem('rol','citizen')
                    localStorage.setItem('email', data[0].value)
                    localStorage.setItem('password', data[1].value)
                    window.location.replace('./welcomeCitizen.html');
                }
            }
        });
    }

    validateInput(input) {
        const fieldName = input.id;
        const rules = this.schema[fieldName] || [];
        let isValid = true;
        let errorMessage = '';

        for (const rule of rules) {
            const validator = validators[rule.name];
            if (!validator) continue;

            let result;
            if (rule.name === 'matches') {
                result = validator(input.value.trim(), rule.param, this.form);
            } else {
                result = validator(input.value.trim(), rule.param);
            }

            if (!result.isValid) {
                isValid = false;
                errorMessage = result.error;
                break;
            }
        }

        this.updateInputFeedback(input, isValid, errorMessage);
        return isValid;
    }

    updateInputFeedback(input, isValid, errorMessage) {
        const spanLabel = input.nextElementSibling;

        if (isValid) {
            spanLabel.textContent = spanLabel.dataset.originalText;
            spanLabel.classList.remove('error_message');
        } else {
            spanLabel.textContent = errorMessage;
            spanLabel.classList.add('error_message');
        }
    }


    validateForm() {
        let formIsValid = true;

        this.inputs.forEach(input => {
            const inputIsValid = this.validateInput(input);
            if (!inputIsValid) {
                formIsValid = false;
                // Scroll to first error
                if (formIsValid === false) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });

        return formIsValid;
    }
}