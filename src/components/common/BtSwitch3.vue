<template>
  <div
      class="bt-switch3"
      :class="{ disabled }"
      ref="root"
      tabindex="0"
      @keydown="onKeydown"
      role="slider"
      :aria-valuemin="0"
      :aria-valuemax="options.length - 1"
      :aria-valuenow="currentIndex"
      :aria-disabled="disabled ? 'true' : 'false'"
  >
    <div class="track" ref="track" @click="onTrackClick">
      <!-- Thumb（用 transform 平移以避免 layout thrash） -->
      <div
          class="thumb"
          ref="thumb"
          :style="thumbTransform"
          @pointerdown.prevent="onPointerDown"
      >
        <!-- 玻璃内部高光 -->
        <div class="thumb-inner" />
      </div>

      <!-- 每个挡位均等分布（flex） -->
      <div
          v-for="(opt, i) in options"
          :key="opt.value ?? i"
          class="option"
          :style="(optionStyle(i) as any)"
      >
        <span class="label">{{ opt.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue"

type Option = { label: string; value: string; color: string; index: number }

// ---------- props ----------
const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  options: {
    type: Array as () => Option[],
    default: () => [
      { label: "低", value: "low", color: "#ef0808", index: 0 },
      { label: "中", value: "mid", color: "#f0ad4e", index: 1 },
      { label: "高", value: "high", color: "#20a53a", index: 2 },
    ],
  },
  disabled: { type: Boolean, default: false },
  // 物理参数：可按需微调
  springStiffness: { type: Number, default: 300 }, // k
  damping: { type: Number, default: 35 }, // c
  mass: { type: Number, default: 1 }, // m
  stopThreshold: { type: Number, default: 0.4 }, // px velocity threshold to snap to exact
})

const emit = defineEmits<{
  (e: "update:modelValue", v: string | number): void
  (e: "change", v: string | number): void
}>()

// ---------- DOM refs ----------
const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const thumb = ref<HTMLElement | null>(null)

// ---------- reactive state (px) ----------
const thumbX = ref(0) // left offset of thumb (px)
const thumbV = ref(0) // velocity (px / s)
const targetX = ref(0) // target left (px) - driven by pointer or index
const currentIndex = ref(0)

// ---------- measurements ----------
let trackWidth = 0
let thumbWidth = 0
let segmentWidth = 0

// ---------- helpers ----------
function computeMeasurements() {
  if (!track.value || !thumb.value) return
  const tr = track.value.getBoundingClientRect()
  const th = thumb.value.getBoundingClientRect()
  trackWidth = tr.width
  thumbWidth = th.width
  segmentWidth = trackWidth / Math.max(1, props.options.length)
}

// centers (relative to track left)
function centers() {
  const arr: number[] = []
  for (let i = 0; i < props.options.length; i++) {
    arr.push(segmentWidth * i + segmentWidth / 2)
  }
  return arr
}

function indexToLeft(i: number) {
  const c = centers()[i] ?? 0
  return c - thumbWidth / 2
}
function leftToIndexByCenter(leftCenter: number) {
  // leftCenter is center coordinate relative to track left
  let idx = Math.round((leftCenter - segmentWidth / 2) / segmentWidth + 0.0)
  // fallback safe compute
  idx = Math.floor(leftCenter / segmentWidth)
  idx = Math.max(0, Math.min(props.options.length - 1, idx))
  return idx
}
function clampLeft(left: number) {
  return Math.max(0, Math.min(trackWidth - thumbWidth, left))
}

// ---------- sync modelValue -> currentIndex ----------
watch(
    () => props.modelValue,
    (val) => {
      const idx = props.options.findIndex((o) => o.value === val)
      const i = idx >= 0 ? idx : 0
      currentIndex.value = i
      // set target to corresponding index left (physics will move thumb)
      targetX.value = indexToLeft(i)
    },
    { immediate: true }
)

// ---------- physics loop (semi-implicit integration) ----------
let raf: number | null = null
let lastT = 0

function physicsStep(t: number) {
  if (!lastT) lastT = t
  const dt = Math.min(0.032, (t - lastT) / 1000) // seconds, cap dt
  lastT = t

  const x = thumbX.value
  const v = thumbV.value
  const k = props.springStiffness
  const c = props.damping
  const m = props.mass
  // spring force toward target: F = k*(target - x)  (positive => accelerate right)
  const fSpring = k * (targetX.value - x)
  // damping proportional to velocity: -c * v
  const fDamp = -c * v
  const a = (fSpring + fDamp) / m

  // semi-implicit Euler: v += a*dt; x += v*dt
  thumbV.value = v + a * dt
  thumbX.value = clampLeft(x + thumbV.value * dt)

  // if close enough to target and velocity small, snap exactly and zero velocity
  if (
      Math.abs(targetX.value - thumbX.value) < 0.25 &&
      Math.abs(thumbV.value) < props.stopThreshold
  ) {
    thumbX.value = targetX.value
    thumbV.value = 0
    // don't stop RAF because target may change (dragging or next interactions),
    // but we still keep RAF running for responsiveness
  }

  raf = requestAnimationFrame(physicsStep)
}
function startPhysicsLoop() {
  if (raf != null) return
  lastT = 0
  raf = requestAnimationFrame(physicsStep)
}
function stopPhysicsLoop() {
  if (raf != null) {
    cancelAnimationFrame(raf)
    raf = null
  }
}

