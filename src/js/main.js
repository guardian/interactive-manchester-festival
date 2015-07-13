import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'

import { Video, VideoWrapper, playVideos } from './components/videos'

import { ExplainerSet } from './components/explainers'
import { TeaserSet } from './components/teasers'

export function init(el, context, config, mediator) {
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

    var videoWrapper = new VideoWrapper({
        el: el,
        id: "video-wrapper",
        metaData: data.sheets.meta,
        videoIds: ["2015/07/10/150710_FLEX_A_h264_mezzanine", "2015/05/13/NEWAus3_1_h264_mezzanine"]
    });



    var explainerSet = new ExplainerSet(el, videoWrapper, data.sheets.explainers, "explainer-area", "explainer-teaser", "explainer-teaser--inner");
    var teaserSet = new TeaserSet(el, videoWrapper, data.sheets.teasers, "arrow-left--text", "arrow-right--text");

    videoWrapper.videos[0].el.ontimeupdate = function() {
        explainerSet.updateCheck();
        teaserSet.updateCheck();
    }

    playVideos(videoWrapper);
}
