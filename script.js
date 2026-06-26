/**
 * GAURAV BOLE - Portfolio Website Script
 * High-performance canvas particle system & scroll animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initScrollEffects();
  initMobileMenu();
  initBlobSphere();
});

/* ==========================================================================
   CUSTOM CURSOR INTERACTIVE CONTROLLER
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const ring = document.getElementById('custom-cursor-ring');
  
  if (!cursor || !ring) return;

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  // Track cursor position
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Smoothly interpolate the cursor ring (lerp)
  function updateRing() {
    const ease = 0.15; // Speed factor
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;
    
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    
    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Highlight elements on hover
  const interactives = document.querySelectorAll('a, button, input, textarea, .project-card, #botanical-flower');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovering');
    });
  });
}

/* ==========================================================================
   SCROLL EFFECTS & NAVIGATION
   ========================================================================== */
function initScrollEffects() {
  const navbar = document.querySelector('.navbar');
  const reveals = document.querySelectorAll('.scroll-reveal');

  // Sticky Navigation modification
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  });

  // Intersection Observer for graceful fading reveals
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, observerOptions);

  reveals.forEach(el => revealObserver.observe(el));
}


/* ==========================================================================
   MOBILE MENU DRAWER CONTROLLER
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuToggle) {
        menuToggle.checked = false;
      }
    });
  });
}

/* ==========================================================================
   MODERN FULL-PAGE BLOCH SPHERE RENDERER (QUANTUM TECH)
   ========================================================================== */
