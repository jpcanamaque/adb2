export function StructureConstants () {
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

export function validateTableStucture(tblName, columns) {
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
        return response;
    } else {
        return "Table " + tblName + " is undefined";
    }
} 