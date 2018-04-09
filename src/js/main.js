var ipc         = require("electron").ipcRenderer;
var EmitMessage = require("electron").remote.app.emit;
var dialog      = require("electron").remote.dialog;
var autoUpdater = require("electron-updater").remote;

var options = {};

function SendMessage(func, data=null){
  EmitMessage("message", {
    "function": func,
    "data"    : JSON.stringify(data)
  });
}

$("#btn-minimize").click(function(){
  SendMessage("Minimize");
});

$("#btn-quit").click(function(){
  SendMessage("Quit");
});

// The "menu-button" class has an attribute called "function"
// assigned to it, which is called when the button is clicked
$(".menu-button").click(function(){
  if($(this).attr("active") == "false"){
    // Make all visible menu buttons inactive, except for the clicked one
    $(".menu-button:visible").attr("active", "false");
    $(this).attr("active", "true");

    // Execute the menu button's function
    window[$(this).attr("function")]();
  }
});

// The "option-toggle" class has an attribute called "function"
// assigned to it, which is called when the button is clicked
$(".option-toggle").click(function(){
  // Execute the menu button's function
  window[$(this).attr("function")](this);
});

function Toggle(self){
  var option = $(self).attr("option");
  var data   = {};

  if($(self).attr("active") == "true"){
    data[option] = "false";

    $(".option-circle", $(self)).animate({
      "left"            : "4px",
      "background-color": "#e60000",
      "box-shadow"      : "0px 0px 6px 2.4px #ff5f5f"
    }, {duration: 200, queue: false});
  }else{
    data[option] = "true";

    $(".option-circle", $(self)).animate({
      "left"            : "20px",
      "background-color": "#00bf00",
      "box-shadow"      : "0px 0px 6px 2.4px #5fff79"
    }, {duration: 200, queue: false});
  }

  $(self).attr("active", data[option]);
  SendMessage("SetOption", data);
}

function ToggleDirectory(self){
  var option = $(self).attr("option");
  var data   = {};

  if($(self).attr("active") != "false"){
    data[option] = "false";
    $($(".local-copy-dir")[0]).text("");

    $(".option-circle", $(self)).animate({
      "left"            : "4px",
      "background-color": "#e60000",
      "box-shadow"      : "0px 0px 6px 2.4px #ff5f5f"
    }, {duration: 200, queue: false});
  }else{
    var path = dialog.showOpenDialog({properties: ["openDirectory"]});
    $($(".local-copy-dir")[0]).text(path);

    if(path == undefined){}else{
      data[option] = path[0];

      $(".option-circle", $(self)).animate({
        "left"            : "20px",
        "background-color": "#00bf00",
        "box-shadow"      : "0px 0px 6px 2.4px #5fff79"
      }, {duration: 200, queue: false});
    }
  }

  $(self).attr("active", data[option]);
  SendMessage("SetOption", data);
}

$(".menu-button").hover(function(){
  var self  = this;
  var index = 0;

  $(".menu-button:visible").each(function(){
    if(this == self)
      return false;
    else
      index++;
  });

  var buttonCount = $(".menu-button:visible").length;
  var left        = (100 / buttonCount) * index + "%";

  $(".menu-line-fg:visible").animate({
    "left": left
  }, {duration: 200, queue: false});
}, function(){
  var index = 0;

  $(".menu-button:visible").each(function(){
    if($(this).attr("active") == "true")
      return false;
    else
      index++;
  });

  var buttonCount = $(".menu-button:visible").length;
  var left        = (100 / buttonCount) * index + "%";

  $(".menu-line-fg:visible").animate({
    "left": left
  }, {duration: 200, queue: false});
});

function SubmitLogin(username, password){
  if(username.length == 0 && password.length == 0)
    ShowSubmitMessage("Username/password fields are empty", "red");
  else if(username.length == 0)
    ShowSubmitMessage("Username field is empty", "red");
  else if(password.length == 0)
    ShowSubmitMessage("Password field is empty", "red");
  else{
    AnimateSubmitButtonToLoading("#app-1 .submit-container").then(() => {
      SendMessage("Login", {
        "username": username,
        "password": password
      });
    });
  }
}

function SubmitCreateAccount(email, username, password, passwordConfirm){
  if(email.length == 0 || username.length == 0 || password.length == 0 || passwordConfirm.length == 0){
    ShowSubmitMessage("All fields must be filled in", "red");
  }else if(false){
    // Check if email address is valid
    ShowSubmitMessage("Email address isn't valid", "red");
  }else if(username.length < 3){
    ShowSubmitMessage("Username must be at least three characters", "red");
  }else if(password.length < 6){
    ShowSubmitMessage("Password must be at least six characters", "red");
  }else if(password != passwordConfirm){
    ShowSubmitMessage("Passwords do not match", "red");
  }else{
    AnimateSubmitButtonToLoading("#app-1 .submit-container").then(() => {
      SendMessage("CreateAccount", {
        "email"   : email,
        "username": username,
        "password": password
      });
    });
  }
}

