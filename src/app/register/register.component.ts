import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';
import { FormValidator } from '../validators/form.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  
  registerFailed: boolean = false;
  registerFailedMessage: string = "";

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private navController: NavController) { }

  registerForm: FormGroup = this.formBuilder.group({
    firstName: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(25),
    ])),
    lastName: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(25),      
    ])),
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$")
    ])),
    password: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(8),
    ])),
    confirmPassword: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(8),
    ])),
    phoneNumber: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern("^((\\+91-?)|0)?[0-9]{8}$"),
    ])),
  }, {validator: FormValidator.passwordValidator});

  async register() {
    if (this.registerForm.valid) {
      const userData = this.registerForm.value;

      // call auth service to register
      this.authService.register(userData)
      .then(res => {
        const message = res.data.message
        if (res.data.success) {
          console.log(message)
          this.navController.navigateBack('/home');
        } else {
          console.log(message)
          this.registerFailed = true;
          this.registerFailedMessage = message;
        }
      })
      .catch(error => {
        console.log(error)
        this.registerFailed = true;
        this.registerFailedMessage = error;
      });

    } else {
      console.log("invalid form...")
    }
  }

  validation_messages = {
    'firstName': [
      { type: 'required', message: 'First Name is required.' },
      { type: 'minlength', message: 'First Name must be at least 2 characters long.'},
      { type: 'maxlength', message: 'First Name cannot be more than 25 characters long'},
    ],
    'lastName': [
      { type: 'required', message: 'Last Name is required.' },
      { type: 'minlength', message: 'Last Name must be at least 2 characters long.'},
      { type: 'maxlength', message: 'Last Name cannot be more than 25 characters long'},
    ],
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'validEmail', message: 'This email is already registred.' },
      { type: 'pattern', message: 'Enter a valid email'}
    ],
    'password': [
      { type: 'required', message: 'Password is required.'},
      { type: 'minlength', message: 'Password must be at least 5 characters long'},
      { type: 'maxlength', message: 'Password cannot be more than 8 characters long.'},
    ],
    'confirmPassword': [
      { type: 'required', message: 'Confirm password in required.'},
      { type: 'minlength', message: 'Password must be at least 5 characters long'},
      { type: 'maxlength', message: 'Password cannot be more than 8 characters long.'},
      { type: 'notMatch', message: "Password mismatch" }
    ],
    'phoneNumber': [
      { type: 'required', message: 'Phone number is required.'},
      { type: 'pattern', message: 'Invalid phone number.'}
    ]
  }

}
