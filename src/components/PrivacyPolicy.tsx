import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, MapPin, Database, Eye, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="min-h-screen p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Game
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                Privacy Policy
              </h1>
              <p className="text-gray-600 mt-1">$GOONER Goons! (Game)</p>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to $GOONER Goons! (Game) ("we," "our," or "us"). We are committed to protecting your privacy 
              and being transparent about how we collect, use, and protect your information. This Privacy Policy 
              explains our practices regarding data collection and use when you play our game.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              Information We Collect
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Information
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Country/Region:</strong> We collect your approximate country or region based on your IP address</li>
                  <li>• <strong>What we DON'T collect:</strong> GPS coordinates, exact location, street address, or precise location data</li>
                  <li>• <strong>Purpose:</strong> This is used solely for displaying country-based leaderboards</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Game Data</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Number of taps/clicks you make in the game</li>
                  <li>• Your position on the leaderboard</li>
                  <li>• Gameplay statistics and scores</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Technical Information</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Browser type and version</li>
                  <li>• Device type (mobile, desktop)</li>
                  <li>• Your consent preferences</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-green-600" />
              How We Use Your Information
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Global Leaderboard:</strong> Display country-based rankings and competition</li>
                <li><strong>Game Functionality:</strong> Track your progress and scores</li>
                <li><strong>Analytics:</strong> Understand game usage patterns to improve the experience</li>
                <li><strong>Security:</strong> Prevent fraud and abuse of the game</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">We do NOT sell, rent, or share your personal information with third parties for commercial purposes.</p>
            </div>
            <div className="mt-4 text-gray-700">
              <p>We may share aggregated, anonymized data (such as "Total taps from all countries") but never personal information that can identify you.</p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Consent:</strong> You can accept or decline location tracking at any time</li>
                <li><strong>Anonymous Play:</strong> You can play the game without providing location data</li>
                <li><strong>Data Deletion:</strong> You can request deletion of your data by contacting us</li>
                <li><strong>Opt-out:</strong> You can change your consent preferences anytime</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your information 
              against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely 
              using industry-standard encryption and security practices.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our game is designed to be family-friendly. We do not knowingly collect personal information from 
              children under 13. If you are a parent and believe your child has provided us with personal 
              information, please contact us, and we will delete such information.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-500 text-center">
              By using $GOONER Goons! (Game), you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
