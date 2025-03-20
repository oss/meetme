import React, { useState, useEffect, lazy } from 'react';
import Cookies from 'js-cookie';
const App = lazy(() => import('./main'));
import Tile from '/components/utils/tile';
import LargeButton from '/components/utils/large-button';
import rutgersR from '/assets/RUTGERS_H_RED_BLACK_RGB.png';
import Footer from './components/lib/ui/footer';
import authStore from "./store/authStore";
import userStore from "./store/userStore"

function NavbarLogin() {
    return (
        <div className="w-full h-14 flex bg-white border-white">
            <div className="ml-10 flex items-center">
                <img className="h-9 m-4 items-center" src={rutgersR}></img>
                <span className="font-semibold text-xl">meetMe</span>
            </div>
        </div>
    );
}

function Login() {
    const isLoggedIn = authStore((state)=>state.isLoggedIn)
    const hasUserData = userStore((state)=> '_id' in state)

    //set this up so we can redirect to custom pages
    const login = () => {
        const current_url = window.location.href;
        const dest = current_url.replace(process.env.WEBSITE_URL, '');
        window.location.assign(process.env.API_URL+'/login?dest=' + dest);
    };

    if (isLoggedIn) {
        //const loginHeartBeat = new Worker(new URL("./web_workers/worker.js", import.meta.url));
        /*loginHeartBeat.addEventListener("message",(e)=>{
            set_logged_in(e.data);
        });
        */
       if(!hasUserData){
           return(
               <div>
                   Getting user data...
               </div>
           )
       }
        return(
            <React.Suspense>
                <App />
            </React.Suspense>
        )
    } else
        return (
            <div className='h-screen w-screen flex'>
                <div className='flex flex-col'>
                    <div className='grow-0'>
                        <NavbarLogin />
                    </div>
                    <div className="bg-neutral-100 grow">
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
                    <div className='grow-0'>
                        <Footer />
                    </div>
                </div>
            </div>
        );
}
export default Login;
