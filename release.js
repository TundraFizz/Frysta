var fs      = require("fs");
var package = require("./package.json");

// These files need to be collected
// dist/latest.yml
// dist/Frysta Setup x.y.z.exe
// dist/nsis-web/Frysta Web Setup x.y.z.exe
// dist/nsis-web/frysta-x.y.z-x64.nsis.7z

var version       = package["version"];
var latestYml     = "latest.yml";
var fullInstaller = `Frysta Setup ${version}.exe`;
var webInstaller  = `Frysta Web Setup ${version}.exe`;
var webPackage    = `frysta-${version}-x64.nsis.7z`;

if(!fs.existsSync("dist/tmp"))
  fs.mkdirSync("dist/tmp");

fs.renameSync(`dist/${latestYml}`,             `dist/tmp/${latestYml}`);
fs.renameSync(`dist/${fullInstaller}`,         `dist/tmp/${fullInstaller}`);
fs.renameSync(`dist/nsis-web/${webInstaller}`, `dist/tmp/${webInstaller}`);
fs.renameSync(`dist/nsis-web/${webPackage}`,   `dist/tmp/${webPackage}`);
