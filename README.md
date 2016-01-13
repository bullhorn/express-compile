## express-compile

express-compile is middleware that compiles JS and CSS on the fly within your express application.  This project is based off the express-compile [express-compile](https://github.com/paulcbetts/express-compile) project and uses the same compilers.

For JavaScript:

* JavaScript ES6/ES7 (via Babel)
* TypeScript
* CoffeeScript

For CSS:

* LESS
* Sass/SCSS

### How does it work?

Put this at the top of your Express app:

```js
import {Compiler} from 'express-compile';

app.use(Compiler({
    root: '.',
    cwd: 'public',
    paths: ['public/**/*'],
    ignore: ['public/node_modules/**/*'],
    ignoreStyleCache: true
}));
app.use(express.static('/public'));

```

### Something isn't working / I'm getting weird errors

express-compile uses the [debug module](https://github.com/visionmedia/debug), set the DEBUG environment variable to debug what express-compile is doing:

```sh
## Debug just express-compile
DEBUG=express-compile:* npm start

## Grab everything except for Babel which is very noisy
DEBUG=*,-babel npm start
```

### How do I set up (Babel / LESS / whatever) the way I want?

If you've got a `.babelrc` and that's all you want to customize, you can simply use it directly. express-compile will respect it, even the environment-specific settings. If you want to customize other compilers, use a `.compilerc` file. Here's an example:

```js
{
  "application/javascript": {
    "presets": ["stage-0", "es2015", "react"],
    "sourceMaps": "inline"
  },
  "text/less": {
    "dumpLineNumbers": "comments"
  }
}
```

`.compilerc` also accepts environments with the same syntax as `.babelrc`:

```js
{
  "env": {
    "development": {
      "application/javascript": {
        "presets": ["stage-0", "es2015", "react"],
        "sourceMaps": "inline"
      },
      "text/less": {
        "dumpLineNumbers": "comments"
      }
    },
    "production": {
      "application/javascript": {
        "presets": ["stage-0", "es2015", "react"]
        "sourceMaps": "none"
      }
    }
  }
}
```

The opening Object is a list of MIME Types, and options passed to the compiler implementation. These parameters are documented here:

* Babel - http://babeljs.io/docs/usage/options
* CoffeeScript - http://coffeescript.org/documentation/docs/coffee-script.html#section-5
* TypeScript - https://github.com/Microsoft/TypeScript/blob/v1.5.0-beta/bin/typescriptServices.d.ts#L1076
* LESS - http://lesscss.org/usage/index.html#command-line-usage-options
* Jade - http://jade-lang.com/api

## How can I precompile my code for release-time?

express-compile comes with a command-line application to pre-create a cache for you.

```sh
Usage: express-compile --appDir [root-app-dir] paths...

Options:
  -a, --appdir  The top-level application directory (i.e. where your
                package.json is)
  -v, --verbose  Print verbose information
  -h, --help     Show help
```

Run `express-compile` on all of your application assets, even if they aren't strictly code (i.e. your static assets like PNGs). express-compile will recursively walk the given directories.

```sh
express-compile --appDir /path/to/my/app ./src ./static
```
