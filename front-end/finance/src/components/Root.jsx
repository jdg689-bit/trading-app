import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Login from './Login';
import useToken from './useToken';


export default function App() {

    // Token SESSION STORAGE
    const {token, setToken} = useToken();

    if (!token) {
        return <Login setToken={setToken} />
    }

    return (
        <>
            <nav>
                <ul>
                    <li>
                        <Link to={'/'}>Home</Link>
                    </li>
                    <li>
                        <Link to={'/quote'}>Quote</Link>
                    </li>
                    <li>
                        <Link to={'/trade'}>Trade</Link>
                    </li>
                    <li>
                        <Link to={'/portfolio'}>Portfolio</Link>
                    </li>
                </ul>
            </nav>
            <div id='detail'>
                <Outlet />
            </div>
        </>
    )
}