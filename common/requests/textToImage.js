import { getRandomImage, text2imgConfig } from '../config/index';
import { post } from './http';

export const textToImage = async (prompt) => {
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error('[textToImage] Invalid prompt provided.');
  }

  try {
    const { url, source, negative_prompt } = text2imgConfig;
    const res = await post(url, {
      prompt,
      negative_prompt,
      source,
    });

    // 响应验证
    if (res && res.code === 200) {
      const image = res.data.image_url;
      return image;
    } else {
      throw new Error(
        '[textToImage] Invalid response received from the server.'
      );
    }
  } catch (error) {
    console.error('[textToImage] Error occurred while fetching image:', error);
    return getRandomImage();
  }
};
