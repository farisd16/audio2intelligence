// language.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private languageSubject = new BehaviorSubject<'en' | 'ru'>('en');
  language$ = this.languageSubject.asObservable();

  get currentLanguage(): 'en' | 'ru' {
    return this.languageSubject.value;
  }

  toggleLanguage(): void {
    const newLang = this.currentLanguage === 'en' ? 'ru' : 'en';
    this.languageSubject.next(newLang);
  }

  setLanguage(lang: 'en' | 'ru'): void {
    this.languageSubject.next(lang);
  }
}
