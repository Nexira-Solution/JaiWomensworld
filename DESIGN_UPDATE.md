# Jai Womens World – UI upgrade notes

Run: `npm install` then `npm run dev` (keep your own `.env` with MONGODB_URI etc.).

## New / rewritten files
- components/home/Hero.jsx – landing hero (arch frame, floating pills). Shown when no admin banners exist.
- components/home/CategoryShowcase.jsx – clothesline "Shop by Category" (uses DB categories).
- components/ProductCard.js – hanger card, hover (desktop) / tap chevron (mobile) quick shop.
- components/RelatedProducts.jsx – swipeable related products row (product page + cart page).
- components/CartRecommendations.jsx – "Complete Your Look" row on the cart page.
- components/Decor.jsx, components/Reveal.jsx – blossoms, silk waves, petals, scroll reveal.
- lib/cardProduct.js – card data shaping (+ CARD_SELECT query projection).

## Changed
- Palette remapped across the site (tailwind.config.js, app/globals.css, all components).
- Navbar, Footer, BottomNav (now mounted on mobile), home page, product page related section.
- formatINR now prints the ₹ symbol instead of "Rs.".

## Images
Category photos are in public/images/categories/. Replace them with higher-resolution files
of the same names, or upload category/banner/product images in the admin panel.
