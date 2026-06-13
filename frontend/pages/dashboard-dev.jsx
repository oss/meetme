function dashboard_dev() {
    return (
        <>
            <h3>Welcome to RU Meeting</h3>
            <div>
                <h4>Calendar stuff</h4>
                <div>
                    <button
                        onClick={() => {
                            //const fetchCookie = makeFetchCookie(fetch);
                            fetch('https://api.localhost.edu/cal', {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    timeblocks: [
                                        { start: 1660219200000, end: 1660226400000 },
                                        { start: 1660305600000, end: 1660312800000 },
                                        { start: 1665057600000, end: 1665064800000 },
                                    ],
                                }),
                            })
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            create calendar w/ user owner
                    </button>
                    <button
                        onClick={() => {
                            //const fetchCookie = makeFetchCookie(fetch);
                            fetch('https://api.localhost.edu/cal', {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    timeblocks: [
                                        { start: 1660218360000, end: 1660226460000 },
                                        { start: 1660305600000, end: 1660312800000 },
                                        { start: 1665057600000, end: 1665064800000 },
                                    ],
                                }),
                            })
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            create calendar w/ user owner v2
                    </button>
                </div>
                <div>
                    <input type="text" id="org_id_create_cal"></input>
                    <button
                        onClick={() => {
                            fetch('https://api.localhost.edu/cal', {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    owner: {
                                        type: 'organization',
                                        id: document.getElementById('org_id_create_cal').value,
                                    },
                                    timeblocks: [
                                        { start: 1660219200000, end: 1660226400000 },
                                        { start: 1660305600000, end: 1660312800000 },
                                        { start: 1665057600000, end: 1665064800000 },
                                    ],
                                }),
                            })
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            create org calendar
                    </button>
                </div>
                <div>
                    <input type="text" id="add_usr_to_cal"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('add_usr_to_cal').value +
                  '/share',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        new_users: ['netid6', 'this netid is invalid'],
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            invite users to cal
                    </button>
                </div>
                <div>
                    <input type="text" id="remove_usr_from_cal"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('remove_usr_from_cal').value +
                  '/share',
                                {
                                    method: 'DELETE',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        target_users: ['netid6', 'this netid is invalid'],
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            remove users from cal
                    </button>
                </div>
                <div>
                    <input type="text" id="cal_id_invite_accept"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('cal_id_invite_accept').value +
                  '/accept',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({}),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            accept calendar invite
                    </button>
                </div>
                <div>
                    <input type="text" id="cal_id_invite_decline"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('cal_id_invite_decline').value +
                  '/decline',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({}),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            decline calendar invite
                    </button>
                </div>
                <div>
                    <input type="text" id="delete_cal"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('delete_cal').value,
                                {
                                    method: 'DELETE',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            delete calendar
                    </button>
                </div>
                <div>
                    <input type="text" placeholder="sha256" id="cal_target_name"></input>
                    <input
                        type="text"
                        placeholder="new name"
                        id="cal_name_modify"
                    ></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('cal_target_name').value +
                  '/name',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        new_name: document.getElementById('cal_name_modify').value,
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            change calendar name
                    </button>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="sha256"
                        id="cal_id_new_owner_id"
                    ></input>
                    <input
                        type="text"
                        placeholder="individual or org"
                        id="cal_id_new_owner_type"
                    ></input>
                    <input
                        type="text"
                        placeholder="netid or sha256"
                        id="new_owner_id"
                    ></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('cal_id_new_owner_id').value +
                  '/owner',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        id: document.getElementById('new_owner_id').value,
                                        owner_type: document.getElementById('cal_id_new_owner_type')
                                            .value,
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            change calendar owner
                    </button>
                </div>
                <div>
                    <input type="text" id="cal_id_to_set_available_times"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('cal_id_to_set_available_times')
                      .value +
                  '/me',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        timeblocks: [{ start: 1660306800000, end: 1660307580000 }],
                                        mode: 'replace',
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            set my available times
                    </button>
                </div>
                <div>
                    <input type="text" id="cal_id_set_meeting_time"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('cal_id_set_meeting_time').value +
                  '/setTime',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        timeStart: 1660219400000,
                                        timeEnd: 1660219600000,
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            set meeting time
                    </button>
                </div>
                <div>
                    <input type="text" id="cal_id_delete_target"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('cal_id_delete_target').value +
                  '/setTime',
                                {
                                    method: 'DELETE',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            delete calendar
                    </button>
                </div>
                <div>
                    <input type="text" id="cal_id_settime"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('cal_id_settime').value +
                  '/meet_time',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        start: 1660306200000,
                                        end: 1660306200000 + 1000 * 60 + 10,
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            set meeting time
                    </button>
                </div>
                <div>
                    <input type="text" id="cal_id_set_location"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('cal_id_set_location').value +
                  '/location',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        location: 'Hill Center 017',
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            set location
                    </button>
                </div>
            </div>
            <div>
                <h4>Org stuff</h4>
                <div>
                    <button
                        onClick={() => {
                            fetch('https://api.localhost.edu/org', {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({}),
                            })
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            create org
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => {
                            fetch('https://api.localhost.edu/org', {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ name: 'this is a hardcoded name' }),
                            })
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            create org w/ name
                    </button>
                </div>
                <div>
                    <input type="text" id="add_usr_to_org"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/org/' +
                  document.getElementById('add_usr_to_org').value +
                  '/share',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        new_users: [
                                            'netid2',
                                            'netid3',
                                            'netid4',
                                            'this netid is invalid',
                                        ],
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            invite user to org
                    </button>
                </div>
                <div>
                    <input type="text" id="accept_invite_org"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/org/' +
                  document.getElementById('accept_invite_org').value +
                  '/accept',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            accept org invite
                    </button>
                </div>
                <div>
                    <input type="text" id="decline_invite_org"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/org/' +
                  document.getElementById('decline_invite_org').value +
                  '/decline',
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            decline org invite
                    </button>
                </div>
                <div>
                    <input type="text" id="remove_usr_from_org"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/org/' +
                  document.getElementById('remove_usr_from_org').value +
                  '/share',
                                {
                                    method: 'DELETE',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        target_users: ['netid2', 'not in org'],
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            remove users from org
                    </button>
                </div>
                <div>
                    <input type="text" id="delete_org"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/org/' +
                  document.getElementById('delete_org').value,
                                {
                                    method: 'DELETE',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            delete org
                    </button>
                </div>
            </div>
            <div>
                <h4>Get info</h4>
                <div>
                    <input
                        type="text"
                        defaultValue="me"
                        id="get_user_info_target"
                    ></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/user/' +
                  document.getElementById('get_user_info_target').value,
                                {
                                    method: 'GET',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            get user info
                    </button>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="sha256"
                        id="get_org_info_target"
                    ></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/org/' +
                  document.getElementById('get_org_info_target').value,
                                {
                                    method: 'GET',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            get org info
                    </button>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="netid"
                        id="get_cal_info_target"
                    ></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('get_cal_info_target').value +
                  '/meta',
                                {
                                    method: 'GET',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });

                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('get_cal_info_target').value +
                  '/main',
                                {
                                    method: 'GET',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            get cal info
                    </button>
                </div>
                <div>
                    <input type="text" id="get_meetme_info_target"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('get_meetme_info_target').value +
                  '/meetme',
                                {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ timezone: 'America/New_York' }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            get meetme info
                    </button>
                </div>
                <div>
                    <input type="text" id="get_meeting_time_id"></input>
                    <button
                        onClick={() => {
                            fetch(
                                'https://api.localhost.edu/cal/' +
                  document.getElementById('get_meeting_time_id').value +
                  '/meet_time',
                                {
                                    method: 'GET',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(JSON.stringify(data));
                                });
                        }}
                    >
            get meet time
                    </button>
                </div>
            </div>
            <div>
                <input type="text" id="get_cal_location_id"></input>
                <button
                    onClick={() => {
                        fetch(
                            'https://api.localhost.edu/cal/' +
                document.getElementById('get_cal_location_id').value +
                '/location',
                            {
                                method: 'GET',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            }
                        )
                            .then((res) => res.json())
                            .then((data) => {
                                console.log(JSON.stringify(data));
                            });
                    }}
                >
          get calendar location
                </button>
            </div>
        </>
    );
}
export default dashboard_dev;
