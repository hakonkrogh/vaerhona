export function prettyDate (date) {
  date = ensureDateObject(date);

  const format = new Intl.DateTimeFormat('no', {
    weekday: 'long',
    year: 'numeric',
    month: 'narrow'
  });
  return format.format(date);
}

export function prettyDateTime (date) {
  date = ensureDateObject(date);

  const format = new Intl.DateTimeFormat('no', {
    weekday: 'long',
    year: 'numeric',
    month: 'narrow',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
  return format.format(date);
}

function ensureDateObject (mixed) {
  if (typeof mixed === 'string') {
    return new Date(mixed);
  }

  if (mixed instanceof Date) {
    return mixed;
  }

  throw new Error('Can not convert to date object', mixed);
}