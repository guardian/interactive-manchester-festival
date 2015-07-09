import mustache from 'mustache'
import mainHTML from '../text/main.html!text'
import { viewportWidth, debounce } from '../components/helperFunctions'

export class Video {
	constructor(id, width, multimediaID) {
		this.width = width;
		this.height = this.width/(16/9);
		this.id = id;
		this.playing = false;
		this.multimediaID = multimediaID;

		this.sources = {
			// *** SHORT TERM HACK AROUND THE PHP REDIRECT SCRIPT *** 
			// mp4: "http://multimedia.guardianapis.com/interactivevideos/video.php?file=" + this.multimediaID + "&format=video/mp4&maxbitrate=1000",
			// webm: "http://multimedia.guardianapis.com/interactivevideos/video.php?file=" + this.multimediaID + "&format=video/webm&maxbitrate=1000"
			mp4: "http://cdn.theguardian.tv/interactive/2015/05/13/" + this.multimediaID + "_2M_H264.mp4",
			webm: "http://cdn.theguardian.tv/interactive/2015/05/13/" + this.multimediaID + "_2M_vp8.webm"
		}

		this.parent = {
			id: "video-wrapper"
		}
	}

	pauseVideo() {
		this.el.pause();
		this.playing = false;
		this.el.className = this.el.className + " faded";
	}

	playVideo() {
		this.el.play();
		this.playing = true;
		this.el.className = "";
	}
}

export class VideoWrapper {
	constructor(el,id,metaData) {
		this.el = el;
		this.id = id;
		this.currentVideo = 0;
		this.calcDimensions();  
		this.horizontalPosition = 0;
		this.videos = [
			new Video("video1",this.vidWidth,"NEWAus2_1_h264_mezzanine"),
			new Video("video2",this.vidWidth,"NEWAus3_1_h264_mezzanine")
		];
		this.metaData = metaData;
		this.width = this.videos.length * this.vidWidth;
	};	

	calcDimensions() {
		let headerHeight = document.getElementById("header").clientHeight;
		this.pageWidth = document.getElementById("header").clientWidth || viewportWidth();
		this.ratio = this.pageWidth/(window.innerHeight - headerHeight);

		if(this.ratio > 16/9) {
			this.vidHeight = window.innerHeight - headerHeight;
			this.vidWidth = this.vidHeight * (16/9);
		} else {
			this.vidWidth = this.pageWidth;
			this.vidHeight = this.vidWidth / (16/9);
		}
	}

	render() {
		this.el.innerHTML = mustache.render(mainHTML, {wrapperID: this.id, videos: this.videos, width: this.width, vidWidth: this.vidWidth, vidHeight: this.vidHeight, meta: this.metaData[0]});
		this.afterRender(); 
	}

	afterRender() {
		let self = this;
		var innerWidth = document.querySelector(".l-header__inner").clientWidth || this.pageWidth;

		this.dot = document.getElementById("dot");
		this.dots = document.getElementById("dots");

		this.innerEl = document.getElementById(this.id + "--inner"); 
		this.wrapperEl = document.getElementById(this.id);
		this.teaserEl = document.getElementById("explainer-teaser");

		this.dots.style.top = (document.getElementById("int-title").offsetTop + 25) + "px";
		this.dots.style.right = ((this.wrapperEl.clientWidth - innerWidth)/2) + "px"; 
		this.dots.className = "add-transition";

		this.videos.map(function(video) {
			video.el = document.getElementById(video.id);
		});

		this.playButton = document.querySelector(".play-button");
		this.buttonLabel = document.getElementById("int-label");
		this.playButton.style.top = (this.vidHeight/2 - 35) + "px";
		this.playButton.style.left = (this.vidWidth/2 - 35) + "px"; 

		document.getElementById("explainer-teaser").onclick = function() {
			if(self.videos[0].playing === true) {
				self.pauseAllVideos();
			} else {
				self.playAllVideos();  
			}
		}

		document.getElementById("dots").addEventListener("click", function(e) {
			var event = e || window.event;
			event.stopPropagation();
			self.toggleVideos();
		});

		window.onresize = () => debounce(this.resetWidths(),250);
	}

