const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const EVENT_SHORT = {
  Einzelkür: 'EK',
  Paarkür: 'PK',
  Kleingruppe: 'KG',
  Großgruppe: 'GG'
};

const CATEGORY_SHORT = {
  Expert: 'E',
  'Junior Expert': 'JE'
};
(async () => {
  const res = await loadScheduleFromNowOn();
  renderUpcoming(res.slice(res.length > 0 ? (res[0].started ? 1 : 0) : []));
  console.log(res);
})();
async function loadScheduleFromNowOn() {
  const resp = await fetch(
    'https://startlists.freestyledm2019.de/timeplan/json?limit=16&withoutPast=true',
    { mode: 'cors', cache: 'no-cache' }
  );
  return (await resp.json()).map(item => {
    item.expectedStartTime = new Date(item.expectedStartTime);
    item.wantedStartTime = new Date(item.wantedStartTime);
    item.started = item.started ? new Date(item.started) : item.started;
    return item;
  });
}
function renderUpcoming(schedule) {
  const wrapper = document.querySelector('#upcomingStarters');
  wrapper.innerHTML = '';
  for (const item of schedule) {
    wrapper.innerHTML += renderItem(item);
  }
}

function renderItem(item) {
  if (!item.data) {
    return renderBreak(item);
  } else if (!item.data.start) {
    return renderWarmup(item);
  } else if (item.data.start.Registrants.length > 2) {
    return renderGroup(item);
  } else {
    return renderDefault(item);
  }
}

function renderBreak(item) {
  return `<div class="scheduleItem break">
  <div class="date">${DAYS[item.expectedStartTime.getDay()]}.${fill0(
    item.expectedStartTime.getHours()
  )}:${fill0(item.expectedStartTime.getMinutes())}</div> 
  <div class="name">${item.name}</div>
  </div>`;
}

function renderWarmup(item) {
  return `
  <div class="scheduleItem break">
    <div class="date">${DAYS[item.expectedStartTime.getDay()]}.${fill0(
    item.expectedStartTime.getHours()
  )}:${fill0(item.expectedStartTime.getMinutes())}</div> 
    <div class="name">${item.name}</div>
  </div>
`;
}

function renderGroup(item) {
  return `
  <div class="scheduleItem">
    <div class="date">${DAYS[item.expectedStartTime.getDay()]}.${fill0(
    item.expectedStartTime.getHours()
  )}:${fill0(item.expectedStartTime.getMinutes())}</div> 
  <div class="event">${EVENT_SHORT[item.data.event]} ${CATEGORY_SHORT[
    item.data.category
  ] || item.data.category}</div>
    <div class="name">${item.name}</div>
    <div class="actors">${item.data.start.Registrants.length} Fahrer</div>
  </div>
`;
}

function renderDefault(item) {
  return `
  <div class="scheduleItem">
    <div class="date">${DAYS[item.expectedStartTime.getDay()]}.${fill0(
    item.expectedStartTime.getHours()
  )}:${fill0(item.expectedStartTime.getMinutes())}</div> 
  <div class="event">${EVENT_SHORT[item.data.event]} ${CATEGORY_SHORT[
    item.data.category
  ] || item.data.category}</div>
    <div class="name">${item.name}</div>
    <div class="actors"><ul>${item.data.start.Registrants.map(
      r => `<li>#${r.iufId} ${r.User.name}</li>`
    ).join('\n')}</ul></div>
  </div>
`;
}

function fill0(num) {
  return num < 10 ? `0${num}` : num;
}
