import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import WelcomeScreens from "@/components/WelcomeScreens.jsx";
import { CheckCircle } from "lucide-react";

const interests = [
  { id: "business", label: "Business", icon: "office" },
  { id: "travel", label: "Travel", icon: "travel" },
  { id: "entertainment", label: "Entertainment", icon: "city" },
  { id: "socializing", label: "Socializing", icon: "socializing" },
  { id: "culture", label: "Culture", icon: "culture" },
  { id: "dating", label: "Dating", icon: "dating" },
  { id: "shopping", label: "Shopping", icon: "shopping" },
  { id: "food", label: "Food", icon: "food" },
  { id: "family", label: "Family", icon: "family" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    country: "",
    interests: [],
  });

  const handleInterestToggle = (interestId) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1 && !formData.country) {
      toast.error("Please enter your country");
      return;
    }
    if (step === 2 && formData.interests.length < 3) {
      toast.error("Please select at least three interests");
      return;
    }
    if (step === 1) {
      setStep(2);
    } else {
      // Save user preferences and redirect
      localStorage.setItem("userPreferences", JSON.stringify(formData));
      toast.success("Welcome to FluentHub!");
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

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
                  id="country"
                  placeholder="Enter your country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, country: e.target.value }))
                  }
                />
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
              {interests.map((interest) => (
                <div
                  key={interest.id}
                  className={`bg-neutral-200 rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer relative ${formData.interests.includes(interest.id) ? 'ring-2 ring-green-500 border border-green-500' : ''
                    }`}
                  onClick={() => handleInterestToggle(interest.id)}
                >
                  <img
                    src={`https://tools-api.webcrumbs.org/image-placeholder/48/48/${interest.icon}/1`}
                    alt={interest.label}
                    className="w-full h-full object-contain"
                  />
                  <span className="text-sm text-neutral-700">{interest.label}</span>
                </div>
              ))}
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

