import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthSection from "../components/AuthSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import HowItWorksSection from "../components/HowItWorksSection";
import Navbar from "../components/Navbar";

const ACCESS_TOKEN_KEY = "devcare_access_token";
const REFRESH_TOKEN_KEY = "devcare_refresh_token";
const USERNAME_KEY = "devcare_username";

function getStoredAuth() {
    return {
        access: localStorage.getItem(ACCESS_TOKEN_KEY),
        refresh: localStorage.getItem(REFRESH_TOKEN_KEY),
        username: localStorage.getItem(USERNAME_KEY),
    };
}

function LandingPage() {
    const [auth, setAuth] = useState(getStoredAuth);
    const isAuthenticated = Boolean(auth.access);
    const navigate = useNavigate();

    function storeAuth(access, refresh, username) {
        localStorage.setItem(ACCESS_TOKEN_KEY, access);
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
        localStorage.setItem(USERNAME_KEY, username);
        setAuth({ access, refresh, username });
    }

    const handleAuthSuccess = (access, refresh, username) => {
        storeAuth(access, refresh, username);
        setTimeout(() => navigate("/dashboard"), 600);
    };

    return (
        <div className="app-shell">
            <Navbar/>

            <>
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <section className="site-container pb-20" id="auth">
                    <AuthSection onAuthSuccess={handleAuthSuccess} />
                </section>
            </>
        </div>
    );
}

export default LandingPage;
