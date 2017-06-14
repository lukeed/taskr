module.exports = _ =>
    console.log(`
Usage: taskr [options] [tasks]

Options
  -m  --mode=MODE   Run in 'parallel' or 'serial'. Default: 'serial'
  -d  --cwd=DIR     Set Taskr's home directory. Default: '.'
  -l  --list        Display all available tasks.
  -v  --version     Display Taskr's version.
  -h  --help        Display this help text.

Examples
  taskr -d=/demo
  taskr -m=parallel task1 task2
  taskr --mode=serial  task1 task2
`.replace(/^\n/, ""))
