// Pictures of what a change does to how the site looks, for the pull request.
//
// Builds Storybook twice, for the base commit and for the working tree, takes
// a picture of every story in both, and keeps the stories that look
// different. AGENTS.md (at the repo root) says when to use it.
//
//   pnpm visuals                compare with where this branch left origin/main
//   pnpm visuals --base <ref>   compare with another commit
//   pnpm visuals --upload       also put the pictures on GitHub, for the PR
//   pnpm visuals button chart   only the stories whose id has one of the words
//
// The pictures and the Markdown for the PR description go to web/.visuals/.
// With --upload, the pictures are stored on the `pr-visuals` branch, and the
// Markdown links to them there.

import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { chromium } from 'playwright';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(WEB, '.visuals');
// Storybook builds of base commits, so the next run can skip the build.
const CACHE = join(WEB, 'node_modules/.cache/visuals');
// The branch on GitHub that keeps the pictures. Never merged.
const PICTURE_BRANCH = 'pr-visuals';

// The pictures are taken at twice the size, so they are sharp on a retina
// screen. Widths in the Markdown are in CSS pixels.
const VIEWPORT = { width: 1024, height: 768 };
const SCALE = 2;
// Room around the story, so shadows at its edge are not cut.
const MARGIN = 16;
const PAGES = 4;
// Pictures to take of a story at most, waiting for two in a row to match.
const STABLE_TRIES = 6;
// Entries after this many are folded away in the PR description.
const OPEN_ENTRIES = 10;
// A picture this wide or less fits next to another in a table.
const SIDE_BY_SIDE = 420;

