import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import {UsuariosI} from '../../models/usuarios';
import { Router } from '@angular/router';
import {NgbModal,ModalDismissReasons, NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import { FormGroup,FormBuilder,Validators } from '@angular/forms';
import { MustMatch } from '../../helpers/must-match.validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  closeResults ='';
  public usuarios:any=[];
  public registerForm:FormGroup | any;
  public updateForm: FormGroup | any;
  public submited=false;
  public user:UsuariosI | any;

  constructor(private usuariosService:UsuariosService,
    private router:Router,
    public modal:NgbModal,
    public modalDelete:NgbModal,
    public modalUpdate:NgbModal,
    private formBuilder:FormBuilder) { 

  }

  ngOnInit(): void {

    this.registerForm=this.formBuilder.group({
      name: ['',Validators.required],
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required,Validators.minLength(6)]],
      passwordconfirm:['',Validators.required],
      tipo:['',Validators.required]
    },
    {
       validator:MustMatch('password','passwordconfirm')
    });
    this.updateForm=this.formBuilder.group({
      _id: [''],
      name: ['',Validators.required],
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required,Validators.minLength(6)]],
      tipo:['',Validators.required]
    });

    this.getUsuarios();
  }

  //metodo getter para un facil acceso a los campos del formulario
  get fields(){return this.registerForm?.controls;}

  getUsuarios(){
    this.usuariosService.getUsers()
        .subscribe(res=>{
          //console.log('llamada a getUsuarios');
          this.usuarios=res as UsuariosI[];
        })
  }//Fin de getUsuarios

  mostrarUsuario(_id:any){
    this.router.navigate(['usuarios/'+_id])
  }

  open(content:any){
    this.registerForm.reset();
    this.modal.open(content,{ariaLabelledBy:'modal-basic-title'}).result.then((result)=>{
      this.closeResults='Closed with:${result}';
    },(reason)=>{
      this.closeResults='Dismissed ${this.getDismissReason(reason)}';
    });
  }
  private getDismissReason(reason:any):string{
    if(reason===ModalDismissReasons.ESC){
      return 'by pressing ESC';
    }else if (reason===ModalDismissReasons.BACKDROP_CLICK){
      return 'by clicking on a backdrop';
    }else{
      return 'with: ${reason}';
    }
  }//fin de getDismissReason

  onSubmit(){
    this.submited=true;

    //detenemos la ejecución si la forma es invalida
    if (this.registerForm.controls["name"].status=="INVALID" ||
        this.registerForm.controls["email"].status=="INVALID" ||
        this.registerForm.controls["password"].status=="INVALID" ||
        this.registerForm.controls["passwordconfirm"].status=="INVALID"){
      return;
    }
   // console.log(this.registerForm.value);

   let usuario:UsuariosI={
     _id: 0,
     name:this.registerForm.value.name,
     email:this.registerForm.value.email,
     password:this.registerForm.value.password,
     tipo:this.registerForm.value.tipo
   }

   this.usuariosService.addUser(usuario)
   .subscribe(res =>{
    if (res.hasOwnProperty('message')){
      //Si hay un mensaje significa que hay un error al registrar el usuario
      let error:any = res;
      if (error.message=='Error user exist'){
        console.log(usuario)
        Swal.fire({
          icon:'error',
          title:'Error',
          text:'Error, el email ya está en uso,por favor utilice otro!',
          confirmButtonColor:'#A1260C'          
        });
        return;
      }//usuario existe
    }//res.hasOwnProperty
    //no existe error al registrar el usuario
    Swal.fire({
      icon:'success',
      title:'Registro exitoso',
      text:'Usuario registrado de manera exitosa',
      confirmButtonColor:'#3FEE0A'
    });
      this.getUsuarios();
      this.registerForm.reset();
      this.modal.dismissAll();
   }); 
  }//fin de onSubmit

  abrirModalEliminar(id:string, modalname:any){
    this.usuariosService.getUser(id)
           .subscribe(res=>{
             this.user=res as UsuariosI;
           })
    this.modalDelete.open(modalname,{size:'sm'}).result.then((res)=>{
      this.closeResults= 'Closed with:${res}';
    }, (reason)=>{
      this.closeResults='Dismissed ${this.getDismissReason(reason)}';
    });
  }//Fin del metodo abrirModalEliminar
  
  deleteUser(id:string){
    //console.log(id);
    this.usuariosService.removeUser(id)
              .subscribe(res =>{
                this.getUsuarios();
                this.modalDelete.dismissAll();
                Swal.fire({
                  icon:'success',
                  title:'Eliminación exitosa',
                  text:'Usuario eliminado de manera exitosa',
                  confirmButtonColor: '#3FEE0A'
                });
              })
  }//fin del método deleteUser

  modificarUsuario(usuario:UsuariosI, modal:any){
    this.updateForm=this.formBuilder.group({
      _id:[usuario._id],
      name: [usuario.name,Validators.required],
      email:[usuario.email,[Validators.required,Validators.email]],
      password:['',[Validators.required,Validators.minLength(6)]],
      tipo:[usuario.tipo,Validators.required]
    });
    this.modal.open(modal, {size:'sm'}).result.then((result)=>{
      this.closeResults='Close with: ${result}';
    },
      (reason)=>{
        this.closeResults='Dismissed ${this.getDismissReason(reason)}';
      })
  }///Fin de modificarUsuario
  updateSubmit(){
    if (this.updateForm.controls["name"].status== "INVALID" ||
        this.updateForm.controls["email"].status== "INVALID" ||
        this.updateForm.controls["password"].status== "INVALID" ){
          return;
        }
        console.log(this.updateForm.value);
        let usuario:UsuariosI={
          _id:this.updateForm.value._id,
          name:this.updateForm.value.name,
          email:this.updateForm.value.email,
          password:this.updateForm.value.password,
          tipo:this.updateForm.value.tipo
        }
        this.usuariosService.updateUser(usuario)
              .subscribe( res =>{
                console.log(res);
                if(res.hasOwnProperty('message')){
                  //si hay un mensaje significa que hay un error al actualizar
                  let error:any=res;
                  if (error.message=='Error al actualizar el usuario'){
                    Swal.fire({
                      icon:'error',
                      title:'Error',
                      text:'Error, al actualizar el usuario',
                      confirmButtonColor: '#A1260C'
                    });
                    return;
                  }//error al actualizar
                }//res.hasownproperty

                //no existe error al registrar el usuario
                Swal.fire({
                      icon:'success',
                      title:'Actualización exitosa',
                      text:'Usuario actualizado de manera exitosa',
                      confirmButtonColor: '#3FEE0A'
                });
                this.getUsuarios();
                this.registerForm.reset();
                this.modal.dismissAll();
              })
  }//fin de metodo updatesubmit
}
