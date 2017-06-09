module.exports = _ =>
    console.log(`
Usage: taskr [options] [tasks]

Options
  -m  --mode=MODE   Run in 'parallel' or 'serial'. Default: 'serial'
  -d  --cwd=DIR     Set Taskr's home directory. Default: '.'
  -h  --help        Display this help message.
  -l  --list        Display available tasks.
  -v  --version     Display Taskr's version.

Examples
  taskr -d=/demo
  taskr -m=parallel task1 task2
  taskr --mode=serial  task1 task2
`.replace(/^\n/, ""))
