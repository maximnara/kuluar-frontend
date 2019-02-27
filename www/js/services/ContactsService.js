(function(){
	var app = angular.module('app');

	app.service("ContactsService", ['$q', function($q) {

		var formatContact = function(contact) {

			var contacts = [];
			for (var i in contact) {
				contacts.push({
					"id": contact[i].id,
					"name"   : contact[i].name.formatted || contact[i].name.givenName + " " + contact[i].name.familyName || "Mystery Person",
					"emails"        : contact[i].emails || [],
					"phones"        : contact[i].phoneNumbers || [],
					"photos"        : contact[i].photos || []
				});
			}
			return contacts;

		};

		var pickContact = function() {

			var deferred = $q.defer();

			if(navigator && navigator.contacts) {

				navigator.contacts.find(['', ''], function(contact){
					deferred.resolve( formatContact(contact) );
				});

			} else {
				deferred.reject("Bummer.  No contacts in desktop browser");
			}

			return deferred.promise;
		};

		return {
			pickContact : pickContact
		};
	}]);
})();