function SubmitForgotPassword(email){
  if(email.length == 0){
    ShowSubmitMessage("Email address isn't valid", "red");
  }else{
    AnimateSubmitButtonToLoading("#app-1 .submit-container").then(() => {
      SendMessage("ForgotPassword", {
        "email": email
      });
    });
  }
}

function AnimateSubmitButtonToLoading(app){return new Promise((resolve) => {
  $(".loading-spinner", app).css("display", "block");

  // Fade out the "Submit" text while shrinking the Submit button.
  // Once the submit button has shrunk, had it out. All while this
  // is happening, slowly fade the spinner in and resolve once
  // the spinner is finished fading in.

  $(".submit-button > div", app).animate({
    "opacity": "0"
  }, 100);

  // Shrink the submit button
  $(".submit-button", app).animate({
    "width": "22px",
    "border-radius": "12px"
  }, 100, function(){
    $(".submit-button", app).animate({
      "opacity": "0"
    }, 50);
  });

  $(".loading-spinner", app).animate({
    "opacity": "1"
  }, 150, function(){
    resolve();
  });
})}

function AnimateLoadingToSubmitButton(app){
  $(".submit-button", app).css("display", "block");

  $(".submit-button", app).animate({
    "opacity": "1"
  }, 100, function(){
    $(".submit-button", app).animate({
      "width": "54px",
      "border-radius": "4px"
    }, 100);

    $(".submit-button > div", app).animate({
      "opacity": "1"
    }, 100);
  });

  $(".loading-spinner", app).animate({
    "opacity": "0"
  }, 100, function(){
    $(".loading-spinner", app).css("display", "none");
  });
}

function AnimateLoadingToOkIcon(app){
  $(".loading-spinner", app).css("background-image", "url(img/ok.png)");
  $(".loading-spinner", app).css("background-size",  "cover");
}

// App 1
function MenuButtonLogin(){
  $("[input-field='username']").stop();
  $("[input-field='password']").stop();

  $("[input-field='username']").css("display", "block");
  $("[input-field='password']").css("display", "block");

  $("[input-field='email']").animate({
    "top": "4px",
    "opacity": "0"
  }, {duration: 250, queue: false, complete: function(){
    $("[input-field='email']").css("display", "none");
  }});

  $("[input-field='username']").animate({
    "top": "22px",
    "opacity": "1"
  }, {duration: 250, queue: false});

  $("[input-field='password']").animate({
    "top": "65px",
    "opacity": "1"
  }, {duration: 250, queue: false});

  $("[input-field='password-confirm']").animate({
    "top": "82px",
    "opacity": "0"
  }, {duration: 250, queue: false, complete: function(){
    $("[input-field='password-confirm']").css("display", "none");
  }});
}

function MenuButtonCreateAccount(){
  $("[input-field='email']").stop();
  $("[input-field='username']").stop();
  $("[input-field='password']").stop();
  $("[input-field='password-confirm']").stop();

  $("[input-field='email']").css("display", "block");
  $("[input-field='username']").css("display", "block");
  $("[input-field='password']").css("display", "block");
  $("[input-field='password-confirm']").css("display", "block");

  $("[input-field='email']").animate({
    "top": "4px",
    "opacity": "1"
  }, {duration: 250, queue: false});

  $("[input-field='username']").animate({
    "top": "30px",
    "opacity": "1"
  }, {duration: 250, queue: false});

  $("[input-field='password']").animate({
    "top": "56px",
    "opacity": "1"
  }, {duration: 250, queue: false});

  $("[input-field='password-confirm']").animate({
    "top": "82px",
    "opacity": "1"
  }, {duration: 250, queue: false});
}

function MenuButtonForgotPassword(){
  $("[input-field='email']").stop();

  $("[input-field='email']").css("display", "block");

  $("[input-field='email']").animate({
    "opacity": "1",
    "top": "43px"
  }, {duration: 250, queue: false});

  $("[input-field='username']").animate({
    "opacity": "0"
  }, {duration: 250, queue: false});

  $("[input-field='password']").animate({
    "opacity": "0"
  }, {duration: 250, queue: false});

  $("[input-field='password-confirm']").animate({
    "opacity": "0"
  }, {duration: 250, queue: false});
}

