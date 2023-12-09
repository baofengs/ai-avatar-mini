const getList = (num) => {
  const ans = [];
  for (let i = 0; i < num; i++) {
    ans.push({
      id: i,
    });
  }
  return ans;
};

Page({
  data: {
    list: getList(40),
  },
});
