#Write cookie jars for curl
touch /root/env
mkdir /cookies
#echo "$COOKIE_NETID1" | sed -r '1s/session.sig=(.*)/.localhost.edu\tTRUE\t\/\tTRUE\t0\tsession.sig\t\1/g' | sed -r '2s/session=(.*)/.localhost.edu\tTRUE\t\/\tTRUE\t0\tsession\t\1/g' > /cookies/netid1

echo "$COOKIE_NETID1" | sed -r 's/([a-zA-Z\._]+)=(.*)/.localhost.edu\tTRUE\t\/\tTRUE\t0\t\1\t\2/' > /cookies/netid1

echo $COOKIE_NETID2 > /cookies/netid2
echo $COOKIE_NETID3 > /cookies/netid3
echo $COOKIE_NETID4 > /cookies/netid4
echo $COOKIE_NETID5 > /cookies/netid5
echo $COOKIE_NETID6 > /cookies/netid6

exe="bash bats $@"
TEST_OUTPUT_DIR="/root/test_output"
mkdir "$TEST_OUTPUT_DIR"
echo -e "\e[34mrunning pre-tests now...\e[0m"
#$exe pre_test > "$TEST_OUTPUT_DIR/preflights.xml"
if [ $? -ne 0 ]; then
    echo -e "\e[31mError occured in preflight checks, double check tests to see what is wrong with setup\e[0m"
    exit 1;
fi
echo -e "\e[34mrunning tests now...\e[0m"
$exe test/user.bats | tee "$TEST_OUTPUT_DIR/user.xml"
#cat /cookies/netid1
#$exe test/ind_cal_creation.bats | tee "$TEST_OUTPUT_DIR/ind_cal_creation.xml"
#$exe test/ind_cal_invites.bats | tee "$TEST_OUTPUT_DIR/ind_cal_invites.xml"
#$exe test/ind_cal_memberlists.bats | tee "$TEST_OUTPUT_DIR/ind_cal_memberlists.xml"
#$exe test/ind_cal_names.bats | tee "$TEST_OUTPUT_DIR/ind_cal_names.xml"

#$exe test/org.bats | tee "$TEST_OUTPUT_DIR/org.xml"
#$exe test/org_cal.bats | tee "$TEST_OUTPUT_DIR/org_cal.xml"
#$exe test/org_invites.bats | tee "$TEST_OUTPUT_DIR/org_invites.xml"
#bash print_env.sh
if [ $? -ne 0 ]; then
    exit 1;
fi