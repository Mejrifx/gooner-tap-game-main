// Consent management utility
export interface ConsentData {
  hasConsented: boolean;
  consentDate: string;
  consentVersion: string;
}

const CONSENT_KEY = 'gooner-tap-consent';
const CURRENT_CONSENT_VERSION = '1.0';

export class ConsentManager {
  static setConsent(hasConsented: boolean): void {
    const consentData: ConsentData = {
      hasConsented,
      consentDate: new Date().toISOString(),
      consentVersion: CURRENT_CONSENT_VERSION
    };
    
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
    } catch (error) {
      console.warn('[Consent] Failed to save consent to localStorage:', error);
    }
  }

  static getConsent(): ConsentData | null {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored) as ConsentData;
      
      // Check if consent is for current version
      if (data.consentVersion !== CURRENT_CONSENT_VERSION) {
        // Consent was given for older version, require new consent
        this.clearConsent();
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('[Consent] Failed to read consent from localStorage:', error);
      return null;
    }
  }

  static hasValidConsent(): boolean {
    const consent = this.getConsent();
    return consent?.hasConsented === true;
  }

  static hasDeclinedConsent(): boolean {
    const consent = this.getConsent();
    return consent?.hasConsented === false;
  }

  static clearConsent(): void {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch (error) {
      console.warn('[Consent] Failed to clear consent from localStorage:', error);
    }
  }

  static needsConsent(): boolean {
    const consent = this.getConsent();
    return consent === null;
  }
}
