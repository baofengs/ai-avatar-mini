import store from '../utils/store';
import { promisify } from '../utils/index';

const domains = {
  local: 'http://127.0.0.1:1234',
  remote: 'http://124.222.183.191:8091',
  prod: 'https://aiwanban.cn/api',
};

const buildFullUrl = (path, domain = domains.prod) => `${domain}${path}`;
export const isAbsolutePath = (url) => /^https?:\/\//.test(url);

const TOKEN = 'TOKEN';
const initRequestHeaders = () => {
  const userToken = store.get(TOKEN);
  return userToken ? { Token: userToken } : {};
};

export const requestHeaders = {};

export const setRequestHeader = (key, value) => {
  requestHeaders[key] = value;
};

export const removeRequestHeaders = (key) => {
  delete requestHeaders[key];
};

class RequestError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'RequestError';
    this.errorCode = code;
    this.stack = new Error().stack;
  }
}

const wxRequestAsync = promisify(wx.request);

const REQUEST_SUCCESS_CODE = 200;

export const request = async (url, options = {}) => {
  try {
    // 初始化请求头
    const defaultHeaders = initRequestHeaders();
    options.headers = { ...defaultHeaders, ...options.headers };

    // 处理 URL
    url = isAbsolutePath(url) ? url : buildFullUrl(url);

    // 发起请求
    const response = await wxRequestAsync({
      url,
      method: 'POST',
      header: options.headers,
      data: options.body,
      dataType: 'json',
      enableHttp2: true,
      enableQuic: true,
    });

    // 处理请求结果
    if (response.statusCode === REQUEST_SUCCESS_CODE) {
      return response.data;
    } else {
      console.error(
        `[http request] business error statusCode: ${response.statusCode}`
      );
      throw new RequestError('business error', response.statusCode);
    }
  } catch (error) {
    // 处理异常
    console.error(`[http request] service error ${error.message}`);
    throw new Error(`service error ${error.message}`);
  }
};

export const get = (url, queryParams = {}) => {
  queryParams._ = +Date.now();
  const options = {
    method: 'GET',
    body: queryParams,
  };
  return request(url, options);
};

export const post = (url, postData = {}) => {
  const options = {
    method: 'POST',
    body: postData,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  return request(url, options);
};
