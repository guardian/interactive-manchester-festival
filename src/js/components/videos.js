import mustache from 'mustache'
import mainHTML from '../text/main.html!text'
import { $1, debounce, throttle } from '../lib/helpers'
import bonzo from 'ded/bonzo'

export class Video {
    constructor(multimediaID, format) {
        this.playing = false;
        this.multimediaID = multimediaID;
        this.format = format;

        this.sources = {
            // mp4: "http://multimedia.guardianapis.com/interactivevideos/video.php?file=" + this.multimediaID + "&format=video/mp4&maxbitrate=1000",
            // webm: "http://multimedia.guardianapis.com/interactivevideos/video.php?file=" + this.multimediaID + "&format=video/webm&maxbitrate=1000"

            // *** SHORT TERM HACK AROUND THE PHP REDIRECT SCRIPT ***
            mp4: "http://cdn.theguardian.tv/interactive/" + this.multimediaID + "_" + this.format + "_H264.mp4",
            webm: "http://cdn.theguardian.tv/interactive/" + this.multimediaID + "_" + this.format + "_vp8.webm"
        }

        this.parent = {
            id: "video-wrapper"
        }
    }

    pause() {
        this.el.pause();
        this.playing = false;
        this.el.className = this.el.className + " faded";
    }

    play() {
        this.el.play();
        this.playing = true;
        this.el.className = "";
    }

    seek(time) {
        this.el.currentTime = time;
    }
}

export class VideoWrapper {
    constructor({el, id, metaData, videoIds, format}) {
        this.el = el;
        this.id = id;
        this.currentVideo = 0;
        var headerEl = $1("#header");
        this.headerHeight = headerEl ? headerEl.clientHeight : 0;
        this.meta = metaData[0];
        this.videos = videoIds.map(id => new Video(id, format));
        this.url = window.location.href;

        this.el.innerHTML = mustache.render(mainHTML, this);

        Array.prototype.slice.call(this.el.querySelectorAll('video'))
            .map((el, i) => this.videos[i].el = el)

        this.transformProperties = ['webkitTransform', 'mozTransform', 'msTransform', 'transform']

        this.dot = $1("#dot")
        this.dots = $1("#dots")
        this.innerEl = $1(`.video-wrapper__videos`)
        this.wrapperEl = $1(`#${this.id}`)
        this.teaserEl = $1("#explainer-teaser")
        this.playButton = $1(".play-button")
        this.buttonLabel = $1("#dots__label")
        this.introAreaEl = $1("#intro-area")
        this.scrubberEl = $1('.video-wrapper__scrubber')
        this.scrubberProgressEl = $1('.video-wrapper__scrubber span')

        this.resetDimensions();
        this.initEventBindings();
        this.initScrubber();

        this.dots.className = 'add-transition'; // adding this here stops transition on load
    };

    initEventBindings() {

        this.wrapperEl.addEventListener('click', e => {
        	if(e.target.tagName.toLowerCase() !== 'a') {
            	if(this.videos[0].playing === true) this.pauseAllVideos();
            	else this.playAllVideos();
        	}
        })

        $1("#dots").addEventListener("click", e => {
            e.stopPropagation();
            this.toggleVideos();
        })

        window.addEventListener('resize', debounce(this.resetDimensions.bind(this),250))
        document.addEventListener('keydown', this.checkKeyDown.bind(this))
        document.addEventListener('keyup', this.checkKeyUp.bind(this))
        this.videos[0].el.addEventListener('ended', this.hasEnded.bind(this));

        // user active state
        var deactivateTimeout;
        var setActive = e => {
            this.wrapperEl.setAttribute('active', '');
            window.clearTimeout(deactivateTimeout);
            deactivateTimeout = window.setTimeout(_ => this.wrapperEl.removeAttribute('active'), 1000);
        };
        document.addEventListener('mousemove', throttle(setActive, 200, {leading: true}))
    }

    initScrubber() {
        // progress
        this.videos[0].el.addEventListener('timeupdate', e => {
            var vidEl = e.target;
            var progress = vidEl.currentTime / vidEl.duration;
            this.scrubberProgressEl.style.width = `${(progress * 100).toFixed(3)}%`;
        });

        // seek behaviour
        this.scrubberEl.addEventListener('click', e => {
            e.stopPropagation();
            var clickPosition = e.offsetX / this.scrubberEl.getBoundingClientRect().width;
            var seekTime = (this.videos[0].el.duration * clickPosition).toFixed(2);

            // temporarily disable transition for seeking
            this.scrubberProgressEl.style.transition = 'none';
            this.scrubberProgressEl.style.width = `${(clickPosition * 100).toFixed(3)}%`;
            window.setTimeout(_ => this.scrubberProgressEl.style.removeProperty('transition'), 10)

            this.seekVideos(seekTime);
        });
    }


