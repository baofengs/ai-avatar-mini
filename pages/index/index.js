import { CustomRotue } from '../../common/custom-route/config';
import { fetchImage } from '../../common/requests/fetchImage';

Page({
  data: {
    prompt: 'Sunglasses-wearing Garfield',
    description: '',
    avatar: '',
    loading: false,
    translating: false,
  },

  async onLoad() {
    this.loadAvatar();
  },

  async loadAvatar() {
    if (this.data.loading) {
      return;
    }
    this.setData({ loading: true });
    const avatar = await fetchImage(this.data.prompt);
    this.setData({ avatar, loading: false });
  },

  bindKeyInput(e) {
    console.log(e, e.detail.value);
    // this.setData({
    //   description: e.detail.value,
    // });
  },

  goto() {
    wx.navigateTo({
      url: '/pages/favorite/favorite',
      routeType: CustomRotue.CupertinoModal,
    });
  },

  gotoDictionary() {
    wx.navigateTo({
      url: '/pages/dictionary/dictionary',
      routeType: CustomRotue.CupertinoModal,
    });
  },
});
