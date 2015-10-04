tomisModule.directive('tomisSchedulerDetails', [ '$compile', '$timeout', function($compile, $timeout) {
  return {
    restrict: 'EA',
    scope: {
      event:'='
    },
    replace: true,
    link: function(scope, element, attrs) {
        var eventTemplate =
          '<section class="col-xs-6 no-padding" ng-repeat="parsed_event in eventStuff track by $index">' +
            '<span class="pull-left">{{parsed_event.label}} {{parsed_event.value}}</span>' +
          '</section>';
      var eventElement = angular.element(eventTemplate);
      //scope = element.scope().$new();
      var parseDate = function(key, val) {
        if (key === 'start' || key === 'end') {
          return moment(val).format('YYYY-MM-DD');
        }
        return val;
      }

      scope.$watch('event', function(newEvent, oldEvent) {
        console.info('***newEvent', newEvent);
        newEvent = _.omit(newEvent, "_id", "backgroundColor", "stick", "source", "className", "allDay", "_allDay", "_start", "_end", "source");
        /**********************************************************
        * TODO: Optimize this
        **********************************************************/
        var newEvent = _.reduce(newEvent, function(res, val, key) {
          if (_.isNull(val) || _.isArray(val) && _.isEmpty(val)) {
            val = 'N/A';
          }
          res[key] = val;
          res['label'] = _.startCase(key);
          return res;
        }, {});

        scope.eventStuff = [];
        //scope.eventStuff.push(newEvent);

        scope.eventStuff = _.reduce(newEvent, function(result, val, key) {
          if (val && key && key !== 'label') {
            result.push(
              { 'label': _.startCase(key) },
              { 'value': val } //parseDate(key, val) }
            );
          }
          return result;
        }, []);
        $timeout(function() {
          element.html(eventElement);
          $compile(element.contents())(scope);
        });
      });
    }
  };
}])
