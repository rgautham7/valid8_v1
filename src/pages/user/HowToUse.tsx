import { useState } from 'react';
import { 
  LogIn, 
  UserPlus, 
  Smartphone, 
  Calendar, 
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import UserNavbar from '../../components/layout/UserNavbar';

const steps = [
  {
    icon: UserPlus,
    title: "1. Account Setup",
    description: "Your healthcare provider has registered you in the Valid8 system. You can log in using your User ID (e.g., USR_A1) and the default password 'user123'. For security, we recommend changing your password after your first login.",
    imageUrl: "https://images.unsplash.com/photo-1557180295-76eee20ae8aa?auto=format&fit=crop&w=800&q=80"
  },
  {
    icon: LogIn,
    title: "2. Dashboard Overview",
    description: "After logging in, you'll see your personalized dashboard showing your device allocation date and usage statistics. The heatmap calendar shows your device usage patterns over time, with different colors indicating how many devices you used each day.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
  },
  {
    icon: Plus,
    title: "3. Recording Device Usage",
    description: "To record your daily device usage, click the 'Add Today's Usage' button. Select which devices you've used and the time of usage. This helps your healthcare provider monitor your health management routine and ensures accurate tracking.",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
  },
  {
    icon: Smartphone,
    title: "4. Managing Your Devices",
    description: "Visit the 'My Devices' section to see all devices allocated to you. For each device, you can view when it was allocated, when you last used it, and usage statistics. This helps you keep track of your device usage patterns."
  },
  {
    icon: Calendar,
    title: "5. Understanding the Heatmap",
    description: "The heatmap calendar shows your device usage history:\n• Gray: No devices used that day\n• Light green: One device used\n• Medium green: Two devices used\n• Dark green: Three or more devices used\n\nHover over any day to see exactly which devices were used."
  }
];

const HowToUse = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const goToPrevious = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      
      <div className="max-w-4xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-900 md:text-3xl">
          How to Use Valid8
        </h1>

        {/* Progress bar */}
        <div className="w-full h-2 mb-8 bg-gray-200 rounded-full">
          <div 
            className="h-2 transition-all duration-300 ease-in-out bg-blue-600 rounded-full"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Card */}
        <div className="overflow-hidden bg-white shadow-xl rounded-xl">
          <div className="relative p-4 min-h-[400px] md:p-8 md:min-h-[500px]">
            {/* Content */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-full md:w-20 md:h-20">
                <Icon className="w-8 h-8 text-blue-600 md:w-10 md:h-10" />
              </div>
              
              <h2 className="mb-6 text-xl font-semibold text-center text-gray-900 md:text-2xl">
                {step.title}
              </h2>

              <div className="mb-8 prose prose-blue max-w-none">
                {step.description.split('\n').map((line, index) => (
                  <p key={index} className="mb-2 text-sm text-gray-600 md:text-base">
                    {line}
                  </p>
                ))}
              </div>

              {step.imageUrl && (
                <img 
                  src={step.imageUrl} 
                  alt={step.title}
                  className="object-cover w-full max-w-md mx-auto mb-8 rounded-lg shadow-lg max-h-60 md:max-h-80"
                />
              )}
            </div>

            {/* Navigation buttons */}
            <div className="absolute left-0 right-0 flex justify-between px-4 bottom-4 md:px-8">
              <button
                onClick={goToPrevious}
                disabled={currentStep === 0}
                className={`flex items-center justify-center w-10 h-10 rounded-full md:w-12 md:h-12 ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                } transition-colors duration-200`}
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="flex items-center space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      currentStep === index
                        ? 'bg-blue-600 w-4'
                        : 'bg-blue-200'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                disabled={currentStep === steps.length - 1}
                className={`flex items-center justify-center w-10 h-10 rounded-full md:w-12 md:h-12 ${
                  currentStep === steps.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                } transition-colors duration-200`}
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Help section */}
        <div className="p-4 mt-8 rounded-lg bg-blue-50 md:p-6 md:mt-12">
          <h3 className="mb-2 text-lg font-semibold text-blue-900 md:mb-4 md:text-xl">Need Help?</h3>
          <p className="text-sm text-blue-800 md:text-base">
            If you need additional assistance or have questions about using Valid8, 
            please contact your healthcare provider or our support team at support@valid8.example.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;