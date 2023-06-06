
import {cloneObject, isNonEmptyString} from "../../lib/util.mjs";
import {
    NoConstraintViolation, MandatoryValueConstraintViolation, RangeConstraintViolation,
    UniquenessConstraintViolation, ReferentialIntegrityConstraintViolation
}
    from "../../lib/errorTypes.mjs";
/**
 * Constructor function for the class Person
 */
class Person {
    // using a single record parameter with ES6 function parameter destructuring
    constructor ({personId, name}) {
        // assign properties by invoking implicit setters
        this.personId = personId;  // number (integer)
        this.name = name;  // string
    }
    get personId() {
        return this._personId;
    }
    static checkPersonId(id) {
        if (!id) {
            return new NoConstraintViolation();  // may be optional as an IdRef
        } else {
            // convert to integer
            id = parseInt( id);
            if (isNaN( id) || !Number.isInteger( id) || id < 1) {
                return new RangeConstraintViolation("The person ID must be a positive integer!");
            } else {
                return new NoConstraintViolation();
            }
        }
    }
    /*
     Checks ID uniqueness constraint against the direct type of a Person object
     */
    static checkPersonIdAsId( id, type) {
        if (!type) type = Person;  // default
        id = parseInt( id);
        if (isNaN(id)) {
            return new MandatoryValueConstraintViolation(
                "A positive integer value for the person ID is required!");
        }
        let validationResult = Person.checkPersonId( id);
        if ((validationResult instanceof NoConstraintViolation)) {
            if (type.instances[id]) {
                validationResult = new UniquenessConstraintViolation(
                    `There is already a ${type.name} record with this person ID!`);
            } else {
                validationResult = new NoConstraintViolation();
            }
        }
        return validationResult;
    }
    static checkPersonIdAsIdRef(id) {
        var validationResult = Person.checkPersonId( id);
        if ((validationResult instanceof NoConstraintViolation) && id) {
            if (!Person.instances[id]) {
                validationResult = new ReferentialIntegrityConstraintViolation(
                    'There is no person record with this person ID!');
            }
        }
        return validationResult;
    }
    set personId( id) {
        // this.constructor may be Person or any category of it
        var validationResult = Person.checkPersonIdAsId( id, this.constructor);
        if (validationResult instanceof NoConstraintViolation) {
            this._personId = parseInt( id);
        } else {
            throw validationResult;
        }
    }
    get name() {
        return this._name;
    }
    static checkName(n) {
        if (!n) {
            return new MandatoryValueConstraintViolation("A name must be provided!");
        } else if (!isNonEmptyString(n)) {
            return new RangeConstraintViolation("The name must be a non-empty string!");
        } else {
            return new NoConstraintViolation();
        }
    }
    set name( n) {
        const constraintViolation = Person.checkName( n);
        if (constraintViolation instanceof NoConstraintViolation) {
            this._name = n;
        } else {
            throw constraintViolation;
        }
    }

    /* Convert object to string */
    toString() {
        return `Person { person ID: ${this.personId}, name: ${this.name}`;
    }
    /* Convert object to row/record */
    toJSON() {
        const rec = {};
        for (const p of Object.keys( this)) {
            // remove underscore prefix
            if (p.charAt(0) === "_") rec[p.substr(1)] = this[p];
        }
        return rec;
    }
}
/***********************************************
 *** Class-level ("static") properties **********
 ************************************************/
Person.instances = {}; // initially an empty collection (in the form of a map)
Person.subtypes = [];  // initially an empty collection (in the form of a list)
/*********************************************************
 *** Class-level ("static") storage management methods ****
 **********************************************************/
/**
 *  Create a new Person row
 */
Person.add = function (slots) {
    var person = null;
    try {
        person = new Person( slots);
    } catch (e) {
        console.log(`${e.constructor.name + ": " + e.message}`);
        person = null;
    }
    if (person) {
        Person.instances[person.personId] = person;
        console.log(`[Person] Saved: ${person.name}`);
    }
};
/**
 *  Update an existing Person record
 */
Person.update = function ({personId, name}) {
    const person = Person.instances[personId],
        objectBeforeUpdate = cloneObject( person);
    var noConstraintViolated = true, ending = "", updatedProperties = [];
    try {
        if (name && person.name !== name) {
            person.name = name;
            updatedProperties.push("name");
        }
    } catch (e) {
        console.log(`${e.constructor.name}: ${e.message}`);
        noConstraintViolated = false;
        // restore object to its state before updating
        Person.instances[personId] = objectBeforeUpdate;
    }
    if (noConstraintViolated) {
        if (updatedProperties.length > 0) {
            ending = updatedProperties.length > 1 ? "ies" : "y";
            console.log(`Propert${ending} ${updatedProperties.toString()} modified for person ${name}`);
        } else {
            console.log(`No property value changed for person ${name}!`);
        }
    }
};
/**
 *  Delete an existing person record
 */
Person.destroy = function (personId) {
    const person = Person.instances[personId];
    delete Person.instances[personId];
    // also delete this person from subtype populations
    for (const Subtype of Person.subtypes) {
        if (personId in Subtype.instances) delete Subtype.instances[personId];
    }
    console.log(`Person ${person.name} deleted.`);
};
/**
 *  Retrieve all Person objects as records
 * @method
 * @static
 */
Person.retrieveAll = function () {
    var people = {};
    if (!localStorage["people"]) localStorage["people"] = "{}";
    try {
        people = JSON.parse( localStorage["people"]);
    } catch (e) {
        console.log("Error when reading from Local Storage\n" + e);
    }
    for (const key of Object.keys( people)) {
        try {  // convert record to (typed) object
            Person.instances[key] = new Person( people[key]);
        } catch (e) {
            console.log(`${e.constructor.name} while deserializing person ${key}: ${e.message}`);
        }
    }
    // add all instances of all subtypes to Person.instances
    for (const Subtype of Person.subtypes) {
        Subtype.retrieveAll();
        for (const key of Object.keys( Subtype.instances)) {
            Person.instances[key] = Subtype.instances[key];
        }
    }
    let person = [];
    for (const key of Object.keys(Person.instances)) {
        if (Person.instances[key].constructor.name == "Person") {
            person.push(Person.instances[key]);
        }
    }
    console.log(`${Object.keys( person).length} Person records loaded.`);
};

/**
 *  Save all person objects in an entity table (a map of entity records)
 */
Person.saveAll = function () {
    const people = {};
    for (const key of Object.keys( Person.instances)) {
        const pers = Person.instances[key];
        // save only direct instances (no authors, no employees)
        if (pers.constructor === Person) people[key] = pers;
    }
    try {
        localStorage["people"] = JSON.stringify( people);
        console.log(`${Object.keys( people).length} people saved.`);
    } catch (e) {
        alert("Error when writing to Local Storage\n" + e);
    }
};

export default Person;