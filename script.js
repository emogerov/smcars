const SITE_LANG = document.documentElement.lang?.toLowerCase().startsWith("en") ? "en" : "bg";
const IS_EN = SITE_LANG === "en";
const RESERVE_PHONE_HREF = "tel:+359894428975";
const RESERVE_EMAIL_HREF = IS_EN
  ? "mailto:smcarsltd3@gmail.com?subject=Reservation%20request"
  : "mailto:smcarsltd3@gmail.com?subject=Запитване%20за%20резервация";
// For manual testing, set e.g. "2026-12-05". Keep null for real current date.
const PRICE_TEST_DATE = null;
const STRIPE_CHECKOUT_PLACEHOLDER = "#stripe-checkout";

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
  bookingTitle: IS_EN ? "Choose dates" : "Избери дати",
  bookingVehicle: IS_EN ? "Vehicle" : "Превозно средство",
  bookingVehiclePrompt: IS_EN ? "Choose vehicle" : "Избери превозно средство",
  bookingFrom: IS_EN ? "From" : "От",
  bookingTo: IS_EN ? "To" : "До",
  bookingBusyToday: IS_EN ? "This vehicle is reserved for today." : "Превозното средство е резервирано за днес",
  bookingAvailable: IS_EN ? "Selected dates are available." : "Избраните дати са свободни.",
  bookingAvailableSingle: IS_EN ? "Selected date is available." : "Избраната дата е свободна.",
  bookingUnavailable: IS_EN ? "Selected dates are not available." : "Избраните дати не са свободни.",
  bookingRangesTitle: IS_EN ? "Reserved periods" : "Резервирани периоди",
  bookingNoRanges: IS_EN ? "No booked dates yet." : "Все още няма заети дати.",
  bookingEmailLabel: IS_EN ? "Send booking request" : "Изпрати запитване",
    bookingPaymentLabel: IS_EN ? "Continue to payment" : "Към плащане",
  bookingSelectDates: IS_EN ? "Select dates to continue." : "Избери дати, за да продължиш.",
  bookingSelectVehicleDates: IS_EN ? "Choose vehicle and dates." : "Избери превозно средство и дати.",
    bookingOr: IS_EN ? "or" : "или",
    bookingTotal: IS_EN ? "Total price" : "Обща цена",
    bookingTotalPending: IS_EN ? "Select vehicle and date(s)" : "Избери превозно средство и дата/дати",
  bookingTotalPendingDatesOnly: IS_EN ? "Select date(s)" : "Избери дата/дати",
  bookingClearDates: IS_EN ? "Clear dates" : "Изчисти датите",
  bookingPrevMonth: IS_EN ? "Previous month" : "Предишен месец",
  bookingNextMonth: IS_EN ? "Next month" : "Следващ месец",
  bookingSelectedRange: IS_EN ? "Selected period" : "Избран период",
  bookingStartPrompt: IS_EN ? "Choose start date" : "Избери начална дата",
  bookingEndPrompt: IS_EN ? "Choose end date" : "Избери крайна дата",
  bookingUnavailableRange: IS_EN ? "This range crosses booked dates." : "Този период пресича заети дати.",
  weekdays: IS_EN ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
  months: IS_EN
    ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    : ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"],
};

let publicBookings = [];
let activeReserveVehicleId = null;
let reserveSelectionStart = "";
let reserveSelectionEnd = "";
let reserveCalendarMonth = "";

function slugifyValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeVehicleRecord(vehicle, index = 0) {
  return {
    ...vehicle,
    id: vehicle.id || slugifyValue(`${vehicle.mainCategory || "vehicle"}-${vehicle.name || ""}-${vehicle.brand || ""}-${vehicle.model || ""}`),
  };
}

