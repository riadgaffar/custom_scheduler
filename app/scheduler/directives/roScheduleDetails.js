tomisModule.directive('tomisRoSchedulerDetails', [ '$templateRequest', '$http', '$compile', '$timeout',
  function($templateRequest, $http, $compile, $timeout) {
    var templateUrl = 'app/scheduler/views/partials/roScheduleDetails.html';
    //we keep both http and template request just in case
    var doTemplateRequest = function(scope, element) {
      $templateRequest(templateUrl).then(function(response){
        $timeout(function() {
          element.empty().append($compile(response)(scope));
        });
      });
    };
    var doHttpTemplateRequest = function(scope, element) {
      $http.get(templateUrl).then(function(response){
        $timeout(function() {
          element.html($compile(response.data)(scope));
        });
      });
    };
    return {
      restrict: 'EA',
      scope: {
        data:'='
      },
      replace: true,
      link: function(scope, element, attrs) {
        scope.$watch('data', function(newData, oldData) {
          var scheduleObj = _.reduce(newData,
            function(res, val, key) {
              res[key] = _.isNull(val) ? 'N/A' : val;
              return res;
          }, {});
          scope.scheduleData = _.reduce(scheduleObj, function(result, val, key) {
            if (val && key && key !== 'label') {
              val = _.isEmpty(val) ? 'N/A' : val;
              result.push(
                { 'label': _.startCase(key) },
                { 'value': val }
              );
            }
            return result;
          }, []);
          console.info('****Clicked RO scheduleData', scope.scheduleData);
          //doTemplateRequest(scope, element);
          doHttpTemplateRequest(scope, element);
        });
      } // link
    }; // return
}])
