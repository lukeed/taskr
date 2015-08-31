export default async function () {
  await this.clear("dist")
  await this.source("src/fly.png").target("dist")
}
