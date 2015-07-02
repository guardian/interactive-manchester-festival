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
			mp4: "http://multimedia.guardianapis.com/interactivevideos/video.php?file=" + this.multimediaID + "&format=video/mp4&maxbitrate=10000",
			webm: "http://multimedia.guardianapis.com/interactivevideos/video.php?file=" + this.multimediaID + "&format=video/webm&maxbitrate=10000"
		}

		this.parent = {
			id: "video-wrapper"
		}
	}
}

export class VideoWrapper {
	constructor(el,id) {
		this.el = el;
		this.id = id;
		this.currentVideo = 0;
		this.vidWidth = 1300;
		this.vidHeight = this.vidWidth/(16/9);
		this.horizontalPosition = 0;
		this.videos = [
			new Video("video1",this.vidWidth,"d_al_intro_h264_mezzanine"),
			new Video("video2",this.vidWidth,"a_al_1_1_KP-24424807_h264_mezzanine"),
			new Video("video3",this.vidWidth,"c_al_2_1_h264_mezzanine"),
			new Video("video4",this.vidWidth,"c_al_3_1_h264_mezzanine")
		];
		this.width = this.videos.length * this.vidWidth;
		this.pageWidth = viewportWidth();
	};	

	render() {
		this.el.innerHTML = mustache.render(mainHTML, {wrapperID: this.id, videos: this.videos, width: this.width, vidWidth: this.vidWidth, vidHeight: this.vidHeight});
		this.afterRender(); 
	}

	afterRender() {
		this.innerEl = document.getElementById(this.id + "--inner");
		this.innerEl.style.paddingLeft = ((this.pageWidth - this.vidWidth)/2) + "px";
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

	checkKey() {
	    let e = e || window.event;
	    if (e.keyCode == '38') {
	        // up arrow
	    }
	    else if (e.keyCode == '40') {
	        // down arrow
	    }
	    else if (e.keyCode == '37') {
	       	this.previousVideo(); 
	    }
	    else if (e.keyCode == '39') {
	    	this.nextVideo();
	    }
	}
}