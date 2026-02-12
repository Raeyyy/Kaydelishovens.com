/* order.js
 - Handles order buttons, product admin (localStorage) and WhatsApp message formatting
 - Update WHATSAPP_NUMBER to your business number in international format without plus sign (e.g. 2348012345678)
*/
(function(){
  var WHATSAPP_NUMBER = '2348000000000';

  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
  function qsa(sel, ctx){ return Array.prototype.slice.call((ctx||document).querySelectorAll(sel)); }

  function formatMoney(n){ return 'NGN ' + Number(n).toLocaleString(); }

  function productDataFromElement(el){
    return {
      id: el.getAttribute('data-id'),
      name: el.getAttribute('data-name'),
      price: el.getAttribute('data-price'),
      available: el.getAttribute('data-available') !== 'false'
    };
  }

  function sendWhatsAppMessage(text){
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  function attachOrderButtons(){
    qsa('.order-whatsapp').forEach(function(btn){
      btn.addEventListener('click', function(e){
        var productEl = btn.closest('.product') || btn.closest('.card');
        if(productEl && productEl.dataset){
          var data = productDataFromElement(productEl);
          var qtyInput = productEl.querySelector('.qty');
          var qty = qtyInput ? Number(qtyInput.value||1) : 1;
          if(!data.available){
            alert(data.name + ' is currently sold out. Send us a WhatsApp message to check availability.');
            return;
          }
          var text = 'Order from Kaydelish:\n';
          text += data.name + ' x' + qty + ' (' + formatMoney(data.price) + ' each)\n';
          text += 'Quantity: ' + qty + '\n';
          text += 'Notes: (add address / pickup time)\n';
          sendWhatsAppMessage(text);
        } else {
          // For header/home quick buttons with data attributes
          var name = btn.getAttribute('data-name') || 'Order';
          var price = btn.getAttribute('data-price') || '';
          var text = 'Order from Kaydelish:\n' + name + (price? (' - ' + formatMoney(price)):'');
          sendWhatsAppMessage(text);
        }
      });
    });
  }

  function attachCakeForm(){
    var form = qs('#cake-order-form');
    if(!form) return;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(form);
      var parts = [];
      parts.push('Cake Pre-Order — Kaydelish');
      parts.push('Name: ' + fd.get('customer'));
      parts.push('Phone: ' + fd.get('phone'));
      if(fd.get('email')) parts.push('Email: ' + fd.get('email'));
      parts.push('Size: ' + fd.get('size'));
      parts.push('Flavour: ' + fd.get('flavour'));
      parts.push('Finish: ' + fd.get('finish'));
      parts.push('Preferred date: ' + fd.get('date'));
      if(fd.get('message')) parts.push('Cake message: ' + fd.get('message'));
      if(fd.get('notes')) parts.push('Notes: ' + fd.get('notes'));
      parts.push('Please confirm availability and total price.');
      var text = parts.join('\n');
      sendWhatsAppMessage(text);
    });
  }

  /* Simple client-side product admin saved to localStorage */
  var STORAGE_KEY = 'kaydelish_products_v1';

  function loadProducts(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {}; } catch(e){ return {}; }
  }
  function saveProducts(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

  function applySavedProducts(){
    var saved = loadProducts();
    qsa('[data-id]').forEach(function(el){
      var id = el.getAttribute('data-id');
      if(saved[id]){
        var s = saved[id];
        el.setAttribute('data-name', s.name);
        el.setAttribute('data-price', s.price);
        el.setAttribute('data-available', s.available ? 'true' : 'false');
        var soldBtn = el.querySelector('.toggle-availability');
        if(soldBtn){ soldBtn.textContent = s.available ? 'Mark Sold Out' : 'Mark Available'; }
        // show sold label if not available
        if(!s.available){
          if(!el.querySelector('.sold-badge')){
            var b = document.createElement('span'); b.className='badge-sold sold-badge'; b.textContent='Sold Out';
            el.insertBefore(b, el.firstChild);
          }
        } else {
          var existing = el.querySelector('.sold-badge'); if(existing) existing.remove();
        }
      }
    });
  }

  function wireAdminControls(){
    if(!window.KAYDELISH_ADMIN) return;
    var addBtn = document.getElementById('add-product');
    if(addBtn){
      addBtn.addEventListener('click', function(){
        var name = document.getElementById('new-name').value.trim();
        var price = document.getElementById('new-price').value.trim();
        if(!name || !price) return alert('Provide name and price');
        // generate id
        var id = name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
        var data = loadProducts();
        data[id] = { name:name, price: price, available:true };
        saveProducts(data);
        alert('Product added locally. Reload page to see it.');
      });

      // Toggle availability buttons
      qsa('.toggle-availability').forEach(function(btn){
        btn.style.display = 'inline-block';
        btn.addEventListener('click', function(){
          var el = btn.closest('[data-id]');
          if(!el) return;
          var id = el.getAttribute('data-id');
          var data = loadProducts();
          var current = data[id] || { name: el.getAttribute('data-name'), price: el.getAttribute('data-price'), available: el.getAttribute('data-available') !== 'false' };
          current.available = !current.available;
          data[id] = current;
          saveProducts(data);
          applySavedProducts();
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    attachOrderButtons();
    attachCakeForm();
    applySavedProducts();
    wireAdminControls();
  });

})();
