import React from 'react';
import assets from '../assets/assets.js';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';



export default function Login() {
    const { login } = React.useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null)
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            console.log("Login successful");
            navigate('/');
        } else {
            // Show error message
            setErrorMessage("Invalid email or password");
            alert("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="flex h-screen w-full text-white">
            <div className="w-full hidden md:inline-block">
                <img className="h-full" src={assets.logo} alt="leftSideImage" />
            </div>

            <div className="w-full flex flex-col items-center justify-center">

                <form className="md:w-96 w-80 flex flex-col items-center justify-center">
                    <h2 className="text-4xl text-white font-medium">Sign in</h2>
                    <p className="text-sm text-gray-500/90 mt-3">Welcome back! Please sign in to continue</p>

                    <div className="flex items-center gap-4 w-full my-5">
                        <div className="w-full h-px bg-gray-300/90"></div>
                    </div>

                    <div className="flex mt-4 items-center w-full bg-transparent border border-cyan-500 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280" />
                        </svg>
                        <input type="email" placeholder="Email id" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent text-gray-500 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
                    </div>

                    <div className="flex items-center mt-6 w-full bg-transparent border border-cyan-500 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
                        </svg>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="bg-transparent text-gray-500 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
                    </div>

                    {/* <div className="w-full flex items-center justify-between mt-8 text-gray-500/80">
                        <div className="flex items-center gap-2">
                            <input className="h-5" type="checkbox" id="checkbox" />
                            <label className="text-sm text-white/50" htmlFor="checkbox">Remember me</label>
                        </div>
                        <a className="text-sm text-cyan-500 underline" href="#">Forgot password?</a>
                    </div> */}

                    <button type="submit" 
                    onClick={handleSubmit}
                    className="mt-8 w-full h-11 border border-cyan-700 text-black rounded-full cursor-pointer  transition-all duration-300 ease-in-out
               hover:bg-cyan-700 hover:border-cyan-400">
                        Login
                    </button>
                    {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
                    <p className="text-gray-500/90 text-sm mt-4">Don’t have an account? <Link to='/Signup' className="text-cyan-500 hover:underline" >Sign up</Link></p>
                </form>
            </div>
        </div>
    );
};