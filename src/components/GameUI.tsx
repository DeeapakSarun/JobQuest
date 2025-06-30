import React from 'react';
import { FileText, X, Home } from 'lucide-react';
import { GameContext } from '../types/game';

interface GameUIProps {
  gameContext: GameContext;
  onQuit: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ gameContext, onQuit }) => {
  const {
    applications,
    rejections,
    currentLevel,
    gameState,
    gameMessage,
    showMessage
  } = gameContext;

  if (gameState !== 'playing') return null;

  // Quirky stage names for all 25 levels
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

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top HUD */}
      <div className="flex justify-between items-start p-4">
        {/* Left side stats */}
        <div className="flex flex-col gap-2">
          {/* Level */}
          <div className="bg-slate-800 text-slate-200 px-3 py-2 rounded font-mono text-sm">
            Level {currentLevel}/25
          </div>
        </div>

        {/* Right side stats */}
        <div className="flex flex-col gap-2 items-end">
          {/* Applications */}
          <div className="bg-slate-800 text-slate-200 px-3 py-2 rounded font-mono text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{applications} interviews</span>
            </div>
          </div>

          {/* Rejections */}
          <div className="bg-slate-800 text-slate-200 px-3 py-2 rounded font-mono text-sm">
            <div className="flex items-center gap-2">
              <X className="w-4 h-4" />
              <span>{rejections} rejections</span>
            </div>
          </div>

          {/* Quit button */}
          <button
            onClick={onQuit}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded font-mono text-sm transition-colors pointer-events-auto"
          >
            <Home className="w-4 h-4" />
            <span>Quit</span>
          </button>
        </div>
      </div>

      {/* Game Message */}
      {showMessage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-slate-800 text-slate-200 p-4 rounded border border-slate-600 max-w-sm mx-4">
            <div className="text-sm font-mono text-center">
              {gameMessage}
            </div>
          </div>
        </div>
      )}

      {/* Stage Name - Bottom Left */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-slate-800 bg-opacity-90 text-slate-300 px-4 py-2 rounded font-mono text-sm mb-2">
          {getStageNames(currentLevel)}
        </div>
        <div className="bg-slate-800 bg-opacity-80 text-slate-400 px-3 py-2 rounded font-mono text-xs">
          ← → Move • ↑ Jump
        </div>
      </div>
    </div>
  );
};

export default GameUI;