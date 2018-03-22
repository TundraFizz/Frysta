#include "screen-capture.h"

std::string directoryToSaveCopy = "FEATURE_TO_DO";

bool itIsTime = false;

HWND hwndTop;
HWND hwndBot;

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

int GetEncoderClsid(const WCHAR* format, CLSID* pClsid){
  UINT num  = 0; // number of image encoders
  UINT size = 0; // size of the image encoder array in bytes

  Gdiplus::ImageCodecInfo* pImageCodecInfo = NULL;

  Gdiplus::GetImageEncodersSize(&num, &size);

  if(size == 0)
    return -1; // Failure

  pImageCodecInfo = (Gdiplus::ImageCodecInfo*)(malloc(size));

  if(pImageCodecInfo == NULL)
    return -1; // Failure

  GetImageEncoders(num, size, pImageCodecInfo);

  for(UINT j = 0; j < num; ++j){
    if(wcscmp(pImageCodecInfo[j].MimeType, format) == 0){
      *pClsid = pImageCodecInfo[j].Clsid;
      free(pImageCodecInfo);
      return j; // Success
    }
  }

  free(pImageCodecInfo);
  return -1; // Failure
}

bool saveBitmap(HBITMAP bmp, HPALETTE pal){
  bool result = false;
  PICTDESC pd;

  pd.cbSizeofstruct = sizeof(PICTDESC);
  pd.picType        = PICTYPE_BITMAP;
  pd.bmp.hbitmap    = bmp;
  pd.bmp.hpal       = pal;

  LPPICTURE picture;
  HRESULT res = OleCreatePictureIndirect(&pd, IID_IPicture, false, reinterpret_cast<void**>(&picture));

  if(!SUCCEEDED(res))
    return false;

  LPSTREAM stream;
  res = CreateStreamOnHGlobal(0, true, &stream);

  if(!SUCCEEDED(res)){
    picture->Release();
    return false;
  }

  LONG bytes_streamed;
  res = picture->SaveAsFile(stream, true, &bytes_streamed);

  char characters[] = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  fileName = "tmp-";

  srand(time(NULL));

  for(size_t i = 0; i < 6; i++)
    fileName += characters[rand() % 62];

  fileNameBmp = fileName + ".bmp";
  fileNamePng = fileName + ".png";

  HANDLE file = CreateFile(fileNameBmp.c_str(), GENERIC_WRITE, FILE_SHARE_READ, 0, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, 0);

  if(!SUCCEEDED(res) || !file){
    stream->Release();
    picture->Release();
    return false;
  }

  HGLOBAL mem = 0;
  GetHGlobalFromStream(stream, &mem);
  LPVOID data = GlobalLock(mem);

  DWORD bytes_written;

  result   = !!WriteFile(file, data, bytes_streamed, &bytes_written, 0);
  result  &= (bytes_written == static_cast<DWORD>(bytes_streamed));

  GlobalUnlock(mem);
  CloseHandle(file);

  stream->Release();
  picture->Release();

  return result;
}

bool screenCapturePart(int x, int y, int w, int h){
  HDC hdcSource = GetDC(NULL);
  HDC hdcMemory = CreateCompatibleDC(hdcSource);

  int capX = GetDeviceCaps(hdcSource, HORZRES);
  int capY = GetDeviceCaps(hdcSource, VERTRES);

  HBITMAP hBitmap    = CreateCompatibleBitmap(hdcSource, w, h);
  HBITMAP hBitmapOld = (HBITMAP)SelectObject(hdcMemory, hBitmap);

  BitBlt(hdcMemory, 0, 0, w, h, hdcSource, x, y, SRCCOPY);
  hBitmap = (HBITMAP)SelectObject(hdcMemory, hBitmapOld);

  DeleteDC(hdcSource);
  DeleteDC(hdcMemory);

  HPALETTE hpal = NULL;

  if(saveBitmap(hBitmap, hpal))
    return true;
  return false;
}

