import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function logout() {
    const [initiate_redirect_to_homepage, set_redirect_to_homepage] =
    useState(null);

    useEffect(() => {
        fetch(process.env.API_URL + '/logout', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === 'ok') set_redirect_to_homepage(true);
            });
    }, []);

    const navigate = useNavigate();
    useEffect(() => {
        if (initiate_redirect_to_homepage)
            setTimeout(() => {
                navigate('/');
                navigate(0);
            }, 5000);
    }, [initiate_redirect_to_homepage]);

    if (initiate_redirect_to_homepage) {
        return <div>Going to redirect to homepage in 5 seconds...</div>;
    }
    return <div>Logging you out now...</div>;
}

export default logout;
