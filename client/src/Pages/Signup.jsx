import React from 'react';
import assets from '../assets/assets.js';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';




export default function Signup() {

    const {register} = React.useContext(AuthContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const result = await register(name, email, password);
        console.log("Registration result:", result);

        setLoading(false);

        if (result?.success) {
            const msg = "Registration successful! You can now log in.";
            setSuccess(msg);
            setName("");
            setEmail("");
            setPassword("");
            alert(msg);
            navigate('/Login');
        } else {
            const msg = result?.message || "Registration failed. Please try again.";
            setError(msg);
            alert(msg);
        }
  };

    return (
        <div className="flex h-screen w-full text-white">
            <div className="w-full hidden md:inline-block">
                <img className="h-full" src={assets.logo} alt="leftSideImage" />
            </div>

            <div className="w-full flex flex-col items-center justify-center">

                <form onSubmit={handleSubmit}
                className="md:w-96 w-80 flex flex-col items-center justify-center">
                    <h2 className="text-4xl text-white font-medium">Sign up</h2>


                    <div className="flex items-center gap-4 w-full my-5">
                        <div className="w-full h-px bg-gray-300/90"></div>
                    </div>


                    <div className="flex mt-4 items-center w-full bg-transparent border border-cyan-500 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280" />
                        </svg>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="name" className="bg-transparent text-gray-500 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
                    </div>

                    <div className="flex mt-4 items-center w-full bg-transparent border border-cyan-500 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280" />
                        </svg>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email id" className="bg-transparent text-gray-500 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
                    </div>

                    <div className="flex items-center mt-6 w-full bg-transparent border border-cyan-500 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
                        </svg>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set Password" className="bg-transparent text-gray-500 placeholder-gray-500/80 outline-none text-sm w-full h-full" required />
                    </div>


                    {/* <div className="w-full flex items-center justify-between mt-8 text-gray-500/80">
                        <div className="flex items-center gap-2">
                            <input className="h-5" type="checkbox" id="checkbox" />
                            <label className="text-sm text-white/50" htmlFor="checkbox">Remember me</label>
                        </div>

                    </div> */}

                    <button type="submit"
                    className="mt-8 w-full h-11 cursor-pointer text-black border border-cyan-700 rounded-full transition-all duration-300 ease-in-out
               hover:bg-cyan-700 hover:border-cyan-400">
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                    {error && <p className="text-red-600 mb-2">{error}</p>}
                    {success && <p className="text-green-600 mb-2">{success}</p>}
                    <p className="text-gray-500 text-sm mt-4">Already have an account? <Link to='/Login' className="text-cyan-500 hover:underline" >Log in instead!</Link></p>
                </form>
            </div>
        </div>
    );
};