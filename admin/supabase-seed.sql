insert into public.admin_users (email, full_name)
values ('nskilledlol@gmail.com', 'Nikolay')
on conflict (email) do update
set full_name = excluded.full_name,
    is_active = true;

insert into public.cms_snapshots (
  stage,
  content,
  revision,
  updated_by,
  published_at,
  published_by
)
values
  (
    'draft',
    '{
      "siteSettings": {
        "companyName": "SM Cars",
        "phone": "+359894428975",
        "email": "smcarsltd3@gmail.com",
        "address": {
          "bg": "бул. Велики Преслав 234, кв. Дивдядово, Шумен",
          "en": "234 Veliki Preslav Blvd, Divdyadovo, Shumen"
        }
      },
      "hero": {
        "priceLine": {
          "bg": "Цени от 11€ на ден",
          "en": "Prices from 11€ per day"
        }
      },
      "shuttleRoutes": [
        {
          "airport": {
            "bg": "Летище Аурел Влайку Букурещ",
            "en": "Aurel Vlaicu Airport Bucharest"
          },
          "price": "200€ / 250€"
        },
        {
          "airport": {
            "bg": "Летище Анри Коанда Букурещ",
            "en": "Henri Coanda Airport Bucharest"
          },
          "price": "200€ / 250€"
        },
        {
          "airport": {
            "bg": "Международно летище Варна",
            "en": "Varna International Airport"
          },
          "price": "100€ / 150€"
        },
        {
          "airport": {
            "bg": "Международно летище Васил Левски София",
            "en": "Vasil Levski Sofia International Airport"
          },
          "price": "300€ / 400€"
        },
        {
          "airport": {
            "bg": "Летище Бургас",
            "en": "Burgas Airport"
          },
          "price": "120€ / 170€"
        }
      ],
      "seasonalRules": [
        {
          "key": "low",
          "label": "Нисък клас",
          "surchargePerDay": 3,
          "periods": ["01-06 -> 31-08", "01-12 -> 08-01"]
        },
        {
          "key": "middle",
          "label": "Среден клас",
          "surchargePerDay": 5,
          "periods": ["01-06 -> 31-08", "01-12 -> 08-01"]
        },
        {
          "key": "high",
          "label": "Висок клас",
          "surchargePerDay": 10,
          "periods": ["01-06 -> 31-08", "01-12 -> 08-01"]
        },
        {
          "key": "truck",
          "label": "Товарни",
          "surchargePerDay": 5,
          "periods": ["01-06 -> 31-08", "01-12 -> 08-01"]
        }
      ],
      "rentalTerms": {
        "bg": [
          "Посочените цени за наем са за период от 24 часа. Всички наши цени са с включено ДДС.",
          "За автомобили нисък клас НЕ СЕ ЗАПЛАЩА ДЕПОЗИТ.",
          "Неограничен пробег.",
          "Поддръжка на автомобила.",
          "При евентуален технически проблем с превозното средство СМ КАРС ЕООД се задължава да ви подсигури друго такова."
        ],
        "en": [
          "The listed rental prices are for a 24-hour period and include VAT.",
          "No deposit is required for low-class vehicles.",
          "Unlimited mileage.",
          "Vehicle maintenance is included.",
          "In the event of a technical issue, SM CARS Ltd. will provide a replacement vehicle."
        ]
      },
      "vehicles": []
    }'::jsonb,
    1,
    'nskilledlol@gmail.com',
    null,
    null
  ),
  (
    'published',
    '{
      "siteSettings": {
        "companyName": "SM Cars",
        "phone": "+359894428975",
        "email": "smcarsltd3@gmail.com",
        "address": {
          "bg": "бул. Велики Преслав 234, кв. Дивдядово, Шумен",
          "en": "234 Veliki Preslav Blvd, Divdyadovo, Shumen"
        }
      },
      "hero": {
        "priceLine": {
          "bg": "Цени от 11€ на ден",
          "en": "Prices from 11€ per day"
        }
      },
      "shuttleRoutes": [
        {
          "airport": {
            "bg": "Летище Аурел Влайку Букурещ",
            "en": "Aurel Vlaicu Airport Bucharest"
          },
          "price": "200€ / 250€"
        },
        {
          "airport": {
            "bg": "Летище Анри Коанда Букурещ",
            "en": "Henri Coanda Airport Bucharest"
          },
          "price": "200€ / 250€"
        },
        {
          "airport": {
            "bg": "Международно летище Варна",
            "en": "Varna International Airport"
          },
          "price": "100€ / 150€"
        },
        {
          "airport": {
            "bg": "Международно летище Васил Левски София",
            "en": "Vasil Levski Sofia International Airport"
          },
          "price": "300€ / 400€"
        },
        {
          "airport": {
            "bg": "Летище Бургас",
            "en": "Burgas Airport"
          },
          "price": "120€ / 170€"
        }
      ],
      "seasonalRules": [
        {
          "key": "low",
          "label": "Нисък клас",
          "surchargePerDay": 3,
          "periods": ["01-06 -> 31-08", "01-12 -> 08-01"]
        },
        {
          "key": "middle",
          "label": "Среден клас",
          "surchargePerDay": 5,
          "periods": ["01-06 -> 31-08", "01-12 -> 08-01"]
        },
        {
          "key": "high",
          "label": "Висок клас",
          "surchargePerDay": 10,
          "periods": ["01-06 -> 31-08", "01-12 -> 08-01"]
        },
        {
          "key": "truck",
          "label": "Товарни",
          "surchargePerDay": 5,
          "periods": ["01-06 -> 31-08", "01-12 -> 08-01"]
        }
      ],
      "rentalTerms": {
        "bg": [
          "Посочените цени за наем са за период от 24 часа. Всички наши цени са с включено ДДС.",
          "За автомобили нисък клас НЕ СЕ ЗАПЛАЩА ДЕПОЗИТ.",
          "Неограничен пробег.",
          "Поддръжка на автомобила.",
          "При евентуален технически проблем с превозното средство СМ КАРС ЕООД се задължава да ви подсигури друго такова."
        ],
        "en": [
          "The listed rental prices are for a 24-hour period and include VAT.",
          "No deposit is required for low-class vehicles.",
          "Unlimited mileage.",
          "Vehicle maintenance is included.",
          "In the event of a technical issue, SM CARS Ltd. will provide a replacement vehicle."
        ]
      },
      "vehicles": []
    }'::jsonb,
    1,
    'nskilledlol@gmail.com',
    now(),
    'nskilledlol@gmail.com'
  )
on conflict (stage) do nothing;
