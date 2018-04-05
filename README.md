# Frysta ![](https://img.shields.io/badge/Node.js-9.3-7fbd42.svg?style=plastic) ![](https://img.shields.io/badge/C++-17-2281e3.svg?style=plastic) ![](https://img.shields.io/badge/Status-In%20Development-EE7600.svg?style=plastic)

Make sure you install the Windows build tools first, or else `npm run compile` will not work
Installing the build tools must be done in a command prompt with administrative privileges.
Note: This might actually be optional, need to confirm.
```
npm i -g --production windows-build-tools
```

Installing, compiling, and running
```
git clone https://github.com/TundraFizz/Frysta
cd Frysta
npm i
npm run compile
npm start
```

Generating installers
```
npm run build
```

## Other notes:

Frysta is an application that allows you to select regions of your computer screen which are then uploaded to a server. The image URL is copied to your clipboard to make the images easily shareable.

Generating public and private keys
```
openssl rsa -in priv.key -pubout -out public.key
openssl genrsa -out private.key 2048
```
