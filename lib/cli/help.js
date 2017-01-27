module.exports = _ =>
    console.log(`
Usage: fly [options] [tasks]

Options
  -m  --mode=MODE   Run in 'parallel' or 'serial'. Default: 'serial'
  -d  --cwd=DIR     Set Fly's home directory. Default: '.'
  -h  --help        Display this help message.
  -l  --list        Display available tasks.
  -v  --version     Display Fly version.

Examples
  fly -d=/demo
  fly -m=parallel task1 task2
  fly --mode=serial  task1 task2
`.replace(/^\n/, ""))