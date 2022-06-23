import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentService } from 'src/app/core/services/student.service';
import { UserService } from 'src/app/core/services/user.service';
import { Student } from 'src/app/shared/interfaces/student.interface';
import { User } from 'src/app/shared/interfaces/user.interface';
import { map } from 'rxjs/operators'
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-students-list',
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.scss']
})
export class StudentsListComponent implements OnInit, AfterViewInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  loading: boolean = false;

  @ViewChild(MatTable, { static: false }) table!: MatTable<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  user!: User | null;

  studentsData!: Student[];


  displayedColumns = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<Student>();

  constructor(
    private titleService: Title,
    private userService: UserService,
    private studentService: StudentService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Alumnos')
    this.loading = true;
    this.getUserData();
    this.getStudents();
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

  getStudents() {
    this.subscriptions.add(
      this.studentService.getStudents()
        .pipe(
          map((students) => {
            students.forEach(student => {
              student.lastname = student.lastname.toUpperCase();
            });
            return students
          })
        )
        .subscribe((data: Student[]) => {
          this.studentsData = data
          this.dataSource.data = this.studentsData;
          this.loading = false
        }, (error) => {
          this._snackBar.open(`${error} - No se pudo recuperar la información de los alumnos`);
        })
    )
  }

  onClickDetails(student: Student) {
    this.router.navigate([`dashboard/students/${student.id}`])
  }

  onDeleteStudent(id: number) {
    /* Se busca el elemento por el id en el array de estudiantes,
    Se elimina por el index, y luego usando el ViewChild, se renderiza de nuevo la tabla.
    Por ultimo, se actualiza el listado de estudiantes en el servicio */
    let index = this.studentsData.findIndex((student) => student.id === id);
    this.studentsData.splice(index, 1);
    this.dataSource.data = this.studentsData;
    this.table.renderRows();
    this.subscriptions.add(
      this.studentService.deleteStudentById(id).subscribe((res) => {
        console.log('respuesta del delete: ', res)
        this._snackBar.open(`${res.name} ${res.lastname} fue eliminado con exito del listado de alumnos`, 'Ok')
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo eliminar el alumno`, 'Cerrar');
      })
    );
  }

  onClickAdd() {
    this.studentService.setStudentToEdit(null)
      .then(() => this.router.navigate(['dashboard/students/studentform']))
      .catch((error) => this._snackBar.open(error.message, 'Cerrar'))
  }

  onClickEdit(student: Student) { //Actualiza el estudiante a editar en el servicio
    student.lastname = student.lastname[0] + student.lastname.slice(1).toLowerCase(); //Vuelve a dejar el apellido en PascalCase
    this.studentService.setStudentToEdit(student)
      .then(() => { //Se actualizo en el servicio el studentToEdit
        this.router.navigate(['dashboard/students/studentform']);
      })
      .catch((error) => {
        this._snackBar.open(error.message, 'Cerrar');
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
