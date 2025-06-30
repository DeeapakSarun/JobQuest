import React, { useRef, useEffect, useCallback } from 'react';
import { GameContext } from '../types/game';
import { GameEngine } from '../utils/GameEngine';

interface GameCanvasProps {
  gameContext: GameContext;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameContext }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine>();
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameEngineRef.current || !canvasRef.current || gameContext.gameState !== 'playing') return;
    
    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;
    
    const cappedDeltaTime = Math.min(deltaTime, 1/30);
    
    gameEngineRef.current.update(cappedDeltaTime);
    gameEngineRef.current.render();
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameContext.gameState]);

  useEffect(() => {
    if (canvasRef.current && gameContext.gameState === 'playing') {
      const canvas = canvasRef.current;
      
      // Set canvas to full screen
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Initialize game engine
      gameEngineRef.current = new GameEngine(canvas, gameContext);
      
      // Start game loop
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      
      // Setup keyboard controls
      const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        gameEngineRef.current?.handleKeyDown(e);
      };
      
      const handleKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        gameEngineRef.current?.handleKeyUp(e);
      };
      
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [gameLoop, gameContext.gameState, gameContext.currentLevel]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-slate-900"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default GameCanvas;