NETID_STATE={"invalid_netid",{"netid_account_created","netid_account_not_created"}}

case $@ in 
    ind_cal_creation)
        echo '--- ind_cal_creation possibilities ---'\\n {"not_logged_in\n",{"default","json "{"individual "{"is_session","not_session"},"org "{"is_owner","is_admin","is_editor","is_member","is_viewer","pending_member","not_member","doesnt_exist"}}}\\n}
        exit 0
        ;;
    ind_cal_invites)
        echo '--- ind_cal_invites possiblities ---'
        exit 0
        ;;
    org_invites)
        echo '--- org invite (sending) possibilities ---'\\n {"not_logged_in\n",{"org_doesnt_exist\n",{"owner","admin","editor","member","viewer","pending_member"}\ {"invalid_netid","netid_account_created","netid_account_not_created","already_added"}\\n}}
        echo '--- org invite (accepting) possibilities ---'\\n {'accept','decline'}\ {"not_logged_in\n",{"org_doesnt_exist\n",{"pending_member","owner","admin","editor","member","viewer","random_user"}\\n}}
        exit 0
        ;;
    *)
        echo "not valid"
        exit 1
        ;;
esac
