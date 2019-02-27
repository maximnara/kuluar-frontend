(function(){
	var app = angular.module('app');

	app.service('localStorageService', function() {
		var localStorageAdapter = function() {
			return {
				'storageData': {
					key: undefined,
					type: undefined
				},
				'storage': window.localStorage,
				'init': function(key, type) {
					this.storageData.key = key;
					return this;
				},
				'list': function(name) {
					name += '';
					return new list(name, this);
				},
				'values': function(name) {
					return new primitive(name, this);
				},
				'removeAll': function() {
					this.storage.removeItem(this.storageData.key);
				},
				'getAll': function() {
					var itemObjSerialized = this.storage.getItem(this.storageData.key),
						itemObj = {};
					if (itemObjSerialized != null && itemObjSerialized != undefined) {
						itemObj = JSON.parse(itemObjSerialized);
					}
					return itemObj;
				},
				'get': function(id) {
					if (!this.exists(id)) {
						return undefined;
					}
					var all = this.getAll();
					return all[id];
				},
				'save': function(key, obj) {
					if (!obj) {
						throw new Error('Undefined entity key');
					}
					var data = this.getAll();
					data[key] = obj;
					this.storage.setItem(this.storageData.key, JSON.stringify(data));
					return true;
				},
				'count': function() {
					return this.keys().length;
				},
				'keys': function() {
					return Object.keys(this.getAll());
				},
				'set': function(key, obj) {
					return this.save(key, obj);
				},
				'remove': function(id) {
					id += '';
					if (!this.exists(id)){
						return true;
					}
					var itemObj = this.getAll();
					delete itemObj[id];
					this.storage.setItem(this.storageData.key, JSON.stringify(itemObj));
					return true;
				},
				'exists': function(id) {
					id += '';
					var list = this.getAll();
					return !!~Object.keys(list).indexOf(id);
				}
			};
		},
		list = function(name, proxyObj, parent) {
			var data = {
				_name: name,
				_ls: proxyObj,
				_nestedStructures: [],
				_parent: parent,
				_list: list,
				_primitive: primitive
			};

			if (!data._name) {
				throw new Error('List name must be specified');
			}

			return {
				'set': function(key, obj) {
					var all = this.getAll();
					key += '';
					if (this.exists(key)) {
						return this.replace(key, obj);
					}
					all[key] = obj;
					return data._parent ? data._parent._save(data._name, all) : data._ls.save(data._name, all);
				},
				'exists': function(id) {
					id += '';
					var list = this.getAll();
					return !!~Object.keys(list).indexOf(id);
				},
				'get': function(id) {
					var list = this.getAll();
					if (!this.exists(id)) {
						return undefined;
					}
					return list[id];
				},
				'getAll': function() {
					var all = data._parent ? data._parent.getAll() : data._ls.getAll();
					if (!~(Object.keys(all).indexOf(data._name))) {
						return {};
					}
					return all[data._name];
				},
				'replace': function(key, replacement) {
					var items = this.getAll();
					if (!this.exists(key)) {
						return false;
					}
					items[key] = replacement;
					data._parent ? data._parent._save(data._name, items) : this._save(data._name, items);
					return true;
				},
				'remove': function(id) {
					id += '';
					if (!this.exists(id)){
						return true;
					}
					var itemObj = this.getAll();
					delete itemObj[id];
					return data._parent ? data._parent._save(data._name, itemObj) : this._save(data._name, itemObj);
				},
				'count': function() {
					return this.keys().length;
				},
				'keys': function() {
					return Object.keys(this.getAll());
				},
				'list': function(name) {
					var list = new data._list(name, data._ls, this);
					data._nestedStructures.push(list);
					return list;
				},
				'values': function(name) {
					return new data._primitive(name, data._ls, this);
				},
				'_save': function(key, obj) {
					var all = this.getAll();
					key += '';
					all[key] = obj;
					return data._parent ? data._parent._save(data._name, all) : data._ls.save(data._name, all);
				}
			};
		},
		primitive = function(name, proxyObj, parent) {
			var data = {
				_name: name,
				_ls: proxyObj,
				_parent: parent
			};

			return {
				'add': function(id) {
					if (this.exists(id)){
						return true;
					}
					var itemObj = this.getAll();
					itemObj.push(id);
					return data._parent ? data._parent._save(data._name, itemObj) : data._ls.save(data._name, itemObj);
				},
				'count': function() {
					return this.getAll().length;
				},
				'exists': function(id) {
					var itemObj = this.getAll();
					return !!~itemObj.indexOf(id) || (angular.isObject(id) && itemObj.some(function(e) { return angular.equals(e, id); }));
				},
				'remove': function(id) {
					if (!this.exists(id)){
						return true;
					}
					var itemObj = this.getAll(),
						pos = itemObj.indexOf(id),
						all = this.getAll();
					itemObj.splice(pos, 1);
					return data._parent ? data._parent._save(data._name, itemObj) : data._ls.save(data._name, itemObj);
				},
				'getAll': function() {
					var all = data._parent ? data._parent.getAll() : data._ls.getAll();
					if (!~Object.keys(all).indexOf(data._name)) {
						return [];
					}
					return all[data._name];
				}
			};
		};
		return localStorageAdapter;
	});
})();