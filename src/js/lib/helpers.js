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

export function testBandwidth(callback, el, data) {
    var startTime = new Date().getTime();

    var checkFileSmall = 'http://cdn.theguardian.tv/interactive/speedtest/testfilesmall.dat';
    var fileSizeSmall = 1024*8;
    var checkFileLarge = 'http://cdn.theguardian.tv/interactive/speedtest/testfile.dat';
    var fileSizeLarge = 102400*8;
    var timeout = 4000;//just give up after 5 seconds

    var err = null;


    var loadSecondsLarge = 0;
    var loadSecondsSmall = 0;
    var loadedLarge = false;
    var loadedSmall = false;

    var bothLoaded = function(){
        var theFormat;
        var loadSecondsDiff = loadSecondsLarge - loadSecondsSmall;
        loadSecondsDiff = Math.max(loadSecondsDiff, 0.01);
        var fileSizeDiff = fileSizeLarge - fileSizeSmall;
        var rate = fileSizeDiff/loadSecondsDiff;

        var ratekbps = Math.round(rate*0.5/1024);

        ratekbps = Math.min(ratekbps, 10000);
        ratekbps = Math.max(ratekbps, 100);

        if(ratekbps > 4000) {
          theFormat = "4M";
        } else if(ratekbps > 2048) {
          theFormat = "2M";
        } else {
          theFormat = "768k"
        }

        if(callback){
            var temp = callback;
            callback = null;//prevent double callback
            temp(theFormat, el, data);
        }
    };

    timeFile(checkFileSmall, function(err, loadSeconds){
        //make sure dnscache is happy
        if(!err){
            timeFile(checkFileSmall, function(err, loadSeconds){
            if(!err){
                loadSecondsSmall = loadSeconds;
                loadedSmall = true;
                timeFile(checkFileLarge, function(err, loadSeconds){
                    if(!err){
                        loadSecondsLarge = loadSeconds;
                        loadedLarge = true;
                        bothLoaded();
        //              oneLoaded();
                    }
                });
            }
        });
        }
    });

    setTimeout(function(){
        if(callback){
            console.log('running from timeout');
            var temp = callback;
            callback = null;
            temp("768k", el, data);
        }
    }, 1000);
};

function timeFile(url, callback) {
    var startTime = new Date().getTime();
    url += "?bust=" + startTime;
    var err = null;
    loadScript(url, function () {
//          console.log('probably should just ignore Unexpected SyntaxError');
        var endTime = new Date().getTime();
        var loadTime = endTime - startTime;
        var loadSeconds = loadTime * 0.001;
        if(callback){
            callback(err, loadSeconds);
        }
    });
};

function loadScript(url, callback) {
    var script = document.createElement("script");
    script.charset = "utf-8";
    script.src = url;
    var done = false;
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            if(callback){
                callback();
            }
            script.onload = script.onreadystatechange = null;
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }
    };
    document.body.appendChild(script);
};