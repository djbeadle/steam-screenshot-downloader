const puppeteer = require('puppeteer');
const fs = require('fs');

const { getPage, getNumPages } = require('./modules/getPage');
const { getScreenshotMetadata } = require('./modules/getScreenshotUrl');
const { downloadScreenshot } = require('./modules/getScreenshots');

const prompt = require("prompt-sync")();

async function askUser(page, browser) {
    // url = "https://steamcommunity.com/profiles/76561198031201270";
    let url = prompt("Enter a Steam profile URL [ex: https://steamcommunity.com/profiles/123]:");
    let profile_id = url.split("profiles/")[1];

    // Remove any trailing slash from the input
    if (url.slice(-1) === "/") {
        url = url.slice(0, -1);
    }

    let total_pages = Number(await getNumPages(page, url))

    // Visit all of the screenshot pages and build a list of all of the page URLs
    all_screenshot_urls = [];
    let i = 1;
    while (i <= total_pages + 1 ) {
        await getPage(
            page = page,
            n = i,
            total_pages = total_pages,
            retries = 1,
            url,
            all_screenshot_urls
        ).then(elements =>
            all_screenshot_urls = all_screenshot_urls.concat(elements)
        );
        i += 1;
    }
    
    // console.log(all_screenshot_urls)

    /*
     * all_sshot_data is going to look like this;
     * {
     *   123: { // userid
     *     456: { // screenshot ID
     *       screenshot_page: "something",
     *       url: "something",
     *       description: "something else"
     *     }
     * }
    */
    let all_sshot_data = {};
    all_sshot_data[profile_id] = {};

    // Cycle through our list of screenshots and populate all_sshot_data
    let ctr = 0;
    for (sshot_url of all_screenshot_urls){
        let sshot_id = sshot_url.split('=')[1];
        console.log(`Downloading metadata for ${sshot_id} (${ctr} of ${all_screenshot_urls.length})`);

        await getScreenshotMetadata(sshot_url, page).then(data => {
            all_sshot_data[profile_id][sshot_id] = {};
            Object.assign(all_sshot_data[profile_id][sshot_id], data)
        });
        ctr += 1;
    }
    
    browser.close(); // No need to wait for this since we're done with Puppeteer

    console.log('Screenshot metadata collected.');
    
    // Ensure screenshot output directory exists
    await fs.mkdir("games", { recursive: true }, (err) => { if (err) throw err; });

    // Download each screenshot
    ctr = 0;
    for(sshot_id of Object.keys(all_sshot_data[profile_id])){
        console.log(`Downloading screenshot ${sshot_id} (${ctr}/${all_screenshot_urls.length})`);
        downloadScreenshot(
            all_sshot_data[profile_id][sshot_id],
            sshot_id
        );
        
        all_sshot_data[profile_id][sshot_id]['downloaded'] = true;

        ctr += 1;
    }
}

(async () => {
    const browser = await puppeteer.launch(),
        page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    fs.unlink('data.json', () => {});
    askUser(page, browser);
})();