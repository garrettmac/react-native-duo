#import "DuoReservedRegions.h"

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 270100
#define DUO_SDK_HAS_RESERVED_REGIONS 1
#else
#define DUO_SDK_HAS_RESERVED_REGIONS 0
#endif

#if DUO_SDK_HAS_RESERVED_REGIONS
static NSArray<NSDictionary<NSString *, id> *> *DuoRegionsOfKind(UIViewReservedRegionKind *kind, NSString *name, UIView *view)
    API_AVAILABLE(ios(27.1)) {
  NSArray<UIViewReservedRegion *> *found = [view reservedRegionsOfKind:kind options:UIViewReservedRegionQueryOptionsIncludeInactive];
  NSMutableArray<NSDictionary<NSString *, id> *> *regions = [NSMutableArray arrayWithCapacity:found.count];
  for (UIViewReservedRegion *region in found) {
    CGRect frame = region.frame;
    UIEdgeInsets margins = region.margins;
    [regions addObject:@{
      @"kind": name,
      @"frame": @{@"x": @(frame.origin.x), @"y": @(frame.origin.y), @"width": @(frame.size.width), @"height": @(frame.size.height)},
      @"margins": @{@"top": @(margins.top), @"left": @(margins.left), @"bottom": @(margins.bottom), @"right": @(margins.right)},
      @"isActive": @(region.active),
    }];
  }
  return regions;
}
#endif

@implementation DuoReservedRegions

+ (NSArray<Class<UITraitDefinition>> *)traitsAffectingLayout {
  NSMutableArray<Class<UITraitDefinition>> *traits = [NSMutableArray arrayWithObjects:UITraitHorizontalSizeClass.class, UITraitVerticalSizeClass.class, nil];
#if DUO_SDK_HAS_RESERVED_REGIONS
  if (@available(iOS 27.1, *)) {
    [traits addObjectsFromArray:UITraitCollection.systemTraitsAffectingVerticalBarEdge];
  }
#endif
  return traits;
}

+ (id<UITraitChangeRegistration>)registerLayoutTraitChangesForView:(UIView *)view action:(SEL)action {
  return [view registerForTraitChanges:[self traitsAffectingLayout] withAction:action];
}

+ (NSString *)verticalBarEdgeForView:(UIView *)view {
#if DUO_SDK_HAS_RESERVED_REGIONS
  if (@available(iOS 27.1, *)) {
    switch (view.traitCollection.verticalBarEdge) {
      case UIVerticalBarEdgeLeading:
        return @"leading";
      case UIVerticalBarEdgeTrailing:
        return @"trailing";
      case UIVerticalBarEdgeUnspecified:
        return nil;
    }
  }
#endif
  return nil;
}

+ (NSArray<NSDictionary<NSString *, id> *> *)regionsForView:(UIView *)view {
#if DUO_SDK_HAS_RESERVED_REGIONS
  if (@available(iOS 27.1, *)) {
    NSMutableArray<NSDictionary<NSString *, id> *> *regions = [NSMutableArray array];
    [regions addObjectsFromArray:DuoRegionsOfKind(UIViewReservedRegionKind.divisionRegionKind, @"division", view)];
    [regions addObjectsFromArray:DuoRegionsOfKind(UIViewReservedRegionKind.occlusionRegionKind, @"occlusion", view)];
    return regions;
  }
#endif
  return @[];
}

@end
