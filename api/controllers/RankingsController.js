/**
 * RankingsController
 *
 * @description :: Processes search engine data for given dates. 
 */

module.exports = {
	
	/**
	 * Read CSV file and create records in target data source (i.e. MySQL database). 
	 * 
	 * @param  req The Request object
	 * @param  res The Response object 
	 */
	upload: function(req, res){
		req.file('uploadStatData').upload({
			dirname: require('path').resolve(sails.config.appPath, 'data/csv') // save CSV files to /data/csv
		}, function(error, files){
			var fs = require('fs'); 
			var csv = require('fast-csv'); 
			var filePath = files[0].fd; 
			var stream = fs.createReadStream(filePath, {encoding: 'utf-16le'});

			csv.fromStream(stream, { 
				headers: true, 
				delimiter:'\t', 
				trim:true,
				ignoreEmpty:true 
			}) 
			.on('data', function(data){ 
				// Create a record in the database
				Rankings.create({
					rdate: data['Date'],
					site: data['Site'],
					keywords: data['Keyword'],
					google: parseInt(data['Google']) || 0,
					google_base_rank: parseInt(data['Google Base Rank']) || 0,
					yahoo: parseInt(data['Yahoo']) || 0,
					bing: parseInt(data['Bing']) || 0,
					global_monthly_searches: parseInt(data['Global Monthly Searches']) || 0
				})
				.exec(function (err, record){
					if (err) {  
				  		console.error("Error occurred while loading record to data store.", err);
				  	}    
				});

			})
			.on('end', function(data){ 
				return res.view('homepage', {
					"csvLoadedMsg": "CSV data loaded in datastore."
				}); // Keep the current view
			});
		})
	},
	/**
	 * For a given date range, it fetches search engine rankings data. 
	 * @param  req The Request object
	 * @param  res The Response object 
	 */
	findRankingsForDates: function(req, res){

		var fromDate = req.param('fromDate');
		var toDate = req.param('toDate');

		// Control the flow of execution and minimize callback hell with the use of Promises. 
		var Promise = require('bluebird');
		var rankQueryAsync = Promise.promisify(Rankings.query);
		var weightedAllRankQueryAsync = Promise.promisify(Rankings.query);
		var weightedRankQueryAsync = Promise.promisify(Rankings.query);

		// Data to be used for first Visual 
		var qrySearchEngineRankings = 
			"SELECT DATE_FORMAT(rdate, \'%Y-%m-%d\') AS rank_date, keywords AS rank_keywords, " + 
			"AVG(google) AS rank_google, AVG(google_base_rank) AS rank_google_base, " + 
			"AVG(yahoo) AS rank_yahoo, AVG(bing) AS rank_bing " + 
			"FROM rankings WHERE rdate > ? AND rdate < ? GROUP BY rdate, keywords"; 

		// Data to be used for second Visual 
		var qryAllMonthlySearches = 
			"SELECT DATE_FORMAT(rdate, \'%Y-%m-%d\') AS rank_date, keywords AS rank_keywords, " + 
			"google AS rank_google, google_base_rank AS rank_google_base, global_monthly_searches, " + 
			"yahoo AS rank_yahoo, bing AS rank_bing " + 
			"FROM rankings WHERE rdate > ? AND rdate < ?"; 
		var qryMaxMonthlySearches = 
			"SELECT DATE_FORMAT(rdate, \'%Y-%m-%d\') AS monthly_date, MAX(global_monthly_searches) AS global_monthly " + 
			"FROM rankings " + 
    		"WHERE rdate > ? AND rdate < ? " + 
    		"GROUP BY rdate, YEAR(rdate), MONTH(rdate)";

		// Use promises to control flow of execution
	 	var p1 = rankQueryAsync(qrySearchEngineRankings, [fromDate, toDate]).then(function (rankingData){
			return rankingData;			
		});

	 	var p2 = weightedAllRankQueryAsync(qryAllMonthlySearches, [fromDate, toDate]).then(function (allRankingData){
			return allRankingData;
		});

		var p3 = weightedRankQueryAsync(qryMaxMonthlySearches, [fromDate, toDate]).then(function (maxMonthlyData){
			return maxMonthlyData;
		});

		// When all the data is fetched from database, calculate the weighted rankings.  
		Promise.all([p1, p2, p3]).then(function(results){
			 
			var rankingsData = results[0]; 
			var allRankingData = results[1];
			var maxMonthlyRankingData = results[2];
			var calculatedWeightedRankings = module.exports.calcWeightedRankings(allRankingData, maxMonthlyRankingData); 

			return res.view('homepage', { 
				 "rankingsData": rankingsData, 
				 "weightedRankings": calculatedWeightedRankings  
			});
		}); 
	},
 
 	/**
 	 * Calculates the weighted rankings over an arbitrary date range. 
 	 * @param  allRankingData        The monthly searches ranking data for a given date range. 
 	 * @param  maxMonthlyRankingData The max monthly ranking data. 
 	 */
	calcWeightedRankings: function(allRankingData, maxMonthlyRankingData) {

		var cachedMaxMonthly = module.exports.cacheMaxMonthlyRankings(maxMonthlyRankingData);

		// Process all rows and find the Weighted Rankings for each search engine
		for(var i = 0; i < allRankingData.length; i ++) {
			var rankingRecord = allRankingData[i]; 

			// Calculate the weighted ranking for each search engine
			rankingRecord.max_monthly_rank_google = module.exports.calcWeightedRankingForRow(rankingRecord.rank_date, rankingRecord.rank_google, rankingRecord.global_monthly_searches, cachedMaxMonthly);
			rankingRecord.max_monthly_rank_google_base = module.exports.calcWeightedRankingForRow(rankingRecord.rank_date, rankingRecord.rank_google_base, rankingRecord.global_monthly_searches, cachedMaxMonthly);
			rankingRecord.max_monthly_rank_yahoo = module.exports.calcWeightedRankingForRow(rankingRecord.rank_date, rankingRecord.rank_yahoo, rankingRecord.global_monthly_searches, cachedMaxMonthly);
			rankingRecord.max_monthly_rank_bing = module.exports.calcWeightedRankingForRow(rankingRecord.rank_date, rankingRecord.rank_bing, rankingRecord.global_monthly_searches, cachedMaxMonthly);
		}

		console.info('CALCULATED WEIGHTED RANKING FOR RECORDS', allRankingData);
	},  
	/**
	 * Uses the FORUMULA => (Rank for the search engine x (Global Monthly Searches / Max Global Monthly Searches)) 
	 * to calculate weighted rankings for an arbitrary date range. 
	 * @param  date        				The ranking date           
	 * @param  searchEngineRanking   	One of the search engines (Google, Google Base, Yahoo, Bing)
	 * @param  globalMonthlySearches 	The global monthly searches
	 * @param  cachedMaxMonthly      	The cached array with max global monthly searches 
	 */
	calcWeightedRankingForRow: function(date, searchEngineRanking, globalMonthlySearches, cachedMaxMonthly){

		return (parseFloat(searchEngineRanking) * (parseFloat(globalMonthlySearches)/parseFloat(cachedMaxMonthly[date])));
	},
	/**
	 * Creates an cross-reference array for the max global monthly searches that will be used to calculate 
	 * the weighted rankings for earch engines. 
	 * @param  maxMonthlyRankingData 	The max monthly ranking data that is processed to create objects with date as the name and the global monthly as the value i.e. {'2016-06-12': 3600}. 
	 */
	cacheMaxMonthlyRankings: function(maxMonthlyRankingData){
		var cachedMaxMonthly = {};

		for(var i = 0; i < maxMonthlyRankingData.length; i++){
			var maxMonthlyRank = maxMonthlyRankingData[i];
			// Use the date as the object name for faster access to corresponding value for monthly max ranking. 
			cachedMaxMonthly[maxMonthlyRank.monthly_date] = maxMonthlyRank.global_monthly; 		 
		}
		return cachedMaxMonthly;
	} 
};

