import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const RANGES = [
    '000+100',
    '101+200',
    '201+300',
    '301+400',
    '401+500',
    '501+600',
    '601+700',
    '701+800',
    '801+900',
    '901+1000',
    '1001+1100',
    '1101+1200',
    '1201+1300',
    '1301+1400',
    '1401+1500',
    '1501+1600',
    '1601+1700',
    '1701+1800',
    '1801+1900',
    '1901+2000'
];

async function scrapeRange(range) {
    const url = `https://nendoroid-heaven.com/nendoroid/no-series/${range}/`;
    console.log(`Scraping range ${range}...`);
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        const $ = cheerio.load(data);
        const products = [];

        $('.data-medium-long').each((i, el) => {
            const $el = $(el);
            const nameNode = $el.find('.data-bottom b a');
            const name = nameNode.text().trim();
            const link = nameNode.attr('href');
            
            const text = $el.find('.data-bottom').text();
            const numberMatch = text.match(/#([\dA-Z-]+)/);
            const number = numberMatch ? numberMatch[1] : '';
            
            const typeNodes = $el.find('.data-bottom a[href*="/type/"]');
            const type = typeNodes.length ? typeNodes.first().text().trim() : '';

            const seriesNodes = $el.find('.data-bottom a[href*="/franchise/"]');
            const series = seriesNodes.length ? seriesNodes.last().text().trim() : '';
            
            const yearText = $el.find('.data-smallt').text();
            const yearMatch = yearText.match(/\d{4}/);
            const year = yearMatch ? yearMatch[0] : '';
            const notes = yearText.replace(year, '').replace(/^,\s*/, '').trim();

            
            const imgNode = $el.find('.data-img');
            const image = imgNode.attr('data-original') || imgNode.attr('src');

            if (name && number) {
                products.push({
                    id: number,
                    name,
                    number,
                    type,
                    series,
                    year,
                    notes,
                    link,
                    image
                });
            }
        });

        return products;
    } catch (error) {
        console.error(`Error scraping range ${range}:`, error.message);
        return [];
    }
}

async function main() {
    let allProducts = [];
    // Just scrape first 3 ranges for the demo to avoid getting blocked
    for (const range of RANGES.slice(0, 5)) {
        const products = await scrapeRange(range);
        allProducts = [...allProducts, ...products];
        console.log(`Found ${products.length} items in range ${range}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const outputPath = path.join(process.cwd(), 'src', 'data', 'nendoroids.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(allProducts, null, 2));
    console.log(`Successfully scraped ${allProducts.length} Nendoroids to ${outputPath}`);
}

main();
