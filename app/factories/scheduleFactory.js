/************************************************************************
*
* Schedule factory that can be used for Scheduler, Kiosk and matrix
*
*************************************************************************/
tomisModule.factory('tomisScheduleFactory', [
	'$q',
	'$timeout',
	'lovFactory',
	'LOV_DEFINITIONS',
	'scheduleKioskSearchCriteriaFactory',
	'scheduleService',
	function($q, $timeout, lovFactory, LOV_DEFINITIONS,
		scheduleKioskSearchCriteriaFactory, scheduleService)
		{
			var factory = {};
			var deferred = $q.defer();
			factory.lovList = [];
			factory.dtoResponse = {};

			factory.lovData = {
				booGcsCd: "", //The Base of Operation Code
				timeZone: "",
				gcsInd: false,
				localInd: false,
				startDt: null,
				endDt: null				
			};

			factory.initializeScheduleLovs = function() {
				var booGcsLovJson = LOV_DEFINITIONS.BASE_OF_OPERATION_GCS_CODE;
				booGcsLovJson.extraParams.push({'name':'searchInd','value':'Y'});
				factory.lovList.push(LOV_DEFINITIONS.TOMIS_PERSONNEL_BY_AOR_CODE,
					booGcsLovJson
				);
				lovFactory.populateLovs(factory.lovList);
				factory.lovData.booGcs = tomis.userSecurity.baseOfOperation.baseOfOpertnCd;
				if ("Y" === tomis.userSecurity.baseOfOperation.daylightSavingsIndicator) {
					factory.lovData.timeZone = tomis.userSecurity.baseOfOperation.javaTimeZoneLov.daylitTmZoneId.timeZoneId;
				} else {
					factory.lovData.timeZone = tomis.userSecurity.baseOfOperation.javaTimeZoneLov.stdTmZoneId.timeZoneId;
				}
			};
			factory.getLovValueClass = function(selClass) {
				return lovFactory.getLovValueClass(selClass);
			};
			factory.getPlaceholderText= function(param, lovList) {
				return lovFactory.getPlaceholderText(param, lovList);
			};
			factory.getFilteredDtos = function() {
				//map the criteria query to the server side dto
				factory.lovData.booGcsCd = _.isEmpty(factory.lovData.booGcsCd) ? 'HDQ' : 	factory.lovData.booGcsCd;
				var criteria = _.pick(factory.lovData, 'booGcsCd', 'gcsInd', 'startDt', 'endDt');
				console.info('***criteria', criteria);
				return scheduleService.filter(criteria);
			};
			factory.asyncGetSchedules = function(schedules) {
				$timeout(function() {
					deferred.resolve(schedules);
				});
				return deferred.promise;
			};

			return factory;
		}
	]
);
