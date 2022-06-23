import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentService } from 'src/app/core/services/student.service';
import { Student } from 'src/app/shared/interfaces/student.interface';

@Component({
  selector: 'app-students-form',
  templateUrl: './students-form.component.html',
  styleUrls: ['./students-form.component.scss']
})
export class StudentsFormComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  studentForm: FormGroup;

  studentToEdit!: Student | null;

  constructor(
    private titleService: Title,
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15)]],
    })
  }

  ngOnInit(): void {
    this.titleService.setTitle('Formulario de Alumno');
    this.subscriptions.add(
      this.studentService.getStudentToEdit().subscribe((student) => {
        this.studentToEdit = student;
      })
    );
    if (this.studentToEdit) {
      console.log('estudiante a editar: ', this.studentToEdit)
      this.studentForm.get('name')?.patchValue(this.studentToEdit.name)
      this.studentForm.get('lastname')?.patchValue(this.studentToEdit.lastname)
    }
  }

  onSubmit() {
    if (this.studentToEdit) { // si estamos editando un alumno existente
      this.studentForm.value['id'] = this.studentToEdit.id;
      this.studentForm.value['cursos'] = this.studentToEdit.cursos;
      let id: number = this.studentToEdit.id;
      let student: Student = this.studentForm.value;
      this.subscriptions.add(
        this.studentService.editStudentById(id, student).subscribe((res) => {
          this._snackBar.open(`Se actualizó la información de ${res.name} ${res.lastname}`, 'OK');
          this.router.navigate(['dashboard/students']);
        }, (error) => {
          this._snackBar.open(`${error} - No se pudo actualizar la información del usuario`, 'Cerrar');
        })
      );
    } else { // si estamos agregando un usuario nuevo
      this.subscriptions.add(
        this.studentService.addStudent(this.studentForm.value).subscribe((res) => {
          this._snackBar.open(`Se agregó ${res.name} ${res.lastname} a los alumnos`, 'Ok');
          this.router.navigate(['dashboard/students']);
        }, (error) => {
          this._snackBar.open(`${error} - No se pudo agregar el alumno`, 'Cerrar');
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
