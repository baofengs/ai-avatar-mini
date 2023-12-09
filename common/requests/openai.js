import { openaiConfig } from '../config';

const REQUEST_TIMEOUT_MS = 60 * 1000;

const defaultOptions = {
  shouldStream: true,
  question: '',
  prompt: '',
  onFinish: (message) => {},
  onUpdate: (message) => {},
};

export async function openai(options) {
  const { shouldStream, question, prompt, onFinish, onUpdate } = Object.assign(
    defaultOptions,
    options
  );
  const { url } = openaiConfig;
  let responseText = '';
  let finished = false;

  if (shouldStream) {
    const requestTask = wx.request({
      url,
      method: 'POST',
      data: {
        question: prompt + question,
      },
      enableChunked: true,
      success() {
        console.log('[openai] responseText: ', responseText);
        onFinish();
      },
    });

    function finish() {
      if (!finished) {
        onUpdate(responseText);
        onFinish();
        finished = true;
      }
    }

    const requestTimeoutId = setTimeout(() => {
      requestTask.abort();
      finish();
    }, REQUEST_TIMEOUT_MS);
    requestTask.onHeadersReceived((headerResponse) => {
      clearTimeout(requestTimeoutId);
      const { statusCode } = headerResponse;
      if (!headerResponse || statusCode !== 200) {
        requestTask.abort();
        finish();
      }
    });
    requestTask.onChunkReceived((res) => {
      let decoder = new TextDecoder('utf-8');
      try {
        const decodedData = decoder.decode(res.data);
        const sanitizedData = decodedData.replace(/\n\n|\[DONE\]/g, '');
        const dataArray = sanitizedData.split('data: ').filter((item) => item);

        dataArray.forEach((item) => {
          try {
            const message = JSON.parse(item);
            try {
              const extracted = extractMessage(message);
              if (extracted) {
                responseText += extracted;
                onUpdate(responseText);
              }
            } catch (extractError) {
              console.error('[openai] Error extracting message:', extractError);
            }
          } catch (parseError) {
            console.error('[openai] Error parsing JSON:', parseError);
          }
        });
      } catch (decodeError) {
        console.error('[openai] Error decoding data:', decodeError);
      }
    });
  } else {
    const res = await wx.request({
      url,
      method: 'POST',
      data: {
        question: prompt + question,
      },
      contentType: 'json',
      dataType: 'text',
      responseType: 'text',
    });
    responseText = format(res);
    onUpdate(responseText);
    onFinish();
  }
}

function format(response) {
  let text = '';

  if (!response || !response.data) {
    console.error('Invalid response or response.data is not available');
    return text;
  }

  try {
    const replaced = response.data
      .replace(/\[DONE\]/g, '')
      .replace(/\n\n/g, '')
      .replace(/\\/g, '')
      .split(/data: /);

    replaced
      .filter((item) => item)
      .map((item) => {
        try {
          return JSON.parse(item);
        } catch (parseError) {
          console.error('[format] Error parsing item to JSON:', parseError);
          return null; // Return null or some default object if parsing fails
        }
      })
      .filter((item) => item !== null) // Filter out null items that failed to parse
      .forEach((item) => {
        try {
          text += extractMessage(item);
        } catch (extractError) {
          console.error(
            '[format] Error extracting message from item:',
            extractError
          );
          // Handle the error or ignore the item
        }
      });
    console.log('text: ', text);
  } catch (error) {
    console.error(
      '[format] An unexpected error occurred during formatting:',
      error
    );
  }

  return text;
}

function extractMessage(res) {
  return res.choices?.at(0)?.delta?.content ?? '';
}
