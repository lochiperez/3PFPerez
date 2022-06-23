import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentService } from 'src/app/core/services/student.service';
import { UserService } from 'src/app/core/services/user.service';
import { Courses } from 'src/app/shared/interfaces/course.interface';
import { Student } from 'src/app/shared/interfaces/student.interface';
import { User } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-inscriptions-detail',
  templateUrl: './inscriptions-detail.component.html',
  styleUrls: ['./inscriptions-detail.component.scss']
})
export class InscriptionsDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  user!:User | null; //Datos del usuario logueado
  loading: boolean = false;

  @ViewChild(MatTable, { static: false }) table!: MatTable<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  student!: Student; //Estudiante a mostrar detalles
  studentsData!: Student[]; //Listado de estudiantes

  displayedColumns = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource();

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private studentService: StudentService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Detalles de las inscripciones del Alumno');
    this.loading = true;
    this.getUserData();
    this.getStudentDetails();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getUserData() {
    this.subscriptions.add(
      this.userService.getUserData().subscribe((userData) => {
        this.user = userData;
      })
    );
  }


  getStudentDetails() {
    let id:number = parseInt(this.route.snapshot.paramMap.get('id') as string);
    this.subscriptions.add(
      this.studentService.getStudentById(id).subscribe((res) => {
        this.student = res;
        this.dataSource.data = this.student.cursos!
        this.loading = false;
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo recuperar la informacion del alumno`, 'Cerrar');
        this.router.navigate(['dashboard/students']);
      })
    );
  }

  onClickAdd() {
    this.studentService.setStudentToEdit(this.student)
    .then(() => this.router.navigate(['dashboard/inscriptions/addinscription']))
    .catch((error) => this._snackBar.open(error.message, 'Cerrar'))
  }

  onClickDetails(course: Courses) {
    this.router.navigate([`dashboard/courses/${course.id}`])
  }

  onDeleteInscription(course: Courses) {
    /* Se busca el elemento por el id del curso en el array de cursos del estudiante,
    Se elimina por el index, y luego usando el ViewChild, se renderiza de nuevo la tabla.
    Por ultimo, se actualiza el estudiante en el listado de estudiantes y se setean en el servicio*/
    let courses: Courses[] = this.student.cursos!;
    let index = courses.findIndex((x) => x.id === course.id);
    courses.splice(index,1);
    this.dataSource.data = courses;
    this.table.renderRows();
    this.student.cursos = courses;
    this.studentService.editStudentById(this.student.id, this.student).subscribe((res) => {
      this._snackBar.open(`Se actualizó la información de los cursos de ${res.name} ${res.lastname}`, 'Ok');
    }, (error) => {
      this._snackBar.open(`${error} - No se pudo actualizar la información de los cursos del alumno`, 'Cerrar');
    })
  }

  updateStudent() {
    let indexOfStudent = this.studentsData.findIndex((x) => x.id === this.student.id);
    this.studentsData[indexOfStudent] = this.student;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
