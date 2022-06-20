import { FormGroup } from "@angular/forms";

//Validador para hacer que coincidan los datos
export function MustMatch(controlName:string,matchingControlName:string){
    return (formGroup:FormGroup)=>{
        const control=formGroup.controls[controlName];
        const matchingControl=formGroup.controls[matchingControlName];

        if (matchingControl.errors && ! matchingControl.errors['mustMatch']){
            //ejecutamos return si otro validador ha encontrado errores
            //en el control de errores matchingControl
            return;
        }

        //establecemos el control de errores matchingControl
        //en verdadero si la validación falla
        if (control.value !=matchingControl.value){
            matchingControl.setErrors({mustMatch:true});
        }else{
            matchingControl.setErrors(null);
        }
    }
}