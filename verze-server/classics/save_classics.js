/* CLASSICS */

var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin2:34567@ec2-35-166-3-103.us-west-2.compute.amazonaws.com:27017/verze');

require('../models/Classics');
var Classic = mongoose.model('Classic');

fs.readFile('/home/bitnami/apps/VerzeServer/classics/classics.txt', 'utf8', function(err, contents) {
    var stringOfClassics = contents;
    var arrayOfClassics = [];
    
    // parse file into array of classic objects with Id and type
    var i = 0;
    while(i < stringOfClassics.length && stringOfClassics.length != 0) {
    	if(stringOfClassics.charAt(i) == ':') {
    		var j = i;
    		while(j != stringOfClassics.length && stringOfClassics.charAt(j) != '.') {
    			j++;
    		}
    		arrayOfClassics.push({ Id: stringOfClassics.substr(0, i), type: stringOfClassics.substring(i+1, j) });
    		stringOfClassics = stringOfClassics.substring(j+2);
    		i = 0;
    	}
    	i++;
    }
    
    // delete all from databse first
    Classic.remove({}, function(err, stuff) {
    	if(err) {
    		console.log(err);
    		return;
    	}
    });
    
    // for loop thru array
    for(var i = 0; i < arrayOfClassics.length; i++){
    	// save each classic into database
    	var classic = new Classic(arrayOfClassics[i]);

    	classic.save(function(err, classic){
    		if(err){
    			console.log(err);
    			return;
    		}

    		console.log("classic saved.");
    	});
    }
});