// App 2
function MenuButtonGeneral(){
  $(".container[data]", "#app-2").css("display", "none");
  $(".container[data='general']").css("display", "block");
}

function MenuButtonShortcuts(){
  $(".container[data]", "#app-2").css("display", "none");
  $(".container[data='shortcuts']").css("display", "block");
}

function MenuButtonAccount(){
  $(".container[data]", "#app-2").css("display", "none");
  $(".container[data='account']").css("display", "block");
}

function MenuButtonAbout(){
  $(".container[data]", "#app-2").css("display", "none");
  $(".container[data='about']").css("display", "block");
}

// Submit button functions (1/2)
function SubmitApp1(){
  var selection       = $($(".menu-button[active='true']",  "#app-1")[0]).text();
  var email           = $("input[name='email']"   ,         "#app-1").val();
  var username        = $("input[name='username']",         "#app-1").val();
  var password        = $("input[name='password']",         "#app-1").val();
  var passwordConfirm = $("input[name='password-confirm']", "#app-1").val();

  if(selection == "Login")
    SubmitLogin(username, password);
  else if(selection == "Create Account")
    SubmitCreateAccount(email, username, password, passwordConfirm);
  else if(selection == "Forgot Password")
    SubmitForgotPassword(email);
}

// Submit button functions (2/2)
function TakeScreenshotButton(){
  SendMessage("TakeScreenshotButton");
  $(".submit-button").removeAttr("busy");
}

// Update Manager that will check for updates, or install a currently downloaded update
function UpdateManager(self){
  var data = {
    "text": $("div", self).text()
  }

  SendMessage("UpdateManager", data);
}

$(".submit-button").click(function(){
  if($(".submit-button").attr("busy") != undefined)
    return;
  else
    $(".submit-button").attr("busy", "");

  if($(".submit-button").attr("ready") == "true"){
    window[$(this).attr("function")]();
  }
});

$(".submit-button").hover(function(){
  $(this).animate({
    "box-shadow": "0px 0px 10px 0px #5fb9ff"
  }, 50);
}, function(){
  $(this).animate({
    "box-shadow": "0px 0px 5px 0px #5fb9ff"
  }, 50);
});

$(".submit-button").mousedown(function(){
  $(this).animate({
    "box-shadow": "0px 0px 0px 0px #5fb9ff"
  }, 50);
});

$(".submit-button").mouseup(function(){
  $(this).animate({
    "box-shadow": "0px 0px 5px 0px #5fb9ff"
  }, 50);
});

// TODO: Merge .submit-button with .misc-button

$(".misc-button").click(function(){
  window[$(this).attr("function")](this);
});

$(".misc-button").hover(function(){
  $(this).animate({
    "box-shadow": "0px 0px 10px 0px #5fb9ff"
  }, 50);
}, function(){
  $(this).animate({
    "box-shadow": "0px 0px 5px 0px #5fb9ff"
  }, 50);
});

$(".misc-button").mousedown(function(){
  $(this).animate({
    "box-shadow": "0px 0px 0px 0px #5fb9ff"
  }, 50);
});

$(".misc-button").mouseup(function(){
  $(this).animate({
    "box-shadow": "0px 0px 5px 0px #5fb9ff"
  }, 50);
});

function ShowSubmitMessage(msg, color){
  // Possible colors are: red, green, orange
  $(".message").removeClass("alert-red");
  $(".message").removeClass("alert-green");
  $(".message").removeClass("alert-orange");
  console.log(color);
  $(".message").addClass(`alert-${color}`);
  $(".message").text(msg);

  $(".message").animate({
    "opacity": "1"
  }, 100);

  $(".submit-button").removeAttr("busy");
}

$(".message").click(function(){
  $(this).animate({
    "opacity": "0"
  }, 100);
});

// Receiving a message from main.js
ipc.on("message", (event, msg) => {
  var func = msg["function"];
  var data = msg["data"];

  // Sometimes we may receive a JSON object in string form,
  // and sometimes we may receive a regular JSON object.
  // Convert it to an object if it's in string form.
  if(typeof data != "object")
    data = JSON.parse(data);

  if     (func == "LoginPageToMainApp")     LoginPageToMainApp(data);
  else if(func == "AccountWasCreated")      AccountWasCreated(data);
  else if(func == "ForgotPasswordResponse") ForgotPasswordResponse(data);
  else if(func == "PlaySfxNotification")    PlaySfxNotification(data);
  else if(func == "PlaySfxError")           PlaySfxError(data);
  else if(func == "GetOptions")             GetOptions(data);
  else if(func == "DownloadProgress")       DownloadProgress(data);
});

