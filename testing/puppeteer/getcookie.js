const puppeteer = require('puppeteer');

async function main(username, password) {
  const uname = process.argv[2];
  const pw = process.argv[3];
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--ignore-certificate-errors',
    ],
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(5000);
  await page.goto('https://api.localhost.edu/login');
  await page.waitForSelector('body > div > div > div > div.column.one > form > div:nth-child(6) > button');
  await page.evaluate(
    (uname, pw) => {
      document.getElementById('username').value = uname;
      document.getElementById('password').value = pw;
    },
    uname,
    pw
  );
  await page.click('body > div > div > div > div.column.one > form > div:nth-child(6) > button');
  await page.waitForNavigation({
    waitUntil: 'networkidle0',
  });

  await page.goto('https://api.localhost.edu/login');
  const print_cookie_arr = [];
  const cookie_arr = await page.cookies();
  for (let i = 0; i < cookie_arr.length; i++) {
    const cookie = cookie_arr[i];
    if (cookie.name === 'session.sig' || cookie.name === 'session' || cookie.name === 'JSESSIONID' || cookie.name === 'shib_idp_session') {
      print_cookie_arr.push(cookie);
    }
    //console.log(cookie)
  }

  await browser.close();
  for(let i=0;i<print_cookie_arr.length;i++){
      const cookie = print_cookie_arr[i];
      console.log(cookie.name+"="+cookie.value)
  }
}
main();
