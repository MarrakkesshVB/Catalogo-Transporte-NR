/**
 * ==========================================================================
 * TRANSPORTE NUEVA ROMA - MAIN INTERACTION & APPLICATION ENGINE
 * High Conversion, Smooth UI Interactions, Tracking Modal & Hub Controller
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Sticky Header State
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  }, { passive: true });

  // 2. Mobile Menu Drawer
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      const isExpanded = mobileDrawer.classList.contains('open');
      mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close when clicking any nav link
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // 3. Shipment Tracking Console (Live Simulation Modal)
  const trackingForm = document.getElementById('trackingForm');
  const trackingInput = document.getElementById('trackingInput');
  const trackingModal = document.getElementById('trackingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const trackingCodeDisplay = document.getElementById('trackingCodeDisplay');
  const trackingLocationText = document.getElementById('trackingLocationText');
  const trackingTimestampText = document.getElementById('trackingTimestampText');

  function openTrackingModal(code) {
    if (!trackingModal) return;
    const cleanCode = (code || 'NR-84920').trim().toUpperCase();
    if (trackingCodeDisplay) trackingCodeDisplay.textContent = cleanCode;
    
    // Set realistic tracking time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    if (trackingTimestampText) {
      trackingTimestampText.textContent = `${formattedDate} - ${formattedTime} hs (Último reporte GPS)`;
    }

    trackingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeTrackingModal() {
    if (!trackingModal) return;
    trackingModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (trackingForm) {
    trackingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = trackingInput ? trackingInput.value : '';
      openTrackingModal(val || 'NR-84920');
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeTrackingModal);
  }

  if (trackingModal) {
    trackingModal.addEventListener('click', (e) => {
      if (e.target === trackingModal) {
        closeTrackingModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && trackingModal?.classList.contains('active')) {
      closeTrackingModal();
    }
  });

  // 4. Interactive Route Hub Selector
  const hubItems = document.querySelectorAll('.hub-stop-item');
  const mapNodes = document.querySelectorAll('.map-node-pulse');
  const mapDetailCity = document.getElementById('mapDetailCity');
  const mapDetailTime = document.getElementById('mapDetailTime');
  const mapDetailAddress = document.getElementById('mapDetailAddress');

  const hubData = {
    'rafaela': {
      city: 'Rafaela, Santa Fe (Casa Central & Hub Logístico Norte)',
      time: 'Operación 24 hs • Frecuencia diaria directa',
      address: 'Ruta Nacional 34 Km 220, Parque Industrial Rafaela'
    },
    'buenosaires': {
      city: 'Buenos Aires (Centro de Distribución AMBA / Dock Sud)',
      time: 'Frecuencia diaria nocturna • Entregas 24 hs',
      address: 'Polo Logístico Avellaneda / CABA'
    },
    'rosario': {
      city: 'Rosario, Santa Fe (Hub Litoral & Conexión Portuaria)',
      time: 'Salidas cada 6 horas • Distribución Express',
      address: 'Circunvalación & Pte. Perón'
    },
    'cordoba': {
      city: 'Córdoba Capital (Hub Región Centro)',
      time: 'Frecuencia diaria • Cobertura provincial',
      address: 'Av. Circunvalación Sur 4500'
    },
    'santafe': {
      city: 'Santa Fe Capital (Sucursal Regional)',
      time: 'Frecuencia diaria • Cargas y Encomiendas',
      address: 'Ruta 19 Km 4.5'
    }
  };

  hubItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const hubKey = item.getAttribute('data-hub');
      activateHub(hubKey);
    });
    item.addEventListener('click', () => {
      const hubKey = item.getAttribute('data-hub');
      activateHub(hubKey);
    });
  });

  mapNodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      const hubKey = node.getAttribute('data-hub');
      activateHub(hubKey);
    });
    node.addEventListener('click', () => {
      const hubKey = node.getAttribute('data-hub');
      activateHub(hubKey);
    });
  });

  function activateHub(key) {
    if (!key || !hubData[key]) return;
    hubItems.forEach(i => {
      if (i.getAttribute('data-hub') === key) {
        i.classList.add('active');
      } else {
        i.classList.remove('active');
      }
    });

    mapNodes.forEach(n => {
      if (n.getAttribute('data-hub') === key) {
        n.setAttribute('r', '14');
        n.setAttribute('fill', '#F97316');
      } else {
        n.setAttribute('r', '8');
        n.setAttribute('fill', '#1E40AF');
      }
    });

    if (mapDetailCity) mapDetailCity.textContent = hubData[key].city;
    if (mapDetailTime) mapDetailTime.textContent = hubData[key].time;
    if (mapDetailAddress) mapDetailAddress.textContent = hubData[key].address;
  }

  // 5. Stat Counter Animation on Scroll View
  const statsSection = document.querySelector('.stats-ribbon');
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let hasAnimatedStats = false;

  if (statsSection && statNumbers.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimatedStats) {
          hasAnimatedStats = true;
          statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target') || '0', 10);
            const prefix = stat.getAttribute('data-prefix') || '';
            const suffix = stat.getAttribute('data-suffix') || '';
            let current = 0;
            const duration = 1800;
            const stepTime = 25;
            const increment = target / (duration / stepTime);

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              stat.textContent = `${prefix}${Math.floor(current).toLocaleString('es-AR')}${suffix}`;
            }, stepTime);
          });
        }
      });
    }, { threshold: 0.35 });

    observer.observe(statsSection);
  }

  // 6. Magnetic Button subtle dynamic feel
  const magneticButtons = document.querySelectorAll('.btn-primary-orange');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15 - 2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

});
