#!/usr/bin/env node

const fs = require(`fs`)
const path = require(`path`)
const os = require(`os`)
const pkg = require(`./package.json`)
const dataDir = `${os.homedir}/.userkey`.replace(/[\\/]/g, `/`)
const {
  md5,
  parseArgv,
  deepGet,
  deepSet,
  enSign,
  deSign,
} = require(`./util.js`)

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
  const [arg1] = process.argv.slice(2)
  if([`--help`, `-h`].includes(arg1)) {
    console.info([
      `${pkg.name} v${pkg.version} ${pkg.homepage}`,
      ``,
      `usage:`,
      `  select    --[string ] Choose a storage container`,
      `  encrypt   --[boolean] encrypted storage container`,
      `  decrypt   --[boolean] Decrypt the storage container`,
      `  pw        --[string ] password for storage`,
      `  newpw     --[string ] change Password`,
      `  key       --[string ] Provide key to query data`,
      `  val       --[string ] provide val setting data`,
      ``,
      `eg:`,
      `  # Save information and query information`,
      `  ${pkg.name} key=vps.local val=aaa`,
      `  ${pkg.name} key=vps.local`,
      ``,
      `  # Show all data in default storage space`,
      `  ${pkg.name}`,
      ``,
      `  # List all storage spaces`,
      `  ${pkg.name} select`,
      ``,
      `  # Use another storage space and use a password to save and query information`,
      `  ${pkg.name} select=ace pw=admin key=birthday val=1990.01.01 encrypt`,
      `  ${pkg.name} select=ace pw=admin key=birthday`,
      ``,
      `  # decrypt storage space`,
      `  ${pkg.name} select=ace pw=admin decrypt`,
    ].join(`\n`))
    process.exit()
  }
  try {
    if(select === true) {
      const list = fs.readdirSync(dataDir).map(item => `${dataDir}/${item}`)
      console.info(list)
      process.exit()
    }
    const storeData = store({select, pw})
    if(encrypt) {
      storeData.encrypt()
    }
    if(decrypt) {
      storeData.decrypt()
    }
    if(newpw) {
      storeData.newpw()
    }
    if(select !== true) {
      const action = val === undefined ? `get` : `set`
      const res = storeData[action](key, val)
      console.info(res)
    }
  } catch (error) {
    console.info(error)
  }
  process.exit()
} 

module.exports = store

function store({select = ``, pw: rawPw} = {}) {
  if(!(typeof(select) === `string` && (/^[A-Za-z0-9]+$/.test(select) || select === ``))) {
    throw new Error(`The select parameter allows only letters and numbers`)
  }
  pw = md5(String(rawPw))
  const storePath = `${dataDir}/store${select ? `.${select}` : select}.json`
  console.info(`storePath:`, storePath)
  if(!(fs.existsSync(storePath) && Boolean(fs.readFileSync(storePath, `utf8`)))) {
    const dir = path.parse(storePath).dir
    fs.existsSync(dir) === false && fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(storePath, JSON.stringify({
      data: {},
    }, null, 2))
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
    storePath,
    file,
    // 获取数据
    get(key, defaultVal) {
      return key === undefined ? file.decryptData : deepGet(file.decryptData, key, defaultVal)
    },
    // 设置数据
    set(key, val) {
      deepSet(file.decryptData, key, val)
      setData({storePath, file, pw})
      return deepGet(file.decryptData, key)
    },
    // 加密数据, 加密之后数据以密文存储
    encrypt() {
      if(Boolean(file.isPw) === true) {
        throw new Error(`encrypted before`)
      }
      if(Boolean(rawPw) === false) {
        throw new Error(`password is a required parameter`)
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
    newpw(newPw) {
      
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
