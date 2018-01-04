import CONSTANTS from '../constants';
import { ConnectionManager } from '../connectionManager';
import { communicationChannel } from '../channels';

const { COMMAND_TYPES, CHANNEL_LIST: { STREAMING_CHANNEL } } = CONSTANTS;

let streamingChannel;
let streamingInstance = 0;

class StreamingUtil {
  constructor() {
    _.bindAll(this, 'start', 'startStream');
  }

  stop(callback = _.noop) {
    streamingChannel.disconnect(callback);
    streamingChannel = null;
  }

  start(target) {
    streamingInstance ++;
    if (streamingChannel) {
      this.stop(() => this.startStream(target));
    } else {
      this.startStream(target);
    }
  }

  startStream(target) {
    const videoElement = document.querySelector('video');
    videoElement.pause();

    StreamingUtil.connect(streamingInstance, {
      initiator: false,
      videoElement,
    });

    communicationChannel.send({
      type: COMMAND_TYPES.STREAM_START,
      target,
      message: streamingInstance,
    });
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
      case COMMAND_TYPES.STREAM_START:
        if (peerId === target) {
          StreamingUtil.connect(message, {
            initiator: true,
            stream: document.getElementById("canvas").captureStream(25),
          });
        }
      break;
      case COMMAND_TYPES.STREAM_END:
    }
  }

  static disconnect(options) {
     streamingChannel.sw.close();
  }

  static connect(instance, options) {
     streamingChannel = new ConnectionManager(`${STREAMING_CHANNEL}-${instance}`, options);
  }
}

export const streamingUtil = new StreamingUtil();
communicationChannel.register(streamingUtil);
