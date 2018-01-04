import CONSTANTS from '../constants';
import { ConnectionManager } from '../connectionManager';
import { communicationChannel } from '../channels';

class StudentUtil {
  constructor() {
    this.students = {};
  }

  /**
   * receive - we register the metricUtil to the connection manager to receive callbacks here when messages are received
   * @param {String} peerId - Your id
   * @param {String} type - Type of command
   * @param {String|Object} message - Meta data that was recieved for the command
   * @param {String|null} target - The target peer that this command was destined for
   */
  receive({ peerId, type, message, target }) {
    switch(type) {
      case CONSTANTS.COMMAND_TYPES.NEW_CONNECTION:
        const students = message;
        const dropdown = document.getElementById('studentList');
        dropdown.innerHTML = '<option selected></option>';
        _.each(students, ({ alias }) => {
          dropdown.options.add( new Option(alias, alias));
          this.students[alias] = { alias };
        });

        document.getElementById('connections').innerHTML = _.size(students);
      break;
    }
  }
}

export const studentUtil = new StudentUtil();
communicationChannel.register(studentUtil);
