const storeData = require(`./index.js`)()
storeData.set(`vpsList.vps1`, {
  host: `192.168.13.11`,
  port: 22,
  name: `ace`,
  password: `123456`,
})
const data = storeData.get(`vpsList.vps1`)
console.log(`data`, data)