(function(){
	var app = angular.module('app');
	
	app.controller('InviteCtrl', function($rootScope, $scope, $state, $http, localStorageService, $timeout, $ionicLoading, $ionicPopover, $cordovaGoogleAnalytics, config, ContactsService, $ionicActionSheet){
		var lsProviders, contacts, featureInviteUsed;

		lsProviders = (new localStorageService()).init('invitedUsers').list('ids');
		contacts = window.localStorage.getItem('contactList');
		featureInviteUsed = window.localStorage.getItem('featureInviteUsed');

		$scope.invite = function(item){
			var selectedPhone, phones, i;

			if ($scope.invitedContacts[item.id]) {
				return false;
			}

			if (item.phones.length > 1) {
				phones = [];
				for (i in item.phones) {
					phones.push({ text: item.phones[i].value });
				}
				$ionicActionSheet.show({
					buttons: phones,
					cancelText: '<b>Отменить</b>',
					buttonClicked: function(index) {
						selectedPhone = phones[index].text;
						$scope.sendInvite(selectedPhone, item.id);
						return true;
					}
				});
			}
			if (item.phones.length == 1) {
				selectedPhone = item.phones[0].value;
			}
			if (!selectedPhone) {
				return false;
			}
			$scope.sendInvite(selectedPhone, item.id);
		};

		var phone;
		phone = {
			normalize: function(phone){
				var normilized;
				normilized = phone;
				normilized = normilized.replace(/^8/g, '+7');
				normilized = normilized.replace(/[-()]/g, '');
				normilized = normilized.replace(/\s+/g, '');
				return normilized;
			}
		};


		$scope.sendInvite = function(phoneNumber, id) {

			$scope.invitedContacts[id] = true;
			lsProviders.set(id, true);
			$http.get(config.apiUrl + 'group/invite', {
				params: {
					userId: window.localStorage.getItem('userId'),
					phone: phone.normalize(phoneNumber)
				}
			})
				.success(function(data){
					if (!data || data.status != 1) {
						$scope.invitedContacts[id] = false;
						lsProviders.remove(id);
						return false;
					}
				})
				.error(function(){
					$scope.invitedContacts[id] = false;
					lsProviders.remove(id);
				});
		};

		$scope.showFeature = function() {
			$ionicPopover.fromTemplateUrl('templates/invite/feature.html', {
				scope: $scope
			}).then(function(popover) {
				$scope.popover = popover;
				$scope.popover.show();
			});
		};

		$scope.filterContacts = function (contacts) {
			var filtered = [];
			for (var i in contacts) {
				if (!contacts[i].hasOwnProperty('phones') || contacts[i].phones.length == 0) {
					continue;
				}
				filtered.push(contacts[i]);
			}
			return filtered;
		};


		/*$scope.selectedContacts = [
			{
				name: 'Ольга Алексеевна',
				phones: [{
					value: '8 (962) 985-41-87'
				}]
			},
			{
				name: 'Максим Минин',
				phones: [
					{
						value: '8 (962) 985-41-87'
					},
					{
						value: '8 (962) 985-41-87'
					},
					{
						value: '8 (962) 985-41-87'
					}
				]
			},
			{
				name: 'Анна Климачева',
				phones: [{
					value: '8 (962) 985-41-87'
				}]
			},
			{
				name: 'Сергей Брин',
				phones: [{
					value: '8 (962) 985-41-87'
				},{
					value: '8 (962) 985-41-87'
				}]
			},
			{
				name: 'Анатолий Вассерман',
				phones: [{
					value: '8 (962) 985-41-87'
				},{
					value: '8 (962) 985-41-87'
				}]
			}
		];*/

		$scope.searchInputFocused = false;
		$scope.selectedContacts = contacts ? $scope.filterContacts(JSON.parse(contacts)) : undefined;
		$scope.invitedContacts = lsProviders.count() > 0 ? lsProviders.getAll() : {};
		if (!featureInviteUsed) {
			$scope.showFeature();
			window.localStorage.setItem('featureInviteUsed', 1);
			$timeout(function () {
				$cordovaGoogleAnalytics.trackEvent('Invite', 'First page open', 'Показывается feature окно');
			});
		}
		$timeout(function () {
			$cordovaGoogleAnalytics.trackView('Invite');
		});
	});
})();