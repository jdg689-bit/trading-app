import {React, useState} from "react";
import PropTypes from 'prop-types';
import './Login.css';


async function registerUser(credentials) {
    // Create user document in db using form data

    try {
        const response = await fetch('http://localhost:3000/register', {
            method : "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(credentials)
        });   
        
        if (!response.ok) {
            if (response.status == 409) {
                alert('That username is already taken');
            } else {
                throw new Error('Server response from /register was not OK.')
            }
        }
    } catch (error) {
        console.error(`Error making /register fetch request: ${error}`);
    }
}


async function loginUser(credentials) {
    // Verify that username and password match an existing db document
    // Use document ObjectId to create sessionStorage token -> keeps user logged in across pages

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(credentials)
        });


        const data = await response.json();

        if (!response.ok) {
            if (response.status == 401) {
                alert(data.error);
            } else {
                throw new Error('Server response from /login was not OK.')
            }
        }

        // Token allows the server to trust all requests recieved from this user
        return data;

    } catch (error) {
        console.error(`Error making /login fetch request: ${error}`);
    }
}


export default function Register({ setToken }) {

    const [firstName, setFirstName] = useState(''); 
    const [lastName, setLastName] = useState(''); 
    const [email, setEmail] = useState(''); 
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');

    const [loginClicked, setLoginClicked] = useState(false) // render alternate form if user clicks login instead of register

    const handleRegister = async (event) => {
        // Submit form data to server

        event.preventDefault();
    
        await registerUser({
            firstName,
            lastName,
            email,
            username,
            password,
            stockHoldings: {}, 
            funds: 10_000, // Start user with $10_000 by default 
        });
    }

    const handleLogin = async (event) => {
        event.preventDefault();

        const token = await loginUser({
            username,
            password,
        });

        if (token) {
            setToken(token);
        }
    }


    const switchForm = () => {
        // Cycle between register and login forms
        // Reset states of controlled inputs so form data doesn't persist
        setLoginClicked(!loginClicked);
        setFirstName('');
        setLastName('');
        setEmail('');
        setUsername('');
        setPassword('');
    }

    // Page content
    return (
        <>
            <h1>Welcome to Nebula Trading</h1>
            <h2>Register an account to start trading today!</h2>

            <form onSubmit={loginClicked ? handleLogin : handleRegister}>
                {/* If returning user is logging in, not all fields are required */}
                {!loginClicked && 
                    <>
                        <p>Fields marked with * are requried</p>
                        <div className="field-container">
                            <label htmlFor="first-name">First Name*: </label>
                                <input 
                                    type="text" 
                                    id="first-name"
                                    value={firstName}
                                    onChange={(event) => setFirstName(event.target.value)}
                                    required
                                />
                        </div>
                        <div className="field-container">
                            <label htmlFor="last-name">Last Name*: </label>
                                <input 
                                    type="text" 
                                    id="last-name" 
                                    value={lastName}
                                    onChange={(event) => setLastName(event.target.value)}
                                    required
                                />
                        </div>
                        <div className="field-container">
                            <label htmlFor="email">Email*: </label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                        </div>
                    </>
                }
                <div className="field-container">
                    <label htmlFor="username">Username*: </label>
                        <input 
                            type="text" 
                            id="username" 
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            required
                        />
                </div>
                <div className="field-container">
                    <label htmlFor="password">Password*: </label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                </div>
                <button type="submit">{loginClicked ? 'Log In' : 'Register'}</button>

                {!loginClicked ?
                    <div>Already registered? Click <a className="login-link" onClick={() => switchForm()}>here</a> to log in</div>
                    :
                    <div>Don't have an account? Click <a className="login-link" onClick={() => switchForm()}>here</a> to register</div>

                }                
            </form>
        </>
    )
}

// setToken function is REQUIRED
Register.propTypes = {
    setToken: PropTypes.func.isRequired
}