/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
 import Director from "../m/Director.mjs";
 import Person from "../m/Person.mjs";
 import { fillSelectWithOptions } from "../../lib/util.mjs";
 
 /***************************************************************
  Load data
  ***************************************************************/
 Director.retrieveAll();

 
 /***************************************************************
  Set up general, use-case-independent UI elements
  ***************************************************************/
 // set up back-to-menu buttons for all use cases
 for (const btn of document.querySelectorAll("button.back-to-menu")) {
     btn.addEventListener('click', refreshManageDataUI);
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
     Director.saveAll();
 });
 
 /**********************************************
  * Use case Retrieve/List Directors
  **********************************************/
 document.getElementById("RetrieveAndListAll").addEventListener("click", function () {
     const tableBodyEl = document.querySelector("section#Director-R > table > tbody");
     // reset view table (drop its previous contents)
     tableBodyEl.innerHTML = "";
     // populate view table
     for (const key of Object.keys( Director.instances)) {
         const director = Director.instances[key];
         const row = tableBodyEl.insertRow();
         row.insertCell().textContent = director.personId;
         row.insertCell().textContent = director.name;
     }
     document.getElementById("Director-M").style.display = "none";
     document.getElementById("Director-R").style.display = "block";
 });
 
 /**********************************************
  * Use case Create Director
  **********************************************/
 const createFormEl = document.querySelector("section#Director-C > form");
 //----- set up event handler for menu item "Create" -----------
 document.getElementById("Create").addEventListener("click", function () {
     document.getElementById("Director-M").style.display = "none";
     document.getElementById("Director-C").style.display = "block";
     createFormEl.reset();
 });
 // set up event handlers for responsive constraint validation
 createFormEl.personId.addEventListener("input", function () {
     createFormEl.personId.setCustomValidity(
         Person.checkPersonIdAsId( createFormEl.personId.value, Director).message);
 });
 createFormEl.name.addEventListener("input", function () {
     createFormEl.name.setCustomValidity(
         Person.checkName( createFormEl.name.value).message);
 });
 
 /**
  * handle save events
  */
 createFormEl["commit"].addEventListener("click", function () {
     const slots = {
         personId: createFormEl.personId.value,
         name: createFormEl.name.value
     };
     // check all input fields and show error messages
     createFormEl.personId.setCustomValidity(
         Person.checkPersonIdAsId( slots.personId).message, Director);
     createFormEl.name.setCustomValidity(
         Person.checkName( slots.name).message);
 
     // save the input data only if all form fields are valid
     if (createFormEl.checkValidity()) Director.add( slots);
 });
 // define event listener for pre-filling superclass attributes
 createFormEl.personId.addEventListener("change", function () {
     const persId = createFormEl.personId.value;
     if (persId in Person.instances) {
         createFormEl.name.value = Person.instances[persId].name;
     }
 });
 
 /**********************************************
  * Use case Update Director
  **********************************************/
 const updateFormEl = document.querySelector("section#Director-U > form");
 const updSelDirectorEl = updateFormEl.selectDirector;
 // handle click event for the menu item "Update"
 document.getElementById("Update").addEventListener("click", function () {
     // reset selection list (drop its previous contents)
     updSelDirectorEl.innerHTML = "";
     // populate the selection list
     fillSelectWithOptions( updSelDirectorEl, Director.instances,
         "personId", {displayProp:"name"});
 
     document.getElementById("Director-M").style.display = "none";
     document.getElementById("Director-U").style.display = "block";
     updateFormEl.reset();
 });
 // handle change events on employee select element
 updSelDirectorEl.addEventListener("change", handleDirectorSelectChangeEvent);
 
 
 // handle Save button click events
 updateFormEl["commit"].addEventListener("click", function () {
     const directorIdRef = updSelDirectorEl.value;
     if (!directorIdRef) return;
     const slots = {
         personId: updateFormEl.personId.value,
         name: updateFormEl.name.value,
     }
     // check name property constraint
     updateFormEl.name.setCustomValidity(
         Person.checkName( slots.name).message);
 
     // save the input data only if all of the form fields are valid
     if (updSelDirectorEl.checkValidity()) {
         Director.update( slots);
         // update the director selection list's option element
         updSelDirectorEl.options[updSelDirectorEl.selectedIndex].text = slots.name;
     }
 });
 
 /**
  * handle director selection events
  * when a director is selected, populate the form with the data of the selected director
  */
 function handleDirectorSelectChangeEvent() {
     const key = updSelDirectorEl.value;
     if (key) {
         const dir = Director.instances[key];
         updateFormEl.personId.value = dir.personId;
         updateFormEl.name.value = dir.name;
     } else {
         updateFormEl.reset();
     }
 }
 
 /**********************************************
  * Use case Delete Director
  **********************************************/
 const deleteFormEl = document.querySelector("section#Director-D > form");
 const delSelDirectorEl = deleteFormEl.selectDirector;
 //----- set up event handler for Update button -------------------------
 document.getElementById("Delete").addEventListener("click", function () {
     // reset selection list (drop its previous contents)
     delSelDirectorEl.innerHTML = "";
     // populate the selection list
     fillSelectWithOptions( delSelDirectorEl, Director.instances,
         "personId", {displayProp:"name"});
     document.getElementById("Director-M").style.display = "none";
     document.getElementById("Director-D").style.display = "block";
     deleteFormEl.reset();
 });
 // handle Delete button click events
 deleteFormEl["commit"].addEventListener("click", function () {
     const personIdRef = delSelDirectorEl.value;
     if (!personIdRef) return;
     if (confirm("Do you really want to delete this director?")) {
         Director.destroy( personIdRef);
         delSelDirectorEl.remove( delSelDirectorEl.selectedIndex);
     }
 });
 
 /**********************************************
  * Refresh the Manage Directors Data UI
  **********************************************/
 function refreshManageDataUI() {
     // show the manage director UI and hide the other UIs
     document.getElementById("Director-M").style.display = "block";
     document.getElementById("Director-R").style.display = "none";
     document.getElementById("Director-C").style.display = "none";
     document.getElementById("Director-U").style.display = "none";
     document.getElementById("Director-D").style.display = "none";
 }
 
 // Set up Manage Directors UI
 refreshManageDataUI();