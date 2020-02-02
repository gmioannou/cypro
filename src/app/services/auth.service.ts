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

  async login(userData) {
    try {
      const res = await axios.post(authUrl + '/users/login', userData)
      if (res.status == 200) {
        const token = res.data
        localStorage.setItem('bearer_token', 'Bearer ' + token);
      } else {
        localStorage.removeItem('bearer_token');
      }
    } catch(err) {
      console.log(err.message)
    } finally {
      await this.init_login();
    }
  }

  async register(userData) {
    try {
      const res = await axios.post(authUrl + '/users/register', userData)
      console.log("Register response: ", res)
      return true
    } catch (err) {
      console.log(err)
      console.log("this email is used by another account")
      console.log("Unable to register")
      return false
    }
  }
  
  async init_login(){
    const stored_token = localStorage.getItem('bearer_token');
    if (stored_token) {
      const headers = {Authorization: stored_token}
      try {
        const res = await axios.post(authUrl + '/users/', {}, {headers: headers});
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
