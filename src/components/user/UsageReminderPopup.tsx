import React, { useState, useEffect } from 'react';
import { Clock, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../context/AuthContext';
import { useUsage } from '../../context/UsageContext';

interface UsageReminderPopupProps {
  onAddNow: () => void;
  onAddLater: () => void;
}

const UsageReminderPopup: React.FC<UsageReminderPopupProps> = ({ 
  onAddNow, 
  onAddLater 
}) => {
  const { userData } = useAuth();
  const { hasUsageForToday } = useUsage();
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in and hasn't recorded usage today
    if (userData && !hasUsageForToday(userData.id)) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setShow(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userData, hasUsageForToday]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="pb-3 space-y-1">
          <CardTitle className="text-xl">Record Today's Device Usage</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                It looks like you haven't recorded your device usage for today.
              </p>
              <p className="text-sm text-gray-700">
                Regular tracking helps your healthcare provider monitor your health more effectively.
              </p>
              {userData && userData.devices.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-700">Your devices:</p>
                  <ul className="pl-5 mt-1 text-sm text-gray-600 list-disc">
                    {userData.devices.map(device => (
                      <li key={device.deviceId}>
                        {device.deviceType.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setShow(false);
              onAddLater();
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Add Later
          </Button>
          <Button
            onClick={() => {
              setShow(false);
              onAddNow();
            }}
          >
            <Check className="w-4 h-4 mr-2" />
            Add Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UsageReminderPopup; 