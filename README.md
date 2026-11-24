# Spoke Bike Rentals

A bike-rental practice demo with a sample fleet. Browse bikes by name and type, estimate a rental for 1–12 hours, and rent or return available bikes. The Rented Bikes page totals the hourly rates of all active rentals.

**Live demo**  
Vercel deployment pending.

## Local setup

Requires Node.js 20 or newer. There are no package dependencies or environment variables.

```sh
git clone https://github.com/dev-sarthi/bike-rental-practice-demo.git
cd bike-rental-practice-demo
npm run dev
```

Open http://localhost:4173. Run `npm run build` to generate the production files in `dist/` and `npm run preview` to serve them locally. Rebuild after editing the source.

Rental state is stored in the current browser using local storage. Rent records the selected hours, and the Rented Bikes hourly total is the sum of the individual hourly rates. Maintenance bikes cannot be rented.

Vercel uses the checked-in `vercel.json`. The build produces a static HTML file for every bike details URL so it can be opened directly or refreshed.
