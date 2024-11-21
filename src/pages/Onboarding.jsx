import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const interests = [
  { id: "tech", label: "Technology" },
  { id: "sports", label: "Sports" },
  { id: "arts", label: "Arts & Culture" },
  { id: "business", label: "Business" },
];

const Onboarding = () => {
  const navigate = useNavigate();
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
    if (step === 2 && formData.interests.length === 0) {
      toast.error("Please select at least one interest");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 animate-fade-in">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Welcome to FluentHub</h1>
            <p className="text-gray-600 mt-2">Let's personalize your learning experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
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
            ) : (
              <div className="space-y-4">
                <Label>What are your interests?</Label>
                <div className="grid grid-cols-2 gap-4">
                  {interests.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center space-x-2 p-3 border rounded-lg hover:border-primary transition-colors"
                    >
                      <Checkbox
                        id={interest.id}
                        checked={formData.interests.includes(interest.id)}
                        onCheckedChange={() => handleInterestToggle(interest.id)}
                      />
                      <Label htmlFor={interest.id}>{interest.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              {step === 1 ? "Next" : "Start Learning"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;