import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, ChevronDown, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const PenguinTap = () => {
  const [pops, setPops] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [showPopEffect, setShowPopEffect] = useState(false);
  const [countryFlag, setCountryFlag] = useState('🌍');
  const countryCodeRef = useRef<string>('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ country: string; countryName: string; taps: number }[]>([]);
  const { toast } = useToast();

  // Placeholder CA for GOONER token
  const CONTRACT_ADDRESS = "0xdC70311f4B19774828aA4a57520a7153AF5E58a5";

  // Supabase-driven global taps
  const [globalTaps, setGlobalTaps] = useState<number>(0);

  const countryCodeToFlag = (cc: string) => cc.toUpperCase().replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
  const countryDisplay = typeof (Intl as any).DisplayNames === 'function'
    ? new (Intl as any).DisplayNames(['en'], { type: 'region' })
    : null;
  const getCountryName = (cc: string) => {
    try {
      return countryDisplay ? countryDisplay.of(cc.toUpperCase()) : cc.toUpperCase();
    } catch {
      return cc.toUpperCase();
    }
  };

  // Tap batching (must be declared before effects that depend on flushIncrements)
  const pendingIncrementsRef = useRef<number>(0);
  const flushTimeoutRef = useRef<number | null>(null);

  const flushIncrements = useCallback(async () => {
    if (!supabase) return;
    const amount = pendingIncrementsRef.current;
    pendingIncrementsRef.current = 0;
    if (amount <= 0) return;

    await supabase.rpc('increment_taps', {
      in_country_code: countryCodeRef.current || 'ZZ',
      in_amount: amount,
    });
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current != null) return;
    flushTimeoutRef.current = window.setTimeout(() => {
      flushTimeoutRef.current = null;
      void flushIncrements();
    }, 300);
  }, [flushIncrements]);

  // Initialize service worker for PWA and get country flag
  useEffect(() => {
    // Only register service worker in production to avoid dev cache conflicts
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(() => console.log('Service Worker registration failed'));
    }

    // Get country code and flag based on user's location
    fetch('https://ipapi.co/json/')
      .then((response) => response.json())
      .then((data) => {
        const countryCode = data.country_code as string | undefined;
        if (countryCode) {
          countryCodeRef.current = countryCode.toUpperCase();
          const flag = countryCodeToFlag(countryCode);
          setCountryFlag(flag);
        }
      })
      .catch(() => {
        // Fallback to world emoji if geolocation fails
        setCountryFlag('🌍');
      });
  }, []);

  // Load initial counts and subscribe to realtime updates
  useEffect(() => {
    if (!supabase) return;

    const loadInitial = async () => {
      // Global taps
      const { data: globalRows } = await supabase
        .from('global_state')
        .select('total_taps')
        .eq('id', 1)
        .maybeSingle();
      if (globalRows?.total_taps != null) {
        setGlobalTaps(Number(globalRows.total_taps));
      }

      // Leaderboard top 20
      const { data: lbRows } = await supabase
        .from('country_taps')
        .select('country_code, taps')
        .order('taps', { ascending: false })
        .limit(20);
      if (Array.isArray(lbRows)) {
        setLeaderboard(
          lbRows.map((r) => ({
            country: countryCodeToFlag(r.country_code),
            countryName: getCountryName(r.country_code),
            taps: Number(r.taps),
          }))
        );
      }
    };

    void loadInitial();

    // Realtime subscriptions
    const channel = supabase
      .channel('realtime-taps')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'global_state', filter: 'id=eq.1' },
        (payload) => {
          const newTotal = (payload.new as any)?.total_taps;
          if (typeof newTotal === 'number') setGlobalTaps(newTotal);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'country_taps' },
        () => {
          // Refresh leaderboard on any change
          supabase
            .from('country_taps')
            .select('country_code, taps')
            .order('taps', { ascending: false })
            .limit(20)
            .then(({ data }) => {
              if (Array.isArray(data)) {
                setLeaderboard(
                  data.map((r) => ({
                    country: countryCodeToFlag(r.country_code),
                    countryName: getCountryName(r.country_code),
                    taps: Number(r.taps),
                  }))
                );
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Flush pending increments when tab goes to background or component unmounts
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        void flushIncrements();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      void flushIncrements();
    };
  }, [flushIncrements]);

  // Close leaderboard when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLeaderboard && !(event.target as Element).closest('.leaderboard-container')) {
        setShowLeaderboard(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLeaderboard]);

  

  const handlePressStart = useCallback(() => {
    setIsPressed(true);
    setPops((prev) => prev + 1);
    setShowPopEffect(true);

    // Vibration feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Play sound effect placeholder
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio not supported');
    }

    // Buffer increments and schedule a flush to reduce writes
    pendingIncrementsRef.current += 1;
    scheduleFlush();

    // Brief pop animation
    window.setTimeout(() => setShowPopEffect(false), 150);
  }, [scheduleFlush]);

  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const copyCA = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      toast({
        title: "Contract Address Copied!",
        description: "CA copied to clipboard successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 flex flex-col">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between p-4 bg-card/20 backdrop-blur-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          GOONER TapTap
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-2xl" title="Your location">{countryFlag}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCA}
            className="flex items-center gap-1"
          >
            <Copy size={14} />
            Copy CA
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://twitter.com', '_blank')}
            className="flex items-center gap-1"
          >
            <span className="text-lg">𝕏</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://t.me/gooneronabs', '_blank')}
            className="flex items-center gap-1"
          >
            <Send size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://www.purgypengoon.com/', '_blank')}
            className="flex items-center gap-1"
          >
            About Gooner
            <ExternalLink size={14} />
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-4 select-none cursor-pointer"
        role="button"
        tabIndex={0}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handlePressStart();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handlePressEnd();
          }
        }}
        style={{
          backgroundImage: `url(${isPressed ? '/gooner-mouth-open.png' : '/gooner-mouth-closed.png'})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Center counter removed intentionally. Tap area only. */}

        {/* Penguin Tap Area */}
        {/* entire area is tap zone now; removed inner button */}
      </div>

      {/* Global Counter and Leaderboard */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border p-5">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-base md:text-lg text-muted-foreground">Total Taps</div>
            <div className={`text-3xl md:text-4xl font-extrabold text-primary ${showPopEffect ? 'pop-animation' : ''}`}>
              {globalTaps.toLocaleString()}
            </div>
          </div>
          
          {/* Leaderboard Dropdown */}
          <div className="relative leaderboard-container">
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="flex items-center gap-2 text-sm md:text-base px-4 py-2"
            >
              Global Taps Leaderboard
              <ChevronDown size={14} className={`transition-transform ${showLeaderboard ? 'rotate-180' : ''}`} />
            </Button>
            
            {showLeaderboard && (
              <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 z-50 bg-card border border-border rounded-lg shadow-xl w-96 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground text-base md:text-lg">Country Leaderboard</h3>
                </div>
                <div className="py-2">
                  {leaderboard.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm md:text-base font-medium text-muted-foreground">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <span className="text-sm md:text-base font-medium text-foreground">
                          {entry.country} <span className="ml-2 text-muted-foreground">{entry.countryName}</span>
                        </span>
                      </div>
                      <span className="text-sm md:text-base font-bold text-primary">{entry.taps.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Placeholder for Solana integration */}
      {/* 
      TODO: Integrate Solana wallet connection
      import { Connection, PublicKey } from '@solana/web3.js';
      
      const connectWallet = async () => {
        if (window.solana) {
          const response = await window.solana.connect();
          console.log('Connected with Public Key:', response.publicKey.toString());
        }
      };
      */}
    </div>
  );
};

export default PenguinTap;