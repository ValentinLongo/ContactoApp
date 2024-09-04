import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../contact.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

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

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombres: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$')]],
      apellidos: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$')]],
      comentarios: ['', [Validators.required, Validators.pattern('^[a-zA-ZñÑáéíóúÁÉÍÓÚ.,!? ]+$')]],
      adjunto: ['']
    });
  }

  ngOnInit(): void {
    this.loadContactos();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageUrl = e.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.message.error('El archivo debe ser una imagen o un PDF');
      }
    }
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.modal.confirm({
        nzTitle: '¿Está seguro de que desea enviar el formulario?',
        nzOnOk: () => {
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
              this.message.success('Contacto actualizado correctamente');
              this.resetForm();
              this.loadContactos();
            }, error => {
              console.error('Error al actualizar el contacto:', error);
              this.message.error('Error al actualizar el contacto');
            });
          } else {
            this.contactService.createContacto(formData).subscribe(() => {
              this.message.success('Contacto creado correctamente');
              this.resetForm();
              this.loadContactos();
            }, error => {
              console.error('Error al crear el contacto:', error);
              this.message.error('Error al crear el contacto');
            });
          }
        },
        nzOnCancel: () => {
          this.message.info('Envío cancelado');
        }
      });
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
      this.imageUrl = 'data:image/jpeg;base64,' + contacto.adjunto;
    } else {
      this.imageUrl = null;
    }

    this.selectedFile = null;
  }

  deleteContacto(id: number): void {
    this.modal.confirm({
      nzTitle: '¿Estás seguro de que deseas eliminar este contacto?',
      nzOnOk: () => {
        this.contactService.deleteContacto(id).subscribe(() => {
          this.message.success('Contacto eliminado correctamente');
          this.loadContactos();
        }, error => {
          console.error('Error al eliminar el contacto:', error);
          this.message.error('Error al eliminar el contacto');
        });
      },
      nzOnCancel: () => {
        this.message.info('Eliminación cancelada');
      }
    });
  }

  resetForm(): void {
    this.contactForm.reset();
    this.imageUrl = null;
    this.selectedFile = null;
    this.editMode = false;
    this.contactoIdToEdit = null;
  }
}
