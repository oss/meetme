<?php

$config = array(

    'admin' => array(
        'core:AdminPassword',
    ),

    'example-userpass' => array(
        'exampleauth:UserPass',
        'netid1:rutgers1' => array(
            'uid' => array('netid1'),
            'eduPersonAffiliation' => array('group1'),
            'email' => 'user1@example.com',
        ),
        'netid2:rutgers2' => array(
            'uid' => array('netid2'),
            'eduPersonAffiliation' => array('group2'),
            'email' => 'user2@example.com',
        ),
        'netid3:rutgers3' => array(
            'uid' => array('netid3'),
            'eduPersonAffiliation' => array('group2'),
            'email' => 'user2@example.com',
        ),
        'netid4:rutgers4' => array(
            'uid' => array('netid4'),
            'eduPersonAffiliation' => array('group2'),
            'email' => 'user2@example.com',
        ),
        'netid5:rutgers5' => array(
            'uid' => array('netid5'),
            'eduPersonAffiliation' => array('group2'),
            'email' => 'user2@example.com',
        ),
        'netid6:rutgers6' => array(
            'uid' => array('netid6'),
            'eduPersonAffiliation' => array('group2'),
            'email' => 'user2@example.com',
        ),
        'org_admin:org_admin_pw' => array(
            'uid' => array('org_admin'),
            'eduPersonAffiliation' => array('group2'),
            'email' => 'org_admin@example.com',
        ),
        'org_editor:org_editor_pw' => array(
            'uid' => array('org_editor'),
            'eduPersonAffiliation' => array('group2'),
            'email' => 'org_editor@example.com',
        ),
        'org_member:org_member_pw' => array(
            'uid' => array('org_member'),
            'eduPersonAffiliation' => array('group2'),
            'email' => 'org_member@example.com',
        ),
        'org_viewer:org_viewer_pw' => array(
            'uid' => array('org_viewer'),
            'eduPersonAffiliation' => array('group2'),
            'email' => 'org_viewer@example.com',
        ),
    ),

);