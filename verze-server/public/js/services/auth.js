angular.module('App').factory('auth', ['$http', '$window', 'FileService', function($http, $window, FileService){
	var auth = {};

	auth.currentUser = {};

	auth.saveToken = function (token){
		$window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function (){
		return $window.localStorage['flapper-news-token'];
	};

	auth.saveUser = function (user){
		$window.localStorage['user-info'] = JSON.stringify(user);
	};
	
	auth.saveUserAll = function (hasAll){
		$window.localStorage['user-has-all'] = hasAll;
	};
	
	auth.getUserAll = function() {
		return $window.localStorage['user-has-all'];
	}

	auth.getUser = function (noBlob){
		var user = JSON.parse($window.localStorage['user-info']);
		if(noBlob) return user;
		var blob = FileService.b64toBlob([user.avatar], "image/jpeg");
		var objUrl = URL.createObjectURL(blob);
		user.avatar = objUrl;
		return user;
	};

	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUsername = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user){
		var username = user.username;
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
			auth.saveUserAll(false);
		});
	};

	auth.whoAmI = function(username){
		return $http.get('/users/'+ username).success(function(data){
			data.user.avatar = data.avatar;
			auth.saveUser(data.user);
			
			var blob = FileService.b64toBlob([data.avatar], "image/jpeg");
			var objUrl = URL.createObjectURL(blob);
			data.user.avatar = objUrl;
			auth.currentUser = data.user;

			return data;
		});
	};

	auth.logIn = function(user){
		var username = user.username;
		return $http.post('/login', user).error(function(err) {
			console.log(err);
		}).success(function(data){
			auth.saveToken(data.token);
			auth.saveUserAll(false);
		});
	};

	auth.logOut = function(){
		$window.localStorage.removeItem('flapper-news-token');
	};
	
	auth.checkPass = function(user) {
		return $http.post('/check', {password: user.oldpassword, username: auth.currentUsername()}).success(function(data) {
			return data;
		});
	}

	auth.changePass = function(password) {
		return $http.post('/users/'+ auth.currentUsername() + '/password', {password: password}).success(function(data) {
			console.log("successfully changed password");
		});
	};

	return auth;
}]);