void ConvertBmpToPng(){
  ULONG_PTR                    gdiplusToken;
  Gdiplus::GdiplusStartupInput gdiplusStartupInput;

  // Initializes Windows GDI+, make sure you call GdiplusShutdown when you're done using GDI+
  GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);

  std::wstring_convert< std::codecvt<wchar_t,char,std::mbstate_t> > conv1;
  std::wstring_convert< std::codecvt<wchar_t,char,std::mbstate_t> > conv2;
  std::wstring wcstring1 = conv1.from_bytes(fileNameBmp);
  std::wstring wcstring2 = conv1.from_bytes(fileNamePng);

  const WCHAR * testing1 = wcstring1.c_str();
  const WCHAR * testing2 = wcstring2.c_str();

  Gdiplus::Image  *image = new Gdiplus::Image(testing1);
  Gdiplus::Status stat;
  CLSID           encoderClsid;

  // Get the CLSID of the PNG encoder
  GetEncoderClsid(L"image/png", &encoderClsid);

  // Convert the .bmp file into a .png file
  stat = image->Save(testing2, &encoderClsid, NULL);

  if(stat != Gdiplus::Ok){
    std::cout << "Error converting .bmp to .png\n";
    std::cout << "Code: " << stat << "\n";
  }

  // Delete the lock that the program has on the .bmp file (it does NOT delete the file itself)
  delete image;

  // Clean up resources used by Windows GDI+
  Gdiplus::GdiplusShutdown(gdiplusToken);
}

LRESULT CALLBACK WindowProcTop(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam){
  switch(msg){
    case WM_CLOSE:{
      itIsTime = true;
      DestroyWindow(hwnd);
      break;
    }

    case WM_DESTROY:{
      itIsTime = true;
      PostQuitMessage(0);
      break;
    }

    case WM_SETCURSOR:{
      if(LOWORD(lParam) == HTCLIENT){
        HINSTANCE instance;
        LPCTSTR   cursor;

        instance = NULL;
        cursor   = IDC_CROSS;

        SetCursor(LoadCursor(instance, cursor));

        return true;
      }
      break;
    }

    case WM_LBUTTONDOWN:{
      selectX1 = GET_X_LPARAM(lParam);
      selectY1 = GET_Y_LPARAM(lParam);
      mouseStep = 1;
      break;
    }

    case WM_LBUTTONUP:{
      selectX2 = GET_X_LPARAM(lParam);
      selectY2 = GET_Y_LPARAM(lParam);
      mouseStep = 0;

      SendMessage(hwndBot, WM_CLOSE, 0, NULL);
      SendMessage(hwndTop, WM_CLOSE, 0, NULL);

      // CloseWindow(hwndBot);
      // CloseWindow(hwndTop);

      int width  = abs(selectX1 - selectX2);
      int height = abs(selectY1 - selectY2);

      int smallestX;
      int smallestY;

      if  (selectX1 < selectX2) smallestX = selectX1;
      else                      smallestX = selectX2;

      if  (selectY1 < selectY2) smallestY = selectY1;
      else                      smallestY = selectY2;

      smallestX += smallestLeft;
      smallestY += smallestTop;

      // std::cout << "(" << selectX1 << ", " << selectY1 << "), (" << selectX2 << ", " << selectY2 << ")\n";
      // std::cout << "W: " << width << "   H: " << height << "\n";
      screenCapturePart(smallestX, smallestY, width, height);
      ConvertBmpToPng();

      break;
    }

    case WM_MOUSEMOVE:{
      if(mouseStep == 1 || mouseStep == 2){
        selectX2 = GET_X_LPARAM(lParam);
        selectY2 = GET_Y_LPARAM(lParam);
        mouseStep = 2;

        int upperLeftX  = 0;
        int upperLeftY  = 0;
        int lowerRightX = 0;
        int lowerRightY = 0;

        if(selectX1 < selectX2) upperLeftX = selectX1;
        else                    upperLeftX = selectX2;

        if(selectY1 < selectY2) upperLeftY = selectY1;
        else                    upperLeftY = selectY2;

        if(selectX1 > selectX2) lowerRightX = selectX1;
        else                    lowerRightX = selectX2;

        if(selectY1 > selectY2) lowerRightY = selectY1;
        else                    lowerRightY = selectY2;

        // std::cout << "===========================\n";
        // std::cout << "upperLeftX:   " << upperLeftX   << "\n";
        // std::cout << "upperLeftY:   " << upperLeftY   << "\n";
        // std::cout << "lowerRightX:  " << lowerRightX  << "\n";
        // std::cout << "lowerRightY:  " << lowerRightY  << "\n";
        // std::cout << "smallestLeft: " << smallestLeft << "\n";
        // std::cout << "smallestTop:  " << smallestTop  << "\n";
        // std::cout << "maskWidth:    " << maskWidth    << "\n";
        // std::cout << "maskHeight:   " << maskHeight   << "\n";

        HRGN WinRgn1;
        HRGN WinRgn2;
        WinRgn1 = CreateRectRgn(upperLeftX, upperLeftY, lowerRightX, lowerRightY);
        WinRgn2 = CreateRectRgn(smallestLeft, smallestTop, maskWidth, maskHeight);

        CombineRgn(WinRgn1, WinRgn1, WinRgn2, RGN_XOR);
        SetWindowRgn(hwndBot, WinRgn1, true);
        UpdateWindow(hwndBot);
      }
      break;
    }

    case WM_PAINT:{
      PAINTSTRUCT ps;
      BeginPaint(hwnd, &ps);
      EndPaint(hwnd, &ps);
      return 0;
    }

    default:
      return DefWindowProc(hwnd, msg, wParam, lParam);
  }
  return 0;
}

