var ScreenCapture;

if(process.env.DEBUG)
  ScreenCapture = require("../../build/Debug/screen-capture.node");
else
  ScreenCapture = require("../../build/Release/screen-capture.node");

module.exports = ScreenCapture;
