import fs from 'fs';
import LRUCache from 'lru-cache';

const d = require('debug')('express-compile:sanitize-paths');
const realpathCache = LRUCache({max: 32});

function cachedRealpath(p) {
  let ret = realpathCache.get(p);
  if (ret) return ret;

  ret = fs.realpathSync(p);
  d(`Cache miss for cachedRealpath: '${p}' => '${ret}'`);

  realpathCache.set(p, ret);
  return ret;
}

/**
 * Express will sometimes hand us paths that don't match the platform if they
 * were derived from a URL (i.e. 'C:/Users/Paul/...'), whereas the cache will have
 * saved paths with backslashes.
 *
 * @private
 */
export default function sanitizeFilePath(file) {
  if (!file) return file;

  // NB: Some people add symlinks into system directories. node.js will internally
  // call realpath on paths that it finds, which will break our cache resolution.
  // We need to catch this scenario and fix it up.

  let realFile = cachedRealpath(file);
  let ret = realFile.replace(/[\\\/]/g, '/');
  return ret.toLowerCase();
}
