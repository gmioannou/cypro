import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FormValidator } from '../validators/form.validator';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
})
export class ResetComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private navController: NavController, private authService: AuthService, private route: ActivatedRoute) { }

  email: any;
  loading: boolean = false;
  resetFailed: boolean = false;
  resetFailedMessage: string = "";

  resetForm: FormGroup = this.formBuilder.group({
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$")
    ])),
    password: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(8),
    ])),
    confirmPassword: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(8),
    ]))
  }, { validator: FormValidator.passwordValidator });

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.email = params['email'];
    });
  }

  submit() {
    this.resetForm.controls['email'].setValue(this.email)

    if (this.resetForm.valid) {
      const userData = this.resetForm.value;

      // call auth service to reset password
      this.authService.reset(userData)
        .then(res => {
          const message = res.data.message
          if (res.data.success) {
            console.log(message)
            this.navController.navigateBack('/home');
          } else {
            console.log(message)
          }
        })
        .catch(error => {
          console.log(error)
        });
    } else {
      console.log("Invalid form.")
    }
  }

  validation_messages = {
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 3 characters long' },
      { type: 'maxlength', message: 'Password cannot be more than 8 characters long.' },
    ],
    'confirmPassword': [
      { type: 'required', message: 'Confirm password in required.' },
      { type: 'minlength', message: 'Password must be at least 3 characters long' },
      { type: 'maxlength', message: 'Password cannot be more than 8 characters long.' },
      { type: 'notMatch', message: "Password mismatch" }
    ]
  }
}
