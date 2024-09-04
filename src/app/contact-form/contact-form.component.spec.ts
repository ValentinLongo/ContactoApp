import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ContactFormComponent } from './contact-form.component';
import { ContactService } from '../contact.service';

describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;
  let contactService: ContactService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ContactFormComponent],
      providers: [ContactService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    contactService = TestBed.inject(ContactService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a form with 5 controls', () => {
    expect(component.contactForm.contains('email')).toBeTrue();
    expect(component.contactForm.contains('nombres')).toBeTrue();
    expect(component.contactForm.contains('apellidos')).toBeTrue();
    expect(component.contactForm.contains('comentarios')).toBeTrue();
    expect(component.contactForm.contains('adjunto')).toBeTrue();
  });

  it('should require email field to be valid', () => {
    const emailControl = component.contactForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalse();
  });

});
