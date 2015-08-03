/**
  Conditionally format task duration.
  @param  {Number} duration task duration in ms
  @param  {String} default scale for output
  @return {{duration, scale}}
*/
export default function (duration, scale = "ms") {
  return duration >= 1000
    ? { duration: Math.round((duration / 1000) * 10) / 10, scale: "s" }
    : { duration, scale }
}
