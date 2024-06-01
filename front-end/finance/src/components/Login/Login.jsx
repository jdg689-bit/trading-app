import {React, useState} from "react";
import PropTypes from 'prop-types';


async function registerUser(credentials) {
    // Create user document in db using form data

    try {
        const response = await fetch('https://git.heroku.com/trading-platform.git/register', {
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

        alert(`New user ${credentials.username} created successfully!`);

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

        clearInputs(); // Remove user data from controlled inputs
    
        await registerUser({
            firstName,
            lastName,
            email,
            username,
            password,
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
        setLoginClicked(!loginClicked);
        clearInputs();
    }

    const clearInputs = () => {
        // Reset states of controlled inputs so form data doesn't persist
        setFirstName('');
        setLastName('');
        setEmail('');
        setUsername('');
        setPassword('');
    }

    // Page content
    return (
        <>
            <h1>Welcome to AusBank Trading</h1>
            <h2>Register an account to start trading today!</h2>

            <form className="login" onSubmit={loginClicked ? handleLogin : handleRegister}>
                {/* If returning user is logging in, not all fields are required */}
                <p className="required-text">Fields marked with * are requried</p>
                {!loginClicked && 
                    <>
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
                    <p className="change-form">Already registered? Click <a className="login-link" onClick={() => switchForm()}>here</a> to log in</p>
                    :
                    <p className="change-form">Don't have an account? Click <a className="login-link" onClick={() => switchForm()}>here</a> to register</p>

                }                
            </form>
        </>
    )
}

// setToken function is REQUIRED
Register.propTypes = {
    setToken: PropTypes.func.isRequired
}