// ---------- pointer / drag logic (target follows pointer center) ----------
let activePointerId: number | null = null
let pointerTrackRectLeft = 0

function onPointerDown(e: PointerEvent) {
  if (props.disabled) return
  if (e.button && e.button !== 0) return
  // capture
  (e.target as Element).setPointerCapture?.(e.pointerId)
  activePointerId = e.pointerId

  // ensure measurements
  computeMeasurements()
  pointerTrackRectLeft = track.value!.getBoundingClientRect().left

  // set target to pointer center (so spring pulls toward pointer)
  const px = clampLeft(e.clientX - pointerTrackRectLeft - thumbWidth / 2)
  targetX.value = px

  // add listeners
  const onMove = (ev: PointerEvent) => {
    if (ev.pointerId !== activePointerId) return
    const px2 = clampLeft(ev.clientX - pointerTrackRectLeft - thumbWidth / 2)
    targetX.value = px2
    // ensure physics running
    startPhysicsLoop()
    ev.preventDefault()
  }
  const onUp = (ev: PointerEvent) => {
    if (ev.pointerId !== activePointerId) return
    try {
      (e.target as Element).releasePointerCapture?.(activePointerId!)
    } catch {}
    activePointerId = null
    // on release => snap to nearest index (set target to index left + emit)
    const center = thumbX.value + thumbWidth / 2
    const nearest = Math.max(
        0,
        Math.min(props.options.length - 1, Math.round((center - segmentWidth / 2) / segmentWidth + 0.0))
    )
    // safer compute by direct function:
    const segIdx = leftToIndexByCenter(center)
    const finalIdx = segIdx // use leftToIndexByCenter for stable result
    currentIndex.value = finalIdx
    targetX.value = indexToLeft(finalIdx)
    if (props.options[finalIdx].value !== props.modelValue ) {
      emit("update:modelValue", props.options[finalIdx].value)
      emit("change", props.options[finalIdx].value)
    }

    window.removeEventListener("pointermove", onMove)
    window.removeEventListener("pointerup", onUp)
    window.removeEventListener("pointercancel", onUp)
  }

  window.addEventListener("pointermove", onMove, { passive: false })
  window.addEventListener("pointerup", onUp)
  window.addEventListener("pointercancel", onUp)

  // ensure physics running
  startPhysicsLoop()
}

// ---------- click on track (target set to nearest index) ----------
function onTrackClick(e: MouseEvent) {
  if (props.disabled || !track.value) return
  computeMeasurements()
  const rect = track.value.getBoundingClientRect()
  const x = clampLeft(e.clientX - rect.left - thumbWidth / 2)
  // find nearest index by center
  const center = x + thumbWidth / 2
  const idx = leftToIndexByCenter(center)
  currentIndex.value = idx
  targetX.value = indexToLeft(idx)
  if (props.options[idx].value !== props.modelValue ) {
    emit("update:modelValue", props.options[idx].value)
    emit("change", props.options[idx].value)
  }
  startPhysicsLoop()
}

// ---------- keyboard support ----------
function onKeydown(e: KeyboardEvent) {
  if (props.disabled) return
  if (e.key === "ArrowLeft") {
    const i = Math.max(0, currentIndex.value - 1)
    currentIndex.value = i
    targetX.value = indexToLeft(i)
    emit("update:modelValue", props.options[i].value)
    emit("change", props.options[i].value)
    startPhysicsLoop()
    e.preventDefault()
  } else if (e.key === "ArrowRight") {
    const i = Math.min(props.options.length - 1, currentIndex.value + 1)
    currentIndex.value = i
    targetX.value = indexToLeft(i)
    emit("update:modelValue", props.options[i].value)
    emit("change", props.options[i].value)
    startPhysicsLoop()
    e.preventDefault()
  } else if (e.key === "Home") {
    currentIndex.value = 0
    targetX.value = indexToLeft(0)
    emit("update:modelValue", props.options[0].value)
    emit("change", props.options[0].value)
    startPhysicsLoop()
    e.preventDefault()
  } else if (e.key === "End") {
    const i = props.options.length - 1
    currentIndex.value = i
    targetX.value = indexToLeft(i)
    emit("update:modelValue", props.options[i].value)
    emit("change", props.options[i].value)
    startPhysicsLoop()
    e.preventDefault()
  }
}

