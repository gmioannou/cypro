import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private navController: NavController) { }

  registerForm: FormGroup = this.formBuilder.group({
    name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password_confirm: new FormControl('', [Validators.required, Validators.minLength(3)]),
    phone_number: new FormControl('', [Validators.required]),
  }, this.passwordMatchValidator);

  ngOnInit() { }

  passwordMatchValidator(g: FormGroup) {
    console.log("password validator")
    return g.get('password').value === g.get('password_confirm').value
      ? null : { 'mismatch': true };
  }

  async registerClick(){
    if (this.registerForm.valid){
      const userData = this.registerForm.value;
      if (await this.authService.register(userData)) {
        this.navController.navigateBack('/home');
        console.log("Account created")
      }
      else {
        console.log("Unable to register")
      }
    } else {
      console.log("invalid form...")
    }
  }

}
