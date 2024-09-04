import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent implements OnInit {
  contactForm: FormGroup;
  selectedFile: File | null = null;
  editMode = false;
  contactoIdToEdit: number | null = null;
  contactos: any[] = [];
  imageUrl: string | null = null;

  constructor(private fb: FormBuilder, private contactService: ContactService) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      comentarios: ['', Validators.required],
      adjunto: ['']
    });
  }

  ngOnInit(): void {
    this.loadContactos();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
        const formData = new FormData();
        formData.append('email', this.contactForm.get('email')?.value);
        formData.append('nombres', this.contactForm.get('nombres')?.value);
        formData.append('apellidos', this.contactForm.get('apellidos')?.value);
        formData.append('comentarios', this.contactForm.get('comentarios')?.value);

        if (this.selectedFile) {
            formData.append('adjunto', this.selectedFile, this.selectedFile.name);
        }

        if (this.editMode && this.contactoIdToEdit !== null) {
            this.contactService.updateContacto(this.contactoIdToEdit, formData).subscribe(() => {
                alert('Contacto actualizado correctamente');
                this.resetForm();
                this.loadContactos();
            }, error => {
                console.error('Error al actualizar el contacto:', error);
                alert('Error al actualizar el contacto');
            });
        } else {
            this.contactService.createContacto(formData).subscribe(() => {
                alert('Contacto creado correctamente');
                this.resetForm();
                this.loadContactos();
            }, error => {
                console.error('Error al crear el contacto:', error);
                alert('Error al crear el contacto');
            });
        }
    }
  }

  loadContactos(): void {
    this.contactService.getContactos().subscribe((data: any[]) => {
      this.contactos = data;
    });
  }

  editContacto(contacto: any): void {
    this.editMode = true;
    this.contactoIdToEdit = contacto.id;
    this.contactForm.patchValue({
        email: contacto.email,
        nombres: contacto.nombres,
        apellidos: contacto.apellidos,
        comentarios: contacto.comentarios,
    });

    if (contacto.adjunto) {
        this.imageUrl = 'data:image/jpeg;base64,' + contacto.adjunto; // Asegúrate de que el prefijo sea correcto para el tipo de imagen
    } else {
        this.imageUrl = null;
    }

    this.selectedFile = null;
}

  deleteContacto(id: number): void {
    this.contactService.deleteContacto(id).subscribe(() => {
      alert('Contacto eliminado correctamente');
      this.loadContactos();
    });
  }

  resetForm(): void {
    this.contactForm.reset();
    this.selectedFile = null;
    this.editMode = false;
    this.contactoIdToEdit = null;
    this.imageUrl = null;
  }

  clearFile(): void {
    this.selectedFile = null;
    this.imageUrl = null;
  }
}
