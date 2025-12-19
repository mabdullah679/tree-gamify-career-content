export class Toast {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message: string, type: 'info' | 'warning' | 'success' = 'info', duration: number = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

export const toast = new Toast();
