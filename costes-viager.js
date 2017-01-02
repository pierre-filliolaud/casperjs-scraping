// http://toddhayton.com/2015/03/20/scraping-with-casperjs/
var casper = require('casper').create({
    pageSettings: {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20130404 Firefox/23.0"
    }
});
var url = 'https://www.costes-viager.com/recherche';
var currentPage = 1;
var annonces = [];

var terminate = function() {
    this.echo("Exiting..").exit();
};

function getAnnonces() {
// Scrape the links from top-right nav of the website
    var rows = document.querySelectorAll('article.annonce');
    var annonces = [];

    // return Array.prototype.map.call(annonces, function (e) {
    //   var annonce = {};
    //   annonce['title'] = e.innerText;
    //   // console.log(e.innerText);
    // //     // return e.getAttribute('href')
    // return e.innerText
    // });

    for (var i = 0, row; row = rows[i]; i++) {
            var annonce = {};
            var a = row.querySelector('header h2 a');
            var p = row.querySelector('p');
            annonce['title'] = a.innerText;
            annonce['url'] = a.getAttribute('href');
            annonce['creditRentier'] = p.innerText;
            annonces.push(annonce);
        }

        return annonces;

    // return Array.prototype.map.call(links, function (e) {
//         return e.getAttribute('href')
// //        return e.innerText
//     });
}

// Opens casperjs homepage
casper.start(url);

casper.then(function () {
    annonces = this.evaluate(getAnnonces);
});

casper.run(function () {
  require('utils').dump(annonces);
    // for(var i in annonces) {
    //     console.log(annonces[i].title);
    // }
    casper.done();
});