function LoginPageToMainApp(data){
  var msg   = data["msg"];
  var color = data["color"];
  ShowSubmitMessage(msg, color);

  if(err == "false"){
    AnimateLoadingToOkIcon("#app-1 .submit-container");
    setTimeout(TransitionToMain, 1000);
  }else if(err == "true"){
    AnimateLoadingToSubmitButton("#app-1 .submit-container");
  }
}

function AccountWasCreated(data){
  var msg   = data["msg"];
  var color = data["color"];
  ShowSubmitMessage(msg, color);
  AnimateLoadingToSubmitButton("#app-1 .submit-container");
}

function ForgotPasswordResponse(data){
  var msg   = data["msg"];
  var color = data["color"];
  ShowSubmitMessage(msg, color);
  AnimateLoadingToSubmitButton("#app-1 .submit-container");
}

function PlaySfxNotification(){
  var done = false;

  $(".sfx-notification").each(function(){
    var playing = $(this).attr("playing");

    if(playing == "false"){
      $(this).attr("playing", "true");
      $(this)[0].play();
      done = true;
      return false;
    }
  });

  if(done == false){
    var audioObject = `<audio class="sfx-notification" src="sfx/notification.ogg" preload="auto" playing="false" onended="$(this).attr('playing', 'false')"></audio>`;
    $("body").append(audioObject);
    PlaySfxNotification();
  }
}

function PlaySfxError(){
  var done = false;

  $(".sfx-error").each(function(){
    var playing = $(this).attr("playing");

    if(playing == "false"){
      $(this).attr("playing", "true");
      $(this)[0].play();
      done = true;
      return false;
    }
  });

  if(done == false){
    var audioObject = `<audio class="sfx-error" src="sfx/error.mp3" preload="auto" playing="false" onended="$(this).attr('playing', 'false')"></audio>`;
    $("body").append(audioObject);
    PlaySfxError();
  }
}

function GetOptions(data){
  options = data;
  $("[option='LaunchOnStartup']" ).attr("active", options["LaunchOnStartup"] );
  $("[option='CopyUrlOnSuccess']").attr("active", options["CopyUrlOnSuccess"]);
  $("[option='SfxOnSuccess']"    ).attr("active", options["SfxOnSuccess"]    );
  $("[option='SfxOnFailure']"    ).attr("active", options["SfxOnFailure"]    );
  // $("[option='LocalCopy']"       ).attr("active", options["LocalCopy"]       );

  // Special case for LocalCopy since it's more complex than a simple on/off
  if(options["LocalCopy"] == "false"){
    $("[option='LocalCopy']").attr("active", "false");
  }else{
    $("[option='LocalCopy']").attr("active", "true");
    $($(".local-copy-dir")[0]).text(options["LocalCopy"]);
  }
}

function DownloadProgress(data){
  var updateButton = $("[function='UpdateManager'] > div")[0];
  var percent      = data["percent"];
  percent          = Math.floor(percent) + "%";

  if(percent == "100%")
    percent = "Install update!";

  $(updateButton).text(percent);
}

function TransitionToMain(){
  $("#app-1").css("display", "none");
  $("#app-2").css("display", "block");
}

// Determine the width and starting position of the menu line forground
$(".menu-line-fg").each(function(){
  var menuButtons = $(".menu-button", $(this).parent().parent());
  var index       = 0;

  $(menuButtons).each(function(){
    if($(this).attr("active") == "true")
      return false;
    else
      index++;
  });

  var left  = (100 / menuButtons.length) * index + "%";
  var width = (100 / menuButtons.length) + "%";

  $(this).css("left", left);
  $(this).css("width", width);
});

$("input").on("focus",function(){
  var text = $(this).val();
  var span = $("span", $(this).parent())[0];
  if(!text)
    $(span).css("color", "rgba(0, 0, 0, 0.4)");
});

$("input").on("blur",function(){
  var text = $(this).val();
  var span = $("span", $(this).parent())[0];
  if(!text)
    $(span).css("color", "rgba(0, 0, 0, 0.7)");
});

$("input").on("input", function(){
  var text = $(this).val();
  var span = $("span", $(this).parent())[0];
  if(text)
    $(span).hide();
  else
    $(span).show();
});

$("#test-save").click(function(){
  SendMessage("TestSave");
});

$("#test-load").click(function(){
  SendMessage("TestLoad");
});

//////////////////////////////////////////
// $("#app-2").css("display", "block"); //
//////////////////////////////////////////
$(".submit-button").attr("ready", "true");
MenuButtonGeneral();
