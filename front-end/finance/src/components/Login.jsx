import {React, useState} from "react";
import PropTypes from 'prop-types';


async function loginUser(credentials) {
    // Send user credentials to backend and get back a unique user token
    try {
        const response = await fetch('http://localhost:3000/login', {
            method : "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(credentials)
        });   
        
        if (!response.ok) {
            throw new Error('Server response was not OK.')
        }

        const data = response.json();
        return data;

    } catch (error) {
        console.error(`Error making fetch request: ${error}`);
    }

}


export default function Login({ setToken }) {

    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const token = await loginUser({
            username,
            password,
        });
    
        setToken(token);
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
                <input 
                    type="text" 
                    id="username" 
                    onChange={(event) => setUsername(event.target.value)}
                />
            <label htmlFor="password">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    onChange={(event) => setPassword(event.target.value)}
                />
            <button type="submit">Login</button>
        </form>
    )
}

// setToken function is REQUIRED
Login.propTypes = {
    setToken: PropTypes.func.isRequired
}