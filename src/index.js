import React from 'react';
import { render } from 'react-dom';
import parser from 'sqlite-parser';
import $ from 'jquery';

import './css/bootstrap.min.css';
import './css/custom.css';


import { StructureConstants, validateTableStucture, readfile } from './helpers/structure';

class Root extends React.Component {        
    constructor() {
        super();
        this.parseQuery = this.parseQuery.bind(this);
        this.validateQuery = this.validateQuery.bind(this);
        this.selectData = this.selectData.bind(this);
    }

    componentDidMount () {

    }

    executeQuery(e) {
        e.preventDefault();
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
        let tblName, columns, isQueryValid;
        switch(statement.variant.toUpperCase()) {
            case "SELECT":
                tblName = statement.from.name;
                columns = statement.result.map(function(d,i) {
                    return d.name;
                });

                  // let whereClause = statement.where.map(function(d,i) {
                //     return d.left;
                // })

                isQueryValid = validateTableStucture(tblName, columns);
                if(isQueryValid !== '') {
                    console.error('SELECT error: ' + isQueryValid);
                } else {
                    // let filename = tblName.toLowerCase() + ".json";
                    // let path = "/src/struct/" + filename;
                    // this.readfile(path, columns, function(rows) {
                    //     console.log(rows);
                    // });
                    $("#rs-colheader").html('');
                    $("#rs-datarow").html('');
                    this.selectData(tblName, columns);
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

                isQueryValid = validateTableStucture(tblName, columns);
                if(isQueryValid !== '') {
                    console.error('INSERT error: ' + isQueryValid);
                } else {
                    this.insertData(tblName, columns);
                }
                break;

            case "DELETE":
                console.log(statement);
                tblName = statement.from.name;
                break;

            default:
                console.warn("SQL Warning: " + statement.variant.toUpperCase() + " not yet supported in this version.")
                break;
        }
    }

    selectData (tblName, columns) {
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
                thead_content += "<th>" + d + "</th>";
            });
            data.forEach(function(d,i) {
                cols.forEach(function(e,f) {
                    tbody_content += "<td>" + d[e.toLowerCase()] + "</td>";
                });
                tbody_content += "</tr>";
            });
            thead_content += "</tr>";
            $("#rs-colheader").html(thead_content);
            $("#rs-datarow").html(tbody_content);
        });
    }

    insertData (tblName, columns) {
        console.log("inserting data");
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
                <form action = "" onSubmit = { (e) => {this.executeQuery(e)} }>
                    <section className="input-section">
                        <div className="container">

                        <p className="text-inst">Enter the SQL to execute below:</p>
                        <div className="form-group">                           
                            <textarea className="form-control" rows="5" id="input-sql" ref = {(sql_string) => this.sql_string = sql_string}>
                            </textarea>
                        </div>

                        <button className="btn btn-success btn-sm" id="exec-btn">Execute</button>
                        
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

                {/* <p className="text-inst">or import file: <a href="#" className="btn btn-primary btn-sm" id="import-btn">Choose File</a></p> */}
                {/* <section className="result-section">
                    <div className="container">
                    
                    <div className="form-group">
                        <label htmlFor="result">Result:</label>
                        <textarea className="form-control" rows="12" id="result-txt"></textarea>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-bordered">
                        <thead>
                            <tr>
                            <th>head</th>
                            <th>head</th>
                            <th>head</th>
                            <th>head</th>
                            <th>head</th>
                            <th>head</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            </tr>
                            <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            </tr>
                            <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            </tr>
                            <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            </tr>
                            <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            </tr>
                            <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>

                    </div>        
                </section> */}


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