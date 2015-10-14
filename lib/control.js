'use strict';

var core = require('ournet.core');
var Promise = core.Promise;
var _ = core._;
var models = require('./db/models');
var internal = {};
var utils = require('./utils');

var Service = module.exports = function() {

};

/**
 * Create a topic
 */
Service.prototype.createTopic = function(params) {
	this.normalizeTopic(params);

	return models.Topic.createAsync(params)
		.then(internal.get);
};

/**
 * Create a topic name
 */
Service.prototype.createTopicName = function(params) {
	return models.TopicName.createAsync(params)
		.then(internal.get);
};

/**
 * Create topic names from topic
 */
Service.prototype.createTopicNames = function(topic) {
	var topicnames = [];
	var keys = {};
	var self = this;

	topic.names.forEach(function(name) {
		name.key = name.key || models.TopicName.formatKey(topic.country, topic.lang, name.name);
		if (keys[name.key]) {
			return;
		}
		keys[name.key] = name.key;
		var tn = {
			key: name.key,
			topic: _.pick(topic, 'id', 'key', 'name', 'uniqueName', 'type', 'category', 'abbr', 'wikiId')
		};

		topicnames.push(tn);
	});

	return Promise.resolve(topicnames).each(function(tname) {
		return self.createTopicName(tname).then(function() {
			return tname.key;
		});
	});
};

Service.prototype.normalizeTopic = function(topic) {
	topic.uniqueName = topic.uniqueName || models.Topic.formatUniqueName(topic.name);
	topic.key = topic.key || models.Topic.formatKey(topic);

	var names = [];
	var keys = {};

	topic.names.forEach(function(name) {
		if (names.length === 50) {
			return;
		}
		var lname = name.name.trim().toLowerCase();
		if (keys[lname]) {
			return;
		}
		keys[lname] = name;

		name.uniqueName = models.TopicName.normalize(name.name);
		name.key = models.TopicName.formatKey(topic.country, topic.lang, name.name);
		names.push(name);
	});

	topic.names = names;

	if (topic.description) {
		topic.description = core.text.wrapAt(topic.description.trim(), 400);
	}

	return names;
};

internal.get = utils.get;
