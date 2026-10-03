import ExpoModulesCore
import UIKit

public final class DuoObserverView: ExpoView {
  let onDuoChange = EventDispatcher()
  let onCameraDirections = EventDispatcher()

  var observeCameras = false {
    didSet { updateCameraObserver() }
  }

  private var cameraObserver: DuoCameraDirections?

  private var traitRegistration: Any?
  private var lastPayload: NSDictionary?

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    isUserInteractionEnabled = false
    isAccessibilityElement = false
    backgroundColor = .clear

    if #available(iOS 17.0, *) {
      traitRegistration = DuoReservedRegions.registerLayoutTraitChanges(for: self, action: #selector(layoutTraitsChanged))
    }
  }

  public override func didMoveToWindow() {
    super.didMoveToWindow()
    updateCameraObserver()
    emitIfChanged()
  }

  private func updateCameraObserver() {
    guard observeCameras, window != nil else {
      cameraObserver = nil
      return
    }
    guard cameraObserver == nil else { return }
    cameraObserver = DuoCameraDirections.observer(for: self) { [weak self] directions in
      self?.onCameraDirections(directions)
    }
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    emitIfChanged()
  }

  public override func safeAreaInsetsDidChange() {
    super.safeAreaInsetsDidChange()
    emitIfChanged()
  }

  public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    super.traitCollectionDidChange(previousTraitCollection)
    emitIfChanged()
  }

  @objc private func layoutTraitsChanged() {
    emitIfChanged()
  }

  private func emitIfChanged() {
    guard window != nil else { return }
    let payload = snapshot()
    let boxed = payload as NSDictionary
    if let last = lastPayload, last.isEqual(boxed) { return }
    lastPayload = boxed
    onDuoChange(payload)
  }

  private func snapshot() -> [String: Any] {
    let traits = traitCollection
    return [
      "sizeClass": [
        "horizontal": sizeClassName(traits.horizontalSizeClass),
        "vertical": sizeClassName(traits.verticalSizeClass)
      ],
      "verticalBarEdge": DuoReservedRegions.verticalBarEdge(for: self) ?? NSNull(),
      "regions": DuoReservedRegions.regions(for: self)
    ]
  }

  private func sizeClassName(_ sizeClass: UIUserInterfaceSizeClass) -> String {
    sizeClass == .regular ? "regular" : "compact"
  }
}
