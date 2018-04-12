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

## Installer and updater notes:

To make it more convenient for Windows users to install and update Frysta, a regular NSIS package and an NSIS web package are built. Each release will contain three files:
```
Frysta-Setup.exe
frysta-x.y.z-x64.nsis.7z
frysta-x.y.z-win32-x64.exe
```

`Frysta-Setup.exe` is the compact web installer

`frysta-x.y.z-x64.nsis.7z` is the application itself that'll be downloaded through the web installer

`frysta-x.y.z-win32-x64.exe` is an NSIS one-click installer. While it technically can be downloaded and installed by the user, they should instead use the web installer due to the initial filesize being much smaller. This file is automatically downloaded through Frysta when it detects an update through the following URL: `https://fizz.gg/releases/win32-x64/latest.yml`

## Other notes:

Frysta is an application that allows you to select regions of your computer screen which are then uploaded to a server. The image URL is copied to your clipboard to make the images easily shareable.

Generating public and private keys
```
openssl rsa -in priv.key -pubout -out public.key
openssl genrsa -out private.key 2048
```

## Release checklist:

- [x] `npm run build`
- [x] Collect these files in the "dist" directory:
1. `latest.yml`
2. `Frysta Setup x.y.z.exe`
3. `nsis-web/Frysta Web Setup x.y.z.exe`
4. `nsis-web/frysta-x.y.z-x64.nsis.7z`
- [x] Rename file #2 to: `frysta-x.y.z-win32-x64.exe`
- [x] Rename file #3 to: `Frysta-Setup.exe`
- [x] Create a new Frysta release on GitHub:
1. Tag version: `x.y.z`
2. Release title: `Frysta vx.y.z`
3. Describe this release: `Whatever you want`
4. Upload files `#2`, `#3`, and `#4` (everything except `latest.yml`)
5. Publish release
- [x] Open `latest.yml` and replace the values of the `url` and `path` keys with the following line: `https://github.com/TundraFizz/Frysta/releases/download/vx.y.z/frysta-x.y.z-win32-x64.exe`
