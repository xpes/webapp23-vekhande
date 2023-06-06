/**
 * @fileOverview  Defines utility procedures/functions
 * @author Gerd Wagner
 */
// *************** I N T E G E R - Related *************************************
function isIntegerOrIntegerString (x) {
  return Number.isInteger( parseInt(x));
}
/**
 * Verifies if a value represents a non-negative integer
 * @param {number} x
 * @return {boolean}
 */
function isNonNegativeInteger(x) {
  return Number.isInteger(x) && x >= 0;
}
/**
 * Verifies if a value represents a positive integer
 * @param {number} x
 * @return {boolean}
 */
function isPositiveInteger(x) {
  return Number.isInteger(x) && x > 0;
}
// *************** D A T E - Related ****************************************
/**
 * Verifies if a string represents an ISO date string, which have the format YYYY-MM-DD
 * @param {string} ds
 * @return {string}
 */
function isNotIsoDateString (ds) {
  var dateArray=[], YYYY=0, MM= 0, DD=0;
  if (typeof(ds) !== "string") return "Date value must be a string!";
  dateArray = ds.split("-");
  if (dateArray.length < 3) return "Date string has less than 2 dashes!";
  YYYY = parseInt( dateArray[0]);
  MM = parseInt( dateArray[1]);
  DD = parseInt( dateArray[2]);
  if (!Number.isInteger(YYYY) || YYYY<1000 || YYYY>9999) return "YYYY out of range!";
  if (!Number.isInteger(MM) || MM<1 || MM>12) return "MM out of range!";
  if (!Number.isInteger(DD) || DD<1 || DD>31) return "MM out of range!";
  return "";
}
/**
 * Serialize a Date object as an ISO date string
 * @return  YYYY-MM-DD
 */
function createIsoDateString (d) {
  return d.toISOString().substring(0,10);
}
/**
 * Return the next year value (e.g. if now is 2013 the function will return 2014)
 * @return the integer representing the next year value
 */
function nextYear () {
  var date = new Date();
  return (date.getFullYear() + 1);
}
// *************** D O M - Related ****************************************
/**
 * Create a DOM element
 *
 * @param {string} elemName
 * @param {string} id [optional]
 * @param {string} classValues [optional]
 * @param {string} txt [optional]
 *
 * @return {object}
 */
function createElement (elemName, id, classValues, txt) {
  var el = document.createElement( elemName);
  if (id) el.id = id;
  if (classValues) el.className = classValues;
  if (txt) el.textContent = txt;
  return el;
}
function createDiv (id, classValues, txt) {
  return createElement("div", id, classValues, txt);
}
function createSpan (id, classValues, txt) {
  return createElement("span", id, classValues, txt);
}
/**
 * Create a Push Button
 * @param {string} txt [optional]
 * @return {object}
 */
function createPushButton( txt) {
  var pB = document.createElement("button");
  pB.type = "button";
  if (txt) pB.textContent = txt;
  return pB;
}
/**
 * Create a DOM option element
 *
 * @param {string} val
 * @param {string} txt
 * @param {string} classValues [optional]
 *
 * @return {object}
 */
function createOption (val, txt, classValues) {
  var el = document.createElement("option");
  el.value = val;
  el.text = txt;
  if (classValues) el.className = classValues;
  return el;
}
/**
 * Create a time element from a Date object
 *
 * @param {object} d
 * @return {object}
 */
function createTimeElem (d) {
  var tEl = document.createElement("time");
  tEl.textContent = d.toLocaleDateString();
  tEl.datetime = d.toISOString();
  return tEl;
}
/**
 * Create a list element from an map of objects
 *
 * @param {object} aa  An map of objects
 * @param {string} displayProp  The object property to be displayed in the list
 * @return {object}
 */
function createListFromAssocArray (aa, displayProp) {
  var listEl = document.createElement("ul");
  fillListFromMap( listEl, aa, displayProp);
  return listEl;
}
/**
 * Fill a list element with items from an map of objects
 *
 * @param {object} listEl  A list element
 * @param {object} aa  An map of objects
 * @param {string} displayProp  The object property to be displayed in the list
 */
