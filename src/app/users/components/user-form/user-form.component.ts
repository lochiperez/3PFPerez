import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/shared/interfaces/user.interface';

interface Rol {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  userForm: FormGroup

  userToEdit!: User | null;
  users!: User[];

  roles: Rol[] = [{ value: 'admin', viewValue: 'Administrador' }, { value: 'user', viewValue: 'Usuario' }];

  constructor(
    private titleService: Title,
    private fb: FormBuilder,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      lastname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      checkpass: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      rol: ['', [Validators.required]],
    }, { validator: this.checkPassword });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Formulario de Usuario');
    this.subscriptions.add(
      this.userService.getUserToEdit().subscribe((res) => {
        this.userToEdit = res;
        if (this.userToEdit) {
          this.userForm.get('name')?.patchValue(this.userToEdit.name)
          this.userForm.get('lastname')?.patchValue(this.userToEdit.lastname)
          this.userForm.get('username')?.patchValue(this.userToEdit.username)
          this.userForm.get('rol')?.patchValue(this.userToEdit.rol)
        }
      })
    );
    this.subscriptions.add(
      this.userService.getUsers().subscribe((res) => {
        this.users = res;
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo recuperar la información de los usuarios`, 'Cerrar');
      })
    );

  }

  onSubmit() { //Evalua si el elemento es nuevo o a editar y luego envía al service los datos.
    if (this.userToEdit) { //si estamos editando un usuario existente
      this.userForm.value['id'] = this.userToEdit.id;
      let id: number = this.userToEdit.id!;
      let user: User = this.userForm.value
      this.subscriptions.add(
        this.userService.editUser(id, user).subscribe((res) => {
          this._snackBar.open(`Se actualizó la información de ${res.username}`);
          this.router.navigate(['dashboard/users']);
        }, (error) => {
          this._snackBar.open(`${error} - No se pudo editar la información del usuario`, 'Cerrar');
        })
      );
    } else { // si estamos agregando un usuario nuevo
      this.subscriptions.add(
        this.userService.addUser(this.userForm.value).subscribe((res) => {
          this._snackBar.open(`El usuario ${res.username} se agregó correctamente`, 'Ok');
          this.router.navigate(['dashboard/users']);
        }, (error) => {
          this._snackBar.open(`${error} - No se pudo agregar el usuario`, 'Cerrar');
        })
      );
    }
  }

  checkPassword(group: FormGroup): any {
    const pass = group.controls.password?.value
    const checkpass = group.controls.checkpass?.value
    return pass === checkpass ? null : { notSame: true }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
