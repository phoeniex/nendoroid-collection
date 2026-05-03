const fs = require('fs');
const cheerio = require('cheerio');
const data = fs.readFileSync('scratch.html', 'utf-8');
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
    
    const seriesNodes = $el.find('.data-bottom a[href*="/franchise/"]');
    const series = seriesNodes.length ? seriesNodes.last().text().trim() : '';
    
    const yearText = $el.find('.data-smallt').text();
    const yearMatch = yearText.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : '';
    
    const imgNode = $el.find('.data-img');
    const image = imgNode.attr('data-original') || imgNode.attr('src');
    
    if (name && number) {
        products.push({ id: number, name, number, series, year, link, image });
    }
});
console.log(products.slice(0, 3));
console.log(`Total: ${products.length}`);
