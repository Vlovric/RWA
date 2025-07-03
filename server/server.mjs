import express from "express";
import sesija from "express-session";
import kolacici from "cookie-parser";
import Konfiguracija from "./servis/konfiguracija.js";
import restKorisnik from "./servis/restKorisnik.js";
import restFavoriti from "./servis/restFavoriti.js";
import githubController from "./servis/github.mjs"
const port = 12000;
const server = express();

let konf = new Konfiguracija();
await konf.ucitajKonfiguraciju();
const secretKey = konf.dajKonf().secretKey;
const siteKey = konf.dajKonf().siteKey;
konf
	.ucitajKonfiguraciju()
	.then(pokreniServer)
	.catch((greska) => {
		console.log(greska);
		if (process.argv.length == 2) {
			console.error("Niste naveli naziv konfiguracijske datoteke!");
		} else {
			console.error("Datoteka ne postoji: " + greska.path);
		}
	});

function pokreniServer() {
	server.use(express.urlencoded({ extended: true }));
	server.use(express.json());

	server.use(kolacici());
	server.use(
		sesija({
			secret: konf.dajKonf().tajniKljucSesija,
			saveUninitialized: true,
			cookie: { maxAge: 1000 * 60 * 60 * 3 },
			resave: false,
		})
	);

	server.use((error, req, res, next) => {
		console.error(error);
		res.status(500).json({ error: "Neispravnost u zahtjevu!", details: error.message });
	});
	server.use(express.static("./angular/browser"));


	server.get("/dohvatikorime", (zahtjev, odgovor) => {
		const korime = zahtjev.session.korime;
		if (korime) {
			odgovor.status(200).json({ korime });
		} else {
			odgovor.status(401).json({ error: "Korisnik nije prijavljen." });
		}
	});

	server.get("/dohvatigithubtoken", (zahtjev, odgovor) => {
		const token = zahtjev.session.githubToken;
		console.log("token u dohvati token je ", token);
		if (token) {
		  odgovor.status(200).send({ message: "Ima" });
		} else {
		  odgovor.status(401).send({ message: "Nema" });
		}
	  });

	  server.get("/dajsitekey", (zahtjev, odgovor) => {
			odgovor.status(200).send({message: siteKey});
	  });

	server.get("/odjavikorisnika", (zahtjev, odgovor) => {
		zahtjev.session.korime = null;
		zahtjev.session.githubToken = null;
		console.log("Odjavio, korime je: " + zahtjev.session.korime);
		zahtjev.session.save((err) => {
		  if (err) {
			console.log("Usao u err");
			console.error('Error saving session:', err);
			odgovor.status(500).send('Error saving session');
		  } else {
			console.log("Poslao 200");
			odgovor.status(200).send('Logged out successfully');
		  }
		});
	  });	  
	  
	server.post("/recaptcha", async (req, res) => {
		const { token } = req.body;
		try {
		const parametri = { method: 'POST' };
		const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`, parametri);
		const recaptchaStatus = await response.json();
		console.log("status" + recaptchaStatus);
		console.log("score" + recaptchaStatus.score);
		const isValid = recaptchaStatus.success && recaptchaStatus.score > 0.5;
		res.status(200).json({ isValid });
		} catch (error) {
		console.error('Error while verifying reCAPTCHA:', error);
		res.status(500).json({ isValid: false });
		}
	});


	server.get('/githubLogin', githubController.githubPrijava);


	server.get('/githubCallback', githubController.githubPovratno);

	server.get('/iskljuci2FA', restKorisnik.iskljuci2FA);
	server.get('/ukljuci2FA', restKorisnik.ukljuci2FA);
	server.get('/kljucukljucen', restKorisnik.kljucUkljucen);

  

	pripremiPutanjePrijava();

	
	pripremiPutanjeKorisnik();
	pripremiPutanjeFavoriti();
	

	server.use((zahtjev, odgovor) => {
		odgovor.status(404);
		odgovor.json({ opis: "nema resursa" });
	});
	server.listen(port, () => {
		console.log(`Server pokrenut na portu: ${port}`);
	});
}

function pripremiPutanjeKorisnik() {
	server.get("/baza/korisnici", restKorisnik.getKorisnici);
	server.post("/baza/korisnici", restKorisnik.postKorisnici);
	server.delete("/baza/korisnici", restKorisnik.deleteKorisnici);
	server.put("/baza/korisnici", restKorisnik.putKorisnici);

	server.get("/baza/korisnici/:korime", restKorisnik.getKorisnik);
	server.post("/baza/korisnici/:korime", restKorisnik.postKorisnik);
	server.delete("/baza/korisnici/:korime", restKorisnik.deleteKorisnik);
	server.put("/baza/korisnici/:korime", restKorisnik.putKorisnik);

	server.get("/baza/logiranikorisnik", restKorisnik.getPrijavljeniKorisnik);

}

function pripremiPutanjeFavoriti(){
	server.get("/baza/favoriti", restFavoriti.getFavoriti);
	server.put("/baza/favoriti", restFavoriti.putFavoriti);
	server.delete("/baza/favoriti", restFavoriti.deleteFavoriti);

	server.get("/baza/favoriti/:id", restFavoriti.getFavoritiId);
	server.post("/baza/favoriti/:id", restFavoriti.postFavoritiId);
	server.put("/baza/favoriti/:id", restFavoriti.putFavoritiId);
	server.delete("/baza/favoriti/:id", restFavoriti.deleteFavoritiId);

	server.get("/baza/favoritDetalji/:imeSerije", restFavoriti.getFavoritDetalji);
}

function pripremiPutanjePrijava(){
	server.post(
		"/baza/korisnici/:korime/prijava",
		restKorisnik.postKorisnikPrijava
	);
	server.put(
		"/baza/korisnici/:korime/prijava",
		restKorisnik.putKorisnikPrijava
	);
	server.delete(
		"/baza/korisnici/:korime/prijava",
		restKorisnik.deleteKorisnikPrijava
	);
}
