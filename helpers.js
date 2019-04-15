const coordinatesGenerator = arr => arr.reduce((acc1, ele, index1) => {
  let result = ele.reduce((acc2, tally, index2) =>
    [...acc2, [index1, index2, Math.round( tally * 10) / 10]], []);
  return [...acc1, ...result]
}, [])

module.exports = coordinatesGenerator;
