'use strict';

var models = require('./db/models');
var internal = {};
var utils = require('./utils');

var Service = module.exports = function() {

};

/**
 * Topic by key or id
 */
Service.prototype.topic = function(params) {
	if (params.key) {
		return this.topicByKey(params);
	}

	return this.topicById(params);
};

/**
 * Topics by keys or ids
 */
Service.prototype.topics = function(params) {
	if (params.keys) {
		return this.topicsByKeys(params);
	}

	return this.topicsByIds(params);
};

Service.prototype.topicByKey = function(params) {
	return models.Topic.getAsync(params.key, params.params).then(internal.get);
};
Service.prototype.topicsByKeys = function(params) {
	return models.Topic.getItemsAsync(params.keys, params.params).then(internal.get);
};
Service.prototype.topicById = function(params) {
	return models.Topic
		.query(params.id)
		.usingIndex('Topics-id-index')
		.limit(1)
		.select('ALL_PROJECTED_ATTRIBUTES')
		.execAsync()
		.then(internal.get).then(function(result) {
			if (result && result.length > 0) {
				return result;
			}
			return null;
		});
};
Service.prototype.topicsByIds = function(params) {
	return models.Topic
		.query(params.ids)
		.usingIndex('Topics-id-index')
		.limit(params.limit || params.ids.length)
		.select('ALL_PROJECTED_ATTRIBUTES')
		.execAsync()
		.then(internal.get);
};


/**
 * Topic by name key
 */
Service.prototype.topicByName = function(params) {
	return models.TopicName.getAsync(params.key)
		.then(internal.get)
		.then(function(result) {
			if (!result) {
				return result;
			}
			return result.topic;
		});
};

Service.prototype.topicsByNames = function(params) {
	return models.TopicName.getItemsAsync(params.keys)
		.then(internal.get)
		.then(function(result) {
			var data = {};
			if (result) {
				result.forEach(function(item) {
					data[item.key] = item.topic;
				});
			}
			return data;
		});
};

internal.get = utils.get;
