module.exports = function sayHi(options: { name: string }): string {
	const { name } = options;
	return `Howdy ${name}!`;
};
