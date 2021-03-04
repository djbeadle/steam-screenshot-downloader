const puppeteer = require('puppeteer');
const fs = require('fs');

const { getPage, getNumPages } = require('./modules/getPage');
const { getScreenshotMetadata } = require('./modules/getScreenshotUrl');
const { downloadScreenshot } = require('./modules/getScreenshots');
const { ENOENT } = require('constants');
const { profile } = require('console');

const prompt = require("prompt-sync")();

async function askUser(page, browser) {
    const TEST_RUN = false; // if true just download one of each

    // url = "https://steamcommunity.com/profiles/76561198031201270";
    let url = prompt("Enter a Steam profile URL [ex: https://steamcommunity.com/profiles/123]:");
    let profile_id = url.split("profiles/")[1].replace('/', "");

    // Remove any trailing slash from the input
    if (url.slice(-1) === "/") {
        url = url.slice(0, -1);
    }

    // Try reading any existing data.json file
    db_obj = {};
    try {
        let db = fs.readFileSync('./data.json');
        db_obj = JSON.parse(db);
    }
    catch (ENOENT){
        console.log('No previous ./data.json file, that\'s OK!');
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
        
        if (TEST_RUN){
            break;
        }
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
    all_sshot_data = {};

    // Cycle through our list of screenshots and populate all_sshot_data
    let ctr = 0;
    for (sshot_url of all_screenshot_urls){
        ctr += 1;
        let sshot_id = sshot_url.split('=')[1];

        try {
            if ( 'date_posted' in (db_obj[profile_id][sshot_id] || {}) ){
                // If the metadata has been retrieved but the image hasn't been downloaded queue it
                if (db_obj[profile_id][sshot_id].downloadeded === false){
                    Object.assign(all_sshot_data[sshot_id], db_obj[profile_id][sshot_id])
                    console.log(`${ctr}/${all_screenshot_urls.length} - Metadata for ${sshot_id} has already been downloaded, queuing the image.`);
                }
                // If we've already downloaded the metadata and the image skip it completly
                else {
                    console.log(`${ctr}/${all_screenshot_urls.length} - Metadata and image for ${sshot_id} has already been downloaded.`);
                }
                
                continue;
            }
        } catch (e){
            // It doesn't exist, we don't need to do anything.
            console.log(e);

        }

        console.log(`${ctr}/${all_screenshot_urls.length} - Downloading metadata for ${sshot_id} and queuing image`);

        await getScreenshotMetadata(sshot_url, page).then(data => {
            all_sshot_data[sshot_id] = {};
            Object.assign(all_sshot_data[sshot_id], data)
        });

        if (TEST_RUN){
            break;
        }
    }
    
    browser.close(); // No need to wait for this since we're done with Puppeteer
    
    // Ensure screenshot output directory exists
    const output_folder_name = `user_${profile_id}`;
    await fs.mkdir(output_folder_name, { recursive: true }, (err) => { if (err) throw err; });

    // Calculate the number of queued screenshots that have not been downloaded already
    const num_photos_to_download = Object.entries(all_sshot_data).filter((sshot_entry, _) => !sshot_entry.downloaded).length;
    
    console.log('');
    console.log(`${num_photos_to_download} screenshot is queued for download.`);
    console.log('');

    // Download each screenshot
    ctr = 0;
    for(sshot_id of Object.keys(all_sshot_data)){
        ctr += 1;
        // Skip if we've already downloaded this image
        try {
            if (db_obj[profile_id][sshot_id].downloaded){
                console.log(`Skipping ${sshot_id} because it was previously downloaded`);
                continue;
            }
        } catch (TypeError){
            // It doesn't exist, we don't need to do anything.
        }

        console.log(`${ctr}/${num_photos_to_download} - Downloading screenshot ${sshot_id}`);

        try{
            downloadScreenshot(
                output_folder_name,
                all_sshot_data[sshot_id],
                sshot_id
            );
            all_sshot_data[sshot_id]['downloaded'] = true;
        }
        catch (TypeError) {
            console.log(`  This download failed! Running the script again will attempt to redownload this file.`)
        }

        if (TEST_RUN){
            break;
        }
    }

    // Update db_obj with the data from the current session
    if (profile_id in db_obj){
        Object.assign(db_obj[profile_id], all_sshot_data);
    }
    else {
        db_obj[profile_id] = all_sshot_data;
    }

    // Write the metadata to data.json
    try{
        fs.rmSync('data.json');
    } catch (e){}

    try {
        fs.writeFileSync('data.json', JSON.stringify(db_obj));
    } catch (e){
        console.log("Some weird error occurred");
        console.log(e);
    }
    
}

(async () => {
    const browser = await puppeteer.launch(),
        page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    askUser(page, browser);
})();