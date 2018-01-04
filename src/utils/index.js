import { messageUtil } from './messageUtil';
import { metricUtil } from './messageUtil';
import { studentUtil } from './studentUtil';
import { streamingUtil } from './streamingUtil';

const url = new URL(location.href);
const paramsUtil = url.searchParams;
const loggerUtil = (context) => {
  return (msg) => console.log(`${context}: ${JSON.parse(msg)}`);
};

export {
  messageUtil,
  metricUtil,
  studentUtil,
  streamingUtil,
  paramsUtil,
  loggerUtil,
};
