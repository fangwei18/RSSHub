const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const listUrl = 'https://www.po18.tw/books/' + id + '/articles';
    cookieString = `_paabbcc=fn8a1i5j3vk08h6rv3oik3c1e0; _po18rf-tk001=9c67308093628f872695543c9eaa96ff42464adffe359705494ec3f1f3f601c3a%3A2%3A%7Bi%3A0%3Bs%3A13%3A%22_po18rf-tk001%22%3Bi%3A1%3Bs%3A32%3A%22KUA0sYfNrqboYm4YR1QGfw6Agr4HFZuO%22%3B%7D; po18Limit=1; url=https%3A%2F%2Fwww.po18.tw; authtoken1=emtoa29rdQ%3D%3D; authtoken6=1; authtoken2=ZmU2YzAxYTM5NDQzODI5ZjMxMDVlZmYyY2Q5NDUyN2M%3D; authtoken3=399464654; authtoken4=2804557268; authtoken5=1629167623`;
    if (config.po18.authtoken3) {
        cookieString = `authtoken3=399464654`;
    }

    const response = await got({
        url: listUrl,
        headers: {
            Cookie: cookieString,
        },
    });
    const $ = cheerio.load(response.data);

    const list = $('div[data-key]');
    const listTitle = $('.book_name').text();

    ctx.state.data = {
        title: listTitle,
        link: listUrl,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    time = item.find('.l_date').text().replace('公開 ', '');
                    console.log(time);
                    return {
                        title: index + 1,
                        description: ``,
                        link: 'https://www.po18.tw' + item.find('.btn_L_blue').attr('href'),
                        pubDate: new Date(time).toUTCString(),
                    };
                })
                .get(),
    };

    // console.log(ctx.state.data);
};
