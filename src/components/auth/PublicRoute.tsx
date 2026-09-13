import { Navigate } from "react-router";
import Loader from "../common/Loader";
import { useAuth } from "../../context/AuthContext";

type PublicRouteProps = {
  children: React.ReactNode;
};

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Loading..." centered />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;