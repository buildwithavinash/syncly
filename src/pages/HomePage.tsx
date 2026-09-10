import Header from "../components/common/Header"
import HeroSection from "../components/ui/HeroSection"
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
     const { user, session, loading } = useAuth();

  console.log("Auth loading:", loading);
  console.log("Auth user:", user);
  console.log("Auth session:", session);
    return (
        <div className="min-h-screen">
            <Header/>
             <p>
        {loading
          ? "Checking authentication..."
          : user
            ? `Logged in as ${user.email}`
            : "Not logged in"}
      </p>
            <HeroSection/>
        </div>
    )
}

export default HomePage