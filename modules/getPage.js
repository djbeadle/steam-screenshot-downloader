const fs = require('fs');
/**
 * Load the user's screenshot page and see how many pages there are.
 * 
 * @param {*} page 
 * @param {*} userURL 
 */
async function getNumPages(page, userURL){
    let p = `${userURL}/screenshots/?appid=0&p=1&sort=oldestfirst&browsefilter=myfiles&view=grid`;
    await page.goto(p);
    
    // Get the total number of pages
    const pages = await page.$('div.pagingPageLinks > a:nth-last-child(2)');
    const total_pages = await page.evaluate(pages => pages.textContent, pages);
    
    console.log(`Found ${total_pages} pages.`)

    return total_pages;
}

/**
 * 
 * Get each page and scrape the screenshot URLs out of it, return a list of screenshot links
 * 
 * @param {*} page 
 * @param {*} n 
 * @param {*} total_pages 
 * @param {*} retries 
 * @param {*} userURL 
 */
async function getPage(page, n, total_pages, retries = 1, userURL = null) {
    console.log('');
    console.log(`getPage: ${n}`);
    
    //example: invalid page 
    //let p = `https://steamcommunity.com/id/sonicsalies/screenshots/?appid=123&sort=newestfirst&browsefilter=myfiles&view=grid`;
    let p = `${userURL}/screenshots/?appid=0&p=${n}&sort=oldestfirst&browsefilter=myfiles&view=grid`;
    await page.goto(p);

    const notfound = await page.$('#NoItemsContainer');

    if (notfound) {
        console.log(`No screenshots available in the page. This might be a glitch, retrying... (${retries})`);

        if (retries === 10) {
            console.log('5 tries');
            return false;
        }

        return getPage(page, n, retries + 1);
    }

    console.log(`Analyzing page ${n} of ${total_pages}`);

    let sel = 'a.profile_media_item';

    const elements = await page.evaluate((sel) => {
        let elements = Array.from(document.querySelectorAll(sel));
        let links = elements.map(element => {
            return element.href
        })
        return links;
    }, sel);

    return elements;
}

/**
 * Store each URL in data.json
 * 
 * @param {*} arr 
 * @param {*} n 
 */
function writeURL(arr, n) {
    let d = [];
    arr.forEach(el => d.push({
        "fileURL": el
    }));

    if (n === 1){
        // Create data.json
        fs.writeFile('data.json', JSON.stringify(d), () => console.log('File created.\nPage wrriten.'));
    }
    else {
        // Append to data.json
        fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log("err");
            } else {
                let oldData = JSON.parse(data),
                    newData = oldData.concat(d);
                fs.writeFile('data.json', JSON.stringify(newData), { flag: 'w' }, () => console.log("data appended"));
            }
        });
    }
};

module.exports = { getPage, getNumPages };