import mustache from 'mustache'
import explainerHTML from '../text/explainer.html!text'
import teaserHTML from '../text/explainer-teaser.html!text'
import { animScrollTo } from '../lib/helpers'

export class ExplainerSet {
	constructor(el,wrapper,explainerData,id,teaserId,teaserInnerId) {
		this.el = document.getElementById(id);
		this.teaserEl = document.getElementById(teaserId);
		this.teaserInnerEl = document.getElementById(teaserInnerId);
		this.videoWrapper = wrapper;
		this.explainers = explainerData;
		this.currentExplainer;

		this.setUpButton();
		this.videoWrapper.explainers = this;
	};

	updateCheck() {
		let self = this;
		this.explainers.map(function(explainer) {
			let currentTime = self.videoWrapper.videos[0].el.currentTime;
			if(currentTime > explainer.starttime && currentTime < explainer.endtime
				&& ((typeof self.currentExplainer !== 'undefined' && explainer.id !== self.currentExplainer.id) || typeof self.currentExplainer === 'undefined')) {
				self.switchExplainer(explainer);
			} else if(explainer === self.currentExplainer && currentTime > explainer.endtime) {
				self.teaserInnerEl.className = "hidden";
			}
		});
	};

	switchExplainer(nextExplainer) {
		let self = this;
		this.currentExplainer = nextExplainer;
		this.teaserInnerEl.className = "";
		this.teaserInnerEl.innerHTML = mustache.render(teaserHTML, {explainer: this.currentExplainer, tweet: encodeURIComponent(this.currentExplainer.tweet), url: encodeURIComponent(this.videoWrapper.url)});
	}

	toggleExplainerVisibility(doNotPlay) {
		if(this.teaserEl.className === "show-explainer") {
			this.teaserEl.className = "";
			this.videoWrapper.explainerExpanded = false;

			this.videoWrapper.playButton.style.opacity = 1;

			if(doNotPlay !== true) {
				this.videoWrapper.playAllVideos();
			}
		} else {
			this.teaserEl.className = "show-explainer";
			this.videoWrapper.explainerExpanded = true;

			this.videoWrapper.playButton.style.opacity = 0;

			if(doNotPlay !== true) {
				this.videoWrapper.pauseAllVideos();
			}
		}
	}

	setUpButton() {
		let self = this;
		document.querySelector("#explainer-teaser--inner").addEventListener("click", function(e) {
			var event = e || window.event;

			event.stopPropagation();

        	if(event.target.tagName.toLowerCase() !== 'a') {
				self.toggleExplainerVisibility();
			}
		});
	}
}