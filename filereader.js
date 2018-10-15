var fs = require("fs");
var http = require('http');
var qs = require("querystring");
var evaluateOper = require('./src/helpers/structure.es5.js').evaluateOper; 

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
        } else if (cmd == 'delete') {
            let whereClause = JSON.parse(data.where);
            fs.readFile('src/struct/'+tblname+'.json', 'utf8', function(err, contents){        
                let cnts = JSON.parse(contents);
                let data = '';
                if(whereClause.length > 0) {
                    data  = cnts.filter(function(r){
                        if(typeof whereClause[0].operation !== 'undefined') {                    
                            let firstEval = evaluateOper(whereClause[0].values[0].oper, r[whereClause[0].values[0].col],  whereClause[0].values[0].val);
                            let secondEval = evaluateOper(whereClause[0].values[1].oper, r[whereClause[0].values[1].col],  whereClause[0].values[1].val);
                            where_cols = !evaluateOper(whereClause[0].operation, firstEval, secondEval)
                        } else {
                            where_cols = !evaluateOper(whereClause[0].oper, r[whereClause[0].col],  whereClause[0].val); 
                        }
                        return where_cols;
                    });
                } else {
                    data = [];
                }

                data = JSON.stringify(data);
                fs.writeFile('src/struct/'+tblname+'.json', data, function(err, contents){
                    res.end('1');
                });
            });
        } else {
            res.end('5');
        }
    });
}).listen(1337, "localhost");