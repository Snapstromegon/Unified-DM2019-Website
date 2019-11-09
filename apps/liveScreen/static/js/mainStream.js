window.setInterval(update, 5000);
update();

let currentStartId = undefined;

async function update() {
  const res = await loadScheduleFromNowOn(300);
  if (res[0].started) {
    renderCurrent(res[0]);
  }
}

async function loadScheduleFromNowOn(count = 16, withoutPast = true) {
  const resp = await fetch(
    `https://startlists.freestyledm2019.de/timeplan/json?limit=${count}&withoutPast=${withoutPast}`,
    { mode: 'cors', cache: 'no-cache' }
  );
  return (await resp.json()).map(item => {
    item.expectedStartTime = new Date(item.expectedStartTime);
    item.wantedStartTime = new Date(item.wantedStartTime);
    item.started = item.started ? new Date(item.started) : item.started;
    return item;
  });
}

async function renderCurrent(item) {
  if (item.data && item.data.start) {
    if (item.data.start.id == currentStartId) {
      console.log('skipped unchanged');
      return;
    }
    await setMainState(false);
    currentStartId = item.data.start.id;
    const main = document.querySelector('main');
    const actname = main.querySelector('#actname');
    const category = main.querySelector('#category');
    const actors = main.querySelector('#actors');

    category.innerHTML = `${item.data.event} ${item.data.category}`;
    actname.innerHTML = item.data.start.actName;
    if (item.data.start.Registrants.length <= 2) {
      actors.innerHTML = item.data.start.Registrants.map(r => r.User.name).join(
        ' und '
      );
    }
    await setMainState(true);
  } else {
    await setMainState(false);
  }
}

function setMainState(state) {
  return new Promise((res, rej) => {
    const main = document.querySelector('main');
    if (main.classList.contains('active') == state) {
      res();
    } else {
      main.addEventListener('transitionend', _ => setTimeout(res, 100), {
        passive: true,
        once: true
      });
      if (state) {
        main.classList.add('active');
      } else {
        main.classList.remove('active');
      }
    }
  });
}
