
//isNonEmptyString, isPositiveInteger
import { cloneObject, isIntegerOrIntegerString, isNonEmptyString, createIsoDateString, isPositiveInteger } from "../../lib/util.mjs";
import { ConstraintViolation, FrozenValueConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation } from "../../lib/errorTypes.mjs";
import { Enumeration } from "../../lib/Enumeration.mjs";
import Director from "./Director.mjs";
import Actor from "./Actor.mjs";
/**
 * Enumeration type
 * @global
 */
const MovieCategoryEL = new Enumeration(["TvSeriesEpisode","Biography"]);

/**
 * Constructor function for the class Movie
 * including the incomplete disjoint segmentation {TvSeriesEpisode, Biography}
 * @class
 */
class Movie {
    // using a single record parameter with ES6 function parameter destructuring
    constructor ({movieId, title, releaseDate, actors, actorIdRefs,
                     director, director_id,
                     category, tvSeriesName, episodeNo, about}) {
        this.movieId = movieId; // number (integer)
        this.title = title; // string
        this.releaseDate = releaseDate; // date

        // assign object references or ID references (to be converted in setter)
        this.actors = actors || actorIdRefs;
        if (director || director_id) {
            this.director = director || director_id;
        }

        // optional properties
        if (category) this.category = category;  // from MovieCategoryEL
        if (tvSeriesName) this.tvSeriesName = tvSeriesName;
        if (episodeNo) this.episodeNo = episodeNo;
        if (about) this.about = about;
    }

    get movieId() {
        return this._movieId;
    }
    static checkMovieId( movieId) {
        if (!movieId) return new NoConstraintViolation();
        else if (!isIntegerOrIntegerString(movieId)) {
            return new RangeConstraintViolation("The value of movie ID must be an integer!");
        } else if (!isIntegerOrIntegerString(movieId) || parseInt(movieId) < 1) {
            return new RangeConstraintViolation(
                "The value of movie ID must be a positive integer!");
        } else {
            return new NoConstraintViolation();
        }
    }
    static checkMovieIdAsId( movieId) {
        var validationResult = Movie.checkMovieId( movieId);
        if ((validationResult instanceof NoConstraintViolation)) {
            if (!movieId) {
                validationResult = new MandatoryValueConstraintViolation(
                    "A value for the movie ID must be provided!");
            } else if (movieId in Movie.instances) {
                validationResult = new UniquenessConstraintViolation(
                    `There is already a movie record with movie ID ${movieId}`);
            } else {
                validationResult = new NoConstraintViolation();
            }
        }
        return validationResult;
    }
    set movieId( movieId) {
        const validationResult = Movie.checkMovieIdAsId( movieId);
        if (validationResult instanceof NoConstraintViolation) {
            this._movieId = movieId;
        } else {
            throw validationResult;
        }
    }

    get title() {
        return this._title;
    }
    static checkTitle(title) {
        const TITLE_LENGTH_MAX = 120;
        if (!title) {
            return new MandatoryValueConstraintViolation("A title must be provided!");
        } else if (!isNonEmptyString(title)) {
            return new RangeConstraintViolation("The title must be a non-empty string!");
        } else if (title.length > TITLE_LENGTH_MAX) {
            return new StringLengthConstraintViolation(
                `The value of title must be at most ${TITLE_LENGTH_MAX} characters!`);
        }
        else {
            return new NoConstraintViolation();
        }
    }
    set title( title) {
        const validationResult = Movie.checkTitle( title);
        if (validationResult instanceof NoConstraintViolation) {
            this._title = title;
        } else {
            throw validationResult;
        }
    }

    get releaseDate() {
        return this._releaseDate;
    }
    static checkReleaseDate(rd) {
        const RELEASE_DATE_MIN = new Date("1895-12-28");
        if (!rd || rd === "") return new MandatoryValueConstraintViolation(
            "A value for the release date must be provided!"
        );
        else {
            if (new Date(rd) < RELEASE_DATE_MIN) {
                return new IntervalConstraintViolation(
                    `The value of release date must be greater than or equal to 
              ${createIsoDateString(RELEASE_DATE_MIN)}!`);
            } else {
                return new NoConstraintViolation();
            }
        }
    }
    set releaseDate( rd) {
        const validationResult = Movie.checkReleaseDate( rd);
        if (validationResult instanceof NoConstraintViolation) {
            this._releaseDate = new Date( rd);
        } else {
            throw validationResult;
        }
    }

