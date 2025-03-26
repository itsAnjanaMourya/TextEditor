import React from 'react'
import axios from "axios";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        await axios.post('http://localhost:3200/auth/registration',{name, email, password})
        .then(response=>{
            if(response.status){
                navigate("/");
            }
            console.log(response)
            
        }).catch(err=>{
                    console.log(err)
                })

        console.log("Register details", email)

        
    }
  return (
    <>
    <div className="outer">
        <div className="LoginWrapper">
            <div className='inner'>
                <h2 style={{color:"white"}}>Register</h2>
                <form onSubmit={handleSubmit} className="text-center">
                    <label className="login-label">Enter your name:</label>
                        <input
                            type="text"
                            name="name"
                            className="login-input"
                            value={name || ""}
                            onChange={(e)=>setName(e.target.value)}
                        />
                    

                    <label className="login-label">Enter your email: </label>
                        <input
                            type="email"
                            name="email"
                            className="login-input"
                            value={email || ""}
                            onChange={(e)=>setEmail(e.target.value)}

                        />
                   
                    <br />
                    <label className="login-label">Enter your password:</label>
                        <input
                            type="password"
                            name="password"
                            className="login-input"
                            value={password || ""}
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                    
                    <br />
                    <button type="submit" className="login-btn">Register</button>
                    <p className='form-footer'>Have an Account?<Link  className='custom-link' to="/">Login here</Link></p>
                </form>
            </div>
        </div>
        </div>
    </>
  )
}

export default Register
