import { GameContext, Player, Platform, Obstacle, Goal } from '../types/game';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameContext: GameContext;
  
  // Game entities
  private player: Player;
  private platforms: Platform[] = [];
  private obstacles: Obstacle[] = [];
  private goals: Goal[] = [];
  
  // Input handling
  private keys: Set<string> = new Set();
  
  // Game timing
  private frameCount: number = 0;
  
  // Sprite handling
  private spriteImage: HTMLImageElement;
  private spriteLoaded: boolean = false;
  private processedSprite: HTMLCanvasElement | null = null;
  
  // Level mechanics
  private levelMechanics: {
    platformFade: boolean;
    controlsReversed: boolean;
    gravityFlipped: boolean;
    fakeGoals: boolean;
    crumblingPlatforms: boolean;
    movingPlatforms: boolean;
    homingMissiles: boolean;
    spamFilter: boolean;
    phantomPlatforms: boolean;
    teleportTraps: boolean;
    windTunnel: boolean;
    laserGrid: boolean;
    timeBombs: boolean;
    mirrorDimension: boolean;
    quicksand: boolean;
    electricStorm: boolean;
    portalNexus: boolean;
    gravityWells: boolean;
    virusOutbreak: boolean;
    corporateEspionage: boolean;
    dataBreach: boolean;
    systemCorruption: boolean;
    finalBoss: boolean;
  } = {
    platformFade: false,
    controlsReversed: false,
    gravityFlipped: false,
    fakeGoals: false,
    crumblingPlatforms: false,
    movingPlatforms: false,
    homingMissiles: false,
    spamFilter: false,
    phantomPlatforms: false,
    teleportTraps: false,
    windTunnel: false,
    laserGrid: false,
    timeBombs: false,
    mirrorDimension: false,
    quicksand: false,
    electricStorm: false,
    portalNexus: false,
    gravityWells: false,
    virusOutbreak: false,
    corporateEspionage: false,
    dataBreach: false,
    systemCorruption: false,
    finalBoss: false
  };

  // Camera
  private camera = { x: 0, y: 0 };

  // Typing animation
  private typingTimer: number = 0;
  private currentTypingText: string = '';
  private fullTypingText: string = '';

  // Email missile management
  private emailSpawnTimer: number = 0;
  private emailSpawnInterval: number = 3000; // 3 seconds
  private maxEmails: number = 1;
  private lastPlayerReset: number = 0;

  constructor(canvas: HTMLCanvasElement, gameContext: GameContext) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameContext = gameContext;
    
    // Load sprite sheet with proper path
    this.spriteImage = new Image();
    this.spriteImage.onload = () => {
      this.processSprite();
      this.spriteLoaded = true;
      console.log('Sprite loaded and processed successfully');
    };
    this.spriteImage.onerror = () => {
      console.error('Failed to load sprite');
      this.spriteLoaded = false;
    };
    // Use the correct path for Vite
    this.spriteImage.src = new URL('../assets/studentsprite.png', import.meta.url).href;

    
    // Initialize player
    this.player = {
      x: 100,
      y: 400,
      width: 48,
      height: 48,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      moving: false,
      facingLeft: false,
      animationFrame: 0
    };
    
    this.setupLevel();
  }

  private processSprite() {
    // Create a canvas to process the sprite and remove white background
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = this.spriteImage.width;
    tempCanvas.height = this.spriteImage.height;
    
    // Draw the original sprite
    tempCtx.drawImage(this.spriteImage, 0, 0);
    
    // Get image data to process pixels
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    // Remove white/light backgrounds by making them transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Check if pixel is white or very light (threshold-based)
      const brightness = (r + g + b) / 3;
      const isWhiteish = brightness > 240 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
      
      if (isWhiteish) {
        data[i + 3] = 0; // Make transparent
      }
    }
    
    // Put the processed image data back
    tempCtx.putImageData(imageData, 0, 0);
    
    this.processedSprite = tempCanvas;
  }

  private setupLevel() {
    const level = this.gameContext.currentLevel;
    
    // Clear existing entities
    this.platforms = [];
    this.obstacles = [];
    this.goals = [];
    
    // Reset level mechanics
    this.levelMechanics = {
      platformFade: level === 1,
      controlsReversed: level === 2 || level === 5 || level === 10,
      gravityFlipped: level === 3,
      fakeGoals: level === 4 || level === 5,
      crumblingPlatforms: level === 6 || level === 10,
      movingPlatforms: level === 7,
      homingMissiles: level >= 8,
      spamFilter: level === 9,
      phantomPlatforms: level === 11,
      teleportTraps: level === 12,
      windTunnel: level === 13,
      laserGrid: level === 14,
      timeBombs: level === 15,
      mirrorDimension: level === 16,
      quicksand: level === 17,
      electricStorm: level === 18,
      portalNexus: level === 19,
      gravityWells: level === 20,
      virusOutbreak: level === 21,
      corporateEspionage: level === 22,
      dataBreach: level === 23,
      systemCorruption: level === 24,
      finalBoss: level === 25
    };
    
    // Set email spawn parameters based on level
    if (this.levelMechanics.homingMissiles) {
      this.maxEmails = Math.min(1 + Math.floor((level - 8) / 2), 4);
      this.emailSpawnInterval = Math.max(1500, 4000 - (level - 8) * 200);
    }
    
    // Reset player position
    this.player.x = 100;
    this.player.y = this.canvas.height - 200;
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    this.player.onGround = false;
    
    // Create level structure based on screen size
    this.createLevelPlatforms();
    
    // Add level-specific mechanics
    this.setupLevelSpecifics(level);
  }

  private createLevelPlatforms() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const level = this.gameContext.currentLevel;
    
    if (level === 3) {
      // Level 3: Inverted gravity - platforms positioned for jumping downward
      this.platforms.push({ x: 0, y: 100, width: w * 0.3, height: 20, visible: true });
      
      const platformPositions = [
        { x: w * 0.25, y: 200 },
        { x: w * 0.45, y: 280 },
        { x: w * 0.65, y: 360 },
        { x: w * 0.85, y: 440 },
        { x: w * 0.7, y: 520 },
        { x: w * 0.5, y: 600 }
      ];
      
      platformPositions.forEach(pos => {
        this.platforms.push({ 
          x: pos.x - 80, 
          y: pos.y, 
          width: 160, 
          height: 20, 
          visible: true 
        });
      });
      
      this.platforms.push({ x: w - 200, y: h - 150, width: 200, height: 20, visible: true });
      return;
    }
    
    // Ground platform for other levels
    this.platforms.push({ x: 0, y: h - 100, width: w * 0.3, height: 100, visible: true });
    
    if (level === 1) {
      // Level 1: Alternating platforms
      const platformCount = 8;
      for (let i = 1; i <= platformCount; i++) {
        const x = (w / (platformCount + 1)) * i;
        const y = h - 150 - (i * 40);
        const isGroupA = i % 2 === 1;
        
        this.platforms.push({ 
          x: x - 80, 
          y, 
          width: 160, 
          height: 20, 
          visible: isGroupA
        });
      }
    } else if (level === 6 || level === 10) {
      // Level 6 & 10: Crumbling platforms
      for (let i = 1; i <= 6; i++) {
        const x = (w / 7) * i;
        const y = h - 120 - (i * 50);
        this.platforms.push({ 
          x: x - 60, 
          y, 
          width: 120, 
          height: 20, 
          visible: true,
          crumbling: true,
          crumbleTimer: 0
        });
      }
    } else if (level === 7) {
      // Level 7: Moving platforms
      for (let i = 1; i <= 5; i++) {
        const x = (w / 6) * i;
        const y = h - 150 - (i * 60);
        this.platforms.push({ 
          x: x - 50, 
          y, 
          width: 100, 
          height: 20, 
          visible: true,
          moving: true,
          moveDirection: i % 2 === 0 ? 1 : -1,
          moveSpeed: 50,
          originalX: x - 50,
          moveRange: 100
        });
      }
    } else if (level === 11) {
      // Level 11: Phantom platforms
      for (let i = 1; i <= 7; i++) {
        const x = (w / 8) * i;
        const y = h - 120 - (i * 45);
        this.platforms.push({ 
          x: x - 50, 
          y, 
          width: 100, 
          height: 20, 
          visible: true,
          phantom: Math.random() < 0.4,
          phantomTimer: 0
        });
      }
    } else {
      // Standard stable platforms for other levels
      this.createStablePlatforms(level);
    }
    
    // Final platform for non-level-3
    if (level !== 3) {
      this.platforms.push({ x: w - 200, y: h - 450, width: 200, height: 20, visible: true });
    }
  }

  private createStablePlatforms(level: number) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    const platformConfigs = [
      // Levels 2, 4, 5, 8, 9, 12-25
      { count: 6, spacing: 7, yOffset: 50, width: 120 },
      { count: 8, spacing: 9, yOffset: 45, width: 90 },
      { count: 10, spacing: 11, yOffset: 40, width: 80 }
    ];
    
    const config = level <= 5 ? platformConfigs[0] : 
                   level <= 15 ? platformConfigs[1] : platformConfigs[2];
    
    for (let i = 1; i <= config.count; i++) {
      const x = (w / (config.spacing)) * i;
      const baseY = h - 120;
      const variation = level > 10 ? Math.sin(i * 0.5) * 60 : 0;
      const y = baseY - (i * config.yOffset) + variation;
      
      this.platforms.push({ 
        x: x - config.width/2, 
        y, 
        width: config.width, 
        height: 20, 
        visible: true 
      });
    }
  }

  private setupLevelSpecifics(level: number) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Clear existing obstacles and goals
    this.obstacles = [];
    this.goals = [];
    
    switch (level) {
      case 1: this.setupLevel1(); break;
      case 2: this.setupLevel2(); break;
      case 3: this.setupLevel3(); break;
      case 4: this.setupLevel4(); break;
      case 5: this.setupLevel5(); break;
      case 6: this.setupLevel6(); break;
      case 7: this.setupLevel7(); break;
      case 8: this.setupLevel8(); break;
      case 9: this.setupLevel9(); break;
      case 10: this.setupLevel10(); break;
      case 11: this.setupLevel11(); break;
      case 12: this.setupLevel12(); break;
      case 13: this.setupLevel13(); break;
      case 14: this.setupLevel14(); break;
      case 15: this.setupLevel15(); break;
      case 16: this.setupLevel16(); break;
      case 17: this.setupLevel17(); break;
      case 18: this.setupLevel18(); break;
      case 19: this.setupLevel19(); break;
      case 20: this.setupLevel20(); break;
      case 21: this.setupLevel21(); break;
      case 22: this.setupLevel22(); break;
      case 23: this.setupLevel23(); break;
      case 24: this.setupLevel24(); break;
      case 25: this.setupLevel25(); break;
      default: this.setupLevel1();
    }
  }

  // Level setup methods
  private setupLevel1() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.4, y: h - 200, width: 32, height: 32, type: 'rejection', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
  }

  private setupLevel2() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.3, y: h - 200, width: 32, height: 32, type: 'rejection', active: true, animationFrame: 0 },
      { x: w * 0.6, y: h - 300, width: 32, height: 32, type: 'deadline', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
  }

  private setupLevel3() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.player.x = 100;
    this.player.y = 120;
    this.player.velocityY = 0;
    
    this.obstacles = [
      { x: w * 0.4, y: 350, width: 32, height: 32, type: 'requirement', active: true, animationFrame: 0 },
      { x: w * 0.7, y: 500, width: 32, height: 32, type: 'rejection', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 200, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
  }

  private setupLevel4() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.5, y: h - 300, width: 32, height: 32, type: 'rejection', active: true, animationFrame: 0 }
    ];
    
    // Spread out fake goals across different areas
    this.goals = [
      { x: w * 0.3, y: h - 500, width: 48, height: 48, isReal: false, animationFrame: 0 },
      { x: w * 0.6, y: h - 450, width: 48, height: 48, isReal: false, animationFrame: 0 },
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
  }

  private setupLevel5() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.3, y: h - 200, width: 32, height: 32, type: 'rejection', active: true, animationFrame: 0 },
      { x: w * 0.5, y: h - 300, width: 32, height: 32, type: 'deadline', active: true, animationFrame: 0 },
      { x: w * 0.7, y: h - 400, width: 32, height: 32, type: 'requirement', active: true, animationFrame: 0 }
    ];
    
    // More spread out fake goals
    this.goals = [
      { x: w * 0.2, y: h - 450, width: 48, height: 48, isReal: false, animationFrame: 0 },
      { x: w * 0.5, y: h - 480, width: 48, height: 48, isReal: false, animationFrame: 0 },
      { x: w * 0.8, y: h - 420, width: 48, height: 48, isReal: false, animationFrame: 0 },
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
  }

  private setupLevel6() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.4, y: h - 250, width: 32, height: 32, type: 'deadline', active: true, animationFrame: 0 },
      { x: w * 0.7, y: h - 350, width: 32, height: 32, type: 'requirement', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
  }

  private setupLevel7() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.3, y: h - 200, width: 32, height: 32, type: 'rejection', active: true, animationFrame: 0 },
      { x: w * 0.6, y: h - 350, width: 32, height: 32, type: 'deadline', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
  }

  private setupLevel8() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.5, y: h - 250, width: 32, height: 32, type: 'deadline', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    // Start with one email missile
    this.spawnEmailMissile();
  }

  private setupLevel9() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.4, y: h - 300, width: 32, height: 32, type: 'interview', active: true, animationFrame: 0 },
      { x: w * 0.6, y: h - 400, width: 32, height: 32, type: 'reference', active: true, animationFrame: 0 }
    ];
    
    // More spread out fake goals
    this.goals = [
      { x: w * 0.4, y: h - 500, width: 48, height: 48, isReal: false, animationFrame: 0 },
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    // Start with email missiles
    this.spawnEmailMissile();
  }

  private setupLevel10() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Make some platforms crumbling
    this.platforms.forEach((platform, index) => {
      if (index > 0 && index < this.platforms.length - 1 && Math.random() < 0.6) {
        platform.crumbling = true;
        platform.crumbleTimer = 0;
      }
    });
    
    this.obstacles = [
      { x: w * 0.3, y: h - 200, width: 32, height: 32, type: 'interview', active: true, animationFrame: 0 },
      { x: w * 0.7, y: h - 350, width: 32, height: 32, type: 'reference', active: true, animationFrame: 0 }
    ];
    
    // Multiple spread out fake goals
    this.goals = [
      { x: w * 0.25, y: h - 500, width: 48, height: 48, isReal: false, animationFrame: 0 },
      { x: w * 0.5, y: h - 470, width: 48, height: 48, isReal: false, animationFrame: 0 },
      { x: w * 0.75, y: h - 480, width: 48, height: 48, isReal: false, animationFrame: 0 },
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    // Start with email missiles
    this.spawnEmailMissile();
  }

  // Additional level setups for levels 11-25
  private setupLevel11() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.4, y: h - 250, width: 32, height: 32, type: 'rejection', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel12() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.3, y: h - 200, width: 32, height: 32, type: 'teleport', active: true, animationFrame: 0 },
      { x: w * 0.7, y: h - 350, width: 32, height: 32, type: 'teleport', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel13() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.5, y: h - 300, width: 32, height: 32, type: 'rejection', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel14() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.2, y: h - 200, width: 32, height: 32, type: 'laser', active: true, animationFrame: 0 },
      { x: w * 0.5, y: h - 300, width: 32, height: 32, type: 'laser', active: true, animationFrame: 0 },
      { x: w * 0.8, y: h - 400, width: 32, height: 32, type: 'laser', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel15() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.3, y: h - 250, width: 32, height: 32, type: 'bomb', active: true, animationFrame: 0, timer: 5000 },
      { x: w * 0.7, y: h - 350, width: 32, height: 32, type: 'bomb', active: true, animationFrame: 0, timer: 3000 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel16() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.4, y: h - 300, width: 32, height: 32, type: 'rejection', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel17() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.3, y: h - 200, width: 64, height: 32, type: 'quicksand', active: true, animationFrame: 0 },
      { x: w * 0.6, y: h - 350, width: 64, height: 32, type: 'quicksand', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel18() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.2, y: h - 200, width: 32, height: 32, type: 'lightning', active: true, animationFrame: 0 },
      { x: w * 0.5, y: h - 300, width: 32, height: 32, type: 'lightning', active: true, animationFrame: 0 },
      { x: w * 0.8, y: h - 400, width: 32, height: 32, type: 'lightning', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel19() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.3, y: h - 250, width: 32, height: 32, type: 'portal', active: true, animationFrame: 0, portalId: 1 },
      { x: w * 0.7, y: h - 350, width: 32, height: 32, type: 'portal', active: true, animationFrame: 0, portalId: 2 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel20() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.4, y: h - 300, width: 48, height: 48, type: 'gravitywell', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel21() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.2, y: h - 200, width: 32, height: 32, type: 'virus', active: true, animationFrame: 0 },
      { x: w * 0.5, y: h - 300, width: 32, height: 32, type: 'virus', active: true, animationFrame: 0 },
      { x: w * 0.8, y: h - 400, width: 32, height: 32, type: 'virus', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel22() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.3, y: h - 250, width: 32, height: 32, type: 'spy', active: true, animationFrame: 0 },
      { x: w * 0.7, y: h - 350, width: 32, height: 32, type: 'spy', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel23() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.4, y: h - 300, width: 32, height: 32, type: 'databreach', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel24() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.2, y: h - 200, width: 32, height: 32, type: 'corruption', active: true, animationFrame: 0 },
      { x: w * 0.5, y: h - 300, width: 32, height: 32, type: 'corruption', active: true, animationFrame: 0 },
      { x: w * 0.8, y: h - 400, width: 32, height: 32, type: 'corruption', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private setupLevel25() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.obstacles = [
      { x: w * 0.5, y: h - 300, width: 64, height: 64, type: 'boss', active: true, animationFrame: 0 }
    ];
    
    this.goals = [
      { x: w - 150, y: h - 500, width: 48, height: 48, isReal: true, animationFrame: 0 }
    ];
    
    this.spawnEmailMissile();
  }

  private spawnEmailMissile() {
    const currentEmails = this.obstacles.filter(obs => obs.type === 'email' || obs.type === 'spam').length;
    
    if (currentEmails >= this.maxEmails) return;
    
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Random spawn direction: 0=top, 1=right, 2=bottom, 3=left
    const spawnDirection = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (spawnDirection) {
      case 0: // Top
        x = Math.random() * w;
        y = -50;
        break;
      case 1: // Right
        x = w + 50;
        y = Math.random() * h;
        break;
      case 2: // Bottom
        x = Math.random() * w;
        y = h + 50;
        break;
      case 3: // Left
        x = -50;
        y = Math.random() * h;
        break;
      default:
        x = -50;
        y = Math.random() * h;
    }
    
    const emailType = Math.random() < 0.7 ? 'email' : 'spam';
    const homingSpeed = 80 + Math.random() * 40 + (this.gameContext.currentLevel - 8) * 10;
    
    this.obstacles.push({
      x,
      y,
      width: 24,
      height: 24,
      type: emailType,
      active: true,
      animationFrame: 0,
      velocityX: 0,
      velocityY: 0,
      homingSpeed
    });
  }

  handleKeyDown(e: KeyboardEvent) {
    this.keys.add(e.code);
    
    if ((e.code === 'ArrowUp' || e.code === 'Space') && this.player.onGround) {
      const jumpForce = this.levelMechanics.gravityFlipped ? 650 : -650;
      this.player.velocityY = jumpForce;
      this.player.onGround = false;
      this.gameContext.audioManager.play('jump');
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.code);
  }

  update(deltaTime: number) {
    this.frameCount++;
    
    this.updatePlayer(deltaTime);
    this.updatePlatforms(deltaTime);
    this.updateObstacles(deltaTime);
    this.updateGoals();
    this.updateCamera();
    this.updateTypingAnimation(deltaTime);
    this.updateEmailSpawning(deltaTime);
    this.checkCollisions();
    this.checkBounds();
  }

  private updateEmailSpawning(deltaTime: number) {
    if (!this.levelMechanics.homingMissiles) return;
    
    // Don't spawn emails immediately after player reset
    if (Date.now() - this.lastPlayerReset < 1000) return;
    
    this.emailSpawnTimer += deltaTime * 1000;
    
    if (this.emailSpawnTimer >= this.emailSpawnInterval) {
      this.spawnEmailMissile();
      this.emailSpawnTimer = 0;
    }
  }

  private updatePlayer(deltaTime: number) {
    const moveSpeed = 300;
    let direction = 0;
    
    if (this.keys.has('ArrowLeft')) {
      direction = this.levelMechanics.controlsReversed ? 1 : -1;
      this.player.facingLeft = !this.levelMechanics.controlsReversed;
    }
    if (this.keys.has('ArrowRight')) {
      direction = this.levelMechanics.controlsReversed ? -1 : 1;
      this.player.facingLeft = this.levelMechanics.controlsReversed;
    }
    
    // Wind tunnel effect
    if (this.levelMechanics.windTunnel) {
      direction += Math.sin(this.frameCount * 0.1) * 0.5;
    }
    
    this.player.velocityX = direction * moveSpeed;
    this.player.moving = Math.abs(direction) > 0.1;
    
    if (this.player.moving) {
      this.player.animationFrame += deltaTime * 8;
    } else {
      this.player.animationFrame = 0;
    }
    
    let gravity = this.levelMechanics.gravityFlipped ? -1200 : 1200;
    
    // Gravity wells effect
    if (this.levelMechanics.gravityWells) {
      this.obstacles.forEach(obstacle => {
        if (obstacle.type === 'gravitywell' && obstacle.active) {
          const dx = this.player.x - obstacle.x;
          const dy = this.player.y - obstacle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const force = (150 - distance) / 150 * 800;
            this.player.velocityX += (dx / distance) * force * deltaTime * -1;
            gravity += (dy / distance) * force * -1;
          }
        }
      });
    }
    
    this.player.velocityY += gravity * deltaTime;
    
    this.player.x += this.player.velocityX * deltaTime;
    this.player.y += this.player.velocityY * deltaTime;
    
    this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    
    if (this.levelMechanics.gravityFlipped) {
      this.player.y = Math.max(100, Math.min(this.canvas.height - 100, this.player.y));
    }
  }

  private updatePlatforms(deltaTime: number) {
    // Platform alternation for level 1
    if (this.levelMechanics.platformFade && this.gameContext.currentLevel === 1) {
      const fadeInterval = 120;
      const shouldSwitch = Math.floor(this.frameCount / fadeInterval) % 2 === 1;
      
      this.platforms.forEach((platform, index) => {
        if (index === 0 || index === this.platforms.length - 1) {
          platform.visible = true;
          return;
        }
        
        const isGroupA = (index - 1) % 2 === 0;
        platform.visible = shouldSwitch ? !isGroupA : isGroupA;
      });
    }

    // Crumbling platforms
    if (this.levelMechanics.crumblingPlatforms) {
      this.platforms.forEach(platform => {
        if (platform.crumbling && platform.crumbleTimer !== undefined) {
          // Check if player is on this platform
          const playerOnPlatform = this.isColliding(this.player, platform) && 
                                   this.player.velocityY >= 0 && 
                                   this.player.y < platform.y;
          
          if (playerOnPlatform) {
            platform.crumbleTimer += deltaTime;
            if (platform.crumbleTimer > 1.5) { // Crumble after 1.5 seconds
              platform.visible = false;
            }
          }
        }
      });
    }

    // Moving platforms
    if (this.levelMechanics.movingPlatforms) {
      this.platforms.forEach(platform => {
        if (platform.moving && platform.moveDirection !== undefined && 
            platform.moveSpeed !== undefined && platform.originalX !== undefined && 
            platform.moveRange !== undefined) {
          
          platform.x += platform.moveDirection * platform.moveSpeed * deltaTime;
          
          // Reverse direction at boundaries
          if (platform.x <= platform.originalX - platform.moveRange || 
              platform.x >= platform.originalX + platform.moveRange) {
            platform.moveDirection *= -1;
          }
        }
      });
    }

    // Phantom platforms
    if (this.levelMechanics.phantomPlatforms) {
      this.platforms.forEach(platform => {
        if (platform.phantom && platform.phantomTimer !== undefined) {
          platform.phantomTimer += deltaTime;
          
          // Flicker every 2 seconds
          if (platform.phantomTimer > 2) {
            platform.visible = !platform.visible;
            platform.phantomTimer = 0;
          }
        }
      });
    }
  }

  private updateObstacles(deltaTime: number) {
    this.obstacles.forEach((obstacle, index) => {
      obstacle.animationFrame += deltaTime * 5;
      
      if (obstacle.type === 'email' || obstacle.type === 'spam') {
        // Enhanced homing missile behavior
        if (obstacle.homingSpeed !== undefined) {
          const dx = this.player.x + this.player.width/2 - (obstacle.x + obstacle.width/2);
          const dy = this.player.y + this.player.height/2 - (obstacle.y + obstacle.height/2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            // Smooth acceleration towards player
            const targetVelX = (dx / distance) * obstacle.homingSpeed;
            const targetVelY = (dy / distance) * obstacle.homingSpeed;
            
            obstacle.velocityX = obstacle.velocityX || 0;
            obstacle.velocityY = obstacle.velocityY || 0;
            
            // Smooth acceleration
            obstacle.velocityX += (targetVelX - obstacle.velocityX) * deltaTime * 3;
            obstacle.velocityY += (targetVelY - obstacle.velocityY) * deltaTime * 3;
            
            obstacle.x += obstacle.velocityX * deltaTime;
            obstacle.y += obstacle.velocityY * deltaTime;
          }
        }
      } else if (obstacle.type === 'bomb' && obstacle.timer !== undefined) {
        obstacle.timer -= deltaTime * 1000;
        if (obstacle.timer <= 0) {
          // Explode - create explosion effect
          obstacle.active = false;
        }
      } else if (obstacle.type === 'rejection') {
        // Slowly move towards player
        const dx = this.player.x - obstacle.x;
        const dy = this.player.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0 && distance < 200) {
          obstacle.x += (dx / distance) * 30 * deltaTime;
          obstacle.y += (dy / distance) * 30 * deltaTime;
        }
      }
    });
    
    // Remove inactive obstacles
    this.obstacles = this.obstacles.filter(obstacle => obstacle.active);
  }

  private updateGoals() {
    this.goals.forEach(goal => {
      goal.animationFrame += 0.1;
    });
  }

  private updateCamera() {
    const targetX = this.player.x - this.canvas.width / 2;
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.x = Math.max(0, Math.min(this.canvas.width - this.canvas.width, this.camera.x));
  }

  private updateTypingAnimation(deltaTime: number) {
    if (this.gameContext.showTypingMessage && this.fullTypingText) {
      this.typingTimer += deltaTime;
      
      if (this.typingTimer >= 0.05) { // Type every 50ms
        this.typingTimer = 0;
        if (this.currentTypingText.length < this.fullTypingText.length) {
          this.currentTypingText += this.fullTypingText[this.currentTypingText.length];
          this.gameContext.setTypingMessage(this.currentTypingText);
        }
      }
    }
  }

  private checkCollisions() {
    this.player.onGround = false;
    
    this.platforms.forEach(platform => {
      if (!platform.visible) return;
      
      if (this.isColliding(this.player, platform)) {
        if (this.levelMechanics.gravityFlipped) {
          if (this.player.velocityY < 0 && this.player.y + this.player.height > platform.y + platform.height) {
            this.player.y = platform.y + platform.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
          }
        } else {
          if (this.player.velocityY > 0 && this.player.y < platform.y) {
            this.player.y = platform.y - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
          }
        }
      }
    });
    
    this.obstacles.forEach((obstacle, index) => {
      if (obstacle.active && this.isColliding(this.player, obstacle)) {
        this.handleObstacleHit(obstacle, index);
      }
    });
    
    this.goals.forEach(goal => {
      if (this.isColliding(this.player, goal)) {
        this.handleGoalReached(goal);
      }
    });
  }

  private checkBounds() {
    if (this.levelMechanics.gravityFlipped) {
      if (this.player.y < 50) {
        this.resetPlayer();
      }
    } else {
      if (this.player.y > this.canvas.height + 100) {
        this.resetPlayer();
      }
    }
  }

  private isColliding(a: any, b: any): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  private handleObstacleHit(obstacle: Obstacle, index: number) {
    const messages = {
      rejection: "Application rejected. Requirements changed.",
      deadline: "Deadline passed. Position filled.",
      requirement: "Missing qualification discovered.",
      email: "Rejection email received.",
      spam: "Spam filter caught your application.",
      interview: "Interview cancelled last minute.",
      reference: "Reference check failed.",
      teleport: "Teleported to random location.",
      laser: "Laser security system activated.",
      bomb: "Explosive deadline detonated.",
      quicksand: "Stuck in bureaucratic quicksand.",
      lightning: "Struck by corporate lightning.",
      portal: "Sucked into portal vortex.",
      gravitywell: "Caught in gravity well.",
      virus: "System infected with virus.",
      spy: "Corporate spy detected you.",
      databreach: "Data breach compromised you.",
      corruption: "System corruption detected.",
      boss: "Final boss encountered."
    };

    // Special handling for email missiles
    if (obstacle.type === 'email' || obstacle.type === 'spam') {
      const rejectionEmails = [
        "Thank you for your interest. After careful consideration, we have decided to move forward with other candidates.",
        "We appreciate your application but have selected someone whose experience better aligns with our needs.",
        "While your qualifications are impressive, we found a candidate who is a better fit for this role.",
        "Position has been filled. We will keep your resume on file for future opportunities.",
        "We have chosen to proceed with candidates whose skills more closely match our requirements."
      ];

      const randomEmail = rejectionEmails[Math.floor(Math.random() * rejectionEmails.length)];
      this.startTypingAnimation(randomEmail);
      
      // Remove the email missile immediately
      obstacle.active = false;
    } else {
      this.gameContext.setGameMessage(messages[obstacle.type as keyof typeof messages] || "Obstacle encountered.");
      this.gameContext.setShowMessage(true);
      setTimeout(() => this.gameContext.setShowMessage(false), 2000);
      obstacle.active = false;
    }
    
    this.gameContext.setRejections(prev => prev + 1);
    this.gameContext.audioManager.play('rejection');
    
    this.resetPlayer();
  }

  private startTypingAnimation(text: string) {
    this.fullTypingText = text;
    this.currentTypingText = '';
    this.typingTimer = 0;
    this.gameContext.setTypingMessage('');
    this.gameContext.setShowTypingMessage(true);
    
    // Hide after typing is complete + 2 seconds
    setTimeout(() => {
      this.gameContext.setShowTypingMessage(false);
      this.fullTypingText = '';
      this.currentTypingText = '';
    }, (text.length * 50) + 2000);
  }

  private handleGoalReached(goal: Goal) {
    if (goal.isReal) {
      this.gameContext.setApplications(prev => prev + 1);
      this.gameContext.setCurrentLevel(prev => prev + 1);
      this.gameContext.setGameMessage("Interview scheduled. Climbing higher.");
      this.gameContext.setShowMessage(true);
      this.gameContext.audioManager.play('success');
      
      setTimeout(() => {
        this.gameContext.setShowMessage(false);
        this.setupLevel();
      }, 2000);
    } else {
      this.gameContext.setRejections(prev => prev + 1);
      this.gameContext.setGameMessage("Position no longer available.");
      this.gameContext.setShowMessage(true);
      this.gameContext.audioManager.play('rejection');
      
      setTimeout(() => this.gameContext.setShowMessage(false), 2000);
      
      this.resetPlayer();
    }
  }

  private resetPlayer() {
    this.lastPlayerReset = Date.now();
    
    if (this.levelMechanics.gravityFlipped) {
      this.player.x = 100;
      this.player.y = 120;
    } else {
      this.player.x = 100;
      this.player.y = this.canvas.height - 200;
    }
    
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    this.player.onGround = false;
    this.player.animationFrame = 0;
    
    // Reset email spawn timer to prevent immediate spawning
    this.emailSpawnTimer = 0;
  }

  render() {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.translate(-this.camera.x, 0);
    
    this.renderTunnelWalls();
    
    this.platforms.forEach(platform => {
      if (platform.visible) {
        this.renderBrickPlatform(platform);
      }
    });
    
    this.obstacles.forEach(obstacle => {
      if (obstacle.active) {
        this.renderObstacle(obstacle);
      }
    });
    
    this.goals.forEach(goal => {
      this.renderGoal(goal);
    });
    
    this.renderPlayer();
    
    this.ctx.restore();
    
    this.renderLevelEffects();
  }

  private renderObstacle(obstacle: Obstacle) {
    if (obstacle.type === 'email' || obstacle.type === 'spam') {
      // Enhanced email missile rendering with glow effect
      this.ctx.save();
      
      // Outer glow
      this.ctx.shadowColor = obstacle.type === 'email' ? '#3b82f6' : '#ef4444';
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = obstacle.type === 'email' ? '#3b82f6' : '#ef4444';
      this.ctx.fillRect(obstacle.x - 2, obstacle.y - 2, obstacle.width + 4, obstacle.height + 4);
      
      // Main body
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
      
      // Email lines
      this.ctx.fillStyle = obstacle.type === 'email' ? '#3b82f6' : '#ef4444';
      this.ctx.fillRect(obstacle.x + 4, obstacle.y + 6, obstacle.width - 8, 2);
      this.ctx.fillRect(obstacle.x + 4, obstacle.y + 10, obstacle.width - 8, 2);
      this.ctx.fillRect(obstacle.x + 4, obstacle.y + 14, obstacle.width - 12, 2);
      
      // Trailing effect
      const trailLength = 5;
      for (let i = 1; i <= trailLength; i++) {
        const alpha = (trailLength - i) / trailLength * 0.3;
        this.ctx.globalAlpha = alpha;
        
        const trailX = obstacle.x - (obstacle.velocityX || 0) * i * 0.01;
        const trailY = obstacle.y - (obstacle.velocityY || 0) * i * 0.01;
        
        this.ctx.fillStyle = obstacle.type === 'email' ? '#3b82f6' : '#ef4444';
        this.ctx.fillRect(trailX, trailY, obstacle.width, obstacle.height);
      }
      
      this.ctx.restore();
    } else {
      // Regular obstacles with enhanced visuals
      const colors = {
        rejection: '#dc2626',
        deadline: '#ea580c',
        requirement: '#7c2d12',
        interview: '#8b5cf6',
        reference: '#06b6d4',
        teleport: '#a855f7',
        laser: '#ef4444',
        bomb: '#f59e0b',
        quicksand: '#92400e',
        lightning: '#eab308',
        portal: '#8b5cf6',
        gravitywell: '#1f2937',
        virus: '#10b981',
        spy: '#374151',
        databreach: '#f43f5e',
        corruption: '#7c2d12',
        boss: '#991b1b'
      };
      
      this.ctx.fillStyle = colors[obstacle.type as keyof typeof colors] || '#dc2626';
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      const pulse = Math.sin(obstacle.animationFrame) * 0.3 + 0.7;
      this.ctx.globalAlpha = pulse;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
      this.ctx.globalAlpha = 1;
      
      // Special rendering for specific obstacles
      if (obstacle.type === 'bomb' && obstacle.timer !== undefined) {
        // Flashing red when about to explode
        if (obstacle.timer < 1000) {
          const flash = Math.sin(obstacle.animationFrame * 10) > 0;
          if (flash) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(obstacle.x - 2, obstacle.y - 2, obstacle.width + 4, obstacle.height + 4);
          }
        }
      }
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '8px monospace';
      this.ctx.textAlign = 'center';
      const labels = {
        rejection: 'REJ',
        deadline: 'DL',
        requirement: 'REQ',
        interview: 'INT',
        reference: 'REF',
        teleport: 'TP',
        laser: 'LAS',
        bomb: 'BMB',
        quicksand: 'QS',
        lightning: 'LTG',
        portal: 'PRT',
        gravitywell: 'GW',
        virus: 'VIR',
        spy: 'SPY',
        databreach: 'DB',
        corruption: 'COR',
        boss: 'CEO'
      };
      this.ctx.fillText(labels[obstacle.type as keyof typeof labels] || 'OBS', 
                       obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2 + 2);
    }
  }

  private renderGoal(goal: Goal) {
    this.ctx.fillStyle = '#6b7280';
    this.ctx.fillRect(goal.x - 4, goal.y, 4, goal.height + 20);
    
    const wave = Math.sin(goal.animationFrame) * 0.1 + 1;
    this.ctx.fillStyle = goal.isReal ? '#059669' : '#dc2626';
    this.ctx.fillRect(goal.x, goal.y, goal.width * wave, goal.height);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('CORP', goal.x + goal.width/2, goal.y + goal.height/2 + 3);
  }

  private renderBrickPlatform(platform: Platform) {
    const brickWidth = 32;
    const brickHeight = 16;
    
    // Special rendering for crumbling platforms
    if (platform.crumbling && platform.crumbleTimer !== undefined) {
      const crumbleEffect = Math.min(platform.crumbleTimer / 1.5, 1);
      this.ctx.globalAlpha = 1 - (crumbleEffect * 0.5);
      
      // Add shake effect
      const shakeX = (Math.random() - 0.5) * crumbleEffect * 4;
      const shakeY = (Math.random() - 0.5) * crumbleEffect * 4;
      this.ctx.translate(shakeX, shakeY);
    }
    
    // Special rendering for phantom platforms
    if (platform.phantom) {
      this.ctx.globalAlpha = 0.6;
    }
    
    this.ctx.fillStyle = '#374151';
    this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    for (let x = platform.x; x < platform.x + platform.width; x += brickWidth) {
      for (let y = platform.y; y < platform.y + platform.height; y += brickHeight) {
        const offsetX = (Math.floor((y - platform.y) / brickHeight) % 2) * (brickWidth / 2);
        const brickX = x + offsetX;
        
        const brickW = Math.min(brickWidth - 2, platform.x + platform.width - brickX);
        const brickH = Math.min(brickHeight - 2, platform.y + platform.height - y);
        
        if (brickW > 0 && brickH > 0) {
          this.ctx.fillStyle = '#4b5563';
          this.ctx.fillRect(brickX, y, brickW, brickH);
          
          this.ctx.fillStyle = '#6b7280';
          this.ctx.fillRect(brickX, y, brickW, 2);
          this.ctx.fillRect(brickX, y, 2, brickH);
          
          this.ctx.fillStyle = '#374151';
          this.ctx.fillRect(brickX + brickW - 2, y + 2, 2, brickH - 2);
          this.ctx.fillRect(brickX + 2, y + brickH - 2, brickW - 2, 2);
        }
      }
    }
    
    // Reset transformations and alpha
    if (platform.crumbling && platform.crumbleTimer !== undefined) {
      this.ctx.setTransform(1, 0, 0, 1, -this.camera.x, 0);
    }
    this.ctx.globalAlpha = 1;
    
    this.ctx.shadowColor = '#3b82f6';
    this.ctx.shadowBlur = 4;
    this.ctx.fillStyle = '#1e40af';
    this.ctx.fillRect(platform.x, platform.y - 1, platform.width, 1);
    this.ctx.shadowBlur = 0;
  }

  private renderTunnelWalls() {
    const brickWidth = 32;
    const brickHeight = 16;
    const wallHeight = 80;
    
    if (this.levelMechanics.gravityFlipped) {
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width + this.camera.x, 50);
      
      const floorY = this.canvas.height - wallHeight;
      for (let x = 0; x < this.canvas.width + this.camera.x; x += brickWidth) {
        for (let y = floorY; y < this.canvas.height; y += brickHeight) {
          const offsetX = (Math.floor((y - floorY) / brickHeight) % 2) * (brickWidth / 2);
          const brickX = x + offsetX;
          
          this.ctx.fillStyle = '#374151';
          this.ctx.fillRect(brickX, y, brickWidth - 2, brickHeight - 2);
          
          this.ctx.fillStyle = '#4b5563';
          this.ctx.fillRect(brickX, y, brickWidth - 2, 2);
          this.ctx.fillRect(brickX, y, 2, brickHeight - 2);
          
          this.ctx.fillStyle = '#1f2937';
          this.ctx.fillRect(brickX + brickWidth - 4, y + 2, 2, brickHeight - 4);
          this.ctx.fillRect(brickX + 2, y + brickHeight - 4, brickWidth - 4, 2);
        }
      }
      return;
    }
    
    // Top wall
    for (let x = 0; x < this.canvas.width + this.camera.x; x += brickWidth) {
      for (let y = 0; y < wallHeight; y += brickHeight) {
        const offsetX = (Math.floor(y / brickHeight) % 2) * (brickWidth / 2);
        const brickX = x + offsetX;
        
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(brickX, y, brickWidth - 2, brickHeight - 2);
        
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(brickX, y, brickWidth - 2, 2);
        this.ctx.fillRect(brickX, y, 2, brickHeight - 2);
        
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(brickX + brickWidth - 4, y + 2, 2, brickHeight - 4);
        this.ctx.fillRect(brickX + 2, y + brickHeight - 4, brickWidth - 4, 2);
      }
    }
    
    // Bottom wall
    const floorY = this.canvas.height - wallHeight;
    for (let x = 0; x < this.canvas.width + this.camera.x; x += brickWidth) {
      for (let y = floorY; y < this.canvas.height; y += brickHeight) {
        const offsetX = (Math.floor((y - floorY) / brickHeight) % 2) * (brickWidth / 2);
        const brickX = x + offsetX;
        
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(brickX, y, brickWidth - 2, brickHeight - 2);
        
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(brickX, y, brickWidth - 2, 2);
        this.ctx.fillRect(brickX, y, 2, brickHeight - 2);
        
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(brickX + brickWidth - 4, y + 2, 2, brickHeight - 4);
        this.ctx.fillRect(brickX + 2, y + brickHeight - 4, brickWidth - 4, 2);
      }
    }
  }

  private renderPlayer() {
    if (!this.spriteLoaded || !this.processedSprite) {
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(this.player.x + 12, this.player.y + 12, 4, 4);
      this.ctx.fillRect(this.player.x + 24, this.player.y + 12, 4, 4);
      this.ctx.fillRect(this.player.x + 16, this.player.y + 24, 8, 2);
      
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(this.player.x + 20, this.player.y + 28, 4, 12);
      return;
    }

    const spriteWidth = this.processedSprite.width / 3;
    const spriteHeight = this.processedSprite.height / 2;
    const framesPerRow = 3;
    
    let row = 0;
    let frame = 0;
    
    if (this.player.onGround && this.player.moving) {
      row = 1;
      frame = Math.floor(this.player.animationFrame) % framesPerRow;
    } else if (!this.player.onGround) {
      row = 0;
      frame = Math.min(Math.floor(this.player.animationFrame * 0.5), framesPerRow - 1);
    } else {
      row = 1;
      frame = 0;
    }
    
    const srcX = frame * spriteWidth;
    const srcY = row * spriteHeight;
    
    this.ctx.save();
    
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.globalCompositeOperation = 'source-over';
    
    if (this.levelMechanics.gravityFlipped) {
      this.ctx.scale(1, -1);
      
      if (this.player.facingLeft) {
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(
          this.processedSprite,
          srcX, srcY, spriteWidth, spriteHeight,
          -(this.player.x + this.player.width), -(this.player.y + this.player.height), this.player.width, this.player.height
        );
      } else {
        this.ctx.drawImage(
          this.processedSprite,
          srcX, srcY, spriteWidth, spriteHeight,
          this.player.x, -(this.player.y + this.player.height), this.player.width, this.player.height
        );
      }
    } else {
      if (this.player.facingLeft) {
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(
          this.processedSprite,
          srcX, srcY, spriteWidth, spriteHeight,
          -(this.player.x + this.player.width), this.player.y, this.player.width, this.player.height
        );
      } else {
        this.ctx.drawImage(
          this.processedSprite,
          srcX, srcY, spriteWidth, spriteHeight,
          this.player.x, this.player.y, this.player.width, this.player.height
        );
      }
    }
    
    this.ctx.restore();
  }

  private renderLevelEffects() {
    const level = this.gameContext.currentLevel;
    
    if (level === 2 && this.levelMechanics.controlsReversed) {
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#ef4444';
      this.ctx.font = '24px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('CONTROLS REVERSED', 50, 50);
    }

    if (level === 3 && this.levelMechanics.gravityFlipped) {
      this.ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.font = '24px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('GRAVITY FLIPPED - PIT AT TOP', 50, 50);
    }

    if (level === 1) {
      this.ctx.fillStyle = 'rgba(255, 255, 0, 0.05)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#eab308';
      this.ctx.font = '18px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('UNSTABLE CORPORATE PLATFORMS', 50, this.canvas.height - 50);
    }

    // Additional level effects
    if (level >= 8 && this.levelMechanics.homingMissiles) {
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.05)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (level === 13 && this.levelMechanics.windTunnel) {
      this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#06b6d4';
      this.ctx.font = '18px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('WIND TUNNEL ACTIVE', 50, 50);
    }

    if (level === 25 && this.levelMechanics.finalBoss) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '20px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('FINAL BOSS CHAMBER', 50, 80);
    }
  }
}