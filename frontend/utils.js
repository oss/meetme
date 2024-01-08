import Cookies from 'js-cookie';
function getUser() {
    return JSON.parse(atob(Cookies.get('session'))).passport.user;
}

export { getUser };
