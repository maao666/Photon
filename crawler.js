const { Builder, By, Key, until } = require('selenium-webdriver');
var fs = require('fs');
var request = require('request');

module.exports = {
    download: function (uri, filename, callback) {
        return download(uri, filename, callback);
    },

    getImageURLs: async function (target) {
        return getImageURLs(target);
    }
}

function download(uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.info('content-type:', res.headers['content-type']);
        console.info('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}

function isValidURL(url) {
    if (typeof url == "string") {
        if (url.indexOf("bcy.net") == -1 && url.indexOf("banciyuan/user") != -1) {
            return true;
        }
    }
    return false;
}

function postParseURL(url) {
    if (typeof url == "string") {
        return "https://img-bcy-qn.pstatp.com/" + url.substring(url.indexOf("user/"), url.indexOf("~tplv"));
    }
}

async function getImageURLs(target) {
    var driver = await new Builder().forBrowser('chrome').build();
    try {
        console.info("Opening " + target);
        await driver.get(target);
        console.info("Waiting for images to present");
        var candidates = [];
        await driver.wait(until.elementLocated(By.className("img-wrap-inner")), 10 * 1000);
        await driver.findElements(By.tagName("img")).then(async function (images) {
            console.info("Found " + images.length + " elements");
            for (var i = 0; i < images.length; i++) {
                var src = await images[i].getAttribute("src");
                if (isValidURL(src)) candidates.push(postParseURL(src));
            };
        });
        return candidates;
    }
    catch (e) {
        console.error("An exception has been caught")
        console.error(e.stack);
    }

    finally {
        console.info("Quiting WebDriver");
        await driver.quit();
    }
}

if (require.main === module) {
    const targetURL = "https://bcy.net/item/detail/6689025744636477710";

    getImageURLs(targetURL).then(function (imageURLs) {
        for (var i = 0; i < imageURLs.length; i++) {
            download(imageURLs[i], i + ".jpg", function () {
                console.log('done');
            });
        }
    });
}
