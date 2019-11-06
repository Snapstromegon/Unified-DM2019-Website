const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const EVENT_SHORT = {
  Einzelkür: 'EK',
  Paarkür: 'PK',
  Kleingruppe: 'KG',
  Großgruppe: 'GG'
};

const CATEGORY_SHORT = {
  'M Expert': 'M E',
  'M Junior Expert': 'M JE',
  'W Expert': 'W E',
  'W Junior Expert': 'W JE'
};
(async () => {
  const res = await loadScheduleFromNowOn(300);
  renderUpcoming(res.slice(res.length > 0 ? (res[0].started ? 1 : 0) : []));
  if(res[0].started){
    renderCurrent(res[0]);
  }
  renderCurrent(res.slice(-10)[0]);
})();
async function loadScheduleFromNowOn(count=16, withoutPast=true) {
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

function renderCurrent(item){
  const event = document.querySelector('#currentAct_Event');
  const category = document.querySelector('#currentAct_Category');
  const name = document.querySelector('#currentAct_Name');
  const starters = document.querySelector('#currentAct_Starters');

  if(item.data && item.data.start){
    event.innerHTML = item.data.event;
    category.innerHTML = item.data.category;
    name.innerHTML = item.data.start.actName;
    starters.innerHTML = item.data.start.Registrants.map(r => `<li>#${r.iufId} ${r.User.name}</li>`).join('\n');
  } else {
    event.innerHTML = '';
    category.innerHTML = '';
    name.innerHTML = item.name;
    starters.innerHTML = '';
  }
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
