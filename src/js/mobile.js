import mustache from 'mustache'
import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import mobileHTML from './text/mobile.html!text'

function init(el, context, config, mediator) {
	reqwest({
	    url: 'http://interactive.guim.co.uk/spreadsheetdata/1Jpie3XvZBI_dd-jNzz20jJ_R3WBAY9wEzLPE3nN8r0c.json',
	    type: 'json',
	    crossOrigin: true,
	    success: function(resp) {
	    	app(el,resp);
	    }
	});
	// app(el);
	//1Jpie3XvZBI_dd-jNzz20jJ_R3WBAY9wEzLPE3nN8r0c
}

function app(el,data) {

	var explainerSet = new ExplainerMobile({
		el: el,
		template:mobileHTML,
		explainers:data.sheets.explainers,
		meta:data.sheets.meta[0],
		videos:data.sheets.videos
	});

	var throttleScroll = throttle(explainerSet.updateCheck.bind(explainerSet), 100)
	document.addEventListener('scroll', throttleScroll);
	explainerSet.updateCheck()

}

export class ExplainerMobile {
	constructor({el,template,explainers,meta,videos}) {
		this.height = (window.innerHeight*1.6 - document.getElementById("maincontent").offsetTop);
		this.template = template;
		this.el = el;
		this.explainers = explainers;
		this.meta = meta;
		this.videos = videos;
		console.log(this.meta);
		el.innerHTML = mustache.render(this.template, {explainers:this.explainers, meta:this.meta, videos:this.videos, height:this.height+"px"});
		this.explainers.map( explainer => explainer.el = el.querySelector("#explainer-"+explainer.id))
	};

	updateCheck() {
		var step = this.explainers.find( explainer => {
			var bottom = (explainer.el.getBoundingClientRect().bottom);
			return bottom>this.height/2.5;
		});

		var fade = this.explainers.find( explainer => {
			var top = (explainer.el.getBoundingClientRect().top);
			return top>-this.height/10 && top<this.height/2;
		});
		this.switchExplainer(step.gif);
		this.fadeExplainer(fade);
		this.fixie();
	};

	fixie() {
		var video = this.el.querySelector("#main-video");
		var dancer = this.el.querySelector("#explainer-dancer");
		var bottom = video.getBoundingClientRect().bottom;
		if (bottom <= 0) {
			dancer.style.position = "fixed";
		} else {
			dancer.style.position = "absolute";
			dancer.style.opacity = 0.4;
		}

	}

	switchExplainer(gif) {
		this.el.querySelector("#explainer-dancer").style.backgroundImage = "url('"+gif+"')";
	}

	fadeExplainer(fade) {
		if (fade !== undefined) {
			this.el.querySelector("#explainer-dancer").style.opacity = 0.4;
		} else {
			this.el.querySelector("#explainer-dancer").style.opacity = 1;
		}
		
	}
}

function throttle(callback, limit) {
    var wait = false;
    return function () {
        if (!wait) {
            wait = true;
            setTimeout(function () {
                wait = false;
                callback.call();
            }, limit);
        }
    }
}


(window.define || System.amdDefine)(function() { return {init: init}; });
