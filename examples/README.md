<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=120px  src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
  </a>
</div>

# Examples

## Instructions

To try any of the examples _please build_ the `examples` project first:

```
fly -f examples/
```

This will load Fly with `Flyfile.babel.js` and install the necessary node packages in each of the sample directories.

> The above may take a few minutes to finish.

## Where to start?

It's up to you. Inside `examples/` there are several directories, each containing one or more Flyfiles.

To run any sample:

```
fly -f examples/path/to/sample
```

> ### Note
Flyfiles written in ES7 have been saved as `Flypath.babel.js`. Use the full path to run them:

```
fly -f examples/path/to/sample/Flypath.babel.js
```

## JavaScript Variants

In order to run Flyfiles written in other JavaScript variants, you need to download the appropriate `npm` package to _transpile_ your Flyfile on the _fly_.

For example, `coffee-script` for CoffeeScript.

> Flyfiles written in ES6/7 work out of the box.
