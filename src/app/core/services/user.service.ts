import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isLoggedIn: boolean = false;
  //isLoggedIn:boolean = true;


  userData!: User | null;
  usersData: User[] = [];
  userToEdit!: User | null;

  usersUrl = 'https://62b113b1196a9e98702f186f.mockapi.io/users/';

  constructor(
    private http: HttpClient
  ) { }

  private handleError(error: HttpErrorResponse) {
    //Manejo de errores http frontend
    if (error) {
      console.warn(`Error de backend: ${error.status}, cuerpo del error: ${error.message}`);
    }
    return throwError('Error de comunicación Http');
  }

  getIsLoggedIn(): Observable<boolean> {
    return of(this.isLoggedIn)
  }

  setIsLoggedIn(isLogged: boolean, user: User | null) {
    this.isLoggedIn = isLogged;
    if (user) {
      this.userData = {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        username: user.username,
        rol: user.rol
      }
    } else {
      this.userData = user;
    }
  }

  logOff() {
    this.isLoggedIn = false;
  }

  getUsers(): Observable<User[]> { //Devuelve un array de los usuarios y sus roles
    return this.http.get<User[]>(this.usersUrl)
      .pipe(catchError(this.handleError));
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(this.usersUrl + id)
      .pipe(catchError(this.handleError));
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.usersUrl, user)
      .pipe(catchError(this.handleError));
  }

  editUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(this.usersUrl + id, user)
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(this.usersUrl + id)
      .pipe(catchError(this.handleError));
  }

  getUserToEdit(): Observable<User | null> {
    return of(this.userToEdit);
  }

  setUserToEdit(user: User | null): Promise<any> {
    return new Promise((resolve, reject) => {
      if (user || user === null) {
        this.userToEdit = user;
        return resolve(true)
      } else {
        return reject({ message: 'No se pudo setear el userToEdit' })
      }
    })
  }

  getUserData(): Observable<User | null> {
    return of(this.userData);
  }

}