LRESULT CALLBACK WindowProcBot(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam){
  switch(msg){
    case WM_CLOSE:{
      DestroyWindow(hwnd);
      break;
    }

    case WM_DESTROY:{
      PostQuitMessage(0);
      break;
    }

    default:{
      return DefWindowProc(hwnd, msg, wParam, lParam);
    }
  }
  return 0;
}

BOOL CALLBACK MonitorEnumProc(HMONITOR hMonitor, HDC hdcMonitor, LPRECT lprcMonitor, LPARAM dwData){
  MONITORINFO mi;
  mi.cbSize = sizeof(mi);
  GetMonitorInfo(hMonitor, &mi);
  RECT r = mi.rcMonitor;

  if(firstRun){
    firstRun      = false;
    smallestLeft  = r.left;
    smallestTop   = r.top;
    largestRight  = r.right;
    largestBottom = r.bottom;
  }else{
    if(r.left   < smallestLeft)  smallestLeft  = r.left;
    if(r.top    < smallestTop)   smallestTop   = r.top;
    if(r.right  > largestRight)  largestRight  = r.right;
    if(r.bottom > largestBottom) largestBottom = r.bottom;
  }

  return true;
}

void MyAsyncWorker::Reeeeeeeee(){
  HINSTANCE hInstance = GetModuleHandle(NULL);

  EnumDisplayMonitors(NULL, NULL, MonitorEnumProc, 0);
  maskWidth  = largestRight  - smallestLeft;
  maskHeight = largestBottom - smallestTop;
  // std::cout << "========== Monitor Information ==========\n";
  // std::cout << "smallestLeft : " << smallestLeft  << "\n";
  // std::cout << "smallestTop  : " << smallestTop   << "\n";
  // std::cout << "largestRight : " << largestRight  << "\n";
  // std::cout << "largestBottom: " << largestBottom << "\n";
  // std::cout << "maskWidth    : " << maskWidth     << "\n";
  // std::cout << "maskHeight   : " << maskHeight    << "\n";

  WNDCLASS winClassTop;
  winClassTop.style = CS_DBLCLKS | CS_OWNDC | CS_HREDRAW | CS_VREDRAW;
  winClassTop.lpfnWndProc = WindowProcTop;
  winClassTop.cbClsExtra = 0;
  winClassTop.cbWndExtra = 0;
  winClassTop.hInstance = hInstance;
  winClassTop.hIcon = LoadIcon(NULL, IDI_APPLICATION);
  winClassTop.hCursor = LoadCursor(NULL, IDC_ARROW);
  winClassTop.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
  winClassTop.lpszMenuName = NULL;
  winClassTop.lpszClassName = "winClassTop";

  WNDCLASS winClassBot;
  winClassBot.style = CS_DBLCLKS | CS_OWNDC | CS_HREDRAW | CS_VREDRAW;
  winClassBot.lpfnWndProc = WindowProcBot;
  winClassBot.cbClsExtra = 0;
  winClassBot.cbWndExtra = 0;
  winClassBot.hInstance = hInstance;
  winClassBot.hIcon = LoadIcon(NULL, IDI_APPLICATION);
  winClassBot.hCursor = LoadCursor(NULL, IDC_ARROW);
  winClassBot.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
  winClassBot.lpszMenuName = NULL;
  winClassBot.lpszClassName = "winClassBot";

  RegisterClass(&winClassTop);
  RegisterClass(&winClassBot);

  // IMPORTANT! The order that these HWND variables are defined determines what order
  // the windows appear. The first HWND variable will appear beneath the other HWNDs
  // and the last HWND variable will appear above all other HWMDs.

  hwndBot = CreateWindowEx(
    // 1. Allows better window functionality
    // 2. Makes sure the that window is always on top
    // 3. Hides the program when the user alt-tabs
    WS_EX_LAYERED | WS_EX_TOPMOST | WS_EX_TOOLWINDOW,
    "winClassBot",
    "Bot",
    // 1. Make it a popup window which removes all borders/menu items from it
    // 2. Set the window to initially be visible
    WS_POPUP | WS_VISIBLE,
    smallestLeft,
    smallestTop,
    maskWidth,
    maskHeight,
    NULL,
    NULL,
    hInstance,
    NULL);

  hwndTop = CreateWindowEx(
    // 1. Allows better window functionality
    // 2. Makes sure the that window is always on top
    // 3. Hides the program when the user alt-tabs
    WS_EX_LAYERED | WS_EX_TOPMOST | WS_EX_TOOLWINDOW,
    "winClassTop",
    "Top",
    // 1. Make it a popup window which removes all borders/menu items from it
    // 2. Set the window to initially be visible
    WS_POPUP | WS_VISIBLE,
    smallestLeft,
    smallestTop,
    maskWidth,
    maskHeight,
    NULL,
    NULL,
    hInstance,
    NULL);

  SetLayeredWindowAttributes(hwndTop, NULL, 1,   LWA_ALPHA);
  SetLayeredWindowAttributes(hwndBot, NULL, 120, LWA_ALPHA);

  // Change background colors of the windows
  HBRUSH brushTop = CreateSolidBrush(RGB(255, 255, 255));
  HBRUSH brushBot = CreateSolidBrush(RGB(0, 0, 0));
  SetClassLongPtr(hwndTop, GCLP_HBRBACKGROUND, (LONG)brushTop);
  SetClassLongPtr(hwndBot, GCLP_HBRBACKGROUND, (LONG)brushBot);

  ShowWindow(hwndTop, SW_SHOW);
  ShowWindow(hwndBot, SW_SHOW);

  MSG message;

  while(GetMessage(&message, NULL, 0, 0)){
    TranslateMessage(&message);
    DispatchMessage(&message);
  }
}

