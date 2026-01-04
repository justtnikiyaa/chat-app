import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {

  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  
  const {login} = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // First click on 'Create Account' moves to the bio step
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    // Client-side validation
    if (currState === "Sign up") {
      if (!fullName || !email || !password || !bio) {
        toast.error("Missing details");
        return;
      }

      // server expects `fullname` not `fullName`
      const res = await login("signup", { fullname: fullName, email, password, bio });
      if (res?.success) {
        // ensure navigation after signup succeeds
        navigate('/');
      }

    } else {
      if (!email || !password) {
        toast.error("Missing details");
        return;
      }

      const res = await login("login", { email, password });
      if (res?.success) {
        navigate('/');
      }
    }
  }
  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* Left Section */}
      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]' />

      {/* Right Section */}

      <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
      
      <h2 className='font-medium text-2xl flex justify-between items-center'>
        {currState}
        {isDataSubmitted && <img onClick={()=> setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer'/>}

        
      </h2>

      {currState === "Sign up" && !isDataSubmitted &&(
        <input onChange={(e)=>setFullName(e.target.value)} value={fullName}
        type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder="Full Name" required/>
      )}

      {!isDataSubmitted &&(
        <>
        <input onChange={(e)=>setEmail(e.target.value)} value={email}
        type="email"  placeholder="Email Address" required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
        
        <input onChange={(e)=>setPassword(e.target.value)} value={password}
        type="password"  placeholder="Password" required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
        </>
      )}
      
      {currState === "Sign up" && isDataSubmitted && (
        <textarea onChange={(e)=>setBio(e.target.value)} value={bio}
        rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500' placeholder='provide a short bio...' required> </textarea>
      )
      }

      <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
        {currState === "Sign up" ? "Create Account" : "Login Now"}
      </button>

      <div className='flex items-center gap-2 text-sm text-gray-500'>
        <input type="checkbox" />
        <p>Agree to the terms of use & privacy policy.</p>
      </div>

      <div className='flex flex-col gap-2'>
        {currState === "Sign up" ? (
          <p className='text-sm text-gray-600'>Already have an account ? <span onClick={()=>{setCurrState("Login"); setIsDataSubmitted(false)}} className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
        ) : (
          <p className='text-sm text-gray-600'>Create an account <span onClick={()=>setCurrState("Sign up")} className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
        )}
      </div>



      </form>
    </div>
  )
}

export default LoginPage
