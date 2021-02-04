angular.module('App').directive("user", function() {
	return {
		restrict: "E",
	    scope: { text: '@' },
		template: "<div class='user item item-avatar' ng-hide='sameUser && !profileMode'>" +
						"<img ng-src='{{ user.avatar }}'>" +
						"<a ui-sref='me({ username: user.username })'><h2>@{{ user.username }}</h2></a>" +
						"<ul class='languages-list'>" +
							"<li ng-repeat='language in user.languages' ng-click='openLangPopover($event, language)'>" +
								"<img class='lang-thumbnail' ng-src='{{ findLanguage(language.name).image }}'>" +
							"</li>" +
						"</ul>" +
						"<button ng-click='followUser(user)' ng-hide='sameUser || followsUser' class='btn btn-xs btn-primary btn-follow'>Follow <i class='ion-plus'></i></button>" +
						"<button ng-show='followsUser' class='btn btn-xs btn-default btn-follow'>Followed <i class='ion-checkmark'></i></button>" +
						"<div class='mutuals'>{{ numMutualFollowers }} mutuals</div>" +
						"<p>{{ user.caption }}</p>" +
	        	  "</div>",
	      		controller: function($scope, $element) {
	    			$scope.sameUser = $scope.$parent.currentUser.username == $scope.$parent.user.username;
	      			$scope.numMutualFollowers = 0;
	    			$scope.followsUser = $scope.$parent.currentUser.following.map(function(x) {return x._id; }).indexOf($scope.$parent.user._id) != -1;
	    			$scope.followUser = $scope.$parent.$parent.$parent.followUser;
	    			
	    			// find number of mutuals
	    			$scope.user = $scope.$parent.user;
	    			for(var i = 0; i < $scope.$parent.currentUser.following.length; i++) {
	    				for(var j = 0; j < $scope.$parent.user.followers.length; j++) {
	    					var id;
	    					if($scope.$parent.user.followers[j]._id) {
	    						id = $scope.$parent.user.followers[j]._id
	    					} else {
	    						id = $scope.$parent.user.followers[j];
	    					}
	    					if($scope.$parent.currentUser.following[i]._id == id) {
	    						$scope.numMutualFollowers++;
	    						j += $scope.$parent.user.followers.length;
	    					}
	    				}
	    			}
	    		}
	}
})

.directive("thumbnailUser", function() {
	return {
		restrict: "E",
		scope: { text: '@' },
		template: "<div class='thumbnail-user item item-avatar'>" + // ng-hide='currentUser.username == user.username && !profileMode'
						"<img ng-src='{{ user.avatar }}'>" +
						"<a ui-sref='me({ username: user.username })'><h2>@{{ user.username }}</h2></a>" +
						"<div class='mutuals'>{{ numMutualFollowers }} mutuals</div>" +
//						"<p>{{ user.caption }}</p>" +
	        	  "</div>",
	      		controller: function($scope, $element) {
	      			$scope.numMutualFollowers = 0;
	    			
	    			$scope.user = $scope.$parent.user;
	    			for(var i = 0; i < $scope.$parent.currentUser.following.length; i++) {
	    				for(var j = 0; j < $scope.$parent.user.followers.length; j++) {
	    					var id;
	    					if($scope.$parent.user.followers[j]._id) {
	    						id = $scope.$parent.user.followers[j]._id
	    					} else {
	    						id = $scope.$parent.user.followers[j];
	    					}
	    					if($scope.$parent.currentUser.following[i]._id == id) {
	    						$scope.numMutualFollowers++;
	    						j += $scope.$parent.user.followers.length;
	    					}
	    				}
	    			}
	    		}
	}
})