function fillListFromMap (listEl, aa, displayProp) {
  const keys = Object.keys( aa);
  // delete old contents
  listEl.innerHTML = "";
  // create list items from object property values
  for (const key of keys) {
    const listItemEl = document.createElement("li");
    listItemEl.textContent = aa[keys[j]][displayProp];
    listEl.appendChild( listItemEl);
  }
}
/**
 * Fill a select element with option elements created from an
 * map of objects
 *
 * @param {object} selectEl  A select(ion list) element
 * @param {object|array} selectionRange  A map of objects or an array
 * @param {string} keyProp [optional]  The standard identifier property
 * @param {object} optPar [optional]  A record of optional parameter slots
 *                 including optPar.displayProp and optPar.selection
 */
function fillSelectWithOptions(selectEl, selectionRange, keyProp, optPar) {
  var optionEl = null, obj = null, displayProp = "";
  // delete old contents
  selectEl.innerHTML = "";
  // create "no selection yet" entry
  if (!selectEl.multiple) selectEl.add( createOption(""," --- "));
  // create option elements from object property values
  var options = Array.isArray( selectionRange) ? selectionRange : Object.keys( selectionRange);
  for (let i=0; i < options.length; i++) {
    if (Array.isArray( selectionRange)) {
      optionEl = createOption( i, options[i]);
    } else {
      const key = options[i];
      const obj = selectionRange[key];
      if (!selectEl.multiple) obj.index = i+1;  // store selection list index
      if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
      else displayProp = keyProp;
      optionEl = createOption( key, obj[displayProp]);
      // if invoked with a selection argument, flag the selected options
      if (selectEl.multiple && optPar && optPar.selection &&
          optPar.selection[keyProp]) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      }
    }
    selectEl.add( optionEl);
  }
}
//***************  M I S C  ****************************************
/**
 * Retrieves the type of a value, either a data value of type "Number", "String" or "Boolean",
 * or an object of type "Function", "Array", "HTMLDocument", ..., or "Object"
 * @param {any} val
 */
function typeName(val) {
  // stringify val and extract the word following "object"
  var typeName = Object.prototype.toString.call(val).match(/^\[object\s(.*)\]$/)[1];
  // special case: null is of type "Null"
  if (val === null) return "Null";
  // special case: instance of a user-defined class or ad-hoc object
  if (typeName === "Object") return val.constructor.name || "Object";
  // all other cases: "Number", "String", "Boolean", "Function", "Array", "HTMLDocument", ...
  return typeName;
}

/**
 * Creates a typed "data clone" of an object
 * Notice that Object.getPrototypeOf(obj) === obj.__proto__
 * === Movie.prototype when obj has been created by new Movie(...)
 *
 * @param {object} obj
 */
function cloneObject(obj) {
  var clone = Object.create( Object.getPrototypeOf(obj));
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      if (typeof obj[p] === "number" ||
          typeof obj[p] === "string" ||
          typeof obj[p] === "boolean" ||
          typeName(obj[p]) === "Function" ||
          (typeName(obj[p]) === "Date" && obj[p] != null)) {
        clone[p] = obj[p];
      }
      // else clone[p] = cloneObject(obj[p]);
    }
  }
  return clone;
}
/**
 * Retrieve the direct supertype of a given class.
 * @author Gerd Wagner
 * @return {boolean}
 */
function getSuperType(Class) {
  return Class.prototype.__proto__.constructor
}

/**
 * Verifies if a value represents an integer
 * @param {string} x
 * @return {boolean}
 */
function isNonEmptyString(x) {
  return typeof(x) === "string" && x.trim() !== "";
}

/**
 * Create a list element from an map of objects
 *
 * @param {object} eTbl  An entity table
 * @param {string} displayProp  The object property to be displayed in the list
 * @return {object}
 */
function createListFromMap( eTbl, displayProp) {
  const listEl = document.createElement("ul");
  fillListFromMapOld( listEl, eTbl, displayProp);
  return listEl;
}
/**
 * Fill a list element with items from an entity table
 *
 * @param {object} listEl  A list element
 * @param {object} eTbl  An entity table
 * @param {string} displayProp  The object property to be displayed in the list
 */
function fillListFromMapOld( listEl, eTbl, displayProp) {
  const keys = Object.keys( eTbl);
  // delete old contents
  listEl.innerHTML = "";
  // create list items from object property values
  for (const key of keys) {
    const listItemEl = document.createElement("li");
    if (eTbl[key]) {
      listItemEl.textContent = eTbl[key][displayProp];
      listEl.appendChild( listItemEl);
    }
  }
}

