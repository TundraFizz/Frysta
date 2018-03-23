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

  std::string myString;
};

int  GetEncoderClsid(const WCHAR *format, CLSID *pClsid);
bool saveBitmap(HBITMAP bmp, HPALETTE pal);
bool screenCapturePart(int x, int y, int w, int h);
void ConvertBmpToPng();

// LRESULT CALLBACK WindowProcTop(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
LRESULT CALLBACK WindowProcBot(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
BOOL    CALLBACK MonitorEnumProc(HMONITOR hMonitor, HDC hdcMonitor, LPRECT lprcMonitor, LPARAM dwData);

// Self-register the module
NAN_MODULE_INIT(InitModule){
  ScreenCapture::Init(target);
}

NODE_MODULE(myModule, InitModule);
