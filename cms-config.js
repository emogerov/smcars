import { DEFAULT_CMS_VEHICLES } from "./cms-seed-data.js";

const LIVE_SUPABASE_URL = "https://hndqbiwmqazlzpkljgcn.supabase.co";
const LIVE_SUPABASE_ANON_KEY = "sb_publishable_Jg5eU6gUba_rxk2ORIk6sQ_r9CnJE0B";

const STAGING_SUPABASE_URL = "https://dztkclhqoqiefqotrdtn.supabase.co";
const STAGING_SUPABASE_ANON_KEY = "sb_publishable_tyhScgarjHA4ZdN1mVEfpA_IrR7Qmp8";

const CMS_HOSTNAME = typeof window !== "undefined" ? window.location.hostname : "";
const USE_STAGING_SUPABASE = ["127.0.0.1", "localhost"].includes(CMS_HOSTNAME);

export const SUPABASE_URL = USE_STAGING_SUPABASE ? STAGING_SUPABASE_URL : LIVE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = USE_STAGING_SUPABASE ? STAGING_SUPABASE_ANON_KEY : LIVE_SUPABASE_ANON_KEY;
export const CMS_ENVIRONMENT = USE_STAGING_SUPABASE ? "staging" : "live";
export const VEHICLE_IMAGES_BUCKET = "vehicle-images";