MyAsyncWorker::MyAsyncWorker(std::string myString, int myInt, bool myBool, Nan::Callback *callback) : Nan::AsyncWorker(callback){
  this->myString = myString;
  this->myInt    = myInt;
  this->myBool   = myBool;
  // These variables are now accessible: myString, myInt, myBool
}

void MyAsyncWorker::Execute(){
  std::cout << "===== Execute variables =====\n";
  std::cout << "String: " << myString << "\n";
  std::cout << "Int   : " << myInt    << "\n";
  std::cout << "Bool  : " << myBool   << "\n";
  std::cout << "=============================\n";
  Reeeeeeeee();
}

void MyAsyncWorker::HandleOKCallback(){
  std::string sendToNode = "Data to be sent to Node from C++";

  v8::Local<v8::Value> argv[] = {
    Nan::New(fileNamePng).ToLocalChecked(),
    Nan::Null()
  };

  callback->Call(2, argv);
}

NAN_METHOD(ScreenCapture::TakeScreenshot){
  Nan::AsyncQueueWorker(new MyAsyncWorker(
    // All parameters (except the final one) are variables passed from Node.JS
    std::string(*Nan::Utf8String(info[0]->ToString())),
    info[1]->Int32Value(),
    info[2]->BooleanValue(),

    // The final parameter in MyAsyncWorker will always be the callback function
    new Nan::Callback(info[3].As<v8::Function>())
  ));
}

NAN_MODULE_INIT(ScreenCapture::Init){
  // All C++ methods are set in this module initialization method
  Nan::SetMethod(target, "TakeScreenshot", TakeScreenshot);
}
