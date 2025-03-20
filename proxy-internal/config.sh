IPs=$(dig socket +short)
echo "ips found are: $IPs"
sed -i 's/.*#SOCK//g' /etc/nginx/conf.d/meetme.conf

for ip in $IPs
do
    echo "----- Before -----"
    cat /etc/nginx/conf.d/meetme.conf
    echo "------------------"
    echo "$ip"
    sed -i "s/#REPLACE_SOCKET/    server $ip:3000;#SOCK\\n#REPLACE_SOCKET/g" /etc/nginx/conf.d/meetme.conf
    echo "----- After -----"
    cat /etc/nginx/conf.d/meetme.conf
    echo "------------------"
done