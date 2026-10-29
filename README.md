# Khema KaMuLour website (draft for review)

Static site, no build step. Open `index.html` in a browser, or publish with GitHub Pages.

## Put it on GitHub Pages
1. Create a new repository (e.g. `KhemaKaMuLour`) on GitHub.
2. Upload everything in this folder (`index.html`, `style.css`, `images/`, `README.md`).
3. Repository → Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)` → Save.
4. The site appears at `https://<your-username>.github.io/KhemaKaMuLour/` after a minute or two.

## Placeholders to replace before going live
- Thai spelling of the full name (currently only "เขมา")
- WhatsApp number and reservations email: set once at the top of `booking.js` (`KHEMA.WHATSAPP`, `KHEMA.EMAIL`), and in the links in `index.html`
- Google Maps link (currently a search for "Pattaya")
- Villa photos, room types and rates (section "The villas")

## Photos
All photos are from the October 2026 site visit, resized for web. Photos with people's faces or scaffolding were left out.

## Booking (`book.html` + `booking.js`)
GitHub Pages has no server, so booking works as a **request**: the guest picks dates, party size, villa type and extras, and the form writes it up as a message sent to the team on WhatsApp or by email. Nothing is charged; the team replies to confirm villa, rate and deposit.

- Contact details live only in the `KHEMA` object at the top of `booking.js`.
- Links can pre-fill the form: `book.html?checkin=2027-01-10&checkout=2027-01-13&adults=6&children=2` (useful for ads and Instagram).
- When a booking engine / channel manager is chosen at opening, put its booking-page URL in `KHEMA.BOOKING_ENGINE_URL`; the same form will then send guests there with their dates and party filled in (parameter names may need adjusting to the engine).
- Villa names ("Pool villa", "The special zone") are placeholders until the real villa types are final.
