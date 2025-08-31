async function scrapeRatingsAndLinks(page) {
  const results = await page.$$eval('.rating-count-number', elements => {
    return elements.map(el => {
      let container = el.parentElement;
      for (let i = 0; i < 5; i++) {
        if (!container) break;
        const a = container.querySelector('a');
        if (a) {
          return {
            rating: el.innerText.trim(),
            link: a.getAttribute('href')
          };
        }
        container = container.parentElement;
      }
      return {
        rating: el.innerText.trim(),
        link: null
      };
    });
  });
  return results;
}

async function scrapeTitle(page) {
    try{
        await page.waitForSelector('h1._5plgh7k._66nk381g8._66nk381ge._66nk381dq._66nk381dw._66nk388._66nk382._66nk38og', { timeout: 10000 });
    }catch{
        return null
    }
    
    const title = await page.$eval('h1._5plgh7k._66nk381g8._66nk381ge._66nk381dq._66nk381dw._66nk388._66nk382._66nk38og', el => el.innerText);
    return title;
}

module.exports = {scrapeRatingsAndLinks,scrapeTitle};
