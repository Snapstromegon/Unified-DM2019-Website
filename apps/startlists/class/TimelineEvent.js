module.exports = class TimelineEvent {
  constructor({ start, label, duration, state = 'upcoming' }) {
    this.start = start;
    this.label = label;
    this.duration = duration;
    this.state = state;
  }

  updateTime(expectedStartTime){
    if(expectedStartTime.getTime() > this.start.getTime()){
      this.start = expectedStartTime;
    }
  }
};
