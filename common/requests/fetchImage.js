import { textToImage } from './textToImage';
import store from '../utils/store';

export class ImageRequester {
  constructor() {
    this.cacheExpiration = 24 * 60 * 60 * 1000; // 一天的有效期
    this.loadImageQueueCache();
    this.isRequesting = false;
    this.minQueueLength = 5;
  }

  async requestImages(prompt) {
    let imageQueue = this.imageQueueCache.get(prompt) || [];

    if (!imageQueue.length) {
      // 如果缓存中没有对应的图片队列，创建一个新的队列并缓存
      this.initializeImageQueue(prompt, imageQueue);
    } else if (imageQueue.length < this.minQueueLength && !this.isRequesting) {
      // 如果队列中的图片少于最小队列长度阈值且没有正在请求的图片，异步请求足够数量的图片以补充队列
      this.fetchAndQueueImage(prompt, this.minQueueLength - imageQueue.length, imageQueue);
    }

    if (imageQueue.length > 0) {
      this.saveImageQueueCache();
      return imageQueue.shift().url; // 返回图片的 URL
    } else {
      // 如果队列为空，同步请求一张图片并返回，同时异步补充队列
      await this.fetchAndQueueImage(prompt, this.minQueueLength, imageQueue);
      this.saveImageQueueCache();
      return await textToImage(prompt); // 返回图片的 URL
    }
  }

  async fetchAndQueueImage(prompt, count = 1, imageQueue) {
    if (this.isRequesting) {
      return;
    }

    this.isRequesting = true;

    try {
      const imagePromises = Array.from({ length: count }, () => this.requestSingleImage(prompt));
      const images = await Promise.all(imagePromises);
      imageQueue.push(...images);
      this.saveImageQueueCache();
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      this.isRequesting = false;
    }
  }

  async requestSingleImage(prompt) {
    const url = await textToImage(prompt);
    return { url, timestamp: Date.now() }; // 添加时间戳
  }

  initializeImageQueue(prompt, imageQueue) {
    // 创建一个新的队列并缓存
    imageQueue = [];
    this.imageQueueCache.set(prompt, imageQueue);
    this.fetchAndQueueImage(prompt, this.minQueueLength, imageQueue);
  }

  saveImageQueueCache() {
    const serializedCache = JSON.stringify([...this.imageQueueCache]);
    store.set('imageQueueCache', serializedCache);
  }

  loadImageQueueCache() {
    const serializedCache = store.get('imageQueueCache');
    this.imageQueueCache = new Map(JSON.parse(serializedCache)) || new Map();
    this.filterExpiredImages();
  }

  filterExpiredImages() {
    const now = Date.now();
    for (const [prompt, imageQueue] of this.imageQueueCache.entries()) {
      this.imageQueueCache.set(prompt, imageQueue.filter(image => now - image.timestamp <= this.cacheExpiration));
    }
  }
}

const imageRequester = new ImageRequester();

export const fetchImage = async (prompt) => {
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error('[fetchImage] Invalid prompt provided.');
  }

  return await imageRequester.requestImages(prompt);
};
