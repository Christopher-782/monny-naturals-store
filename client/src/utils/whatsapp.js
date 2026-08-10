export function cleanWhatsAppNumber(value) {
  let clean = String(value || '').replace(/\D/g, '');

  // Accept Nigerian local numbers such as 08067823352 and convert
  // them to the international format required by wa.me links.
  if (/^0\d{10}$/.test(clean)) clean = `234${clean.slice(1)}`;
  if (/^2340\d{10}$/.test(clean)) clean = `234${clean.slice(4)}`;

  return clean;
}

export function whatsappUrl(number, message = '') {
  const clean = cleanWhatsAppNumber(number);
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
