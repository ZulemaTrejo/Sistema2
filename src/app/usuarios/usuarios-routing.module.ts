import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {UsuariosComponent}from './components/usuarios/usuarios.component'
import { LoginComponent } from './components/login/login.component';
import { CanActivateGuard } from '../can-activate.guard';
import { UsuariodetalleComponent } from './components/usuariodetalle/usuariodetalle.component';

const routes: Routes = [
  {path: 'usuarios',component:UsuariosComponent,canActivate:[CanActivateGuard],
          children:[
            {path:':id',component:UsuariodetalleComponent}
          ]
        },
  {path: 'login',component:LoginComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }
