

function updateTime() {
  let now = new Date();
  let startVacation = new Date(2019, 9, 21, 3, 5);
  let finishVacation = new Date(2019, 9, 31, 2, 25);
  let progress = (now - startVacation) / (finishVacation - startVacation) * 100;
  let progressFloor =  Math.floor(progress * 100) / 100;
  
  renderProgress(progressFloor);
}

function renderProgress(value) {
  let queryLine = document.querySelector('.progress-line');
  queryLine.innerHTML = value;
  queryLine.style.width = `${value}%`;
}

function init() {
  setInterval(updateTime, 200);
}

init();
