async function later () {
  await new Promise((cb) => setTimeout(cb, 1000))
}

later().then(() => console.log("Out of Time!!"))

let o = { prop: 0 }
Object.observe(o, (changes) => console.log(changes))
o.prop++

console.log(
  20 ** 160,
  [0, null, NaN].includes(NaN)
)
