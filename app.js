const apkpureCrawler = require('apkpure-crawler');
const fs = require('fs');
const readline = require('readline');
const crypto = require('crypto');
const { argv } = require('node:process');

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

function getSha256Hash(file) {
    return new Promise(async (resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(file);

        stream.on('data', (data) => {
            hash.update(data);
        });

        stream.on('end', () => {
            const sha256 = hash.digest('hex');
            resolve(sha256);
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function main() {
    const pkgNamesPath = argv[2];
    const outputPath = "apks_legit";

    const fileStream = fs.createReadStream(pkgNamesPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    for await (const line of rl) {
        splited = line.split(',');
        sha256hash = splited[0].toLowerCase();
        pkgName = splited[1].split('"').join("");
        versionCode = splited[2];

        outputPathString = `${outputPath}/${pkgName}-${versionCode}.apk`;
        console.log(`\nChecking file: ${outputPathString}`);
        if (fs.existsSync(outputPathString)) {
            const sha256sum = await getSha256Hash(outputPathString);
            if (sha256sum === sha256hash) {
                console.log('File already downloaded...');
            } else {
            	console.log(`File already downloaded but hashes doesn\'t match...\nFile: ${outputPathString}. `);
                console.log('Trying to delete it...\n');
                fs.unlink(outputPathString, (error) => {
                    if (error)
                        console.error(`Error deleting the file...\n${error}\n`);
                });
            }
            continue;
        }

        try {
            const data = await apkpureCrawler.downloadApk(pkgName, versionCode, outputPath);
            const sha256sum = await getSha256Hash(data);
            console.log(`\nFile: ${data}\nSHA-256 Hash New: ${sha256sum}\nSHA-256 Hash Old: ${sha256hash}`);
            if (sha256hash !== sha256sum) {
                console.log('Hashes doesn\'t match.\nTrying to delete downloaded file...\n');
                fs.unlink(data, (error) => {
                    if (error)
                        console.error(`Error deleting the file...\n${error}\n`);
                });
            } else {
                console.log(`${data} downloaded successfully!\n`);
            }
        } catch (error) {
            console.error(`App not found online...\n${error}\n`);
        } finally {
            var sleepTime = 1000;
            console.log(`Sleeping for ${sleepTime}...`);
            await sleep(sleepTime);
        }
    }
    apkpureCrawler.closeBrowser();
}

main();
