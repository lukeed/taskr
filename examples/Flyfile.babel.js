export default function* () {
  this.log("Installing example dependencies...")
  this.log("This may take a few minutes...")
  yield require("mz/child_process").exec("npm i")
}