const { values: options, positionals: filters } = parseArgs({
  allowPositionals: true,
  options: {
    base: { type: 'string' },
    upload: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (options.help) {
  // The comment at the top of this file.
  const lines = readFileSync(fileURLToPath(import.meta.url), 'utf8').split(
    '\n'
  );
  const header = lines.slice(
    0,
    lines.findIndex((line) => !line.startsWith('//'))
  );
  console.log(header.map((line) => line.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}

const ROOT = git(['rev-parse', '--show-toplevel']);

function git(args, cwd = WEB) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

/** Runs a command, and shows its output only if it fails. */
function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  if (result.status !== 0) {
    process.stderr.write(`${result.stdout ?? ''}${result.stderr ?? ''}`);
    throw new Error(`${command} ${args.join(' ')} failed in ${cwd}`);
  }
}

function findBase(ref) {
  if (ref) {
    return git(['rev-parse', '--verify', `${ref}^{commit}`]);
  }

  try {
    git(['fetch', '--quiet', 'origin', 'main']);
  } catch {
    console.warn(
      'Could not fetch origin/main. Using the copy on this machine.'
    );
  }

  return git(['merge-base', 'HEAD', 'origin/main']);
}

function buildStorybook(webDir, outDir) {
  run(
    'pnpm',
    ['exec', 'storybook', 'build', '--quiet', '--output-dir', outDir],
    webDir
  );
}

/**
 * Storybook as it was at a commit, built in a temporary git worktree.
 *
 * @returns {string|null} the build, or null if the commit has no Storybook
 */
function buildBase(sha) {
  const out = join(CACHE, sha);

  if (existsSync(join(out, 'index.json'))) {
    return out;
  }

  if (!git(['ls-tree', '--name-only', sha, 'web/.storybook/'], ROOT)) {
    return null;
  }

  const src = join(tmpdir(), `visuals-base-${sha.slice(0, 12)}-${process.pid}`);
  const srcWeb = join(src, 'web');
  const modules = join(srcWeb, 'node_modules');

  git(['worktree', 'add', '--detach', '--force', src, sha], ROOT);

  try {
    // Most branches have the same packages as their base. Then the packages
    // here are used, instead of installing them again.
    const samePackages =
      spawnSync(
        'git',
        ['diff', '--quiet', sha, '--', 'package.json', 'pnpm-lock.yaml'],
        {
          cwd: WEB,
        }
      ).status === 0;

    if (samePackages) {
      symlinkSync(join(WEB, 'node_modules'), modules, 'dir');
    } else {
      run('pnpm', ['install', '--frozen-lockfile', '--prefer-offline'], srcWeb);
    }

    rmSync(out, { recursive: true, force: true });
    buildStorybook(srcWeb, out);
  } finally {
    // Removes the link only, so the packages it points to stay.
    if (lstatSync(modules, { throwIfNoEntry: false })?.isSymbolicLink()) {
      unlinkSync(modules);
    }
    git(['worktree', 'remove', '--force', src], ROOT);
  }

  return out;
}

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
};

/** Serves a Storybook build on a free port. */
function serve(dir) {
  const server = createServer((request, response) => {
    let file = join(
      dir,
      decodeURIComponent(new URL(request.url, 'http://x').pathname)
    );

    if (!file.startsWith(dir + sep) && file !== dir) {
      response.writeHead(403).end();
      return;
    }

    if (statSync(file, { throwIfNoEntry: false })?.isDirectory()) {
      file = join(file, 'index.html');
    }

    if (!existsSync(file)) {
      response.writeHead(404).end();
      return;
    }

    response.writeHead(200, {
      'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    });
    response.end(readFileSync(file));
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, url: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

// Draws without the graphics card and with fixed colours, so the same page
// gives the same pixels every time.
const BROWSER_ARGS = [
  '--disable-gpu',
  '--force-color-profile=srgb',
  '--disable-partial-raster',
  '--disable-skia-runtime-opts',
  '--disable-lcd-text',
  '--font-render-hinting=none',
];

async function launchBrowser() {
  try {
    return await chromium.launch({ args: BROWSER_ARGS });
  } catch {
    // Playwright's own Chromium is not installed. Try the Chrome on this
    // machine.
  }

  try {
    return await chromium.launch({ channel: 'chrome', args: BROWSER_ARGS });
  } catch {
    throw new Error(
      'No browser for the pictures. Run: pnpm exec playwright install chromium'
    );
  }
}

/** A picture of one story, or the reason it has none. */
async function shoot(page, url, id) {
  await page.goto(
    `${url}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`
  );

  const state = await page
    .waitForFunction(
      () => {
        const { classList } = document.body;

        if (classList.contains('sb-show-errordisplay')) return 'error';
        if (classList.contains('sb-show-main')) return 'ok';
        return false;
      },
      null,
      { timeout: 20000 }
    )
    .then((handle) => handle.jsonValue());

  if (state === 'error') {
    const message = await page
      .locator('#error-message')
      .innerText()
      .catch(() => '');

    return { error: message.trim() || 'The story failed to draw.' };
  }

  await settle(page);

  // A story can still change after it looks done, for example when a photo
  // is drawn. The picture counts when two in a row are the same.
  let last = null;

  for (let attempt = 0; attempt < STABLE_TRIES; attempt++) {
    const clip = await measure(page);
    const png = await page.screenshot({
      ...(clip.width > 0 && clip.height > 0 ? { clip } : {}),
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
    const width = clip.width > 0 ? clip.width : VIEWPORT.width;

    if (last?.png.equals(png)) {
      return { png, width };
    }

    last = { png, width };
    await page.waitForTimeout(100);
  }

  return { ...last, unstable: true };
}

/** Waits until a story is fully drawn, and stops what moves. */
async function settle(page) {
  // A spinner that turns has a new size and angle in every picture.
  await page.addStyleTag({
    content:
      '*, *::before, *::after { animation: none !important; transition: none !important; }',
  });

  await page.evaluate(async () => {
    // Every photo, also the ones further down.
    for (const image of document.images) {
      image.loading = 'eager';
    }
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => {}))
    );

    // Every font. A font only starts to load when text needs it, which can
    // be after document.fonts.ready says all is loaded. The site's font is
    // added by a script, so it is not known before the story runs.
    await Promise.all(
      [...document.fonts].map((font) =>
        (font.status === 'unloaded' ? font.load() : font.loaded).catch(() => {})
      )
    );
    await document.fonts.ready;

    // Two frames, for components that measure themselves after they are
    // first drawn, like the chart.
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  });
}

/** The part of the page to take a picture of, in CSS pixels. */
function measure(page) {
  return page.evaluate((margin) => {
    // The box around what the story draws. The story's own box can be much
    // bigger, as wide as the page. An element with `display: contents`, like
    // the font wrapper in .storybook/preview.js, has no box of its own, so
    // its children count.
    const boxesIn = (element) =>
      [...element.children].flatMap((child) =>
        getComputedStyle(child).display === 'contents'
          ? boxesIn(child)
          : [child.getBoundingClientRect()]
      );
    const root = document.querySelector('#storybook-root');
    const boxes = boxesIn(root).filter(
      (box) => box.width > 0 && box.height > 0
    );
    const rect = boxes.length
      ? {
          left: Math.min(...boxes.map((box) => box.left)),
          top: Math.min(...boxes.map((box) => box.top)),
          right: Math.max(...boxes.map((box) => box.right)),
          bottom: Math.max(...boxes.map((box) => box.bottom)),
        }
      : root.getBoundingClientRect();
    const page = document.documentElement;
    const x = Math.max(0, Math.floor(rect.left + scrollX - margin));
    const y = Math.max(0, Math.floor(rect.top + scrollY - margin));
    const right = Math.min(
      page.scrollWidth,
      Math.ceil(rect.right + scrollX + margin)
    );
    const bottom = Math.min(
      page.scrollHeight,
      Math.ceil(rect.bottom + scrollY + margin)
    );

    return { x, y, width: right - x, height: bottom - y };
  }, MARGIN);
}

/** Pictures of every story in a build, by story id. */
async function shootAll(browser, url) {
  const index = await fetch(`${url}/index.json`).then((response) =>
    response.json()
  );
  const stories = Object.values(index.entries).filter(
    ({ type, id }) =>
      type === 'story' &&
      (!filters.length ||
        filters.some((word) => id.includes(word.toLowerCase())))
  );
  // A fresh browser profile, so nothing a story saves (like the chart's
  // chosen values) carries over.
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    reducedMotion: 'reduce',
  });
  const shots = new Map();
  const queue = [...stories];

  await Promise.all(
    Array.from({ length: PAGES }, async () => {
      const page = await context.newPage();

      while (queue.length) {
        const story = queue.shift();
        shots.set(story.id, { story, ...(await shoot(page, url, story.id)) });
      }

      await page.close();
    })
  );
  await context.close();

  return shots;
}

/** What changed between the two sets of pictures. */
function compare(before, after) {
  const entries = [];
  const errors = [];

  for (const [id, shot] of after) {
    const old = before.get(id);

    if (shot.error) {
      errors.push(`${id}: ${shot.error}`);
    } else if (!old || old.error) {
      entries.push({ id, kind: 'new', story: shot.story, after: shot });
    } else if (!shot.png.equals(old.png)) {
      entries.push({
        id,
        kind: 'changed',
        story: shot.story,
        before: old,
        after: shot,
      });
    }
  }

  for (const [id, shot] of before) {
    if (!after.has(id) && !shot.error) {
      entries.push({ id, kind: 'removed', story: shot.story, before: shot });
    }
  }

  const order = { changed: 0, new: 1, removed: 2 };
  entries.sort(
    (a, b) => order[a.kind] - order[b.kind] || a.id.localeCompare(b.id)
  );

  return { entries, errors };
}

const TITLES = { changed: 'Changed', new: 'New', removed: 'Removed' };

function image(src, width, maxWidth) {
  return `<img src="${src}" width="${Math.min(width, maxWidth)}" alt="">`;
}

/**
 * @param {(name: string) => string} src the address of a picture file
 */
function markdown({ entries }, checked, baseSha, src) {
  if (!entries.length) {
    return `No visual changes in Storybook (${checked} stories checked against ${baseSha.slice(0, 7)}).\n`;
  }

  const block = ({ id, kind, story, before, after }) => {
    const heading = `#### ${story.title.split('/').join(' / ')}: ${story.name} (${TITLES[kind].toLowerCase()})`;

    if (kind !== 'changed') {
      const shot = before ?? after;
      return `${heading}\n\n${image(src(`${id}.${before ? 'before' : 'after'}.png`), shot.width, 800)}`;
    }

    if (Math.max(before.width, after.width) <= SIDE_BY_SIDE) {
      return [
        heading,
        '',
        '| Before | After |',
        '| --- | --- |',
        `| ${image(src(`${id}.before.png`), before.width, SIDE_BY_SIDE)} | ${image(src(`${id}.after.png`), after.width, SIDE_BY_SIDE)} |`,
      ].join('\n');
    }

    return [
      heading,
      '',
      '**Before**',
      '',
      image(src(`${id}.before.png`), before.width, 800),
      '',
      '**After**',
      '',
      image(src(`${id}.after.png`), after.width, 800),
    ].join('\n');
  };

  const counts = Object.keys(TITLES)
    .map((kind) => [
      kind,
      entries.filter((entry) => entry.kind === kind).length,
    ])
    .filter(([, count]) => count)
    .map(([kind, count]) => `${count} ${kind}`)
    .join(', ');
  const open = entries.slice(0, OPEN_ENTRIES).map(block);
  const folded = entries.slice(OPEN_ENTRIES).map(block);
  const parts = [
    `## Visuals\n\nStorybook before and after this change: ${counts}, of ${checked} stories. Made with \`pnpm visuals\` against ${baseSha.slice(0, 7)}.`,
    ...open,
  ];

  if (folded.length) {
    parts.push(
      `<details>\n<summary>${folded.length} more</summary>\n\n${folded.join('\n\n')}\n\n</details>`
    );
  }

  return `${parts.join('\n\n')}\n`;
}

/** Calls the GitHub API through the gh command. */
function github(method, path, body) {
  const result = spawnSync(
    'gh',
    ['api', '-X', method, path, ...(body ? ['--input', '-'] : [])],
    {
      cwd: WEB,
      encoding: 'utf8',
      input: body ? JSON.stringify(body) : undefined,
      maxBuffer: 64 * 1024 * 1024,
    }
  );

  if (result.status !== 0) {
    const error = new Error(
      `gh api ${method} ${path}: ${result.stderr || result.stdout}`
    );
    error.notFound = /HTTP 404/.test(result.stderr);
    throw error;
  }

  return JSON.parse(result.stdout);
}

/**
 * Stores the pictures as one commit on the picture branch, without touching
 * this checkout. Each commit holds only its own pictures, and the earlier
 * commits stay in the branch history, so older PR descriptions keep working.
 *
 * @returns {(name: string) => string} the address of a stored picture
 */
function upload(names) {
  const repo = execFileSync(
    'gh',
    ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'],
    {
      cwd: WEB,
      encoding: 'utf8',
    }
  ).trim();
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const folder = `${branch}/${new Date().toISOString().replace(/[:.]/g, '-')}`;

  const tree = names.map((name) => ({
    path: `${folder}/${name}`,
    mode: '100644',
    type: 'blob',
    sha: github('POST', `repos/${repo}/git/blobs`, {
      content: readFileSync(join(OUT, name)).toString('base64'),
      encoding: 'base64',
    }).sha,
  }));
  const treeSha = github('POST', `repos/${repo}/git/trees`, { tree }).sha;

  // Another PR can store its pictures at the same time. Then the branch has
  // moved, and this tries again on top of it.
  for (let attempt = 0; attempt < 5; attempt++) {
    let parent = null;

    try {
      parent = github('GET', `repos/${repo}/git/ref/heads/${PICTURE_BRANCH}`)
        .object.sha;
    } catch (error) {
      if (!error.notFound) throw error;
    }

    const commit = github('POST', `repos/${repo}/git/commits`, {
      message: `Pictures for ${branch}`,
      tree: treeSha,
      parents: parent ? [parent] : [],
    }).sha;

    try {
      if (parent) {
        github('PATCH', `repos/${repo}/git/refs/heads/${PICTURE_BRANCH}`, {
          sha: commit,
        });
      } else {
        github('POST', `repos/${repo}/git/refs`, {
          ref: `refs/heads/${PICTURE_BRANCH}`,
          sha: commit,
        });
      }

      return (name) =>
        `https://github.com/${repo}/blob/${commit}/${encodeURI(`${folder}/${name}`)}?raw=true`;
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
}

async function main() {
  const baseSha = findBase(options.base);
  const headOut = join(tmpdir(), `visuals-head-${process.pid}`);

  console.log(`Building Storybook for ${baseSha.slice(0, 7)} (base)...`);
  const baseOut = buildBase(baseSha);
  if (!baseOut) {
    console.log('The base has no Storybook. Every story counts as new.');
  }

  console.log('Building Storybook for the working tree...');
  buildStorybook(WEB, headOut);

  const browser = await launchBrowser();
  const servers = [];

  try {
    const headServer = await serve(headOut);
    servers.push(headServer.server);

    let before = new Map();
    if (baseOut) {
      const baseServer = await serve(baseOut);
      servers.push(baseServer.server);
      console.log('Taking pictures of the base...');
      before = await shootAll(browser, baseServer.url);
    }

    console.log('Taking pictures of the working tree...');
    const after = await shootAll(browser, headServer.url);
    const result = compare(before, after);

    rmSync(OUT, { recursive: true, force: true });
    mkdirSync(OUT, { recursive: true });

    const names = [];
    for (const { id, before: old, after: shot } of result.entries) {
      for (const [side, picture] of [
        ['before', old],
        ['after', shot],
      ]) {
        if (picture) {
          const name = `${id}.${side}.png`;
          writeFileSync(join(OUT, name), picture.png);
          names.push(name);
        }
      }
    }

    // Without --upload the Markdown points at the files next to it, to look
    // at before uploading.
    let src = (name) => name;
    if (options.upload && names.length) {
      console.log(
        `Storing ${names.length} pictures on the ${PICTURE_BRANCH} branch...`
      );
      src = upload(names);
    }

    const text = markdown(result, after.size, baseSha, src);
    writeFileSync(join(OUT, 'visuals.md'), text);

    const count = (kind) =>
      result.entries.filter((entry) => entry.kind === kind).length;
    console.log(
      `\n${after.size} stories checked. Changed: ${count('changed')}, new: ${count('new')}, removed: ${count('removed')}.`
    );
    console.log(`Pictures and Markdown: ${OUT}`);

    if (options.upload) {
      console.log('\nFor the PR description:\n');
      console.log(text);
    }

    if (result.errors.length) {
      console.error(
        `\nThese stories failed to draw:\n${result.errors.join('\n')}`
      );
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    for (const server of servers) server.close();
    rmSync(headOut, { recursive: true, force: true });
  }
}

await main();
