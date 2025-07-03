const KorisnikDAO = require("./korisnikDAO.js");
const kodovi = require("./kodovi.js");

exports.getKorisnici = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	let kdao = new KorisnikDAO();
	odgovor.status(200);
	kdao.dajSve().then((korisnici) => {
		console.log(korisnici);
		odgovor.send(JSON.stringify(korisnici));
	});
};

exports.postKorisnici = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	console.log("Usao u postKorisnici");
	let podaci = zahtjev.body;
	let kdao = new KorisnikDAO();
	odgovor.status(201);
	kdao.dodaj(podaci).then((poruka) => {
		if (poruka.error) {
            console.error("SQLite error:", poruka);
        }
		odgovor.send(JSON.stringify(poruka));
	});
};

exports.deleteKorisnici = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(501);
	let poruka = { greska: "metoda nije implementirana" };
	odgovor.send(JSON.stringify(poruka));
};

exports.putKorisnici = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(501);
	let poruka = { greska: "metoda nije implementirana" };
	odgovor.send(JSON.stringify(poruka));
};

exports.getKorisnik = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	let kdao = new KorisnikDAO();
	let korime = zahtjev.params.korime;
	odgovor.status(200);
	kdao.daj(korime).then((korisnik) => {
		console.log(korisnik);
		odgovor.send(JSON.stringify(korisnik));
	});
};

exports.getPrijavljeniKorisnik = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	const kdao = new KorisnikDAO();
	const session = zahtjev.session;

	if (session && session.korime) {
		const korime = session.korime;
		odgovor.status(200);

		kdao
			.daj(korime)
			.then((korisnik) => {
				odgovor.send(JSON.stringify(korisnik));
			})
			.catch((error) => {
				odgovor.status(500).json({ error: "Pogreska", details: error });
			});
	} else {
		odgovor.status(401).json({ error: "Niste prijavljeni" });
	}
};

exports.postKorisnikPrijava = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	let kdao = new KorisnikDAO();
	let korime = zahtjev.params.korime;
	const userAgent = zahtjev.headers['user-agent'];
	if(userAgent.includes('curl')) zahtjev.body.lozinka = kodovi.kreirajSHA256(zahtjev.body.lozinka, korime);
	odgovor.status(201);
	kdao.daj(korime).then((korisnik) => {
		if (korisnik != null && korisnik.lozinka == zahtjev.body.lozinka)
		{
			zahtjev.session.korisnik = korisnik.ime + " " + korisnik.prezime;
			zahtjev.session.korime = korime;
			odgovor.send(JSON.stringify(korisnik));
		}
		else {
			odgovor.status(400);
			odgovor.send(JSON.stringify({ greska: "Krivi podaci!" }));
		}
	});
};

exports.putKorisnikPrijava = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(501);
	let poruka = { greska: "metoda nije implementirana" };
	odgovor.send(JSON.stringify(poruka));
};

exports.deleteKorisnikPrijava = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(501);
	let poruka = { greska: "metoda nije implementirana" };
	odgovor.send(JSON.stringify(poruka));
};

exports.postKorisnik = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(405);
	let poruka = { greska: "zabranjeno" };
	odgovor.send(JSON.stringify(poruka));
};

exports.deleteKorisnik = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	let korime = zahtjev.params.korime;
	let kdao = new KorisnikDAO();
	odgovor.status(201);
	kdao.obrisi(korime).then((poruka) => {
		odgovor.send(JSON.stringify(poruka));
	});
};

exports.putKorisnik = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    let korime = zahtjev.params.korime;
    let podaci = zahtjev.body;
	console.log("putKorisnik PODACI: " + podaci);
	console.log("Request body:", JSON.stringify(podaci, null, 2));

    let kdao = new KorisnikDAO();
    
    kdao.azuriraj(korime, podaci).then((poruka) => {
        if (poruka === true) {
            odgovor.status(200).send(JSON.stringify({ message: "Korisnik ažuriran!" }));
        } else {
            odgovor.status(500).send(JSON.stringify({ error: "Greška pri ažuriranju korisnika" }));
        }
    }).catch((error) => {
        odgovor.status(500).send(JSON.stringify({ error: "Greška pri ažuriranju korisnika", details: error }));
    });
};

exports.iskljuci2FA = function(zahtjev, odgovor){
	odgovor.type("application/json");
	let kdao = new KorisnikDAO();
	let korime = zahtjev.session.korime;
	kdao.iskljuci2FA(korime).then((poruka) => {
		if(poruka === "Isključeno"){
			odgovor.status(200).send(JSON.stringify({message: poruka}));
		}else if(poruka === "Nema tajni ključ"){
			odgovor.status(201).send(JSON.stringify({message: poruka}));
		}else if(poruka === "Već je isključeno"){
			odgovor.status(202).send(JSON.stringify({message: poruka}));
		}
	})
};

exports.ukljuci2FA = function(zahtjev, odgovor){
	odgovor.type("application/json");
	let kdao = new KorisnikDAO();
	let korime = zahtjev.session.korime;
	kdao.ukljuci2FA(korime).then((poruka) => {
		if(poruka === "Uključeno"){
			odgovor.status(200).send(JSON.stringify({message: poruka}));
		}else if(poruka === "Već je uključeno"){
			odgovor.status(201).send(JSON.stringify({message: poruka}));
		}else{
			odgovor.status(202).send(JSON.stringify({message: poruka}));
		}
	})
};
exports.kljucUkljucen = function(zahtjev, odgovor){
	odgovor.type("application/json");
	let kdao = new KorisnikDAO();
	let korime = zahtjev.session.korime;
	kdao.ukljucenoStatus(korime).then((poruka) => {
		if(poruka){
			odgovor.status(200).send(JSON.stringify({message: "Uključeno"}));
		}else{
			odgovor.status(201).send(JSON.stringify({message: "Isključeno"}));
		}
	})
}
