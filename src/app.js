import { bikes } from './bikes.js';

const storageKey = 'spoke-rentals-v1';
const main = document.querySelector('main');
const header = document.querySelector('header');
const search = { name: '', type: '' };
const types = [...new Set(bikes.map(bike => bike.type))];
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const money = amount => currency.format(amount);
const rentals = loadRentals();

function loadRentals() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return new Map(bikes.filter(bike => {
      const hours = saved?.[bike.id];
      return !bike.maintenance && Number.isInteger(hours) && hours >= 1 && hours <= 12;
    }).map(bike => [bike.id, saved[bike.id]]));
  } catch {
    return new Map();
  }
}

function saveRentals() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(rentals)));
  } catch {
    // Navigation still preserves rentals when browser storage is unavailable.
  }
}

const bikeIcon = '<span class="bike-icon" aria-hidden="true">🚲</span>';
const detailLink = bike => '/bikes/' + bike.id;

function nav() {
  const path = location.pathname;
  const current = (url, active) => `href="${url}"${active ? ' aria-current="page"' : ''}`;
  header.innerHTML = `<div class="wrap bar">
    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">↗</span> spoke<span>.</span></a>
    <nav aria-label="Main navigation">
      <a ${current('/', path === '/')}>Home</a>
      <a ${current('/bikes', path === '/bikes' || path.startsWith('/bikes/'))}>Bike List</a>
      <a class="nav-rented" ${current('/rented', path === '/rented')}>Rented Bikes <span class="count" aria-live="polite">${rentals.size}</span></a>
    </nav>
  </div>`;
}

function status(bike) {
  if (bike.maintenance) return '<span class="status maintenance">Under maintenance</span>';
  if (rentals.has(bike.id)) return '<span class="status rented">Rented</span>';
  return '<span class="status available">Available</span>';
}

function action(bike) {
  if (bike.maintenance) return '<button class="button" disabled>Unavailable</button>';
  const rented = rentals.has(bike.id);
  return `<button class="button ${rented ? 'secondary' : ''}" data-bike="${bike.id}" aria-label="${rented ? 'Return' : 'Rent'} ${bike.name}">${rented ? 'Return' : 'Rent'}</button>`;
}

function card(bike) {
  return `<article class="card">
    <div class="bike-art ${bike.tone}">${bikeIcon}${status(bike)}</div>
    <div class="card-body">
      <span class="type">${bike.type}</span>
      <h2><a href="${detailLink(bike)}">${bike.name}</a></h2>
      <div class="card-actions"><span><strong>${money(bike.rate)}</strong> / hr</span>${action(bike)}</div>
    </div>
  </article>`;
}

function home() {
  return `<div class="wrap">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Hourly bicycle rentals</p>
        <h1>Go a little<br>further<span>.</span></h1>
        <p>Pick a bike, choose your hours, and get out for a ride.</p>
        <a class="button lime" href="/bikes">Browse bikes <span aria-hidden="true">↗</span></a>
      </div>
      <div class="hero-art" aria-hidden="true"></div>
    </section>
    <section class="featured">
      <div class="section-heading"><h2>Explore the fleet</h2><a href="/bikes">View all bikes →</a></div>
      <div class="grid">${bikes.slice(0, 3).map(card).join('')}</div>
    </section>
  </div>`;
}

function renderMatches() {
  const name = search.name.trim().toLowerCase();
  const matches = bikes.filter(bike => bike.name.toLowerCase().includes(name) && (!search.type || bike.type === search.type));
  document.querySelector('#matches').innerHTML = matches.length ? matches.map(card).join('') : '<p class="empty">No bikes match your search.</p>';
  document.querySelector('#results').textContent = `${matches.length} ${matches.length === 1 ? 'bike' : 'bikes'}`;
}

