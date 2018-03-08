var path    = require("path");    // -
var url     = require("url");     // -
var fs      = require("fs");      // File system
var crypto  = require("crypto");  // -
var bcrypt  = require("bcrypt");  // -
var $       = require("jquery");  // jQuery
var m       = require("./");      // C++ module
var request = require("request"); // POST request to the server
var storage = require("electron-json-storage");
var {app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, clipboard} = require("electron");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var win  = null;
var tray = null;
var quit = false;
var clickedOnButton = null;

storage.setDataPath(__dirname);

// storage.set("foobar", {"foo": "bar"}, function(error){
//   storage.get("foobar", function(error, data){
//     if(error)
//       throw error;
//     console.log(data);
//   });
// });

const dataPath = storage.getDataPath();
console.log(dataPath);

function createWindow(){
  // Create the browser window
  win = new BrowserWindow({
    width: 400,
    height: 300,
    show: false,
    resizable: false,
    icon: path.join(__dirname, "icon64x64.png")
  });

  win.setMenu(null);

  globalShortcut.register("ctrl+shift+1", function (){
    TakeScreenshotShortcut();
  });

  tray = new Tray(path.join(__dirname, "icon64x64.png"));

  var contextMenu = Menu.buildFromTemplate([
    {
      "label": "Item 1",
      "type" : "radio",
      "icon" : path.join(__dirname, "icon64x64.png")
    },
    {
      "label": "Item 2",
      "submenu": [
        {"label": "submenu 1"},
        {"label": "submenu 2"},
      ]
    },
    {
      "label": "Item 3",
      "type" : "radio",
      "checked": true
    },
    {
      "label": "Toggle Tools",
      "accelerator": "Ctrl+I",
      "click": function(){
        win.webContents.toggleDevTools();
      }
    },
    {
      "label": "Quit Frost Frame",
      "click": function(){
        quit = true;
        win.close();
      }
    }
  ]);

  tray.setToolTip("App icon tooltip!");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    console.log("Single click");
    win.showInactive();
  });

  tray.on("double-click", () => {
    console.log("Double click");
    win.focus();
  });

  win.once("ready-to-show", () => {
    var loggedIn = false; // DEBUG VARIABLE

    if(loggedIn)
      win.hide();
    else
      win.show();
  });

  // Load the index.html of the app
  win.loadURL(url.format({
    pathname: path.join(__dirname, "index.html"),
    protocol: "file:",
    slashes: true
  }));

  // When the window is going to be minimized
  win.on("minimize",function(event){
    event.preventDefault();
    win.hide();
  });

  // When the window is about to be closed
  win.on("close", function (event){
    if(quit == false){
      event.preventDefault();
      win.hide();
    }
  });

  // When the window is actually closed
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit()
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null){
    createWindow();
  }
});

// This isn't used anymore
ipcMain.on("message", (event, msg) => {
  console.log(msg);
  event.sender.send("async-reply", 2);
});

app.on("message", (arg) => {
  var func = arg["function"];
  var data = arg["data"];
  // var data = JSON.parse(arg["data"]);

  if     (func == "TakeScreenshot") TakeScreenshotButton(data);
  else if(func == "Quit")           Quit                (data);
  else if(func == "CreateAccount")  CreateAccount       (data);
  else if(func == "Login")          Login               (data);
  else if(func == "TestSave")       TestSave            (data);
  else if(func == "TestLoad")       TestLoad            (data);
});

function Quit(){
  quit = true;
  win.close();
}

function TakeScreenshotShortcut(){
  clickedOnButton = false;
  TakeScreenshot();
}

function TakeScreenshotButton(){
  clickedOnButton = true;
  TakeScreenshot();
}

function TakeScreenshot(){
  win.hide();
  // win.minimize();

  m.doAsyncStuff(123, 5, true, function(result, error){

    // If the user clicked on the "Screenshot" button, then we'll display the window again
    if(clickedOnButton)
      win.show();
    else
      win.hide();

    console.log(`Sending ${result} to the server`);

    var formData = {
      "key": "This is the user's secret",
      "file": fs.createReadStream(result)
    };

    request.post({url:"https://fizz.gg/qwerty", formData: formData, json: true}, function(err, res, body){
      if(err)
        return console.error("FAILED:", err);

      console.log("Copying the below URL to the clipboard");
      console.log(body["url"]);

      clipboard.write({"text": body["url"]});

      win.webContents.send("message", body["url"]);
    });
  });
}

function TestSave(data){
  console.log("========== TestSave ==========");
}

function TestLoad(data){
  console.log("========== TestLoad ==========");
}

function EncryptData(data){
  var publicKeyFile = path.resolve("public.key");
  var publicKey = fs.readFileSync(publicKeyFile, "utf-8");
  var buffer = new Buffer(data);
  return crypto.publicEncrypt(publicKey, buffer);
}

function CreateAccount(data){
  var encryptedData = EncryptData(data);
  ServerHandlesCreateAccount(encryptedData);
}

function Login(data){
  var encryptedData = EncryptData(data);
  ServerHandlesLogin(encryptedData);
}

///////////////////////////////
// EXAMPLE CODE FOR A SERVER //
///////////////////////////////

function ServerDecryptsData(data){
  var privateKeyFile = path.resolve("private.key");
  var privateKey = fs.readFileSync(privateKeyFile, "utf-8");
  var buffer = new Buffer(data, "base64");
  var decryptedData = crypto.privateDecrypt(privateKey, buffer);
  var decryptedData = decryptedData.toString("utf-8");
  return JSON.parse(decryptedData);
}

function ServerHandlesCreateAccount(data){
  data = ServerDecryptsData(data);

  var email    = data["email"];
  var username = data["username"];
  var password = data["password"];

  bcrypt.hash(password, 10, function(err, hash){
    console.log("Hashed password");
    console.log(hash);

    var temp = {
      "email"   : email,
      "password": hash
    };

    // Store information into database
    storage.get("data-server", function(error, data){
      data[username] = temp;

      storage.set("data-server", data, function(error){
        console.log("Info stored!");
      });
    });
  });
}

function ServerHandlesLogin(data){
  data = ServerDecryptsData(data);
  var username = data["username"];
  var password = data["password"];

  storage.get("data-server", function(error, data){
    var userData = data[username];

    if(typeof userData != "undefined"){
      console.log("User exists!");

      bcrypt.compare(password, userData["password"], function(err, res){
        if(res)
          console.log("User has been authenticated");
        else
          console.log("That was the wrong password");
        }
      );
    }else{
      console.log("User doesn't exist");
    }
  });
}
