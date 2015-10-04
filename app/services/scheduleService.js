tomisModule.service('scheduleService', [
	'$http',
	'$q',
	function($http, $q) {

		/**
		 * Call rest schedules service search
		 * used by the Scheduler Kiosk
		 * 
		 * @param data - JSON Object - The criteria object
		 * @returns deferred.promise
		 */
		this.search = function(data) {
			var deferred = $q.defer();
			$http.post("/tomis/rest/schedules/search", data, {})
			
			.success(function(response, status, headers, config) {
				console.log('Successfully returned from server with status=', status);
				deferred.resolve(response);
				
			}).error(function(response, status, headers, config) {
				console.error('Saving form failed! Status=', status);
				deferred.reject();
			});
			return deferred.promise;			
		};

		/**
		 * Call rest schedules service filter (the word "search was already used by me)
		 * used by the Scheduler Monthly and weekly calendar view
		 * 
		 * @param data - JSON Object - The criteria object
		 * @returns deferred.promise
		 */
		this.filter = function(data) {
			var deferred = $q.defer();
			$http.post("/tomis/rest/schedules/filter", data, {})
			
			.success(function(response, status, headers, config) {
				console.log('Successfully returned from server with status=', status);
				deferred.resolve(response);
				
			}).error(function(response, status, headers, config) {
				console.error('Saving form failed! Status=', status);
				deferred.reject();
			});
			return deferred.promise;			
		};

	}]
);