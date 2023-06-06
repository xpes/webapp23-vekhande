
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
 import Actor from "../m/Actor.mjs";
 import Person from "../m/Person.mjs";
 import { fillSelectWithOptions } from "../../lib/util.mjs";

 
 /***************************************************************
  Load data
  ***************************************************************/
 Actor.retrieveAll();
 
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
     Actor.saveAll();
 });
 
 /**********************************************
  * Use case List Actors
  **********************************************/
 document.getElementById("RetrieveAndListAll").addEventListener("click", function () {
     const tableBodyEl = document.querySelector("section#Actor-R>table>tbody");
     // reset view table (drop its previous contents)
     tableBodyEl.innerHTML = "";
     // populate view table
     for (const key of Object.keys( Actor.instances)) {
         const actor = Actor.instances[key];
         const row = tableBodyEl.insertRow();
         row.insertCell().textContent = actor.personId;
         row.insertCell().textContent = actor.name;
         row.insertCell().textContent = actor.agent;
     }
     document.getElementById("Actor-M").style.display = "none";
     document.getElementById("Actor-R").style.display = "block";
 });
 
 /**********************************************
  * Use case Create Actor
  **********************************************/
 const createFormEl = document.querySelector("section#Actor-C > form");
 //----- set up event handler for menu item "Create" -----------
 document.getElementById("Create").addEventListener("click", function () {
     document.getElementById("Actor-M").style.display = "none";
     document.getElementById("Actor-C").style.display = "block";
     createFormEl.reset();
 });
 // set up event handlers for responsive constraint validation
 createFormEl.personId.addEventListener("input", function () {
     createFormEl.personId.setCustomValidity(
         Person.checkPersonIdAsId( createFormEl.personId.value, Actor).message);
 });
 createFormEl.name.addEventListener("input", function () {
     createFormEl.name.setCustomValidity(
         Person.checkName( createFormEl.name.value).message);
 });
 createFormEl.agent.addEventListener("input", function () {
     createFormEl.agent.setCustomValidity(
         Actor.checkAgent( createFormEl.name.value).message);
 });
 
 // handle Save button click events
 createFormEl["commit"].addEventListener("click", function () {
     const agentValue = createFormEl.agent.value;
     const slots = {
         personId: createFormEl.personId.value,
         name: createFormEl.name.value,
     };
     // check all input fields and show error messages
     createFormEl.personId.setCustomValidity(
         Actor.checkPersonIdAsId( slots.personId).message, Actor);
     createFormEl.name.setCustomValidity(
         Actor.checkName( slots.name).message);
 
     if (agentValue) {
         slots.agent = agentValue;
         createFormEl.agent.setCustomValidity(
             Actor.checkAgent( slots.agent).message);
     }
 
     // save the input data only if all form fields are valid
     if (createFormEl.checkValidity()) {
         Actor.add( slots);
     }
 });
 // define event listener for pre-filling superclass attributes
 createFormEl.personId.addEventListener("change", function () {
     const persId = createFormEl.personId.value;
     if (persId in Person.instances) {
         for (const key of Object.keys( Person.instances)) {
             const actor = Person.instances[key];
            console.log(`${actor}`)}
         createFormEl.name.value = Person.instances[persId].name;
     }
 });
 
 /**********************************************
  * Use case Update Actor
  **********************************************/
 const updateFormEl = document.querySelector("section#Actor-U > form"),
     updSelActorEl = updateFormEl.selectActor;
 //----- set up event handler for menu item "Update" -----------
 document.getElementById("Update").addEventListener("click", function () {
     // reset selection list (drop its previous contents)
     updSelActorEl.innerHTML = "";
     //populate the selection list
     fillSelectWithOptions( updSelActorEl, Actor.instances,
         "personId", {displayProp:"name"});
     document.getElementById("Actor-M").style.display = "none";
     document.getElementById("Actor-U").style.display = "block";
     updateFormEl.reset();
 });
 // handle change events on actor select element
 updSelActorEl.addEventListener("change", handleActorSelectChangeEvent);
 
 updateFormEl.name.addEventListener("input", function () {
     updateFormEl.name.setCustomValidity(
         Person.checkName( updateFormEl.name.value).message);
 });
 updateFormEl.agent.addEventListener("input", function () {
     updateFormEl.agent.setCustomValidity(
         Actor.checkAgent( updateFormEl.agent.value).message);
 });
 
 // handle Save button click events
 updateFormEl["commit"].addEventListener("click", function () {
     const actorIdRef = updSelActorEl.value;
     const agentValue = updateFormEl.agent.value;
     if (!actorIdRef) return;
     const slots = {
         personId: updateFormEl.personId.value,
         name: updateFormEl.name.value,
     }
     // check all property constraints
     updateFormEl.name.setCustomValidity(
         Person.checkName( slots.name).message);
 
     if (agentValue) {
         updateFormEl.agent.setCustomValidity(
             Actor.checkAgent( agentValue).message);
         slots.agent = agentValue;
     }
 
     // save the input data only if all of the form fields are valid
     if (updSelActorEl.checkValidity()) {
         Actor.update( slots);
         // update the actor selection list's option element
         updSelActorEl.options[updSelActorEl.selectedIndex].text = slots.name;
     }
 });
 
 /**
  * handle actor selection events
  * on selection, populate the form with the data of the selected actor
  */
 function handleActorSelectChangeEvent() {
     const key = updateFormEl.selectActor.value;
     if (key) {
         const act = Actor.instances[key];
         updateFormEl.personId.value = act.personId;
         updateFormEl.name.value = act.name;
         if (act.agent) updateFormEl.agent.value = act.agent;
     } else {
         updateFormEl.reset();
     }
 }
 
 /**********************************************
  * Use case Delete Actor
  **********************************************/
 const deleteFormEl = document.querySelector("section#Actor-D > form");
 const delSelActorEl = deleteFormEl.selectActor;
 //----- set up event handler for menu item "Delete" -----------
 document.getElementById("Delete").addEventListener("click", function () {
     // reset selection list (drop its previous contents)
     delSelActorEl.innerHTML = "";
     // populate the selection list
     fillSelectWithOptions( delSelActorEl, Actor.instances,
         "personId", {displayProp:"name"});
     document.getElementById("Actor-M").style.display = "none";
     document.getElementById("Actor-D").style.display = "block";
     deleteFormEl.reset();
 });
 // handle Delete button click events
 deleteFormEl["commit"].addEventListener("click", function () {
     const personIdRef = delSelActorEl.value;
     if (!personIdRef) return;
     if (confirm("Do you really want to delete this actor?")) {
         Actor.destroy( personIdRef);
         delSelActorEl.remove( delSelActorEl.selectedIndex);
     }
 });
 
 /**********************************************
  * Refresh the Manage Actors Data UI
  **********************************************/
 function refreshManageDataUI() {
     // show the manage actor UI and hide the other UIs
     document.getElementById("Actor-M").style.display = "block";
     document.getElementById("Actor-R").style.display = "none";
     document.getElementById("Actor-C").style.display = "none";
     document.getElementById("Actor-U").style.display = "none";
     document.getElementById("Actor-D").style.display = "none";
 }
 
 // Set up Manage Actors UI
 refreshManageDataUI();