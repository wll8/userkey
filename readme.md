# userkey
Used to manage sensitive information and avoid it being placed in the code repository.


## why do you need it
For example, we have created an open source repository with the function of connecting to the server. During development, we may directly place the key or something in the code repository for convenience, but we may forget to delete it when publishing the code, resulting in information leakage.

There are many ways to solve this problem. For example, configuring .gitignore is one of the best ways, but it is quite troublesome to configure this file every time, or the file should be submitted according to the business, and it is necessary to extract the key separately or implement conditional compilation. Going outside takes some more mental effort.

So we might as well store sensitive information directly outside the warehouse, but still use it in the warehouse. In fact, github's ci also does this. It can reference key information, such as token, through environment variables or special flags in the code.

## how to use
Data can be stored or retrieved from the command line or from code:

Command Line:
``` sh
# install
npm i -g userkey

# help
userkey --help

# Save information and query information
userkey key=vps.local val=aaa
userkey key=vps.local

# Show all data in default storage space
userkey

# List all storage spaces
userkey select

# Use another storage space and use a password to save and query information
userkey select=ace pw=admin key=birthday val=1990.01.01 encrypt
userkey select=ace pw=admin key=birthday

# decrypt storage space
userkey select=ace pw=admin decrypt
```

by code:
``` js
const userkey = require(`userkey`)

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

```

## Options
``` js
userkey({
  // The name of the storage space to use, consisting of letters and numbers
  select: ``,
  // Manipulate Storage Spaces with Passwords
  pw: ``,
})
```

## Api
- .storePath  
  The file path used by the current storage space.

- .file  
  The contents of the file in the current storage space.

- .get(key)  
  for fetching data.

  - key -- Path ID when storing.

- .set(key, val)  
  Used to store data.

  - key -- Path ID when storing.
  - val -- stored data.

- .encrypt()  
  Encrypt data, after encryption, the data is stored in ciphertext.

- .decrypt()  
  Decrypt the data, after decryption the data is stored in plaintext.

- .newpw(newPw)  
  change Password.

  - newPw -- new password.