let categories = [
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

let carClasses = [
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

let carClassPolicies = {
  low: { depositText: "Без депозит", seasonalSurcharge: 3 },
  middle: { depositText: "100€", seasonalSurcharge: 5 },
  high: { depositText: "300€", seasonalSurcharge: 10 },
};

let categoryPolicies = {
  truck: { depositText: "100€", seasonalSurcharge: 5 },
};

let seasonalRules = [
  { key: "low", label: "Нисък клас", surchargePerDay: 3, periods: ["01-06 -> 31-08", "01-12 -> 08-01"] },
  { key: "middle", label: "Среден клас", surchargePerDay: 5, periods: ["01-06 -> 31-08", "01-12 -> 08-01"] },
  { key: "high", label: "Висок клас", surchargePerDay: 10, periods: ["01-06 -> 31-08", "01-12 -> 08-01"] },
  { key: "truck", label: "Товарни", surchargePerDay: 5, periods: ["01-06 -> 31-08", "01-12 -> 08-01"] },
];

let vehiclesData = [
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
      { label: "24 часа", value: "50€" },
      { label: "2-6 дена", value: "21€ / ден" },
      { label: "7-14 дена", value: "18€ / ден" },
      { label: "14-30 дена", value: "16€ / ден" },
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
      { label: "24 часа", value: "50€" },
      { label: "2-6 дена", value: "21€ / ден" },
      { label: "7-14 дена", value: "18€ / ден" },
      { label: "14-30 дена", value: "16€ / ден" },
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
      { label: "24 часа", value: "50€" },
      { label: "2-6 дена", value: "21€ / ден" },
      { label: "7-14 дена", value: "18€ / ден" },
      { label: "14-30 дена", value: "16€ / ден" },
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
      { label: "24 часа", value: "50€" },
      { label: "2-6 дена", value: "21€ / ден" },
      { label: "7-14 дена", value: "18€ / ден" },
      { label: "14-30 дена", value: "16€ / ден" },
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
      { label: "24 часа", value: "60€" },
      { label: "2-6 дена", value: "25€ / ден" },
      { label: "7-14 дена", value: "21€ / ден" },
      { label: "14-30 дена", value: "17€ / ден" },
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
      { label: "24 часа", value: "68€" },
      { label: "2-6 дена", value: "29€ / ден" },
      { label: "7-14 дена", value: "24€ / ден" },
      { label: "14-30 дена", value: "19€ / ден" },
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
      { label: "24 часа", value: "68€" },
      { label: "2-6 дена", value: "29€ / ден" },
      { label: "7-14 дена", value: "24€ / ден" },
      { label: "14-30 дена", value: "19€ / ден" },
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
      { label: "24 часа", value: "76€" },
      { label: "2-6 дена", value: "37€ / ден" },
      { label: "7-14 дена", value: "32€ / ден" },
      { label: "14-30 дена", value: "27€ / ден" },
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
      { label: "24 часа", value: "76€" },
      { label: "2-6 дена", value: "37€ / ден" },
      { label: "7-14 дена", value: "32€ / ден" },
      { label: "14-30 дена", value: "27€ / ден" },
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
      { label: "2-6 дена", value: "110€ / ден" },
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
      { label: "2-6 дена", value: "110€ / ден" },
      { label: "7-14 дена", value: "80€ / ден" },
      { label: "14-30 дена", value: "60€ / ден" },
      { label: "30+ дена", value: "По договаряне" },
    ],
  },
  {
    mainCategory: "car",
    carClass: "high",
    brand: "Toyota",
    model: "Sequoia Platinum 5.7i V8",
    year: 2020,
    fuel: "Бензин",
    engine: "5.7 V8",
    gearbox: "automatic",
    gearboxLabel: "Автоматик",
    seats: "6+1",
    image: "assets/cars/toyota-sequoia.jpeg",
    depositText: "1000€",
    prices: [
      { label: "24 часа", value: "400€" },
      { label: "2-6 дена", value: "200€ / ден" },
      { label: "7-14 дена", value: "150€ / ден" },
      { label: "14-30 дена", value: "110€ / ден" },
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
      { label: "24 часа", value: "68€" },
      { label: "2-6 дена", value: "29€ / ден" },
      { label: "7-14 дена", value: "24€ / ден" },
      { label: "14-30 дена", value: "19€ / ден" },
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
      { label: "24 часа", value: "68€" },
      { label: "2-6 дена", value: "29€ / ден" },
      { label: "7-14 дена", value: "24€ / ден" },
      { label: "14-30 дена", value: "19€ / ден" },
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

vehiclesData = vehiclesData.map(normalizeVehicleRecord);

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

function getVehicleDisplayName(vehicle) {
  return [vehicle.brand, vehicle.model].filter(Boolean).join(" ").trim();
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function getPricingDate() {
  return PRICE_TEST_DATE ? new Date(PRICE_TEST_DATE) : new Date();
}

function getSeasonalRuleKey(vehicle) {
  if (vehicle.mainCategory === "car") return vehicle.carClass || "";
  if (vehicle.mainCategory === "truck") return "truck";
  return "";
}

function getSeasonalSurcharge(vehicle, now = new Date()) {
  const ruleKey = getSeasonalRuleKey(vehicle);
  if (!ruleKey) return 0;
  const rule = seasonalRules.find((entry) => entry.key === ruleKey);
  if (!rule || !Array.isArray(rule.periods) || !rule.periods.length) return 0;
  if (!isSeasonalPeriod(rule.periods, now)) return 0;
  return Number(rule.surchargePerDay || 0);
}

function isSeasonalPeriod(periods, now = new Date()) {
  return periods.some((period) => isDateInSeasonalRange(period, now));
}

function isDateInSeasonalRange(periodText, now = new Date()) {
  const match = String(periodText || "").match(/(\d{2})-(\d{2})\s*->\s*(\d{2})-(\d{2})/);
  if (!match) return false;

  const startDay = Number(match[1]);
  const startMonth = Number(match[2]);
  const endDay = Number(match[3]);
  const endMonth = Number(match[4]);
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const currentValue = currentMonth * 100 + currentDay;
  const startValue = startMonth * 100 + startDay;
  const endValue = endMonth * 100 + endDay;

  if (startValue <= endValue) {
    return currentValue >= startValue && currentValue <= endValue;
  }

  return currentValue >= startValue || currentValue <= endValue;
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
  if (vehicle.luggage && Number.isFinite(Number(vehicle.luggage.count))) {
    return {
      count: Number(vehicle.luggage.count),
      icon: vehicle.luggage.icon || "briefcase",
      sizeClass: vehicle.luggage.sizeClass || (vehicle.luggage.icon === "barrel" ? "w-5 h-5" : "w-4 h-4"),
      withPlus: Boolean(vehicle.luggage.withPlus),
    };
  }

  const brand = (vehicle.brand || "").toLowerCase();
  const model = (vehicle.model || "").toLowerCase();

  const customByVehicle = [
    { match: () => brand === "toyota" && model.startsWith("yaris"), value: { count: 3, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "ford" && model.startsWith("focus"), value: { count: 3, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "vw" && model.startsWith("passat"), value: { count: 5, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "citroen" && model.startsWith("c5"), value: { count: 5, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "toyota" && model.startsWith("avensis"), value: { count: 5, icon: "briefcase", sizeClass: "w-4 h-4" } },
    { match: () => brand === "toyota" && model.startsWith("sequoia"), value: { count: 5, icon: "briefcase", sizeClass: "w-4 h-4", withPlus: true } },
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
  const surcharge = getSeasonalSurcharge(vehicle, getPricingDate());

  const rows = vehicle.prices
    .map(
      (entry) => `<div class="flex items-center justify-between border-b border-border pb-2 text-sm">
        <span class="text-muted-foreground">${escapeHtml(localizePriceLabel(entry.label))}</span>
        <span class="text-foreground font-medium">${escapeHtml(localizePriceValue(applySeasonalSurcharge(entry.value, surcharge)))}</span>
      </div>`,
    )
    .join("");

  const depositText = vehicle.depositText || (policy ? policy.depositText : "");
  if (!depositText) return rows;
  return `${rows}
    <div class="flex items-center justify-between pb-2 text-sm">
      <span class="text-muted-foreground">${UI_TEXT.deposit}</span>
      <span class="text-primary font-semibold">${escapeHtml(localizeDepositText(depositText))}</span>
    </div>`;
}

function getVehicleById(vehicleId) {
  return vehiclesData.find((vehicle) => vehicle.id === vehicleId) || null;
}

function getPublicBookingsForVehicle(vehicleId) {
  const today = toIsoDate(getPricingDate());
  return publicBookings.filter((booking) => booking.vehicle_id === vehicleId && booking.end_date >= today);
}

function isVehicleBookedToday(vehicleId) {
  const today = getPricingDate().toISOString().slice(0, 10);
  return getPublicBookingsForVehicle(vehicleId).some((booking) => booking.start_date <= today && booking.end_date >= today);
}

function hasBookingConflict(vehicleId, startDate, endDate) {
  if (!vehicleId || !startDate || !endDate) return false;
  return getPublicBookingsForVehicle(vehicleId).some((booking) => booking.start_date <= endDate && booking.end_date >= startDate);
}

function renderBookedRanges(vehicleId) {
  const items = getPublicBookingsForVehicle(vehicleId).sort((left, right) => `${left.start_date}`.localeCompare(`${right.start_date}`));
  if (!items.length) {
    return `<p class="text-sm text-muted-foreground">${escapeHtml(UI_TEXT.bookingNoRanges)}</p>`;
  }

  return `<div class="flex flex-col gap-2">${items
    .map(
      (booking) => `<div class="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground">
        <span>${escapeHtml(`${booking.start_date} - ${booking.end_date}`)}</span>
      </div>`,
    )
    .join("")}</div>`;
}

function buildBookingEmailHref(vehicle, startDate, endDate) {
  const subject = IS_EN ? "Booking request" : "Запитване за резервация";
  const body = IS_EN
    ? `Vehicle: ${getVehicleDisplayName(vehicle)}%0AFrom: ${startDate}%0ATo: ${endDate}`
    : `Превозно средство: ${getVehicleDisplayName(vehicle)}%0AОт: ${startDate}%0AДо: ${endDate}`;
  return `mailto:smcarsltd3@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
}

function parsePriceNumber(value) {
  if (!value) return null;
  const match = String(value).match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatEuroAmount(value) {
  if (!Number.isFinite(value)) return "";
  if (Number.isInteger(value)) return `${value}€`;
  return `${value.toFixed(2).replace(".", ",")}€`;
}

function getSelectionRange(startDate, endDate) {
  if (!startDate) return null;
  return {
    start: startDate,
    end: endDate || startDate,
  };
}

function getInclusiveDayCount(startDate, endDate) {
  const start = parseIsoToUtcDate(startDate);
  const end = parseIsoToUtcDate(endDate);
  if (!start || !end) return 0;
  const diffMs = end.getTime() - start.getTime();
  return diffMs >= 0 ? Math.floor(diffMs / 86400000) + 1 : 0;
}

function countSeasonalDaysInRange(vehicle, startDate, endDate) {
  let total = 0;
  for (let current = startDate; current && current <= endDate; current = addDaysToIso(current, 1)) {
    const currentDate = parseIsoToUtcDate(current);
    if (currentDate && getSeasonalSurcharge(vehicle, currentDate) > 0) {
      total += 1;
    }
  }
  return total;
}

function getBookingQuote(vehicle, startDate, endDate) {
  if (!vehicle || !startDate || !endDate || endDate < startDate) return null;
  const days = getInclusiveDayCount(startDate, endDate);
  if (!days) return null;

  const seasonalDays = countSeasonalDaysInRange(vehicle, startDate, endDate);
  const surchargePerDay = getSeasonalSurcharge(vehicle, parseIsoToUtcDate(startDate) || getPricingDate());

  if (days > 30) {
    return {
      days,
      total: null,
      label: localizePriceValue(vehicle.prices?.[4]?.value || ""),
      payable: false,
    };
  }

  if (days === 1) {
    const dayBase = parsePriceNumber(vehicle.prices?.[0]?.value);
    if (!Number.isFinite(dayBase)) return null;
    const total = dayBase + surchargePerDay * seasonalDays;
    return {
      days,
      total,
      label: formatEuroAmount(total),
      payable: true,
    };
  }

  let tierIndex = 1;
  if (days >= 7 && days <= 14) {
    tierIndex = 2;
  } else if (days >= 15 && days <= 30) {
    tierIndex = 3;
  }

  const dailyBase = parsePriceNumber(vehicle.prices?.[tierIndex]?.value);
  if (!Number.isFinite(dailyBase)) return null;
  const total = dailyBase * days + surchargePerDay * seasonalDays;
  return {
    days,
    total,
    label: formatEuroAmount(total),
    payable: true,
  };
}

function buildStripeCheckoutPayload(vehicle, startDate, endDate, quote) {
  if (!vehicle || !startDate || !endDate || !quote?.payable || !Number.isFinite(quote?.total)) return null;
  return {
    vehicleId: vehicle.id,
    vehicleName: getVehicleDisplayName(vehicle),
    startDate,
    endDate,
    days: quote.days || getInclusiveDayCount(startDate, endDate),
    amount: quote.total,
    currency: "EUR",
    locale: IS_EN ? "en" : "bg",
    returnUrl: window.location.href,
  };
}

function getSupabaseFunctionUrl(functionName) {
  const baseUrl = window.SMCarsSupabaseConfig?.url;
  if (!baseUrl || !functionName) return "";
  return `${baseUrl}/functions/v1/${functionName}`;
}

function getSupabasePublishableKey() {
  return window.SMCarsSupabaseConfig?.anonKey || "";
}

async function createStripeCheckoutSession(payload) {
  const functionUrl = getSupabaseFunctionUrl("create-stripe-checkout");
  const publishableKey = getSupabasePublishableKey();
  if (!functionUrl || !publishableKey) {
    throw new Error("Stripe checkout is not configured.");
  }

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: publishableKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `Checkout failed with HTTP ${response.status}`);
  }

  return data;
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function formatLocalDateToIso(date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function parseIsoToUtcDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatLocalDateToIso(date);
}

function addDaysToIso(isoDate, days) {
  const date = parseIsoToUtcDate(isoDate);
  if (!date) return "";
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${padDatePart(date.getUTCMonth() + 1)}-${padDatePart(date.getUTCDate())}`;
}

function startOfMonthIso(isoDate) {
  const date = parseIsoToUtcDate(isoDate);
  if (!date) return "";
  return `${date.getUTCFullYear()}-${padDatePart(date.getUTCMonth() + 1)}-01`;
}

function monthLabelFromIso(isoDate) {
  const date = parseIsoToUtcDate(isoDate);
  if (!date) return "";
  return `${UI_TEXT.months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function monthOffsetIso(isoDate, offset) {
  const date = parseIsoToUtcDate(isoDate);
  if (!date) return "";
  date.setUTCMonth(date.getUTCMonth() + offset, 1);
  return `${date.getUTCFullYear()}-${padDatePart(date.getUTCMonth() + 1)}-01`;
}

function startOfCalendarGridIso(monthIso) {
  const date = parseIsoToUtcDate(monthIso);
  if (!date) return "";
  const jsDay = date.getUTCDay();
  const mondayIndex = (jsDay + 6) % 7;
  date.setUTCDate(date.getUTCDate() - mondayIndex);
  return `${date.getUTCFullYear()}-${padDatePart(date.getUTCMonth() + 1)}-${padDatePart(date.getUTCDate())}`;
}

function isSameMonthIso(dayIso, monthIso) {
  return dayIso.slice(0, 7) === monthIso.slice(0, 7);
}

function isDateWithinRange(dateIso, startIso, endIso) {
  if (!startIso || !endIso) return false;
  return dateIso >= startIso && dateIso <= endIso;
}

function formatHumanDate(isoDate) {
  if (!isoDate) return "";
  const date = parseIsoToUtcDate(isoDate);
  if (!date) return "";
  return `${date.getUTCDate()} ${UI_TEXT.months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function getVehicleBookedRanges(vehicleId) {
  return getPublicBookingsForVehicle(vehicleId)
    .map((booking) => ({
      start: booking.start_date,
      end: booking.end_date,
      status: booking.status,
    }))
    .sort((left, right) => left.start.localeCompare(right.start));
}

function isDateBookedForVehicle(vehicleId, dateIso) {
  return getVehicleBookedRanges(vehicleId).some((range) => dateIso >= range.start && dateIso <= range.end);
}

function doesSelectionCrossBookedDates(vehicleId, startIso, endIso) {
  if (!vehicleId || !startIso || !endIso) return false;
  return getVehicleBookedRanges(vehicleId).some((range) => startIso <= range.end && endIso >= range.start);
}

function renderVehicleCard(vehicle, index) {
  const luggageIcons = renderLuggageIcons(vehicle);
  const bookedToday = isVehicleBookedToday(vehicle.id);
  const todayNoticeHtml = bookedToday
    ? `<div class="mb-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary font-medium">${escapeHtml(UI_TEXT.bookingBusyToday)}</div>`
    : "";
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
        ${todayNoticeHtml}
        ${specsHtml}

        <div class="space-y-3 mb-4">
          ${renderPriceList(vehicle)}
        </div>

        <div class="mt-auto pt-4 border-t border-border flex justify-center">
          <a href="#" data-open-reserve-modal="true" data-reserve-vehicle-id="${escapeHtml(vehicle.id)}" data-reserve-vehicle-name="${escapeHtml(getVehicleDisplayName(vehicle))}" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-wide hover:brightness-110 transition-all">
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
  const categoryGrid = document.getElementById("category-grid");
  if (!title || !categoryView || !subcategoryView || !vehiclesView || !categoryGrid) return;

  currentMainCategory = null;
  currentCarClass = null;
  currentGearboxFilter = "all";

  title.innerHTML = UI_TEXT.selectTypeTitleHtml;
  categoryView.classList.remove("hidden");
  subcategoryView.classList.add("hidden");
  vehiclesView.classList.add("hidden");
  categoryGrid.innerHTML = categories.map((item, index) => renderCategoryCard(item, index, "category-key")).join("");
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

  let items = vehiclesData
    .filter((vehicle) => vehicle.mainCategory === currentMainCategory)
    .filter((vehicle) => vehicle.isAvailable !== false);
  if (currentMainCategory === "car") {
    items = items.filter((vehicle) => vehicle.carClass === currentCarClass);
    if (currentGearboxFilter !== "all") {
      items = items.filter((vehicle) => vehicle.gearbox === currentGearboxFilter);
    }
  }

  items = items.sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0));

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
    `<div id="reserve-modal" class="reserve-modal-shell fixed inset-0 z-50 hidden items-center justify-center p-6">
      <button type="button" data-close-reserve-modal="true" class="absolute inset-0 bg-background/80 backdrop-blur-xl" aria-label="${UI_TEXT.closeLabel}"></button>
      <div class="reserve-modal-panel relative w-full rounded-lg border border-border bg-card p-6 card-glow" style="max-width:560px;">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-heading text-xl font-bold text-foreground">${UI_TEXT.bookingTitle}</h3>
            <p id="reserve-vehicle-name" class="text-sm text-muted-foreground mt-1"></p>
          </div>
          <button type="button" data-close-reserve-modal="true" class="w-9 h-9 rounded-md flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-accent transition-colors" aria-label="${UI_TEXT.closeLabel}">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <label class="mb-4 flex flex-col gap-2">
          <span class="text-xs uppercase tracking-wider text-muted-foreground">${UI_TEXT.bookingVehicle}</span>
          <div class="reserve-vehicle-select-shell">
            <select id="reserve-vehicle-select" class="reserve-vehicle-select w-full rounded-md border border-border bg-secondary/40 px-4 py-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary">
              <option value="">${UI_TEXT.bookingVehiclePrompt}</option>
            </select>
            <span class="reserve-vehicle-select-arrow" aria-hidden="true">
              <i data-lucide="chevron-down" class="w-4 h-4"></i>
            </span>
          </div>
        </label>

        <div id="reserve-today-message" class="hidden mb-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary font-medium"></div>

        <div class="reserve-selection-panel mb-4 rounded-md border border-border bg-secondary/30 p-3">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-wider text-muted-foreground">${UI_TEXT.bookingSelectedRange}</p>
              <p id="reserve-selected-range" class="text-sm font-semibold text-foreground">${UI_TEXT.bookingStartPrompt}</p>
            </div>
            <button id="reserve-clear-dates" type="button" class="inline-flex items-center justify-center rounded-md border border-border bg-secondary px-3 py-2 text-sm font-heading font-semibold text-secondary-foreground hover:bg-accent transition-colors">
              ${UI_TEXT.bookingClearDates}
            </button>
          </div>
          <div class="reserve-calendar rounded-md border border-border bg-card/80 p-3">
            <div class="mb-3 flex items-center justify-between gap-2">
              <button id="reserve-calendar-prev" type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors" aria-label="${UI_TEXT.bookingPrevMonth}">
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
              </button>
              <p id="reserve-calendar-month" class="text-sm font-heading font-semibold text-foreground"></p>
              <button id="reserve-calendar-next" type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors" aria-label="${UI_TEXT.bookingNextMonth}">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            </div>
            <div id="reserve-calendar-weekdays" class="reserve-calendar-weekdays"></div>
            <div id="reserve-calendar-grid" class="reserve-calendar-grid"></div>
          </div>
        </div>

        <div id="reserve-availability-message" class="mb-4 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">${UI_TEXT.bookingSelectDates}</div>

        <div class="mb-4">
          <p class="text-sm font-semibold text-foreground mb-2">${UI_TEXT.bookingRangesTitle}</p>
          <div id="reserve-booked-ranges"></div>
        </div>

        <div class="mb-4 rounded-md border border-border bg-secondary/30 px-4 py-3">
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm font-semibold text-foreground">${UI_TEXT.bookingTotal}</span>
            <span id="reserve-total-price" class="text-sm font-bold text-primary">${UI_TEXT.bookingTotalPending}</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <a id="reserve-payment-link" href="${STRIPE_CHECKOUT_PLACEHOLDER}" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-wide hover:brightness-110 transition-all">
            <i data-lucide="credit-card" class="w-4 h-4"></i>
            ${UI_TEXT.bookingPaymentLabel}
          </a>
          <p class="text-center text-sm font-medium text-muted-foreground">${UI_TEXT.bookingOr}</p>
          <a href="${RESERVE_PHONE_HREF}" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md border border-border bg-secondary text-secondary-foreground font-heading font-semibold text-sm tracking-wide hover:bg-accent transition-all">
            <i data-lucide="phone" class="w-4 h-4"></i>
            ${UI_TEXT.callLabel}
          </a>
          <a id="reserve-email-link" href="${RESERVE_EMAIL_HREF}" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md border border-border bg-secondary text-secondary-foreground font-heading font-semibold text-sm tracking-wide hover:bg-accent transition-all">
            <i data-lucide="mail" class="w-4 h-4"></i>
            ${UI_TEXT.emailLabel}
          </a>
        </div>
      </div>
    </div>`,
  );

  const modal = document.getElementById("reserve-modal");
  if (!modal) return;
  const vehicleName = document.getElementById("reserve-vehicle-name");
  const vehicleSelect = document.getElementById("reserve-vehicle-select");
  const todayMessage = document.getElementById("reserve-today-message");
  const selectedRange = document.getElementById("reserve-selected-range");
  const clearDatesButton = document.getElementById("reserve-clear-dates");
  const calendarMonth = document.getElementById("reserve-calendar-month");
  const calendarWeekdays = document.getElementById("reserve-calendar-weekdays");
  const calendarGrid = document.getElementById("reserve-calendar-grid");
  const prevMonthButton = document.getElementById("reserve-calendar-prev");
  const nextMonthButton = document.getElementById("reserve-calendar-next");
  const availabilityMessage = document.getElementById("reserve-availability-message");
  const bookedRanges = document.getElementById("reserve-booked-ranges");
  const totalPrice = document.getElementById("reserve-total-price");
  const paymentLink = document.getElementById("reserve-payment-link");
  const emailLink = document.getElementById("reserve-email-link");
  let checkoutInFlight = false;

  const setPaymentLinkDisabled = (disabled) => {
    if (!paymentLink) return;
    if (disabled) {
      paymentLink.href = STRIPE_CHECKOUT_PLACEHOLDER;
      paymentLink.setAttribute("aria-disabled", "true");
      paymentLink.style.pointerEvents = "none";
      paymentLink.style.opacity = "0.65";
      return;
    }

    paymentLink.href = STRIPE_CHECKOUT_PLACEHOLDER;
    paymentLink.removeAttribute("aria-disabled");
    paymentLink.style.pointerEvents = "";
    paymentLink.style.opacity = "";
  };

  const setCheckoutLoading = (loading) => {
    if (!paymentLink) return;
    checkoutInFlight = loading;
    paymentLink.dataset.loading = loading ? "true" : "false";
    paymentLink.style.pointerEvents = loading ? "none" : paymentLink.style.pointerEvents;
    paymentLink.style.opacity = loading ? "0.8" : paymentLink.style.opacity;
    paymentLink.innerHTML = loading
      ? `<i data-lucide="loader-circle" class="w-4 h-4 animate-spin"></i>${escapeHtml(IS_EN ? "Redirecting..." : "Пренасочване...")}`
      : `<i data-lucide="credit-card" class="w-4 h-4"></i>${escapeHtml(UI_TEXT.bookingPaymentLabel)}`;
    refreshIcons();
  };

  if (calendarWeekdays) {
    calendarWeekdays.innerHTML = UI_TEXT.weekdays
      .map((day) => `<span class="reserve-calendar-weekday">${escapeHtml(day)}</span>`)
      .join("");
  }

  const renderVehicleOptions = () => {
    if (!vehicleSelect) return;
    const options = vehiclesData
      .slice()
      .sort((left, right) => getVehicleDisplayName(left).localeCompare(getVehicleDisplayName(right), SITE_LANG))
      .map(
        (vehicle) =>
          `<option value="${escapeHtml(vehicle.id)}">${escapeHtml(getVehicleDisplayName(vehicle))}</option>`,
      );
    vehicleSelect.innerHTML = `<option value="">${escapeHtml(UI_TEXT.bookingVehiclePrompt)}</option>${options.join("")}`;
  };

  renderVehicleOptions();

  const updateSelectedRangeLabel = () => {
    if (!selectedRange) return;
    const activeRange = getSelectionRange(reserveSelectionStart, reserveSelectionEnd);
    if (!activeRange) {
      selectedRange.textContent = UI_TEXT.bookingStartPrompt;
      return;
    }
    if (activeRange.start === activeRange.end) {
      selectedRange.textContent = formatHumanDate(activeRange.start);
      return;
    }
    selectedRange.textContent = `${formatHumanDate(activeRange.start)} → ${formatHumanDate(activeRange.end)}`;
  };

  const renderCalendar = () => {
    if (!calendarMonth || !calendarGrid) return;
    const fallbackMonth = startOfMonthIso(toIsoDate(getPricingDate()) || new Date().toISOString().slice(0, 10));
    if (!reserveCalendarMonth) reserveCalendarMonth = fallbackMonth;
    calendarMonth.textContent = monthLabelFromIso(reserveCalendarMonth);

    const gridStart = startOfCalendarGridIso(reserveCalendarMonth);
    const todayIso = toIsoDate(getPricingDate());
    const vehicleId = activeReserveVehicleId;
    const cells = [];

    for (let index = 0; index < 42; index += 1) {
      const dayIso = addDaysToIso(gridStart, index);
      const inMonth = isSameMonthIso(dayIso, reserveCalendarMonth);
      const isToday = dayIso === todayIso;
      const isPast = dayIso < todayIso;
      const isBooked = vehicleId && !isPast ? isDateBookedForVehicle(vehicleId, dayIso) : false;
      const isStart = reserveSelectionStart === dayIso;
      const isEnd = reserveSelectionEnd === dayIso;
      const inSelection =
        reserveSelectionStart && reserveSelectionEnd && isDateWithinRange(dayIso, reserveSelectionStart, reserveSelectionEnd);
      const classes = [
        "reserve-calendar-day",
        inMonth ? "" : "is-outside-month",
        isToday ? "is-today" : "",
        isPast ? "is-disabled" : "",
        isBooked ? "is-booked" : "",
        inSelection ? "is-in-range" : "",
        isStart ? "is-range-start" : "",
        isEnd ? "is-range-end" : "",
      ]
        .filter(Boolean)
        .join(" ");

      cells.push(
        `<button type="button" class="${classes}" data-calendar-date="${dayIso}" ${isBooked || isPast || !vehicleId ? "disabled" : ""} aria-label="${escapeHtml(
          formatHumanDate(dayIso),
        )}">
          <span>${parseIsoToUtcDate(dayIso)?.getUTCDate() ?? ""}</span>
        </button>`,
      );
    }

    calendarGrid.innerHTML = cells.join("");
  };

  const syncReserveModalState = () => {
    const vehicle = getVehicleById(activeReserveVehicleId);
    const activeRange = getSelectionRange(reserveSelectionStart, reserveSelectionEnd);
    const effectiveStart = activeRange?.start || "";
    const effectiveEnd = activeRange?.end || "";
    const quote = vehicle ? getBookingQuote(vehicle, effectiveStart, effectiveEnd) : null;
    updateSelectedRangeLabel();
    renderCalendar();
    if (vehicleSelect) {
      vehicleSelect.value = vehicle?.id || "";
    }

    if (!vehicle) {
      vehicleName.textContent = UI_TEXT.bookingVehiclePrompt;
      todayMessage.classList.add("hidden");
      bookedRanges.innerHTML = `<p class="text-sm text-muted-foreground">${escapeHtml(UI_TEXT.bookingNoRanges)}</p>`;
      availabilityMessage.textContent = UI_TEXT.bookingSelectVehicleDates;
      availabilityMessage.className = "mb-4 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground";
      totalPrice.textContent = UI_TEXT.bookingTotalPending;
      totalPrice.className = "text-sm font-bold text-primary";
      setPaymentLinkDisabled(true);
      emailLink.href = RESERVE_EMAIL_HREF;
      return;
    }

    vehicleName.textContent = `${UI_TEXT.bookingVehicle}: ${getVehicleDisplayName(vehicle)}`;
    const bookedToday = isVehicleBookedToday(vehicle.id);
    todayMessage.classList.add("hidden");
    bookedRanges.innerHTML = renderBookedRanges(vehicle.id);

    const hasConflict = hasBookingConflict(vehicle.id, effectiveStart, effectiveEnd);
    emailLink.href = effectiveStart && effectiveEnd ? buildBookingEmailHref(vehicle, effectiveStart, effectiveEnd) : RESERVE_EMAIL_HREF;

    if (!effectiveStart || !effectiveEnd) {
      availabilityMessage.textContent = UI_TEXT.bookingSelectDates;
      availabilityMessage.className = "mb-4 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground";
      totalPrice.textContent = UI_TEXT.bookingTotalPendingDatesOnly;
      totalPrice.className = "text-sm font-bold text-primary";
      setPaymentLinkDisabled(true);
      return;
    }

    if (effectiveEnd < effectiveStart) {
      availabilityMessage.textContent = UI_TEXT.bookingUnavailable;
      availabilityMessage.className = "mb-4 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200";
      totalPrice.textContent = UI_TEXT.bookingTotalPendingDatesOnly;
      totalPrice.className = "text-sm font-bold text-primary";
      setPaymentLinkDisabled(true);
      return;
    }

    if (hasConflict) {
      availabilityMessage.textContent = UI_TEXT.bookingUnavailableRange;
      availabilityMessage.className = "mb-4 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200";
      totalPrice.textContent = UI_TEXT.bookingTotalPendingDatesOnly;
      totalPrice.className = "text-sm font-bold text-primary";
      setPaymentLinkDisabled(true);
      return;
    }

    availabilityMessage.textContent = effectiveStart === effectiveEnd ? UI_TEXT.bookingAvailableSingle : UI_TEXT.bookingAvailable;
    availabilityMessage.className = "mb-4 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200";
    totalPrice.textContent = quote?.label || UI_TEXT.bookingTotalPendingDatesOnly;
    totalPrice.className = `text-sm font-bold ${quote?.payable ? "text-primary" : "text-muted-foreground"}`;
    if (quote?.payable) {
      setPaymentLinkDisabled(false);
    } else {
      setPaymentLinkDisabled(true);
    }
  };

  const startStripeCheckout = async () => {
    if (checkoutInFlight) return;
    const vehicle = getVehicleById(activeReserveVehicleId);
    const activeRange = getSelectionRange(reserveSelectionStart, reserveSelectionEnd);
    const effectiveStart = activeRange?.start || "";
    const effectiveEnd = activeRange?.end || "";
    const quote = vehicle ? getBookingQuote(vehicle, effectiveStart, effectiveEnd) : null;
    const payload = buildStripeCheckoutPayload(vehicle, effectiveStart, effectiveEnd, quote);

    if (!payload) {
      setPaymentLinkDisabled(true);
      return;
    }

    try {
      setCheckoutLoading(true);
      const result = await createStripeCheckoutSession(payload);
      if (!result?.url) {
        throw new Error("Stripe checkout URL is missing.");
      }
      window.location.href = result.url;
    } catch (error) {
      console.error("Stripe checkout start failed:", error);
      availabilityMessage.textContent = error?.message || (IS_EN ? "Payment could not be started." : "Плащането не можа да бъде стартирано.");
      availabilityMessage.className = "mb-4 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200";
      setCheckoutLoading(false);
      syncReserveModalState();
    }
  };

  const clearSelection = () => {
    reserveSelectionStart = "";
    reserveSelectionEnd = "";
    syncReserveModalState();
  };

  const handleDaySelection = (dayIso) => {
    if (!activeReserveVehicleId || isDateBookedForVehicle(activeReserveVehicleId, dayIso)) return;

    if (!reserveSelectionStart) {
      reserveSelectionStart = dayIso;
      reserveSelectionEnd = "";
      syncReserveModalState();
      return;
    }

    if (dayIso === reserveSelectionStart) {
      clearSelection();
      return;
    }

    if (dayIso < reserveSelectionStart) {
      const previousEnd = reserveSelectionEnd;
      reserveSelectionStart = dayIso;
      if (
        previousEnd &&
        previousEnd > dayIso &&
        !doesSelectionCrossBookedDates(activeReserveVehicleId, dayIso, previousEnd)
      ) {
        reserveSelectionEnd = previousEnd;
      } else {
        reserveSelectionEnd = "";
      }
      syncReserveModalState();
      return;
    }

    if (doesSelectionCrossBookedDates(activeReserveVehicleId, reserveSelectionStart, dayIso)) {
      availabilityMessage.textContent = UI_TEXT.bookingUnavailableRange;
      availabilityMessage.className = "mb-4 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200";
      renderCalendar();
      return;
    }

    reserveSelectionEnd = dayIso;
    syncReserveModalState();
  };

  const openModal = (vehicleId = null) => {
    renderVehicleOptions();
    activeReserveVehicleId = vehicleId;
    reserveSelectionStart = "";
    reserveSelectionEnd = "";
    reserveCalendarMonth = startOfMonthIso(toIsoDate(getPricingDate()) || new Date().toISOString().slice(0, 10));
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
    syncReserveModalState();
    refreshIcons();
  };

  const closeModal = () => {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    activeReserveVehicleId = null;
  };

  vehicleSelect?.addEventListener("change", () => {
    activeReserveVehicleId = vehicleSelect.value || null;
    reserveSelectionStart = "";
    reserveSelectionEnd = "";
    syncReserveModalState();
  });
  clearDatesButton?.addEventListener("click", clearSelection);
  prevMonthButton?.addEventListener("click", () => {
    reserveCalendarMonth = monthOffsetIso(reserveCalendarMonth, -1);
    renderCalendar();
  });
  nextMonthButton?.addEventListener("click", () => {
    reserveCalendarMonth = monthOffsetIso(reserveCalendarMonth, 1);
    renderCalendar();
  });
  calendarGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-calendar-date]");
    if (!button || button.hasAttribute("disabled")) return;
    handleDaySelection(button.getAttribute("data-calendar-date"));
  });

  document.addEventListener("click", (event) => {
    const openTrigger = event.target.closest("[data-open-reserve-modal='true']");
    if (openTrigger) {
      event.preventDefault();
      openModal(openTrigger.getAttribute("data-reserve-vehicle-id"));
      return;
    }

    const closeTrigger = event.target.closest("[data-close-reserve-modal='true']");
    if (closeTrigger) {
      event.preventDefault();
      closeModal();
      return;
    }

    const paymentTrigger = event.target.closest('#reserve-payment-link');
    if (paymentTrigger) {
      event.preventDefault();
      if (paymentTrigger.getAttribute('aria-disabled') === 'true') return;
      startStripeCheckout();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function initContactReserveModal() {
  if (document.getElementById("contact-reserve-modal")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="contact-reserve-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-6">
      <button type="button" data-close-contact-reserve-modal="true" class="absolute inset-0 bg-background/80 backdrop-blur-xl" aria-label="${UI_TEXT.closeLabel}"></button>
      <div class="relative w-full max-w-md rounded-lg border border-border bg-card p-6 card-glow">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-heading text-xl font-bold text-foreground">${UI_TEXT.modalTitle}</h3>
          <button type="button" data-close-contact-reserve-modal="true" class="w-9 h-9 rounded-md flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-accent transition-colors" aria-label="${UI_TEXT.closeLabel}">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
        <div class="flex flex-col gap-3">
          <a href="${RESERVE_PHONE_HREF}" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md border border-border bg-secondary text-secondary-foreground font-heading font-semibold text-sm tracking-wide hover:bg-accent transition-all">
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

  const modal = document.getElementById("contact-reserve-modal");
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
    const openTrigger = event.target.closest("[data-open-contact-reserve-modal='true']");
    if (openTrigger) {
      event.preventDefault();
      openModal();
      return;
    }

    const closeTrigger = event.target.closest("[data-close-contact-reserve-modal='true']");
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

function showCheckoutStatusNotice(kind) {
  const existing = document.getElementById("checkout-status-notice");
  if (existing) existing.remove();

  const notice = document.createElement("div");
  notice.id = "checkout-status-notice";
  notice.className = "fixed right-4 z-50 max-w-md rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm";
  notice.style.top = "5rem";

  if (kind === "success") {
    notice.classList.add("border-emerald-400/40", "bg-emerald-500/10", "text-foreground");
    notice.textContent = IS_EN
      ? "Payment completed. Your reservation will be confirmed within a few seconds."
      : "Плащането е успешно. Резервацията ще бъде потвърдена до няколко секунди.";
  } else {
    notice.classList.add("border-border", "bg-card", "text-foreground");
    notice.textContent = IS_EN
      ? "Payment was cancelled. You can choose another date or contact us."
      : "Плащането беше прекъснато. Можеш да избереш други дати или да се свържеш с нас.";
  }

  document.body.appendChild(notice);
  window.setTimeout(() => {
    notice.remove();
  }, 7000);
}

function initStripeCheckoutStatus() {
  const url = new URL(window.location.href);
  const checkoutStatus = url.searchParams.get("checkout");
  if (!checkoutStatus) return;

  if (checkoutStatus === "success" || checkoutStatus === "cancel") {
    showCheckoutStatusNotice(checkoutStatus);
  }

  url.searchParams.delete("checkout");
  url.searchParams.delete("session_id");
  window.history.replaceState({}, "", url.toString());
}

function normalizeCmsVehicles(items) {
  return items.map((vehicle, index) => normalizeVehicleRecord({
    ...vehicle,
    image: resolveAssetPath(vehicle.image),
  }, index));
}

function applyCmsPublishedContent(content) {
  if (!content || typeof content !== "object") return;

  if (Array.isArray(content.categories) && content.categories.length) {
    categories = content.categories.map((item) => ({
      ...item,
      image: resolveAssetPath(item.image),
    }));
  }

  if (Array.isArray(content.carClasses) && content.carClasses.length) {
    carClasses = content.carClasses.map((item) => ({
      ...item,
      image: resolveAssetPath(item.image),
    }));
  }

  if (content.carClassPolicies && typeof content.carClassPolicies === "object") {
    carClassPolicies = { ...carClassPolicies, ...content.carClassPolicies };
  }

  if (content.categoryPolicies && typeof content.categoryPolicies === "object") {
    categoryPolicies = { ...categoryPolicies, ...content.categoryPolicies };
  }

  if (Array.isArray(content.seasonalRules) && content.seasonalRules.length) {
    seasonalRules = content.seasonalRules.map((rule) => ({
      ...rule,
      surchargePerDay: Number(rule.surchargePerDay || 0),
      periods: Array.isArray(rule.periods) ? rule.periods : [],
    }));
  }

  if (Array.isArray(content.vehicles) && content.vehicles.length) {
    vehiclesData = normalizeCmsVehicles(content.vehicles);
  }

  if (currentMainCategory === "car" && currentCarClass) {
    showVehicles();
    return;
  }

  if (currentMainCategory) {
    showVehicles();
    return;
  }

  showMainCategories();
}

window.SMCarsDemoAPI = {
  applyCmsPublishedContent,
  applyPublicBookings(bookings) {
    publicBookings = Array.isArray(bookings) ? bookings : [];
    if (currentMainCategory) {
      showVehicles();
    }
  },
};

function init() {
  initStripeCheckoutStatus();
  initThemeToggle();
  initFooterYear();
  initCategoryHandlers();
  initGearboxFilters();
  initMobileMenu();
  initReserveModal();
  initContactReserveModal();
  initTermsModal();
  showMainCategories();
}

init();
