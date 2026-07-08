const ai = require("ai");
console.log(
  Object.keys(ai).filter(
    (k) => k.toLowerCase().includes("transport") || k.toLowerCase().includes("fetch")
  )
);
