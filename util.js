const crypto = require(`crypto`)

/**
 * 获取字符串 md5
 * @param {*} text 
 * @returns 
 */
function md5(text) {
  return crypto.createHash('md5').update(text).digest('hex')
}

/**
 * 解析命令行参数
 * @param {*} arr 
 * @returns 
 */
function parseArgv(arr) {
  return (arr || process.argv.slice(2)).reduce((acc, arg) => {
    let [k, ...v] = arg.split(`=`)
    v = v.join(`=`) // 把带有 = 的值合并为字符串
    acc[k] = v === `` // 没有值时, 则表示为 true
      ? true
      : (
        /^(true|false)$/.test(v) // 转换指明的 true/false
        ? v === `true`
        : (
          /[\d|.]+/.test(v)
          ? (isNaN(Number(v)) ? v : Number(v)) // 如果转换为数字失败, 则使用原始字符
          : v
        )
      )
    return acc
  }, {})
}

/**
 * 深层获取对象值
 * @param {*} object 
 * @param {*} keys 
 * @param {*} defaultValue 
 * @returns 
 */
function deepGet(object, keys = [], defaultValue) {
  let res = (!Array.isArray(keys)
    ? String(keys)
      .replace(/\[/g, `.`)
      .replace(/\]/g, ``)
      .split(`.`)
    : keys
  ).reduce((o, k) => (o || {})[k], object)
  return res !== undefined ? res : defaultValue
}

/**
 * 深层设置对象值
 * @param {*} object 
 * @param {*} keys 
 * @param {*} val 
 * @returns 
 */
function deepSet(object, keys, val) {
  keys = Array.isArray(keys) ? keys : String(keys)
    .replace(/\[/g, `.`)
    .replace(/\]/g, ``)
    .split(`.`)
  if (keys.length > 1) {
    object[keys[0]] = object[keys[0]] || {}
    deepSet(object[keys[0]], keys.slice(1), val)
    return object
  }
  object[keys[0]] = val
  return object
}

// 加密
function enSign(src, key, iv = key) {
  key = Buffer.from(key, 'utf8')
  iv = Buffer.from(iv.slice(0, 16), 'utf8')
  let sign = '';
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  sign += cipher.update(src, 'utf8', 'hex');
  sign += cipher.final('hex');
  return sign;
}

// 解密
function deSign(sign, key, iv = key) {
  key = Buffer.from(key, 'utf8')
  iv = Buffer.from(iv.slice(0, 16), 'utf8')
  let src = '';
  const cipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  src += cipher.update(sign, 'hex', 'utf8');
  src += cipher.final('utf8');
  return src;
}


module.exports = {
  md5,
  parseArgv,
  deepGet,
  deepSet,
  enSign,
  deSign,
}