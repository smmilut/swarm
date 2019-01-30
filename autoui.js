"use strict";

const stringToNumber = function stringToNumber(str) {
	return +str;
};

const getLabelElement = function getLabelElement(propName) {
	/* return HTML element Label for the input */
	const labelEl = document.createElement("label");
	labelEl.innerText = propName + " : ";
	labelEl.for = propName;
	return labelEl;
};


const getValueElement = function getValueElement(o, propName, elType, elPropertyName, convert) {
	/* return HTML element Input
		o : mother object
		propName : property name to control as Input
		elType : element type for input : text, checkbox, number, etc
		elPropertyName : property name of the Input element that contains the value
		convert : convert function to convert from string to the datatype of o.propName
	*/
	let convertFromString = convert || function noop(str) {return str;};
	let propValue = o[propName];
	const valueEl = document.createElement("input");
	valueEl.type = elType;
	valueEl[elPropertyName] = propValue;
	valueEl.name = propName;
	const onchange = function updateOnChange(ev) {
		let i_o = o;
		let i_propName = propName;
		let i_valueEl = valueEl;
		i_o[i_propName] = convertFromString(i_valueEl[elPropertyName]);
	};
	valueEl.addEventListener("change", onchange);
	return valueEl;
};

const getStringValueElement = function getStringValueElement(o, propName) {
	return getValueElement(o, propName, "text", "value");
};

const getNumberValueElement = function getNumberValueElement(o, propName) {
	const valueEl = getValueElement(o, propName, "number", "value", stringToNumber);
	// allow any step for Floats
	valueEl.step = "any";
	return valueEl;
};

const getBooleanValueElement = function getBooleanValueElement(o, propName) {
	return getValueElement(o, propName, "checkbox", "checked");
};


const getRefreshElement = function getRefreshElement(o, propName, valueEl, elPropertyName) {
	/* return HTML element Button refresh
		o : mother object
		propName : property name to control as Input
		valueEl : HTML Input element used to display the value : updated when the refresh is called
		elPropertyName : property name of the valueEl element that contains the value
	*/
	const refreshEl = document.createElement("button");
	refreshEl.innerText = "\u27F2";
	refreshEl.title = "refresh";
	
	const refresh = function refresh(ev) {
		let i_o = o;
		let i_propName = propName;
		let i_valueEl = valueEl;
		i_valueEl[elPropertyName] = i_o[i_propName];
	};
	refreshEl.addEventListener("click", refresh);
	return refreshEl;
};

const getStringRefreshElement = function getStringRefreshElement(o, propName, valueEl) {
	return getRefreshElement(o, propName, valueEl, "value");
};

const getNumberRefreshElement = function getNumberRefreshElement(o, propName, valueEl) {
	return getRefreshElement(o, propName, valueEl, "value");
};

const getBooleanRefreshElement = function getBooleanRefreshElement(o, propName, valueEl) {
	return getRefreshElement(o, propName, valueEl, "checked");
};


const getResetElement = function getResetElement(o, propName, valueEl, elPropertyName) {
	let resetValue = o[propName];
	const resetEl = document.createElement("button");
	resetEl.innerText = "\u29B4";
	resetEl.title = "reset";
	
	const reset = function reset(ev) {
		let i_o = o;
		let i_propName = propName;
		let i_valueEl = valueEl;
		i_o[i_propName] = resetValue;
		i_valueEl[elPropertyName] = resetValue;
	};
	resetEl.addEventListener("click", reset);
	return resetEl;
};

const getStringResetElement = function getStringRefreshElement(o, propName, valueEl) {
	return getResetElement(o, propName, valueEl, "value");
};

const getNumberResetElement = function getNumberRefreshElement(o, propName, valueEl) {
	return getResetElement(o, propName, valueEl, "value");
};

const getBooleanResetElement = function getBooleanRefreshElement(o, propName, valueEl) {
	return getResetElement(o, propName, valueEl, "checked");
};


const composePropertyControl = function composePropertyControl(labelEl, valueEl, refreshEl, resetEl) {
	const propEl = document.createElement("li");
	propEl.appendChild(labelEl);
	propEl.appendChild(valueEl);
	propEl.appendChild(refreshEl);
	propEl.appendChild(resetEl);
	return propEl;
};

const getObjectProperyControl = function getObjectProperyControl(o, propName) {
	let propValue = o[propName];
	let type = typeof propValue;
	if (type === "function") {
		return;
	} else if (type === "string") {
		const labelEl = getLabelElement(propName)
		const valueEl = getStringValueElement(o, propName);
		const refreshEl = getStringRefreshElement(o, propName, valueEl);
		const resetEl = getStringResetElement(o, propName, valueEl);
		return composePropertyControl(labelEl, valueEl, refreshEl, resetEl);
	} else if (type === "boolean") {
		const labelEl = getLabelElement(propName);
		const valueEl = getBooleanValueElement(o, propName);
		const refreshEl = getBooleanRefreshElement(o, propName, valueEl);
		const resetEl = getBooleanResetElement(o, propName, valueEl);
		return composePropertyControl(labelEl, valueEl, refreshEl, resetEl);
	} else if (type === "number") {
		const labelEl = getLabelElement(propName);
		const valueEl = getNumberValueElement(o, propName);
		const refreshEl = getNumberRefreshElement(o, propName, valueEl);
		const resetEl = getNumberResetElement(o, propName, valueEl);
		return composePropertyControl(labelEl, valueEl, refreshEl, resetEl);
	};
};

export const getUiForObject = function buildUiForObject(o, title) {
	const controlsEl = document.createElement("div");
	controlsEl.classList.add("autoui");
	const titleEl = document.createElement("h3");
	titleEl.innerText = title || o.toString();
	controlsEl.appendChild(titleEl);
	
	const objEl = document.createElement("ul");
	
	parseObject(o, objEl);
	
	controlsEl.appendChild(objEl);
	return controlsEl;
};

const parseObject = function parseObject(o, objEl) {
	for(let propName in o) {
		const propEl = getObjectProperyControl(o, propName);
		if (propEl) {
			objEl.appendChild(propEl);
		};
	};
};

