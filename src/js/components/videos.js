import mustache from 'mustache'
import mainHTML from '../text/main.html!text'
import { $1, viewportWidth, debounce } from '../lib/helpers'
import bonzo from 'ded/bonzo'

export class Video {
    constructor(multimediaID) {
        this.playing = false;
        this.multimediaID = multimediaID;

        this.sources = {
            // mp4: "http://multimedia.guardianapis.com/interactivevideos/video.php?file=" + this.multimediaID + "&format=video/mp4&maxbitrate=1000",
            // webm: "http://multimedia.guardianapis.com/interactivevideos/video.php?file=" + this.multimediaID + "&format=video/webm&maxbitrate=1000"

            // *** SHORT TERM HACK AROUND THE PHP REDIRECT SCRIPT ***
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
    constructor({el, id, metaData, videoIds}) {
        this.el = el;
        this.id = id;
        this.currentVideo = 0;
        this.calcDimensions();
        this.horizontalPosition = 0;
        this.videoIds = videoIds;
        this.metaData = metaData[0];
        this.width = this.videoIds.length * this.vidWidth;
        this.videos = videoIds.map(id => new Video(id));
        this.el.innerHTML = mustache.render(mainHTML, this);
        var videoEls = Array.prototype.slice.call(this.el.querySelectorAll('video'))
        console.log(videoEls)
        videoEls.map((el, i) => this.videos[i].el = el)

        this.transformProperties = ['webkitTransform', 'mozTransform', 'msTransform', 'transform']

        this.afterRender();
    };

    calcDimensions() {
        let headerHeight = $1("#header").clientHeight;
        this.pageWidth = $1("#header").clientWidth || viewportWidth();
        this.ratio = this.pageWidth/(window.innerHeight - headerHeight);

        if(this.ratio > 16/9) {
            this.vidHeight = window.innerHeight - headerHeight;
            this.vidWidth = this.vidHeight * (16/9);
        } else {
            this.vidWidth = this.pageWidth;
            this.vidHeight = this.vidWidth / (16/9);
        }
    }

    afterRender() {
        var innerWidth = document.querySelector(".l-header__inner").clientWidth || this.pageWidth;

        this.dot = $1("#dot");
        this.dots = $1("#dots");

        this.innerEl = $1(`#${this.id}--inner`);
        this.wrapperEl = $1(`#${this.id}`);
        this.teaserEl = $1("#explainer-teaser");

        this.dots.style.top = ($1("#int-title").offsetTop + 25) + "px";
        this.dots.style.right = ((this.wrapperEl.clientWidth - innerWidth)/2) + "px";
        this.dots.className = "add-transition";

        this.playButton = document.querySelector(".play-button");
        this.buttonLabel = $1("#int-label");
        this.playButton.style.top = (this.vidHeight/2 - 35) + "px";
        this.playButton.style.left = (this.vidWidth/2 - 35) + "px";

        $1("#explainer-teaser").addEventListener('click', e => {
            if(this.videos[0].playing === true) this.pauseAllVideos();
            else this.playAllVideos();
        })

        $1("#dots").addEventListener("click", e => {
            e.stopPropagation();
            this.toggleVideos();
        })

        window.addEventListener('resize', debounce(this.resetWidths.bind(this),250))


        document.addEventListener('keydown', this.checkKeyDown.bind(this))
        document.addEventListener('keyup', this.checkKeyUp.bind(this))

        this.videos[0].el.addEventListener('ended', this.hasEnded.bind(this));

    }

    nextVideo() {
        if(this.currentVideo + 1 < this.videos.length) {
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
            this.dot.style[prop] = `translate(${this.currentVideo * 80}px)`;
        })
    }

    pauseAllVideos() {
        this.videos.map(function(video) {
            if(video.playing === true) {
                video.pauseVideo();
            }
        });
        $1("#video-wrapper").className = "paused";
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
            $1("#intro-area").style.opacity = 0;
            this.dots.removeAttribute("style");
            this.hideIntro = false;
        }

        $1("#video-wrapper").className = "";
    }

    toggleVideos() {
        if(this.currentVideo === 0) {
            this.nextVideo();
        } else {
            this.previousVideo();
        }
    }

    resetWidths() {
        this.calcDimensions();
        var innerWidth = document.querySelector(".l-header__inner").clientWidth || this.pageWidth;

        this.wrapperEl.style.width = this.vidWidth + "px";
        this.wrapperEl.style.height = this.vidHeight + "px";
        this.innerEl.style.width = this.vidWidth*this.videos.length + "px";
        this.teaserEl.style.height = this.vidHeight + "px";

        this.playButton.style.top = (this.vidHeight/2 - 35) + "px";
        this.playButton.style.left = (this.vidWidth/2 - 35) + "px";

        if(this.hideIntro === true) {
            let innerWidth = document.querySelector(".l-header__inner").clientWidth || this.pageWidth;
            this.dots.style.top = ($1("#int-title").offsetTop + 25) + "px";
            this.dots.style.right = ((this.wrapperEl.clientWidth - innerWidth)/2) + "px";
        }

        this.videos.map(video => video.el.style.width = this.vidWidth + "px");
    }

    hasEnded() {
        this.pauseAllVideos();
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
}

export function playVideos(theWrapper) {
    var counter = 0;

    for (var i = 0; i < 2; i++) {
        theWrapper.videos[i].el.addEventListener('canplaythrough', _ => { counter++; checkReady(); })
    }

    function checkReady() {
        if(counter === 2) {
            bonzo($1("#loading-overlay")).remove();
            theWrapper.playAllVideos();
            theWrapper.pauseAllVideos();
            theWrapper.hideIntro = true;
            // playing then pausing will enable the videos to continue buffering further before the user hits play
            return;
        }
    }
}