var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    contentType = 'binary',
    port = process.argv[2] || 8888;

http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);
    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.readFile(filename, "binary", function (err, file) {
            if (err) {
                response.writeHead(500, {"Content-Type": "text/html"});
                response.write(err + "\n");
                response.end();
                return;
            }
            //response.writeHead(200);
            switch (filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)[1]) {
                case 'html':
                    contentType = 'text/html';
                    break;
                case 'js':
                    contentType = 'text/javascript';
                    break;
                case 'css':
                    contentType = 'text/css';
                    break;
                default:
                    console.info('***UNKNOWN Content-Type for', filename, "\n");
                    break;
            }
            response.writeHead(200, {'Content-Type': contentType});
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(parseInt(port, 10));

console.log("Tomis scheudler local server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
