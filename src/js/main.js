import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'

import { Video, VideoWrapper } from './components/videos'

function init(el, context, config, mediator) {
	// reqwest({
	//     url: 'http://ip.jsontest.com/',
	//     type: 'json',
	//     crossOrigin: true,
	//     success: function(resp) {
	//     	el.innerHTML = mustache.render(mainHTML, {message: "Hello there, your ip is ", ip: resp.ip});
	//     	app(el);
	//     }
	// });
	app(el);
}

function app(el) {
	var videoWrapper = new VideoWrapper(el, "video-wrapper");
	videoWrapper.render();

	document.onkeydown = () => videoWrapper.checkKey();
}


(window.define || System.amdDefine)(function() { return {init: init}; });
