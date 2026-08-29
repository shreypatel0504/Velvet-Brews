// Web Audio API Synthesizer Chime System for Velvet Brews Admin Alerting

let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const getSoundEnabled = () => soundEnabled;

const playTone = (frequencies: number[], duration: number = 0.15, type: OscillatorType = 'sine') => {
  if (!soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + duration);
    });
  } catch (e) {
    console.warn("Audio chime play error", e);
  }
};

// 🚨 New Order Alert Chime (Double High Ping)
export const playOrderChime = () => {
  playTone([523.25, 659.25, 783.99, 1046.50], 0.25, 'triangle');
};

// 📅 New Reservation Alert Chime (Harmonic Chord)
export const playReservationChime = () => {
  playTone([440, 554.37, 659.25], 0.3, 'sine');
};

// ⭐ New Review Alert Chime (Sparkle Chime)
export const playFeedbackChime = () => {
  playTone([659.25, 880, 1046.50], 0.2, 'sine');
};

// 💬 New Contact Message Alert Chime (Soft Bell)
export const playMessageChime = () => {
  playTone([392.00, 523.25], 0.25, 'sine');
};

// ⚡ Kitchen Order Ready Chime (Success Fanfare)
export const playReadyChime = () => {
  playTone([523.25, 659.25, 783.99], 0.2, 'triangle');
};

// 🔥 Overdue / Urgent Order Chime (Double Warning Beep)
export const playUrgentChime = () => {
  playTone([880, 440, 880], 0.15, 'sawtooth');
};

