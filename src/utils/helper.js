module.exports.removeDuplicates = (duplicate) => {
  const flag = {};
  const unique = [];
  duplicate.forEach((elem) => {
    if (!flag[elem.id]) {
      flag[elem.id] = true;
      unique.push(elem);
    }
  });
  return unique;
};
