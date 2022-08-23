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

# set data
userkey key=vpsList.vps1.password val=123456

# get data
userkey key=vpsList.vps1
```

by code:
``` js
const storeData = require(`userkey`)()

// set data (this method is not recommended, avoid forgetting to delete from the code)
storeData.set(`vpsList.vps1.password`, `123456`)

// get data
storeData.get(`vpsList.vps1`)
```
