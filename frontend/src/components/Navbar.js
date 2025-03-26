import React, { useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';

const Navbar = () => {
    const { currentUser, logout } = useContext(AuthContext);

    useEffect(() => {
        console.log("isAuthenticated", currentUser);
    },[currentUser])
    return (
        <>
            <nav className="navbar navbar-light bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href={currentUser ? "/home" : "/"}>TextEditor</a>
                    <div className="navbar-links">
                        <ul className="navbar-nav" style={{ display: 'flex', flexDirection: 'row', listStyle: 'none', margin: 0, padding: 0 }}>
                            {currentUser ? (
                                <>
                                    <li className="nav-item" style={{ marginRight: '15px' }}>
                                        <button
                                            className="nav-link active btn btn-link"
                                            style={{ textDecoration: 'none', color: 'black', padding: 0 }}
                                            onClick={logout}
                                        >
                                            Log out
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item" style={{ marginRight: '15px' }}>
                                        <a className="nav-link active" aria-current="page" href="/">Login</a>
                                    </li>
                                    <li className="nav-item" style={{ marginRight: '15px' }}>
                                        <a className="nav-link active" aria-current="page" href="/register">Register</a>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;


