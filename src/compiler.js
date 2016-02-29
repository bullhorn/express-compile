import './babel-maybefill';
import path from 'path';
import mkdirp from 'mkdirp';
import _ from 'lodash';
import minimatch from 'minimatch';
import {createCompilerHostFromProjectRootSync} from './config-parser';
import chalk from 'chalk';

function buildWithBuiltIn(root, source, ignoreStyleCache) {
  let compilerHost = null;
  let rootCacheDir = path.join(root, '.cache');
  mkdirp.sync(rootCacheDir);

  try {
    compilerHost = createCompilerHostFromProjectRootSync(root, rootCacheDir, ignoreStyleCache);
  } catch (e) {
    console.error(`Couldn't set up compilers: ${e.message}`);
    throw e;
  }

  return new Promise((resolve, reject) => {
    try {
      let result = compilerHost.compileSync(source);
      resolve(result);
    } catch (e) {
      console.log();
      console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
      console.error(`Failed to compile file: ${source}`);
      if (e.message) {
        console.error(e.message);
      }
      console.error(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
      console.log();
      reject(e);
    }
  });
}

let translations = {
  less: ['Content-Type', 'text/css; charset=utf-8'],
  sass: ['Content-Type', 'text/css; charset=utf-8'],
  scss: ['Content-Type', 'text/css; charset=utf-8'],
  js: ['Content-Type', 'application/javascript; charset=utf-8'],
  ts: ['Content-Type', 'application/javascript; charset=utf-8'],
  coffee: ['Content-Type', 'application/javascript; charset=utf-8']
};

export function Compiler(options = {}) {
  let {root, paths, ignore, cwd, ignoreStyleCache} = options;

  return function (request, response, next) {
    if ('GET' != request.method.toUpperCase() && 'HEAD' != request.method.toUpperCase()) {
      return next();
    }
    try {
      let filepath = path.join(root, cwd, request.url),
        ext = path.extname(filepath).split('.')[1],
        check = paths.some((glob) => {
          var result = minimatch(filepath, glob);
          return result;
        }),
        ignored = ignore.some((glob) => {
          var result = minimatch(filepath, glob);
          return result;
        });

      if (ext && ext.length && check && !ignored) {
        console.log(chalk.yellow(`Compiling: ${filepath}`));
        buildWithBuiltIn(root, filepath, ignoreStyleCache).then((result) => {
          response.setHeader(translations[ext][0], translations[ext][1]);
          response.send(result.code);
        }).catch((err) => {
          return next();
        });
      } else {
        return next();
      }
    } catch (err) {
      console.log(err);
      return next();
    }
  }
}
