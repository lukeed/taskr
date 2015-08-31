async function later () {
  await new Promise((cb) => setTimeout(cb, 1000))
}

later().then(() => console.log("Out of Time!!!!"))
