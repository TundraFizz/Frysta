#include <nan.h>
#include "screen-capture.h"

NAN_MODULE_INIT(InitModule){
  ScreenCapture::Init(target);
}

NODE_MODULE(myModule, InitModule);
