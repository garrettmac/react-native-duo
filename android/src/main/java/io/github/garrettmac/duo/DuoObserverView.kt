package io.github.garrettmac.duo

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

private const val REGULAR_WIDTH_MIN_DP = 600f
private const val REGULAR_HEIGHT_MIN_DP = 480f
private const val TAG = "ReactNativeDuo"

@SuppressLint("ViewConstructor")
class DuoObserverView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onDuoChange by EventDispatcher<Map<String, Any>>()
  private var tracking: Job? = null
  private var folds: List<FoldingFeature> = emptyList()
  private var lastPayload: Map<String, Any>? = null

  init {
    isClickable = false
    isFocusable = false
    addOnLayoutChangeListener { _, _, _, _, _, _, _, _, _ -> emitIfChanged() }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    val activity = appContext.currentActivity
    if (activity == null) {
      Log.w(TAG, "No current activity; the fold is not tracked")
      return
    }
    tracking = appContext.mainQueue.launch {
      WindowInfoTracker.getOrCreate(activity).windowLayoutInfo(activity).collect { info ->
        folds = info.displayFeatures.filterIsInstance<FoldingFeature>()
        emitIfChanged()
      }
    }
  }

  override fun onDetachedFromWindow() {
    tracking?.cancel()
    tracking = null
    super.onDetachedFromWindow()
  }

  private fun emitIfChanged() {
    if (width == 0 || height == 0) return
    val payload = snapshot()
    if (payload == lastPayload) return
    lastPayload = payload
    onDuoChange(payload)
  }

  private fun snapshot(): Map<String, Any> {
    val density = resources.displayMetrics.density
    val origin = IntArray(2)
    getLocationInWindow(origin)
    val widthDp = width / density
    val heightDp = height / density
    val regions = folds.map { fold ->
      val bounds = fold.bounds
      mapOf(
        "kind" to "division",
        "frame" to mapOf(
          "x" to (bounds.left - origin[0]) / density.toDouble(),
          "y" to (bounds.top - origin[1]) / density.toDouble(),
          "width" to bounds.width() / density.toDouble(),
          "height" to bounds.height() / density.toDouble()
        ),
        "margins" to mapOf("top" to 0.0, "left" to 0.0, "bottom" to 0.0, "right" to 0.0),
        "isActive" to (fold.state == FoldingFeature.State.HALF_OPENED)
      )
    }
    return mapOf(
      "sizeClass" to mapOf(
        "horizontal" to if (widthDp >= REGULAR_WIDTH_MIN_DP) "regular" else "compact",
        "vertical" to if (heightDp >= REGULAR_HEIGHT_MIN_DP) "regular" else "compact"
      ),
      "regions" to regions
    )
  }
}
