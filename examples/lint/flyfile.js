export default async function () {
  await this.source("*.js").eslint()
}
