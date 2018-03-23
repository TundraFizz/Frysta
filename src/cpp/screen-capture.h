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
  private:

  public:

  // Initializer
  MyAsyncWorker(std::string myString, int myInt, bool myBool, Nan::Callback *callback);

  // Mandatory special functions
  void Execute();          // Automatically called right after the Initializer
  void HandleOKCallback(); // Called once the program is completed

  // Custom functions
  // TBD
  void Sample();

  // int  GetEncoderClsid(const WCHAR *format, CLSID *pClsid);
  // bool saveBitmap(HBITMAP bmp, HPALETTE pal);
  // bool screenCapturePart(int x, int y, int w, int h);
  // void ConvertBmpToPng();

  // Variables

  int myInt;
  bool myBool;

  private:

  static LRESULT CALLBACK WindowProcTopStatic(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
  LRESULT CALLBACK WindowProcTop(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
  HWND hwndTop;

  static LRESULT CALLBACK WindowProcBotStatic(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
  LRESULT CALLBACK WindowProcBot(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
  HWND hwndBot;

  std::string myString;

  std::string directoryToSaveCopy = "FEATURE_TO_DO";

  bool itIsTime = false;

  int selectX1   = 0;
  int selectY1   = 0;
  int selectX2   = 0;
  int selectY2   = 0;
  int mouseStep  = 0;
  bool mouseDown = false;

  int smallestLeft  = 0;
  int smallestTop   = 0;
  int largestRight  = 0;
  int largestBottom = 0;
  bool firstRun     = true;

  int maskWidth  = 0;
  int maskHeight = 0;

  std::string fileName    = "";
  std::string fileNameBmp = "";
  std::string fileNamePng = "";
  int programState = 0;
  // 0 = Idle
  // 1 = Mask active, waiting for user to select screen region
  // 2 = Generating file
  // 3 = Uploading to server
  // 4 = Waiting for server response
  // 5 = Upload failed, no response from server
  // 6 = Upload failed, server responded with error
  // 7 = Upload successful, copy URL to clipboard

  int  GetEncoderClsid(const WCHAR *format, CLSID *pClsid);
  bool saveBitmap(HBITMAP bmp, HPALETTE pal);
  bool screenCapturePart(int x, int y, int w, int h);
  void ConvertBmpToPng();

  public:
  bool YoloSwag(HMONITOR hMonitor, HDC hdcMonitor, LPRECT lprcMonitor);
};

// Self-register the module
NAN_MODULE_INIT(InitModule){
  ScreenCapture::Init(target);
}

NODE_MODULE(myModule, InitModule);
