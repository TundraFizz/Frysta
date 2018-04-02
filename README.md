# Frysta ![](https://img.shields.io/badge/Node.js-9.3-7fbd42.svg?style=plastic) ![](https://img.shields.io/badge/C++-17-2281e3.svg?style=plastic) ![](https://img.shields.io/badge/Status-In%20Development-EE7600.svg?style=plastic)

```
git clone https://github.com/TundraFizz/Frysta
cd Frysta
npm i
npm run all
```

Frysta is an application that allows you to select regions of your computer screen which are then uploaded to a server. The image URL is copied to your clipboard to make the images easily shareable.

## Other notes:

Make sure you install the Windows build tools first, or else `npm run compile` will not work
Installing the build tools must be done in a command prompt with administrative privileges

```
npm i -g --production windows-build-tools
npm i -g node-gyp
```

Generating public and private keys

```
openssl rsa -in priv.key -pubout -out public.key
openssl genrsa -out private.key 2048
```

Generating a Windows installer

First make sure you have Electron Forge installed
```
npm install -g electron-forge
```

Clean the project first by deleting `node_modules` and then run this
```
npm i
electron-forge import .
Y
Y
.
Y
Y
Y
```

Verify that the project was forged successfully
```
electron-forge start
```

-------------------------------------------------------------------------------
npm install -g electron-installer-windows
electron-packager . app --platform win32 --arch x64 --out dist/
electron-installer-windows --src . --dest dist/
-------------------------------------------------------------------------------
npm i -g electron-builder




npm install electron-builder --save-dev
-------------------------------------------------------------------------------
