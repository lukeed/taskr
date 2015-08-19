let o = { prop: 1 }
Object.observe(o, (changes) => console.log(changes))
o.prop ** 10
