const aaa = 42;
const foo = require('./foo');

export default async function () {
  await this.source('src/*.js').target('dist');
};

export async function foo () {
  await this.clear('dist');
  return await this.start('bar', {val: aaa});
}

export async function bar(o) {
  return `${foo()}: ${o ? o.val : aaa}`;
}

export async function baz(one, two) {
  return {one, two};
}

export async function bat (one, two) {
  return {one, two};
}
