'use strict';

var core = require('ournet.core');
var _ = core._;

exports.get = function(data) {
	if (_.isNull(data) || _.isUndefined(data)) {
		return data;
	}
	if (_.isArray(data)) {
		return data.map(exports.get);
	}
	if (_.isFunction(data.toJSON)) {
		return data.toJSON();
	}
	if (_.isObject(data)) {
		Object.keys(data).forEach(function(key) {
			data[key] = exports.get(data[key]);
		});
	}
	return data;
};
