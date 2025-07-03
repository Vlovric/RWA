const FavoritiDAO = require("./favoritiDAO");

exports.getFavoriti = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	const session = zahtjev.session;

	if (session && session.korime) {
        console.log("getFavoriti sesija:" + session.korime);
		const korime = session.korime;
		const fdao = new FavoritiDAO();
		odgovor.status(200);

		fdao
			.dajSveFavorite(korime)
			.then((podaci) => {
				odgovor.send(JSON.stringify(podaci));
			})
			.catch((error) => {
				odgovor.status(500).json({ error: "Pogreska", details: error });
			});
	}else {
		odgovor.status(401).json({ error: "Niste prijavljeni" });
	}
};

exports.putFavoriti = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(501);
	let poruka = { greska: "metoda nije implementirana" };
	odgovor.send(JSON.stringify(poruka));
};

exports.deleteFavoriti = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(501);
	let poruka = { greska: "metoda nije implementirana" };
	odgovor.send(JSON.stringify(poruka));
};


exports.getFavoritiId = async function (zahtjev, odgovor) {
    odgovor.type("application/json");
    const session = zahtjev.session;
    const id = parseInt(zahtjev.params.id);
    console.log("ID JE: " + id);
    let favoritiId;

    if (session && session.korime) {
        const korime = session.korime;
        const fdao = new FavoritiDAO();
        odgovor.status(200);

        try {
            const favoriti = await fdao.dajSveFavorite(korime);
            favoritiId = favoriti.filter((favorit) => parseInt(favorit.id) === id);
            fdao
                .dajFavorit(korime, id)
                .then((podaci) => {
                    odgovor.send(JSON.stringify(podaci));
                })
                .catch((error) => {
                    odgovor.status(500).json({ error: "Pogreska", details: error });
                });
        } catch (error) {
            odgovor.status(500).json({ error: "Pogreska", details: error });
        }
    } else {
        odgovor.status(401).json({ error: "Niste prijavljeni" });
    }
};

exports.postFavoritiId = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(405);
	let poruka = { greska: "zabranjeno" };
	odgovor.send(JSON.stringify(poruka));
};

exports.putFavoritiId = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(405);
	let poruka = { greska: "zabranjeno" };
	odgovor.send(JSON.stringify(poruka));
};

exports.deleteFavoritiId = async function (zahtjev, odgovor) {
    odgovor.type("application/json");
    const session = zahtjev.session;
    const id = parseInt(zahtjev.params.id);
    console.log("ID JE: " + id);
    if (session && session.korime) {
        const korime = session.korime;
        const fdao = new FavoritiDAO();
        odgovor.status(200);

        try {
            await fdao.obrisiFavorit(korime, id);
            odgovor.send(JSON.stringify({ success: true, message: "Obrisano" }));
        } catch (error) {
            odgovor.status(500).json({ error: "Pogreska", details: error });
        }
    } else {
        odgovor.status(401).json({ error: "Niste prijavljeni" });
    }
};

exports.getFavoritDetalji = async function (zahtjev, odgovor) {
    odgovor.type("application/json");
    const imeSerijeEncoded = zahtjev.params.imeSerije;
    const imeSerije = decodeURIComponent(imeSerijeEncoded);

    console.log("Usao u getFavoritDetalji");
    console.log("Ime serije: " + imeSerije);

    if (imeSerije) {
        try {
            console.log("Usao u try");
            const fdao = new FavoritiDAO();
            const sezonaInfo = await fdao.dajSezonaInfo(imeSerije);
            odgovor.status(200).send(JSON.stringify(sezonaInfo));
        } catch (error) {
            odgovor.status(500).json({ error: "Pogreska", details: error });
        }
    } else {
        odgovor.status(400).json({ error: "Nije ispravno ime serije" });
    }
};

    









