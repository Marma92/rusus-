const socket = io();
const players = new Map();

const nameForm = document.getElementById('nameForm');
const playerNameInput = document.getElementById('playerName');
const gameControls = document.getElementById('gameControls');
const newGameBtn = document.getElementById('newGameBtn');
const gameOverBtn = document.getElementById('gameOverBtn');
const messageContainer = document.getElementById('messageContainer');

nameForm.addEventListener('submit', event => {
  event.preventDefault();
  const playerName = playerNameInput.value.trim();
  if (playerName) {
    socket.emit('joinGame', playerName);
    nameForm.style.display = 'none';
    gameControls.style.display = 'block';
  }
});

socket.on('newPlayer', (playerName, playersCount, readyPlayersCount) => {
  displayGameState(playerName, 'connected', playersCount, readyPlayersCount);
});

socket.on('playerReady', (playerName, playersCount, readyPlayersCount) => {
  displayGameState(
    playerName,
    'pressed ready',
    playersCount,
    readyPlayersCount
  );
});

socket.on('gameOn', () => {
  displayMessage("Game's ON !");
  newGameBtn.style.display = 'none';
  gameOverBtn.style.display = 'block';
});

socket.on('werewolfAlert', message => {
  console.log(message);
  displayMessage(message, 'red');
});

newGameBtn.addEventListener('click', () => {
  socket.emit('newGame');
});

gameOverBtn.addEventListener('click', () => {
  socket.emit('gameOver');
});

socket.on('playerGone', (playerName, playersCount, readyPlayersCount) => {
  displayGameState(playerName, 'disconnected', playersCount, readyPlayersCount);
});

socket.on('playerGameOver', (playerName, playersCount, playersReady) => {
  displayMessage(
    `${playerName} clicked Game Over, players ready: ${playersReady}/${playersCount}`
  );
});

socket.on('allPlayersGameOver', werewolf => {
  displayMessage(`Well played ! ${werewolf.name} was the impostor`);
  newGameBtn.style.display = 'block';
  gameOverBtn.style.display = 'none';
});

// Function to display messages in the message container
function displayMessage(message, color) {
  const messageDiv = document.createElement('div');
  const messageElement = document.createElement('p');
  const messageData = document.createElement('p');

  if (color) {
    messageElement.setAttribute('style', 'color:red; font-size:2em;');
  }
  messageData.classList.add('messageData');
  messageElement.textContent = message;
  messageData.textContent = getDateTime();

  messageDiv.classList.add('messageDiv');
  messageDiv.appendChild(messageElement);
  messageDiv.appendChild(messageData);
  messageContainer.appendChild(messageDiv);
}

function displayGameState(
  playerName,
  playerAction,
  playersCount,
  readyPlayersCount
) {
  displayMessage(
    `${playerName} has ${playerAction}. Players: ${playersCount} Ready: ${readyPlayersCount}`
  );
}

const getDateTime = () => {
  let date = new Date();
  // Get day, month, and year from the Date object
  let day = date.getDate();
  let month = date.getMonth() + 1; // Months are zero-based, so add 1
  let year = date.getFullYear();

  // Get hours, minutes, and seconds from the Date object
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  // Pad single-digit day, month, hours, minutes, and seconds with leading zero
  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  // Format the date and time as DD/MM/YYYY HH:MM:SS
  var formattedDateTime =
    day +
    '/' +
    month +
    '/' +
    year +
    ' ' +
    hours +
    ':' +
    minutes +
    ':' +
    seconds;

  return formattedDateTime;
};
