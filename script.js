const RESERVE_PHONE_HREF = "tel:+359894428975";

const categories = [
  {
    key: "car",
    label: "Автомобили",
    description: "Леки коли за градско и извънградско пътуване",
    image: "assets/cars/bmw-530.png",
    icon: "car",
  },
  {
    key: "motor",
    label: "Мотори",
    description: "Двуколесни превозни средства под наем",
    image: "assets/hero-car.jpg",
    icon: "bike",
  },
  {
    key: "truck",
    label: "Товарни",
    description: "Товарни превозни средства за бизнес нужди",
    image: "assets/hero-car.jpg",
    icon: "truck",
  },
];

const vehiclesData = [
  {
    category: "car",
    brand: "BMW",
    model: "530 xDrive",
    year: 2008,
    fuelConsumption: "9.0L/100km",
    range: "Неограничен",
    transmission: "Автоматик",
    seats: 5,
    pricePerDay: "€55",
    image: "assets/cars/bmw-530.png",
  },
  {
    category: "car",
    brand: "Mercedes-Benz",
    model: "ML 55 AMG",
    year: 2005,
    fuelConsumption: "14.0L/100km",
    range: "Неограничен",
    transmission: "Автоматик",
    seats: 5,
    pricePerDay: "€70",
    image: "assets/cars/mercedes-ml55.png",
  },
  {
    category: "car",
    brand: "Hyundai",
    model: "Kona",
    year: 2022,
    fuelConsumption: "6.2L/100km",
    range: "Неограничен",
    transmission: "Автоматик",
    seats: 5,
    pricePerDay: "€45",
    image: "assets/cars/hyundai-kona.png",
  },
  {
    category: "car",
    brand: "VW",
    model: "Passat 4Motion",
    year: 2007,
    fuelConsumption: "7.5L/100km",
    range: "Неограничен",
    transmission: "Автоматик",
    seats: 5,
    pricePerDay: "€40",
    image: "assets/cars/vw-passat.png",
  },
  {
    category: "car",
    brand: "Mini",
    model: "Cooper",
    year: 2006,
    fuelConsumption: "6.5L/100km",
    range: "Неограничен",
    transmission: "Ръчна",
    seats: 4,
    pricePerDay: "€35",
    image: "assets/cars/mini-cooper.png",
  },
  {
    category: "car",
    brand: "Fiat",
    model: "Croma",
    year: 2009,
    fuelConsumption: "7.0L/100km",
    range: "Неограничен",
    transmission: "Ръчна",
    seats: 5,
    pricePerDay: "€30",
    image: "assets/cars/fiat-croma.png",
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cardSpecBadge(icon, label, value) {
  return `<div class="flex items-center gap-2 bg-secondary/50 rounded-md px-3 py-2 transition-colors hover:bg-secondary">
    <span class="text-primary"><i data-lucide="${icon}" class="w-3.5 h-3.5"></i></span>
    <div class="flex flex-col">
      <span class="text-[10px] uppercase tracking-wider text-muted-foreground">${label}</span>
      <span class="text-foreground text-xs font-medium">${escapeHtml(value)}</span>
    </div>
  </div>`;
}

function renderCategoryCard(category, index) {
  return `<button class="group animate-fade-up opacity-0 text-left rounded-lg overflow-hidden card-glow bg-card h-full flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl" style="animation-delay:${0.1 * index}s;animation-fill-mode:forwards" type="button" data-category-key="${category.key}">
    <div class="relative h-48 overflow-hidden car-card-media">
      <img src="${category.image}" alt="${escapeHtml(category.label)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 car-card-image" />
      <div class="absolute car-card-overlay bg-gradient-to-t from-card via-card/30 to-transparent"></div>
      <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between">
        <h3 class="font-heading text-2xl font-bold text-foreground drop-shadow-lg">
          ${escapeHtml(category.label)}
        </h3>
        <span class="w-10 h-10 rounded-md bg-primary/20 border border-primary/30 backdrop-blur-sm flex items-center justify-center text-primary">
          <i data-lucide="${category.icon}" class="w-5 h-5"></i>
        </span>
      </div>
    </div>
    <div class="p-5">
      <p class="text-muted-foreground text-sm mb-4">${escapeHtml(category.description)}</p>
      <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-heading font-semibold">
        Избери
        <i data-lucide="chevron-right" class="w-4 h-4"></i>
      </span>
    </div>
  </button>`;
}

function renderVehicleCard(vehicle, index) {
  return `<div class="animate-fade-up opacity-0" style="animation-delay:${0.08 * index}s;animation-fill-mode:forwards">
    <div class="group rounded-lg overflow-hidden card-glow bg-card h-full flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div class="relative h-48 overflow-hidden car-card-media">
        <img src="${vehicle.image}" alt="${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 car-card-image" />
        <div class="absolute car-card-overlay bg-gradient-to-t from-card via-card/30 to-transparent"></div>
        <div class="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <h3 class="font-heading text-xl font-bold text-foreground drop-shadow-lg">
            ${escapeHtml(vehicle.brand)} <span class="gold-gradient-text">${escapeHtml(vehicle.model)}</span>
          </h3>
          <span class="text-xs font-medium bg-primary/20 text-primary backdrop-blur-sm px-2 py-1 rounded-sm border border-primary/30">${vehicle.year}</span>
        </div>
      </div>

      <div class="p-5 flex-1 flex flex-col">
        <div class="grid grid-cols-2 gap-3 mb-4">
          ${cardSpecBadge("fuel", "Гориво", vehicle.fuelConsumption)}
          ${cardSpecBadge("gauge", "Кутия", vehicle.transmission)}
          ${cardSpecBadge("map-pin", "Обхват", vehicle.range)}
          ${cardSpecBadge("car", "Места", vehicle.seats)}
        </div>

        <div class="mt-auto flex items-center justify-between pt-4 border-t border-border">
          <p class="text-primary font-heading text-2xl font-bold">
            ${escapeHtml(vehicle.pricePerDay)}<span class="text-muted-foreground text-sm font-body font-normal">/ден</span>
          </p>
          <a href="${RESERVE_PHONE_HREF}" class="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-wide hover:brightness-110 transition-all">
            <i data-lucide="phone" class="w-4 h-4"></i>
            Резервирай
          </a>
        </div>
      </div>
    </div>
  </div>`;
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function setTheme(theme) {
  const html = document.documentElement;
  const sun = document.querySelector(".theme-sun");
  const moon = document.querySelector(".theme-moon");
  const dark = theme === "dark";
  html.classList.toggle("dark", dark);
  localStorage.setItem("theme", theme);
  if (sun && moon) {
    sun.classList.toggle("hidden", !dark);
    moon.classList.toggle("hidden", dark);
  }
}

function initThemeToggle() {
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  const savedTheme = localStorage.getItem("theme");
  const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  setTheme(initialTheme);

  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    setTheme(nextTheme);
  });
}

function initFooterYear() {
  const year = document.getElementById("footer-year");
  if (!year) return;
  year.textContent = String(new Date().getFullYear());
}

function showCategorySelection() {
  const categoryView = document.getElementById("category-view");
  const vehiclesView = document.getElementById("vehicles-view");
  const fleetTitle = document.getElementById("fleet-title");
  if (!categoryView || !vehiclesView || !fleetTitle) return;
  categoryView.classList.remove("hidden");
  vehiclesView.classList.add("hidden");
  fleetTitle.innerHTML = 'Избери тип <span class="gold-gradient-text">превозно средство</span>';
}

function showVehiclesForCategory(categoryKey) {
  const categoryView = document.getElementById("category-view");
  const vehiclesView = document.getElementById("vehicles-view");
  const fleetGrid = document.getElementById("fleet-grid");
  const emptyState = document.getElementById("empty-state");
  const fleetTitle = document.getElementById("fleet-title");
  const category = categories.find((item) => item.key === categoryKey);
  if (!categoryView || !vehiclesView || !fleetGrid || !emptyState || !fleetTitle || !category) return;

  categoryView.classList.add("hidden");
  vehiclesView.classList.remove("hidden");
  fleetTitle.innerHTML = `${category.label}`;

  const items = vehiclesData.filter((vehicle) => vehicle.category === categoryKey);
  if (items.length === 0) {
    fleetGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    fleetGrid.innerHTML = items.map(renderVehicleCard).join("");
  }
  refreshIcons();
}

function initFleetCategories() {
  const categoryGrid = document.getElementById("category-grid");
  const backButton = document.getElementById("back-to-categories");
  if (!categoryGrid || !backButton) return;

  categoryGrid.innerHTML = categories.map(renderCategoryCard).join("");

  categoryGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-category-key]");
    if (!trigger) return;
    showVehiclesForCategory(trigger.getAttribute("data-category-key"));
  });

  backButton.addEventListener("click", showCategorySelection);
}

function init() {
  initThemeToggle();
  initFooterYear();
  initFleetCategories();
  showCategorySelection();
  refreshIcons();
}

init();

