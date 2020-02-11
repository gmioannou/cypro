import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';

const authUrl = environment.authUrl

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {
    console.log(environment.message)
  }

  login_user: any = null;

  login(userData) {
    return axios.post(authUrl + '/users/login', userData)
  }

  register(userData) {
    return axios.post(authUrl + '/users/register', userData)
  }

  async init_login() {
    const stored_token = localStorage.getItem('bearer_token');
    if (stored_token) {
      const headers = { Authorization: stored_token }
      try {
        const res = await axios.post(authUrl + '/users/', {}, { headers: headers });
        if (res.status == 200) {
          this.login_user = res.data;
          console.log('Signin', this.login_user.email);
        }
      } catch (err) {
        console.log(err.message)
        console.log("Invalid user")
      }

    } else {
      console.log('Signout')
      this.login_user = null;
    }
  }

  logout() {
    localStorage.removeItem('bearer_token');
    this.init_login();
  }

  delay(num) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("Success")
      }, num)
    })
  }
  
}
