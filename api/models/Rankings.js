/**
 * Rankings.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

	rdate: {
		type: 'date'
	},
	site: {
		type: 'string'
	},
	keywords: {
		type: 'string'
	},
	google: {
		type: 'integer'
	},
	google_base_rank: {
		type: 'integer'
	},
	yahoo: {
		type: 'integer'
	},
	bing: {
		type: 'integer'
	},
	global_monthly_searches: {
		type: 'integer'
	}
  }
};

