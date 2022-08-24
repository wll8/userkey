#!/usr/bin/env node

const fs = require(`fs`)
const path = require(`path`)
const os = require(`os`)
const {
  md5,
  parseArgv,
  deepGet,
  deepSet,
  enSign,
  deSign,
} = require(`./util.js`)
const storePath = `${os.homedir}/.userkey/store.json`

if (require.main === module) { // 通过 cli 使用
  const {
    select = ``,
    encrypt,
    decrypt,
    pw = ``,
    newpw = ``,
    key,
    val,
  } = parseArgv()
  try {
    const storeData = store({select, storePath, pw})
    if(encrypt) {
      storeData.encrypt()
      process.exit()
    }
    if(decrypt) {
      storeData.decrypt()
      process.exit()
    }
    if(newpw) {
      storeData.newpw()
      process.exit()
    }
    if(key) {
      const action = val === undefined ? `get` : `set`
      const res = storeData[action](key, val)
      console.info({storePath, action, key, res, val})
      process.exit()
    }
  } catch (error) {
    console.info(error)
    process.exit()
  }
} 

module.exports = ({pw = ``} = {}) => {
  const storeData = store({storePath, pw})
  return storeData
}

function store({select, storePath, pw: rawPw}) {
  pw = md5(String(rawPw))
  if(!(fs.existsSync(storePath) && Boolean(fs.readFileSync(storePath, `utf8`)))) {
    const dir = path.parse(storePath).dir
    fs.existsSync(dir) === false && fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(storePath, JSON.stringify({
      data: {},
    }))
  }
  let file = JSON.parse(fs.readFileSync(storePath))
  file.decryptData = file.data
  try {
    file.decryptData = decryptDataFn({file, pw})
  } catch (error) {
    throw new Error(`Unable to read the document, maybe the password is wrong or the encrypted data has been modified illegally`)
  }
  if(file.md5 && md5(JSON.stringify(file.decryptData)) !== file.md5) {
    throw new Error(`Incorrect data verification`)
  }
  return {
    file,
    // 获取数据
    get(key, defaultVal) {
      return deepGet(file.decryptData, key, defaultVal)
    },
    // 设置数据
    set(key, val) {
      deepSet(file.decryptData, key, val)
      setData({storePath, file, pw})
    },
    // 加密数据, 加密之后数据以密文存储
    encrypt() {
      if(Boolean(file.isPw) === true) {
        throw new Error(`encrypted before`)
      }
      if(Boolean(rawPw) === false) {
        throw new Error(`password can not be blank`)
      }
      file.isPw = true
      setData({storePath, file, pw})
    },
    // 解密数据, 解密之后数据以明文存储
    decrypt() {
      if(Boolean(file.isPw) === false) {
        throw new Error(`decrypted before`)
      }
      file.isPw = false
      setData({storePath, file, pw})
    },
    // 修改密码
    newpw(oldPw, newPw) {
      
    },
  }
}

function setData({storePath, file, pw}) {
  fs.writeFileSync(storePath, JSON.stringify({
    ...file,
    data: encryptDataFn({file, pw}),
    md5: file.isPw ? md5(JSON.stringify(file.decryptData)) : undefined,
    decryptData: undefined,
  }, null, 2))
}

// 加密
function encryptDataFn({file, pw}) {
  const data = file.isPw ? enSign(JSON.stringify(file.decryptData), pw) : file.decryptData
  return data
}

// 解密
function decryptDataFn({file, pw}) {
  const decryptData = file.isPw ? JSON.parse(deSign(file.decryptData, pw)) : file.data
  return decryptData
}
