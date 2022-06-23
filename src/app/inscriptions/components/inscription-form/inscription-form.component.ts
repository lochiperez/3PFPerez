import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseService } from 'src/app/core/services/course.service';
import { StudentService } from 'src/app/core/services/student.service';
import { Courses } from 'src/app/shared/interfaces/course.interface';
import { Student } from 'src/app/shared/interfaces/student.interface';

@Component({
  selector: 'app-inscription-form',
  templateUrl: './inscription-form.component.html',
  styleUrls: ['./inscription-form.component.scss']
})
export class InscriptionFormComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  
  studentToEdit!:Student | null; //datos del estudiante al que vamos a inscribir a un curso
  courses!: Courses[]; //listado de todos los cursos disponibles
  coursesList!: Courses[]; //listado los cursos disponibles para inscribirse que tiene disponible el alumno

  inscriptionForm: FormGroup;

  constructor(
    private titleService: Title,
    private studentService: StudentService,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) {
    this.inscriptionForm = this.fb.group({
      course: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
    this.titleService.setTitle('Formulario de Inscripción');
    this.subscriptions.add(
      this.studentService.getStudentToEdit().subscribe((student) => {
        if(student) {
          this.studentToEdit = student;
        } else {
          this.router.navigate(['dashboard/inscriptions'])
        }
      })
    );
    this.getCourses();
  }

  getCourses() {
    this.subscriptions.add(
      this.courseService.getCourses().subscribe((coursesData) => {
        this.courses = coursesData;
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo recuperar la información de los cursos`, 'Cerrar');
      })
    );
    // this.studentToEdit!.cursos!.forEach((course) => { //Eliminamos de la lista los cursos a los que ya estaba inscripto
    //   let index = coursesAux.findIndex((x) => x.id === course.id)
    //   coursesAux.splice(index,1);
    // });
    // console.log('lista actualizada: ', coursesAux)
  }

  goBack() {
    this.router.navigate([`dashboard/inscriptions/${this.studentToEdit!.id}`])
  }


  onSubmit() {
    let indexOfCourse = this.courses.findIndex((x) => x.id === this.inscriptionForm.get('course')?.value)
    let courseToAdd: Courses = this.courses[indexOfCourse];
    this.studentToEdit?.cursos?.push(courseToAdd);
    this.subscriptions.add(
      this.studentService.editStudentById(this.studentToEdit?.id!, this.studentToEdit!).subscribe((res) => {
        this._snackBar.open(`Se actualizaron los cursos de ${res.name} ${res.lastname}`, 'Ok');
        this.goBack();
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo actualizar la información de los cursos`, 'Cerrar');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
