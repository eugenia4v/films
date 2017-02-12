$(function () {
    // define the application
   // var MoviesDatabase = {};
    //variables to hold the indexedDB database.
    var dbMoviesDatabase;
    //The name of the table
    var objectStoreName = 'movies';


    function init() {

        //Shows the splashscreen for three seconds
        function hideSplashScreen() {
            $.mobile.changePage("#moviesList", "fade");
        }

        $(document).on('pageinit', '#splash-screen', function () {
            //After 3 seconds, go to movies list page
            setTimeout(hideSplashScreen, 3000);
        });

        //Open connect
        openConnection();

        //Loading films, everytime the list movies page is being loaded.
        $(document).on('pageshow', '#moviesList', function () {
            getMoviesFromDB();
        });


        //Adding a film
        $('#pgAddMovieSave').on('click', function (e) {
            e.preventDefault(); //Para evitar la # en la URL (si no tengo href coloca una #) Si coloco un botón y no un enlace se estropea el estilo
            //get form contents into an object
            var MovieRec = getMovie();
            //save object to IndexedDB
            addMovie(MovieRec);
        });

        //listview item click event.
        //Tiene que ser de esta forma, porque el a del pgMovieList se crea dinámicamente de forma posterior a la creación del documento.
        $(document).on('click', '#moviesList a', function (e) {
            //e.preventDefault();
            detailMovie($(this).data('id'));
            //change page to detail page.
            $.mobile.changePage('#pgDetailMovie');

        });

    }

    function detailMovie(key) {
        var MovieRec = {};
        //define a transaction to read the record from the table 
        var store = getObjectStore("readwrite");

        //get the record by primary key
        var request = store.get(key);
        request.onsuccess = function (e) {
            MovieRec = e.target.result;
            //clean the primary key
            $('#pgMovieName').html(MovieRec.MovieName);
            $('#pgMovieYear').html(MovieRec.MovieYear);
            $('#pgMovieGenre').html(MovieRec.MovieGenre);
        }

    }



    function getMoviesFromDB() {
        var MovieObj = {};
        //define a transaction to read the records from the table Movie
        var store = getObjectStore("readonly");

        //open a cursor to read all the records
        var request = store.openCursor();

        request.onsuccess = function (e) {
            //return the resultset
            var cursor = e.target.result;
            if (cursor) {
                MovieObj[cursor.key] = cursor.value;
                // process another record
                cursor.continue();
            }
            // are there existing Movie records?
            if (!$.isEmptyObject(MovieObj)) {
                // yes there are. pass them off to be displayed
                displayMovies(MovieObj);
            } else {
                // nope, just show the placeholder
                $('#pgMovieList').html('<li id="noMovie">You have no movies</li>');
            }
        }


        // an error was encountered
        request.onerror = function (e) {
            $.mobile.loading("hide");
            // just show the placeholder
            $('#pgMovieList').html('<li id="noMovie">You have no movies</li>');
        }
    }


    function displayMovies(MovieObj) {
        var MovieLi = '<li class="ui-li-has-count">';
        var html = '';
        var n;

        for (n in MovieObj) {
            //get the record details
            var MovieRec = MovieObj[n];

            //define a new line from what we have defined
            var nItem = MovieLi;
            //n is the key for defining the id
            nItem += '<a data-id="' + n + '" class="ui-btn ui-btn-icon-right ui-icon-carat-r" href="#pgDetailMovie">';

            //add the title;
            nItem += '<h2>' + MovieRec.MovieName + "</h2>";

            //there is a count bubble, update list item
            var nCountBubble = '';
            nCountBubble += MovieRec.MovieYear;
            //add the countbubble
            nItem += "<p>" + nCountBubble + "</p>";

            //there is a description, update the list item
            var nDescription = '';
            nDescription += MovieRec.MovieGenre;
            nItem += "<p><span class='ui-li-count ui-body-inherit'>" + nDescription + "</span></p></a></li>";
            html += nItem;
        }
        //update the listview with the newly defined html structure.
        $('#pgMovieList').html('<li data-role="list-divider">Your Movies</li>' + html);

    }

    function getMovie() {
        //define the new record
        var MovieRec = {};
        //Generate a random key
        MovieRec.id = guid();
        MovieRec.MovieName = $('#pgAddMovieMovieName').val().trim();
        MovieRec.MovieYear = $('#pgAddMovieMovieYear').val().trim();
        MovieRec.MovieGenre = $('#pgAddMovieMovieGenre').val().trim();
        return MovieRec;
    }


    function addMovie(MovieRec) {
        //Define a transaction to execute and store
        var store = getObjectStore("readwrite");

        var request = store.add(MovieRec);
        request.onsuccess = function (e) {
            //show an alert message that the record has been added
            alert('Movie record successfully added.', 'Movies Database');
            // clear the edit page form fields
            pgAddMovieClear();
            //stay in the same page to add more records
        }

        request.onerror = function (e) {
            //show a toast message that the record has not been added
            alert('Movie record NOT successfully added.', 'Movies Database');
        }

    }

    //clear the form controls for data entry
    function pgAddMovieClear() {
        $('#pgAddMovieMovieName').val('');
        $('#pgAddMovieMovieYear').val('');
        $('#pgAddMovieMovieGenre').val('');
    }

    // Gets an unique id randomly
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
    }

    //IndexDB Management

    function openConnection() {
        // open the indexedDB database
        var request = indexedDB.open("MoviesDatabase", 1);

        request.onupgradeneeded = function (e) { // cuando es necesario crear las tablas de la base de datos, la primera vez
            dbMoviesDatabase = e.target.result;
            if (!dbMoviesDatabase.objectStoreNames.contains(objectStoreName)) {
                var os = dbMoviesDatabase.createObjectStore(objectStoreName, { keyPath: "id" }); // crear tabla
            }
        }
        //the database was opened successfully
        request.onsuccess = function (e) {
            dbMoviesDatabase = e.target.result;
        }
    }


    function getObjectStore( mode) {
        var transaction = dbMoviesDatabase.transaction(objectStoreName, mode);
        return transaction.objectStore("movies");
    }


    //Init the program
    init();
});