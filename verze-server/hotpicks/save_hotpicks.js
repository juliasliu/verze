/* HOT PICKS */

var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin2:34567@ec2-35-166-3-103.us-west-2.compute.amazonaws.com:27017/verze');

require('../models/HotPicks');
var HotPick = mongoose.model('HotPick');

fs.readFile('/home/bitnami/apps/VerzeServer/hotpicks/hotpicks.txt', 'utf8', function(err, contents) {
	var stringOfHotPicks = contents;
    var arrayOfHotPicks = [];
    
    // parse file into array of HotPick objects with Id and type
    var i = 0;
    while(i < stringOfHotPicks.length && stringOfHotPicks.length != 0) {
    	if(stringOfHotPicks.charAt(i) == ':') {
    		var j = i;
    		while(j != stringOfHotPicks.length && stringOfHotPicks.charAt(j) != '.') {
    			j++;
    		}
    		arrayOfHotPicks.push({ Id: stringOfHotPicks.substr(0, i), type: stringOfHotPicks.substring(i+1, j) });
    		stringOfHotPicks = stringOfHotPicks.substring(j+2);
    		i = 0;
    	}
    	i++;
    }
    
    // delete all from databse first
    HotPick.remove({}, function(err, stuff) {
    	if(err) {
    		console.log(err);
    		return;
    	}
    });
    
    // for loop thru array
    for(var i = 0; i < arrayOfHotPicks.length; i++){
    	// save each HotPick into database
    	var hotpick = new HotPick(arrayOfHotPicks[i]);

    	hotpick.save(function(err, hotpick){
    		if(err){
    			console.log(err);
    			return;
    		}

    		console.log("hotpick saved.");
    	});
    }
});