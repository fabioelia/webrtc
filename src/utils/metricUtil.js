import { communicationChannel } from '../connectionManager';

class Metric {
  constructor(score, time) {

  }
}

class MetricUtil {
  constructor() {
  }

  addStudent() {}

  storeMetric(data, studentId) {}

  /**
   * receive - we register the metricUtil to the connection manager to receive callbacks here when messages are received
   * @param {String} peerId - Your id
   * @param {String} type - Type of command
   * @param {String|Object} message - Meta data that was recieved for the command
   * @param {String|null} target - The target peer that this command was destined for
   */
  receive({ peerId, type, message, target }) {
  }
}

const metricUtil = new MetricUtil();
communicationChannel.register(metricUtil);

export metricUtil;
