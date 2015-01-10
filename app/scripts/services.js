'use strict'

////// Sevices //////

angular.module('app.services', [])

.factory('version', function() {
	return "0.1"
})

.factory('db', [ function() {
	var db = DataStore.create('document'),
		typeDB = db.collection('type'),
		subTypeDB = db.collection('subtype'),
		recipeDB = db.collection('recipe'),
		testDB = db.collection('test');

	var service = {
		type: {
			getAll: function(callback) {
				return typeDB.find({}, callback);
			},
			getById: function(typeId, callback) {
				return typeDB.findOne({_id: parseInt(typeId)}, callback);
			}
		},

		subtype: {
			getAllByTypeId: function(typeId, callback) {
				return subTypeDB.find({"type": parseInt(typeId)}, callback);
			},
			getById: function(subTypeId, callback) {
				return subTypeDB.findOne({_id: parseInt(subTypeId)}, callback);
			}
		},

		recipe: {
			getAllByTypeId: function(typeId, nullSubtype, callback) {
				var query = {
					"type": parseInt(typeId),
				};

				if (nullSubtype) {
					query.subtype = {
						$exists: false
					}
				}
				return recipeDB.find(query, callback);
			},
			getAllBySubTypeId: function(subTypeId, callback) {
				return recipeDB.find({"subtype": parseInt(subTypeId)}).sort({order: 1}).exec(callback);
			},
			getById: function(recipeId, callback) {
				return recipeDB.findOne({_id: parseInt(recipeId)}, callback);
			},
			getStats: function(recipeId, callback) {
				testDB.count({"recipe": parseInt(recipeId)}, function(err, count) {
					if (count == 0) {
						callback(err, count, null, 0);
					} else {
						testDB.find({"recipe": parseInt(recipeId)}).sort({date: -1}).exec(function(err, tests) {
							var lastTest = tests[0],
									avRating = 0;
							angular.forEach(tests, function(test, index) {
								avRating += (test.rating || 0);
							});
							avRating = avRating / count;
							avRating = Math.ceil(avRating * 10) / 10;
							callback(err, count, lastTest, avRating);
						})
					}
				});
			},
			saveNotes: function(recipe, callback) {
				recipeDB.update(
					{_id: recipe._id},
					{
						$set: {
							notes: recipe.notes
						}
					},
					callback
				)
			}
		},

		test: {
			getAllByRecipeId: function(recipeId, callback) {
				return testDB.find({"recipe": parseInt(recipeId)}).sort({date: -1}).exec(callback);
			},

			saveOrUpdate: function(test, callback) {
				if (test._id != undefined) {
					testDB.update(
						{_id: test._id},
						{$set: {
							rating: test.rating,
							date: test.date,
							img: test.img,
							notes: test.notes,
							aspect_obs: test.aspect_obs,
							aspect_corr: test.aspect_corr,
							smell_obs: test.smell_obs,
							smell_corr: test.smell_corr,
							taste_obs: test.taste_obs,
							taste_corr: test.taste_corr,
							texture_obs: test.texture_obs,
							texture_corr: test.texture_corr
						}},
						function(err, numReplaced, newDoc) { callback(err, newDoc);}
					);
				} else {
					testDB.insert(test, callback);
				}
			},

			delete: function(test, callback) {
				testDB.remove({_id: test._id}, callback);
			}
		}
	};

	return service;
}]
);
