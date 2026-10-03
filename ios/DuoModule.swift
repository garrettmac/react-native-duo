import ExpoModulesCore

public final class DuoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ReactNativeDuo")

    Function("supportsCameraDirections") {
      DuoCameraDirections.isSupported()
    }

    View(DuoObserverView.self) {
      Events("onDuoChange", "onCameraDirections")

      Prop("observeCameras") { (view: DuoObserverView, observe: Bool) in
        view.observeCameras = observe
      }
    }
  }
}