function initBlobSphere() {
  const canvas = document.getElementById('bloch-sphere-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let animationFrameId;
  let angleY = 0; // rotation around vertical axis
  let time = 0; // Track animation timeline

  // Mouse tracking variables
  let mouseX = -1000;
  let mouseY = -1000;
  let currentRadiusMultiplier = 1.0;
  let currentSpeedMultiplier = 1.0;
  let currentTiltOffset = 0;
  let currentPanOffset = 0;

  function resize() {
    width = canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    height = canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
  }

  resize();
  window.addEventListener('resize', resize);

  // Track mouse coordinates on window
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = width / 2;
    const cy = height / 2;
    const scale = window.devicePixelRatio || 1;
    const baseRadius = Math.min(width, height) * 0.28;
    
    // Check distance between cursor and sphere center
    const cssMouseX = mouseX;
    const cssMouseY = mouseY;
    const cssCx = cx / scale;
    const cssCy = cy / scale;
    const cssBaseRadius = baseRadius / scale;

    const dx = cssMouseX - cssCx;
    const dy = cssMouseY - cssCy;
    const dist = Math.hypot(dx, dy);

    // Hover is active when mouse is near the sphere area
    const isHovered = dist < cssBaseRadius * 1.6;

    // Smoothly interpolate radius and speed multipliers
    const targetRadiusMultiplier = isHovered ? 1.25 : 1.0;
    const targetSpeedMultiplier = isHovered ? 3.8 : 1.0;

    currentRadiusMultiplier += (targetRadiusMultiplier - currentRadiusMultiplier) * 0.08;
    currentSpeedMultiplier += (targetSpeedMultiplier - currentSpeedMultiplier) * 0.08;

    // Apply interactive mouse tracking tilt and pan (face-to-mouse effect)
    const targetTiltOffset = isHovered ? (dy / cssBaseRadius) * 0.28 : 0;
    const targetPanOffset = isHovered ? (dx / cssBaseRadius) * 0.38 : 0;

    currentTiltOffset += (targetTiltOffset - currentTiltOffset) * 0.08;
    currentPanOffset += (targetPanOffset - currentPanOffset) * 0.08;

    time += 0.004 * currentSpeedMultiplier;
    angleY += 0.0035 * currentSpeedMultiplier;

    const radius = baseRadius * currentRadiusMultiplier;
    const tilt = 0.38 + currentTiltOffset;
    const activeAngleY = angleY + currentPanOffset;

    // Project 3D point to 2D screen coordinates
    function project(x, y, z) {
      // 1. Rotate around Y axis (spin + pan)
      const xRot = x * Math.cos(activeAngleY) - z * Math.sin(activeAngleY);
      const zRot = x * Math.sin(activeAngleY) + z * Math.cos(activeAngleY);
      
      // 2. Rotate around X axis (tilt)
      const finalX = xRot;
      const finalY = y * Math.cos(tilt) - zRot * Math.sin(tilt);
      const finalZ = y * Math.sin(tilt) + zRot * Math.cos(tilt);

      return {
        x: cx + finalX,
        y: cy + finalY,
        z: finalZ
      };
    }

    // Colors matching the original aesthetic
    const strokeColor = 'rgba(190, 162, 122, 0.15)'; // Very light gold
    const axisColor = 'rgba(142, 116, 86, 0.09)'; // Extremely faint brown
    const activeColor = 'rgba(15, 107, 71, 0.22)'; // Very light accent green
    const labelColor = 'rgba(110, 94, 77, 0.45)'; // Semi-transparent text primary

    // ── 1. Outer Sphere Silhouette ──
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // ── 2. Equator (XY Plane Ring) ──
    ctx.beginPath();
    const segments = 90;
    for (let i = 0; i <= segments; i++) {
      const a = (i * Math.PI * 2) / segments;
      const pt = project(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // ── 3. Meridian (XZ Plane Ring) ──
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const a = (i * Math.PI * 2) / segments;
      const pt = project(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // ── 4. Coordinate Axes (X, Y, Z) ──
    const axes = [
      { name: 'x', from: [-radius * 1.15, 0, 0], to: [radius * 1.15, 0, 0] },
      { name: 'y', from: [0, 0, -radius * 1.15], to: [0, 0, radius * 1.15] },
      { name: 'z', from: [0, -radius * 1.15, 0], to: [0, radius * 1.15, 0] }
    ];

    ctx.lineWidth = 0.8 * scale;
    axes.forEach(axis => {
      const pFrom = project(...axis.from);
      const pTo = project(...axis.to);
      ctx.beginPath();
      ctx.moveTo(pFrom.x, pFrom.y);
      ctx.lineTo(pTo.x, pTo.y);
      ctx.strokeStyle = axisColor;
      ctx.stroke();
    });

    // ── 5. Bloch Sphere Labels (|0>, |1>, |+>, |->, |i>, |-i>) ──
    ctx.font = `${Math.max(10, radius * 0.08)}px "Inter", sans-serif`;
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labels = [
      { text: '|0⟩', pos: [0, -radius * 1.25, 0] },  // Top (Z-axis positive)
      { text: '|1⟩', pos: [0, radius * 1.25, 0] },   // Bottom (Z-axis negative)
      { text: '|+⟩', pos: [radius * 1.28, 0, 0] },   // Front-Right (X-axis positive)
      { text: '|-⟩', pos: [-radius * 1.28, 0, 0] },  // Back-Left (X-axis negative)
      { text: '|i⟩', pos: [0, 0, radius * 1.28] },   // Front-Left (Y-axis positive)
      { text: '|-i⟩', pos: [0, 0, -radius * 1.28] }  // Back-Right (Y-axis negative)
    ];

    labels.forEach(lbl => {
      const pt = project(...lbl.pos);
      ctx.fillText(lbl.text, pt.x, pt.y);
    });

    // ── 6. State Vector (Qubit Pointer) precessing ──
    const theta = Math.PI * 0.35; // polar angle
    const phi = time * 0.85;       // azimuthal angle (precession)

    const vx = Math.sin(theta) * Math.cos(phi) * radius;
    const vy = -Math.cos(theta) * radius;
    const vz = Math.sin(theta) * Math.sin(phi) * radius;

    const pVec = project(vx, vy, vz);
    const pCenter = project(0, 0, 0);

    // Draw vector line
    ctx.beginPath();
    ctx.moveTo(pCenter.x, pCenter.y);
    ctx.lineTo(pVec.x, pVec.y);
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 1.8 * scale;
    ctx.stroke();

    // Draw vector endpoint node
    ctx.beginPath();
    ctx.arc(pVec.x, pVec.y, 4.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = activeColor;
    ctx.fill();

    // Subtle projection lines onto equatorial plane
    const pProj = project(vx, 0, vz);
    ctx.beginPath();
    ctx.setLineDash([3 * scale, 3 * scale]);
    ctx.moveTo(pVec.x, pVec.y);
    ctx.lineTo(pProj.x, pProj.y);
    ctx.strokeStyle = 'rgba(15, 107, 71, 0.12)';
    ctx.stroke();
    ctx.setLineDash([]);

    animationFrameId = requestAnimationFrame(draw);
  }

  draw();

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrameId);
  });
}





