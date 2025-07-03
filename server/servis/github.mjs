import Konfiguracija from "./konfiguracija.js"
let konf = new Konfiguracija();
await konf.ucitajKonfiguraciju();

const clientID = konf.dajKonf().clientID;
const clientSecrets = konf.dajKonf().clientSecrets;


function githubPrijava(zahtjev,odgovor){
    let url = dajGithubAuthURL("http://localhost:12000/githubCallback");
    odgovor.redirect(url);
}

function dajGithubAuthURL(povratniURL){
    let url = "https://github.com/login/oauth/authorize?client_id=" + clientID + "&redirect_uri=" + povratniURL;
    return url;
}

async function githubPovratno(zahtjev, odgovor){
    let token = await dajAccessToken(zahtjev.query.code);
    zahtjev.session.githubToken = token;
    let podaci = await provjeriToken(token);
    let podaciParse = JSON.parse(podaci);
    zahtjev.session.korime = podaciParse.login;
    console.log("korime je: ", zahtjev.session.korime);
    odgovor.redirect("/");
}

async function dajAccessToken(dobiveniKod){
    let urlParametri = "?client_id=" + clientID + "&client_secret=" + clientSecrets + "&code=" + dobiveniKod;
    let o = await fetch("https://github.com/login/oauth/access_token" + urlParametri, {
    method: "POST",
    headers: {
        Accept: "application/json",
        credentials: "include"
    }
});

    let podaci = await o.text();
    console.log("Podaci su", podaci);
    return JSON.parse(podaci).access_token;
}

async function provjeriToken(token){
    let parametri = {method: "GET", headers: {Authorization: "Bearer "+token}}
    let o = await fetch("https://api.github.com/user", parametri);
    let podaci = await o.text();
    return podaci;
}

export default{
    githubPrijava,
    dajGithubAuthURL,
    githubPovratno,
    dajAccessToken,
    provjeriToken
};