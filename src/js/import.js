const Papa = require('papaparse');

window.onload = function() {
    var fileInput = document.getElementById('fileInput');
    var fileDisplayArea = document.getElementById('fileDisplayArea');
    var errorDisplayArea = document.getElementById('errorDisplayArea');


    fileInput.addEventListener('change', function(e) {
      var file = fileInput.files[0];
      var textType = /csv.*/; //limit to csv files

      if (file.type.match(textType)) {

          var results = Papa.parse(file, {
            header: true, //csv includes header
            dynamicTyping: true, //parse numbers and boolean properly
            complete: function(results){
              console.log(results.data) // simple data retutn by papa parser 
              console.log(JSON.stringify(results.data)) //row of object data
              fileDisplayArea.innerHTML = JSON.stringify(results.data);         
              errorDisplayArea.style.display = "none";
            }
          });

      } else {
        errorDisplayArea.innerHTML = "File not supported!";
        errorDisplayArea.style.display = "block";
        fileDisplayArea.innerHTML = "";
        
      }
    });

}


