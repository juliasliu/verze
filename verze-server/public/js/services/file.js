angular.module('App').factory('FileService', ['$cordovaFileTransfer', 'promiseFactory', 'Upload', function($cordovaFileTransfer, promiseFactory, Upload) {
	function uploadImage(image) {
        if (image) {
            
            var dfd = promiseFactory.defer();
    		
            Upload.upload({
                url: '/uploads',
                method: 'POST',
                file: image
            }).then(function(res) {
    			return dfd.resolve(res.data);
    		}, function(err) {
    			return dfd.reject(err);
    		}, function (progress) {
    			// constant progress updates
    		});
    		return dfd.promise;
        }
	}
	
	function uploadRecording(item) {
		if (item) {

			var dfd = promiseFactory.defer();

			Upload.upload({
				url: '/uploads',
				method: 'POST',
				file: item
			}).then(function(res) {
				return dfd.resolve(res.data);
			}, function(err) {
				return dfd.reject(err);
			}, function (progress) {
				// constant progress updates
			});
			return dfd.promise;
        }
	}
	
	/**
	 * Convert a base64 string in a Blob according to the data and contentType.
	 * 
	 * @param b64Data {String} Pure base64 string without contentType
	 * @param contentType {String} the content type of the file i.e (audio/mpeg - image/png - text/plain)
	 * @param sliceSize {Int} SliceSize to process the byteCharacters
	 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
	 * @return Blob
	 */
	function b64toBlob(b64Data, contentType, sliceSize) {
		contentType = contentType || '';
		sliceSize = sliceSize || 512;

		var byteCharacters = atob(b64Data);
		var byteArrays = [];

		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);

			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			var byteArray = new Uint8Array(byteNumbers);

			byteArrays.push(byteArray);
		}

		var blob = new Blob(byteArrays, {type: contentType});
		return blob;
	}
	
	/**
	 * Create an Audio file according to its database64 content only.
	 * 
	 * @param folderpath {String} The folder where the file will be created
	 * @param filename {String} The name of the file that will be created
	 * @param content {Base64 String} Important : The content can't contain the following string (data:audio/mpeg[or any other format];base64,). Only the base64 string is expected.
	 */
	function saveBase64AsAudioFile(folderpath,filename,content,contentType){
	    // Convert the base64 string in a Blob
	    var DataBlob = b64toBlob(content,contentType);

	    console.log("Starting to write the file :3");

	    window.resolveLocalFileSystemURL(folderpath, function(dir) {
	        console.log("Access to the directory granted succesfully");
	        dir.getFile(filename, {create:true}, function(file) {
	            console.log("File created succesfully.");
	            file.createWriter(function(fileWriter) {
	                console.log("Writing content to file");
	                fileWriter.write(DataBlob);
	            }, function(){
	                alert('Unable to save file in path '+ folderpath);
	            });
	        });
	    });
	}
	
	function randomFileName(name) {
		return makeid() + name;
	}
	
	function makeid() {
		var text = '';
		var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (var i = 0; i < 5; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	};

	return {
		uploadImage: uploadImage,
		uploadRecording: uploadRecording,
		b64toBlob: b64toBlob,
		saveAudio: saveBase64AsAudioFile,
		randomName: randomFileName,
		makeid: makeid
	}
}])
.factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {

	function optionsForType(type) {
		var source;
		switch (type) {
		case 0:
			source = Camera.PictureSourceType.CAMERA;
			break;
		case 1:
			source = Camera.PictureSourceType.PHOTOLIBRARY;
			break;
		}
		return {
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: source,
			allowEdit: false,
			encodingType: Camera.EncodingType.JPEG,
			popoverOptions: CameraPopoverOptions,
			saveToPhotoAlbum: false
		};
	}

	function saveMedia(type) {
		return $q(function(resolve, reject) {
			var options = optionsForType(type);

			$cordovaCamera.getPicture(options).then(function(imageUrl) {
				var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
				var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
				var newName = FileService.makeid() + name;
				$cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
				.then(function(info) {
					return resolve(info.nativeURL);
				}, function(e) {
					return reject(e);
				});
			});
		})
	}
	
	return {
		handleMediaDialog: saveMedia
	}
}) 