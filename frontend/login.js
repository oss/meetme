import React, { useState, useEffect, lazy } from 'react';
import Cookies from 'js-cookie';
const App = lazy(() => import('./main'));
import Tile from '/components/utils/tile';
import LargeButton from '/components/utils/large-button';
import sheild_img from '/assets/RU_SHIELD_BLACK.png';
import '/index.css';
import Footer from '/components/footer';

function NavbarLogin() {
    return (
        <div className="w-full h-14 flex bg-white border-white" id="navbar_wrapper">
            <div className="ml-10 flex items-center">
                <img className="w-8 h-8 items-center" src={sheild_img}></img>
                <span className="font-semibold text-xl">meetMe</span>
            </div>
        </div>
    );
}

function Login() {
    const [cookie_check, setCookieCheck] = useState(() => {
        if ( Cookies.get('session') === undefined || Cookies.get('session.sig') === undefined ) {
            return false;
        }
        return true;
    });

    const [logged_in, set_logged_in] = useState(null);

    useEffect(() => {
        if (cookie_check === true)
            fetch(process.env.API_URL + '/whoami', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => res.json())
            .then((data) => {
                console.log(data.Status === 'ok');
                set_logged_in(data.Status === 'ok');
            });
    }, []);

    //set this up so we can redirect to custom pages
    const login = () => {
        let current_url = window.location.href;
        let dest = current_url.replace(/https:\/\/localhost.edu/, '');
        window.location.href = 'https://api.localhost.edu/login?dest=' + dest;
    };

    if (cookie_check) {
        if (logged_in === null) {
            return (
                <>
                    <p>Attempting to login</p>
                </>
            );
        } else if (logged_in){
            const loginHeartBeat = new Worker(new URL("./web_workers/worker.js", import.meta.url));
            loginHeartBeat.addEventListener("message",(e)=>{
                set_logged_in(e.data);
            });
            return <App />;
        }
        else {
            Cookies.remove('session', { domain: '.localhost.edu' });
            Cookies.remove('session.sig', { domain: '.localhost.edu' });
            setCookieCheck(false);
        }
    } else
        return (
            <>
                <NavbarLogin />
                <div className="min-h-[80vh] bg-neutral-100 w-full">
                    <p className="font-bold text-3xl text-center mb-6">
            Welcome To MEETME
                    </p>
                    <div className="flex">
                        <div className="w-3/4 m-auto">
                            <Tile>
                                <div className="text-center">
                                    <LargeButton
                                        click_passthrough={login}
                                        text={'Login With CAS'}
                                    ></LargeButton>
                                </div>
                            </Tile>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
}
export default Login;
