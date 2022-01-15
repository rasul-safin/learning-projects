// Создание массива из Dom-элементов клеток
function getTilesDOM() {
  return Array.from(document.querySelectorAll('td'));
}

// Выбор всех Dom-элементов
const DOM = {
  tiles: getTilesDOM(),

  alert: document.querySelector('.container__alert'),
  boardSizeInput: document.querySelector('#board-size-input'),
  columns: document.querySelectorAll('.column'),
  toWinInput: document.querySelector('#to-win-input'),
  submitBtn: document.querySelector('#submit-button'),
  board: document.querySelector('tbody'),

  continueBtn: document.querySelector('#continue-btn'),
  drawBtn: document.querySelector('#draw-btn'),
  resetBtn: document.querySelector('#reset-btn'),

  player: {
    x: {
      score: document.querySelector('#player-x-score'),
    },
    o: {
      score: document.querySelector('#player-o-score'),
    },
  },
};

let state = {
  currentPlayer: 'x',
  winner: false,
  player: {
    x: [],
    o: [],
  },
  point: {
    x: 0,
    o: 0,
  },
  boardSize: 5,
  toWin: 5,
};

function reverseCoordinate(token) {
  if (token === 'x') {
    return 'y';
  } else {
    return 'x';
  }
}

function tileEmpty(tile) {
  if (tile.textContent !== 'x' && tile.textContent !== 'o') {
    return true;
  } else {
    return false;
  }
}

function tileNotEmptyWarning() {
  DOM.alert.innerText = 'Эта клетка недоступна';
}

function clearWarning() {
  DOM.alert.innerText = '';
}

function switchPlayer(prevPlayer) {
  state.currentPlayer = prevPlayer === 'x' ? 'o' : 'x';
}

// Перенос HTML ID на объект JS для получения позиции клетки
function tileJSPosition(tile) {
  const splitTile = tile.split(' ');
  return {
    x: parseInt(
      splitTile[0].split('').slice(1, splitTile[0].split('').length).join('')
    ),
    y: parseInt(
      splitTile[1].split('').slice(1, splitTile[1].split('').length).join('')
    ),
  };
}

function addPointsToToken(tileObj) {
  winThroughXorY(tileObj, 'x');
  winThroughXorY(tileObj, 'y');
  winThroughDiagonalTopLeft(tileObj);
  winThroughDiagonalTopRight(tileObj);
}

function mutatePoints(aTile, tileObj, position) {
  aTile.point[position] += tileObj.point[position];
  tileObj.point[position] = aTile.point[position];
}

// Возможности победы по осям и по диагоналям
function winThroughXorY(tileObj, coordinate) {
  state.player[state.currentPlayer].forEach(aTile => {
    if (
      aTile.position[reverseCoordinate(coordinate)] ===
        tileObj.position[reverseCoordinate(coordinate)] &&
      (aTile.position[coordinate] === tileObj.position[coordinate] + 1 ||
        aTile.position[coordinate] === tileObj.position[coordinate] - 1)
    ) {
      mutatePoints(aTile, tileObj, coordinate);
      if (checkWinner(tileObj.point[coordinate])) declareWinner();
    }
  });
}

function winThroughDiagonalTopLeft(tileObj) {
  state.player[state.currentPlayer].forEach(aTile => {
    if (
      // Прямое направление
      (tileObj.position['x'] === aTile.position['x'] + 1 &&
        tileObj.position['y'] === aTile.position['y'] + 1) ||
      // Обратное направление
      (tileObj.position['x'] === aTile.position['x'] - 1 &&
        tileObj.position['y'] === aTile.position['y'] - 1)
    ) {
      mutatePoints(aTile, tileObj, 'topLeft');
      if (checkWinner(tileObj.point['topLeft'])) declareWinner();
    }
  });
}

function winThroughDiagonalTopRight(tileObj) {
  state.player[state.currentPlayer].forEach(aTile => {
    if (
      // Прямое направление
      (tileObj.position['x'] === aTile.position['x'] + 1 &&
        tileObj.position['y'] === aTile.position['y'] - 1) ||
      // Обратное направление
      (tileObj.position['x'] === aTile.position['x'] - 1 &&
        tileObj.position['y'] === aTile.position['y'] + 1)
    ) {
      mutatePoints(aTile, tileObj, 'topRight');
      if (checkWinner(tileObj.point['topRight'])) declareWinner();
    }
  });
}

function checkWinner(point) {
  if (point >= state.toWin) {
    return true;
  }
  return false;
}

