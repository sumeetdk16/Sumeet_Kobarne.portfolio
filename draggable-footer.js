// Draggable Footer Card Component
class DraggableFooter {
  constructor() {
    this.card = null;
    this.isDragging = false;
    this.currentX = 0;
    this.currentY = 0;
    this.initialX = 0;
    this.initialY = 0;
    this.xOffset = 0;
    this.yOffset = 0;
    this.isMinimized = false;
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.create());
    } else {
      this.create();
    }
  }

  create() {
    // Create the draggable card
    this.card = document.createElement('div');
    this.card.className = 'draggable-footer-card';
    this.card.innerHTML = `
      <div class="drag-handle" title="Drag to move">
        <div class="drag-dots">
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>
      </div>
      
      <div class="footer-card-content">
        <div class="footer-card-left">
          <div class="footer-card-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Open for Opportunities
          </div>
          
          <h3 class="footer-card-title">Let's Connect</h3>
          
          <div class="footer-card-links">
            <a href="mailto:kobarne21@gmail.com" class="footer-card-link">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <polyline points="2,4 12,13 22,4"/>
              </svg>
              kobarne21@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/sumeet-kobarne/" target="_blank" rel="noopener" class="footer-card-link">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a href="https://github.com/sumeetdk16" target="_blank" rel="noopener" class="footer-card-link">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
          
          <div class="footer-card-location">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Based in Pune, India · Working Worldwide
          </div>
        </div>
        
        <div class="footer-card-right">
          <div class="footer-card-visual">
            <div class="visual-text">SK</div>
            <div class="visual-subtitle">Sumeet Kobarne</div>
          </div>
        </div>
      </div>
      
      <button class="footer-card-close" aria-label="Close card">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    document.body.appendChild(this.card);
    
    // Set initial position (bottom right)
    this.setInitialPosition();
    
    // Add event listeners
    this.addEventListeners();
    
    // Show card after a delay
    setTimeout(() => {
      this.card.classList.add('visible');
    }, 1000);
  }

  setInitialPosition() {
    const cardWidth = 520;
    const cardHeight = 280;
    const margin = 24;
    
    // Position at bottom right
    this.xOffset = window.innerWidth - cardWidth - margin;
    this.yOffset = window.innerHeight - cardHeight - margin;
    
    this.setTranslate(this.xOffset, this.yOffset);
  }

  addEventListeners() {
    const handle = this.card.querySelector('.drag-handle');
    const closeBtn = this.card.querySelector('.footer-card-close');
    
    // Drag events
    handle.addEventListener('mousedown', this.dragStart.bind(this));
    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('mouseup', this.dragEnd.bind(this));
    
    // Touch events
    handle.addEventListener('touchstart', this.dragStart.bind(this));
    document.addEventListener('touchmove', this.drag.bind(this));
    document.addEventListener('touchend', this.dragEnd.bind(this));
    
    // Close button
    closeBtn.addEventListener('click', () => {
      this.card.classList.remove('visible');
      setTimeout(() => {
        this.card.style.display = 'none';
      }, 300);
    });
    
    // Reposition on window resize
    window.addEventListener('resize', () => {
      this.constrainPosition();
    });
  }

  dragStart(e) {
    if (e.type === 'touchstart') {
      this.initialX = e.touches[0].clientX - this.xOffset;
      this.initialY = e.touches[0].clientY - this.yOffset;
    } else {
      this.initialX = e.clientX - this.xOffset;
      this.initialY = e.clientY - this.yOffset;
    }

    if (e.target.closest('.drag-handle')) {
      this.isDragging = true;
      this.card.classList.add('dragging');
    }
  }

  drag(e) {
    if (this.isDragging) {
      e.preventDefault();
      
      if (e.type === 'touchmove') {
        this.currentX = e.touches[0].clientX - this.initialX;
        this.currentY = e.touches[0].clientY - this.initialY;
      } else {
        this.currentX = e.clientX - this.initialX;
        this.currentY = e.clientY - this.initialY;
      }

      this.xOffset = this.currentX;
      this.yOffset = this.currentY;

      this.setTranslate(this.currentX, this.currentY);
    }
  }

  dragEnd() {
    if (this.isDragging) {
      this.isDragging = false;
      this.card.classList.remove('dragging');
      this.constrainPosition();
    }
  }

  setTranslate(xPos, yPos) {
    this.card.style.transform = `translate(${xPos}px, ${yPos}px)`;
  }

  constrainPosition() {
    const rect = this.card.getBoundingClientRect();
    const margin = 20;
    
    let newX = this.xOffset;
    let newY = this.yOffset;
    
    // Constrain to viewport
    if (rect.left < margin) {
      newX = margin;
    }
    if (rect.right > window.innerWidth - margin) {
      newX = window.innerWidth - rect.width - margin;
    }
    if (rect.top < margin) {
      newY = margin;
    }
    if (rect.bottom > window.innerHeight - margin) {
      newY = window.innerHeight - rect.height - margin;
    }
    
    this.xOffset = newX;
    this.yOffset = newY;
    this.setTranslate(newX, newY);
  }
}

// Initialize the draggable footer
new DraggableFooter();
