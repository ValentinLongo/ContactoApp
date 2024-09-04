import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:5005/api/Contacto';

  constructor(private http: HttpClient) { }

  createContacto(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, {
      headers: new HttpHeaders({
      })
    });
  }

  getContactos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getContactById(contactId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${contactId}`);
  }

  updateContacto(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData, {
      headers: new HttpHeaders({
      })
    });
  }

  deleteContacto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
