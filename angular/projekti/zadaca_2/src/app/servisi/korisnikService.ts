// korisnikService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KorisnikService {
  private korimeSubject = new BehaviorSubject<string>('');
  private restServis = environment.restServis;

  korime$ = this.korimeSubject.asObservable();

  constructor(private http: HttpClient) {}

  updateKorime() {
    this.http.get<any>(`${this.restServis}/dohvatikorime`, { withCredentials: true })
      .subscribe(
        (response) => {
          if (response.korime) {
            this.korimeSubject.next(response.korime);
          } else {
            this.korimeSubject.next('Morate se prijaviti!');
          }
        },
        (error) => {
          console.error('Error fetching username:', error);
          this.korimeSubject.next('Morate se prijaviti!');
        }
      );
  }
}
