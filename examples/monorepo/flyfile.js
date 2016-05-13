import path from 'path'

export default async function () {
  await this
    .source(path.join('packages', '*', 'src', '**', '*.js'))
    .babel()
    .target('packages', { insert: 'dist' })
}