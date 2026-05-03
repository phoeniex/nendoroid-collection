import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://www.goodsmile.info/en/products/category/nendoroid_series/page/';
const PAGES_TO_SCRAPE = 3;

async function scrapePage(pageNumber) {
    console.log(`Scraping page ${pageNumber}...`);
    try {
        const { data } = await axios.get(`${BASE_URL}${pageNumber}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const products = [];

        $('.hitItem').each((i, el) => {
            const name = $(el).find('.hitTtl').text().trim();
            const number = $(el).find('.hitNum').text().trim();
            const link = $(el).find('a').attr('href');
            const image = $(el).find('img').attr('data-original') || $(el).find('img').attr('src');
            
            // Fix relative image URLs
            const fullImage = image.startsWith('http') ? image : `https:${image}`;

            products.push({
                id: number || link.split('/').pop(),
                name,
                number,
                link,
                image: fullImage
            });
        });

        return products;
    } catch (error) {
        console.error(`Error scraping page ${pageNumber}:`, error.message);
        return [];
    }
}

async function main() {
    let allProducts = [];
    for (let i = 1; i <= PAGES_TO_SCRAPE; i++) {
        const products = await scrapePage(i);
        allProducts = [...allProducts, ...products];
        // Sleep a bit to be polite
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const outputPath = path.join(process.cwd(), 'src', 'data', 'nendoroids.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(allProducts, null, 2));
    console.log(`Successfully scraped ${allProducts.length} Nendoroids to ${outputPath}`);
}

main();
