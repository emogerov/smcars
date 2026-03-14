const SITE_LANG = document.documentElement.lang?.toLowerCase().startsWith("en") ? "en" : "bg";
const IS_EN = SITE_LANG === "en";
const RESERVE_PHONE_HREF = "tel:+359894428975";
const RESERVE_EMAIL_HREF = IS_EN
  ? "mailto:smcarsltd3@gmail.com?subject=Reservation%20request"
  : "mailto:smcarsltd3@gmail.com?subject=Запитване%20за%20резервация";
// For manual testing, set e.g. "2026-12-05". Keep null for real current date.
const PRICE_TEST_DATE = null;

const UI_TEXT = {
  reserve: IS_EN ? "Reserve" : "Резервирай",
  deposit: IS_EN ? "Deposit" : "Депозит",
  fuel: IS_EN ? "Fuel" : "Гориво",
  gearbox: IS_EN ? "Gearbox" : "Кутия",
  seats: IS_EN ? "Seats" : "Места",
  selectTypeTitleHtml: IS_EN
    ? 'Choose a <span class="gold-gradient-text">vehicle type</span>'
    : 'Избери тип <span class="gold-gradient-text">превозно средство</span>',
  selectClassTitle: IS_EN ? "Choose a car class" : "Избери клас автомобили",
  carsFallback: IS_EN ? "Cars" : "Автомобили",
  carsSuffix: IS_EN ? "cars" : "автомобили",
  vehiclesFallback: IS_EN ? "Vehicles" : "Превозни средства",
  modalTitle: IS_EN ? "Choose booking method" : "Избери начин за резервация",
  closeLabel: IS_EN ? "Close" : "Затвори",
  callLabel: IS_EN ? "Call now" : "Обади се",
  emailLabel: IS_EN ? "Send email" : "Изпрати имейл",
};

const categories = [
  {
    key: "car",
    label: "Автомобили",
    description: "Леки автомобили под наем",
    image: "assets/cars/vw-polo.jpg",
    icon: "car",
  },
  {
    key: "motor",
    label: "Мотори",
    description: "Двуколесни превозни средства под наем",
    image: "assets/cars/super-vespa.jpg",
    icon: "bike",
  },
  {
    key: "truck",
    label: "Товарни",
    description: "Товарни превозни средства за бизнес нужди",
    image: "assets/cars/fiat-qubo.jpg",
    icon: "truck",
  },
];

const carClasses = [
  {
    key: "low",
    label: "Нисък клас",
    description: "Икономични и практични автомобили",
    image: "assets/cars/toyota-iq.jpg",
  },
  {
    key: "middle",
    label: "Среден клас",
    description: "Баланс между комфорт и цена",
    image: "assets/cars/toyota-avensis.jpg",
  },
  {
    key: "high",
    label: "Висок клас",
    description: "Премиум автомобили за максимален комфорт",
    image: "assets/cars/hyundai-kona.jpg",
  },
];

if (IS_EN) {
  const categoryTranslations = {
    car: { label: "Cars", description: "Passenger vehicles for rent" },
    motor: { label: "Motorcycles", description: "Two-wheel rental vehicles" },
    truck: { label: "Cargo Vans", description: "Commercial vehicles for business needs" },
  };

  const classTranslations = {
    low: { label: "Low class", description: "Economic and practical vehicles" },
    middle: { label: "Middle class", description: "Balance between comfort and price" },
    high: { label: "High class", description: "Premium vehicles for maximum comfort" },
  };

  categories.forEach((category) => {
    const translated = categoryTranslations[category.key];
    if (translated) Object.assign(category, translated);
  });

  carClasses.forEach((carClass) => {
    const translated = classTranslations[carClass.key];
    if (translated) Object.assign(carClass, translated);
  });
}

function resolveAssetPath(path) {
  if (!IS_EN) return path;
  if (path.startsWith("../") || path.startsWith("http")) return path;
  return `../${path}`;
}

const BARREL_ICON_SRC = resolveAssetPath("assets/icons/barrel.svg");