function details(bike, hours) {
  return `<div class="wrap page">
    <a class="back" href="/bikes">← Bike List</a>
    <div class="detail">
      <div class="bike-art detail-art ${bike.tone}">${bikeIcon}${status(bike)}</div>
      <section class="detail-copy">
        <p class="type">${bike.type} bike</p>
        <h1>${bike.name}</h1>
        <p>${bike.description}</p>
        <p><strong>${money(bike.rate)}</strong> / hr</p>
        <label for="hours">Rental duration</label>
        <select id="hours">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i + 1 === hours ? 'selected' : ''}>${i + 1} ${i ? 'hours' : 'hour'}</option>`).join('')}</select>
        <div class="estimate"><span>Estimated rental price</span><output id="estimate" for="hours">${money(bike.rate * hours)}</output></div>
        ${action(bike)}
      </section>
    </div>
  </div>`;
}

function rentedPage() {
  const active = bikes.filter(bike => rentals.has(bike.id));
  const total = active.reduce((sum, bike) => sum + bike.rate, 0);
  return `<div class="wrap page">
    <h1>Rented Bikes</h1>
    <div class="rental-total"><span>Combined hourly rate</span><strong>${money(total)} / hr</strong></div>
    ${active.length ? `<ul class="rental-list">${active.map(bike => `<li>
      <div><a href="${detailLink(bike)}">${bike.name}</a><p>${rentals.get(bike.id)} h booked · ${money(bike.rate)} / hr</p></div>
      ${action(bike)}
    </li>`).join('')}</ul>` : '<div class="empty"><p>You have no active rentals.</p><a class="button" href="/bikes">Browse bikes</a></div>'}
  </div>`;
}

function render(hours) {
  nav();
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const bike = bikes.find(bike => detailLink(bike) === path);
  if (path === '/') {
    document.title = 'Bike rentals | Spoke';
    main.innerHTML = home();
  } else if (path === '/bikes') {
    document.title = 'Bike List | Spoke';
    main.innerHTML = `<div class="wrap page">
      <h1>Bike List</h1>
      <div class="filters">
        <label>Search by name<input id="search" type="search" placeholder="e.g. City Cruiser"></label>
        <label>Bike type<select id="type"><option value="">All types</option>${types.map(type => `<option>${type}</option>`).join('')}</select></label>
      </div>
      <p id="results" aria-live="polite"></p>
      <div id="matches" class="grid"></div>
    </div>`;
    const name = document.querySelector('#search');
    const type = document.querySelector('#type');
    name.value = search.name;
    type.value = search.type;
    name.addEventListener('input', () => {
      search.name = name.value;
      renderMatches();
    });
    type.addEventListener('change', () => {
      search.type = type.value;
      renderMatches();
    });
    renderMatches();
  } else if (bike) {
    document.title = bike.name + ' | Spoke';
    main.innerHTML = details(bike, hours ?? rentals.get(bike.id) ?? 1);
    document.querySelector('#hours').addEventListener('change', event => {
      document.querySelector('#estimate').value = money(bike.rate * Number(event.target.value));
    });
  } else if (path === '/rented') {
    document.title = 'Rented Bikes | Spoke';
    main.innerHTML = rentedPage();
  } else {
    document.title = 'Page unavailable | Spoke';
    main.innerHTML = '<div class="wrap page"><h1>Page unavailable</h1><a class="button" href="/bikes">Browse bikes</a></div>';
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('button[data-bike]');
  if (button) {
    const bike = bikes.find(bike => bike.id === button.dataset.bike);
    if (!bike || bike.maintenance) return;
    const hours = Number(document.querySelector('#hours')?.value ?? 1);
    if (rentals.has(bike.id)) rentals.delete(bike.id);
    else rentals.set(bike.id, hours);
    saveRentals();
    render(hours);
    (document.querySelector(`button[data-bike="${bike.id}"]`) ?? main).focus({ preventScroll: true });
    return;
  }

  const link = event.target.closest('a[href^="/"]');
  if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (link.pathname === location.pathname) return;
  history.pushState(null, '', link.pathname);
  render();
  main.focus({ preventScroll: true });
  window.scrollTo(0, 0);
});

window.addEventListener('popstate', () => render());
render();
