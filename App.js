const express = require('express');
const app = express();
const http = require('http').createServer(app);
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
let port = process.env.PORT;
if (port == null || port == "") {
  port = 2000;
}
http.listen(port);