	nextVideo() {
		if(this.currentVideo + 1 < this.videos.length) {
			this.currentVideo++;
			var inner = this.innerEl;	
			inner.style.webkitTransform = `translate(-${this.currentVideo * this.vidWidth}px)`;
			this.dot.style.webkitTransform = `translate(${this.currentVideo * 80}px)`;
			this.buttonLabel.style.opacity = 0;
		}
	}	

	previousVideo() {
		if(this.currentVideo !== 0) {
			this.currentVideo = this.currentVideo - 1;
			var inner = this.innerEl;	
			inner.style.webkitTransform = `translate(-${this.currentVideo * this.vidWidth}px)`;
			this.dot.style.webkitTransform = `translate(${this.currentVideo * 80}px)`;
			this.buttonLabel.style.opacity = 1;
		}
	}

	pauseAllVideos() {
		this.videos.map(function(video) {
			if(video.playing === true) {
				video.pauseVideo(); 
			}
		});
		document.getElementById("video-wrapper").className = "paused";
	}

	playAllVideos() { 
		let self = this;
		this.videos.map(function(video) {
			if(self.explainerExpanded === true) {
				self.explainers.toggleExplainerVisibility(true);
			}
			if(video.playing === false) {
				video.playVideo();
			}
		});

		if(this.hideIntro === true) {
			document.getElementById("intro-area").style.opacity = 0;
			this.dots.removeAttribute("style");
			this.hideIntro = false;
		}

		document.getElementById("video-wrapper").className = "";
	}

	toggleVideos() {
		if(this.currentVideo === 0) {
			this.nextVideo();
		} else {
			this.previousVideo();
		}
	}

	resetWidths() {
		let self = this;
		this.calcDimensions();
		var innerWidth = document.querySelector(".l-header__inner").clientWidth || this.pageWidth;

		this.wrapperEl.style.width = this.vidWidth + "px";
		this.wrapperEl.style.height = this.vidHeight + "px";
		this.innerEl.style.width = this.vidWidth*this.videos.length + "px";
		this.teaserEl.style.height = this.vidHeight + "px"; 

		if(this.hideIntro === true) {
			let innerWidth = document.querySelector(".l-header__inner").clientWidth || this.pageWidth;
			this.dots.style.top = (document.getElementById("int-title").offsetTop + 25) + "px";
			this.dots.style.right = ((this.wrapperEl.clientWidth - innerWidth)/2) + "px"; 
		}

		this.videos.map(function(video) {
			video.el.style.width = self.vidWidth + "px"; 
		});
	}

	hasEnded() {
		this.pauseAllVideos();
	}

	checkKeyDown() {
	    let e = e || window.event;
	    if (e.keyCode == '38') {
	    	e.preventDefault();
	        this.playAllVideos();
	    }
	    else if (e.keyCode == '40') {
	    	e.preventDefault();
	        this.pauseAllVideos();
	    }
	    else if (e.keyCode == '32') {
			e.preventDefault();
	    	this.nextVideo();
	    }
	}

	checkKeyUp() {
		let e = e || window.event;
	    if (e.keyCode == '32') {
	    	e.preventDefault();
	    	this.previousVideo();
	    }
	}
}

export function playVideos(theWrapper) {
	var counter = 0;
	
	for (var i = 0; i < 2; i++) { 
    	theWrapper.videos[i].el.oncanplaythrough = function() {
			counter++;
			checkReady();
		}
	}

	function checkReady() {
		if(counter === 2) {
			document.getElementById("loading-overlay").remove();
			theWrapper.playAllVideos();
			theWrapper.pauseAllVideos();
			theWrapper.hideIntro = true;
			// playing then pausing will enable the videos to continue buffering further before the user hits play
			return;
		}
	}
}