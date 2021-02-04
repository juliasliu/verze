angular.module('App').directive('onFinishRender', function($timeout) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			if(scope.$last == true) {
				$timeout(function() {
					scope.$emit(attr.onFinishRender);
				});
			}
		}
	};
})

.directive('prettySubmit', function () {
    return function (scope, element, attr) {
        var textFields = $(element).children('input');

        $(element).submit(function(event) {
            event.preventDefault();                
            textFields.blur();
        });
    };
})

.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeHandler);
    }
  };
})