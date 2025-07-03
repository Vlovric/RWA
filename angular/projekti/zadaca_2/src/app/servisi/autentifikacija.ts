import { environment } from '../environments/environment';
import { kreirajSHA256, kreirajSHA256Sol } from './moduli/kodovi';

class Autentifikacija {
  private restServis = environment.restServis;
  async dodajKorisnika(korisnik: any): Promise<boolean> {
    let tijelo = {
      ime: korisnik.ime,
      prezime: korisnik.prezime,
      email: korisnik.email,
      korime: korisnik.korime,
      lozinka: korisnik.lozinka,
      uloga: korisnik.uloga,
    };
    console.log('dodajKorisnika korime: ' + korisnik.korime);
    console.log(
      'dodajKorisnika hash lozinka: ' +
        kreirajSHA256Sol(korisnik.lozinka, korisnik.korime)
    );
    let zaglavlje = new Headers({
      'Content-Type': 'application/json'
    });

    let parametri = {
      method: 'POST',
      body: JSON.stringify(tijelo),
      headers: zaglavlje,
    };
    let odgovor = await fetch('/baza/korisnici', parametri);
    console.log("Odgovor: ", odgovor);
    console.log("Odgovor status: ", odgovor.status);

    if (odgovor.status == 201) {
      return true;
    } else {
      return false;
    }
  }

  async prijaviKorisnika(korime: string, lozinka: string): Promise<boolean | string> {
    console.log('prijaviKorisnika lozinka: ' + lozinka);
    lozinka = kreirajSHA256Sol(lozinka, korime);
    let tijelo = {
      lozinka: lozinka,
    };
    console.log('prijaviKorisnika hash lozinka: ' + lozinka);
    console.log('prijaviKorisnika korime: ' + korime);
    let zaglavlje = new Headers();
    zaglavlje.set('Content-Type', 'application/json');

    let parametri = {
      method: 'POST',
      body: JSON.stringify(tijelo),
      headers: zaglavlje,
    };
    let odgovor = await fetch(this.restServis + '/baza/korisnici/' + korime + '/prijava', parametri);
    let o = await odgovor.text();
    console.log('odgovor.text od fetcha: ' + o);
    if (odgovor.status == 201) {
      return o;
    } else {
      return false;
    }
  }
}

export default Autentifikacija;
