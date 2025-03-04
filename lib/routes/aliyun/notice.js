const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const typeMap = {
    0: '9004748',
    1: '9004749',
    2: '9213612',
    3: '8314815',
    4: '9222707',
};

/**
 *
 * @param ctx {import('koa').Context}
 */
module.exports = async (ctx) => {
    const type = ctx.params.type;
    const url = `https://help.aliyun.com/noticelist/${typeMap[type] || typeMap[0]}.html`;
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);
    const list = $('ul > li.y-clear')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text().trim();
            const link = 'https://help.aliyun.com' + element.find('a').attr('href').trim();
            const date = element.find('.y-right').text();
            const pubDate = dayjs(`${date} +0800`, 'YYYY-MM-DDHH:mm:ss ZZ');
            return {
                title: title,
                description: '',
                link: link,
                pubDate: pubDate.toString(),
            };
        })
        .get();

    const result = await Promise.all(
        list.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(link);
            const itemElement = cheerio.load(itemReponse.data);
            item.description = itemElement('#se-knowledge').html();

            ctx.cache.set(link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: $('title').text().trim(),
        link: url,
        item: result,
    };
};
