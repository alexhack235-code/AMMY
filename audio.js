// ==========================================
// Ammanda's Birthday Audio Synth Engine
// Includes Authentic German Birthday Melodies!
// ==========================================

class BirthdayAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicPlaying = false;
    this.musicTimeout = null;
    this.currentTrackIndex = 0;
    this.tempo = 120;
    this.activeNodes = [];

    // Tracks: notes with pitch and duration (in beats)
    this.tracks = [
      {
        title: "🇩🇪 Zum Geburtstag viel Glück (Ammanda)",
        tempo: 106,
        notes: [
          // "Zum Geburtstag viel Glück, zum Geburtstag viel Glück"
          { note: "G4", dur: 0.75 }, { note: "G4", dur: 0.25 }, { note: "A4", dur: 1.0 }, { note: "G4", dur: 1.0 }, { note: "C5", dur: 1.0 }, { note: "B4", dur: 2.0 },
          { note: "G4", dur: 0.75 }, { note: "G4", dur: 0.25 }, { note: "A4", dur: 1.0 }, { note: "G4", dur: 1.0 }, { note: "D5", dur: 1.0 }, { note: "C5", dur: 2.0 },
          // "Zum Geburtstag, liebe Ammanda..."
          { note: "G4", dur: 0.75 }, { note: "G4", dur: 0.25 }, { note: "G5", dur: 1.0 }, { note: "E5", dur: 1.0 }, { note: "C5", dur: 1.0 }, { note: "B4", dur: 1.0 }, { note: "A4", dur: 1.5 },
          // "Zum Geburtstag viel Glück!"
          { note: "F5", dur: 0.75 }, { note: "F5", dur: 0.25 }, { note: "E5", dur: 1.0 }, { note: "C5", dur: 1.0 }, { note: "D5", dur: 1.0 }, { note: "C5", dur: 2.5 }
        ]
      },
      {
        title: "🇩🇪 Wie schön, dass du geboren bist",
        tempo: 116,
        notes: [
          // "Wie schön, dass du geboren bist..."
          { note: "C5", dur: 0.8 }, { note: "E5", dur: 0.8 }, { note: "G5", dur: 1.0 }, { note: "G5", dur: 0.8 }, { note: "A5", dur: 0.8 }, { note: "G5", dur: 1.0 }, { note: "E5", dur: 1.5 },
          // "wir hätten dich sonst sehr vermisst..."
          { note: "F5", dur: 0.8 }, { note: "F5", dur: 0.8 }, { note: "F5", dur: 1.0 }, { note: "D5", dur: 0.8 }, { note: "F5", dur: 0.8 }, { note: "E5", dur: 1.0 }, { note: "C5", dur: 1.5 },
          // "wie schön, dass wir beisammen sind..."
          { note: "C5", dur: 0.8 }, { note: "E5", dur: 0.8 }, { note: "G5", dur: 1.0 }, { note: "G5", dur: 0.8 }, { note: "A5", dur: 0.8 }, { note: "G5", dur: 1.0 }, { note: "E5", dur: 1.5 },
          // "wir gratulieren dir, Geburtstagskind!"
          { note: "F5", dur: 0.8 }, { note: "F5", dur: 0.8 }, { note: "E5", dur: 0.8 }, { note: "D5", dur: 0.8 }, { note: "C5", dur: 1.0 }, { note: "D5", dur: 0.8 }, { note: "C5", dur: 2.0 }
        ]
      },
      {
        title: "🌸 Pastel Dream Lullaby",
        tempo: 96,
        notes: [
          { note: "C5", dur: 1.0 }, { note: "E5", dur: 1.0 }, { note: "G5", dur: 1.0 }, { note: "B5", dur: 1.0 },
          { note: "A5", dur: 1.5 }, { note: "F5", dur: 0.5 }, { note: "G5", dur: 2.0 },
          { note: "E5", dur: 1.0 }, { note: "C5", dur: 1.0 }, { note: "D5", dur: 1.0 }, { note: "F5", dur: 1.0 },
          { note: "E5", dur: 1.5 }, { note: "D5", dur: 0.5 }, { note: "C5", dur: 2.0 }
        ]
      },
      {
        title: "✨ Sparkling Celebration Chimes",
        tempo: 128,
        notes: [
          { note: "E5", dur: 0.5 }, { note: "G5", dur: 0.5 }, { note: "A5", dur: 0.5 }, { note: "C6", dur: 1.0 },
          { note: "B5", dur: 0.5 }, { note: "A5", dur: 0.5 }, { note: "G5", dur: 1.0 },
          { note: "A5", dur: 0.5 }, { note: "C6", dur: 0.5 }, { note: "D6", dur: 0.5 }, { note: "E6", dur: 1.5 },
          { note: "D6", dur: 0.5 }, { note: "C6", dur: 1.0 }, { note: "G5", dur: 2.0 }
        ]
      }
    ];

    this.frequencies = {
      "G4": 392.00, "A4": 440.00, "B4": 493.88,
      "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77,
      "C6": 1046.50, "D6": 1174.66, "E6": 1318.51, "F6": 1396.91, "G6": 1567.98
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Cute celesta / music box chime note
  playChime(freq, timeOffset = 0, duration = 1.2, volume = 0.25) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + timeOffset;

    // Dual oscillator: fundamental sine + gentle harmonic chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2.005, now);

    // Bell envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(volume * 0.4, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3200, now);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  playSparkle() {
    if (this.isMuted) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      this.playChime(freq, idx * 0.05, 0.6, 0.15);
    });
  }

  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
    noise.start(now);
    noise.stop(now + 0.05);
  }

  playBlow() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 0.8;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * (i / bufferSize));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + dur);
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + dur);
  }

  playCelebration() {
    if (this.isMuted) return;
    this.init();
    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880.00],
      [659.25, 783.99, 987.77, 1046.50],
      [1046.50, 1318.51, 1567.98]
    ];

    chords.forEach((chord, i) => {
      const time = i * 0.22;
      chord.forEach(freq => {
        this.playChime(freq, time, 1.4, 0.2);
      });
    });
  }

  playGiftOpen() {
    if (this.isMuted) return;
    this.init();
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      this.playChime(freq, idx * 0.08, 1.0, 0.22);
    });
  }

  toggleMusic(onTrackChange) {
    this.init();
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic(onTrackChange);
      return true;
    }
  }

  startMusic(onTrackChange) {
    if (this.isMusicPlaying) return;
    this.init();
    this.isMusicPlaying = true;
    this.playTrack(this.currentTrackIndex, onTrackChange);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  nextTrack(onTrackChange) {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    if (this.isMusicPlaying) {
      this.stopMusic();
      this.startMusic(onTrackChange);
    } else if (onTrackChange) {
      onTrackChange(this.tracks[this.currentTrackIndex].title);
    }
  }

  playTrack(index, onTrackChange) {
    if (!this.isMusicPlaying) return;
    const track = this.tracks[index];
    if (onTrackChange) {
      onTrackChange(track.title);
    }

    const beatDuration = 60 / track.tempo;
    let noteIndex = 0;

    const playNext = () => {
      if (!this.isMusicPlaying) return;
      if (noteIndex >= track.notes.length) {
        this.musicTimeout = setTimeout(() => {
          this.playTrack(index, onTrackChange);
        }, 1800);
        return;
      }

      const item = track.notes[noteIndex];
      const freq = this.frequencies[item.note];
      if (freq) {
        this.playChime(freq, 0, item.dur * beatDuration * 1.6, 0.22);
      }

      noteIndex++;
      const delay = item.dur * beatDuration * 1000;
      this.musicTimeout = setTimeout(playNext, delay);
    };

    playNext();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isMusicPlaying) {
      this.stopMusic();
    }
    return this.isMuted;
  }
}

// Global instance
window.birthdayAudio = new BirthdayAudioEngine();
