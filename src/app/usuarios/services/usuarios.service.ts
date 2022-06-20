import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http';
import { Observable,BehaviorSubject,Subject } from 'rxjs';
import {tap} from 'rxjs/operators';
import  jwt_decode from 'jwt-decode';

import {UsuariosI} from '../models/usuarios';
import {TokenI} from '../models/token';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  AUTH_SERVER:string='http://localhost:3000/api/';
  authSubject= new BehaviorSubject(false);

  private token: any ='';

  public urlUsuarioIntentaAcceder:string='';
  public changeLoginStatusSubject=new Subject<boolean>();
  public changeLoginStatus$=this.changeLoginStatusSubject.asObservable();

  public changeUserTypeSubject=new Subject<String>();
  public changeUserType$=this.changeUserTypeSubject.asObservable();

  constructor(private httpClient:HttpClient) { }
  
  login(user:UsuariosI):Observable<TokenI>{
    return this.httpClient.post<TokenI>(this.AUTH_SERVER+'login',user)
    .pipe(tap(
      ((res)=>{
        if(res.success){//success=true <---Usuario y contraseña correctos
          var decode:any =jwt_decode(res.token);
          //guarda token en localstorage
          var userName=decode.user.name;
          this.changeUserTypeSubject.next(userName);
          this.saveToken(res.token,decode.exp)
          this.changeLoginStatusSubject.next(true);

          //Emitir el tipo de usuario a variable global en memoria
          var userType=decode.user.tipo;
          this.changeUserTypeSubject.next(userType);
        }
        return this.token;
      })
    )//tap
    );//.pipe
  }//Fin de Login


logout():void{
  this.token='';
  localStorage.removeItem("ACCESS_TOKEN");
  localStorage.removeItem("EXPIRES_IN");
  this.changeLoginStatusSubject.next(false);
  }

  private saveToken(token:any,expiresIn:any):void{
    localStorage.setItem("ACCESS_TOKEN",token);
    localStorage.setItem("EXPIRES_IN",expiresIn);
    this.token=token;
  }//fin de savetoken
  private getToken():string{
    if(this.token){
      this.token=localStorage.getItem("ACCESS_TOKEN");
    }
    return this.token;
  }//fin de gettoken

  isLoggedIn(url:string):boolean{
    const isLogged=localStorage.getItem("ACCESS_TOKEN");
    if(!isLogged){
      this.urlUsuarioIntentaAcceder=url;
      return false;
    }
    return true;
  }//fin de isLoggedIn

  getUsers(){
    return this.httpClient.get(
      this.AUTH_SERVER+'users',
      {
       headers:new HttpHeaders({
                   'Content-Type':'application/json',
                   'Authorization':'token-auth '+this.getToken()
       })
      }
    )
  }//Fin de getUsers

  getUser(id:string){
    return this.httpClient.get(
      this.AUTH_SERVER+'users/'+id,
      {
        headers:new HttpHeaders({'Authorization': 'token-auth ' + this.getToken()})
      }
    );
  }//fin getUser

  addUser(usuario:UsuariosI){
    return this.httpClient.post(
      this.AUTH_SERVER+'users/', usuario,
      {
        headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        'Authorization': 'token-auth ' + this.getToken()
        })
      }
    );
  }//fin de addUser

 removeUser(id:string){
  return this.httpClient.delete(
    this.AUTH_SERVER+'users/'+id,
    {
    headers:new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'token-auth '+this.getToken()
    })
    }
  )
 }//Fin de removeUser

 updateUser(usuario:UsuariosI){
   return this.httpClient.put(
     this.AUTH_SERVER+'users/'+ usuario._id, usuario,
     {
       headers:new HttpHeaders({
         'Content-Type': 'application/json',
         'Authorization': 'token-auth ' + this.getToken()
       })
     }
   );
 }//Fin de updateUser
}
 