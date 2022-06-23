import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;

  subscriptions:Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private userService: UserService,
    private router: Router
  ) { 
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]]
    })
  }

  ngOnInit(): void {
    this.isLoggedIn();
  }

  isLoggedIn() {
    this.subscriptions.add(
      this.userService.getIsLoggedIn().subscribe((res) => {
        if(res) {
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  login() {
    let username = this.loginForm.get('username')?.value
    let password = this.loginForm.get('password')?.value
    let users:User[]= [];
    this.subscriptions.add(
      this.userService.getUsers().subscribe((usersdata) => {
        users = usersdata;
        let user = users.find((usr) => usr.username === username)
        if(user && user.password === password) {
          this.userService.setIsLoggedIn(true, user);
          this.router.navigate(['dashboard']);
        } else {
          this.userService.setIsLoggedIn(false, null);
          this._snackBar.open('El usuario y/o la contraseña ingresadas son incorrectas', 'Cerrar')
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
