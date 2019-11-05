module.exports = class TimeScheduleEventItem {
  constructor({ name = 'Unknown', startTime, wantedStartTime,expectedStartTime, duration=0, data } = {}) {
    this.name = name;
    this.wantedStartTime = wantedStartTime;
    this.expectedStartTime = expectedStartTime;
    this.startTime = startTime;
    this.duration = duration;
    this.data = data;
  }
};
