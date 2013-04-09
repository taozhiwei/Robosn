!function(undefined) {
	'use strict';
	var HACK_NAME = '貘吃馍香'; // user name monitored
	var SEC = 1;		    // prevent flush time interval
	var INTERVAL = 5;		    // monitor time interval

	var ABOUT_ME = 1;
	var DIRTY = 2;
	var DIE = 3;
	var UGLY = 4;
	var CAWAYI = 5;
	var IDOL = 6; 
	var TECH = 7;

	var _counter = {};
	var _processedMidList = [];
	var _wordsMap = {
		'bosn': ABOUT_ME, '霍雍': ABOUT_ME,
		'屎': DIRTY, '死': DIRTY, '傻': DIRTY, '2b': DIRTY, 'sb': DIRTY, '猪': DIRTY, 'pig': DIRTY, '脑残': DIRTY, 'bitch': DIRTY, '碧池': DIRTY, '小鳮鳮' : DIRTY, '鸡鸡': DIRTY, '豬' : DIRTY,
		'走好': DIE,
		'丑': UGLY,
		'js': TECH, 'javascript': TECH, 'v8': TECH, 'chrome': TECH, 'dom': TECH, 'sql': TECH,
		'偶': CAWAYI, '活活活': CAWAYI,
		'马云' : IDOL, 'winter': IDOL, 'franky': IDOL, 'erik' : IDOL
	};
	var ev = document.createEvent('HTMLEvents');
	ev.initEvent('click', true, true);
	var lastTime = new Date();
	lastTime.setTime(new Date().getTime() - 1000 * SEC * 2);

	setInterval(function() {
		console.log('tick' + new Date().getTime());
		var eleUpdate = $('[node-type=feed_list_newBar]')[0];
		eleUpdate && eleUpdate.dispatchEvent(ev);

		var i, j, k = 0;
		var toBeProcessed = $('[action-type="feed_list_forward"]');
		var keyMap
		for (i = 0; i < toBeProcessed.length; i++) {
			var ele = toBeProcessed[i];
			var data = ele.getAttribute('action-data');
			var map = {};
			var arr = data.split('&');
			for (j = 0; j < arr.length; j++) {
				var item = arr[j].split('=');
				var key = item[0];
				var val = item[1];
				if (key && val) {
					map[key] = val;
				}
			}

			if (isProcessed(map)) {
				continue;
			}
			
			if (map.name == HACK_NAME) {
				console.log('new post of ' + map.name + ' found!');
				// don't process forward post
				if (map.rootuid) {
					console.log('found rootuid, so this is a forward post, ignored, rootid=' + map.rootuid);
					_processedMidList.push(map.mid);
					continue;
				}

				console.log('found it! mid=' + map.mid + ', ' + new Date());
				var content = $(ele).parent().parent().parent().find('.WB_text').html();
				process(ele, map, content.toLowerCase()); 
				_processedMidList.push(map.mid);
			}

		}
	}, 1000 * INTERVAL);


	function isProcessed(map) {
		for (var i = 0; i < _processedMidList.length; i++)
			if (_processedMidList[i] - 0 == map.mid - 0)
				return true;
		return false;
	}

	function process(ele, map, content) {
		console.log('processing:mid=' + map.mid);
		var i, w;
		// flush prevent
		if (new Date().getTime() - lastTime.getTime() < 1000 * SEC)
			return;

		var mine = '';
		var matched = false;
		var matchedWord = '';
		var matchedKey = null;

		for (w in _wordsMap) {
			if (content.indexOf(w) != -1) {
				matchedWord = w;
				matchedKey = _wordsMap[w];
				matched = true;
				break;
			}
		}

		if (!matched) {
			console.log('no matched key, returned');
			return;
		}
		ele.dispatchEvent(ev);
		var oldVal = $('textarea.W_input')[0].value;

		mine = getResponse(matchedKey, matchedWord);
		console.log('mine words:' + mine);

		if (oldVal && oldVal.length > 100) {
			oldVal = oldVal.substring(0, 100);
		}
		$('textarea.W_input')[0].value = mine + oldVal;

		// comment to forward post
		//var ctl1 = $('[node-type="forwardInput"]');
		// ctl1 && ctl1[0] && (ctl1[0].checked = true);

		// comment to original post
		var ctl2 = $('[node-type="originInput"]');
		ctl2 && ctl2[0] && (ctl2[0].checked = true);
		$('[node-type="submit"]')[0].dispatchEvent(ev);
		lastTime = new Date();
	}

	/**
	 * get response to one matched key
	 *
	 * @param {string} key
	 */
	function getResponse(key, str) {
		var res = '';
		switch (key) {
			case ABOUT_ME:
				res = '总提偶干嘛？有啥话不能私下说[害羞][第' + getCounter(key) + '次害羞]';
				break;
			case DIRTY:
				res = '素质，注意素质![鄙视][第' + getCounter(key) + '次鄙视]';
				break;
			case TECH:
				res = '有道理，学习了，呵呵[good][第' + getCounter(key) + '次学习]';
				break;
			case UGLY:
				res = '你也帅不到哪儿去吧...[第' + getCounter(key) + '吐槽莫大]';
				break;
			case CAWAYI:
				res = '一大把年纪了，别装萌了, 还' + str + '...[打哈欠][第' + getCounter(UGLY) + '吐槽莫大]';
				break;
			case IDOL:
				res = str + '怎么了？' + str + '是偶的心中偶像！[第' + getCounter(key) + '次发自肺腑]';
		}
		return res;
	}

	/**
	 * get counter
	 *
	 * @param {string} key
	 */
	function getCounter(key) {
		if (!_counter[key]) {
			_counter[key] = 0;
		}
		return ++_counter[key];
	}

	function stripHtml(html) {
		html = html  || "";
		var scriptregex = "<scr" + "ipt[^>.]*>[sS]*?</sc" + "ript>";
		var scripts = new RegExp(scriptregex, "gim");
		html = html.replace(scripts, " ");

		//Stripts the <style> tags from the html
		var styleregex = "<style[^>.]*>[sS]*?</style>";
		var styles = new RegExp(styleregex , "gim");
		html = html.replace(styles, " ");

		//Strips the HTML tags from the html
		var objRegExp = new RegExp("<(.| )+?>", "gim");
		var  strOutput = html.replace(objRegExp, " ");

		//Replace all < and > with &lt; and &gt;
		strOutput = strOutput.replace(/</, "&lt;");
		strOutput = strOutput.replace(/>/, "&gt;");

		objRegExp = null;
		return strOutput;
	}
	console.log('monitor started...');

	// for debug
	window.exports = {};
	exports.getCounter = getCounter;
	exports.getResponse = getResponse;
	exports._processedMidList = _processedMidList;
	exports.stripHtml = stripHtml;
}();