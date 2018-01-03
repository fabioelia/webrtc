var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var _ = require('lodash');

var url = new URL(location.href);
var params = url.searchParams;
var options = {};
var isTeacher = params.get('teacher');

if (isTeacher) {
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.arc(100, 75, 50, 0, 2 * Math.PI);
  ctx.stroke();
  options.initiator = true;
  options.stream = c.captureStream(0);
  var i = 10;
  setInterval(function(){
    ctx.arc(100 + i, 75 + i, 50 + i, 0, 2 * Math.PI);
    ctx.stroke();
    i += 4;
  }, 200);
}

var hub = signalhub('teacher-example', ['https://signalhub-jccqtwhdwc.now.sh'])
var sw = swarm(hub, options);

sw.on('peer', function (peer, id) {
  console.log('connected to a new peer:', id);
  console.log('total peers:', sw.peers.length);
  peer.on('data', function (data) {
    // got a data channel message
    console.log('got a message from peer: ' + data)
  });
  peer.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video')
    video.srcObject = stream; //window.URL.createObjectURL(stream)
    video.onloadedmetadata = function(e) {
      // test;
      console.log("TEST");
    }
    video.play();
  })
})

sw.on('disconnect', function (peer, id) {
  console.log('disconnected from a peer:', id);
  console.log('total peers:', sw.peers.length);
})

function message() {
  _.each(sw.peers, function(peer) {
    peer.send('xyz');
  });
}
window.message = message;
window.sw = sw;
