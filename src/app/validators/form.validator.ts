import { FormGroup } from '@angular/forms';

export class FormValidator {
	static passwordValidator(formGroup: FormGroup) {
		if (formGroup.get('password').value !== formGroup.get('confirmPassword').value) {
			formGroup.controls['confirmPassword'].setErrors({ 'notMatch': true });
		}
	}
}