import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import Login from './login';
import "./index.css";

ReactDOMClient.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Login />
    </React.StrictMode>
);
