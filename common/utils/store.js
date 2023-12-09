export default {
  get(key) {
    if (!key) {
      throw new Error('[store.get] Invalid key provided.');
    }
    return wx.getStorageSync(key) || null;
  },
  async set(key, data) {
    if (!key) {
      throw new Error('[store.set] Invalid key provided.');
    }
    try {
      await wx.setStorage({ key, data });
    } catch (error) {
      console.error(`[store.set] fail to set ${key}: ${data} to storage.`, error);
    }
  },
  remove(key) {
    return wx.removeStorageSync(key);
  },
};
