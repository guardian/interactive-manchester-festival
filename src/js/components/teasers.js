export class TeaserSet {
	constructor(el,wrapper,teaserData,arrowLeftText,arrowRightText) {		
		this.videoWrapper = wrapper;
		this.teasers = teaserData;
		this.arrowLeft = document.getElementById("arrow-left");
		this.arrowRight = document.getElementById("arrow-right");
		this.arrowLeftText = document.getElementById(arrowLeftText);
		this.arrowRightText = document.getElementById(arrowRightText);
		this.currentTeaser;

		this.setupButtons();
	};	

	updateCheck() {
		// console.log(this.arrowLeftText);
		// console.log(this.arrowRightText);
		let self = this;
		this.teasers.map(function(teaser) {
			let currentTime = self.videoWrapper.videos[0].el.currentTime;
			if(currentTime > teaser.starttime && currentTime < teaser.endtime
				&& ((typeof self.currentTeaser !== 'undefined' && teaser.id !== self.currentTeaser.id) || typeof self.currentTeaser === 'undefined')) {
				self.switchTeaser(teaser,currentTime); 
			} else if(teaser === self.currentTeaser && currentTime > teaser.endtime) {
				if(self.currentTeaser.videototease === 2) {
					self.arrowLeftText.innerHTML = "";
				} else if(self.currentTeaser.videototease === 1) {
					self.arrowRightText.innerHTML = "";
				}
			}
		});
	};

	setupButtons() {
		let self = this;

		this.arrowRight.addEventListener("click", function(e) {
			alert("right");
			var event = e || window.event;
			event.stopPropagation();
			self.videoWrapper.previousVideo();
		});

		this.arrowLeft.addEventListener("click", function(e) {
			alert("left");
			var event = e || window.event;
			event.stopPropagation();
			self.videoWrapper.nextVideo();
		});

	}

	switchTeaser(nextTeaser,currentTime) {
		this.currentTeaser = nextTeaser;

		if(this.currentTeaser.videototease === 2) {
			this.arrowLeftText.innerHTML = this.currentTeaser.words;
		} else if(this.currentTeaser.videototease === 1) {
			this.arrowRightText.innerHTML = this.currentTeaser.words;
		}
	}
} 