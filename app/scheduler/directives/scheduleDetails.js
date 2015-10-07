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
      scope = element.scope().$new();
      var parseDate = function(key, val) {
        if (key === 'start' || key === 'end') {
          return moment(val).format('YYYY-MM-DD');
        }
        return val;
      }

      var unbindWatcher = scope.$watch('event', function(newEvent, oldEvent) {
        newEvent = _.omit(newEvent, "_id", "backgroundColor", "stick", "source", "className", "allDay", "_allDay", "_start", "_end");
        console.info('***Clicked days event(s)', angular.toJson(newEvent, 'pretty'));
        /**********************************************************
        * TODO: Optimize this
        **********************************************************/
        var timeFormat = 'HH:mm Z';
        var dateFormat = 'YYYY-MM-DD';
        scope.eventStuff = [];
        var newEvent = _.reduce(newEvent, function(res, val, key) {
          switch(key) {
            case 'start':
              res['scheduleDate'] = moment(val).format(dateFormat);
              break;
            case 'departureDt':
              res['takeOfTime'] = moment(val).format(timeFormat);
              break;
            case 'arrivalDt':
              res['landTime'] = moment(val).format(timeFormat);
              break;
            default:
              res[key] = _.isEmpty(val) ? 'N/A' : val;
              break;
          }
          //res[key] = val;
          res['label'] = _.startCase(key);
          return res;
        }, {});

        // UAS and Non-UAS
        if (newEvent.assetTypeCd === 'UAS' || newEvent.assetTypeCd === 'P3') {
          newEvent = _.pick(newEvent, 'label', 'scheduleDate', 'missionNbr',
            'missionDsc', 'title', 'gcs', 'frequencyCd', 'briefStartDt',
            'briefEndDt', 'takeOfTime', 'landTime', 'handoverCollection');
        } else {
          newEvent = _.pick(newEvent, 'label', 'scheduleDate', 'missionNbr',
            'missionDsc', 'booCd', 'takeOfTime', 'landTime');
        }
        scope.eventStuff = _.reduce(newEvent, function(result, val, key) {
          if (val && key && key !== 'label') {
            result.push(
              { 'label': _.startCase(key) },
              { 'value': val } //parseDate(key, val) }
            );
          }
          return result;
        }, []);
        unbindWatcher();
        $timeout(function() {
          element.html(eventElement);
          $compile(element.contents())(scope);
        });
      });
    }
  };
}])
