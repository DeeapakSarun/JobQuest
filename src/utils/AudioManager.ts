export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private volume: number = 0.3;
  private muted: boolean = false;
  private themeSource: AudioBufferSourceNode | null = null;
  private themeGainNode: GainNode | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initializeSounds();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  private async initializeSounds() {
    if (!this.audioContext) return;

    const soundDefinitions = {
      jump: { frequency: 440, duration: 0.15, type: 'square' as OscillatorType },
      rejection: { frequency: 150, duration: 0.8, type: 'sawtooth' as OscillatorType },
      success: { frequency: 660, duration: 0.4, type: 'sine' as OscillatorType },
      gameOver: { frequency: 110, duration: 1.2, type: 'triangle' as OscillatorType },
      ambient: { frequency: 80, duration: 2.0, type: 'sine' as OscillatorType },
      death: { frequency: 200, duration: 1.0, type: 'sawtooth' as OscillatorType },
      theme: { frequency: 220, duration: 8.0, type: 'sine' as OscillatorType }
    };

    for (const [name, config] of Object.entries(soundDefinitions)) {
      const buffer = this.createSoundBuffer(config.frequency, config.duration, config.type, name === 'theme');
      if (buffer) {
        this.sounds.set(name, buffer);
      }
    }
  }

  private createSoundBuffer(frequency: number, duration: number, type: OscillatorType, isTheme: boolean = false): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const frameCount = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    if (isTheme) {
      // Create a more complex theme melody
      const melody = [220, 247, 262, 294, 330, 294, 262, 247]; // A minor scale progression
      const noteDuration = duration / melody.length;
      
      for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;
        const noteIndex = Math.floor(t / noteDuration) % melody.length;
        const noteFreq = melody[noteIndex];
        const noteTime = t % noteDuration;
        
        // Create a more musical sound with harmonics
        let sample = Math.sin(2 * Math.PI * noteFreq * t) * 0.4;
        sample += Math.sin(2 * Math.PI * noteFreq * 2 * t) * 0.2; // Octave
        sample += Math.sin(2 * Math.PI * noteFreq * 1.5 * t) * 0.15; // Fifth
        
        // Add envelope for each note
        const noteEnvelope = Math.sin((noteTime / noteDuration) * Math.PI);
        const globalEnvelope = 1 - (t / duration) * 0.3; // Slight fade over time
        
        data[i] = sample * noteEnvelope * globalEnvelope * this.volume * 0.3;
      }
    } else {
      // Original sound generation for other sounds
      for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;
        let sample = 0;

        switch (type) {
          case 'sine':
            sample = Math.sin(2 * Math.PI * frequency * t);
            break;
          case 'square':
            sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
            break;
          case 'sawtooth':
            sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
            break;
          case 'triangle':
            sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
            break;
        }

        const envelope = Math.max(0, 1 - (t / duration));
        data[i] = sample * envelope * this.volume;
      }
    }

    return buffer;
  }

  play(soundName: string) {
    if (!this.audioContext || !this.sounds.has(soundName) || this.muted) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const buffer = this.sounds.get(soundName)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      gainNode.gain.value = this.volume;

      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  playTheme() {
    if (!this.audioContext || !this.sounds.has('theme') || this.muted) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Stop existing theme if playing
      this.stopTheme();

      const buffer = this.sounds.get('theme')!;
      this.themeSource = this.audioContext.createBufferSource();
      this.themeGainNode = this.audioContext.createGain();

      this.themeSource.buffer = buffer;
      this.themeSource.loop = true;
      this.themeSource.connect(this.themeGainNode);
      this.themeGainNode.connect(this.audioContext.destination);
      this.themeGainNode.gain.value = this.volume * 0.4; // Lower volume for background music

      this.themeSource.start();
    } catch (error) {
      console.warn('Error playing theme:', error);
    }
  }

  stopTheme() {
    if (this.themeSource) {
      try {
        this.themeSource.stop();
      } catch (error) {
        // Source might already be stopped
      }
      this.themeSource = null;
    }
    if (this.themeGainNode) {
      this.themeGainNode.disconnect();
      this.themeGainNode = null;
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.themeGainNode) {
      this.themeGainNode.gain.value = this.volume * 0.4;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopTheme();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }
}