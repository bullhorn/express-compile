import './babel-maybefill';
import _ from 'lodash';

import * as configParser from './config-parser';

import CompilerHost from './compiler-host';
import FileChangedCache from './file-change-cache';
import CompileCache from './compile-cache';

export * from './compiler';

export default _.assign({},
  configParser,
  {
    CompilerHost,
    FileChangedCache,
    CompileCache
  }
);
