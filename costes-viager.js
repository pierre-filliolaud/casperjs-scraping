// http://toddhayton.com/2015/03/20/scraping-with-casperjs/
var casper = require('casper').create({
    verbose: false,
    logLevel: "error",
    pageSettings: {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20130404 Firefox/23.0"
    }
});
// var url = 'https://www.costes-viager.com/recherche';
var url = 'https://www.costes-viager.com/recherche#s=eyJsIjpmYWxzZSwibyI6ZmFsc2UsImJpZW5fdHlwZV9pZCI6LTEsImJvdXF1ZXQiOnsibWluIjowLCJtYXgiOjEwMDAwMH0sInJlbnRlIjp7Im1pbiI6MCwibWF4Ijo1MDB9LCJ3Ijp7IjEiOls5Nzc2LDEwNTgxXSwiMyI6Wzc0XX19';
var currentPage = 1;
var annonces = [];

var terminate = function() {
    this.echo("Exiting..").exit();
};

function getAnnonces() {
// Scrape the links from top-right nav of the website
    var rows = document.querySelectorAll('article.annonce');
    var annonces = [];
    for (var i = 0, row; row = rows[i]; i++) {
            var annonce = {};
            var a = row.querySelector('header.top h2 a');
            var p = row.querySelector('p');
            var prices = row.querySelectorAll('div.descriptif ul.valeur li');
            annonce['dossierId'] = a.getAttribute('data-dossier-id');
            annonce['title'] = a.innerText;
            annonce['url'] = a.getAttribute('href');
            annonce['creditRentier'] = p.innerText;
            if (prices!=null && prices.length>0) {
              annonce['vendu'] = false;
              var bouquet = prices[0].querySelectorAll('span');
              var rente = prices[1].querySelectorAll('span');
              if (bouquet!=null) {
                annonce['bouquet'] = bouquet[1].innerText;
              }
              if (rente!=null) {
                annonce['rente'] = rente[1].innerText;
              }
            } else {
              annonce['vendu'] = true;
            }

            var valeurBien = row.querySelector('div.descriptif ul.droits-de-jouissance li.valeur-du-bien');
            if (valeurBien!=null) {
              annonce['valeurBien'] = valeurBien.innerText.replace('Valeur du bien : ', "").replace(" ", "").replace(" €", "");
            }
            var valeurOccupee = row.querySelector('div.descriptif ul.droits-de-jouissance li.valeur-occupee');
            if (valeurOccupee!=null) {
              annonce['valeurOccupee'] = valeurOccupee.innerText.replace('Valeur occupée: ', "").replace(" ", "").replace(" €\n(prix d’achat)", "");
            }

            //.replace(/\-.*$/g, "");
            annonces.push(annonce);
        }

        return annonces;
}

function getSelectedPage() {
    var el = document.querySelector('nav.pagination ul li button.active');
    return parseInt(el.textContent);
}

var processPage = function() {
    console.log("processPage: "+currentPage);
    annonces = this.evaluate(getAnnonces);
    require('utils').dump(annonces);

    if (currentPage >= 3 || !this.exists(".results")) {
        return terminate.call(casper);
    }

    currentPage++;

    this.thenClick("button.next").then(function() {
        console.log("process next Page");
        this.waitFor(function() {
            return currentPage === this.evaluate(getSelectedPage);
        }, processPage, terminate);
    });
};

// Opens casperjs homepage
casper.start(url);

casper.waitForSelector('.results', processPage, terminate);

// casper.then(function () {
//     annonces = this.evaluate(getAnnonces);
// });
//
// casper.run(function () {
//   // console.log(this.evaluate(getSelectedPage));
//   require('utils').dump(annonces);
//     // for(var i in annonces) {
//     //     console.log(annonces[i].title);
//     // }
//     casper.done();
// });

casper.run();
