(function(){
	var app;
	app = angular.module('app');
	app.service('abuse', function ($http, $ionicActionSheet, $ionicLoading, config) {
		var buttons, sheet, sendAbuse, hide, spinner, reason;
		reason = {
			spam: 1,
			insult: 2,
			adult: 3,
			drug: 4,
			childPorno: 5,
			extremism: 6,
			violence: 7
		};
		buttons = [
			{text: 'Спам', type: reason.spam},
			{text: 'Оскорбление', type: reason.insult},
			{text: 'Материалы для взрослых', type: reason.adult},
			{text: 'Пропаганда наркотиков', type: reason.drug},
			{text: 'Детское порнография', type: reason.childPorno},
			{text: 'Эктремизм', type: reason.extremism},
			{text: 'Насилие', type: reason.violence},
		];
		sendAbuse = function(userId, abuseType, reason, entityId) {
			spinner.show();
			return $http
				.get(config.apiUrl + 'abuse/create', {
					params: {
						type: abuseType,
						reason: reason,
						entityId: entityId,
						userId: userId
					}
				});
		};
		hide = function () {
			sheet();
		};
		spinner = {
			'show': function() {
				$ionicLoading.show({
					template: '<svg viewBox="0 0 64 64" style="stroke: #fff;width: 25px;"><g stroke-width="4" stroke-linecap="round"><line y1="17" y2="29" transform="translate(32,32) rotate(180)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(210)"><animate attributeName="stroke-opacity" dur="750ms" values="0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(240)"><animate attributeName="stroke-opacity" dur="750ms" values=".1;0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(270)"><animate attributeName="stroke-opacity" dur="750ms" values=".15;.1;0;1;.85;.7;.65;.55;.45;.35;.25;.15" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(300)"><animate attributeName="stroke-opacity" dur="750ms" values=".25;.15;.1;0;1;.85;.7;.65;.55;.45;.35;.25" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(330)"><animate attributeName="stroke-opacity" dur="750ms" values=".35;.25;.15;.1;0;1;.85;.7;.65;.55;.45;.35" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(0)"><animate attributeName="stroke-opacity" dur="750ms" values=".45;.35;.25;.15;.1;0;1;.85;.7;.65;.55;.45" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(30)"><animate attributeName="stroke-opacity" dur="750ms" values=".55;.45;.35;.25;.15;.1;0;1;.85;.7;.65;.55" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(60)"><animate attributeName="stroke-opacity" dur="750ms" values=".65;.55;.45;.35;.25;.15;.1;0;1;.85;.7;.65" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(90)"><animate attributeName="stroke-opacity" dur="750ms" values=".7;.65;.55;.45;.35;.25;.15;.1;0;1;.85;.7" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(120)"><animate attributeName="stroke-opacity" dur="750ms" values=".85;.7;.65;.55;.45;.35;.25;.15;.1;0;1;.85" repeatCount="indefinite"></animate></line><line y1="17" y2="29" transform="translate(32,32) rotate(150)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line></g></svg>',
					noBackdrop: true
				});
			},
			'hide': function() {
				$ionicLoading.hide();
			}
		};
		this.type = {
			post: 1,
			comment: 2,
			profileComment: 3
		};
		this.show = function(userId, type, entityId) {
			if (!userId || !type || !entityId) {
				return false;
			}
			sheet = $ionicActionSheet.show({
				buttons: buttons,
				cancelText: 'Отмена',
				buttonClicked: function(index) {
					var defered;
					if (!buttons.hasOwnProperty(index) || !type) {
						return true;
					}
					defered = sendAbuse(userId, type, buttons[index].type, entityId);
					defered.success(function(response){
						if (!response.hasOwnProperty('status') || response.status != 1) {
							return false;
						}
						hide();
					});
					defered.finally(function(){
						spinner.hide();
					});
				}
			});
			return true;
		};
	});
})();