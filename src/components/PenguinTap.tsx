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

  // Initialize geolocation for country flag (no SW registration in prod to avoid stale caches)
  useEffect(() => {
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
    const realtimeReceivedRef = { current: false } as { current: boolean };
    const channel = supabase
      .channel('realtime-taps')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'global_state', filter: 'id=eq.1' },
        (payload) => {
          realtimeReceivedRef.current = true;
          const newTotal = (payload.new as any)?.total_taps;
          if (typeof newTotal === 'number') setGlobalTaps(newTotal);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'country_taps' },
        () => {
          realtimeReceivedRef.current = true;
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

    // Fallback polling if realtime doesn't kick in
    let stopPolling: (() => void) | null = null;
    const fallbackTimeout = window.setTimeout(() => {
      if (!realtimeReceivedRef.current) {
        const interval = window.setInterval(async () => {
          const [{ data: g }, { data: lb }] = await Promise.all([
            supabase.from('global_state').select('total_taps').eq('id', 1).maybeSingle(),
            supabase.from('country_taps').select('country_code, taps').order('taps', { ascending: false }).limit(20),
          ]);
          if ((g as any)?.total_taps != null) setGlobalTaps(Number((g as any).total_taps));
          if (Array.isArray(lb)) {
            setLeaderboard(lb.map((r) => ({ country: countryCodeToFlag(r.country_code), countryName: getCountryName(r.country_code), taps: Number(r.taps) })));
          }
        }, 2000);
        stopPolling = () => window.clearInterval(interval);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      window.clearTimeout(fallbackTimeout);
      if (stopPolling) stopPolling();
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

  

  const pressActiveRef = useRef<boolean>(false);

  const handlePressStart = useCallback(() => {
    if (pressActiveRef.current) return;
    pressActiveRef.current = true;
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
    pressActiveRef.current = false;
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
      <nav className="relative grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-card/20 backdrop-blur-sm">
        {/* Left: logo */}
        <div className="flex items-center">
          <img
            src="/gooner-mouth-open.png"
            alt="GOONER"
            className="h-10 md:h-12 lg:h-14 w-auto select-none transition-transform duration-150 hover:scale-105 hover:drop-shadow-lg"
            draggable={false}
          />
        </div>

        {/* Center (desktop only): counter + leaderboard */}
        <div className="justify-self-center hidden md:block">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="text-center">
              <div className="text-sm lg:text-base text-muted-foreground">Total Taps</div>
              <div className={`text-2xl lg:text-3xl font-extrabold text-primary ${showPopEffect ? 'pop-animation' : ''}`}>{globalTaps.toLocaleString()}</div>
            </div>
            <div className="relative leaderboard-container">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="flex items-center gap-2 text-sm lg:text-base px-3 lg:px-4 py-2"
              >
                Global Taps Leaderboard
                <ChevronDown size={14} className={`transition-transform ${showLeaderboard ? 'rotate-180' : ''}`} />
              </Button>
              {showLeaderboard && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-lg shadow-xl w-96 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground text-base lg:text-lg">Country Leaderboard</h3>
                  </div>
                  <div className="py-2">
                    {leaderboard.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <span className="text-sm lg:text-base font-medium text-muted-foreground">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                          <span className="text-sm lg:text-base font-medium text-foreground">
                            {entry.country} <span className="ml-2 text-muted-foreground">{entry.countryName}</span>
                          </span>
                        </div>
                        <span className="text-sm lg:text-base font-bold text-primary">{entry.taps.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: flag + actions (side-by-side clean) */}
        <div className="flex items-center gap-2 sm:gap-3 justify-self-end flex-nowrap overflow-x-auto whitespace-nowrap">
          <span className="text-2xl" title="Your location">{countryFlag}</span>
          {/* Mobile: text for Copy CA & About; icons for X/Telegram */}
          <div className="flex md:hidden items-center gap-2 flex-nowrap">
            <Button aria-label="Copy CA" variant="ghost" size="sm" onClick={copyCA} className="flex items-center gap-1 focus:outline-none focus:ring-0">
              <Copy size={16} /> <span className="text-[10px] sm:text-xs">COPY CA</span>
            </Button>
            <Button aria-label="X" variant="ghost" size="icon" onClick={() => window.open('https://x.com/PurgyPengoon', '_blank')}>
              <span className="text-lg">𝕏</span>
            </Button>
            <Button aria-label="Telegram" variant="ghost" size="icon" onClick={() => window.open('https://t.me/gooneronabs', '_blank')}>
              <Send size={16} />
            </Button>
            <Button aria-label="About Gooner" variant="ghost" size="sm" onClick={() => window.open('https://www.purgypengoon.com/', '_blank')} className="flex items-center gap-1 focus:outline-none focus:ring-0">
              <span className="text-[10px] sm:text-xs">ABOUT</span> <ExternalLink size={14} />
            </Button>
          </div>
          {/* Desktop: labeled buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={copyCA} className="flex items-center gap-1 focus:outline-none focus:ring-0">
              <Copy size={14} /> <span>COPY CA</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.open('https://x.com/PurgyPengoon', '_blank')} className="flex items-center gap-1 focus:outline-none focus:ring-0">
              <span className="text-lg">𝕏</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.open('https://t.me/gooneronabs', '_blank')} className="flex items-center gap-1 focus:outline-none focus:ring-0">
              <Send size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.open('https://www.purgypengoon.com/', '_blank')} className="flex items-center gap-1 focus:outline-none focus:ring-0">
              <span>ABOUT GOONER</span> <ExternalLink size={14} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 select-none">
        {/* Gooner image as an interactive element */}
        <img
          src={isPressed ? '/gooner-mouth-open.png' : '/gooner-mouth-closed.png'}
          alt="GOONER"
          draggable={false}
          onPointerDown={(e) => e.isPrimary && handlePressStart()}
          onPointerUp={(e) => e.isPrimary && handlePressEnd()}
          onPointerCancel={(e) => e.isPrimary && handlePressEnd()}
          onPointerLeave={(e) => e.isPrimary && handlePressEnd()}
          className={`select-none h-auto transition-transform ${isPressed ? 'glow-effect' : ''}`}
          style={{
            touchAction: 'manipulation',
            width: 'min(90vw, 1100px)',
            maxHeight: 'calc(100vh - 120px)',
            objectFit: 'contain'
          }}
        />
        {/* Top overlay above the image (mobile only): total taps + leaderboard */}
        <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-30 md:hidden">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-center">
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground">Total Taps</div>
              <div className={`text-xl sm:text-2xl md:text-3xl font-extrabold text-primary ${showPopEffect ? 'pop-animation' : ''}`}>
                {globalTaps.toLocaleString()}
              </div>
            </div>
            <div className="relative leaderboard-container">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="flex items-center gap-2 text-xs sm:text-sm md:text-base px-2.5 sm:px-4 py-1.5"
              >
                <span className="sm:hidden">Leaderboard</span>
                <span className="hidden sm:inline">Global Taps Leaderboard</span>
                <ChevronDown size={14} className={`transition-transform ${showLeaderboard ? 'rotate-180' : ''}`} />
              </Button>
              {showLeaderboard && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-lg shadow-xl w-80 sm:w-96 max-w-[90vw] max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground text-base md:text-lg">Country Leaderboard</h3>
                  </div>
                  <div className="py-2">
                    {leaderboard.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-muted/50">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                          <span className="text-xs sm:text-sm md:text-base font-medium text-foreground">
                            {entry.country} <span className="ml-2 text-muted-foreground">{entry.countryName}</span>
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm md:text-base font-bold text-primary">{entry.taps.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-only: bottom buttons removed; all actions live in navbar */}
      </div>

      {/* Global Counter and Leaderboard */}
      {/* bottom bar removed; overlay moved to top */}

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