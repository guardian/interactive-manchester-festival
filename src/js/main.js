import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'

import { Video, VideoWrapper, playVideos } from './components/videos'

import { ExplainerSet } from './components/explainers'

function init(el, context, config, mediator) {
	reqwest({
	    url: 'http://interactive.guim.co.uk/spreadsheetdata/1H5ZvNP_oBxOjk-HAnWmHWwRJ1Sig6U1clMeryd8fPeg.json',
	    type: 'json',
	    crossOrigin: true,
	    success: function(resp) {
	    	app(el,resp);
	    }
	});
	// app(el);
}

function app(el,data) {
	var videoWrapper = new VideoWrapper(el, "video-wrapper");
	videoWrapper.render();

	var explainerSet = new ExplainerSet(el, videoWrapper, data.sheets.explainers, "explainer-area", "explainer-teaser");

	document.onkeydown = () => videoWrapper.checkKey();

	videoWrapper.videos[0].el.ontimeupdate = () => explainerSet.updateCheck();
	videoWrapper.videos[0].el.onended = () => videoWrapper.hasEnded();

	playVideos(videoWrapper);
}



(window.define || System.amdDefine)(function() { return {init: init}; });
