# ETS frontend

Vue 3, PrimeVue, TanStack Query. Node 24 (`nvm use`).

```sh
cp .env.example .env
npm install
npm run dev   # http://al-hazam.localhost:5173, the subdomain picks the company
```

Logins are in the backend README.

## Things to remember

- `src/shared` is copied from the backend, don't edit it here: `npm run sync:shared`.
- All text goes in `src/i18n/locales/en.json` and `ur.json` (a missing Urdu key fails the
  build). Use logical Tailwind classes (`ms-*`, `start-*`) so right-to-left Urdu works.
- `<AccessControl>` and `meta.permission` only hide things, the API enforces permissions.
