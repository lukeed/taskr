export default function* () {
	yield this
		.source('fly')
		.filter(function (data) {
			return data.toString().toUpperCase()
		})
		.target('dist')
}
