import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'

import { Video, VideoWrapper, playVideos } from './components/videos'

import { ExplainerSet } from './components/explainers'
import { TeaserSet } from './components/teasers'

export function init(el, context, config, mediator) {
    reqwest({
        url: 'http://interactive.guim.co.uk/spreadsheetdata/1Jpie3XvZBI_dd-jNzz20jJ_R3WBAY9wEzLPE3nN8r0c.json',
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
        videoIds: ["2015/07/14/150714_04_FLEX_A_long_h264_mezzanine", "2015/07/14/150714_03_FLEX_B_h264_mezzanine"]
    });

    var explainerSet = new ExplainerSet(el, videoWrapper, data.sheets.explainers, "explainer-area", "explainer-teaser", "explainer-teaser--inner");
    var teaserSet = new TeaserSet(el, videoWrapper, data.sheets.teasers, "arrow-left--text", "arrow-right--text");

    videoWrapper.videos[0].el.ontimeupdate = function() {
        explainerSet.updateCheck();
        teaserSet.updateCheck();
    }

    playVideos(videoWrapper);
}
