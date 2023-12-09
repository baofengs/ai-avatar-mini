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
      value: true,
    },
  },

  attached() {
    const isSupport = !!wx.getMenuButtonBoundingClientRect;
    const rect = wx.getMenuButtonBoundingClientRect
      ? wx.getMenuButtonBoundingClientRect()
      : null;
    wx.getSystemInfo({
      success: (res) => {
        const ios = !!(res.system.toLowerCase().search('ios') + 1);
        const sideWidth = isSupport ? res.windowWidth - rect.left : 0;

        this.setData({
          ios,
          sideWidth: this.data.sideWidth || sideWidth,
          statusBarHeight: res.statusBarHeight,
        });
      },
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    back() {
      const { data } = this;
      if (data.delta) {
        wx.navigateBack({
          delta: data.delta,
        });
      }
      this.triggerEvent('back', { delta: data.delta }, {});
    },
  },
});
