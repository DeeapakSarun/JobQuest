import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Settings, VolumeX, Volume2, X, User, RotateCcw, ExternalLink, Github, Linkedin } from 'lucide-react';
import profileImage from '../assets/IMG_5598.jpg';

interface MenuScreenProps {
  onStartGame: (level?: number) => void;
  audioManager?: any;
}

interface AnimatedEmail {
  id: number;
  x: number;
  y: number;
  text: string;
  speedX: number;
  speedY: number;
  opacity: number;
  delay: number;
  currentIndex: number;
  typingSpeed: number;
  shimmerOffset: number;
  directionX: number;
  directionY: number;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onStartGame, audioManager }) => {
  const [showControls, setShowControls] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [animatedEmails, setAnimatedEmails] = useState<AnimatedEmail[]>([]);
  const [savedLevel, setSavedLevel] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const rejectionTexts = [
    "We regret to inform you that we have decided to move forward with other candidates...",
    "Thank you for your interest. Unfortunately, we cannot proceed with your application...",
    "After careful consideration, we have selected another candidate for this position...",
    "We appreciate your time but have chosen to pursue other applicants...",
    "Your qualifications are impressive, however we found a better fit...",
    "Position has been filled. We will keep your resume on file..."
  ];

  // Stage names for level display
  const getStageNames = (level: number): string => {
    const stageNames = {
      1: "Vanishing Opportunities",
      2: "Backwards Thinking",
      3: "Upside Down World", 
      4: "Mirage Markets",
      5: "Chaos Theory",
      6: "Crumbling Dreams",
      7: "Shifting Sands",
      8: "Digital Pursuit",
      9: "Inbox Apocalypse",
      10: "Final Descent",
      11: "Phantom Platforms",
      12: "Teleport Maze",
      13: "Wind Tunnel",
      14: "Laser Grid",
      15: "Ticking Bombs",
      16: "Mirror Dimension",
      17: "Quicksand Valley",
      18: "Electric Storm",
      19: "Portal Nexus",
      20: "Gravity Wells",
      21: "Virus Outbreak",
      22: "Corporate Espionage",
      23: "Data Breach",
      24: "System Corruption",
      25: "Final Boss Chamber"
    };
    return stageNames[level as keyof typeof stageNames] || "Unknown Territory";
  };

  // Load saved progress on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('jobquest-current-level');
    if (savedProgress) {
      const level = parseInt(savedProgress, 10);
      if (level > 1 && level <= 25) {
        setSavedLevel(level);
      }
    }
  }, []);

  // Initialize mute state from audio manager
  useEffect(() => {
    if (audioManager) {
      setIsMuted(audioManager.isMuted());
    }
  }, [audioManager]);

  useEffect(() => {
    // Initialize animated emails with random directions
    const emails: AnimatedEmail[] = [];
    for (let i = 0; i < 8; i++) {
      const directionX = (Math.random() - 0.5) * 2;
      const directionY = (Math.random() - 0.5) * 2;
      
      emails.push({
        id: i,
        x: Math.random() * (window.innerWidth - 400),
        y: Math.random() * window.innerHeight,
        text: rejectionTexts[Math.floor(Math.random() * rejectionTexts.length)],
        speedX: 0.3 + Math.random() * 0.4,
        speedY: 0.2 + Math.random() * 0.3,
        opacity: 0.4 + Math.random() * 0.3,
        delay: Math.random() * 2000,
        currentIndex: 0,
        typingSpeed: 40 + Math.random() * 30,
        shimmerOffset: Math.random() * 100,
        directionX: directionX,
        directionY: directionY
      });
    }
    setAnimatedEmails(emails);

    // Animation loop for movement
    const animate = () => {
      setAnimatedEmails(prev => prev.map(email => {
        let newX = email.x + (email.speedX * email.directionX);
        let newY = email.y + (email.speedY * email.directionY);
        let newDirectionX = email.directionX;
        let newDirectionY = email.directionY;

        // Bounce off edges and change direction
        if (newX <= 0 || newX >= window.innerWidth - 400) {
          newDirectionX = -email.directionX;
          newX = Math.max(0, Math.min(window.innerWidth - 400, newX));
        }
        
        if (newY <= 0 || newY >= window.innerHeight - 100) {
          newDirectionY = -email.directionY;
          newY = Math.max(0, Math.min(window.innerHeight - 100, newY));
        }

        const newShimmerOffset = (email.shimmerOffset + 1.5) % 200;
        
        return {
          ...email,
          x: newX,
          y: newY,
          directionX: newDirectionX,
          directionY: newDirectionY,
          shimmerOffset: newShimmerOffset
        };
      }));
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    // Typing animation with longer intervals
    const typingInterval = setInterval(() => {
      setAnimatedEmails(prev => prev.map(email => {
        if (email.currentIndex < email.text.length) {
          return {
            ...email,
            currentIndex: email.currentIndex + 1
          };
        } else {
          // Reset typing after completion
          setTimeout(() => {
            setAnimatedEmails(current => current.map(e => 
              e.id === email.id ? {
                ...e,
                currentIndex: 0,
                text: rejectionTexts[Math.floor(Math.random() * rejectionTexts.length)]
              } : e
            ));
          }, 2000 + Math.random() * 3000);
          return email;
        }
      }));
    }, 80);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(typingInterval);
    };
  }, []);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (audioManager) {
      audioManager.setMuted(newMutedState);
      
      // If unmuting and we're on the menu, start the theme
      if (!newMutedState) {
        audioManager.playTheme();
      }
    }
  };

  const handleNewGame = () => {
    // Clear saved progress and start from level 1
    localStorage.removeItem('jobquest-current-level');
    setSavedLevel(null);
    onStartGame(1);
  };

  const handleContinue = () => {
    if (savedLevel) {
      onStartGame(savedLevel);
    }
  };

  const renderMetallicText = (email: AnimatedEmail) => {
    const displayText = email.text.substring(0, email.currentIndex);
    
    return (
      <div className="relative">
        {displayText.split('').map((char, index) => {
          const shimmerPosition = (email.shimmerOffset + index * 10) % 200;
          const shimmerIntensity = Math.sin((shimmerPosition / 200) * Math.PI * 2) * 0.5 + 0.5;
          const shineIntensity = shimmerIntensity * 0.8;
          
          return (
            <span
              key={index}
              className="inline-block"
              style={{
                color: `hsl(${200 + shimmerIntensity * 60}, 30%, ${50 + shineIntensity * 30}%)`,
                opacity: email.opacity,
                textShadow: `0 0 ${shineIntensity * 12}px rgba(200, 220, 255, ${shineIntensity * 0.8}), 
                           0 0 ${shineIntensity * 24}px rgba(150, 180, 255, ${shineIntensity * 0.4}),
                           1px 1px 0px rgba(255, 255, 255, ${shineIntensity * 0.6})`,
                filter: `brightness(${1 + shineIntensity * 0.7}) contrast(${1.2})`,
                background: shineIntensity > 0.6 ? 
                  `linear-gradient(90deg, transparent, rgba(255,255,255,${shineIntensity * 0.3}), transparent)` : 
                  'transparent',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
        {email.currentIndex < email.text.length && (
          <span 
            className="animate-pulse ml-1"
            style={{ 
              color: 'hsl(200, 40%, 70%)',
              textShadow: '0 0 12px rgba(200, 220, 255, 1)',
              opacity: email.opacity
            }}
          >
            |
          </span>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Animated Background Emails */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {animatedEmails.map((email) => (
          <div
            key={email.id}
            className="absolute font-mono text-sm select-none will-change-transform"
            style={{
              left: `${email.x}px`,
              top: `${email.y}px`,
              transform: `rotate(${Math.sin(Date.now() * 0.0008 + email.id) * 3}deg)`,
              transition: 'none'
            }}
          >
            <div className="flex items-start gap-3 max-w-lg">
              <span 
                className="text-xl flex-shrink-0"
                style={{
                  filter: `drop-shadow(0 0 8px rgba(200, 220, 255, 0.8)) brightness(1.3)`,
                  opacity: email.opacity
                }}
              >
                📧
              </span>
              <div className="leading-relaxed">
                {renderMetallicText(email)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-slate-900/30 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-mono font-bold text-slate-100 mb-4 tracking-tight">
            <span style={{
              background: 'linear-gradient(135deg, #f8fafc, #cbd5e1, #f8fafc)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
              filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))'
            }}>
              Job Quest
            </span>
          </h1>
          <p className="text-xl font-mono text-slate-400">
            Corporate Tower Edition
          </p>
        </div>

        {/* Game Buttons */}
        <div className="flex flex-col gap-4 mb-16">
          {/* New Game Button */}
          <button
            onClick={handleNewGame}
            className="group bg-blue-600/90 hover:bg-blue-500/90 text-slate-100 font-mono text-2xl py-6 px-12 rounded-lg transition-all duration-300 flex items-center gap-4 shadow-2xl hover:shadow-blue-500/20 hover:scale-105 backdrop-blur-sm border border-blue-600/50"
          >
            <Play className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
            New Game
          </button>

          {/* Continue Button - Only show if there's saved progress */}
          {savedLevel && (
            <button
              onClick={handleContinue}
              className="group bg-slate-700/90 hover:bg-slate-600/90 text-slate-100 font-mono text-xl py-4 px-10 rounded-lg transition-all duration-300 flex flex-col items-center gap-2 shadow-2xl hover:shadow-slate-500/20 hover:scale-105 backdrop-blur-sm border border-slate-600/50"
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Continue
              </div>
              <div className="text-sm text-slate-300 font-normal">
                Level {savedLevel}: {getStageNames(savedLevel)}
              </div>
            </button>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowControls(true)}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-slate-100 px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-600/30"
          >
            <Settings className="w-5 h-5" />
            <span className="font-mono text-sm">Controls</span>
          </button>

          <button
            onClick={() => setShowCredits(true)}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-slate-100 px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-600/30"
          >
            <User className="w-5 h-5" />
            <span className="font-mono text-sm">Credits</span>
          </button>

          <button
            onClick={toggleMute}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-slate-100 px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-600/30"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span className="font-mono text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
        </div>
      </div>

      {/* Controls Modal */}
      {showControls && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800/95 border border-slate-600 rounded-xl p-8 max-w-md mx-4 shadow-2xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-mono text-slate-100">Game Controls</h2>
              <button
                onClick={() => setShowControls(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-300">Move Left/Right</span>
                <div className="bg-slate-700 px-3 py-1 rounded font-mono text-slate-100">← →</div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-300">Jump</span>
                <div className="bg-slate-700 px-3 py-1 rounded font-mono text-slate-100">↑ / Space</div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-300">Quit Game</span>
                <div className="bg-slate-700 px-3 py-1 rounded font-mono text-slate-100">Esc</div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-900/50 rounded-lg">
              <h3 className="font-mono text-slate-200 mb-2">Objective</h3>
              <p className="font-mono text-sm text-slate-400 leading-relaxed">
                Navigate through 25 floors of corporate challenges. Reach the building entrance on each floor to advance. Avoid rejection emails and corporate traps!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Credits Modal */}
      {showCredits && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800/95 border border-slate-600 rounded-xl p-8 max-w-lg mx-4 shadow-2xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-mono text-slate-100">Credits</h2>
              <button
                onClick={() => setShowCredits(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Developer Section */}
              <div className="text-center border-b border-slate-700 pb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden shadow-lg">
                  <img 
                    src={profileImage} 
                    alt="Deepak Sarun Y"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <User className="w-12 h-12 text-white hidden" />
                </div>
                <h3 className="font-mono text-xl text-slate-100 mb-2">Deepak Sarun Y</h3>
                <p className="font-mono text-slate-400 text-sm mb-4">Game Developer & Software Engineer</p>
                
                {/* Social Links */}
                <div className="flex justify-center gap-3 flex-wrap">
                  <a 
                    href="https://www.linkedin.com/in/deepaksaruny/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition-colors text-sm font-mono shadow-lg hover:shadow-blue-500/20 hover:scale-105"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                  <a 
                    href="https://github.com/DeeapakSarun" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-mono shadow-lg hover:shadow-gray-500/20 hover:scale-105"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                  <a 
                    href="https://devpost.com/DeeapakSarun" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg transition-colors text-sm font-mono shadow-lg hover:shadow-indigo-500/20 hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4" />
                    DevPost
                  </a>
                </div>
              </div>

              {/* Game Info Section */}
              <div className="text-center">
                <h3 className="font-mono text-xl text-slate-100 mb-2">Job Quest</h3>
                <p className="font-mono text-slate-400 text-sm">Corporate Tower Edition</p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-mono text-slate-200 text-sm mb-1">Game Design & Development</h4>
                  <p className="font-mono text-slate-400 text-xs">Created with React & TypeScript</p>
                </div>
                
                <div>
                  <h4 className="font-mono text-slate-200 text-sm mb-1">Art & Animation</h4>
                  <p className="font-mono text-slate-400 text-xs">Custom pixel art & particle effects</p>
                </div>
                
                <div>
                  <h4 className="font-mono text-slate-200 text-sm mb-1">Audio</h4>
                  <p className="font-mono text-slate-400 text-xs">Procedural sound generation & theme music</p>
                </div>

                <div>
                  <h4 className="font-mono text-slate-200 text-sm mb-1">Special Thanks</h4>
                  <p className="font-mono text-slate-400 text-xs">To all job seekers navigating the corporate maze</p>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <p className="font-mono text-xs text-slate-500 text-center">
                  © 2025 Job Quest Game. All rights reserved.
                </p>
                <p className="font-mono text-xs text-slate-500 text-center mt-1">
                  Made with ❤️ for job seekers everywhere
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuScreen;