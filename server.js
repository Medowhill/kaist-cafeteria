const port = process.env.PORT || 8080;

const express = require('express');
const cors = require('cors');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.use(cors());

app.get('/', (req, res) => {
  const { name, y, m ,d } = req.query;
  if (y && m && d) {
    const url = `https://www.kaist.ac.kr/kr/html/campus/053001.html?dvs_cd=${name}&stt_dt=${y}-${m}-${d}`;
    getMenus(url, data => res.json(data));
  } else {
    const url = `https://www.kaist.ac.kr/kr/html/campus/053001.html?dvs_cd=${name}`;
    getMenus(url, data => {
      const { breakfast, lunch, dinner } = data;
      function title(str) {
        return {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${str}*`
          }
        };
      }
      function content(str) {
        return {
          type: 'section',
          text: {
            type: 'plain_text',
            text: str
          }
        };
      }
      const blocks = [
        title('아침'), content(breakfast),
        title('점심'), content(lunch),
        title('저녁'), content(dinner),
      ];
      res.json({ blocks });
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});

function getMenus(url, cb) {
  request(url, (err, res, body) => {
    if (err || res.statusCode !== 200) {
      cb({ breakfast: '', lunch: '', dinner: '' });
      return;
    }

    const $ = cheerio.load(body);
    const tds = $('td');
    function get(i) {
      return tds
        .eq(i)
        .text()
        .replace(/[1-9],[0-9][0-9][0-9]원/g, '')
        .replace(/[1-9],[0-9][0-9][0-9]/g, '')
        .replace(/[0-9][0-9][0-9]원/g, '')
        .replace(/[0-9][0-9][0-9]/g, '')
        .replace(/\(([0-9]+,)*[0-9]+\)/g, '')
        .split(/\s/)
        .filter(s => s.length)
        .join(' ');
    }
    const breakfast = get(0);
    const lunch = get(1);
    const dinner = get(2);
    cb({ breakfast, lunch, dinner });
  });
}
