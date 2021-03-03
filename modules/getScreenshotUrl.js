const fs = require('fs'),
    getScreenshots = require('./getScreenshots');

/**
 * Visit each screenshot URL and scrape what data we can from it.
 * 
 * @param {*} num 
 */
async function getScreenshotMetadata(sshot_url, page) {
    await page.goto(sshot_url);

    const screenshot_a = await page.$('.actualmediactn a');
    const screenshot_href = await page.evaluate(screenshot_a => screenshot_a.href, screenshot_a);

    //console.log(screenshot_href);

    let gameName = "Unknown Game";
    const gameName_el = await page.$('.screenshotAppName');
    if (gameName_el) {
        gameName = await page.evaluate(gameName_el => gameName_el.textContent, gameName_el);
    }

    //console.log(gameName);

    let game_appid = "";
    const gameAppID_el = await page.$('body > div.responsive_page_frame.with_header > div.responsive_page_content > div.responsive_page_template_content > div.apphub_HomeHeaderContent > div.apphub_HeaderTop > div.apphub_OtherSiteInfo.responsive_hidden > a');
    if (gameAppID_el) {
        game_appid = await page.evaluate(gameAppID_el => gameAppID_el.getAttribute('data-appid'), gameAppID_el);
        //console.log(game_appid);
    }

    let screenshot_description = false;
    const description_el = await page.$('#description');
    const date_posted = await page.$('div.detailsStatsContainerRight > div.detailsStatRight:nth-child(2)');
    if (description_el) {
        //alternative to remove the quotes
        /*const s = await p.evaluate(description_el =>  description_el.textContent, description_el);
        screenshot_description = s.substring(1, s.length-1);*/

        screenshot_description = await page.evaluate(description_el => description_el.textContent, description_el);
        screenshot_posted = await page.evaluate(date_posted => date_posted.textContent, date_posted);
    }

    return {
        screenshot_page: sshot_url,
        url: screenshot_href,
        description: screenshot_description,
        date_posted: screenshot_posted,
        game: {
            name: gameName,
            appid: game_appid
        }
    };
}

module.exports = { getScreenshotMetadata };