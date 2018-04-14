var fs = require('fs'); 
var request = require('request');
var dotenv = require("dotenv").config();
var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require('node-spotify-api');

// Grabs the command from the terminal
var command = process.argv[2];
var searchValue = "";

// Puts together the search value into one string
for (var i = 3; i < process.argv.length; i++) {
    searchValue += process.argv[i] + " ";
};

// -------------------- Twitter my-tweets ----------------------------
function getTweets() {

    // Accesses Twitter Keys
    var client = new Twitter(keys.twitter); 
    var params = {
        screen_name: 'KCJayhawkFan',
        count: 20
        };

    client.get('statuses/user_timeline', params, function(respError, tweets, response) {


        console.log("\n-------------- KCJayhawkFan's Latest Tweets --------------\n");

        for (i = 0; i < tweets.length; i++) {
            console.log(i + 1 + ". Tweet: ", tweets[i].text);

            // For alingment once the number of the tweet is 10 or higher
            if (i + 1 > 9) {
                console.log("    Tweeted on: ", tweets[i].created_at + "\n");
            } else {
                console.log("   Tweeted on: ", tweets[i].created_at + "\n");
            }  
            
        };

        console.log("--------------------------------------------------\n");

    });
};

// ======================= Spotify spotify-this-song ============================
function searchSong(searchValue) {

    // Default search value if no song is given
    if (searchValue == "") {
        searchValue = "The Sign Ace of Base";
    }

    // Accesses Spotify keys  
    var spotify = new Spotify(keys.spotify);

    var searchLimit = "5";

    // Allows the user to input the number of returned spotify results, defaults 1 return if no input given
    
    if (isNaN(parseInt(process.argv[3])) == false) {
        searchLimit = process.argv[3];

        console.log("\nYou requested to return: " + searchLimit + " songs");
        
        // Resets the searchValue to account for searchLimit
        searchValue = "";
        for (var i = 4; i < process.argv.length; i++) {        
            searchValue += process.argv[i] + " ";
        };

    }
   
    // Searches Spotify with given values
    spotify.search({ type: 'track', query: searchValue, limit: searchLimit }, function(respError, response) {

        var songResp = response.tracks.items;

        for (var i = 0; i < songResp.length; i++) {
            console.log("\n=============== Spotify Search Result "+ (i+1) +" ===============\n");
            console.log(("Artist: " + songResp[i].artists[0].name));
            console.log(("Song title: " + songResp[i].name));
            console.log(("Album name: " + songResp[i].album.name));
            console.log(("URL Preview: " + songResp[i].preview_url));
            console.log("\n=========================================================\n");

        }

    })
};

// ++++++++++++++++++++ OMDB movie-this +++++++++++++++++++++++++
function searchMovie(searchValue) {

    // Default search value if no movie is given
    if (searchValue == "") {
        searchValue = "Mr. Nobody";
    }

    var queryUrl = "http://www.omdbapi.com/?t=" + searchValue.trim() + "&y=&plot=short&apikey=trilogy";

    request(queryUrl, function(respError, response, body) {

        if (JSON.parse(body).Error == 'Movie not found!' ) {

            console.log("\nI'm sorry, I could not find any movies that matched the title " + searchValue + ". Please check your spelling and try again.\n")

        } else {

            movieBody = JSON.parse(body);

            console.log("\n++++++++++++++++ OMDB Search Results ++++++++++++++++\n");
            console.log("Movie Title: " + movieBody.Title);
            console.log("Year: " + movieBody.Year);
            console.log("IMDB rating: " + movieBody.imdbRating);

            // If there is no Rotten Tomatoes Rating
            if (movieBody.Ratings.length < 2) {

                console.log("There is no Rotten Tomatoes Rating for this movie.")
                
            } else {

                console.log("Rotten Tomatoes Rating: " + movieBody.Ratings[[1]].Value);

            }
            
            console.log("Country: " + movieBody.Country);
            console.log("Language: " + movieBody.Language);
            console.log("Plot: " + movieBody.Plot);
            console.log("Actors: " + movieBody.Actors);
            console.log("\n+++++++++++++++++++++++++++++++++++++++++++++++++\n");
        };      
    });
};

// xxxxxxxxxxxxxxxxxx Random do-what-it-says xxxxxxxxxxxxxxxxxxxxxx
function randomSearch() {

    fs.readFile("random.txt", "utf8", function(respError, data) {

        var randomArray = data.split(", ");
        
        if (randomArray[0] == "spotify-this-song") {
            searchSong(randomArray[1]);
        } else if (randomArray[0] == "movie-this") {
            searchMovie(randomArray[1]);
        } else {
            getTweets();
        }
    });
};

// <<<<<<<<<<<<<<<<< Main Switch Case >>>>>>>>>>>>>>>>>>>>

// Runs corresponding function based on user command
switch (command) {
    case "my-tweets":
        getTweets();
        break;
    case "spotify-this-song":
        searchSong(searchValue);
        break;
    case "movie-this":
        searchMovie(searchValue);
        break;
    case "do-what-it-says":
        randomSearch();
        break;
    default:
        console.log("\nI'm sorry, " + command + " is not a command that I recognize. Please try one of the following commands: \n\n  1. For a random search: node liri.js do-what-it-says \n\n  2. To search a movie title: node liri.js movie-this (with a movie title following) \n\n  3. To search Spotify for a song: node liri.js spotify-this-song (*optional number for amount of returned results) (specify song title)\n Example: node liri.js spotify-this-song 10 One Love\n\n  4. To see the last 20 of KCJayhawkFan's tweets on Twitter: node liri.js my-tweets \n");
};