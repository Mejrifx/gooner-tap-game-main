import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, MapPin, Globe, Eye } from "lucide-react";

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onAccept, onDecline }) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-blue-500" />
            Privacy & Location Consent
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            We respect your privacy and want to be transparent about how we use your data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              What location data do we collect?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your approximate country/region (not precise location)</li>
              <li>• This is used only for the global leaderboard</li>
              <li>• We use your IP address to determine your country</li>
              <li>• No GPS or exact location data is collected</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              How do we use this data?
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Display your country on the global leaderboard</li>
              <li>• Aggregate tap counts by country</li>
              <li>• Enhance the competitive gaming experience</li>
              <li>• Data is stored securely and not shared with third parties</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Your rights & choices
            </h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• You can decline and still play the game</li>
              <li>• If you decline, you'll appear as "Unknown Region"</li>
              <li>• You can change your consent anytime in settings</li>
              <li>• Your data can be deleted upon request</li>
            </ul>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p>
              By clicking "Accept", you consent to the collection and use of your approximate location 
              data as described above. You can read our full{' '}
              <a href="/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{' '}
              for more details.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onDecline}
            className="w-full sm:w-auto"
          >
            Decline (Play as Unknown)
          </Button>
          <Button 
            onClick={onAccept}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
