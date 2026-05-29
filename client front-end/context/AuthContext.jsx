import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendURL = import.meta.env.DEV 
    ? (import.meta.env.VITE_BACKEND_URL || "http://localhost:5001") 
    : window.location.origin;
axios.defaults.baseURL = backendURL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]); // default to empty array to avoid .includes on null
    const [socket, setSocket] = useState(null);

    //check if user is authenticated and if so, set the user data and connect to socket   

    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            console.log('checkAuth response:', data);
            if (data?.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            console.error('checkAuth error:', error);
            toast.error(error.message)
        }
    }

    //Login function to handle user authentication and socket connection

    const login = async (state, credentials) => {
        try {
            console.log(`Auth.login -> POST /api/auth/${state}`, credentials);
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            console.log('Auth.login response:', data);
            if (data?.success) {
                const user = data.userData || data.user;
                setAuthUser(user);
                connectSocket(user);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
                return data;
            } else {
                toast.error(data.message);
                return data;
            }
        } catch (error) {
            console.error('Auth.login error:', error);
            toast.error(error.message);
            return { success: false, message: error.message };
        }
    }

    //Logout function to handle user logout and socket disconnection
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully");
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }

    //update profile function to handle user profile updates
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                // server returns updated user in data.userData
                setAuthUser(data.userData || data.updatedUser);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(error.message);
        }
    }


    //connect socket function to handle socket connection and online users updates
    const connectSocket = (user) => {
        if (!user || socket?.connected) return;
        const newSocket = io(backendURL, {
            query: {
                userId: user._id,
            },
        });
        newSocket.connect();
        setSocket(newSocket);

        // server emits "getOnlineUsers" (note camelCase U)
        newSocket.on("getOnlineUsers", (userIds) => {
            console.debug("[socket] getOnlineUsers", userIds);
            setOnlineUsers(userIds || []);
        });
    }


    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [token]);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile


    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}