// *************** Multiple Choice Widget ****************************************
/**
 * Create the contents of an Multiple Choice widget, which is a div containing
 * 1) a choice list (a list of chosen items), where each item has a delete button,
 * 2) a div containing a select element and an add button allowing to add a selected item
 *    to the association list
 *
 * @param {object} widgetContainerEl  The widget's container div
 * @param {object} selectionRange  An map of objects, which is used to
 *                 create the options of the select element
 * @param {object} selection  An map of objects, which is used to
 *                 fill the selection list
 * @param {string} keyProp  The standard identifier property of the range object type
 * @param {string} optPar [optional]  An optional record of optional parameter slots,
 *                 including "displayProp"
 */
function createMultipleChoiceWidget(widgetContainerEl, selection, selectionRange,
                                    keyProp, displayProp, minCard) {
  var assocListEl = document.createElement("ul"),  // shows associated objects
      selectEl = document.createElement("select"),
      el = null;
  if (!minCard) minCard = 0;  // default
  // delete old contents
  widgetContainerEl.innerHTML = "";
  // create association list items from property values of associated objects
  if (!displayProp) displayProp = keyProp;
  fillChoiceSet( assocListEl, selection, keyProp, displayProp);
  // event handler for removing an associated item from the association list
  assocListEl.addEventListener( 'click', function (e) {
    var listItemEl = null, listEl = null;
    if (e.target.tagName === "BUTTON") {  // delete/undo button
      listItemEl = e.target.parentNode;
      listEl = listItemEl.parentNode;
      if (listItemEl.classList.contains("removed")) {
        // undoing a previous removal
        listItemEl.classList.remove("removed");
        // change button text
        e.target.textContent = "✕";
      } else if (listItemEl.classList.contains("added")) {
        // removing an added item means moving it back to the selection range
        listItemEl.parentNode.removeChild( listItemEl);
        const optionEl = createOption( listItemEl.getAttribute("data-value"),
            listItemEl.firstElementChild.textContent);
        selectEl.add( optionEl);
      } else {
        // removing an ordinary item
        listItemEl.classList.add("removed");
        // change button text
        e.target.textContent = "undo";
      }
    }
  });
  widgetContainerEl.appendChild( assocListEl);
  el = document.createElement("div");
  el.appendChild( selectEl);
  el.appendChild( createPushButton("add"));
  // event handler for adding an item from the selection list to the association list
  selectEl.parentNode.addEventListener( 'click', function (e) {
    var assocListEl = e.currentTarget.parentNode.firstElementChild,
        selectEl = e.currentTarget.firstElementChild;
    if (e.target.tagName === "BUTTON") {  // add button
      if (selectEl.value) {
        addItemToChoiceSet( assocListEl, selectEl.value,
            selectEl.options[selectEl.selectedIndex].textContent, "added");
        selectEl.remove( selectEl.selectedIndex);
        selectEl.selectedIndex = 0;
      }
    }
  });
  widgetContainerEl.appendChild( el);
  // create select options from selectionRange minus selection
  fillMultipleChoiceWidgetWithOptions( selectEl, selectionRange, keyProp,
      {"displayProp": displayProp, "selection": selection});
}

/**
 * Fill a Choice Set element with items
 *
 * @param {object} listEl  A list element
 * @param {object} selection  An entity table for filling the Choice Set
 * @param {string} keyProp  The standard ID property of the entity table
 * @param {string} displayProp  A text property of the entity table
 */
function fillChoiceSet( listEl, selection, keyProp, displayProp) {
  var options = [], obj = null;
  // delete old contents
  listEl.innerHTML = "";
  // create list items from object property values
  options = Object.keys( selection);
  for (const j of options.keys()) {
    obj = selection[options[j]];
    addItemToChoiceSet( listEl, obj[keyProp], obj[displayProp]);
  }
}

/**
 * Add an item to a Choice Set element
 *
 * @param {object} listEl  A list element
 * @param {string} stdId  A standard identifier of an object
 * @param {string} humanReadableId  A human-readable ID of the object
 */
function addItemToChoiceSet(listEl, stdId, humanReadableId, classValue) {
  var listItemEl = null, el = null;
  listItemEl = document.createElement("li");
  listItemEl.setAttribute("data-value", stdId);
  el = document.createElement("span");
  el.textContent = humanReadableId;
  listItemEl.appendChild( el);
  el = createPushButton("✕");
  listItemEl.appendChild( el);
  if (classValue) listItemEl.classList.add( classValue);
  listEl.appendChild( listItemEl);
}

