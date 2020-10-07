const port = process.env.PORT || 8080;
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

function getMenus(name, y, m, d, cb) {
  request(`https://www.kaist.ac.kr/kr/html/campus/053001.html?dvs_cd=${name}&stt_dt=${y}-${m}-${d}`, (err, res, body) => {
    if (err || res.statusCode !== 200) {
      cb({ breakfast: '', lunch: '', dinner: '' });
      return;
    }

    const $ = cheerio.load(body);
    const tds = $('td');
    const get = i => tds.eq(i).text().split(/\s/).filter(s => s.length).join(' ');
    const breakfast = get(0);
    const lunch = get(1);
    const dinner = get(2);
    cb({ breakfast, lunch, dinner });
  });
}

app.get('/', (req, res) => {
  const { name, y, m ,d } = req.query;
  getMenus(name, y, m, d, data => {
    res.json(data);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
