var dt = require('date-and-time');

function StructureConstants () {
    return {
        'STUDENT' : {
            STUDNO: 'string',       
            STUDENTNAME: 'string',       
            BIRTHDAY: 'string',       
            DEGREE: 'string',       
            MAJOR: 'string',       
            UNITSEARNED: 'int',
            "*": 'All columns'
        },
        'STUDENTHISTORY': {
            STUDNO: 'string',       
            DESCRIPTION : 'string',       
            ACTION : 'string',       
            DATEFILED : 'string',       
            DATERESOLVED : 'string',
            "*": 'All columns'
        },
        'COURSE' : {
            CNO: 'string',       
            CTITLE: 'string',       
            CDESC: 'string',       
            NOOFUNITS: 'int',       
            HASLAB: 'int',       
            SEMOFFERED: 'string',
            "*": 'All columns'
        },
        'COURSEOFFERING' : {
            SEMESTER: 'string',       
            ACADYEAR: 'string',       
            CNO: 'string',       
            SECTION: 'string',       
            TIME: 'string',       
            MAXSTUD: 'int',
            "*": 'All columns'
        },
        'STUDCOURSE' : {
            STUDNO: 'string',
            CNO: 'string',
            SEMESTER: 'string',
            ACADYEAR: 'string',
            "*": 'All columns'
        }
    }
}

function validateTableStucture(tblName, columns, whereClause) {
    whereClause = whereClause || []
    columns = columns || []
    let tblStruct = StructureConstants();
    let ucaseTblname = tblName.toUpperCase();
    let isTableExists = typeof tblStruct[ucaseTblname] !== 'undefined' ? true : false;

    if(isTableExists) {
        let response = '';
        let tblUsed = tblStruct[ucaseTblname];
        let starCntr = 0;
        columns.forEach(col => {
            if(col == "*") {
                starCntr++;
            } 
            if (starCntr > 1){
                response = "Multiple wildcard select error";
            }
            if(!tblUsed.hasOwnProperty(col.toUpperCase())) {
                response =  "Column " + col + " not existing in table " + tblName;
            }
        });
        if(whereClause.length > 0) {   
            whereClause.forEach(c => {
                if(typeof c.operation !== 'undefined' || c.values > 0) {
                    c.values.forEach(cc => {
                        if(!tblUsed.hasOwnProperty(cc.col.toUpperCase())) {
                            response =  "Column " + cc.col + " in WHERE clause not existing in table " + tblName;
                        }
                        return false;
                    });
                } else {
                    if(!tblUsed.hasOwnProperty(c.col.toUpperCase())) {
                        response =  "Column " + c.col + " in WHERE clause not existing in table " + tblName;
                    }
                }
            });
        }

        return response;
    } else {
        return "Table " + tblName + " is undefined";
    }
} 

function evaluateOper(operation, left, right) {
    switch(operation.toLowerCase()) {
        case '<':
            return left < right;
        case '>':
            return left > right;
        case '<=':
            return left <= right;
        case '>=':
            return left >= right;
        case '=':
            return left == right;
        case 'and':
            return left && right;
        case 'or':
            return left || right;
    }
}

function validateColumnStructure(column, value) {
    let strValidation = '';
    // console.log(column, value);
    switch(column.toLowerCase()) {
        case 'studno':
            if( value.length !== 10 || (value.indexOf('-') == -1 || value.indexOf('-') !== 4) ) {
                strValidation = column + " should follow YYYY-XXXXX format. (e.g. 2008-12345)";
            }
            break;
        case 'birthday':
            if(!dt.isValid(value, 'YYYY-MM-DD')) {
                strValidation = column + " should follow YYYY-MM-DD format. (e.g. 2018-01-01)";
            }
            break;
        case 'time':
            if(!dt.isValid(value, 'HH:mm')) {
                strValidation = column + " should follow HH24:mm format. (e.g. 22:22)";
            }
            break;
        case 'semoffered':
        case 'semester':
            let allowed_vals = ['1st', '2nd', 'sum'];
            if(allowed_vals.indexOf(value.toLowerCase()) == -1) {
                strValidation = column + " only accepts '1st', '2nd', and 'Sum' values.";
            }
            break;
        case 'haslab':
            value = parseInt(value);
            if(isNaN(value) || value !== 0 || value !== 1) {
                strValidation = column + " only accepts 0's and 1's";
            }
            break;
        case 'unitsearned':
        case 'noofunits':
        case 'maxstud':
            value = (value % 1 > 0) ? parseFloat(value) : parseInt(value);
            if(isNaN(value)) {
                strValidation = column + " should be a number.";
            }
            break;
    }

    if(value.length > 50) {
        strValidation = column + " should only contain a maximum of 50 characters.";
    }

    return strValidation;
}

module.exports.StructureConstants = StructureConstants;
module.exports.validateTableStucture = validateTableStucture;
module.exports.evaluateOper = evaluateOper;
module.exports.validateColumnStructure = validateColumnStructure;