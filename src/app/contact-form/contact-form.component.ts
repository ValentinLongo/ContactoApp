import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../contact.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslationService } from '../translation.service';

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
  public translationService: TranslationService;
  selectedLanguage: string = 'en';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private modal: NzModalService,
    private message: NzMessageService,
    translationService: TranslationService
  ) {
    this.translationService = translationService;
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
      const file = input.files[0];
      if (['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageUrl = e.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.message.error(this.translationService.translate('FILE_INVALID_TYPE'));
      }
    }
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.modal.confirm({
        nzTitle: this.translationService.translate('CONFIRM_SUBMISSION'),
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
              this.message.success(this.translationService.translate('CONTACT_UPDATED_SUCCESS'));
              this.resetForm();
              this.loadContactos();
            }, error => {
              console.error('Error al actualizar el contacto:', error);
              this.message.error(this.translationService.translate('CONTACT_UPDATED_ERROR'));
            });
          } else {
            this.contactService.createContacto(formData).subscribe(() => {
              this.message.success(this.translationService.translate('CONTACT_CREATED_SUCCESS'));
              this.resetForm();
              this.loadContactos();
            }, error => {
              console.error('Error al crear el contacto:', error);
              this.message.error(this.translationService.translate('CONTACT_CREATED_ERROR'));
            });
          }
        },
        nzOnCancel: () => {
          this.message.info(this.translationService.translate('SUBMISSION_CANCELLED'));
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
      nzTitle: this.translationService.translate('CONFIRM_DELETION'),
      nzOnOk: () => {
        this.contactService.deleteContacto(id).subscribe(() => {
          this.message.success(this.translationService.translate('CONTACT_DELETED_SUCCESS'));
          this.loadContactos();
        }, error => {
          console.error('Error al eliminar el contacto:', error);
          this.message.error(this.translationService.translate('CONTACT_DELETED_ERROR'));
        });
      },
      nzOnCancel: () => {
        this.message.info(this.translationService.translate('DELETION_CANCELLED'));
      }
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
    this.resetForm();
  }

  switchLanguage(language: 'en' | 'es'): void {
    this.selectedLanguage = language;
    this.translationService.setLanguage(language); 
  }
  
}
