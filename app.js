App({
  onLaunch() {
    const systemInfo = wx.getSystemInfoSync();
    Object.assign(this.globalData, systemInfo);
  },
  globalData: {},
});
