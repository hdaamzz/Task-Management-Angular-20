
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
    static futureDate(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const selectedDate = new Date(control.value);
            const today = new Date();

            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                return { futureDate: { value: control.value } };
            }

            return null;
        };
    }

    static maxFutureDate(maxDays: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const selectedDate = new Date(control.value);
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + maxDays);

            selectedDate.setHours(0, 0, 0, 0);
            maxDate.setHours(0, 0, 0, 0);

            if (selectedDate > maxDate) {
                return {
                    maxFutureDate: {
                        maxDays,
                        value: control.value
                    }
                };
            }

            return null;
        };
    }

    static minLengthTrimmed(minLength: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const trimmedLength = control.value.trim().length;

            if (trimmedLength < minLength) {
                return {
                    minLengthTrimmed: {
                        requiredLength: minLength,
                        actualLength: trimmedLength
                    }
                };
            }

            return null;
        };
    }

    static htmlMinLength(minLength: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }
            const div = document.createElement('div');
            div.innerHTML = control.value;
            const textContent = (div.textContent || div.innerText || '').trim();

            if (textContent.length < minLength) {
                return {
                    htmlMinLength: {
                        requiredLength: minLength,
                        actualLength: textContent.length
                    }
                };
            }

            return null;
        };
    }
}