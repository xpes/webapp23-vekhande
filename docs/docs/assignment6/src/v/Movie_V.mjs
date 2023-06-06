
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
 import Person from "../m/Person.mjs";
 import Movie, { MovieCategoryEL } from "../m/Movie.mjs";
 import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"
 import {
     createIsoDateString,
     createMultipleChoiceWidget,
     createListFromMap,
     fillSelectWithOptions
 } from "../../lib/util.mjs";
 import Director from "../m/Director.mjs";
 import Actor from "../m/Actor.mjs";
 
 /***************************************************************
  Load data
  ***************************************************************/
 Person.retrieveAll();
 Movie.retrieveAll();
 
 /***************************************************************
  Set up general, use-case-independent UI elements
  ***************************************************************/
 /**
  * Setup User Interface
  */
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
     Movie.saveAll();
 });
 
 /**********************************************
  * Use case Retrieve/List Movies
  **********************************************/
 document.getElementById("RetrieveAndListAll")
     .addEventListener("click", function () {
         const tableBodyEl = document.querySelector("section#Movie-R > table > tbody");
         // reset view table (drop its previous contents)
         tableBodyEl.innerHTML = "";
         // populate view table
         for (const key of Object.keys( Movie.instances)) {
             const movie = Movie.instances[key];
             const actorListEl = createListFromMap( movie.actors, "name");
             const row = tableBodyEl.insertRow();
             row.insertCell().textContent = movie.movieId;
             row.insertCell().textContent = movie.title;
             row.insertCell().textContent = createIsoDateString(movie.releaseDate);
             row.insertCell().textContent =
                 movie.director ? movie.director.name : "";
             row.insertCell().appendChild( actorListEl);
             row.insertCell().textContent = MovieCategoryEL.labels[movie.category -1]
             row.insertCell().textContent = movie.tvSeriesName
             row.insertCell().textContent = movie.episodeNo
             row.insertCell().textContent = movie.about
             // row.insertCell().appendChild( actorListEl);
             // if (movie.category) {
             //     switch (movie.category) {
             //         case MovieCategoryEL.TVSERIESEPISODE:
             //             row.insertCell().textContent = movie.tvSeriesName
             //             row.insertCell().textContent = movie.episodeNo
             //             break;
             //         case MovieCategoryEL.BIOGRAPHY:
             //             row.insertCell().textContent = movie.about;
             //             break;
             //     }
             // }
         }
         document.getElementById("Movie-M").style.display = "none";
         document.getElementById("Movie-R").style.display = "block";
     });
 
 /**********************************************
  * Use case Create Movie
  **********************************************/
 const createFormEl = document.querySelector("section#Movie-C > form"),
     selectActorsEl = createFormEl.selectActors,
     selectDirectorEl = createFormEl.selectDirector,
     selectCategorySelectEl = createFormEl.category;
 //----- set up event handler for menu item "Create" -----------
 document.getElementById("Create").addEventListener("click", function () {
     document.getElementById("Movie-M").style.display = "none";
     document.getElementById("Movie-C").style.display = "block";
 
     // set up a single selection list for selecting a director
     fillSelectWithOptions( selectDirectorEl, Director.instances, "personId", {displayProp: "name"});
     // set up a multiple selection list for selecting actors
     fillSelectWithOptions( selectActorsEl, Actor.instances,
         "personId", {displayProp: "name"});
 
     undisplayAllSegmentFields( createFormEl, MovieCategoryEL.labels);
     createFormEl.reset();
 });
 // set up event handlers for responsive constraint validation
 createFormEl.movieId.addEventListener("input", function () {
     createFormEl.movieId.setCustomValidity(
         Movie.checkMovieIdAsId( createFormEl.movieId.value).message);
 });
 createFormEl.title.addEventListener("input", function () {
     createFormEl.title.setCustomValidity(
         Movie.checkTitle( createFormEl.title.value).message);
 });
 createFormEl.releaseDate.addEventListener("input", function () {
     createFormEl.releaseDate.setCustomValidity(
         Movie.checkReleaseDate(createFormEl.releaseDate.value).message);
 });
 createFormEl.selectDirector.addEventListener("input", function () {
     createFormEl.selectDirector.setCustomValidity(
         Movie.checkDirector(createFormEl.selectDirector.value).message);
 });
 
 createFormEl.tvSeriesName.addEventListener("input", function () {
     createFormEl.tvSeriesName.setCustomValidity(
         Movie.checkTvSeriesName( createFormEl.tvSeriesName.value,
             parseInt( createFormEl.category.value) + 1).message);
 });
 createFormEl.episodeNo.addEventListener("input", function () {
     createFormEl.episodeNo.setCustomValidity(
         Movie.checkEpisodeNo(createFormEl.episodeNo.value,
             parseInt( createFormEl.category.value) + 1).message);
 });
 createFormEl.about.addEventListener("input", function () {
     createFormEl.about.setCustomValidity(
         Movie.checkAbout( createFormEl.about.value,
             parseInt( createFormEl.category.value) + 1).message);
 });
 
 // set up the movie category selection list
 fillSelectWithOptions( selectCategorySelectEl, MovieCategoryEL.labels);
 selectCategorySelectEl.addEventListener("change", handleCategorySelectChangeEvent);
 
 // handle Save button click events
 createFormEl["commit"].addEventListener("click", function () {
     const categoryStr = createFormEl.category.value;
     const slots = {
         movieId: createFormEl.movieId.value,
         title: createFormEl.title.value,
         releaseDate: createFormEl.releaseDate.value,
         actorIdRefs: [],
         director_id: createFormEl.selectDirector.value
     };
 
     if (categoryStr) {
         // enum literal indexes start with 1
         slots.category = parseInt( categoryStr) + 1;
         switch (slots.category) {
             case MovieCategoryEL.TVSERIESEPISODE:
                 slots.tvSeriesName = createFormEl.tvSeriesName.value;
                 createFormEl.tvSeriesName.setCustomValidity(
                     Movie.checkTvSeriesName( createFormEl.tvSeriesName.value, slots.category).message);
                 slots.episodeNo = createFormEl.episodeNo.value;
                 createFormEl.episodeNo.setCustomValidity(
                     Movie.checkEpisodeNo( createFormEl.episodeNo.value, slots.category).message);
                 break;
             case MovieCategoryEL.BIOGRAPHY:
                 slots.about = createFormEl.about.value;
                 createFormEl.about.setCustomValidity(
                     Movie.checkAbout( createFormEl.about.value, slots.category).message);
                 break;
         }
     }
     // check all input fields and show error messages
     createFormEl.movieId.setCustomValidity(
         Movie.checkMovieIdAsId( slots.movieId).message);
 
     createFormEl.title.setCustomValidity(
         Movie.checkTitle( slots.title).message);
 
     createFormEl.releaseDate.setCustomValidity(
         Movie.checkReleaseDate( slots.releaseDate).message);
 
     // get the list of selected actors
     const selActorOptions = createFormEl.selectActors.selectedOptions;
     // check the mandatory value constraint for director
     createFormEl.selectDirector.setCustomValidity(
         createFormEl.selectDirector.value.length > 0 ? "" : "No director selected!"
     );
 
     // save the input data only if all form fields are valid
     if (createFormEl.checkValidity()) {
         // construct a list of actor ID references
         for (const opt of selActorOptions) {
             slots.actorIdRefs.push( opt.value);
         }
         Movie.add( slots);
         // un-render all segment/category-specific fields
         undisplayAllSegmentFields( createFormEl, MovieCategoryEL.labels);
     }
 });
 
 /**********************************************
  * Use case Update Movie
  **********************************************/
 const updateFormEl = document.querySelector("section#Movie-U > form"),
     updateSelectMovieEl = updateFormEl["selectMovie"],
     updateSelectCategoryEl = updateFormEl["category"];
 undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
 // handle click event for the menu item "Update"
 document.getElementById("Update").addEventListener("click", function () {
     // reset selection list (drop its previous contents)
     updateSelectMovieEl.innerHTML = "";
     // populate the selection list
     fillSelectWithOptions( updateSelectMovieEl, Movie.instances,
         "movieId", {displayProp:"title"});
     document.getElementById("Movie-M").style.display = "none";
     document.getElementById("Movie-U").style.display = "block";
     updateFormEl.reset();
 });
 updateSelectMovieEl.addEventListener("change", handleMovieSelectChangeEvent);
 // set up the movie category selection list
 fillSelectWithOptions( updateSelectCategoryEl, MovieCategoryEL.labels);
 updateSelectCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);
 
 
 // responsive validation of form fields for segment properties
 updateFormEl.tvSeriesName.addEventListener("input", function () {
     updateFormEl.tvSeriesName.setCustomValidity(
         Movie.checkTvSeriesName( updateFormEl.tvSeriesName.value,
             parseInt( updateFormEl.category.value) + 1).message);
 });
 updateFormEl.episodeNo.addEventListener("input", function () {
     updateFormEl.episodeNo.setCustomValidity(
         Movie.checkEpisodeNo( updateFormEl.episodeNo.value,
             parseInt( updateFormEl.category.value) + 1).message);
 });
 updateFormEl.about.addEventListener("input", function () {
     updateFormEl.about.setCustomValidity(
         Movie.checkAbout( updateFormEl.about.value,
             parseInt( updateFormEl.category.value) + 1).message);
 });
 
 // handle Save button click events
 updateFormEl["commit"].addEventListener("click", function () {
     const categoryStr = updateFormEl.category.value;
     const movieIdRef = updateSelectMovieEl.value,
         selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
         multiChoiceListEl = selectActorsWidget.firstElementChild;
     if (!movieIdRef) return;
     const slots = {
         movieId: updateFormEl.movieId.value,
         title: updateFormEl.title.value,
         releaseDate: updateFormEl.releaseDate.value,
         director_id: updateFormEl.selectDirector.value
     };
     if (categoryStr) {
         slots.category = parseInt( categoryStr) + 1;
         switch (slots.category) {
             case MovieCategoryEL.TVSERIESEPISODE:
                 slots.tvSeriesName = updateFormEl.tvSeriesName.value;
                 updateFormEl.tvSeriesName.setCustomValidity(
                     Movie.checkTvSeriesName( slots.tvSeriesName, slots.category).message);
                 slots.episodeNo = updateFormEl.episodeNo.value;
                 updateFormEl.episodeNo.setCustomValidity(
                     Movie.checkEpisodeNo( slots.episodeNo, slots.category).message);
                 break;
             case MovieCategoryEL.BIOGRAPHY:
                 slots.about = updateFormEl.about.value;
                 updateFormEl.about.setCustomValidity(
                     Movie.checkAbout( slots.about, slots.category).message);
                 break;
         }
     }
     // check all input fields and show error messages
     updateFormEl.movieId.setCustomValidity( Movie.checkMovieId( slots.movieId).message);
     /* Incomplete code: no on-submit validation of "title" and "releaseDate" */
 
     // commit the update only if all form field values are valid
     if (updateFormEl.checkValidity()) {
         // construct actorIdRefs-ToAdd/ToRemove lists from the association list
         const actorIdRefsToAdd = [], actorIdRefsToRemove = [];
         for (const mcListItemEl of multiChoiceListEl.children) {
             if (mcListItemEl.classList.contains("removed")) {
                 actorIdRefsToRemove.push( mcListItemEl.getAttribute("data-value"));
             }
             if (mcListItemEl.classList.contains("added")) {
                 actorIdRefsToAdd.push( mcListItemEl.getAttribute("data-value"));
             }
         }
         // if the add/remove list is non-empty create a corresponding slot
         if (actorIdRefsToRemove.length > 0) {
             slots.actorIdRefsToRemove = actorIdRefsToRemove;
         }
         if (actorIdRefsToAdd.length > 0) {
             slots.actorIdRefsToAdd = actorIdRefsToAdd;
         }
         Movie.update( slots);
         // un-render all segment/category-specific fields
         undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
         // update the movie selection list's option element
         updateSelectMovieEl.options[updateSelectMovieEl.selectedIndex].text = slots.title;
         selectActorsWidget.innerHTML = "";
     }
 });
 
 /**
  * handle movie selection events
  * when a movie is selected, populate the form with the data of the selected movie
  */
 function handleMovieSelectChangeEvent () {
     const movieId = updateFormEl.selectMovie.value,
         saveButton = updateFormEl.commit,
         selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
         selectDirectorEl = updateFormEl.selectDirector;
     if (movieId) {
         const movie = Movie.instances[movieId];
         updateFormEl.movieId.value = movie.movieId;
         updateFormEl.title.value = movie.title;
         updateFormEl.releaseDate.value = createIsoDateString(movie.releaseDate);
 
         // set up the associated director selection list
         fillSelectWithOptions( selectDirectorEl, Director.instances, "personId", {displayProp: "name"});
         // set up the associated actors selection widget
         createMultipleChoiceWidget( selectActorsWidget, movie.actors,
             Actor.instances, "personId", "name", 0);  // minCard=0
         // assign associated director as the selected option to select element
         if (movie.director) updateFormEl.selectDirector.value = movie.director.personId;
         saveButton.disabled = false;
 
         if (movie.category) {
             updateFormEl.category.selectedIndex = movie.category;
             // disable category selection (category is frozen)
             updateFormEl.category.disabled = "disabled";
             // show category-dependent fields
             displaySegmentFields( updateFormEl, MovieCategoryEL.labels, movie.category);
             switch (movie.category) {
                 case MovieCategoryEL.TVSERIESEPISODE:
                     updateFormEl.tvSeriesName.value = movie.tvSeriesName;
                     updateFormEl.episodeNo.value = movie.episodeNo;
                     updateFormEl.about.value = "";
                     break;
                 case MovieCategoryEL.BIOGRAPHY:
                     updateFormEl.about.value = movie.about;
                     updateFormEl.tvSeriesName.value = "";
                     updateFormEl.episodeNo.value = "";
                     break;
             }
         } else {  // movie has no value for category
             updateFormEl.category.value = "";
             updateFormEl.category.disabled = "";   // enable category selection
             updateFormEl.tvSeriesName.value = "";
             updateFormEl.episodeNo.value = "";
             updateFormEl.about.value = "";
             undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
         }
     } else {
         updateFormEl.reset();
         updateFormEl.selectDirector.selectedIndex = 0;
         selectActorsWidget.innerHTML = "";
         saveButton.disabled = true;
     }
 }
 
 /**********************************************
  * Use case Delete Movie
  **********************************************/
 const deleteFormEl = document.querySelector("section#Movie-D > form");
 const delSelMovieEl = deleteFormEl.selectMovie;
 // set up event handler for Update button
 document.getElementById("Delete").addEventListener("click", function () {
     // reset selection list (drop its previous contents)
     delSelMovieEl.innerHTML = "";
     // populate the selection list
     fillSelectWithOptions( delSelMovieEl, Movie.instances,
         "movieId", {displayProp:"title"});
     document.getElementById("Movie-M").style.display = "none";
     document.getElementById("Movie-D").style.display = "block";
     deleteFormEl.reset();
 });
 // handle Delete button click events
 deleteFormEl["commit"].addEventListener("click", function () {
     const movieIdRef = delSelMovieEl.value;
     if (!movieIdRef) return;
     if (confirm("Do you really want to delete this movie?")) {
         Movie.destroy( movieIdRef);
         delSelMovieEl.remove( delSelMovieEl.selectedIndex);
     }
 });
 
 
 /**********************************************
  * Refresh the Manage Movies Data UI
  **********************************************/
 function refreshManageDataUI() {
     // show the manage movie UI and hide the other UIs
     document.getElementById("Movie-M").style.display = "block";
     document.getElementById("Movie-R").style.display = "none";
     document.getElementById("Movie-C").style.display = "none";
     document.getElementById("Movie-U").style.display = "none";
     document.getElementById("Movie-D").style.display = "none";
 }
 
 /**
  * event handler for movie category selection events
  * used both in create and update
  */
 function handleCategorySelectChangeEvent (e) {
     const formEl = e.currentTarget.form,
         // the array index of MovieCategoryEL.labels
         categoryIndexStr = formEl.category.value;
     if (categoryIndexStr) {
         displaySegmentFields( formEl, MovieCategoryEL.labels,
             parseInt( categoryIndexStr) + 1);
     } else {
         undisplayAllSegmentFields( formEl, MovieCategoryEL.labels);
     }
 }
 
 // Set up Manage Movies UI
 refreshManageDataUI();