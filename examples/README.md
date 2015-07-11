<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=120px  src="https://cloud.githubusercontent.com/assets/8317250/8430194/35c6043a-1f6a-11e5-8cbd-af6cc86baa84.png">
  </a>
</div>

# Examples

## Instructions

To run the examples please build the `examples` project first.

```
fly -f examples/
```

The above will automatically search `examples/` for the first valid Flyfile. This installs the necessary node packages and illustrates a simple task example.

> The above may take a few minutes to finish. If you encounter any problems, just try `npm i` inside `examples`


## Where do I start?

Inside `examples/` you will find several directories, each containing one or more Flyfiles.

To run a specific `Flyfile`:

```
fly -f examples/path/to/Flyfile.ext
```

In practice, just typing `fly` is often enough.

## JavaScript Variants

In order to run Flyfiles written in other JavaScript variants, you need to download the appropriate npm package to _transpile_ your Flyfile on the _fly_.

For example, `npm i coffee-script` for coffee script.

:heart:
