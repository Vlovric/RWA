import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GithubAuthService {
  private restServis = environment.restServis;

  constructor(private http: HttpClient, private router: Router) {}

  initiateGithubLogin() {
    window.location.href = `${this.restServis}/githubLogin`;

  }

  async provjeriGithubToken(): Promise<any> {
    try {
      const response = await this.http.get(`${this.restServis}/dohvatigithubtoken`).toPromise();
      console.log("Odgovor je", response);
      return response;
    } catch (error) {
      throw new Error('Error checking GitHub token');
    }
  }
}
