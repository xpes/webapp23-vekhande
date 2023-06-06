
import Person from "./Person.mjs";
import Movie from "./Movie.mjs";
import { cloneObject } from "../../lib/util.mjs";

/**
 * The class Director
 * @class
 */
class Director extends Person {
    // using a single record parameter with ES6 function parameter destructuring
    constructor ({personId, name}) {
        super({personId, name});  // invoke Person constructor
    }

    toString() {
        return `Director{ person ID: ${this.personId}, name: ${this.name}}`;
    }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Director.instances = {};
// add Director to the list of Person subtypes
Person.subtypes.push( Director);

/*********************************************************
*** Class-level ("static") storage management methods ****
**********************************************************/
/**
 * Create a new Employee row
 * @method 
 * @static
 * @param {{personId: string, name: string, empNo: number}} slots - A record of parameters.
 */
Director.add = function (slots) {
  var director = null;
  try {
      director = new Director( slots);
  } catch (e) {
      console.log(`${e.constructor.name + ": " + e.message}`);
      director = null;
  }
  if (director) {
      Director.instances[director.personId] = director;
      console.log(`[Director] Saved: ${director.name}`);
  }
};
/**
 * Update an existing Employee row
 * @method 
 * @static
 * @param {{personId: string, name: string, empNo: number}} slots - A record of parameters.
 */
Director.update = function ({personId, name}) {
  const director = Director.instances[personId],
      objectBeforeUpdate = cloneObject( director);
  var noConstraintViolated=true, updatedProperties=[];
  try {
      if (name && director.name !== name) {
          director.name = name;
          updatedProperties.push("name");
      }
  } catch (e) {
      console.log( e.constructor.name + ": " + e.message);
      noConstraintViolated = false;
      // restore object to its state before updating
      Director.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
      if (updatedProperties.length > 0) {
          const ending = updatedProperties.length > 1 ? "ies" : "y";
          console.log(`Propert${ending} ${updatedProperties.toString()} modified for director ${name}`);
      } else {
          console.log(`No property value changed for director ${name}!`);
      }
  }
};
/**
 * Delete an existing Employee row
 * @method 
 * @static
 * @param {string} personId - The ID of a person.
 */
Director.destroy = function (personId) {
  const director = Director.instances[personId];
  for (const movieId of Object.keys( Movie.instances)) {
      const movie = Movie.instances[movieId];

      if (movie.director && movie.director.name === director.name) {
          delete movie._director;  // delete the slot
          console.log(`Movie ${movie.movieId} updated.`);
      }
  }
  delete Director.instances[personId];
  console.log(`Director ${director.name} deleted.`);
};

/**
*  Retrieve all director objects as records
*/
Director.retrieveAll = function () {
  var directors = {};
  if (!localStorage["directors"]) localStorage["directors"] = "{}";
  try {
      directors = JSON.parse( localStorage["directors"]);
  } catch (e) {
      console.log("Error when reading from Local Storage\n" + e);
  }
  for (const key of Object.keys( directors)) {
      try {  // convert record to (typed) object
          Director.instances[key] = new Director( directors[key]);
          // create superclass extension
          Person.instances[key] = Director.instances[key];
      } catch (e) {
          console.log(`${e.constructor.name} while deserializing director ${key}: ${e.message}`);
      }
  }
  console.log(`${Object.keys( Director.instances).length} Director records loaded.`);
};

/**
 * Save all Employee objects as rows
 * @method
 * @static
 */
Director.saveAll = function () {
  try {
      localStorage["directors"] = JSON.stringify( Director.instances);
      console.log( Object.keys( Director.instances).length +" directors saved.");
  } catch (e) {
      alert("Error when writing to Local Storage\n" + e);
  }
};

export default Director;