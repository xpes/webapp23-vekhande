
import Person from "./Person.mjs";
import {cloneObject, isNonEmptyString } from "../../lib/util.mjs";
import { NoConstraintViolation, RangeConstraintViolation } from "../../lib/errorTypes.mjs";

/**
 * The class Actor
 * @class
 */
class Actor extends Person {
    // using a single record parameter with ES6 function parameter destructuring
    constructor ({personId, name, agent}) {
        super({personId, name});  // invoke Person constructor
        // assign additional properties
        if (agent) this.agent = agent;
    }


    get agent() {
        return this._agent;
    }
    static checkAgent(a) {
        if (!a) {
            return new NoConstraintViolation();
        } else if (!isNonEmptyString(a)) {
            return new RangeConstraintViolation("The agent must be a non-empty string!");
        } else {
            return new NoConstraintViolation();
        }
    }
    set agent(a) {
        const constraintViolation = Actor.checkAgent( a);
        if (constraintViolation instanceof NoConstraintViolation) {
            this._agent = a;
        } else {
            throw constraintViolation;
        }
    }

    toString() {
        var actStr = `Actor{ person ID: ${this.personId}, name: ${this.name}`;
        if (this.agent) actStr += `, agent: ${this.agent}`;
        return `${actStr}}`;
    }
}
/***********************************************
 *** Class-level ("static") properties **********
 ************************************************/
// initially an empty collection (in the form of a map)
Actor.instances = {};
// add Actor to the list of Person subtypes
Person.subtypes.push( Actor);

/*********************************************************
 *** Class-level ("static") storage management methods ****
 **********************************************************/
/**
 *  Create a new actor record
 */
Actor.add = function (slots) {
    var actor = null;
    try {
        actor = new Actor( slots);
    } catch (e) {
        console.log(`${e.constructor.name}: ${e.message}`);
        actor = null;
    }
    if (actor) {
        Actor.instances[actor.personId] = actor;
        console.log(`[Actor] Saved: ${actor.name}`);
    }
};

/**
 *  Update an existing actor record
 */
Actor.update = function ({personId, name, agent}) {
    const actor = Actor.instances[personId],
        objectBeforeUpdate = cloneObject( actor);
    var noConstraintViolated = true, updatedProperties = [];
    try {
        if (name && actor.name !== name) {
            actor.name = name;
            updatedProperties.push("name");
        }
        if (name && actor.agent !== agent) {
            actor.agent = agent;
            updatedProperties.push("agent");
        }
    } catch (e) {
        console.log( e.constructor.name + ": " + e.message);
        noConstraintViolated = false;
        // restore object to its state before updating
        Actor.instances[personId] = objectBeforeUpdate;
    }
    if (noConstraintViolated) {
        if (updatedProperties.length > 0) {
            const ending = updatedProperties.length > 1 ? "ies" : "y";
            console.log(`Property ${ending} ${updatedProperties.toString()} modified for actor ${name}`);
        } else {
            console.log(`No property value changed for Actor ${name}!`);
        }
    }
};

/**
 *  Delete an existing actor record
 */
Actor.destroy = function (personId) {
    const actor = Actor.instances[personId];
    delete Actor.instances[personId];
    console.log(`Actor ${actor.name} deleted.`);
};

/**
 *  Retrieve all actor objects as records
 */
Actor.retrieveAll = function () {
    var actors={};
    if (!localStorage["actors"]) localStorage["actors"] = "{}";
    try {
        actors = JSON.parse( localStorage["actors"]);
    } catch (e) {
        console.log("Error when reading from Local Storage\n" + e);
    }
    for (const key of Object.keys( actors)) {
        try {  // convert record to (typed) object
            Actor.instances[key] = new Actor( actors[key]);
            // create superclass extension
            Person.instances[key] = Actor.instances[key];
        } catch (e) {
            console.log(`${e.constructor.name} while deserializing actor ${key}: ${e.message}`);
        }
    }
    console.log(`${Object.keys( Actor.instances).length} Actor records loaded.`);
}

/**
 * Save all Actor objects as rows
 */
Actor.saveAll = function () {
    try {
        localStorage["actors"] = JSON.stringify( Actor.instances);
        console.log( Object.keys( Actor.instances).length +" actors saved.");
    } catch (e) {
        alert("Error when writing to Local Storage\n" + e);
    }
};

export default Actor;