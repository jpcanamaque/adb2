const Papa = require('papaparse');

// function loadParse(){
export function loadParse() {
    var fileInput = document.getElementById('fileInput');
    var fileDisplayArea = document.getElementById('fileDisplayArea');
    var errorDisplayArea = document.getElementById('errorDisplayArea');
    var importedFile = document.getElementById('importedFile');
    
    console.log(fileInput.files[0]);

    // fileInput.addEventListener('change', function(e) {
      var file = fileInput.files[0];
      var textType = /csv.*/; //limit to csv files

      if (file.type.match(textType)) {

          var results = Papa.parse(file, {
            // header: true, //csv includes header
            dynamicTyping: true, //parse numbers and boolean properly
            complete: function(results){
              console.log('results: ');
              // console.log(results);
              // console.log(results.data) // simple data retutn by papa parser 
              // console.log(JSON.stringify(results.data)) //row of object data
              // importedFile.innerHTML = JSON.stringify(results.data);         
              // errorDisplayArea.style.display = "none";
              // executeImport(JSON.stringify(results.data));
              let $result = JSON.stringify(results.data)
              console.log($result);
              return $result;
            }
          });

      } else {
        errorDisplayArea.innerHTML = "File not supported!";
        errorDisplayArea.style.display = "block";
        fileDisplayArea.innerHTML = "";
        return 'wala';
      }
    // });
  }
// }