const carClassPolicies = {
  low: { depositText: "Без депозит", seasonalSurcharge: 3 },
  middle: { depositText: "100€", seasonalSurcharge: 5 },
  high: { depositText: "300€", seasonalSurcharge: 10 },
};

const categoryPolicies = {
  truck: { depositText: "100€", seasonalSurcharge: 5 },
};

const vehiclesData = [
  {
    mainCategory: "car",
    carClass: "low",
    brand: "VW",
    model: "UP 1.0i",
    year: 2014,
    fuel: "CNG / Бензин-Метан",
    engine: "1.0i",
    gearbox: "manual",
    gearboxLabel: "Ръчна",
    seats: "3+1",
    image: "assets/cars/vw-polo.jpg",
    prices: [
      { label: "24 часа", value: "60€" },
      { label: "2-6 дена", value: "25€ / ден" },
      { label: "7-14 дена", value: "22€ / ден" },
      { label: "14-30 дена", value: "20€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "low",
    brand: "Toyota",
    model: "Yaris 1.0i",
    year: 2012,
    fuel: "Бензин",
    engine: "1.0i",
    gearbox: "manual",
    gearboxLabel: "Ръчна",
    seats: "4+1",
    image: "assets/cars/toyota-yaris.jpg",
    prices: [
      { label: "24 часа", value: "60€" },
      { label: "2-6 дена", value: "25€ / ден" },
      { label: "7-14 дена", value: "22€ / ден" },
      { label: "14-30 дена", value: "20€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "low",
    brand: "Toyota",
    model: "IQ 1.0i",
    year: 2010,
    fuel: "Бензин",
    engine: "1.0i",
    gearbox: "manual",
    gearboxLabel: "Ръчна",
    seats: "2+1",
    image: "assets/cars/toyota-iq.jpg",
    prices: [
      { label: "24 часа", value: "60€" },
      { label: "2-6 дена", value: "25€ / ден" },
      { label: "7-14 дена", value: "22€ / ден" },
      { label: "14-30 дена", value: "20€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "low",
    brand: "Mini",
    model: "Cooper 1.6i",
    year: 2008,
    fuel: "LPG / Газ-Бензин",
    engine: "1.6i",
    gearbox: "manual",
    gearboxLabel: "Ръчна",
    seats: "3+1",
    image: "assets/cars/mini-cooper.jpg",
    prices: [
      { label: "24 часа", value: "60€" },
      { label: "2-6 дена", value: "25€ / ден" },
      { label: "7-14 дена", value: "22€ / ден" },
      { label: "14-30 дена", value: "20€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "low",
    brand: "Ford",
    model: "Focus 1.6i",
    year: 2009,
    fuel: "LPG / Газ-Бензин",
    engine: "1.6i",
    gearbox: "automatic",
    gearboxLabel: "Автоматик",
    seats: "4+1",
    image: "assets/cars/ford-focus.jpg",
    prices: [
      { label: "24 часа", value: "70€" },
      { label: "2-6 дена", value: "31€ / ден" },
      { label: "7-14 дена", value: "25€ / ден" },
      { label: "14-30 дена", value: "21€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "middle",
    brand: "VW",
    model: "Passat 4Motion 2.0 TDI",
    year: 2007,
    fuel: "Дизел 4x4",
    engine: "2.0 TDI",
    gearbox: "manual",
    gearboxLabel: "Ръчна",
    seats: "4+1",
    image: "assets/cars/vw-passat.jpg",
    prices: [
      { label: "24 часа", value: "78€" },
      { label: "2-6 дена", value: "33€ / ден" },
      { label: "7-14 дена", value: "28€ / ден" },
      { label: "14-30 дена", value: "23€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "middle",
    brand: "Citroen",
    model: "C5 2.2 HDi",
    year: 2009,
    fuel: "Дизел",
    engine: "2.2 HDi",
    gearbox: "manual",
    gearboxLabel: "Ръчна",
    seats: "4+1",
    image: "assets/cars/citroen-c5.jpg",
    prices: [
      { label: "24 часа", value: "78€" },
      { label: "2-6 дена", value: "33€ / ден" },
      { label: "7-14 дена", value: "28€ / ден" },
      { label: "14-30 дена", value: "23€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "middle",
    brand: "Toyota",
    model: "Avensis 2.2D",
    year: 2010,
    fuel: "Дизел",
    engine: "2.2D",
    gearbox: "automatic",
    gearboxLabel: "Автоматик",
    seats: "4+1",
    image: "assets/cars/toyota-avensis.jpg",
    prices: [
      { label: "24 часа", value: "86€" },
      { label: "2-6 дена", value: "41€ / ден" },
      { label: "7-14 дена", value: "36€ / ден" },
      { label: "14-30 дена", value: "31€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "middle",
    brand: "BMW",
    model: "525i",
    year: 2008,
    fuel: "LPG / Газ-Бензин",
    engine: "2.5i",
    gearbox: "automatic",
    gearboxLabel: "Автоматик",
    seats: "4+1",
    image: "assets/cars/bmw.jpg",
    prices: [
      { label: "24 часа", value: "86€" },
      { label: "2-6 дена", value: "41€ / ден" },
      { label: "7-14 дена", value: "36€ / ден" },
      { label: "14-30 дена", value: "31€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "high",
    brand: "Mercedes",
    model: "ML 550 AMG 5.5i V8",
    year: 2009,
    fuel: "LPG / Газ-Бензин",
    engine: "5.5i V8",
    gearbox: "automatic",
    gearboxLabel: "Автоматик",
    seats: "4+1",
    image: "assets/cars/mercedes-ml55.jpg",
    prices: [
      { label: "24 часа", value: "200€" },
      { label: "2-6 дена", value: "100€ / ден" },
      { label: "7-14 дена", value: "80€ / ден" },
      { label: "14-30 дена", value: "60€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "high",
    brand: "Hyundai",
    model: "Kona 1.6 Turbo",
    year: 2022,
    fuel: "Бензин",
    engine: "1.6 Turbo",
    gearbox: "automatic",
    gearboxLabel: "Автоматик",
    seats: "4+1",
    image: "assets/cars/hyundai-kona.jpg",
    prices: [
      { label: "24 часа", value: "200€" },
      { label: "2-6 дена", value: "100€ / ден" },
      { label: "7-14 дена", value: "80€ / ден" },
      { label: "14-30 дена", value: "60€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "truck",
    brand: "Fiat",
    model: "Qubo 1.3 MJT",
    year: 2011,
    fuel: "Дизел",
    engine: "1.3 MJT",
    gearbox: "manual",
    gearboxLabel: "Ръчна",
    seats: "1+1",
    image: "assets/cars/fiat-qubo.jpg",
    prices: [
      { label: "24 часа", value: "78€" },
      { label: "2-6 дена", value: "33€ / ден" },
      { label: "7-14 дена", value: "28€ / ден" },
      { label: "14-30 дена", value: "23€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "truck",
    brand: "Opel",
    model: "Combo 1.6i",
    year: 2012,
    fuel: "CNG / Бензин-Метан",
    engine: "1.6i",
    gearbox: "manual",
    gearboxLabel: "Ръчна",
    seats: "1+1",
    image: "assets/cars/opel-combo.jpg",
    prices: [
      { label: "24 часа", value: "78€" },
      { label: "2-6 дена", value: "33€ / ден" },
      { label: "7-14 дена", value: "28€ / ден" },
      { label: "14-30 дена", value: "23€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "motor",
    brand: "Vespa",
    model: "Super Vespa 300cc GTS",
    year: 2021,
    fuel: "Бензин",
    engine: "300cc",
    gearbox: "automatic",
    gearboxLabel: "Автоматик",
    seats: "1+1",
    image: "assets/cars/super-vespa.jpg",
    prices: [
      { label: "24 часа", value: "50€" },
      { label: "2-6 дена", value: "25€ / ден" },
      { label: "7-14 дена", value: "15€ / ден" },
      { label: "14-30 дена", value: "11€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "motor",
    brand: "MBK",
    model: "125cc",
    year: 2019,
    fuel: "Бензин",
    engine: "125cc",
    gearbox: "automatic",
    gearboxLabel: "Автоматик",
    seats: "1+1",
    image: "assets/cars/mbk.jpg",
    prices: [
      { label: "24 часа", value: "40€" },
      { label: "2-6 дена", value: "20€ / ден" },
      { label: "7-14 дена", value: "10€ / ден" },
      { label: "14-30 дена", value: "8€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
];

[categories, carClasses, vehiclesData].forEach((collection) => {
  collection.forEach((item) => {
    if (item.image) item.image = resolveAssetPath(item.image);
  });
});

let currentMainCategory = null;
let currentCarClass = null;
let currentGearboxFilter = "all";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function localizeFuel(value) {
  if (!IS_EN) return value;
  return value
    .replaceAll("Бензин-Метан", "Petrol-CNG")
    .replaceAll("Газ-Бензин", "LPG/Petrol")
    .replaceAll("Бензин", "Petrol")
    .replaceAll("Дизел", "Diesel")
    .replaceAll("Ръчна", "Manual")
    .replaceAll("Автоматик", "Automatic");
}

function localizeGearbox(gearbox) {
  if (!IS_EN) return gearbox === "automatic" ? "Автоматик" : "Ръчна";
  return gearbox === "automatic" ? "Automatic" : "Manual";
}

function localizePriceLabel(label) {
  if (!IS_EN) return label;
  return label
    .replaceAll("часа", "hours")
    .replaceAll("дена", "days")
    .replaceAll("дни", "days");
}

function localizePriceValue(value) {
  if (!IS_EN) return value;
  return value.replaceAll("/ ден", "/ day").replaceAll("По договаряне", "By arrangement");
}

function localizeDepositText(value) {
  if (!IS_EN) return value;
  return value.replaceAll("Без депозит", "No deposit");
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function getPricingDate() {
  return PRICE_TEST_DATE ? new Date(PRICE_TEST_DATE) : new Date();
}

function isSeasonalPeriod(now = new Date()) {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const inSummer = (month === 6 && day >= 1) || month === 7 || (month === 8 && day <= 30);
  const inWinter = month === 12 || (month === 1 && day <= 8);
  return inSummer || inWinter;
}

function applySeasonalSurcharge(priceValue, surcharge) {
  if (!surcharge || surcharge <= 0) return priceValue;
  if (/по\s+договоряне|by\s+arrangement/i.test(priceValue)) return priceValue;
  const match = priceValue.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return priceValue;
  const original = Number.parseFloat(match[1].replace(",", "."));
  if (Number.isNaN(original)) return priceValue;
  const updated = original + surcharge;
  const normalized = Number.isInteger(updated) ? String(updated) : updated.toFixed(2).replace(".", ",");
  return priceValue.replace(match[1], normalized);
}

function cardSpecBadge(icon, label, value, allowHtml = false) {
  const renderedValue = allowHtml ? value : escapeHtml(value);
  return `<div class="flex items-center gap-2 bg-secondary/50 rounded-md px-3 py-2 transition-colors hover:bg-secondary">
    <span class="text-primary"><i data-lucide="${icon}" class="w-3.5 h-3.5"></i></span>
    <div class="flex flex-col">
      <span class="text-[10px] uppercase tracking-wider text-muted-foreground">${label}</span>
      <span class="text-foreground text-xs font-medium">${renderedValue}</span>
    </div>
  </div>`;
}

function getLuggageVisual(vehicle) {
  const brand = (vehicle.brand || "").toLowerCase();
  const model = (vehicle.model || "").toLowerCase();

  const customByVehicle = [
    { match: () => brand === "toyota" && model.startsWith("yaris"), value: { count: 3, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "ford" && model.startsWith("focus"), value: { count: 3, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "vw" && model.startsWith("passat"), value: { count: 5, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "citroen" && model.startsWith("c5"), value: { count: 5, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "toyota" && model.startsWith("avensis"), value: { count: 5, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "bmw", value: { count: 5, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "hyundai" && model.startsWith("kona"), value: { count: 4, icon: "briefcase", sizeClass: "w-4 h-4", withPlus: true } },
    { match: () => brand === "mercedes" && model.includes("ml"), value: { count: 5, icon: "briefcase", sizeClass: "w-4 h-4", withPlus: true } },
    { match: () => vehicle.mainCategory === "truck" && brand === "opel", value: { count: 6, icon: "barrel", sizeClass: "w-5 h-5" } },
    { match: () => vehicle.mainCategory === "truck" && brand === "fiat", value: { count: 4, icon: "barrel", sizeClass: "w-5 h-5" } },
  ];

  const custom = customByVehicle.find((entry) => entry.match());
  if (custom) return custom.value;

  if (brand === "toyota" && model.startsWith("iq")) {
    return { count: 2, icon: "shopping-bag", sizeClass: "w-3.5 h-3.5" };
  }

  if (vehicle.mainCategory === "truck") return { count: 4, icon: "barrel", sizeClass: "w-5 h-5" };
  if (vehicle.mainCategory === "car" && vehicle.carClass === "low") return { count: 2, icon: "briefcase", sizeClass: "w-4 h-4" };
  if (vehicle.mainCategory === "car" && vehicle.carClass === "middle") return { count: 3, icon: "briefcase", sizeClass: "w-4 h-4" };
  if (vehicle.mainCategory === "car" && vehicle.carClass === "high") return { count: 4, icon: "briefcase", sizeClass: "w-4 h-4" };
  return { count: 3, icon: "briefcase", sizeClass: "w-4 h-4" };
}

function renderLuggageIcons(vehicle) {
  const { count, icon, sizeClass, withPlus } = getLuggageVisual(vehicle);
  const plusHtml = withPlus ? '<i data-lucide="plus" class="w-3.5 h-3.5 text-primary"></i>' : "";
  const iconHtml =
    icon === "barrel"
      ? `<img src="${BARREL_ICON_SRC}" alt="" class="${sizeClass}" />`
      : `<i data-lucide="${icon}" class="${sizeClass} text-primary"></i>`;
  return `<div class="flex items-center justify-center gap-2 bg-secondary/50 rounded-md px-3 py-2">${Array.from(
    { length: count },
    () => iconHtml,
  ).join("")}${plusHtml}</div>`;
}

function renderCategoryCard(item, index, dataKeyName) {
  return `<button class="group animate-fade-up opacity-0 text-left rounded-lg overflow-hidden card-glow bg-card h-full flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl" style="animation-delay:${0.1 * index}s;animation-fill-mode:forwards" type="button" data-${dataKeyName}="${item.key}">
    <div class="relative h-44 md:h-52 overflow-hidden car-card-media">
      <img src="${item.image}" alt="${escapeHtml(item.label)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 car-card-image" />
      <div class="absolute car-card-overlay bg-gradient-to-t from-card via-card/30 to-transparent"></div>
      <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between">
        <h3 class="font-heading text-2xl font-bold text-foreground drop-shadow-lg">
          ${escapeHtml(item.label)}
        </h3>
        ${item.icon ? `<span class="w-10 h-10 rounded-md bg-primary/20 border border-primary/30 backdrop-blur-sm flex items-center justify-center text-primary"><i data-lucide="${item.icon}" class="w-5 h-5"></i></span>` : ""}
      </div>
    </div>
    <div class="p-5">
      <p class="text-muted-foreground text-sm">${escapeHtml(item.description)}</p>
    </div>
  </button>`;
}

function renderPriceList(vehicle) {
  const policy =
    vehicle.mainCategory === "car"
      ? carClassPolicies[vehicle.carClass]
      : categoryPolicies[vehicle.mainCategory] || null;
  const surcharge = policy && isSeasonalPeriod(getPricingDate()) ? policy.seasonalSurcharge : 0;

  const rows = vehicle.prices
    .map(
      (entry) => `<div class="flex items-center justify-between border-b border-border pb-2 text-sm">
        <span class="text-muted-foreground">${escapeHtml(localizePriceLabel(entry.label))}</span>
        <span class="text-foreground font-medium">${escapeHtml(localizePriceValue(applySeasonalSurcharge(entry.value, surcharge)))}</span>
      </div>`,
    )
    .join("");

  if (!policy) return rows;
  return `${rows}
    <div class="flex items-center justify-between pb-2 text-sm">
      <span class="text-muted-foreground">${UI_TEXT.deposit}</span>
      <span class="text-primary font-semibold">${escapeHtml(localizeDepositText(policy.depositText))}</span>
    </div>`;
}

function renderVehicleCard(vehicle, index) {
  const luggageIcons = renderLuggageIcons(vehicle);
  const specsHtml =
    vehicle.mainCategory === "motor"
      ? ""
      : `<div class="grid grid-cols-2 gap-3 mb-4">
          ${cardSpecBadge("fuel", UI_TEXT.fuel, localizeFuel(vehicle.fuel))}
          ${cardSpecBadge("gauge", UI_TEXT.gearbox, localizeGearbox(vehicle.gearbox))}
          ${luggageIcons}
          ${cardSpecBadge("car", UI_TEXT.seats, vehicle.seats)}
        </div>`;

  return `<div class="animate-fade-up opacity-0" style="animation-delay:${0.08 * index}s;animation-fill-mode:forwards">
    <div class="group rounded-lg overflow-hidden card-glow bg-card h-full flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div class="relative h-44 md:h-52 overflow-hidden car-card-media">
        <img src="${vehicle.image}" alt="${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 car-card-image" />
        <div class="absolute car-card-overlay bg-gradient-to-t from-card via-card/30 to-transparent"></div>
        <div class="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <h3 class="font-heading text-xl font-bold text-foreground drop-shadow-lg">
            ${escapeHtml(vehicle.brand)} <span class="gold-gradient-text">${escapeHtml(vehicle.model)}</span>
          </h3>
        </div>
      </div>

      <div class="p-5 flex-1 flex flex-col">
        ${specsHtml}

        <div class="space-y-3 mb-4">
          ${renderPriceList(vehicle)}
        </div>

        <div class="mt-auto pt-4 border-t border-border flex justify-center">
          <a href="#" data-open-reserve-modal="true" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-wide hover:brightness-110 transition-all">
            <i data-lucide="calendar" class="w-4 h-4"></i>
            ${UI_TEXT.reserve}
          </a>
        </div>
      </div>
    </div>
  </div>`;
}

function setTheme(theme) {
  const html = document.documentElement;
  const dark = theme === "dark";
  html.classList.toggle("dark", dark);
  localStorage.setItem("theme", theme);
  document.querySelectorAll(".theme-sun").forEach((sun) => sun.classList.toggle("hidden", !dark));
  document.querySelectorAll(".theme-moon").forEach((moon) => moon.classList.toggle("hidden", dark));
}

function initThemeToggle() {
  const buttons = Array.from(document.querySelectorAll("[data-theme-toggle]"));
  if (!buttons.length) return;
  const savedTheme = localStorage.getItem("theme");
  const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  setTheme(initialTheme);
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
      setTheme(nextTheme);
    });
  });
}

function initFooterYear() {
  const year = document.getElementById("footer-year");
  if (year) year.textContent = String(new Date().getFullYear());
}

function showMainCategories() {
  const title = document.getElementById("fleet-title");
  const categoryView = document.getElementById("category-view");
  const subcategoryView = document.getElementById("car-subcategory-view");
  const vehiclesView = document.getElementById("vehicles-view");
  if (!title || !categoryView || !subcategoryView || !vehiclesView) return;

  currentMainCategory = null;
  currentCarClass = null;
  currentGearboxFilter = "all";

  title.innerHTML = UI_TEXT.selectTypeTitleHtml;
  categoryView.classList.remove("hidden");
  subcategoryView.classList.add("hidden");
  vehiclesView.classList.add("hidden");
  refreshIcons();
}

function showCarSubcategories() {
  const title = document.getElementById("fleet-title");
  const categoryView = document.getElementById("category-view");
  const subcategoryView = document.getElementById("car-subcategory-view");
  const vehiclesView = document.getElementById("vehicles-view");
  const grid = document.getElementById("car-subcategory-grid");
  if (!title || !categoryView || !subcategoryView || !vehiclesView || !grid) return;

  title.textContent = UI_TEXT.selectClassTitle;
  categoryView.classList.add("hidden");
  subcategoryView.classList.remove("hidden");
  vehiclesView.classList.add("hidden");
  grid.innerHTML = carClasses.map((item, index) => renderCategoryCard(item, index, "car-class-key")).join("");
  refreshIcons();
}

function updateGearboxFilterButtons() {
  document.querySelectorAll(".gearbox-filter-btn").forEach((button) => {
    const isActive = button.getAttribute("data-gearbox-filter") === currentGearboxFilter;
    button.classList.toggle("bg-primary", isActive);
    button.classList.toggle("text-primary-foreground", isActive);
    button.classList.toggle("bg-secondary", !isActive);
    button.classList.toggle("text-secondary-foreground", !isActive);
  });
}

function showVehicles() {
  const title = document.getElementById("fleet-title");
  const categoryView = document.getElementById("category-view");
  const subcategoryView = document.getElementById("car-subcategory-view");
  const vehiclesView = document.getElementById("vehicles-view");
  const fleetGrid = document.getElementById("fleet-grid");
  const emptyState = document.getElementById("empty-state");
  const filterWrap = document.getElementById("gearbox-filter-wrap");
  if (!title || !categoryView || !subcategoryView || !vehiclesView || !fleetGrid || !emptyState || !filterWrap) return;

  categoryView.classList.add("hidden");
  subcategoryView.classList.add("hidden");
  vehiclesView.classList.remove("hidden");

  if (currentMainCategory === "car") {
    const classLabel = carClasses.find((item) => item.key === currentCarClass)?.label ?? UI_TEXT.carsFallback;
    title.textContent = `${classLabel} ${UI_TEXT.carsSuffix}`;
    filterWrap.classList.remove("hidden");
  } else {
    const categoryLabel = categories.find((item) => item.key === currentMainCategory)?.label ?? UI_TEXT.vehiclesFallback;
    title.textContent = categoryLabel;
    filterWrap.classList.add("hidden");
  }

  let items = vehiclesData.filter((vehicle) => vehicle.mainCategory === currentMainCategory);
  if (currentMainCategory === "car") {
    items = items.filter((vehicle) => vehicle.carClass === currentCarClass);
    if (currentGearboxFilter !== "all") {
      items = items.filter((vehicle) => vehicle.gearbox === currentGearboxFilter);
    }
  }

  if (items.length === 0) {
    fleetGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    fleetGrid.innerHTML = items.map(renderVehicleCard).join("");
  }

  updateGearboxFilterButtons();
  refreshIcons();
}

function initCategoryHandlers() {
  const categoryGrid = document.getElementById("category-grid");
  const subcategoryGrid = document.getElementById("car-subcategory-grid");
  const backFromSubcategories = document.getElementById("back-from-subcategories");
  const backToCategories = document.getElementById("back-to-categories");
  if (!categoryGrid || !subcategoryGrid || !backFromSubcategories || !backToCategories) return;

  categoryGrid.innerHTML = categories.map((item, index) => renderCategoryCard(item, index, "category-key")).join("");

  categoryGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-category-key]");
    if (!trigger) return;
    currentMainCategory = trigger.getAttribute("data-category-key");
    currentGearboxFilter = "all";
    if (currentMainCategory === "car") {
      showCarSubcategories();
    } else {
      currentCarClass = null;
      showVehicles();
    }
  });

  subcategoryGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-car-class-key]");
    if (!trigger) return;
    currentCarClass = trigger.getAttribute("data-car-class-key");
    currentGearboxFilter = "all";
    showVehicles();
  });

  backFromSubcategories.addEventListener("click", showMainCategories);
  backToCategories.addEventListener("click", () => {
    if (currentMainCategory === "car") {
      showCarSubcategories();
    } else {
      showMainCategories();
    }
  });
}

function initGearboxFilters() {
  const filterWrap = document.getElementById("gearbox-filter-wrap");
  if (!filterWrap) return;
  filterWrap.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gearbox-filter]");
    if (!button) return;
    currentGearboxFilter = button.getAttribute("data-gearbox-filter");
    showVehicles();
  });
}

function initMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-menu-overlay");
  const toggle = document.getElementById("mobile-menu-toggle");
  if (!menu || !overlay || !toggle) return;

  const openMenu = () => {
    overlay.classList.remove("hidden");
    menu.classList.remove("hidden");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    refreshIcons();
  };

  const closeMenu = () => {
    overlay.classList.add("hidden");
    menu.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (menu.classList.contains("hidden")) openMenu();
    else closeMenu();
  });

  overlay.addEventListener("click", closeMenu);

  menu.addEventListener("click", (event) => {
    if (event.target.closest("[data-mobile-menu-close='true']")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.classList.contains("hidden")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768 && !menu.classList.contains("hidden")) {
      closeMenu();
    }
  });
}

function initReserveModal() {
  if (document.getElementById("reserve-modal")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="reserve-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-6">
      <button type="button" data-close-reserve-modal="true" class="absolute inset-0 bg-background/80 backdrop-blur-xl" aria-label="${UI_TEXT.closeLabel}"></button>
      <div class="relative w-full rounded-lg border border-border bg-card p-6 card-glow" style="max-width:420px;">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-heading text-xl font-bold text-foreground">${UI_TEXT.modalTitle}</h3>
          <button type="button" data-close-reserve-modal="true" class="w-9 h-9 rounded-md flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-accent transition-colors" aria-label="${UI_TEXT.closeLabel}">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <a href="${RESERVE_PHONE_HREF}" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-wide hover:brightness-110 transition-all">
            <i data-lucide="phone" class="w-4 h-4"></i>
            ${UI_TEXT.callLabel}
          </a>
          <a href="${RESERVE_EMAIL_HREF}" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md border border-border bg-secondary text-secondary-foreground font-heading font-semibold text-sm tracking-wide hover:bg-accent transition-all">
            <i data-lucide="mail" class="w-4 h-4"></i>
            ${UI_TEXT.emailLabel}
          </a>
        </div>
      </div>
    </div>`,
  );

  const modal = document.getElementById("reserve-modal");
  if (!modal) return;

  const openModal = () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
    refreshIcons();
  };

  const closeModal = () => {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  };

  document.addEventListener("click", (event) => {
    const openTrigger = event.target.closest("[data-open-reserve-modal='true']");
    if (openTrigger) {
      event.preventDefault();
      openModal();
      return;
    }

    const closeTrigger = event.target.closest("[data-close-reserve-modal='true']");
    if (closeTrigger) {
      event.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function initTermsModal() {
  const modal = document.getElementById("terms-modal");
  if (!modal) return;

  const openModal = () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
    refreshIcons();
  };

  const closeModal = () => {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  };

  document.addEventListener("click", (event) => {
    const openTrigger = event.target.closest("[data-open-terms-modal='true']");
    if (openTrigger) {
      event.preventDefault();
      openModal();
      return;
    }

    const closeTrigger = event.target.closest("[data-close-terms-modal='true']");
    if (closeTrigger) {
      event.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function init() {
  initThemeToggle();
  initFooterYear();
  initCategoryHandlers();
  initGearboxFilters();
  initMobileMenu();
  initReserveModal();
  initTermsModal();
  showMainCategories();
}

init();
