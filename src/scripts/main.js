// main.js - Core logic for Bold Premise Clone

// Import reusable components and utilities
import './components.js';
import './utils.js';
import projectsData from '../data/projects.js';
import certificatesData from '../data/certificates.js';
import aboutData from '../data/about.js';
import skillsData from '../data/skills.js'; // <-- Add this import

let panelZ = 30;

function getRandomPanelPosition(panelWidth = 480, panelHeight = 480, forceTop = false) {
  const main = document.querySelector('.app-main');
  const rect = main.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  let left = centerX - panelWidth / 2 + (Math.random() - 0.5) * 120;
  let top;
  if (forceTop) {
    top = 96; // Start from top (header + margin)
  } else {
    const centerY = rect.top + rect.height / 2;
    top = centerY - panelHeight / 2 + (Math.random() - 0.5) * 120;
  }
  return { left, top };
}

function renderAboutPanel() {
  createPanel({
    className: 'about-panel',
    title: 'About',
    content: `
      <div class="about-panel-main">
        <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&q=80" alt="${aboutData.name}" class="about-panel-image" style="margin-bottom: 20px;" />
        <div class="about-panel-text">${aboutData.summary}</div>
      </div>
    `,
    forceTop: true
  });
}

function renderProjectsPanel() {
  createPanel({
    className: 'project-panel',
    title: 'Projects',
    content: `
      <div class="project-panel-content">
        <div class="project-panel-filters">
          <input type="text" class="project-search" placeholder="Search projects..." />
          <button class="project-filter-icon" title="Filter by category" style="background:none;border:none;cursor:pointer;padding:6px 10px;display:flex;align-items:center;justify-content:center;">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 6h16M6 12h12M10 18h4"/></svg>
          </button>
          <div class="project-filter-dropdown" style="display:none;position:absolute;top:44px;right:0;background:#2d1836;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.18);padding:8px 0;z-index:10;"></div>
        </div>
        <div class="project-tiles-grid"></div>
      </div>
    `
  });
  const panel = document.querySelector('.project-panel:last-of-type');
  if (!panel) return;
  const contentGrid = panel.querySelector('.project-tiles-grid');
  const searchInput = panel.querySelector('.project-search');
  const filterIcon = panel.querySelector('.project-filter-icon');
  const dropdown = panel.querySelector('.project-filter-dropdown');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(projectsData.map(p => p.category)))];
  let activeCat = 'All';

  // Populate dropdown
  dropdown.innerHTML = '';
  categories.forEach(cat => {
    const item = document.createElement('div');
    item.textContent = cat;
    item.className = 'project-filter-dropdown-item';
    item.style = 'padding:8px 24px;color:#fff;cursor:pointer;white-space:nowrap;';
    if (cat === activeCat) item.style.background = '#a259ff';
    item.addEventListener('click', () => {
      activeCat = cat;
      dropdown.style.display = 'none';
      renderProjects();
    });
    dropdown.appendChild(item);
  });

  // Show/hide dropdown
  filterIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });
  panel.querySelector('.project-panel-filters').addEventListener('click', e => e.stopPropagation());

  function renderProjects() {
    // Highlight active in dropdown
    Array.from(dropdown.children).forEach(item => {
      item.style.background = item.textContent === activeCat ? '#a259ff' : 'none';
    });
    const search = searchInput.value.toLowerCase();
    let filtered = projectsData.filter(p =>
      (activeCat === 'All' || p.category === activeCat) &&
      (p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search))
    );
    contentGrid.innerHTML = '';
    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" class="project-card-img" />
        <div class="project-card-title">${p.name}</div>
        <div class="project-card-category">${p.category}</div>
        <div class="project-card-desc">${p.description}</div>
      `;
      
      // Add click event for popup
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        showProjectPopup(p);
      });
      
      contentGrid.appendChild(card);
    });
  }
  searchInput.addEventListener('input', renderProjects);
  renderProjects();
}

function renderCertificatesPanel() {
  createPanel({
    className: 'certificates-panel',
    title: 'Certificates',
    content: `
      <div class="certificates-panel-content">
        <div class="certificates-panel-filters">
          <input type="text" class="certificates-search" placeholder="Search certificates..." />
          <select class="certificates-type-filter">
            <option value="all">All</option>
            <option value="badge">Badge</option>
            <option value="certificate">Certificate</option>
          </select>
        </div>
        <div class="certificates-tiles-grid"></div>
      </div>
    `
  });
  const panel = document.querySelector('.certificates-panel:last-of-type');
  if (!panel) return;
  const contentGrid = panel.querySelector('.certificates-tiles-grid');
  const searchInput = panel.querySelector('.certificates-search');
  const typeFilter = panel.querySelector('.certificates-type-filter');

  function renderCertificates() {
    const search = searchInput.value.toLowerCase();
    const type = typeFilter.value;
    let filtered = certificatesData.filter(cert => {
      const matchesType = type === 'all' || cert.type === type;
      const matchesSearch = cert.name.toLowerCase().includes(search) || cert.issuer.toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
    contentGrid.innerHTML = '';
    filtered.forEach(cert => {
      const card = document.createElement('div');
      card.className = 'certificate-card';
      card.setAttribute('data-type', cert.type); // Add data-type attribute for styling
      card.innerHTML = `
        <img src="${cert.image}" alt="${cert.name}" class="certificate-img" />
        <div class="certificate-name">${cert.name}</div>
        <div class="certificate-issuer">${cert.issuer}</div>
      `;
      
      // Add click event for popup (same for both certificates and badges)
      const certImg = card.querySelector('.certificate-img');
      certImg.style.cursor = 'pointer';
      certImg.addEventListener('click', () => {
        showCertificatePopup(cert);
      });
      
      contentGrid.appendChild(card);
    });
  }
  searchInput.addEventListener('input', renderCertificates);
  typeFilter.addEventListener('change', renderCertificates);
  renderCertificates();
}

function renderContactPanel() {
  createPanel({
    className: 'contact-panel',
    title: 'Contact',
    content: `
      <form class="contact-form" autocomplete="off" style="width:100%;display:flex;flex-direction:column;gap:1rem;margin-top:10px;">
        <input type="text" name="name" placeholder="Your Name" required style="padding:0.8em;border:1px solid #333;border-radius:0.5em;font-size:1em;background:#20132a;color:#fff;" />
        <input type="email" name="email" placeholder="Your Email" required style="padding:0.8em;border:1px solid #333;border-radius:0.5em;font-size:1em;background:#20132a;color:#fff;" />
        <textarea name="message" placeholder="Your Message" required style="padding:0.8em;border:1px solid #333;border-radius:0.5em;font-size:1em;background:#20132a;color:#fff;min-height:100px;"></textarea>
        <button type="submit" style="padding:0.8em;background:#a259ff;color:#fff;border:none;border-radius:0.5em;font-size:1em;font-weight:600;cursor:pointer;transition:background 0.2s;">Send</button>
      </form>
    `
  });
  // Add form handler for alert and reset
  const panel = document.querySelector('.contact-panel:last-of-type');
  if (panel) {
    const form = panel.querySelector('.contact-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for reaching out!');
        form.reset();
      });
    }
  }
}

function renderSkillsPanel() {
  createPanel({
    className: 'skills-panel',
    title: 'Skills',
    content: `
      <div class="skills-panel-content">
        <div class="skills-services-grid">
          <div class="service-item">
            <span class="service-icon"> <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 9h8M8 15h8M8 12h8"/></svg> </span>
            <div class="service-title">UX Design</div>
            <div class="service-desc">Crafting seamless user experiences through research, prototyping, and user testing.</div>
          </div>
          <div class="service-item">
            <span class="service-icon"> <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8v8H8z"/></svg> </span>
            <div class="service-title">UI Design</div>
            <div class="service-desc">Combining aesthetics and functionality, we design visually stunning interfaces.</div>
          </div>
          <div class="service-item">
            <span class="service-icon"> <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8v8H8z"/></svg> </span>
            <div class="service-title">Web Design</div>
            <div class="service-desc">Creating captivating and responsive websites that blend aesthetics and functionality.</div>
          </div>
          <div class="service-item">
            <span class="service-icon"> <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 20v-6M12 4v2m0 0a8 8 0 1 1-8 8"/></svg> </span>
            <div class="service-title">No Code</div>
            <div class="service-desc">I leverage no-code tools to develop efficient and scalable solutions that drive innovation.</div>
          </div>
        </div>
        <div class="skills-panel-divider" style="margin: 12px 0 0 0;"></div>
        <div class="skills-grid">
          ${skillsData.map(skill => `
            <div class="skill-card">
              <img src="${skill.logo}" alt="${skill.name}" class="skill-logo" />
              <div class="skill-name">${skill.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  });
}

function renderResumePanel() {
  const panel = document.createElement('div');
  panel.className = 'resume-panel';
  panel.innerHTML = `
    <div class="panel-title-bar">
      <span class="panel-title">Resume</span>
      <button class="panel-close" title="Close">&times;</button>
    </div>
    <div class="resume-panel-content about-panel-content">
      <div class="resume-pdf-container">
        <iframe src="resume.pdf" class="resume-pdf" title="Resume PDF" frameborder="0"></iframe>
      </div>
    </div>
  `;
  panel.style.zIndex = ++panelZ;
  // Spawn like other panels
  const pos = getRandomPanelPosition(480, 600);
  panel.style.left = pos.left + 'px';
  panel.style.top = pos.top + 'px';
  panel.style.transform = 'none';
  makePanelDraggable(panel);
  // Close button logic
  panel.querySelector('.panel-close').addEventListener('click', () => {
    panel.remove();
  });
  document.getElementById('panel-container').appendChild(panel);
}

function showCertificatePopup(certificate) {
  // Remove existing popup if any
  const existingPopup = document.querySelector('.certificate-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup overlay
  const popup = document.createElement('div');
  popup.className = 'certificate-popup';
  popup.innerHTML = `
    <div class="certificate-popup-overlay"></div>
    <div class="certificate-popup-content">
      <div class="certificate-popup-header">
        <h3>${certificate.name}</h3>
        <button class="certificate-popup-close" title="Close">&times;</button>
      </div>
      <div class="certificate-popup-body">
        <img src="${certificate.image}" alt="${certificate.name}" class="certificate-popup-img" />
        <div class="certificate-popup-details">
          <p><strong>Issuer:</strong> ${certificate.issuer}</p>
          <p><strong>Type:</strong> ${certificate.type}</p>
          ${certificate.link ? `<a href="${certificate.link}" class="certificate-popup-link" target="_blank">${certificate.type === 'badge' ? 'Verify Badge' : 'View Certificate'}</a>` : ''}
        </div>
      </div>
    </div>
  `;

  // Add to body
  document.body.appendChild(popup);

  // Close functionality
  const closeBtn = popup.querySelector('.certificate-popup-close');
  const overlay = popup.querySelector('.certificate-popup-overlay');
  
  const closePopup = () => {
    popup.remove();
  };

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closePopup();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function showProjectPopup(project) {
  // Remove existing popup if any
  const existingPopup = document.querySelector('.project-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup overlay
  const popup = document.createElement('div');
  popup.className = 'project-popup';
  popup.innerHTML = `
    <div class="project-popup-overlay"></div>
    <div class="project-popup-content">
      <div class="project-popup-header">
        <h3>${project.name}</h3>
        <button class="project-popup-close" title="Close">&times;</button>
      </div>
      <div class="project-popup-body project-popup-body-2col">
        <div class="project-popup-image-slider">
          <div class="project-popup-images">
            ${project.images.map((img, index) => `
              <img src="${img}" alt="${project.name} - Image ${index + 1}" class="project-popup-img ${index === 0 ? 'active' : ''}" />
            `).join('')}
          </div>
          ${project.images.length > 1 ? `
            <button class="project-popup-nav prev" title="Previous">&lt;</button>
            <button class="project-popup-nav next" title="Next">&gt;</button>
            <div class="project-popup-dots">
              ${project.images.map((_, index) => `
                <span class="project-popup-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="project-popup-details">
          <div class="project-popup-description">
            <h4>Description</h4>
            <p>${project.description}</p>
          </div>
          <div class="project-popup-technologies">
            <h4>Technologies Used</h4>
            <div class="project-popup-tech-tags">
              ${project.technologies.map(tech => `<span class="project-popup-tech-tag">${tech}</span>`).join('')}
            </div>
          </div>
          <div class="project-popup-highlights">
            <h4>Key Highlights</h4>
            <ul>
              ${project.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
            </ul>
          </div>
          <div class="project-popup-links">
            ${project.github ? `<a href="${project.github}" class="project-popup-link github" target="_blank">GitHub</a>` : ''}
            ${project.live ? `<a href="${project.live}" class="project-popup-link live" target="_blank">Live Demo</a>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  // Add to body
  document.body.appendChild(popup);

  // Image slider functionality
  if (project.images.length > 1) {
    const images = popup.querySelectorAll('.project-popup-img');
    const dots = popup.querySelectorAll('.project-popup-dot');
    const prevBtn = popup.querySelector('.project-popup-nav.prev');
    const nextBtn = popup.querySelector('.project-popup-nav.next');
    let currentIndex = 0;

    function showImage(index) {
      images.forEach((img, i) => {
        img.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      currentIndex = index;
    }

    function nextImage() {
      const nextIndex = (currentIndex + 1) % images.length;
      showImage(nextIndex);
    }

    function prevImage() {
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(prevIndex);
    }

    // Event listeners for navigation
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showImage(index));
    });

    // Auto-slide every 3 seconds
    const autoSlide = setInterval(nextImage, 5000);

    // Pause auto-slide on hover
    const slider = popup.querySelector('.project-popup-image-slider');
    slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
    slider.addEventListener('mouseleave', () => setInterval(nextImage, 3000));
  }

  // Close functionality
  const closeBtn = popup.querySelector('.project-popup-close');
  const overlay = popup.querySelector('.project-popup-overlay');
  
  const closePopup = () => {
    popup.remove();
  };

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closePopup();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function setNavIcons() {
  const icons = {
    skills: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L3 9h7z"/></svg>`,
    projects: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M8 3v14M12 3v14"/></svg>`,
    certificates: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="12" height="16" rx="2"/><path d="M8 6h4M8 10h4M8 14h2"/><circle cx="16" cy="8" r="2"/></svg>`,
    contact: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="16" height="10" rx="2"/><path d="M14 2h-8a2 2 0 0 0-2 2v2h12V4a2 2 0 0 0-2-2z"/></svg>`,
    about: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M10 14v-4"/><path d="M10 6h.01"/></svg>`,
    resume: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="12" height="16" rx="2"/><path d="M8 6h4M8 10h4M8 14h2"/></svg>`
  };
  document.querySelectorAll('.nav-left .nav-btn').forEach(btn => {
    const panel = btn.getAttribute('data-panel');
    const iconSpan = btn.querySelector('.nav-icon');
    if (icons[panel]) iconSpan.innerHTML = icons[panel];
  });
}

function makePanelDraggable(panel) {
  const titleBar = panel.querySelector('.panel-title-bar');
  let offsetX = 0, offsetY = 0, isDragging = false;
  titleBar.style.cursor = 'grab';
  titleBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - panel.getBoundingClientRect().left;
    offsetY = e.clientY - panel.getBoundingClientRect().top;
    panel.style.zIndex = ++panelZ;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;
    // Restrict top so panel can't go above header (64px)
    const minTop = 64;
    if (newTop < minTop) newTop = minTop;
    panel.style.left = newLeft + 'px';
    panel.style.top = newTop + 'px';
    panel.style.transform = 'none';
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  });
  panel.addEventListener('mousedown', () => {
    panel.style.zIndex = ++panelZ;
  });
}

function createPanel({ className, title, content, forceTop }) {
  const panel = document.createElement('div');
  panel.className = className;
  panel.innerHTML = `
    <div class="panel-title-bar">
      <span class="panel-title">${title}</span>
      <button class="panel-close" title="Close">&times;</button>
    </div>
    <div class="${className}-content">${content}</div>
  `;
  panel.style.zIndex = ++panelZ;
  // Random spawn near center
  const pos = getRandomPanelPosition(480, 480, forceTop);
  panel.style.left = pos.left + 'px';
  panel.style.top = pos.top + 'px';
  panel.style.transform = 'none';
  makePanelDraggable(panel);
  // Close button logic
  panel.querySelector('.panel-close').addEventListener('click', () => {
    panel.remove();
  });
  document.getElementById('panel-container').appendChild(panel);
}

function setupNav() {
  document.querySelectorAll('.nav-left .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-left .nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const panel = btn.getAttribute('data-panel');
      if (panel === 'about') {
        renderAboutPanel();
      } else if (panel === 'projects') {
        renderProjectsPanel();
      } else if (panel === 'certificates') {
        renderCertificatesPanel();
      } else if (panel === 'contact') {
        renderContactPanel();
      } else if (panel === 'skills') {
        renderSkillsPanel();
      } else if (panel === 'resume') {
        renderResumePanel();
      } else {
        alert('Panel "' + panel + '" not implemented yet.');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setNavIcons();
  setupNav();
  // Show About panel by default
  renderAboutPanel();
});

// App Initialization
function initApp() {
    // Smooth scroll for nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Contact form handler
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for reaching out!');
            form.reset();
        });
    }
}

document.addEventListener('DOMContentLoaded', initApp); 