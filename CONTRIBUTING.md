<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=120px  src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
  </a>
</div>

<br>

<p align="center">
<b><a href="#issues">Issues</a></b>
|
<b><a href="#plugin-repositories">Plugin Repositories</a></b>
|
<b><a href="#commit-messages">Commit Messages</a></b>
|
<b><a href="#code-style">Code Style</a></b>
</p>

# Contributing

Thanks for taking the time to read this guide and please _do_ contribute to Fly. Everyone is welcome. :metal:

## Issues

Please [open an issue](https://github.com/flyjs/fly/issues) for bug reports / patches. Include your OS version, code examples, stack traces and everything you can to help you debug your problem.

If you have a new feature or large change in mind, please open a new issue with your suggestion to discuss the idea together.

If you have a question about how to use Fly, please ask it on our [Gitter room](https://gitter.im/flyjs/fly).

## Plugin Repositories

This is the repository for the core Fly library and CLI engine.

If your issue is related to a specific _existing_ package, open an issue on that package's issue tracker.

## Commit Messages

+ Use the [present tense](https://simple.wikipedia.org/wiki/Present_tense) ("add awesome-plugin" not "added ...")

+ Less than 72 characters or less for the first line of your commit.

+ Use of [emoji](http://www.emoji-cheat-sheet.com/) is definitely encouraged. :beer:

## Code Style

Start reading our code and you'll get the hang of it. No particular style is better, but consistency `===` sanity.

+ [No semicolons](http://blog.izs.me/post/2353458699/an-open-letter-to-javascript-leaders-regarding).

+ Max of 80 characters per line.

+ Space before function parenthesis, _but_ not before function calls.

```js
function make (arg) { }

make(arg)
```

+ Do you really need a variable? You can initialize a constant. _Let's_ avoid mutation if possible.

> These rules are not set in stone. Feel free to open an issue with suggestions and/or feedback.

:heart:
