import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = new BehaviorSubject<string>('en');
  private translations: { [key: string]: string } = {};

  constructor(private http: HttpClient) {
    this.loadTranslations(this.currentLanguage.value);
  }

  setLanguage(language: string) {
    this.currentLanguage.next(language);
    this.loadTranslations(language);
  }

  private loadTranslations(language: string) {
    this.http.get<{ [key: string]: string }>(`assets/i18n/${language}.json`)
      .pipe(
        map(translations => this.translations = translations)
      )
      .subscribe();
  }

  translate(key: string): string {
    return this.translations[key] || key;
  }
}
