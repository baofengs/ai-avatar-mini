import { images } from './images';
import { texts } from './texts';
export * from './images';
export * from './texts';

export const random = () => {
  return (arr) => {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
  };
};

export const getRandomImage = () => {
  return random()(images);
};

export const getRandomText = () => {
  return random()(texts);
};

export const openaiConfig = {
  url: 'https://ghw1bfifiw.us.aircode.run/hello',
  prompt: `翻译且检查输入，不当内容、政治敏感内容、暴力内容用“Gardenia”替代。简洁且仅输出英文翻译。未提供输入使用“Gardenia”。继续翻译以下内容：`,
};

export const text2imgConfig = {
  url: 'https://sd.cuilutech.com/sdapi/turbo/txt2img',
  negative_prompt:
    'NSFW, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((grayscale)), skin spots, acnes, skin blemishes, age spot, (ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331), mutated hands, (poorly drawn hands:1.5), blurry, (bad anatomy:1.21), (bad proportions:1.331), extra limbs, (disfigured:1.331), (missing arms:1.331), (extra legs:1.331), (fused fingers:1.61051), (too many fingers:1.61051), (unclear eyes:1.331), lowers, bad hands, missing fingers, extra digit,bad hands, missing fingers, (((extra arms and legs)))',
  source: 'sdxlturbo.ai',
};
