var fs = require("fs");
var open = require("open");
var scrapeIt = require("scrape-it");
var jsonfile = require("jsonfile");
var webdriver = require("selenium-webdriver"),
    By = webdriver.By,
    until = webdriver.until;
var firefox = require('selenium-webdriver/firefox');

var file = "datax.json";

var binary = new firefox.Binary('./Firefox.app/Contents/MacOS/firefox');
//binary.addArguments("-headless"); //anglukh

var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(new firefox.Options().setBinary(binary))
    .build();

function sc(marz_num) {
    driver.get('https://www.dasaran.am/apps/schools');

    driver.sleep(2000).then(() => {
        driver.findElement(
            By.css('#regionlist_select>option[value="' + marz_num + '"]')
        ).click();
    });

    driver.sleep(2000).then(function () {
        driver.getPageSource().then(function (html) {
            // console.log(html)
            f = 'file' + marz_num + '.html'
            fs.writeFile(f, html, function (err) {
                if (err) { throw (err); };
                console.log(__dirname + f);
                open('file://' + __dirname + '/' + f);
            });
            var datax = scrapeIt.scrapeHTML(html, {
                schools: {
                    listItem: ".school-item",
                    data: {
                        title: "header > h5",
                        address: ".school-address > span",
                        director: {
                            selector: ".school-description > li:nth-child(2) > span",
                            convert: function (x) {
                                var re = /Տնօրեն՝ (.*)/i;
                                //console.log(re.test(x))
                                if (re.test(x)) {
                                    var found = x.match(re);
                                    console.log(found[1]);
                                    return found[1];
                                } else {
                                    return "";
                                }
                            }
                        },
                        ponenumber: ".school-description > li:nth-child(3) > span"

                    }
                }
            });
            //console.log(datax);
            console.log(datax.schools.length);
            jsonfile.writeFile(file, datax, { spaces: 2 }, function (err) {
                console.error(err)
            });
        });
    });
}

sc(1)

driver.quit();
