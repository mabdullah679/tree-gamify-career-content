export class CelebrationEffect {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'celebration-container';
    document.body.appendChild(this.container);
  }

  celebrate(levelUp: boolean = false) {
    this.createParticles(levelUp ? 15 : 8);
    if (levelUp) {
      this.showLevelUpBanner();
      this.playSound('levelup');
    } else {
      this.playSound('complete');
    }
  }

  private createParticles(count: number) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const colors = ['#646cff', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight / 2;
        const endX = startX + (Math.random() - 0.5) * 400;
        const endY = Math.random() * window.innerHeight;

        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';

        this.container.appendChild(particle);

        particle.animate([
          {
            transform: 'translate(0, 0) scale(1) rotate(0deg)',
            opacity: 1
          },
          {
            transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0) rotate(${Math.random() * 720}deg)`,
            opacity: 0
          }
        ], {
          duration: 1000 + Math.random() * 500,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => particle.remove();
      }, i * 20);
    }
  }

  private showLevelUpBanner() {
    const banner = document.createElement('div');
    banner.className = 'level-up-banner';
    banner.innerHTML = `
      <div class="level-up-content">
        <h2>🎉 LEVEL UP!</h2>
        <p>New rewards unlocked</p>
      </div>
    `;

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.classList.add('show');
    }, 10);

    setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 500);
    }, 3000);
  }

  private playSound(type: 'complete' | 'levelup') {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'complete') {
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } else {
        // Level up - triumphant chord progression
        const frequencies = [523.25, 659.25, 783.99, 1046.50];
        frequencies.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.5);
          osc.start(audioContext.currentTime + i * 0.1);
          osc.stop(audioContext.currentTime + i * 0.1 + 0.5);
        });
      }
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }
}

export const celebrationEffect = new CelebrationEffect();
