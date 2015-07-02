export function viewportWidth() {
	var vpw;
 	var webkit = (!(window.webkitConvertPointFromNodeToPage == null));
	
	// Webkit:
	if ( webkit ) {
		var vpwtest = document.createElement( "div" );
		// Sets test div to width 100%, !important overrides any other misc. box model styles that may be set in the CSS
		vpwtest.style.cssText = "width:100% !important; margin:0 !important; padding:0 !important; border:none !important;";
		document.documentElement.insertBefore( vpwtest, document.documentElement.firstChild );
		vpw = vpwtest.offsetWidth;
		document.documentElement.removeChild( vpwtest );
	}
	// IE 6-8:
	else if ( window.innerWidth === undefined ) { 
		vpw = document.documentElement.clientWidth; 
	}
	// Other:
	else{
		vpw =  window.innerWidth;
	}
 
	return (vpw);
};