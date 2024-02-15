import React, { useState, useEffect, lazy } from 'react';
import Cookies from 'js-cookie';
const App = lazy(() => import('./main'));
import Tile from '/components/utils/tile';
import LargeButton from '/components/utils/large-button';
import sheild_img from '/assets/RU_SHIELD_BLACK.png';
import '/index.css';
import Footer from '/components/footer';
import authState from "./store/authState";

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
    const isLoggedIn = authState((state)=>state.isLoggedIn)

    //set this up so we can redirect to custom pages
    const login = () => {
        let current_url = window.location.href;
        let dest = current_url.replace(/https:\/\/localhost.edu/, '');
        window.location.href = 'https://api.localhost.edu/login?dest=' + dest;
    };

    if (isLoggedIn) {
        //const loginHeartBeat = new Worker(new URL("./web_workers/worker.js", import.meta.url));
        /*loginHeartBeat.addEventListener("message",(e)=>{
            set_logged_in(e.data);
        });
        */
        return(
            <React.Suspense>
                <App />
            </React.Suspense>
        )
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
