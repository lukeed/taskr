// @flow

interface Foo {
	foo: String;
	bar?: Number;
}

function foobar(foo: Foo): Object {
	return {foo};
}
