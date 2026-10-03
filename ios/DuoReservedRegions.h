#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/**
 Reads the iOS 27.1 reserved-region and vertical-bar-edge APIs. They are compiled in only when the SDK has them and
 called only on an OS that has them; otherwise the edge is nil and the regions are empty.
 */
@interface DuoReservedRegions : NSObject

/** The traits whose change can change the size classes or the vertical bar edge. */
+ (NSArray<Class<UITraitDefinition>> *)traitsAffectingLayout NS_SWIFT_NAME(traitsAffectingLayout()) API_AVAILABLE(ios(17.0));

/** Registers `action` on `view` for every trait in `traitsAffectingLayout`; kept in Objective-C so the trait list keeps its UIKit type. */
+ (id<UITraitChangeRegistration>)registerLayoutTraitChangesForView:(UIView *)view action:(SEL)action NS_SWIFT_NAME(registerLayoutTraitChanges(for:action:)) API_AVAILABLE(ios(17.0));

/** `leading`, `trailing`, or nil when the system has no preferred edge or the OS or SDK predates the API. */
+ (nullable NSString *)verticalBarEdgeForView:(UIView *)view NS_SWIFT_NAME(verticalBarEdge(for:));

/** Every division and occlusion that intersects the view, active or not, as dictionaries ready for the JS event. */
+ (NSArray<NSDictionary<NSString *, id> *> *)regionsForView:(UIView *)view NS_SWIFT_NAME(regions(for:));

@end

NS_ASSUME_NONNULL_END
