export function clear(elementID) {
	var element = document.getElementById(elementID);

	if(element) {
		console.log("found");
		element.remove();
	} else {
		console.log("not found");
	}
}

export function alertMe(message) {
	alert("Your alert: " + message);
}