    get director() {
        return this._director;
    }
    static checkDirector( director_id) {
        var validationResult = null;
        if (!director_id) {
            validationResult = new MandatoryValueConstraintViolation(
                "A value for the director must be provided!");
        } else {
            validationResult = new NoConstraintViolation();
        }
        return validationResult;
    }
    set director( director) {
        if (!director) {  // unset director
            delete this._director;
        } else {
            // director can be an ID reference or an object reference
            const director_id = (typeof director !== "object") ? director : director.personId;
            const validationResult = Movie.checkDirector( director_id);
            if (validationResult instanceof NoConstraintViolation) {
                // create the new director reference
                this._director = Director.instances[ director_id];
            } else {
                throw validationResult;
            }
        }
    }

    get actors() {
        return this._actors;
    }
    static checkActor( actor_id) {
        var validationResult = null;
        if (!actor_id) {
            // actor(s) are optional
            validationResult = new NoConstraintViolation();
        } else {
            validationResult = new NoConstraintViolation();
        }
        return validationResult;
    }
    addActor( actor) {
        // actor can be an ID reference or an object reference
        const actor_id = (typeof actor !== "object") ? parseInt( actor) : actor.personId;
        const validationResult = Movie.checkActor( actor_id);

        if (actor_id && validationResult instanceof NoConstraintViolation) {
            // add the new actor reference
            const key = String( actor_id);
            this._actors[key] = Actor.instances[key];
        } else {
            throw validationResult;
        }
    }
    removeActor( actor) {
        // actor can be an ID reference or an object reference
        const actor_id = (typeof actor !== "object") ? parseInt( actor) : actor.personId;
        const validationResult = Movie.checkActor( actor_id);

        if (validationResult instanceof NoConstraintViolation) {
            // delete the actor reference
            delete this._actors[String( actor_id)];
        } else {
            throw validationResult;
        }
    }
    set actors( actor) {
        this._actors = {};
        if (Array.isArray(actor)) {  // array of IdRefs
            for (const idRef of actor) {
                this.addActor( idRef);
            }
        } else {  // map of IdRefs to object references
            for (const idRef of Object.keys( actor)) {
                this.addActor( actor[idRef]);
            }
        }
    }

    get category() {
        return this._category;
    }
    static checkCategory( c) {
        if (c === undefined) {
            return new NoConstraintViolation();  // category is optional
        } else if (!isIntegerOrIntegerString( c) || parseInt( c) < 1 ||
            parseInt( c) > MovieCategoryEL.MAX) {
            return new RangeConstraintViolation(
                `Invalid value for category: ${c}`);
        } else {
            return new NoConstraintViolation();
        }
    }
    set category( c) {
        var validationResult = null;
        if (this.category) {  // already set/assigned
            validationResult = new FrozenValueConstraintViolation(
                "The category cannot be changed!");
        } else {
            validationResult = Movie.checkCategory( c);
        }
        if (validationResult instanceof NoConstraintViolation) {
            this._category = parseInt( c);
        } else {
            throw validationResult;
        }
    }

