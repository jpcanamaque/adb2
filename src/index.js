import React from 'react';
import { render } from 'react-dom';
import parser from 'sqlite-parser';
import $ from 'jquery';

import './css/bootstrap.min.css';
import './css/custom.css';


import { StructureConstants, validateTableStucture, evaluateOper, validateColumnStructure } from './helpers/structure';

class Root extends React.Component {        
    constructor() {
        super();
        this.parseQuery = this.parseQuery.bind(this);
        this.validateQuery = this.validateQuery.bind(this);
        this.selectData = this.selectData.bind(this);
    }

    executeQuery(e) {
        e.preventDefault();
        let coverSpin = document.getElementById('cover-spin');
        coverSpin.style.display = "block";
        const sqlstring = (this.sql_string.value).trim();
        const arr_sqlstring = sqlstring.split(';');

        if(arr_sqlstring.length > 1 && arr_sqlstring[arr_sqlstring.length - 1] !== "" ) {
            console.error('Current version can only execute one query at a time.');
            let coverSpin = document.getElementById('cover-spin');
            coverSpin.style.display = "none";
        } else {
            this.parseQuery(sqlstring, (sql_token) => {
                if(typeof sql_token === 'object' || sql_token == 1) {
                    this.validateQuery(sql_token);
                }
                let coverSpin = document.getElementById('cover-spin');
                coverSpin.style.display = "none";
            });
        }
    }

