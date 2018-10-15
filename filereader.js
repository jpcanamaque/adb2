var fs = require("fs");
var http = require('http');
var qs = require("querystring");

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin' : "*", "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept"});
    let whole = '';
    let data = '';
    req.on('data', (chunk) => {
        whole += chunk.toString();
    });
    req.on('end', () => {
        data = qs.parse(whole);
        let cmd = data.cmd;
        let tblname = data.tblName;
        let values = JSON.parse(data.vals);

        if(cmd == 'insert') {
            fs.readFile('src/struct/'+tblname+'.json', 'utf8', function(err, contents){        
                let cnts = JSON.parse(contents);
                cnts.push(values);
                cnts = JSON.stringify(cnts);
                fs.writeFile('src/struct/'+tblname+'.json', cnts, function(err, contents){
                    res.end('1');
                });
            });
        } else {
            res.end('5');
        }
    });
}).listen(1337, "localhost");

console.log('Server running at http://localhost:1337/')