    get tvSeriesName() {
        return this._tvSeriesName;
    }
    static checkTvSeriesName( tsn, c) {
        const cat = parseInt( c);
        if (cat === MovieCategoryEL.TVSERIESEPISODE && !tsn) {
            return new MandatoryValueConstraintViolation(
                "A TV series name must be provided for a TV series episode!");
        } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && tsn) {
            return new ConstraintViolation("A TV series name must not " +
                "be provided if the movie is not a TV series episode!");
        } else if (tsn && (typeof(tsn) !== "string" || tsn.trim() === "")) {
            return new RangeConstraintViolation(
                "The TV series name must be a non-empty string!");
        } else {
            return new NoConstraintViolation();
        }
    }
    set tvSeriesName( tsn) {
        const validationResult = Movie.checkTvSeriesName( tsn, this.category);
        if (validationResult instanceof NoConstraintViolation) {
            this._tvSeriesName = tsn;
        } else {
            throw validationResult;
        }
    }

    get episodeNo() {
        return this._episodeNo;
    }
    static checkEpisodeNo( en, c) {
        const cat = parseInt( c);
        if (cat === MovieCategoryEL.TVSERIESEPISODE && !en) {
            return new MandatoryValueConstraintViolation(
                "A episode number must be provided for a TV series episode!");
        } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && en) {
            return new ConstraintViolation("A episode number must not " +
                "be provided if the movie is not a TV series episode!");
        } else if (en && !isPositiveInteger(parseInt(en))) {
            return new RangeConstraintViolation(
                "The episode number must be a positive integer!");
        } else {
            return new NoConstraintViolation();
        }
    }
    set episodeNo( en) {
        const validationResult = Movie.checkEpisodeNo( en, this.category);
        if (validationResult instanceof NoConstraintViolation) {
            this._episodeNo = en;
        } else {
            throw validationResult;
        }
    }

    get about() {
        return this._about;
    }
    static checkAbout( a, c) {
        const cat = parseInt( c);
        //??? if (!cat) cat = MovieCategoryEL.BIOGRAPHY;
        if (cat === MovieCategoryEL.BIOGRAPHY && !a) {
            return new MandatoryValueConstraintViolation(
                "A biography movie record must have an 'about' field!");
        } else if (cat !== MovieCategoryEL.BIOGRAPHY && a) {
            return new ConstraintViolation("An 'about' field value must not " +
                "be provided if the movie is not a biography!");
        } else if (a && (typeof(a) !== "string" || a.trim() === "")) {
            return new RangeConstraintViolation(
                "The 'about' field value must be a non-empty string!");
        } else {
            return new NoConstraintViolation();
        }
    }
    set about( v) {
        const validationResult = Movie.checkAbout( v, this.category);
        if (validationResult instanceof NoConstraintViolation) {
            this._about = v;
        } else {
            throw validationResult;
        }
    }

    /*********************************************************
     ***  Other Instance-Level Methods  ***********************
     **********************************************************/
    toString() {
        var movieStr = `Movie{ movie ID: ${this.movieId}, title: ${this.title}, 
        releaseDate: ${createIsoDateString(this.releaseDate)}`;
        if (this.director) movieStr += `, director: ${this.director.name}`
        if (this.actors) movieStr += `, actors: ${Object.keys( this.actors).join(",")}`
        switch (this.category) {
            case MovieCategoryEL.TVSERIESEPISODE:
                movieStr += `, [TV series episode] TV series name: ${this.tvSeriesName}, 
                episode number: ${this.episodeNo}`;
                break;
            case MovieCategoryEL.BIOGRAPHY:
                movieStr += `, [Biography] about: ${this.about}`;
                break;
        }
        return movieStr + "}";
    }
    /* Convert object to record */
    toJSON() { // is invoked by JSON.stringify in Movie.saveAll
        const rec = {};
        for (const p of Object.keys( this)) {
            // remove underscore prefix
            if (p.charAt(0) !== "_") continue;
            switch (p) {
                case "_director":
                    // convert object reference to ID reference
                    if (this._director) rec.director_id = this._director.personId;
                    break;
                case "_actors":
                    // convert the map of object references to a list of ID references
                    rec.actorIdRefs = [];
                    for (const actorIdStr of Object.keys( this.actors)) {
                        rec.actorIdRefs.push( parseInt( actorIdStr));
                    }
                    break;
                default:
                    // remove underscore prefix
                    rec[p.substr(1)] = this[p];
            }
        }
        return rec;
    }
}
/************************************************
 *** Class-level ("static") properties **********
 ************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};

/*********************************************************
 *** Class-level ("static") storage management methods ***
 *********************************************************/
/**
 * Create a new Movie record
 * @method
 */
Movie.add = function (slots) {
    var movie = null;
    try {
        movie = new Movie( slots);
    } catch (e) {
        console.log(`${e.constructor.name}: ${e.message}`);
        movie = null;
    }
    if (movie) {
        Movie.instances[movie.movieId] = movie;
        console.log(`${movie.toString()} created!`);
    }
};
/**
 * Update an existing Movie row
 * where the slots argument contains the slots to be updated and performing
 * the updates with setters makes sure that the new values are validated
 */
