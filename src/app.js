const _ = require('lodash');
import CONSTANTS from './constants';
import { ConnectionManager  } from './connectionManager';
import { communicationChannel } from './channels';
import { paramsUtil, messageUtil, metricUtil, studentUtil, streamingUtil } from './utils';

// Check URL for variables
const isTeacher = paramsUtil.get('teacher');
const isStudent = paramsUtil.get('student');

// List of DOM elements to play with
const elements = {
  me: document.getElementById('me'),
  student_list: document.getElementById('studentList'),
  type_list: document.getElementById('typeList'),
  message: document.getElementById('message'),
  canvas: document.getElementById('canvas'),
  video: document.getElementById('video'),
  start_stream_button: document.getElementById('startStream'),
  end_stream_button: document.getElementById('endStream'),
  send_button: document.getElementById('send'),
};

// Setup TYPE dropdown with potential values
_.each(CONSTANTS.COMMAND_TYPES, (value, key) => {
  elements.type_list.options.add(new Option(key, value));
});

// Show the id for this peer
elements.me.innerHTML = communicationChannel.peerId;

// If we are the teacher, we will broadcast a message to all other peers with this info
if (isTeacher) {
  // Notify students of the teacher peer
  communicationChannel.send({
    type: CONSTANTS.COMMAND_TYPES.SET_TEACHER,
    message: communicationChannel.peerId,
    force: true,
  });

  // Teacher won't use the canvas so lets hide it
  elements.canvas.style.display = 'none';
} else {
  // Student won't view any streams so lets hide it
  elements.video.style.display = 'none';
}

// Attache click listener to start a stream, requires a target to be selected
elements.start_stream_button.addEventListener('click', () => {
  streamingUtil.start(elements.student_list.value);
});

// Stop and close any open video streams
elements.end_stream_button.addEventListener('click', () => {
  streamingUtil.stop();
});

// Send a command
elements.send_button.addEventListener('click', () => {
  let message;
  try {
     message = eval(`(${elements.message.value})`);
  } catch(e) {
    message = elements.message.value;
  }
  communicationChannel.send({
    message,
    type: elements.type_list.value,
    target: elements.student_list.value,
  });
});


// Nothing to see here... Particle just loads up a canvas object.
require('./lib/particle.js');
