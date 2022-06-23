import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit, AfterViewInit, OnDestroy {

  subscriptions:Subscription = new Subscription();
  loading: boolean = false;

  @ViewChild(MatTable, { static: false }) table!: MatTable<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  usersData!:User[]; //array de todos los usuarios registrados en la app
  usr!:User | null; //datos del usuario que esta logueado en este momento

  displayedColumns = ['id', 'name', 'username', 'actions'];
  dataSource = new MatTableDataSource();
  
  constructor(
    private titleService: Title,
    private userService: UserService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Usuarios');
    this.loading = true;
    this.getUserData();
    this.getUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getUserData() {
    this.subscriptions.add(
      this.userService.getUserData().subscribe((userData) => {
        this.usr = userData;
      })
    );
  }

  getUsers() {
    this.subscriptions.add(
      this.userService.getUsers().subscribe((users) => {
        this.usersData = users;
        this.dataSource.data = this.usersData;
        this.loading = false;
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo recuperar la informacion de los usuarios`, 'Cerrar');
      })
    )
  }

  onClickAdd() {
    this.userService.setUserToEdit(null)
    .then((res) => {
      if(res) {
        this.router.navigate(['dashboard/users/userform']);
      }
    })
    .catch((error) => {
      this._snackBar.open(error.message, 'Cerrar')
    })
  }

  onClickDetails(user:User){
    this.router.navigate([`dashboard/users/${user.id}`])
  }

  onClickEdit(user:User){
    this.userService.setUserToEdit(user)
    .then(() => {
      this.router.navigate(['dashboard/users/userform']);
    })
    .catch((res) => {
      this._snackBar.open(res.message, 'Cerrar');
    })
  }

  onDeleteuser(user: User){
    /* Se busca el elemento por el id en el array de usuarios,
    Se elimina por el index, y luego usando el ViewChild se renderiza de nuevo la tabla.
    Por ultimo, se actualiza el listado de usuarios a traves del servicio */
    let indexOfUser = this.usersData.findIndex((usr) => usr.id === user.id)
    this.usersData.splice(indexOfUser, 1)
    this.dataSource.data = this.usersData;
    this.table.renderRows();
    this.subscriptions.add(
      this.userService.deleteUser(user.id!).subscribe((userdeleted) => {
        this._snackBar.open(`El usuario ${userdeleted.username} fue eliminado`, 'Ok');
      }, (error) => {
        this._snackBar.open(`${error} - No se puedo eliminar el usuario`, 'Cerrar');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