    seekVideos(time) {
        this.videos.forEach(vid => vid.seek(time))
    }

    nextVideo() {
        if(this.currentVideo < 1) {
            this.currentVideo++;
            this.setStyleTransforms();
            this.buttonLabel.style.opacity = 0;
        }
    }

    previousVideo() {
        if(this.currentVideo !== 0) {
            this.currentVideo = this.currentVideo - 1;
            this.setStyleTransforms();
            this.buttonLabel.style.opacity = 1;
        }
    }

    setStyleTransforms() {
        this.transformProperties.forEach(prop => {
            this.innerEl.style[prop] = `translate(-${this.currentVideo * this.vidWidth}px)`;
            this.dot.style[prop] = `translate(${this.currentVideo * 112}px)`;
        })
    }

    pauseAllVideos() {
        this.videos.map(function(video) {
            if(video.playing === true) {
                video.pause();
            }
        });
        this.wrapperEl.setAttribute('paused', '');
    }

    playAllVideos() {
        this.started = true;
        this.wrapperEl.setAttribute('started', '');

        this.videos.map( video => {
            if(this.explainerExpanded === true) {
                this.explainers.toggleExplainerVisibility(true);
            }
            if(video.playing === false) {
                video.play();
            }
        });

        this.introAreaEl.style.opacity = 0;
        this.dots.removeAttribute("style");
        this.wrapperEl.removeAttribute('paused');
        this.wrapperEl.removeAttribute('ended');
    }

    toggleVideos() {
        if(this.currentVideo === 0) {
            this.nextVideo();
        } else {
            this.previousVideo();
        }
    }

    resetDimensions() {
    	let self = this;
        this.ratio = window.innerWidth/(window.innerHeight - this.headerHeight);

        if(this.ratio > 16/9) {
            this.vidHeight = window.innerHeight - this.headerHeight;
            this.vidWidth = this.vidHeight * (16/9);
        } else {
            this.vidWidth = window.innerWidth;
            this.vidHeight = this.vidWidth / (16/9);
        }

        this.wrapperEl.style.width = this.vidWidth + "px";
        this.wrapperEl.style.height = this.vidHeight + "px";
        this.innerEl.style.width = (this.vidWidth*2*this.videos.length + 0.1 /*0.1 fixes ff style bug*/) + "px";
        this.teaserEl.style.height = this.vidHeight + "px";

        var contentPaddingSize = (this.wrapperEl.clientWidth - this.introAreaEl.clientWidth) / 2;

        if (this.started) {
            this.playButton.style.top = (this.vidHeight/2 - 35) + "px";
            this.playButton.style.left = (this.vidWidth/2 - 35) + "px";
        } else {
            this.playButton.style.top = `${this.introAreaEl.offsetTop - 10}px`
            this.playButton.style.left = `${contentPaddingSize}px`;
        }

        if (this.started) this.dots.removeAttribute('style');
        else {
            this.dots.style.top = `${this.introAreaEl.offsetTop + 25}px`;
            this.dots.style.right = `${contentPaddingSize + 20}px`;
        }

        this.videos.map(function(video) {
        	video.el.style.width = self.vidWidth*2 + "px"; video.el.load();
        });
    }

    hasEnded() {
        this.pauseAllVideos();
        this.wrapperEl.setAttribute('ended', '');
    }

    checkKeyDown(e) {
        if (e.keyCode === 38) {
            e.preventDefault();
            this.playAllVideos();
        }
        else if (e.keyCode === 40) {
            e.preventDefault();
            this.pauseAllVideos();
        }
        else if (e.keyCode === 32) {
            e.preventDefault();
            this.nextVideo();
        }
    }

    checkKeyUp(e) {
        if (e.keyCode === 32) {
            e.preventDefault();
            this.previousVideo();
        }
    }

    onCanplaythrough() {
        bonzo($1("#loading-overlay")).remove();
        this.wrapperEl.setAttribute('paused', '');
        // playing then pausing will enable the videos to
        // continue buffering further before the user hits play
        this.videos.forEach(v => { v.play(); v.pause(); })
    }
}

export function playVideos(theWrapper) {
    var counter = 0;

    for (var i = 0; i < 1; i++) {
        theWrapper.videos[i].el.addEventListener('canplaythrough', _ => {
            if (++counter === 1) theWrapper.onCanplaythrough();
        })
    }
}