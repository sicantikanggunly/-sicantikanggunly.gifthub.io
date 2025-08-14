// World Jewels Interactivity
const $ = (sel, el=document)=>el.querySelector(sel);
const $$ = (sel, el=document)=>[...el.querySelectorAll(sel)];
const state = {
  products: [
    {id:'ring-aurora', name:'Cincin Aurora', price:1450000, img:'assets/ring.svg', tag:'Best Seller'},
    {id:'necklace-sol', name:'Kalung Sol', price:2390000, img:'assets/necklace.svg', tag:'New'},
    {id:'earring-nova', name:'Anting Nova', price:990000, img:'assets/earring.svg', tag:'Limited'},
    {id:'ring-regal', name:'Cincin Regal', price:1790000, img:'assets/ring.svg'},
    {id:'necklace-luna', name:'Kalung Luna', price:3190000, img:'assets/necklace.svg'},
    {id:'earring-élan', name:'Anting Élan', price:1250000, img:'assets/earring.svg'},
  ],
  cart: JSON.parse(localStorage.getItem('wj_cart')||'[]'),
  slideIndex: 0,
  autoSlideTimer: null,
};
function formatRupiah(n){
  return 'Rp' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
// Render products
function renderProducts(){
  const grid = $('#productGrid');
  grid.innerHTML = state.products.map(p => `
    <article class="card">
      ${p.tag ? `<span class="tag">${p.tag}</span>`:''}
      <div class="img"><img src="${p.img}" alt="${p.name}" loading="lazy" width="200" height="200"></div>
      <h4>${p.name}</h4>
      <p class="price">${formatRupiah(p.price)}</p>
      <div class="actions">
        <button class="btn small" data-add="${p.id}">+ Keranjang</button>
        <button class="btn small outline" data-buy="${p.id}">Beli Sekarang</button>
      </div>
    </article>
  `).join('');
  grid.addEventListener('click', e=>{
    const add = e.target.dataset.add;
    const buy = e.target.dataset.buy;
    if(add){ addToCart(add); }
    if(buy){ addToCart(buy); openCart(); }
  });
}
// Cart
function saveCart(){ localStorage.setItem('wj_cart', JSON.stringify(state.cart)); updateCartBadge(); }
function updateCartBadge(){ $('#cartCount').textContent = state.cart.reduce((a,c)=>a+c.qty,0); }
function addToCart(id){
  const p = state.products.find(x=>x.id===id);
  const found = state.cart.find(x=>x.id===id);
  if(found) found.qty++;
  else state.cart.push({id:p.id, name:p.name, price:p.price, img:p.img, qty:1});
  saveCart(); renderCart();
}
function changeQty(id, delta){
  const item = state.cart.find(x=>x.id===id); if(!item) return;
  item.qty += delta; if(item.qty<=0){ state.cart = state.cart.filter(x=>x.id!==id); }
  saveCart(); renderCart();
}
function renderCart(){
  const box = $('#cartItems');
  if(state.cart.length===0){
    box.innerHTML = '<p>Keranjang kosong. Yuk belanja koleksi kami ✨</p>';
    $('#cartTotal').textContent = 'Rp0';
    return;
  }
  box.innerHTML = state.cart.map(it=>`
    <div class="cart-item">
      <img src="${it.img}" alt="${it.name}">
      <div>
        <strong>${it.name}</strong>
        <div>${formatRupiah(it.price)}</div>
      </div>
      <div class="qty">
        <button aria-label="Kurangi" data-q="${it.id}" data-d="-1">−</button>
        <span>${it.qty}</span>
        <button aria-label="Tambah" data-q="${it.id}" data-d="1">+</button>
      </div>
    </div>`).join('');
  box.onclick = (e)=>{
    const id = e.target.dataset.q;
    const d = Number(e.target.dataset.d||0);
    if(id) changeQty(id, d);
  };
  const total = state.cart.reduce((a,c)=>a + c.price*c.qty, 0);
  $('#cartTotal').textContent = formatRupiah(total);
}
// Cart Drawer controls
const drawer = $('#cartDrawer');
function openCart(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); }
function closeCart(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); }
$('#cartBtn').onclick = openCart; $('#closeCart').onclick = closeCart;

// Slider
const slidesEl = $('.slides');
const dotsEl = $('.dots');
function gotoSlide(i){
  const total = slidesEl.children.length;
  state.slideIndex = (i + total) % total;
  slidesEl.style.transform = `translateX(-${state.slideIndex*100}%)`;
  [...dotsEl.children].forEach((d,idx)=>d.classList.toggle('active', idx===state.slideIndex));
}
function buildDots(){
  const total = slidesEl.children.length;
  dotsEl.innerHTML = Array.from({length: total}).map((_,i)=>`<button data-dot="${i}" ${i===0?'class="active"':''} aria-label="Slide ${i+1}"></button>`).join('');
  dotsEl.onclick = (e)=>{ const i = Number(e.target.dataset.dot); if(!Number.isNaN(i)) gotoSlide(i); resetAutoSlide(); };
}
$('.prev').onclick = ()=>{ gotoSlide(state.slideIndex-1); resetAutoSlide(); };
$('.next').onclick = ()=>{ gotoSlide(state.slideIndex+1); resetAutoSlide(); };
function autoSlide(){ state.autoSlideTimer = setInterval(()=>gotoSlide(state.slideIndex+1), 4500); }
function resetAutoSlide(){ clearInterval(state.autoSlideTimer); autoSlide(); }

// Audio controls
const audio = $('#bgm');
const audioToggle = $('#audioToggle');
let audioEnabled = false;
function tryPlay(){
  if(!audioEnabled){
    audio.play().then(()=>{audioEnabled=true; audioToggle.textContent = '🔊';}).catch(()=>{});
  }
}
audioToggle.onclick = ()=>{
  if(audio.paused){ audio.play(); audioToggle.textContent = '🔊'; }
  else{ audio.pause(); audioToggle.textContent = '🔈'; }
};
$('#muteHint').onclick = ()=>audioToggle.click();

// Checkout
$('#checkoutBtn').onclick = ()=>{ showModal(true); };
$('#closeModal').onclick = ()=>{ showModal(false); };
$('#closeCart').onclick = closeCart;
function showModal(show){
  const m = $('#checkoutModal');
  m.classList.toggle('show', show);
  m.setAttribute('aria-hidden', show?'false':'true');
  if(show) closeCart();
}
$('#checkoutForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const order = {items: state.cart, total: state.cart.reduce((a,c)=>a+c.price*c.qty,0), buyer:data, at: new Date().toISOString()};
  localStorage.setItem('wj_last_order', JSON.stringify(order));
  state.cart = [];
  saveCart(); renderCart();
  showModal(false);
  alert('Terima kasih! Pesanan Anda sudah tercatat. Kami akan menghubungi melalui email.');
});

// Init
window.addEventListener('DOMContentLoaded', ()=>{
  $('#year').textContent = new Date().getFullYear();
  renderProducts(); renderCart(); updateCartBadge();
  buildDots(); gotoSlide(0); autoSlide();
  // attempt autoplay after first user interaction
  ['click','touchstart','keydown','scroll'].forEach(ev=>window.addEventListener(ev, tryPlay,{once:true}));
});
