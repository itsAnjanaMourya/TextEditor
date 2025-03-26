// import { createContext, useState, useEffect } from "react";
// import axios from 'axios'
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { useNavigate } from "react-router-dom";

// export const AuthContext = createContext();

// export const AuthContextProvider = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [currentUser, setCurrentUser] = useState(null);

//     useEffect(() => {
//         const auth = getAuth();
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 user.getIdToken().then((token) => {
//                     setCurrentUser({ ...user, accessToken: token, googleAuth: true });
//                     setIsAuthenticated(true);
//                     document.cookie = `access_token=${token};`;
//                 });
            
//             } else {
//                 setCurrentUser(null);
//                 setIsAuthenticated(false);
//             }
//         });

//         return () => unsubscribe(); 
//     }, []);

//     const login = async (input) => {
//         try {
//             const res = await axios.post("http://localhost:3200/auth/login", input);
//             const token = res.data.token;
//             document.cookie = `access_token=${token};`;
//             setIsAuthenticated(true);
//             setCurrentUser({ ...res.data.user, accessToken: token, googleAuth: false });
//         } catch (err) {
//             console.error("Login error:", err);
//             throw err;
//         }
//     };

//     const logout = async () => {
//         const auth = getAuth();
//         await auth.signOut(); // Sign out from Firebase
//         document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
//         setIsAuthenticated(false);
//         setCurrentUser(null);
//         window.location.href = "/";
//     };

//     return (
//         <AuthContext.Provider
//             value={{
//                 login,
//                 isAuthenticated,
//                 setIsAuthenticated,
//                 currentUser,
//                 setCurrentUser,
//                 logout,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// };

import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Combined auth state management
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
                // Check for existing JWT session
                try {
                    const response = await axios.get('http://localhost:3200/auth/check-session', {
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
            const res = await axios.post("http://localhost:3200/auth/login", credentials);
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
            // Try Firebase logout if Google-authenticated
            if (currentUser?.googleAuth) {
                await signOut(auth);
            }
            // Clear JWT session
            await axios.post('http://localhost:3200/auth/logout');
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