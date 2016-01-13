import './babel-maybefill';
import path from 'path';
import mkdirp from 'mkdirp';
import _ from 'lodash';
import minimatch from 'minimatch';
import { createCompilerHostFromProjectRootSync } from './config-parser';

function buildWithBuiltIn(root, source) {
  let compilerHost = null;
  let rootCacheDir = path.join(root, '.cache');
  mkdirp.sync(rootCacheDir);

  try {
    compilerHost = createCompilerHostFromProjectRootSync(root, rootCacheDir);
  } catch (e) {
    console.error(`Couldn't set up compilers: ${e.message}`);
    throw e;
  }

  return new Promise((resolve, reject) => {
    try {
      let result = compilerHost.compileSync(source);
      resolve(result);
    } catch (e) {
      console.error(`Failed to compile file: ${source}`);
      console.error(e.message);
      reject(e);
    }
  });
}

export function Compiler(options = {}) {
  let {root, paths, ignore, cwd} = options;

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
        console.log(`Compiling ${filepath}`);
        buildWithBuiltIn(root, filepath).then((result) => {
          response.setHeader('Content-Type', result.mimeType);
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
