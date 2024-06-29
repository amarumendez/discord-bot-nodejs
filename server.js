var http = require('http');

function startServer() {
    http.createServer(function (req, res) {
        res.write('Hello World!');
        res.end();
    }).listen(8080, () => {
        console.log('HTTP server is listening on port 8080');
    });
}

module.exports = startServer;
