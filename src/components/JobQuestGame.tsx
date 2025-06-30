import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import MenuScreen from './MenuScreen';
import { GameState, GameContext } from '../types/game';
import { AudioManager } from '../utils/AudioManager';

const JobQuestGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [applications, setApplications] = useState(0);
  const [rejections, setRejections] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameMessage, setGameMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [showTypingMessage, setShowTypingMessage] = useState(false);
  
  const audioManagerRef = useRef(new AudioManager());

  const gameContext: GameContext = {
    gameState,
    setGameState,
    visaTime: 0, // Timer removed
    setVisaTime: () => {}, // No-op
    applications,
    setApplications,
    rejections,
    setRejections,
    currentLevel,
    setCurrentLevel,
    gameMessage,
    setGameMessage,
    showMessage,
    setShowMessage,
    typingMessage,
    setTypingMessage,
    showTypingMessage,
    setShowTypingMessage,
    audioManager: audioManagerRef.current
  };

  const startGame = useCallback((level: number = 1) => {
    setGameState('playing');
    setApplications(0);
    setRejections(0);
    setCurrentLevel(level);
    setGameMessage('');
    setShowMessage(false);
    setTypingMessage('');
    setShowTypingMessage(false);
    audioManagerRef.current.stopTheme();
    audioManagerRef.current.play('ambient');
    
    // Save current level to localStorage for continue functionality
    localStorage.setItem('jobquest-current-level', level.toString());
  }, []);

  const quitGame = useCallback(() => {
    setGameState('menu');
    audioManagerRef.current.playTheme();
  }, []);

  // Save progress when level changes during gameplay
  useEffect(() => {
    if (gameState === 'playing' && currentLevel > 1) {
      localStorage.setItem('jobquest-current-level', currentLevel.toString());
    }
  }, [currentLevel, gameState]);

  // Handle level progression
  useEffect(() => {
    if (currentLevel > 25 && gameState === 'playing') {
      // Player completed all 25 levels - ultimate victory
      setGameMessage('Corporate empire conquered. Ultimate success achieved!');
      setShowMessage(true);
      audioManagerRef.current.play('success');
      
      // Clear saved progress since game is completed
      localStorage.removeItem('jobquest-current-level');
      
      setTimeout(() => {
        setGameState('menu');
        audioManagerRef.current.playTheme();
      }, 4000);
    }
  }, [currentLevel, gameState]);

  // Start theme music when on menu
  useEffect(() => {
    if (gameState === 'menu') {
      audioManagerRef.current.playTheme();
    }
  }, [gameState]);

  if (gameState === 'menu') {
    return <MenuScreen onStartGame={startGame} audioManager={audioManagerRef.current} />;
  }

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
      <div className="relative w-full h-full max-w-none bg-slate-900 overflow-hidden">
        <GameCanvas gameContext={gameContext} />
        <GameUI gameContext={gameContext} onQuit={quitGame} />

        {/* Typing Animation Message - Positioned at top center, smaller */}
        {showTypingMessage && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white text-black p-3 rounded border border-gray-300 max-w-xs shadow-lg">
              <div className="text-xs font-mono leading-relaxed">
                {typingMessage}
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-slate-800 text-slate-100 p-12 rounded border border-slate-600 text-center max-w-lg mx-4">
              <div className="text-4xl font-mono mb-8">Career Ended</div>
              <div className="text-lg text-slate-400 mb-8 space-y-3 font-mono">
                <div>Interviews completed: {applications}</div>
                <div>Applications rejected: {rejections}</div>
                <div>Levels reached: {currentLevel}/25</div>
              </div>
              <div className="text-sm text-slate-500 mb-8 font-mono">
                The corporate tower claims another soul.
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => startGame(currentLevel)}
                  className="bg-blue-700 hover:bg-blue-600 text-slate-100 px-6 py-3 rounded text-lg font-mono transition-colors"
                >
                  Retry Level
                </button>
                <button
                  onClick={quitGame}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-6 py-3 rounded text-lg font-mono transition-colors"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobQuestGame;