import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const token = await user.getIdToken();
                    setCurrentUser({ 
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        accessToken: token,
                        googleAuth: true,
                        photoURL: user.photoURL
                    });
                } catch (error) {
                    console.error("Error getting user token:", error);
                    setCurrentUser(null);
                }
            } else {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/auth/check-session`, {
                        withCredentials: true
                    });
                    if (response.data.user) {
                        setCurrentUser({
                            ...response.data.user,
                            googleAuth: false
                        });
                    }
                } catch (err) {
                    setCurrentUser(null);
                }
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (credentials) => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/login`, credentials);
            setCurrentUser({ 
                ...res.data.user, 
                accessToken: res.data.token,
                googleAuth: false 
            });
            return res.data;
        } catch (err) {
            console.error("Login error:", err);
            throw err;
        }
    };

    const logout = async () => {
        try {
            const auth = getAuth();
            if (currentUser?.googleAuth) {
                await signOut(auth);
            }
            await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/logout`);
            setCurrentUser(null);
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                loading,
                login,
                logout
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};