(function(){
	var app = angular.module('app');

	app.service("AnonymousService", [function() {

		var anonymous;
		anonymous =  function() {
			var lastTimeKey, countKey, getCount, setCountToZero, getLastTime, setLastTimeAnonymous, getCurrentTimestamp;

			lastTimeKey = 'lastTimeAnonymous';
			countKey = 'anonymousCount';

			getCount = function() {
				var count;
				count = window.localStorage.getItem(countKey);
				return count ? count : 0;
			};
			setCountToZero = function() {
				window.localStorage.setItem(countKey, 0);
			};
			getLastTime = function () {
				return window.localStorage.getItem(lastTimeKey);
			};
			setLastTimeAnonymous = function(timestamp) {
				window.localStorage.setItem(lastTimeKey, timestamp);
			};
			getCurrentTimestamp = function () {
				var dateObj, thisMonthTimestamp;
				dateObj = new Date();
				thisMonthTimestamp = (new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 1)).getTime();
				return thisMonthTimestamp;
			};

			return {
				canBeAnonymous: function () {
					var lastTimeUse, anonymousCount, thisMonthTimestamp;
					lastTimeUse = getLastTime();
					anonymousCount = getCount();
					thisMonthTimestamp = getCurrentTimestamp();
					if (!lastTimeUse || thisMonthTimestamp != lastTimeUse) {
						setLastTimeAnonymous(thisMonthTimestamp);
						setCountToZero();
					}
					return anonymousCount < 5;
				},
				increment: function () {
					var count;
					count = parseInt(getCount());
					window.localStorage.setItem(countKey, count + 1);
				}
			};
		};
		return anonymous();
	}]);
})();