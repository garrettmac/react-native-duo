#import "DuoCameraDirections.h"

#import <AVFoundation/AVFoundation.h>
#import <dlfcn.h>
#import <objc/message.h>

static NSArray<NSString *> *DuoCameraDeviceTypes(void) {
  static NSArray<NSString *> *types;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    NSArray<NSString *> *names = @[
      @"AVCaptureDeviceTypeBuiltInOuterUltraWideCamera",
      @"AVCaptureDeviceTypeBuiltInInnerUltraWideCamera",
      @"AVCaptureDeviceTypeBuiltInWideAngleCamera",
      @"AVCaptureDeviceTypeBuiltInUltraWideCamera",
      @"AVCaptureDeviceTypeBuiltInTelephotoCamera",
      @"AVCaptureDeviceTypeBuiltInDualCamera",
      @"AVCaptureDeviceTypeBuiltInDualWideCamera",
      @"AVCaptureDeviceTypeBuiltInTripleCamera",
    ];
    NSMutableArray<NSString *> *found = [NSMutableArray array];
    for (NSString *name in names) {
      NSString *__unsafe_unretained *symbol = (NSString *__unsafe_unretained *)dlsym(RTLD_DEFAULT, name.UTF8String);
      if (symbol != NULL && *symbol != nil) [found addObject:*symbol];
    }
    types = found;
  });
  return types;
}

static NSArray<NSDictionary<NSString *, id> *> *DuoDescriptors(id _Nullable descriptors) {
  if (![descriptors isKindOfClass:NSArray.class]) return @[];
  NSMutableArray<NSDictionary<NSString *, id> *> *cameras = [NSMutableArray array];
  for (id descriptor in (NSArray *)descriptors) {
    @try {
      NSString *uniqueID = [descriptor valueForKey:@"uniqueID"];
      if (![uniqueID isKindOfClass:NSString.class]) continue;
      NSString *name = [descriptor valueForKey:@"localizedName"];
      NSString *deviceType = [descriptor valueForKey:@"deviceType"];
      NSNumber *position = [descriptor valueForKey:@"position"];
      NSString *positionName = @"unspecified";
      if ([position isKindOfClass:NSNumber.class]) {
        if (position.integerValue == AVCaptureDevicePositionFront) positionName = @"front";
        if (position.integerValue == AVCaptureDevicePositionBack) positionName = @"back";
      }
      [cameras addObject:@{
        @"uniqueID": uniqueID,
        @"localizedName": [name isKindOfClass:NSString.class] ? name : @"",
        @"deviceType": [deviceType isKindOfClass:NSString.class] ? deviceType : @"",
        @"position": positionName,
      }];
    } @catch (NSException *exception) {
      continue;
    }
  }
  return cameras;
}

static NSDictionary<NSString *, id> *DuoDirections(id _Nullable map) {
  if (map == nil) return @{@"forward": @[], @"backward": @[]};
  @try {
    return @{
      @"forward": DuoDescriptors([map valueForKey:@"forwardFacingDeviceDescriptors"]),
      @"backward": DuoDescriptors([map valueForKey:@"backwardFacingDeviceDescriptors"]),
    };
  } @catch (NSException *exception) {
    return @{@"forward": @[], @"backward": @[]};
  }
}

@implementation DuoCameraDirections {
  id _coordinator;
}

+ (Class)coordinatorClass {
  Class cls = NSClassFromString(@"AVCaptureDeviceDirectionCoordinator");
  if (cls == Nil) return Nil;
  if (![cls instancesRespondToSelector:@selector(initWithView:deviceTypes:changeHandler:)]) {
    static dispatch_once_t once;
    dispatch_once(&once, ^{
      NSLog(@"[react-native-duo] AVCaptureDeviceDirectionCoordinator has no initWithView:deviceTypes:changeHandler:; camera directions are unavailable. Please file an issue.");
    });
    return Nil;
  }
  return cls;
}

+ (BOOL)isSupported {
  return [self coordinatorClass] != Nil;
}

+ (instancetype)observerForView:(UIView *)view handler:(void (^)(NSDictionary<NSString *, id> *))handler {
  Class cls = [self coordinatorClass];
  if (cls == Nil) return nil;
  DuoCameraDirections *observer = [[self alloc] init];
  void (^changeHandler)(id) = ^(id map) {
    handler(DuoDirections(map));
  };
  @try {
    id allocated = [cls alloc];
    id (*init)(id, SEL, UIView *, NSArray<NSString *> *, void (^)(id)) = (void *)objc_msgSend;
    observer->_coordinator = init(allocated, @selector(initWithView:deviceTypes:changeHandler:), view, DuoCameraDeviceTypes(), changeHandler);
  } @catch (NSException *exception) {
    NSLog(@"[react-native-duo] Camera directions failed to start: %@", exception.reason);
    return nil;
  }
  return observer->_coordinator == nil ? nil : observer;
}

@end
