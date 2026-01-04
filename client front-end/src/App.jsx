import React, { useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import {Toaster} from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const App = () => {
  const {authUser} = useContext(AuthContext);
  return (
    <div
    className="bg-[url('/bgImage.svg')] bg-contain ">
      <Toaster/>
      <ErrorBoundary>
        <Routes>
          <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />}/>
          <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to="/" />}/>
          <Route path='/profile' element={authUser ? <ProfilePage/> : <Navigate to="/login" />}/>
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

export default App
