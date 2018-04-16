var fs      = require("fs");
var package = require("./package.json");

// These files need to be collected in directory: dist
//
// latest.yml
// Frysta Setup x.y.z.exe
// nsis-web/Frysta Web Setup x.y.z.exe
// nsis-web/frysta-x.y.z-x64.nsis.7z

var DeleteFolderSync = function(path){
  if(fs.existsSync(path)){
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = `${path}/${file}`;
      if(fs.lstatSync(curPath).isDirectory()){
        DeleteFolderSync(curPath);
      }else{
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

var version        = package["version"];
var latestYml      = "latest.yml";
var fullInstaller  = `Frysta Setup ${version}.exe`;
var fullInstaller2 = `frysta-${version}-win32-x64.exe`;
var webInstaller   = `Frysta Web Setup ${version}.exe`;
var webPackage     = `frysta-${version}-x64.nsis.7z`;

// Create a temporary folder in distribution
if(!fs.existsSync("dist/tmp"))
  fs.mkdirSync("dist/tmp");

// Move all of the files I need into the temp folder
fs.renameSync(`dist/${latestYml}`,             `dist/tmp/${latestYml}`);
fs.renameSync(`dist/${fullInstaller}`,         `dist/tmp/${fullInstaller2}`);
fs.renameSync(`dist/nsis-web/${webInstaller}`, `dist/tmp/Frysta Setup.exe`);
fs.renameSync(`dist/nsis-web/${webPackage}`,   `dist/tmp/${webPackage}`);

// Get a list of everything in the distribution folder
var items = fs.readdirSync("dist");

// Delete everything in the distribution folder except for the temp folder
for(var i = 0; i < items.length; i++){
  if(fs.lstatSync(`dist/${items[i]}`).isDirectory()){
    if(items[i] == "tmp")
      continue;
    DeleteFolderSync(`dist/${items[i]}`);
  }else{
    fs.unlinkSync(`dist/${items[i]}`);
  }
}

// Move everything inside temp into the distribution folder
var items = fs.readdirSync("dist/tmp");

for(var i = 0; i < items.length; i++)
  fs.renameSync(`dist/tmp/${items[i]}`, `dist/${items[i]}`);

// Delete the temporary folder
DeleteFolderSync("dist/tmp");
