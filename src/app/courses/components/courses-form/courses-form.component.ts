import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseService } from 'src/app/core/services/course.service';
import { Courses } from 'src/app/shared/interfaces/course.interface';

@Component({
  selector: 'app-courses-form',
  templateUrl: './courses-form.component.html',
  styleUrls: ['./courses-form.component.scss']
})
export class CoursesFormComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  courseForm: FormGroup;
  courseToEdit!: Courses | null;

  constructor(
    private titleService: Title,
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    this.courseForm = this.fb.group({
      course: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      professor: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    })
  }

  ngOnInit(): void {
    this.titleService.setTitle('Formulario de Curso');
    this.subscriptions.add(
      this.courseService.getCourseToEdit().subscribe((course) => {
        this.courseToEdit = course;
      })
    );
    if (this.courseToEdit) {
      this.courseForm.get('course')?.patchValue(this.courseToEdit.course)
      this.courseForm.get('professor')?.patchValue(this.courseToEdit.professor)
    }
  }

  onSubmit() {
    /*Evalua si el elemento es nuevo o a editar, si es nuevo agrega el curso al listado de cursos.
    Si es a editar edita el curso segun el id. finalmente actualiza los cursos en el servicio*/
    if (this.courseToEdit) { //Si se edita un curso existente
      this.courseForm.value['id'] = this.courseToEdit.id;
      this.courseForm.value['students'] = this.courseToEdit.students;
      let id: number = this.courseToEdit.id;
      let course: Courses = this.courseForm.value;
      this.subscriptions.add(
        this.courseService.editCourseById(id, course).subscribe((res) => {
          this._snackBar.open(`Se actualizó la información del curso ${res.course}`, 'Ok');
          this.router.navigate(['dashboard/courses']);
        }, (error) => {
          this._snackBar.open(`${error} - No se pudo actualizar la información de los cursos`, 'Cerrar');
        })
      );
    } else { //Si se agrega un curso nuevo
      this.courseForm.value['students'] = [];
      this.subscriptions.add(
        this.courseService.addCourse(this.courseForm.value).subscribe((res) => {
          this._snackBar.open(`Se agregó el curso ${res.course} exitosamente`, 'Ok');
          this.router.navigate(['dashboard/courses']);
        }, (error) => {
          this._snackBar.open(`${error} - No se pudo agregar el curso`, 'Cerrar');
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