export const DEFAULT_CMS_CONTENT = {
  categories: [
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
  ],
  carClasses: [
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
  ],
  siteSettings: {
    companyName: "SM Cars",
    phone: "+359894428975",
    email: "smcarsltd3@gmail.com",
    address: {
      bg: "бул. Велики Преслав 234\nгр. Шумен; кв. Дивдядово",
      en: "234 Veliki Preslav Blvd.\nShumen, Divdyadovo district",
    },
    googleMapsEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1027.7786994917303!2d26.922183221925525!3d43.23051936568666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a5f5ae93357973%3A0x2635105b6b7eb831!2sSM%20Cars%20Ltd.!5e0!3m2!1sen!2sbg!4v1771518503875!5m2!1sen!2sbg",
  },
  hero: {
    title: {
      bg: "Rent a car",
      en: "Rent a car",
    },
    subtitle: {
      bg: "Разгледайте нашите автомобили, мотори и товарни превозни средства под наем",
      en: "Browse our rental cars, motorcycles and cargo vans",
    },
    priceLine: {
      bg: "Цени от 11€ на ден",
      en: "Prices from 11€ per day",
    },
    media: {
      type: "video",
      video: "assets/Homepage%20video.mp4",
      image: "assets/hero-car.jpg",
      poster: "assets/hero-car.jpg",
    },
  },
  shuttleRoutes: [
    {
      airport: {
        bg: "Летище Аурел Влайку Букурещ",
        en: "Aurel Vlaicu Airport Bucharest",
      },
      price: "200€ / 250€",
    },
    {
      airport: {
        bg: "Летище Анри Коанда Букурещ",
        en: "Henri Coanda Airport Bucharest",
      },
      price: "200€ / 250€",
    },
    {
      airport: {
        bg: "Международно летище Варна",
        en: "Varna International Airport",
      },
      price: "100€ / 150€",
    },
    {
      airport: {
        bg: "Международно летище Васил Левски София",
        en: "Vasil Levski Sofia International Airport",
      },
      price: "300€ / 400€",
    },
    {
      airport: {
        bg: "Летище Бургас",
        en: "Burgas Airport",
      },
      price: "120€ / 170€",
    },
  ],
  seasonalRules: [
    {
      key: "low",
      label: "Нисък клас",
      surchargePerDay: 3,
      periods: ["01-06 -> 31-08", "01-12 -> 08-01"],
    },
    {
      key: "middle",
      label: "Среден клас",
      surchargePerDay: 5,
      periods: ["01-06 -> 31-08", "01-12 -> 08-01"],
    },
    {
      key: "high",
      label: "Висок клас",
      surchargePerDay: 10,
      periods: ["01-06 -> 31-08", "01-12 -> 08-01"],
    },
    {
      key: "truck",
      label: "Товарни",
      surchargePerDay: 5,
      periods: ["01-06 -> 31-08", "01-12 -> 08-01"],
    },
  ],
  rentalTerms: {
    bg: [
      "1. Валидна лична карта или паспорт.",
      "2. Валидна шофьорска книжка.",
      "3. Посочените цени за наем са за период от 24 часа. Всички наши цени са с включено ДДС.",
      "4. За автомобили нисък клас НЕ СЕ ЗАПЛАЩА ДЕПОЗИТ.",
      "5. Посочените цени за наем включват ГО, ГТП и винетни такси за Република България. Всички останали такси, глоби, винетни такси извън България и т. н. са за сметка на наемателя.",
      "6. Неограничен пробег.",
      "7. Поддръжка на автомобила.",
      "8. При евентуален технически проблем с превозното средство СМ КАРС ЕООД се задължава да ви подсигури друго такова.",
      "9. Заплащането се извършва в брой, с карта чрез ПОС терминал или банков превод.",
      "10. Преди предаване на превозното средство се заплаща цялата договорена сума по договора за наем. За резервация на автомобил е необходимо заплащане на цялата сума или капаро, договорено между двете страни (наемодател и наемател).",
      "11. Превозното средство може да бъде управлявано от лицето, посочено в договора за наем, плюс още един допълнителен водач.",
      "12. В случай че превозното средство ще бъде управлявано извън България, е необходимо това да бъде отразено в договора за наем. В този случай се изготвя пълномощно на водача и се заплаща допълнителна такса от 100€.",
      "13. При настъпили каквито и да е инциденти, свързани с превозното средство, наемателят е длъжен да уведоми органите на реда, както и фирмата собственик. Наемателят е длъжен да представи протокол от полицията или жалба за съответния случай.",
      "14. Превозното средство се предава на наемателя с пълен резервоар гориво и се връща по същия начин. В противен случай се дължи такса от 110€.",
      "15. Превозното средство се предава измито отвън и отвътре и се връща в същия вид. В противен случай се заплаща такса автомивка от 20€.",
      "16. Предаване и връщане на превозното средство може да се извърши в удобно и за двете страни време и място след предварителна уговорка, независимо от работното време.",
      "17. Фирма СМ КАРС ЕООД си запазва правото на незабавно прекратяване на договора и неустойки, свързани с него, в случай на некоректно отношение или несъвестно стопанисване на нашите превозни средства.",
    ],
    en: [
      "1. Valid ID card or passport.",
      "2. Valid driving licence.",
      "3. The listed rental prices are for a 24-hour period and include VAT.",
      "4. No deposit is required for low-class vehicles.",
      "5. The listed rental prices include civil liability insurance, technical inspection and vignette fees for Bulgaria. All other fees, fines and vignette fees outside Bulgaria are paid by the renter.",
      "6. Unlimited mileage.",
      "7. Vehicle maintenance is included.",
      "8. In the event of a technical issue, SM CARS Ltd. will provide a replacement vehicle.",
      "9. Payment can be made in cash, by card through a POS terminal or by bank transfer.",
      "10. Before the vehicle is handed over, the full agreed rental amount must be paid. A reservation requires full payment or a deposit agreed between the renter and the owner.",
      "11. The vehicle may be driven by the person listed in the rental contract plus one additional driver.",
      "12. If the vehicle will be driven outside Bulgaria, this must be stated in the rental contract. In that case, a power of attorney is prepared for the driver and an additional fee of 100€ is charged.",
      "13. In the event of any incident related to the vehicle, the renter must notify the authorities and the company owner. The renter must provide a police report or complaint for the specific case.",
      "14. The vehicle is handed over with a full fuel tank and must be returned the same way. Otherwise, a fee of 110€ is charged.",
      "15. The vehicle is handed over washed inside and out and must be returned in the same condition. Otherwise, a car wash fee of 20€ is charged.",
      "16. Vehicle handover and return can be arranged at a convenient time and place for both parties after prior agreement, regardless of working hours.",
      "17. SM CARS Ltd. reserves the right to terminate the contract immediately and apply related penalties in case of improper conduct or negligent treatment of our vehicles.",
    ],
  },
  vehicles: DEFAULT_CMS_VEHICLES,
};
