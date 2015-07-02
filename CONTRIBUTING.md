<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=100px  src="https://cloud.githubusercontent.com/assets/8317250/8430194/35c6043a-1f6a-11e5-8cbd-af6cc86baa84.png">
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

+ Use the [present tense](https://simple.wikipedia.org/wiki/Present_tense) ("Add awesome-plugin" not "Added ...")

+ Less than 72 characters or less for the first line of your commit. After that is up to you.

+ Use of [emoji](http://www.emoji-cheat-sheet.com/) is definitely encouraged.

## Code Style

Start reading our code and you'll get the hang of it. No particular style is better, but consistency is sanity.

+ [No semicolons](http://blog.izs.me/post/2353458699/an-open-letter-to-javascript-leaders-regarding).

+ ~80 characters per line.

+ Space before function parenthesis, _but_ not before function calls.

```js
function make (arg) {
}

make(arg)
```

+ Do you really need that variable? You can initialize a constant, but let's avoid mutation if possible.

+ 150 lines of code per file is too many LOC to keep in the average head.

> Fly is still a work in progress and these rules are not written in stone. Feel free to open an issue with suggestions / feedback.
