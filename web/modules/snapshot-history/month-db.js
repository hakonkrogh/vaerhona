// The browser's local database of snapshot values: one record per place per
// month. See docs/client-storage-design.md.
//
// It is only a copy of what the server has, so it may be empty, cleared by the
// browser, or missing. Nothing may depend on it being there.
//
// A record is { place, month, coveredTo, imageBase, columns }. `month` is a
// UTC month such as "2024-06", and `coveredTo` is the time the record is
// complete up to. A meta record is { place, v, usedAt }.

const DB_NAME = 'vaerhona';
const DB_VERSION = 1;
const MONTHS = 'months';
const META = 'meta';

/** A database that lives only as long as the page. */
export function createMemoryDb() {
  const months = new Map();
  const meta = new Map();
  const key = (place, month) => `${place} ${month}`;

  return {
    async get(place, month) {
      return months.get(key(place, month));
    },
    async put(record) {
      months.set(key(record.place, record.month), record);
    },
    async list(place) {
      return [...months.values()].filter((record) => record.place === place);
    },
    async clearPlace(place) {
      for (const [id, record] of months) {
        if (record.place === place) {
          months.delete(id);
        }
      }
      meta.delete(place);
    },
    async getMeta(place) {
      return meta.get(place);
    },
    async putMeta(record) {
      meta.set(record.place, record);
    },
    async listMeta() {
      return [...meta.values()];
    },
  };
}

function done(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function open(factory) {
  return new Promise((resolve, reject) => {
    const request = factory.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      db.createObjectStore(MONTHS, { keyPath: ['place', 'month'] });
      db.createObjectStore(META, { keyPath: 'place' });
    };
    request.onsuccess = () => {
      const db = request.result;

      // Another tab with newer code wants to upgrade the database.
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB is blocked'));
  });
}

/** The same database in IndexedDB. Its methods reject when storage fails. */
export function createIndexedDb(factory) {
  let opened;

  async function store(name, mode) {
    opened ??= open(factory);

    return (await opened).transaction(name, mode).objectStore(name);
  }

  // Every month of a place. "￿" sorts after any month.
  const placeRange = (place) => IDBKeyRange.bound([place, ''], [place, '￿']);

  return {
    async get(place, month) {
      return done((await store(MONTHS, 'readonly')).get([place, month]));
    },
    async put(record) {
      await done((await store(MONTHS, 'readwrite')).put(record));
    },
    async list(place) {
      return done((await store(MONTHS, 'readonly')).getAll(placeRange(place)));
    },
    async clearPlace(place) {
      await done((await store(MONTHS, 'readwrite')).delete(placeRange(place)));
      await done((await store(META, 'readwrite')).delete(place));
    },
    async getMeta(place) {
      return done((await store(META, 'readonly')).get(place));
    },
    async putMeta(record) {
      await done((await store(META, 'readwrite')).put(record));
    },
    async listMeta() {
      return done((await store(META, 'readonly')).getAll());
    },
  };
}

/**
 * The local database. It uses IndexedDB, and moves to memory for the rest of
 * the page view the first time storage fails: in some private modes, when the
 * disk is full, or when the user has blocked storage. Its methods never
 * reject.
 *
 * @param {object} [persistent] a database from createIndexedDb, or nothing to
 * use the browser's IndexedDB
 */
export function openMonthDb(persistent) {
  const memory = createMemoryDb();
  let db = persistent;

  if (db === undefined) {
    db = globalThis.indexedDB ? createIndexedDb(globalThis.indexedDB) : null;
  }

  const method =
    (name) =>
    async (...args) => {
      if (db) {
        try {
          return await db[name](...args);
        } catch (err) {
          console.warn('[history] local storage failed, using memory', err);
          db = null;
        }
      }

      return memory[name](...args);
    };

  return Object.fromEntries(
    Object.keys(memory).map((name) => [name, method(name)])
  );
}
