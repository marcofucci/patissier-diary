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
		testDB = db.collection('test'),
		memoDB = db.collection('memo');

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
						callback(err, {
							count: count,
							lastTest: null,
							avRating: 0
						});
					} else {
						testDB.find({"recipe": parseInt(recipeId)}).sort({date: -1}).exec(function(err, tests) {
							var lastTest = tests[0],
									avRating = 0;
							angular.forEach(tests, function(test, index) {
								avRating += (test.rating || 0);
							});
							avRating = avRating / count;
							avRating = Math.ceil(avRating * 10) / 10;
							callback(err, {
								count: count,
								lastTest: lastTest,
								avRating: avRating
							});
						})
					}
				});
			},
			getCountPerMonth: function(recipeId, month, callback) {
				var queryParams = {"recipe": parseInt(recipeId)};


				if (month) {
					var dateParts = month.split('/'),
						month = parseInt(dateParts[0])-1,
						year = parseInt(dateParts[1]),
						startMonth = new Date(year, month, 1, 0, 0, 0, 0),
						endMonth = new Date(year, month+1, 1, 0, 0, 0, 0);

					queryParams['date'] = {
						'$gt': startMonth,
						'$lt': endMonth
					};
				}
				testDB.count(queryParams, callback);
			},
			saveNotes: function(recipe, callback) {
				recipeDB.update(
					{_id: recipe._id},
					{
						$set: {
							notes: recipe.notes,
							ingredients: recipe.ingredients,
							procedure: recipe.procedure,
							cooking_time: recipe.cooking_time,
							materials: recipe.materials
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
			},

			getAllMonths: function(callback) {
				var dates = [];
				testDB.find({}).sort({date: -1}).exec(function(err, docs) {
					docs.forEach(function(doc) {
						var dd = (doc.date.getMonth()+1) + '/' + doc.date.getFullYear();
						if (dates.indexOf(dd) == -1) {
							dates.push(dd);
						}
					});

					callback(err, dates);
				});
			}
		},

		memo: {
			getAll: function(callback) {
				return memoDB.find({}).sort({date: -1}).exec(callback);
			},

			saveOrUpdate: function(memo, callback) {
				if (memo._id != undefined) {
					memoDB.update(
						{_id: memo._id},
						{$set: {
							date: memo.date,
							text: memo.text
						}},
						function(err, numReplaced, newDoc) { callback(err, newDoc);}
					);
				} else {
					memoDB.insert(memo, callback);
				}
			},

			delete: function(memo, callback) {
				memoDB.remove({_id: memo._id}, callback);
			}
		}
	};

	return service;
}]
);
