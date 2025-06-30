export type GameState = 'menu' | 'playing' | 'gameOver';

export interface GameContext {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  visaTime: number; // Kept for compatibility but not used
  setVisaTime: (time: number | ((prev: number) => number)) => void;
  applications: number;
  setApplications: (count: number | ((prev: number) => number)) => void;
  rejections: number;
  setRejections: (count: number | ((prev: number) => number)) => void;
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  gameMessage: string;
  setGameMessage: (message: string) => void;
  showMessage: boolean;
  setShowMessage: (show: boolean) => void;
  audioManager: AudioManager;
  typingMessage: string;
  setTypingMessage: (message: string) => void;
  showTypingMessage: boolean;
  setShowTypingMessage: (show: boolean) => void;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  onGround: boolean;
  moving: boolean;
  facingLeft: boolean;
  animationFrame: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  crumbling?: boolean;
  crumbleTimer?: number;
  moving?: boolean;
  moveDirection?: number;
  moveSpeed?: number;
  originalX?: number;
  moveRange?: number;
  phantom?: boolean;
  phantomTimer?: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rejection' | 'deadline' | 'requirement' | 'email' | 'spam' | 'interview' | 'reference' | 
        'teleport' | 'laser' | 'bomb' | 'quicksand' | 'lightning' | 'portal' | 'gravitywell' |
        'virus' | 'spy' | 'databreach' | 'corruption' | 'boss';
  active: boolean;
  animationFrame: number;
  velocityX?: number;
  velocityY?: number;
  targetX?: number;
  targetY?: number;
  homingSpeed?: number;
  timer?: number;
  portalId?: number;
}

export interface Goal {
  x: number;
  y: number;
  width: number;
  height: number;
  isReal: boolean;
  animationFrame: number;
}

export interface AudioManager {
  play: (sound: string) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
  playTheme: () => void;
  stopTheme: () => void;
}