// ---------- label interpolation: color & scale based on distance to thumb center ----------
function optionStyle(i: number) {
  if (!track.value || !thumb.value) {
    return {
      flex: 1,
      textAlign: "center",
    }
  }
  const tRect = thumb.value.getBoundingClientRect()
  const thumbCenter = thumbX.value + tRect.width / 2
  const c = centers()[i] ?? 0
  const maxDist = segmentWidth * 1.4 // 距离在哪个范围内开始衰减
  const d = Math.min(maxDist, Math.abs(thumbCenter - c))
  const p = 1 - d / maxDist // 1 = nearby, 0 = far
  // color interpolation: near -> white; far -> semi transparent white
  const alpha = 0.42 + 0.58 * p // 0.42..1.0
  const color = `rgba(255,255,255,${alpha.toFixed(3)})`
  const scale = 1 + 0.30 * p // 1..1.3
  const weight = Math.round(400 + 300 * p) // 400..700
  return {
    flex: 1,
    textAlign: "center",
    // color: color,
    color: props.options[i].color,
    transform: `scale(${scale})`,
    fontWeight: `${weight}`,
    transition: "color 160ms ease, transform 160ms ease, font-weight 160ms ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none" as const,
  }
}

// ---------- computed style for thumb transform ----------
const thumbTransform = computed(() => {
  // Use translateX + translateY(-50%)
  return {
    transform: `translate3d(${thumbX.value}px, -50%, 0)`,
    willChange: "transform",
  }
})

// ---------- resize observer to update sizes ----------
let ro: ResizeObserver | null = null
function setupResizeObserver() {
  if (!track.value || !thumb.value) return
  computeMeasurements()
  ro = new ResizeObserver(() => {
    // recompute and adjust positions when container/responsive changes
    // keep current index target aligned
    computeMeasurements()
    // update target to currentIndex to keep alignment
    targetX.value = indexToLeft(currentIndex.value)
  })
  ro.observe(track.value)
  ro.observe(thumb.value)
}

// ---------- lifecycle ----------
onMounted(async () => {
  await nextTick()
  // measure
  computeMeasurements()
  // init index from modelValue or default
  const idx = props.options.findIndex((o) => o.value === props.modelValue)
  const i = idx >= 0 ? idx : 0
  currentIndex.value = i
  // set initial positions exactly
  thumbX.value = indexToLeft(i)
  targetX.value = thumbX.value
  // start physics (keeps responsiveness)
  startPhysicsLoop()
  setupResizeObserver()
})
onBeforeUnmount(() => {
  stopPhysicsLoop()
  if (ro) {
    try {
      ro.disconnect()
    } catch {}
    ro = null
  }
})
</script>

<style scoped>
/* container */
.bt-switch3 {
  width: 100%;
  max-width: 420px;
  user-select: none;
  outline: none;
}

/* track */
.track {
  position: relative;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 6px;
  border-radius: 16px;
  box-sizing: border-box;
  /* subtle textured background */
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.06));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.02),
  0 6px 20px rgba(0,0,0,0.20);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  overflow: hidden;
}

/* option labels (flex children) */
.option {
  z-index: 3;
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  transition: color 160ms ease, transform 160ms ease;
  -webkit-font-smoothing: antialiased;
  user-select: none;
}

/* thumb - liquid glass */
.thumb {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  /* thumb width based on 3 segments; keep padding inside track */
  width: calc(100% / 3 - 12px);
  max-width: 160px;
  min-width: 80px;
  height: 44px;
  border-radius: 300px;
  z-index: 2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  /* glass look */
  background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow:
      0 12px 40px rgba(0,0,0,0.40),
      inset 0 1px 0 rgba(255,255,255,0.06);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  transition: box-shadow 180ms ease, transform 120ms ease;
  will-change: transform;
}

/* small inner highlight on thumb to increase depth */
.thumb-inner {
  width: 82%;
  height: 66%;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10);
  pointer-events: none;
}

/* disabled state */
.bt-switch3.disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* ensure label looks crisp when scaled */
.label {
  display: inline-block;
  transform-origin: center;
  transition: transform 160ms ease, font-weight 160ms ease, color 160ms ease;
  text-shadow: 0 2px 12px rgba(0,0,0,0.35);
}

/* responsive */
@media (max-width: 420px) {
  .track { height: 48px; padding: 4px; border-radius: 300px; }
  .thumb { height: 38px; border-radius: 10px; }
  .option { font-size: 13px; }
}
</style>
