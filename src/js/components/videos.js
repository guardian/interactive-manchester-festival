import mustache from 'mustache'
import mainHTML from '../text/main.html!text'
import { viewportWidth } from '../components/helperFunctions'

export class Video {
	constructor(id, width, multimediaID) {
		this.width = width;
		this.height = this.width/(16/9);
		this.id = id;
		this.playing = false;
		this.multimediaID = multimediaID;

		this.sources = {
			mp4: "http://multimedia.guardianapis.com/interactivevideos/video.php?file=" + this.multimediaID + "&format=video/mp4&maxbitrate=1000",
			webm: "http://multimedia.guardianapis.com/interactivevideos/video.php?file=" + this.multimediaID + "&format=video/webm&maxbitrate=1000"
			// mp4: "http://cdn.theguardian.tv.global.prod.fastly.net/interactive/2015/06/02/Chi2_1_h264_mezzanine_4M_H264.mp4"
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
	constructor(el,id) {
		this.el = el;
		this.id = id;
		this.currentVideo = 0;
		this.pageWidth = document.getElementById("header").clientWidth;
		this.vidWidth = this.calcVidWidth(); 
		this.vidHeight = this.vidWidth/(16/9); 
		this.horizontalPosition = 0;
		this.videos = [
			new Video("video1",this.vidWidth,"a_al_1_1_KP-24424807_h264_mezzanine"),
			new Video("video2",this.vidWidth,"c_al_2_1_h264_mezzanine")
		];
		this.width = this.videos.length * this.vidWidth;
	};	

	render() {
		this.el.innerHTML = mustache.render(mainHTML, {wrapperID: this.id, videos: this.videos, width: this.width, vidWidth: this.vidWidth, vidHeight: this.vidHeight});
		this.afterRender(); 
	}

	afterRender() {
		let self = this;
		this.offsetLeft = document.querySelector(".int-main").offsetLeft;
		this.innerEl = document.getElementById(this.id + "--inner"); 

		this.videos.map(function(video) {
			video.el = document.getElementById(video.id);
		});
		this.playButton = document.querySelector(".play-button");

		this.playButton.style.top = (this.vidHeight/2 - 35) + "px";
		this.playButton.style.left = (this.vidWidth/2 - 35) + "px"; 

		document.getElementById("explainer-teaser").onclick = function() {
			if(self.videos[0].playing === true) {
				self.pauseAllVideos();
			} else {
				self.playAllVideos();  
			}
		}
	}

	nextVideo() {
		if(this.currentVideo + 1 < this.videos.length) {
			this.currentVideo++;
			var inner = this.innerEl;	
			inner.style.webkitTransform = `translate(-${this.currentVideo * this.vidWidth}px)`;
		}
	}	

	previousVideo() {
		if(this.currentVideo !== 0) {
			this.currentVideo = this.currentVideo - 1;
			var inner = this.innerEl;	
			inner.style.webkitTransform = `translate(-${this.currentVideo * this.vidWidth}px)`;
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
		this.videos.map(function(video) {
			if(video.playing === false) {
				video.playVideo();
			}
		});
		document.getElementById("video-wrapper").className = "";
	}

	setWidths() {
		let self = this;
		self.videos.map(function(video) {
			video.el.style.width = self.vidWidth;
		});
	}

	calcVidWidth() {
		if(this.pageWidth >= 1300) {
			return 1300;
		} else if(this.pageWidth >= 1140) {
			return 1140;
		} else if(this.pageWidth >= 980) {
			return 980;
		} else {
			return "auto";
		}
	}

	hasEnded() {
		this.pauseAllVideos();
	}

	checkKey() {
	    let e = e || window.event;
	    if (e.keyCode == '38') {
	    	e.preventDefault();
	        this.playAllVideos();
	    }
	    else if (e.keyCode == '40') {
	    	e.preventDefault();
	        this.pauseAllVideos();
	    }
	    else if (e.keyCode == '37') {
	       	this.previousVideo(); 
	    }
	    else if (e.keyCode == '39') {
	    	this.nextVideo();
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
			return;
		}
	}	
	
	// var timer = setInterval(function() {
	// 	for (var i = 0; i < theWrapper.videos.length; i++) { 
	// 		console.log(theWrapper.videos[i].el.currentTime);
	// 	}
	// }, 500);
}