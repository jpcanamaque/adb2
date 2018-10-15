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
        const sqlstring = this.sql_string.value;
        const arr_sqlstring = sqlstring.split(';');
        if(arr_sqlstring.length > 1 && arr_sqlstring[arr_sqlstring.length - 1] !== "" ) {
            console.error('Current version can only execute one query at a time.');
        } else {
            this.parseQuery(sqlstring, (sql_token) => {
                if(typeof sql_token === 'object' || sql_token == 1) {
                    this.validateQuery(sql_token);
                } else {
                    alert('zxcv');
                }
            })
        }
    }

    parseQuery(sqlstring, callback) {
        let flag = 0;
        try {
            flag = parser(sqlstring);
        } catch (ex) {
            console.log(ex.message);
        } 
        callback(flag);
    }

    validateQuery(sql_token) {
        let statement = sql_token.statement[0];
        let tblName, columns, values, isQueryValid, whereClause = [];
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

                values = statement.result[0].expression.map(function(d,i) {
                    let x = {}
                    x[statement.into.columns[i].name] = d.value || d.name;
                    return x;
                });

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

    selectData (tblName, columns, whereClause) {
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

    insertData (tblName, columns, values) {
        let cols = {};
        let cmd = "insert";
        Object.keys(StructureConstants()[tblName.toUpperCase()]).forEach(function(d,i) {
            if(d !== "*")
                cols[d.toLowerCase()] = null;
        });

        values.forEach(function(d,i) {
            let validateCols = validateColumnStructure(Object.keys(d)[0], d[Object.keys(d)[0]]);
            if(validateCols == '') {
                cols[Object.keys(d)[0]] = d[Object.keys(d)[0]];
            } else {
                console.error("INSERT error: " + validateCols);
            }
        });

        let url_qs = {cmd, tblName, vals : JSON.stringify(cols)};

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
        $.getJSON(path, function(data) {
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

            let url_qs = {cmd, tblName, vals: JSON.stringify($data)};
            
            let coverSpin = document.getElementById('cover-spin');
            coverSpin.style.display = "none";
        });
    }

    render () {
        return (
            <div>
                <div className="bg-light">
                    <div className="container float-left">
                        
                    </div>
                    <form action = "" onSubmit = { (e) => {this.executeQuery(e)} }>
                        <section className="input-section">
                            <div className="container">
                            <p className="text-inst">Enter the SQL to execute below:</p>
                            <div className="form-group">                           
                                <textarea className="form-control" rows="5" id="input-sql" ref = {(sql_string) => this.sql_string = sql_string}>
                                </textarea>
                            </div>

                            <button className="btn btn-success btn-sm" id="exec-btn">Execute</button>
                            <div id="cover-spin"></div>
                            </div>
                        </section>
                    </form>
                
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