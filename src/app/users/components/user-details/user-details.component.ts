import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy {

  subscriptions:Subscription = new Subscription();
  loading: boolean = false;

  user!:User; //Usuario a mostrar los detalles

  usersData!:User[]; //listado de usuarios

  usr!:User | null; //datos del usuario que esta logueado en este momento

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Detalles del Usuario');
    this.loading = true;
    this.getUserData();
    this.getUsers();
    this.getUserDetails();
  }

  getUsers() {
    this.subscriptions.add(
      this.userService.getUsers().subscribe((users) => {
        this.usersData = users;
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo recuperar la información de los usuarios`, 'Cerrar');
      })
    )
  }

  getUserData() {
    this.subscriptions.add(
      this.userService.getUserData().subscribe((userData) => {
        this.usr = userData;
      })
    );
  }

  getUserDetails() { //recuperamos la informacion del usuario solicitado por el id del mismo
    let id:number = parseInt(this.route.snapshot.paramMap.get('id') as string);
    this.subscriptions.add(
      this.userService.getUserById(id).subscribe((userData) => {
        this.user = userData;
        this.loading = false;
        }, (error) => {
          this._snackBar.open(`${error} - No se pudo recuperar la información del usuario`, 'Cerrar');
          this.router.navigate(['dashboard/users']);
        })
    )
  }

  onClickEdit(){
    this.userService.setUserToEdit(this.user)
    .then(() => {
      this.router.navigate(['dashboard/users/userform']);
    })
    .catch((res) => {
      this._snackBar.open(res.message, 'Cerrar');
    })
  }

  onDeleteuser(){
    /* Se busca el elemento por el id en el array de usuarios,
    Se elimina por el index, y luego usando el ViewChild se renderiza de nuevo la tabla.
    Por ultimo, se actualiza el listado de usuarios en el servicio */
    this.subscriptions.add(
      this.userService.deleteUser(this.user.id!).subscribe((res) => {
        this._snackBar.open(`el usuario ${res.username} fue eliminado con exito`, 'Ok');
        this.router.navigate(['dashboard/users'])
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo eliminar el usuario`, 'Cerrar');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
