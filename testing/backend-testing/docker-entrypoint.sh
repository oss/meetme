exe="bash bats $@"
TEST_OUTPUT_DIR="/root/test_output"
mkdir "$TEST_OUTPUT_DIR"
echo -e "\e[34mrunning pre-tests now...\e[0m"
$exe pre_test > "$TEST_OUTPUT_DIR/preflights.xml"
if [ $? -ne 0 ]; then
    echo -e "\e[31mError occured in preflight checks, double check tests to see what is wrong with setup\e[0m"
    exit 1;
fi
echo -e "\e[34mrunning tests now...\e[0m"
$exe test/user.bats | tee "$TEST_OUTPUT_DIR/user.xml"
$exe test/ind_cal_creation.bats | tee "$TEST_OUTPUT_DIR/ind_cal_creation.xml"
$exe test/ind_cal_invites.bats | tee "$TEST_OUTPUT_DIR/ind_cal_invites.xml"
$exe test/ind_cal_memberlists.bats | tee "$TEST_OUTPUT_DIR/ind_cal_memberlists.xml"
$exe test/ind_cal_names.bats | tee "$TEST_OUTPUT_DIR/ind_cal_names.xml"

$exe test/org.bats | tee "$TEST_OUTPUT_DIR/org.xml"
$exe test/org_cal.bats | tee "$TEST_OUTPUT_DIR/org_cal.xml"
$exe test/org_invites.bats | tee "$TEST_OUTPUT_DIR/org_invites.xml"
bash print_env.sh
if [ $? -ne 0 ]; then
    exit 1;
fi