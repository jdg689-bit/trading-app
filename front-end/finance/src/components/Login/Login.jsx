import {React, useState} from "react";
import PropTypes from 'prop-types';
import './Login.css';


async function registerUser(credentials) {
    // Send user credentials to backend and get back a unique user token
    try {
        const response = await fetch('http://localhost:3000/register', {
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


export default function Register({ setToken }) {

    const [firstName, setFirstName] = useState(''); 
    const [lastName, setLastName] = useState(''); 
    const [email, setEmail] = useState(''); 
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');

    const [loginClicked, setLoginClicked] = useState(false) // render alternative form if user clicks login instead of register

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const token = await registerUser({
            firstName,
            lastName,
            email,
            username,
            password,
        });
    
        setToken(token);
    }

    return (
        <>
            <h1>Welcome to Nebula Trading</h1>
            <h2>Register an account to start trading today!</h2>

            <form onSubmit={handleSubmit}>
                {!loginClicked && 
                    <>
                        <div className="field-container">
                            <label htmlFor="first-name">First Name: </label>
                                <input 
                                    type="text" 
                                    id="first-name" 
                                    onChange={(event) => setFirstName(event.target.value)}
                                />
                        </div>
                        <div className="field-container">
                            <label htmlFor="last-name">Last Name: </label>
                                <input 
                                    type="text" 
                                    id="last-name" 
                                    onChange={(event) => setLastName(event.target.value)}
                                />
                        </div>
                        <div className="field-container">
                            <label htmlFor="email">Email: </label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                        </div>
                    </>
                }
                <div className="field-container">
                    <label htmlFor="username">Username: </label>
                        <input 
                            type="text" 
                            id="username" 
                            onChange={(event) => setUsername(event.target.value)}
                        />
                </div>
                <div className="field-container">
                    <label htmlFor="password">Password: </label>
                        <input 
                            type="password" 
                            id="password" 
                            onChange={(event) => setPassword(event.target.value)}
                        />
                </div>
                <button type="submit">{loginClicked ? 'Log In' : 'Register'}</button>

                {!loginClicked ?
                    <div>Already registered? Click <a className="login-link" onClick={() => setLoginClicked(true)}>here</a> to log in</div>
                    :
                    <div>Don't have an account? Click <a className="login-link" onClick={() => setLoginClicked(false)}>here</a> to register</div>

                }                
            </form>
        </>
    )
}

// setToken function is REQUIRED
Register.propTypes = {
    setToken: PropTypes.func.isRequired
}