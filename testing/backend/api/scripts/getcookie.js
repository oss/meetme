const puppeteer = require('puppeteer');

async function get_cookie() {
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

  let cookie_val = null;
  const cookie_arr = await page.cookies();
  for (let i = 0; i < cookie_arr.length; i++) {
    const cookie = cookie_arr[i];
    if (cookie.name === 'session') {
      cookie_val = atob(cookie.value)
    }
    //console.log(cookie)
  }
  await browser.close();
  return cookie_val;
}

async function main(){
    x = null;
    while(x == null){
        try{
            x = await get_cookie()
        } catch(e){
            console.log('error occured, trying again...');
        }
    }
    console.log(x);
    return;
}

main()
