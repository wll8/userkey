const userkey = require(`./index.js`)

const storeData = userkey({
  select: `work`,
  pw: `123456`,
})

// encryption
storeData.file.isPw === false && storeData.encrypt()

// set data (this method is not recommended, avoid forgetting to delete from the code)
storeData.set(`vps.local`, `aaa`)

// get data
const data = storeData.get(`vps.local`)
console.log(data)
