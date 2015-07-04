<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=120px  src="https://cloud.githubusercontent.com/assets/8317250/8430194/35c6043a-1f6a-11e5-8cbd-af6cc86baa84.png">
  </a>
</div>

# Examples

Flyfiles at the root of this directory are written in different JavaScript variants, but describe the same tasks.

The directories `babel`, `coffee`, `lint`, `map`, `spec`, etc., contain dummy files and sub directories to illustrate basic IO transformations and code analysis with Fly.

## Instructions

To run the examples:

```
fly -f examples/
```

The above will automatically search the specified directory for the first valid JavaScript variant, in this case `Flyfile.js`. You can specify other Flyfiles as well:

```
fly -f examples/Flyfile.babel.js
```

In practice, just typing `fly` is often enough.

## Other Formats

In order to succesfuly run `Flyfile.coffee` or your own `Flyfile.xxx` you will need to download the appropriate npm package to _transpile_ your Flyfile on the _fly_.

For example, `npm i coffee-script` for coffee script.

:heart:
