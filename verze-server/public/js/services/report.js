angular.module('App').factory('report', ['$http', 'auth', function($http, auth){
	var r = {};
	
	r.reportAProblem = function(problem) {
		return $http.post('/report/'+auth.currentUsername(), problem, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			return data;
		});
	}
	
	return r;
}])