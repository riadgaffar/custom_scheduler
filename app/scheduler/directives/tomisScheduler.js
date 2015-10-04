var tomisModule = angular.module("TomisModule", ['ui.bootstrap'
    , 'ui.select' // Typeahead
    , 'ngSanitize' // ui.select dependency
    , 'toaster' //Toaster popup
    , 'ngMessages'
    , 'ngAnimate'
    , 'ngRoute'
    , 'ui.calendar'
    , 'ui.grid'
    , 'ui.grid.edit'
    , 'mgcrea.ngStrap'
    , 'Scope.safeApply'
]);


tomisModule.filter('leadingZero', function () {
    return function (input, size) {
        var zero = (size ? size : 4) - input.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + input;
    }
})
    .directive('tomisScheduler', [function () {
        return {
            templateUrl: 'app/scheduler/views/tomisSchedulerMain.html'
        };
    }])
    .controller('tomisSchedulerController', [
        '$scope',
        '$compile',
        '$timeout',
        '$filter',
        '$popover',
        'uiCalendarConfig',
        'tomisSchedulerFactory',
        // 'tomisScheduleFactory',
        function ($scope, $compile, $timeout, $filter, $popover, uiCalendarConfig,
                  tomisSchedulerFactory) //, tomisScheduleFactory)
        {
            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();
            var currentDates = [];
            var startCalDate = null;
            var endCalDate = null;
            var scheduleDateFormat = 'YYYY-MM-DD';

            var initFields = function () {
                $scope.msn = ''; //tomisSchedulerFactory.getRandomMissionNumber(8);
                $scope.namedOperation = '';
                $scope.missionCategory = '';
                $scope.missionType = '';
                $scope.subType = '';
                $scope.missionDescription = '';
                $scope.startDate = null;
                $scope.endDate = null;
                $scope.headerTitle = "Scheduling - Calendar";
            };

            // var initalizeScheulerLovs = function() {
            //   tomisScheduleFactory.initializeScheduleLovs();
            // }

            /* reFetch events by calendar*/
            var reFetchAllEvents = function (calendar) {
                var date_str = moment($scope.selected_date).format('YYYY-MM-DD');
                $timeout(function () {
                    if (uiCalendarConfig.calendars[calendar]) {
                        uiCalendarConfig.calendars[calendar].fullCalendar('refetchEvents');
                        $scope.todaysEvents = _.filter($scope.events, function (event) {
                            return moment(event.start).format('YYYY-MM-DD') === date_str;
                        });
                    }
                });
            };

            var reFetchAllCalendarEvents = function () {
                _.each($scope.calendars, function (calendar) {
                    console.info('***refetching calendar', calendar._id);
                    uiCalendarConfig.calendars[calendar._id].fullCalendar('rerenderEvents');
                })
                // var date_str = moment($scope.selected_date).format('YYYY-MM-DD');
                // $timeout(function () {
                //   if (uiCalendarConfig.calendars[calendar]) {
                //     uiCalendarConfig.calendars[calendar].fullCalendar('refetchEvents');
                //     $scope.todaysEvents = _.filter($scope.events, function(event) {
                //       return moment(event.start).format('YYYY-MM-DD') === date_str;
                //     });
                //   }
                // });
            };

            /* populate calendars */
            var populateCalendars = function (year, month, date, count) {
                /******************************************************
                 *
                 * TODO: Optimize this so clandedar starts on today's date
                 * changing view back to previous week seems to change the
                 * monthly view to previous month. Monthly view should
                 * persist back to current month.
                 *
                 *******************************************************/
                //var t_defaultDate = count === 0 ? moment(new Date()).format('YYYY-MM-DD') : year + '-' + month + '-' + '01';
                var t_defaultDate = year + '-' + month + '-' + '01';

                $scope.calendars.push({
                    _id: 'calendar_' + count,
                    year: year,
                    month: month,
                    date: date,
                    calendarConfig: {
                        height: 'auto',
                        defaultDate: t_defaultDate,
                        //editable: true,
                        timezone: $scope.currecnt_timezone,
                        stick: true,
                        header: {
                            center: 'title',
                            right: 'next',
                            left: 'prev'
                        },
                        // eventLimit: true, // for all non-agenda views
                        // views: {
                        //     agenda: {
                        //         eventLimit: 0 // adjust to 6 only for agendaWeek/agendaDay
                        //     }
                        // },
                        dayClick: function (date, jsEvent, view) {
                            // fullcalendar hide events into next month for month view only
                            // dictated by design.
                            // fullcalendar hide events into next month for month view only
                            // dictated by design.
                            if (view.name === 'month' && date.month() !== view.start.month() + 1) {
                                return false;
                            }
                            ;
                            $scope.daySelected = true;
                            var selected_date_string = date.format();
                            var selected_month = $filter('leadingZero')(date.month() + 1, 2);
                            var selected_cal = _.find($scope.calendars, {'month': selected_month});

                            $scope.selected_date = $filter('date')(selected_date_string, 'MMM dd yyyy');
                            if (selected_cal) {
                                var events = uiCalendarConfig.calendars[selected_cal._id].fullCalendar('clientEvents', function (event) {
                                    return event.start.format() === selected_date_string;
                                });
                                console.info('num events', _.size(events));
                                // For IE limitations we have to fire this event so rendering
                                // of the events and counts are done gracefully.
                                var element = angular.element(jsEvent.target);
                                var dayEvents = {
                                    allEvents: events,
                                    elem: element,
                                    clickedDate: date
                                }
                                $scope.$broadcast('selectedDateEvents', dayEvents);
                                //$scope.$broadcast('selectedDateEvents', events);
                                //var dayElement = angular.element('.fc-day[data-date="' + date.format(scheduleDateFormat) + '"]');

                                //  var myPopover = $popover(element, _.extend({
                                //      container: 'body', //element.parent(),
                                //      html: true,
                                //      templateUrl: 'script/schedule/scheduler/views/partials/popover.html',
                                //      autoClose: 'true'
                                //  }));
                                //  myPopover.$promise.then(function(po) {
                                //    console.info('***po', po);
                                //    myPopover.show();
                                //  });
                                //  myPopover.$scope.selectedDate = dayEvents.clickedDate;
                                //  myPopover.$scope.po_id = 'po-' + date.format('YYYY-MM-DD');
                                //  myPopover.$scope.todaysEvents = dayEvents.allEvents;
                                //  myPopover.$scope.closeit = function() {
                                //    angular.element('#' + myPopover.$scope.po_id).remove();
                                //    angular.element('#' + myPopover.$scope.po_id).hide();
                                //  }
                            }
                        },
                        eventRender: function (event, element, view) {
                            element.addClass('clickThrough');
                            // fullcalendar hide events into next month for month view only
                            // dictated by design.
                            if (view.name === 'month' && event.start.month() !== view.start.month() + 1) {
                                return false;
                            } else {
                                element.attr('date-num', event.start.format('YYYY-MM-DD'));
                                element.find('.fc-content').append('<br/>' +
                                    '<span class="fc-title">' +
                                    _.trunc(event.missionId) +
                                    '</span>' +
                                    '<br/>' +
                                    '<span class="fc-title">' +
                                    _.trunc(event.missionDsc, 15) +
                                    '</span>');
                                //element.find('.fc-content').addClass('hoverable');
                                $compile(element)($scope);
                            }
                        },
                        eventAfterAllRender: function (view) {
                            var nextButton = angular.element('.fc-next-button');
                            var prevButton = angular.element('.fc-prev-button');

                            if (view.name === 'month') {
                                nextButton.addClass('hidden');
                                prevButton.addClass('hidden');
                                //$scope.$broadcast('updatedCount', view);
                                var range = moment.range(view.start, view.end);
                                range.by('day', function (moment) {
                                    var dateNum = moment.format('YYYY-MM-DD');
                                    var dayElement = angular.element('.fc-day[data-date="' + dateNum + '"]');
                                    var eventContainer = angular.element('.fc-event-container');
                                    var dayNumber = angular.element('.fc-day-number');
                                    dayElement.addClass('hoverable');
                                    eventContainer.addClass('hoverable');
                                    dayNumber.addClass('hoverable');
                                    var eventsElements = angular.element('.fc-day-grid-event[date-num=' + dateNum + ']');
                                    var eventCount = _.size(angular.element('.fc-event[date-num="' + dateNum + '"]')); //.length;
                                    if (eventCount > 2) {
                                        var eventCountElem =
                                            '<span class="col-md-3 col-md-offset-3 event-count">' +
                                            '<i>' + eventCount + '</i>' +
                                            '</span>';
                                        //eventsElements.parent().empty();
                                        //dayElement.append(html);
                                        dayElement.empty().append($compile(eventCountElem)($scope));
                                        eventsElements.parent().empty();
                                    } // if count
                                });
                            } else {
                                prevButton.removeClass('hidden');
                                nextButton.removeClass('hidden');
                            } //if else month
                        }
                    }
                }); // push
            };

            // var fetchSchedules = function() {
            //     //map the criteria query to the server side dto
            //     //displayLoadingToaster();
            //     initalizeScheulerLovs();
            //     initFields();
            //     /************************************************
            //     * TODO Service provides end date, start date is
            //     * today. So hookit up when service is avialble.
            //     * Today will be set to 2015-08-01 for now.
            //     **************************************************/
            //     $scope.lovData.startDt = moment('2015-08-01');
            //     //$scope.lovData.startDt = moment('2015-09-01');
            //     $scope.lovData.endDt = moment('2016-02-08');
            //
            //     tomisScheduleFactory.getFilteredDtos().then(function(response) {
            //       _.each(response, function(sched) {
            //         sched.start = moment(sched.departureDt).format('YYYY-MM-DD');
            //         sched.end = moment(sched.departureDt).format('YYYY-MM-DD'); // not allowing spanning across days
            //         sched.title = sched.missionNbr;
            //         sched.backgroundColor = tomisSchedulerFactory.getRandomBg();
            //       });
            //       console.info('***tomisScheduleFactory response', angular.toJson(response, 'pretty'));
            //       $scope.events = angular.copy(response);
            //       $scope.eventSources = [$scope.events];
            //       $timeout(function() {
            //         createCalendars();
            //       });
            //       $scope.isToasterUnderlayDisplayed = false;
            //     },  function(error){
            //
            //     });
            // };

            /* Recusrsively creates dates in range for use later */
            var createDatesInRange = function (start_d, end_d) {
                if (start_d < end_d) {
                    currentDates.push(start_d);
                    start_d.add(1, 'day');
                    createDatesInRange(start_d, end_d);
                }
            };

            /* create calendars based on dates in events */
            var createCalendars = function () {
                cal_count = 0;
                var dates = [];
                if (_.size($scope.events) > 0) {
                    _.each($scope.events, function (e) {
                        var t_year = e.start.split('-')[0];
                        var t_month = e.start.split('-')[1];
                        //var t_date =  e.start.split('-')[2]; // don't need date for now
                        if (!_.find(dates, {'year': t_year, 'month': t_month}) && !_.isEmpty(t_month)) {
                            dates.push({
                                'year': t_year,
                                'month': t_month,
                                'date': '01'
                            });
                        }
                    });

                    var sorted_by_years_months = _.sortByOrder(dates, ['year', 'month'], ['asc', 'asc']);
                    var fe = _.first(sorted_by_years_months);
                    var le = _.last(sorted_by_years_months)

                    // var startDate = moment(fe.year.toString() + '-' +
                    //                   fe.month.toString() + '-' +
                    //                   fe.month.toString());
                    // var endDate =  moment(le.year.toString() + '-' +
                    //                 le.month.toString() + '-' +
                    //                 le.month.toString());

                    // var startDate = moment('2015-07-01');
                    // var endDate = moment('2016-02-01');


                    console.info('***STARTDATE', $scope.calStartDate.format('YYYY-MM-DD'), $scope.calStartDate);
                    console.info('***ENDDATE', $scope.calEndDate.format('YYYY-MM-DD'), $scope.calEndDate);
                    startCalDate = angular.copy($scope.calStartDate);
                    endCalDate = angular.copy($scope.calEndDate);
                    moment.range($scope.calStartDate, $scope.calEndDate).by('month', function (moment) {
                        populateCalendars(moment.year().toString(), $filter('leadingZero')(moment.month() + 1, 2), '01', cal_count);
                        cal_count++;
                    });
                } //if
            };


            var showHideEvents = function (show) {
                _.each(angular.element('.fc-event'), function (el) {
                    var dn = angular.element(el).attr('date-num');
                    // .fc-other-month spans to next or previous months
                    // we don't want counts showing for those cells
                    var dayEl = angular.element('.fc-day[data-date="' + dn + '"]').not('.fc-other-month');
                    var evElmnts = angular.element('.fc-day-grid-event[date-num=' + dn + ']');
                    var ec = _.size(angular.element('.fc-event[date-num="' + dn + '"]')); //.length;
                    if (dn && show) { // TODO: Fix the other cell
                        var ecElem =
                            '<span class="col-md-3 col-md-offset-3 event-count">' +
                            '<i>' + ec + '</i>' +
                            '</span>';
                        dayEl.empty().append($compile(ecElem)($scope));
                        evElmnts.parent().addClass('hidden');
                    }
                    ;
                    if (!show) {
                        evElmnts.parent().removeClass('hidden');
                        dayEl.empty();
                    }
                });
            };

            initFields();

            $scope.calendars = [];
            $scope.todaysEvents = [];
            $scope.isMissionCollapsed = false;
            $scope.isAssetCollapsed = false;
            $scope.isNonAssetCollapsed = false;

            $scope.today = {
                day: moment(date).format('DD'),
                monthAbr: moment(date).format('MMM'),
                year: moment(date).format('YYYY')
            };

            $scope.view = {
                isMonth: true
            };

            $scope.currecnt_timezone = 'UTC';
            $scope.newSchedule = false;
            $scope.daySelected = false;
            $scope.template = 'scheduleForm.html';

            // $scope.lovList = tomisScheduleFactory.lovList;
            $scope.lovData = tomisSchedulerFactory.lovData;
            $scope.lovData.booGcsLov = tomisSchedulerFactory.cannedGcsLov;

            // for offline use only
            $scope.events = tomisSchedulerFactory.cannedEvents;
            $scope.eventSources = [$scope.events];

            $scope.getLovValueClass = function (selClass) {
                //return tomisScheduleFactory.getLovValueClass(selClass);
            };
            $scope.getPlaceholderText = function (param) {
                //return tomisScheduleFactory.getPlaceholderText(param, $scope.lovList);
            };

            /****DATE PICKER OPTIONS*****/
            $scope.dateOptions = {
                formatYear: 'yyyy',
                startingDay: 1
            };
            $scope.datePickerFormat = 'yyyy-MM-dd';
            $scope.datePickerStatus = {
                startOpened: false,
                endOpened: false
            };

            $scope.toggleMin = function () {
                $scope.minDate = $scope.minDate ? null : date;
            };
            $scope.toggleMin();
            $scope.openStartDate = function ($event) {
                $scope.datePickerStatus.startOpened = true;
            };
            $scope.openEndDate = function ($event) {
                $scope.datePickerStatus.endOpened = true;
            };
            /***********************************/
            // Date click event handler for updating DOM
            // $scope.$on('selectedDateEvents', function(event, data) {
            //   $timeout(function() {
            //     $scope.todaysEvents = data;
            //     if (!_.size($scope.todaysEvents) && $scope.scheduleSelected) {
            //       $scope.scheduleSelected = false;
            //       $scope.slideEditPane('showview');
            //     }
            //     initFields();
            //   });
            // });
            $scope.$on('selectedDateEvents', function (event, data) {
                $timeout(function () {
                    $scope.todaysEvents = data.allEvents;
                    console.info('$scope.todaysEvents', $scope.todaysEvents);
                    if (!_.size($scope.todaysEvents) && $scope.scheduleSelected) {
                        $scope.scheduleSelected = false;
                        $scope.formFields = {};
                        $scope.missionFields = {};
                        $scope.assetFields = {};
                        //$scope.slideEditPane('showview');
                    }
                    var myPopover = $popover(data.elem, _.extend({
                        container: 'body', //element.parent(),
                        html: true,
                        templateUrl: 'app/scheduler/views/partials/popover.html',
                        autoClose: 'true'
                    }));
                    myPopover.$promise.then(function () {
                        myPopover.show();
                    });
                    myPopover.$scope.selectedDate = data.clickedDate.format('MMM Do YYYY');
                    myPopover.$scope.po_id = 'po-' + data.clickedDate.format('YYYY-MM-DD');
                    myPopover.$scope.todaysEvents = data.allEvents;
                    myPopover.$scope.closeit = function () {
                        angular.element('#' + myPopover.$scope.po_id).remove();
                        angular.element('#' + myPopover.$scope.po_id).hide();
                    };
                    myPopover.$scope.calEventClick = function (calEvent) {

                        //$scope.formFields = _.omit(calEvent, "_id", "backgroundColor", "stick", "source", "className", "allDay", "_allDay", "_start", "_end");

                        //$scope.formFields = calEvent;
                        console.info('****calEvent', calEvent);
                        $scope.missionFields = _.pick(calEvent, 'title', 'missionId', 'missionNbr', 'missionDsc', 'gcs', 'frequencyCd', 'start', 'end');
                        $scope.assetFields = _.pick(calEvent, 'assetNbr', 'boo', 'briefEndDt', 'briefStartDt', 'personnelFullName', 'totalPersons');
                        $scope.nonAssetFields = "NOT AVAILABLE";
                        //console.info('****calEvent', calEvent);
                        $scope.scheduleSelected = true;
                        //$scope.daySelected = false;
                        // if ($scope.template !== $scope.templates[1]) {
                        //   $scope.template = $scope.templates[1];
                        // }
                        initFields();
                        //$scope.slideEditPane('updateview');


                    };


                    initFields();
                });
            });


            /*****GRID OPTIONS********************************
             * TODO: change/update when data from service is available.
             * Also grid columns and data will be dynamic based
             * on BOO and/or agency; update UI mechanism when
             * ready.
             **************************************************/
            $scope.gridOptions = tomisSchedulerFactory.gridOptions;
            /*************************************************/

            $scope.slideEditPane = function (view) {
                /************************************
                 * TODO: Optimize this.
                 ************************************/
                var calendar_pane = angular.element("#calendar-pane");
                var midlle_pane = angular.element("#middle-pane");
                var right_pane = angular.element("#right-pane");
                var ec_btn = angular.element('#collapse-expand-btn');
                console.info('view', view);
                switch (view) {
                    case 'updateview':
                        if (midlle_pane.hasClass('col-xs-4')) {
                            midlle_pane.toggleClass('col-xs-4 col-xs-3');
                        }
                        if (calendar_pane.hasClass('col-xs-8')) {
                            calendar_pane.toggleClass('col-xs-8 col-xs-5');
                        }
                        break;
                    case 'showedit':
                        ec_btn.toggleClass("fa fa-arrow-circle-right fa fa-arrow-circle-left");
                        calendar_pane.toggleClass('col-xs-5 col-xs-4');
                        right_pane.toggleClass("col-xs-4 col-xs-5 toggle-animation");
                        showHideEvents(ec_btn.hasClass('fa-arrow-circle-right'));
                        $scope.showGrid = ec_btn.hasClass('fa-arrow-circle-right') ? true : false;
                        console.info('****$scope.showGrid', $scope.showGrid);
                        break;
                    case 'showview':
                        if (_.size($scope.todaysEvents) === 0 &&
                            midlle_pane.hasClass('col-xs-3') &&
                            right_pane.hasClass('col-xs-5') &&
                            ec_btn.hasClass('fa-arrow-circle-right')) {
                            showHideEvents(false);
                            right_pane.toggleClass("col-xs-5 col-xs-4");
                            calendar_pane.toggleClass('col-xs-4 col-xs-8');
                            midlle_pane.toggleClass("col-xs-3 col-xs-4");
                            angular.element(".rs").toggleClass("fa fa-arrow-circle-left fa fa-arrow-circle-right");
                        } else {
                            midlle_pane.toggleClass("col-xs-3 col-xs-4");
                            calendar_pane.toggleClass('col-xs-5 col-xs-8');
                        }
                        break;
                }
            };

            $scope.getEventBg = function (event) {
                return event.backgroundColor;
            }
            $scope.templates = [
                {name: 'blank', url: "app/scheduler/views/partials/blankTemplate.html"},
                {name: 'currentSchedule.html', url: "app/scheduler/views/partials/scheduleTemplate.html"},
                {name: 'newSchedule.html', url: "app/scheduler/views/partials/newScheduleTemplate.html"},
                {name: 'details', url: "app/scheduler/views/partials/scheduleDetailsTemplate.html"},
                {name: 'navbar', url: "app/scheduler/views/partials/navigationBar.html"}
            ];
            /*************************************************
             * TODO: Need to do this more efficiently
             *************************************************/
                //$scope.template = $scope.templates[0];
            $scope.detailsTemplate = $scope.templates[3];
            $scope.navbarTemplate = $scope.templates[4];

            var dateToString = function (key, val) {
                if (key === 'start' || key === 'end') {
                    return moment(val).format('YYYY-MM-DD');
                }
                return val;
            }

            $scope.constructEventTemplate = function (calEvent) {
                calEvent = _.omit(calEvent, "backgroundColor", "stick", "source", "className", "allDay", "_allDay", "_start", "_end");
                var parsed = [];
                parsed.push(_.reduce(calEvent, function (result, val, key) {
                    result = _.assign({'title': _.startCase(key)}, {'value': dateToString(key, val)});
                    return result;
                }, {}));
                console.info(parsed);
                return parsed;
            };

            $scope.calEventClick = function (calEvent) {
                $scope.scheduleSelected = true;
                //$scope.daySelected = false;
                if ($scope.template !== $scope.templates[1]) {
                    $scope.template = $scope.templates[1];
                }
                initFields();
                $scope.slideEditPane('updateview');
                //$scope.todaysEvents = [];
                //$scope.selected_date = '';
                $scope.msn = calEvent.title;
                $scope.namedOperation = calEvent.namedOperation;
                $scope.missionCategory = calEvent.missionCategory;
                $scope.missionType = calEvent.missionType;
                $scope.subType = calEvent.subType;
                $scope.missionDescription = calEvent.missionDescription;
                $scope.startDate = moment(calEvent.start).format('YYYY-MM-DD');
                $scope.endDate = calEvent.end ? calEvent.end.format() : moment(calEvent.start).format('YYYY-MM-DD');
            };

            /* add custom event*/
            $scope.addEvent = function () {
                initFields();
                $scope.newSchedule = true;
                $scope.template = $scope.templates[1];
            };

            $scope.addNewSchedule = function (agency) {
                initFields();
                $scope.newSchedule = true;
                $scope.template = $scope.templates[2];
                switch (agency) {
                    case 'uas':
                        $scope.headerTitle = "Scheduling - Add Schedule (UAS)";
                        break;
                    case 'air':
                        $scope.headerTitle = "Scheduling - Add Schedule (Air)";
                        break;
                    case 'marine':
                        $scope.headerTitle = "Scheduling - Add Schedule (Marine)";
                        break;
                }
                ;
                angular.element("#right-pane").removeClass("col-xs-4");
            };

            /* cancel event */
            $scope.cancelSchedule = function () {
                initFields();
                $scope.newSchedule = false;
                //$scope.template = $scope.templates[0];
            };
            /* save event */
            $scope.saveSchedule = function () {
                /*************************************************************
                 *
                 * TODO: update this
                 *
                 *************************************************************/
                alert("Saving has been disabled for now. Stay tuned for update.")
                return;

                var t_start = $filter('date')($scope.startDate, 'yyyy-MM-dd');
                var t_end = $filter('date')($scope.endDate, 'yyyy-MM-dd');
                var existing_event = _.find($scope.events, {'title': $scope.msn});
                var eventBgColor = tomisSchedulerFactory.getRandomBg();

                if (existing_event) {
                    var index = _.findIndex($scope.events, {'title': existing_event.title});
                    eventBgColor = angular.copy(existing_event.backgroundColor);
                    $scope.remove(index);
                } else {
                    $scope.msn = tomisSchedulerFactory.getRandomMissionNumber(8);
                }
                $scope.events.push({
                    backgroundColor: eventBgColor,
                    title: $scope.msn,
                    start: moment($scope.startDate).format('YYYY-MM-DD'), //$scope.startDate,
                    end: moment($scope.endDate).format('YYYY-MM-DD'), //$scope.endDate,
                    namedOperation: $scope.namedOperation,
                    missionCategory: $scope.missionCategory,
                    missionType: $scope.missionType,
                    subType: $scope.subType,
                    missionDescription: $scope.missionDescription,
                    stick: true
                    //timezone:   $scope.currecnt_timezone
                });
                $scope.selected_date = $filter('date')($scope.startDate, 'MMM dd yyyy');

                if ($scope.newSchedule) {
                    $scope.newSchedule = false;
                }
                //$scope.template = $scope.templates[0];
                reFetchAllEvents(_.find($scope.calendars, {'month': t_start.split('-')[1]})._id);
                /*********************************************************
                 * TODO: refresh counts in monthly view for all available calendars
                 *********************************************************/
                initFields();
            };

            /* remove event */
            $scope.remove = function (index) {
                $scope.events.splice(index, 1);
            };

            /* Change View */
            $scope.changeView = function (view, calendar) {
                $scope.view.isMonth = view === 'month';
                var firstCal = uiCalendarConfig.calendars[$scope.calendars[0]._id];
                console.info('$scope.view.isMonth', $scope.view.isMonth, view);
                if (view === 'agendaDay' || view === 'agendaWeek') {
                    firstCal.fullCalendar('today');
                } else {
                    console.info('***defaultDate', firstCal.fullCalendar('getDate').format('YYYY-MM-DD'));
                    console.info('***initialDefaultDate', $scope.calStartDate.format('YYYY-MM-DD'));
                    firstCal.fullCalendar('gotoDate', $scope.calStartDate.format('YYYY-MM-DD'));
                }
                firstCal.fullCalendar('changeView', view);

            };

            /* Change View */
            $scope.renderCalender = function (calendar) {
                $timeout(function () {
                    if (uiCalendarConfig.calendars[$scope.calendars]) {
                        uiCalendarConfig.calendars[calendar].fullCalendar('render');
                    }
                });
            };

            //fetchSchedules();
            // for offline use only
            initFields();
            // TODO: retrieved from the service, change it when avialble.
            $scope.calStartDate = moment('2015-07-01');
            $scope.calEndDate = moment('2016-02-01');
            createCalendars();
        }]);
