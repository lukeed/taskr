interface Bar {
	foo: String;
	baz?: Object;
}

function foobar(bar: Bar): Object {
	return {bar};
}
