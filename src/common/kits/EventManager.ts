// Event 管理器
class EventManager {
  static instance: null | EventManager = null;
  private eventList: { [key: string]: Function[] } = {};

  static getInstance() {
    if (!this.instance) {
      this.instance = new EventManager();
    }
    return this.instance;
  }

  emit(event: string, data: any) {
    const eventList = this.eventList[event] || [];
    eventList.forEach((fn) => {
      fn(data);
    });
  }

  on(event: string, fn: Function) {
    const eventList = this.eventList[event] || [];
    eventList.push(fn);
    this.eventList[event] = eventList;
  }

  off(event: string, fn: Function) {
    const eventList = this.eventList[event] || [];
    eventList.splice(eventList.indexOf(fn), 1);
    this.eventList[event] = eventList;
  }

  once(event: string, fn: Function) {
    const eventList = this.eventList[event] || [];
    eventList.push(fn);
    this.eventList[event] = eventList;
    return () => {
      this.off(event, fn);
    };
  }

  clear(event: string) {
    this.eventList[event] = [];
  }

  clearAll() {
    this.eventList = {};
  }
}

export default EventManager.getInstance();
