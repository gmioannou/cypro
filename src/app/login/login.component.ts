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

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private navController: NavController) { }

  loginForm: FormGroup = this.formBuilder.group({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  ngOnInit() { }

  async loginClick() {
    if (this.loginForm.valid) {
      const userData = this.loginForm.value;
      await this.authService.login(userData);

      if (this.authService.login_user) {
        this.navController.back();
      }
      
    } else {
      console.log('form is not valid')
    }
  }

}