/**
 * Fill the select element of an Multiple Choice Widget with option elements created
 * from the selectionRange minus an optional selection set specified in optPar
 *
 * @param {object} aa  An map of objects
 * @param {object} selList  A select(ion list) element
 * @param {string} keyProp  The standard identifier property
 * @param {object} optPar [optional]  An record of optional parameter slots
 *                 including optPar.displayProp and optPar.selection
 */
function fillMultipleChoiceWidgetWithOptions(selectEl, selectionRange, keyProp, optPar) {
  var options = [], obj = null, displayProp = "";
  // delete old contents
  selectEl.innerHTML = "";
  // create "no selection yet" entry
  selectEl.add( createOption(""," --- "));
  // create option elements from object property values
  options = Object.keys( selectionRange);
  for (const i of options.keys()) {
    // if invoked with a selection argument, only add options for objects
    // that are not yet selected
    if (!optPar || !optPar.selection || !optPar.selection[options[i]]) {
      obj = selectionRange[options[i]];
      if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
      else displayProp = keyProp;
      selectEl.add( createOption( obj[keyProp], obj[displayProp]));
    }
  }
}

/**
 * * Create a choice control (radio button or checkbox) element
 *
 * @param {string} t  The type of choice control ("radio" or "checkbox")
 * @param {string} n  The name of the choice control input element
 * @param {string} v  The value of the choice control input element
 * @param {string} lbl  The label text of the choice control
 * @return {object}
 */
function createLabeledChoiceControl( t,n,v,lbl) {
  var ccEl = document.createElement("input"),
      lblEl = document.createElement("label");
  ccEl.type = t;
  ccEl.name = n;
  ccEl.value = v;
  lblEl.appendChild( ccEl);
  lblEl.appendChild( document.createTextNode( lbl));
  return lblEl;
}

/**
 * Create a choice widget in a given fieldset element.
 * A choice element is either an HTML radio button or an HTML checkbox.
 * @method
 */
function createChoiceWidget( containerEl, fld, values,
                             choiceWidgetType, choiceItems, isMandatory) {
  const choiceControls = containerEl.querySelectorAll("label");
  // remove old content
  for (const j of choiceControls.keys()) {
    containerEl.removeChild( choiceControls[j]);
  }
  if (!containerEl.hasAttribute("data-bind")) {
    containerEl.setAttribute("data-bind", fld);
  }
  // for a mandatory radio button group initialze to first value
  if (choiceWidgetType === "radio" && isMandatory && values.length === 0) {
    values[0] = 1;
  }
  if (values.length >= 1) {
    if (choiceWidgetType === "radio") {
      containerEl.setAttribute("data-value", values[0]);
    } else {  // checkboxes
      containerEl.setAttribute("data-value", "["+ values.join() +"]");
    }
  }
  for (const j of choiceItems.keys()) {
    // button values = 1..n
    const el = createLabeledChoiceControl( choiceWidgetType, fld,
        j+1, choiceItems[j]);
    // mark the radio button or checkbox as selected/checked
    if (values.includes(j+1)) el.firstElementChild.checked = true;
    containerEl.appendChild( el);
    el.firstElementChild.addEventListener("click", function (e) {
      const btnEl = e.target;
      if (choiceWidgetType === "radio") {
        if (containerEl.getAttribute("data-value") !== btnEl.value) {
          containerEl.setAttribute("data-value", btnEl.value);
        } else if (!isMandatory) {
          // turn off radio button
          btnEl.checked = false;
          containerEl.setAttribute("data-value", "");
        }
      } else {  // checkbox
        let values = JSON.parse( containerEl.getAttribute("data-value")) || [];
        let i = values.indexOf( parseInt( btnEl.value));
        if (i > -1) {
          values.splice(i, 1);  // delete from value list
        } else {  // add to value list
          values.push( btnEl.value);
        }
        containerEl.setAttribute("data-value", "["+ values.join() +"]");
      }
    });
  }
  return containerEl;
}


export { cloneObject, isIntegerOrIntegerString, fillSelectWithOptions,
  isPositiveInteger, createIsoDateString, isNonEmptyString,
  createMultipleChoiceWidget, createListFromMap, createChoiceWidget};