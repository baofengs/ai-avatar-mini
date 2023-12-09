import {
  GestureState,
  clamp,
  Curves,
  bottomSheetSuspendedCurve,
} from '../../custom-route/util';

const { timing, shared } = wx.worklet;

const _minFlingVelocity = 500;
const _closeProgressThreshold = 0.6;
const _duration = 400;

Component({
  options: {
    multipleSlots: true,
  },
  properties: {
    title: {
      type: String,
      value: '',
    },
    background: {
      type: String,
      value: '',
    },
    color: {
      type: String,
      value: '',
    },
    back: {
      type: Boolean,
      value: true,
    },
    loading: {
      type: Boolean,
      value: false,
    },
    // back为true的时候，返回的页面深度
    delta: {
      type: Number,
      value: 1,
    },
    sideWidth: {
      type: Number,
      value: 0,
    },
    fullscreen: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    placeholderHeight: 150,
  },
  lifetimes: {
    attached() {
      const offsetToMuenu = 2;
      const prevPageVisibleOffset = 10;
      const menuRect = wx.getMenuButtonBoundingClientRect();
      const prevPageTop = menuRect.bottom + offsetToMuenu;
      const placeholderHeight = (prevPageTop + prevPageVisibleOffset) * 2;
      this.setData({ placeholderHeight: placeholderHeight });
      this.initSharedValue();
    },
  },

  methods: {
    back() {
      wx.navigateBack({
        delta: 1,
      });
    },

    initSharedValue() {
      this.childHeight = shared(0);
      this.scrollTop = shared(0);
      this.startPan = shared(false);
      this.customRouteContext = wx.router.getRouteContext(this) || {};

      this.getChildHeight();
    },

    getChildHeight() {
      this.createSelectorQuery()
        .select('.container')
        .boundingClientRect((rect) => {
          this.childHeight.value = rect ? rect.height : 60;
        })
        .exec();
    },

    shouldPanResponse() {
      'worklet';
      return this.startPan.value;
    },
    shouldScrollViewResponse(pointerEvent) {
      'worklet';
      const { primaryAnimation } = this.customRouteContext;
      if (primaryAnimation.value < 1) return false;
      const scrollTop = this.scrollTop.value;
      const { deltaY } = pointerEvent;
      const result = !(scrollTop <= 0 && deltaY > 0);
      this.startPan.value = !result;
      return result;
    },
    adjustDecelerationVelocity(velocity) {
      'worklet';
      const scrollTop = this.scrollTop.value;
      return scrollTop <= 0 ? 0 : velocity;
    },
    handleScroll(evt) {
      'worklet';
      this.scrollTop.value = evt.detail.scrollTop;
    },
    handleDragStart() {
      'worklet';
      debugger;
      this.startPan.value = true;
      const { startUserGesture } = this.customRouteContext;
      startUserGesture();
    },

    handleDragUpdate(delta) {
      'worklet';
      const { primaryAnimation } = this.customRouteContext;
      const newVal = primaryAnimation.value - delta;
      primaryAnimation.value = clamp(newVal, 0.0, 1.0);
    },

    handleDragEnd(velocity) {
      'worklet';
      this.startPan.value = false;
      const {
        primaryAnimation,
        stopUserGesture,
        userGestureInProgress,
        didPop,
      } = this.customRouteContext;

      if (!userGestureInProgress.value) return;

      let animateForward = false;
      if (Math.abs(velocity) >= _minFlingVelocity) {
        animateForward = velocity <= 0;
      } else {
        animateForward = primaryAnimation.value > _closeProgressThreshold;
      }
      const t = primaryAnimation.value;
      const animationCurve = bottomSheetSuspendedCurve(
        t,
        Curves.decelerateEasing
      );

      if (animateForward) {
        const remainingFraction = 1.0 - t;
        const simulationDuration = _duration * remainingFraction;

        primaryAnimation.value = timing(
          1.0,
          {
            duration: simulationDuration,
            easing: animationCurve,
          },
          () => {
            'worklet';
            stopUserGesture();
          }
        );
      } else {
        // TODO: 结合松手时的速度作 spring 动画
        const remainingFraction = t;
        const simulationDuration = _duration * remainingFraction;
        const animationCurve = Curves.easeOutCubic;

        primaryAnimation.value = timing(
          0.0,
          {
            duration: simulationDuration,
            easing: animationCurve,
          },
          () => {
            'worklet';
            stopUserGesture();
            didPop();
          }
        );
      }
    },

    handleVerticalDrag(evt) {
      'worklet';
      if (this.disableDrag) return;
      if (evt.state === GestureState.BEGIN) {
        this.handleDragStart();
      } else if (evt.state === GestureState.ACTIVE) {
        const delta = evt.deltaY / this.childHeight.value;
        this.handleDragUpdate(delta);
      } else if (evt.state === GestureState.END) {
        const velocity = evt.velocityY;
        this.handleDragEnd(velocity);
      } else if (evt.state === GestureState.CANCELLED) {
        this.handleDragEnd(0.0);
      }
    },
  },
});
