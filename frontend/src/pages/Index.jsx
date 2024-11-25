import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userPreferences = localStorage.getItem("userPreferences");
    navigate(userPreferences ? "/dashboard" : "/onboarding");
  }, [navigate]);

  return null;
};

export default Index;