const aaa = 42;
import foo from './foo';
import { bar as quz, baz as qut } from './bar';

export default async function () {
  await this.source('src/*.js').target('dist');
};

export async function foo () {
  await this.clear('dist');
  return await this.start('bar', { val:aaa });
}

export async function bar(o) {
  return `${foo()}: ${o ? o.val : aaa}`;
}

export async function baz(one, two) {
  return { one, two };
}

export async function bat (one, two) {
  return `${quz} ${qut}`;
}
