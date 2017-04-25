window.onload = function() {
  var conn;

  conn = new WebSocket("ws://" + document.location.host + "/ws");
  conn.onclose = function(evt) {
    console.log("closing");
  };
  conn.onmessage = function(evt) {
    console.log("got evt", evt);
    eval(evt.data);
  };
  conn.onerror = function(err) {
    console.error("ERROR: ", err);
  };
};
