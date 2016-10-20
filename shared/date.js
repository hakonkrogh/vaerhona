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
    hour: '2-digit',
    minute: '2-digit'
  });

  return format.format(date);
}

export function prettyTime (date) {
  date = ensureDateObject(date);

  const format = new Intl.DateTimeFormat('no', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return format.format(date);
}

function ensureDateObject (mixed) {
  if (typeof mixed === 'string' || typeof mixed === 'number') {
    return new Date(mixed);
  }

  if (mixed instanceof Date) {
    return mixed;
  }

  console.warn('Can not convert to date object', typeof mixed);

  return new Date();
}