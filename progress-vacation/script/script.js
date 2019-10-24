function updateTime() {
  let now = new Date();
  let startVacation = new Date(2019, 9, 21, 3, 5);
  let finishVacation = new Date(2019, 9, 31, 2, 25);
  let progress = (now - startVacation) / (finishVacation - startVacation) * 100;
  let progressFloor =  Math.floor(progress * 100) / 100;
  
  renderProgress(progressFloor);
  renderTime(now, finishVacation);
}

function renderProgress(value) {
  let queryLine = document.querySelector('.progress-line');
  queryLine.innerHTML = value;
  queryLine.style.width = `${value}%`;
}

function renderTime(now, finish) {
  let queryDays = document.querySelector('.statistic__days');
  let queryHours = document.querySelector('.statistic__hours');
  let queryMinutes = document.querySelector('.statistic__minutes');
  let querySeconds = document.querySelector('.statistic__seconds');
  
  queryDays.innerHTML = countsTime(now, finish, 'days');
  queryHours.innerHTML = countsTime(now, finish, 'hours');
  queryMinutes.innerHTML = countsTime(now, finish, 'minutes');
  querySeconds.innerHTML = countsTime(now, finish, 'seconds');
}

function countsTime(now, finish, type) {
    switch (type) {
      case 'days':
        return Math.floor((finish - now) / (1000 * 60 * 60 * 24));
      case 'hours':
        return Math.floor((finish - now) / (1000 * 60 * 60)) % 24;
      case 'minutes':
        return Math.floor((finish - now) / (1000 * 60)) % 60;
      case 'seconds':
        return Math.floor((finish - now) / (1000)) % 60;
    }
}

function init() {
  setInterval(updateTime, 1000);
}

init();
