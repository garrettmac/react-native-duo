package io.github.garrettmac.duo

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DuoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ReactNativeDuo")

    Function("supportsCameraDirections") { false }

    View(DuoObserverView::class) {
      Events("onDuoChange", "onCameraDirections")

      Prop("observeCameras") { _: DuoObserverView, _: Boolean -> }
    }
  }
}
