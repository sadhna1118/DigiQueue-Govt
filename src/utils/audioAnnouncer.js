// Web Audio API & Speech Synthesis Announcer for DigiQueue Gov Public Display

class AudioAnnouncer {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.volume = 0.85;
    this.speechRate = 0.92; // slightly slower for maximum public clarity
    this.speechPitch = 1.05;
    this.voice = null;
    this.initVoices();
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  initVoices() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer natural English voices (e.g. Google UK/US, Microsoft, or en-IN)
        const preferred = voices.find(v => 
          v.lang.includes("en-IN") || 
          v.name.includes("Natural") || 
          v.name.includes("Google") || 
          v.lang.startsWith("en")
        );
        this.voice = preferred || voices[0] || null;
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  playChime() {
    if (this.isMuted) return Promise.resolve();
    try {
      this.initAudioContext();
      if (!this.audioCtx) return Promise.resolve();

      const now = this.audioCtx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.0, duration: 0.28 }, // C5
        { freq: 659.25, time: 0.22, duration: 0.32 }, // E5
        { freq: 783.99, time: 0.44, duration: 0.55 }, // G5
        { freq: 1046.50, time: 0.68, duration: 0.75 } // C6
      ];

      notes.forEach(note => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.exponentialRampToValueAtTime(0.35 * this.volume, now + note.time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.duration + 0.05);
      });

      return new Promise(resolve => setTimeout(resolve, 1400));
    } catch (e) {
      console.warn("Audio chime error:", e);
      return Promise.resolve();
    }
  }

  announceToken(tokenNumber, counterNumber, citizenName = "") {
    if (this.isMuted) return;

    // Play chime first, then voice
    this.playChime().then(() => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel(); // cancel previous unfinished queue

      // Format token for clear phonetic reading (e.g. "R-E-V 101" instead of slurred text)
      const formattedToken = tokenNumber.split("").join(" ");
      const nameAnnouncement = citizenName ? `${citizenName}, ` : "";
      const text = `Attention please. ${nameAnnouncement}Token ${formattedToken}, please proceed to Counter ${counterNumber}.`;

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.rate = this.speechRate;
      utterance.pitch = this.speechPitch;
      utterance.volume = this.volume;

      window.speechSynthesis.speak(utterance);
    });
  }

  speakGeneralAnnouncement(text) {
    if (this.isMuted) return;
    this.playChime().then(() => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Announcement: ${text}`);
      if (this.voice) utterance.voice = this.voice;
      utterance.rate = this.speechRate;
      utterance.volume = this.volume;
      window.speechSynthesis.speak(utterance);
    });
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}

export const announcer = new AudioAnnouncer();
