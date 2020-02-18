import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loading: boolean = false;
  signinFailed: boolean = false;
  signinFailedMessage: string = "";

  showPassword: boolean = false;
  showPasswordIcon: string = "eye-off";
  passwordFieldType: string = "password";

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private navController: NavController) { }

  loginForm: FormGroup = this.formBuilder.group({
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$")
    ])),
    password: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(8),
    ])),
  });

  ngOnInit() { }

  async signin() {
    if (this.loginForm.valid) {
      const userData = this.loginForm.value;

      // call auth service to login
      this.loading = true;
      this.authService.login(userData)
        .then(res => {
          const message = res.data.message
          const token = res.data.token

          if (token != null) {
            localStorage.setItem('bearer_token', 'Bearer ' + token);
            this.authService.init_login();
            this.navController.navigateBack('/home');
          }
          else {
            this.signinFailed = true;
            this.signinFailedMessage = message
            console.log(message);
          }
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          this.signinFailed = true;
          this.signinFailedMessage = error
          console.log(error);
        });
    } else {
      this.signinFailed = true;
      this.signinFailedMessage = "All fields are required.";
      console.log('Invalid form.')
    }
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword

    if (this.showPassword) {
      this.showPasswordIcon = "eye";
      this.passwordFieldType = "text";
    } else {
      this.showPasswordIcon = "eye-off";
      this.passwordFieldType = "password";
    }

  }

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'validEmail', message: 'This email is already registred.' },
      { type: 'pattern', message: 'Enter a valid email' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 3 characters long' },
      { type: 'maxlength', message: 'Password cannot be more than 8 characters long.' },
    ],
  }

}
