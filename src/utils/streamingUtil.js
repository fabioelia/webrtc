import CONSTANTS from '../constants';
import { ConnectionManager } from '../connectionManager';
import { communicationChannel } from '../channels';

const { COMMAND_TYPES, CHANNEL_LIST: { STREAMING_CHANNEL } } = CONSTANTS;

/** streamingChannel - a new connection */
let streamingChannel;
/** streamingInstance - a counter to create new streaming channels each time*/
let streamingInstance = 0;

class StreamingUtil {
  constructor() {
    _.bindAll(this, 'start', 'startStream');
  }

  /**
   * @param {?Function} callback - callback to be triggered after we have disconnected
   */
  stop(callback = _.noop) {
    streamingChannel.disconnect(callback);
    streamingChannel = null;
  }

  /**
   * @param {String} target - the peer id we wish to open a stream connection with
   */
  start(target) {
    streamingInstance ++;
    // If we have a streaming channel open, lets close it and then start a new stream
    if (streamingChannel) {
      this.stop(() => this.startStream(target));
    } else {
      this.startStream(target);
    }
  }

  /**
   * @param {String} target - the peer id we wish to open a stream connection with
   */
  startStream(target) {
    // Stop any current playing streams
    // @TODO correct for react codebase
    const videoElement = document.querySelector('video');
    videoElement.pause();

    StreamingUtil.connect(streamingInstance, {
      initiator: false,
      videoElement,
    });

    // Send a message over our communicationChannel that we want to open a new "streaming" channel with our targeted peer
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

  static disconnect() {
     streamingChannel.sw.close();
  }

  /**
   * @param {String} instance - identifier for the new connection channel
   * @param {Object} options - options for webrtc-swarm
   */
  static connect(instance, options) {
     streamingChannel = new ConnectionManager(`${STREAMING_CHANNEL}-${instance}`, options);
  }
}

export const streamingUtil = new StreamingUtil();
// Listen for any commands coming over the communication channel required to open a new streaming channel
communicationChannel.register(streamingUtil);
