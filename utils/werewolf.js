export const pickWW = players => {
  const playersArray = Array.from(players.keys());
  console.log(playersArray);
  const wwIndex = getRandomInt(playersArray.length);
  return playersArray[wwIndex];
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
