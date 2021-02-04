angular.module('App').factory('users', ['$http', 'auth', 'FileService', 'promiseFactory', function($http, auth, FileService, promiseFactory){
	var users = {
		users: [],
		followers: [],
		following: []
	};
	
	users.getUsers = function() {
		return $http.get('/users/')
		.success(function(data) {
			for(var i = 0; i < data.length; i++) {
				users.getUser(data[i].username).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.user._id);
					users.users[index] = {};
					angular.copy(res.user, users.users[index]);
				})
			}
		});
	};
	
	users.getFollowers = function(username) {
		return $http.get('/users/'+username+'/followers')
		.success(function(data) {
			for(var i = 0; i < data.length; i++) {
				users.getUser(data[i].username).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.user._id);
					users.followers[index] = {};
					angular.copy(res.user, users.followers[index]);
				})
			}
		});
	}
	
	users.getFollowing = function(username) {
		return $http.get('/users/'+username+'/following')
		.success(function(data) {
			for(var i = 0; i < data.length; i++) {
				users.getUser(data[i].username).success(function(res) {
					var index = data.map(function(x) {return x._id; }).indexOf(res.user._id);
					users.following[index] = {};
					angular.copy(res.user, users.following[index]);
				})
			}
		});
	}
	
	users.getUser = function(username) {
		return $http.get('/users/'+username).success(function(data){
			var blob = FileService.b64toBlob([data.avatar], "image/jpeg");
			var objUrl = URL.createObjectURL(blob);
			data.user.avatar = objUrl;
			return data;
		});
	}
	
	users.followUser = function(user) {
		if(user.username) username = user.username;
		else username = user;
		return $http.put('/users/'+username+'/follow', auth.currentUser, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	users.unfollowUser = function(user) {
		return $http.put('/users/'+user.username+'/unfollow', auth.currentUser, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}

	users.changeAvatar = function(image) {
		FileService.uploadImage(image).success(function(data) {
			return $http.put('/users/'+auth.currentUsername()+'/avatar', {image: data}, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data) {
				return data;
			})
		}).error(function(err) {
			console.log(err);
		});
	}
	
	users.resetAvatar = function() {
		return $http.post('/users/'+auth.currentUsername()+'/reset_avatar', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data) {
			return data;
		}).error(function(err) {
			console.log(err);
		})
	}
	
	users.updateProfile = function(user) {
		return $http.post('/users/'+auth.currentUsername()+'/update', user, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	users.addExp = function(points) {
		return $http.put('/users/'+auth.currentUsername()+'/exp', {exp: points}, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	users.addBadge = function(badge) {
		return $http.post('/users/'+auth.currentUsername()+'/courses/' + badge.course._id + '/badges', badge, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	users.addLanguage = function(language) {
		return $http.post('/users/'+auth.currentUsername()+'/languages', language, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	users.updateLanguage = function(language) {
		return $http.post('/users/'+auth.currentUsername()+'/languages/update', language, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		})
	}
	
	return users;
}])