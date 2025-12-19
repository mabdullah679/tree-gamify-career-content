export class Certificate {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'certificate-overlay';
    document.body.appendChild(this.container);
  }

  show(opts: {
    stageName?: string;
    courseName?: string;
    careerPath?: string;
    fullName?: string;
    isCourseCompletion?: boolean;
  }) {
    const {
      stageName = '',
      courseName = '',
      careerPath = 'Electrical Lineworker',
      fullName = 'Career Explorer',
      isCourseCompletion = false
    } = opts;

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const headline = isCourseCompletion ? 'YOU DID IT!' : 'CONGRATULATIONS!';
    const sealIcon = isCourseCompletion ? '🏅' : '✓';
    const sealLabel = isCourseCompletion ? 'Medal Earned' : 'Certified';
    const completedLine = isCourseCompletion ? courseName || stageName : stageName;

    this.container.innerHTML = `
      <div class="certificate-backdrop">
        <div class="certificate-card">
          <button class="certificate-close" id="cert-close">×</button>

          <div class="certificate-header">
            <div class="trophy-icon">${sealIcon}</div>
            <h1>${headline}</h1>
            <div class="confetti">🎉</div>
          </div>

          <div class="certificate-body">
            <p class="cert-subtitle">This certifies that</p>
            <h2 class="cert-student">${fullName}</h2>
            <p class="cert-text">has successfully completed</p>
            <h3 class="cert-stage">${completedLine}</h3>
            <p class="cert-text">in the pursuit of mastery in</p>
            <h3 class="cert-career">${careerPath}</h3>

            <div class="cert-seal">
              <div class="seal-inner">${sealIcon}</div>
              <div class="seal-label">${sealLabel}</div>
            </div>

            <div class="cert-footer">
              <div class="cert-date">
                <div class="cert-label">Date Completed</div>
                <div class="cert-value">${date}</div>
              </div>
              <div class="cert-signature">
                <div class="cert-label">Issued By</div>
                <div class="cert-value">Career Roadmap Platform</div>
              </div>
            </div>
          </div>

          <div class="certificate-actions">
            <button class="cert-btn primary" id="cert-continue">Continue Journey</button>
          </div>
        </div>
      </div>
    `;

    this.container.style.display = 'flex';

    const closeBtn = document.getElementById('cert-close');
    const continueBtn = document.getElementById('cert-continue');

    const closeHandler = () => {
      this.hide();
    };

    closeBtn?.addEventListener('click', closeHandler);
    continueBtn?.addEventListener('click', closeHandler);
  }

  hide() {
    this.container.style.display = 'none';
    this.container.innerHTML = '';
  }
}

export const certificate = new Certificate();
