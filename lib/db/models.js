'use strict';

var core = require('ournet.core');
var Promise = core.Promise;
var Query = require('../../node_modules/vogels/lib/query.js');
var vogels = require('vogels');
var Joi = require('joi');
var assert = require('assert');
var slug = require('slug');

Query.prototype.execAsync = Query.prototype.execAsync || Promise.promisify(Query.prototype.exec);

exports.Topic = vogels.define('Topic', {
  tableName: 'Topics',
  hashKey: 'key',
  // createdAt, updatedAt
  timestamps: true,
  schema: {
    id: Joi.number().integer().required(),
    // NO md5 (COUNTRY_LANGUAGE_UNIQUENAME):
    key: Joi.string().trim().length(32).lowercase().required(),
    name: Joi.string().trim().max(100).required(),
    uniqueName: Joi.string().trim().lowercase().max(100).required(),
    prevUniqueName: Joi.string().trim().lowercase().max(100),
    atonicName: Joi.string().trim().max(100),
    abbr: Joi.string().trim().max(20),

    wikiId: Joi.number().integer(),
    wikiName: Joi.string().trim().max(200),
    englishWikiId: Joi.number().integer(),
    englishWikiName: Joi.string().trim().max(200),

    lang: Joi.string().trim().length(2).lowercase().required(),
    country: Joi.string().trim().length(2).lowercase().required(),

    type: Joi.valid(1, 2, 3, 4, 5),
    category: Joi.valid(10, 20, 30, 40, 50, 60, 70, 80, 90),

    region: Joi.string().trim().length(2).lowercase(),

    description: Joi.string().trim().max(400),

    meta: Joi.object().keys({
      birthday: Joi.date().format('YYYY-MM-DD')
    }),

    names: Joi.array().items(Joi.object().keys({
      // md5 (COUNTRY_LANGUAGE_NAME)
      key: Joi.string().trim().length(32).required(),
      // unique name
      name: Joi.string().trim().min(2).max(200).required(),
      uniqueName: Joi.string().trim().min(2).max(200).required(),
      type: Joi.valid(0, 1, 2, 3, 4).required(),
      createdAt: Joi.number().default(Date.now, 'time of creation').required(),
      // old name id
      id: Joi.number().integer()
    })).min(1).max(50).required()
  },
  indexes: [{
    hashKey: 'id',
    type: 'global',
    name: 'Topics-id-index',
    projection: {
      id: 'id',
      key: 'key',
      uniqueName: 'uniqueName',
      name: 'name',
      type: 'type',
      abbr: 'abbr',
      category: 'category'
    }
  }]
});

exports.TopicName = vogels.define('TopicName', {
  tableName: 'TopicNames',
  hashKey: 'key',
  // createdAt, updatedAt
  timestamps: false,
  schema: {
    // md5 (COUNTRY_LANGUAGE_UNIQUENAME)
    key: Joi.string().trim().length(32).lowercase().required(),

    topic: Joi.object().keys({
      id: Joi.number().integer().required(),
      key: Joi.string().trim().length(32).required(),
      name: Joi.string().trim().max(100).required(),
      uniqueName: Joi.string().trim().lowercase().max(100).required(),
      abbr: Joi.string().trim().max(20),
      wikiId: Joi.number().integer(),
      type: Joi.valid(1, 2, 3, 4, 5),
      category: Joi.valid(10, 20, 30, 40, 50, 60, 70, 80, 90)
    })
  }
});

Promise.promisifyAll(exports.Topic);
Promise.promisifyAll(exports.TopicName);

exports.Topic.formatUniqueName = function(name) {
  assert.ok(name);
  name = core.util.atonic(name);

  return slug(name);
};

exports.Topic.formatKey = function(data) {
  assert.ok(data);
  assert.ok(data.uniqueName);
  assert.ok(data.country);
  assert.ok(data.lang);

  return core.util.md5([data.country, data.lang, data.uniqueName].join('_'));
};

exports.TopicName.formatKey = function(country, lang, name) {
  assert.ok(name);
  assert.ok(country);
  assert.ok(lang);

  return core.util.md5([country, lang, exports.TopicName.normalize(name)].join('_'));
};



exports.TopicName.normalize = function(name) {
  name = name.trim().toLowerCase();
  return core.util.atonic(name);
};