function checkDraw() {
  if (state.player.x.length + state.player.o.length === DOM.tiles.length) {
    return true;
  } else {
    return false;
  }
}

function declareDraw() {
  // Отображение на пользовательском интерфейсе
  DOM.alert.innerHTML = `<p>Это ничья</p>`;

  gameContinueReset();
}

function gamePlayOff() {
  DOM.tiles.forEach(tile => {
    tile.removeEventListener('click', insertToken);
  });
}

function declareWinner() {
  // Отображение на пользовательском интерфейсе
  DOM.alert.innerHTML = `<p>Игрок ${state.currentPlayer.toUpperCase()} победил</p>`;

  // Добавление очков в базу данных пользователя
  state.point[state.currentPlayer] += 1;

  // Смена статуса победителя
  state.winner = true;

  // Добавление очков в пользовательский интерфейс
  DOM.player[state.currentPlayer].score.innerText =
    state.point[state.currentPlayer];

  gameContinueReset();
}

function gameContinueReset() {
  // Сброс игры
  DOM.continueBtn.disabled = false;

  // Выключить игру
  gamePlayOff();

  // Продолжение
  DOM.continueBtn.addEventListener('click', e => {
    e.preventDefault();
    reset();
  });
}

function gameResetAll() {
  gamePlayOff();

  // Очистка базы данных
  state.point.x = 0;
  state.point.o = 0;

  // Очистка пользовательского интерфейса
  DOM.player.x.score.innerText = state.point.x;
  DOM.player.o.score.innerText = state.point.o;

  reset();
}

function reset() {
  // Сброс победителя
  state.winner = false;

  // Очистка пользовательского интерфейса
  DOM.alert.innerHTML = '&#8291';
  DOM.tiles.forEach(tile => {
    tile.innerHTML = '&#8291';
  });

  // Обнуление базы данных
  state.player.x = [];
  state.player.o = [];

  // Перезапуск игры
  main();
}

function addTokenToState(tileObj) {
  state.player[state.currentPlayer].push({
    position: tileObj,
    point: {
      // Ось X и Y
      x: 1,
      y: 1,

      // Диаогнали
      topLeft: 1,
      topRight: 1,
    },
  });
}

function insertToken(event) {
  clearWarning();
  const tile = event.target;

  if (tileEmpty(tile)) {
    tile.textContent = state.currentPlayer;

    const tileObj = tileJSPosition(tile.id);

    addTokenToState(tileObj);

    addPointsToToken(
      state.player[state.currentPlayer][
        state.player[state.currentPlayer].length - 1
      ]
    );

    if (checkDraw() & !state.winner) declareDraw();

    switchPlayer(state.currentPlayer);
  } else {
    tileNotEmptyWarning();
  }
}

function setting() {
  gamePlayOff();
  DOM.continueBtn.style.opacity = 1;
  DOM.drawBtn.style.opacity = 1;
  DOM.resetBtn.style.opacity = 1;
  DOM.columns.forEach(c => (c.style.opacity = 1));

  const boardSizeNum = parseInt(DOM.boardSizeInput.value);
  if (!isNaN(boardSizeNum) && DOM.boardSizeInput.value.trim() != '') {
    state.boardSize = boardSizeNum;
    DOM.board.innerHTML = '&#8291';

    for (let i = 0; i < boardSizeNum; i++) {
      const boardRow = document.createElement('tr');
      boardRow.classList = 'x' + (i + 1);
      for (let i1 = 0; i1 < boardSizeNum; i1++) {
        const boardCell = document.createElement('td');
        boardCell.id = boardRow.classList + ' ' + 'y' + (i1 + 1);
        boardCell.innerHTML = '&#8291';
        boardRow.insertAdjacentElement('beforeend', boardCell);
      }
      DOM.board.insertAdjacentElement('beforeend', boardRow);
    }
  }

  DOM.tiles = getTilesDOM();

  const toWinNum = parseInt(DOM.toWinInput.value);
  if (!isNaN(toWinNum) && DOM.toWinInput.value.trim() != '') {
    state.toWin = toWinNum;
  }

  main();
}

function main() {
  DOM.tiles.forEach(tile => {
    tile.addEventListener('click', insertToken);
  });

  DOM.continueBtn.disabled = true;
}

main();

// Обработчики событий
DOM.drawBtn.addEventListener('click', e => {
  e.preventDefault();
  gamePlayOff();
  reset();
});

DOM.submitBtn.addEventListener('click', e => {
  e.preventDefault();
  setting();
});

DOM.resetBtn.addEventListener('click', e => {
  e.preventDefault();
  gameResetAll();
});
