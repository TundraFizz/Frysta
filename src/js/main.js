const ipc         = require("electron").ipcRenderer;
const EmitMessage = require("electron").remote.app.emit;

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

$(".menu-button").click(function(){
  if($(this).attr("active") == "false"){
    // Make all visible menu buttons inactive, except for the clicked one
    $(".menu-button:visible").attr("active", "false");
    $(this).attr("active", "true");

    // Execute the menu button's function
    window[$(this).attr("function")]();
  }
});

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
    ShowSubmitMessage("Username/password fields are empty", true);
  else if(username.length == 0)
    ShowSubmitMessage("Username field is empty", true);
  else if(password.length == 0)
    ShowSubmitMessage("Password field is empty", true);
  else{
    AnimateSubmitButtonToLoading("#app-1 .submit-container").then(() => {
      SendMessage("Login", {
        "username": username,
        "password": password
      });
    });
  }
}

function SubmitCreateAccount(email, username, password){
  if(email.length == 0 || username.length == 0 || password.length == 0){
    ShowSubmitMessage("All fields must be filled in", true);
  }else if(false){
    // Check if email address is valid
    ShowSubmitMessage("Email address isn't valid", true);
  }else if(username.length < 3){
    ShowSubmitMessage("Username must be at least three characters", true);
  }else if(password.length < 6){
    ShowSubmitMessage("Password must be at least six characters", true);
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

AnimateSubmitButtonToLoading = function(app){return new Promise((resolve) => {
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
  $("[input-field='email']").animate({
    "opacity": "0"
  }, {duration: 250, queue: false, complete: function(){
    $("[input-field='email']").css("display", "none");
  }});

  $("[input-field='username']").animate({
    "top": "12.66px"
  }, {duration: 250, queue: false});

  $("[input-field='password']").animate({
    "top": "47.33px"
  }, {duration: 250, queue: false});
}

function MenuButtonCreateAccount(){
  $("[input-field='email']").stop();
  $("[input-field='email']").css("display", "block");

  $("[input-field='email']").animate({
    "opacity": "1"
  }, {duration: 250, queue: false});

  $("[input-field='username']").animate({
    "top": "30px"
  }, {duration: 250, queue: false});

  $("[input-field='password']").animate({
    "top": "56px"
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

function MenuButtonMisc(){
  $(".container[data]", "#app-2").css("display", "none");
  $(".container[data='misc']").css("display", "block");
}

// Submit button functions (1/2)
function SubmitApp1(){
  var selection = $($(".menu-button[active='true']", "#app-1")[0]).text();
  var email     = $("input[name='email']"   , "#app-1").val();
  var username  = $("input[name='username']", "#app-1").val();
  var password  = $("input[name='password']", "#app-1").val();

  if(selection == "Login")
    SubmitLogin(username, password);
  else if(selection == "Create Account")
    SubmitCreateAccount(email, username, password);
}

// Submit button functions (2/2)
function TakeScreenshotButton(){
  SendMessage("TakeScreenshotButton");
  $(".submit-button").removeAttr("busy");
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

function ShowSubmitMessage(msg, err){
  // The error code may come from an external source which could
  // means it enters as a string. If so, correct it here
  if     (err == "true")  err = true;
  else if(err == "false") err = false;

  $(".message").text(msg);
  $(".message").removeClass("alert-red");
  $(".message").removeClass("alert-green");

  if     (err == true)  $(".message").addClass("alert-red");
  else if(err == false) $(".message").addClass("alert-green");

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

function AccountWasCreated(data){
  var msg = data["msg"];
  var err = data["err"];
  ShowSubmitMessage(msg, err);
  AnimateLoadingToSubmitButton("#app-1 .submit-container");
}

function LoginPageToMainApp(data){
  var msg = data["msg"];
  var err = data["err"];
  ShowSubmitMessage(msg, err);

  if(err == "false"){
    AnimateLoadingToOkIcon("#app-1 .submit-container");
    setTimeout(TransitionToMain, 1000);
  }else if(err == "true"){
    AnimateLoadingToSubmitButton("#app-1 .submit-container");
  }
}

function TransitionToMain(){
  $("#app-1").css("display", "none");
  $("#app-2").css("display", "block");
}

// Receiving a message from main.js
ipc.on("message", (event, msg) => {
  var func = msg["function"];
  var data = msg["data"];

  // Sometimes we may receive a JSON object in string form,
  // and sometimes we may receive a regular JSON object.
  // Convert it to an object if it's in string form.
  if(typeof data != "object")
    data = JSON.parse(data);

  if(func == "AccountWasCreated")   AccountWasCreated(data);
  if(func == "LoginPageToMainApp")  LoginPageToMainApp(data);
  if(func == "PlaySfxNotification") PlaySfxNotification(data);
  if(func == "PlaySfxError")        PlaySfxError(data);
  if(func == "GetOptions")          GetOptions(data);
});

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
  $("[option='LocalCopy']"       ).attr("active", options["LocalCopy"]       );
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
