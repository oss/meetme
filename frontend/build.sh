export API_URL='https://api.meetme.oss.rutgers.edu'
export WEBSITE_URL='https://meetme.oss.rutgers.edu'

npx @tailwindcss/cli -i ./input.css -o index.css
npx webpack --config webpack.prod.js --mode production

npx $EXE $params | tee /root/webpack.output