// Async stuff
async function later () {
  await new Promise((cb) => setTimeout(cb, 1000))
}
later().then(() => console.log("Out of Time!"))

// Observing stuff!
let o = { prop: 0 }
Object.observe(o, (changes) => console.log(changes))
o.prop++

// Other stuff
console.log(
  20 ** 160,
  [0, null, NaN].includes(NaN)
)
