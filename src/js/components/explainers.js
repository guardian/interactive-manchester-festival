import mustache from 'mustache'
import explainerHTML from '../text/explainer.html!text'
import teaserHTML from '../text/explainer-teaser.html!text'
import { animScrollTo } from '../components/helperFunctions'

export class ExplainerSet {
	constructor(el,wrapper,explainerData,id,teaserId) {
		console.log(explainerData);
		this.el = document.getElementById(id);
		this.teaserEl = document.getElementById(teaserId);
		this.videoWrapper = wrapper;
		this.explainers = explainerData;
		this.currentExplainer;
		console.log(animScrollTo);
	};	

	updateCheck() {
		let self = this;
		this.explainers.map(function(explainer) {
			let currentTime = self.videoWrapper.videos[0].el.currentTime;
			if(currentTime > explainer.starttime && currentTime < explainer.endtime
				&& ((typeof self.currentExplainer !== 'undefined' && explainer.id !== self.currentExplainer.id) || typeof self.currentExplainer === 'undefined')) {
				self.switchExplainer(explainer); 
			} else if(explainer === self.currentExplainer && currentTime > explainer.endtime) {
				self.teaserEl.innerHTML = "";
			}
		});
	};

	switchExplainer(nextExplainer) {
		this.currentExplainer = nextExplainer;
		this.el.innerHTML = mustache.render(explainerHTML, {explainer: this.currentExplainer});
		this.switchTeaser(nextExplainer);

		let self = this;
		document.querySelector("#back-to-vid").onclick = function() {
			let offset = document.getElementById("video-wrapper").offsetTop;
			self.videoWrapper.playAllVideos(); 
			animScrollTo(document.body, offset+126, 1000);
		}
	}

	switchTeaser(nextExplainer) {
		this.teaserEl.innerHTML = mustache.render(teaserHTML, {explainer: this.currentExplainer}); 
		this.setUpButton();
	}

	setUpButton() { 
		let self = this;
		document.querySelector(".explainer-teaser--inner button").onclick = function() { 
			let offset = document.getElementById("explainer-area").offsetTop;
			// self.videoWrapper.pauseAllVideos(); 
			animScrollTo(document.body, offset+126, 1000);
		}
	}
}