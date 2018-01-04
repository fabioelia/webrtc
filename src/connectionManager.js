import CONSTANTS from './constants';
const swarm = require('webrtc-swarm');
const signalhub = require('signalhub');
const _ = require('lodash');

const { COMMAND_TYPES, CHANNEL_LIST: { METRICS_CHANNEL, STREAMING_CHANNEL } } = CONSTANTS;
const loggerUtil = (context) => {
  return (msg) => console.log(`${context}: `, msg);
};
const logger = loggerUtil('ConnectionManager');

// There are some commands we may want to force on peers once they connect.
// For example, notifying them who the teacher is. Forced commands will auto send to the new peers upon connection
const FORCE_COMMANDS = [];

export class ConnectionManager {
  /**
   * @param {String} channel - channel to connect to on streaming URL
   * @param {Object} options - options for webrtc-swarm
   */
  constructor(channel = METRICS_CHANNEL, options = { videoElement: null, stream: null }) {
    this.channel = channel;
    this.options = options;
    // Dom node reference where teacher's video stream can be played
    this.videoElement = options.videoElement;
    // Utilities or Callbacks that have been registered to be notified on every recieved command
    this.listeners = [];
    this.connect();
    this.listen();

    _.bindAll(this, 'receive', 'disconnect', 'disconnectCallback');
    logger(`I've been created as ${this.peerId}`);
  }

  /**
   * @return {String} - the current peer's id
   */
  get peerId() {
    return this.sw.me;
  }

  /**
   * @return {Array<SimplePeer>} - Peers we are connected to
   */
  get peers() {
    return this.sw.peers;
  }

  /**
   * @return {String} - Peer id corresponding to the teacher
   */
  get teacher() {
    return this._teacher;
  }

  set teacher(value) {
    this._teacher = value;
  }

  /**
   * DOM node for streaming container
   * @return {null|element}
   */
  get videoElement() {
    return this._video;
  }

  set videoElement(element = null) {
    this._video = element;
  }

  /**
   * Establish a connection to the signal server, and itialize our swarm
   */
  connect() {
    this.hub = signalhub(this.channel, [ CONSTANTS.SIGNAL_SERVER ]);
    this.sw = swarm(this.hub, this.options);
  }

  /**
   * Disconnect from our hub and close our swarm
   */
  disconnect(callback = _.noop) {
    this.hub.close(() => {
      this.sw.close();
      callback();
    });
  }

  /**
   * Called when the swarm is closed.
   */
  disconnectCallback() {
    this._disconnectCallback && this._disconnectCallback();
  }

  /**
   * send - send commands to connected peers or targeted peer
   * @param {String|Object} message - string or properties required for the type of command
   * @param {String} type - Type of command that should be sent
   * @param {?String|null} target - Peer Id that we want to run this command against. Defaults to everyone
   * @param {?Boolean} force - Should this command be run on future peer connections
   */
  send({ message, type, target = null, force = false }) {
    const command = { target, type, message };
    logger(`Sending command`, command);
    // Let listener's know of the new message
    _.each(this.peers, peer => peer.send(JSON.stringify(command)));

    if (force) {
      FORCE_COMMANDS.push({ message, type, target });
    }
  }

  receive({ type, message, target }) {
    if (type === COMMAND_TYPES.SET_TEACHER) {
      this.teacher = message;
    } else if (type === COMMAND_TYPES.DISCONNECT) {
      this.sw.close();
    }

    _.each(this.listeners, (listener) => listener.receive({ peerId: this.peerId, type, message, target }));

    if (_.isNull(target) || target === this.sw.me) {
      logger('Recieved command', type, message, target);
      // switch(type) {
      //   case 'startStream':
      //   case 'endStream':
      //   case 'stats':
      //     message = {
      //       score: 4,
      //       time: 2,
      //     };
      // }
    }
  }

  listen() {
    this.sw.on('disconnect', (peer) => logger('DISCONNECT'));
    this.sw.on('peer', (peer, id) => {
      peer.alias = id;
      logger(`connected to a new peer: ${id} (total ${_.size(this.peers)})`);

      peer.on('data', (data) => this.receive(JSON.parse(data)));

      // Listen for streams, streams will be played back through a video element
      if (this.videoElement) {
        peer.on('stream', (stream) => {
          this.videoElement.src = window.URL.createObjectURL(stream)
          this.videoElement.play();
        });
      }

      // Log any additional signals / errors
      peer.on('error', (data) => logger('ERROR'));
      peer.on('signal', (data) => logger('SIGNAL'));

      _.each(FORCE_COMMANDS, command => this.send(command));
      this.receive({ message: this.peers, type: COMMAND_TYPES.NEW_CONNECTION });
    });

    this.sw.on('close', this.disconnectCallback);
  }

  register(callback) {
    this.listeners.push(callback);
  }
}
