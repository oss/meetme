setInterval(()=>{
    fetch(process.env.API_URL + '/whoami', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => res.json()).then((data) => {
        self.postMessage(data.Status === 'ok');
    });
},1000*1);