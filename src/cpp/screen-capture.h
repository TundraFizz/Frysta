#include <nan.h>
#include <cmath>
#include <windows.h>
#include <windowsx.h>
#include <iostream>
#include <ole2.h>
#include <olectl.h>
#include <gdiplus.h>
#include <time.h>
#include <locale> // Convert string to wstring

#pragma comment (lib,"Gdiplus.lib")

class ScreenCapture {
  public:

  static NAN_MODULE_INIT(Init);
  static NAN_METHOD(TakeScreenshot);
};

class MyAsyncWorker: public Nan::AsyncWorker{
  public:

  // Initializer
  MyAsyncWorker(std::string myString, int myInt, bool myBool, Nan::Callback *callback);

  // Mandatory special functions
  void Execute();
  void HandleOKCallback();

  // Custom functions
  void Reeeeeeeee();

  // Variables
  std::string myString;
  int myInt;
  bool myBool;
};