Movie.update = function ({movieId, title, releaseDate,
                             actorIdRefsToAdd, actorIdRefsToRemove, director_id,
                             category, tvSeriesName, episodeNo, about}) {
    const movie = Movie.instances[movieId],
        objectBeforeUpdate = cloneObject( movie);  // save the current state of movie
    var noConstraintViolated = true, updatedProperties = [];
    try {
        if (title && movie.title !== title) {
            movie.title = title;
            updatedProperties.push("title");
        }
        if (releaseDate && createIsoDateString(movie.releaseDate) !== releaseDate) {
            movie.releaseDate = releaseDate;
            updatedProperties.push("releaseDate");
        }
        if (actorIdRefsToAdd) {
            updatedProperties.push("actors(added)");
            for (let actorIdRef of actorIdRefsToAdd) {
                movie.addActor( actorIdRef);
            }
        }
        if (actorIdRefsToRemove) {
            updatedProperties.push("actors(removed)");
            for (let actor_id of actorIdRefsToRemove) {
                movie.removeActor( actor_id);
            }
        }
        if (!movie.director && director_id) {
            movie.director = director_id;
            updatedProperties.push("director");
        } else if (director_id && movie.director.personId !== parseInt(director_id)) {
            movie.director = director_id;
            updatedProperties.push("director");
        }
        if (category) {
            if (movie.category === undefined) {
                movie.category = category;
                updatedProperties.push("category");
            } else if (category !== movie.category) {
                throw new FrozenValueConstraintViolation(
                    "The movie category must not be changed!");
            }
        } else if (category === "" && "category" in movie) {
            throw new FrozenValueConstraintViolation(
                "The movie category must not be unset!");
        }
        if (tvSeriesName && movie.tvSeriesName !== tvSeriesName) {
            movie.tvSeriesName = tvSeriesName;
            updatedProperties.push("tvSeriesName");
        }
        if (episodeNo && movie.episodeNo !== episodeNo) {
            movie.episodeNo = episodeNo;
            updatedProperties.push("episodeNo");
        }
        if (about && movie.about !== about) {
            movie.about = about;
            updatedProperties.push("about");
        }
    } catch (e) {
        console.log( e.constructor.name +": "+ e.message);
        noConstraintViolated = false;
        // restore object to its state before updating
        Movie.instances[movieId] = objectBeforeUpdate;
    }
    if (noConstraintViolated) {
        if (updatedProperties.length > 0) {
            let ending = updatedProperties.length > 1 ? "ies" : "y";
            console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
        } else {
            console.log(`No property value changed for movie ${movie.movieId}!`);
        }
    }
};
/**
 * Delete an existing Movie row
 */
Movie.destroy = function (movieId) {
    if (Movie.instances[movieId]) {
        console.log(`${Movie.instances[movieId].toString()} deleted!`);
        delete Movie.instances[movieId];
    } else {
        console.log(`There is no movie with movie ID ${movieId} in the database!`);
    }
};
/**
 *  Load all movie table rows and convert them to objects
 */
Movie.retrieveAll = function () {
    var movies = {};
    try {
        if (!localStorage["movies"]) localStorage.setItem("movies", "{}");
        else {
            movies = JSON.parse( localStorage["movies"]);
            console.log( Object.keys( movies).length +" movies loaded.");
        }
    } catch (e) {
        console.error("Error when reading from Local Storage\n" + e);
    }
    for (let movieId of Object.keys( movies)) {
        try {
            Movie.instances[movieId] = new Movie( movies[movieId]);
        } catch (e) {
            console.log( `${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
        }
    }
};

/**
 * Convert movie record to movie object
 */
Movie.convertRec2Obj = function (movieRow) {
    var movie = null;
    try {
        movie = new Movie( movieRow);
    } catch (e) {
        console.log(`${e.constructor.name} while deserializing a movie record: ${e.message}`);
    }
    return movie;
};

/**
 *  Save all movie objects as records
 * @method
 * @static
 */
Movie.saveAll = function () {
    const nmrOfMovies = Object.keys( Movie.instances).length;
    try {
        localStorage["movies"] = JSON.stringify( Movie.instances);
        console.log(`${nmrOfMovies} movies records saved.`);
    } catch (e) {
        console.error("Error when writing to Local Storage\n" + e);
    }
};

export default Movie;
export { MovieCategoryEL };
