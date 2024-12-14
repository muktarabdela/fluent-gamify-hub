import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import WelcomeScreens from "@/components/WelcomeScreens.jsx";
import { CheckCircle, Briefcase, Plane, Film, Users, Palette, Heart, ShoppingBag, Utensils, Home } from "lucide-react";
import { updateUserPreferences } from "@/api/userService";
import { getTelegramUser } from "@/utils/telegram";
import { useInitialSetup } from '@/hooks/useInitialSetup';

const interests = [
  { id: "business", label: "Business & Career", icon: Briefcase },
  { id: "travel", label: "Travel & Adventure", icon: Plane },
  { id: "entertainment", label: "Arts & Entertainment", icon: Film },
  { id: "socializing", label: "Social Activities", icon: Users },
  { id: "culture", label: "Culture & Learning", icon: Palette },
  { id: "dating", label: "Dating & Relationships", icon: Heart },
  { id: "shopping", label: "Shopping & Lifestyle", icon: ShoppingBag },
  { id: "food", label: "Food & Dining", icon: Utensils },
  { id: "family", label: "Family & Home", icon: Home },
];

const countryList = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
  "South Africa",
  "Mexico",
  "Italy",
  "Spain",
  "Russia",
  "South Korea",
  "Argentina",
  "Indonesia",
  "Turkey",
  "Saudi Arabia",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Norway",
  "Denmark",
  "Finland",
  "New Zealand",
  "Portugal",
  "Poland",
  "Belgium",
  "Austria",
  "Czech Republic",
  "Greece",
  "Hungary",
  "Ireland",
  "Thailand",
  "Vietnam",
  "Malaysia",
  "Philippines",
  "Singapore",
  "Pakistan",
  "Bangladesh",
  "Egypt",
  "Nigeria",
  "Kenya",
  "Colombia",
  "Chile",
  "Peru",
  "Venezuela",
  "Ecuador",
  "Cuba",
  "Morocco",
  "Algeria",
  "Tunisia",
  "Israel",
  "Iran",
  "Iraq",
  "Jordan",
  "United Arab Emirates",
  "Qatar",
  "Oman",
  "Kuwait",
  "Bahrain",
  "Sri Lanka",
  "Myanmar",
  "Nepal",
  "Kazakhstan",
  "Uzbekistan",
  "Azerbaijan",
  "Belarus",
  "Slovakia",
  "Croatia",
  "Slovenia",
  "Bosnia and Herzegovina",
  "Serbia",
  "Bulgaria",
  "Romania",
  "Lithuania",
  "Latvia",
  "Estonia",
  "Iceland",
  "Luxembourg",
  "Monaco",
  "Liechtenstein",
  "Malta",
  "Cyprus",
  "Zimbabwe",
  "Ethiopia",
  "Ghana",
  "Uganda",
  "Tanzania",
  "Zambia",
  "Botswana",
  "Namibia",
  "Mozambique",
  "Angola",
  "Sudan",
  "Cameroon",
  "Ivory Coast",
  "Senegal",
  "Libya",
  "Paraguay",
  "Bolivia",
  "Uruguay",
  "Guatemala",
  "Honduras",
  "El Salvador",
  "Panama",
  "Costa Rica",
  "Dominican Republic",
  "Jamaica",
  "Trinidad and Tobago",
  "Barbados",
  "Bahamas",
  "Haiti",
  "Madagascar",
  "Mali",
  "Chad",
  "Somalia",
  "Democratic Republic of the Congo",
  "Afghanistan",
  "Armenia",
  "Georgia",
  "Mongolia",
  "North Korea",
  "Turkmenistan",
  "Tajikistan",
  "Kyrgyzstan"
];


const Onboarding = () => {
  const { loading, user, showWelcome, setShowWelcome } = useInitialSetup();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    country: "",
    interests: [],
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleInterestToggle = (interestId) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1 && !formData.country) {
      toast.error("Please select your country");
      return;
    }
    if (step === 2 && formData.interests.length < 3) {
      toast.error("Please select at least three interests");
      return;
    }

    if (step === 1) {
      setStep(2);
    } else {
      try {
        if (!user?.user_id) {
          toast.error("User not found!");
          return;
        }

        // Save preferences to database
        await updateUserPreferences(user.user_id, {
          country: formData.country,
          interests: formData.interests,
          onboarding_completed: true,
        });

        // Save to localStorage for client-side use
        localStorage.setItem("userPreferences", JSON.stringify(formData));

        toast.success("Welcome to FluentHub!");
        navigate("/dashboard");
      } catch (error) {
        console.error('Error saving preferences:', error);
        toast.error("Failed to save preferences. Please try again.");
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const filteredCountries = countryList.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user data, show error
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-2 text-gray-600">Unable to load user data</p>
          </div>
        </Card>
      </div>
    );
  }

  // If user has completed onboarding, redirect to dashboard
  if (user.onboarding_completed) {
    navigate('/dashboard');
    return null;
  }

  // Show welcome screens if needed
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
        <WelcomeScreens onComplete={() => setShowWelcome(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 animate-fade-in">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary">Welcome to FluentHub</h1>
              <p className="text-gray-600 mt-2">Let's personalize your learning experience</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="country">Which country are you from?</Label>
                <Input
                  id="search"
                  placeholder="Search your country"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                  {filteredCountries.map((country) => (
                    <div
                      key={country}
                      className={`p-2 cursor-pointer  ${formData.country === country ? 'bg-primary text-white' : ''
                        }`}
                      onClick={() => setFormData((prev) => ({ ...prev, country }))}
                    >
                      {country}
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Next
              </Button>
            </form>
          </div>
        ) : (
          <div className="w-full rounded-lg shadow-lg p-6 text-neutral-50">
            <div className="flex items-center justify-between mb-4">
            </div>
            <div className="text-center mb-4">
              <h2 className="font-title text-lg text-neutral-600">What topics are you interested in?</h2>
              <p className="text-sm text-neutral-400">
                Choose at least <span className="text-primary font-semibold">three</span> to help us better tailor your course plan
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {interests.map((interest) => {
                const IconComponent = interest.icon;
                return (
                  <div
                    key={interest.id}
                    className={`bg-white/50 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer transition-all hover:bg-white/60 ${formData.interests.includes(interest.id)
                      ? 'ring-2 ring-primary border border-primary bg-primary/10'
                      : 'border border-neutral-200'
                      }`}
                    onClick={() => handleInterestToggle(interest.id)}
                  >
                    <IconComponent className={`w-6 h-6 ${formData.interests.includes(interest.id)
                      ? 'text-primary'
                      : 'text-neutral-600'
                      }`} />
                    <span className="text-sm text-neutral-700 text-center font-medium">{interest.label}</span>
                  </div>
                );
              })}
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full bg-primary py-3 text-center rounded-md text-base font-semibold"
              disabled={formData.interests.length < 3}
            >
              Start Learning
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Onboarding;