    getJsonData(result) { 
        let jsonData = JSON.stringify(result.data);
        let col = ["studno","studentname","birthday","degree","major","unitsearned"];
    }

 
    executeImport(selectorFiles: FileList){        
        let file = selectorFiles[0]; 
        let file_temp = file['name'];
        let file_temp_arr = file_temp.split(".");
        let filename =  file_temp_arr[0];
        const Papa = require('papaparse');
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,       
            complete: function(result){
                
                let values2 = (result.data);
                let tblName = filename;   //Should not be hardcoded
        
                let cols = {};
                let cmd = "insert";
                let data_temp = {};
                
                Object.keys(StructureConstants()[tblName.toUpperCase()]).forEach(function(d,i) {
                    if(d !== "*")
                        cols[d.toLowerCase()] = null;
                });
        
                let values2_temp, cols2=[];
        
                values2.forEach(function(d,i) { 
                    cols = {};
                    values2_temp = Object.keys(d);
                    values2_temp.forEach(function(d1,i1){
                     
                        if(d[d1] != null || d[d1] == ''){
                            let validateCols = validateColumnStructure(d1, d[d1]);
                      
                            if(validateCols == '') {
                                if(['haslab', 'unitsearned', 'noofunits', 'maxstud'].indexOf(d1) !== -1) {
                                    cols[d1] = (d[d1] % 1 == 0) ? parseInt(d[d1]) 
                                                    : parseFloat(d[d1]);
                                } else {
                                    cols[d1] = d[d1];
                                }
                            } else {
                                console.error("INSERT error: " + validateCols);
                            }
                        }
                    });

                    data_temp[i] = cols ;
                });
               
       
                let url_qs = {cmd, tblName, vals : JSON.stringify(data_temp)};
              
                $.post('http://localhost:1337/', url_qs, function(d) {
                    if(d == "1") {
                        console.log('INSERT: 1 row inserted.')
                    }
                });
        
                let coverSpin = document.getElementById('cover-spin');
                coverSpin.style.display = "none";
            }
        });
    }
    

    //returns token
    parseQuery(sqlstring, callback) {
        let flag = 0;
        try {
            flag = parser(sqlstring);
        } catch (ex) {
            console.error("SQL error: " + ex.message);
        } 
        console.log('Log:');
        console.log(flag);
        callback(flag);
    }

    validateQuery(sql_token) {
        let statement = sql_token.statement[0];
        let tblName, columns, values, isQueryValid, whereClause = [], values2=[];
        switch(statement.variant.toUpperCase()) {
            case "SELECT":
                tblName = statement.from.name;
                columns = statement.result.map(function(d,i) {
                    return d.name;
                });
                if(typeof statement.where !== 'undefined') {
                    whereClause = statement.where.map(function(d,i) {
                        if(['and', 'or', '<', '>', '=', '<=', '>='].indexOf(d.operation) >= 0) {
                            let leftCond = d.left;
                            let rightCond = d.right;
                            
                            if((['and', 'or'].indexOf(leftCond.operation) === -1 || ['and', 'or'].indexOf(rightCond.operation) === -1)
                            && (typeof leftCond.operation !== 'undefined' && typeof rightCond.operation !== 'undefined')
                            ) {
                                if(['and', 'or'].indexOf(leftCond.operation) > -1 || ['and', 'or'].indexOf(rightCond.operation) > -1) {
                                    isQueryValid = "Only TWO conditions are supported in this version";
                                    return [];
                                } else {
                                    let firstFilterTarget = leftCond.left.name;
                                    let firstFilterOper = leftCond.operation;
                                    let firstFilterValue = leftCond.right.value || leftCond.right.name;
        
                                    let secondFilterTarget = rightCond.left.name;
                                    let secondFilterOper = rightCond.operation;
                                    let secondFilterValue = rightCond.right.value ||  rightCond.right.name;
                                    
                                    return { operation : d.operation, values : [
                                       {          
                                            'col' : firstFilterTarget,
                                            'oper' : firstFilterOper,
                                            'val' : firstFilterValue
                                        }, {
                                            'col' : secondFilterTarget,
                                            'oper' : secondFilterOper,
                                            'val' : secondFilterValue
                                        }
                                    ]};
                                }
                            } else if (leftCond.type !== 'expression' && rightCond.type !== 'expression') {
                                let firstFilterTarget = leftCond.name;
                                let firstFilterOper = d.operation;
                                let firstFilterValue = rightCond.value;

                                return {
                                    'col' : firstFilterTarget,
                                    'oper' : firstFilterOper,
                                    'val' : firstFilterValue
                                };
                            } else {
                                isQueryValid = "Only TWO conditions are supported in this version";
                            }                      
                        } else {
                            isQueryValid = 'SELECT error: Only AND, OR or basic comparison operators are supported in this version';
                        }
                    });
                }

                if(isQueryValid === '' || typeof isQueryValid === 'undefined') {
                    isQueryValid = validateTableStucture(tblName, columns, whereClause);
                } 

                if(isQueryValid !== '') {
                    console.error('SELECT error: ' + isQueryValid);
                } else {
                    $("#rs-colheader").html('');
                    $("#rs-datarow").html('');
                    this.selectData(tblName, columns, whereClause);
                }
                break;

            case "INSERT":
                tblName = statement.into.name;
                if(typeof statement.into.columns === "undefined") {
                    console.error('INSERT error: Column-less insert not supported in this version.');
                    break;
                }
              
                columns = statement.into.columns.map(function(d,i) {
                    return d.name;
                });
               
                let new_results;
                new_results = statement.result;
               
                new_results.forEach(function(d,i){
                    values2.push(statement.result[i].expression.map(function(d,i) {
                        let x = {}
                        x[statement.into.columns[i].name] = d.value || d.name;
                        return x;
                    }));
                });

              
                values = values2;
               
                isQueryValid = validateTableStucture(tblName, columns);
              
                if(isQueryValid !== '') {
                    console.error('INSERT error: ' + isQueryValid);
                } else {
                    this.insertData(tblName, columns, values);
                }

                break;

            case "DELETE":
                tblName = statement.from.name;

                if(typeof statement.where !== 'undefined') {
                    whereClause = statement.where.map(function(d,i) {
                        if(['and', 'or', '<', '>', '=', '<=', '>='].indexOf(d.operation) >= 0) {
                            let leftCond = d.left;
                            let rightCond = d.right;
                            
                            if((['and', 'or'].indexOf(leftCond.operation) === -1 || ['and', 'or'].indexOf(rightCond.operation) === -1)
                            && (typeof leftCond.operation !== 'undefined' && typeof rightCond.operation !== 'undefined')
                            ) {
                                if(['and', 'or'].indexOf(leftCond.operation) > -1 || ['and', 'or'].indexOf(rightCond.operation) > -1) {
                                    isQueryValid = "Only TWO conditions are supported in this version";
                                    return [];
                                } else {
                                    let firstFilterTarget = leftCond.left.name;
                                    let firstFilterOper = leftCond.operation;
                                    let firstFilterValue = leftCond.right.value || leftCond.right.name;
        
                                    let secondFilterTarget = rightCond.left.name;
                                    let secondFilterOper = rightCond.operation;
                                    let secondFilterValue = rightCond.right.value ||  rightCond.right.name;
                                    
                                    return { operation : d.operation, values : [
                                       {          
                                            'col' : firstFilterTarget,
                                            'oper' : firstFilterOper,
                                            'val' : firstFilterValue
                                        }, {
                                            'col' : secondFilterTarget,
                                            'oper' : secondFilterOper,
                                            'val' : secondFilterValue
                                        }
                                    ]};
                                }
                            } else if (leftCond.type !== 'expression' && rightCond.type !== 'expression') {
                                let firstFilterTarget = leftCond.name;
                                let firstFilterOper = d.operation;
                                let firstFilterValue = rightCond.value;

                                return {
                                    'col' : firstFilterTarget,
                                    'oper' : firstFilterOper,
                                    'val' : firstFilterValue
                                };
                            } else {
                                isQueryValid = "Only TWO conditions are supported in this version";
                            }                      
                        } else {
                            isQueryValid = 'SELECT error: Only AND, OR or basic comparison operators are supported in this version';
                        }
                    });
                }

                console.log(tblName, whereClause);

                if(isQueryValid === '' || typeof isQueryValid === 'undefined') {
                    isQueryValid = validateTableStucture(tblName, columns, whereClause);
                } 

                if(isQueryValid !== '') {
                    console.error('DELETE error: ' + isQueryValid);
                } else {
                    this.deleteData(tblName, whereClause);
                }

                break;

            default:
                console.warn("SQL Warning: " + statement.variant.toUpperCase() + " not yet supported in this version.")
                break;
        }
    }

    selectData (tblName,columns, whereClause) {
        let filename = tblName.toLowerCase() + ".json";
        let path = "/src/struct/" + filename;
        let thead_content = "<tr>";
        let tbody_content = "<tr>";
        let cols = '';
        
        $.getJSON(path, function(data) {
            if(columns.includes("*")) {
                cols = Object.keys(StructureConstants()[tblName.toUpperCase()]).filter(col => { return col !== "*"; });
            } else {
                cols = columns;
                
            }
            cols.forEach(function(d,i) {
                thead_content += "<th>" + d.toLowerCase() + "</th>";
            });
            
            if(whereClause.length > 0) {
                data  = data.filter(function(r){
                    if(typeof whereClause[0].operation !== 'undefined') {                    
                        let firstEval = evaluateOper(whereClause[0].values[0].oper, r[whereClause[0].values[0].col],  whereClause[0].values[0].val);
                        let secondEval = evaluateOper(whereClause[0].values[1].oper, r[whereClause[0].values[1].col],  whereClause[0].values[1].val);
                        return evaluateOper(whereClause[0].operation, firstEval, secondEval);
                    } else {
                        return evaluateOper(whereClause[0].oper, r[whereClause[0].col],  whereClause[0].val); 
                    }
                });
            }
            

            data.forEach(function(d,i) {
                cols.forEach(function(e,f) {
                    tbody_content += "<td>" + d[e.toLowerCase()] + "</td>";
                });
                tbody_content += "</tr>";
            });
            thead_content += "</tr>";
            $("#rs-colheader").html(thead_content);
            $("#rs-datarow").html(tbody_content);
            let coverSpin = document.getElementById('cover-spin');
            coverSpin.style.display = "none";
        });
    }

    insertData (tblName, columns, values2) {
        let cols = {};
        let cmd = "insert";
        let data_temp = {};
        
        Object.keys(StructureConstants()[tblName.toUpperCase()]).forEach(function(d,i) {
            if(d !== "*")
                cols[d.toLowerCase()] = null;
        });
        console.log('cols: ');
        console.log(cols);
        console.log('Check values here: ');
        console.log(values2);

        // new_results.forEach(function(d,i){
        //     values2.push(statement.result[i].expression.map(function(d,i) {
        //         let x = {}
        //         x[statement.into.columns[i].name] = d.value || d.name;
        //         return x;
        //     }));
        // });

        let values2_temp, cols2=[];

        values2.forEach(function(data,key) { 
            console.log('HERE '+key);
            values2_temp = data;
            console.log(values2_temp);
            cols = {};
            console.log('CHECK COLS: ');
            console.log(cols);
            console.log(data_temp);
            values2_temp.forEach(function(d,i){
                let validateCols = validateColumnStructure(JSON.stringify(Object.keys(d)), d[Object.keys(d)]);
                if(validateCols == '') {
                    if(['haslab', 'unitsearned', 'noofunits', 'maxstud'].indexOf(Object.keys(d)[0]) !== -1) {
                        cols[Object.keys(d)] = (d[Object.keys(d)] % 1 == 0) ? parseInt(d[Object.keys(d)]) 
                                        : parseFloat(d[Object.keys(d)]);
                    } else {
                        cols[Object.keys(d)] = d[Object.keys(d)];
                    }
                } else {
                    console.error("INSERT error: " + validateCols);
                }
            });
            // cols2.push(cols);
            console.log('PRE:');
            console.log(cols);
            console.log('PRE key:'+key);
            data_temp[key] = cols ;
            // console.log('DATA TEMP: ');
            console.log(data_temp);
            
        });
        
        // let sample_val = JSON.stringify(data_temp);
        // let sample_val  = [data_temp[0],data_temp[1]];
        // console.log('SAmple');
        // console.log(sample_val);
        // let url_qs = {cmd, tblName, vals : JSON.stringify(data_temp)};
        let url_qs = {cmd, tblName, vals : JSON.stringify(data_temp)};
        console.log('url_qs');
        console.log(url_qs);

        // sample2.forEach(function(data,key){
        //     console.log(data);
        //     console.log(key);
        // });
        // let sizeofvar = Object.keys(sample2).length;
        // console.log(sizeofvar);
        // for(let i=0;i<sizeofvar;i++){
        //    console.log(JSON.parse(JSON.stringify(sample2[i])));
        // }

        $.post('http://localhost:1337/', url_qs, function(d) {
            if(d == "1") {
                console.log('INSERT: 1 row inserted.')
            }
        });

        let coverSpin = document.getElementById('cover-spin');
        coverSpin.style.display = "none";
    }

    deleteData (tblName, whereClause) {
        let filename = tblName.toLowerCase() + ".json";
        let path = "/src/struct/" + filename;
        let cmd = 'delete';
        let where_cols = "";
        $.getJSON(path, function(data) {
            if(whereClause.length > 0) {
                data  = data.filter(function(r){
                    if(typeof whereClause[0].operation !== 'undefined') {                    
                        let firstEval = evaluateOper(whereClause[0].values[0].oper, r[whereClause[0].values[0].col],  whereClause[0].values[0].val);
                        let secondEval = evaluateOper(whereClause[0].values[1].oper, r[whereClause[0].values[1].col],  whereClause[0].values[1].val);
                        where_cols = evaluateOper(whereClause[0].operation, firstEval, secondEval)
                    } else {
                        where_cols = evaluateOper(whereClause[0].oper, r[whereClause[0].col],  whereClause[0].val); 
                    }
                    return where_cols;
                });
            }

            let url_qs = {cmd, tblName, vals: JSON.stringify(data), where: JSON.stringify(whereClause)};
            $.post('http://localhost:1337/', url_qs, function(d) {
                if(d == "1") {
                    let affect_row = data.length;
                    console.log('DELETE: '+ affect_row +' row/s affected.');
                }
            });

            let coverSpin = document.getElementById('cover-spin');
            coverSpin.style.display = "none";
        });
    }

    clickFile(e) {
        var object = this.refs.fileInput;
        object.click();
    }

    render () {
        return (
            
            <div>
                <section className="top-section text-center">
                  <div className="container">
                    <h2>DBMS</h2>        
                  </div>
                </section>
                <div className="bg-light">
                    <section className="input-section">
                        <div className="container">

                            <form action = "" onSubmit = { (e) => {this.executeQuery(e)} }>
                                
                                    <p>Enter the SQL to execute below:</p>                                                               
                                    <textarea className="form-control" rows="5" id="fileDisplayArea" ref = {(sql_string) => this.sql_string = sql_string}>
                                    </textarea>                                    

                                    <button className="btn btn-success btn-md" id="exec-btn">Execute</button>                                    
                                                                        
                                    <input type="button" className="btn btn-md" id="importBtn" value="Import File" onClick={(e) => this.clickFile(e)} />                                         
                                    <input type="file" id="fileInput" ref="fileInput" accept=".csv" onChange={(e) => {this.executeImport(e.target.files)}}/>

                                    <div id="cover-spin"></div>  

                                    <div id="errorDisplayArea" className="alert alert-danger"></div>                                
                            </form>
                        </div>
                    </section>
                
                    <div className="container">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead id = "rs-colheader">
                                
                                </thead>
                                <tbody id = "rs-datarow">

                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
                <footer className="text-muted">
                    <div className="container">        
                        <p>&copy; CMSC227</p>        
                    </div>
                </footer>
            </div>
        );
    }

}


render(<Root/>, document.querySelector('#root'));