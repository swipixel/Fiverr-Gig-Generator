const getPage = require('./getpage.cjs');
const scraper = require('./scrape.js');
const {parseRating} = require("./parsing.cjs")

async function get_gigs(url) {
    const searchPage = await getPage(url, false);
    const data = await scraper.scrapeRatingsAndLinks(searchPage);
    await searchPage.context().browser().close();
    return data;
}

async function extract_data(gigs, BUFFER = 3) {
    const ai_data = []

    for (let x = 0; x < gigs.length; x += BUFFER) {
        const batch = gigs.slice(x, x + BUFFER);
        
        console.log("%d percent ready", (x/gigs.length)*100)

        const pagePromises = batch.map(gig => {

            if (!gig.link) return null;
            const fullUrl = "https://www.fiverr.com" + gig.link;
            return getPage(fullUrl, headless = false, quiet = true).then(async page => {
                if (page == null) return;
                const title = await scraper.scrapeTitle(page);
                ai_data.push({
                    rating: gig.rating,
                    title: title,
                })
                await page.context().browser().close();
        });
    });
    await Promise.all(pagePromises.filter(Boolean));
    await new Promise(res => setTimeout(res, 1000));
  }
  return ai_data
}

async function main() {
    const search = "shopify ai assistant";
    const numberOfPages = 30
    const BUFFER = 5

    const url = "https://www.fiverr.com/search/gigs?query=" + encodeURIComponent(search);
    const gigs = (await get_gigs(url))
                        .sort((a, b) => parseRating(b.rating) - parseRating(a.rating))
                        .slice(0, numberOfPages);

    const ai_data = await extract_data(gigs, BUFFER)
    console.log(ai_data)
}

main();
