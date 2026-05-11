# SM Cars staging admin

Това е изолиран тестов admin панел за бъдещия CMS.

## Какво покрива в момента

- вход с `email + password` през Supabase Auth
- `draft` и `published` snapshots
- запис на базови настройки в `draft`
- ръчно публикуване чрез `publish_cms_draft()`
- JSON preview на текущата чернова

## Какво още не е вързано

- редактор за превозни средства
- upload на снимки
- availability / скриване от сайта
- истински preview на публичната страница
- публичният сайт още не чете данни от Supabase

## Setup за staging

1. В Supabase -> SQL Editor изпълни:
   - `site-only/admin/supabase-schema.sql`
   - `site-only/admin/supabase-seed.sql`
   - `site-only/admin/supabase-storage.sql`
2. В Supabase -> Authentication -> Users:
   - създай user с `nskilledlol@gmail.com`
   - задай парола
3. В Supabase -> Authentication -> URL Configuration:
   - `Site URL`: `http://127.0.0.1:5501/site-only/admin/`
   - `Redirect URLs`:
     - `http://127.0.0.1:5501/site-only/admin/`
     - `http://localhost:5501/site-only/admin/`
     - `http://127.0.0.1:5501/site-only/index.html`
     - `http://localhost:5501/site-only/index.html`
4. Стартирай локален static server от workspace root.
5. Отвори:
   - `http://127.0.0.1:5501/site-only/admin/index.html`

## Storage setup

- bucket: `vehicle-images`
- bucket-ът е public в staging, за да може localhost демото да показва качените снимки веднага
- upload правят само authenticated admin users според policy-тата в `site-only/admin/supabase-storage.sql`

## Следващ implementation phase

1. миграция на текущите hardcoded данни към `vehicles` масива в snapshot-а
2. визуален редактор за коли, мотори и товарни
3. availability и подредба
4. storage bucket за снимки
5. публичният сайт да чете `published` snapshot-а
