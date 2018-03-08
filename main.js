const {app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, clipboard} = require("electron");
const path  = require("path");
const url   = require("url");
var fs      = require("fs");      // File system
var $       = require("jquery");  // jQuery
var request = require("request"); // POST request to the server
var m       = require("./");      // C++ module

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var win  = null;
var tray = null;
var quit = false;
var clickedOnButton = null;

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
  var data = JSON.parse(arg["data"]);

  if     (func == "TakeScreenshot") TakeScreenshotButton(data);
  else if(func == "Quit")           Quit                (data);
  else if(func == "Login")          Login               (data);
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

function Login(data){
  console.log("========== Login ==========");
  console.log(data["username"]);
  console.log(data["password"]);
  console.log();
}
