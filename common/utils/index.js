export function promisify(api) {
  return (options, ...args) => {
    return new Promise((resolve, reject) => {
      api(
        Object.assign({}, options, { success: resolve, fail: reject }),
        ...args
      );
    });
  };
}
