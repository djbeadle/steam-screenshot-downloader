const fs = require('fs'),
    path = require('path'),
    sanitize = require("sanitize-filename"),
    axios = require('axios').default,
    setDescription = require('./setDescription');


function downloadScreenshot(screenshot_entry, screenshot_id) {
    const screenshot_data = screenshot_entry.game.name;
    const g_name = sanitize(`${screenshot_entry.game.name} (${screenshot_entry.game.appid})`)

    if (screenshot_entry.downloaded) {
        console.log('  This screenshot has already been downloaded.');
        return downloadScreenshot(screenshot_number + 1);
    }

    const directory_name = `games/${g_name}`;
    fs.mkdir(directory_name, {
        recursive: true
    }, (err) => {
        if (err) throw err;

        const img_path = `${directory_name}/${screenshot_id}.jpg`,
            writer = fs.createWriteStream(img_path),
            request = {
                method: 'get',
                url: screenshot_entry.url,
                responseType: 'stream'
            };

        axios(request)
            .then(function (response) {
                response.data.pipe(writer);

                return new Promise((resolve, reject) => {
                        // If the screenshot has a description, add it as an embed or .txt
                        if (screenshot_entry.description) {
                            setDescription(img_path, screenshot_entry.description);
                        }
                });
            })
            .catch(function (error) {
                throw error;
            });
    });
}

module.exports = { downloadScreenshot };