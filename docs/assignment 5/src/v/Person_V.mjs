import Person from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";
import {createListFromMap, fillSelectWithOptions} from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Person.retrieveAll();
Movie.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
    btn.addEventListener('click', function () {refreshManageDataUI();});
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
    frm.addEventListener("submit", function (e) {
        e.preventDefault();
        frm.reset();
    });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
    Person.saveAll();
    // also save books because books may be deleted when an personis deleted
    Movie.saveAll();
});

/**********************************************
 Use case Retrieve/List All Persons
 **********************************************/
document.getElementById("RetrieveAndListAll").addEventListener("click",
    function () {
        const tableBodyEl = document.querySelector(
            "section#Person-R > table > tbody");
        tableBodyEl.innerHTML = "";
        for (const key of Object.keys(Person.instances)) {
            const person= Person.instances[key];
            const row = tableBodyEl.insertRow();
            row.insertCell().textContent = person.personId;
            row.insertCell().textContent = person.name;
            row.insertCell().appendChild(createListFromMap(person.directedMovies, "title"));
            row.insertCell().appendChild(createListFromMap(person.playedMovies, "title"));
        }
        document.getElementById("Person-M").style.display = "none";
        document.getElementById("Person-R").style.display = "block";
    });

/**********************************************
 Use case Create Person
 **********************************************/
const createFormEl = document.querySelector("section#Person-C > form");
document.getElementById("Create").addEventListener("click", function () {
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-C").style.display = "block";
    createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.personId.addEventListener("input", function () {
    createFormEl.personId.setCustomValidity(
        Person.checkPersonIdAsId( createFormEl.personId.value).message);
});
createFormEl.name.addEventListener("input", function () {
    createFormEl.name.setCustomValidity(
        Person.checkName( createFormEl.name.value).message);
});
// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
    const slots = {
        personId: createFormEl.personId.value,
        name: createFormEl.name.value
    };
    // check all input fields and show error messages
    createFormEl.personId.setCustomValidity( Person.checkPersonIdAsId( slots.personId).message);
    createFormEl.name.setCustomValidity( Person.checkName( slots.name).message);
    // save the input data only if all form fields are valid
    if (createFormEl.checkValidity()) Person.add( slots);
});

/**********************************************
 * Use case Update Person
 **********************************************/
const updateFormEl = document.querySelector("section#Person-U > form");
const updSelPersonEl = updateFormEl.selectPerson;
document.getElementById("Update").addEventListener("click", function () {
    // reset selection list (drop its previous contents)
    updSelPersonEl.innerHTML = "";
    // populate the selection list
    fillSelectWithOptions( updSelPersonEl, Person.instances,"personId");
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-U").style.display = "block";
    updateFormEl.reset();
});
updSelPersonEl.addEventListener("change", handlePersonSelectChangeEvent);
// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
    const personIdRef = updSelPersonEl.value;
    if (!personIdRef) return;
    const slots = {
        personId: updateFormEl.personId.value,
        name: updateFormEl.name.value
    }
    // check all property constraints
    updateFormEl.personId.setCustomValidity( Person.checkPersonIdAsId( slots.personId).message);
    updateFormEl.name.setCustomValidity( Person.checkName( slots.name).message);
    // save the input data only if all of the form fields are valid
    if (updSelPersonEl.checkValidity()) {
        Person.update( slots);
        // update the personselection list's option element
        updSelPersonEl.options[updSelPersonEl.selectedIndex].text = slots.personId;
    }
});
/**
 * handle personselection events
 * when a personis selected, populate the form with the data of the selected person
 */
function handlePersonSelectChangeEvent() {
    const key = updateFormEl.selectPerson.value;
    if (key) {
        const pers = Person.instances[key];
        updateFormEl.personId.value = pers.personId;
        updateFormEl.name.value = pers.name || "";
    } else {
        updateFormEl.reset();
    }
}

/**********************************************
 * Use case Delete Person
 **********************************************/
const deleteFormEl = document.querySelector("section#Person-D > form");
const delSelPersonEl = deleteFormEl.selectPerson;
document.getElementById("Delete").addEventListener("click", function () {
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-D").style.display = "block";
    // reset selection list (drop its previous contents)
    delSelPersonEl.innerHTML = "";
    // populate the selection list
    fillSelectWithOptions( delSelPersonEl, Person.instances,"personId");
    deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
    const personIdRef = delSelPersonEl.value;
    if (!personIdRef) return;
    if (confirm( "Do you really want to delete this person?")) {
        Person.destroy( personIdRef);
        delSelPersonEl.remove( delSelPersonEl.selectedIndex);
    }
});

/**********************************************
 * Refresh the Manage Persons Data UI
 **********************************************/
function refreshManageDataUI() {
    // show the manage personUI and hide the other UIs
    document.getElementById("Person-M").style.display = "block";
    document.getElementById("Person-R").style.display = "none";
    document.getElementById("Person-C").style.display = "none";
    document.getElementById("Person-U").style.display = "none";
    document.getElementById("Person-D").style.display = "none";
}

// Set up Manage Persons UI
refreshManageDataUI();
 