#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/**
 Follows which cameras face the same way as a view, through iOS 27.1's AVCaptureDeviceDirectionCoordinator. Every
 27.1 symbol is looked up at run time, so this compiles with any SDK and reports nothing where the API is missing.
 */
@interface DuoCameraDirections : NSObject

/** True when this OS has the direction coordinator. */
+ (BOOL)isSupported;

/** Starts following `view`; `handler` gets `{forward: [...], backward: [...]}` now and on every change. Nil when unsupported. */
+ (nullable instancetype)observerForView:(UIView *)view handler:(void (^)(NSDictionary<NSString *, id> *directions))handler
    NS_SWIFT_NAME(observer(for:handler:));

@end

NS_ASSUME_NONNULL_END
