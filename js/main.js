// Main UI interactions: menu toggle, footer year, admin mode show
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    var menu = document.getElementById('main-nav');
    var toggle = document.getElementById('menu-toggle');
    if(toggle){
      toggle.addEventListener('click', function(){
        var open = menu.style.display === 'flex' || menu.style.display === 'block';
        menu.style.display = open ? 'none' : 'block';
        toggle.setAttribute('aria-expanded', (!open).toString());
      });
    }

    // Footer years
    var yearEls = [document.getElementById('year'), document.getElementById('year-2'), document.getElementById('year-3'), document.getElementById('year-4'), document.getElementById('year-5')];
    var y = new Date().getFullYear();
    yearEls.forEach(function(el){ if(el) el.textContent = y; });

    // Set WhatsApp phone links (update this number to your shop number)
    var phone = '+2348031868066';
    var phoneLinks = document.querySelectorAll('#wa-phone, #contact-wa');
    phoneLinks.forEach(function(a){ if(a) a.setAttribute('href','https://wa.me/' + phone.replace(/[^0-9]/g,'')); });

    // Admin mode (local product management)
    var params = new URLSearchParams(window.location.search);
    if(params.get('admin') === 'true'){
      var panel = document.getElementById('admin-panel');
      if(panel) panel.style.display = 'block';
      // show admin help if present
      var adminHelp = document.getElementById('admin-panel');
      if(adminHelp) adminHelp.style.display = 'block';
      // Expose simple admin controls via order.js
      window.KAYDELISH_ADMIN = true;
    }

    // Image gallery / lightbox
    function openLightbox(src, alt){
      var lb = document.createElement('div'); lb.className = 'lightbox';
      lb.tabIndex = -1;
      var img = document.createElement('img'); img.src = src; img.alt = alt || '';
      var btn = document.createElement('button'); btn.className = 'close'; btn.innerHTML = '✕';
      btn.addEventListener('click', function(){ lb.remove(); });
      lb.addEventListener('click', function(e){ if(e.target === lb) lb.remove(); });
      document.body.appendChild(lb);
      lb.appendChild(img);
      lb.appendChild(btn);
      // close on escape
      lb.focus();
      function onKey(e){ if(e.key === 'Escape') { lb.remove(); document.removeEventListener('keydown', onKey); } }
      document.addEventListener('keydown', onKey);
    }

    document.querySelectorAll('.gallery-item img').forEach(function(img){
      img.addEventListener('click', function(){ openLightbox(img.dataset.full || img.src, img.alt); });
    });

    // Slideshow functionality
    var slideshows = document.querySelectorAll('.slideshow');
    slideshows.forEach(function(slideshow){
      var container = slideshow.querySelector('.slideshow-container');
      var slides = container.querySelectorAll('.slide-img');
      var dots = slideshow.querySelectorAll('.dot');
      var prevBtn = slideshow.querySelector('.slide-prev');
      var nextBtn = slideshow.querySelector('.slide-next');
      
      var currentSlide = 0;
      
      function showSlide(n){
        if(n >= slides.length) currentSlide = 0;
        if(n < 0) currentSlide = slides.length - 1;
        
        slides.forEach(function(slide){ slide.style.display = 'none'; });
        dots.forEach(function(dot){ dot.classList.remove('active'); });
        
        slides[currentSlide].style.display = 'block';
        dots[currentSlide].classList.add('active');
      }
      
      function nextSlide(){
        currentSlide++;
        showSlide(currentSlide);
      }
      
      function prevSlide(){
        currentSlide--;
        showSlide(currentSlide);
      }
      
      if(prevBtn) prevBtn.addEventListener('click', prevSlide);
      if(nextBtn) nextBtn.addEventListener('click', nextSlide);
      
      dots.forEach(function(dot, idx){
        dot.addEventListener('click', function(){
          currentSlide = idx;
          showSlide(currentSlide);
        });
      });
      
      // Auto-advance slideshow every 5 seconds
      setInterval(nextSlide, 5000);
    });
  });
})();
