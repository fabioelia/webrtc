import CONSTANTS from '../constants';
import { ConnectionManager } from '../connectionManager';
import { communicationChannel } from '../channels';

const { COMMAND_TYPES, CHANNEL_LIST: { STREAMING_CHANNEL } } = CONSTANTS;

class MessageUtil {
  constructor() {}

  /**
   * receive - we register the metricUtil to the connection manager to receive callbacks here when messages are received
   * @param {String} peerId - Your id
   * @param {String} type - Type of command
   * @param {String|Object} message - Meta data that was recieved for the command
   * @param {String|null} target - The target peer that this command was destined for
   */
  receive({ peerId, type, message, target }) {
    switch(type) {
      case COMMAND_TYPES.MESSAGE:
        if (peerId === target || !target) {
          document.getElementById('received-messages').innerHTML = JSON.stringify(message);
        }
      break;
    }
  }
}

export const messageUtil = new MessageUtil();
communicationChannel.register(messageUtil);
