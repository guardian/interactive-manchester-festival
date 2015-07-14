var requestAnimFrame = (function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(callback){window.setTimeout(callback,1);};})();

export var $ = document.querySelectorAll.bind(document)
export var $1 = document.querySelector.bind(document)

var easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};

export function animScrollTo(element, to, duration, callback) {
    var start = element.scrollTop,
    change = to - start,
    animationStart = +new Date();
    var animating = true;
    var lastpos = null;

    var animateScroll = function() {
        if (!animating) {
            return;
        }
        requestAnimFrame(animateScroll);
        var now = +new Date();
        var val = Math.floor(easeInOutQuad(now - animationStart, start, change, duration));
        if (lastpos) {
            if (lastpos === element.scrollTop) {
                lastpos = val;
                element.scrollTop = val;
            } else {
                animating = false;
            }
        } else {
            lastpos = val;
            element.scrollTop = val;
        }
        if (now > animationStart + duration) {
            element.scrollTop = to;
            animating = false;
            if (callback) { callback(); }
        }
    };
    requestAnimFrame(animateScroll);
};

export function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

export function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};