import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Register from '../Login/Login.jsx';
import useToken from '../useToken.js';
import Portfolio from '../Portfolio/Portfolio.jsx';


export default function App() {

    // Token SESSION STORAGE
    const {token, setToken} = useToken();

    if (!token) {
        return <Register setToken={setToken} />
    }

    return (
        <>
            <nav>
                <ul>
                    <li>
                        <Link to={'/portfolio'}>Portfolio</Link>
                    </li>
                    <li>
                        <Link to={'/trade'}>Trade</Link>
                    </li>
                    <li>
                        <Link to={'/quote'}>Quote</Link>
                    </li>
                </ul>
            </nav>
            <div id='detail'>
                <Outlet />
            </div>
        </>
    )
}