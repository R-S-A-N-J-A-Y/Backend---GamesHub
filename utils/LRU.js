const updateLRUList = (list, gameId, maxSize = 5) => {
  const itemStr = gameId.toString();
  const updatedList = list
    .map((i) => i.toString())
    .filter((i) => i !== itemStr);

  updatedList.unshift(gameId);

  return updatedList.slice(0, maxSize);
};

module.exports = { updateLRUList };
