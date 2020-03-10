import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss'],
})
export class ForgotComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private navController: NavController) { }

  ngOnInit() {}

  loading: boolean = false;
  forgotFailed: boolean = false;
  forgotFailedMessage: string = "";

  forgotForm: FormGroup = this.formBuilder.group({
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$")
    ])),
  });

  submit() {
    if (this.forgotForm.valid) {
      const userData = this.forgotForm.value;

      // call auth service to reset password
      this.loading = true;
      this.authService.forgot(userData)
        .then(res => {
          const message = res.data.message;

          if (res.data.user) {
            this.navController.navigateBack('/home');
          } else {
            this.forgotFailed = true;
            this.forgotFailedMessage = message        
          }
          
          this.loading = false;
          console.log(res.data.message);
        })
        .catch((error) => {
          this.loading = false;
          this.forgotFailed = true;
          this.forgotFailedMessage = error
          console.log(error);
        });
    } else {
      this.forgotFailed = true;
      this.forgotFailedMessage = "All fields are required.";
      console.log('Invalid form.')
    }
  }

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'validEmail', message: 'This email is already registred.' },
      { type: 'pattern', message: 'Enter a valid email' }
    ],
  }
}
