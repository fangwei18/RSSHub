const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const listUrl = 'http://www.jjwxc.net/onebook.php?novelid=' + id;

    const response = await got({
        url: listUrl,
    });
    const $ = cheerio.load(iconv.decode(response.data, 'GB18030'));

    const list = $('tr[itemprop]');
    const listTitle = $('h1 span').text();

    ctx.state.data = {
        title: listTitle,
        link: listUrl,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    time = item.find('td[title] span').first().text().trim();
                    chapterId = index + 1;
                    return {
                        title: chapterId,
                        description: ``,
                        link: 'http://www.jjwxc.net/onebook.php?novelid=5384942&chapterid=' + chapterId,
                        pubDate: new Date(time).toUTCString(),
                    };
                })
                .get(),
    };

    // console.log(ctx.state.data);
};
