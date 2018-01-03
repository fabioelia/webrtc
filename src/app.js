const swarm = require('webrtc-swarm');
const signalhub = require('signalhub');
const _ = require('lodash');

const options = {};
const canvas = document.getElementById("canvas");
const video = document.querySelector('video');

const url = new URL(location.href);
const params = url.searchParams;
const isTeacher = params.get('teacher');

if (isTeacher) {
  const canvas = document.getElementById("canvas");
  options.initiator = true;
  options.stream = canvas.captureStream(25);
}

const hub = signalhub('teacher-example-1', ['https://signalhub-jccqtwhdwc.now.sh'])
const sw = swarm(hub, options);

sw.on('peer', function (peer, id) {
  console.log(`connected to a new peer: ${id} (total ${sw.peers.length})`);
  peerSetup(peer);
})

sw.on('disconnect', function (peer, id) {
  console.log(`disconnected from a peer: ${id} (total ${sw.peers.length})`);
})

const message = (value, type = 'message') => {
  const m = JSON.stringify({
    type,
    value
  });
  _.each(sw.peers, function(peer) {
    peer.send(m);
  });
}

const log = (msg) => {
  console.log(`MSG: ${msg}`);
}

const peerSetup = (peer) => {
  // Listen for data, data will be used to send JSON messages back and forth
  peer.on('data', function (data) {
    const { value, type } = JSON.parse(data);
    console.log(`message from peer (${peer}): ${value} of type ${type}`);
  });

  // Listen for streams, streams will be played back through a video element
  peer.on('stream', function (stream) {
    video.src = window.URL.createObjectURL(stream)
    video.play();
  })

  // Log any additional signals / errors
  peer.on('error', log);
  peer.on('signal', log);
}

window.message = message;
window.sw = sw;



// A more complicated canvas to test with.
require('./particle.js');
