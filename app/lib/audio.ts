// Simple audio utility for game sounds

let audioEnabled = false;

export function playSound(type: 'vote' | 'correct' | 'incorrect' | 'gameStart' | 'timer') {
  if (!audioEnabled) return;
  
  try {
    // Using Web Audio API to generate simple beep sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sounds for different actions
    switch(type) {
      case 'vote':
        oscillator.frequency.value = 523; // C note
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'correct':
        oscillator.frequency.value = 659; // E note
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'incorrect':
        oscillator.frequency.value = 220; // A note (lower)
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'gameStart':
        oscillator.frequency.value = 440; // A note
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
      case 'timer':
        oscillator.frequency.value = 880; // High A
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
    }
  } catch (error) {
    console.log('Audio not supported:', error);
  }
}

export function enableAudio() {
  audioEnabled = true;
}

export function disableAudio() {
  audioEnabled = false;
}
