const CustomRotue = {
  BottomSheet: 'wx://bottom-sheet',
  Upwards: 'wx://upwards',
  FadeUpwards: 'wx://fade-upwards',
  Zoom: 'wx://zoom',
  Modal: 'wx://modal',
  Cupertino: 'wx://cupertino',
  CupertinoModal: 'wx://cupertino-modal',
  CupertinoModalInside: 'wx://cupertino-modal-inside',
  ModalNavigation: 'wx://modal-navigation',
};

Page({
  data: {},

  onLoad() {},

  goto() {
    wx.navigateTo({
      url: '/pages/favorite/favorite',
      routeType: CustomRotue.CupertinoModal
    })
  },

  gotoDictionary() {
    wx.navigateTo({
      url: '/pages/dictionary/dictionary',
      routeType: CustomRotue.CupertinoModal
    })
  },
});
