/* Khema KaMuLour: booking requests.
 * The site has no server, so a request is written up as a message and handed to
 * WhatsApp or the guest's email app. Change the contact details here only.
 * When a booking engine is chosen at opening, set BOOKING_ENGINE_URL and the
 * form will send guests there with their dates and party already filled in. */
const KHEMA = {
  WHATSAPP: '66000000000',          // country code + number, digits only (placeholder)
  EMAIL: 'hello@example.com',       // reservations email (placeholder)
  BOOKING_ENGINE_URL: '',           // e.g. a channel-manager booking page; empty = request mode
  MIN_NIGHTS: 1,
};

(function () {
  const form = document.getElementById('booking');
  const inEl = document.getElementById('checkin');
  const outEl = document.getElementById('checkout');
  const nightsEl = document.getElementById('nights');
  const kids = document.getElementById('children');
  const kidsHint = document.getElementById('children-hint');
  const errEl = document.getElementById('form-error');
  const done = document.getElementById('done');

  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const parse = s => (s ? new Date(s + 'T00:00:00') : null);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const pretty = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const nightsBetween = (a, b) => Math.round((b - a) / 86400000);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  inEl.min = iso(today);
  outEl.min = iso(addDays(today, KHEMA.MIN_NIGHTS));

  // Pre-fill from the URL, e.g. book.html?checkin=2027-01-10&checkout=2027-01-13&adults=6
  const q = new URLSearchParams(location.search);
  ['checkin', 'checkout', 'adults', 'children'].forEach(k => { if (q.get(k) && form[k]) form[k].value = q.get(k); });

  function updateDates() {
    const a = parse(inEl.value), b = parse(outEl.value);
    if (a) {
      outEl.min = iso(addDays(a, KHEMA.MIN_NIGHTS));
      if (!b || b <= a) outEl.value = iso(addDays(a, Math.max(2, KHEMA.MIN_NIGHTS)));
    }
    const a2 = parse(inEl.value), b2 = parse(outEl.value);
    if (a2 && b2 && b2 > a2) {
      const n = nightsBetween(a2, b2);
      nightsEl.textContent = `${n} night${n === 1 ? '' : 's'} · ${pretty(a2)} to ${pretty(b2)}`;
    } else {
      nightsEl.textContent = '';
    }
  }
  inEl.addEventListener('change', updateDates);
  outEl.addEventListener('change', updateDates);
  kids.addEventListener('input', () => { kidsHint.hidden = !(Number(kids.value) > 0); });
  form.addEventListener('input', () => { errEl.hidden = true; });
  updateDates();
  kidsHint.hidden = !(Number(kids.value) > 0);

  function check() {
    const a = parse(inEl.value), b = parse(outEl.value);
    if (!a || !b) return ['Please choose the day you arrive and the day you leave.', inEl];
    if (a < today) return ['The arrival day has already passed.', inEl];
    if (nightsBetween(a, b) < KHEMA.MIN_NIGHTS) return ['The day you leave needs to be after the day you arrive.', outEl];
    if (!(Number(form.adults.value) >= 1)) return ['Please tell us how many adults are coming.', form.adults];
    if (!form.name.value.trim()) return ['Please tell us your name.', form.name];
    if (!form.email.value.trim() || !form.email.checkValidity()) return ['Please give an email we can reply to.', form.email];
    return null;
  }

  function writeUp() {
    const a = parse(inEl.value), b = parse(outEl.value);
    const n = nightsBetween(a, b);
    const extras = [...form.querySelectorAll('input[name="extras"]:checked')].map(x => x.value);
    const kidsN = Number(form.children.value) || 0;
    const lines = [
      'Booking request: Khema KaMuLour',
      '',
      `Dates: ${pretty(a)} to ${pretty(b)} (${n} night${n === 1 ? '' : 's'})${form.flexible.checked ? ', flexible' : ''}`,
      `Guests: ${form.adults.value} adult${form.adults.value === '1' ? '' : 's'}${kidsN ? `, ${kidsN} child${kidsN === 1 ? '' : 'ren'}` : ''}`,
      `Villa: ${form.villa.value}`,
    ];
    if (form.occasion.value) lines.push(`Occasion: ${form.occasion.value}`);
    if (extras.length) lines.push(`Please arrange: ${extras.join(', ')}`);
    if (form.message.value.trim()) lines.push('', form.message.value.trim());
    lines.push('', `Name: ${form.name.value.trim()}`);
    if (form.country.value.trim()) lines.push(`Country: ${form.country.value.trim()}`);
    lines.push(`Email: ${form.email.value.trim()}`);
    if (form.phone.value.trim()) lines.push(`Phone: ${form.phone.value.trim()}`);
    return lines.join('\n');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const problem = check();
    if (problem) {
      errEl.textContent = problem[0];
      errEl.hidden = false;
      problem[1].focus();
      return;
    }
    errEl.hidden = true;

    if (KHEMA.BOOKING_ENGINE_URL) {
      const u = new URL(KHEMA.BOOKING_ENGINE_URL);
      u.searchParams.set('checkin', inEl.value);
      u.searchParams.set('checkout', outEl.value);
      u.searchParams.set('adults', form.adults.value);
      u.searchParams.set('children', form.children.value || '0');
      location.href = u.toString();
      return;
    }

    const text = writeUp();
    const via = (e.submitter && e.submitter.value) || 'whatsapp';
    const subject = `Booking request: ${inEl.value} to ${outEl.value}, ${form.name.value.trim()}`;
    const wa = `https://wa.me/${KHEMA.WHATSAPP}?text=${encodeURIComponent(text)}`;
    const mail = `mailto:${KHEMA.EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

    document.getElementById('summary').textContent = text;
    document.getElementById('direct').innerHTML =
      `<a href="${wa}" target="_blank" rel="noopener">Open WhatsApp</a>` +
      `<a href="${mail}">Open email</a>` +
      `<button type="button" class="linklike" id="copy">Copy the request</button>`;
    document.getElementById('copy').addEventListener('click', ev => {
      navigator.clipboard && navigator.clipboard.writeText(text).then(() => { ev.target.textContent = 'Copied'; });
    });

    form.hidden = true;
    done.hidden = false;
    done.focus();

    if (via === 'email') location.href = mail;
    else window.open(wa, '_blank', 'noopener');
  });

  document.getElementById('again').addEventListener('click', e => {
    e.preventDefault();
    done.hidden = true;
    form.hidden = false;
    inEl.focus();
  });
})();
