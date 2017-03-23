/** @license
========================================================================
  UAS Parser
  Copyright (c) 2013 Nick Muerdter

  MIT License

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
"use strict";

var Utils = require("../Utils.js");

var UAS_parser = {
	
	parse: function (userAgent) {
		var result = {
			type: 'unknown',
			uaFamily: 'unknown',
			uaName: 'unknown',
			uaUrl: 'unknown',
			uaCompany: 'unknown',
			uaCompanyUrl: 'unknown',
			uaIcon: 'unknown.png',
			uaInfoUrl: 'unknown',
			osFamily: 'unknown',
			osName: 'unknown',
			osUrl: 'unknown',
			osCompany: 'unknown',
			osCompanyUrl: 'unknown',
			osIcon: 'unknown.png',
			deviceType: 'unknown',
			deviceIcon: 'unknown.png',
			deviceInfoUrl: 'unknown'
		};
		for (var i = 0; i < UAS_cache.robots.order.length; i++) {
			var robotId = UAS_cache.robots.order[i];
			var robot = UAS_cache.robots[robotId];
			if (robot.userAgent === userAgent) {
				result.type = 'Robot';
				result = Utils.extend(result, robot.metadata);
				Utils.extend(result, UAS_cache.device['1']);
				return result;
			}
		}
		var osId;
		for (i = 0; i < UAS_cache.browserReg.order.length; i++) {
			var browserRegId = UAS_cache.browserReg.order[i];
			var browserReg = UAS_cache.browserReg[browserRegId];
			var matches = userAgent.match(browserReg.regexp);
			if (matches) {
				var browser = UAS_cache.browser[browserReg.browserId];
				if (browser) {
					result = Utils.extend(result, browser.metadata);
					var browserType = UAS_cache.browserType[browser.typeId];
					if (browserType) {
						result.type = browserType;
					}
					result.uaName = browser.metadata.uaFamily;
					if (matches[1]) {
						result.uaName += ' ' + matches[1];
					}
				}
				osId = UAS_cache.browserOs[browserReg.browserId];
				break;
			}
		}
		if (!osId) {
			for (i = 0; i < UAS_cache.osReg.order.length; i++) {
				var osRegId = UAS_cache.osReg.order[i];
				var osReg = UAS_cache.osReg[osRegId];
				if (osReg.regexp.test(userAgent)) {
					osId = osReg.osId;
					break;
				}
			}
		}
		if (osId) {
			var os = UAS_cache.os[osId];
			if (os) {
				result = Utils.extend(result, os);
			}
		}
		var device;
		if (result.type === 'Robot') {
			device = UAS_cache.device['1'];
		} else {
			for (i = 0; i < UAS_cache.deviceReg.order.length; i++) {
				var deviceRegId = UAS_cache.deviceReg.order[i];
				var deviceReg = UAS_cache.deviceReg[deviceRegId];
				if (deviceReg.regexp.test(userAgent)) {
					device = UAS_cache.device[deviceReg.deviceId];
					break;
				}
			}
		}
		if (!device) {
			if ([
					'Other',
					'Library',
					'Validator',
					'Useragent Anonymizer'
				].indexOf(result.type) !== -1) {
				device = UAS_cache.device['1'];
			} else if ([
					'Mobile Browser',
					'Wap Browser'
				].indexOf(result.type) !== -1) {
				device = UAS_cache.device['3'];
			} else {
				device = UAS_cache.device['2'];
			}
		}
		if (device) {
			result = Utils.extend(result, device);
		}
		return result;
	}
};

var UAS_cache = {
	version: '20131025-01',
	robots: {
		'3': {
			userAgent: 'msnbot/1.0 (+http://search.msn.com/msnbot.htm)',
			metadata: {
				uaFamily: 'MSNBot',
				uaName: 'MSNBot/1.0',
				uaUrl: 'http://search.msn.com/msnbot.htm',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSNBot'
			}
		},
		'4': {
			userAgent: 'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
			metadata: {
				uaFamily: 'Yahoo!',
				uaName: 'Yahoo! Slurp',
				uaUrl: 'http://help.yahoo.com/help/us/ysearch/slurp',
				uaCompany: 'Yahoo! Inc.',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot_yahoo!slurp.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo!'
			}
		},
		'5': {
			userAgent: 'Jyxobot/1',
			metadata: {
				uaFamily: 'Jyxobot',
				uaName: 'Jyxobot',
				uaUrl: '',
				uaCompany: 'Jyxo s.r.o.',
				uaCompanyUrl: 'http://jyxo.cz/',
				uaIcon: 'bot_Jyxobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Jyxobot'
			}
		},
		'9': {
			userAgent: 'Scooter/3.3',
			metadata: {
				uaFamily: 'Scooter',
				uaName: 'Scooter/3.3',
				uaUrl: '',
				uaCompany: 'AltaVista',
				uaCompanyUrl: 'http://www.altavista.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Scooter'
			}
		},
		'14': {
			userAgent: 'Baiduspider+(+http://www.baidu.com/search/spider.htm)',
			metadata: {
				uaFamily: 'Baiduspider',
				uaName: 'Baiduspider',
				uaUrl: 'http://www.baidu.com/search/spider.htm',
				uaCompany: 'Baidu',
				uaCompanyUrl: 'http://www.baidu.com/',
				uaIcon: 'bot_baiduspider.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Baiduspider'
			}
		},
		'20': {
			userAgent: 'lmspider (lmspider@scansoft.com)',
			metadata: {
				uaFamily: 'lmspider',
				uaName: 'lmspider',
				uaUrl: 'http://www.nuance.com/',
				uaCompany: 'Nuance Communications, Inc.',
				uaCompanyUrl: 'http://www.nuance.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=lmspider'
			}
		},
		'25': {
			userAgent: 'Googlebot-Image/1.0',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Googlebot-Image/1.0',
				uaUrl: 'http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1061943',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'31': {
			userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Googlebot/2.1',
				uaUrl: 'http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1061943',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'32': {
			userAgent: 'ConveraMultiMediaCrawler/0.1 (+http://www.authoritativeweb.com/crawl)',
			metadata: {
				uaFamily: 'ConveraCrawler',
				uaName: 'ConveraMultiMediaCrawler/0.1',
				uaUrl: 'http://www.authoritativeweb.com/crawl',
				uaCompany: 'Convera Corporation',
				uaCompanyUrl: 'http://www.authoritativeweb.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ConveraCrawler'
			}
		},
		'37': {
			userAgent: 'Mozilla/2.0 (compatible; Ask Jeeves/Teoma; +http://sp.ask.com/docs/about/tech_crawling.html)',
			metadata: {
				uaFamily: 'Ask Jeeves/Teoma',
				uaName: 'Ask Jeeves/Teoma - b',
				uaUrl: 'http://about.ask.com/en/docs/about/webmasters.shtml',
				uaCompany: 'Ask Jeeves Inc.',
				uaCompanyUrl: 'http://about.ask.com/en/docs/about/index.shtml',
				uaIcon: 'bot_AskJeeves.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ask Jeeves/Teoma'
			}
		},
		'38': {
			userAgent: 'NG/2.0',
			metadata: {
				uaFamily: 'NG',
				uaName: 'NG/2.0',
				uaUrl: '',
				uaCompany: 'Exalead',
				uaCompanyUrl: 'http://exalead.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NG'
			}
		},
		'40': {
			userAgent: 'TutorGigBot/1.5 ( +http://www.tutorgig.info )',
			metadata: {
				uaFamily: 'TutorGigBot',
				uaName: 'TutorGigBot',
				uaUrl: 'http://www.tutorgig.com/help.html',
				uaCompany: 'TutorGig',
				uaCompanyUrl: 'http://www.tutorgig.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=TutorGigBot'
			}
		},
		'43': {
			userAgent: 'ZACATEK_CZ_BOT (www.zacatek.cz)',
			metadata: {
				uaFamily: 'ZACATEK_CZ',
				uaName: 'ZACATEK_CZ_BOT',
				uaUrl: 'http://www.zacatek.cz/',
				uaCompany: 'webprovider - Adam Haken',
				uaCompanyUrl: 'http://www.webprovider.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ZACATEK_CZ'
			}
		},
		'45': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE 5.0; Windows NT; Girafabot; girafabot at girafa dot com; http://www.girafa.com)',
			metadata: {
				uaFamily: 'Girafabot',
				uaName: 'Girafabot',
				uaUrl: '',
				uaCompany: 'Girafa Inc.',
				uaCompanyUrl: 'http://www.girafa.com/',
				uaIcon: 'bot_girafabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Girafabot'
			}
		},
		'47': {
			userAgent: 'FAST MetaWeb Crawler (helpdesk at fastsearch dot com)',
			metadata: {
				uaFamily: 'FAST MetaWeb Crawler',
				uaName: 'FAST MetaWeb Crawler',
				uaUrl: 'http://www.fast.no/glossary.aspx?m=48&amid=415',
				uaCompany: 'Fast Search & Transfer',
				uaCompanyUrl: 'http://www.fastsearch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FAST MetaWeb Crawler'
			}
		},
		'56': {
			userAgent: 'psbot/0.1 (+http://www.picsearch.com/bot.html)',
			metadata: {
				uaFamily: 'psbot',
				uaName: 'psbot/0.1',
				uaUrl: 'http://www.picsearch.com/bot.html',
				uaCompany: 'picsearch.com',
				uaCompanyUrl: 'http://www.picsearch.com/',
				uaIcon: 'bot_psbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=psbot'
			}
		},
		'76': {
			userAgent: 'City4you/1.3 Cesky (+http://www.city4you.pl)',
			metadata: {
				uaFamily: 'City4you',
				uaName: 'City4you/1.3 Cesky',
				uaUrl: '',
				uaCompany: 'city4you',
				uaCompanyUrl: 'http://www.city4you.pl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=City4you'
			}
		},
		'80': {
			userAgent: 'ConveraCrawler/0.9d (+http://www.authoritativeweb.com/crawl)',
			metadata: {
				uaFamily: 'ConveraCrawler',
				uaName: 'ConveraCrawler 0.9d',
				uaUrl: 'http://www.authoritativeweb.com/crawl',
				uaCompany: 'Convera Corporation',
				uaCompanyUrl: 'http://www.authoritativeweb.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ConveraCrawler'
			}
		},
		'81': {
			userAgent: 'IlTrovatore-Setaccio/1.2 (It search engine; http://www.iltrovatore.it/bot.html; bot@iltrovatore.it)',
			metadata: {
				uaFamily: 'IlTrovatore-Setaccio',
				uaName: 'IlTrovatore-Setaccio/1.2',
				uaUrl: 'http://www.iltrovatore.it/bot.html',
				uaCompany: 'Il Trovatore',
				uaCompanyUrl: 'http://www.iltrovatore.it/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IlTrovatore-Setaccio'
			}
		},
		'82': {
			userAgent: 'NutchCVS/0.8-dev (Nutch; http://lucene.apache.org/nutch/bot.html; nutch-agent@lucene.apache.org)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCSV/0.8-dev',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'83': {
			userAgent: 'ksibot/5.2m (+http://ego.ms.mff.cuni.cz/)',
			metadata: {
				uaFamily: 'ksibot',
				uaName: 'ksibot/5.2m',
				uaUrl: 'http://ego.ms.mff.cuni.cz/',
				uaCompany: 'Katedra softwarov\xe9ho in\u017een\xfdrstv\xed',
				uaCompanyUrl: 'http://kocour.ms.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ksibot'
			}
		},
		'84': {
			userAgent: 'NutchCVS/0.06-dev (http://www.nutch.org/docs/en/bot.html; rhwarren+nutch@uwaterloo.ca)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCVS/0.06-dev at uwaterloo.ca',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'85': {
			userAgent: 'InfociousBot (+http://corp.infocious.com/tech_crawler.php)',
			metadata: {
				uaFamily: 'InfociousBot',
				uaName: 'InfociousBot b',
				uaUrl: 'http://corp.infocious.com/tech_craw.php',
				uaCompany: 'Infocious Inc.',
				uaCompanyUrl: 'http://corp.infocious.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=InfociousBot'
			}
		},
		'86': {
			userAgent: 'NutchCVS/0.7 (Nutch; http://lucene.apache.org/nutch/bot.html; nutch-agent@lucene.apache.org)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCVS/0.7',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'88': {
			userAgent: 'SBIder/0.7 (SBIder; http://www.sitesell.com/sbider.html; http://support.sitesell.com/contact-support.html)',
			metadata: {
				uaFamily: 'SBIder',
				uaName: 'SBIder/0.7',
				uaUrl: 'http://www.sitesell.com/sbider.html',
				uaCompany: 'SiteSell',
				uaCompanyUrl: 'http://www.sitesell.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SBIder'
			}
		},
		'89': {
			userAgent: 'appie 1.1 (www.walhello.com)',
			metadata: {
				uaFamily: 'aippie',
				uaName: 'appie 1.1',
				uaUrl: 'http://www.walhello.com/aboutgl.html',
				uaCompany: 'Walhello.com',
				uaCompanyUrl: 'http://www.walhello.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=aippie'
			}
		},
		'90': {
			userAgent: 'http://www.almaden.ibm.com/cs/crawler   [bc22]',
			metadata: {
				uaFamily: 'Almaden',
				uaName: 'Almaden bc22',
				uaUrl: 'http://www.almaden.ibm.com/cs/crawler/',
				uaCompany: 'IBM Almaden Research Center',
				uaCompanyUrl: 'http://www.almaden.ibm.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Almaden'
			}
		},
		'93': {
			userAgent: 'OmniExplorer_Bot/4.02 (+http://www.omni-explorer.com) WorldIndexer',
			metadata: {
				uaFamily: 'OmniExplorer_Bot',
				uaName: 'OmniExplorer_Bot/4.02',
				uaUrl: 'http://www.omni-explorer.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OmniExplorer_Bot'
			}
		},
		'96': {
			userAgent: 'Szukankobot /1.0 (+http://www.szukanko.pl/addurl.php)',
			metadata: {
				uaFamily: 'Szukankobot',
				uaName: 'Szukankobot /1.0',
				uaUrl: 'http://www.szukanko.pl/',
				uaCompany: 'szukanko.pl',
				uaCompanyUrl: 'http://www.szukanko.pl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Szukankobot'
			}
		},
		'100': {
			userAgent: 'NutchOSU-VLIB/0.7 (Nutch; http://lucene.apache.org/nutch/bot.html; nutch-agent@lucene.apache.org)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchOSU-VLIB/0.7',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'101': {
			userAgent: 'snap.com beta crawler v0',
			metadata: {
				uaFamily: 'snap.com',
				uaName: 'snap.com beta crawler v0',
				uaUrl: '',
				uaCompany: ' Idealab',
				uaCompanyUrl: 'http://www.idealab.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=snap.com'
			}
		},
		'109': {
			userAgent: 'Mozilla/5.0 (compatible; OnetSzukaj/5.0; +http://szukaj.onet.pl)',
			metadata: {
				uaFamily: 'OnetSzukaj',
				uaName: 'OnetSzukaj/5.0',
				uaUrl: '',
				uaCompany: 'Onet.pl',
				uaCompanyUrl: 'http://www.onet.pl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OnetSzukaj'
			}
		},
		'114': {
			userAgent: 'Metaspinner/0.01 (Metaspinner; http://www.meta-spinner.de/; support@meta-spinner.de/)',
			metadata: {
				uaFamily: 'Metaspinner/0.01',
				uaName: 'Metaspinner/0.01',
				uaUrl: 'http://www.meta-spinner.de/',
				uaCompany: 'metaspinnner media GmbH',
				uaCompanyUrl: 'http://www.metaspinner-media.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Metaspinner/0.01'
			}
		},
		'116': {
			userAgent: 'OmniExplorer_Bot/4.06 (+http://www.omni-explorer.com) WorldIndexer',
			metadata: {
				uaFamily: 'OmniExplorer_Bot',
				uaName: 'OmniExplorer_Bot/4.06',
				uaUrl: 'http://www.omni-explorer.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OmniExplorer_Bot'
			}
		},
		'117': {
			userAgent: 'e-SocietyRobot(http://www.yama.info.waseda.ac.jp/~yamana/es/)',
			metadata: {
				uaFamily: 'e-SocietyRobot',
				uaName: 'e-SocietyRobot',
				uaUrl: 'http://www.yama.info.waseda.ac.jp/~yamana/es',
				uaCompany: 'Waseda University Yamana Laboratory',
				uaCompanyUrl: 'http://www.yama.info.waseda.ac.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=e-SocietyRobot'
			}
		},
		'118': {
			userAgent: 'Findexa Crawler (http://www.findexa.no/gulesider/article26548.ece)',
			metadata: {
				uaFamily: 'Findexa Crawler',
				uaName: 'Findexa Crawler',
				uaUrl: 'http://www.findexa.no/gulesider/article26548.ece',
				uaCompany: 'Findexa AS',
				uaCompanyUrl: 'http://www.findexa.no/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Findexa Crawler'
			}
		},
		'120': {
			userAgent: 'InternetArchive/0.8-dev (Nutch; http://lucene.apache.org/nutch/bot.html; nutch-agent@lucene.apache.org)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'InternetArchive/0.8-dev',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'123': {
			userAgent: 'SBIder/0.8-dev (SBIder; http://www.sitesell.com/sbider.html; http://support.sitesell.com/contact-support.html)',
			metadata: {
				uaFamily: 'SBIder',
				uaName: 'SBIder/0.8dev',
				uaUrl: 'http://www.sitesell.com/sbider.html',
				uaCompany: 'SiteSell',
				uaCompanyUrl: 'http://www.sitesell.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SBIder'
			}
		},
		'124': {
			userAgent: 'ichiro/1.0 (ichiro@nttr.co.jp)',
			metadata: {
				uaFamily: 'ichiro',
				uaName: 'ichiro/1.0',
				uaUrl: 'http://search.goo.ne.jp/option/use/sub4/sub4-1/',
				uaCompany: 'NTT-Resonant Inc.',
				uaCompanyUrl: 'http://www.nttr.co.jp/',
				uaIcon: 'bot_ichiro.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ichiro'
			}
		},
		'125': {
			userAgent: 'miniRank/1.2 (miniRank; http://minirank.com/; MiniRank)',
			metadata: {
				uaFamily: 'miniRank',
				uaName: 'miniRank/1.2',
				uaUrl: 'http://www.minirank.com/',
				uaCompany: 'TitaniumLine.com',
				uaCompanyUrl: 'http://titaniumline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=miniRank'
			}
		},
		'128': {
			userAgent: 'Amfibibot/0.07 (Amfibi Robot; http://www.amfibi.com; agent@amfibi.com)',
			metadata: {
				uaFamily: 'Amfibibot',
				uaName: 'Amfibibot/0.07',
				uaUrl: 'http://www.amfibi.com/',
				uaCompany: 'Barcelona Internet Telecom',
				uaCompanyUrl: 'http://www.bcntelecom.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Amfibibot'
			}
		},
		'130': {
			userAgent: 'LinkWalker',
			metadata: {
				uaFamily: 'LinkWalker',
				uaName: 'LinkWalker',
				uaUrl: '',
				uaCompany: 'SEVENtwentyfour Inc.',
				uaCompanyUrl: 'http://www.seventwentyfour.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LinkWalker'
			}
		},
		'131': {
			userAgent: 'Mozilla/2.0 (compatible; Ask Jeeves/Teoma)',
			metadata: {
				uaFamily: 'Ask Jeeves/Teoma',
				uaName: 'Ask Jeeves/Teoma',
				uaUrl: 'http://about.ask.com/en/docs/about/webmasters.shtml',
				uaCompany: 'Ask Jeeves Inc.',
				uaCompanyUrl: 'http://about.ask.com/en/docs/about/index.shtml',
				uaIcon: 'bot_AskJeeves.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ask Jeeves/Teoma'
			}
		},
		'132': {
			userAgent: 'StackRambler/2.0 (MSIE incompatible)',
			metadata: {
				uaFamily: 'StackRambler',
				uaName: 'StackRambler/2.0',
				uaUrl: 'http://www.rambler.ru/doc/robots.shtml',
				uaCompany: 'Rambler Media Group',
				uaCompanyUrl: 'http://ramblermedia.com/',
				uaIcon: 'bot_stackrambler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=StackRambler'
			}
		},
		'133': {
			userAgent: 'NutchCVS/0.7.1 (Nutch; http://lucene.apache.org/nutch/bot.html; nutch-agent@lucene.apache.org)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCVS/0.7.1',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'135': {
			userAgent: 'Mozdex/0.7.2-dev (Mozdex; http://www.mozdex.com/bot.html; spider@mozdex.com)',
			metadata: {
				uaFamily: 'mozDex',
				uaName: 'Mozdex/0.7.2-dev',
				uaUrl: 'http://www.mozdex.com/bot.html',
				uaCompany: 'Mozdex.com',
				uaCompanyUrl: 'http://www.mozdex.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=mozDex'
			}
		},
		'137': {
			userAgent: 'Gaisbot/3.0+(robot@gais.cs.ccu.edu.tw;+http://gais.cs.ccu.edu.tw/robot.php)',
			metadata: {
				uaFamily: 'Gaisbot',
				uaName: 'Gaisbot/3.0',
				uaUrl: 'http://gais.cs.ccu.edu.tw/robot.php',
				uaCompany: 'National Chung Cheng University',
				uaCompanyUrl: 'http://www.ccu.edu.tw/',
				uaIcon: 'bot_gaisbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Gaisbot'
			}
		},
		'140': {
			userAgent: 'Mozilla/4.0 compatible ZyBorg/1.0 Dead Link Checker (wn.dlc@looksmart.net; http://www.WISEnutbot.com)',
			metadata: {
				uaFamily: 'ZyBorg',
				uaName: 'ZyBorg/1.0 Dead Link Checker',
				uaUrl: 'http://www.wisenutbot.com/',
				uaCompany: 'LookSmart, Ltd.',
				uaCompanyUrl: 'http://aboutus.looksmart.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ZyBorg'
			}
		},
		'141': {
			userAgent: 'Mozilla/5.0 (compatible; Pogodak.co.yu/3.1)',
			metadata: {
				uaFamily: 'Pogodak.co.yu',
				uaName: 'Pogodak.co.yu/3.1',
				uaUrl: '',
				uaCompany: 'Pogodak d.o.o.',
				uaCompanyUrl: 'http://www.pogodak.co.yu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Pogodak.co.yu'
			}
		},
		'144': {
			userAgent: 'ichiro/2.0 (ichiro@nttr.co.jp)',
			metadata: {
				uaFamily: 'ichiro',
				uaName: 'ichiro/2.0',
				uaUrl: 'http://search.goo.ne.jp/option/use/sub4/sub4-1/',
				uaCompany: 'NTT-Resonant Inc.',
				uaCompanyUrl: 'http://www.nttr.co.jp/',
				uaIcon: 'bot_ichiro.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ichiro'
			}
		},
		'146': {
			userAgent: 'boitho.com-dc/0.83 ( http://www.boitho.com/dcbot.html )',
			metadata: {
				uaFamily: 'boitho.com-dc',
				uaName: 'boitho.com-dc/0.83',
				uaUrl: 'http://www.boitho.com/dcbot.html',
				uaCompany: 'Boitho',
				uaCompanyUrl: 'http://www.boitho.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=boitho.com-dc'
			}
		},
		'148': {
			userAgent: 'http://www.almaden.ibm.com/cs/crawler   [hc4]',
			metadata: {
				uaFamily: 'Almaden',
				uaName: 'Almaden hc4',
				uaUrl: 'http://www.almaden.ibm.com/cs/crawler/',
				uaCompany: 'IBM Almaden Research Center',
				uaCompanyUrl: 'http://www.almaden.ibm.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Almaden'
			}
		},
		'151': {
			userAgent: 'Sensis Web Crawler (search_comments\\at\\sensis\\dot\\com\\dot\\au)',
			metadata: {
				uaFamily: 'Sensis Web Crawler',
				uaName: 'Sensis Web Crawler - b',
				uaUrl: '',
				uaCompany: 'Telstra Corporation Ltd.',
				uaCompanyUrl: 'http://telstra.com/',
				uaIcon: 'bot_sensiswebcrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Sensis Web Crawler'
			}
		},
		'153': {
			userAgent: 'WebMiner (Web Miner; http://64.124.122.252/feedback.html)',
			metadata: {
				uaFamily: 'WebarooBot',
				uaName: 'WebMiner (Web Miner)',
				uaUrl: 'http://www.webaroo.com/company/site-owners',
				uaCompany: 'Webaroo Inc.',
				uaCompanyUrl: 'http://www.webaroo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebarooBot'
			}
		},
		'155': {
			userAgent: 'ia_archiver-web.archive.org',
			metadata: {
				uaFamily: 'ia_archiver',
				uaName: 'ia_archiver',
				uaUrl: 'http://www.alexa.com/site/help/webmasters',
				uaCompany: 'Alexa Internet, Inc.',
				uaCompanyUrl: 'http://www.alexa.com/',
				uaIcon: 'bot_ia_archiver.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ia_archiver'
			}
		},
		'159': {
			userAgent: 'Mozilla/4.0 compatible ZyBorg/1.0 (wn-14.zyborg@looksmart.net; http://www.WISEnutbot.com)',
			metadata: {
				uaFamily: 'ZyBorg',
				uaName: 'ZyBorg/1.0',
				uaUrl: 'http://www.wisenutbot.com/',
				uaCompany: 'LookSmart, Ltd.',
				uaCompanyUrl: 'http://aboutus.looksmart.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ZyBorg'
			}
		},
		'162': {
			userAgent: 'Accoona-AI-Agent/1.1.1 (crawler at accoona dot com)',
			metadata: {
				uaFamily: 'Accoona-AI-Agent',
				uaName: 'Accoona-AI-Agent/1.1.1',
				uaUrl: '',
				uaCompany: 'Accoona Corp.',
				uaCompanyUrl: 'http://accoona.com/',
				uaIcon: 'bot_accoona-ai-agent.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Accoona-AI-Agent'
			}
		},
		'164': {
			userAgent: 'oBot',
			metadata: {
				uaFamily: 'oBot',
				uaName: 'oBot',
				uaUrl: 'http://filterdb.iss.net/crawler/',
				uaCompany: 'IBM Germany Research & Development GmbH',
				uaCompanyUrl: 'http://www.ibm.com/ibm/de/de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=oBot'
			}
		},
		'167': {
			userAgent: 'Ipselonbot/0.47-beta (Ipselon; http://www.ipselon.com/intl/en/ipselonbot.html; ipselonbot@ipselon.com)',
			metadata: {
				uaFamily: 'Ipselonbot',
				uaName: 'Ipselonbot/0.47-beta',
				uaUrl: 'http://www.ipselon.com/intl/en/ipselonbot.html',
				uaCompany: 'Ipselon Networks s.l.',
				uaCompanyUrl: 'http://www.ipselon.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ipselonbot'
			}
		},
		'168': {
			userAgent: 'IlTrovatore-Setaccio/1.2 (Italy search engine; http://www.iltrovatore.it/bot.html; bot@iltrovatore.it)',
			metadata: {
				uaFamily: 'IlTrovatore-Setaccio',
				uaName: 'IlTrovatore-Setaccio/1.2 b',
				uaUrl: 'http://www.iltrovatore.it/bot.html',
				uaCompany: 'Il Trovatore',
				uaCompanyUrl: 'http://www.iltrovatore.it/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IlTrovatore-Setaccio'
			}
		},
		'170': {
			userAgent: 'RufusBot (Rufus Web Miner; http://64.124.122.252/feedback.html)',
			metadata: {
				uaFamily: 'WebarooBot',
				uaName: 'RufusBot (Rufus Web Miner)',
				uaUrl: 'http://www.webaroo.com/company/site-owners',
				uaCompany: 'Webaroo Inc.',
				uaCompanyUrl: 'http://www.webaroo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebarooBot'
			}
		},
		'177': {
			userAgent: 'NutchCVS/0.7.1 (Nutch; http://www.vvdb.org; voorzitter@vvdb.org)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCVS/0.7.1 vvdg.org',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'178': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE 5.5; Windows NT 4.0; obot)',
			metadata: {
				uaFamily: 'oBot',
				uaName: 'oBot - b',
				uaUrl: 'http://filterdb.iss.net/crawler/',
				uaCompany: 'IBM Germany Research & Development GmbH',
				uaCompanyUrl: 'http://www.ibm.com/ibm/de/de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=oBot'
			}
		},
		'184': {
			userAgent: 'ccubee/3.2',
			metadata: {
				uaFamily: 'ccubee',
				uaName: 'ccubee/3.2',
				uaUrl: 'http://empyreum.com/technologies/platforms/ccubee/',
				uaCompany: 'EMPYREUM k. s.',
				uaCompanyUrl: 'http://empyreum.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ccubee'
			}
		},
		'190': {
			userAgent: 'genieBot (wgao@genieknows.com)',
			metadata: {
				uaFamily: 'genieBot',
				uaName: 'genieBot a',
				uaUrl: 'http://64.5.245.11/faq/faq.html',
				uaCompany: 'IT Interactive Services Inc.',
				uaCompanyUrl: 'http://www.genieknows.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=genieBot'
			}
		},
		'192': {
			userAgent: 'ejupiter.com',
			metadata: {
				uaFamily: 'ejupiter.com',
				uaName: 'ejupiter.com',
				uaUrl: 'http://robot.ejupiter.com/16/robot_privacy.html',
				uaCompany: 'eJupiter Inc',
				uaCompanyUrl: 'http://www.ejupiter.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ejupiter.com'
			}
		},
		'193': {
			userAgent: 'Mozilla/5.0 (compatible; Yahoo! Slurp China; http://misc.yahoo.com.cn/help.html)',
			metadata: {
				uaFamily: 'Yahoo!',
				uaName: 'Yahoo! Slurp China',
				uaUrl: 'http://misc.yahoo.com.cn/help.html',
				uaCompany: 'Yahoo! Inc.',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot_yahoo!slurp.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo!'
			}
		},
		'194': {
			userAgent: 'thumbshots-de-Bot (Version: 1.02, powered by www.thumbshots.de)',
			metadata: {
				uaFamily: 'thumbshots-de-Bot',
				uaName: 'thumbshots-de-Bot 1.02',
				uaUrl: 'http://www.thumbshots.de/content-39-seite_auszuschliessen.html',
				uaCompany: 'Mobile & More Mobilkommunikation GmbH',
				uaCompanyUrl: 'http://www.mobile-more.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=thumbshots-de-Bot'
			}
		},
		'195': {
			userAgent: 'Vespa Crawler',
			metadata: {
				uaFamily: 'Vespa Crawler',
				uaName: 'Vespa Crawler',
				uaUrl: 'http://jobs.yahoo.no/index.html',
				uaCompany: 'Yahoo!',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Vespa Crawler'
			}
		},
		'197': {
			userAgent: 'Ipselonbot/1.0-beta (+; http://www.ipselon.com/intl/en/ipselonbot.html)',
			metadata: {
				uaFamily: 'Ipselonbot',
				uaName: 'Ipselonbot/1.0-beta',
				uaUrl: 'http://www.ipselon.com/intl/en/ipselonbot.html',
				uaCompany: 'Ipselon Networks s.l.',
				uaCompanyUrl: 'http://www.ipselon.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ipselonbot'
			}
		},
		'200': {
			userAgent: 'ccubee/3.3',
			metadata: {
				uaFamily: 'ccubee',
				uaName: 'ccubee/3.3',
				uaUrl: 'http://empyreum.com/technologies/platforms/ccubee/',
				uaCompany: 'EMPYREUM k. s.',
				uaCompanyUrl: 'http://empyreum.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ccubee'
			}
		},
		'201': {
			userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.7.7) NimbleCrawler 1.11 obeys UserAgent NimbleCrawler For problems contact: crawler_at_dataalchemy.com',
			metadata: {
				uaFamily: 'NimbleCrawler',
				uaName: 'NimbleCrawler/1.11',
				uaUrl: '',
				uaCompany: 'Healthline Networks, Inc.',
				uaCompanyUrl: 'http://www.healthline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NimbleCrawler'
			}
		},
		'204': {
			userAgent: 'SynooBot/0.7.1 (SynooBot; http://www.synoo.de/bot.html; webmaster@synoo.com)',
			metadata: {
				uaFamily: 'SynooBot',
				uaName: 'SynooBot/0.7.1',
				uaUrl: 'http://www.synoo.de/bot.html',
				uaCompany: 'Synoo',
				uaCompanyUrl: 'http://www.synoo.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SynooBot'
			}
		},
		'207': {
			userAgent: 'ccubee/3.7',
			metadata: {
				uaFamily: 'ccubee',
				uaName: 'ccubee/3.7',
				uaUrl: 'http://empyreum.com/technologies/platforms/ccubee/',
				uaCompany: 'EMPYREUM k. s.',
				uaCompanyUrl: 'http://empyreum.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ccubee'
			}
		},
		'208': {
			userAgent: 'Silk/1.0',
			metadata: {
				uaFamily: 'silk',
				uaName: 'silk/1.0 -a',
				uaUrl: 'http://www.slider.com/silk.html',
				uaCompany: 'Slider.com',
				uaCompanyUrl: 'http://www.slider.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=silk'
			}
		},
		'209': {
			userAgent: 'Mozilla/5.0 (Windows;) NimbleCrawler 1.12 obeys UserAgent NimbleCrawler For problems contact: crawler@healthline.com',
			metadata: {
				uaFamily: 'NimbleCrawler',
				uaName: 'NimbleCrawler/1.12',
				uaUrl: '',
				uaCompany: 'Healthline Networks, Inc.',
				uaCompanyUrl: 'http://www.healthline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NimbleCrawler'
			}
		},
		'214': {
			userAgent: 'http://www.almaden.ibm.com/cs/crawler   [bc14]',
			metadata: {
				uaFamily: 'Almaden',
				uaName: 'Almaden bc14',
				uaUrl: 'http://www.almaden.ibm.com/cs/crawler/',
				uaCompany: 'IBM Almaden Research Center',
				uaCompanyUrl: 'http://www.almaden.ibm.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Almaden'
			}
		},
		'215': {
			userAgent: 'genieBot ((http://64.5.245.11/faq/faq.html))',
			metadata: {
				uaFamily: 'genieBot',
				uaName: 'genieBot b',
				uaUrl: 'http://64.5.245.11/faq/faq.html',
				uaCompany: 'IT Interactive Services Inc.',
				uaCompanyUrl: 'http://www.genieknows.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=genieBot'
			}
		},
		'217': {
			userAgent: 'g2Crawler (nobody@airmail.net)',
			metadata: {
				uaFamily: 'g2crawler',
				uaName: 'g2crawler',
				uaUrl: 'http://g2crawler.blogspot.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=g2crawler'
			}
		},
		'218': {
			userAgent: 'Mozilla/5.0 (compatible; Theophrastus/2.0; +http://users.cs.cf.ac.uk/N.A.Smith/theophrastus.php)',
			metadata: {
				uaFamily: 'Theophrastus',
				uaName: 'Theophrastus/2.0',
				uaUrl: 'http://users.cs.cf.ac.uk/N.A.Smith/theophrastus.php',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Theophrastus'
			}
		},
		'219': {
			userAgent: 'Mozilla/5.0 (compatible; OnetSzukaj/5.0; +http://szukaj.onet.pl',
			metadata: {
				uaFamily: 'OnetSzukaj',
				uaName: 'OnetSzukaj/5.0 b',
				uaUrl: '',
				uaCompany: 'Onet.pl',
				uaCompanyUrl: 'http://www.onet.pl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OnetSzukaj'
			}
		},
		'221': {
			userAgent: 'Sensis Web Crawler (search_comments\\\\at\\\\sensis\\\\dot\\\\com\\\\dot\\\\au)',
			metadata: {
				uaFamily: 'Sensis Web Crawler',
				uaName: 'Sensis Web Crawler',
				uaUrl: 'http://www.sensis.com.au/help.do',
				uaCompany: 'Telstra Corporation Ltd.',
				uaCompanyUrl: 'http://www.telstra.com/',
				uaIcon: 'bot_sensiswebcrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Sensis Web Crawler'
			}
		},
		'222': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE 5.0; Windows 95) VoilaBot BETA 1.2 (http://www.voila.com/)',
			metadata: {
				uaFamily: 'VoilaBot',
				uaName: 'VoilaBot BETA 1.2',
				uaUrl: 'http://www.voila.com/',
				uaCompany: 'France Telecom',
				uaCompanyUrl: 'http://www.francetelecom.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=VoilaBot'
			}
		},
		'223': {
			userAgent: 'ichiro/2.0 (http://help.goo.ne.jp/door/crawler.html)',
			metadata: {
				uaFamily: 'ichiro',
				uaName: 'ichiro/2.0',
				uaUrl: 'http://search.goo.ne.jp/option/use/sub4/sub4-1/',
				uaCompany: 'NTT-Resonant Inc.',
				uaCompanyUrl: 'http://www.nttr.co.jp/',
				uaIcon: 'bot_ichiro.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ichiro'
			}
		},
		'225': {
			userAgent: 'VORTEX/1.2 (+http://marty.anstey.ca/robots/vortex/)',
			metadata: {
				uaFamily: 'VORTEX',
				uaName: 'VORTEX/1.2',
				uaUrl: 'http://marty.anstey.ca/projects/robots/vortex/',
				uaCompany: 'Marty Anstey',
				uaCompanyUrl: 'http://marty.anstey.ca/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=VORTEX'
			}
		},
		'226': {
			userAgent: 'GOFORITBOT ( http://www.goforit.com/about/ )',
			metadata: {
				uaFamily: 'GOFORITBOT',
				uaName: 'GOFORITBOT',
				uaUrl: 'http://www.goforit.com/about/',
				uaCompany: 'GoForIt Entertainment LLC',
				uaCompanyUrl: 'http://www.goforit.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=GOFORITBOT'
			}
		},
		'227': {
			userAgent: 'silk/1.0 (+http://www.slider.com/silk.htm)/3.7',
			metadata: {
				uaFamily: 'silk',
				uaName: 'silk/1.0',
				uaUrl: 'http://www.slider.com/silk.htm',
				uaCompany: 'Slider.com',
				uaCompanyUrl: 'http://www.slider.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=silk'
			}
		},
		'232': {
			userAgent: 'miniRank/1.5 (miniRank; www.minirank.com; robot)',
			metadata: {
				uaFamily: 'miniRank',
				uaName: 'miniRank/1.5',
				uaUrl: 'http://www.minirank.com/',
				uaCompany: 'TitaniumLine.com',
				uaCompanyUrl: 'http://titaniumline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=miniRank'
			}
		},
		'235': {
			userAgent: 'SurveyBot/2.3 (Whois Source)',
			metadata: {
				uaFamily: 'SurveyBot',
				uaName: 'SurveyBot/2.3',
				uaUrl: 'http://www.whois.sc/info/webmasters/surveybot.html',
				uaCompany: 'Name Intelligence, Inc.',
				uaCompanyUrl: 'http://www.nameintelligence.com/',
				uaIcon: 'bot_surveybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SurveyBot'
			}
		},
		'236': {
			userAgent: 'http://www.almaden.ibm.com/cs/crawler   [bc5]',
			metadata: {
				uaFamily: 'Almaden',
				uaName: 'Almaden bc5',
				uaUrl: 'http://www.almaden.ibm.com/cs/crawler/',
				uaCompany: 'IBM Almaden Research Center',
				uaCompanyUrl: 'http://www.almaden.ibm.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Almaden'
			}
		},
		'237': {
			userAgent: 'btbot/0.4 (+http://www.btbot.com/btbot.html)',
			metadata: {
				uaFamily: 'btbot',
				uaName: 'btbot/0.4',
				uaUrl: 'http://www.btbot.com/btbot.html',
				uaCompany: 'btbot.com',
				uaCompanyUrl: 'http://www.btbot.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=btbot'
			}
		},
		'238': {
			userAgent: 'WIRE/0.10 (Linux; i686; Bot,Robot,Spider,Crawler)',
			metadata: {
				uaFamily: 'WIRE',
				uaName: 'WIRE/0.10',
				uaUrl: 'http://www.cwr.cl/projects/WIRE/',
				uaCompany: 'Universidad de Chile',
				uaCompanyUrl: 'http://www.dcc.uchile.cl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WIRE'
			}
		},
		'242': {
			userAgent: 'IRLbot/2.0 (+http://irl.cs.tamu.edu/crawler)',
			metadata: {
				uaFamily: 'IRLbot',
				uaName: 'IRLbot/2.0',
				uaUrl: 'http://irl.cs.tamu.edu/crawler/',
				uaCompany: 'Texas A&M University',
				uaCompanyUrl: 'http://www.tamu.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IRLbot'
			}
		},
		'252': {
			userAgent: 'MSRBOT',
			metadata: {
				uaFamily: 'MSRBOT',
				uaName: 'MSRBOT',
				uaUrl: 'http://research.microsoft.com/research/sv/msrbot/',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSRBOT'
			}
		},
		'253': {
			userAgent: 'PageBitesHyperBot/600 (http://www.pagebites.com/)',
			metadata: {
				uaFamily: 'PageBitesHyperBot',
				uaName: 'PageBitesHyperBot/600',
				uaUrl: '',
				uaCompany: 'PageBites Inc.',
				uaCompanyUrl: 'http://www.pagebites.com/',
				uaIcon: 'bot_pagebiteshyperbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=PageBitesHyperBot'
			}
		},
		'262': {
			userAgent: 'Shim-Crawler(Mozilla-compatible; http://www.logos.ic.i.u-tokyo.ac.jp/crawler/; crawl@logos.ic.i.u-tokyo.ac.jp)',
			metadata: {
				uaFamily: 'Shim-Crawler',
				uaName: 'Shim-Crawler',
				uaUrl: 'http://www.logos.ic.i.u-tokyo.ac.jp/crawler/index.en.html',
				uaCompany: 'Chikayama-Taura Lab, The University of Tokyo',
				uaCompanyUrl: 'http://www.logos.ic.i.u-tokyo.ac.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Shim-Crawler'
			}
		},
		'263': {
			userAgent: 'ccubee/4.0',
			metadata: {
				uaFamily: 'ccubee',
				uaName: 'ccubee/4.0',
				uaUrl: 'http://empyreum.com/technologies/platforms/ccubee/',
				uaCompany: 'EMPYREUM k. s.',
				uaCompanyUrl: 'http://empyreum.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ccubee'
			}
		},
		'266': {
			userAgent: 'ksibot/7.0d (+http://ego.ms.mff.cuni.cz/)',
			metadata: {
				uaFamily: 'ksibot',
				uaName: 'ksibot/7.0d',
				uaUrl: 'http://ego.ms.mff.cuni.cz/',
				uaCompany: 'Katedra softwarov\xe9ho in\u017een\xfdrstv\xed',
				uaCompanyUrl: 'http://kocour.ms.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ksibot'
			}
		},
		'267': {
			userAgent: 'IRLbot/2.0 (compatible; MSIE 6.0; http://irl.cs.tamu.edu/crawler)',
			metadata: {
				uaFamily: 'IRLbot',
				uaName: 'IRLbot/2.0 b',
				uaUrl: 'http://irl.cs.tamu.edu/crawler/',
				uaCompany: 'Texas A&M University',
				uaCompanyUrl: 'http://www.tamu.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IRLbot'
			}
		},
		'278': {
			userAgent: 'http://www.almaden.ibm.com/cs/crawler   [fc13]',
			metadata: {
				uaFamily: 'Almaden',
				uaName: 'Almaden fc13',
				uaUrl: 'http://www.almaden.ibm.com/cs/crawler/',
				uaCompany: 'IBM Almaden Research Center',
				uaCompanyUrl: 'http://www.almaden.ibm.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Almaden'
			}
		},
		'281': {
			userAgent: 'HooWWWer/2.1.3 (debugging run) (+http://cosco.hiit.fi/search/hoowwwer/ | mailto:crawler-info<at>hiit.fi)',
			metadata: {
				uaFamily: 'HooWWWer',
				uaName: 'HooWWWer/2.1.3',
				uaUrl: 'http://cosco.hiit.fi/search/hoowwwer/',
				uaCompany: 'CoSCo',
				uaCompanyUrl: 'http://cosco.hiit.fi/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HooWWWer'
			}
		},
		'282': {
			userAgent: 'Mozilla/5.0 (Windows;) NimbleCrawler 1.13 obeys UserAgent NimbleCrawler For problems contact: crawler@healthline.com',
			metadata: {
				uaFamily: 'NimbleCrawler',
				uaName: 'NimbleCrawler/1.13',
				uaUrl: '',
				uaCompany: 'Healthline Networks, Inc.',
				uaCompanyUrl: 'http://www.healthline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NimbleCrawler'
			}
		},
		'285': {
			userAgent: 'Mozilla/5.0 (compatible; BecomeBot/2.3; MSIE 6.0 compatible; +http://www.become.com/site_owners.html)',
			metadata: {
				uaFamily: 'BecomeBot',
				uaName: 'BecomeBot/2.3',
				uaUrl: 'http://www.become.com/site_owners.html',
				uaCompany: 'Become, Inc.',
				uaCompanyUrl: 'http://www.become.com/',
				uaIcon: 'bot_becomebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BecomeBot'
			}
		},
		'290': {
			userAgent: 'Mozilla/5.0 (Windows;) NimbleCrawler 1.14 obeys UserAgent NimbleCrawler For problems contact: crawler@healthline.com',
			metadata: {
				uaFamily: 'NimbleCrawler',
				uaName: 'NimbleCrawler/1.14',
				uaUrl: '',
				uaCompany: 'Healthline Networks, Inc.',
				uaCompanyUrl: 'http://www.healthline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NimbleCrawler'
			}
		},
		'294': {
			userAgent: 'Mozilla/5.0 (Windows;) NimbleCrawler 1.15 obeys UserAgent NimbleCrawler For problems contact: crawler@healthline.com',
			metadata: {
				uaFamily: 'NimbleCrawler',
				uaName: 'NimbleCrawler/1.15',
				uaUrl: '',
				uaCompany: 'Healthline Networks, Inc.',
				uaCompanyUrl: 'http://www.healthline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NimbleCrawler'
			}
		},
		'295': {
			userAgent: 'MetaTagRobot/1.6 (http://www.widexl.com/remote/search-engines/metatag-analyzer.html)',
			metadata: {
				uaFamily: 'MetaTagRobot',
				uaName: 'MetaTagRobot/1.6',
				uaUrl: 'http://www.widexl.com/remote/search-engines/metatag-analyzer.html',
				uaCompany: 'widexl.com',
				uaCompanyUrl: 'http://www.widexl.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MetaTagRobot'
			}
		},
		'296': {
			userAgent: 'sproose/0.1-alpha (sproose crawler; http://www.sproose.com/bot.html; crawler@sproose.com)',
			metadata: {
				uaFamily: 'sproose',
				uaName: 'sproose/0.1-alpha',
				uaUrl: 'http://www.sproose.com/bot.html',
				uaCompany: 'Sproose, Inc.',
				uaCompanyUrl: 'http://www.sproose.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sproose'
			}
		},
		'301': {
			userAgent: 'Search Engine World Robots.txt Validator at http://www.searchengineworld.com/cgi-bin/robotcheck.cgi',
			metadata: {
				uaFamily: 'Search Engine World Robots.txt Validator',
				uaName: 'Search Engine World Robots.txt Validator',
				uaUrl: 'http://www.searchengineworld.com/cgi-bin/robotcheck.cgi',
				uaCompany: 'searchengineworld',
				uaCompanyUrl: 'http://www.searchengineworld.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Search Engine World Robots.txt Validator'
			}
		},
		'303': {
			userAgent: 'Gaisbot/3.0+(robot06@gais.cs.ccu.edu.tw;+http://gais.cs.ccu.edu.tw/robot.php)',
			metadata: {
				uaFamily: 'Gaisbot',
				uaName: 'Gaisbot/3.0 - 06',
				uaUrl: 'http://gais.cs.ccu.edu.tw/robot.php',
				uaCompany: 'National Chung Cheng University',
				uaCompanyUrl: 'http://www.ccu.edu.tw/',
				uaIcon: 'bot_gaisbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Gaisbot'
			}
		},
		'306': {
			userAgent: 'Forschungsportal/0.8-dev (Testinstallation; http://www.forschungsportal.net/; fpcrawler@rrzn.uni-hannover.de)',
			metadata: {
				uaFamily: 'Forschungsportal',
				uaName: 'Forschungsportal/0.8-dev',
				uaUrl: 'http://www.forschungsportal.net/',
				uaCompany: 'Bundesministerium f\xfcr Bildung und Forschung',
				uaCompanyUrl: 'http://www.bmbf.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Forschungsportal'
			}
		},
		'307': {
			userAgent: 'HooWWWer/2.2.0 (debugging run) (+http://cosco.hiit.fi/search/hoowwwer/ | mailto:crawler-info<at>hiit.fi)',
			metadata: {
				uaFamily: 'HooWWWer',
				uaName: 'HooWWWer/2.2.0',
				uaUrl: 'http://cosco.hiit.fi/search/hoowwwer/',
				uaCompany: 'CoSCo',
				uaCompanyUrl: 'http://cosco.hiit.fi/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HooWWWer'
			}
		},
		'308': {
			userAgent: 'OmniExplorer_Bot/6.47 (+http://www.omni-explorer.com) WorldIndexer',
			metadata: {
				uaFamily: 'OmniExplorer_Bot',
				uaName: 'OmniExplorer_Bot/6.47',
				uaUrl: 'http://www.omni-explorer.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OmniExplorer_Bot'
			}
		},
		'310': {
			userAgent: 'Orbiter (+http://www.dailyorbit.com/bot.htm)',
			metadata: {
				uaFamily: 'Orbiter',
				uaName: 'Orbiter',
				uaUrl: 'http://www.dailyorbit.com/bot.htm',
				uaCompany: 'DailyOrbit.com',
				uaCompanyUrl: 'http://www.dailyorbit.com/',
				uaIcon: 'bot_orbiter.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Orbiter'
			}
		},
		'312': {
			userAgent: 'FAST Enterprise Crawler/6.4 (crawler@fast.no)',
			metadata: {
				uaFamily: 'FAST Enterprise Crawler',
				uaName: 'FAST Enterprise Crawler/6.4',
				uaUrl: 'http://www.fast.no/glossary.aspx?m=48&amid=415',
				uaCompany: 'Fast Search & Transfer',
				uaCompanyUrl: 'http://www.fastsearch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FAST Enterprise Crawler'
			}
		},
		'317': {
			userAgent: 'csci_b659/0.13',
			metadata: {
				uaFamily: 'csci_b659',
				uaName: 'csci_b659/0.13',
				uaUrl: 'http://informatics.indiana.edu/fil/Class/b659/',
				uaCompany: 'Indiana University',
				uaCompanyUrl: 'http://www.indiana.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=csci_b659'
			}
		},
		'321': {
			userAgent: 'NutchCVS/0.06-dev (Nutch; http://www.nutch.org/docs/en/bot.html; nutch-agent@lists.sourceforge.net)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCVS/0.06-dev',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'323': {
			userAgent: 'NutchCVS/0.7.1 (Nutch running at UW; http://www.nutch.org/docs/en/bot.html; sycrawl@cs.washington.edu)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCVS/0.7.1 at washihinton.edu',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'326': {
			userAgent: 'miniRank/1.6 (Website ranking; www.minirank.com; robot)',
			metadata: {
				uaFamily: 'miniRank',
				uaName: 'miniRank/1.6',
				uaUrl: 'http://www.minirank.com/',
				uaCompany: 'TitaniumLine.com',
				uaCompanyUrl: 'http://titaniumline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=miniRank'
			}
		},
		'327': {
			userAgent: 'ccubee/3.5',
			metadata: {
				uaFamily: 'ccubee',
				uaName: 'ccubee/3.5',
				uaUrl: 'http://empyreum.com/technologies/platforms/ccubee/',
				uaCompany: 'EMPYREUM k. s.',
				uaCompanyUrl: 'http://empyreum.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ccubee'
			}
		},
		'328': {
			userAgent: 'boitho.com-dc/0.79 ( http://www.boitho.com/dcbot.html )',
			metadata: {
				uaFamily: 'boitho.com-dc',
				uaName: 'boitho.com-dc/0.79',
				uaUrl: 'http://www.boitho.com/dcbot.html',
				uaCompany: 'Boitho',
				uaCompanyUrl: 'http://www.boitho.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=boitho.com-dc'
			}
		},
		'329': {
			userAgent: 'Mozilla/5.0 (compatible; Vermut +http://vermut.aol.com)',
			metadata: {
				uaFamily: 'Vermut',
				uaName: 'Vermut',
				uaUrl: 'http://vermut.aol.com/',
				uaCompany: 'America Online, Inc.',
				uaCompanyUrl: 'http://www.aol.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Vermut'
			}
		},
		'333': {
			userAgent: 'SynooBot (compatible; Synoobot/0.7.1; http://www.synoo.com/search/bot.html)',
			metadata: {
				uaFamily: 'SynooBot',
				uaName: 'SynooBot/0.7.1 com',
				uaUrl: ' http://www.synoo.com/search/bot.html',
				uaCompany: 'Synoo',
				uaCompanyUrl: 'http://www.synoo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SynooBot'
			}
		},
		'335': {
			userAgent: 'NuSearch Spider (compatible; MSIE 6.0)',
			metadata: {
				uaFamily: 'NuSearch Spider',
				uaName: 'NuSearch Spider',
				uaUrl: 'http://www.nusearch.com/',
				uaCompany: 'nusearch.com',
				uaCompanyUrl: 'http://www.nusearch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NuSearch Spider'
			}
		},
		'337': {
			userAgent: 'Robo Crawler 6.4.5 (robocrawler@bb.softbank.co.jp)',
			metadata: {
				uaFamily: 'Robo Crawler',
				uaName: 'Robo Crawler 6.4.5',
				uaUrl: 'http://www.softbank.co.jp/',
				uaCompany: 'SOFTBANK CORP.',
				uaCompanyUrl: 'http://www.softbank.co.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Robo Crawler'
			}
		},
		'338': {
			userAgent: 'NutchCVS/0.7.1 (Nutch running at UW; http://crawlers.cs.washington.edu/; sycrawl@cs.washington.edu)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCVS/0.7.1 at UW',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'340': {
			userAgent: 'XML Sitemaps Generator 1.0',
			metadata: {
				uaFamily: 'XML Sitemaps Generator',
				uaName: 'XML Sitemaps Generator 1.0',
				uaUrl: 'http://www.xml-sitemaps.com/',
				uaCompany: 'XML-Sitemaps.com',
				uaCompanyUrl: 'http://www.xml-sitemaps.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=XML Sitemaps Generator'
			}
		},
		'341': {
			userAgent: 'Mozilla/5.0 (Windows;) NimbleCrawler 2.0.0 obeys UserAgent NimbleCrawler For problems contact: crawler@healthline.com',
			metadata: {
				uaFamily: 'NimbleCrawler',
				uaName: 'NimbleCrawler/2.0.0',
				uaUrl: '',
				uaCompany: 'Healthline Networks, Inc.',
				uaCompanyUrl: 'http://www.healthline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NimbleCrawler'
			}
		},
		'343': {
			userAgent: 'NutchCVS/0.7.2 (Nutch; http://lucene.apache.org/nutch/bot.html; nutch-agent@lucene.apache.org)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCVS/0.7.2',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'345': {
			userAgent: 'updated/0.1-beta (updated; http://www.updated.com; crawler@updated.com)',
			metadata: {
				uaFamily: 'updated',
				uaName: 'updated/0.1-beta',
				uaUrl: '',
				uaCompany: 'Updated.com Inc.',
				uaCompanyUrl: 'http://www.updated.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=updated'
			}
		},
		'349': {
			userAgent: 'noyona_0_1',
			metadata: {
				uaFamily: 'noyona',
				uaName: 'noyona_0_1',
				uaUrl: 'http://www.noyona.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=noyona'
			}
		},
		'350': {
			userAgent: 'Mozdex/0.7.2 (Mozdex; http://www.mozdex.com/bot.html; spider@mozdex.com)',
			metadata: {
				uaFamily: 'mozDex',
				uaName: 'Mozdex/0.7.2',
				uaUrl: 'http://www.mozdex.com/bot.html',
				uaCompany: 'Mozdex.com',
				uaCompanyUrl: 'http://www.mozdex.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=mozDex'
			}
		},
		'352': {
			userAgent: 'TeragramCrawler',
			metadata: {
				uaFamily: 'TeragramCrawler',
				uaName: 'TeragramCrawler',
				uaUrl: '',
				uaCompany: 'Teragram Corporation',
				uaCompanyUrl: 'http://www.teragram.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=TeragramCrawler'
			}
		},
		'355': {
			userAgent: 'Openfind data gatherer, Openbot/3.0+(robot-response@openfind.com.tw;+http://www.openfind.com.tw/robot.html)',
			metadata: {
				uaFamily: 'Openbot',
				uaName: 'Openbot/3.0',
				uaUrl: 'http://www.openfind.com.tw/robot.html',
				uaCompany: 'Openfind Information Technology INC.',
				uaCompanyUrl: 'http://www.openfind.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Openbot'
			}
		},
		'360': {
			userAgent: 'Mozilla/5.0 (compatible; BecomeBot/3.0; MSIE 6.0 compatible; +http://www.become.com/site_owners.html)',
			metadata: {
				uaFamily: 'BecomeBot',
				uaName: 'BecomeBot/3.0',
				uaUrl: 'http://www.become.com/site_owners.html',
				uaCompany: 'Become, Inc.',
				uaCompanyUrl: 'http://www.become.com/',
				uaIcon: 'bot_becomebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BecomeBot'
			}
		},
		'364': {
			userAgent: 'wwwster/1.4 (Beta, mailto:gue@cis.uni-muenchen.de)',
			metadata: {
				uaFamily: 'wwwster',
				uaName: 'wwwster/1.4 Beta',
				uaUrl: '',
				uaCompany: 'CIS',
				uaCompanyUrl: 'http://www.cis.uni-muenchen.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=wwwster'
			}
		},
		'366': {
			userAgent: 'NPBot/3 (NPBot; http://www.nameprotect.com; npbot@nameprotect.com)',
			metadata: {
				uaFamily: 'NPBot',
				uaName: 'NPBot/3',
				uaUrl: 'http://www.nameprotect.com/botinfo.html',
				uaCompany: 'NameProtect Inc.',
				uaCompanyUrl: 'http://www.nameprotect.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NPBot'
			}
		},
		'368': {
			userAgent: 'NetWhatCrawler/0.06-dev (NetWhatCrawler from NetWhat.com; http://www.netwhat.com; support@netwhat.com)',
			metadata: {
				uaFamily: 'NetWhatCrawler',
				uaName: 'NetWhatCrawler/0.06-dev',
				uaUrl: '',
				uaCompany: 'GreenWave Online, Inc.',
				uaCompanyUrl: 'http://www.sonicrun.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NetWhatCrawler'
			}
		},
		'376': {
			userAgent: 'virus_detector (virus_harvester@securecomputing.com)',
			metadata: {
				uaFamily: 'virus_detector',
				uaName: 'virus_detector',
				uaUrl: 'http://www.securecomputing.com/sg2_antivirus.cfm?menu=solutions',
				uaCompany: 'Secure Computing Corporation.',
				uaCompanyUrl: 'http://www.securecomputing.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=virus_detector'
			}
		},
		'378': {
			userAgent: 'IlTrovatore/1.2 (IlTrovatore; http://www.iltrovatore.it/bot.html; bot@iltrovatore.it)',
			metadata: {
				uaFamily: 'IlTrovatore',
				uaName: 'IlTrovatore/1.2',
				uaUrl: 'http://www.iltrovatore.it/bot.html',
				uaCompany: 'Il Trovatore',
				uaCompanyUrl: 'http://www.iltrovatore.it/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IlTrovatore'
			}
		},
		'382': {
			userAgent: 'NutchCVS/0.8-dev (Nutch running at UW; http://www.nutch.org/docs/en/bot.html; sycrawl@cs.washington.edu)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCSV/0.8-dev at UW',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'391': {
			userAgent: 'kakle-spider/0.1 (kakle-spider; http://www.kakle.com/bot.html; support@kakle.com)',
			metadata: {
				uaFamily: 'Kakle Bot',
				uaName: 'kakle-spider/0.1',
				uaUrl: 'http://www.kakle.com/bot.html',
				uaCompany: 'Kakle Inc.',
				uaCompanyUrl: 'http://www.kakle.com',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Kakle Bot'
			}
		},
		'392': {
			userAgent: 'SrevBot/2.0 (SrevBot; http://winsrev.com/bot.html; bot@winsrev.com)',
			metadata: {
				uaFamily: 'SrevBot',
				uaName: 'SrevBot/2.0',
				uaUrl: 'http://www.winsrev.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SrevBot'
			}
		},
		'393': {
			userAgent: 'CJB.NET Proxy',
			metadata: {
				uaFamily: 'CJB.NET Proxy',
				uaName: 'CJB.NET Proxy',
				uaUrl: 'http://proxy.cjb.net/',
				uaCompany: 'CJB.NET',
				uaCompanyUrl: 'http://www.cjb.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CJB.NET Proxy'
			}
		},
		'394': {
			userAgent: 'http://www.almaden.ibm.com/cs/crawler   [bc6]',
			metadata: {
				uaFamily: 'Almaden',
				uaName: 'Almaden bc6',
				uaUrl: 'http://www.almaden.ibm.com/cs/crawler/',
				uaCompany: 'IBM Almaden Research Center',
				uaCompanyUrl: 'http://www.almaden.ibm.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Almaden'
			}
		},
		'396': {
			userAgent: 'Krugle/Krugle,Nutch/0.8+ (Krugle web crawler; http://www.krugle.com/crawler/info.html; webcrawler@krugle.com)',
			metadata: {
				uaFamily: 'Krugle',
				uaName: 'Krugle (Nutch/0.8+)',
				uaUrl: 'http://corp.krugle.com/crawler/info.html',
				uaCompany: 'Steve Larsen',
				uaCompanyUrl: 'http://blog.krugle.com/?page_id=5',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Krugle'
			}
		},
		'398': {
			userAgent: 'page_verifier (http://www.securecomputing.com/goto/pv)',
			metadata: {
				uaFamily: 'page_verifier',
				uaName: 'page_verifier',
				uaUrl: 'http://www.securecomputing.com/goto/pv',
				uaCompany: 'Secure Computing Corporation',
				uaCompanyUrl: 'http://www.securecomputing.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=page_verifier'
			}
		},
		'401': {
			userAgent: 'Mozilla/4.0 compatible ZyBorg/1.0 (wn-16.zyborg@looksmart.net; http://www.WISEnutbot.com)',
			metadata: {
				uaFamily: 'ZyBorg',
				uaName: 'ZyBorg/1.0 - b',
				uaUrl: 'http://www.wisenutbot.com/',
				uaCompany: 'LookSmart, Ltd.',
				uaCompanyUrl: 'http://aboutus.looksmart.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ZyBorg'
			}
		},
		'405': {
			userAgent: 'ksibot/8.0a (+http://ego.ms.mff.cuni.cz/)',
			metadata: {
				uaFamily: 'ksibot',
				uaName: 'ksibot/8.0a',
				uaUrl: 'http://ego.ms.mff.cuni.cz/',
				uaCompany: 'Katedra softwarov\xe9ho in\u017een\xfdrstv\xed',
				uaCompanyUrl: 'http://kocour.ms.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ksibot'
			}
		},
		'406': {
			userAgent: 'WinkBot/0.06 (Wink.com search engine web crawler; http://www.wink.com/Wink:WinkBot; winkbot@wink.com)',
			metadata: {
				uaFamily: 'WinkBot',
				uaName: 'WinkBot/0.06',
				uaUrl: 'http://www.wink.com/Wink:WinkBot',
				uaCompany: 'Wink Technologies, Inc',
				uaCompanyUrl: 'http://www.wink.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WinkBot'
			}
		},
		'408': {
			userAgent: 'Snapbot/1.0',
			metadata: {
				uaFamily: 'Snapbot',
				uaName: 'Snapbot/1.0',
				uaUrl: '',
				uaCompany: 'Snap',
				uaCompanyUrl: 'http://www.snap.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Snapbot'
			}
		},
		'410': {
			userAgent: 'SrevBot/1.2 (SrevBot; http://winsrev.com/bot.html; bot@winsrev.comg)',
			metadata: {
				uaFamily: 'SrevBot',
				uaName: 'SrevBot/1.2',
				uaUrl: 'http://www.winsrev.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SrevBot'
			}
		},
		'411': {
			userAgent: 'Mozilla/2.0 (compatible; Ask Jeeves/Teoma; +http://about.ask.com/en/docs/about/webmasters.shtml)',
			metadata: {
				uaFamily: 'Ask Jeeves/Teoma',
				uaName: 'Ask Jeeves/Teoma - c',
				uaUrl: 'http://about.ask.com/en/docs/about/webmasters.shtml',
				uaCompany: 'Ask Jeeves Inc.',
				uaCompanyUrl: 'http://about.ask.com/en/docs/about/index.shtml',
				uaIcon: 'bot_AskJeeves.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ask Jeeves/Teoma'
			}
		},
		'412': {
			userAgent: 'textractor.queuekeeper/0.1 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.queuekeeper/0.1',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'415': {
			userAgent: 'WIRE/0.11 (Linux; i686; Bot,Robot,Spider,Crawler,aromano@cli.di.unipi.it)',
			metadata: {
				uaFamily: 'WIRE',
				uaName: 'WIRE/0.11',
				uaUrl: 'http://www.cwr.cl/projects/WIRE/',
				uaCompany: 'Universidad de Chile',
				uaCompanyUrl: 'http://www.dcc.uchile.cl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WIRE'
			}
		},
		'416': {
			userAgent: 'MQbot metaquerier.cs.uiuc.edu/crawler',
			metadata: {
				uaFamily: 'MQbot',
				uaName: 'MQbot',
				uaUrl: 'http://metaquerier.cs.uiuc.edu/crawler/',
				uaCompany: 'University of Illinois at Urbana-Champaign',
				uaCompanyUrl: 'http://www.uiuc.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MQbot'
			}
		},
		'422': {
			userAgent: 'DataparkSearch/4.40.1 (+http://www.dataparksearch.org/)',
			metadata: {
				uaFamily: 'DataparkSearch',
				uaName: 'DataparkSearch/4.40',
				uaUrl: 'http://www.dataparksearch.org/',
				uaCompany: 'DataPark',
				uaCompanyUrl: 'http://www.datapark.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DataparkSearch'
			}
		},
		'425': {
			userAgent: 'exactseek.com',
			metadata: {
				uaFamily: 'ExactSEEK',
				uaName: 'ExactSEEK',
				uaUrl: 'http://www.exactseek.com/',
				uaCompany: 'Jayde Online, Inc.',
				uaCompanyUrl: 'http://www.jaydeonlineinc.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ExactSEEK'
			}
		},
		'431': {
			userAgent: 'Mozilla/5.0 (Windows;) NimbleCrawler 2.0.1 obeys UserAgent NimbleCrawler For problems contact: crawler@healthline.com',
			metadata: {
				uaFamily: 'NimbleCrawler',
				uaName: 'NimbleCrawler/2.0.1',
				uaUrl: '',
				uaCompany: 'Healthline Networks, Inc.',
				uaCompanyUrl: 'http://www.healthline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NimbleCrawler'
			}
		},
		'435': {
			userAgent: 'sproose/0.1 (sproose bot; http://www.sproose.com/bot.html; crawler@sproose.com)',
			metadata: {
				uaFamily: 'sproose',
				uaName: 'sproose/0.1',
				uaUrl: 'http://www.sproose.com/bot.html',
				uaCompany: 'Sproose, Inc.',
				uaCompanyUrl: 'http://www.sproose.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sproose'
			}
		},
		'437': {
			userAgent: 'updated/0.1-alpha (updated crawler; http://www.updated.com; crawler@updated.com)',
			metadata: {
				uaFamily: 'updated',
				uaName: 'updated/0.1-alpha',
				uaUrl: '',
				uaCompany: 'Updated.com Inc.',
				uaCompanyUrl: 'http://www.updated.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=updated'
			}
		},
		'439': {
			userAgent: 'Vagabondo/3.0 (webagent at wise-guys dot nl)',
			metadata: {
				uaFamily: 'Vagabondo',
				uaName: 'Vagabondo/3.0',
				uaUrl: 'http://webagent.wise-guys.nl/',
				uaCompany: 'WiseGuys Internet BV',
				uaCompanyUrl: 'http://www.wise-guys.nl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Vagabondo'
			}
		},
		'442': {
			userAgent: 'Mozilla/4.0 (compatible; MyFamilyBot/1.0; http://www.myfamilyinc.com)',
			metadata: {
				uaFamily: 'MyFamilyBot',
				uaName: 'MyFamilyBot/1.0',
				uaUrl: 'http://www.ancestry.com/learn/bot.aspx',
				uaCompany: 'MyFamily.com, Inc.',
				uaCompanyUrl: 'http://www.myfamilyinc.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MyFamilyBot'
			}
		},
		'445': {
			userAgent: 'textractor.harvester/h7/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h7/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'447': {
			userAgent: 'textractor.harvester/h3/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h3/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'452': {
			userAgent: 'WIRE/0.11 (Linux; i686; Robot,Spider,Crawler,aromano@cli.di.unipi.it)',
			metadata: {
				uaFamily: 'WIRE',
				uaName: 'WIRE/0.11 b',
				uaUrl: 'http://www.cwr.cl/projects/WIRE/',
				uaCompany: 'Universidad de Chile',
				uaCompanyUrl: 'http://www.dcc.uchile.cl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WIRE'
			}
		},
		'456': {
			userAgent: 'boitho.com-dc/0.85 ( http://www.boitho.com/dcbot.html )',
			metadata: {
				uaFamily: 'boitho.com-dc',
				uaName: 'boitho.com-dc/0.85',
				uaUrl: 'http://www.boitho.com/dcbot.html',
				uaCompany: 'Boitho',
				uaCompanyUrl: 'http://www.boitho.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=boitho.com-dc'
			}
		},
		'462': {
			userAgent: 'schibstedsokbot (compatible; Mozilla/5.0; MSIE 5.0; FAST FreshCrawler 6; +http://www.schibstedsok.no/bot/)',
			metadata: {
				uaFamily: 'schibstedsokbot',
				uaName: 'schibstedsokbot',
				uaUrl: '',
				uaCompany: 'Schibsted ASA',
				uaCompanyUrl: 'http://www.schibsted.no/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=schibstedsokbot'
			}
		},
		'465': {
			userAgent: 'NG-Search/0.90 (NG-SearchBot; http://www.ng-search.com;  )',
			metadata: {
				uaFamily: 'NG-Search',
				uaName: 'NG-Search/0.90',
				uaUrl: '',
				uaCompany: 'NG-Marketing',
				uaCompanyUrl: 'http://www.ng-search.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NG-Search'
			}
		},
		'469': {
			userAgent: 'WebRankSpider/1.37 (+http://ulm191.server4you.de/crawler/)',
			metadata: {
				uaFamily: 'WebRankSpider',
				uaName: 'WebRankSpider/1.37',
				uaUrl: 'http://ulm191.server4you.de/crawler/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebRankSpider'
			}
		},
		'470': {
			userAgent: 'Szukacz/1.5 (robot; www.szukacz.pl/html/jak_dziala_robot.html; info@szukacz.pl)',
			metadata: {
				uaFamily: 'Szukacz',
				uaName: 'Szukacz/1.5',
				uaUrl: 'http://www.szukacz.pl/jakdzialarobot.html',
				uaCompany: '24 Godziny Sp. z o.o.',
				uaCompanyUrl: 'http://www.szukacz.pl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Szukacz'
			}
		},
		'471': {
			userAgent: 'http://www.almaden.ibm.com/cs/crawler   [bc12]',
			metadata: {
				uaFamily: 'Almaden',
				uaName: 'Almaden bc12',
				uaUrl: 'http://www.almaden.ibm.com/cs/crawler/',
				uaCompany: 'IBM Almaden Research Center',
				uaCompanyUrl: 'http://www.almaden.ibm.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Almaden'
			}
		},
		'479': {
			userAgent: 'KRetrieve/1.1/dbsearchexpert.com',
			metadata: {
				uaFamily: 'KRetrieve',
				uaName: 'KRetrieve/1.1',
				uaUrl: 'http://www.dbsearchexpert.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=KRetrieve'
			}
		},
		'480': {
			userAgent: 'Nusearch Spider (www.nusearch.com)',
			metadata: {
				uaFamily: 'NuSearch Spider',
				uaName: 'NuSearch Spider - b',
				uaUrl: 'http://www.nusearch.com/',
				uaCompany: 'nusearch.com',
				uaCompanyUrl: 'http://www.nusearch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NuSearch Spider'
			}
		},
		'481': {
			userAgent: 'Link Valet Online 1.1',
			metadata: {
				uaFamily: 'Link Valet Online',
				uaName: 'Link Valet Online 1.1',
				uaUrl: 'http://valet.htmlhelp.com/',
				uaCompany: 'Web Design Group',
				uaCompanyUrl: 'http://www.htmlhelp.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Link Valet Online'
			}
		},
		'482': {
			userAgent: 'asked/Nutch-0.8 (web crawler; http://asked.jp; epicurus at gmail dot com)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'Nutch/0.8 at asked.jp',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'483': {
			userAgent: 'Link Valet Online 1.2',
			metadata: {
				uaFamily: 'Link Valet Online',
				uaName: 'Link Valet Online 1.2',
				uaUrl: 'http://valet.htmlhelp.com/',
				uaCompany: 'Web Design Group',
				uaCompanyUrl: 'http://www.htmlhelp.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Link Valet Online'
			}
		},
		'484': {
			userAgent: "HouxouCrawler/Nutch-0.9-dev (houxou.com's nutch-based crawler which serves special interest on-line communities; http://www.houxou.com/crawler; crawler at houxou dot com)",
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'Nutch/0.9-dev at houxou.com',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'485': {
			userAgent: 'BilgiBetaBot/0.8-dev (bilgi.com (Beta) ; http://lucene.apache.org/nutch/bot.html; nutch-agent@lucene.apache.org)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'Nutch/0.8-dev at bilgi.com',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'488': {
			userAgent: 'egothor/8.0f (+http://ego.ms.mff.cuni.cz/)',
			metadata: {
				uaFamily: 'egothor',
				uaName: 'egothor/8.0f',
				uaUrl: 'http://ego.ms.mff.cuni.cz/',
				uaCompany: 'Katedra softwarov\xe9ho in\u017een\xfdrstv\xed Univerzity Karlovi',
				uaCompanyUrl: 'http://kocour.ms.mff.cuni.cz/cs/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=egothor'
			}
		},
		'489': {
			userAgent: 'TurnitinBot/2.0 (http://www.turnitin.com/robot/crawlerinfo.html)',
			metadata: {
				uaFamily: 'TurnitinBot',
				uaName: 'TurnitinBot/2.0',
				uaUrl: 'http://www.turnitin.com/robot/crawlerinfo.html',
				uaCompany: 'iParadigms, LLC.',
				uaCompanyUrl: 'http://www.iparadigms.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=TurnitinBot'
			}
		},
		'491': {
			userAgent: "HouxouCrawler/Nutch-0.8 (houxou.com's nutch-based crawler which serves special interest on-line communities; http://www.houxou.com/crawler; crawler at houxou dot com)",
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'Nutch/0.8 at houxou.com',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'493': {
			userAgent: 'NutchCVS/0.7.1 (Nutch; http://lucene.apache.org/nutch/bot.html; raphael@unterreuth.de)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCVS/0.7.1 at unterreuth.de',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'494': {
			userAgent: 'www.adressendeutschland.de',
			metadata: {
				uaFamily: 'adressendeutschland.de',
				uaName: 'adressendeutschland.de',
				uaUrl: 'http://www.adressendeutschland.de/konzept.html',
				uaCompany: 'http://www.arktosmedia.de/',
				uaCompanyUrl: 'Arktos MEDIA GmbH',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=adressendeutschland.de'
			}
		},
		'496': {
			userAgent: 'MetaTagRobot/2.1 (http://www.widexl.com/remote/search-engines/metatag-analyzer.html)',
			metadata: {
				uaFamily: 'MetaTagRobot',
				uaName: 'MetaTagRobot/2.1',
				uaUrl: 'http://www.widexl.com/remote/search-engines/metatag-analyzer.html',
				uaCompany: '',
				uaCompanyUrl: 'http://www.widexl.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MetaTagRobot'
			}
		},
		'499': {
			userAgent: 'Cazoodle/Nutch-0.9-dev (Cazoodle Nutch Crawler; http://www.cazoodle.com; mqbot@cazoodle.com)',
			metadata: {
				uaFamily: 'CazoodleBot',
				uaName: 'CazoodleBot a',
				uaUrl: 'http://www.cazoodle.com/cazoodlebot.php',
				uaCompany: 'Cazoodle Inc.',
				uaCompanyUrl: 'http://www.cazoodle.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CazoodleBot'
			}
		},
		'501': {
			userAgent: 'Mozilla/3.0 (compatible; ScollSpider; http://www.webwobot.com)',
			metadata: {
				uaFamily: 'ScollSpider',
				uaName: 'ScollSpider',
				uaUrl: 'http://www.webwobot.com/ScollSpider.php',
				uaCompany: 'WebWoBot.com',
				uaCompanyUrl: 'http://www.webwobot.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ScollSpider'
			}
		},
		'512': {
			userAgent: 'Accoona-AI-Agent/1.1.2 (aicrawler at accoonabot dot com)',
			metadata: {
				uaFamily: 'Accoona-AI-Agent',
				uaName: 'Accoona-AI-Agent/1.1.2',
				uaUrl: '',
				uaCompany: 'Accoona Corp.',
				uaCompanyUrl: '',
				uaIcon: 'bot_accoona-ai-agent.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Accoona-AI-Agent'
			}
		},
		'515': {
			userAgent: 'NG-Search/0.9.8 (NG-SearchBot; http://www.ng-search.com)',
			metadata: {
				uaFamily: 'NG-Search',
				uaName: 'NG-Search/0.9.8',
				uaUrl: '',
				uaCompany: 'NG-Marketing',
				uaCompanyUrl: 'http://www.ng-search.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NG-Search'
			}
		},
		'517': {
			userAgent: 'holmes/3.9 (onet.pl)',
			metadata: {
				uaFamily: 'Holmes',
				uaName: 'holmes/3.9 - onet.pl',
				uaUrl: 'http://www.ucw.cz/holmes/',
				uaCompany: 'Martin Mare\u0161 and Robert \u0160palek',
				uaCompanyUrl: 'http://www.ucw.cz/holmes/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Holmes'
			}
		},
		'520': {
			userAgent: 'miniRank/2.0 (miniRank; http://minirank.com/; website ranking engine)',
			metadata: {
				uaFamily: 'miniRank',
				uaName: 'miniRank/2.0',
				uaUrl: 'http://www.minirank.com/',
				uaCompany: 'TitaniumLine.com',
				uaCompanyUrl: 'http://titaniumline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=miniRank'
			}
		},
		'523': {
			userAgent: 'sogou spider',
			metadata: {
				uaFamily: 'sogou spider',
				uaName: 'sogou spider',
				uaUrl: 'http://www.sogou.com/docs/help/webmasters.htm#07',
				uaCompany: 'SOGOU.COM',
				uaCompanyUrl: 'http://www.sogou.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sogou spider'
			}
		},
		'525': {
			userAgent: 'Megatext/Nutch-0.8.1 (Beta; http://www.megatext.cz/; microton@microton.cz)',
			metadata: {
				uaFamily: 'Megatext',
				uaName: 'Megatext-0.8.1 beta',
				uaUrl: '',
				uaCompany: 'Microton, s.r.o.',
				uaCompanyUrl: 'http://www.microton.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Megatext'
			}
		},
		'528': {
			userAgent: 'Mozilla/4.0 (compatible; MyFamilyBot/1.0; http://www.ancestry.com/learn/bot.aspx)',
			metadata: {
				uaFamily: 'MyFamilyBot',
				uaName: 'MyFamilyBot/1.0 b',
				uaUrl: 'http://www.ancestry.com/learn/bot.aspx',
				uaCompany: 'MyFamily.com, Inc.',
				uaCompanyUrl: 'http://www.myfamilyinc.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MyFamilyBot'
			}
		},
		'531': {
			userAgent: 'Mozilla/4.0 compatible FurlBot/Furl Search 2.0 (FurlBot; http://www.furl.net; wn.furlbot@looksmart.net)',
			metadata: {
				uaFamily: 'FurlBot',
				uaName: 'FurlBot/Furl Search 2.0',
				uaUrl: '',
				uaCompany: 'LookSmart, Ltd.',
				uaCompanyUrl: 'http://search.looksmart.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FurlBot'
			}
		},
		'536': {
			userAgent: 'Shim-Crawler(Mozilla-compatible; http://www.logos.ic.i.u-tokyo.ac.jp/crawl/; crawl@logos.ic.i.u-tokyo.ac.jp)',
			metadata: {
				uaFamily: 'Shim-Crawler',
				uaName: 'Shim-Crawler - b',
				uaUrl: 'http://www.logos.ic.i.u-tokyo.ac.jp/crawler/index.en.html',
				uaCompany: 'Chikayama-Taura Lab, The University of Tokyo',
				uaCompanyUrl: 'http://www.logos.ic.i.u-tokyo.ac.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Shim-Crawler'
			}
		},
		'538': {
			userAgent: 'Motoricerca-Robots.txt-Checker/1.0 (http://tool.motoricerca.info/robots-checker.phtml)',
			metadata: {
				uaFamily: 'Motoricerca-Robots.txt-Checker',
				uaName: 'Motoricerca-Robots.txt-Checker/1.0',
				uaUrl: 'http://tool.motoricerca.info/robots-checker.phtml',
				uaCompany: 'Motoricerca.info',
				uaCompanyUrl: 'http://www.motoricerca.info/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Motoricerca-Robots.txt-Checker'
			}
		},
		'539': {
			userAgent: 'Kongulo v0.1 personal web crawler',
			metadata: {
				uaFamily: 'Kongulo',
				uaName: 'Kongulo v0.1',
				uaUrl: 'http://goog-kongulo.sourceforge.net/',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Kongulo'
			}
		},
		'540': {
			userAgent: 'ichiro/2.01 (http://help.goo.ne.jp/door/crawler.html)',
			metadata: {
				uaFamily: 'ichiro',
				uaName: 'ichiro/2.01',
				uaUrl: 'http://search.goo.ne.jp/option/use/sub4/sub4-1/',
				uaCompany: 'NTT-Resonant Inc.',
				uaCompanyUrl: 'http://www.nttr.co.jp/',
				uaIcon: 'bot_ichiro.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ichiro'
			}
		},
		'545': {
			userAgent: 'sproose/1.0beta (sproose bot; http://www.sproose.com/bot.html; crawler@sproose.com)',
			metadata: {
				uaFamily: 'Sproose',
				uaName: 'Sproose/1.0beta',
				uaUrl: 'http://www.sproose.com/bot.html',
				uaCompany: 'Sproose, Inc.',
				uaCompanyUrl: 'http://www.sproose.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Sproose'
			}
		},
		'546': {
			userAgent: 'MSRBOT (http://research.microsoft.com/research/sv/msrbot/)',
			metadata: {
				uaFamily: 'MSRBOT',
				uaName: 'MSRBOT b',
				uaUrl: 'http://research.microsoft.com/research/sv/msrbot/',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSRBOT'
			}
		},
		'547': {
			userAgent: 'envolk/1.7 (+http://www.envolk.com/envolkspiderinfo.html)',
			metadata: {
				uaFamily: 'envolk',
				uaName: 'envolk/1.7',
				uaUrl: 'http://www.envolk.com/envolkspiderinfo.html',
				uaCompany: 'Envolk',
				uaCompanyUrl: 'http://www.envolk.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=envolk'
			}
		},
		'548': {
			userAgent: 'Blaiz-Bee/2.00.5622 (+http://www.blaiz.net)',
			metadata: {
				uaFamily: 'Blaiz-Bee',
				uaName: 'Blaiz-Bee/2.00.5622',
				uaUrl: 'http://www.rawgrunt.com/index.html',
				uaCompany: 'Blaiz Enterprises',
				uaCompanyUrl: 'http://www.blaiz.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Blaiz-Bee'
			}
		},
		'554': {
			userAgent: 'holmes/3.9 (OnetSzukaj/5.0; +http://szukaj.onet.pl)',
			metadata: {
				uaFamily: 'Holmes',
				uaName: 'holmes/3.9 - onet.pl b',
				uaUrl: 'http://www.ucw.cz/holmes/',
				uaCompany: 'Martin Mare\u0161 and Robert \u0160palek',
				uaCompanyUrl: 'http://www.ucw.cz/holmes/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Holmes'
			}
		},
		'556': {
			userAgent: 'EDI/1.6.5 (Edacious & Intelligent Web Robot, Daum Communications Corp.)',
			metadata: {
				uaFamily: 'EDI',
				uaName: 'EDI/1.6.5',
				uaUrl: '',
				uaCompany: 'Daum Communications Corp.',
				uaCompanyUrl: 'http://info.daum.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=EDI'
			}
		},
		'560': {
			userAgent: 'ccubee/9.0',
			metadata: {
				uaFamily: 'ccubee',
				uaName: 'ccubee/9.0',
				uaUrl: 'http://empyreum.com/technologies/platforms/ccubee/',
				uaCompany: 'EMPYREUM k. s.',
				uaCompanyUrl: 'http://empyreum.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ccubee'
			}
		},
		'562': {
			userAgent: 'MQBOT/Nutch-0.9-dev (MQBOT Nutch Crawler; http://falcon.cs.uiuc.edu; mqbot@cs.uiuc.edu)',
			metadata: {
				uaFamily: 'MQbot',
				uaName: 'MQBOT/Nutch-0.9-dev',
				uaUrl: 'http://metaquerier.cs.uiuc.edu/crawler/',
				uaCompany: 'University of Illinois at Urbana-Champaign',
				uaCompanyUrl: 'http://www.uiuc.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MQbot'
			}
		},
		'563': {
			userAgent: 'Mozilla/5.0 (compatible; nextthing.org/1.0; +http://www.nextthing.org/bot)',
			metadata: {
				uaFamily: 'nextthing.org',
				uaName: 'nextthing.org/1.0',
				uaUrl: 'http://www.nextthing.org/bot/',
				uaCompany: 'Andrew Wooster',
				uaCompanyUrl: 'http://www.cs.hmc.edu/~awooster/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=nextthing.org'
			}
		},
		'564': {
			userAgent: 'crawler43.ejupiter.com',
			metadata: {
				uaFamily: 'ejupiter.com',
				uaName: 'ejupiter.com 43',
				uaUrl: 'http://robot.ejupiter.com/16/robot_privacy.html',
				uaCompany: 'eJupiter Inc',
				uaCompanyUrl: 'http://www.ejupiter.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ejupiter.com'
			}
		},
		'565': {
			userAgent: 'Szukacz/1.5 (robot; www.szukacz.pl/jakdzialarobot.html; info@szukacz.pl)',
			metadata: {
				uaFamily: 'Szukacz',
				uaName: 'Szukacz/1.5 b',
				uaUrl: 'http://www.szukacz.pl/jakdzialarobot.html',
				uaCompany: '24 Godziny Sp. z o.o.',
				uaCompanyUrl: 'http://www.szukacz.pl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Szukacz'
			}
		},
		'566': {
			userAgent: 'Mozilla/5.0 (compatible; BecomeBot/3.0; +http://www.become.com/site_owners.html)',
			metadata: {
				uaFamily: 'BecomeBot',
				uaName: 'BecomeBot/3.0 b',
				uaUrl: 'http://www.become.com/site_owners.html',
				uaCompany: 'Become, Inc.',
				uaCompanyUrl: 'http://www.become.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BecomeBot'
			}
		},
		'567': {
			userAgent: 'Steeler/3.2 (http://www.tkl.iis.u-tokyo.ac.jp/~crawler/)',
			metadata: {
				uaFamily: 'Steeler',
				uaName: 'Steeler/3.2',
				uaUrl: 'http://www.tkl.iis.u-tokyo.ac.jp/~crawler/',
				uaCompany: 'Kitsuregawa Laboratory, The University of Tokyo',
				uaCompanyUrl: 'http://www.tkl.iis.u-tokyo.ac.jp/',
				uaIcon: 'bot_Steeler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Steeler'
			}
		},
		'569': {
			userAgent: 'Mozilla/4.0 (compatible; EDI/1.6.6; Edacious & Intelligent Web Robot; Daum Communications Corp., Korea)',
			metadata: {
				uaFamily: 'EDI',
				uaName: 'EDI/1.6.6',
				uaUrl: '',
				uaCompany: 'Daum Communications Corp.',
				uaCompanyUrl: 'http://info.daum.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=EDI'
			}
		},
		'580': {
			userAgent: 'Blaiz-Bee/2.00.5655 (+http://www.blaiz.net)',
			metadata: {
				uaFamily: 'Blaiz-Bee',
				uaName: 'Blaiz-Bee/2.00.5655',
				uaUrl: 'http://www.rawgrunt.com/index.html',
				uaCompany: 'Blaiz Enterprises',
				uaCompanyUrl: 'http://www.blaiz.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Blaiz-Bee'
			}
		},
		'581': {
			userAgent: "Zeusbot/0.07 (Ulysseek's web-crawling robot; http://www.zeusbot.com; agent@zeusbot.com)",
			metadata: {
				uaFamily: 'Zeusbot',
				uaName: 'Zeusbot/0.07',
				uaUrl: 'http://www.zeusbot.com/',
				uaCompany: 'Ulysseek',
				uaCompanyUrl: 'http://www.ulysseek.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Zeusbot'
			}
		},
		'587': {
			userAgent: 'MQBOT/Nutch-0.9-dev (MQBOT Crawler; http://falcon.cs.uiuc.edu; mqbot@cs.uiuc.edu)',
			metadata: {
				uaFamily: 'MQbot',
				uaName: 'MQBOT/Nutch-0.9-dev b',
				uaUrl: 'http://metaquerier.cs.uiuc.edu/crawler/',
				uaCompany: 'University of Illinois at Urbana-Champaign',
				uaCompanyUrl: 'http://www.uiuc.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MQbot'
			}
		},
		'588': {
			userAgent: 'CazoodleBot/Nutch-0.9-dev (CazoodleBot Crawler; http://www.cazoodle.com; mqbot@cazoodle.com)',
			metadata: {
				uaFamily: 'CazoodleBot',
				uaName: 'CazoodleBot d',
				uaUrl: 'http://www.cazoodle.com/cazoodlebot.php',
				uaCompany: 'Cazoodle Inc.',
				uaCompanyUrl: 'http://www.cazoodle.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CazoodleBot'
			}
		},
		'594': {
			userAgent: 'ccubee/10.0',
			metadata: {
				uaFamily: 'ccubee',
				uaName: 'ccubee/10.0',
				uaUrl: 'http://empyreum.com/technologies/platforms/ccubee/',
				uaCompany: 'EMPYREUM k. s.',
				uaCompanyUrl: 'http://empyreum.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ccubee'
			}
		},
		'597': {
			userAgent: 'Mozilla/5.0 (compatible; egothor/8.0g; +http://ego.ms.mff.cuni.cz/)',
			metadata: {
				uaFamily: 'egothor',
				uaName: 'egothor/8.0g',
				uaUrl: 'http://ego.ms.mff.cuni.cz/',
				uaCompany: 'Katedra softwarov\xe9ho in\u017een\xfdrstv\xed Univerzity Karlovi',
				uaCompanyUrl: 'http://kocour.ms.mff.cuni.cz/cs/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=egothor'
			}
		},
		'600': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE is not me; EDI/1.6.6; Edacious & Intelligent Web Robot; Daum Communications Corp., Korea)',
			metadata: {
				uaFamily: 'EDI',
				uaName: 'EDI/1.6.6 b',
				uaUrl: '',
				uaCompany: 'Daum Communications Corp.',
				uaCompanyUrl: 'http://info.daum.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=EDI'
			}
		},
		'602': {
			userAgent: 'Bigsearch.ca/Nutch-0.9-dev (Bigsearch.ca Internet Spider; http://www.bigsearch.ca/; info@enhancededge.com)',
			metadata: {
				uaFamily: 'Bigsearch.ca',
				uaName: 'Bigsearch.ca/Nutch-0.9-dev',
				uaUrl: '',
				uaCompany: 'bigsearch.ca',
				uaCompanyUrl: 'http://www.bigsearch.ca/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Bigsearch.ca'
			}
		},
		'605': {
			userAgent: 'Yandex/1.01.001 (compatible; Win16; I)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'Yandex/1.01.001',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'606': {
			userAgent: 'SBIder/SBIder-0.8.2-dev (http://www.sitesell.com/sbider.html)',
			metadata: {
				uaFamily: 'SBIder',
				uaName: 'SBIder-0.8.2-dev',
				uaUrl: 'http://www.sitesell.com/sbider.html',
				uaCompany: 'SiteSell Inc.',
				uaCompanyUrl: 'http://www.sitesell.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SBIder'
			}
		},
		'608': {
			userAgent: 'Combine/3 http://combine.it.lth.se/',
			metadata: {
				uaFamily: 'Combine',
				uaName: 'Combine/3',
				uaUrl: 'http://combine.it.lth.se/',
				uaCompany: 'Lunds universitet',
				uaCompanyUrl: 'http://www.lu.se/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Combine'
			}
		},
		'609': {
			userAgent: 'Megatext/Megatext-0.5 (beta; http://www.megatext.cz/; microton@microton.cz)',
			metadata: {
				uaFamily: 'Megatext',
				uaName: 'Megatext-0.5 beta',
				uaUrl: '',
				uaCompany: 'Microton, s.r.o.',
				uaCompanyUrl: 'http://www.microton.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Megatext'
			}
		},
		'612': {
			userAgent: 'VMBot/0.7.2 (VMBot; http://www.VerticalMatch.com/; vmbot@tradedot.com)',
			metadata: {
				uaFamily: 'VMBot',
				uaName: 'VMBot/0.7.2',
				uaUrl: '',
				uaCompany: 'Vertical Search Engine (China)',
				uaCompanyUrl: 'http://www.verticalmatch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=VMBot'
			}
		},
		'616': {
			userAgent: 'Mozilla/5.0 (compatible; polixea.de-Robot +http://www.polixea.de)',
			metadata: {
				uaFamily: 'polixea.de',
				uaName: 'polixea.de',
				uaUrl: '',
				uaCompany: 'POLIXEA AG',
				uaCompanyUrl: 'http://www.polixea.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=polixea.de'
			}
		},
		'623': {
			userAgent: 'HiddenMarket-1.0-beta (www.hiddenmarket.net/crawler.php)',
			metadata: {
				uaFamily: 'HiddenMarket',
				uaName: 'HiddenMarket-1.0-beta',
				uaUrl: 'http://www.hiddenmarket.net/crawler.php',
				uaCompany: 'HiddenMarket Group, Inc.',
				uaCompanyUrl: 'http://www.hiddenmarket.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HiddenMarket'
			}
		},
		'624': {
			userAgent: 'Mozdex/0.7.1 (Mozdex; http://www.mozdex.com/bot.html; spider@mozdex.com)',
			metadata: {
				uaFamily: 'mozDex',
				uaName: 'Mozdex/0.7.1',
				uaUrl: 'http://www.mozdex.com/bot.html',
				uaCompany: 'Mozdex.com',
				uaCompanyUrl: 'http://www.mozdex.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=mozDex'
			}
		},
		'626': {
			userAgent: 'www.fi crawler, contact crawler@www.fi',
			metadata: {
				uaFamily: 'www.fi crawler',
				uaName: 'www.fi crawler',
				uaUrl: '',
				uaCompany: 'Fonecta',
				uaCompanyUrl: 'http://www.fonecta.fi/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=www.fi crawler'
			}
		},
		'629': {
			userAgent: 'Visbot/1.1 (Visvo.com - The Category Search Engine!; http://www.visvo.com/bot.html; bot@visvo.com)',
			metadata: {
				uaFamily: 'Visbot',
				uaName: 'Visbot/1.1',
				uaUrl: 'http://www.visvo.com/webmasters.html',
				uaCompany: 'Visvo Inc.',
				uaCompanyUrl: 'http://www.visvo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Visbot'
			}
		},
		'630': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE is not me; DAUMOA/1.0.0; DAUM Web Robot; Daum Communications Corp., Korea)',
			metadata: {
				uaFamily: 'Daumoa',
				uaName: 'DAUMOA/1.0.0',
				uaUrl: 'http://tab.search.daum.net/aboutWebSearch_en.html',
				uaCompany: 'Daum Communications Corp.',
				uaCompanyUrl: 'http://info.daum.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Daumoa'
			}
		},
		'631': {
			userAgent: 'LapozzBot/1.4 (+http://robot.lapozz.hu)',
			metadata: {
				uaFamily: 'LapozzBot',
				uaName: 'LapozzBot/1.4 hu',
				uaUrl: 'http://robot.lapozz.hu/',
				uaCompany: 'lapozz.hu',
				uaCompanyUrl: 'http://www.lapozz.hu/',
				uaIcon: 'bot_lapozzbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LapozzBot'
			}
		},
		'632': {
			userAgent: 'LapozzBot/1.4 (+http://robot.lapozz.com)',
			metadata: {
				uaFamily: 'LapozzBot',
				uaName: 'LapozzBot/1.4 com',
				uaUrl: 'http://robot.lapozz.com/',
				uaCompany: 'lapozz.hu',
				uaCompanyUrl: 'http://www.lapozz.hu/',
				uaIcon: 'bot_lapozzbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LapozzBot'
			}
		},
		'633': {
			userAgent: 'Krugle/Krugle,Nutch/0.8+ (Krugle web crawler; http://corp.krugle.com/crawler/info.html; webcrawler@krugle.com)',
			metadata: {
				uaFamily: 'Krugle',
				uaName: 'Krugle (Nutch/0.8+) b',
				uaUrl: 'http://corp.krugle.com/crawler/info.html',
				uaCompany: 'Steve Larsen',
				uaCompanyUrl: 'http://blog.krugle.com/?page_id=5',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Krugle'
			}
		},
		'645': {
			userAgent: 'textractor.harvester/h2/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h2/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'646': {
			userAgent: 'textractor.harvester/h27/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h27/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'648': {
			userAgent: 'textractor.harvester/h24/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h24/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'652': {
			userAgent: 'Mozilla/4.0 (compatible; DepSpid/5.07; +http://about.depspid.net)',
			metadata: {
				uaFamily: 'DepSpid',
				uaName: 'DepSpid/5.07',
				uaUrl: 'http://about.depspid.net/',
				uaCompany: 'Bjoern Henke',
				uaCompanyUrl: 'http://www.bjoernhenke.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DepSpid'
			}
		},
		'653': {
			userAgent: 'YodaoBot/1.0 (http://www.yodao.com/help/webmaster/spider/; )',
			metadata: {
				uaFamily: 'YodaoBot',
				uaName: 'YodaoBot/1.0',
				uaUrl: 'http://www.yodao.com/help/webmaster/spider/',
				uaCompany: 'Yodao',
				uaCompanyUrl: 'http://www.yodao.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YodaoBot'
			}
		},
		'656': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 4.0; Girafabot; girafabot at girafa dot com; http://www.girafa.com)',
			metadata: {
				uaFamily: 'Girafabot',
				uaName: 'Girafabot b',
				uaUrl: '',
				uaCompany: 'Girafa Inc.',
				uaCompanyUrl: 'http://www.girafa.com/',
				uaIcon: 'bot_girafabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Girafabot'
			}
		},
		'657': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.2; SV1; .NET CLR 1.1.4322; Girafabot [girafa.com])',
			metadata: {
				uaFamily: 'Girafabot',
				uaName: 'Girafabot c',
				uaUrl: '',
				uaCompany: 'Girafa Inc.',
				uaCompanyUrl: 'http://www.girafa.com/',
				uaIcon: 'bot_girafabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Girafabot'
			}
		},
		'658': {
			userAgent: 'VERASYS 2k Mozilla/4.0 (compatible; en) (compatible; MSIE 6.0; Windows NT 5.2; (+ http://web.verasys.ro); SV1; Unix; .NET CLR 1.1.4322)',
			metadata: {
				uaFamily: 'VERASYS 2k',
				uaName: 'VERASYS 2k',
				uaUrl: 'http://www.ghita.ro/article/1/verasys_2k.html',
				uaCompany: 'Serban Ghita',
				uaCompanyUrl: 'http://www.ghita.ro/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=VERASYS 2k'
			}
		},
		'665': {
			userAgent: 'Blaiz-Bee/2.00.6082 (+http://www.blaiz.net)',
			metadata: {
				uaFamily: 'Blaiz-Bee',
				uaName: 'Blaiz-Bee/2.00.6082',
				uaUrl: 'http://www.rawgrunt.com/index.html',
				uaCompany: 'Blaiz Enterprises',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Blaiz-Bee'
			}
		},
		'669': {
			userAgent: 'holmes/3.10.1 (OnetSzukaj/5.0; +http://szukaj.onet.pl)',
			metadata: {
				uaFamily: 'Holmes',
				uaName: 'holmes/3.10.1 - onet.pl',
				uaUrl: 'http://www.ucw.cz/holmes/',
				uaCompany: 'Martin Mare\u0161 and Robert \u0160palek',
				uaCompanyUrl: 'http://www.ucw.cz/holmes/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Holmes'
			}
		},
		'671': {
			userAgent: 'http://www.almaden.ibm.com/cs/crawler',
			metadata: {
				uaFamily: 'Almaden',
				uaName: 'Almaden',
				uaUrl: 'http://www.almaden.ibm.com/cs/crawler/',
				uaCompany: 'IBM Almaden Research Center',
				uaCompanyUrl: 'http://www.almaden.ibm.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Almaden'
			}
		},
		'676': {
			userAgent: 'AdsBot-Google (+http://www.google.com/adsbot.html)',
			metadata: {
				uaFamily: 'AdsBot-Google',
				uaName: 'AdsBot-Google',
				uaUrl: 'http://www.google.com/adsbot.html',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AdsBot-Google'
			}
		},
		'678': {
			userAgent: 'LinkWalker/2.0',
			metadata: {
				uaFamily: 'LinkWalker',
				uaName: 'LinkWalker/2.0',
				uaUrl: '',
				uaCompany: 'SEVENtwentyfour Inc.',
				uaCompanyUrl: 'http://www.seventwentyfour.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LinkWalker'
			}
		},
		'679': {
			userAgent: 'Mozilla/5.0 (compatible; Exabot/3.0; +http://www.exabot.com/go/robot)',
			metadata: {
				uaFamily: 'Exabot',
				uaName: 'Exabot/3.0',
				uaUrl: 'http://www.exabot.com/go/robot',
				uaCompany: 'Exalead S.A.',
				uaCompanyUrl: 'http://www.exalead.com/',
				uaIcon: 'bot_Exabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Exabot'
			}
		},
		'688': {
			userAgent: 'ConveraCrawler/0.9e (+http://www.authoritativeweb.com/crawl)',
			metadata: {
				uaFamily: 'ConveraCrawler',
				uaName: 'ConveraCrawler 0.9e',
				uaUrl: 'http://www.authoritativeweb.com/crawl',
				uaCompany: 'Convera Corporation',
				uaCompanyUrl: 'http://www.authoritativeweb.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ConveraCrawler'
			}
		},
		'689': {
			userAgent: 'miniRank/3.1 (miniRank; www.minirank.com; website ranking engine)',
			metadata: {
				uaFamily: 'miniRank',
				uaName: 'miniRank/3.1',
				uaUrl: 'http://www.minirank.com/',
				uaCompany: 'TitaniumLine.com',
				uaCompanyUrl: 'http://titaniumline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=miniRank'
			}
		},
		'690': {
			userAgent: 'Pingdom GIGRIB (http://www.pingdom.com)',
			metadata: {
				uaFamily: 'pingdom.com_bot',
				uaName: 'Pingdom GIGRIB',
				uaUrl: 'http://uptime.pingdom.com/general/what_is',
				uaCompany: 'Pingdom',
				uaCompanyUrl: 'http://www.pingdom.com/',
				uaIcon: 'bot_pingdomcom_bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=pingdom.com_bot'
			}
		},
		'694': {
			userAgent: 'Mozilla/5.0 (compatible; Ask Jeeves/Teoma; +http://about.ask.com/en/docs/about/webmasters.shtml)',
			metadata: {
				uaFamily: 'Ask Jeeves/Teoma',
				uaName: 'Ask Jeeves/Teoma',
				uaUrl: 'http://about.ask.com/en/docs/about/webmasters.shtml',
				uaCompany: 'Ask Jeeves Inc.',
				uaCompanyUrl: 'http://about.ask.com/en/docs/about/index.shtml',
				uaIcon: 'bot_AskJeeves.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ask Jeeves/Teoma'
			}
		},
		'698': {
			userAgent: 'VMBot/0.9 (VMBot; http://www.verticalmatch.com; vmbot@tradedot.com)',
			metadata: {
				uaFamily: 'VMBot',
				uaName: 'VMBot/0.9',
				uaUrl: '',
				uaCompany: 'Vertical Search Engine (China)',
				uaCompanyUrl: 'http://www.verticalmatch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=VMBot'
			}
		},
		'703': {
			userAgent: 'TurnitinBot/2.1 (http://www.turnitin.com/robot/crawlerinfo.html)',
			metadata: {
				uaFamily: 'TurnitinBot',
				uaName: 'TurnitinBot/2.1',
				uaUrl: 'http://www.turnitin.com/robot/crawlerinfo.html',
				uaCompany: 'iParadigms, LLC.',
				uaCompanyUrl: 'http://www.iparadigms.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=TurnitinBot'
			}
		},
		'710': {
			userAgent: 'heeii/Nutch-0.9-dev (heeii.com; www.heeii.com; nutch at heeii.com)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'heeii/Nutch-0.9-dev at heeii.com',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'712': {
			userAgent: 'Mozilla/5.0 (compatible; BecomeJPBot/2.3; MSIE 6.0 compatible; +http://www.become.co.jp/site_owners.html)',
			metadata: {
				uaFamily: 'BecomeBot',
				uaName: 'BecomeBot/2.3 b',
				uaUrl: 'http://www.become.com/site_owners.html',
				uaCompany: 'Become, Inc.',
				uaCompanyUrl: 'http://www.become.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BecomeBot'
			}
		},
		'715': {
			userAgent: 'AdsBot-Google',
			metadata: {
				uaFamily: 'AdsBot-Google',
				uaName: 'AdsBot-Google b',
				uaUrl: 'http://www.google.com/adsbot.html',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AdsBot-Google'
			}
		},
		'716': {
			userAgent: "HouxouCrawler/Nutch-0.8.2-dev (houxou.com's nutch-based crawler which serves special interest on-line communities; http://www.houxou.com/crawler; crawler at houxou dot com)",
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'Nutch/0.8.2-dev at houxou.com',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'725': {
			userAgent: 'DataFountains/Dmoz Downloader (http://ivia.ucr.edu/useragents.shtml)',
			metadata: {
				uaFamily: 'DataFountains',
				uaName: 'DataFountains at Dmoz',
				uaUrl: 'http://ivia.ucr.edu/useragents.shtml',
				uaCompany: 'University of California',
				uaCompanyUrl: 'http://www.universityofcalifornia.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DataFountains'
			}
		},
		'728': {
			userAgent: 'Mozilla/5.0 (compatible; YodaoBot/1.0; http://www.yodao.com/help/webmaster/spider/; )',
			metadata: {
				uaFamily: 'YodaoBot',
				uaName: 'YodaoBot/1.0',
				uaUrl: 'http://www.yodao.com/help/webmaster/spider/',
				uaCompany: 'yodao.com',
				uaCompanyUrl: 'http://www.yodao.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YodaoBot'
			}
		},
		'729': {
			userAgent: 'IRLbot/3.0 (compatible; MSIE 6.0; http://irl.cs.tamu.edu/crawler)',
			metadata: {
				uaFamily: 'IRLbot',
				uaName: 'IRLbot/3.0',
				uaUrl: 'http://irl.cs.tamu.edu/crawler/',
				uaCompany: 'Texas A&M University',
				uaCompanyUrl: 'http://www.tamu.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IRLbot'
			}
		},
		'731': {
			userAgent: 'Mozilla/5.0 (compatible; del.icio.us-thumbnails/1.0; FreeBSD) KHTML/4.3.2 (like Gecko)',
			metadata: {
				uaFamily: 'del.icio.us-thumbnails',
				uaName: 'del.icio.us-thumbnails/1.0',
				uaUrl: '',
				uaCompany: 'Yahoo! Inc',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=del.icio.us-thumbnails'
			}
		},
		'741': {
			userAgent: 'Gallent Search Spider v1.4 Robot 3 (http://www.GallentSearch.com/robot)',
			metadata: {
				uaFamily: 'Gallent Search Spider',
				uaName: 'Gallent Search Spider v1.4 Robot 3',
				uaUrl: '',
				uaCompany: 'Gallent Limited',
				uaCompanyUrl: 'http://www.gallentsearch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Gallent Search Spider'
			}
		},
		'742': {
			userAgent: 'CazoodleBot/0.1 (CazoodleBot Crawler; http://www.cazoodle.com; mqbot@cazoodle.com)',
			metadata: {
				uaFamily: 'CazoodleBot',
				uaName: 'CazoodleBot b',
				uaUrl: 'http://www.cazoodle.com/cazoodlebot.php',
				uaCompany: 'Cazoodle Inc.',
				uaCompanyUrl: 'http://www.cazoodle.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CazoodleBot'
			}
		},
		'747': {
			userAgent: 'ShopWiki/1.0 ( +http://www.shopwiki.com/wiki/Help:Bot)',
			metadata: {
				uaFamily: 'ShopWiki',
				uaName: 'ShopWiki/1.0',
				uaUrl: 'http://www.shopwiki.com/wiki/Help:Bot',
				uaCompany: 'ShopWiki Corp',
				uaCompanyUrl: 'http://www.shopwiki.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ShopWiki'
			}
		},
		'749': {
			userAgent: 'Blaiz-Bee/2.00.8315 (BE Internet Search Engine http://www.rawgrunt.com)',
			metadata: {
				uaFamily: 'Blaiz-Bee',
				uaName: 'Blaiz-Bee/2.00.8315',
				uaUrl: 'http://www.rawgrunt.com/index.html',
				uaCompany: 'Blaiz Enterprises',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Blaiz-Bee'
			}
		},
		'752': {
			userAgent: 'del.icio.us-thumbnails/1.0 Mozilla/5.0 (compatible; Konqueror/3.4; FreeBSD) KHTML/3.4.2 (like Gecko)',
			metadata: {
				uaFamily: 'del.icio.us-thumbnails',
				uaName: 'del.icio.us-thumbnails/1.0',
				uaUrl: '',
				uaCompany: 'Yahoo!',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=del.icio.us-thumbnails'
			}
		},
		'753': {
			userAgent: 'Mozilla/5.0 (compatible; Exabot-Images/3.0; +http://www.exabot.com/go/robot)',
			metadata: {
				uaFamily: 'Exabot',
				uaName: 'Exabot-Images/3.0',
				uaUrl: 'http://www.exabot.com/go/robot',
				uaCompany: 'Exalead S.A.',
				uaCompanyUrl: 'http://www.exalead.com/',
				uaIcon: 'bot_Exabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Exabot'
			}
		},
		'754': {
			userAgent: 'Snapbot/1.0 (+http://www.snap.com)',
			metadata: {
				uaFamily: 'Snapbot',
				uaName: 'Snapbot/1.0 b',
				uaUrl: '',
				uaCompany: 'Snap',
				uaCompanyUrl: 'http://www.snap.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Snapbot'
			}
		},
		'755': {
			userAgent: 'DataFountains/DMOZ Feature Vector Corpus Creator (http://ivia.ucr.edu/useragents.shtml)',
			metadata: {
				uaFamily: 'DataFountains',
				uaName: 'DataFountains at Dmoz b',
				uaUrl: 'http://ivia.ucr.edu/useragents.shtml',
				uaCompany: 'University of California',
				uaCompanyUrl: 'http://www.universityofcalifornia.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DataFountains'
			}
		},
		'756': {
			userAgent: 'HatenaScreenshot/1.0 (checker)',
			metadata: {
				uaFamily: 'HatenaScreenshot',
				uaName: 'HatenaScreenshot/1.0 (checker)',
				uaUrl: 'http://screenshot.hatena.ne.jp/help',
				uaCompany: 'hatena',
				uaCompanyUrl: 'http://www.hatena.ne.jp/company/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HatenaScreenshot'
			}
		},
		'758': {
			userAgent: 'Webscope/Nutch-0.9-dev (http://www.cs.washington.edu/homes/mjc/agent.html)',
			metadata: {
				uaFamily: 'Webscope Crawler',
				uaName: 'Webscope Crawler',
				uaUrl: 'http://www.cs.washington.edu/homes/mjc/agent.html',
				uaCompany: 'University of Washington Computer Science & Engineering',
				uaCompanyUrl: 'http://www.cs.washington.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Webscope Crawler'
			}
		},
		'760': {
			userAgent: 'posterus (seek.se) +http://www.seek.se/studio/index.php?id=47&t=details',
			metadata: {
				uaFamily: 'posterus',
				uaName: 'posterus',
				uaUrl: 'http://www.seek.se/studio/index.php?id=47&t=details',
				uaCompany: 'Seek.se',
				uaCompanyUrl: 'http://www.seek.se/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=posterus'
			}
		},
		'761': {
			userAgent: 'iaskspider/2.0(+http://iask.com/help/help_index.html)',
			metadata: {
				uaFamily: 'iaskspider',
				uaName: 'iaskspider/2.0',
				uaUrl: 'http://iask.com/help/help_index.html',
				uaCompany: 'SINA Corporation',
				uaCompanyUrl: 'http://corp.sina.com.cn/eng/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=iaskspider'
			}
		},
		'764': {
			userAgent: 'IlseBot/1.1',
			metadata: {
				uaFamily: 'IlseBot',
				uaName: 'IlseBot/1.1',
				uaUrl: '',
				uaCompany: 'ilse.nl',
				uaCompanyUrl: 'http://ilse.nl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IlseBot'
			}
		},
		'765': {
			userAgent: 'WebarooBot (Webaroo Bot; http://64.124.122.252/feedback.html)',
			metadata: {
				uaFamily: 'WebarooBot',
				uaName: 'WebarooBot (Webaroo Bot)',
				uaUrl: 'http://www.webaroo.com/company/site-owners',
				uaCompany: 'Webaroo Inc.',
				uaCompanyUrl: 'http://www.webaroo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebarooBot'
			}
		},
		'768': {
			userAgent: 'sogou web spider http://www.sogou.com/docs/help/webmasters.htm#07',
			metadata: {
				uaFamily: 'sogou spider',
				uaName: 'sogou spider',
				uaUrl: 'http://www.sogou.com/docs/help/webmasters.htm#07',
				uaCompany: 'SOGOU.COM',
				uaCompanyUrl: 'http://www.sogou.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sogou spider'
			}
		},
		'770': {
			userAgent: 'sogou web spider(+http://www.sogou.com/docs/help/webmasters.htm#07)',
			metadata: {
				uaFamily: 'sogou spider',
				uaName: 'sogou spider',
				uaUrl: 'http://www.sogou.com/docs/help/webmasters.htm#07',
				uaCompany: 'SOGOU.COM',
				uaCompanyUrl: 'http://www.sogou.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sogou spider'
			}
		},
		'771': {
			userAgent: 'NextGenSearchBot 1 (for information visit http://about.zoominfo.com/About/NextGenSearchBot.aspx)',
			metadata: {
				uaFamily: 'NextGenSearchBot',
				uaName: 'NextGenSearchBot 1',
				uaUrl: 'http://www.zoominfo.com/About/misc/NextGenSearchBot.aspx',
				uaCompany: 'Zoom Information Inc.',
				uaCompanyUrl: 'http://www.zoominfo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NextGenSearchBot'
			}
		},
		'773': {
			userAgent: 'Sogou web spider/3.0(+http://www.sogou.com/docs/help/webmasters.htm#07)',
			metadata: {
				uaFamily: 'sogou spider',
				uaName: 'Sogou web spider/3.0',
				uaUrl: 'http://www.sogou.com/docs/help/webmasters.htm#07',
				uaCompany: 'SOGOU.COM',
				uaCompanyUrl: 'http://www.sogou.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sogou spider'
			}
		},
		'774': {
			userAgent: 'Mozilla/5.0 (compatible; LinksManager.com_bot +http://linksmanager.com/linkchecker.html)',
			metadata: {
				uaFamily: 'linksmanager_bot',
				uaName: 'linksmanager_bot',
				uaUrl: 'http://linksmanager.com/linkchecker.html',
				uaCompany: 'CreativeNetVentures, Inc.',
				uaCompanyUrl: 'http://cnvi.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=linksmanager_bot'
			}
		},
		'778': {
			userAgent: 'LarbinWebCrawler (spider@download11.com)',
			metadata: {
				uaFamily: 'LemurWebCrawler',
				uaName: 'LabrinWebCrawler',
				uaUrl: 'http://boston.lti.cs.cmu.edu/crawler_12/',
				uaCompany: 'Language Technologies Institute',
				uaCompanyUrl: 'http://www.lti.cs.cmu.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LemurWebCrawler'
			}
		},
		'786': {
			userAgent: 'wectar/Nutch-0.9 (wectar - wectar extracted from the glorious web; http://goosebumps4all.net/wectar)',
			metadata: {
				uaFamily: 'wectar',
				uaName: 'wectar/Nutch-0.9',
				uaUrl: 'http://wectar.com/',
				uaCompany: 'Martin Dudek',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=wectar'
			}
		},
		'788': {
			userAgent: 'WebarooBot (Webaroo Bot; http://www.webaroo.com/rooSiteOwners.html)',
			metadata: {
				uaFamily: 'WebarooBot',
				uaName: 'WebarooBot (Webaroo Bot) b',
				uaUrl: 'http://www.webaroo.com/company/site-owners',
				uaCompany: 'Webaroo Inc.',
				uaCompanyUrl: 'http://www.webaroo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebarooBot'
			}
		},
		'789': {
			userAgent: 'Bigsearch.ca/Nutch-1.0-dev (Bigsearch.ca Internet Spider; http://www.bigsearch.ca/; info@enhancededge.com)',
			metadata: {
				uaFamily: 'Bigsearch.ca',
				uaName: 'Bigsearch.ca/Nutch-1.0-dev',
				uaUrl: '',
				uaCompany: 'bigsearch.ca',
				uaCompanyUrl: 'http://www.bigsearch.ca/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Bigsearch.ca'
			}
		},
		'791': {
			userAgent: 'MSRBOT (http://research.microsoft.com/research/sv/msrbot)',
			metadata: {
				uaFamily: 'MSRBOT',
				uaName: 'MSRBOT c',
				uaUrl: 'http://research.microsoft.com/research/sv/msrbot/',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSRBOT'
			}
		},
		'797': {
			userAgent: 'Jambot/0.1.1 (Jambot; http://www.jambot.com/blog; crawler@jambot.com)',
			metadata: {
				uaFamily: 'Jambot',
				uaName: 'Jambot/0.1.1',
				uaUrl: 'http://www.jambot.com/blog/static.php?page=webmaster-robot',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Jambot'
			}
		},
		'798': {
			userAgent: 'VisBot/2.0 (Visvo.com Crawler; http://www.visvo.com/bot.html; bot@visvo.com)',
			metadata: {
				uaFamily: 'Visbot',
				uaName: 'Visbot/2.0',
				uaUrl: 'http://www.visvo.com/webmasters.html',
				uaCompany: 'Visvo Inc.',
				uaCompanyUrl: 'http://www.visvo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Visbot'
			}
		},
		'804': {
			userAgent: 'Francis/2.0 (francis@neomo.de http://www.neomo.de/pages/crawler.php)',
			metadata: {
				uaFamily: 'Francis',
				uaName: 'Francis/2.0',
				uaUrl: 'http://www.neomo.de/pages/crawler.php',
				uaCompany: 'Neomo GmbH & Co. KG.',
				uaCompanyUrl: 'http://www.neomo.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Francis'
			}
		},
		'805': {
			userAgent: 'cinetic_htdig',
			metadata: {
				uaFamily: 'ht://Dig',
				uaName: 'ht://Dig',
				uaUrl: '',
				uaCompany: 'The ht://Dig Group',
				uaCompanyUrl: 'http://htdig.sourceforge.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ht://Dig'
			}
		},
		'807': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE is not me; DAUMOA/1.0.1; DAUM Web Robot; Daum Communications Corp., Korea)',
			metadata: {
				uaFamily: 'Daumoa',
				uaName: 'DAUMOA/1.0.1',
				uaUrl: 'http://tab.search.daum.net/aboutWebSearch_en.html',
				uaCompany: 'Daum Communications Corp.',
				uaCompanyUrl: 'http://info.daum.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Daumoa'
			}
		},
		'808': {
			userAgent: 'favorstarbot/1.0 (+http://favorstar.com/bot.html)',
			metadata: {
				uaFamily: 'favorstarbot',
				uaName: 'favorstarbot/1.0',
				uaUrl: 'http://favorstar.com/bot.html',
				uaCompany: 'favorstar.com',
				uaCompanyUrl: 'http://favorstar.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=favorstarbot'
			}
		},
		'809': {
			userAgent: 'FAST Enterprise Crawler 6 used by FAST (jim.mosher@fastsearch.com)',
			metadata: {
				uaFamily: 'FAST Enterprise Crawler',
				uaName: 'FAST Enterprise Crawler/6',
				uaUrl: 'http://www.fast.no/glossary.aspx?m=48&amid=415',
				uaCompany: 'Fast Search & Transfer',
				uaCompanyUrl: 'http://www.fastsearch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FAST Enterprise Crawler'
			}
		},
		'811': {
			userAgent: 'depspid - the dependency spider',
			metadata: {
				uaFamily: 'DepSpid',
				uaName: 'DepSpid',
				uaUrl: 'http://about.depspid.net/',
				uaCompany: 'Bjoern Henke',
				uaCompanyUrl: 'http://www.bjoernhenke.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DepSpid'
			}
		},
		'812': {
			userAgent: 'mozilla/4.0 (compatible; changedetection/1.0 (admin@changedetection.com))',
			metadata: {
				uaFamily: 'ChangeDetection',
				uaName: 'changedetection/1.0',
				uaUrl: '',
				uaCompany: 'FreeFind.com',
				uaCompanyUrl: 'http://www.freefind.com/',
				uaIcon: 'bot_ChangeDetection.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ChangeDetection'
			}
		},
		'813': {
			userAgent: 'mozilla/4.0 (compatible; myfamilybot/1.0; http://www.ancestry.com/learn/bot.aspx)',
			metadata: {
				uaFamily: 'MyFamilyBot',
				uaName: 'MyFamilyBot/1.0',
				uaUrl: 'http://www.ancestry.com/learn/bot.aspx',
				uaCompany: 'The Generations Network, Inc.',
				uaCompanyUrl: 'http://www.myfamilyinc.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MyFamilyBot'
			}
		},
		'814': {
			userAgent: 'navissobot/1.7  (+http://navisso.com/)',
			metadata: {
				uaFamily: 'navissobot',
				uaName: 'navissobot/1.7',
				uaUrl: 'http://navisso.com/topics?c=navissobot',
				uaCompany: 'Navisso Search',
				uaCompanyUrl: 'http://navisso.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=navissobot'
			}
		},
		'815': {
			userAgent: 'Mozilla/5.0 (compatible; SnapPreviewBot; en-US; rv:1.8.0.9) Gecko/20061206 Firefox/1.5.0.9',
			metadata: {
				uaFamily: 'SnapBot',
				uaName: 'SnapPreviewBot',
				uaUrl: '',
				uaCompany: 'Snap',
				uaCompanyUrl: 'http://www.snap.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SnapBot'
			}
		},
		'817': {
			userAgent: 'Mozilla/5.0 (compatible; BuzzRankingBot/1.0; +http://www.buzzrankingbot.com/)',
			metadata: {
				uaFamily: 'BuzzRankingBot',
				uaName: 'BuzzRankingBot/1.0',
				uaUrl: 'http://www.buzzrankingbot.com/',
				uaCompany: 'Matthieu Aubry',
				uaCompanyUrl: 'http://giik.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BuzzRankingBot'
			}
		},
		'820': {
			userAgent: 'lmspider/Nutch-0.9-dev (For research purposes.; www.nuance.com)',
			metadata: {
				uaFamily: 'lmspider',
				uaName: 'lmspider b',
				uaUrl: 'http://www.nuance.com/',
				uaCompany: 'Nuance Communications, Inc.',
				uaCompanyUrl: 'http://www.nuance.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=lmspider'
			}
		},
		'824': {
			userAgent: 'ccubee/3.5',
			metadata: {
				uaFamily: 'ccubee',
				uaName: 'ccubee/3.5',
				uaUrl: 'http://empyreum.com/technologies/platforms/ccubee/',
				uaCompany: 'EMPYREUM k. s.',
				uaCompanyUrl: 'http://empyreum.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ccubee'
			}
		},
		'825': {
			userAgent: 'Snapbot/1.0 (Snap Shots, +http://www.snap.com)',
			metadata: {
				uaFamily: 'Snapbot',
				uaName: 'Snapbot/1.0 c',
				uaUrl: '',
				uaCompany: 'Snap',
				uaCompanyUrl: 'http://www.snap.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Snapbot'
			}
		},
		'829': {
			userAgent: 'Acorn/Nutch-0.9 (Non-Profit Search Engine; acorn.isara.org; acorn at isara dot org)',
			metadata: {
				uaFamily: 'Acorn',
				uaName: 'Acorn/Nutch-0.9',
				uaUrl: 'http://acorn.isara.org/',
				uaCompany: 'Isara',
				uaCompanyUrl: 'http://www.isara.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Acorn'
			}
		},
		'832': {
			userAgent: 'nestReader/0.2 (discovery; http://echonest.com/reader.shtml; reader at echonest.com)',
			metadata: {
				uaFamily: 'nestReader',
				uaName: 'nestReader/0.2',
				uaUrl: 'http://echonest.com/reader.shtml',
				uaCompany: 'The Echo Nest Corporation',
				uaCompanyUrl: 'http://echonest.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=nestReader'
			}
		},
		'833': {
			userAgent: 'boitho.com-dc/0.86 ( http://www.boitho.com/dcbot.html )',
			metadata: {
				uaFamily: 'boitho.com-dc',
				uaName: 'boitho.com-dc/0.86',
				uaUrl: 'http://www.boitho.com/dcbot.html',
				uaCompany: 'Boitho',
				uaCompanyUrl: 'http://www.boitho.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=boitho.com-dc'
			}
		},
		'835': {
			userAgent: 'Snappy/1.1 ( http://www.urltrends.com/ )',
			metadata: {
				uaFamily: 'Snappy',
				uaName: 'Snappy/1.1',
				uaUrl: 'http://www.urltrends.com/',
				uaCompany: 'Xerocity Design Group, LLC.',
				uaCompanyUrl: 'http://www.xerocity.com/',
				uaIcon: 'bot_snappy.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Snappy'
			}
		},
		'844': {
			userAgent: 'great-plains-web-spider/gpws (Flatland Industries Web Spider; http://www.flatlandindustries.com/flatlandbot.php; jason@flatlandindustries.com)',
			metadata: {
				uaFamily: 'flatlandbot',
				uaName: 'flatlandbot c',
				uaUrl: 'http://www.flatlandindustries.com/flatlandbot.php',
				uaCompany: 'Flatland Industries, Inc.',
				uaCompanyUrl: 'http://www.flatlandindustries.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=flatlandbot'
			}
		},
		'851': {
			userAgent: 'Mozilla/5.0 (compatible; FunnelBack; http://cyan.funnelback.com/robot.html)',
			metadata: {
				uaFamily: 'FunnelBack',
				uaName: 'FunnelBack',
				uaUrl: 'http://cyan.funnelback.com/robot.html',
				uaCompany: 'Funnelback Pty Ltd',
				uaCompanyUrl: 'http://www.funnelback.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FunnelBack'
			}
		},
		'856': {
			userAgent: 'RedBot/redbot-1.0 (Rediff.com Crawler; redbot at rediff dot com)',
			metadata: {
				uaFamily: 'RedBot',
				uaName: 'RedBot1.0',
				uaUrl: '',
				uaCompany: 'Rediff.com India Limited.',
				uaCompanyUrl: 'http://www.rediff.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=RedBot'
			}
		},
		'859': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/1.12.0 +http://www.accelobot.com)',
			metadata: {
				uaFamily: 'Accelobot',
				uaName: 'Accelobot',
				uaUrl: 'http://www.accelobot.com/',
				uaCompany: 'NetBase Solutions, Inc.',
				uaCompanyUrl: 'http://www.netbase.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Accelobot'
			}
		},
		'861': {
			userAgent: 'wectar/Nutch-0.9 (nectar extracted form the glorious web; http://goosebumps4all.net/wectar; see website)',
			metadata: {
				uaFamily: 'wectar',
				uaName: 'wectar/Nutch-0.9 b',
				uaUrl: 'http://wectar.com/',
				uaCompany: 'Martin Dudek',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=wectar'
			}
		},
		'865': {
			userAgent: 'MQBOT/Nutch-0.9-dev (MQBOT Nutch Crawler; http://vwbot.cs.uiuc.edu; mqbot@cs.uiuc.edu)',
			metadata: {
				uaFamily: 'MQbot',
				uaName: 'MQBOT/Nutch-0.9-dev c',
				uaUrl: 'http://metaquerier.cs.uiuc.edu/crawler/',
				uaCompany: 'University of Illinois at Urbana-Champaign',
				uaCompanyUrl: 'http://www.uiuc.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MQbot'
			}
		},
		'872': {
			userAgent: 'Willow Internet Crawler by Twotrees V2.1',
			metadata: {
				uaFamily: 'Willow Internet Crawler',
				uaName: 'Willow Internet Crawler 2.1',
				uaUrl: '',
				uaCompany: 'Twotrees Technologies, LLC.',
				uaCompanyUrl: 'http://www.twotrees.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Willow Internet Crawler'
			}
		},
		'873': {
			userAgent: 'Netintelligence LiveAssessment - www.netintelligence.com',
			metadata: {
				uaFamily: 'Netintelligence LiveAssessment',
				uaName: 'Netintelligence LiveAssessment',
				uaUrl: '',
				uaCompany: 'Netintelligence Limited',
				uaCompanyUrl: 'http://www.netintelligence.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Netintelligence LiveAssessment'
			}
		},
		'874': {
			userAgent: 'Mozilla/5.0 (compatible; SkreemRBot +http://skreemr.com)',
			metadata: {
				uaFamily: 'SkreemRBot',
				uaName: 'SkreemRBot',
				uaUrl: '',
				uaCompany: 'SkreemR',
				uaCompanyUrl: 'http://skreemr.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SkreemRBot'
			}
		},
		'876': {
			userAgent: 'great-plains-web-spider/flatlandbot (Flatland Industries Web Robot; http://www.flatlandindustries.com/flatlandbot.php; jason@flatlandindustries.com)',
			metadata: {
				uaFamily: 'flatlandbot',
				uaName: 'flatlandbot b',
				uaUrl: 'http://www.flatlandindustries.com/flatlandbot.php',
				uaCompany: 'Flatland Industries, Inc.',
				uaCompanyUrl: 'http://www.flatlandindustries.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=flatlandbot'
			}
		},
		'877': {
			userAgent: 'flatlandbot/flatlandbot (Flatland Industries Web Spider; http://www.flatlandindustries.com/flatlandbot.php; jason@flatlandindustries.com)',
			metadata: {
				uaFamily: 'flatlandbot',
				uaName: 'flatlandbot',
				uaUrl: 'http://www.flatlandindustries.com/flatlandbot.php',
				uaCompany: 'Flatland Industries, Inc.',
				uaCompanyUrl: 'http://www.flatlandindustries.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=flatlandbot'
			}
		},
		'881': {
			userAgent: 'Larbin (larbin2.6.3@unspecified.mail)',
			metadata: {
				uaFamily: 'Larbin',
				uaName: 'Larbin/2.6.3',
				uaUrl: '',
				uaCompany: 'Sebastien Ailleret',
				uaCompanyUrl: 'http://larbin.sourceforge.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Larbin'
			}
		},
		'882': {
			userAgent: 'InternetSeer.com',
			metadata: {
				uaFamily: 'InternetSeer',
				uaName: 'InternetSeer (Web Monitor)',
				uaUrl: '',
				uaCompany: 'InternetSeer',
				uaCompanyUrl: 'http://internetseer.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=InternetSeer'
			}
		},
		'886': {
			userAgent: 'panscient.com',
			metadata: {
				uaFamily: 'Panscient web crawler',
				uaName: 'Panscient web crawler',
				uaUrl: 'http://panscient.com/faq.html',
				uaCompany: 'Panscient, Inc.',
				uaCompanyUrl: 'http://panscient.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Panscient web crawler'
			}
		},
		'888': {
			userAgent: 'void-bot/0.1 (bot@void.be; http://www.void.be/)',
			metadata: {
				uaFamily: 'void-bot',
				uaName: 'void-bot/0.1',
				uaUrl: 'http://www.void.be/void-bot.html',
				uaCompany: 'Void Security',
				uaCompanyUrl: 'http://www.void.be/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=void-bot'
			}
		},
		'890': {
			userAgent: 'Mozilla/2.0 (compatible; Ask Jeeves/Teoma; http://about.ask.com/en/docs/about/webmasters.shtml)',
			metadata: {
				uaFamily: 'Ask Jeeves/Teoma',
				uaName: 'Ask Jeeves/Teoma - d',
				uaUrl: 'http://about.ask.com/en/docs/about/webmasters.shtml',
				uaCompany: 'Ask Jeeves Inc.',
				uaCompanyUrl: 'http://about.ask.com/en/docs/about/index.shtml',
				uaIcon: 'bot_AskJeeves.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ask Jeeves/Teoma'
			}
		},
		'891': {
			userAgent: 'Mozilla/5.0 (compatible; Yoono; http://www.yoono.com/)',
			metadata: {
				uaFamily: 'Yoono Bot',
				uaName: 'Yoono Bot',
				uaUrl: 'http://blog.yoono.com/blog/?page_id=40',
				uaCompany: 'Yoono Team',
				uaCompanyUrl: 'http://www.yoono.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yoono Bot'
			}
		},
		'892': {
			userAgent: 'Accelobot',
			metadata: {
				uaFamily: 'Accelobot',
				uaName: 'Accelobot',
				uaUrl: 'http://www.accelobot.com/',
				uaCompany: 'Accelovation, Inc.',
				uaCompanyUrl: 'http://www.accelovation.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Accelobot'
			}
		},
		'902': {
			userAgent: 'WebAlta Crawler/1.3.33 (http://www.webalta.net/ru/about_webmaster.html) (Windows; U; Windows NT 5.1; ru-RU)',
			metadata: {
				uaFamily: 'WebAlta Crawler',
				uaName: 'WebAlta Crawler/1.3.33',
				uaUrl: 'http://www.webalta.net/ru/about_webmaster.html',
				uaCompany: 'Webalta',
				uaCompanyUrl: 'http://www.webalta.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebAlta Crawler'
			}
		},
		'911': {
			userAgent: 'Sirketcebot/v.01 (http://www.sirketce.com/bot.html)',
			metadata: {
				uaFamily: 'Sirketce/Busiverse',
				uaName: 'Sirketcebot/v.01',
				uaUrl: 'http://www.sirketce.com/bot.html',
				uaCompany: 'BERI.L Teknoloji Ltd.',
				uaCompanyUrl: 'http://www.berilteknoloji.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Sirketce/Busiverse'
			}
		},
		'913': {
			userAgent: 'ZoomSpider - wrensoft.com [ZSEBOT]',
			metadata: {
				uaFamily: 'ZoomSpider (ZSEBOT)',
				uaName: 'ZoomSpider (ZSEBOT)',
				uaUrl: 'http://wrensoft.com/zoom/support/useragent.html',
				uaCompany: 'PassMark Software Pty Ltd.',
				uaCompanyUrl: 'http://www.passmark.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ZoomSpider (ZSEBOT)'
			}
		},
		'914': {
			userAgent: 'Mozilla/5.0 (compatible; Quantcastbot/1.0; www.quantcast.com)',
			metadata: {
				uaFamily: 'Quantcastbot',
				uaName: 'Quantcastbot/1.0',
				uaUrl: '',
				uaCompany: 'Quantcast Corporation',
				uaCompanyUrl: 'http://www.quantcast.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Quantcastbot'
			}
		},
		'917': {
			userAgent: 'NutchCVS/Nutch-0.9 (Nutch; http://lucene.apache.org/nutch/bot.html; nutch-agent@lucene.apache.org)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'NutchCSV/0.9',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'920': {
			userAgent: 'Gigabot/3.0 (http://www.gigablast.com/spider.html)',
			metadata: {
				uaFamily: 'Gigabot',
				uaName: 'Gigabot/3.0',
				uaUrl: 'http://www.gigablast.com/spider.html',
				uaCompany: 'Gigablast Inc',
				uaCompanyUrl: 'http://www.gigablast.com/',
				uaIcon: 'bot_gigabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Gigabot'
			}
		},
		'921': {
			userAgent: 'Snapbot/1.0 (Site Search Crawler, +http://www.snap.com)',
			metadata: {
				uaFamily: 'Snapbot',
				uaName: 'Snapbot/1.0 d',
				uaUrl: '',
				uaCompany: 'Snap',
				uaCompanyUrl: 'http://www.snap.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Snapbot'
			}
		},
		'922': {
			userAgent: 'WebAlta Crawler/1.3.34 (http://www.webalta.net/ru/about_webmaster.html) (Windows; U; Windows NT 5.1; ru-RU)',
			metadata: {
				uaFamily: 'WebAlta Crawler',
				uaName: 'WebAlta Crawler/1.3.34',
				uaUrl: 'http://www.webalta.net/ru/about_webmaster.html',
				uaCompany: 'Webalta',
				uaCompanyUrl: 'http://www.webalta.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebAlta Crawler'
			}
		},
		'925': {
			userAgent: 'great-plains-web-spider/flatlandbot (Flatland Industries Web Spider; http://www.flatlandindustries.com/flatlandbot.php; jason@flatlandindustries.com)',
			metadata: {
				uaFamily: 'flatlandbot',
				uaName: 'flatlandbot d',
				uaUrl: 'http://www.flatlandindustries.com/flatlandbot.php',
				uaCompany: 'Flatland Industries, Inc.',
				uaCompanyUrl: 'http://www.flatlandindustries.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=flatlandbot'
			}
		},
		'927': {
			userAgent: 'holmes/3.11 (OnetSzukaj/5.0; +http://szukaj.onet.pl)',
			metadata: {
				uaFamily: 'Holmes',
				uaName: 'holmes/3.11 - onet.pl',
				uaUrl: 'http://www.ucw.cz/holmes/',
				uaCompany: 'Martin Mare\u0161 and Robert \u0160palek',
				uaCompanyUrl: 'http://www.ucw.cz/holmes/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Holmes'
			}
		},
		'928': {
			userAgent: 'CazoodleBot/Nutch-0.9-dev (CazoodleBot Crawler; http://www.cazoodle.com/cazoodlebot; cazoodlebot@cazoodle.com)',
			metadata: {
				uaFamily: 'CazoodleBot',
				uaName: 'CazoodleBot c',
				uaUrl: 'http://www.cazoodle.com/cazoodlebot.php',
				uaCompany: 'Cazoodle Inc.',
				uaCompanyUrl: 'http://www.cazoodle.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CazoodleBot'
			}
		},
		'929': {
			userAgent: 'VWBOT/Nutch-0.9-dev (VWBOT Nutch Crawler; http://vwbot.cs.uiuc.edu; vwbot@cs.uiuc.edu)',
			metadata: {
				uaFamily: 'VWBot',
				uaName: 'VWBot/Nutch-0.9-dev',
				uaUrl: 'http://vwbot.cs.uiuc.edu/',
				uaCompany: 'University of Illinois at Urbana-Champaign',
				uaCompanyUrl: 'http://www.cs.uiuc.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=VWBot'
			}
		},
		'934': {
			userAgent: 'Spock Crawler (http://www.spock.com/crawler)',
			metadata: {
				uaFamily: 'Spock Crawler',
				uaName: 'Spock Crawler',
				uaUrl: 'http://www.spock.com/crawler',
				uaCompany: 'spock.com',
				uaCompanyUrl: 'http://www.spock.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Spock Crawler'
			}
		},
		'938': {
			userAgent: 'Mozilla/4.0 (compatible; DepSpid/5.10; +http://about.depspid.net)',
			metadata: {
				uaFamily: 'DepSpid',
				uaName: 'DepSpid/5.10',
				uaUrl: 'http://about.depspid.net/',
				uaCompany: 'Bjoern Henke',
				uaCompanyUrl: 'http://www.bjoernhenke.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DepSpid'
			}
		},
		'959': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1;  http://www.changedetection.com/bot.html )',
			metadata: {
				uaFamily: 'ChangeDetection',
				uaName: 'ChangeDetection',
				uaUrl: 'http://www.changedetection.com/bot.html',
				uaCompany: 'FreeFind.com',
				uaCompanyUrl: 'http://www.freefind.com/',
				uaIcon: 'bot_ChangeDetection.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ChangeDetection'
			}
		},
		'961': {
			userAgent: 'textractor.harvester/h5/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h5/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'962': {
			userAgent: 'textractor.harvester/h39/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h39/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'963': {
			userAgent: 'textractor.harvester/h37/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h37/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'964': {
			userAgent: 'textractor.harvester/h38/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h38/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'965': {
			userAgent: 'textractor.harvester/h12/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h12/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'966': {
			userAgent: 'textractor.harvester/h34/1.0 (+http://ufal.mff.cuni.cz/project/textractor/, textractor@ufal.mff.cuni.cz)',
			metadata: {
				uaFamily: 'textractor',
				uaName: 'textractor.harvester/h34/1.0',
				uaUrl: 'http://ufal.mff.cuni.cz/project/textractor/',
				uaCompany: 'Institute of Formal and Applied Linguistics (\xdaFAL)',
				uaCompanyUrl: 'http://ufal.mff.cuni.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=textractor'
			}
		},
		'967': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE enviable; DAUMOA/1.0.1; DAUM Web Robot; Daum Communications Corp., Korea; +http://ws.daum.net/aboutkr.html)',
			metadata: {
				uaFamily: 'Daumoa',
				uaName: 'DAUMOA/1.0.1 b',
				uaUrl: 'http://tab.search.daum.net/aboutWebSearch_en.html',
				uaCompany: 'Daum Communications Corp.',
				uaCompanyUrl: 'http://info.daum.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Daumoa'
			}
		},
		'969': {
			userAgent: 'CazoodleBot/CazoodleBot-0.1 (CazoodleBot Crawler; http://www.cazoodle.com/cazoodlebot; cazoodlebot@cazoodle.com)',
			metadata: {
				uaFamily: 'CazoodleBot',
				uaName: 'CazoodleBot-0.1',
				uaUrl: 'http://www.cazoodle.com/cazoodlebot.php',
				uaCompany: 'Cazoodle Inc.',
				uaCompanyUrl: 'http://www.cazoodle.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CazoodleBot'
			}
		},
		'977': {
			userAgent: 'multicrawler (+http://sw.deri.org/2006/04/multicrawler/robots.html)',
			metadata: {
				uaFamily: 'MultiCrawler',
				uaName: 'MultiCrawler',
				uaUrl: 'http://sw.deri.org/2006/04/multicrawler/robots.html',
				uaCompany: 'Semantic Web Search Engine',
				uaCompanyUrl: 'http://swse.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MultiCrawler'
			}
		},
		'982': {
			userAgent: 'Mediapartners-Google',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Mediapartners-Google',
				uaUrl: 'http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1061943',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'994': {
			userAgent: 'MnoGoSearch/3.3.2',
			metadata: {
				uaFamily: 'MnoGoSearch',
				uaName: 'MnoGoSearch/3.3.2',
				uaUrl: 'http://www.mnogosearch.org/products.html',
				uaCompany: 'Lavtech.Com',
				uaCompanyUrl: 'http://www.lavtech.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MnoGoSearch'
			}
		},
		'999': {
			userAgent: 'Speedy Spider (http://www.entireweb.com/about/search_tech/speedy_spider/)',
			metadata: {
				uaFamily: 'Speedy',
				uaName: 'Speedy Spider',
				uaUrl: '',
				uaCompany: 'Entireweb Sweden AB',
				uaCompanyUrl: 'http://www.entireweb.com/',
				uaIcon: 'bot_Speedy.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Speedy'
			}
		},
		'1005': {
			userAgent: 'FAST Enterprise Crawler 6 used by Virk.dk - udvikling (thomas.bentzen@capgemini.com)',
			metadata: {
				uaFamily: 'FAST Enterprise Crawler',
				uaName: 'FAST Enterprise Crawler 6 at virk.dk',
				uaUrl: 'http://www.fast.no/glossary.aspx?m=48&amid=415',
				uaCompany: 'Fast Search & Transfer',
				uaCompanyUrl: 'http://www.fastsearch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FAST Enterprise Crawler'
			}
		},
		'1023': {
			userAgent: 'ccubee/2008',
			metadata: {
				uaFamily: 'ccubee',
				uaName: 'ccubee/2008',
				uaUrl: 'http://empyreum.com/technologies/platforms/ccubee/',
				uaCompany: 'EMPYREUM k. s.',
				uaCompanyUrl: 'http://empyreum.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ccubee'
			}
		},
		'1024': {
			userAgent: 'MSRBOT (http://research.microsoft.com/research/sv/msrbot/',
			metadata: {
				uaFamily: 'MSRBOT',
				uaName: 'MSRBOT d',
				uaUrl: 'http://research.microsoft.com/research/sv/msrbot/',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSRBOT'
			}
		},
		'1027': {
			userAgent: 'Enterprise_Search/1.00.143;MSSQL (http://www.innerprise.net/es-spider.asp)',
			metadata: {
				uaFamily: 'Enterprise_Search',
				uaName: 'Enterprise_Search/1.00.143',
				uaUrl: 'http://www.innerprise.net/hosted-bi.asp',
				uaCompany: 'Innerprise',
				uaCompanyUrl: 'http://www.innerprise.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Enterprise_Search'
			}
		},
		'1035': {
			userAgent: 'FyberSpider/1.2 (http://www.fybersearch.com/fyberspider.php)',
			metadata: {
				uaFamily: 'FyberSpider',
				uaName: 'FyberSpider/1.2',
				uaUrl: 'http://www.fybersearch.com/fyberspider.php',
				uaCompany: 'FyberSearch',
				uaCompanyUrl: 'http://www.fybersearch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FyberSpider'
			}
		},
		'1037': {
			userAgent: 'owsBot/0.1 (Nutch; www.oneworldstreet.com; nutch-agent@lucene.apache.org)',
			metadata: {
				uaFamily: 'owsBot',
				uaName: 'owsBot/0.1',
				uaUrl: '',
				uaCompany: 'OneWorldStreet.com',
				uaCompanyUrl: 'http://www.oneworldstreet.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=owsBot'
			}
		},
		'1040': {
			userAgent: 'owsBot/0.2 (owsBot; www.oneworldstreet.com; owsBot)',
			metadata: {
				uaFamily: 'owsBot',
				uaName: 'owsBot/0.2',
				uaUrl: '',
				uaCompany: 'OneWorldStreet.com',
				uaCompanyUrl: 'http://www.oneworldstreet.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=owsBot'
			}
		},
		'1042': {
			userAgent: 'ASAHA Search Engine Turkey V.001 (http://www.asaha.com/)',
			metadata: {
				uaFamily: 'ASAHA Search Engine Turkey',
				uaName: 'ASAHA Search Engine Turkey V.001',
				uaUrl: 'http://www.asaha.com/beta/',
				uaCompany: 'asaha.com',
				uaCompanyUrl: 'http://www.asaha.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ASAHA Search Engine Turkey'
			}
		},
		'1044': {
			userAgent: 'ICF_Site_Crawler+(see+http://www.infocenter.fi/spiderinfo.html)',
			metadata: {
				uaFamily: 'ICF_Site_Crawler',
				uaName: 'ICF_Site_Crawler',
				uaUrl: 'http://www.infocenter.fi/spiderinfo.html',
				uaCompany: 'Info Center Finland Ltd.',
				uaCompanyUrl: 'http://www.infocenter.fi/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ICF_Site_Crawler'
			}
		},
		'1052': {
			userAgent: 'Giant/1.0 (Openmaru bot; robot@openmaru.com)',
			metadata: {
				uaFamily: 'Giant/1.0',
				uaName: 'Giant/1.0',
				uaUrl: '',
				uaCompany: 'openmaru studio',
				uaCompanyUrl: 'http://www.openmaru.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Giant/1.0'
			}
		},
		'1061': {
			userAgent: 'Factbot 1.09',
			metadata: {
				uaFamily: 'factbot',
				uaName: 'Factbot 1.09',
				uaUrl: 'http://www.factbites.com/webmasters.php',
				uaCompany: 'Rapid Intelligence Pty Ltd',
				uaCompanyUrl: 'http://www.rapint.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=factbot'
			}
		},
		'1072': {
			userAgent: 'Mozilla/5.0 (Windows;) NimbleCrawler 2.0.2 obeys UserAgent NimbleCrawler For problems contact: crawler@healthline.com',
			metadata: {
				uaFamily: 'NimbleCrawler',
				uaName: 'NimbleCrawler/2.0.2',
				uaUrl: '',
				uaCompany: 'Healthline Networks, Inc.',
				uaCompanyUrl: 'http://www.healthline.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NimbleCrawler'
			}
		},
		'1078': {
			userAgent: 'SygolBot http://www.sygol.com',
			metadata: {
				uaFamily: 'SygolBot',
				uaName: 'SygolBot',
				uaUrl: 'http://www.sygol.com/SygolBot.asp',
				uaCompany: 'Giorgio Galeotti',
				uaCompanyUrl: 'http://www.sygol.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SygolBot'
			}
		},
		'1089': {
			userAgent: "HouxouCrawler/Nutch-0.9 (houxou.com's nutch-based crawler which serves special interest on-line communities; http://www.houxou.com/crawler; crawler at houxou dot com)",
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'Nutch/0.9 at houxou.com',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'1092': {
			userAgent: 'Steeler/3.3 (http://www.tkl.iis.u-tokyo.ac.jp/~crawler/)',
			metadata: {
				uaFamily: 'Steeler',
				uaName: 'Steeler/3.3',
				uaUrl: 'http://www.tkl.iis.u-tokyo.ac.jp/~crawler/',
				uaCompany: 'Kitsuregawa Laboratory, The University of Tokyo',
				uaCompanyUrl: 'http://www.tkl.iis.u-tokyo.ac.jp/',
				uaIcon: 'bot_Steeler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Steeler'
			}
		},
		'1095': {
			userAgent: 'nrsbot/5.0(loopip.com/robot.html)',
			metadata: {
				uaFamily: 'NetResearchServer',
				uaName: 'nrsbot/5.0',
				uaUrl: 'http://loopip.com/robot.html',
				uaCompany: 'LoopIP LLC',
				uaCompanyUrl: 'http://loopip.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NetResearchServer'
			}
		},
		'1102': {
			userAgent: 'NextGenSearchBot 1 (for information visit http://www.zoominfo.com/About/misc/NextGenSearchBot.aspx)',
			metadata: {
				uaFamily: 'NextGenSearchBot',
				uaName: 'NextGenSearchBot 1 b',
				uaUrl: 'http://www.zoominfo.com/About/misc/NextGenSearchBot.aspx',
				uaCompany: 'Zoom Information Inc.',
				uaCompanyUrl: 'http://www.zoominfo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NextGenSearchBot'
			}
		},
		'1115': {
			userAgent: 'Mozilla/5.0 (compatible; egothor/11.0d; +http://ego.ms.mff.cuni.cz/)',
			metadata: {
				uaFamily: 'egothor',
				uaName: 'egothor/11.0d',
				uaUrl: 'http://ego.ms.mff.cuni.cz/',
				uaCompany: 'Katedra softwarov\xe9ho in\u017een\xfdrstv\xed Univerzity Karlovi',
				uaCompanyUrl: 'http://kocour.ms.mff.cuni.cz/cs/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=egothor'
			}
		},
		'1133': {
			userAgent: 'GeonaBot/1.2; http://www.geona.com/',
			metadata: {
				uaFamily: 'GeonaBot',
				uaName: 'GeonaBot/1.2',
				uaUrl: 'http://www.geona.net/about.htm',
				uaCompany: 'Gold Vision Communications',
				uaCompanyUrl: 'http://www.goldvision.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=GeonaBot'
			}
		},
		'1137': {
			userAgent: 'Mozilla/4.0 (compatible; DepSpid/5.24; +http://about.depspid.net)',
			metadata: {
				uaFamily: 'DepSpid',
				uaName: 'DepSpid/5.24',
				uaUrl: 'http://about.depspid.net/',
				uaCompany: 'Bjoern Henke',
				uaCompanyUrl: 'http://www.bjoernhenke.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DepSpid'
			}
		},
		'1150': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE enviable; DAUMOA 2.0; DAUM Web Robot; Daum Communications Corp., Korea; +http://ws.daum.net/aboutkr.html)',
			metadata: {
				uaFamily: 'Daumoa',
				uaName: 'Daumoa/2.0',
				uaUrl: 'http://tab.search.daum.net/aboutWebSearch_en.html',
				uaCompany: 'Daum Communications Corp.',
				uaCompanyUrl: 'http://info.daum.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Daumoa'
			}
		},
		'1164': {
			userAgent: 'Mozilla/4.0 (compatible; DepSpid/5.25; +http://about.depspid.net)',
			metadata: {
				uaFamily: 'DepSpid',
				uaName: 'DepSpid/5.25',
				uaUrl: 'http://about.depspid.net/',
				uaCompany: 'Bjoern Henke',
				uaCompanyUrl: 'http://www.bjoernhenke.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DepSpid'
			}
		},
		'1169': {
			userAgent: 'Mozilla/5.0 (compatible; egothor/11.0d; +https://kocour.ms.mff.cuni.cz/ego/)',
			metadata: {
				uaFamily: 'egothor',
				uaName: 'egothor/11.0d b',
				uaUrl: 'http://ego.ms.mff.cuni.cz/',
				uaCompany: 'Katedra softwarov\xe9ho in\u017een\xfdrstv\xed Univerzity Karlovi',
				uaCompanyUrl: 'http://kocour.ms.mff.cuni.cz/cs/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=egothor'
			}
		},
		'1180': {
			userAgent: 'msnbot/1.1 (+http://search.msn.com/msnbot.htm)',
			metadata: {
				uaFamily: 'MSNBot',
				uaName: 'MSNBot/1.1',
				uaUrl: 'http://search.msn.com/msnbot.htm',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSNBot'
			}
		},
		'1197': {
			userAgent: 'ichiro/3.0 (http://help.goo.ne.jp/door/crawler.html)',
			metadata: {
				uaFamily: 'ichiro',
				uaName: 'ichiro/3.0',
				uaUrl: 'http://search.goo.ne.jp/option/use/sub4/sub4-1/',
				uaCompany: 'NTT-Resonant Inc.',
				uaCompanyUrl: 'http://www.nttr.co.jp/',
				uaIcon: 'bot_ichiro.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ichiro'
			}
		},
		'1198': {
			userAgent: 'EnaBot/1.1 (http://www.enaball.com/crawler.html)',
			metadata: {
				uaFamily: 'EnaBot',
				uaName: 'EnaBot/1.1',
				uaUrl: 'http://www.enaball.com/crawler.html',
				uaCompany: 'Enaball Inc.',
				uaCompanyUrl: 'http://www.enaball.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=EnaBot'
			}
		},
		'1205': {
			userAgent: 'EnaBot/1.2 (http://www.enaball.com/crawler.html)',
			metadata: {
				uaFamily: 'EnaBot',
				uaName: 'EnaBot/1.2',
				uaUrl: 'http://www.enaball.com/crawler.html',
				uaCompany: 'Enaball Inc.',
				uaCompanyUrl: 'http://www.enaball.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=EnaBot'
			}
		},
		'1210': {
			userAgent: 'Mahiti.Com/Mahiti Crawler-1.0 (Mahiti.Com; http://mahiti.com ; mahiti.com)',
			metadata: {
				uaFamily: 'Mahiti Crawler',
				uaName: 'Mahiti Crawler-1.0',
				uaUrl: '',
				uaCompany: 'Mahiti.Com',
				uaCompanyUrl: 'http://mahiti.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Mahiti Crawler'
			}
		},
		'1213': {
			userAgent: 'MLBot (www.metadatalabs.com)',
			metadata: {
				uaFamily: 'MLBot',
				uaName: 'MLBot',
				uaUrl: 'http://www.metadatalabs.com/mlbot/',
				uaCompany: 'metadata labs',
				uaCompanyUrl: 'http://www.metadatalabs.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MLBot'
			}
		},
		'1214': {
			userAgent: 'Mozilla/4.0 (compatible; DepSpid/5.26; +http://about.depspid.net)',
			metadata: {
				uaFamily: 'DepSpid',
				uaName: 'DepSpid/5.26',
				uaUrl: 'http://about.depspid.net/',
				uaCompany: 'Bjoern Henke',
				uaCompanyUrl: 'http://www.bjoernhenke.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DepSpid'
			}
		},
		'1220': {
			userAgent: 'IRLbot/3.0 (compatible; MSIE 6.0; http://irl.cs.tamu.edu/crawler/)',
			metadata: {
				uaFamily: 'IRLbot',
				uaName: 'IRLbot/3.0 b',
				uaUrl: 'http://irl.cs.tamu.edu/crawler/',
				uaCompany: 'Texas A&M University',
				uaCompanyUrl: 'http://www.tamu.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IRLbot'
			}
		},
		'1225': {
			userAgent: 'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)',
			metadata: {
				uaFamily: 'DuckDuckBot',
				uaName: 'DuckDuckBot/1.0',
				uaUrl: 'http://duckduckgo.com/duckduckbot.html',
				uaCompany: 'Duck Duck Go, Inc.',
				uaCompanyUrl: 'http://duckduckgo.com/blog/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DuckDuckBot'
			}
		},
		'1238': {
			userAgent: 'CCBot/1.0 (+http://www.commoncrawl.org/bot.html)',
			metadata: {
				uaFamily: 'CCBot',
				uaName: 'CCBot/1.0',
				uaUrl: 'http://commoncrawl.org/research/',
				uaCompany: 'CommonCrawl Foundation',
				uaCompanyUrl: 'http://www.commoncrawl.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CCBot'
			}
		},
		'1247': {
			userAgent: 'MnoGoSearch/3.3.6',
			metadata: {
				uaFamily: 'MnoGoSearch',
				uaName: 'MnoGoSearch/3.3.6',
				uaUrl: 'http://www.mnogosearch.org/products.html',
				uaCompany: 'Lavtech.Com',
				uaCompanyUrl: 'http://www.lavtech.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MnoGoSearch'
			}
		},
		'1270': {
			userAgent: 'Mozilla/5.0 (compatible; Charlotte/1.1; http://www.searchme.com/support/)',
			metadata: {
				uaFamily: 'Charlotte',
				uaName: 'Charlotte/1.1',
				uaUrl: 'http://www.searchme.com/support/)',
				uaCompany: 'Searchme, Inc.',
				uaCompanyUrl: 'http://www.searchme.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Charlotte'
			}
		},
		'1273': {
			userAgent: 'Acoon-Robot 4.0.0RC2 (http://www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'Acoon-Robot 4.0.0RC2',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'1282': {
			userAgent: 'Acoon-Robot 4.0.1 (http://www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'Acoon-Robot 4.0.1',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'1283': {
			userAgent: 'MLBot (www.metadatalabs.com/mlbot)',
			metadata: {
				uaFamily: 'MLBot',
				uaName: 'MLBot b',
				uaUrl: 'http://www.metadatalabs.com/mlbot/',
				uaCompany: 'metadata labs',
				uaCompanyUrl: 'http://www.metadatalabs.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MLBot'
			}
		},
		'1287': {
			userAgent: 'Acoon-Robot 4.0.2 (http://www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'Acoon-Robot 4.0.2',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'1293': {
			userAgent: 'Touche (+http://www.touche.com.ve)',
			metadata: {
				uaFamily: 'Touche',
				uaName: 'Touche',
				uaUrl: 'http://www.touche.com.ve/Acerca.jsp',
				uaCompany: 'Touch\xe9',
				uaCompanyUrl: 'http://www.touche.com.ve/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Touche'
			}
		},
		'1297': {
			userAgent: 'Acoon-Robot 4.0.2.17 (http://www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'Acoon-Robot 4.0.2.17',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'1323': {
			userAgent: 'Mozilla/5.0 (compatible; egothor/12.0rc-2; +http://ego.ms.mff.cuni.cz/)',
			metadata: {
				uaFamily: 'egothor',
				uaName: 'egothor/12.0rc-2',
				uaUrl: 'http://ego.ms.mff.cuni.cz/',
				uaCompany: 'Katedra softwarov\xe9ho in\u017een\xfdrstv\xed Univerzity Karlovi',
				uaCompanyUrl: 'http://kocour.ms.mff.cuni.cz/cs/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=egothor'
			}
		},
		'1458': {
			userAgent: 'Yandex/1.01.001 (compatible; Win16; P)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'Yandex/1.01.001',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'1459': {
			userAgent: 'Mozilla/5.0 (compatible; DotBot/1.1; http://www.dotnetdotcom.org/, crawler@dotnetdotcom.org)',
			metadata: {
				uaFamily: 'DotBot',
				uaName: 'DotBot/1.1',
				uaUrl: 'http://www.dotnetdotcom.org/',
				uaCompany: 'dotnetdotcom.org',
				uaCompanyUrl: 'http://www.dotnetdotcom.org/#cont',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DotBot'
			}
		},
		'1461': {
			userAgent: 'ia_archiver (+http://www.alexa.com/site/help/webmasters; crawler@alexa.com)',
			metadata: {
				uaFamily: 'ia_archiver',
				uaName: 'ia_archiver alexa',
				uaUrl: 'http://www.alexa.com/site/help/webmasters',
				uaCompany: 'Alexa Internet, Inc.',
				uaCompanyUrl: 'http://www.alexa.com/',
				uaIcon: 'bot_ia_archiver.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ia_archiver'
			}
		},
		'1462': {
			userAgent: 'Mozilla/5.0 (Twiceler-0.9 http://www.cuil.com/twiceler/robot.html)',
			metadata: {
				uaFamily: 'Twiceler',
				uaName: 'Twiceler-0.9',
				uaUrl: 'http://www.cuil.com/twiceler/robot.html',
				uaCompany: 'Cuil, Inc. ',
				uaCompanyUrl: 'http://www.cuil.com/',
				uaIcon: 'bot_Twiceler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Twiceler'
			}
		},
		'1463': {
			userAgent: 'Mozilla/5.0 (compatible; Seznam screenshot-generator 2.0; +http://fulltext.sblog.cz/screenshot/)',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'Seznam screenshot-generator 2.0',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'1464': {
			userAgent: 'SeznamBot/2.0 (+http://fulltext.sblog.cz/robot/)',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/2.0',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'1466': {
			userAgent: 'Mozilla/5.0 (compatible; MSIE or Firefox mutant; not on Windows server; +http://ws.daum.net/aboutWebSearch.html) Daumoa/2.0',
			metadata: {
				uaFamily: 'Daumoa',
				uaName: 'Daumoa/2.0 b',
				uaUrl: 'http://tab.search.daum.net/aboutWebSearch_en.html',
				uaCompany: 'Daum Communications Corp.',
				uaCompanyUrl: 'http://info.daum.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Daumoa'
			}
		},
		'1468': {
			userAgent: 'msnbot-media/1.1 (+http://search.msn.com/msnbot.htm)',
			metadata: {
				uaFamily: 'MSNBot',
				uaName: 'msnbot-media/1.1',
				uaUrl: 'http://search.msn.com/msnbot.htm',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSNBot'
			}
		},
		'1469': {
			userAgent: 'OOZBOT/0.20 ( -- ; http://www.setooz.com/oozbot.html ; agentname at setooz dot_com )',
			metadata: {
				uaFamily: 'Setoozbot',
				uaName: 'OOZBOT/0.20',
				uaUrl: 'http://www.setooz.com/oozbot.html',
				uaCompany: 'SETU Software Systems (P) Ltd.',
				uaCompanyUrl: 'http://www.setusoftware.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Setoozbot'
			}
		},
		'1470': {
			userAgent: 'Sogou develop spider/4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)',
			metadata: {
				uaFamily: 'sogou spider',
				uaName: 'Sogou develop spider/4.0',
				uaUrl: 'http://www.sogou.com/docs/help/webmasters.htm#07',
				uaCompany: 'SOGOU.COM',
				uaCompanyUrl: 'http://www.sogou.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sogou spider'
			}
		},
		'1471': {
			userAgent: 'Sogou web spider/4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)',
			metadata: {
				uaFamily: 'sogou spider',
				uaName: 'Sogou web spider/4.0',
				uaUrl: 'http://www.sogou.com/docs/help/webmasters.htm#07',
				uaCompany: 'SOGOU.COM',
				uaCompanyUrl: 'http://www.sogou.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sogou spider'
			}
		},
		'1472': {
			userAgent: 'SpokeSpider/1.0 (http://support.spoke.com/webspider/) Mozilla/5.0 (not really)',
			metadata: {
				uaFamily: 'SpokeSpider',
				uaName: 'SpokeSpider/1.0',
				uaUrl: 'http://support.spoke.com/webspider/',
				uaCompany: 'Spoke Software ',
				uaCompanyUrl: 'http://www.spoke.com/company/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SpokeSpider'
			}
		},
		'1474': {
			userAgent: 'Baiduspider+(+http://www.baidu.jp/spider/)',
			metadata: {
				uaFamily: 'Baiduspider',
				uaName: 'Baiduspider japan',
				uaUrl: 'http://www.baidu.com/search/spider.htm',
				uaCompany: 'Baidu',
				uaCompanyUrl: 'http://www.baidu.com/',
				uaIcon: 'bot_baiduspider.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Baiduspider'
			}
		},
		'1475': {
			userAgent: 'linkdexbot/Nutch-1.0-dev (http://www.linkdex.com/; crawl at linkdex dot com)',
			metadata: {
				uaFamily: 'linkdexbot',
				uaName: 'linkdexbot',
				uaUrl: 'http://www.linkdex.com/about/bots/',
				uaCompany: 'Linkdex Limited.',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=linkdexbot'
			}
		},
		'1476': {
			userAgent: 'Yeti/1.0 (NHN Corp.; http://help.naver.com/robots/)',
			metadata: {
				uaFamily: 'NaverBot',
				uaName: 'Yeti/1.0',
				uaUrl: 'http://help.naver.com/robots/',
				uaCompany: 'NHN Corporation',
				uaCompanyUrl: 'http://www.nhncorp.com/',
				uaIcon: 'bot_NaverBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NaverBot'
			}
		},
		'1478': {
			userAgent: 'mozilla/5.0 (compatible; webmastercoffee/0.7; +http://webmastercoffee.com/about)',
			metadata: {
				uaFamily: 'webmastercoffee',
				uaName: 'webmastercoffee/0.7',
				uaUrl: 'http://webmastercoffee.com/about',
				uaCompany: 'Martin Schwartz',
				uaCompanyUrl: 'http://webmastercoffee.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=webmastercoffee'
			}
		},
		'1479': {
			userAgent: 'boitho.com-dc/0.82 ( http://www.boitho.com/dcbot.html )',
			metadata: {
				uaFamily: 'boitho.com-dc',
				uaName: 'boitho.com-dc/0.82',
				uaUrl: 'http://www.boitho.com/dcbot.html',
				uaCompany: 'Boitho',
				uaCompanyUrl: 'http://www.boitho.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=boitho.com-dc'
			}
		},
		'1480': {
			userAgent: 'Busiversebot/v1.0 (http://www.busiverse.com/bot.php)',
			metadata: {
				uaFamily: 'Sirketce/Busiverse',
				uaName: 'Busiversebot/v1.0',
				uaUrl: 'http://www.busiverse.com/bot.php',
				uaCompany: 'BerilTech',
				uaCompanyUrl: 'http://www.sirketce.com.tr/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Sirketce/Busiverse'
			}
		},
		'1481': {
			userAgent: 'CatchBot/1.0; +http://www.catchbot.com',
			metadata: {
				uaFamily: 'CatchBot',
				uaName: 'CatchBot/1.0',
				uaUrl: 'http://www.catchbot.com/',
				uaCompany: 'Reed Business Information Pty Limited',
				uaCompanyUrl: 'http://www.reedbusiness.com/',
				uaIcon: 'bot_CatchBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CatchBot'
			}
		},
		'1482': {
			userAgent: 'CazoodleBot/0.0.2 (http://www.cazoodle.com/contact.php; cbot@cazoodle.com)',
			metadata: {
				uaFamily: 'CazoodleBot',
				uaName: 'CazoodleBot/0.0.2',
				uaUrl: 'http://www.cazoodle.com/cazoodlebot.php',
				uaCompany: 'Cazoodle Inc.',
				uaCompanyUrl: 'http://www.cazoodle.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CazoodleBot'
			}
		},
		'1484': {
			userAgent: 'kalooga/KaloogaBot (Kalooga; http://www.kalooga.com/info.html?page=crawler; crawler@kalooga.com)',
			metadata: {
				uaFamily: 'Kalooga',
				uaName: 'Kalooga',
				uaUrl: 'http://www.kalooga.com/info.html?page=crawler',
				uaCompany: 'Kalooga',
				uaCompanyUrl: 'http://www.kalooga.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Kalooga'
			}
		},
		'1490': {
			userAgent: '192.comAgent',
			metadata: {
				uaFamily: '192.comAgent',
				uaName: '192.comAgent',
				uaUrl: 'http://www.192.com/help/tools-guides/webcrawler/',
				uaCompany: 'i-CD Publishing (UK) Limited',
				uaCompanyUrl: 'http://www.icdpublishing.co.uk/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=192.comAgent'
			}
		},
		'1494': {
			userAgent: 'Mozilla/4.0 (compatible; NaverBot/1.0; http://help.naver.com/customer_webtxt_02.jsp)',
			metadata: {
				uaFamily: 'NaverBot',
				uaName: 'NaverBot/1.0',
				uaUrl: 'http://help.naver.com/robots/',
				uaCompany: 'NHN Corporation',
				uaCompanyUrl: 'http://www.nhncorp.com/',
				uaIcon: 'bot_NaverBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NaverBot'
			}
		},
		'1495': {
			userAgent: 'copyright sheriff (+http://www.copyrightsheriff.com/)',
			metadata: {
				uaFamily: 'copyright sheriff',
				uaName: 'copyright sheriff',
				uaUrl: '',
				uaCompany: 'CopyrightSheriff .Com',
				uaCompanyUrl: 'http://www.copyrightsheriff.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=copyright sheriff'
			}
		},
		'1496': {
			userAgent: 'Mozilla/5.0 (compatible; OsO; http://oso.octopodus.com/abot.html)',
			metadata: {
				uaFamily: 'OsObot',
				uaName: 'OsObot',
				uaUrl: 'http://oso.octopodus.com/abot.html',
				uaCompany: 'Denis Chatelain',
				uaCompanyUrl: 'http://buildingasearchengine.blogspot.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OsObot'
			}
		},
		'1497': {
			userAgent: 'msnbot/2.0b (+http://search.msn.com/msnbot.htm)',
			metadata: {
				uaFamily: 'MSNBot',
				uaName: 'MSNBot/2.0b',
				uaUrl: 'http://search.msn.com/msnbot.htm',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSNBot'
			}
		},
		'1500': {
			userAgent: 'Eurobot/1.1 (http://eurobot.ayell.eu)',
			metadata: {
				uaFamily: 'Eurobot',
				uaName: 'Eurobot/1.1',
				uaUrl: 'http://eurobot.ayell.de/',
				uaCompany: 'Ayell Euronet',
				uaCompanyUrl: 'http://www.ayell.eu/',
				uaIcon: 'bot_eurobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Eurobot'
			}
		},
		'1501': {
			userAgent: 'Mozilla/5.0 (compatible; woriobot +http://worio.com)',
			metadata: {
				uaFamily: 'woriobot',
				uaName: 'woriobot',
				uaUrl: '',
				uaCompany: 'Zite',
				uaCompanyUrl: 'http://zite.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=woriobot'
			}
		},
		'1502': {
			userAgent: 'Mail.Ru/1.0',
			metadata: {
				uaFamily: 'Mail.Ru bot',
				uaName: 'Mail.Ru/1.0',
				uaUrl: 'http://go.mail.ru/help/robots',
				uaCompany: 'Mail.Ru Group',
				uaCompanyUrl: 'http://corp.mail.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Mail.Ru bot'
			}
		},
		'1504': {
			userAgent: 'LinguaBot/v0.001-dev (MultiLinual Sarch Engine v0.001; LinguaSeek; admin at linguaseek dot com)',
			metadata: {
				uaFamily: 'LinguaBot',
				uaName: 'LinguaBot/v0.001-dev',
				uaUrl: '',
				uaCompany: 'linguaseek.com ',
				uaCompanyUrl: 'http://linguaseek.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LinguaBot'
			}
		},
		'1505': {
			userAgent: 'urlfan-bot/1.0; +http://www.urlfan.com/site/bot/350.html',
			metadata: {
				uaFamily: 'urlfan-bot',
				uaName: 'urlfan-bot/1.0',
				uaUrl: 'http://www.urlfan.com/site/bot/350.html',
				uaCompany: '://URLFAN',
				uaCompanyUrl: 'http://www.urlfan.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=urlfan-bot'
			}
		},
		'1507': {
			userAgent: 'Mozilla/5.0 (compatible; YoudaoBot/1.0; http://www.youdao.com/help/webmaster/spider/; )',
			metadata: {
				uaFamily: 'YoudaoBot',
				uaName: 'YoudaoBot/1.0',
				uaUrl: 'http://www.youdao.com/help/webmaster/spider/',
				uaCompany: 'youdao.com',
				uaCompanyUrl: 'http://www.youdao.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YoudaoBot'
			}
		},
		'1509': {
			userAgent: 'YowedoBot/Yowedo 1.0 (Search Engine crawler for yowedo.com; http://yowedo.com/en/partners.html; crawler@yowedo.com)',
			metadata: {
				uaFamily: 'YowedoBot',
				uaName: 'YowedoBot/1.0',
				uaUrl: 'http://yowedo.com/en/partners.html',
				uaCompany: 'yowedo.com',
				uaCompanyUrl: 'http://yowedo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YowedoBot'
			}
		},
		'1512': {
			userAgent: 'Yanga WorldSearch Bot v1.1/beta (http://www.yanga.co.uk/)',
			metadata: {
				uaFamily: 'Yanga',
				uaName: 'Yanga v1.1/beta',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Gigabase Ltd.',
				uaCompanyUrl: 'http://www.gigabase.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yanga'
			}
		},
		'1516': {
			userAgent: 'Mozilla/5.0 (compatible; Butterfly/1.0; +http://labs.topsy.com/butterfly.html) Gecko/2009032608 Firefox/3.0.8',
			metadata: {
				uaFamily: 'Butterfly',
				uaName: 'Butterfly/1.0',
				uaUrl: 'http://labs.topsy.com/butterfly.html',
				uaCompany: 'Topsy Labs',
				uaCompanyUrl: 'http://labs.topsy.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Butterfly'
			}
		},
		'1517': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.2.4; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.2.4',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'1519': {
			userAgent: 'holmes/3.12.4 (http://morfeo.centrum.cz/bot)',
			metadata: {
				uaFamily: 'Holmes',
				uaName: 'holmes/3.12.4 - morfeo',
				uaUrl: 'http://www.ucw.cz/holmes/',
				uaCompany: 'Martin Mare\u0161 and Robert \u0160palek',
				uaCompanyUrl: 'http://www.ucw.cz/holmes/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Holmes'
			}
		},
		'1522': {
			userAgent: 'OOZBOT/0.20 ( Setooz v\xfdrazn\xfd ako say-th-uuz, znamen\xe1 mosty.  ; http://www.setooz.com/oozbot.html ; agentname at setooz dot_com )',
			metadata: {
				uaFamily: 'Setoozbot',
				uaName: 'OOZBOT/0.20 b',
				uaUrl: 'http://www.setooz.com/oozbot.html',
				uaCompany: 'SETU Software Systems (P) Ltd.',
				uaCompanyUrl: 'http://www.setusoftware.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Setoozbot'
			}
		},
		'1523': {
			userAgent: 'facebookexternalhit/1.0 (+http://www.facebook.com/externalhit_uatext.php)',
			metadata: {
				uaFamily: 'FacebookExternalHit',
				uaName: 'FacebookExternalHit/1.0',
				uaUrl: 'http://www.facebook.com/externalhit_uatext.php',
				uaCompany: 'Facebook',
				uaCompanyUrl: 'http://www.facebook.com/',
				uaIcon: 'bot_facebook.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FacebookExternalHit'
			}
		},
		'1524': {
			userAgent: 'kalooga/KaloogaBot (Kalooga; http://www.kalooga.com/info.html?page=crawler)',
			metadata: {
				uaFamily: 'Kalooga',
				uaName: 'Kalooga',
				uaUrl: 'http://www.kalooga.com/info.html?page=crawler',
				uaCompany: 'Kalooga',
				uaCompanyUrl: 'http://www.kalooga.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Kalooga'
			}
		},
		'1530': {
			userAgent: 'Mozilla/5.0 (compatible; DBLBot/1.0; +http://www.dontbuylists.com/)',
			metadata: {
				uaFamily: 'DBLBot',
				uaName: 'DBLBot/1.0',
				uaUrl: 'http://www.dontbuylists.com/faq.htm',
				uaCompany: 'Dontbuylists.com',
				uaCompanyUrl: 'http://www.dontbuylists.com/team.htm',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DBLBot'
			}
		},
		'1533': {
			userAgent: 'Mozilla/5.0 (compatible; Mp3Bot/0.4; +http://mp3realm.org/mp3bot/)',
			metadata: {
				uaFamily: 'Mp3Bot',
				uaName: 'Mp3Bot/0.4',
				uaUrl: 'http://mp3realm.org/mp3bot/',
				uaCompany: 'Mp3Realm.Org',
				uaCompanyUrl: 'http://mp3realm.org/',
				uaIcon: 'bot_Mp3Bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Mp3Bot'
			}
		},
		'1536': {
			userAgent: 'http://www.uni-koblenz.de/~flocke/robot-info.txt',
			metadata: {
				uaFamily: 'Flocke bot',
				uaName: 'Flocke bot',
				uaUrl: 'http://www.uni-koblenz.de/~flocke/robot-info.txt',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Flocke bot'
			}
		},
		'1540': {
			userAgent: 'JadynAve - http://www.jadynave.com/robot',
			metadata: {
				uaFamily: 'JadynAve',
				uaName: 'JadynAve',
				uaUrl: '',
				uaCompany: 'Yesup Ecommerce Solutions Inc',
				uaCompanyUrl: 'http://www.yesup.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=JadynAve'
			}
		},
		'1542': {
			userAgent: 'KeywenBot/4.1  http://www.keywen.com/Encyclopedia/Links',
			metadata: {
				uaFamily: 'KeywenBot',
				uaName: 'KeywenBot/4.1',
				uaUrl: 'http://www.keywen.com/Encyclopedia/Links/',
				uaCompany: 'Michael Charnine',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=KeywenBot'
			}
		},
		'1546': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/1.12.1 +http://www.webarchiv.cz)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/1.12.1',
				uaUrl: 'http://crawler.archive.org/',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'1548': {
			userAgent: 'Y!J-BRI/0.0.1 crawler ( http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html )',
			metadata: {
				uaFamily: 'Yahoo! JAPAN',
				uaName: 'Y!J-BRI/0.0.1',
				uaUrl: 'http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html',
				uaCompany: 'Yahoo! Inc',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot_yahoo!slurp.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo! JAPAN'
			}
		},
		'1550': {
			userAgent: 'Mozilla/5.0 (compatible; akula/12.0rc-2; +http://k311.fd.cvut.cz/)',
			metadata: {
				uaFamily: 'akula',
				uaName: 'akula/12.0rc-2',
				uaUrl: 'http://k311.fd.cvut.cz/',
				uaCompany: '\u010cVUT Fakulta dopravn\xed',
				uaCompanyUrl: 'http://www.fd.cvut.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=akula'
			}
		},
		'1555': {
			userAgent: 'Mozilla/5.0 (compatible; akula/k311; +http://k311.fd.cvut.cz/)',
			metadata: {
				uaFamily: 'akula',
				uaName: 'akula/k311',
				uaUrl: 'http://k311.fd.cvut.cz/',
				uaCompany: '\u010cVUT Fakulta dopravn\xed',
				uaCompanyUrl: 'http://www.fd.cvut.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=akula'
			}
		},
		'1558': {
			userAgent: 'Y!J-BSC/1.0 (http://help.yahoo.co.jp/help/jp/blog-search/)',
			metadata: {
				uaFamily: 'Yahoo! JAPAN',
				uaName: 'Y!J-BSC/1.0',
				uaUrl: 'http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html',
				uaCompany: 'Yahoo! Inc',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot_yahoo!slurp.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo! JAPAN'
			}
		},
		'1562': {
			userAgent: 'Shelob (shelob@gmx.net)',
			metadata: {
				uaFamily: 'Shelob',
				uaName: 'Shelob',
				uaUrl: 'http://mattwork.potsdam.edu/projects/wiki/index.php/Shelob',
				uaCompany: 'M@',
				uaCompanyUrl: 'http://mattwork.potsdam.edu/projects/wiki/index.php/Category:Me',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Shelob'
			}
		},
		'1563': {
			userAgent: 'DoCoMo/2.0 N902iS(c100;TB;W24H12)(compatible; moba-crawler; http://crawler.dena.jp/)',
			metadata: {
				uaFamily: 'moba-crawler',
				uaName: 'moba-crawler',
				uaUrl: 'http://crawler.dena.jp/',
				uaCompany: 'DeNA Co.,Ltd.',
				uaCompanyUrl: 'http://dena.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=moba-crawler'
			}
		},
		'1564': {
			userAgent: 'Mozilla/5.0 (compatible; Yahoo! Slurp/3.0; http://help.yahoo.com/help/us/ysearch/slurp)',
			metadata: {
				uaFamily: 'Yahoo!',
				uaName: 'Yahoo! Slurp/3.0',
				uaUrl: 'http://help.yahoo.com/help/us/ysearch/slurp',
				uaCompany: 'Yahoo! Inc.',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot_yahoo!slurp.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo!'
			}
		},
		'1565': {
			userAgent: 'Mozilla/5.0 (compatible; ScoutJet; +http://www.scoutjet.com/)',
			metadata: {
				uaFamily: 'ScoutJet',
				uaName: 'ScoutJet old',
				uaUrl: 'http://www.scoutjet.com/',
				uaCompany: 'blekko, inc.',
				uaCompanyUrl: 'http://blekko.com/',
				uaIcon: 'bot_ScoutJet.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ScoutJet'
			}
		},
		'1567': {
			userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; fr; rv:1.8.1) VoilaBot BETA 1.2 (support.voilabot@orange-ftgroup.com)',
			metadata: {
				uaFamily: 'VoilaBot',
				uaName: 'VoilaBot BETA 1.2',
				uaUrl: '',
				uaCompany: 'France Telecom',
				uaCompanyUrl: 'http://www.francetelecom.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=VoilaBot'
			}
		},
		'1568': {
			userAgent: 'DealGates Bot/1.1 by Luc Michalski (http://spider.dealgates.com/bot.html)',
			metadata: {
				uaFamily: 'DealGates Bot',
				uaName: 'DealGates Bot/1.1',
				uaUrl: 'http://www.dealgates.net/bot.html',
				uaCompany: 'Luc Michalski',
				uaCompanyUrl: 'http://www.dealgates.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DealGates Bot'
			}
		},
		'1573': {
			userAgent: 'GingerCrawler/1.0 (Language Assistant for Dyslexics; www.gingersoftware.com/crawler_agent.htm; support at ginger software dot com)',
			metadata: {
				uaFamily: 'GingerCrawler',
				uaName: 'GingerCrawler/1.0',
				uaUrl: 'http://www.gingersoftware.com/crawler_agent.htm',
				uaCompany: 'Ginger Software',
				uaCompanyUrl: 'http://www.gingersoftware.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=GingerCrawler'
			}
		},
		'1582': {
			userAgent: 'flatlandbot/baypup (Flatland Industries Web Spider; http://www.flatlandindustries.com/flatlandbot; jason@flatlandindustries.com)',
			metadata: {
				uaFamily: 'Flatland Industries Web Spider',
				uaName: 'flatlandbot/baypup',
				uaUrl: 'http://www.flatlandindustries.com/flatlandbot',
				uaCompany: 'Flatland Industries, Inc.',
				uaCompanyUrl: 'http://www.flatlandindustries.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Flatland Industries Web Spider'
			}
		},
		'1583': {
			userAgent: 'holmes/3.11 (http://morfeo.centrum.cz/bot)',
			metadata: {
				uaFamily: 'Holmes',
				uaName: 'holmes/3.11',
				uaUrl: 'http://www.ucw.cz/holmes/',
				uaCompany: 'Martin Mare\u0161 and Robert \u0160palek',
				uaCompanyUrl: 'http://www.ucw.cz/holmes/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Holmes'
			}
		},
		'1586': {
			userAgent: 'voyager/2.0 (http://www.kosmix.com/crawler.html)',
			metadata: {
				uaFamily: 'voyager',
				uaName: 'voyager/2.0',
				uaUrl: 'http://www.kosmix.com/corp/crawler.html',
				uaCompany: 'Kosmix Corporation',
				uaCompanyUrl: 'http://www.kosmix.com/html/about.html',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=voyager'
			}
		},
		'1595': {
			userAgent: 'FeedCatBot/3.0 (+http://www.feedcat.net/)',
			metadata: {
				uaFamily: 'FeedCatBot',
				uaName: 'FeedCatBot/3.0',
				uaUrl: 'http://www.feedcat.net/',
				uaCompany: 'FEEDCAT.NET',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FeedCatBot'
			}
		},
		'1599': {
			userAgent: 'JyxobotRSS/0.06',
			metadata: {
				uaFamily: 'Jyxobot',
				uaName: 'JyxobotRSS/0.06',
				uaUrl: '',
				uaCompany: 'Jyxo s.r.o.',
				uaCompanyUrl: 'http://jyxo.cz/',
				uaIcon: 'bot_Jyxobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Jyxobot'
			}
		},
		'1600': {
			userAgent: 'SniffRSS/0.5beta (+http://www.blogator.com/)',
			metadata: {
				uaFamily: 'SniffRSS',
				uaName: 'SniffRSS/0.5beta',
				uaUrl: '',
				uaCompany: 'blogator.com',
				uaCompanyUrl: 'http://www.blogator.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SniffRSS'
			}
		},
		'1601': {
			userAgent: 'RSSMicro.com RSS/Atom Feed Robot',
			metadata: {
				uaFamily: 'RSSMicro.com RSS/Atom Feed Robot',
				uaName: 'RSSMicro.com RSS/Atom Feed Robot',
				uaUrl: '',
				uaCompany: 'RSSMicro.com',
				uaCompanyUrl: 'http://rssmicro.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=RSSMicro.com RSS/Atom Feed Robot'
			}
		},
		'1602': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.2.1; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.2.1',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'1604': {
			userAgent: 'yacybot (i386 Linux 2.6.28-11-generic; java 1.6.0_13; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'1619': {
			userAgent: 'voyager/1.0 (+http://www.kosmix.com/html/crawler.html)',
			metadata: {
				uaFamily: 'voyager',
				uaName: 'voyager/1.0',
				uaUrl: 'http://www.kosmix.com/corp/crawler.html',
				uaCompany: 'Kosmix Corporation',
				uaCompanyUrl: 'http://www.kosmix.com/html/about.html',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=voyager'
			}
		},
		'1633': {
			userAgent: 'Mozilla/5.0 (compatible; 80bot/0.71; http://www.80legs.com/spider.html;) Gecko/2008032620',
			metadata: {
				uaFamily: '80legs',
				uaName: '80legs/0.71',
				uaUrl: 'http://www.80legs.com/webcrawler.html',
				uaCompany: 'Computational Crawling, LP ',
				uaCompanyUrl: 'http://compucrawl.com/',
				uaIcon: 'bot_80legs.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=80legs'
			}
		},
		'1637': {
			userAgent: 'BlogPulseLive (support@blogpulse.com)',
			metadata: {
				uaFamily: 'BlogPulse',
				uaName: 'BlogPulseLive',
				uaUrl: 'http://www.blogpulse.com/',
				uaCompany: 'Nielsen Company',
				uaCompanyUrl: 'http://www.nielsen-online.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BlogPulse'
			}
		},
		'1645': {
			userAgent: 'yacybot (amd64 Linux 2.6.24-23-generic; java 1.6.0_07; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'1650': {
			userAgent: 'Mozilla/5.0 (compatible; DKIMRepBot/1.0; +http://www.dkim-reputation.org)',
			metadata: {
				uaFamily: 'DKIMRepBot',
				uaName: 'DKIMRepBot/1.0',
				uaUrl: 'http://www.dkim-reputation.org/',
				uaCompany: 'DKIM',
				uaCompanyUrl: 'http://www.dkim.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DKIMRepBot'
			}
		},
		'1653': {
			userAgent: 'yacybot (i386 Linux 2.6.28-gentoo-r5; java 1.5.0_18; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'1658': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/1.14.3 +http://archive.org)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/1.14.3',
				uaUrl: 'http://crawler.archive.org/',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'1662': {
			userAgent: 'UptimeDog Robot (www.uptimedog.com)',
			metadata: {
				uaFamily: 'UptimeDog',
				uaName: 'UptimeDog',
				uaUrl: 'http://www.uptimedog.com/',
				uaCompany: 'San Pedro Software Inc.',
				uaCompanyUrl: 'http://mosw.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=UptimeDog'
			}
		},
		'1663': {
			userAgent: 'Mozilla/4.0 (compatible; Fooooo_Web_Video_Crawl http://fooooo.com/bot.html)',
			metadata: {
				uaFamily: 'Fooooo_Web_Video_Crawl',
				uaName: 'Fooooo_Web_Video_Crawl',
				uaUrl: 'http://fooooo.com/bot.html',
				uaCompany: 'Bank of innvation Inc.',
				uaCompanyUrl: 'http://en.boi.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Fooooo_Web_Video_Crawl'
			}
		},
		'1676': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.2.5; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.2.5',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'1681': {
			userAgent: 'Orgbybot/OrgbyBot v1.2 (Spidering the net for Orgby; http://www.orgby.com/  ; Orgby.com Search Engine)',
			metadata: {
				uaFamily: 'OrgbyBot',
				uaName: 'OrgbyBot/1.2',
				uaUrl: 'http://orgby.com/bot/',
				uaCompany: 'Orgby.com',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OrgbyBot'
			}
		},
		'1685': {
			userAgent: 'OpenAcoon v4.1.0 (www.openacoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'OpenAcoon v4.1.0',
				uaUrl: 'http://www.openacoon.de/',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'1690': {
			userAgent: 'YandexSomething/1.0',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexSomething/1.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'1703': {
			userAgent: 'OOZBOT/0.20 ( http://www.setooz.com/oozbot.html ; agentname at setooz dot_com )',
			metadata: {
				uaFamily: 'Setoozbot ',
				uaName: 'OOZBOT/0.20 c',
				uaUrl: 'http://www.setooz.com/oozbot.html',
				uaCompany: 'SETU Software Systems (P) Ltd.',
				uaCompanyUrl: 'http://www.setusoftware.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Setoozbot '
			}
		},
		'1704': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/2.0.2 +http://seekda.com)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/2.0.2',
				uaUrl: 'http://crawler.archive.org/',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'1705': {
			userAgent: 'adidxbot/1.1 (+http://search.msn.com/msnbot.htm)',
			metadata: {
				uaFamily: 'adidxbot',
				uaName: 'adidxbot/1.1',
				uaUrl: 'http://search.msn.com/msnbot.htm',
				uaCompany: '\tMicrosoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=adidxbot'
			}
		},
		'1711': {
			userAgent: 'Robozilla/1.0',
			metadata: {
				uaFamily: 'Robozilla',
				uaName: 'Robozilla/1.0',
				uaUrl: 'http://www.dmoz.org/guidelines/robozilla.html',
				uaCompany: 'DMOZ',
				uaCompanyUrl: 'http://www.dmoz.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Robozilla'
			}
		},
		'1712': {
			userAgent: 'yacybot (x86 Windows Vista 6.1; java 1.6.0_13; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'1717': {
			userAgent: 'Mozilla/5.0 (compatible; Falconsbot; +http://iws.seu.edu.cn/services/falcons/contact_us.jsp)',
			metadata: {
				uaFamily: 'Falconsbot',
				uaName: 'Falconsbot',
				uaUrl: 'http://ws.nju.edu.cn/falcons/contact_us.jsp',
				uaCompany: 'Institute of Web Science',
				uaCompanyUrl: 'http://iws.seu.edu.cn/page/english/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Falconsbot'
			}
		},
		'1726': {
			userAgent: 'Bloggsi/1.0 (http://bloggsi.com/)',
			metadata: {
				uaFamily: 'Bloggsi',
				uaName: 'Bloggsi/1.0',
				uaUrl: 'http://bloggsi.com/',
				uaCompany: 'Stefan Fischerl\xe4nder',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Bloggsi'
			}
		},
		'1727': {
			userAgent: 'Technoratibot/7.0',
			metadata: {
				uaFamily: 'Technoratibot',
				uaName: 'Technoratibot/7.0',
				uaUrl: '',
				uaCompany: 'Technorati Inc.',
				uaCompanyUrl: 'http://www.technorati.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Technoratibot'
			}
		},
		'1728': {
			userAgent: 'Technoratibot/8.0',
			metadata: {
				uaFamily: 'Technoratibot',
				uaName: 'Technoratibot/8.0',
				uaUrl: '',
				uaCompany: 'Technorati Inc.',
				uaCompanyUrl: 'http://www.technorati.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Technoratibot'
			}
		},
		'1731': {
			userAgent: 'Mozilla/5.0 (compatible; DNS-Digger-Explorer/1.0; +http://www.dnsdigger.com)',
			metadata: {
				uaFamily: 'DNS-Digger-Explorer',
				uaName: 'DNS-Digger-Explorer/1.0',
				uaUrl: '',
				uaCompany: 'DNSDigger',
				uaCompanyUrl: 'http://www.dnsdigger.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DNS-Digger-Explorer'
			}
		},
		'1733': {
			userAgent: 'Nokia6680/1.0 (4.04.07) SymbianOS/8.0 Series60/2.6 Profile/MIDP-2.0 Configuration/CLDC-1.1 (botmobi find.mobi/bot.html find@mtld.mobi)',
			metadata: {
				uaFamily: 'botmobi',
				uaName: 'botmobi',
				uaUrl: 'http://find.mobi/bot.html',
				uaCompany: 'mTLD, Ltd.',
				uaCompanyUrl: 'http://mtld.mobi/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=botmobi'
			}
		},
		'1735': {
			userAgent: 'Mozilla/5.0 (compatible; AboutUsBot/0.9; +http://www.aboutus.org/AboutUsBot)',
			metadata: {
				uaFamily: 'AboutUsBot',
				uaName: 'AboutUsBot/0.9',
				uaUrl: 'http://www.aboutus.org/AboutUs:Bot',
				uaCompany: 'AboutUs, Inc.',
				uaCompanyUrl: 'http://www.aboutus.org/AboutUs.org',
				uaIcon: 'bot_AboutUsBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AboutUsBot'
			}
		},
		'1738': {
			userAgent: 'ICC-Crawler(Mozilla-compatible; ; http://kc.nict.go.jp/project1/crawl.html)',
			metadata: {
				uaFamily: 'ICC-Crawler',
				uaName: 'ICC-Crawler',
				uaUrl: 'http://kc.nict.go.jp/project1/crawl.html',
				uaCompany: 'NICT',
				uaCompanyUrl: 'http://nict.go.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ICC-Crawler'
			}
		},
		'1751': {
			userAgent: 'WebImages 0.3 ( http://herbert.groot.jebbink.nl/?app=WebImages )',
			metadata: {
				uaFamily: 'WebImages',
				uaName: 'WebImages 0.3',
				uaUrl: '',
				uaCompany: 'Herbert Groot Jebbink',
				uaCompanyUrl: 'http://herbert.groot.jebbink.nl/ ',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebImages'
			}
		},
		'1752': {
			userAgent: 'Browsershots',
			metadata: {
				uaFamily: 'Browsershots',
				uaName: 'Browsershots',
				uaUrl: 'http://browsershots.org/faq',
				uaCompany: 'Browsershots.org',
				uaCompanyUrl: 'http://browsershots.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Browsershots'
			}
		},
		'1753': {
			userAgent: 'BotOnParade, http://www.bots-on-para.de/bot.html',
			metadata: {
				uaFamily: 'BotOnParade',
				uaName: 'BotOnParade',
				uaUrl: 'http://www.bots-on-para.de/bot.html',
				uaCompany: 'Angus Internetmarketing',
				uaCompanyUrl: 'http://www.angus.co.uk/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BotOnParade'
			}
		},
		'1754': {
			userAgent: 'BlogPulse (ISSpider-3.0)',
			metadata: {
				uaFamily: 'BlogPulse',
				uaName: 'BlogPulse',
				uaUrl: 'http://www.blogpulse.com/',
				uaCompany: 'Nielsen Company',
				uaCompanyUrl: 'http://www.nielsen-online.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BlogPulse'
			}
		},
		'1759': {
			userAgent: 'Twiceler-0.9 http://www.cuill.com/twiceler/robot.html',
			metadata: {
				uaFamily: 'Twiceler',
				uaName: 'Twiceler-0.9 b',
				uaUrl: 'http://www.cuil.com/twiceler/robot.html',
				uaCompany: 'Cuil, Inc.',
				uaCompanyUrl: 'http://www.cuil.com/',
				uaIcon: 'bot_Twiceler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Twiceler'
			}
		},
		'1763': {
			userAgent: 'TwengaBot/1.1 (+http://www.twenga.com/bot.html)',
			metadata: {
				uaFamily: 'TwengaBot',
				uaName: 'TwengaBot/1.1',
				uaUrl: 'http://www.twenga.com/bot.html',
				uaCompany: 'Twenga SA',
				uaCompanyUrl: 'http://www.twenga.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=TwengaBot'
			}
		},
		'1765': {
			userAgent: 'ICC-Crawler/2.0 (Mozilla-compatible; ; http://kc.nict.go.jp/project1/crawl.html)',
			metadata: {
				uaFamily: 'ICC-Crawler',
				uaName: 'ICC-Crawler/2.0',
				uaUrl: 'http://kc.nict.go.jp/project1/crawl.html',
				uaCompany: 'NICT',
				uaCompanyUrl: 'http://nict.go.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ICC-Crawler'
			}
		},
		'1766': {
			userAgent: 'Mozilla/4.0 (compatible;  Vagabondo/4.0Beta; webcrawler at wise-guys dot nl; http://webagent.wise-guys.nl/; http://www.wise-guys.nl/)',
			metadata: {
				uaFamily: 'Vagabondo',
				uaName: 'Vagabondo/4.0Beta',
				uaUrl: 'http://webagent.wise-guys.nl/',
				uaCompany: 'WiseGuys Internet BV',
				uaCompanyUrl: 'http://www.wise-guys.nl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Vagabondo'
			}
		},
		'1770': {
			userAgent: 'baypup/1.1 (Baypup; http://www.baypup.com/; jason@baypup.com)',
			metadata: {
				uaFamily: 'baypup',
				uaName: 'baypup/1.1',
				uaUrl: '',
				uaCompany: 'Flatland Industries, Inc.',
				uaCompanyUrl: 'http://www.flatlandindustries.com/',
				uaIcon: 'bot_Baypup.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=baypup'
			}
		},
		'1771': {
			userAgent: 'mozilla/5.0 (compatible; discobot/1.1; +http://discoveryengine.com/discobot.html)',
			metadata: {
				uaFamily: 'discoverybot',
				uaName: 'discobot/1.1',
				uaUrl: 'http://discoveryengine.com/discoverybot.html',
				uaCompany: 'discoveryengine.com. ',
				uaCompanyUrl: 'http://www.discoveryengine.com/',
				uaIcon: 'bot_discobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=discoverybot'
			}
		},
		'1772': {
			userAgent: 'Mozilla/5.0 (compatible; Tagoobot/3.0; +http://www.tagoo.ru)',
			metadata: {
				uaFamily: 'Tagoobot',
				uaName: 'Tagoobot/3.0',
				uaUrl: '',
				uaCompany: 'Tagoo',
				uaCompanyUrl: 'http://www.tagoo.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Tagoobot'
			}
		},
		'1773': {
			userAgent: '50.nu/0.01 ( +http://50.nu/bot.html )',
			metadata: {
				uaFamily: '50.nu',
				uaName: '50.nu/0.01',
				uaUrl: 'http://50.nu/bot.html',
				uaCompany: 'Innovate it',
				uaCompanyUrl: 'http://innovateit.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=50.nu'
			}
		},
		'1776': {
			userAgent: 'yacybot (i386 Linux 2.6.28-13-generic; java 1.6.0_13; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'1779': {
			userAgent: 'Mozilla/5.0 (compatible; Scarlett/ 1.0; +http://www.ellerdale.com/crawler.html)',
			metadata: {
				uaFamily: 'Scarlett',
				uaName: 'Scarlett/ 1.0',
				uaUrl: 'http://www.ellerdale.com/crawler.html',
				uaCompany: 'Ellerdale Project',
				uaCompanyUrl: 'http://www.ellerdale.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Scarlett'
			}
		},
		'1780': {
			userAgent: 'LexxeBot/1.0 (lexxebot@lexxe.com)',
			metadata: {
				uaFamily: 'LexxeBot',
				uaName: 'LexxeBot/1.0',
				uaUrl: 'http://lexxe.com/about/webmasters.cfm',
				uaCompany: 'Lexxe Pty Ltd',
				uaCompanyUrl: 'http://lexxe.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LexxeBot'
			}
		},
		'1784': {
			userAgent: 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.2.1; aggregator:Spinn3r (Spinn3r 3.1); http://spinn3r.com/robot) Gecko/20021130',
			metadata: {
				uaFamily: 'Spinn3r',
				uaName: 'Spinn3r 3.1',
				uaUrl: 'http://spinn3r.com/robot',
				uaCompany: 'Tailrank Inc',
				uaCompanyUrl: 'http://tailrank.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Spinn3r'
			}
		},
		'1793': {
			userAgent: 'Mozilla/5.0 (Yahoo-MMCrawler/4.0; mailto:vertical-crawl-support@yahoo-inc.com)',
			metadata: {
				uaFamily: 'Yahoo!',
				uaName: 'Yahoo-MMCrawler/4.0',
				uaUrl: 'http://help.yahoo.com/',
				uaCompany: 'Yahoo! Inc',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot_yahoo!slurp.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo!'
			}
		},
		'1798': {
			userAgent: 'LinkAider (http://linkaider.com/crawler/)',
			metadata: {
				uaFamily: 'LinkAider',
				uaName: 'LinkAider',
				uaUrl: 'http://linkaider.com/crawler/',
				uaCompany: 'Ivinco',
				uaCompanyUrl: 'http://linkaider.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LinkAider'
			}
		},
		'1805': {
			userAgent: 'WinWebBot/1.0; (Balaena Ltd, UK); http://www.balaena.com/winwebbot.html; winwebbot@balaena.com;)',
			metadata: {
				uaFamily: 'WinWebBot',
				uaName: 'WinWebBot/1.0',
				uaUrl: 'http://www.balaena.com/winwebbot.html',
				uaCompany: 'Balaena Ltd',
				uaCompanyUrl: 'http://www.balaena.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WinWebBot'
			}
		},
		'1815': {
			userAgent: 'R6_FeedFetcher(www.radian6.com/crawler)',
			metadata: {
				uaFamily: 'R6 bot',
				uaName: 'R6_FeedFetcher',
				uaUrl: 'http://www.radian6.com/crawler/',
				uaCompany: 'Radian6 Technologies Inc',
				uaCompanyUrl: 'http://www.radian6.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=R6 bot'
			}
		},
		'1816': {
			userAgent: 'http://domino.research.ibm.com/comm/research_projects.nsf/pages/sai-crawler.callingcard.html',
			metadata: {
				uaFamily: 'SAI Crawler',
				uaName: 'SAI Crawler',
				uaUrl: 'http://domino.research.ibm.com/comm/research_projects.nsf/pages/sai-crawler.callingcard.html',
				uaCompany: 'IBM',
				uaCompanyUrl: 'http://www.ibm.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SAI Crawler'
			}
		},
		'1818': {
			userAgent: 'Mozilla/5.0 (compatible;YodaoBot-Image/1.0;http://www.youdao.com/help/webmaster/spider/;)',
			metadata: {
				uaFamily: 'YodaoBot',
				uaName: 'YodaoBot-Image/1.0',
				uaUrl: 'http://www.youdao.com/help/webmaster/spider/',
				uaCompany: 'youdao',
				uaCompanyUrl: 'http://www.youdao.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YodaoBot'
			}
		},
		'1838': {
			userAgent: 'Mozilla/5.0 (compatible; Topicbot/12.0rc-2; +http://topicbot.awardspace.us/)',
			metadata: {
				uaFamily: 'Topicbot',
				uaName: 'Topicbot/12.0rc-2',
				uaUrl: 'http://topicbot.awardspace.us/',
				uaCompany: 'Research Group TopicBot',
				uaCompanyUrl: 'http://topicbot.awardspace.us/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Topicbot'
			}
		},
		'1849': {
			userAgent: 'http://www.amagit.com/',
			metadata: {
				uaFamily: 'Amagit.COM',
				uaName: 'Amagit.COM',
				uaUrl: '',
				uaCompany: 'Joshua Schwarz',
				uaCompanyUrl: 'http://contacts.joshuaschwarz.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Amagit.COM'
			}
		},
		'1853': {
			userAgent: 'Sosospider+(+http://help.soso.com/webspider.htm)',
			metadata: {
				uaFamily: 'Sosospider',
				uaName: 'Sosospider',
				uaUrl: 'http://help.soso.com/webspider.htm',
				uaCompany: 'Tencent, Inc.',
				uaCompanyUrl: 'http://www.tencent.com/',
				uaIcon: 'bot_soso.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Sosospider'
			}
		},
		'1856': {
			userAgent: 'findlinks/1.1.5-beta7 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/1.1.4-beta7',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'1859': {
			userAgent: 'Mozilla/5.0 (compatible; JadynAveBot; +http://www.jadynave.com/robot)',
			metadata: {
				uaFamily: 'JadynAveBot',
				uaName: 'JadynAveBot',
				uaUrl: 'http://www.jadynave.com/robot',
				uaCompany: 'Yesup Ecommerce Solutions Inc.',
				uaCompanyUrl: 'http://www.yesup.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=JadynAveBot'
			}
		},
		'1866': {
			userAgent: 'smart.apnoti.com Robot/v1.34 (http://smart.apnoti.com/en/aboutApnotiWebCrawler.html)',
			metadata: {
				uaFamily: 'smart.apnoti.com Robot',
				uaName: 'smart.apnoti.com Robot/v1.34',
				uaUrl: 'http://smart.apnoti.com/en/aboutApnotiWebCrawler.html',
				uaCompany: 'apnoti.com GmbH',
				uaCompanyUrl: 'http://www.apnoti.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=smart.apnoti.com Robot'
			}
		},
		'1867': {
			userAgent: 'MnoGoSearch/3.3.9',
			metadata: {
				uaFamily: 'MnoGoSearch',
				uaName: 'MnoGoSearch/3.3.9',
				uaUrl: 'http://www.mnogosearch.org/products.html',
				uaCompany: 'Lavtech.Com',
				uaCompanyUrl: 'http://www.lavtech.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MnoGoSearch'
			}
		},
		'1869': {
			userAgent: 'Yandex/1.01.001 (compatible; Win16; H)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'Yandex/1.01.001',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'1870': {
			userAgent: 'FollowSite Bot ( http://www.followsite.com/bot.html )',
			metadata: {
				uaFamily: 'FollowSite Bot',
				uaName: 'FollowSite Bot',
				uaUrl: 'http://www.followsite.com/bot.html',
				uaCompany: 'ASX Networks ApS',
				uaCompanyUrl: 'http://asxnetworks.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FollowSite Bot'
			}
		},
		'1871': {
			userAgent: 'Mozilla/5.0 (compatible; 008/0.83; http://www.80legs.com/spider.html;) Gecko/2008032620',
			metadata: {
				uaFamily: '80legs',
				uaName: '80legs/0.83',
				uaUrl: 'http://www.80legs.com/webcrawler.html',
				uaCompany: 'Computational Crawling, LP',
				uaCompanyUrl: 'http://compucrawl.com/',
				uaIcon: 'bot_80legs.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=80legs'
			}
		},
		'1872': {
			userAgent: 'Mozilla/5.0 (X11; U; Linux i686 (x86_64); en-US; rv:1.8.1.20) Gecko/20090429 HeartRails_Capture/0.6 (+http://capture.heartrails.com/) BonEcho/2.0.0.20',
			metadata: {
				uaFamily: 'HeartRails_Capture',
				uaName: 'HeartRails_Capture/0.6',
				uaUrl: 'http://capture.heartrails.com/help/question',
				uaCompany: 'HeartRails Inc.',
				uaCompanyUrl: 'http://www.heartrails.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HeartRails_Capture'
			}
		},
		'1885': {
			userAgent: 'Speedy Spider (Entireweb; Beta/1.2; http://www.entireweb.com/about/search_tech/speedyspider/)',
			metadata: {
				uaFamily: 'Speedy',
				uaName: 'Speedy Spider Beta/1.2',
				uaUrl: '',
				uaCompany: 'Entireweb Sweden AB',
				uaCompanyUrl: 'http://www.entireweb.com/',
				uaIcon: 'bot_Speedy.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Speedy'
			}
		},
		'1887': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/1.14.2 +http://rjpower.org)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/1.14.2',
				uaUrl: 'http://crawler.archive.org/',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'1894': {
			userAgent: 'yacybot (amd64 Windows 7 6.1; java 1.6.0_14; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'1895': {
			userAgent: 'Mozilla/5.0 (compatible; Plukkie/1.1; http://www.botje.com/plukkie.htm)',
			metadata: {
				uaFamily: 'Plukkie',
				uaName: 'Plukkie/1.1',
				uaUrl: 'http://www.botje.com/plukkie.htm',
				uaCompany: 'botje.com',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Plukkie'
			}
		},
		'1906': {
			userAgent: 'SanszBot/1.7(http://www.sansz.org/sanszbot, spider@sansz.org) (spider@sansz.org)',
			metadata: {
				uaFamily: 'SanszBot',
				uaName: 'SanszBot/1.7',
				uaUrl: 'http://www.sansz.org/sanszbot',
				uaCompany: 'Peres Levente (Sansz Foundation)',
				uaCompanyUrl: 'http://www.sansz.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SanszBot'
			}
		},
		'1908': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.2.3; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.2.3',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'1909': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.3.0; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.3.0',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'1932': {
			userAgent: 'Mozilla/5.0 (compatible; GurujiBot/1.0; +http://www.guruji.com/en/WebmasterFAQ.html)',
			metadata: {
				uaFamily: 'GurujiBot',
				uaName: 'GurujiBot/1.0',
				uaUrl: 'http://www.guruji.com/en/WebmasterFAQ.html',
				uaCompany: 'Guruji.com Software Private Limited',
				uaCompanyUrl: 'http://www.guruji.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=GurujiBot'
			}
		},
		'1936': {
			userAgent: 'Sogou-Test-Spider/4.0 (compatible; MSIE 5.5; Windows 98)',
			metadata: {
				uaFamily: 'sogou spider',
				uaName: 'Sogou-Test-Spider/4.0',
				uaUrl: 'http://www.sogou.com/docs/help/webmasters.htm#07',
				uaCompany: 'SOGOU.COM',
				uaCompanyUrl: 'http://www.sogou.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sogou spider'
			}
		},
		'1938': {
			userAgent: 'Mozilla/5.0 (compatible;+ParchBot/1.0;++http://www.parchmenthill.com/search.htm)',
			metadata: {
				uaFamily: 'ParchBot',
				uaName: 'ParchBot/1.0',
				uaUrl: 'http://www.parchmenthill.com/search.htm',
				uaCompany: 'Parchment Hill',
				uaCompanyUrl: 'http://www.parchmenthill.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ParchBot'
			}
		},
		'1941': {
			userAgent: 'AboutUsBot',
			metadata: {
				uaFamily: 'AboutUsBot',
				uaName: 'AboutUsBot',
				uaUrl: 'http://www.aboutus.org/AboutUs:Bot',
				uaCompany: 'AboutUs, Inc. ',
				uaCompanyUrl: 'http://www.aboutus.org/AboutUs.org',
				uaIcon: 'bot_AboutUsBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AboutUsBot'
			}
		},
		'1943': {
			userAgent: 'Yandex/1.01.001 (compatible; Win16; m)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'Yandex/1.01.001',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'1950': {
			userAgent: 'Mozilla/5.0 (compatible; SecretSerachEngineLabs.com-SBSearch/0.9; http://www.secretsearchenginelabs.com/secret-web-crawler.php)',
			metadata: {
				uaFamily: 'SBSearch',
				uaName: 'SBSearch/0.9',
				uaUrl: 'http://www.secretsearchenginelabs.com/secret-web-crawler.php',
				uaCompany: 'SecretSearchEngineLabs.com',
				uaCompanyUrl: 'http://www.secretsearchenginelabs.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SBSearch'
			}
		},
		'1957': {
			userAgent: 'yacybot (i386 Linux 2.6.23; java 1.6.0_06; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'1971': {
			userAgent: 'taptubot *** please read http://www.taptu.com/corp/taptubot ***',
			metadata: {
				uaFamily: 'taptubot',
				uaName: 'taptubot',
				uaUrl: 'http://www.taptu.com/corp/taptubot',
				uaCompany: 'Taptu Limited',
				uaCompanyUrl: 'http://www.taptu.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=taptubot'
			}
		},
		'1982': {
			userAgent: 'Qseero v1.0.0',
			metadata: {
				uaFamily: 'Qseero',
				uaName: 'Qseero 1.0.0',
				uaUrl: '',
				uaCompany: 'Qseero, Inc.',
				uaCompanyUrl: 'http://q0.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Qseero'
			}
		},
		'1992': {
			userAgent: 'SeznamBot/2.0 (+http://fulltext.seznam.cz/)',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/2.0',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'1994': {
			userAgent: 'Mozilla/5.0 (compatible; Exabot/3.0 (BiggerBetter); +http://www.exabot.com/go/robot)',
			metadata: {
				uaFamily: 'Exabot',
				uaName: 'Exabot/3.0/BiggerBetter',
				uaUrl: 'http://www.exabot.com/go/robot',
				uaCompany: 'Exalead S.A.',
				uaCompanyUrl: 'http://www.exalead.com/',
				uaIcon: 'bot_Exabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Exabot'
			}
		},
		'2003': {
			userAgent: 'TinEye/1.0; +http://www.tineye.com/',
			metadata: {
				uaFamily: 'TinEye',
				uaName: 'TinEye/1.0',
				uaUrl: 'http://tineye.com/crawler.html ',
				uaCompany: 'Id\xe9e Inc.',
				uaCompanyUrl: 'http://ideeinc.com/',
				uaIcon: 'bot_TinEye.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=TinEye'
			}
		},
		'2004': {
			userAgent: 'Thumbnail.CZ robot 1.1 (http://thumbnail.cz/why-no-robots-txt.html)',
			metadata: {
				uaFamily: 'Thumbnail.CZ robot',
				uaName: 'Thumbnail.CZ robot 1.1',
				uaUrl: 'http://thumbnail.cz/why-no-robots-txt.html',
				uaCompany: 'Miroslav Such\xfd',
				uaCompanyUrl: 'http://miroslav.suchy.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Thumbnail.CZ robot'
			}
		},
		'2016': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/1.12.1b +http://netarkivet.dk/website/info.html)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/1.12.1b',
				uaUrl: 'http://crawler.archive.org/',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'2017': {
			userAgent: 'yacybot (amd64 Linux 2.6.18-164.el5; java 1.6.0; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'2021': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/1.14.3 +http://www.webarchiv.cz)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/1.14.3',
				uaUrl: 'http://crawler.archive.org/',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'2022': {
			userAgent: 'bitlybot',
			metadata: {
				uaFamily: 'bitlybot',
				uaName: 'bitlybot',
				uaUrl: 'http://code.google.com/p/bitly-bot/',
				uaCompany: 'Rahul Garg',
				uaCompanyUrl: 'http://www.google.com/profiles/mr.rahulgarg',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bitlybot'
			}
		},
		'2024': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.3.1; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.3.1',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'2026': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/2.0.2 +http://aihit.com)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/2.0.2',
				uaUrl: 'http://crawler.archive.org/',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'2028': {
			userAgent: 'Mozilla/5.0 (compatible; Najdi.si/3.1)',
			metadata: {
				uaFamily: 'Najdi.si',
				uaName: 'Najdi.si/3.1',
				uaUrl: 'http://www.najdi.si/help/aboutsearch.html#q5',
				uaCompany: 'Najdi.si d.o.o.',
				uaCompanyUrl: 'http://www.najdi.si/',
				uaIcon: 'bot_najdi.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Najdi.si'
			}
		},
		'2050': {
			userAgent: 'BabalooSpider/1.3 (BabalooSpider; http://www.babaloo.si; spider@babaloo.si)',
			metadata: {
				uaFamily: 'BabalooSpider',
				uaName: 'BabalooSpider/1.3',
				uaUrl: '',
				uaCompany: 'Babaloo d.o.o.',
				uaCompanyUrl: 'http://www.babaloo.si/',
				uaIcon: 'bot_BabalooSpider.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BabalooSpider'
			}
		},
		'2057': {
			userAgent: 'http://arachnode.net 1.2',
			metadata: {
				uaFamily: 'arachnode.net',
				uaName: 'arachnode.net/1.2',
				uaUrl: 'http://arachnode.codeplex.com/',
				uaCompany: 'arachnode.net, llc',
				uaCompanyUrl: 'http://arachnode.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=arachnode.net'
			}
		},
		'2063': {
			userAgent: 'BDFetch',
			metadata: {
				uaFamily: 'BDFetch',
				uaName: 'BDFetch',
				uaUrl: '',
				uaCompany: 'BDProtect Inc.',
				uaCompanyUrl: 'http://www.brandprotect.com/',
				uaIcon: 'bot_BDFetch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BDFetch'
			}
		},
		'2071': {
			userAgent: 'yacybot (i386 Linux 2.6.24-23-generic; java 1.6.0_16; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'2073': {
			userAgent: 'Mozilla/5.0 (compatible; Plukkie/1.2; http://www.botje.com/plukkie.htm)',
			metadata: {
				uaFamily: 'Plukkie',
				uaName: 'Plukkie/1.2',
				uaUrl: 'http://www.botje.com/plukkie.htm',
				uaCompany: 'botje.com',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Plukkie'
			}
		},
		'2078': {
			userAgent: 'Ronzoobot/1.2 (http://www.ronzoo.com/about.php)',
			metadata: {
				uaFamily: 'Ronzoobot',
				uaName: 'Ronzoobot/1.2',
				uaUrl: 'http://www.ronzoo.com/about/',
				uaCompany: 'Ronzoo',
				uaCompanyUrl: '',
				uaIcon: 'bot_Ronzoobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ronzoobot'
			}
		},
		'2079': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/3.0.0-SNAPSHOT-20091120.021634 +http://crawler.archive.org)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/3.0.0',
				uaUrl: 'http://crawler.archive.org/',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'2081': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/1.14.3.r6601 +http://www.buddybuzz.net/yptrino)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/1.14.3.r6601',
				uaUrl: 'http://crawler.archive.org/',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'2087': {
			userAgent: 'Zscho.de Crawler/Nutch-1.0-Zscho.de-semantic_patch (Zscho.de Crawler, collecting for machine learning; http://zscho.de/)',
			metadata: {
				uaFamily: 'Nutch',
				uaName: 'Nutch/1.0 at zscho.de',
				uaUrl: 'http://www.nutch.org/docs/en/bot.html',
				uaCompany: 'lucene',
				uaCompanyUrl: 'http://lucene.apache.org/',
				uaIcon: 'bot_Nutch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nutch'
			}
		},
		'2088': {
			userAgent: 'yacybot (i386 Linux 2.6.23; java 1.6.0_17; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'2091': {
			userAgent: 'yacybot (amd64 Linux 2.6.26-2-openvz-amd64; java 1.6.0_12; UTC/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'2098': {
			userAgent: 'Surphace Scout&v4.0 - scout at surphace dot com',
			metadata: {
				uaFamily: 'Surphace Scout',
				uaName: 'Surphace Scout/4.0',
				uaUrl: '',
				uaCompany: 'Surphace (AOL news)',
				uaCompanyUrl: 'http://www.surphace.com/',
				uaIcon: 'bot_Surphace_Scout.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Surphace Scout'
			}
		},
		'2099': {
			userAgent: 'Mozilla/5.0 (compatible; Steeler/3.5; http://www.tkl.iis.u-tokyo.ac.jp/~crawler/)',
			metadata: {
				uaFamily: 'Steeler',
				uaName: 'Steeler/3.5',
				uaUrl: 'http://www.tkl.iis.u-tokyo.ac.jp/~crawler/',
				uaCompany: 'Kitsuregawa Laboratory, The University of Tokyo',
				uaCompanyUrl: 'http://www.tkl.iis.u-tokyo.ac.jp/',
				uaIcon: 'bot_Steeler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Steeler'
			}
		},
		'2102': {
			userAgent: 'Mozilla/5.0 (compatible; aiHitBot-DM/2.0.2 +http://www.aihit.com)',
			metadata: {
				uaFamily: 'aiHitBot',
				uaName: 'aiHitBot-DM/2.0.2',
				uaUrl: '',
				uaCompany: 'aiHit Ltd.',
				uaCompanyUrl: 'http://aihit.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=aiHitBot'
			}
		},
		'2110': {
			userAgent: 'amibot - http://www.amidalla.de - tech@amidalla.com libwww-perl/5.831',
			metadata: {
				uaFamily: 'amibot',
				uaName: 'amibot',
				uaUrl: 'http://www.amidalla.de/info.htm',
				uaCompany: 'amidalla.de',
				uaCompanyUrl: 'http://www.amidalla.de/',
				uaIcon: 'bot_amibot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=amibot'
			}
		},
		'2120': {
			userAgent: 'Mozilla/5.0 (compatible; Mp3Bot/0.7; +http://mp3realm.org/mp3bot/)',
			metadata: {
				uaFamily: 'Mp3Bot',
				uaName: 'Mp3Bot/0.7',
				uaUrl: 'http://mp3realm.org/mp3bot/',
				uaCompany: 'Mp3Realm.Org',
				uaCompanyUrl: 'http://mp3realm.org/',
				uaIcon: 'bot_Mp3Bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Mp3Bot'
			}
		},
		'2125': {
			userAgent: 'baypup/colbert (Baypup; http://sf.baypup.com/webmasters; jason@baypup.com)',
			metadata: {
				uaFamily: 'baypup',
				uaName: 'baypup/colbert',
				uaUrl: 'http://www.baypup.com/webmasters',
				uaCompany: 'Flatland Industries, Inc.',
				uaCompanyUrl: 'http://www.flatlandindustries.com/',
				uaIcon: 'bot_Baypup.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=baypup'
			}
		},
		'2132': {
			userAgent: 'gonzo1[P] +http://www.suchen.de/faq.html',
			metadata: {
				uaFamily: 'gonzo',
				uaName: 'gonzo1',
				uaUrl: 'http://www.suchen.de/faq.html',
				uaCompany: 'SEARCHTEQ',
				uaCompanyUrl: 'http://www.searchteq.de/',
				uaIcon: 'bot_gonzo.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=gonzo'
			}
		},
		'2133': {
			userAgent: 'gonzo2[P] +http://www.suchen.de/faq.html',
			metadata: {
				uaFamily: 'gonzo',
				uaName: 'gonzo2',
				uaUrl: 'http://www.suchen.de/faq.html',
				uaCompany: 'SEARCHTEQ',
				uaCompanyUrl: 'http://www.searchteq.de/',
				uaIcon: 'bot_gonzo.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=gonzo'
			}
		},
		'2135': {
			userAgent: 'Mozilla/5.0 (compatible; ptd-crawler; +http://bixolabs.com/crawler/ptd/; crawler@bixolabs.com)',
			metadata: {
				uaFamily: 'bixocrawler',
				uaName: 'ptd-crawler',
				uaUrl: 'http://wiki.github.com/bixo/bixo/bixocrawler',
				uaCompany: 'Bixo Labs',
				uaCompanyUrl: 'http://openbixo.org/',
				uaIcon: 'bot_ptd-crawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bixocrawler'
			}
		},
		'2138': {
			userAgent: 'SBIder/Nutch-1.0-dev (http://www.sitesell.com/sbider.html)',
			metadata: {
				uaFamily: 'SBIder',
				uaName: 'SBIder/1.0',
				uaUrl: 'http://www.sitesell.com/sbider.html',
				uaCompany: 'SiteSell',
				uaCompanyUrl: 'http://www.sitesell.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SBIder'
			}
		},
		'2145': {
			userAgent: 'Ronzoobot/1.3 (http://www.ronzoo.com/about.php)',
			metadata: {
				uaFamily: 'Ronzoobot',
				uaName: 'Ronzoobot/1.3',
				uaUrl: 'http://www.ronzoo.com/about/',
				uaCompany: 'Ronzoo',
				uaCompanyUrl: '',
				uaIcon: 'bot_Ronzoobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ronzoobot'
			}
		},
		'2155': {
			userAgent: 'Linguee Bot (http://www.linguee.com/bot)',
			metadata: {
				uaFamily: 'Linguee Bot',
				uaName: 'Linguee Bot',
				uaUrl: 'http://www.linguee.com/bot',
				uaCompany: 'Linguee GmbH',
				uaCompanyUrl: 'http://www.linguee.com/',
				uaIcon: 'bot_Linguee.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Linguee Bot'
			}
		},
		'2162': {
			userAgent: 'baypup/colbert (Baypup; http://www.baypup.com/webmasters; jason@baypup.com)',
			metadata: {
				uaFamily: 'baypup',
				uaName: 'baypup/colbert',
				uaUrl: 'http://www.baypup.com/webmasters',
				uaCompany: 'Flatland Industries, Inc.',
				uaCompanyUrl: 'http://www.flatlandindustries.com/',
				uaIcon: 'bot_Baypup.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=baypup'
			}
		},
		'2170': {
			userAgent: 'CorpusCrawler 2.0.0 (http://corpora.fi.muni.cz/crawler/)',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.0',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2175': {
			userAgent: 'ThumbShots-Bot (+http://thumbshots.in/bot.html)',
			metadata: {
				uaFamily: 'ThumbShots-Bot',
				uaName: 'ThumbShots-Bot',
				uaUrl: 'http://thumbshots.in/bot.html',
				uaCompany: 'Kristian Fischer',
				uaCompanyUrl: 'http://www.kfsw.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ThumbShots-Bot'
			}
		},
		'2181': {
			userAgent: 'CorpusCrawler 2.0.8 (http://corpora.fi.muni.cz/crawler/)',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.8',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2183': {
			userAgent: 'TinEye/1.1 (http://tineye.com/crawler.html)',
			metadata: {
				uaFamily: 'TinEye',
				uaName: 'TinEye/1.1',
				uaUrl: 'http://tineye.com/crawler.html',
				uaCompany: 'Id\xe9e Inc.',
				uaCompanyUrl: 'http://ideeinc.com/',
				uaIcon: 'bot_TinEye.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=TinEye'
			}
		},
		'2185': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.3.2; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.3.2',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'2188': {
			userAgent: 'Mozilla/5.0 (compatible; aiHitBot/1.0-DS; +http://www.aihit.com/)',
			metadata: {
				uaFamily: 'aiHitBot',
				uaName: 'aiHitBot/1.0-DS',
				uaUrl: '',
				uaCompany: 'aiHit Ltd.',
				uaCompanyUrl: 'http://aihit.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=aiHitBot'
			}
		},
		'2194': {
			userAgent: 'CorpusCrawler 2.0.9 (http://corpora.fi.muni.cz/crawler/)',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.9',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2195': {
			userAgent: 'MnoGoSearch/3.2.37',
			metadata: {
				uaFamily: 'MnoGoSearch',
				uaName: 'MnoGoSearch/3.2.37',
				uaUrl: 'http://www.mnogosearch.org/products.html',
				uaCompany: 'Lavtech.Com',
				uaCompanyUrl: 'http://www.lavtech.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MnoGoSearch'
			}
		},
		'2196': {
			userAgent: 'MojeekBot/0.2 (archi; http://www.mojeek.com/bot.html)',
			metadata: {
				uaFamily: 'MojeekBot',
				uaName: 'MojeekBot/0.2',
				uaUrl: 'http://www.mojeek.com/bot.html',
				uaCompany: 'Mojeek Ltd.',
				uaCompanyUrl: 'http://www.mojeek.com/',
				uaIcon: 'bot_MojeekBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MojeekBot'
			}
		},
		'2197': {
			userAgent: 'Pingdom.com_bot_version_1.4_(http://www.pingdom.com/)',
			metadata: {
				uaFamily: 'pingdom.com_bot',
				uaName: 'pingdom.com_bot 1.4',
				uaUrl: '',
				uaCompany: 'Pingdom AB',
				uaCompanyUrl: 'http://www.pingdom.com/',
				uaIcon: 'bot_pingdomcom_bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=pingdom.com_bot'
			}
		},
		'2205': {
			userAgent: 'Mozilla/5.0 (compatible; XmarksFetch/1.0; +http://www.xmarks.com/about/crawler; info@xmarks.com)',
			metadata: {
				uaFamily: 'XmarksFetch',
				uaName: 'XmarksFetch/1.0',
				uaUrl: 'http://www.xmarks.com/about/crawler',
				uaCompany: 'Xmarks, Inc.',
				uaCompanyUrl: 'http://www.xmarks.com/',
				uaIcon: 'bot_XmarksFetch.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=XmarksFetch'
			}
		},
		'2212': {
			userAgent: 'CorpusCrawler 2.0.10 (http://corpora.fi.muni.cz/crawler/)',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.10',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2223': {
			userAgent: 'Mozilla/5.0 (compatible; aiHitBot/1.0; +http://www.aihit.com/)',
			metadata: {
				uaFamily: 'aiHitBot',
				uaName: 'aiHitBot/1.0',
				uaUrl: '',
				uaCompany: 'aiHit Ltd.',
				uaCompanyUrl: 'http://aihit.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=aiHitBot'
			}
		},
		'2233': {
			userAgent: 'Orgbybot/OrgbyBot v1.3 (Spider; http://orgby.com/bot/  ; Orgby.com Search Engine)',
			metadata: {
				uaFamily: 'OrgbyBot',
				uaName: 'OrgbyBot/1.3',
				uaUrl: 'http://orgby.com/bot/',
				uaCompany: 'Orgby.com',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OrgbyBot'
			}
		},
		'2235': {
			userAgent: 'CorpusCrawler 2.0.12 (http://corpora.fi.muni.cz/crawler/)',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.12',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2239': {
			userAgent: 'CorpusCrawler 2.0.13 (http://corpora.fi.muni.cz/crawler/)',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.13',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2241': {
			userAgent: 'CorpusCrawler 2.0.14 (http://corpora.fi.muni.cz/crawler/)',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.14',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2242': {
			userAgent: 'CorpusCrawler 2.0.15 (http://corpora.fi.muni.cz/crawler/)',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.15',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2246': {
			userAgent: 'Mozilla/5.0 (compatible; Semager/1.4; http://www.semager.de/blog/semager-bots/)',
			metadata: {
				uaFamily: 'Semager',
				uaName: 'Semager/1.4',
				uaUrl: 'http://www.semager.de/blog/semager-bots/',
				uaCompany: 'NG-Marketing',
				uaCompanyUrl: 'http://www.ng-marketing.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Semager'
			}
		},
		'2279': {
			userAgent: 'yacybot (amd64 Linux 2.6.32-gentoo; java 1.6.0_17; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'2300': {
			userAgent: 'yacybot (x86 Windows 2003 5.2; java 1.6.0_16; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'2773': {
			userAgent: 'CorpusCrawler 2.0.17 (http://corpora.fi.muni.cz/crawler/);Project:CzCorpus',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.17',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2844': {
			userAgent: 'CorpusCrawler 2.0.19 (http://corpora.fi.muni.cz/crawler/);Project:CzCorpus',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.19',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2937': {
			userAgent: 'CorpusCrawler 2.0.20 (http://corpora.fi.muni.cz/crawler/);Project:CzCorpus',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.20',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2947': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/1.14.2 +http://www.webarchiv.cz)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/1.14.2',
				uaUrl: 'http://crawler.archive.org/',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'2948': {
			userAgent: 'CorpusCrawler 2.0.21 (http://corpora.fi.muni.cz/crawler/);Project:CzCorpus',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.21',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2952': {
			userAgent: 'CorpusCrawler 2.0.22 (http://corpora.fi.muni.cz/crawler/);Project:CzCorpus',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.22',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'2999': {
			userAgent: 'CorpusCrawler 2.0.24 (http://corpora.fi.muni.cz/crawler/);Project:CzCorpus',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.24',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'3002': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0; FeedFinder-2.0; http://bloggz.se/crawler)',
			metadata: {
				uaFamily: 'FeedFinder/bloggz.se',
				uaName: 'FeedFinder-2.0',
				uaUrl: 'http://bloggz.se/crawler/',
				uaCompany: 'Triop AB',
				uaCompanyUrl: 'http://triop.se/',
				uaIcon: 'bot_FeedFinder_bloggz.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FeedFinder/bloggz.se'
			}
		},
		'3003': {
			userAgent: 'CorpusCrawler 2.0.25 (http://corpora.fi.muni.cz/crawler/);Project:CzCorpus',
			metadata: {
				uaFamily: 'CorpusCrawler',
				uaName: 'CorpusCrawler 2.0.25',
				uaUrl: 'http://corpora.fi.muni.cz/crawler/',
				uaCompany: 'NLP - at the Faculty of Informatics, Masaryk University, Brno',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlplab',
				uaIcon: 'bot_CorpusCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CorpusCrawler'
			}
		},
		'3034': {
			userAgent: 'yacybot (i386 Linux 2.6.26-2-686; java 1.6.0_0; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'3132': {
			userAgent: 'SeznamBot/2.0-Test (+http://fulltext.sblog.cz/robot/)',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/2.0-test',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'3142': {
			userAgent: 'SEOENGBot/1.2 (+http://learn.seoeng.com/seoengbot.htm)',
			metadata: {
				uaFamily: 'SEOENGBot',
				uaName: 'SEOENGBot/1.2 old',
				uaUrl: 'http://www.seoengine.com/seoengbot.htm',
				uaCompany: 'SEO Engine',
				uaCompanyUrl: 'http://www.seoengine.com/',
				uaIcon: 'bot_SEOENGBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SEOENGBot'
			}
		},
		'3203': {
			userAgent: 'Mozilla/5.0 (compatible; ScoutJet; http://www.scoutjet.com/)',
			metadata: {
				uaFamily: 'ScoutJet',
				uaName: 'ScoutJet',
				uaUrl: 'http://www.scoutjet.com/',
				uaCompany: 'blekko, inc.',
				uaCompanyUrl: 'http://blekko.com/',
				uaIcon: 'bot_ScoutJet.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ScoutJet'
			}
		},
		'3221': {
			userAgent: 'yacybot (i386 Linux 2.6.31-18-generic; java 1.6.0_0; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'3235': {
			userAgent: 'Mozilla/4.0 (compatible; HostTracker.com/1.0;+http://host-tracker.com/)',
			metadata: {
				uaFamily: 'HostTracker.com',
				uaName: 'HostTracker.com/1.0',
				uaUrl: 'http://host-tracker.com/',
				uaCompany: 'host-tracker.com ',
				uaCompanyUrl: '',
				uaIcon: 'bot_HostTracker.com.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HostTracker.com'
			}
		},
		'3236': {
			userAgent: 'Mozilla/5.0 (compatible; AportWorm/3.2; +http://www.aport.ru/help)',
			metadata: {
				uaFamily: 'AportWorm',
				uaName: 'AportWorm/3.2',
				uaUrl: 'http://www.aport.ru/help/',
				uaCompany: 'Golden Telecom',
				uaCompanyUrl: 'http://goldentelecom.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AportWorm'
			}
		},
		'3238': {
			userAgent: 'yacybot (i386 Linux 2.6.30-2-686; java 1.6.0_0; SystemV/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'3292': {
			userAgent: 'Karneval-Bot (Version: 1.06, powered by www.karnevalsuchmaschine.de +http://www.karnevalsuchmaschine.de/bot.html)',
			metadata: {
				uaFamily: 'Karneval-Bot',
				uaName: 'Karneval-Bot/1.06',
				uaUrl: 'http://www.karnevalsuchmaschine.de/zeige/bot.html',
				uaCompany: 'F\xf6deration Europ\xe4ischer Narren',
				uaCompanyUrl: 'http://www.fen-sued.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Karneval-Bot'
			}
		},
		'3333': {
			userAgent: 'Mozilla/5.0 (compatible; dotSemantic/1.0; +http://www.dotsemantic.org)',
			metadata: {
				uaFamily: 'dotSemantic',
				uaName: 'dotSemantic/1.0',
				uaUrl: 'http://www.dotsemantic.org',
				uaCompany: 'dotSemantic Projekt',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=dotSemantic'
			}
		},
		'3379': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/1.0; +http://www.seoprofiler.com/bot/ )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/1.0',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'3398': {
			userAgent: 'L.webis/0.44 (http://webalgo.iit.cnr.it/index.php?pg=lwebis)',
			metadata: {
				uaFamily: 'L.webis',
				uaName: 'L.webis/0.44',
				uaUrl: 'http://webalgo.iit.cnr.it/index.php?pg=lwebis',
				uaCompany: 'Institute of Informatics and Telematics (IIT)',
				uaCompanyUrl: 'http://www.iit.cnr.it/',
				uaIcon: 'bot_L.webis.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=L.webis'
			}
		},
		'3409': {
			userAgent: 'Cityreview Robot (+http://www.cityreview.org/crawler/)',
			metadata: {
				uaFamily: 'cityreview',
				uaName: 'cityreview',
				uaUrl: 'http://www.cityreview.org/crawler/',
				uaCompany: 'SISTRIX GmbH',
				uaCompanyUrl: 'http://www.sistrix.com/',
				uaIcon: 'bot_cityreview.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=cityreview'
			}
		},
		'3415': {
			userAgent: 'Ruky-Roboter (Version: 1.06, powered by www.ruky.de +http://www.ruky.de/bot.html)',
			metadata: {
				uaFamily: 'Ruky-Roboter',
				uaName: 'Ruky-Roboter/1.06',
				uaUrl: 'http://www.ruky.de/zeige/bot.html',
				uaCompany: 'ruky.de',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ruky-Roboter'
			}
		},
		'3422': {
			userAgent: 'Mozilla/5.0 (compatible; abby/1.0; +http://www.ellerdale.com/crawler.html)',
			metadata: {
				uaFamily: 'abby',
				uaName: 'abby/1.0',
				uaUrl: 'http://www.ellerdale.com/crawler.html',
				uaCompany: 'Ellerdale Inc.',
				uaCompanyUrl: 'http://www.ellerdale.com/',
				uaIcon: 'bot_abby.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=abby'
			}
		},
		'3441': {
			userAgent: '^Nail (http://CaretNail.com)',
			metadata: {
				uaFamily: '^Nail',
				uaName: '^Nail',
				uaUrl: 'http://caret.us.com/caretnail/index.html',
				uaCompany: 'HydraByte, Inc.',
				uaCompanyUrl: 'http://www.hydrabyte.com/',
				uaIcon: 'bot_Nail.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=^Nail'
			}
		},
		'3445': {
			userAgent: 'ichiro/4.0 (http://help.goo.ne.jp/door/crawler.html)',
			metadata: {
				uaFamily: 'ichiro',
				uaName: 'ichiro/4.0',
				uaUrl: 'http://search.goo.ne.jp/option/use/sub4/sub4-1/',
				uaCompany: 'NTT-Resonant Inc.',
				uaCompanyUrl: 'http://www.nttr.co.jp/',
				uaIcon: 'bot_ichiro.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ichiro'
			}
		},
		'3561': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/1.1; +http://www.seoprofiler.com/bot/ )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/1.1',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'3589': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/1.2; +http://www.seoprofiler.com/bot/ )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/1.2',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'3600': {
			userAgent: 'HolmesBot (http://holmes.ge)',
			metadata: {
				uaFamily: 'HolmesBot',
				uaName: 'HolmesBot',
				uaUrl: '',
				uaCompany: 'Georgian Railway Telecom',
				uaCompanyUrl: 'http://grt.ge/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HolmesBot'
			}
		},
		'3703': {
			userAgent: 'Mozilla/5.0 (compatible; Falconsbot; +http://ws.nju.edu.cn/falcons/)',
			metadata: {
				uaFamily: 'Falconsbot',
				uaName: 'Falconsbot',
				uaUrl: 'http://ws.nju.edu.cn/falcons/contact_us.jsp',
				uaCompany: 'Institute of Web Science',
				uaCompanyUrl: 'http://iws.seu.edu.cn/page/english/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Falconsbot'
			}
		},
		'3734': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/2.0; +http://www.seoprofiler.com/bot/ )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/2.0',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'4000': {
			userAgent: 'Mozilla/4.0 (Toread-Crawler/1.1; +http://news.toread.cc/crawler.php)',
			metadata: {
				uaFamily: 'Toread-Crawler',
				uaName: 'Toread-Crawler/1.1',
				uaUrl: 'http://news.toread.cc/crawler.php',
				uaCompany: 'sidefeed, Inc',
				uaCompanyUrl: 'http://sidefeed.com/',
				uaIcon: 'bot_Toread-Crawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Toread-Crawler'
			}
		},
		'4095': {
			userAgent: 'msnbot/2.0b (+http://search.msn.com/msnbot.htm).',
			metadata: {
				uaFamily: 'MSNBot',
				uaName: 'MSNBot/2.0b + .',
				uaUrl: 'http://search.msn.com/msnbot.htm',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSNBot'
			}
		},
		'4097': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/2.0.1; +http://www.seoprofiler.com/bot/ )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/2.0.1',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'4185': {
			userAgent: 'Mozilla/5.0 (compatible; Speedy Spider; http://www.entireweb.com/about/search_tech/speedy_spider/)',
			metadata: {
				uaFamily: 'Speedy',
				uaName: 'Speedy Spider',
				uaUrl: '',
				uaCompany: 'Entireweb Sweden AB',
				uaCompanyUrl: 'http://www.entireweb.com/',
				uaIcon: 'bot_Speedy.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Speedy'
			}
		},
		'4264': {
			userAgent: 'L.webis/0.50 (http://webalgo.iit.cnr.it/index.php?pg=lwebis)',
			metadata: {
				uaFamily: 'L.webis',
				uaName: 'L.webis/0.50',
				uaUrl: 'http://webalgo.iit.cnr.it/index.php?pg=lwebis',
				uaCompany: 'Institute of Informatics and Telematics (IIT)',
				uaCompanyUrl: 'http://www.iit.cnr.it/',
				uaIcon: 'bot_L.webis.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=L.webis'
			}
		},
		'4336': {
			userAgent: 'Nuhk/2.4 ( http://www.neti.ee/cgi-bin/abi/Otsing/Nuhk/)',
			metadata: {
				uaFamily: 'Nuhk',
				uaName: 'Nuhk/2.4',
				uaUrl: 'http://www.neti.ee/cgi-bin/abi/Otsing/Nuhk/',
				uaCompany: 'Elion',
				uaCompanyUrl: 'http://www.neti.ee/',
				uaIcon: 'bot_Nuhk.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nuhk'
			}
		},
		'4337': {
			userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) Speedy Spider (http://www.entireweb.com/about/search_tech/speedy_spider/)',
			metadata: {
				uaFamily: 'Speedy',
				uaName: 'Speedy Spider',
				uaUrl: '',
				uaCompany: 'Entireweb Sweden AB',
				uaCompanyUrl: 'http://www.entireweb.com/',
				uaIcon: 'bot_Speedy.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Speedy'
			}
		},
		'4377': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/2.0.2; +http://www.seoprofiler.com/bot/ )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/2.0.2',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'4411': {
			userAgent: 'msnbot/2.0b (+http://search.msn.com/msnbot.htm)._',
			metadata: {
				uaFamily: 'MSNBot',
				uaName: 'MSNBot/2.0b + ._',
				uaUrl: 'http://search.msn.com/msnbot.htm',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSNBot'
			}
		},
		'4423': {
			userAgent: 'yacybot (amd64 Linux 2.6.28-18-generic; java 1.6.0_16; GMT/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'4437': {
			userAgent: 'SeznamBot/3.0-alpha (+http://fulltext.sblog.cz/)',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/3.0-alpha',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'4501': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1 + FairShare-http://fairshare.cc)',
			metadata: {
				uaFamily: 'FairShare',
				uaName: 'FairShare',
				uaUrl: 'http://support.attributor.com/kbfairshare/doku.php',
				uaCompany: 'Attributor Corporation',
				uaCompanyUrl: 'http://www.attributor.com/',
				uaIcon: 'bot_FairShare.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FairShare'
			}
		},
		'4512': {
			userAgent: 'Mozilla/5.0 (compatible; Search17Bot/1.1; http://www.search17.com/bot.php)',
			metadata: {
				uaFamily: 'Search17Bot',
				uaName: 'Search17Bot/1.1',
				uaUrl: 'http://www.search17.com/bot.php',
				uaCompany: 'search17.com',
				uaCompanyUrl: 'http://www.search17.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Search17Bot'
			}
		},
		'4519': {
			userAgent: 'Mozilla/5.0 (compatible; BlinkaCrawler/1.0; +http://www.blinka.jp/crawler/)',
			metadata: {
				uaFamily: 'BlinkaCrawler',
				uaName: 'BlinkaCrawler/1.0',
				uaUrl: 'http://www.blinka.jp/crawler/',
				uaCompany: 'Blinka project',
				uaCompanyUrl: 'http://www.blinka.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BlinkaCrawler'
			}
		},
		'4546': {
			userAgent: 'Web-sniffer/1.0.31 (+http://web-sniffer.net/)',
			metadata: {
				uaFamily: 'Web-sniffer',
				uaName: 'Web-sniffer/1.0.31',
				uaUrl: '',
				uaCompany: 'Lingo4you GbR',
				uaCompanyUrl: 'http://www.lingo4u.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Web-sniffer'
			}
		},
		'4589': {
			userAgent: 'MetaURI API +metauri.com',
			metadata: {
				uaFamily: 'MetaURI',
				uaName: 'MetaURI',
				uaUrl: 'http://metauri.com/static/about',
				uaCompany: 'Stateless Systems',
				uaCompanyUrl: 'http://statelesssystems.com/',
				uaIcon: 'bot_MetaURI.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MetaURI'
			}
		},
		'4590': {
			userAgent: 'L.webis/0.51 (http://webalgo.iit.cnr.it/index.php?pg=lwebis)',
			metadata: {
				uaFamily: 'L.webis',
				uaName: 'L.webis/0.51',
				uaUrl: 'http://webalgo.iit.cnr.it/index.php?pg=lwebis',
				uaCompany: 'Institute of Informatics and Telematics (IIT)',
				uaCompanyUrl: 'http://www.iit.cnr.it/',
				uaIcon: 'bot_L.webis.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=L.webis'
			}
		},
		'4591': {
			userAgent: 'L.webis/0.53 (http://webalgo.iit.cnr.it/index.php?pg=lwebis)',
			metadata: {
				uaFamily: 'L.webis',
				uaName: 'L.webis/0.53',
				uaUrl: 'http://webalgo.iit.cnr.it/index.php?pg=lwebis',
				uaCompany: 'Institute of Informatics and Telematics (IIT)',
				uaCompanyUrl: 'http://www.iit.cnr.it/',
				uaIcon: 'bot_L.webis.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=L.webis'
			}
		},
		'4722': {
			userAgent: 'Mozilla/5.0 (FauBot/0.1; +http://buzzvolume.com/fau/)',
			metadata: {
				uaFamily: 'FauBot',
				uaName: 'FauBot/0.1',
				uaUrl: 'http://buzzvolume.com/fau',
				uaCompany: 'BuzzVolume',
				uaCompanyUrl: 'http://buzzvolume.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FauBot'
			}
		},
		'4726': {
			userAgent: 'Googlebot-Video/1.0',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Googlebot-Video/1.0',
				uaUrl: 'http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1061943',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'4730': {
			userAgent: 'Eurobot/1.2 (http://eurobot.ayell.eu)',
			metadata: {
				uaFamily: 'Eurobot',
				uaName: 'Eurobot/1.2',
				uaUrl: 'http://eurobot.ayell.eu/',
				uaCompany: 'Ayell Euronet',
				uaCompanyUrl: 'http://www.ayell.eu/',
				uaIcon: 'bot_eurobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Eurobot'
			}
		},
		'4733': {
			userAgent: 'Mozilla/5.0 (compatible; bixolabs/1.0; +http://bixolabs.com/crawler/general; crawler@bixolabs.com)',
			metadata: {
				uaFamily: 'bixocrawler',
				uaName: 'bixolabs/1.0',
				uaUrl: 'http://wiki.github.com/bixo/bixo/bixocrawler',
				uaCompany: 'Bixo Labs',
				uaCompanyUrl: 'http://openbixo.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bixocrawler'
			}
		},
		'4747': {
			userAgent: 'yacybot (x86 Windows XP 5.1; java 1.6.0_18; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'4830': {
			userAgent: 'yacybot (i386 Linux 2.6.31-21-generic; java 1.6.0_0; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'4844': {
			userAgent: 'livedoor ScreenShot/0.10',
			metadata: {
				uaFamily: 'livedoor ScreenShot',
				uaName: 'livedoor ScreenShot/0.10',
				uaUrl: 'http://helpguide.livedoor.com/help/screenshot/qa/grp584?id=3042',
				uaCompany: 'livedoor Co.,Ltd.',
				uaCompanyUrl: 'http://corp.livedoor.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=livedoor ScreenShot'
			}
		},
		'4846': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.3.3; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.3.3',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'4853': {
			userAgent: 'findlinks/1.1.6-beta1 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/1.1.6-beta1',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'4866': {
			userAgent: 'nodestackbot/0.1 (bot@nodestack.com http://nodestack.com/bot.html)',
			metadata: {
				uaFamily: 'nodestackbot',
				uaName: 'nodestackbot/0.1',
				uaUrl: 'http://nodestack.com/bot.html',
				uaCompany: 'nodestack.com',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=nodestackbot'
			}
		},
		'4876': {
			userAgent: 'Mozilla/5.0 (compatible; Plukkie/1.3; http://www.botje.com/plukkie.htm)',
			metadata: {
				uaFamily: 'Plukkie',
				uaName: 'Plukkie/1.3',
				uaUrl: 'http://www.botje.com/plukkie.htm',
				uaCompany: 'botje.com',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Plukkie'
			}
		},
		'4888': {
			userAgent: 'Mozilla/5.0 ( compatible; SETOOZBOT/0.30 ; http://www.setooz.com/bot.html )',
			metadata: {
				uaFamily: 'Setoozbot',
				uaName: 'SETOOZBOT/0.30 a',
				uaUrl: 'http://www.setooz.com/oozbot.html',
				uaCompany: 'SETU Software Systems (P) Ltd.',
				uaCompanyUrl: 'http://www.setusoftware.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Setoozbot'
			}
		},
		'4898': {
			userAgent: 'Yaanb/1.5.001 (compatible; Win64;)',
			metadata: {
				uaFamily: 'Yaanb',
				uaName: 'Yaanb/1.5.001',
				uaUrl: 'http://www.yaanb.com/company/?p=bot',
				uaCompany: 'Yaanb',
				uaCompanyUrl: 'http://www.yaanb.com/company/',
				uaIcon: 'bot_Yaanb.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yaanb'
			}
		},
		'4907': {
			userAgent: 'Mozilla/5.0 ( compatible; SETOOZBOT/0.30 ; http://www.setooz.com/bot.html ; agentname at setooz dot_com )',
			metadata: {
				uaFamily: 'Setoozbot',
				uaName: 'SETOOZBOT/0.30 b',
				uaUrl: 'http://www.setooz.com/oozbot.html',
				uaCompany: 'SETU Software Systems (P) Ltd.',
				uaCompanyUrl: 'http://www.setusoftware.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Setoozbot'
			}
		},
		'4911': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/2.0.3; +http://www.seoprofiler.com/bot/ )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/2.0.3',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'4914': {
			userAgent: 'Yaanb/1.5.001 (compatible; Win64;+http://www.yaanb.com/company/bot.hmtl)',
			metadata: {
				uaFamily: 'Yaanb',
				uaName: 'Yaanb/1.5.001 b',
				uaUrl: 'http://www.yaanb.com/company/?p=bot',
				uaCompany: 'Yaanb',
				uaCompanyUrl: '',
				uaIcon: 'bot_Yaanb.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yaanb'
			}
		},
		'4922': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/2.0.4; +http://www.seoprofiler.com/bot )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/2.0.4',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'4936': {
			userAgent: 'R6_CommentReader(www.radian6.com/crawler)',
			metadata: {
				uaFamily: 'R6 bot',
				uaName: 'R6_CommentReader',
				uaUrl: 'http://www.radian6.com/crawler/',
				uaCompany: 'Radian6 Technologies Inc',
				uaCompanyUrl: 'http://www.radian6.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=R6 bot'
			}
		},
		'4939': {
			userAgent: 'CamontSpider/1.0 +http://epweb2.ph.bham.ac.uk/user/slater/camont/info.html',
			metadata: {
				uaFamily: 'CamontSpider',
				uaName: 'CamontSpider/1.0',
				uaUrl: 'http://epweb2.ph.bham.ac.uk/user/slater/camont/info.html',
				uaCompany: 'Camtology consortium',
				uaCompanyUrl: 'http://www.hep.phy.cam.ac.uk/~parker/camtology/about.html',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CamontSpider'
			}
		},
		'4940': {
			userAgent: 'Pompos/1.3 http://dir.com/pompos.html',
			metadata: {
				uaFamily: 'Pompos',
				uaName: 'Pompos/1.3',
				uaUrl: 'http://dir.com/pompos.html',
				uaCompany: 'Iliad',
				uaCompanyUrl: 'http://www.iliad.fr/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Pompos'
			}
		},
		'4946': {
			userAgent: 'FyberSpider/1.3 (http://www.fybersearch.com/fyberspider.php)',
			metadata: {
				uaFamily: 'FyberSpider',
				uaName: 'FyberSpider/1.3',
				uaUrl: 'http://www.fybersearch.com/fyberspider.php',
				uaCompany: 'FyberSearch',
				uaCompanyUrl: 'http://www.fybersearch.com/',
				uaIcon: 'bot_FyberSpider.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FyberSpider'
			}
		},
		'4966': {
			userAgent: 'Googlebot/2.1 (+http://www.google.com/bot.html)',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Googlebot/2.1',
				uaUrl: 'http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1061943',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'4974': {
			userAgent: 'yacybot (amd64 Linux 2.6.26-2-amd64; java 1.6.0_0; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'4975': {
			userAgent: 'yacybot (i386 Linux 2.6.32-22-generic; java 1.6.0_20; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'4977': {
			userAgent: 'CatchBot/2.0; +http://www.catchbot.com',
			metadata: {
				uaFamily: 'CatchBot',
				uaName: 'CatchBot/2.0',
				uaUrl: 'http://www.catchbot.com/',
				uaCompany: 'Reed Business Information Pty Limited',
				uaCompanyUrl: 'http://www.reedbusiness.com/',
				uaIcon: 'bot_CatchBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CatchBot'
			}
		},
		'4996': {
			userAgent: 'magpie-crawler/1.1 (U; Linux amd64; en-GB; +http://www.brandwatch.net)',
			metadata: {
				uaFamily: 'magpie-crawler',
				uaName: 'magpie-crawler/1.1',
				uaUrl: 'http://www.brandwatch.com/how-it-works/gathering-data/',
				uaCompany: 'Brandwatch',
				uaCompanyUrl: 'http://www.brandwatch.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=magpie-crawler'
			}
		},
		'4999': {
			userAgent: 'Mozilla/5.0 (compatible; XML Sitemaps Generator; http://www.xml-sitemaps.com) Gecko XML-Sitemaps/1.0',
			metadata: {
				uaFamily: 'XML Sitemaps Generator',
				uaName: 'XML Sitemaps Generator/1.0',
				uaUrl: 'http://www.xml-sitemaps.com/',
				uaCompany: 'xml-sitemaps.com',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=XML Sitemaps Generator'
			}
		},
		'5003': {
			userAgent: 'Mozilla/5.0 (compatible; Nigma.ru/3.0; crawler@nigma.ru)',
			metadata: {
				uaFamily: 'Nigma.ru',
				uaName: 'Nigma.ru/3.0',
				uaUrl: '',
				uaCompany: 'Nigma.ru',
				uaCompanyUrl: 'http://nigma.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nigma.ru'
			}
		},
		'5006': {
			userAgent: 'TwengaBot-Discover (http://www.twenga.fr/bot-discover.html)',
			metadata: {
				uaFamily: 'TwengaBot',
				uaName: 'TwengaBot-Discover',
				uaUrl: 'http://www.twenga.com/bot.html',
				uaCompany: 'Twenga SA',
				uaCompanyUrl: 'http://www.twenga.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=TwengaBot'
			}
		},
		'5007': {
			userAgent: 'Zookabot/2.0;++http://zookabot.com',
			metadata: {
				uaFamily: 'Zookabot',
				uaName: 'Zookabot/2.0',
				uaUrl: 'http://zookabot.com/',
				uaCompany: 'Hwacha ApS',
				uaCompanyUrl: 'http://hwacha.dk/',
				uaIcon: 'bot_Zookabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Zookabot'
			}
		},
		'5010': {
			userAgent: 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexBot/3.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'5014': {
			userAgent: 'Mozilla/5.0 (compatible; YandexImages/3.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexImages/3.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'5016': {
			userAgent: 'Mozilla/5.0 (compatible; YandexBot/3.0; MirrorDetector; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexBot/3.0-MirrorDetector',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'5052': {
			userAgent: 'findlinks/1.1.6-beta2 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/1.1.6-beta2',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'5056': {
			userAgent: 'netEstate RSS crawler (+http://www.rss-directory.info/)',
			metadata: {
				uaFamily: 'netEstate Crawler',
				uaName: 'netEstate RSS crawler',
				uaUrl: '',
				uaCompany: 'netEstate GmbH',
				uaCompanyUrl: 'http://www.netestate.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=netEstate Crawler'
			}
		},
		'5057': {
			userAgent: 'Mozilla/5.0 (compatible; Qualidator.com Bot 1.0;)',
			metadata: {
				uaFamily: 'Qualidator.com Bot',
				uaName: 'Qualidator.com Bot 1.0',
				uaUrl: 'http://www.qualidator.com/Web/de/Support/FAQ_OnlineTestStatistiken.htm',
				uaCompany: 'seven49.net GmbH',
				uaCompanyUrl: 'http://www.seven49.net/',
				uaIcon: 'bot_Qualidator.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Qualidator.com Bot'
			}
		},
		'5065': {
			userAgent: 'Mozilla/5.0 (compatible; VideoSurf_bot +http://www.videosurf.com/bot.html)',
			metadata: {
				uaFamily: 'VideoSurf_bot',
				uaName: 'VideoSurf_bot',
				uaUrl: 'http://www.videosurf.com/bot.html',
				uaCompany: 'VideoSurf Inc.',
				uaCompanyUrl: 'http://www.videosurf.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=VideoSurf_bot'
			}
		},
		'5066': {
			userAgent: 'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.0.19; aggregator:Spinn3r (Spinn3r 3.1); http://spinn3r.com/robot) Gecko/2010040121 Firefox/3.0.19',
			metadata: {
				uaFamily: 'Spinn3r',
				uaName: 'Spinn3r 3.1',
				uaUrl: 'http://spinn3r.com/robot',
				uaCompany: 'Tailrank Inc',
				uaCompanyUrl: 'http://tailrank.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Spinn3r'
			}
		},
		'5077': {
			userAgent: 'Mozilla/5.0 (compatible; AboutUsBot Johnny5/2.0; +http://www.AboutUs.org/)',
			metadata: {
				uaFamily: 'AboutUsBot',
				uaName: 'AboutUsBot Johnny5/2.0',
				uaUrl: 'http://www.aboutus.org/AboutUs:Bot',
				uaCompany: 'AboutUs, Inc.',
				uaCompanyUrl: 'http://www.aboutus.org/AboutUs.org',
				uaIcon: 'bot_AboutUsBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AboutUsBot'
			}
		},
		'5090': {
			userAgent: 'Mozilla/5.0 (compatible; YandexWebmaster/2.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexWebmaster/2.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'5092': {
			userAgent: 'nrsbot/6.0(loopip.com/robot.html)',
			metadata: {
				uaFamily: 'NetResearchServer',
				uaName: 'nrsbot/6.0',
				uaUrl: 'http://loopip.com/robot.html',
				uaCompany: 'LoopIP LLC',
				uaCompanyUrl: 'http://loopip.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NetResearchServer'
			}
		},
		'5100': {
			userAgent: 'Mozilla/5.0 (compatible; Butterfly/1.0; +http://labs.topsy.com/butterfly/) Gecko/2009032608 Firefox/3.0.8',
			metadata: {
				uaFamily: 'Butterfly',
				uaName: 'Butterfly/1.0 a',
				uaUrl: 'http://labs.topsy.com/butterfly.html',
				uaCompany: 'Topsy Labs',
				uaCompanyUrl: 'http://labs.topsy.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Butterfly'
			}
		},
		'5145': {
			userAgent: 'StatoolsBot (+http://www.statools.com/bot.html)',
			metadata: {
				uaFamily: 'StatoolsBot',
				uaName: 'StatoolsBot',
				uaUrl: 'http://www.statools.com/bot.html',
				uaCompany: 'StaTools.com',
				uaCompanyUrl: 'http://www.statools.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=StatoolsBot'
			}
		},
		'5165': {
			userAgent: 'Mozilla/5.0 (compatible; Hailoobot/1.2; +http://www.hailoo.com/spider.html)',
			metadata: {
				uaFamily: 'Hailoobot',
				uaName: 'Hailoobot/1.2',
				uaUrl: 'http://www.hailoo.com/spider.html',
				uaCompany: 'Hailoo',
				uaCompanyUrl: 'http://www.hailoo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Hailoobot'
			}
		},
		'5176': {
			userAgent: 'yacybot (amd64 Linux 2.6.26-2-amd64; java 1.6.0_20; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'5180': {
			userAgent: 'Lijit Crawler (+http://www.lijit.com/robot/crawler)',
			metadata: {
				uaFamily: 'Lijit',
				uaName: 'Lijit',
				uaUrl: 'http://www.lijit.com/robot/crawler',
				uaCompany: 'Lijit Networks Inc.',
				uaCompanyUrl: 'http://www.lijit.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Lijit'
			}
		},
		'5183': {
			userAgent: 'WMCAI-robot (http://www.topicmaster.jp/wmcai/crawler.html)',
			metadata: {
				uaFamily: 'WMCAI_robot',
				uaName: 'WMCAI_robot',
				uaUrl: 'http://www.topicmaster.jp/wmcai/crawler.html',
				uaCompany: 'NTT Corporation',
				uaCompanyUrl: 'http://www.ntt.co.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WMCAI_robot'
			}
		},
		'5187': {
			userAgent: 'eCairn-Grabber/1.0 (+http://ecairn.com/grabber) curl/7.15',
			metadata: {
				uaFamily: 'eCairn-Grabber',
				uaName: 'eCairn-Grabber/1.0',
				uaUrl: 'http://ecairn.com/grabber',
				uaCompany: 'eCairn Inc.',
				uaCompanyUrl: 'http://ecairn.com/',
				uaIcon: 'bot_eCairn-Grabber.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=eCairn-Grabber'
			}
		},
		'5188': {
			userAgent: 'Stroke.cz (http://stroke.cz)',
			metadata: {
				uaFamily: 'Strokebot',
				uaName: 'Strokebot',
				uaUrl: 'http://stroke.cz/oou/',
				uaCompany: 'care4u, s. r. o.',
				uaCompanyUrl: 'http://care4u.cz/',
				uaIcon: 'bot_strokebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Strokebot'
			}
		},
		'5202': {
			userAgent: 'JUST-CRAWLER(+http://www.justsystems.com/jp/tech/crawler/)',
			metadata: {
				uaFamily: 'JUST-CRAWLER',
				uaName: 'JUST-CRAWLER',
				uaUrl: 'http://www.justsystems.com/jp/tech/crawler/',
				uaCompany: 'JustSystems Corporation',
				uaCompanyUrl: 'http://www.justsystems.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=JUST-CRAWLER'
			}
		},
		'5216': {
			userAgent: 'yacybot (x86 Windows 2003 5.2; java 1.6.0_20; America/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'5218': {
			userAgent: 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0; DomainDB-1.1; http://domaindb.com/crawler/)',
			metadata: {
				uaFamily: 'DomainDB',
				uaName: 'DomainDB/1.1',
				uaUrl: 'http://domaindb.com/crawler/',
				uaCompany: 'Triop AB',
				uaCompanyUrl: 'http://triop.se/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DomainDB'
			}
		},
		'5228': {
			userAgent: 'Ocelli/1.4 (http://www.globalspec.com/Ocelli)',
			metadata: {
				uaFamily: 'Ocelli',
				uaName: 'Ocelli/1.4',
				uaUrl: 'http://www.globalspec.com/Ocelli',
				uaCompany: 'GlobalSpec, Inc.',
				uaCompanyUrl: 'http://www.globalspec.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ocelli'
			}
		},
		'5231': {
			userAgent: 'Mozilla/5.0 (compatible; SSLBot/1.0;  http://www.sslstats.com/sslbot)',
			metadata: {
				uaFamily: 'SSLBot',
				uaName: 'SSLBot/1.0',
				uaUrl: 'http://www.sslstats.com/sslbot/',
				uaCompany: 'sslstats.com',
				uaCompanyUrl: 'http://www.sslstats.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SSLBot'
			}
		},
		'5238': {
			userAgent: 'Mozilla/5.0 (compatible; bixolabs/1.0; +http://bixolabs.com/crawler/general; crawler@mail.bixolabs.com)',
			metadata: {
				uaFamily: 'bixocrawler',
				uaName: 'bixolabs/1.0',
				uaUrl: 'http://wiki.github.com/bixo/bixo/bixocrawler',
				uaCompany: 'Bixo Labs',
				uaCompanyUrl: 'http://openbixo.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bixocrawler'
			}
		},
		'5243': {
			userAgent: 'findlinks/1.1.6-beta1 (+http://wortschatz.uni-leipzig.de/findlinks/; YaCy 0.1; yacy.net)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/1.1.6-beta1 Yacy',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'5249': {
			userAgent: 'yacybot (x86 Windows XP 5.1; java 1.6.0_21; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'5272': {
			userAgent: 'Mozilla/5.0 (compatible; archive.org_bot +http://www.archive.org/details/archive.org_bot)',
			metadata: {
				uaFamily: 'archive.org_bot',
				uaName: 'archive.org_bot',
				uaUrl: 'http://www.archive.org/details/archive.org_bot',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=archive.org_bot'
			}
		},
		'5275': {
			userAgent: 'Mozilla/4.0 (compatible;  Vagabondo/4.0; http://webagent.wise-guys.nl/)',
			metadata: {
				uaFamily: 'Vagabondo',
				uaName: 'Vagabondo/4.0',
				uaUrl: 'http://webagent.wise-guys.nl/',
				uaCompany: 'WiseGuys Internet BV',
				uaCompanyUrl: 'http://www.wise-guys.nl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Vagabondo'
			}
		},
		'5276': {
			userAgent: 'yacybot (amd64 Linux 2.6.18-164.15.1.el5xen; java 1.6.0_0; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'5277': {
			userAgent: 'findlinks/1.1.6-beta3 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/1.1.6-beta3',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'5278': {
			userAgent: 'yacybot (amd64 Windows 7 6.1; java 1.6.0_18; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'5280': {
			userAgent: 'Mozilla/5.0 (compatible; MetamojiCrawler/1.0; +http://www.metamoji.com/jp/crawler.html',
			metadata: {
				uaFamily: 'MetamojiCrawler',
				uaName: 'MetamojiCrawler/1.0',
				uaUrl: 'http://www.metamoji.com/jp/crawler.html',
				uaCompany: 'MetaMoJi Corporation',
				uaCompanyUrl: 'http://www.metamoji.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MetamojiCrawler'
			}
		},
		'5281': {
			userAgent: 'yacybot (amd64 Windows 7 6.1; java 1.6.0_21; Europe/fr) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'5292': {
			userAgent: 'findlinks/1.1.6-beta4 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/1.1.6-beta4',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'5302': {
			userAgent: 'HuaweiSymantecSpider/1.0+DSE-support@huaweisymantec.com+(compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR ; http://www.huaweisymantec.com/en/IRL/spider)',
			metadata: {
				uaFamily: 'HuaweiSymantecSpider',
				uaName: 'HuaweiSymantecSpider/1.0',
				uaUrl: 'http://www.huaweisymantec.com/en/IRL/spider/',
				uaCompany: 'Huawei Symantec Technologies Co.,Ltd.',
				uaCompanyUrl: 'http://www.huaweisymantec.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HuaweiSymantecSpider'
			}
		},
		'5311': {
			userAgent: 'Mozilla/5.0 (compatible; 008/0.83; http://www.80legs.com/webcrawler.html;) Gecko/2008032620',
			metadata: {
				uaFamily: '80legs',
				uaName: '80legs/0.83 b',
				uaUrl: 'http://www.80legs.com/webcrawler.html',
				uaCompany: 'Computational Crawling, LP',
				uaCompanyUrl: 'http://compucrawl.com/',
				uaIcon: 'bot_80legs.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=80legs'
			}
		},
		'5322': {
			userAgent: 'yacybot (amd64 Linux 2.6.31-22-server; java 1.6.0_18; Asia/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'5352': {
			userAgent: 'findlinks/1.1.6-beta5 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/1.1.6-beta5',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'5357': {
			userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
			metadata: {
				uaFamily: 'bingbot',
				uaName: 'bingbot/2.0',
				uaUrl: 'http://www.bing.com/webmaster/help/which-crawlers-does-bing-use-8c184ec0',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bingbot'
			}
		},
		'5360': {
			userAgent: 'PostPost/1.0 (+http://postpo.st/crawlers)',
			metadata: {
				uaFamily: 'PostPost',
				uaName: 'PostPost/1.0',
				uaUrl: 'http://postpost.com/crawlers',
				uaCompany: 'Boathouse group',
				uaCompanyUrl: 'http://www.boathouseinc.com/',
				uaIcon: 'bot_PostPost.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=PostPost'
			}
		},
		'5361': {
			userAgent: 'WebWatch/Robot_txtChecker',
			metadata: {
				uaFamily: 'WebWatch/Robot_txtChecker',
				uaName: 'WebWatch/Robot_txtChecker',
				uaUrl: 'http://www.ukoln.ac.uk/web-focus/webwatch/services/robots-txt/',
				uaCompany: 'UKOLN',
				uaCompanyUrl: 'http://www.ukoln.ac.uk/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebWatch/Robot_txtChecker'
			}
		},
		'5362': {
			userAgent: 'Robots_Tester_http_www.searchenginepromotionhelp.com',
			metadata: {
				uaFamily: 'Robots_Tester',
				uaName: 'Robots_Tester',
				uaUrl: 'http://www.searchenginepromotionhelp.com/m/robots-text-tester/robots-checker.php',
				uaCompany: 'Search Engine Promotion Help',
				uaCompanyUrl: 'http://www.searchenginepromotionhelp.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Robots_Tester'
			}
		},
		'5376': {
			userAgent: 'Mozilla/5.0 (compatible; Peew/1.0; http://www.peew.de/crawler/)',
			metadata: {
				uaFamily: 'Peew',
				uaName: 'Peew/1.0',
				uaUrl: 'http://www.peew.de/crawler/',
				uaCompany: 'Marco Schmidt',
				uaCompanyUrl: 'http://www.peew.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Peew'
			}
		},
		'5380': {
			userAgent: 'gonzo/1[P] (+http://www.suchen.de/faq.html)',
			metadata: {
				uaFamily: 'gonzo',
				uaName: 'gonzo/1',
				uaUrl: 'http://www.suchen.de/faq.html',
				uaCompany: 'SEARCHTEQ',
				uaCompanyUrl: 'http://www.searchteq.de/',
				uaIcon: 'bot_gonzo.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=gonzo'
			}
		},
		'5386': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/2.1; +http://www.seoprofiler.com/bot )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/2.1',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'5389': {
			userAgent: 'WikioFeedBot 1.0 (http://www.wikio.com)',
			metadata: {
				uaFamily: 'WikioFeedBot',
				uaName: 'WikioFeedBot 1.0',
				uaUrl: '',
				uaCompany: 'Wikio',
				uaCompanyUrl: 'http://www.wikio.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WikioFeedBot'
			}
		},
		'5611': {
			userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
			metadata: {
				uaFamily: 'FacebookExternalHit',
				uaName: 'FacebookExternalHit/1.1',
				uaUrl: 'http://www.facebook.com/externalhit_uatext.php',
				uaCompany: 'Facebook',
				uaCompanyUrl: 'http://www.facebook.com/',
				uaIcon: 'bot_facebook.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FacebookExternalHit'
			}
		},
		'5620': {
			userAgent: 'Qirina Hurdler v. 1.05 10.11.01 (+http://www.qirina.com/hurdler.html)',
			metadata: {
				uaFamily: 'Qirina Hurdler',
				uaName: 'Qirina Hurdler v. 1.05 10.11.01',
				uaUrl: 'http://www.qirina.com/hurdler.html',
				uaCompany: 'Locust Swarm',
				uaCompanyUrl: 'http://www.locustswarm.com/',
				uaIcon: 'bot_QirinaHurdler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Qirina Hurdler'
			}
		},
		'5623': {
			userAgent: 'Mozilla/5.0 (compatible; AntBot/1.0; +http://www.ant.com/)',
			metadata: {
				uaFamily: 'AntBot',
				uaName: 'AntBot/1.0',
				uaUrl: '',
				uaCompany: 'Ant.com',
				uaCompanyUrl: 'http://www.ant.com/',
				uaIcon: 'bot_AntBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AntBot'
			}
		},
		'5635': {
			userAgent: 'WatchMouse/18990 (http://watchmouse.com/ ; d2.watchmouse.com)',
			metadata: {
				uaFamily: 'WatchMouse',
				uaName: 'WatchMouse/18990 d2.watchmouse.com',
				uaUrl: 'http://www.watchmouse.com/',
				uaCompany: 'WatchMouse',
				uaCompanyUrl: '',
				uaIcon: 'bot_WatchMouse.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WatchMouse'
			}
		},
		'5636': {
			userAgent: 'WatchMouse/18990 (http://watchmouse.com/ ; liz)',
			metadata: {
				uaFamily: 'WatchMouse',
				uaName: 'WatchMouse/18990 liz',
				uaUrl: 'http://www.watchmouse.com/',
				uaCompany: 'WatchMouse',
				uaCompanyUrl: '',
				uaIcon: 'bot_WatchMouse.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WatchMouse'
			}
		},
		'5637': {
			userAgent: 'WatchMouse/18990 (http://watchmouse.com/ ; d3.watchmouse.com)',
			metadata: {
				uaFamily: 'WatchMouse',
				uaName: 'WatchMouse/18990 d3.watchmouse.com',
				uaUrl: 'http://www.watchmouse.com/',
				uaCompany: 'WatchMouse',
				uaCompanyUrl: '',
				uaIcon: 'bot_WatchMouse.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WatchMouse'
			}
		},
		'5638': {
			userAgent: 'WatchMouse/18990 (http://watchmouse.com/ ; gab)',
			metadata: {
				uaFamily: 'WatchMouse',
				uaName: 'WatchMouse/18990 gab',
				uaUrl: 'http://www.watchmouse.com/',
				uaCompany: 'WatchMouse',
				uaCompanyUrl: '',
				uaIcon: 'bot_WatchMouse.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WatchMouse'
			}
		},
		'5639': {
			userAgent: 'WatchMouse/18990 (http://watchmouse.com/ ; ny)',
			metadata: {
				uaFamily: 'WatchMouse',
				uaName: 'WatchMouse/18990 ny',
				uaUrl: 'http://www.watchmouse.com/',
				uaCompany: 'WatchMouse',
				uaCompanyUrl: '',
				uaIcon: 'bot_WatchMouse.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WatchMouse'
			}
		},
		'5640': {
			userAgent: 'WatchMouse/18990 (http://watchmouse.com/ ; se.watchmouse.com)',
			metadata: {
				uaFamily: 'WatchMouse',
				uaName: 'WatchMouse/18990 se.watchmouse.com',
				uaUrl: 'http://www.watchmouse.com/',
				uaCompany: 'WatchMouse',
				uaCompanyUrl: '',
				uaIcon: 'bot_WatchMouse.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WatchMouse'
			}
		},
		'5641': {
			userAgent: 'WatchMouse/18990 (http://watchmouse.com/ ; it)',
			metadata: {
				uaFamily: 'WatchMouse',
				uaName: 'WatchMouse/18990 it',
				uaUrl: 'http://www.watchmouse.com/',
				uaCompany: 'WatchMouse',
				uaCompanyUrl: '',
				uaIcon: 'bot_WatchMouse.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WatchMouse'
			}
		},
		'5642': {
			userAgent: 'WatchMouse/18990 (http://watchmouse.com/ ; hk)',
			metadata: {
				uaFamily: 'WatchMouse',
				uaName: 'WatchMouse/18990 hk',
				uaUrl: 'http://www.watchmouse.com/',
				uaCompany: 'WatchMouse',
				uaCompanyUrl: '',
				uaIcon: 'bot_WatchMouse.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WatchMouse'
			}
		},
		'5643': {
			userAgent: 'WatchMouse/18990 (http://watchmouse.com/ ; bc.watchmouse.com)',
			metadata: {
				uaFamily: 'WatchMouse',
				uaName: 'WatchMouse/18990 bc',
				uaUrl: 'http://www.watchmouse.com/',
				uaCompany: 'WatchMouse',
				uaCompanyUrl: '',
				uaIcon: 'bot_WatchMouse.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WatchMouse'
			}
		},
		'5644': {
			userAgent: 'WatchMouse/18990 (http://watchmouse.com/ ; uk)',
			metadata: {
				uaFamily: 'WatchMouse',
				uaName: 'WatchMouse/18990 uk',
				uaUrl: 'http://www.watchmouse.com/',
				uaCompany: 'WatchMouse',
				uaCompanyUrl: '',
				uaIcon: 'bot_WatchMouse.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WatchMouse'
			}
		},
		'5646': {
			userAgent: 'findlinks/2.0 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.0',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'5655': {
			userAgent: 'Zookabot/2.1;++http://zookabot.com',
			metadata: {
				uaFamily: 'ZookaBot',
				uaName: 'ZookaBot/2.1',
				uaUrl: 'http://zookabot.com/',
				uaCompany: 'Hwacha ApS',
				uaCompanyUrl: 'http://hwacha.dk/',
				uaIcon: 'bot_Zookabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ZookaBot'
			}
		},
		'5665': {
			userAgent: 'CatchBot/3.0; +http://www.catchbot.com',
			metadata: {
				uaFamily: 'CatchBot',
				uaName: 'CatchBot/3.0',
				uaUrl: 'http://www.catchbot.com/',
				uaCompany: 'Reed Business Information Pty Limited',
				uaCompanyUrl: 'http://www.reedbusiness.com/',
				uaIcon: 'bot_CatchBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CatchBot'
			}
		},
		'5683': {
			userAgent: 'Mozilla/5.0 (compatible; MojeekBot/0.2; http://www.mojeek.com/bot.html#relaunch)',
			metadata: {
				uaFamily: 'MojeekBot',
				uaName: 'MojeekBot/0.2 Relaunch',
				uaUrl: 'http://www.mojeek.com/bot.html',
				uaCompany: 'Mojeek Ltd.',
				uaCompanyUrl: 'http://www.mojeek.com/',
				uaIcon: 'bot_MojeekBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MojeekBot'
			}
		},
		'5685': {
			userAgent: 'findlinks/1.1.6-beta6 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/1.1.6-beta6',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'5701': {
			userAgent: 'WebAlta Crawler/1.3.25 (http://www.webalta.net/ru/about_webmaster.html) (Windows; U; Windows NT 5.1; ru-RU)',
			metadata: {
				uaFamily: 'WebAlta Crawler',
				uaName: 'WebAlta Crawler/1.3.25',
				uaUrl: 'http://www.webalta.net/ru/about_webmaster.html',
				uaCompany: 'Webalta',
				uaCompanyUrl: 'http://www.webalta.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebAlta Crawler'
			}
		},
		'5710': {
			userAgent: 'wikiwix-bot-3.0',
			metadata: {
				uaFamily: 'wikiwix-bot',
				uaName: 'wikiwix-bot/3.0',
				uaUrl: '',
				uaCompany: 'wikiwix.com',
				uaCompanyUrl: 'http://www.wikiwix.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=wikiwix-bot'
			}
		},
		'5715': {
			userAgent: 'findlinks/2.0.1 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.0.1',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'5718': {
			userAgent: 'yrspider (Mozilla/5.0 (compatible; YRSpider; +http://www.yunrang.com/yrspider.html))',
			metadata: {
				uaFamily: 'YRSpider',
				uaName: 'YRSpider',
				uaUrl: 'http://www.yunrang.com/yrspider.html',
				uaCompany: 'yunrang',
				uaCompanyUrl: 'http://www.yunrang.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YRSpider'
			}
		},
		'5727': {
			userAgent: 'Mozilla/5.0 (compatible; Urlfilebot/2.2; +http://urlfile.com/bot.html)',
			metadata: {
				uaFamily: 'Urlfilebot (Urlbot)',
				uaName: 'Urlfilebot/2.2',
				uaUrl: 'http://urlfile.com/bot.html',
				uaCompany: 'Urlfile',
				uaCompanyUrl: 'http://urlfile.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Urlfilebot (Urlbot)'
			}
		},
		'5748': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/3.0; +http://www.seoprofiler.com/bot )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/3.0',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'5802': {
			userAgent: 'Mozilla/5.0 (compatible; suggybot v0.01a, http://blog.suggy.com/was-ist-suggy/suggy-webcrawler/)',
			metadata: {
				uaFamily: 'suggybot',
				uaName: 'suggybot/0.01a',
				uaUrl: 'http://blog.suggy.com/was-ist-suggy/suggy-webcrawler/',
				uaCompany: 'Suggy GbR',
				uaCompanyUrl: 'http://www.suggy.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=suggybot'
			}
		},
		'5806': {
			userAgent: 'EuripBot/1.1 (+http://www.eurip.com) GetRobots',
			metadata: {
				uaFamily: 'EuripBot',
				uaName: 'EuripBot/1.1',
				uaUrl: 'http://www.eurip.com/service/webmaster/euripbot.html',
				uaCompany: 'EURIP - European Internet Portal',
				uaCompanyUrl: 'http://www.eurip.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=EuripBot'
			}
		},
		'5818': {
			userAgent: 'Mozilla/5.0 (compatible; Ezooms/1.0; ezooms.bot@gmail.com)',
			metadata: {
				uaFamily: 'Ezooms',
				uaName: 'Ezooms/1.0',
				uaUrl: '',
				uaCompany: 'dotnetdotcom.org',
				uaCompanyUrl: 'http://www.dotnetdotcom.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ezooms'
			}
		},
		'5828': {
			userAgent: 'thumbshots-de-bot (+http://www.thumbshots.de/)',
			metadata: {
				uaFamily: 'thumbshots-de-Bot',
				uaName: 'thumbshots-de-bot',
				uaUrl: 'http://www.thumbshots.de/content-39-seite_auszuschliessen.html',
				uaCompany: 'Mobile & More Mobilkommunikation GmbH',
				uaCompanyUrl: 'http://www.mobile-more.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=thumbshots-de-Bot'
			}
		},
		'5839': {
			userAgent: 'TwengaBot',
			metadata: {
				uaFamily: 'TwengaBot',
				uaName: 'TwengaBot',
				uaUrl: 'http://www.twenga.com/bot.html',
				uaCompany: 'Twenga SA',
				uaCompanyUrl: 'http://www.twenga.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=TwengaBot'
			}
		},
		'5843': {
			userAgent: 'findlinks/2.0.2 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.0.2',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'5846': {
			userAgent: 'Mozilla/5.0 (compatible; YandexMedia/3.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'Mozilla/5.0 (compatible; YandexMedia/3.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'5857': {
			userAgent: 'SeznamBot/3.0-beta (+http://fulltext.sblog.cz/)',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/3.0-beta',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'5859': {
			userAgent: 'OpenCalaisSemanticProxy',
			metadata: {
				uaFamily: 'OpenCalaisSemanticProxy',
				uaName: 'OpenCalaisSemanticProxy',
				uaUrl: 'http://www.opencalais.com/open-calais-semanticproxy-robot-agent-name',
				uaCompany: 'Thomson Reuters',
				uaCompanyUrl: 'http://thomsonreuters.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OpenCalaisSemanticProxy'
			}
		},
		'5860': {
			userAgent: 'Covario-IDS/1.0 (Covario; http://www.covario.com/ids; support at covario dot com)',
			metadata: {
				uaFamily: 'Covario-IDS',
				uaName: 'Covario-IDS/1.0',
				uaUrl: 'http://www.covario.com/ids',
				uaCompany: 'Covario Inc.',
				uaCompanyUrl: 'http://www.covario.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Covario-IDS'
			}
		},
		'5862': {
			userAgent: 'Mozilla/5.0 (X11; U; Linux i686; de; rv:1.9.0.1; compatible; iCjobs Stellenangebote Jobs; http://www.icjobs.de) Gecko/20100401 iCjobs/3.2.3',
			metadata: {
				uaFamily: 'iCjobs',
				uaName: 'iCjobs/3.2.3',
				uaUrl: 'http://www.icjobs.de/bot.htm',
				uaCompany: 'Intelligence Competence Center AG',
				uaCompanyUrl: 'http://www.iccenter.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=iCjobs'
			}
		},
		'5902': {
			userAgent: 'ichiro/5.0 (http://help.goo.ne.jp/door/crawler.html)',
			metadata: {
				uaFamily: 'ichiro',
				uaName: 'ichiro/5.0',
				uaUrl: 'http://search.goo.ne.jp/option/use/sub4/sub4-1/',
				uaCompany: 'NTT-Resonant Inc.',
				uaCompanyUrl: 'http://www.nttr.co.jp/',
				uaIcon: 'bot_ichiro.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ichiro'
			}
		},
		'5909': {
			userAgent: 'Mozilla/5.0 (compatible; CligooRobot/2.0; +http://www.cligoo.de/wk/technik.php)',
			metadata: {
				uaFamily: 'CligooRobot',
				uaName: 'CligooRobot/2.0',
				uaUrl: 'http://www.cligoo.de/wk/technik.php',
				uaCompany: 'cligoo medien service UG',
				uaCompanyUrl: 'http://www.cligoo.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CligooRobot'
			}
		},
		'5939': {
			userAgent: 'nWormFeedFinder (http://www.nworm.com)',
			metadata: {
				uaFamily: 'nworm',
				uaName: 'nwormFeedFinder',
				uaUrl: 'http://www.nworm.com/crawlers.php',
				uaCompany: 'Daniel Schlicker (mangora IT)',
				uaCompanyUrl: 'http://www.mangora.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=nworm'
			}
		},
		'5960': {
			userAgent: 'MetaGeneratorCrawler/1.1 (www.metagenerator.info)',
			metadata: {
				uaFamily: 'MetaGeneratorCrawler',
				uaName: 'MetaGeneratorCrawler/1.1',
				uaUrl: 'http://www.metagenerator.info/',
				uaCompany: 'Jan Bogutzki',
				uaCompanyUrl: 'http://jan.bogutzki.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MetaGeneratorCrawler'
			}
		},
		'5982': {
			userAgent: 'Y!J-BRO/YFSJ crawler (compatible; Mozilla 4.0; MSIE 5.5; http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html; YahooFeedSeekerJp/2.0)',
			metadata: {
				uaFamily: 'Yahoo! JAPAN',
				uaName: 'Y!J-BRO/YFSJ',
				uaUrl: 'http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html',
				uaCompany: 'Yahoo! Inc',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot_yahoo!slurp.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo! JAPAN'
			}
		},
		'5987': {
			userAgent: 'Mozilla/5.0 (compatible; oBot/2.3.1; +http://www-935.ibm.com/services/us/index.wss/detail/iss/a1029077?cntxt=a1027244)',
			metadata: {
				uaFamily: 'oBot',
				uaName: 'oBot/2.3.1 b',
				uaUrl: 'http://filterdb.iss.net/crawler/',
				uaCompany: 'IBM Germany Research & Development GmbH',
				uaCompanyUrl: 'http://www.ibm.com/ibm/de/de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=oBot'
			}
		},
		'5999': {
			userAgent: 'SEOENGBot/1.2 (+http://learn.seoengine.com/seoengbot.htm)',
			metadata: {
				uaFamily: 'SEOENGBot',
				uaName: 'SEOENGBot/1.2',
				uaUrl: 'http://www.seoengine.com/seoengbot.htm',
				uaCompany: 'SEO Engine',
				uaCompanyUrl: 'http://www.seoengine.com/',
				uaIcon: 'bot_SEOENGBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SEOENGBot'
			}
		},
		'6001': {
			userAgent: 'Zookabot/2.2;++http://zookabot.com',
			metadata: {
				uaFamily: 'Zookabot',
				uaName: 'Zookabot/2.2',
				uaUrl: 'http://zookabot.com/',
				uaCompany: 'Hwacha ApS',
				uaCompanyUrl: 'http://hwacha.dk/',
				uaIcon: 'bot_Zookabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Zookabot'
			}
		},
		'6010': {
			userAgent: 'msnbot-NewsBlogs/2.0b (+http://search.msn.com/msnbot.htm)',
			metadata: {
				uaFamily: 'MSNBot',
				uaName: 'msnbot-NewsBlogs/2.0b',
				uaUrl: 'http://search.msn.com/msnbot.htm',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MSNBot'
			}
		},
		'6011': {
			userAgent: 'findlinks/2.0.4 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.0.4',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'6024': {
			userAgent: 'quickobot/quickobot-1 (Quicko Labs; http://quicko.co; robot at quicko dot co)',
			metadata: {
				uaFamily: 'quickobot',
				uaName: 'quickobot-1',
				uaUrl: 'http://www.searchenabler.com/quickobot/',
				uaCompany: 'Quicko Labs Pvt Ltd. ',
				uaCompanyUrl: 'http://www.searchenabler.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=quickobot'
			}
		},
		'6038': {
			userAgent: 'SeznamBot/3.0-beta (+http://fulltext.sblog.cz/), I',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/3.0-beta',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'6040': {
			userAgent: 'Mozilla/5.0 (compatible; SEODat/0.1 http://crawler.seodat.com)',
			metadata: {
				uaFamily: 'SEODat',
				uaName: 'SEODat/0.1',
				uaUrl: '',
				uaCompany: 'SEODAT',
				uaCompanyUrl: 'http://www.seodat.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SEODat'
			}
		},
		'6044': {
			userAgent: 'linkdex.com/v2.0',
			metadata: {
				uaFamily: 'linkdex.com',
				uaName: 'linkdex.com/v2.0',
				uaUrl: '',
				uaCompany: 'Linkdex Limited',
				uaCompanyUrl: 'http://www.linkdex.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=linkdex.com'
			}
		},
		'6065': {
			userAgent: 'UnwindFetchor/1.0 (+http://www.gnip.com/)',
			metadata: {
				uaFamily: 'UnwindFetchor',
				uaName: 'UnwindFetchor/1.0',
				uaUrl: '',
				uaCompany: 'Gnip, inc.',
				uaCompanyUrl: 'http://gnip.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=UnwindFetchor'
			}
		},
		'6068': {
			userAgent: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; en-US; rv:1.9.2) Gecko/20100115 Firefox/3.6 (FlipboardProxy/0.0.5; +http://flipboard.com/browserproxy)',
			metadata: {
				uaFamily: 'FlipboardProxy',
				uaName: 'FlipboardProxy/0.0.5',
				uaUrl: 'http://flipboard.com/browserproxy',
				uaCompany: 'Flipboard, Inc.',
				uaCompanyUrl: 'http://flipboard.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FlipboardProxy'
			}
		},
		'6109': {
			userAgent: 'Sitedomain-Bot(Sitedomain-Bot 1.0, http://www.sitedomain.de/sitedomain-bot/)',
			metadata: {
				uaFamily: 'Sitedomain-Bot',
				uaName: 'Sitedomain-Bot 1.0',
				uaUrl: 'http://www.sitedomain.de/sitedomain-bot/',
				uaCompany: 'Sitedomain.de',
				uaCompanyUrl: 'http://www.sitedomain.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Sitedomain-Bot'
			}
		},
		'6114': {
			userAgent: 'Nuhk/2.4 (+http://www.neti.ee/cgi-bin/abi/otsing.html)',
			metadata: {
				uaFamily: 'Nuhk',
				uaName: 'Nuhk/2.4 b',
				uaUrl: 'http://www.neti.ee/cgi-bin/abi/Otsing/Nuhk/',
				uaCompany: 'Elion',
				uaCompanyUrl: 'http://www.neti.ee/',
				uaIcon: 'bot_Nuhk.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nuhk'
			}
		},
		'6134': {
			userAgent: 'Mail.RU/2.0',
			metadata: {
				uaFamily: 'Mail.Ru bot',
				uaName: 'Mail.RU/2.0',
				uaUrl: 'http://go.mail.ru/help/robots',
				uaCompany: 'Mail.Ru Group',
				uaCompanyUrl: 'http://corp.mail.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Mail.Ru bot'
			}
		},
		'6146': {
			userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-GB; rv:1.0; trendictionbot0.4.2; trendiction media ssppiiddeerr; http://www.trendiction.com/bot/; please let us know of any problems; ssppiiddeerr at trendiction.com) Gecko/20071127 Firefox/2.0.0.11',
			metadata: {
				uaFamily: 'trendictionbot',
				uaName: 'trendictionbot0.4.2',
				uaUrl: 'http://www.trendiction.de/bot',
				uaCompany: 'Trendiction S.A.',
				uaCompanyUrl: 'http://www.trendiction.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=trendictionbot'
			}
		},
		'6177': {
			userAgent: 'findlinks/1.1.3-beta9 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/1.1.3-beta9',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'6189': {
			userAgent: 'SeznamBot/3.0 (+http://fulltext.sblog.cz/)',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/3.0',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'6192': {
			userAgent: 'SeznamBot/3.0-test (+http://fulltext.sblog.cz/)',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/3.0-test',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'6202': {
			userAgent: 'FlightDeckReportsBot/2.0 (http://www.flightdeckreports.com/pages/bot)',
			metadata: {
				uaFamily: 'FlightDeckReportsBot',
				uaName: 'FlightDeckReportsBot/2.0',
				uaUrl: 'http://www.flightdeckreports.com/pages/bot',
				uaCompany: 'Flight Deck Reports, LLC.',
				uaCompanyUrl: 'http://www.flightdeckreports.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=FlightDeckReportsBot'
			}
		},
		'6214': {
			userAgent: 'SeznamBot/3.0-test (+http://fulltext.sblog.cz/), I',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/3.0-test',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'6225': {
			userAgent: 'Mozilla/5.0 (compatible; NetcraftSurveyAgent/1.0; +info@netcraft.com)',
			metadata: {
				uaFamily: 'NetcraftSurveyAgent',
				uaName: 'NetcraftSurveyAgent/1.0',
				uaUrl: '',
				uaCompany: 'Netcraft Ltd',
				uaCompanyUrl: 'http://www.netcraft.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NetcraftSurveyAgent'
			}
		},
		'6226': {
			userAgent: 'GarlikCrawler/1.1 (http://garlik.com/, crawler@garik.com)',
			metadata: {
				uaFamily: 'GarlikCrawler',
				uaName: 'GarlikCrawler/1.1',
				uaUrl: '',
				uaCompany: 'Garlik Limited',
				uaCompanyUrl: 'http://www.garlik.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=GarlikCrawler'
			}
		},
		'6229': {
			userAgent: 'Setooz/Nutch-1.0 (http://www.setooz.com)',
			metadata: {
				uaFamily: 'Setoozbot',
				uaName: 'Setoozbot/1.0',
				uaUrl: 'http://www.setooz.com/oozbot.html',
				uaCompany: 'SETU Software Systems (P) Ltd.',
				uaCompanyUrl: 'http://www.setusoftware.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Setoozbot'
			}
		},
		'6231': {
			userAgent: 'BacklinkCrawler (http://www.backlinktest.com/crawler.html)',
			metadata: {
				uaFamily: 'BacklinkCrawler',
				uaName: 'BacklinkCrawler',
				uaUrl: 'http://www.backlinktest.com/crawler.html',
				uaCompany: '2.0Promotion GbR',
				uaCompanyUrl: 'http://2.0promotion.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BacklinkCrawler'
			}
		},
		'6234': {
			userAgent: 'OpenWebSpider v0.1.2.B (http://www.openwebspider.org/)',
			metadata: {
				uaFamily: 'OpenWebSpider',
				uaName: 'OpenWebSpider v0.1.2.B',
				uaUrl: 'http://www.openwebspider.org/',
				uaCompany: 'Stefano Alimonti',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OpenWebSpider'
			}
		},
		'6237': {
			userAgent: 'http://arachnode.net 2.5',
			metadata: {
				uaFamily: 'arachnode.net',
				uaName: 'arachnode.net/2.5',
				uaUrl: 'http://arachnode.codeplex.com/',
				uaCompany: 'arachnode.net, llc',
				uaCompanyUrl: 'http://arachnode.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=arachnode.net'
			}
		},
		'6243': {
			userAgent: 'Mozilla/5.0 (compatible; Evrinid Iudex 1.0.0; +http://www.evri.com/evrinid)',
			metadata: {
				uaFamily: 'EvriNid',
				uaName: 'EvriNid/1.0.0',
				uaUrl: 'http://corporate.evri.com/about-us/evrinid/',
				uaCompany: 'Evri Inc.',
				uaCompanyUrl: 'http://corporate.evri.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=EvriNid'
			}
		},
		'6244': {
			userAgent: 'Mozilla/5.0 (compatible; discobot/1.0; +http://discoveryengine.com/discobot.html)',
			metadata: {
				uaFamily: 'discoverybot',
				uaName: 'discobot/1.0',
				uaUrl: 'http://discoveryengine.com/discoverybot.html',
				uaCompany: 'discoveryengine.com. ',
				uaCompanyUrl: 'http://www.discoveryengine.com/',
				uaIcon: 'bot_discobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=discoverybot'
			}
		},
		'6245': {
			userAgent: 'Nymesis/2.0 (http://nymesis.com)',
			metadata: {
				uaFamily: 'Nymesis',
				uaName: 'Nymesis/2.0',
				uaUrl: 'http://www.nymesis.com/about/',
				uaCompany: 'nymesis.com',
				uaCompanyUrl: 'http://www.nymesis.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Nymesis'
			}
		},
		'6246': {
			userAgent: 'Abrave Spider v4 Robot 1 (http://robot.abrave.co.uk)',
			metadata: {
				uaFamily: 'Abrave Spider',
				uaName: 'Abrave Spider/4-1',
				uaUrl: 'http://robot.abrave.co.uk/',
				uaCompany: 'Gallent Limited',
				uaCompanyUrl: 'http://www.gallent.co.uk/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Abrave Spider'
			}
		},
		'6247': {
			userAgent: 'Abrave Spider v4 Robot 2 (http://robot.abrave.co.uk)',
			metadata: {
				uaFamily: 'Abrave Spider',
				uaName: 'Abrave Spider/4-2',
				uaUrl: 'http://robot.abrave.co.uk/',
				uaCompany: 'Gallent Limited',
				uaCompanyUrl: 'http://www.gallent.co.uk/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Abrave Spider'
			}
		},
		'6252': {
			userAgent: 'RankurBot/Rankur2.1 (http://rankur.com; info at rankur dot com)',
			metadata: {
				uaFamily: 'RankurBot',
				uaName: 'RankurBot/2.1',
				uaUrl: 'http://rankur.com/technology.html',
				uaCompany: 'Advance Solutions EU Ltd.',
				uaCompanyUrl: 'http://www.advancesolutions.eu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=RankurBot'
			}
		},
		'6270': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.4.0; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.4.0',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'6280': {
			userAgent: 'crawler4j (http://code.google.com/p/crawler4j/)',
			metadata: {
				uaFamily: 'Crawler4j',
				uaName: 'Crawler4j',
				uaUrl: 'http://code.google.com/p/crawler4j/',
				uaCompany: 'Yasser Ganjisaffar',
				uaCompanyUrl: 'http://www.ics.uci.edu/~yganjisa/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Crawler4j'
			}
		},
		'6288': {
			userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) Speedy Spider for SpeedyAds (http://www.entireweb.com/about/search_tech/speedy_spider/)',
			metadata: {
				uaFamily: 'Speedy',
				uaName: 'Speedy Spider',
				uaUrl: '',
				uaCompany: 'Entireweb Sweden AB',
				uaCompanyUrl: 'http://www.entireweb.com/',
				uaIcon: 'bot_Speedy.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Speedy'
			}
		},
		'6298': {
			userAgent: 'findlinks/2.0.9 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.0.9',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'6304': {
			userAgent: 'Mozilla/5.0 (compatible; NerdByNature.Bot; http://www.nerdbynature.net/bot)',
			metadata: {
				uaFamily: 'NerdByNature.Bot',
				uaName: 'NerdByNature.Bot',
				uaUrl: 'http://www.nerdbynature.net/bot',
				uaCompany: 'W3 Solutions GmbH',
				uaCompanyUrl: 'http://www.w3solutions.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NerdByNature.Bot'
			}
		},
		'6312': {
			userAgent: 'findlinks/2.1 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.1',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'6326': {
			userAgent: 'findlinks/2.1.3 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.1.3',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'6329': {
			userAgent: 'Mozilla/5.0 (compatible; SISTRIX Crawler; http://crawler.sistrix.net/)',
			metadata: {
				uaFamily: 'sistrix',
				uaName: 'sistrix',
				uaUrl: 'http://crawler.sistrix.net/',
				uaCompany: 'SISTRIX GmbH',
				uaCompanyUrl: 'http://www.sistrix.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sistrix'
			}
		},
		'6352': {
			userAgent: 'Mozilla/5.0 (compatible; Plukkie/1.4; http://www.botje.com/plukkie.htm)',
			metadata: {
				uaFamily: 'Plukkie',
				uaName: 'Plukkie/1.4',
				uaUrl: 'http://www.botje.com/plukkie.htm',
				uaCompany: 'botje.com',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Plukkie'
			}
		},
		'6353': {
			userAgent: 'GarlikCrawler/1.1 (http://garlik.com/, crawler@garlik.com)',
			metadata: {
				uaFamily: 'GarlikCrawler',
				uaName: 'GarlikCrawler/1.1 b',
				uaUrl: '',
				uaCompany: 'Garlik Limited',
				uaCompanyUrl: 'http://www.garlik.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=GarlikCrawler'
			}
		},
		'6399': {
			userAgent: 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
			metadata: {
				uaFamily: 'Baiduspider',
				uaName: 'Baiduspider/2.0',
				uaUrl: 'http://www.baidu.com/search/spider.htm',
				uaCompany: 'Baidu',
				uaCompanyUrl: 'http://www.baidu.com/',
				uaIcon: 'bot_baiduspider.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Baiduspider'
			}
		},
		'6404': {
			userAgent: 'Mozilla/5.0 (compatible; AhrefsBot/1.0; +http://ahrefs.com/robot/)',
			metadata: {
				uaFamily: 'AhrefsBot',
				uaName: 'AhrefsBot/1.0',
				uaUrl: 'http://ahrefs.com/robot/',
				uaCompany: 'Ahrefs.com',
				uaCompanyUrl: 'http://ahrefs.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AhrefsBot'
			}
		},
		'6436': {
			userAgent: 'Mozilla/5.0 (compatible; MojeekBot/0.2; http://www.mojeek.com/bot.html)',
			metadata: {
				uaFamily: 'MojeekBot',
				uaName: 'MojeekBot/0.2',
				uaUrl: 'http://www.mojeek.com/bot.html',
				uaCompany: 'Mojeek Ltd.',
				uaCompanyUrl: 'http://www.mojeek.com/',
				uaIcon: 'bot_MojeekBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MojeekBot'
			}
		},
		'6506': {
			userAgent: 'SEOENGWorldBot/1.0 (+http://www.seoengine.com/seoengbot.htm)',
			metadata: {
				uaFamily: 'SEOENGBot',
				uaName: 'SEOENGBot/1.0',
				uaUrl: 'http://www.seoengine.com/seoengbot.htm',
				uaCompany: 'SEO Engine',
				uaCompanyUrl: 'http://www.seoengine.com/',
				uaIcon: 'bot_SEOENGBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SEOENGBot'
			}
		},
		'6514': {
			userAgent: 'Mozilla/5.0 (compatible; socketcrawler; http://nlp.fi.muni.cz/projects/biwec/)',
			metadata: {
				uaFamily: 'biwec',
				uaName: 'biwec',
				uaUrl: 'http://nlp.fi.muni.cz/projects/biwec/',
				uaCompany: 'Centre for Natural Language Processing',
				uaCompanyUrl: 'http://muni.cz/fi/335300?lang=en',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=biwec'
			}
		},
		'6515': {
			userAgent: 'Wotbox/2.0 (bot@wotbox.com; http://www.wotbox.com)',
			metadata: {
				uaFamily: 'Wotbox',
				uaName: 'Wotbox/2.0',
				uaUrl: 'http://www.wotbox.com/bot/',
				uaCompany: 'Wotbox Team',
				uaCompanyUrl: 'http://www.wotbox.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Wotbox'
			}
		},
		'6578': {
			userAgent: 'Mozilla/5.0 (compatible; Thumbshots.ru; +http://thumbshots.ru/bot) Firefox/3',
			metadata: {
				uaFamily: 'Thumbshots.ru',
				uaName: 'Thumbshots.ru',
				uaUrl: 'http://thumbshots.ru/bot',
				uaCompany: 'Sonorth Technologies',
				uaCompanyUrl: 'http://www.sonorth.com/tech/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Thumbshots.ru'
			}
		},
		'6583': {
			userAgent: 'JikeSpider Mozilla/5.0 (compatible; JikeSpider; +http://shoulu.jike.com/spider.html)',
			metadata: {
				uaFamily: 'JikeSpider',
				uaName: 'JikeSpider',
				uaUrl: 'http://shoulu.jike.com/spider.html',
				uaCompany: 'jike.com',
				uaCompanyUrl: 'http://www.jike.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=JikeSpider'
			}
		},
		'6592': {
			userAgent: 'Aboundex/0.2 (http://www.aboundex.com/crawler/)',
			metadata: {
				uaFamily: 'Aboundexbot',
				uaName: 'Aboundexbot/0.2',
				uaUrl: 'http://www.aboundex.com/crawler/',
				uaCompany: 'Aboundex.com',
				uaCompanyUrl: 'http://www.aboundex.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Aboundexbot'
			}
		},
		'6598': {
			userAgent: 'Mozilla/5.0 (compatible; SEOkicks-Robot +http://www.seokicks.de/robot.html)',
			metadata: {
				uaFamily: 'SEOkicks-Robot',
				uaName: 'SEOkicks-Robot',
				uaUrl: 'http://www.seokicks.de/robot.html',
				uaCompany: 'Torsten R\xfcckert Internetdienstleistungen',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SEOkicks-Robot'
			}
		},
		'6603': {
			userAgent: 'Y!J-BRW/1.0 crawler (http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html)',
			metadata: {
				uaFamily: 'Yahoo! JAPAN',
				uaName: 'Y!J-BRW/1.0',
				uaUrl: 'http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html',
				uaCompany: 'Yahoo! Inc',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot_yahoo!slurp.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo! JAPAN'
			}
		},
		'6612': {
			userAgent: 'The Lemur Web Crawler/Nutch-1.3 (Lemur Web Crawler; http://boston.lti.cs.cmu.edu/crawler_12/; admin@lemurproject.org)',
			metadata: {
				uaFamily: 'LemurWebCrawler',
				uaName: 'LemurWebCrawler',
				uaUrl: 'http://boston.lti.cs.cmu.edu/crawler_12/',
				uaCompany: 'Language Technologies Institute',
				uaCompanyUrl: 'http://www.lti.cs.cmu.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LemurWebCrawler'
			}
		},
		'6625': {
			userAgent: 'LapozzBot/1.5 (+http://robot.lapozz.hu) ',
			metadata: {
				uaFamily: 'LapozzBot',
				uaName: 'LapozzBot/1.5',
				uaUrl: 'http://robot.lapozz.hu/',
				uaCompany: 'lapozz.hu',
				uaCompanyUrl: 'http://www.lapozz.hu/',
				uaIcon: 'bot_lapozzbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LapozzBot'
			}
		},
		'6630': {
			userAgent: 'CovarioIDS/1.1 (http://www.covario.com/ids; support at covario dot com)',
			metadata: {
				uaFamily: 'Covario-IDS',
				uaName: 'CovarioIDS/1.1',
				uaUrl: 'http://www.covario.com/ids',
				uaCompany: 'Covario, Inc.',
				uaCompanyUrl: 'http://www.covario.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Covario-IDS'
			}
		},
		'6647': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/3.1.0-RC1 +http://boston.lti.cs.cmu.edu/crawler_12/)',
			metadata: {
				uaFamily: 'LemurWebCrawler',
				uaName: 'LemurWebCrawler',
				uaUrl: 'http://boston.lti.cs.cmu.edu/crawler_12/',
				uaCompany: 'Language Technologies Institute',
				uaCompanyUrl: 'http://www.lti.cs.cmu.edu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=LemurWebCrawler'
			}
		},
		'6679': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-34-server; java 1.6.0_26; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'6680': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows 7 6.1; java 1.6.0_29; Europe/fr) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'6708': {
			userAgent: 'SEOENGBot/1.2 (+http://www.seoengine.com/seoengbot.htm)',
			metadata: {
				uaFamily: 'SEOENGBot',
				uaName: 'SEOENGBot/1.2 new',
				uaUrl: 'http://www.seoengine.com/seoengbot.htm',
				uaCompany: 'SEO Engine',
				uaCompanyUrl: 'http://www.seoengine.com/',
				uaIcon: 'bot_SEOENGBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SEOENGBot'
			}
		},
		'6712': {
			userAgent: 'findlinks/2.1.5 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.1.5',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'6721': {
			userAgent: 'Ronzoobot/1.5 (http://www.ronzoo.com/about/)',
			metadata: {
				uaFamily: 'Ronzoobot',
				uaName: 'Ronzoobot/1.5',
				uaUrl: 'http://www.ronzoo.com/about/',
				uaCompany: 'Ronzoo',
				uaCompanyUrl: '',
				uaIcon: 'bot_Ronzoobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ronzoobot'
			}
		},
		'6735': {
			userAgent: 'netEstate NE Crawler (+http://www.sengine.info/)',
			metadata: {
				uaFamily: 'netEstate Crawler',
				uaName: 'netEstate NE Crawler',
				uaUrl: '',
				uaCompany: 'netEstate GmbH',
				uaCompanyUrl: 'http://www.netestate.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=netEstate Crawler'
			}
		},
		'6739': {
			userAgent: 'PagePeeker.com',
			metadata: {
				uaFamily: 'PagePeeker',
				uaName: 'PagePeeker',
				uaUrl: 'http://pagepeeker.com/robots',
				uaCompany: 'PagePeeker.com',
				uaCompanyUrl: 'http://pagepeeker.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=PagePeeker'
			}
		},
		'6751': {
			userAgent: 'Mozilla/5.0 (compatible; AhrefsBot/2.0; +http://ahrefs.com/robot/)',
			metadata: {
				uaFamily: 'AhrefsBot',
				uaName: 'AhrefsBot/2.0',
				uaUrl: 'http://ahrefs.com/robot/',
				uaCompany: 'Ahrefs.com',
				uaCompanyUrl: 'http://ahrefs.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AhrefsBot'
			}
		},
		'6770': {
			userAgent: 'SemrushBot/0.9',
			metadata: {
				uaFamily: 'SemrushBot',
				uaName: 'SemrushBot/0.9',
				uaUrl: 'http://www.semrush.com/bot.html',
				uaCompany: 'SEOQuake Team',
				uaCompanyUrl: 'http://www.seoquaketeam.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SemrushBot'
			}
		},
		'6776': {
			userAgent: 'Mozilla/5.0 (compatible; WBSearchBot/1.1; +http://www.warebay.com/bot.html)',
			metadata: {
				uaFamily: 'WBSearchBot',
				uaName: 'WBSearchBot/1.1',
				uaUrl: 'http://www.warebay.com/bot.html',
				uaCompany: 'Ware Bay',
				uaCompanyUrl: 'http://www.warebay.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WBSearchBot'
			}
		},
		'6802': {
			userAgent: 'Mozilla/5.0 (compatible; DCPbot/1.0; +http://domains.checkparams.com/)',
			metadata: {
				uaFamily: 'DCPbot',
				uaName: 'DCPbot/1.0',
				uaUrl: 'http://domains.checkparams.com/',
				uaCompany: 'CheckParams',
				uaCompanyUrl: 'http://checkparams.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DCPbot'
			}
		},
		'6816': {
			userAgent: 'Mozilla/5.0 (compatible; SpiderLing (a SPIDER for LINGustic research); http://nlp.fi.muni.cz/projects/biwec/)',
			metadata: {
				uaFamily: 'SpiderLing',
				uaName: 'SpiderLing',
				uaUrl: 'http://nlp.fi.muni.cz/projects/biwec/',
				uaCompany: 'Natural Language Processing Centre',
				uaCompanyUrl: 'http://nlp.fi.muni.cz/en/nlpc',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SpiderLing'
			}
		},
		'6826': {
			userAgent: 'Mozilla/5.0 (compatible; oBot/2.3.1; +http://filterdb.iss.net/crawler/)',
			metadata: {
				uaFamily: 'oBot',
				uaName: 'oBot/2.3.1',
				uaUrl: 'http://filterdb.iss.net/crawler/',
				uaCompany: 'IBM Germany Research &amp; Development GmbH',
				uaCompanyUrl: 'http://www.ibm.com/ibm/de/de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=oBot'
			}
		},
		'6829': {
			userAgent: 'Mozilla/5.0 (compatible; JikeSpider; +http://shoulu.jike.com/spider.html)',
			metadata: {
				uaFamily: 'JikeSpider',
				uaName: 'JikeSpider b',
				uaUrl: 'http://shoulu.jike.com/spider.html',
				uaCompany: 'jike.com',
				uaCompanyUrl: 'http://www.jike.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=JikeSpider'
			}
		},
		'6835': {
			userAgent: 'SETOOZBOT/5.0 ( compatible; SETOOZBOT/0.30 ; http://www.setooz.com/bot.html )',
			metadata: {
				uaFamily: 'Setoozbot',
				uaName: 'SETOOZBOT/0.30',
				uaUrl: 'http://www.setooz.com/oozbot.html',
				uaCompany: 'SETU Software Systems (P) Ltd.',
				uaCompanyUrl: 'http://www.setusoftware.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Setoozbot'
			}
		},
		'6837': {
			userAgent: 'SETOOZBOT/5.0 ( http://www.setooz.com/bot.html )',
			metadata: {
				uaFamily: 'Setoozbot',
				uaName: 'SETOOZBOT/5.0',
				uaUrl: 'http://www.setooz.com/oozbot.html',
				uaCompany: 'SETU Software Systems (P) Ltd.',
				uaCompanyUrl: 'http://www.setusoftware.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Setoozbot'
			}
		},
		'6840': {
			userAgent: 'Updownerbot (+http://www.updowner.com/bot)',
			metadata: {
				uaFamily: 'Updownerbot',
				uaName: 'Updownerbot',
				uaUrl: 'http://www.updowner.com/bot',
				uaCompany: 'updowner.com',
				uaCompanyUrl: 'http://www.updowner.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Updownerbot'
			}
		},
		'6877': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.4.1; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.4.1',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'6884': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.0.0-14-generic; java 1.6.0_23; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'6892': {
			userAgent: 'Mozilla/5.0 (compatible; Semager/1.4c; +http://www.semager.de/blog/semager-bots/)',
			metadata: {
				uaFamily: 'Semager',
				uaName: 'Semager/1.4c',
				uaUrl: 'http://www.semager.de/blog/semager-bots/',
				uaCompany: 'NG-Marketing',
				uaCompanyUrl: 'http://www.ng-marketing.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Semager'
			}
		},
		'6896': {
			userAgent: 'yacybot (freeworld/global; i386 Linux 2.6.37.6-0.5-desktop; java 1.6.0_20; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'6905': {
			userAgent: 'Acoon v4.1.0 (www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'Acoon v4.1.0',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'6914': {
			userAgent: 'Mozilla/5.0 (compatible; OpenindexDeepSpider/Nutch-1.5-dev; +http://openindex.io/spider.html; systemsATopenindexDOTio)',
			metadata: {
				uaFamily: 'OpenindexSpider',
				uaName: 'OpenindexDeepSpider',
				uaUrl: 'http://www.openindex.io/en/webmasters/spider.html',
				uaCompany: 'Openindex B.V.',
				uaCompanyUrl: 'http://www.openindex.io/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OpenindexSpider'
			}
		},
		'6921': {
			userAgent: 'Yeti-FeedItemCrawler/1.0 (NHN Corp.; http://help.naver.com/robots/)',
			metadata: {
				uaFamily: 'NaverBot',
				uaName: 'Yeti-FeedItemCrawler/1.0',
				uaUrl: 'http://help.naver.com/robots/',
				uaCompany: 'NHN Corporation',
				uaCompanyUrl: 'http://www.nhncorp.com/',
				uaIcon: 'bot_NaverBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NaverBot'
			}
		},
		'6922': {
			userAgent: 'Mozilla/5.0 (compatible; discobot/2.0; +http://discoveryengine.com/discobot.html)',
			metadata: {
				uaFamily: 'discoverybot',
				uaName: 'discobot/2.0',
				uaUrl: 'http://discoveryengine.com/discoverybot.html',
				uaCompany: 'discoveryengine.com. ',
				uaCompanyUrl: 'http://www.discoveryengine.com/',
				uaIcon: 'bot_discobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=discoverybot'
			}
		},
		'6929': {
			userAgent: 'Mozilla/5.0 (compatible; WASALive-Bot ; http://blog.wasalive.com/wasalive-bots/)',
			metadata: {
				uaFamily: 'WASALive-Bot',
				uaName: ' WASALive-Bot',
				uaUrl: 'http://blog.wasalive.com/wasalive-bots/',
				uaCompany: 'WASALive',
				uaCompanyUrl: 'http://www.wasalive.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WASALive-Bot'
			}
		},
		'6937': {
			userAgent: 'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.0.5) Gecko/2010033101 Gentoo Firefox/3.0.5 (Dot TK - spider 3.0)',
			metadata: {
				uaFamily: 'Dot TK - spider',
				uaName: 'Dot TK - spider 3.0',
				uaUrl: '',
				uaCompany: 'Dot TK Limited',
				uaCompanyUrl: 'http://www.dot.tk/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Dot TK - spider'
			}
		},
		'6945': {
			userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.51 (KHTML, like Gecko; Google Web Preview) Chrome/12.0.742 Safari/534.51',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Google Web Preview',
				uaUrl: 'http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1062498',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'6947': {
			userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.24 (KHTML, like Gecko; Google Web Preview) Chrome/11.0.696 Safari/534.24 ',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Google Web Preview',
				uaUrl: 'http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1062498',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'6948': {
			userAgent: 'Mozilla/5.0 (en-us) AppleWebKit/525.13 (KHTML, like Gecko; Google Web Preview) Version/3.1 Safari/525.13',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Google Web Preview',
				uaUrl: 'http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1062498',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'6961': {
			userAgent: 'Visbot/2.0 (+http://www.visvo.com/en/webmasters.jsp;bot@visvo.com)',
			metadata: {
				uaFamily: 'Visbot',
				uaName: 'Visbot/2.0',
				uaUrl: 'http://www.visvo.com/webmasters.htm',
				uaCompany: 'Visvo Inc.',
				uaCompanyUrl: 'http://www.visvo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Visbot'
			}
		},
		'6962': {
			userAgent: 'Mozilla/5.0 (compatible; UASlinkChecker/1.0; +http://user-agent-string.info/UASlinkChecker)',
			metadata: {
				uaFamily: 'UASlinkChecker',
				uaName: 'UASlinkChecker/1.0',
				uaUrl: 'http://user-agent-string.info/UASlinkChecker',
				uaCompany: 'Jaroslav Mallat',
				uaCompanyUrl: 'http://mallat.cz/',
				uaIcon: 'bot_UASlinkChecker.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=UASlinkChecker'
			}
		},
		'6968': {
			userAgent: 'yacybot (webportal/global; amd64 Linux 2.6.32-5-amd64; java 1.6.0_18; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'6974': {
			userAgent: 'PostPost/1.0 (+http://postpost.com/crawlers)',
			metadata: {
				uaFamily: 'PostPost',
				uaName: 'PostPost/1.0',
				uaUrl: 'http://postpost.com/crawlers',
				uaCompany: 'Boathouse group',
				uaCompanyUrl: 'http://www.boathouseinc.com/',
				uaIcon: 'bot_PostPost.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=PostPost'
			}
		},
		'6977': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-5-amd64; java 1.6.0_18; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'6978': {
			userAgent: 'Pixray-Seeker/1.1 (Pixray-Seeker; crawler@pixray.com)',
			metadata: {
				uaFamily: 'Pixray-Seeker',
				uaName: 'Pixray-Seeker/1.1',
				uaUrl: 'http://www.pixray.com/pixraybot',
				uaCompany: 'PIXRAY GmbH.',
				uaCompanyUrl: 'http://www.pixray.com/',
				uaIcon: 'bot_PixraySeeker.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Pixray-Seeker'
			}
		},
		'6999': {
			userAgent: 'ichiro/3.0 (http://help.goo.ne.jp/help/article/1142)',
			metadata: {
				uaFamily: 'ichiro',
				uaName: 'ichiro/3.0',
				uaUrl: 'http://search.goo.ne.jp/option/use/sub4/sub4-1/',
				uaCompany: 'NTT-Resonant Inc.',
				uaCompanyUrl: 'http://www.nttr.co.jp/',
				uaIcon: 'bot_ichiro.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ichiro'
			}
		},
		'7001': {
			userAgent: 'Acoon v4.9.5 (www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'Acoon v4.9.5',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7005': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.4.2; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.4.2',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'7008': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.0.0-15-server; java 1.6.0_23; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7009': {
			userAgent: 'Acoon v4.10.1 (www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'Acoon v4.10.1',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7012': {
			userAgent: 'Mozilla/5.0 (compatible; Moatbot/2.2; +http://www.moat.com/pages/moatbot)',
			metadata: {
				uaFamily: 'Moatbot',
				uaName: 'Moatbot/2.2',
				uaUrl: 'http://www.moat.com/pages/moatbot',
				uaCompany: 'Moat Inc.',
				uaCompanyUrl: 'http://www.moat.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Moatbot'
			}
		},
		'7013': {
			userAgent: 'Mozilla/5.0 (compatible; YandexNews/3.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexNews/3.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7014': {
			userAgent: 'Mozilla/5.0 (compatible; Konqueror/3.5; Linux) KHTML/3.5.5 (like Gecko) (Exabot-Thumbnails)',
			metadata: {
				uaFamily: 'Exabot',
				uaName: 'Exabot-Thumbnails',
				uaUrl: 'http://www.exabot.com/go/robot',
				uaCompany: 'Exalead S.A.',
				uaCompanyUrl: 'http://www.exalead.com/',
				uaIcon: 'bot_Exabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Exabot'
			}
		},
		'7015': {
			userAgent: 'Mozilla/5.0 (compatible; Apercite; +http://www.apercite.fr/robot/index.html)',
			metadata: {
				uaFamily: 'Apercite',
				uaName: 'Apercite',
				uaUrl: 'http://www.apercite.fr/robot/index.html',
				uaCompany: 'Apercite',
				uaCompanyUrl: 'http://www.apercite.fr/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Apercite'
			}
		},
		'7018': {
			userAgent: 'Mozilla/5.0 (compatible; YandexMetrika/2.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexMetrika/2.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7039': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.1-gentoo-r2; java 1.6.0_22; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7044': {
			userAgent: 'Ronzoobot/1.6 (http://www.ronzoo.com/about/)',
			metadata: {
				uaFamily: 'Ronzoobot',
				uaName: 'Ronzoobot/1.6',
				uaUrl: 'http://www.ronzoo.com/about/',
				uaCompany: 'Ronzoo',
				uaCompanyUrl: '',
				uaIcon: 'bot_Ronzoobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Ronzoobot'
			}
		},
		'7045': {
			userAgent: 'Mozilla/5.0 (compatible; OpenindexDeepSpider/Nutch-1.5-dev; +http://www.openindex.io/en/webmasters/spider.html; systemsATopenindexDOTio)',
			metadata: {
				uaFamily: 'OpenindexSpider',
				uaName: 'OpenindexDeepSpider',
				uaUrl: 'http://www.openindex.io/en/webmasters/spider.html',
				uaCompany: 'Openindex B.V.',
				uaCompanyUrl: 'http://www.openindex.io/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OpenindexSpider'
			}
		},
		'7051': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.0.0-12-generic; java 1.6.0_26; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7053': {
			userAgent: 'gonzo2[p] (+http://www.suchen.de/faq.html)',
			metadata: {
				uaFamily: 'gonzo',
				uaName: 'gonzo2',
				uaUrl: 'http://www.suchen.de/faq.html',
				uaCompany: 'SEARCHTEQ',
				uaCompanyUrl: 'http://www.searchteq.de/',
				uaIcon: 'bot_gonzo.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=gonzo'
			}
		},
		'7055': {
			userAgent: 'Mozilla/5.0 (compatible; OpenindexShallowSpider/Nutch-1.5-dev; +http://www.openindex.io/en/webmasters/spider.html; systemsATopenindexDOTio)',
			metadata: {
				uaFamily: 'OpenindexSpider',
				uaName: 'OpenindexShalooowSpider',
				uaUrl: 'http://www.openindex.io/en/webmasters/spider.html',
				uaCompany: 'Openindex B.V.',
				uaCompanyUrl: 'http://www.openindex.io/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OpenindexSpider'
			}
		},
		'7060': {
			userAgent: 'SemrushBot/Nutch-1.5-SNAPSHOT',
			metadata: {
				uaFamily: 'SemrushBot',
				uaName: 'SemrushBot',
				uaUrl: 'http://www.semrush.com/bot.html',
				uaCompany: 'SEOQuake Team',
				uaCompanyUrl: 'http://www.seoquaketeam.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SemrushBot'
			}
		},
		'7063': {
			userAgent: 'Pixray-Seeker/1.1 (Pixray-Seeker; http://www.pixray.com/pixraybot; crawler@pixray.com)',
			metadata: {
				uaFamily: 'Pixray-Seeker',
				uaName: 'Pixray-Seeker/1.1',
				uaUrl: 'http://www.pixray.com/pixraybot',
				uaCompany: 'PIXRAY GmbH.',
				uaCompanyUrl: 'http://www.pixray.com/',
				uaIcon: 'bot_PixraySeeker.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Pixray-Seeker'
			}
		},
		'7070': {
			userAgent: 'PagePeeker.com (info: http://pagepeeker.com/robots)',
			metadata: {
				uaFamily: 'PagePeeker',
				uaName: 'PagePeeker',
				uaUrl: 'http://pagepeeker.com/robots',
				uaCompany: 'PagePeeker.com',
				uaCompanyUrl: 'http://pagepeeker.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=PagePeeker'
			}
		},
		'7072': {
			userAgent: 'Mozilla/5.0 (compatible;WI Job Roboter Spider Version 3;+http://www.webintegration.at)',
			metadata: {
				uaFamily: 'Job Roboter Spider',
				uaName: 'Job Roboter Spider 3',
				uaUrl: 'http://www.webintegration.at/jobroboter_suchmaschine',
				uaCompany: 'Web Integration IT Service GmbH',
				uaCompanyUrl: 'http://www.webintegration.at/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Job Roboter Spider'
			}
		},
		'7079': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.1-gentoo-r2; java 1.6.0_24; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7083': {
			userAgent: 'EdisterBot (http://www.edister.com/bot.html)',
			metadata: {
				uaFamily: 'EdisterBot',
				uaName: 'EdisterBot',
				uaUrl: 'http://www.edister.com/bot.html',
				uaCompany: 'Jonathan Leger',
				uaCompanyUrl: 'http://www.jonathanleger.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=EdisterBot'
			}
		},
		'7084': {
			userAgent: 'Factbot 1.09 (see http://www.factbites.com/webmasters.php)',
			metadata: {
				uaFamily: 'factbot',
				uaName: 'Factbot 1.09',
				uaUrl: 'http://www.factbites.com/webmasters.php',
				uaCompany: 'Rapid Intelligence Pty Ltd',
				uaCompanyUrl: 'http://www.rapint.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=factbot'
			}
		},
		'7092': {
			userAgent: 'yacybot (webportal-global; amd64 Linux 2.6.32-5-amd64; java 1.6.0_18; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7096': {
			userAgent: 'SemrushBot/0.91',
			metadata: {
				uaFamily: 'SemrushBot',
				uaName: 'SemrushBot/0.91',
				uaUrl: 'http://www.semrush.com/bot.html',
				uaCompany: 'SEOQuake Team',
				uaCompanyUrl: 'http://www.seoquaketeam.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SemrushBot'
			}
		},
		'7106': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/1.14.3 +http://www.accelobot.com)',
			metadata: {
				uaFamily: 'Accelobot',
				uaName: 'Accelobot',
				uaUrl: 'http://www.accelobot.com/',
				uaCompany: 'NetBase Solutions, Inc.',
				uaCompanyUrl: 'http://www.netbase.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Accelobot'
			}
		},
		'7107': {
			userAgent: 'Mozilla/5.0 (compatible; OpenindexDeepSpider/Nutch-1.5-dev; +http://www.openindex.io/en/webmasters/spider.html)',
			metadata: {
				uaFamily: 'OpenindexSpider',
				uaName: 'OpenindexDeepSpider',
				uaUrl: 'http://www.openindex.io/en/webmasters/spider.html',
				uaCompany: 'Openindex B.V.',
				uaCompanyUrl: 'http://www.openindex.io/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OpenindexSpider'
			}
		},
		'7112': {
			userAgent: 'Acoon v4.10.3 (www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'Acoon v4.10.3',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7113': {
			userAgent: 'Mozilla/5.0 (compatible; IstellaBot/1.01.18 +http://www.tiscali.it/)',
			metadata: {
				uaFamily: 'IstellaBot',
				uaName: 'IstellaBot/1.01.18',
				uaUrl: '',
				uaCompany: 'Tiscali Italia S.p.a',
				uaCompanyUrl: 'http://www.tiscali.it/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IstellaBot'
			}
		},
		'7119': {
			userAgent: 'Mozilla/5.0 (compatible; imbot/0.1 +http://internetmemory.org/en/)',
			metadata: {
				uaFamily: 'imbot',
				uaName: 'imbot/0.1',
				uaUrl: '',
				uaCompany: 'Internet Memory Foundation (formerly European Archive)',
				uaCompanyUrl: 'http://internetmemory.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=imbot'
			}
		},
		'7126': {
			userAgent: 'SeznamBot/3.0 (HaF+http://fulltext.sblog.cz/)',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/3.0',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'7132': {
			userAgent: 'Mozilla/5.0 (compatible; OpenindexShallowSpider/Nutch-1.5-dev; +http://www.openindex.io/en/webmasters/spider.html)',
			metadata: {
				uaFamily: 'OpenindexSpider',
				uaName: 'OpenindexShalooowSpider',
				uaUrl: 'http://www.openindex.io/en/webmasters/spider.html',
				uaCompany: 'Openindex B.V.',
				uaCompanyUrl: 'http://www.openindex.io/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OpenindexSpider'
			}
		},
		'7133': {
			userAgent: 'Mozilla/5.0 (compatible; YioopBot; +http://www.yioop.com/bot.php)',
			metadata: {
				uaFamily: 'YioopBot',
				uaName: 'YioopBot',
				uaUrl: 'http://www.yioop.com/bot.php',
				uaCompany: 'Chris Pollett',
				uaCompanyUrl: 'http://pollett.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YioopBot'
			}
		},
		'7138': {
			userAgent: 'Mozilla/5.0 (compatible; SWEBot/1.0; +http://swebot.net)',
			metadata: {
				uaFamily: 'SWEBot',
				uaName: 'SWEBot/1.0',
				uaUrl: 'http://swebot.net/',
				uaCompany: 'swebot.net',
				uaCompanyUrl: 'http://swebot.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SWEBot'
			}
		},
		'7139': {
			userAgent: 'Zookabot/2.4;++http://zookabot.com',
			metadata: {
				uaFamily: 'Zookabot',
				uaName: 'Zookabot/2.4',
				uaUrl: 'http://zookabot.com/',
				uaCompany: 'Hwacha ApS',
				uaCompanyUrl: 'http://hwacha.dk/',
				uaIcon: 'bot_Zookabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Zookabot'
			}
		},
		'7143': {
			userAgent: 'DuckDuckPreview/1.0; (+http://duckduckgo.com/duckduckpreview.html)',
			metadata: {
				uaFamily: 'DuckDuckPreview',
				uaName: 'DuckDuckPreview/1.0',
				uaUrl: 'http://duckduckgo.com/duckduckpreview.html',
				uaCompany: 'DuckDuckGo, Inc.',
				uaCompanyUrl: 'http://duckduckgo.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DuckDuckPreview'
			}
		},
		'7153': {
			userAgent: 'percbotspider <ops@percolate.com>',
			metadata: {
				uaFamily: 'percbotspider',
				uaName: 'percbotspider',
				uaUrl: '',
				uaCompany: 'Percolate Industries, Inc.',
				uaCompanyUrl: 'http://percolate.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=percbotspider'
			}
		},
		'7155': {
			userAgent: 'Mozilla/5.0 (compatible; SWEBot/1.0; +http://swebot-crawler.net)',
			metadata: {
				uaFamily: 'SWEBot',
				uaName: 'SWEBot/1.0',
				uaUrl: 'http://swebot.net/',
				uaCompany: 'swebot.net',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SWEBot'
			}
		},
		'7159': {
			userAgent: 'Mozilla/5.0 (compatible; YandexCatalog/3.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexCatalog/3.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7160': {
			userAgent: 'Mozilla/5.0 (compatible; YandexDirect/3.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexDirect/3.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7161': {
			userAgent: 'Mozilla/5.0 (compatible; YandexImageResizer/2.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexImageResizer/2.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7162': {
			userAgent: 'Castabot/0.1 (+http://topixtream.com/)',
			metadata: {
				uaFamily: 'Castabot',
				uaName: 'Castabot/0.1',
				uaUrl: '',
				uaCompany: 'Ronan Amicel',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Castabot'
			}
		},
		'7163': {
			userAgent: 'ShowyouBot (http://showyou.com/crawler)',
			metadata: {
				uaFamily: 'ShowyouBot',
				uaName: 'ShowyouBot',
				uaUrl: '',
				uaCompany: 'Remixation, Inc',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ShowyouBot'
			}
		},
		'7164': {
			userAgent: 'Mozilla/5.0 (compatible; DCPbot/1.1; +http://domains.checkparams.com/)',
			metadata: {
				uaFamily: 'DCPbot',
				uaName: 'DCPbot/1.1',
				uaUrl: 'http://domains.checkparams.com/',
				uaCompany: 'CheckParams',
				uaCompanyUrl: 'http://checkparams.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DCPbot'
			}
		},
		'7172': {
			userAgent: 'Yandex.Server/2009.5',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'Yandex.Server/2009.5',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7173': {
			userAgent: 'Yandex.Server/2010.9',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'Yandex.Server/2010.9',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7177': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-5-amd64; java 1.6.0_18; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7178': {
			userAgent: 'Acoon v4.10.4 (www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'Acoon v4.10.4',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7211': {
			userAgent: 'Mozilla/5.0 (compatible; MetaJobBot; http://www.metajob.at/crawler)',
			metadata: {
				uaFamily: 'MetaJobBot',
				uaName: 'MetaJobBot',
				uaUrl: 'http://www.metajob.at/the/crawler',
				uaCompany: 'Dr. Manfred Schauer',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MetaJobBot'
			}
		},
		'7217': {
			userAgent: 'RADaR-Bot/Nutch-1.3 (http://radar-bot.com/)',
			metadata: {
				uaFamily: 'RADaR-Bot',
				uaName: 'RADaR-Bot',
				uaUrl: 'http://radar-bot.com/',
				uaCompany: 'Queryable Corp',
				uaCompanyUrl: 'http://www.inboxq.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=RADaR-Bot'
			}
		},
		'7225': {
			userAgent: 'Mozilla/5.0 (compatible; heritrix/3.1.1-SNAPSHOT-20120116.200628 +http://www.archive.org/details/archive.org_bot)',
			metadata: {
				uaFamily: 'heritrix',
				uaName: 'heritrix/3.1.1',
				uaUrl: 'http://www.archive.org/details/archive.org_bot',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: '',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=heritrix'
			}
		},
		'7230': {
			userAgent: 'AddThis.com robot tech.support@clearspring.com',
			metadata: {
				uaFamily: 'AddThis.com',
				uaName: 'AddThis.com robot',
				uaUrl: '',
				uaCompany: 'Clearspring Technologies, Inc.',
				uaCompanyUrl: 'http://www.clearspring.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AddThis.com'
			}
		},
		'7238': {
			userAgent: 'Mozilla/5.0 (compatible; Netseer crawler/2.0; +http://www.netseer.com/crawler.html; crawler@netseer.com)',
			metadata: {
				uaFamily: 'Netseer',
				uaName: 'Netseer crawler/2.0',
				uaUrl: 'http://www.netseer.com/crawler.html',
				uaCompany: 'NetSeer, Inc.',
				uaCompanyUrl: 'http://www.netseer.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Netseer'
			}
		},
		'7243': {
			userAgent: 'Mozilla/5.0 (compatible; EventGuruBot/1.0; +http://www.eventguru.com/spider.html)',
			metadata: {
				uaFamily: 'EventGuruBot',
				uaName: 'EventGuruBot/1.0',
				uaUrl: 'http://www.eventguru.com/spider.html',
				uaCompany: 'Matt Wells',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=EventGuruBot'
			}
		},
		'7252': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.26-2-amd64; java 1.6.0_18; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7253': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows Server 2008 6.0; java 1.7.0_03; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7258': {
			userAgent: 'SAMSUNG-SGH-E250/1.0 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Browser/6.2.3.3.c.1.101 (GUI) MMP/2.0 (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Googlebot-Mobile/2.1',
				uaUrl: 'http://googlewebmastercentral.blogspot.com/2011/12/introducing-smartphone-googlebot-mobile.html',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'7259': {
			userAgent: 'DoCoMo/2.0 N905i(c100;TB;W24H16) (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Googlebot-Mobile/2.1',
				uaUrl: 'http://googlewebmastercentral.blogspot.com/2011/12/introducing-smartphone-googlebot-mobile.html',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'7260': {
			userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_1 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8B117 Safari/6531.22.7 (compatible; Googlebot-Mobile/2.1; +http://www.google.com/bot.html)',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Googlebot-Mobile/2.1',
				uaUrl: 'http://googlewebmastercentral.blogspot.com/2011/12/introducing-smartphone-googlebot-mobile.html',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'7263': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows 7 6.1; java 1.6.0_24; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7265': {
			userAgent: 'Acoon v4.10.5 (www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'Acoon v4.10.5',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7267': {
			userAgent: 'SemrushBot/0.92',
			metadata: {
				uaFamily: 'SemrushBot',
				uaName: 'SemrushBot/0.92',
				uaUrl: 'http://www.semrush.com/bot.html',
				uaCompany: 'SEOQuake Team',
				uaCompanyUrl: 'http://www.seoquaketeam.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SemrushBot'
			}
		},
		'7278': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-custom; java 1.6.0_26; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7285': {
			userAgent: 'OpenAcoon v4.10.5 (www.openacoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'OpenAcoon v4.10.5',
				uaUrl: 'http://www.openacoon.de/',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7300': {
			userAgent: 'Mozilla/5.0 (compatible; gofind; +http://govid.mobi/bot.php)',
			metadata: {
				uaFamily: 'YioopBot',
				uaName: 'gofind',
				uaUrl: 'http://govid.mobi/bot.php',
				uaCompany: 'Chris Pollett',
				uaCompanyUrl: 'http://pollett.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YioopBot'
			}
		},
		'7303': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.1.10-hardened; java 1.7.0_03-icedtea; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7304': {
			userAgent: 'yacybot (freeworld/global; x86_64 Mac OS X 10.6.8; java 1.6.0_29; Asia/ru) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7305': {
			userAgent: 'yacybot (freeworld/global; i386 Linux 2.6.32-39-generic-pae; java 1.6.0_20; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7306': {
			userAgent: 'yacybot (freeworld/global; i386 Linux 3.0.0-17-generic-pae; java 1.6.0_23; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7307': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-5-amd64; java 1.6.0_26; Atlantic/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7308': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.0.0-17-generic; java 1.6.0_23; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7309': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.13-1-ARCH; java 1.7.0_03-icedtea; Europe/fr) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7317': {
			userAgent: 'Twikle/1.0 , http://twikle.com , contact@twikle.com',
			metadata: {
				uaFamily: 'Twikle',
				uaName: 'Twikle/1.0',
				uaUrl: '',
				uaCompany: 'NATEVIA',
				uaCompanyUrl: 'http://www.natevia.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Twikle'
			}
		},
		'7320': {
			userAgent: 'Mozilla/5.0 (compatible; aiHitBot/1.1; +http://www.aihit.com/)',
			metadata: {
				uaFamily: 'aiHitBot',
				uaName: 'aiHitBot/1.1',
				uaUrl: '',
				uaCompany: 'aiHit Ltd.',
				uaCompanyUrl: 'http://aihit.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=aiHitBot'
			}
		},
		'7321': {
			userAgent: 'AcoonBot/4.10.5 (+http://www.acoon.de)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'AcoonBot/4.10.5',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7322': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.0.0-17-generic; java 1.6.0_23; America/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7323': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-5-xen-amd64; java 1.6.0_18; Europe/fr) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7324': {
			userAgent: 'yacybot (freeworld/global; i386 Linux 3.0.0-17-generic; java 1.6.0_23; America/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7325': {
			userAgent: 'yacybot (freeworld/global; x86 Windows 7 6.1; java 1.6.0_31; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7333': {
			userAgent: 'Mozilla/5.0 (compatible; AhrefsBot/3.0; +http://ahrefs.com/robot/)',
			metadata: {
				uaFamily: 'AhrefsBot',
				uaName: 'AhrefsBot/3.0',
				uaUrl: 'http://ahrefs.com/robot/',
				uaCompany: 'Ahrefs.com',
				uaCompanyUrl: 'http://ahrefs.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AhrefsBot'
			}
		},
		'7338': {
			userAgent: 'findlinks/2.2 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.2',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'7340': {
			userAgent: 'Mozilla/5.0 (compatible; Blekkobot; ScoutJet; +http://blekko.com/about/blekkobot)',
			metadata: {
				uaFamily: 'Blekkobot',
				uaName: 'Blekkobot',
				uaUrl: 'http://blekko.com/about/blekkobot',
				uaCompany: 'Blekko Inc.',
				uaCompanyUrl: 'http://blekko.com/',
				uaIcon: 'bot_blekkobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Blekkobot'
			}
		},
		'7343': {
			userAgent: 'Mozilla/5.0 (compatible; Mail.RU/2.0)',
			metadata: {
				uaFamily: 'Mail.Ru bot',
				uaName: 'Mail.RU/2.0',
				uaUrl: 'http://go.mail.ru/help/robots',
				uaCompany: 'Mail.Ru Group',
				uaCompanyUrl: 'http://corp.mail.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Mail.Ru bot'
			}
		},
		'7347': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-40-server; java 1.6.0_20; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7348': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.1.10-1-desktop; java 1.6.0_22; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7349': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.38-14-generic; java 1.6.0_22; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7362': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.0-23-generic; java 1.6.0_24; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7363': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows 7 6.1; java 1.6.0_31; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7364': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.0-21-generic; java 1.7.0_03-icedtea; America/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7365': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.0-2-amd64; java 1.6.0_24; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7366': {
			userAgent: 'Mozilla/5.0 (compatible; AcoonBot/4.10.6; +http://www.acoon.de/robot.asp)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'AcoonBot/4.10.6',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7369': {
			userAgent: 'Mozilla/5.0 (compatible; CareerBot/1.1; +http://www.career-x.de/bot.html)',
			metadata: {
				uaFamily: 'CareerBot',
				uaName: 'CareerBot/1.1',
				uaUrl: 'http://www.career-x.de/bot.html',
				uaCompany: 'career-x GmbH',
				uaCompanyUrl: 'http://www.career-x.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CareerBot'
			}
		},
		'7373': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-40-generic; java 1.6.0_20; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7374': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows Server 2008 R2 6.1; java 1.6.0_31; America/pt) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7375': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.4.3; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.4.3',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'7380': {
			userAgent: 'Mozilla/5.0 (compatible; HomeTags/1.0; +http://www.hometags.nl/bot)',
			metadata: {
				uaFamily: 'HomeTags',
				uaName: 'HomeTags/1.0',
				uaUrl: 'http://www.hometags.nl/bot',
				uaCompany: 'HomeTags.nl',
				uaCompanyUrl: 'http://www.hometags.nl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HomeTags'
			}
		},
		'7381': {
			userAgent: 'Y!J-BRJ/YATS crawler (http://listing.yahoo.co.jp/support/faq/int/other/other_001.html)',
			metadata: {
				uaFamily: 'Yahoo! JAPAN',
				uaName: 'Y!J-BRJ/YATS',
				uaUrl: 'http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html',
				uaCompany: 'Yahoo! Inc',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'bot_yahoo!slurp.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo! JAPAN'
			}
		},
		'7384': {
			userAgent: 'Mozilla/5.0 (compatible; UnisterBot; crawler@unister.de)',
			metadata: {
				uaFamily: 'UnisterBot',
				uaName: 'UnisterBot',
				uaUrl: '',
				uaCompany: 'Unister Holding GmbH',
				uaCompanyUrl: 'http://www.unister.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=UnisterBot'
			}
		},
		'7387': {
			userAgent: 'findlinks/2.0.5 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.0.5',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'7399': {
			userAgent: 'findlinks/2.5 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.5',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'7402': {
			userAgent: 'KeywordDensityRobot/0.8 (http://www.seocentro.com/tools/search-engines/keyword-density.html)',
			metadata: {
				uaFamily: 'KeywordDensityRobot',
				uaName: 'KeywordDensityRobot/0.8',
				uaUrl: 'http://www.seocentro.com/tools/seo/keyword-density.html',
				uaCompany: 'SeoCentro',
				uaCompanyUrl: 'http://www.seocentro.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=KeywordDensityRobot'
			}
		},
		'7404': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.38-8-generic; java 1.6.0_22; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7405': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.1.10-1.9-default; java 1.6.0_24; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7406': {
			userAgent: 'Mozilla/5.0 (compatible; MSIE or Firefox mutant; not on Windows server; + http://tab.search.daum.net/aboutWebSearch.html) Daumoa/3.0',
			metadata: {
				uaFamily: 'Daumoa',
				uaName: 'Daumoa/3.0',
				uaUrl: 'http://tab.search.daum.net/aboutWebSearch_en.html',
				uaCompany: 'Daum Communications Corp.',
				uaCompanyUrl: 'http://info.daum.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Daumoa'
			}
		},
		'7409': {
			userAgent: 'Mozilla/5.0 (compatible; AcoonBot/4.10.7; +http://www.acoon.de/robot.asp)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'AcoonBot/4.10.7',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7411': {
			userAgent: 'coccoc',
			metadata: {
				uaFamily: 'coccoc',
				uaName: 'coccoc',
				uaUrl: 'http://help.coccoc.com/',
				uaCompany: 'Coc Coc',
				uaCompanyUrl: 'http://coccoc.vn/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=coccoc'
			}
		},
		'7414': {
			userAgent: 'Influencebot/0.9; (Automatic classification of websites; http://www.influencebox.com/; info@influencebox.com)',
			metadata: {
				uaFamily: 'Influencebot',
				uaName: 'Influencebot/0.9',
				uaUrl: 'http://www.influencebox.com/',
				uaCompany: 'Frank',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Influencebot'
			}
		},
		'7420': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-5-amd64; java 1.6.0_18; US/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7421': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows Server 2008 R2 6.1; java 1.6.0_29; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7422': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows 7 6.1; java 1.6.0_31; America/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7423': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.3.4-1-ARCH; java 1.6.0_24; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7424': {
			userAgent: 'RyzeCrawler/1.1.1 ( http://www.domain2day.nl/crawler/)',
			metadata: {
				uaFamily: 'RyzeCrawler',
				uaName: 'RyzeCrawler/1.1.1',
				uaUrl: 'http://www.domain2day.nl/crawler/',
				uaCompany: 'Domain2day',
				uaCompanyUrl: 'http://www.domain2day.nl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=RyzeCrawler'
			}
		},
		'7426': {
			userAgent: 'Mozilla/5.0 (compatible; YandexFavicons/1.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexFavicons/1.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7427': {
			userAgent: 'Mozilla/5.0 (compatible; YandexAntivirus/2.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexAntivirus/2.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7428': {
			userAgent: 'Mozilla/5.0 (compatible; YandexVideo/3.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexVideo/3.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7429': {
			userAgent: 'Mozilla/5.0 (compatible; YandexMedia/3.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexMedia/3.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7430': {
			userAgent: 'Mozilla/5.0 (compatible; YandexBlogs/0.99; robot; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexBlogs/0.99',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7433': {
			userAgent: 'Mozilla/5.0 (compatible; YandexZakladki/3.0; +http://yandex.com/bots)',
			metadata: {
				uaFamily: 'YandexBot',
				uaName: 'YandexZakladki/3.0',
				uaUrl: 'http://yandex.com/bots',
				uaCompany: 'Yandex LLC',
				uaCompanyUrl: 'http://company.yandex.com/',
				uaIcon: 'bot_Yandex.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YandexBot'
			}
		},
		'7437': {
			userAgent: 'Mozilla/5.0 (compatible; PaperLiBot/2.1; http://support.paper.li/entries/20023257-what-is-paper-li)',
			metadata: {
				uaFamily: 'PaperLiBot',
				uaName: 'PaperLiBot/2.1',
				uaUrl: 'http://support.paper.li/entries/20023257-what-is-paper-li',
				uaCompany: 'Paper.li',
				uaCompanyUrl: 'http://paper.li/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=PaperLiBot'
			}
		},
		'7438': {
			userAgent: 'WeSEE:Search/0.1 (Alpha, http://www.wesee.com/en/support/bot/)',
			metadata: {
				uaFamily: 'WeSEE:Search',
				uaName: 'WeSEE:Search/0.1 (Alpha)',
				uaUrl: 'http://www.wesee.com/en/support/bot/',
				uaCompany: 'WeSEE Ltd',
				uaCompanyUrl: 'http://www.wesee.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WeSEE:Search'
			}
		},
		'7442': {
			userAgent: 'Mozilla/5.0 (compatible; bnf.fr_bot; +http://www.bnf.fr/fr/outils/a.dl_web_capture_robot.html)',
			metadata: {
				uaFamily: 'bnf.fr_bot',
				uaName: 'bnf.fr_bot',
				uaUrl: 'http://www.bnf.fr/fr/outils/a.dl_web_capture_robot.html',
				uaCompany: 'Bibliothe`que nationale de France',
				uaCompanyUrl: 'http://www.bnf.fr/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bnf.fr_bot'
			}
		},
		'7458': {
			userAgent: 'Mozilla/5.0 (compatible; AcoonBot/4.10.8; +http://www.acoon.de/robot.asp)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'AcoonBot/4.10.8',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7462': {
			userAgent: 'Mozilla/5.0 (compatible; aiHitBot-BP/1.1; +http://www.aihit.com/)',
			metadata: {
				uaFamily: 'aiHitBot',
				uaName: 'aiHitBot-BP/1.1',
				uaUrl: '',
				uaCompany: 'aiHit Ltd',
				uaCompanyUrl: 'http://aihit.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=aiHitBot'
			}
		},
		'7467': {
			userAgent: 'findlinks/2.6 (+http://wortschatz.uni-leipzig.de/findlinks/)',
			metadata: {
				uaFamily: 'findlinks',
				uaName: 'findlinks/2.6',
				uaUrl: 'http://wortschatz.uni-leipzig.de/findlinks/',
				uaCompany: 'Universit\xe4t Leipzig',
				uaCompanyUrl: 'http://www.uni-leipzig.de/',
				uaIcon: 'bot_findlinks.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=findlinks'
			}
		},
		'7469': {
			userAgent: 'Mozilla/5.0 (compatible; UptimeRobot/1.0; http://www.uptimerobot.com/)',
			metadata: {
				uaFamily: 'UptimeRobot',
				uaName: 'UptimeRobot/1.0',
				uaUrl: 'http://www.uptimerobot.com/',
				uaCompany: 'Umut Muhaddisoglu, Daniel Rimille',
				uaCompanyUrl: 'http://www.webresourcesdepot.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=UptimeRobot'
			}
		},
		'7477': {
			userAgent: 'Mozilla/5.0 (compatible; AcoonBot/4.11.0; +http://www.acoon.de/robot.asp)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'AcoonBot/4.11.0',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7494': {
			userAgent: 'Mozilla/5.0 (compatible; Finderbots finder bot; +http://wiki.github.com/bixo/bixo/bixocrawler; bixo-dev@yahoogroups.com)',
			metadata: {
				uaFamily: 'bixocrawler',
				uaName: 'bixo',
				uaUrl: 'http://wiki.github.com/bixo/bixo/bixocrawler',
				uaCompany: 'Bixo Labs',
				uaCompanyUrl: 'http://openbixo.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bixocrawler'
			}
		},
		'7510': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-41-server; java 1.6.0_26; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7511': {
			userAgent: 'yacybot (freeworld/global; i386 Linux 3.2.0-23-generic-pae; java 1.7.0_03; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7512': {
			userAgent: 'yacybot (freeworld/global; x86 Windows 2003 5.2; java 1.6.0_32; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7513': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.0-24-generic; java 1.6.0_24; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7525': {
			userAgent: 'MIA DEV/search:robot/0.0.1 (This is the MIA Bot - crawling for mia research project. If you feel unhappy and do not want to be visited by our crawler send an email to spider@neofonie.de; http://spider.neofonie.de; spider@neofonie.de)',
			metadata: {
				uaFamily: 'MIA Bot',
				uaName: 'MIA Bot',
				uaUrl: 'http://spider.neofonie.de',
				uaCompany: 'Neofonie GmbH',
				uaCompanyUrl: 'http://www.neofonie.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MIA Bot'
			}
		},
		'7542': {
			userAgent: 'infohelfer/1.1.0 (http://www.infohelfer.de/)',
			metadata: {
				uaFamily: 'Infohelfer',
				uaName: 'Infohelfer/1.0',
				uaUrl: 'http://www.infohelfer.de/crawler.php',
				uaCompany: 'ITam GmbH',
				uaCompanyUrl: 'http://www.itam-gmbh.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Infohelfer'
			}
		},
		'7544': {
			userAgent: 'Mozilla/5.0 (compatible; AcoonBot/4.11.1; +http://www.acoon.de/robot.asp)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'AcoonBot/4.11.1',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: 'http://www.acoon.de/',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'7548': {
			userAgent: 'coccoc/1.0 ()',
			metadata: {
				uaFamily: 'coccoc',
				uaName: 'coccoc/1.0',
				uaUrl: 'http://help.coccoc.com/',
				uaCompany: 'Coc Coc',
				uaCompanyUrl: 'http://coccoc.vn/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=coccoc'
			}
		},
		'7563': {
			userAgent: 'Mozilla/5.0 (compatible; OpenindexSpider/Nutch-1.5-dev; +http://www.openindex.io/en/webmasters/spider.html)',
			metadata: {
				uaFamily: 'OpenindexSpider',
				uaName: 'OpenindexSpider',
				uaUrl: 'http://www.openindex.io/en/webmasters/spider.html',
				uaCompany: 'Openindex B.V.',
				uaCompanyUrl: 'http://www.openindex.io/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OpenindexSpider'
			}
		},
		'7577': {
			userAgent: 'wsAnalyzer/1.0; ++http://www.wsanalyzer.com/bot.html',
			metadata: {
				uaFamily: 'wsAnalyzer',
				uaName: 'wsAnalyzer/1.0',
				uaUrl: 'http://www.wsanalyzer.com/bot.html',
				uaCompany: 'wsAnalyzer.com',
				uaCompanyUrl: 'http://www.wsanalyzer.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=wsAnalyzer'
			}
		},
		'7579': {
			userAgent: 'Mozilla/5.0 (compatible; AhrefsBot/3.1; +http://ahrefs.com/robot/)',
			metadata: {
				uaFamily: 'AhrefsBot',
				uaName: 'AhrefsBot/3.1',
				uaUrl: 'http://ahrefs.com/robot/',
				uaCompany: 'Ahrefs.com',
				uaCompanyUrl: 'http://ahrefs.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AhrefsBot'
			}
		},
		'7596': {
			userAgent: 'Wotbox/2.01 (+http://www.wotbox.com/bot/)',
			metadata: {
				uaFamily: 'Wotbox',
				uaName: 'Wotbox/2.01',
				uaUrl: 'http://www.wotbox.com/bot/',
				uaCompany: 'Wotbox Team',
				uaCompanyUrl: 'http://www.wotbox.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Wotbox'
			}
		},
		'7605': {
			userAgent: 'Mozilla/5.0 (compatible; ProCogBot/1.0; +http://www.procog.com/spider.html)',
			metadata: {
				uaFamily: 'ProCogBot',
				uaName: 'ProCogBot/1.0',
				uaUrl: 'http://www.procog.com/spider.html',
				uaCompany: 'ProCog.com',
				uaCompanyUrl: 'http://www.procog.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ProCogBot'
			}
		},
		'7606': {
			userAgent: 'Mozilla/5.0 (compatible; OpenindexSpider; +http://www.openindex.io/en/webmasters/spider.html)',
			metadata: {
				uaFamily: 'OpenindexSpider',
				uaName: 'OpenindexSpider',
				uaUrl: 'http://www.openindex.io/en/webmasters/spider.html',
				uaCompany: 'Openindex B.V.',
				uaCompanyUrl: 'http://www.openindex.io/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OpenindexSpider'
			}
		},
		'7622': {
			userAgent: 'Woko 3.0',
			metadata: {
				uaFamily: 'Woko',
				uaName: 'Woko 3.0',
				uaUrl: 'http://www.woko.cz/akce.phtml?ukaz=osluzbe',
				uaCompany: 'Internet Info, s.r.o.',
				uaCompanyUrl: 'http://www.iinfo.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Woko'
			}
		},
		'7624': {
			userAgent: 'EasyBib AutoCite (http://content.easybib.com/autocite/)',
			metadata: {
				uaFamily: 'EasyBib AutoCite',
				uaName: 'EasyBib AutoCite',
				uaUrl: 'http://content.easybib.com/autocite/',
				uaCompany: 'ImagineEasy Solutions.',
				uaCompanyUrl: 'http://www.imagineeasy.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=EasyBib AutoCite'
			}
		},
		'7625': {
			userAgent: 'Mozilla/5.0 (compatible;  Page2RSS/0.7; +http://page2rss.com/)',
			metadata: {
				uaFamily: 'Page2RSS',
				uaName: 'Page2RSS/0.7',
				uaUrl: '',
				uaCompany: 'Page Two Technologies LLC',
				uaCompanyUrl: 'http://page2rss.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Page2RSS'
			}
		},
		'7628': {
			userAgent: 'Woko robot 3.0',
			metadata: {
				uaFamily: 'Woko',
				uaName: 'Woko robot 3.0',
				uaUrl: 'http://www.woko.cz/akce.phtml?ukaz=osluzbe',
				uaCompany: 'Internet Info, s.r.o.',
				uaCompanyUrl: 'http://www.iinfo.cz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Woko'
			}
		},
		'7632': {
			userAgent: 'Mozilla/5.0 (compatible; Infohelfer/1.2.0; +http://www.infohelfer.de/crawler.php)',
			metadata: {
				uaFamily: 'Infohelfer',
				uaName: 'Infohelfer/1.2.0',
				uaUrl: 'http://www.infohelfer.de/crawler.php',
				uaCompany: 'ITam GmbH',
				uaCompanyUrl: 'http://www.itam-gmbh.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Infohelfer'
			}
		},
		'7634': {
			userAgent: 'Mozilla/5.0 (compatible; WebNL; +http://www.web.nl/webmasters/spider.html; helpdesk@web.nl)',
			metadata: {
				uaFamily: 'WebNL',
				uaName: 'WebNL',
				uaUrl: 'http://www.web.nl/webmasters/spider.html',
				uaCompany: 'CRIO B.V.',
				uaCompanyUrl: 'http://www.crio.nl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebNL'
			}
		},
		'7651': {
			userAgent: 'Y!J-BSC/1.0 crawler (http://help.yahoo.co.jp/help/jp/blog-search/)',
			metadata: {
				uaFamily: 'Yahoo! JAPAN',
				uaName: 'Y!J-BSC/1.0',
				uaUrl: 'http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html',
				uaCompany: 'Yahoo Japan Corporation',
				uaCompanyUrl: 'http://www.yahoo.co.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo! JAPAN'
			}
		},
		'7655': {
			userAgent: 'Mozilla/5.0 (compatible; proximic; +http://www.proximic.com/info/spider.php)',
			metadata: {
				uaFamily: 'proximic',
				uaName: 'proximic',
				uaUrl: 'http://www.proximic.com/info/spider.php',
				uaCompany: 'Proximic, Inc.',
				uaCompanyUrl: 'http://www.proximic.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=proximic'
			}
		},
		'7671': {
			userAgent: 'Sogou Web Spider',
			metadata: {
				uaFamily: 'sogou spider',
				uaName: 'Sogou web spider',
				uaUrl: 'http://www.sogou.com/docs/help/webmasters.htm#07',
				uaCompany: 'SOGOU.COM',
				uaCompanyUrl: 'http://www.sogou.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sogou spider'
			}
		},
		'7675': {
			userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-GB; rv:1.0; trendictionbot0.5.0; trendiction search; http://www.trendiction.de/bot; please let us know of any problems; web at trendiction.com) Gecko/20071127 Firefox/3.0.0.11',
			metadata: {
				uaFamily: 'trendictionbot ',
				uaName: 'trendictionbot0.5.0',
				uaUrl: 'http://www.trendiction.de/bot',
				uaCompany: 'Trendiction S.A.',
				uaCompanyUrl: 'http://www.trendiction.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=trendictionbot '
			}
		},
		'7676': {
			userAgent: 'ichiro/3.0 (http://search.goo.ne.jp/option/use/sub4/sub4-1/)',
			metadata: {
				uaFamily: 'ichiro',
				uaName: 'ichiro/3.0',
				uaUrl: 'http://search.goo.ne.jp/option/use/sub4/sub4-1/',
				uaCompany: 'NTT-Resonant Inc.',
				uaCompanyUrl: 'http://www.nttr.co.jp/',
				uaIcon: 'bot_ichiro.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ichiro'
			}
		},
		'7696': {
			userAgent: 'bot-pge.chlooe.com/1.0.0 (+http://www.chlooe.com/)',
			metadata: {
				uaFamily: 'bot-pge.chlooe.com',
				uaName: 'bot-pge.chlooe.com/1.0.0',
				uaUrl: 'http://bot-pge.chlooe.com/',
				uaCompany: 'Chlooe.com',
				uaCompanyUrl: 'http://www.chlooe.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bot-pge.chlooe.com'
			}
		},
		'7697': {
			userAgent: 'Mozilla/5.0(compatible; Sosospider/2.0; +http://help.soso.com/webspider.htm)',
			metadata: {
				uaFamily: 'Sosospider',
				uaName: 'Sosospider/2.0',
				uaUrl: 'http://help.soso.com/webspider.htm',
				uaCompany: 'Tencent, Inc.',
				uaCompanyUrl: 'http://www.tencent.com/',
				uaIcon: 'bot_soso.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Sosospider'
			}
		},
		'7717': {
			userAgent: 'Mozilla/5.0 (compatible; GrapeshotCrawler/2.0; +http://www.grapeshot.co.uk/crawler.php)',
			metadata: {
				uaFamily: 'GrapeshotCrawler',
				uaName: 'GrapeshotCrawler/2.0',
				uaUrl: 'http://www.grapeshot.co.uk/crawler.php',
				uaCompany: 'Grapeshot Limited',
				uaCompanyUrl: 'http://www.grapeshot.co.uk/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=GrapeshotCrawler'
			}
		},
		'7718': {
			userAgent: 'Mozilla/5.0 (compatible; grapeFX/0.9; crawler@grapeshot.co.uk',
			metadata: {
				uaFamily: 'GrapeshotCrawler',
				uaName: 'grapeFX/0.9',
				uaUrl: 'http://www.grapeshot.co.uk/crawler.php',
				uaCompany: 'Grapeshot Limited',
				uaCompanyUrl: 'http://www.grapeshot.co.uk/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=GrapeshotCrawler'
			}
		},
		'7726': {
			userAgent: 'Mozilla/5.0 (compatible; Infohelfer/1.3.0; +http://www.infohelfer.de/crawler.php)',
			metadata: {
				uaFamily: 'Infohelfer',
				uaName: 'Infohelfer/1.3.0',
				uaUrl: 'http://www.infohelfer.de/crawler.php',
				uaCompany: 'ITam GmbH',
				uaCompanyUrl: 'http://www.itam-gmbh.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Infohelfer'
			}
		},
		'7727': {
			userAgent: 'coccoc/1.0 (http://help.coccoc.vn/)',
			metadata: {
				uaFamily: 'coccoc',
				uaName: 'coccoc/1.0',
				uaUrl: 'http://help.coccoc.com/',
				uaCompany: 'Coc Coc',
				uaCompanyUrl: 'http://coccoc.vn/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=coccoc'
			}
		},
		'7729': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows 7 6.1; java 1.6.0_25; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'7732': {
			userAgent: 'Bad-Neighborhood Link Analyzer (http://www.bad-neighborhood.com/)',
			metadata: {
				uaFamily: 'Bad-Neighborhood',
				uaName: 'Bad-Neighborhood Link Analyzer',
				uaUrl: 'http://www.bad-neighborhood.com/text-link-tool.htm',
				uaCompany: 'Michael VanDeMar',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Bad-Neighborhood'
			}
		},
		'7733': {
			userAgent: 'Bad Neighborhood Header Detector (http://www.bad-neighborhood.com/header_detector.php)',
			metadata: {
				uaFamily: 'Bad-Neighborhood',
				uaName: 'Bad Neighborhood Header Detector',
				uaUrl: 'http://www.bad-neighborhood.com/header_detector.php',
				uaCompany: 'Michael VanDeMar',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Bad-Neighborhood'
			}
		},
		'7747': {
			userAgent: 'Whoismindbot/1.0 (+http://www.whoismind.com/bot.html)',
			metadata: {
				uaFamily: 'Whoismindbot',
				uaName: 'Whoismindbot/1.0',
				uaUrl: 'http://www.whoismind.com/bot.html',
				uaCompany: 'WhoisMind',
				uaCompanyUrl: 'http://www.whoismind.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Whoismindbot'
			}
		},
		'7748': {
			userAgent: 'webinatorbot 1.0; +http://www.webinator.de',
			metadata: {
				uaFamily: 'webinatorbot',
				uaName: 'webinatorbot 1.0',
				uaUrl: '',
				uaCompany: 'HighSignal UG',
				uaCompanyUrl: 'http://www.highsignal.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=webinatorbot'
			}
		},
		'7754': {
			userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm',
			metadata: {
				uaFamily: 'bingbot',
				uaName: 'bingbot/2.0',
				uaUrl: 'http://www.bing.com/webmaster/help/which-crawlers-does-bing-use-8c184ec0',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bingbot'
			}
		},
		'7757': {
			userAgent: 'search.KumKie.com',
			metadata: {
				uaFamily: 'search.KumKie.com',
				uaName: 'search.KumKie.com',
				uaUrl: '',
				uaCompany: 'Gifts Next Day',
				uaCompanyUrl: 'http://giftsnextday.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=search.KumKie.com'
			}
		},
		'7764': {
			userAgent: 'Mozilla/5.0 (compatible; DripfeedBot/2.0; +http://dripfeedbookmark.com/bot.html',
			metadata: {
				uaFamily: 'DripfeedBot',
				uaName: 'DripfeedBot/2.0',
				uaUrl: 'http://dripfeedbookmark.com/bot.html',
				uaCompany: 'dripfeedbookmark.com',
				uaCompanyUrl: 'http://dripfeedbookmark.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=DripfeedBot'
			}
		},
		'7776': {
			userAgent: 'Mozilla/5.0 (compatible; SemrushBot/0.95; +http://www.semrush.com/bot.html)',
			metadata: {
				uaFamily: 'SemrushBot',
				uaName: 'SemrushBot/0.95',
				uaUrl: 'http://www.semrush.com/bot.html',
				uaCompany: 'SEOQuake Team',
				uaCompanyUrl: 'http://www.seoquaketeam.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SemrushBot'
			}
		},
		'7780': {
			userAgent: 'ZumBot/1.0 (ZUM Search; http://help.zum.com/inquiry)',
			metadata: {
				uaFamily: 'ZumBot',
				uaName: 'ZumBot/1.0',
				uaUrl: 'http://help.zum.com/inquiry',
				uaCompany: 'ZUMinternet Corp',
				uaCompanyUrl: 'http://www.zuminternet.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ZumBot'
			}
		},
		'7784': {
			userAgent: 'Pixray-Seeker/2.0 (Pixray-Seeker; http://www.pixray.com/pixraybot; crawler@pixray.com)',
			metadata: {
				uaFamily: 'Pixray-Seeker',
				uaName: 'Pixray-Seeker/2.0',
				uaUrl: 'http://www.pixray.com/pixraybot',
				uaCompany: 'PIXRAY GmbH.',
				uaCompanyUrl: 'http://www.pixray.com/',
				uaIcon: 'bot_PixraySeeker.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Pixray-Seeker'
			}
		},
		'7790': {
			userAgent: 'Mozilla/5.0 (compatible; discoverybot/2.0; +http://discoveryengine.com/discoverybot.html)',
			metadata: {
				uaFamily: 'discoverybot',
				uaName: 'discoverybot/2.0',
				uaUrl: 'http://discoveryengine.com/discoverybot.html',
				uaCompany: 'discoveryengine.com.',
				uaCompanyUrl: 'http://www.discoveryengine.com/',
				uaIcon: 'bot_discobot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=discoverybot'
			}
		},
		'7799': {
			userAgent: 'rogerbot/1.0 (http://www.seomoz.org/dp/rogerbot, rogerbot-crawler@seomoz.org)',
			metadata: {
				uaFamily: 'rogerbot',
				uaName: 'rogerbot/1.0',
				uaUrl: 'http://moz.com/help/pro/what-is-rogerbot-',
				uaCompany: 'SEOmoz, Inc.',
				uaCompanyUrl: 'http://moz.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=rogerbot'
			}
		},
		'7816': {
			userAgent: 'Mozilla/5.0 (compatible; Plukkie/1.5; http://www.botje.com/plukkie.htm)',
			metadata: {
				uaFamily: 'Plukkie',
				uaName: 'Plukkie/1.3',
				uaUrl: 'http://www.botje.com/plukkie.htm',
				uaCompany: 'botje.com',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Plukkie'
			}
		},
		'7819': {
			userAgent: 'www.integromedb.org/Crawler',
			metadata: {
				uaFamily: 'IntegromeDB',
				uaName: 'IntegromeDB',
				uaUrl: 'http://www.integromedb.org/Crawler',
				uaCompany: 'BiologicalNetworks',
				uaCompanyUrl: 'http://www.biologicalnetworks.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IntegromeDB'
			}
		},
		'7832': {
			userAgent: 'drupact/0.7; http://www.arocom.de/drupact',
			metadata: {
				uaFamily: 'drupact',
				uaName: 'drupact/0.7',
				uaUrl: 'http://www.arocom.de/drupact',
				uaCompany: 'arocom GmbH',
				uaCompanyUrl: 'http://www.arocom.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=drupact'
			}
		},
		'7833': {
			userAgent: 'peerindex/0.1 (http://www.peerindex.com/; crawler AT peerindex DOT com)',
			metadata: {
				uaFamily: 'peerindex',
				uaName: 'peerindex/0.1',
				uaUrl: '',
				uaCompany: 'PeerIndex',
				uaCompanyUrl: 'http://www.peerindex.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=peerindex'
			}
		},
		'7841': {
			userAgent: 'WillyBot/1.1 (http://www.willyfogg.com/info/willybot)',
			metadata: {
				uaFamily: 'WillyBot',
				uaName: 'WillyBot/1.1',
				uaUrl: 'http://willyfogg.com/info/willybot',
				uaCompany: 'WillyFogg.com ',
				uaCompanyUrl: 'http://willyfogg.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WillyBot'
			}
		},
		'7843': {
			userAgent: 'Mozilla/5.0 (compatible; AhrefsBot/4.0; +http://ahrefs.com/robot/)',
			metadata: {
				uaFamily: 'AhrefsBot',
				uaName: 'AhrefsBot/4.0',
				uaUrl: 'http://ahrefs.com/robot/',
				uaCompany: 'Ahrefs.com',
				uaCompanyUrl: 'http://ahrefs.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AhrefsBot'
			}
		},
		'7854': {
			userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.21 (KHTML, like Gecko) Chrome/19.0.1042.0 Safari/535.21 PagePeeker/2.1; +http://pagepeeker.com/robots/',
			metadata: {
				uaFamily: 'PagePeeker',
				uaName: 'PagePeeker/2.1',
				uaUrl: 'http://pagepeeker.com/robots',
				uaCompany: 'PagePeeker.com',
				uaCompanyUrl: 'http://pagepeeker.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=PagePeeker'
			}
		},
		'7856': {
			userAgent: 'netEstate NE Crawler (+http://www.website-datenbank.de/)',
			metadata: {
				uaFamily: 'netEstate Crawler',
				uaName: 'netEstate NE Crawler',
				uaUrl: '',
				uaCompany: 'netEstate GmbH',
				uaCompanyUrl: 'http://www.netestate.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=netEstate Crawler'
			}
		},
		'7888': {
			userAgent: 'MeMoNewsBot/2.0 (http://www.memonews.com/en/crawler)',
			metadata: {
				uaFamily: 'MeMoNewsBot',
				uaName: 'MeMoNewsBot/2.0',
				uaUrl: 'http://www.memonews.com/en/crawler',
				uaCompany: 'MeMo News AG',
				uaCompanyUrl: 'http://www.memonews.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MeMoNewsBot'
			}
		},
		'7889': {
			userAgent: 'Mozilla/5.0 (compatible; pmoz.info ODP link checker; +http://pmoz.info/doc/botinfo.htm)',
			metadata: {
				uaFamily: 'pmoz.info ODP link checker',
				uaName: 'pmoz.info ODP link checker',
				uaUrl: 'http://pmoz.info/doc/botinfo.htm',
				uaCompany: 'PlantRob',
				uaCompanyUrl: 'http://www.robsplants.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=pmoz.info ODP link checker'
			}
		},
		'7912': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/3.1; +http://www.seoprofiler.com/bot )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/3.1',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'7927': {
			userAgent: 'Mozilla/5.0 (compatible; CompSpyBot/1.0; +http://www.compspy.com/spider.html)',
			metadata: {
				uaFamily: 'CompSpyBot',
				uaName: 'CompSpyBot/1.0',
				uaUrl: 'http://www.compspy.com/spider.html',
				uaCompany: 'compspy.com',
				uaCompanyUrl: 'http://www.compspy.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CompSpyBot'
			}
		},
		'7959': {
			userAgent: 'Mozilla/5.0 (compatible; Peepowbot/1.0; +http://www.peepow.com/bot.php)',
			metadata: {
				uaFamily: 'Peepowbot',
				uaName: 'Peepowbot/1.0',
				uaUrl: 'http://www.peepow.com/bot.php',
				uaCompany: 'peepow.com',
				uaCompanyUrl: 'http://peepow.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Peepowbot'
			}
		},
		'7975': {
			userAgent: 'HubSpot Connect 1.0 (http://dev.hubspot.com/)',
			metadata: {
				uaFamily: 'HubSpot Connect',
				uaName: 'HubSpot Connect 1.0',
				uaUrl: '',
				uaCompany: 'HubSpot Inc.',
				uaCompanyUrl: 'http://www.hubspot.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HubSpot Connect'
			}
		},
		'7984': {
			userAgent: 'Mozilla/5.0 (compatible; Mail.RU_Bot/2.0)',
			metadata: {
				uaFamily: 'Mail.Ru bot',
				uaName: 'Mail.RU_Bot/2.0',
				uaUrl: 'http://go.mail.ru/help/robots',
				uaCompany: 'Mail.Ru Group',
				uaCompanyUrl: 'http://corp.mail.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Mail.Ru bot'
			}
		},
		'7995': {
			userAgent: 'Mozilla/5.0 (compatible; IstellaBot/1.10.2 +http://www.tiscali.it/)',
			metadata: {
				uaFamily: 'IstellaBot',
				uaName: 'IstellaBot/1.10.2',
				uaUrl: '',
				uaCompany: 'Tiscali Italia S.p.a',
				uaCompanyUrl: 'http://www.tiscali.it/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=IstellaBot'
			}
		},
		'8061': {
			userAgent: 'Pixray-Seeker/2.0 (http://www.pixray.com/pixraybot; crawler@pixray.com)',
			metadata: {
				uaFamily: 'Pixray-Seeker',
				uaName: 'Pixray-Seeker/2.0',
				uaUrl: 'http://www.pixray.com/pixraybot',
				uaCompany: 'PIXRAY GmbH.',
				uaCompanyUrl: 'http://www.pixray.com/',
				uaIcon: 'bot_PixraySeeker.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Pixray-Seeker'
			}
		},
		'8066': {
			userAgent: 'Mozilla/5.0 (compatible; SearchmetricsBot; http://www.searchmetrics.com/en/searchmetrics-bot/)',
			metadata: {
				uaFamily: 'SearchmetricsBot',
				uaName: 'SearchmetricsBot',
				uaUrl: 'http://www.searchmetrics.com/en/searchmetrics-bot/',
				uaCompany: 'Searchmetrics GmbH',
				uaCompanyUrl: 'http://www.searchmetrics.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SearchmetricsBot'
			}
		},
		'8083': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.0-3-amd64; java 1.6.0_24; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'8096': {
			userAgent: 'Mozilla/5.0 (compatible; Genieo/1.0 http://www.genieo.com/webfilter.html)',
			metadata: {
				uaFamily: 'Genieo Web filter',
				uaName: 'Genieo/1.0',
				uaUrl: 'http://www.genieo.com/webfilter.html',
				uaCompany: 'Genieo',
				uaCompanyUrl: 'http://www.genieo.com',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Genieo Web filter'
			}
		},
		'8107': {
			userAgent: 'yacybot (freeworld/global; i386 Linux 2.6.32-5-686; java 1.6.0_18; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'8114': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows 7 6.1; java 1.6.0_23; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'8131': {
			userAgent: 'facebookplatform/1.0 (+http://developers.facebook.com)',
			metadata: {
				uaFamily: 'facebookplatform',
				uaName: 'facebookplatform/1.0',
				uaUrl: 'http://en.wikipedia.org/wiki/Facebook_Platform',
				uaCompany: 'Facebook',
				uaCompanyUrl: 'http://www.facebook.com/',
				uaIcon: 'bot_facebook.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=facebookplatform'
			}
		},
		'8134': {
			userAgent: 'Mozilla/5.0 (compatible; Infohelfer/1.3.3; +http://www.infohelfer.de/crawler.php)',
			metadata: {
				uaFamily: 'Infohelfer',
				uaName: 'Infohelfer/1.3.3',
				uaUrl: 'http://www.infohelfer.de/crawler.php',
				uaCompany: 'ITam GmbH',
				uaCompanyUrl: 'http://www.itam-gmbh.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Infohelfer'
			}
		},
		'8138': {
			userAgent: 'Mozilla/5.0 (compatible; HomeTags/1.0;  http://www.hometags.nl/bot)',
			metadata: {
				uaFamily: 'HomeTags',
				uaName: 'HomeTags/1.0',
				uaUrl: 'http://www.hometags.nl/bot',
				uaCompany: 'HomeTags.nl',
				uaCompanyUrl: 'http://www.hometags.nl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HomeTags'
			}
		},
		'8170': {
			userAgent: 'Mozilla/5.0 (compatible; Qseero; +http://www.q0.com)',
			metadata: {
				uaFamily: 'Qseero',
				uaName: 'Qseero',
				uaUrl: '',
				uaCompany: 'Qseero, Inc.',
				uaCompanyUrl: 'http://q0.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Qseero'
			}
		},
		'8179': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.0-32-generic; java 1.6.0_24; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'8184': {
			userAgent: 'Mozilla/5.0 (compatible; Esribot/1.0; http://www.esrihu.hu/)',
			metadata: {
				uaFamily: 'Esribot',
				uaName: 'Esribot/1.0',
				uaUrl: '',
				uaCompany: 'ESRI Magyarorsz\xe1g Kft.',
				uaCompanyUrl: 'http://www.esrihu.hu/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Esribot'
			}
		},
		'8191': {
			userAgent: 'wscheck.com/1.0.0 (+http://wscheck.com/)',
			metadata: {
				uaFamily: 'wscheck.com',
				uaName: 'wscheck.com/1.0.0',
				uaUrl: '',
				uaCompany: 'AsiaWS',
				uaCompanyUrl: 'http://asiaws.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=wscheck.com'
			}
		},
		'8192': {
			userAgent: 'bot.wsowner.com/1.0.0 (+http://wsowner.com/)',
			metadata: {
				uaFamily: 'bot.wsowner.com',
				uaName: 'bot.wsowner.com/1.0.0',
				uaUrl: '',
				uaCompany: 'AsiaWS',
				uaCompanyUrl: 'http://asiaws.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bot.wsowner.com'
			}
		},
		'8208': {
			userAgent: 'Yepi/1.0 (NHN Corp.; http://help.naver.com/robots/)',
			metadata: {
				uaFamily: 'NaverBot',
				uaName: 'Yepi/1.0',
				uaUrl: 'http://help.naver.com/robots/',
				uaCompany: 'NHN Corporation',
				uaCompanyUrl: 'http://www.nhncorp.com/',
				uaIcon: 'bot_NaverBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NaverBot'
			}
		},
		'8247': {
			userAgent: 'Mozilla/5.0 (compatible; Mail.RU_Bot/2.0; +http://go.mail.ru/help/robots)',
			metadata: {
				uaFamily: 'Mail.Ru bot',
				uaName: 'Mail.RU_Bot/2.0',
				uaUrl: 'http://go.mail.ru/help/robots',
				uaCompany: 'Mail.Ru Group',
				uaCompanyUrl: 'http://corp.mail.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Mail.Ru bot'
			}
		},
		'8297': {
			userAgent: 'yacybot (freeworld-global; amd64 Linux 3.2.0-4-amd64; java 1.6.0_24; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'8300': {
			userAgent: 'Mozilla/5.0 (compatible; emefgebot/beta; +http://emefge.de/bot.html)',
			metadata: {
				uaFamily: 'emefgebot',
				uaName: 'emefgebot/beta',
				uaUrl: 'http://emefge.de/bot.html',
				uaCompany: 'Bayern Anzeiger UG',
				uaCompanyUrl: 'http://bayernanzeiger.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=emefgebot'
			}
		},
		'8318': {
			userAgent: 'Mozilla/5.0 (compatible; YioopBot; +http://173.13.143.74/bot.php)',
			metadata: {
				uaFamily: 'YioopBot',
				uaName: 'YioopBot',
				uaUrl: 'http://www.yioop.com/bot.php',
				uaCompany: 'Chris Pollett',
				uaCompanyUrl: 'http://pollett.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=YioopBot'
			}
		},
		'8329': {
			userAgent: 'Sogou web spider/4.0',
			metadata: {
				uaFamily: 'sogou spider',
				uaName: 'Sogou web spider/4.0',
				uaUrl: 'http://www.sogou.com/docs/help/webmasters.htm#07',
				uaCompany: 'SOGOU.COM',
				uaCompanyUrl: 'http://www.sogou.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sogou spider'
			}
		},
		'8397': {
			userAgent: 'Y!J-BRJ/YATS crawler (http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html)',
			metadata: {
				uaFamily: 'Yahoo! JAPAN',
				uaName: 'Y!J-BRJ/YATS',
				uaUrl: 'http://help.yahoo.co.jp/help/jp/search/indexing/indexing-15.html',
				uaCompany: 'Yahoo Japan Corporation',
				uaCompanyUrl: 'http://www.yahoo.co.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Yahoo! JAPAN'
			}
		},
		'8406': {
			userAgent: 'yacybot (freeworld-global; amd64 Linux 3.2.0-35-generic; java 1.7.0_09; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'8429': {
			userAgent: 'OpenWebSpider v0.1.4 (http://www.openwebspider.org/)',
			metadata: {
				uaFamily: 'OpenWebSpider',
				uaName: 'OpenWebSpider v0.1.4',
				uaUrl: 'http://www.openwebspider.org/',
				uaCompany: 'Stefano Alimonti',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=OpenWebSpider'
			}
		},
		'8487': {
			userAgent: 'emefgebot/beta (+http://emefge.de/bot.html)',
			metadata: {
				uaFamily: 'emefgebot',
				uaName: 'emefgebot/beta',
				uaUrl: 'http://emefge.de/bot.html',
				uaCompany: 'Bayern Anzeiger UG',
				uaCompanyUrl: 'http://bayernanzeiger.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=emefgebot'
			}
		},
		'8574': {
			userAgent: 'coccoc/1.0 (http://help.coccoc.com/)',
			metadata: {
				uaFamily: 'coccoc',
				uaName: 'coccoc/1.0',
				uaUrl: 'http://help.coccoc.com/',
				uaCompany: 'Coc Coc',
				uaCompanyUrl: 'http://coccoc.vn/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=coccoc'
			}
		},
		'8586': {
			userAgent: 'ExB Language Crawler 2.1.5 (+http://www.exb.de/crawler)',
			metadata: {
				uaFamily: 'ExB Language Crawler',
				uaName: 'ExB Language Crawler 2.1.5',
				uaUrl: 'http://www.exb.de/crawler/',
				uaCompany: 'ExB Communication Systems GmbH',
				uaCompanyUrl: 'http://www.exb.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ExB Language Crawler'
			}
		},
		'8590': {
			userAgent: 'Mozilla/4.0 (compatible;  Vagabondo/4.0; webcrawler at wise-guys dot nl; http://webagent.wise-guys.nl/; http://www.wise-guys.nl/)',
			metadata: {
				uaFamily: 'Vagabondo',
				uaName: 'Vagabondo/4.0',
				uaUrl: 'http://webagent.wise-guys.nl/',
				uaCompany: 'WiseGuys Internet BV',
				uaCompanyUrl: 'http://www.wise-guys.nl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Vagabondo'
			}
		},
		'8607': {
			userAgent: 'ExB Language Crawler 2.1.2 (+http://www.exb.de/crawler)',
			metadata: {
				uaFamily: 'ExB Language Crawler',
				uaName: 'ExB Language Crawler 2.1.2',
				uaUrl: 'http://www.exb.de/crawler/',
				uaCompany: 'ExB Communication Systems GmbH',
				uaCompanyUrl: 'http://www.exb.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ExB Language Crawler'
			}
		},
		'8694': {
			userAgent: 'Mozilla/5.0 (compatible; special_archiver/3.1.1 +http://www.archive.org/details/archive.org_bot)',
			metadata: {
				uaFamily: 'archive.org_bot',
				uaName: 'special_archiver/3.1.1',
				uaUrl: 'http://www.archive.org/details/archive.org_bot',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=archive.org_bot'
			}
		},
		'8743': {
			userAgent: 'Mozilla/5.0 (compatible; NLNZ_IAHarvester2013 +http://natlib.govt.nz/about-us/current-initiatives/web-harvest-2013)',
			metadata: {
				uaFamily: 'NLNZ_IAHarvester2013',
				uaName: 'NLNZ_IAHarvester2013',
				uaUrl: 'http://natlib.govt.nz/publishers-and-authors/web-harvesting/2013-nz-web-harvest',
				uaCompany: 'National Library of New Zealand',
				uaCompanyUrl: 'http://natlib.govt.nz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=NLNZ_IAHarvester2013'
			}
		},
		'8833': {
			userAgent: 'Zookabot/2.5;++http://zookabot.com',
			metadata: {
				uaFamily: 'Zookabot',
				uaName: 'Zookabot/2.5',
				uaUrl: 'http://zookabot.com/',
				uaCompany: 'Hwacha ApS',
				uaCompanyUrl: 'http://hwacha.dk/',
				uaIcon: 'bot_Zookabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Zookabot'
			}
		},
		'8866': {
			userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) SitemapProbe',
			metadata: {
				uaFamily: 'bingbot',
				uaName: 'bingbot SitemapProbe',
				uaUrl: 'http://www.bing.com/webmaster/help/which-crawlers-does-bing-use-8c184ec0',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bingbot'
			}
		},
		'8902': {
			userAgent: 'Mozilla/5.0 (compatible; ZumBot/1.0; http://help.zum.com/inquiry)',
			metadata: {
				uaFamily: 'ZumBot',
				uaName: 'ZumBot/1.0',
				uaUrl: 'http://help.zum.com/inquiry',
				uaCompany: 'ZUMinternet Corp',
				uaCompanyUrl: 'http://www.zuminternet.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ZumBot'
			}
		},
		'9010': {
			userAgent: 'Mozilla/5.0 (compatible; 4SeoHuntBot; +http://4seohunt.biz/about.html)',
			metadata: {
				uaFamily: '4seohuntBot',
				uaName: '4seohuntBot',
				uaUrl: 'http://4seohunt.biz/about.html',
				uaCompany: '4seohunt.biz',
				uaCompanyUrl: 'http://4seohunt.biz/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=4seohuntBot'
			}
		},
		'9020': {
			userAgent: 'fastbot crawler beta 2.0 (+http://www.fastbot.de)',
			metadata: {
				uaFamily: 'fastbot crawler',
				uaName: 'fastbot crawler beta 2.0',
				uaUrl: 'http://www.fastbot.de/',
				uaCompany: 'http://www.pagedesign.de/',
				uaCompanyUrl: 'Pagedesign GmbH',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=fastbot crawler'
			}
		},
		'9065': {
			userAgent: 'fastbot.de crawler 2.0 beta (http://www.fastbot.de)',
			metadata: {
				uaFamily: 'fastbot crawler',
				uaName: 'fastbot.de crawler beta 2.0',
				uaUrl: 'http://www.fastbot.de/',
				uaCompany: 'http://www.pagedesign.de/',
				uaCompanyUrl: 'Pagedesign GmbH',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=fastbot crawler'
			}
		},
		'9116': {
			userAgent: 'Mozilla/5.0+(compatible;+PiplBot;++http://www.pipl.com/bot/)',
			metadata: {
				uaFamily: 'PiplBot',
				uaName: 'PiplBot',
				uaUrl: 'http://pipl.com/bot/',
				uaCompany: 'pipl.com',
				uaCompanyUrl: 'http://pipl.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=PiplBot'
			}
		},
		'9165': {
			userAgent: 'rogerbot/1.0 (http://www.seomoz.org/dp/rogerbot, rogerbot-crawler+shiny@seomoz.org)',
			metadata: {
				uaFamily: 'rogerbot',
				uaName: 'rogerbot/1.0',
				uaUrl: 'http://moz.com/help/pro/what-is-rogerbot-',
				uaCompany: 'SEOmoz, Inc.',
				uaCompanyUrl: 'http://moz.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=rogerbot'
			}
		},
		'9239': {
			userAgent: 'Grahambot/0.1 (+http://www.sunaga-lab.com/graham-bot)',
			metadata: {
				uaFamily: 'Grahambot',
				uaName: 'Grahambot/0.1',
				uaUrl: 'http://www.sunaga-lab.com/graham-bot',
				uaCompany: 'Sunagarabo',
				uaCompanyUrl: 'http://sunagae.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Grahambot'
			}
		},
		'9240': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.5.0-27-generic; java 1.7.0_03; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'9262': {
			userAgent: 'SolomonoBot/1.04 (http://www.solomono.ru)',
			metadata: {
				uaFamily: 'SolomonoBot',
				uaName: 'SolomonoBot/1.04',
				uaUrl: 'http://solomono.ru/about/',
				uaCompany: 'Solomono',
				uaCompanyUrl: 'http://solomono.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SolomonoBot'
			}
		},
		'9280': {
			userAgent: 'Mozilla/5.0 (compatible; SemrushBot/0.96.2; +http://www.semrush.com/bot.html)',
			metadata: {
				uaFamily: 'SemrushBot',
				uaName: 'SemrushBot/0.96.2',
				uaUrl: 'http://www.semrush.com/bot.html',
				uaCompany: 'SEOQuake Team',
				uaCompanyUrl: 'http://www.seoquaketeam.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SemrushBot'
			}
		},
		'9288': {
			userAgent: 'bl.uk_lddc_bot/3.1.1 (+http://www.bl.uk/aboutus/legaldeposit/websites/websites/faqswebmaster/index.html)',
			metadata: {
				uaFamily: 'bl.uk_lddc_bot',
				uaName: 'bl.uk_lddc_bot/3.1.1',
				uaUrl: 'http://www.bl.uk/aboutus/legaldeposit/websites/websites/faqswebmaster/index.html',
				uaCompany: 'British Library',
				uaCompanyUrl: 'http://www.bl.uk/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bl.uk_lddc_bot'
			}
		},
		'9298': {
			userAgent: 'Mozilla/5.0 (Windows NT 6.1; rv:6.0) Gecko/20110814 Firefox/6.0 Google (+https://developers.google.com/+/web/snippet/)',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Googlebot snippet',
				uaUrl: 'https://developers.google.com/+/web/snippet/',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'9332': {
			userAgent: 'BacklinkCrawler V (http://www.backlinktest.com/crawler.html)',
			metadata: {
				uaFamily: 'BacklinkCrawler',
				uaName: 'BacklinkCrawler V',
				uaUrl: 'http://www.backlinktest.com/crawler.html',
				uaCompany: '2.0Promotion GbR',
				uaCompanyUrl: 'http://2.0promotion.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BacklinkCrawler'
			}
		},
		'9346': {
			userAgent: 'Automattic Analytics Crawler/0.1; http://wordpress.com/crawler/',
			metadata: {
				uaFamily: 'Automattic Analytics Crawler',
				uaName: 'Automattic Analytics Crawler/0.1',
				uaUrl: 'http://wordpress.com/crawler/',
				uaCompany: 'Automattic Inc.',
				uaCompanyUrl: 'http://automattic.com/',
				uaIcon: 'AutomatticCrawler.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Automattic Analytics Crawler'
			}
		},
		'9389': {
			userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6 Ara.com.tr AraBot 1.0',
			metadata: {
				uaFamily: 'AraBot',
				uaName: 'AraBot 1.0',
				uaUrl: '',
				uaCompany: ' ARA ?leti\u015fim Telekom\xfcnikasyon ?nternet Al?\u015fveri\u015f Reklam Tic. Ltd. \u015eti.',
				uaCompanyUrl: 'http://www.ara.com.tr/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AraBot'
			}
		},
		'9410': {
			userAgent: 'Aboundex/0.3 (http://www.aboundex.com/crawler/)',
			metadata: {
				uaFamily: 'Aboundexbot',
				uaName: 'Aboundexbot/0.3',
				uaUrl: 'http://www.aboundex.com/crawler/',
				uaCompany: 'Aboundex.com',
				uaCompanyUrl: 'http://www.aboundex.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Aboundexbot'
			}
		},
		'9427': {
			userAgent: 'Peeplo Screenshot Bot/0.20 ( abuse at peeplo dot_com )',
			metadata: {
				uaFamily: 'Peeplo Screenshot Bot',
				uaName: 'Peeplo Screenshot Bot/0.20',
				uaUrl: '',
				uaCompany: 'MOQU ADV Srl',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Peeplo Screenshot Bot'
			}
		},
		'9453': {
			userAgent: 'CCBot/2.0',
			metadata: {
				uaFamily: 'CCBot',
				uaName: 'CCBot/2.0',
				uaUrl: 'http://commoncrawl.org/research/',
				uaCompany: 'CommonCrawl Foundation',
				uaCompanyUrl: 'http://www.commoncrawl.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CCBot'
			}
		},
		'9455': {
			userAgent: 'Mozilla/5.0 (compatible; ProCogSEOBot/1.0; +http://www.procog.com/ )',
			metadata: {
				uaFamily: 'ProCogSEOBot',
				uaName: 'ProCogSEOBot/1.0',
				uaUrl: '',
				uaCompany: 'ProCog.com',
				uaCompanyUrl: 'http://www.procog.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ProCogSEOBot'
			}
		},
		'9540': {
			userAgent: 'MetaURI API/2.0 +metauri.com',
			metadata: {
				uaFamily: 'MetaURI API',
				uaName: 'MetaURI API/2.0',
				uaUrl: '',
				uaCompany: 'stateless systems',
				uaCompanyUrl: 'http://statelesssystems.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MetaURI API'
			}
		},
		'9577': {
			userAgent: 'Dlvr.it/1.0 (http://dlvr.it/)',
			metadata: {
				uaFamily: 'Dlvr.it/1.0',
				uaName: 'Dlvr.it/1.0',
				uaUrl: 'http://support.dlvr.it/entries/23499527-How-do-I-block-dlvr-it-from-retrieving-the-feeds-on-my-site-',
				uaCompany: 'dlvr.it',
				uaCompanyUrl: 'http://dlvr.it/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Dlvr.it/1.0'
			}
		},
		'9652': {
			userAgent: 'Mozilla/5.0 (compatible; GeliyooBot/1.0; +http://www.geliyoo.com/)',
			metadata: {
				uaFamily: 'GeliyooBot',
				uaName: 'GeliyooBot/1.0',
				uaUrl: '',
				uaCompany: 'Geliyoo Bili\u015fim Ar-Ge Tic. Ltd. \u015eti.',
				uaCompanyUrl: 'http://www.geliyoobilisim.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=GeliyooBot'
			}
		},
		'9653': {
			userAgent: 'ExB Language Crawler 2.1.1 (+http://www.exb.de/crawler)',
			metadata: {
				uaFamily: 'ExB Language Crawler',
				uaName: 'ExB Language Crawler 2.1.1',
				uaUrl: 'http://www.exb.de/crawler/',
				uaCompany: 'ExB Communication Systems GmbH',
				uaCompanyUrl: 'http://www.exb.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ExB Language Crawler'
			}
		},
		'9655': {
			userAgent: 'Mozilla/5.0 (compatible; 200PleaseBot/1.0; +http://www.200please.com/bot)',
			metadata: {
				uaFamily: '200PleaseBot',
				uaName: '200PleaseBot/1.0',
				uaUrl: 'http://www.200please.com/bot',
				uaCompany: '200please.com',
				uaCompanyUrl: 'http://www.200please.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=200PleaseBot'
			}
		},
		'9673': {
			userAgent: 'yacybot (webportal-global; amd64 Windows 7 6.1; java 1.7.0_04; America/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'9675': {
			userAgent: 'Mozilla/5.0 (compatible; Linux x86_64; Mail.RU_Bot/2.0; +http://go.mail.ru/help/robots)',
			metadata: {
				uaFamily: 'Mail.Ru bot',
				uaName: 'Mail.RU_Bot/2.0',
				uaUrl: 'http://go.mail.ru/help/robots',
				uaCompany: 'Mail.Ru Group',
				uaCompanyUrl: 'http://corp.mail.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Mail.Ru bot'
			}
		},
		'9681': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.0-4-amd64; java 1.6.0_27; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'9682': {
			userAgent: 'yacybot (freeworld/global; i386 Linux 3.4.2-linode44; java 1.6.0_27; America/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'9691': {
			userAgent: 'Mozilla/5.0 (compatible; GeliyooBot/1.0beta; +http://www.geliyoo.com/)',
			metadata: {
				uaFamily: 'GeliyooBot',
				uaName: 'GeliyooBot/1.0beta',
				uaUrl: '',
				uaCompany: 'Geliyoo Bili\u015fim Ar-Ge Tic. Ltd. \u015eti.',
				uaCompanyUrl: 'http://www.geliyoobilisim.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=GeliyooBot'
			}
		},
		'9694': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.8.0-21-generic; java 1.6.0_27; Pacific/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'9717': {
			userAgent: 'Sogou web spider/4.0l-2m!',
			metadata: {
				uaFamily: 'sogou spider',
				uaName: 'Sogou web spider/4.0l-2m!',
				uaUrl: 'http://www.sogou.com/docs/help/webmasters.htm#07',
				uaCompany: 'SOGOU.COM',
				uaCompanyUrl: 'http://www.sogou.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=sogou spider'
			}
		},
		'9737': {
			userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.4 (KHTML, like Gecko; Google Web Preview) Chrome/22.0.1229 Safari/537.4',
			metadata: {
				uaFamily: 'Googlebot',
				uaName: 'Google Web Preview',
				uaUrl: 'http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1062498',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'bot_googlebot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Googlebot'
			}
		},
		'9781': {
			userAgent: 'Mozilla/5.0 (compatible; uMBot-FC/1.0; mailto: crawling@ubermetrics-technologies.com)',
			metadata: {
				uaFamily: 'uMBot',
				uaName: 'uMBot-FC/1.0',
				uaUrl: '',
				uaCompany: 'uberMetrics Technologies GmbH',
				uaCompanyUrl: 'http://www.ubermetrics-technologies.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=uMBot'
			}
		},
		'9784': {
			userAgent: 'Mozilla/5.0 (compatible; coccoc/1.0; +http://help.coccoc.com/)',
			metadata: {
				uaFamily: 'coccoc',
				uaName: 'coccoc/1.0',
				uaUrl: 'http://help.coccoc.com/',
				uaCompany: 'Coc Coc',
				uaCompanyUrl: 'http://coccoc.vn/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=coccoc'
			}
		},
		'9832': {
			userAgent: 'Mozilla/5.0 (compatible; Mozilla; +http://wiki.github.com/bixo/bixo/bixocrawler; bixo-dev@yahoogroups.com)',
			metadata: {
				uaFamily: 'bixocrawler',
				uaName: 'bixocrawler',
				uaUrl: 'http://wiki.github.com/bixo/bixo/bixocrawler',
				uaCompany: 'Bixo Labs',
				uaCompanyUrl: 'http://openbixo.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bixocrawler'
			}
		},
		'9839': {
			userAgent: 'Mozilla/5.0 (compatible; aiHitBot/2.7; +http://www.aihit.com/)',
			metadata: {
				uaFamily: 'aiHitBot',
				uaName: 'aiHitBot/2.7',
				uaUrl: '',
				uaCompany: 'aiHit Ltd',
				uaCompanyUrl: 'http://aihit.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=aiHitBot'
			}
		},
		'9852': {
			userAgent: 'Mozilla/5.0 (compatible; GigaBot/1.0; +http://www.gigablast.com/ )',
			metadata: {
				uaFamily: 'Gigabot',
				uaName: 'Gigabot/1.0',
				uaUrl: 'http://www.gigablast.com/spider.html',
				uaCompany: 'Gigablast Inc',
				uaCompanyUrl: 'http://www.gigablast.com/',
				uaIcon: 'bot_gigabot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Gigabot'
			}
		},
		'9868': {
			userAgent: 'CirrusExplorer/1.1 (http://www.cireu.com/explorer.php)',
			metadata: {
				uaFamily: 'CirrusExplorer',
				uaName: 'CirrusExplorer/1.1',
				uaUrl: 'http://www.cireu.com/explorer.php',
				uaCompany: 'cireu.com',
				uaCompanyUrl: 'http://www.cireu.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CirrusExplorer'
			}
		},
		'9874': {
			userAgent: 'Mozilla/5.0 (compatible; uMBot-LN/1.0; mailto: crawling@ubermetrics-technologies.com)',
			metadata: {
				uaFamily: 'uMBot',
				uaName: 'uMBot-LN/1.0',
				uaUrl: '',
				uaCompany: 'uberMetrics Technologies GmbH',
				uaCompanyUrl: 'http://www.ubermetrics-technologies.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=uMBot'
			}
		},
		'9875': {
			userAgent: 'Crowsnest/0.5 (+http://www.crowsnest.tv/)',
			metadata: {
				uaFamily: 'Crowsnest',
				uaName: 'Crowsnest/0.5',
				uaUrl: '',
				uaCompany: 'Gocro, Inc.',
				uaCompanyUrl: 'http://www.gocro.jp/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Crowsnest'
			}
		},
		'9877': {
			userAgent: 'QuerySeekerSpider ( http://queryseeker.com/bot.html )',
			metadata: {
				uaFamily: 'QuerySeekerSpider',
				uaName: 'QuerySeekerSpider',
				uaUrl: 'http://queryseeker.com/bot.html',
				uaCompany: 'QueryEye Inc.',
				uaCompanyUrl: 'http://queryeye.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=QuerySeekerSpider'
			}
		},
		'9905': {
			userAgent: 'ownCloud Server Crawler',
			metadata: {
				uaFamily: 'ownCloud Server Crawler',
				uaName: 'ownCloud Server Crawler',
				uaUrl: '',
				uaCompany: 'ownCloud comunity',
				uaCompanyUrl: 'http://owncloud.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ownCloud Server Crawler'
			}
		},
		'9918': {
			userAgent: 'Mozilla/5.0 (compatible; rogerBot/1.0; UrlCrawler; http://www.seomoz.org/dp/rogerbot)',
			metadata: {
				uaFamily: 'rogerbot',
				uaName: 'rogerbot/1.0',
				uaUrl: 'http://moz.com/help/pro/what-is-rogerbot-',
				uaCompany: 'SEOmoz, Inc.',
				uaCompanyUrl: 'http://moz.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=rogerbot'
			}
		},
		'9925': {
			userAgent: 'Mozilla/5.0 (compatible; SemrushBot/0.96.3; +http://www.semrush.com/bot.html)',
			metadata: {
				uaFamily: 'SemrushBot',
				uaName: 'SemrushBot/0.96.3',
				uaUrl: 'http://www.semrush.com/bot.html',
				uaCompany: 'SEOQuake Team',
				uaCompanyUrl: 'http://www.seoquaketeam.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SemrushBot'
			}
		},
		'9949': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.8.0-23-generic; java 1.6.0_27; Pacific/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10008': {
			userAgent: 'BLEXBot',
			metadata: {
				uaFamily: 'BLEXBot',
				uaName: 'BLEXBot',
				uaUrl: 'http://webmeup-crawler.com/',
				uaCompany: 'WebMeUp',
				uaCompanyUrl: 'http://webmeup.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BLEXBot'
			}
		},
		'10035': {
			userAgent: 'Mozilla/5.0 (compatible; CloudServerMarketSpider/1.0; +http://www.cloudservermarket.com/spider.html)',
			metadata: {
				uaFamily: 'CloudServerMarketSpider',
				uaName: 'CloudServerMarketSpider/1.0',
				uaUrl: 'http://www.cloudservermarket.com/spider.html',
				uaCompany: 'CloudServerMarket.com',
				uaCompanyUrl: 'http://www.cloudservermarket.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CloudServerMarketSpider'
			}
		},
		'10057': {
			userAgent: 'Mozilla/5.0 (compatible; BLEXBot/1.0; +http://webmeup.com/crawler.html)',
			metadata: {
				uaFamily: 'BLEXBot',
				uaName: 'BLEXBot/1.0',
				uaUrl: 'http://webmeup-crawler.com/',
				uaCompany: 'WebMeUp',
				uaCompanyUrl: 'http://webmeup.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BLEXBot'
			}
		},
		'10073': {
			userAgent: 'Mozilla/5.0(compatible;Sosospider/2.0;+http://help.soso.com/webspider.htm)',
			metadata: {
				uaFamily: 'Sosospider',
				uaName: 'Sosospider/2.0',
				uaUrl: 'http://help.soso.com/webspider.htm',
				uaCompany: 'Tencent, Inc.',
				uaCompanyUrl: 'http://www.tencent.com/',
				uaIcon: 'bot_soso.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Sosospider'
			}
		},
		'10078': {
			userAgent: 'Mozilla/5.0 (compatible; firmilybot/0.3; +http://www.firmily.com/bot.php',
			metadata: {
				uaFamily: 'firmilybot',
				uaName: 'firmilybot/0.3',
				uaUrl: 'http://www.firmily.com/bot.php',
				uaCompany: 'Firmily',
				uaCompanyUrl: 'http://www.firmily.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=firmilybot'
			}
		},
		'10084': {
			userAgent: 'MetaHeadersBot (+http://www.metaheaders.com/bot.html)',
			metadata: {
				uaFamily: 'MetaHeadersBot',
				uaName: 'MetaHeadersBot',
				uaUrl: 'http://www.metaheaders.net/bot.html',
				uaCompany: 'metaheaders.net',
				uaCompanyUrl: 'http://www.metaheaders.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MetaHeadersBot'
			}
		},
		'10101': {
			userAgent: 'Mozilla/5.0 (compatible; meanpathbot/1.0; +http://www.meanpath.com/meanpathbot.html)',
			metadata: {
				uaFamily: 'meanpathbot',
				uaName: 'meanpathbot/1.0',
				uaUrl: 'http://www.meanpath.com/meanpathbot.html',
				uaCompany: 'meanpath, Inc.',
				uaCompanyUrl: 'https://meanpath.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=meanpathbot'
			}
		},
		'10107': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows 7 6.1; java 1.7.0_09; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10108': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows XP 5.2; java 1.7.0_04; America/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10126': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.8.13-gentoo; java 1.7.0_21; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10140': {
			userAgent: 'Mozilla/5.0 (compatible; AMZNKAssocBot/4.0 +http://affiliate-program.amazon.com)',
			metadata: {
				uaFamily: 'AMZNKAssocBot',
				uaName: 'AMZNKAssocBot/4.0',
				uaUrl: 'https://affiliate-program.amazon.com/gp/associates/help/t21/a14',
				uaCompany: 'Amazon.com, Inc.',
				uaCompanyUrl: 'http://www.amazon.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AMZNKAssocBot'
			}
		},
		'10182': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 2.6.32-49-server; java 1.6.0_27; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10228': {
			userAgent: 'Mozilla/5.0 (compatible; AcoonBot/4.12.1; +http://www.acoon.de/robot.asp)',
			metadata: {
				uaFamily: 'AcoonBot',
				uaName: 'AcoonBot/4.12.1',
				uaUrl: 'http://www.acoon.de/robot.asp',
				uaCompany: 'Acoon GmbH',
				uaCompanyUrl: '',
				uaIcon: 'bot_Acoon.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AcoonBot'
			}
		},
		'10237': {
			userAgent: 'Mozilla/5.0 (compatible; linkdexbot/2.0; +http://www.linkdex.com/about/bots/)',
			metadata: {
				uaFamily: 'linkdexbot',
				uaName: 'linkdexbot/2.0',
				uaUrl: 'http://www.linkdex.com/about/bots/',
				uaCompany: 'Linkdex Limited.',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=linkdexbot'
			}
		},
		'10241': {
			userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534+ (KHTML, like Gecko) BingPreview/1.0b',
			metadata: {
				uaFamily: 'BingPreview',
				uaName: 'BingPreview/1.0b',
				uaUrl: 'http://www.bing.com/blogs/site_blogs/b/webmaster/archive/2012/10/26/page-snapshots-in-bing-windows-8-app-to-bring-new-crawl-traffic-to-sites.aspx',
				uaCompany: 'Microsoft Corporation',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'bot_msnbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BingPreview'
			}
		},
		'10246': {
			userAgent: 'Mozilla/5.0 (compatible; AhrefsBot/5.0; +http://ahrefs.com/robot/)',
			metadata: {
				uaFamily: 'AhrefsBot',
				uaName: 'AhrefsBot/5.0',
				uaUrl: 'http://ahrefs.com/robot/',
				uaCompany: 'Ahrefs.com',
				uaCompanyUrl: 'http://ahrefs.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=AhrefsBot'
			}
		},
		'10293': {
			userAgent: 'Mozilla/5.0 (compatible; SeznamBot/3.1-test1; +http://fulltext.sblog.cz/)',
			metadata: {
				uaFamily: 'SeznamBot',
				uaName: 'SeznamBot/3.1-test',
				uaUrl: 'http://napoveda.seznam.cz/en/indexing-the-web.html',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeznamBot'
			}
		},
		'10301': {
			userAgent: 'yacybot (webportal-global; x86 Windows Vista 6.0; java 1.7.0_25; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10308': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows 7 6.1; java 1.7.0_25; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10342': {
			userAgent: 'SeoCheckBot (FischerNetzDesign Seo Checker, info@fischernetzdesign.de)',
			metadata: {
				uaFamily: 'SeoCheckBot',
				uaName: 'SeoCheckBot',
				uaUrl: 'http://www.kfsw.de/bot.html',
				uaCompany: 'Kristian Fischer',
				uaCompanyUrl: 'http://www.kfsw.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeoCheckBot'
			}
		},
		'10349': {
			userAgent: 'Mozilla/5.0 (compatible; woriobot support [at] zite [dot] com +http://zite.com)',
			metadata: {
				uaFamily: 'woriobot',
				uaName: 'woriobot',
				uaUrl: '',
				uaCompany: 'Zite',
				uaCompanyUrl: 'http://zite.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=woriobot'
			}
		},
		'10356': {
			userAgent: 'SeoCheck (FischerNetzDesign Seo Checker, info@fischernetzdesign.de)',
			metadata: {
				uaFamily: 'SeoCheckBot',
				uaName: 'SeoCheck',
				uaUrl: 'http://www.kfsw.de/bot.html',
				uaCompany: 'Kristian Fischer',
				uaCompanyUrl: 'http://www.kfsw.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeoCheckBot'
			}
		},
		'10374': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.2.0-4-amd64; java 1.7.0_03; Etc/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10444': {
			userAgent: 'Mozilla/5.0 (compatible; SemrushBot/0.96.4; +http://www.semrush.com/bot.html)',
			metadata: {
				uaFamily: 'SemrushBot',
				uaName: 'SemrushBot/0.96.4',
				uaUrl: 'http://www.semrush.com/bot.html',
				uaCompany: 'SEOQuake Team',
				uaCompanyUrl: 'http://www.seoquaketeam.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SemrushBot'
			}
		},
		'10448': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows NT (unknown) 6.2; java 1.7.0_05; Africa/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10481': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows 7 6.1; java 1.7.0_04; Asia/ja) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10498': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows Server 2008 R2 6.1; java 1.7.0_25; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10503': {
			userAgent: 'ScreenerBot Crawler Beta 2.0 (+http://www.ScreenerBot.com)',
			metadata: {
				uaFamily: 'ScreenerBot Crawler',
				uaName: 'ScreenerBot Crawler Beta 2.0',
				uaUrl: 'http://www.screenerbot.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=ScreenerBot Crawler'
			}
		},
		'10537': {
			userAgent: 'Mozilla/5.0 (compatible; Mozilla/5.0; +http://wiki.github.com/bixo/bixo/bixocrawler; bixo-dev@yahoogroups.com)',
			metadata: {
				uaFamily: 'bixocrawler',
				uaName: 'bixocrawler',
				uaUrl: 'http://wiki.github.com/bixo/bixo/bixocrawler',
				uaCompany: 'Bixo Labs',
				uaCompanyUrl: 'http://openbixo.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bixocrawler'
			}
		},
		'10555': {
			userAgent: 'Semantifire1/0.20 ( http://www.setooz.com/oozbot.html ; agentname at setooz dot_com )',
			metadata: {
				uaFamily: 'Semantifire',
				uaName: 'Semantifire1/0.20',
				uaUrl: 'http://www.setooz.com/oozbot.html',
				uaCompany: 'SETU Software Systems (P) Ltd.',
				uaCompanyUrl: 'http://www.setusoftware.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Semantifire'
			}
		},
		'10562': {
			userAgent: 'Mozilla/5.0 (compatible; BIXOCRAWLER; +http://wiki.github.com/bixo/bixo/bixocrawler; bixo-dev@yahoogroups.com)',
			metadata: {
				uaFamily: 'bixocrawler',
				uaName: 'bixocrawler',
				uaUrl: 'http://wiki.github.com/bixo/bixo/bixocrawler',
				uaCompany: 'Bixo Labs',
				uaCompanyUrl: 'http://openbixo.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=bixocrawler'
			}
		},
		'10576': {
			userAgent: 'Mozilla/5.0 (compatible; socialbm_bot/1.0; +http://spider.socialbm.net)',
			metadata: {
				uaFamily: 'socialbm_bot',
				uaName: 'socialbm_bot/1.0',
				uaUrl: 'http://spider.socialbm.net/',
				uaCompany: 'Martin Junker - social-bookmarking.net',
				uaCompanyUrl: 'http://www.social-bookmarking.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=socialbm_bot'
			}
		},
		'10604': {
			userAgent: 'rogerbot/1.0 (http://moz.com/help/pro/what-is-rogerbot-, rogerbot-crawler+shiny@moz.com)',
			metadata: {
				uaFamily: 'rogerbot',
				uaName: 'rogerbot/1.0',
				uaUrl: 'http://moz.com/help/pro/what-is-rogerbot-',
				uaCompany: 'SEOmoz, Inc.',
				uaCompanyUrl: 'http://moz.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=rogerbot'
			}
		},
		'10615': {
			userAgent: 'CCResearchBot/1.0 commoncrawl.org/research//Nutch-1.7-SNAPSHOT',
			metadata: {
				uaFamily: 'CCResearchBot',
				uaName: 'CCResearchBot/1.0',
				uaUrl: 'http://commoncrawl.org/research/',
				uaCompany: 'CommonCrawl Foundation',
				uaCompanyUrl: 'http://www.commoncrawl.org/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CCResearchBot'
			}
		},
		'10635': {
			userAgent: 'Mozilla/5.0 (compatible; MJ12bot/v1.4.4; http://www.majestic12.co.uk/bot.php?+)',
			metadata: {
				uaFamily: 'MJ12bot',
				uaName: 'MJ12bot/v1.4.4',
				uaUrl: 'http://majestic12.co.uk/bot.php',
				uaCompany: 'Majestic-12',
				uaCompanyUrl: 'http://www.majestic12.co.uk/',
				uaIcon: 'bot_mj12bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MJ12bot'
			}
		},
		'10658': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.5.0-27-generic; java 1.7.0_25; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10691': {
			userAgent: 'Mozilla/5.0 (compatible; SemrushBot/0.97; +http://www.semrush.com/bot.html)',
			metadata: {
				uaFamily: 'SemrushBot',
				uaName: 'SemrushBot/0.97',
				uaUrl: 'http://www.semrush.com/bot.html',
				uaCompany: 'SEOQuake Team',
				uaCompanyUrl: 'http://www.seoquaketeam.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SemrushBot'
			}
		},
		'10708': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/4.0a; +http://www.seoprofiler.com/bot )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/4.0a',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'10822': {
			userAgent: 'yacybot (freeworld/global; amd64 Windows 8 6.2; java 1.7.0_25; Europe/de) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10823': {
			userAgent: 'Mozilla/5.0 (compatible; BLEXBot/1.0; +http://webmeup-crawler.com/)',
			metadata: {
				uaFamily: 'BLEXBot',
				uaName: 'BLEXBot/1.0',
				uaUrl: 'http://webmeup-crawler.com/',
				uaCompany: 'WebMeUp',
				uaCompanyUrl: 'http://webmeup.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BLEXBot'
			}
		},
		'10847': {
			userAgent: 'Mozilla/5.0 (compatible; MojeekBot/0.5; http://www.mojeek.com/bot.html)',
			metadata: {
				uaFamily: 'MojeekBot',
				uaName: 'MojeekBot/0.5',
				uaUrl: 'http://www.mojeek.com/bot.html',
				uaCompany: 'Mojeek Ltd.',
				uaCompanyUrl: 'http://www.mojeek.com/',
				uaIcon: 'bot_MojeekBot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MojeekBot'
			}
		},
		'10913': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.8.0-19-generic; java 1.7.0_25; Europe/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'10923': {
			userAgent: 'Cliqz Bot (+http://www.cliqz.com)',
			metadata: {
				uaFamily: 'CliqzBot',
				uaName: 'Cliqz Bot',
				uaUrl: '',
				uaCompany: '10betterpages GmbH',
				uaCompanyUrl: 'http://www.10betterpages.com/',
				uaIcon: 'bot_cliqzbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=CliqzBot'
			}
		},
		'10990': {
			userAgent: 'KrOWLer/0.0.1, matentzn at cs dot man dot ac dot uk',
			metadata: {
				uaFamily: 'KrOWLer',
				uaName: 'KrOWLer/0.0.1',
				uaUrl: '',
				uaCompany: 'Nico Matentzoglu',
				uaCompanyUrl: 'http://nico.matentzoglu.net/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=KrOWLer'
			}
		},
		'11025': {
			userAgent: 'Cliqzbot/0.1 (+http://cliqz.com +cliqzbot@cliqz.com)',
			metadata: {
				uaFamily: 'Cliqzbot',
				uaName: 'Cliqzbot/0.1',
				uaUrl: '',
				uaCompany: '10betterpages GmbH',
				uaCompanyUrl: 'http://www.10betterpages.com/',
				uaIcon: 'bot_cliqzbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Cliqzbot'
			}
		},
		'11039': {
			userAgent: 'Mozilla/4.0 (compatible;HostTracker/2.0;+http://www.host-tracker.com/)',
			metadata: {
				uaFamily: 'HostTracker',
				uaName: 'HostTracker/2.0',
				uaUrl: '',
				uaCompany: 'HostTracker, Ltd.',
				uaCompanyUrl: 'http://www.host-tracker.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=HostTracker'
			}
		},
		'11045': {
			userAgent: 'Mozilla/5.0 (compatible; linkdexbot/2.1; +http://www.linkdex.com/about/bots/)',
			metadata: {
				uaFamily: 'linkdexbot',
				uaName: 'linkdexbot/2.1',
				uaUrl: 'http://www.linkdex.com/about/bots/',
				uaCompany: 'Linkdex Limited.',
				uaCompanyUrl: '',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=linkdexbot'
			}
		},
		'11058': {
			userAgent: 'BUbiNG (+http://law.di.unimi.it/BUbiNG.html)',
			metadata: {
				uaFamily: 'BUbiNG',
				uaName: 'BUbiNG',
				uaUrl: 'http://law.di.unimi.it/BUbiNG.html',
				uaCompany: ' Universit\xe0 degli studi di Milano.',
				uaCompanyUrl: 'http://www.unimi.it/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=BUbiNG'
			}
		},
		'11068': {
			userAgent: 'Mozilla/5.0 (compatible; parsijoo; +http://www.parsijoo.ir/; ehsan.mousakazemi@gmail.com)',
			metadata: {
				uaFamily: 'parsijoo',
				uaName: 'parsijoo',
				uaUrl: '',
				uaCompany: ' Community Atmosphere',
				uaCompanyUrl: 'http://parsijoo.ir/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=parsijoo'
			}
		},
		'11079': {
			userAgent: 'Mozilla/5.0 (compatible; spbot/4.0b; +http://www.seoprofiler.com/bot )',
			metadata: {
				uaFamily: 'spbot',
				uaName: 'spbot/4.0b',
				uaUrl: 'http://www.seoprofiler.com/bot/',
				uaCompany: 'Axandra GmbH',
				uaCompanyUrl: 'http://www.axandra.com/',
				uaIcon: 'bot_spbot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=spbot'
			}
		},
		'11139': {
			userAgent: 'Speedy Spider (Submit your site at http://www.entireweb.com/free_submission/)',
			metadata: {
				uaFamily: 'Speedy',
				uaName: 'Speedy Spider',
				uaUrl: '',
				uaCompany: 'Entireweb Sweden AB',
				uaCompanyUrl: 'http://www.entireweb.com/',
				uaIcon: 'bot_Speedy.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Speedy'
			}
		},
		'11253': {
			userAgent: 'Mozilla/5.0 (compatible; alexa site audit/1.0; +http://www.alexa.com/help/webmasters; siteaudit@alexa.com)',
			metadata: {
				uaFamily: 'alexa site audit',
				uaName: 'alexa site audit/1.0',
				uaUrl: 'http://www.alexa.com/siteaudit',
				uaCompany: 'Alexa Internet, Inc.',
				uaCompanyUrl: 'http://www.alexa.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=alexa site audit'
			}
		},
		'11255': {
			userAgent: 'A6-Indexer/1.0 (http://www.a6corp.com/a6-web-scraping-policy/)',
			metadata: {
				uaFamily: 'A6-Indexer',
				uaName: 'A6-Indexer/1.0',
				uaUrl: 'http://www.a6corp.com/a6-web-scraping-policy/',
				uaCompany: 'A6 Corporation',
				uaCompanyUrl: 'http://www.a6corp.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=A6-Indexer'
			}
		},
		'11256': {
			userAgent: 'yacybot (freeworld/global; amd64 Linux 3.10.15-1-MANJARO; java 1.7.0_40; Asia/en) http://yacy.net/bot.html',
			metadata: {
				uaFamily: 'yacybot',
				uaName: 'yacybot',
				uaUrl: 'http://yacy.net/bot.html',
				uaCompany: 'Michael Christen',
				uaCompanyUrl: '',
				uaIcon: 'bot_yacybot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=yacybot'
			}
		},
		'11265': {
			userAgent: 'Mozilla/5.0 (Compatible; Vedma/0.91Beta; +http://www.vedma.ru/bot.htm)',
			metadata: {
				uaFamily: 'Vedma',
				uaName: 'Vedma/0.91Beta',
				uaUrl: 'http://www.vedma.ru/bot.htm',
				uaCompany: 'vedma.ru',
				uaCompanyUrl: 'http://www.vedma.ru/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Vedma'
			}
		},
		'11312': {
			userAgent: 'Mozilla/5.0 (compatible; WebThumbnail/3.x; Website Thumbnail Generator; +http://webthumbnail.org)',
			metadata: {
				uaFamily: 'WebThumbnail',
				uaName: 'WebThumbnail/3.x',
				uaUrl: '',
				uaCompany: 'hellworx - Lukasz Cepowski',
				uaCompanyUrl: 'http://www.hellworx.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=WebThumbnail'
			}
		},
		'11323': {
			userAgent: 'Mozilla/5.0 (compatible; archive.org_bot; Wayback Machine Live Record; +http://archive.org/details/archive.org_bot)',
			metadata: {
				uaFamily: 'archive.org_bot',
				uaName: 'archive.org_bot',
				uaUrl: 'http://www.archive.org/details/archive.org_bot',
				uaCompany: 'Internet Archive',
				uaCompanyUrl: 'http://www.archive.org/',
				uaIcon: 'bot_heritrix.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=archive.org_bot'
			}
		},
		'11331': {
			userAgent: 'SeoCheckBot (Seo-Check, http://www.kfsw.de/bot.html)',
			metadata: {
				uaFamily: 'SeoCheckBot',
				uaName: 'SeoCheckBot',
				uaUrl: 'http://www.kfsw.de/bot.html',
				uaCompany: 'Kristian Fischer',
				uaCompanyUrl: 'http://www.kfsw.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=SeoCheckBot'
			}
		},
		'11343': {
			userAgent: 'MiaDev/0.0.1 (MIA Bot for research project MIA (www.MIA-marktplatz.de); http://www.mia-marktplatz.de/spider; spider@mia-marktplatz.de)',
			metadata: {
				uaFamily: 'MiaDev',
				uaName: 'MiaDev/0.0.1',
				uaUrl: 'http://www.mia-marktplatz.de/spider',
				uaCompany: 'Technische Universit\xe4t Berlin',
				uaCompanyUrl: 'http://www.dima.tu-berlin.de/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=MiaDev'
			}
		},
		'11351': {
			userAgent: 'Mozilla/5.0 (compatible; aiHitBot/2.8; +http://endb-consolidated.aihit.com/)',
			metadata: {
				uaFamily: 'aiHitBot',
				uaName: 'aiHitBot/2.8',
				uaUrl: '',
				uaCompany: 'aiHit Ltd',
				uaCompanyUrl: 'http://aihit.com/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=aiHitBot'
			}
		},
		'11377': {
			userAgent: 'Baiduspider-image+(+http://www.baidu.com/search/spider.htm)',
			metadata: {
				uaFamily: 'Baiduspider',
				uaName: 'Baiduspider-image',
				uaUrl: 'http://www.baidu.com/search/spider.htm',
				uaCompany: 'Baidu',
				uaCompanyUrl: '',
				uaIcon: 'bot_baiduspider.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Baiduspider'
			}
		},
		'11378': {
			userAgent: 'Fetch/2.0a (CMS Detection/Web/SEO analysis tool, see http://guess.scritch.org)',
			metadata: {
				uaFamily: 'Fetch-Guess',
				uaName: 'Fetch/2.0a',
				uaUrl: '',
				uaCompany: 'Ivo van der Wijk',
				uaCompanyUrl: 'http://www.m3r.nl/',
				uaIcon: 'bot.png',
				uaInfoUrl: '/list-of-ua/bot-detail?bot=Fetch-Guess'
			}
		},
		order: [
			'1490',
			'9655',
			'9010',
			'1773',
			'1633',
			'1871',
			'5311',
			'11255',
			'3422',
			'6592',
			'9410',
			'1941',
			'1735',
			'5077',
			'6246',
			'6247',
			'859',
			'892',
			'7106',
			'162',
			'512',
			'1273',
			'1282',
			'1287',
			'1297',
			'1685',
			'6905',
			'7001',
			'7009',
			'7112',
			'7178',
			'7265',
			'7285',
			'7321',
			'7366',
			'7409',
			'7458',
			'7477',
			'7544',
			'10228',
			'829',
			'7230',
			'1705',
			'494',
			'676',
			'715',
			'6404',
			'6751',
			'7333',
			'7579',
			'7843',
			'10246',
			'2102',
			'2188',
			'2223',
			'7320',
			'7462',
			'9839',
			'11351',
			'89',
			'1555',
			'1550',
			'11253',
			'90',
			'148',
			'214',
			'236',
			'278',
			'394',
			'471',
			'671',
			'1849',
			'128',
			'2110',
			'10140',
			'5623',
			'7015',
			'3236',
			'9389',
			'2057',
			'6237',
			'5272',
			'8694',
			'11323',
			'1042',
			'37',
			'131',
			'411',
			'694',
			'890',
			'9346',
			'2050',
			'6231',
			'9332',
			'7732',
			'7733',
			'14',
			'1474',
			'6399',
			'11377',
			'2125',
			'1770',
			'2162',
			'2063',
			'285',
			'360',
			'566',
			'712',
			'602',
			'789',
			'5357',
			'7754',
			'8866',
			'10241',
			'2022',
			'6514',
			'2135',
			'4733',
			'5238',
			'7494',
			'9832',
			'10562',
			'10537',
			'9288',
			'548',
			'580',
			'665',
			'749',
			'7340',
			'10008',
			'10057',
			'10823',
			'4519',
			'1726',
			'1637',
			'1754',
			'7442',
			'146',
			'328',
			'456',
			'833',
			'1479',
			'7696',
			'8192',
			'1733',
			'1753',
			'1752',
			'237',
			'11058',
			'1516',
			'5100',
			'817',
			'4939',
			'7369',
			'7162',
			'1481',
			'5665',
			'4977',
			'499',
			'588',
			'742',
			'928',
			'969',
			'1482',
			'1238',
			'9453',
			'10615',
			'184',
			'200',
			'207',
			'263',
			'327',
			'560',
			'594',
			'824',
			'1023',
			'812',
			'959',
			'1270',
			'9868',
			'76',
			'3409',
			'393',
			'5909',
			'10923',
			'11025',
			'10035',
			'7411',
			'7548',
			'7727',
			'8574',
			'9784',
			'608',
			'7927',
			'32',
			'80',
			'688',
			'1495',
			'2170',
			'2181',
			'2194',
			'2212',
			'2242',
			'2235',
			'2239',
			'2241',
			'2952',
			'2999',
			'3003',
			'2773',
			'2844',
			'2937',
			'2948',
			'5860',
			'6630',
			'6280',
			'9875',
			'317',
			'725',
			'755',
			'422',
			'630',
			'807',
			'967',
			'1150',
			'1466',
			'7406',
			'1530',
			'6802',
			'7164',
			'1568',
			'731',
			'752',
			'652',
			'811',
			'938',
			'1137',
			'1164',
			'1214',
			'1771',
			'6244',
			'6922',
			'7790',
			'1650',
			'9577',
			'1731',
			'5218',
			'6937',
			'1459',
			'3333',
			'7764',
			'7832',
			'1225',
			'7143',
			'117',
			'7624',
			'5187',
			'556',
			'569',
			'600',
			'7083',
			'488',
			'597',
			'1115',
			'1169',
			'1323',
			'192',
			'564',
			'8300',
			'8487',
			'1198',
			'1205',
			'1027',
			'547',
			'8184',
			'5806',
			'1500',
			'4730',
			'7243',
			'6243',
			'679',
			'753',
			'1994',
			'7014',
			'425',
			'8586',
			'8607',
			'9653',
			'5818',
			'1523',
			'5611',
			'8131',
			'1061',
			'7084',
			'4501',
			'1717',
			'3703',
			'312',
			'809',
			'1005',
			'47',
			'9020',
			'9065',
			'4722',
			'808',
			'1595',
			'3002',
			'11378',
			'118',
			'1856',
			'5292',
			'5352',
			'5646',
			'5685',
			'5715',
			'4853',
			'5052',
			'5243',
			'5277',
			'5843',
			'6011',
			'6177',
			'6298',
			'6312',
			'6326',
			'6712',
			'7338',
			'7387',
			'7399',
			'7467',
			'10078',
			'1582',
			'844',
			'876',
			'877',
			'925',
			'6202',
			'6068',
			'1536',
			'1870',
			'1663',
			'306',
			'804',
			'851',
			'531',
			'1035',
			'4946',
			'217',
			'137',
			'303',
			'741',
			'6226',
			'6353',
			'9691',
			'9652',
			'190',
			'215',
			'8096',
			'1133',
			'1052',
			'920',
			'9852',
			'1573',
			'45',
			'656',
			'657',
			'226',
			'2133',
			'2132',
			'5380',
			'7053',
			'25',
			'31',
			'982',
			'4726',
			'4966',
			'6945',
			'6948',
			'6947',
			'7258',
			'7259',
			'7260',
			'9737',
			'9298',
			'9239',
			'7717',
			'7718',
			'1932',
			'5165',
			'756',
			'1872',
			'1546',
			'1658',
			'1704',
			'1887',
			'2026',
			'2016',
			'2021',
			'2081',
			'2079',
			'2947',
			'7225',
			'623',
			'1519',
			'1583',
			'517',
			'554',
			'669',
			'927',
			'3600',
			'7380',
			'8138',
			'281',
			'307',
			'11039',
			'3235',
			'805',
			'5302',
			'7975',
			'761',
			'155',
			'1461',
			'1738',
			'1765',
			'1044',
			'124',
			'144',
			'223',
			'540',
			'1197',
			'3445',
			'5902',
			'6999',
			'7676',
			'5862',
			'764',
			'378',
			'81',
			'168',
			'7119',
			'7414',
			'85',
			'7542',
			'7632',
			'7726',
			'8134',
			'7819',
			'882',
			'167',
			'197',
			'242',
			'267',
			'729',
			'1220',
			'7113',
			'7995',
			'1540',
			'1859',
			'797',
			'6583',
			'6829',
			'7072',
			'5202',
			'5',
			'1599',
			'391',
			'1524',
			'1484',
			'3292',
			'1542',
			'7402',
			'539',
			'479',
			'10990',
			'396',
			'633',
			'83',
			'266',
			'405',
			'4264',
			'4590',
			'4591',
			'3398',
			'631',
			'632',
			'6625',
			'881',
			'778',
			'6612',
			'6647',
			'1780',
			'5180',
			'1504',
			'2155',
			'481',
			'483',
			'1798',
			'6044',
			'1475',
			'10237',
			'11045',
			'774',
			'130',
			'678',
			'4844',
			'20',
			'820',
			'4996',
			'1210',
			'1502',
			'6134',
			'7343',
			'7984',
			'8247',
			'9675',
			'10101',
			'525',
			'609',
			'7888',
			'5960',
			'10084',
			'7211',
			'5280',
			'114',
			'295',
			'496',
			'4589',
			'9540',
			'7525',
			'11343',
			'125',
			'232',
			'326',
			'520',
			'689',
			'1676',
			'1517',
			'1602',
			'1908',
			'1909',
			'2024',
			'2185',
			'4846',
			'6270',
			'6877',
			'7005',
			'7375',
			'10635',
			'1213',
			'1283',
			'994',
			'1247',
			'1867',
			'2195',
			'7012',
			'1563',
			'2196',
			'5683',
			'6436',
			'10847',
			'538',
			'135',
			'350',
			'624',
			'1533',
			'2120',
			'416',
			'562',
			'587',
			'865',
			'3',
			'1497',
			'1180',
			'1468',
			'4095',
			'4411',
			'6010',
			'252',
			'546',
			'791',
			'1024',
			'977',
			'442',
			'528',
			'813',
			'2028',
			'1476',
			'1494',
			'6921',
			'8208',
			'814',
			'6304',
			'832',
			'6225',
			'5056',
			'6735',
			'7856',
			'873',
			'1095',
			'5092',
			'7238',
			'368',
			'771',
			'1102',
			'563',
			'38',
			'465',
			'515',
			'5003',
			'290',
			'201',
			'209',
			'282',
			'294',
			'341',
			'431',
			'1072',
			'8743',
			'4866',
			'349',
			'366',
			'4336',
			'6114',
			'335',
			'480',
			'82',
			'84',
			'86',
			'100',
			'120',
			'133',
			'177',
			'321',
			'323',
			'338',
			'343',
			'382',
			'482',
			'484',
			'485',
			'491',
			'493',
			'710',
			'716',
			'917',
			'1089',
			'2087',
			'5939',
			'6245',
			'164',
			'178',
			'5987',
			'6826',
			'5228',
			'93',
			'116',
			'308',
			'109',
			'219',
			'355',
			'5859',
			'6914',
			'7045',
			'7055',
			'7107',
			'7132',
			'7563',
			'7606',
			'6234',
			'8429',
			'310',
			'1681',
			'2233',
			'1496',
			'9905',
			'1037',
			'1040',
			'7625',
			'253',
			'6739',
			'7070',
			'7854',
			'398',
			'886',
			'7437',
			'1938',
			'11068',
			'9427',
			'7959',
			'7833',
			'5376',
			'7153',
			'2197',
			'690',
			'9116',
			'6978',
			'7063',
			'7784',
			'8061',
			'1895',
			'2073',
			'4876',
			'6352',
			'7816',
			'7889',
			'141',
			'616',
			'4940',
			'760',
			'5360',
			'6974',
			'7605',
			'9455',
			'7655',
			'56',
			'5620',
			'1982',
			'8170',
			'5057',
			'914',
			'9877',
			'6024',
			'1815',
			'4936',
			'7217',
			'6252',
			'856',
			'337',
			'5362',
			'1711',
			'7799',
			'9165',
			'9918',
			'10604',
			'2145',
			'2078',
			'6721',
			'7044',
			'1601',
			'3415',
			'7424',
			'1816',
			'1906',
			'88',
			'123',
			'606',
			'2138',
			'1950',
			'1779',
			'462',
			'501',
			'9',
			'1565',
			'3203',
			'10503',
			'301',
			'7757',
			'4512',
			'8066',
			'2246',
			'6892',
			'10555',
			'6770',
			'7060',
			'7096',
			'7267',
			'7776',
			'9280',
			'9925',
			'10691',
			'10444',
			'151',
			'221',
			'10342',
			'10356',
			'11331',
			'6040',
			'3142',
			'5999',
			'6506',
			'6708',
			'6598',
			'1522',
			'1469',
			'1703',
			'4907',
			'4888',
			'6229',
			'6835',
			'6837',
			'1463',
			'1464',
			'1992',
			'3132',
			'4437',
			'5857',
			'6038',
			'6189',
			'6192',
			'6214',
			'7126',
			'10293',
			'1562',
			'262',
			'536',
			'747',
			'7163',
			'208',
			'227',
			'911',
			'1480',
			'6329',
			'6109',
			'874',
			'1866',
			'101',
			'408',
			'754',
			'815',
			'825',
			'921',
			'835',
			'1600',
			'10576',
			'1471',
			'1470',
			'523',
			'768',
			'770',
			'773',
			'1936',
			'7671',
			'8329',
			'9717',
			'9262',
			'1853',
			'7697',
			'10073',
			'4911',
			'4922',
			'3379',
			'5386',
			'5748',
			'3561',
			'3734',
			'3589',
			'4097',
			'4377',
			'7912',
			'10708',
			'11079',
			'999',
			'1885',
			'4185',
			'4337',
			'6288',
			'11139',
			'6816',
			'1784',
			'5066',
			'934',
			'1472',
			'296',
			'435',
			'545',
			'392',
			'410',
			'5231',
			'132',
			'5145',
			'567',
			'1092',
			'2099',
			'5188',
			'5802',
			'2098',
			'235',
			'7138',
			'7155',
			'1078',
			'204',
			'333',
			'470',
			'565',
			'96',
			'1772',
			'1971',
			'1727',
			'1728',
			'352',
			'412',
			'445',
			'447',
			'645',
			'646',
			'648',
			'961',
			'962',
			'963',
			'964',
			'965',
			'966',
			'218',
			'2004',
			'2175',
			'194',
			'5828',
			'6578',
			'2003',
			'2183',
			'1838',
			'4000',
			'1293',
			'6146',
			'7675',
			'489',
			'703',
			'40',
			'1763',
			'5006',
			'5839',
			'1462',
			'1759',
			'7317',
			'6962',
			'9781',
			'9874',
			'7384',
			'6065',
			'345',
			'437',
			'6840',
			'1662',
			'7469',
			'1505',
			'5727',
			'439',
			'1766',
			'5275',
			'8590',
			'11265',
			'658',
			'329',
			'195',
			'5065',
			'376',
			'629',
			'798',
			'6961',
			'612',
			'698',
			'888',
			'222',
			'1567',
			'225',
			'1586',
			'1619',
			'929',
			'6929',
			'5642',
			'5639',
			'5640',
			'5641',
			'5643',
			'5644',
			'5635',
			'5636',
			'5637',
			'5638',
			'6776',
			'4546',
			'902',
			'922',
			'5701',
			'153',
			'170',
			'765',
			'788',
			'1751',
			'7748',
			'1478',
			'7634',
			'469',
			'758',
			'11312',
			'5361',
			'786',
			'861',
			'7438',
			'7747',
			'5389',
			'5710',
			'872',
			'7841',
			'406',
			'1805',
			'238',
			'415',
			'452',
			'5183',
			'7622',
			'7628',
			'1501',
			'10349',
			'6515',
			'7596',
			'7577',
			'8191',
			'626',
			'364',
			'2205',
			'340',
			'4999',
			'4898',
			'4914',
			'1653',
			'1604',
			'1645',
			'1712',
			'1776',
			'1894',
			'1957',
			'2017',
			'2071',
			'2088',
			'2091',
			'2279',
			'2300',
			'3034',
			'3238',
			'3221',
			'5281',
			'5322',
			'4830',
			'4423',
			'4747',
			'4974',
			'4975',
			'5216',
			'5176',
			'5249',
			'5276',
			'5278',
			'6679',
			'6680',
			'6884',
			'6896',
			'6968',
			'6977',
			'7008',
			'7039',
			'7051',
			'7079',
			'7092',
			'7177',
			'7252',
			'7253',
			'7263',
			'7278',
			'7303',
			'7304',
			'7305',
			'7306',
			'7307',
			'7308',
			'7309',
			'7322',
			'7323',
			'7324',
			'7325',
			'7362',
			'7363',
			'7347',
			'7348',
			'7349',
			'7364',
			'7365',
			'7373',
			'7374',
			'7404',
			'7405',
			'7420',
			'7421',
			'7422',
			'7423',
			'7510',
			'7511',
			'7512',
			'7513',
			'7729',
			'8179',
			'8107',
			'8114',
			'8083',
			'9240',
			'9682',
			'9694',
			'8297',
			'9681',
			'8406',
			'10108',
			'9673',
			'10182',
			'9949',
			'10126',
			'10107',
			'10481',
			'10913',
			'10498',
			'10374',
			'10658',
			'10448',
			'10301',
			'10308',
			'10822',
			'11256',
			'4',
			'193',
			'1564',
			'1793',
			'1548',
			'1558',
			'5982',
			'6603',
			'7381',
			'7651',
			'8397',
			'605',
			'1458',
			'1690',
			'1869',
			'1943',
			'5010',
			'5014',
			'5016',
			'5090',
			'5846',
			'7013',
			'7018',
			'7159',
			'7160',
			'7161',
			'7172',
			'7173',
			'7426',
			'7427',
			'7428',
			'7429',
			'7430',
			'7433',
			'1512',
			'7133',
			'7300',
			'8318',
			'653',
			'728',
			'1818',
			'891',
			'1507',
			'1509',
			'5718',
			'43',
			'581',
			'5655',
			'5007',
			'6001',
			'7139',
			'8833',
			'913',
			'7780',
			'8902',
			'140',
			'159',
			'401',
			'3441'
		]
	},
	os: {
		'1': {
			osFamily: 'Windows',
			osName: 'Windows XP',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_XP',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windowsxp.png'
		},
		'2': {
			osFamily: 'Windows',
			osName: 'Windows 2000',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_2000',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windows.png'
		},
		'3': {
			osFamily: 'Windows',
			osName: 'Windows 2003 Server',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_2003',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windowsxp.png'
		},
		'4': {
			osFamily: 'Windows',
			osName: 'Windows 95',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_95',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windows.png'
		},
		'5': {
			osFamily: 'Windows',
			osName: 'Windows 98',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_98',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windows.png'
		},
		'6': {
			osFamily: 'Windows',
			osName: 'Windows 3.x',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_3.x',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windows.png'
		},
		'7': {
			osFamily: 'Windows',
			osName: 'Windows CE',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_CE',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windowsce.png'
		},
		'8': {
			osFamily: 'Windows',
			osName: 'Windows ME',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_me',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windows.png'
		},
		'9': {
			osFamily: 'Windows',
			osName: 'Windows Vista',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_Vista',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windowsvista.png'
		},
		'10': {
			osFamily: 'JVM',
			osName: 'JVM (Platform Micro Edition)',
			osUrl: 'http://en.wikipedia.org/wiki/Java_Platform,_Micro_Edition',
			osCompany: 'Sun Microsystems, Inc.',
			osCompanyUrl: 'http://en.wikipedia.org/wiki/Sun_Microsystems',
			osIcon: 'java.png'
		},
		'11': {
			osFamily: 'Linux',
			osName: 'Linux (CentOS)',
			osUrl: 'http://www.centos.org/',
			osCompany: 'CentOS Project',
			osCompanyUrl: 'http://www.centos.org/',
			osIcon: 'linux_centos.png'
		},
		'12': {
			osFamily: 'Linux',
			osName: 'Linux (Ubuntu)',
			osUrl: 'http://www.ubuntu.com/',
			osCompany: 'Canonical Ltd.',
			osCompanyUrl: 'http://www.canonical.com/',
			osIcon: 'linux_ubuntu.png'
		},
		'13': {
			osFamily: 'Linux',
			osName: 'Linux (Debian)',
			osUrl: 'http://www.debian.org/',
			osCompany: 'Software in the Public Interest, Inc.',
			osCompanyUrl: 'http://www.spi-inc.org/',
			osIcon: 'linux_debian.png'
		},
		'14': {
			osFamily: 'Linux',
			osName: 'Linux (Fedora)',
			osUrl: 'http://fedoraproject.org/',
			osCompany: 'Red Hat, Inc.',
			osCompanyUrl: 'http://www.redhat.com/',
			osIcon: 'linux_fedora.png'
		},
		'15': {
			osFamily: 'Linux',
			osName: 'Linux (Gentoo)',
			osUrl: 'http://www.gentoo.org/',
			osCompany: 'Gentoo Foundation, Inc.',
			osCompanyUrl: 'http://www.gentoo.org/foundation/en/',
			osIcon: 'linux_gentoo.png'
		},
		'16': {
			osFamily: 'Linux',
			osName: 'Linux (Linspire)',
			osUrl: 'http://en.wikipedia.org/wiki/Linspire',
			osCompany: 'Linspire, Inc.',
			osCompanyUrl: 'http://www.linspire.com/',
			osIcon: 'linux_linspire.png'
		},
		'17': {
			osFamily: 'Linux',
			osName: 'Linux (Mandriva)',
			osUrl: 'http://www.mandriva.com/',
			osCompany: '',
			osCompanyUrl: '',
			osIcon: 'linux_mandriva.png'
		},
		'18': {
			osFamily: 'Linux',
			osName: 'Linux (RedHat)',
			osUrl: 'http://en.wikipedia.org/wiki/Red_Hat_Enterprise_Linux',
			osCompany: 'Red Hat, Inc.',
			osCompanyUrl: 'http://www.redhat.com/',
			osIcon: 'linux_redhat.png'
		},
		'19': {
			osFamily: 'Linux',
			osName: 'Linux',
			osUrl: 'http://en.wikipedia.org/wiki/Linux',
			osCompany: '',
			osCompanyUrl: '',
			osIcon: 'linux.png'
		},
		'20': {
			osFamily: 'Linux',
			osName: 'Linux (Slackware)',
			osUrl: 'http://www.slackware.com/',
			osCompany: 'Slackware Linux, Inc.',
			osCompanyUrl: '',
			osIcon: 'linux_slackware.png'
		},
		'21': {
			osFamily: 'Linux',
			osName: 'Linux (Kanotix)',
			osUrl: 'http://kanotix.com/',
			osCompany: '',
			osCompanyUrl: '',
			osIcon: 'linux_kanotix.png'
		},
		'22': {
			osFamily: 'Linux',
			osName: 'Linux (SUSE)',
			osUrl: 'http://www.suse.com/',
			osCompany: 'Novell, Inc.',
			osCompanyUrl: 'http://www.novell.com/home/',
			osIcon: 'linux_suse.png'
		},
		'23': {
			osFamily: 'Linux',
			osName: 'Linux (Knoppix)',
			osUrl: 'http://knoppix.net/',
			osCompany: 'Klaus Knopper',
			osCompanyUrl: 'http://www.knopper.net/knopper/',
			osIcon: 'linux_knoppix.png'
		},
		'24': {
			osFamily: 'BSD',
			osName: 'NetBSD',
			osUrl: 'http://www.netbsd.org/',
			osCompany: 'NetBSD Foundation, Inc.',
			osCompanyUrl: '',
			osIcon: 'netbsd.png'
		},
		'25': {
			osFamily: 'BSD',
			osName: 'FreeBSD',
			osUrl: 'http://www.freebsd.org/',
			osCompany: 'FreeBSD Foundation',
			osCompanyUrl: 'http://www.freebsdfoundation.org/',
			osIcon: 'freebsd.png'
		},
		'26': {
			osFamily: 'BSD',
			osName: 'OpenBSD',
			osUrl: 'http://www.openbsd.org/',
			osCompany: '',
			osCompanyUrl: '',
			osIcon: 'openbsd.png'
		},
		'29': {
			osFamily: 'Solaris',
			osName: 'Solaris',
			osUrl: 'http://en.wikipedia.org/wiki/Solaris_%28operating_system%29',
			osCompany: 'Sun Microsystems, Inc.',
			osCompanyUrl: 'http://en.wikipedia.org/wiki/Sun_Microsystems',
			osIcon: 'solaris.png'
		},
		'30': {
			osFamily: 'Amiga OS',
			osName: 'Amiga OS',
			osUrl: 'http://www.amigaos.net/',
			osCompany: 'Commodore International Limited',
			osCompanyUrl: 'http://en.wikipedia.org/wiki/Commodore_International',
			osIcon: 'amiga.png'
		},
		'31': {
			osFamily: 'IRIX',
			osName: 'IRIX',
			osUrl: 'http://www.sgi.com/products/software/irix/',
			osCompany: 'Silicon Graphics, Inc.',
			osCompanyUrl: 'http://www.sgi.com/',
			osIcon: 'irix.png'
		},
		'32': {
			osFamily: 'OpenVMS',
			osName: 'OpenVMS',
			osUrl: 'http://h71000.www7.hp.com/',
			osCompany: 'Hewlett-Packard Development Company, L.P.',
			osCompanyUrl: 'http://www.hp.com/',
			osIcon: 'openvms.png'
		},
		'33': {
			osFamily: 'BeOS',
			osName: 'BeOS',
			osUrl: '',
			osCompany: 'Be, Inc.',
			osCompanyUrl: 'http://www.beincorporated.com/',
			osIcon: 'beos.png'
		},
		'34': {
			osFamily: 'Symbian OS',
			osName: 'Symbian OS',
			osUrl: 'http://en.wikipedia.org/wiki/Symbian_OS',
			osCompany: 'Symbian Foundation',
			osCompanyUrl: 'http://licensing.symbian.org/',
			osIcon: 'symbian.png'
		},
		'35': {
			osFamily: 'Palm OS',
			osName: 'Palm OS',
			osUrl: 'http://en.wikipedia.org/wiki/Palm_OS',
			osCompany: 'Palm, Inc.',
			osCompanyUrl: 'http://en.wikipedia.org/wiki/Palm,_Inc.',
			osIcon: 'palmos.png'
		},
		'37': {
			osFamily: 'Windows',
			osName: 'MSN TV (WebTV)',
			osUrl: 'http://en.wikipedia.org/wiki/MSN_TV',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'webtv.png'
		},
		'39': {
			osFamily: 'OS/2',
			osName: 'OS/2 Warp',
			osUrl: 'http://en.wikipedia.org/wiki/OS/2_Warp#The_.22Warp.22_years',
			osCompany: 'IBM Corporation',
			osCompanyUrl: 'http://www.ibm.com/',
			osIcon: 'os2warp.png'
		},
		'40': {
			osFamily: 'RISK OS',
			osName: 'RISK OS',
			osUrl: '',
			osCompany: 'RISCOS Ltd',
			osCompanyUrl: 'http://www.riscos.com/',
			osIcon: 'riskos.png'
		},
		'41': {
			osFamily: 'HP-UX',
			osName: 'HP-UX',
			osUrl: 'http://www.hp.com/products1/unix/',
			osCompany: 'Hewlett-Packard Development Company, L.P.',
			osCompanyUrl: 'http://www.hp.com/',
			osIcon: 'hpux.png'
		},
		'42': {
			osFamily: 'Nintendo',
			osName: 'Nintendo Wii',
			osUrl: 'http://en.wikipedia.org/wiki/Nintendo_Wii',
			osCompany: 'Nintendo of America Inc.',
			osCompanyUrl: 'http://www.nintendo.com/',
			osIcon: 'wii.png'
		},
		'43': {
			osFamily: 'Windows',
			osName: 'Windows',
			osUrl: 'http://en.wikipedia.org/wiki/Windows',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windows.png'
		},
		'44': {
			osFamily: 'Mac OS',
			osName: 'Mac OS',
			osUrl: 'http://en.wikipedia.org/wiki/Mac_OS',
			osCompany: 'Apple Computer, Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'macos.png'
		},
		'45': {
			osFamily: 'AIX',
			osName: 'AIX',
			osUrl: 'http://en.wikipedia.org/wiki/IBM_AIX',
			osCompany: 'IBM Corporation',
			osCompanyUrl: 'http://www.ibm.com/',
			osIcon: 'aix.png'
		},
		'46': {
			osFamily: 'Windows',
			osName: 'Windows NT',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_NT',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windows.png'
		},
		'47': {
			osFamily: 'JVM',
			osName: 'JVM (Java)',
			osUrl: 'http://en.wikipedia.org/wiki/Jvm',
			osCompany: 'Sun Microsystems, Inc.',
			osCompanyUrl: 'http://en.wikipedia.org/wiki/Sun_Microsystems',
			osIcon: 'java.png'
		},
		'49': {
			osFamily: 'Plan 9',
			osName: 'Plan 9',
			osUrl: 'http://plan9.bell-labs.com/plan9/',
			osCompany: 'Lucent Technologies',
			osCompanyUrl: 'http://www.lucent.com/',
			osIcon: 'plan9.png'
		},
		'50': {
			osFamily: 'BlackBerry OS',
			osName: 'BlackBerry OS',
			osUrl: 'http://en.wikipedia.org/wiki/BlackBerry_OS',
			osCompany: 'BlackBerry Ltd',
			osCompanyUrl: 'http://www.blackberry.com/',
			osIcon: 'rim_os.png'
		},
		'52': {
			osFamily: 'QNX',
			osName: 'QNX x86pc',
			osUrl: 'http://www.qnx.com/',
			osCompany: 'QNX Software Systems',
			osCompanyUrl: 'http://www.qnx.com/',
			osIcon: 'qnx.png'
		},
		'53': {
			osFamily: 'MorphOS',
			osName: 'MorphOS',
			osUrl: 'http://www.morphos-team.net/',
			osCompany: 'MorphOS development team',
			osCompanyUrl: '',
			osIcon: 'morphos.png'
		},
		'55': {
			osFamily: 'Linux',
			osName: 'Linux (VectorLinux)',
			osUrl: 'http://vectorlinux.com/',
			osCompany: 'Robert S. Lange',
			osCompanyUrl: '',
			osIcon: 'linux_vector.png'
		},
		'56': {
			osFamily: 'Linux',
			osName: 'Linux (Mint)',
			osUrl: 'http://linuxmint.com/',
			osCompany: 'clem',
			osCompanyUrl: '',
			osIcon: 'linuxmint.png'
		},
		'57': {
			osFamily: 'SCO',
			osName: 'SCO OpenServer',
			osUrl: 'http://www.sco.com/products/openserver/',
			osCompany: 'The SCO Group',
			osCompanyUrl: 'http://www.sco.com/',
			osIcon: 'sco.png'
		},
		'58': {
			osFamily: 'Linux',
			osName: 'Linux (Arch Linux)',
			osUrl: 'http://www.archlinux.org/',
			osCompany: 'Judd Vinet',
			osCompanyUrl: 'http://www.zeroflux.org/',
			osIcon: 'linux_archlinux.png'
		},
		'59': {
			osFamily: 'SkyOS',
			osName: 'SkyOS',
			osUrl: 'http://www.skyos.org/',
			osCompany: 'SkyOS Team',
			osCompanyUrl: 'http://www.skyos.org/',
			osIcon: 'skyos.png'
		},
		'61': {
			osFamily: 'BSD',
			osName: 'DragonFly BSD',
			osUrl: 'http://www.dragonflybsd.org/',
			osCompany: 'DragonFly BSD Team',
			osCompanyUrl: 'http://www.dragonflybsd.org/team/',
			osIcon: 'dragonflybsd.png'
		},
		'62': {
			osFamily: 'Android',
			osName: 'Android',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'64': {
			osFamily: 'Windows',
			osName: 'Windows 7',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_7',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windows-7.png'
		},
		'65': {
			osFamily: 'iOS',
			osName: 'iOS',
			osUrl: 'http://en.wikipedia.org/wiki/IOS',
			osCompany: 'Apple Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'iphone.png'
		},
		'69': {
			osFamily: 'webOS',
			osName: 'webOS',
			osUrl: 'http://en.wikipedia.org/wiki/WebOS',
			osCompany: 'Hewlett-Packard',
			osCompanyUrl: 'http://en.wikipedia.org/wiki/Palm,_Inc.',
			osIcon: 'webos.png'
		},
		'70': {
			osFamily: 'Haiku OS',
			osName: 'Haiku OS',
			osUrl: 'http://www.haiku-os.org/',
			osCompany: 'Haiku Inc.',
			osCompanyUrl: 'http://www.haiku-os.org/about/haiku_inc',
			osIcon: 'haiku.png'
		},
		'72': {
			osFamily: 'DangerOS',
			osName: 'Danger Hiptop',
			osUrl: 'http://en.wikipedia.org/wiki/DangerOS',
			osCompany: 'Danger, Inc.',
			osCompanyUrl: 'http://en.wikipedia.org/wiki/Danger_%28company%29',
			osIcon: 'dangeros.png'
		},
		'74': {
			osFamily: 'Syllable',
			osName: 'Syllable',
			osUrl: 'http://syllable.org/',
			osCompany: 'Kristian Van Der Vliet, Kaj de Vos, Rick Caudill, Arno Klenke, Henrik Isaksson',
			osCompanyUrl: '',
			osIcon: 'syllable.png'
		},
		'75': {
			osFamily: 'Linux',
			osName: 'Linux (Maemo)',
			osUrl: 'http://maemo.org/',
			osCompany: 'Nokia',
			osCompanyUrl: 'http://www.nokia.com/',
			osIcon: 'maemo.png'
		},
		'83': {
			osFamily: 'OS X',
			osName: 'OS X 10.4 Tiger',
			osUrl: 'http://www.apple.com/osx/',
			osCompany: 'Apple Computer, Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'macosx.png'
		},
		'84': {
			osFamily: 'OS X',
			osName: 'OS X 10.5 Leopard',
			osUrl: 'http://www.apple.com/osx/',
			osCompany: 'Apple Computer, Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'macosx.png'
		},
		'85': {
			osFamily: 'OS X',
			osName: 'OS X 10.6 Snow Leopard',
			osUrl: 'http://www.apple.com/osx/',
			osCompany: 'Apple Computer, Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'macosx.png'
		},
		'86': {
			osFamily: 'OS X',
			osName: 'OS X',
			osUrl: 'http://www.apple.com/osx/',
			osCompany: 'Apple Computer, Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'macosx.png'
		},
		'87': {
			osFamily: 'OS/2',
			osName: 'OS/2',
			osUrl: 'http://en.wikipedia.org/wiki/OS/2',
			osCompany: 'IBM Corporation',
			osCompanyUrl: 'http://www.ibm.com/',
			osIcon: 'os2.png'
		},
		'88': {
			osFamily: 'Windows',
			osName: 'Windows Mobile',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_Mobile',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windowsMobile.png'
		},
		'90': {
			osFamily: 'OS X',
			osName: 'OS X 10.3 Panther',
			osUrl: 'http://www.apple.com/osx/',
			osCompany: 'Apple Computer, Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'macosx.png'
		},
		'91': {
			osFamily: 'MINIX',
			osName: 'MINIX 3 ',
			osUrl: 'http://www.minix3.org/',
			osCompany: 'Andrew S. Tanenbaum',
			osCompanyUrl: 'http://www.cs.vu.nl/~ast/',
			osIcon: 'minix.png'
		},
		'92': {
			osFamily: 'Linux',
			osName: 'PClinuxOS',
			osUrl: 'http://www.pclinuxos.com/',
			osCompany: 'Bill Reynolds ("Texstar")',
			osCompanyUrl: '',
			osIcon: 'pclinuxos.png'
		},
		'93': {
			osFamily: 'Linux',
			osName: 'Joli OS',
			osUrl: 'http://www.jolicloud.com/',
			osCompany: 'Tariq Krim and Romain Huet',
			osCompanyUrl: '',
			osIcon: 'jolicloud.png'
		},
		'94': {
			osFamily: 'XrossMediaBar (XMB)',
			osName: 'XrossMediaBar (XMB)',
			osUrl: 'http://en.wikipedia.org/wiki/XrossMediaBar',
			osCompany: 'Sony Computer Entertainment',
			osCompanyUrl: 'http://www.scei.co.jp/',
			osIcon: 'XMB.png'
		},
		'95': {
			osFamily: 'AROS',
			osName: 'AROS',
			osUrl: 'http://en.wikipedia.org/wiki/AROS_Research_Operating_System',
			osCompany: 'AROS Development Team',
			osCompanyUrl: '',
			osIcon: 'aros.png'
		},
		'96': {
			osFamily: 'Windows',
			osName: 'Windows Phone 7',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_Phone_7',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windowsMobile.png'
		},
		'97': {
			osFamily: 'Linux',
			osName: 'Chrome OS',
			osUrl: 'http://en.wikipedia.org/wiki/Chrome_OS',
			osCompany: 'Google Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'ChromiumOS.png'
		},
		'98': {
			osFamily: 'Nintendo',
			osName: 'Nintendo DS',
			osUrl: 'http://www.nintendods.com/',
			osCompany: 'Nintendo of America Inc.',
			osCompanyUrl: 'http://www.nintendo.com/',
			osIcon: 'nintendoDS.png'
		},
		'99': {
			osFamily: 'Linux',
			osName: 'GNU OS',
			osUrl: 'http://www.gnu.org/',
			osCompany: 'Free Software Foundation, Inc.',
			osCompanyUrl: 'http://www.fsf.org/',
			osIcon: 'gnu_os.png'
		},
		'100': {
			osFamily: 'Windows',
			osName: 'Windows 8',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_8',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windows8.png'
		},
		'101': {
			osFamily: 'RIM OS',
			osName: 'BlackBerry Tablet OS 1',
			osUrl: 'http://en.wikipedia.org/wiki/BlackBerry_Tablet_OS',
			osCompany: 'Research In Motion Limited',
			osCompanyUrl: 'http://www.rim.com/',
			osIcon: 'rim_os.png'
		},
		'102': {
			osFamily: 'Bada',
			osName: 'Bada',
			osUrl: 'http://www.bada.com/',
			osCompany: 'Samsung Electronics',
			osCompanyUrl: 'http://www.samsung.com/',
			osIcon: 'bada.png'
		},
		'103': {
			osFamily: 'Android',
			osName: 'Android 1.5 Cupcake',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'104': {
			osFamily: 'Android',
			osName: 'Android 1.6 Donut',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'105': {
			osFamily: 'Android',
			osName: 'Android 2.0/1 Eclair',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'106': {
			osFamily: 'Android',
			osName: 'Android 2.2.x Froyo',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'107': {
			osFamily: 'Android',
			osName: 'Android 2.3.x Gingerbread',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'108': {
			osFamily: 'Android',
			osName: 'Android 3.x Honeycomb',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'110': {
			osFamily: 'Android',
			osName: 'Android 1.0',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'111': {
			osFamily: 'Android',
			osName: 'Android 4.0.x Ice Cream Sandwich',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'112': {
			osFamily: 'OS X',
			osName: 'OS X 10.7 Lion',
			osUrl: 'http://www.apple.com/osx/',
			osCompany: 'Apple Computer, Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'macosx.png'
		},
		'113': {
			osFamily: 'Tizen',
			osName: 'Tizen 1',
			osUrl: 'https://www.tizen.org/',
			osCompany: 'Tizen Project',
			osCompanyUrl: 'https://www.tizen.org/',
			osIcon: 'tizen.png'
		},
		'114': {
			osFamily: 'unknown',
			osName: 'unknown',
			osUrl: '',
			osCompany: '',
			osCompanyUrl: '',
			osIcon: 'unknown.png'
		},
		'115': {
			osFamily: 'Inferno OS',
			osName: 'Inferno OS',
			osUrl: 'http://en.wikipedia.org/wiki/Inferno_%28operating_system%29',
			osCompany: 'Vita Nuova Holdings Ltd',
			osCompanyUrl: 'http://www.vitanuova.com/',
			osIcon: 'inferno.png'
		},
		'116': {
			osFamily: 'OS X',
			osName: 'OS X 10.8 Mountain Lion',
			osUrl: 'http://www.apple.com/osx/',
			osCompany: 'Apple Computer, Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'macosx.png'
		},
		'117': {
			osFamily: 'iOS',
			osName: 'iOS 4',
			osUrl: 'http://en.wikipedia.org/wiki/IOS',
			osCompany: 'Apple Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'iphone.png'
		},
		'118': {
			osFamily: 'iOS',
			osName: 'iOS 5',
			osUrl: 'http://en.wikipedia.org/wiki/IOS_5',
			osCompany: 'Apple Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'iphone.png'
		},
		'119': {
			osFamily: 'RIM OS',
			osName: 'BlackBerry Tablet OS 2',
			osUrl: 'http://en.wikipedia.org/wiki/BlackBerry_Tablet_OS',
			osCompany: 'Research In Motion Limited',
			osCompanyUrl: 'http://www.rim.com/',
			osIcon: 'rim_os.png'
		},
		'120': {
			osFamily: 'Android',
			osName: 'Android 4.1.x Jelly Bean',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'121': {
			osFamily: 'iOS',
			osName: 'iOS 6',
			osUrl: 'http://en.wikipedia.org/wiki/IOS_6',
			osCompany: 'Apple Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'iphone.png'
		},
		'122': {
			osFamily: 'LiveArea',
			osName: 'LiveArea',
			osUrl: 'http://en.wikipedia.org/wiki/LiveArea',
			osCompany: 'Sony Computer Entertainment',
			osCompanyUrl: 'http://www.scei.co.jp/',
			osIcon: 'ps-vitaLiveArea.png'
		},
		'123': {
			osFamily: 'Windows',
			osName: 'Xbox patform',
			osUrl: 'http://en.wikipedia.org/wiki/Xbox#Operating_system',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'Xbox.png'
		},
		'124': {
			osFamily: 'Android',
			osName: 'Android 4.2 Jelly Bean',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'125': {
			osFamily: 'Firefox OS',
			osName: 'Firefox OS',
			osUrl: 'http://www.mozilla.org/firefoxos/',
			osCompany: 'Mozilla Foundation',
			osCompanyUrl: 'http://www.mozilla.org/',
			osIcon: 'firefoxos.png'
		},
		'126': {
			osFamily: 'Windows',
			osName: 'Windows RT',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_RT',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windows8.png'
		},
		'127': {
			osFamily: 'Windows',
			osName: 'Windows Phone 8',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_Phone_8',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'windowsPhone8.png'
		},
		'128': {
			osFamily: 'Linux',
			osName: 'Linux (Mageia)',
			osUrl: 'http://www.mageia.org/',
			osCompany: 'Mageia.Org',
			osCompanyUrl: 'http://www.mageia.org/',
			osIcon: 'linux_mageia.png'
		},
		'129': {
			osFamily: 'iOS',
			osName: 'iOS 7',
			osUrl: 'http://en.wikipedia.org/wiki/IOS_7',
			osCompany: 'Apple Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'iphone.png'
		},
		'130': {
			osFamily: 'Windows',
			osName: 'Windows 8.1',
			osUrl: 'http://en.wikipedia.org/wiki/Windows_8#Windows_8.1',
			osCompany: 'Microsoft Corporation.',
			osCompanyUrl: 'http://www.microsoft.com/',
			osIcon: 'win81.png'
		},
		'131': {
			osFamily: 'Android',
			osName: 'Android 4.3 Jelly Bean',
			osUrl: 'http://en.wikipedia.org/wiki/Android_%28operating_system%29',
			osCompany: 'Google, Inc.',
			osCompanyUrl: 'http://www.google.com/',
			osIcon: 'android.png'
		},
		'132': {
			osFamily: 'OS X',
			osName: 'OS X 10.9 Mavericks',
			osUrl: 'http://www.apple.com/osx/',
			osCompany: 'Apple Computer, Inc.',
			osCompanyUrl: 'http://www.apple.com/',
			osIcon: 'macosx.png'
		},
		'133': {
			osFamily: 'Nintendo',
			osName: 'Nintendo 3DS',
			osUrl: 'http://www.nintendo.com/3ds',
			osCompany: 'Nintendo of America Inc.',
			osCompanyUrl: 'http://www.nintendo.com/',
			osIcon: 'nintendoDS.png'
		},
		'134': {
			osFamily: 'Tizen',
			osName: 'Tizen 2',
			osUrl: 'https://www.tizen.org/',
			osCompany: 'Tizen Project',
			osCompanyUrl: 'https://www.tizen.org/',
			osIcon: 'tizen.png'
		},
		order: [
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'10',
			'11',
			'12',
			'13',
			'14',
			'15',
			'16',
			'17',
			'18',
			'19',
			'20',
			'21',
			'22',
			'23',
			'24',
			'25',
			'26',
			'29',
			'30',
			'31',
			'32',
			'33',
			'34',
			'35',
			'37',
			'39',
			'40',
			'41',
			'42',
			'43',
			'44',
			'45',
			'46',
			'47',
			'49',
			'50',
			'52',
			'53',
			'55',
			'56',
			'57',
			'58',
			'59',
			'61',
			'62',
			'64',
			'65',
			'69',
			'70',
			'72',
			'74',
			'75',
			'83',
			'84',
			'85',
			'86',
			'87',
			'88',
			'90',
			'91',
			'92',
			'93',
			'94',
			'95',
			'96',
			'97',
			'98',
			'99',
			'100',
			'101',
			'102',
			'103',
			'104',
			'105',
			'106',
			'107',
			'108',
			'110',
			'111',
			'112',
			'113',
			'114',
			'115',
			'116',
			'117',
			'118',
			'119',
			'120',
			'121',
			'122',
			'123',
			'124',
			'125',
			'126',
			'127',
			'128',
			'129',
			'130',
			'131',
			'132',
			'133',
			'134'
		]
	},
	browser: {
		'1': {
			typeId: '0',
			metadata: {
				uaFamily: 'Camino',
				uaUrl: 'http://caminobrowser.org/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'camino.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Camino'
			}
		},
		'2': {
			typeId: '0',
			metadata: {
				uaFamily: 'SeaMonkey',
				uaUrl: 'http://www.seamonkey-project.org/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'seamonkey.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SeaMonkey'
			}
		},
		'3': {
			typeId: '0',
			metadata: {
				uaFamily: 'Firefox',
				uaUrl: 'http://www.firefox.com/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'firefox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Firefox'
			}
		},
		'4': {
			typeId: '0',
			metadata: {
				uaFamily: 'Netscape Navigator',
				uaUrl: 'http://en.wikipedia.org/wiki/Netscape_Navigator',
				uaCompany: 'Netscape Communications Corp.',
				uaCompanyUrl: 'http://en.wikipedia.org/wiki/Netscape_Communications_Corporation',
				uaIcon: 'netscape.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Netscape Navigator'
			}
		},
		'5': {
			typeId: '0',
			metadata: {
				uaFamily: 'Epiphany',
				uaUrl: 'http://projects.gnome.org/epiphany/',
				uaCompany: 'GNOME Foundation',
				uaCompanyUrl: 'http://www.gnome.org/',
				uaIcon: 'epiphany.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Epiphany'
			}
		},
		'6': {
			typeId: '0',
			metadata: {
				uaFamily: 'Galeon',
				uaUrl: 'http://galeon.sourceforge.net/',
				uaCompany: 'GNOME Foundation',
				uaCompanyUrl: 'http://www.gnome.org/',
				uaIcon: 'galeon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Galeon'
			}
		},
		'7': {
			typeId: '0',
			metadata: {
				uaFamily: 'Flock',
				uaUrl: 'http://en.wikipedia.org/wiki/Flock_%28web_browser%29',
				uaCompany: 'Flock, Inc.',
				uaCompanyUrl: '',
				uaIcon: 'flock.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Flock'
			}
		},
		'8': {
			typeId: '3',
			metadata: {
				uaFamily: 'Minimo',
				uaUrl: 'http://www.mozilla.org/projects/minimo/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'minimo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Minimo'
			}
		},
		'9': {
			typeId: '0',
			metadata: {
				uaFamily: 'K-Meleon',
				uaUrl: 'http://kmeleon.sourceforge.net/',
				uaCompany: 'Christophe Thibault, Dorian ...',
				uaCompanyUrl: '',
				uaIcon: 'k-meleon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=K-Meleon'
			}
		},
		'10': {
			typeId: '0',
			metadata: {
				uaFamily: 'K-Ninja',
				uaUrl: 'http://www.geocities.com/grenleef/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'k-ninja.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=K-Ninja'
			}
		},
		'11': {
			typeId: '0',
			metadata: {
				uaFamily: 'Kazehakase',
				uaUrl: 'http://kazehakase.sourceforge.jp/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'kazehakase.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Kazehakase'
			}
		},
		'14': {
			typeId: '0',
			metadata: {
				uaFamily: 'Firebird (old name for Firefox)',
				uaUrl: 'http://www.firefox.com/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'phoenix.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Firebird (old name for Firefox)'
			}
		},
		'15': {
			typeId: '0',
			metadata: {
				uaFamily: 'Phoenix (old name for Firefox)',
				uaUrl: 'http://en.wikipedia.org/wiki/Mozilla_Phoenix',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'phoenix.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Phoenix (old name for Firefox)'
			}
		},
		'16': {
			typeId: '0',
			metadata: {
				uaFamily: 'Konqueror',
				uaUrl: 'http://www.konqueror.org/',
				uaCompany: 'KDE e.V.',
				uaCompanyUrl: 'http://ev.kde.org/',
				uaIcon: 'konqueror2.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Konqueror'
			}
		},
		'17': {
			typeId: '0',
			metadata: {
				uaFamily: 'Opera',
				uaUrl: 'http://www.opera.com/',
				uaCompany: 'Opera Software ASA.',
				uaCompanyUrl: 'http://www.opera.com/',
				uaIcon: 'opera.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Opera'
			}
		},
		'18': {
			typeId: '0',
			metadata: {
				uaFamily: 'OmniWeb',
				uaUrl: 'http://www.omnigroup.com/applications/omniweb/',
				uaCompany: 'Omni Development, Inc.',
				uaCompanyUrl: 'http://www.omnigroup.com/',
				uaIcon: 'omniweb.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=OmniWeb'
			}
		},
		'19': {
			typeId: '0',
			metadata: {
				uaFamily: 'Sunrise',
				uaUrl: 'http://www.sunrisebrowser.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'sunrise.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Sunrise'
			}
		},
		'21': {
			typeId: '0',
			metadata: {
				uaFamily: 'Shiira',
				uaUrl: 'http://en.wikipedia.org/wiki/Shiira',
				uaCompany: 'Shiira Project',
				uaCompanyUrl: '',
				uaIcon: 'shiira.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Shiira'
			}
		},
		'22': {
			typeId: '0',
			metadata: {
				uaFamily: 'Safari',
				uaUrl: 'http://en.wikipedia.org/wiki/Safari_%28web_browser%29',
				uaCompany: 'Apple Inc.',
				uaCompanyUrl: 'http://www.apple.com/',
				uaIcon: 'safari.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Safari'
			}
		},
		'23': {
			typeId: '0',
			metadata: {
				uaFamily: 'Dillo',
				uaUrl: 'http://www.dillo.org/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'dillo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Dillo'
			}
		},
		'24': {
			typeId: '0',
			metadata: {
				uaFamily: 'iCab',
				uaUrl: 'http://www.icab.de/',
				uaCompany: 'Alexander Clauss',
				uaCompanyUrl: '',
				uaIcon: 'icab.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=iCab'
			}
		},
		'25': {
			typeId: '0',
			metadata: {
				uaFamily: 'Lynx',
				uaUrl: 'http://lynx.isc.org/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'lynx.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Lynx'
			}
		},
		'27': {
			typeId: '0',
			metadata: {
				uaFamily: 'Elinks',
				uaUrl: 'http://elinks.or.cz/',
				uaCompany: 'Mikulas Patocka',
				uaCompanyUrl: '',
				uaIcon: 'elinks.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Elinks'
			}
		},
		'28': {
			typeId: '1',
			metadata: {
				uaFamily: 'Wget',
				uaUrl: 'http://www.gnu.org/software/wget/',
				uaCompany: 'Free Software Foundation, Inc.',
				uaCompanyUrl: 'http://www.gnu.org/',
				uaIcon: 'wget.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Wget'
			}
		},
		'29': {
			typeId: '0',
			metadata: {
				uaFamily: 'Amiga Aweb',
				uaUrl: 'http://www.amitrix.com/aweb.html',
				uaCompany: 'AmiTrix Development Inc.',
				uaCompanyUrl: 'http://www.amitrix.com/',
				uaIcon: 'aweb.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Amiga Aweb'
			}
		},
		'30': {
			typeId: '0',
			metadata: {
				uaFamily: 'Amiga Voyager',
				uaUrl: 'http://v3.vapor.com/',
				uaCompany: 'VaporWare',
				uaCompanyUrl: 'http://www.vapor.com/',
				uaIcon: 'voyager.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Amiga Voyager'
			}
		},
		'31': {
			typeId: '0',
			metadata: {
				uaFamily: 'IBrowse',
				uaUrl: 'http://www.ibrowse-dev.net/',
				uaCompany: 'Stefan Burstr\xf6m',
				uaCompanyUrl: '',
				uaIcon: 'ibrowse.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=IBrowse'
			}
		},
		'32': {
			typeId: '3',
			metadata: {
				uaFamily: 'Openwave Mobile Browser',
				uaUrl: 'http://www.openwave.com/',
				uaCompany: 'Openwave Systems Inc.',
				uaCompanyUrl: 'http://www.openwave.com/',
				uaIcon: 'openwave.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Openwave Mobile Browser'
			}
		},
		'33': {
			typeId: '3',
			metadata: {
				uaFamily: 'NetFront',
				uaUrl: 'http://www.access-company.com/',
				uaCompany: 'ACCESS CO.,LTD',
				uaCompanyUrl: 'http://www.access-company.com/',
				uaIcon: 'netfront.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NetFront'
			}
		},
		'35': {
			typeId: '0',
			metadata: {
				uaFamily: 'IE',
				uaUrl: 'http://en.wikipedia.org/wiki/Internet_Explorer',
				uaCompany: 'Microsoft Corporation.',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'msie.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=IE'
			}
		},
		'39': {
			typeId: '1',
			metadata: {
				uaFamily: 'Offline Explorer',
				uaUrl: 'http://www.metaproducts.com/',
				uaCompany: 'MetaProducts Corporation.',
				uaCompanyUrl: '',
				uaIcon: 'offline_explorer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Offline Explorer'
			}
		},
		'40': {
			typeId: '0',
			metadata: {
				uaFamily: 'AOL Explorer',
				uaUrl: 'http://daol.aol.com/software/',
				uaCompany: 'America Online, Inc.',
				uaCompanyUrl: 'http://www.aol.com/',
				uaIcon: 'aol.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=AOL Explorer'
			}
		},
		'41': {
			typeId: '0',
			metadata: {
				uaFamily: 'Avant Browser',
				uaUrl: 'http://avantbrowser.com/',
				uaCompany: 'Avant Force',
				uaCompanyUrl: 'http://avantbrowser.com/',
				uaIcon: 'avantbrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Avant Browser'
			}
		},
		'42': {
			typeId: '1',
			metadata: {
				uaFamily: 'AvantGo',
				uaUrl: 'http://en.wikipedia.org/wiki/AvantGo',
				uaCompany: 'Sybase Inc.',
				uaCompanyUrl: 'http://www.sybase.com/',
				uaIcon: 'avantgo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=AvantGo'
			}
		},
		'43': {
			typeId: '3',
			metadata: {
				uaFamily: 'Blazer',
				uaUrl: 'http://en.wikipedia.org/wiki/Blazer_(web_browser)',
				uaCompany: 'Bluelark Systems',
				uaCompanyUrl: '',
				uaIcon: 'blazer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Blazer'
			}
		},
		'44': {
			typeId: '0',
			metadata: {
				uaFamily: 'Crazy Browser',
				uaUrl: 'http://www.crazybrowser.com/',
				uaCompany: 'CrazyBrowser.com',
				uaCompanyUrl: 'http://www.crazybrowser.com/',
				uaIcon: 'crazybrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Crazy Browser'
			}
		},
		'45': {
			typeId: '0',
			metadata: {
				uaFamily: 'Deepnet Explorer',
				uaUrl: 'http://www.deepnetexplorer.com/',
				uaCompany: 'Deepnet Technologies Ltd',
				uaCompanyUrl: 'http://www.deepnetexplorer.com/',
				uaIcon: 'deepnet.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Deepnet Explorer'
			}
		},
		'46': {
			typeId: '1',
			metadata: {
				uaFamily: 'HTTrack',
				uaUrl: 'http://www.httrack.com/',
				uaCompany: 'Xavier Roche',
				uaCompanyUrl: 'http://www.httrack.com/',
				uaIcon: 'httrack.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=HTTrack'
			}
		},
		'47': {
			typeId: '0',
			metadata: {
				uaFamily: 'IceWeasel',
				uaUrl: 'http://www.gnu.org/software/gnuzilla/',
				uaCompany: 'Software in the Public Interest, Inc.',
				uaCompanyUrl: 'http://www.spi-inc.org/',
				uaIcon: 'iceweasel.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=IceWeasel'
			}
		},
		'48': {
			typeId: '0',
			metadata: {
				uaFamily: 'iRider',
				uaUrl: 'http://www.irider.com/irider/index.htm',
				uaCompany: 'Wymea Bay',
				uaCompanyUrl: 'http://www.irider.com/company/index.htm',
				uaIcon: 'irider.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=iRider'
			}
		},
		'49': {
			typeId: '1',
			metadata: {
				uaFamily: 'iSiloX',
				uaUrl: 'http://www.isilox.com/',
				uaCompany: 'DC & Co.',
				uaCompanyUrl: 'http://www.isilox.com/',
				uaIcon: 'isilox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=iSiloX'
			}
		},
		'50': {
			typeId: '0',
			metadata: {
				uaFamily: 'KKman',
				uaUrl: 'http://www.kkbox.com.tw/kkman/index.html',
				uaCompany: 'KKBOX Inc. ',
				uaCompanyUrl: 'http://www.kkbox-inc.com/',
				uaIcon: 'kkman.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=KKman'
			}
		},
		'51': {
			typeId: '5',
			metadata: {
				uaFamily: 'libwww-perl',
				uaUrl: 'http://search.cpan.org/dist/libwww-perl/',
				uaCompany: 'Gisle Aas',
				uaCompanyUrl: '',
				uaIcon: 'libwwwperl.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=libwww-perl'
			}
		},
		'52': {
			typeId: '0',
			metadata: {
				uaFamily: 'Lunascape',
				uaUrl: 'http://www.lunascape.tv/',
				uaCompany: 'Lunascape & Co., Ltd.',
				uaCompanyUrl: 'http://www.lunascape.co.jp/',
				uaIcon: 'lunascape.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Lunascape'
			}
		},
		'53': {
			typeId: '0',
			metadata: {
				uaFamily: 'Maxthon',
				uaUrl: 'http://www.maxthon.com/',
				uaCompany: 'Maxthon International Limited.',
				uaCompanyUrl: 'http://www.maxthon.com/',
				uaIcon: 'maxthon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Maxthon'
			}
		},
		'54': {
			typeId: '0',
			metadata: {
				uaFamily: 'Mozilla',
				uaUrl: 'http://en.wikipedia.org/wiki/Mozilla',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.com/',
				uaIcon: 'mozilla.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Mozilla'
			}
		},
		'55': {
			typeId: '0',
			metadata: {
				uaFamily: 'MultiZilla',
				uaUrl: 'http://multizilla.mozdev.org/',
				uaCompany: 'HJ van Rantwijk',
				uaCompanyUrl: 'http://multizilla.mozdev.org/',
				uaIcon: 'multizilla.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=MultiZilla'
			}
		},
		'56': {
			typeId: '0',
			metadata: {
				uaFamily: 'NetCaptor',
				uaUrl: 'http://en.wikipedia.org/wiki/NetCaptor',
				uaCompany: 'Stilesoft Inc.',
				uaCompanyUrl: '',
				uaIcon: 'netcaptor.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NetCaptor'
			}
		},
		'57': {
			typeId: '0',
			metadata: {
				uaFamily: 'NetBox',
				uaUrl: 'http://www.netgem.com/',
				uaCompany: 'Netgem',
				uaCompanyUrl: 'http://www.netgem.com/',
				uaIcon: 'netgem.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NetBox'
			}
		},
		'58': {
			typeId: '0',
			metadata: {
				uaFamily: 'NetSurf',
				uaUrl: 'http://www.netsurf-browser.org/',
				uaCompany: "NetSurf's Development Team",
				uaCompanyUrl: 'http://www.netsurf-browser.org/about/team',
				uaIcon: 'netsurf.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NetSurf'
			}
		},
		'59': {
			typeId: '0',
			metadata: {
				uaFamily: 'Sleipnir',
				uaUrl: 'http://en.wikipedia.org/wiki/Sleipnir_%28browser%29',
				uaCompany: 'Fenrir Inc.',
				uaCompanyUrl: 'http://www.fenrir-inc.com/',
				uaIcon: 'sleipnir.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Sleipnir'
			}
		},
		'61': {
			typeId: '0',
			metadata: {
				uaFamily: 'Swiftfox',
				uaUrl: 'http://www.getswiftfox.com/',
				uaCompany: 'Jason Halme',
				uaCompanyUrl: '',
				uaIcon: 'swiftfox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Swiftfox'
			}
		},
		'62': {
			typeId: '1',
			metadata: {
				uaFamily: 'Teleport Pro',
				uaUrl: 'http://www.tenmax.com/teleport/pro/home.htm',
				uaCompany: 'Tennyson Maxwell Information Systems, Inc.',
				uaCompanyUrl: 'http://www.tenmax.com/',
				uaIcon: 'teleportpro.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Teleport Pro'
			}
		},
		'71': {
			typeId: '1',
			metadata: {
				uaFamily: 'WebCopier',
				uaUrl: 'http://www.maximumsoft.com/products/wc_index.html',
				uaCompany: 'MaximumSoft Corp.',
				uaCompanyUrl: 'http://www.maximumsoft.com/',
				uaIcon: 'webcopier.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WebCopier'
			}
		},
		'74': {
			typeId: '0',
			metadata: {
				uaFamily: 'Phaseout',
				uaUrl: 'http://www.phaseout.net/',
				uaCompany: 'PhaseOut.net',
				uaCompanyUrl: 'http://www.phaseout.net/',
				uaIcon: 'phaseout.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Phaseout'
			}
		},
		'79': {
			typeId: '4',
			metadata: {
				uaFamily: 'Thunderbird',
				uaUrl: 'http://www.mozilla.com/en-US/thunderbird/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'thunderbird.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Thunderbird'
			}
		},
		'81': {
			typeId: '3',
			metadata: {
				uaFamily: 'Doris',
				uaUrl: 'http://www.anygraaf.fi/browser/indexe.htm',
				uaCompany: 'Anygraaf',
				uaCompanyUrl: 'http://www.anygraaf.fi/',
				uaIcon: 'doris.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Doris'
			}
		},
		'82': {
			typeId: '0',
			metadata: {
				uaFamily: 'Enigma browser',
				uaUrl: 'http://www.suttondesigns.com/',
				uaCompany: 'Advanced Search Technologies, Inc.',
				uaCompanyUrl: 'http://www.advancedsearchcorp.com/',
				uaIcon: 'enigmabrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Enigma browser'
			}
		},
		'85': {
			typeId: '5',
			metadata: {
				uaFamily: 'Jakarta Commons-HttpClient',
				uaUrl: 'http://jakarta.apache.org/commons/httpclient/',
				uaCompany: 'Apache Software Foundation',
				uaCompanyUrl: 'http://www.apache.org/',
				uaIcon: 'jakarta.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Jakarta Commons-HttpClient'
			}
		},
		'86': {
			typeId: '5',
			metadata: {
				uaFamily: 'cURL',
				uaUrl: 'http://curl.haxx.se/',
				uaCompany: 'team Haxx',
				uaCompanyUrl: 'http://www.haxx.se/',
				uaIcon: 'curl.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=cURL'
			}
		},
		'87': {
			typeId: '0',
			metadata: {
				uaFamily: 'Amaya',
				uaUrl: 'http://www.w3.org/Amaya/',
				uaCompany: 'World Wide Web Consortium',
				uaCompanyUrl: 'http://www.w3.org/',
				uaIcon: 'amaya.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Amaya'
			}
		},
		'88': {
			typeId: '1',
			metadata: {
				uaFamily: 'GetRight',
				uaUrl: 'http://www.getright.com/',
				uaCompany: 'Headlight Software, Inc.',
				uaCompanyUrl: 'http://www.headlightinc.com/',
				uaIcon: 'getright.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GetRight'
			}
		},
		'89': {
			typeId: '0',
			metadata: {
				uaFamily: 'Off By One',
				uaUrl: 'http://offbyone.com/',
				uaCompany: 'Home Page Software Inc.',
				uaCompanyUrl: 'http://homepagesw.com/',
				uaIcon: 'offbyone.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Off By One'
			}
		},
		'90': {
			typeId: '5',
			metadata: {
				uaFamily: 'Python-urllib',
				uaUrl: 'http://www.python.org/doc/current/lib/module-urllib.html',
				uaCompany: 'Python Software Foundation',
				uaCompanyUrl: 'http://www.python.org/psf/',
				uaIcon: 'pythonurllib.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Python-urllib'
			}
		},
		'91': {
			typeId: '0',
			metadata: {
				uaFamily: 'w3m',
				uaUrl: 'http://w3m.sourceforge.net/',
				uaCompany: 'Sakamoto Hironori',
				uaCompanyUrl: 'http://www2u.biglobe.ne.jp/%7Ehsaka/',
				uaIcon: 'w3m.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=w3m'
			}
		},
		'93': {
			typeId: '1',
			metadata: {
				uaFamily: 'WebZIP',
				uaUrl: 'http://www.spidersoft.com/webzip/',
				uaCompany: 'Spidersoft',
				uaCompanyUrl: 'http://www.spidersoft.com/',
				uaIcon: 'webzip.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WebZIP'
			}
		},
		'94': {
			typeId: '0',
			metadata: {
				uaFamily: 'ICE browser',
				uaUrl: 'http://www.icesoft.com/products/icebrowser.html',
				uaCompany: 'ICEsoft Technologies Inc.',
				uaCompanyUrl: 'http://www.icesoft.com/',
				uaIcon: 'icebrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=ICE browser'
			}
		},
		'96': {
			typeId: '0',
			metadata: {
				uaFamily: 'IceApe',
				uaUrl: 'http://www.debian.org/',
				uaCompany: 'Software in the Public Interest, Inc.',
				uaCompanyUrl: 'http://www.spi-inc.org/',
				uaIcon: 'seamonkey.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=IceApe'
			}
		},
		'99': {
			typeId: '0',
			metadata: {
				uaFamily: 'HotJava',
				uaUrl: 'http://java.sun.com/products/archive/hotjava/index.html',
				uaCompany: 'Sun Microsystems, Inc.',
				uaCompanyUrl: 'http://www.sun.com/',
				uaIcon: 'hotjava.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=HotJava'
			}
		},
		'100': {
			typeId: '1',
			metadata: {
				uaFamily: 'JoBo',
				uaUrl: 'http://www.matuschek.net/jobo/',
				uaCompany: 'Daniel Matuschek',
				uaCompanyUrl: 'http://www.matuschek.net/',
				uaIcon: 'jobo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=JoBo'
			}
		},
		'105': {
			typeId: '5',
			metadata: {
				uaFamily: 'POE-Component-Client-HTTP',
				uaUrl: 'http://search.cpan.org/dist/POE-Component-Client-HTTP/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'perl.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=POE-Component-Client-HTTP'
			}
		},
		'111': {
			typeId: '5',
			metadata: {
				uaFamily: 'Snoopy',
				uaUrl: 'http://sourceforge.net/projects/snoopy',
				uaCompany: 'Andrei Zmievski',
				uaCompanyUrl: '',
				uaIcon: 'unknown.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Snoopy'
			}
		},
		'117': {
			typeId: '0',
			metadata: {
				uaFamily: 'NCSA Mosaic',
				uaUrl: 'http://www.ncsa.uiuc.edu/Projects/mosaic.html',
				uaCompany: 'NCSA',
				uaCompanyUrl: 'http://www.ncsa.uiuc.edu/',
				uaIcon: 'ncsa.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NCSA Mosaic'
			}
		},
		'119': {
			typeId: '0',
			metadata: {
				uaFamily: 'Kapiko',
				uaUrl: 'http://ufoxlab.googlepages.com/',
				uaCompany: 'Ufox lab.',
				uaCompanyUrl: '',
				uaIcon: 'kapiko.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Kapiko'
			}
		},
		'120': {
			typeId: '0',
			metadata: {
				uaFamily: 'Chrome',
				uaUrl: 'http://www.google.com/chrome',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'chrome.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Chrome'
			}
		},
		'121': {
			typeId: '5',
			metadata: {
				uaFamily: 'Adobe AIR runtime',
				uaUrl: 'http://www.adobe.com/products/air/',
				uaCompany: 'Adobe Systems',
				uaCompanyUrl: 'http://www.adobe.com/',
				uaIcon: 'adobeair.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Adobe AIR runtime'
			}
		},
		'122': {
			typeId: '5',
			metadata: {
				uaFamily: 'LWP::Simple',
				uaUrl: 'http://search.cpan.org/perldoc?LWP::Simple',
				uaCompany: 'CPAN',
				uaCompanyUrl: 'http://cpan.org/',
				uaIcon: 'lwp.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=LWP::Simple'
			}
		},
		'123': {
			typeId: '5',
			metadata: {
				uaFamily: 'WWW::Mechanize',
				uaUrl: 'http://search.cpan.org/dist/WWW-Mechanize/',
				uaCompany: 'CPAN',
				uaCompanyUrl: 'http://cpan.org/',
				uaIcon: 'lwp.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WWW::Mechanize'
			}
		},
		'124': {
			typeId: '10',
			metadata: {
				uaFamily: 'Xenu',
				uaUrl: 'http://home.snafu.de/tilman/xenulink.html',
				uaCompany: 'Tilman Hausherr',
				uaCompanyUrl: 'http://home.snafu.de/tilman/index.html',
				uaIcon: 'xenu.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Xenu'
			}
		},
		'125': {
			typeId: '1',
			metadata: {
				uaFamily: 'SiteSucker',
				uaUrl: 'http://www.sitesucker.us/',
				uaCompany: 'Rick Cranisky',
				uaCompanyUrl: '',
				uaIcon: 'sitesucker.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SiteSucker'
			}
		},
		'126': {
			typeId: '0',
			metadata: {
				uaFamily: 'Arora',
				uaUrl: 'http://arora.googlecode.com/',
				uaCompany: 'Benjamin Meyer',
				uaCompanyUrl: 'http://www.blogger.com/profile/00185079236289035707',
				uaIcon: 'arora.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Arora'
			}
		},
		'128': {
			typeId: '0',
			metadata: {
				uaFamily: 'Firefox (Shiretoko)',
				uaUrl: 'http://www.mozilla.org/projects/firefox/3.1a1/releasenotes/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'firefox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Firefox (Shiretoko)'
			}
		},
		'129': {
			typeId: '0',
			metadata: {
				uaFamily: 'Firefox (Minefield)',
				uaUrl: 'http://www.mozilla.org/projects/minefield/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'firefox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Firefox (Minefield)'
			}
		},
		'130': {
			typeId: '0',
			metadata: {
				uaFamily: 'Iron',
				uaUrl: 'http://www.srware.net/en/software_srware_iron.php',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'iron.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Iron'
			}
		},
		'131': {
			typeId: '0',
			metadata: {
				uaFamily: 'Lobo',
				uaUrl: 'http://lobobrowser.org/java-browser.jsp',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'lobo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Lobo'
			}
		},
		'132': {
			typeId: '0',
			metadata: {
				uaFamily: 'Links',
				uaUrl: 'http://links.twibright.com/',
				uaCompany: 'Twibright Labs',
				uaCompanyUrl: 'http://twibright.com/',
				uaIcon: 'links2.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Links'
			}
		},
		'133': {
			typeId: '3',
			metadata: {
				uaFamily: 'Mobile Firefox',
				uaUrl: 'http://www.mozilla.com/mobile/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'firefox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Mobile Firefox'
			}
		},
		'134': {
			typeId: '4',
			metadata: {
				uaFamily: 'Lotus Notes',
				uaUrl: 'http://www.ibm.com/software/lotus/products/notes/',
				uaCompany: 'IBM',
				uaCompanyUrl: 'http://www.ibm.com/',
				uaIcon: 'lotusnotes.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Lotus Notes'
			}
		},
		'135': {
			typeId: '6',
			metadata: {
				uaFamily: 'Klondike',
				uaUrl: 'http://web.archive.org/web/20071012053920/www.apachesoftware.com/products.html',
				uaCompany: 'Apache Software Consulting Inc.',
				uaCompanyUrl: 'http://web.archive.org/web/*/www.apachesoftware.com',
				uaIcon: 'klondike.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Klondike'
			}
		},
		'136': {
			typeId: '6',
			metadata: {
				uaFamily: 'WapTiger',
				uaUrl: 'http://www.waptiger.com/waptiger/',
				uaCompany: 'infotiger',
				uaCompanyUrl: 'http://www.infotiger.com/',
				uaIcon: 'wap.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WapTiger'
			}
		},
		'137': {
			typeId: '10',
			metadata: {
				uaFamily: 'W3C Validator',
				uaUrl: 'http://validator.w3.org/',
				uaCompany: 'World Wide Web Consortium',
				uaCompanyUrl: 'http://www.w3.org/',
				uaIcon: 'w3.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=W3C Validator'
			}
		},
		'138': {
			typeId: '10',
			metadata: {
				uaFamily: 'W3C Checklink',
				uaUrl: 'http://validator.w3.org/checklink',
				uaCompany: 'World Wide Web Consortium',
				uaCompanyUrl: 'http://www.w3.org/',
				uaIcon: 'w3.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=W3C Checklink'
			}
		},
		'139': {
			typeId: '10',
			metadata: {
				uaFamily: 'HTMLParser',
				uaUrl: 'http://htmlparser.sourceforge.net/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'htmlparser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=HTMLParser'
			}
		},
		'140': {
			typeId: '5',
			metadata: {
				uaFamily: 'Java',
				uaUrl: 'http://www.sun.com/java/',
				uaCompany: 'Sun Microsystems, Inc.',
				uaCompanyUrl: 'http://www.sun.com/',
				uaIcon: 'java.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Java'
			}
		},
		'141': {
			typeId: '0',
			metadata: {
				uaFamily: 'Bolt',
				uaUrl: 'http://boltbrowser.com/',
				uaCompany: 'Bitstream',
				uaCompanyUrl: '',
				uaIcon: 'bolt.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Bolt'
			}
		},
		'142': {
			typeId: '0',
			metadata: {
				uaFamily: 'Demeter',
				uaUrl: 'http://www.hurrikenux.com/Demeter/',
				uaCompany: 'hurrikenux Creative',
				uaCompanyUrl: 'http://www.hurrikenux.com/',
				uaIcon: 'demeter.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Demeter'
			}
		},
		'143': {
			typeId: '5',
			metadata: {
				uaFamily: 'FeedParser',
				uaUrl: 'http://feedparser.org/',
				uaCompany: 'Mark Pilgrim',
				uaCompanyUrl: 'http://diveintomark.org/',
				uaIcon: 'lib.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=FeedParser'
			}
		},
		'144': {
			typeId: '0',
			metadata: {
				uaFamily: 'Orca',
				uaUrl: 'http://www.orcabrowser.com/',
				uaCompany: 'Avant Force team',
				uaCompanyUrl: 'http://www.avantforce.com/',
				uaIcon: 'orca.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Orca'
			}
		},
		'145': {
			typeId: '0',
			metadata: {
				uaFamily: 'Fluid',
				uaUrl: 'http://fluidapp.com/',
				uaCompany: 'Todd Ditchendorf',
				uaCompanyUrl: 'http://www.ditchnet.org/wp/',
				uaIcon: 'fluid.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Fluid'
			}
		},
		'146': {
			typeId: '20',
			metadata: {
				uaFamily: 'Bookdog',
				uaUrl: 'http://sheepsystems.com/products/bookdog/',
				uaCompany: 'Sheep Systems',
				uaCompanyUrl: 'http://sheepsystems.com/',
				uaIcon: 'bookdog.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Bookdog'
			}
		},
		'147': {
			typeId: '50',
			metadata: {
				uaFamily: 'Anonymouse.org',
				uaUrl: 'http://anonymouse.org/',
				uaCompany: 'Anonymous S.A.',
				uaCompanyUrl: 'http://anonymouse.org/',
				uaIcon: 'anonymouse_org.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Anonymouse.org'
			}
		},
		'148': {
			typeId: '0',
			metadata: {
				uaFamily: 'Midori',
				uaUrl: 'http://twotoasts.de/index.php/midori/',
				uaCompany: 'Christian Dywan',
				uaCompanyUrl: 'http://www.twotoasts.de/',
				uaIcon: 'midori.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Midori'
			}
		},
		'149': {
			typeId: '18',
			metadata: {
				uaFamily: 'Boxxe',
				uaUrl: '',
				uaCompany: 'Team boxee',
				uaCompanyUrl: 'http://www.boxee.tv/',
				uaIcon: 'boxee.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Boxxe'
			}
		},
		'150': {
			typeId: '20',
			metadata: {
				uaFamily: 'gPodder',
				uaUrl: 'http://gpodder.org/',
				uaCompany: 'Thomas Perl and the gPodder Team',
				uaCompanyUrl: '',
				uaIcon: 'gpodder.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=gPodder'
			}
		},
		'151': {
			typeId: '3',
			metadata: {
				uaFamily: 'Obigo',
				uaUrl: 'http://en.wikipedia.org/wiki/Obigo_Browser',
				uaCompany: 'Obigo Ltd',
				uaCompanyUrl: 'http://www.obigo.com/',
				uaIcon: 'obigo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Obigo'
			}
		},
		'152': {
			typeId: '3',
			metadata: {
				uaFamily: 'SEMC Browser',
				uaUrl: '',
				uaCompany: 'Sony Ericsson Mobile Communications AB',
				uaCompanyUrl: 'http://www.sonyericsson.com/',
				uaIcon: 'semc.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SEMC Browser'
			}
		},
		'153': {
			typeId: '0',
			metadata: {
				uaFamily: 'Firefox (GranParadiso)',
				uaUrl: 'https://wiki.mozilla.org/Firefox3',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'firefox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Firefox (GranParadiso)'
			}
		},
		'154': {
			typeId: '10',
			metadata: {
				uaFamily: 'WDG Validator',
				uaUrl: 'http://www.htmlhelp.com/tools/validator/',
				uaCompany: 'Web Design Group',
				uaCompanyUrl: 'http://www.htmlhelp.com/',
				uaIcon: 'wdg.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WDG Validator'
			}
		},
		'155': {
			typeId: '10',
			metadata: {
				uaFamily: 'WDG CSSCheck',
				uaUrl: 'http://www.htmlhelp.com/tools/csscheck/',
				uaCompany: 'Web Design Group',
				uaCompanyUrl: 'http://www.htmlhelp.com/',
				uaIcon: 'wdg.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WDG CSSCheck'
			}
		},
		'156': {
			typeId: '10',
			metadata: {
				uaFamily: 'WDG Page Valet',
				uaUrl: 'http://valet.htmlhelp.com/page/',
				uaCompany: 'Web Design Group',
				uaCompanyUrl: 'http://www.htmlhelp.com/',
				uaIcon: 'wdg.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WDG Page Valet'
			}
		},
		'157': {
			typeId: '3',
			metadata: {
				uaFamily: 'IE Mobile',
				uaUrl: 'http://www.microsoft.com/windowsmobile/en-us/downloads/microsoft/internet-explorer-mobile.mspx',
				uaCompany: 'Microsoft Corporation.',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'iemobile.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=IE Mobile'
			}
		},
		'158': {
			typeId: '3',
			metadata: {
				uaFamily: 'BlackBerry Browser',
				uaUrl: 'http://www.blackberry.com/',
				uaCompany: 'Research In Motion Limited',
				uaCompanyUrl: 'http://www.rim.com/',
				uaIcon: 'blackberry.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=BlackBerry Browser'
			}
		},
		'159': {
			typeId: '3',
			metadata: {
				uaFamily: 'Polaris',
				uaUrl: 'http://www.infraware.co.kr/eng/01_product/product02.asp',
				uaCompany: 'Infraware',
				uaCompanyUrl: 'http://www.infraware.co.kr/',
				uaIcon: 'polaris.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Polaris'
			}
		},
		'160': {
			typeId: '0',
			metadata: {
				uaFamily: 'Hv3',
				uaUrl: 'http://tkhtml.tcl.tk/hv3.html',
				uaCompany: 'tkhtml.tcl.tk',
				uaCompanyUrl: 'http://tkhtml.tcl.tk/',
				uaIcon: 'hv3.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Hv3'
			}
		},
		'161': {
			typeId: '6',
			metadata: {
				uaFamily: 'WinWap',
				uaUrl: 'http://www.winwap.com/mobile_applications/winwap_browser',
				uaCompany: 'Winwap Technologies',
				uaCompanyUrl: 'http://www.winwap.com/',
				uaIcon: 'winwap.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WinWap'
			}
		},
		'162': {
			typeId: '18',
			metadata: {
				uaFamily: 'XBMC',
				uaUrl: 'http://xbmc.org/',
				uaCompany: 'Team-XBMC',
				uaCompanyUrl: 'http://xbmc.org/about/team/',
				uaIcon: 'xbmc.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=XBMC'
			}
		},
		'163': {
			typeId: '5',
			metadata: {
				uaFamily: 'XML-RPC for PHP',
				uaUrl: 'http://phpxmlrpc.sourceforge.net/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'php-xmlrpc.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=XML-RPC for PHP'
			}
		},
		'165': {
			typeId: '18',
			metadata: {
				uaFamily: 'FlyCast',
				uaUrl: 'http://www.flycast.fm/',
				uaCompany: 'FlyCast Inc.',
				uaCompanyUrl: '',
				uaIcon: 'flycast.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=FlyCast'
			}
		},
		'166': {
			typeId: '15',
			metadata: {
				uaFamily: 'Bloglines',
				uaUrl: 'http://www.bloglines.com/',
				uaCompany: 'IAS Search & Media',
				uaCompanyUrl: 'http://www.iac.com/',
				uaIcon: 'bloglines.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Bloglines'
			}
		},
		'167': {
			typeId: '15',
			metadata: {
				uaFamily: 'Gregarius',
				uaUrl: 'http://devlog.gregarius.net/',
				uaCompany: 'Marco Bonetti',
				uaCompanyUrl: 'http://www.linkedin.com/in/mbonetti',
				uaIcon: 'gregarius.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Gregarius'
			}
		},
		'168': {
			typeId: '5',
			metadata: {
				uaFamily: 'SimplePie',
				uaUrl: 'http://simplepie.org/',
				uaCompany: 'Ryan Parman and Geoffrey Sneddon',
				uaCompanyUrl: '',
				uaIcon: 'simplepie.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SimplePie'
			}
		},
		'169': {
			typeId: '5',
			metadata: {
				uaFamily: 'PycURL',
				uaUrl: 'http://pycurl.sourceforge.net/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'curl.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=PycURL'
			}
		},
		'170': {
			typeId: '15',
			metadata: {
				uaFamily: 'Apple-PubSub',
				uaUrl: 'http://developer.apple.com/documentation/Darwin/Reference/ManPages/man1/pubsub.1.html',
				uaCompany: 'Apple Inc.',
				uaCompanyUrl: 'http://www.apple.com/',
				uaIcon: 'apple.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Apple-PubSub'
			}
		},
		'171': {
			typeId: '15',
			metadata: {
				uaFamily: 'Feedfetcher-Google',
				uaUrl: 'http://www.google.com/feedfetcher.html',
				uaCompany: 'Google',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'feedfetcher-google.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Feedfetcher-Google'
			}
		},
		'172': {
			typeId: '10',
			metadata: {
				uaFamily: 'FeedValidator',
				uaUrl: 'http://feedvalidator.org/',
				uaCompany: 'Mark Pilgrim',
				uaCompanyUrl: 'http://diveintomark.org/',
				uaIcon: 'feedvalidator.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=FeedValidator'
			}
		},
		'173': {
			typeId: '5',
			metadata: {
				uaFamily: 'MagpieRSS',
				uaUrl: 'http://magpierss.sourceforge.net/',
				uaCompany: 'kellan',
				uaCompanyUrl: '',
				uaIcon: 'magpierss.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=MagpieRSS'
			}
		},
		'174': {
			typeId: '15',
			metadata: {
				uaFamily: 'BlogBridge',
				uaUrl: 'http://www.blogbridge.com/',
				uaCompany: 'Salas Associates, Inc.',
				uaCompanyUrl: '',
				uaIcon: 'blogbridge.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=BlogBridge'
			}
		},
		'175': {
			typeId: '18',
			metadata: {
				uaFamily: 'Miro',
				uaUrl: 'http://www.getmiro.com/',
				uaCompany: 'Participatory Culture Foundation',
				uaCompanyUrl: 'http://www.participatoryculture.org/',
				uaIcon: 'miro.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Miro'
			}
		},
		'176': {
			typeId: '15',
			metadata: {
				uaFamily: 'Liferea',
				uaUrl: 'http://liferea.sourceforge.net/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'liferea.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Liferea'
			}
		},
		'177': {
			typeId: '15',
			metadata: {
				uaFamily: 'Seznam RSS reader',
				uaUrl: '',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznamrssreader.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Seznam RSS reader'
			}
		},
		'178': {
			typeId: '20',
			metadata: {
				uaFamily: 'PHP',
				uaUrl: 'http://php.net/',
				uaCompany: 'The PHP Group',
				uaCompanyUrl: '',
				uaIcon: 'php.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=PHP'
			}
		},
		'179': {
			typeId: '10',
			metadata: {
				uaFamily: 'REL Link Checker Lite',
				uaUrl: 'http://www.relsoftware.com/rlc/',
				uaCompany: 'REL Software, Inc.',
				uaCompanyUrl: 'http://www.relsoftware.com/company/',
				uaIcon: 'RELlinkchecker.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=REL Link Checker Lite'
			}
		},
		'180': {
			typeId: '15',
			metadata: {
				uaFamily: 'CPG Dragonfly RSS Module',
				uaUrl: 'http://dragonflycms.org/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'dragonflycms.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=CPG Dragonfly RSS Module'
			}
		},
		'181': {
			typeId: '15',
			metadata: {
				uaFamily: 'Newsbeuter',
				uaUrl: 'http://www.newsbeuter.org/',
				uaCompany: 'Andreas Krennmair',
				uaCompanyUrl: 'http://synflood.at/',
				uaIcon: 'newsbeuter.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Newsbeuter'
			}
		},
		'182': {
			typeId: '10',
			metadata: {
				uaFamily: 'W3C CSS Validator',
				uaUrl: 'http://jigsaw.w3.org/css-validator/',
				uaCompany: 'World Wide Web Consortium',
				uaCompanyUrl: 'http://www.w3.org/',
				uaIcon: 'w3.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=W3C CSS Validator'
			}
		},
		'183': {
			typeId: '10',
			metadata: {
				uaFamily: 'PHP link checker',
				uaUrl: 'http://www.hotscripts.com/listing/php-link-checker/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'php.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=PHP link checker'
			}
		},
		'184': {
			typeId: '20',
			metadata: {
				uaFamily: 'GoldenPod',
				uaUrl: 'http://random.zerodogg.org/goldenpod',
				uaCompany: 'Eskild Hustvedt',
				uaCompanyUrl: 'http://random.zerodogg.org/',
				uaIcon: 'perl.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GoldenPod'
			}
		},
		'185': {
			typeId: '0',
			metadata: {
				uaFamily: 'Cheshire',
				uaUrl: 'http://greenhouse.aol.com/prod.jsp?prod_id=32',
				uaCompany: 'America Online, Inc.',
				uaCompanyUrl: 'http://www.aol.com/',
				uaIcon: 'aol.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Cheshire'
			}
		},
		'187': {
			typeId: '0',
			metadata: {
				uaFamily: 'CometBird',
				uaUrl: 'http://www.cometbird.com/',
				uaCompany: 'cometbird.com',
				uaCompanyUrl: '',
				uaIcon: 'cometbird.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=CometBird'
			}
		},
		'188': {
			typeId: '0',
			metadata: {
				uaFamily: 'IceCat',
				uaUrl: 'http://www.gnu.org/software/gnuzilla/',
				uaCompany: 'Free Software Foundation, Inc.',
				uaCompanyUrl: 'http://www.fsf.org/',
				uaIcon: 'icecat.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=IceCat'
			}
		},
		'189': {
			typeId: '0',
			metadata: {
				uaFamily: 'Stainless',
				uaUrl: 'http://www.stainlessapp.com/',
				uaCompany: 'Mesa Dynamics, LLC',
				uaCompanyUrl: 'http://www.mesadynamics.com/',
				uaIcon: 'stainless.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Stainless'
			}
		},
		'190': {
			typeId: '20',
			metadata: {
				uaFamily: 'Prism',
				uaUrl: 'http://prism.mozilla.com/',
				uaCompany: 'Mozilla Labs',
				uaCompanyUrl: 'http://labs.mozilla.com/',
				uaIcon: 'prism.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Prism'
			}
		},
		'191': {
			typeId: '18',
			metadata: {
				uaFamily: 'MPlayer',
				uaUrl: 'http://www.mplayerhq.hu/',
				uaCompany: 'The MPlayer Project',
				uaCompanyUrl: '',
				uaIcon: 'mplayer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=MPlayer'
			}
		},
		'192': {
			typeId: '20',
			metadata: {
				uaFamily: 'ActiveXperts Network Monitor',
				uaUrl: 'http://www.activexperts.com/activmonitor/',
				uaCompany: 'ActiveXperts Software B.V.',
				uaCompanyUrl: 'http://www.activexperts.com/',
				uaIcon: 'activexperts-network-monitor.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=ActiveXperts Network Monitor'
			}
		},
		'193': {
			typeId: '3',
			metadata: {
				uaFamily: 'Motorola Internet Browser',
				uaUrl: 'http://www.motorola.com/content.jsp?globalObjectId=1827-4343',
				uaCompany: 'Motorola, Inc.',
				uaCompanyUrl: 'http://www.motorola.com/',
				uaIcon: 'mib.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Motorola Internet Browser'
			}
		},
		'194': {
			typeId: '15',
			metadata: {
				uaFamily: 'Abilon',
				uaUrl: '',
				uaCompany: 'SisyphSoft',
				uaCompanyUrl: 'http://web.archive.org/web/20050721080030/http://www.abilon.org/',
				uaIcon: 'abilon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Abilon'
			}
		},
		'195': {
			typeId: '20',
			metadata: {
				uaFamily: 'HTTP nagios plugin',
				uaUrl: '',
				uaCompany: 'Nagios Enterprises, LLC.',
				uaCompanyUrl: 'http://www.nagios.org/',
				uaIcon: 'nagios.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=HTTP nagios plugin'
			}
		},
		'196': {
			typeId: '18',
			metadata: {
				uaFamily: 'Windows Media Player',
				uaUrl: 'http://www.microsoft.com/windows/windowsmedia/',
				uaCompany: 'Microsoft Corporation.',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'wmp.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Windows Media Player'
			}
		},
		'197': {
			typeId: '18',
			metadata: {
				uaFamily: 'VLC media player',
				uaUrl: 'http://www.videolan.org/vlc/',
				uaCompany: 'VideoLAN team',
				uaCompanyUrl: 'http://www.videolan.org/',
				uaIcon: 'vlc.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=VLC media player'
			}
		},
		'198': {
			typeId: '10',
			metadata: {
				uaFamily: 'P3P Validator',
				uaUrl: 'http://www.w3.org/P3P/validator.html',
				uaCompany: 'World Wide Web Consortium',
				uaCompanyUrl: 'http://www.w3.org/',
				uaIcon: 'w3.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=P3P Validator'
			}
		},
		'199': {
			typeId: '10',
			metadata: {
				uaFamily: 'CSE HTML Validator',
				uaUrl: 'http://online.htmlvalidator.com/php/onlinevallite.php',
				uaCompany: 'AI Internet Solutions',
				uaCompanyUrl: 'http://www.htmlvalidator.com/',
				uaIcon: 'csehtmlvalidator.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=CSE HTML Validator'
			}
		},
		'200': {
			typeId: '15',
			metadata: {
				uaFamily: 'Omea Reader',
				uaUrl: 'http://www.jetbrains.com/omea/reader/',
				uaCompany: 'JetBrains',
				uaCompanyUrl: 'http://www.jetbrains.com/',
				uaIcon: 'omeareader.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Omea Reader'
			}
		},
		'201': {
			typeId: '20',
			metadata: {
				uaFamily: 'GSiteCrawler',
				uaUrl: 'http://gsitecrawler.com/',
				uaCompany: 'SOFTplus Entwicklungen GmbH',
				uaCompanyUrl: 'http://www.softplus.net/',
				uaIcon: 'gsitecrawler.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GSiteCrawler'
			}
		},
		'202': {
			typeId: '15',
			metadata: {
				uaFamily: 'YahooFeedSeeker',
				uaUrl: 'http://publisher.yahoo.com/rssguide',
				uaCompany: 'Yahoo! Inc',
				uaCompanyUrl: 'http://www.yahoo.com/',
				uaIcon: 'YahooFeedSeeker.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=YahooFeedSeeker'
			}
		},
		'204': {
			typeId: '0',
			metadata: {
				uaFamily: 'TheWorld Browser',
				uaUrl: 'http://www.theworld.cn/twen/',
				uaCompany: 'Phoenix Studio',
				uaCompanyUrl: 'http://www.phoenixstudio.org/',
				uaIcon: 'the_world.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=TheWorld Browser'
			}
		},
		'205': {
			typeId: '20',
			metadata: {
				uaFamily: 'WebCollage',
				uaUrl: 'http://www.jwz.org/webcollage/',
				uaCompany: 'Jamie Zawinski',
				uaCompanyUrl: 'http://www.jwz.org/',
				uaIcon: 'webcollage.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WebCollage'
			}
		},
		'206': {
			typeId: '15',
			metadata: {
				uaFamily: 'NewsGatorOnline',
				uaUrl: 'http://www.newsgator.com/',
				uaCompany: 'NewsGator Technologies, Inc.',
				uaCompanyUrl: 'http://www.newsgator.com/companyinfo/default.aspx',
				uaIcon: 'newsgator-online.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NewsGatorOnline'
			}
		},
		'207': {
			typeId: '20',
			metadata: {
				uaFamily: 'PRTG Network Monitor',
				uaUrl: 'http://www.paessler.com/prtg',
				uaCompany: 'Paessler AG',
				uaCompanyUrl: 'http://www.paessler.com/',
				uaIcon: 'PRTG_Network_Monitor.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=PRTG Network Monitor'
			}
		},
		'208': {
			typeId: '18',
			metadata: {
				uaFamily: 'Songbird',
				uaUrl: 'http://getsongbird.com/',
				uaCompany: 'Pioneers of the Inevitable',
				uaCompanyUrl: 'http://getsongbird.com/about/',
				uaIcon: 'songbird.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Songbird'
			}
		},
		'209': {
			typeId: '18',
			metadata: {
				uaFamily: 'RSS Radio',
				uaUrl: 'http://www.dorada.co.uk/',
				uaCompany: 'Dorada Software',
				uaCompanyUrl: '',
				uaIcon: 'rssradio.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=RSS Radio'
			}
		},
		'210': {
			typeId: '5',
			metadata: {
				uaFamily: 'Feed::Find',
				uaUrl: 'http://search.cpan.org/dist/Feed-Find/',
				uaCompany: 'Benjamin Trott',
				uaCompanyUrl: '',
				uaIcon: 'perl.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Feed::Find'
			}
		},
		'211': {
			typeId: '3',
			metadata: {
				uaFamily: 'Palm Pre web browser',
				uaUrl: 'http://www.palm.com/us/products/phones/pre/index.html',
				uaCompany: 'Palm Inc.',
				uaCompanyUrl: 'http://www.palm.com/',
				uaIcon: 'palmpre.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Palm Pre web browser'
			}
		},
		'212': {
			typeId: '0',
			metadata: {
				uaFamily: 'Firefox (BonEcho)',
				uaUrl: 'http://www.mozilla.org/projects/bonecho/releases/2.0a1.html',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'firefox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Firefox (BonEcho)'
			}
		},
		'213': {
			typeId: '18',
			metadata: {
				uaFamily: 'QuickTime',
				uaUrl: 'http://www.apple.com/quicktime/',
				uaCompany: 'Apple Inc.',
				uaCompanyUrl: 'http://www.apple.com/',
				uaIcon: 'quicktime.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=QuickTime'
			}
		},
		'214': {
			typeId: '5',
			metadata: {
				uaFamily: 'PHPcrawl',
				uaUrl: 'http://phpcrawl.cuab.de/',
				uaCompany: 'Uwe Hunfeld',
				uaCompanyUrl: '',
				uaIcon: 'php.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=PHPcrawl'
			}
		},
		'216': {
			typeId: '0',
			metadata: {
				uaFamily: 'GreenBrowser',
				uaUrl: 'http://www.morequick.com/indexen.htm',
				uaCompany: 'More Quick Tools',
				uaCompanyUrl: 'http://www.morequick.com/',
				uaIcon: 'green_browser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GreenBrowser'
			}
		},
		'217': {
			typeId: '15',
			metadata: {
				uaFamily: 'Awasu',
				uaUrl: 'http://www.awasu.com/',
				uaCompany: 'Awasu Pty. Ltd.',
				uaCompanyUrl: '',
				uaIcon: 'awasu.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Awasu'
			}
		},
		'218': {
			typeId: '18',
			metadata: {
				uaFamily: 'CorePlayer',
				uaUrl: 'http://www.coreplayer.com/',
				uaCompany: 'CoreCodec, inc.',
				uaCompanyUrl: '',
				uaIcon: 'CorePlayer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=CorePlayer'
			}
		},
		'219': {
			typeId: '0',
			metadata: {
				uaFamily: 'QtWeb',
				uaUrl: 'http://www.qtweb.net/',
				uaCompany: 'QtWeb.NET',
				uaCompanyUrl: '',
				uaIcon: 'qt_web.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=QtWeb'
			}
		},
		'220': {
			typeId: '3',
			metadata: {
				uaFamily: 'TeaShark',
				uaUrl: 'http://www.teashark.com/',
				uaCompany: 'TeaShark',
				uaCompanyUrl: '',
				uaIcon: 'teashark.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=TeaShark'
			}
		},
		'221': {
			typeId: '5',
			metadata: {
				uaFamily: 'LibSoup',
				uaUrl: 'http://live.gnome.org/LibSoup',
				uaCompany: 'The GNOME Project',
				uaCompanyUrl: 'http://www.gnome.org/',
				uaIcon: 'libsoup.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=LibSoup'
			}
		},
		'222': {
			typeId: '15',
			metadata: {
				uaFamily: 'NetNewsWire',
				uaUrl: 'http://www.newsgator.com/Individuals/NetNewsWire/',
				uaCompany: 'NewsGator Technologies, Inc.',
				uaCompanyUrl: 'http://www.newsgator.com/',
				uaIcon: 'netnewswire.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NetNewsWire'
			}
		},
		'223': {
			typeId: '20',
			metadata: {
				uaFamily: 'Google App Engine',
				uaUrl: 'http://code.google.com/appengine/',
				uaCompany: 'Google',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'google_appengine.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Google App Engine'
			}
		},
		'225': {
			typeId: '3',
			metadata: {
				uaFamily: 'UC Browser',
				uaUrl: 'http://www.ucweb.com/English/UCbrowser/index.html',
				uaCompany: 'UCWEB Technology Ltd.',
				uaCompanyUrl: 'http://www.ucweb.com/',
				uaIcon: 'ucweb.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=UC Browser'
			}
		},
		'226': {
			typeId: '3',
			metadata: {
				uaFamily: 'Nokia Web Browser',
				uaUrl: 'http://nokia.com/browser',
				uaCompany: 'Nokia',
				uaCompanyUrl: 'http://www.nokia.com/',
				uaIcon: 'nokia.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Nokia Web Browser'
			}
		},
		'227': {
			typeId: '20',
			metadata: {
				uaFamily: 'LFTP',
				uaUrl: 'http://lftp.yar.ru/',
				uaCompany: 'Alexander V. Lukyanov',
				uaCompanyUrl: '',
				uaIcon: 'lftp.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=LFTP'
			}
		},
		'228': {
			typeId: '0',
			metadata: {
				uaFamily: 'Oregano',
				uaUrl: 'http://www.oreganouk.net/oregano2.html',
				uaCompany: 'Genesys Developments Ltd',
				uaCompanyUrl: 'http://www.oreganouk.net/',
				uaIcon: 'oregano.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Oregano'
			}
		},
		'229': {
			typeId: '5',
			metadata: {
				uaFamily: 'Summer',
				uaUrl: 'http://wrya.net/services/trac/summer',
				uaCompany: 'Robin Sonefors',
				uaCompanyUrl: 'http://flukkost.nu/',
				uaIcon: 'libsummer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Summer'
			}
		},
		'230': {
			typeId: '0',
			metadata: {
				uaFamily: 'Acoo Browser',
				uaUrl: 'http://www.acoobrowser.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'acco.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Acoo Browser'
			}
		},
		'231': {
			typeId: '15',
			metadata: {
				uaFamily: 'NewsFox',
				uaUrl: 'http://newsfox.mozdev.org/',
				uaCompany: 'NewsFox team',
				uaCompanyUrl: 'http://newsfox.mozdev.org/team.html',
				uaIcon: 'newsfox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NewsFox'
			}
		},
		'232': {
			typeId: '0',
			metadata: {
				uaFamily: 'Hydra Browser',
				uaUrl: 'http://hydrabrowser.com/',
				uaCompany: 'Quantum',
				uaCompanyUrl: '',
				uaIcon: 'hydrabrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Hydra Browser'
			}
		},
		'233': {
			typeId: '0',
			metadata: {
				uaFamily: 'wKiosk',
				uaUrl: 'http://www.app4mac.com/store/index.php?target=products&product_id=9',
				uaCompany: 'app4mac Inc.',
				uaCompanyUrl: 'http://www.app4mac.com/',
				uaIcon: 'wkiosk.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=wKiosk'
			}
		},
		'234': {
			typeId: '20',
			metadata: {
				uaFamily: 'Paparazzi!',
				uaUrl: 'http://derailer.org/paparazzi/',
				uaCompany: 'Nate Weaver (Wevah)',
				uaCompanyUrl: 'http://derailer.org/',
				uaIcon: 'paparazzi.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Paparazzi!'
			}
		},
		'235': {
			typeId: '5',
			metadata: {
				uaFamily: 'xine',
				uaUrl: 'http://www.xine-project.org/',
				uaCompany: 'xine team',
				uaCompanyUrl: 'http://www.xine-project.org/authors',
				uaIcon: 'xine.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=xine'
			}
		},
		'236': {
			typeId: '20',
			metadata: {
				uaFamily: 'webfs',
				uaUrl: 'http://plan9.bell-labs.com/magic/man2html/4/webfs',
				uaCompany: 'Lucent Technologies',
				uaCompanyUrl: 'http://plan9.bell-labs.com/plan9/',
				uaIcon: 'plan9.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=webfs'
			}
		},
		'237': {
			typeId: '15',
			metadata: {
				uaFamily: 'NewsBreak',
				uaUrl: 'http://www.iliumsoft.com/site/nw/newsbreak.php',
				uaCompany: 'Ilium Software, Inc.',
				uaCompanyUrl: 'http://www.iliumsoft.com/',
				uaIcon: 'newsbreak.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NewsBreak'
			}
		},
		'238': {
			typeId: '20',
			metadata: {
				uaFamily: 'LinkbackPlugin for Laconica',
				uaUrl: 'http://laconi.ca/',
				uaCompany: 'Laconica Developer Community',
				uaCompanyUrl: 'http://laconi.ca/trac/wiki/DeveloperCommunity',
				uaIcon: 'laconica.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=LinkbackPlugin for Laconica'
			}
		},
		'239': {
			typeId: '20',
			metadata: {
				uaFamily: 'Microsoft WebDAV client',
				uaUrl: '',
				uaCompany: 'Microsoft Corporation.',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'webdav.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Microsoft WebDAV client'
			}
		},
		'240': {
			typeId: '20',
			metadata: {
				uaFamily: 'GnomeVFS',
				uaUrl: 'http://developer.gnome.org/doc/API/2.0/gnome-vfs-2',
				uaCompany: 'The GNOME Project',
				uaCompanyUrl: 'http://www.gnome.org/',
				uaIcon: 'webdav.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GnomeVFS'
			}
		},
		'241': {
			typeId: '0',
			metadata: {
				uaFamily: 'Uzbl',
				uaUrl: 'http://www.uzbl.org/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'uzbl.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Uzbl'
			}
		},
		'242': {
			typeId: '10',
			metadata: {
				uaFamily: 'Cynthia',
				uaUrl: 'http://www.contentquality.com/',
				uaCompany: 'HiSoftware Inc.',
				uaCompanyUrl: 'http://www.hisoftware.com/',
				uaIcon: 'cynthia.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Cynthia'
			}
		},
		'243': {
			typeId: '15',
			metadata: {
				uaFamily: 'Sage',
				uaUrl: 'http://sage.mozdev.org',
				uaCompany: 'Peter Andrews',
				uaCompanyUrl: 'http://petea.org/',
				uaIcon: 'sage.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Sage'
			}
		},
		'244': {
			typeId: '18',
			metadata: {
				uaFamily: 'Banshee',
				uaUrl: 'http://banshee-project.org/',
				uaCompany: 'Novell, Inc.',
				uaCompanyUrl: 'http://www.novell.com/',
				uaIcon: 'banshee.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Banshee'
			}
		},
		'245': {
			typeId: '0',
			metadata: {
				uaFamily: 'Wyzo',
				uaUrl: 'http://www.wyzo.com/',
				uaCompany: 'Radical Software Ltd.',
				uaCompanyUrl: 'http://www.radicalsoft.com/',
				uaIcon: 'wyzo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Wyzo'
			}
		},
		'246': {
			typeId: '15',
			metadata: {
				uaFamily: 'RSSOwl',
				uaUrl: 'http://www.rssowl.org/',
				uaCompany: 'Benjamin Pasero',
				uaCompanyUrl: '',
				uaIcon: 'rssowl.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=RSSOwl'
			}
		},
		'247': {
			typeId: '0',
			metadata: {
				uaFamily: 'ABrowse',
				uaUrl: 'http://en.wikipedia.org/wiki/ABrowse',
				uaCompany: 'Kurt Skauen',
				uaCompanyUrl: 'http://www.syllable.org/',
				uaIcon: 'abrowse.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=ABrowse'
			}
		},
		'248': {
			typeId: '20',
			metadata: {
				uaFamily: 'Funambol Outlook Sync Client',
				uaUrl: 'https://www.forge.funambol.org/download/',
				uaCompany: 'Funambol, Inc.',
				uaCompanyUrl: 'http://funambol.com/',
				uaIcon: 'funambol-outlook.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Funambol Outlook Sync Client'
			}
		},
		'249': {
			typeId: '20',
			metadata: {
				uaFamily: 'Funambol Mozilla Sync Client',
				uaUrl: 'https://mozilla-plugin.forge.funambol.org/ ',
				uaCompany: 'Carlo Codega',
				uaCompanyUrl: 'http://sazilla.blogspot.com',
				uaIcon: 'funambol-mozilla.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Funambol Mozilla Sync Client'
			}
		},
		'250': {
			typeId: '15',
			metadata: {
				uaFamily: 'RSS Menu',
				uaUrl: 'http://www.edot-studios.com/webgroups2/index.php?menu_item=212',
				uaCompany: 'e dot studios',
				uaCompanyUrl: 'http://www.edot-studios.com/',
				uaIcon: 'rss_menu.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=RSS Menu'
			}
		},
		'251': {
			typeId: '18',
			metadata: {
				uaFamily: 'foobar2000',
				uaUrl: 'http://www.foobar2000.org/',
				uaCompany: 'Peter Pawlowski',
				uaCompanyUrl: '',
				uaIcon: 'foobar2000.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=foobar2000'
			}
		},
		'252': {
			typeId: '5',
			metadata: {
				uaFamily: 'GStreamer',
				uaUrl: 'http://gstreamer.freedesktop.org/',
				uaCompany: 'GStreamer community',
				uaCompanyUrl: 'http://gstreamer.freedesktop.org/',
				uaIcon: 'GStreamer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GStreamer'
			}
		},
		'253': {
			typeId: '20',
			metadata: {
				uaFamily: 'NetFront Mobile Content Viewer',
				uaUrl: 'http://www.access-company.com/products/mobile_solutions/netfrontmobile/contentviewer/index.html',
				uaCompany: 'ACCESS CO., LTD.',
				uaCompanyUrl: 'http://www.access-company.com/',
				uaIcon: 'netfront.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NetFront Mobile Content Viewer'
			}
		},
		'254': {
			typeId: '5',
			metadata: {
				uaFamily: 'PHP OpenID library',
				uaUrl: 'http://openidenabled.com/php-openid/',
				uaCompany: 'JanRain, Inc.',
				uaCompanyUrl: 'http://www.janrain.com/',
				uaIcon: 'PHP_OpenID_lib.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=PHP OpenID library'
			}
		},
		'255': {
			typeId: '0',
			metadata: {
				uaFamily: 'Blackbird',
				uaUrl: 'http://www.blackbirdbrowser.com/',
				uaCompany: '40A, Inc.',
				uaCompanyUrl: '',
				uaIcon: 'blackbird.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Blackbird'
			}
		},
		'256': {
			typeId: '15',
			metadata: {
				uaFamily: 'GreatNews',
				uaUrl: 'http://www.curiostudio.com/',
				uaCompany: 'Curio Studio',
				uaCompanyUrl: '',
				uaIcon: 'GreatNews.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GreatNews'
			}
		},
		'257': {
			typeId: '0',
			metadata: {
				uaFamily: 'DeskBrowse',
				uaUrl: 'http://www.deskbrowse.org/',
				uaCompany: 'Off Leash Developments, Inc',
				uaCompanyUrl: 'http://offleashdevelopments.com/',
				uaIcon: 'deskbrowse.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=DeskBrowse'
			}
		},
		'258': {
			typeId: '20',
			metadata: {
				uaFamily: 'Tulip Chain',
				uaUrl: 'http://ostermiller.org/tulipchain/',
				uaCompany: 'Stephen "deadsea" Ostermiller',
				uaCompanyUrl: 'http://ostermiller.org/',
				uaIcon: 'TulipChain.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Tulip Chain'
			}
		},
		'259': {
			typeId: '1',
			metadata: {
				uaFamily: 'Axel',
				uaUrl: 'http://axel.alioth.debian.org/',
				uaCompany: 'Y Giridhar Appaji Nag',
				uaCompanyUrl: 'http://www.appaji.net/',
				uaIcon: 'terminal.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Axel'
			}
		},
		'260': {
			typeId: '3',
			metadata: {
				uaFamily: 'MicroB',
				uaUrl: 'http://en.wikipedia.org/wiki/MicroB',
				uaCompany: 'maemo project',
				uaCompanyUrl: 'http://maemo.org/',
				uaIcon: 'microb.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=MicroB'
			}
		},
		'261': {
			typeId: '3',
			metadata: {
				uaFamily: 'Tear',
				uaUrl: 'http://tear.garage.maemo.org/',
				uaCompany: 'Kamen Bundev',
				uaCompanyUrl: 'http://bundyo.org/',
				uaIcon: 'tear.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Tear'
			}
		},
		'262': {
			typeId: '10',
			metadata: {
				uaFamily: 'LinkExaminer',
				uaUrl: 'http://www.analogx.com/contents/download/Network/lnkexam/Freeware.htm',
				uaCompany: 'AnalogX, LLC.',
				uaCompanyUrl: 'http://www.analogx.com/',
				uaIcon: 'LinkExaminer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=LinkExaminer'
			}
		},
		'263': {
			typeId: '0',
			metadata: {
				uaFamily: 'Abolimba',
				uaUrl: 'http://www.aborange.de/products/freeware/abolimba-multibrowser.php',
				uaCompany: 'Mathias Gerlach, Jochen Milchsack',
				uaCompanyUrl: 'http://www.aborange.de/',
				uaIcon: 'abolimba.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Abolimba'
			}
		},
		'264': {
			typeId: '0',
			metadata: {
				uaFamily: 'Beonex',
				uaUrl: 'http://www.beonex.com/',
				uaCompany: 'Ben Bucksch',
				uaCompanyUrl: 'http://www.bucksch.org/',
				uaIcon: 'beonex.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Beonex'
			}
		},
		'265': {
			typeId: '0',
			metadata: {
				uaFamily: 'DocZilla',
				uaUrl: 'http://www.doczilla.com/',
				uaCompany: 'CITEC',
				uaCompanyUrl: 'http://www.citec.com/',
				uaIcon: 'doczilla.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=DocZilla'
			}
		},
		'266': {
			typeId: '0',
			metadata: {
				uaFamily: 'retawq',
				uaUrl: 'http://retawq.sourceforge.net/',
				uaCompany: 'Arne Thoma\xdfen',
				uaCompanyUrl: '',
				uaIcon: 'terminal.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=retawq'
			}
		},
		'267': {
			typeId: '3',
			metadata: {
				uaFamily: 'Jasmine',
				uaUrl: '',
				uaCompany: 'SAMSUNG',
				uaCompanyUrl: 'http://www.samsung.com/',
				uaIcon: 'jasmine.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Jasmine'
			}
		},
		'268': {
			typeId: '3',
			metadata: {
				uaFamily: 'Opera Mini',
				uaUrl: 'http://www.operamini.com',
				uaCompany: 'Opera Software ASA.',
				uaCompanyUrl: 'http://www.opera.com/',
				uaIcon: 'opera.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Opera Mini'
			}
		},
		'269': {
			typeId: '0',
			metadata: {
				uaFamily: 'Dooble',
				uaUrl: 'http://dooble.sourceforge.net/',
				uaCompany: 'Dooble team',
				uaCompanyUrl: '',
				uaIcon: 'dooble.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Dooble'
			}
		},
		'270': {
			typeId: '0',
			metadata: {
				uaFamily: 'Madfox',
				uaUrl: 'http://en.wikipedia.org/wiki/Madfox',
				uaCompany: 'Robin Lu',
				uaCompanyUrl: '',
				uaIcon: 'madfox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Madfox'
			}
		},
		'271': {
			typeId: '20',
			metadata: {
				uaFamily: 'DownloadStudio',
				uaUrl: 'http://www.conceiva.com/products/downloadstudio/default.asp',
				uaCompany: 'Conceiva',
				uaCompanyUrl: 'http://www.conceiva.com/',
				uaIcon: 'downloadstudio.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=DownloadStudio'
			}
		},
		'272': {
			typeId: '20',
			metadata: {
				uaFamily: 'WinPodder',
				uaUrl: 'http://winpodder.com/',
				uaCompany: 'Mike Versteeg',
				uaCompanyUrl: 'http://mikeversteeg.com/',
				uaIcon: 'winpodder.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WinPodder'
			}
		},
		'273': {
			typeId: '0',
			metadata: {
				uaFamily: 'Bunjalloo',
				uaUrl: 'http://code.google.com/p/quirkysoft/',
				uaCompany: 'quirkysoft',
				uaCompanyUrl: '',
				uaIcon: 'bunjalloo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Bunjalloo'
			}
		},
		'274': {
			typeId: '10',
			metadata: {
				uaFamily: 'LinkChecker',
				uaUrl: 'http://linkchecker.sourceforge.net/',
				uaCompany: 'Bastian Kleineidam',
				uaCompanyUrl: '',
				uaIcon: 'LinkChecker.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=LinkChecker'
			}
		},
		'276': {
			typeId: '5',
			metadata: {
				uaFamily: 'urlgrabber',
				uaUrl: 'http://linux.duke.edu/projects/urlgrabber/',
				uaCompany: 'Michael Stenner and Ryan Tomayko',
				uaCompanyUrl: '',
				uaIcon: 'php.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=urlgrabber'
			}
		},
		'277': {
			typeId: '4',
			metadata: {
				uaFamily: 'Spicebird',
				uaUrl: 'http://www.spicebird.com/',
				uaCompany: 'Synovel Technologies',
				uaCompanyUrl: 'http://www.synovel.com/',
				uaIcon: 'spicebird.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Spicebird'
			}
		},
		'278': {
			typeId: '0',
			metadata: {
				uaFamily: 'Firefox (Namoroka)',
				uaUrl: 'https://wiki.mozilla.org/Firefox/Namoroka',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'firefox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Firefox (Namoroka)'
			}
		},
		'279': {
			typeId: '0',
			metadata: {
				uaFamily: 'Rekonq',
				uaUrl: 'http://rekonq.kde.org/',
				uaCompany: 'Andrea Diamantini',
				uaCompanyUrl: 'http://www.adjam.org/',
				uaIcon: 'rekonq.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Rekonq'
			}
		},
		'280': {
			typeId: '10',
			metadata: {
				uaFamily: 'Multipage Validator',
				uaUrl: 'http://www.validator.ca/',
				uaCompany: 'R\xe9seau Proze',
				uaCompanyUrl: 'http://www.proze.net/',
				uaIcon: 'MultipageValidator.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Multipage Validator'
			}
		},
		'281': {
			typeId: '0',
			metadata: {
				uaFamily: 'X-Smiles',
				uaUrl: 'http://www.xsmiles.org/',
				uaCompany: 'X-Smiles.org',
				uaCompanyUrl: '',
				uaIcon: 'x-smiles.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=X-Smiles'
			}
		},
		'282': {
			typeId: '5',
			metadata: {
				uaFamily: 'WinHTTP',
				uaUrl: 'http://msdn.microsoft.com/en-us/library/aa382925(VS.85).aspx',
				uaCompany: 'Microsoft Corporation.',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'DLLicon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WinHTTP'
			}
		},
		'283': {
			typeId: '1',
			metadata: {
				uaFamily: 'Xaldon WebSpider',
				uaUrl: 'http://www.xaldon.de/products_webspider.html',
				uaCompany: 'xaldon Technologies',
				uaCompanyUrl: 'http://www.xaldon.de/',
				uaIcon: 'XaldonWebSpider.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Xaldon WebSpider'
			}
		},
		'284': {
			typeId: '20',
			metadata: {
				uaFamily: 'Seznam WAP Proxy',
				uaUrl: 'http://www.smobil.cz/mobilni-vyhledavani',
				uaCompany: 'Seznam.cz, a.s.',
				uaCompanyUrl: 'http://www.seznam.cz/',
				uaIcon: 'seznam.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Seznam WAP Proxy'
			}
		},
		'285': {
			typeId: '20',
			metadata: {
				uaFamily: 'Google Wireless Transcoder',
				uaUrl: 'http://google.com/gwt/n',
				uaCompany: 'Google',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'feedfetcher-google.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Google Wireless Transcoder'
			}
		},
		'286': {
			typeId: '20',
			metadata: {
				uaFamily: 'Google Listen',
				uaUrl: 'http://listen.googlelabs.com/',
				uaCompany: 'Google',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'google_listen.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Google Listen'
			}
		},
		'287': {
			typeId: '5',
			metadata: {
				uaFamily: 'Typhoeus',
				uaUrl: 'https://github.com/typhoeus/typhoeus',
				uaCompany: 'Paul Dix',
				uaCompanyUrl: 'http://www.pauldix.net/',
				uaIcon: 'typhoeus.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Typhoeus'
			}
		},
		'288': {
			typeId: '0',
			metadata: {
				uaFamily: 'OWB',
				uaUrl: 'http://www.sand-labs.org/owb',
				uaCompany: 'Sand-labs.org',
				uaCompanyUrl: 'http://www.sand-labs.org/',
				uaIcon: 'owb.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=OWB'
			}
		},
		'289': {
			typeId: '0',
			metadata: {
				uaFamily: 'Browzar',
				uaUrl: 'http://www.browzar.com/',
				uaCompany: 'Browzar Ltd',
				uaCompanyUrl: '',
				uaIcon: 'browzar.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Browzar'
			}
		},
		'290': {
			typeId: '20',
			metadata: {
				uaFamily: 'Claws Mail GtkHtml2 plugin',
				uaUrl: 'http://www.claws-mail.org/plugin.php?plugin=gtkhtml2',
				uaCompany: 'Colin Leroy',
				uaCompanyUrl: '',
				uaIcon: 'Claws_Mail_GtkHtml_plugin.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Claws Mail GtkHtml2 plugin'
			}
		},
		'291': {
			typeId: '20',
			metadata: {
				uaFamily: 'Vuze',
				uaUrl: 'http://www.vuze.com/',
				uaCompany: 'Vuze, Inc',
				uaCompanyUrl: '',
				uaIcon: 'vuze.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Vuze'
			}
		},
		'292': {
			typeId: '0',
			metadata: {
				uaFamily: 'GlobalMojo',
				uaUrl: 'http://globalmojo.com/',
				uaCompany: 'KPG VENTURES',
				uaCompanyUrl: 'http://www.kpgventures.com/',
				uaIcon: 'globalmojo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GlobalMojo'
			}
		},
		'293': {
			typeId: '18',
			metadata: {
				uaFamily: 'GOM Player',
				uaUrl: 'http://www.gomlab.com/',
				uaCompany: 'GRETECH CORP.',
				uaCompanyUrl: 'http://www.gretech.com/',
				uaIcon: 'GomPlayer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GOM Player'
			}
		},
		'294': {
			typeId: '5',
			metadata: {
				uaFamily: 'Python-webchecker',
				uaUrl: 'http://www.python.org/doc/essays/ppt/sd99east/sld070.htm',
				uaCompany: 'Guido van Rossum/Sam Bayer',
				uaCompanyUrl: '',
				uaIcon: 'pythonurllib.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Python-webchecker'
			}
		},
		'296': {
			typeId: '10',
			metadata: {
				uaFamily: 'W3C mobileOK Checker',
				uaUrl: 'http://validator.w3.org/mobile/',
				uaCompany: 'World Wide Web Consortium',
				uaCompanyUrl: 'http://www.w3.org/',
				uaIcon: 'w3.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=W3C mobileOK Checker'
			}
		},
		'297': {
			typeId: '20',
			metadata: {
				uaFamily: 'Siege',
				uaUrl: 'http://www.joedog.org/index/siege-home',
				uaCompany: 'Joe Dog Software',
				uaCompanyUrl: 'http://www.joedog.org/',
				uaIcon: 'joedog.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Siege'
			}
		},
		'298': {
			typeId: '1',
			metadata: {
				uaFamily: 'iSiloXC',
				uaUrl: 'http://www.isilox.com/',
				uaCompany: 'DC & Co.',
				uaCompanyUrl: 'http://www.isilox.com/',
				uaIcon: 'terminal.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=iSiloXC'
			}
		},
		'299': {
			typeId: '20',
			metadata: {
				uaFamily: 'AB (Apache Bench)',
				uaUrl: 'http://en.wikipedia.org/wiki/ApacheBench',
				uaCompany: 'Apache Software Foundation',
				uaCompanyUrl: 'http://www.apache.org/',
				uaIcon: 'ab.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=AB (Apache Bench)'
			}
		},
		'300': {
			typeId: '10',
			metadata: {
				uaFamily: 'anw LoadControl',
				uaUrl: 'http://webtool.anw.de/analyze/?ladezeit',
				uaCompany: 'ANW GmbH & Co. KG',
				uaCompanyUrl: 'http://www.anw.de/',
				uaIcon: 'anw.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=anw LoadControl'
			}
		},
		'301': {
			typeId: '10',
			metadata: {
				uaFamily: 'anw HTMLChecker',
				uaUrl: 'http://webtool.topsubmit.de/analyze/?html',
				uaCompany: 'ANW GmbH & Co. KG',
				uaCompanyUrl: 'http://www.anw.de/',
				uaIcon: 'anw.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=anw HTMLChecker'
			}
		},
		'302': {
			typeId: '0',
			metadata: {
				uaFamily: 'Edbrowse',
				uaUrl: 'http://edbrowse.sourceforge.net/',
				uaCompany: 'Karl Dahlke',
				uaCompanyUrl: '',
				uaIcon: 'Edbrowse.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Edbrowse'
			}
		},
		'303': {
			typeId: '20',
			metadata: {
				uaFamily: 'muCommander',
				uaUrl: 'http://www.mucommander.com/',
				uaCompany: 'Maxence Bernard',
				uaCompanyUrl: '',
				uaIcon: 'muCommander.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=muCommander'
			}
		},
		'304': {
			typeId: '18',
			metadata: {
				uaFamily: 'XMPlay',
				uaUrl: 'http://www.xmplay.com/',
				uaCompany: 'un4seen developments',
				uaCompanyUrl: 'http://www.un4seen.com/',
				uaIcon: 'XMPlay.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=XMPlay'
			}
		},
		'305': {
			typeId: '15',
			metadata: {
				uaFamily: 'NFReader',
				uaUrl: 'http://www.gaijin.at/dlnfreader.php',
				uaCompany: 'Gaijin.at',
				uaCompanyUrl: 'http://www.gaijin.at/',
				uaIcon: 'NFReader.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NFReader'
			}
		},
		'306': {
			typeId: '3',
			metadata: {
				uaFamily: 'uZard Web',
				uaUrl: 'http://www.uzard.com/',
				uaCompany: 'Logicplant Co.',
				uaCompanyUrl: 'http://www.logicplant.com/',
				uaIcon: 'uzard.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=uZard Web'
			}
		},
		'307': {
			typeId: '5',
			metadata: {
				uaFamily: 'Indy Library',
				uaUrl: 'http://www.indyproject.org/',
				uaCompany: 'Chad Z. Hower (Kudzu) and the Indy Pit Crew',
				uaCompanyUrl: '',
				uaIcon: 'DLLicon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Indy Library'
			}
		},
		'308': {
			typeId: '0',
			metadata: {
				uaFamily: 'Multi-Browser XP',
				uaUrl: 'http://www.multibrowser.de/',
				uaCompany: 'Binh Nguyen-Huu',
				uaCompanyUrl: '',
				uaIcon: 'Multi-BrowserXP.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Multi-Browser XP'
			}
		},
		'309': {
			typeId: '10',
			metadata: {
				uaFamily: 'LinkWalker',
				uaUrl: '',
				uaCompany: 'BDProtect Inc',
				uaCompanyUrl: 'http://www.brandprotect.com/',
				uaIcon: 'LinkWalker.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=LinkWalker'
			}
		},
		'310': {
			typeId: '0',
			metadata: {
				uaFamily: 'NetPositive',
				uaUrl: 'http://en.wikipedia.org/wiki/NetPositive',
				uaCompany: 'Be Inc.',
				uaCompanyUrl: 'http://en.wikipedia.org/wiki/Be_Inc.',
				uaIcon: 'netpositive.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NetPositive'
			}
		},
		'311': {
			typeId: '20',
			metadata: {
				uaFamily: 'Radio Downloader',
				uaUrl: 'http://www.nerdoftheherd.com/tools/radiodld/',
				uaCompany: 'Matt Robinson',
				uaCompanyUrl: 'http://www.nerdoftheherd.com/',
				uaIcon: 'RadioDownloader.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Radio Downloader'
			}
		},
		'312': {
			typeId: '1',
			metadata: {
				uaFamily: 'WebStripper',
				uaUrl: 'http://webstripper.net/',
				uaCompany: 'Mike Sutton',
				uaCompanyUrl: 'http://solentsoftware.com/',
				uaIcon: 'webstripper.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WebStripper'
			}
		},
		'313': {
			typeId: '20',
			metadata: {
				uaFamily: 'Cyberduck',
				uaUrl: 'http://cyberduck.ch/',
				uaCompany: 'David Kocher',
				uaCompanyUrl: 'dkocher.name',
				uaIcon: 'Cyberduck.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Cyberduck'
			}
		},
		'314': {
			typeId: '0',
			metadata: {
				uaFamily: 'WorldWideWeb',
				uaUrl: 'http://www.w3.org/People/Berners-Lee/WorldWideWeb',
				uaCompany: 'Tim Berners-Lee',
				uaCompanyUrl: 'http://www.w3.org/People/Berners-Lee/Overview.html',
				uaIcon: '1stBrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WorldWideWeb'
			}
		},
		'315': {
			typeId: '20',
			metadata: {
				uaFamily: 'iVideo',
				uaUrl: 'http://tinyurl.com/DownloadiVideo',
				uaCompany: 'ZETZ mobile',
				uaCompanyUrl: 'http://www.zetzmobile.com/',
				uaIcon: 'iVideo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=iVideo'
			}
		},
		'316': {
			typeId: '15',
			metadata: {
				uaFamily: 'RSS Popper',
				uaUrl: 'http://www.rsspopper.com/',
				uaCompany: 'Paradisoft',
				uaCompanyUrl: 'http://www.paradisoft.com/',
				uaIcon: 'rss.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=RSS Popper'
			}
		},
		'317': {
			typeId: '20',
			metadata: {
				uaFamily: 'Jamcast',
				uaUrl: 'http://www.sdstechnologies.com/',
				uaCompany: 'Software Development Solutions, Inc.',
				uaCompanyUrl: 'http://www.sdstechnologies.com/',
				uaIcon: 'Jamcast.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Jamcast'
			}
		},
		'318': {
			typeId: '0',
			metadata: {
				uaFamily: 'Comodo Dragon',
				uaUrl: 'http://www.comodo.com/home/browsers-toolbars/browser.php',
				uaCompany: 'Comodo Group, Inc.',
				uaCompanyUrl: 'http://www.comodo.com/',
				uaIcon: 'Comodo_Dragon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Comodo Dragon'
			}
		},
		'319': {
			typeId: '1',
			metadata: {
				uaFamily: 'SuperBot',
				uaUrl: 'http://www.sparkleware.com/superbot/index.html',
				uaCompany: 'Sparkleware',
				uaCompanyUrl: 'http://www.sparkleware.com/',
				uaIcon: 'SuperBot.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SuperBot'
			}
		},
		'320': {
			typeId: '0',
			metadata: {
				uaFamily: 'My Internet Browser',
				uaUrl: 'http://myinternetbrowser.webove-stranky.org/',
				uaCompany: 'Media WebPublishing',
				uaCompanyUrl: '',
				uaIcon: 'MyInternetBrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=My Internet Browser'
			}
		},
		'321': {
			typeId: '3',
			metadata: {
				uaFamily: 'Opera Mobile',
				uaUrl: 'http://www.opera.com/mobile/',
				uaCompany: 'Opera Software ASA.',
				uaCompanyUrl: 'http://www.opera.com/',
				uaIcon: 'opera.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Opera Mobile'
			}
		},
		'322': {
			typeId: '0',
			metadata: {
				uaFamily: 'Kirix Strata',
				uaUrl: 'http://www.kirix.com/',
				uaCompany: 'Kirix Corporation',
				uaCompanyUrl: 'http://www.kirix.com/about-us.html',
				uaIcon: 'kirix-strata.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Kirix Strata'
			}
		},
		'323': {
			typeId: '0',
			metadata: {
				uaFamily: 'TT Explorer',
				uaUrl: 'http://tt.qq.com/',
				uaCompany: 'Tencent',
				uaCompanyUrl: 'http://www.tencent.com/',
				uaIcon: 'tt_explorer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=TT Explorer'
			}
		},
		'324': {
			typeId: '0',
			metadata: {
				uaFamily: 'LBrowser',
				uaUrl: 'http://wiki.freespire.org/index.php/Web_Browser',
				uaCompany: 'Xandros Incorporated',
				uaCompanyUrl: 'http://www.xandros.com/',
				uaIcon: 'LBrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=LBrowser'
			}
		},
		'325': {
			typeId: '4',
			metadata: {
				uaFamily: 'Outlook 2007',
				uaUrl: 'http://en.wikipedia.org/wiki/Microsoft_Outlook',
				uaCompany: 'Microsoft Corporation.',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'outlook-2007.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Outlook 2007'
			}
		},
		'326': {
			typeId: '4',
			metadata: {
				uaFamily: 'Outlook 2010',
				uaUrl: 'http://en.wikipedia.org/wiki/Microsoft_Outlook',
				uaCompany: 'Microsoft Corporation.',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'outlook-2010.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Outlook 2010'
			}
		},
		'327': {
			typeId: '4',
			metadata: {
				uaFamily: 'Windows Live Mail',
				uaUrl: 'http://download.live.com/wlmail',
				uaCompany: 'Microsoft Corporation.',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'Windows_Live_Mail.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Windows Live Mail'
			}
		},
		'328': {
			typeId: '0',
			metadata: {
				uaFamily: 'Tjusig',
				uaUrl: 'http://www.tjusig.cz/',
				uaCompany: 'Luk\xe1\u0161 Ingr',
				uaCompanyUrl: '',
				uaIcon: 'tjusig.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Tjusig'
			}
		},
		'329': {
			typeId: '0',
			metadata: {
				uaFamily: 'SiteKiosk',
				uaUrl: 'http://www.sitekiosk.com/SiteKiosk/Default.aspx',
				uaCompany: 'PROVISIO GmbH / LLC',
				uaCompanyUrl: 'http://www.provisio.com/',
				uaIcon: 'sitekiosk.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SiteKiosk'
			}
		},
		'330': {
			typeId: '4',
			metadata: {
				uaFamily: 'The Bat!',
				uaUrl: 'http://www.ritlabs.com/en/products/thebat/',
				uaCompany: 'RITLabs SRL',
				uaCompanyUrl: 'http://www.ritlabs.com/',
				uaIcon: 'thebat.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=The Bat!'
			}
		},
		'331': {
			typeId: '20',
			metadata: {
				uaFamily: 'Novell BorderManager',
				uaUrl: 'http://www.novell.com/products/bordermanager/',
				uaCompany: 'Novell, Inc',
				uaCompanyUrl: 'http://www.novell.com/',
				uaIcon: 'Novell_BorderManager.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Novell BorderManager'
			}
		},
		'332': {
			typeId: '4',
			metadata: {
				uaFamily: 'Shredder',
				uaUrl: 'http://www.mozillamessaging.com/en-US/thunderbird/3.0a1/releasenotes/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'thunderbird.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Shredder'
			}
		},
		'333': {
			typeId: '18',
			metadata: {
				uaFamily: 'Public Radio Player',
				uaUrl: 'http://www.publicradioplayer.org/',
				uaCompany: 'Public Radio Exchange (PRX)',
				uaCompanyUrl: 'http://www.prx.org/',
				uaIcon: 'PRP.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Public Radio Player'
			}
		},
		'334': {
			typeId: '15',
			metadata: {
				uaFamily: 'Rss Bandit',
				uaUrl: 'http://rssbandit.org/',
				uaCompany: 'Infragistics, Inc.',
				uaCompanyUrl: 'http://www.infragistics.com/',
				uaIcon: 'RssBandit.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Rss Bandit'
			}
		},
		'335': {
			typeId: '4',
			metadata: {
				uaFamily: 'Postbox',
				uaUrl: 'http://www.postbox-inc.com/',
				uaCompany: 'Postbox, Inc.',
				uaCompanyUrl: 'http://www.postbox-inc.com/',
				uaIcon: 'postbox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Postbox'
			}
		},
		'336': {
			typeId: '10',
			metadata: {
				uaFamily: '2Bone LinkChecker',
				uaUrl: 'http://www.2bone.com/links/linkchecker.shtml',
				uaCompany: '2Bone',
				uaCompanyUrl: 'http://www.2bone.com/',
				uaIcon: '2bone.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=2Bone LinkChecker'
			}
		},
		'337': {
			typeId: '10',
			metadata: {
				uaFamily: 'Checkbot',
				uaUrl: 'http://degraaff.org/checkbot/',
				uaCompany: 'Hans de Graaff',
				uaCompanyUrl: 'http://degraaff.org/',
				uaIcon: 'perl.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Checkbot'
			}
		},
		'338': {
			typeId: '4',
			metadata: {
				uaFamily: 'GcMail',
				uaUrl: 'http://www.gcmail.de/',
				uaCompany: 'Monika Verse',
				uaCompanyUrl: '',
				uaIcon: 'gcmail.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GcMail'
			}
		},
		'339': {
			typeId: '0',
			metadata: {
				uaFamily: 'Swiftweasel',
				uaUrl: 'http://swiftweasel.tuxfamily.org/',
				uaCompany: 'SticKK',
				uaCompanyUrl: '',
				uaIcon: 'swiftweasel.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Swiftweasel'
			}
		},
		'340': {
			typeId: '15',
			metadata: {
				uaFamily: 'Fastladder FeedFetcher',
				uaUrl: 'http://fastladder.com/',
				uaCompany: 'livedoor Co.,Ltd. ',
				uaCompanyUrl: 'http://corp.livedoor.com/',
				uaIcon: 'fastladderFeedFetcher.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Fastladder FeedFetcher'
			}
		},
		'341': {
			typeId: '0',
			metadata: {
				uaFamily: 'Firefox (Lorentz)',
				uaUrl: 'http://www.mozilla.com/en-US/firefox/lorentz/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'firefox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Firefox (Lorentz)'
			}
		},
		'342': {
			typeId: '18',
			metadata: {
				uaFamily: 'Pocket Tunes',
				uaUrl: 'http://www.pocket-tunes.com/',
				uaCompany: 'NormSoft, Inc.',
				uaCompanyUrl: 'http://www.normsoft.com/',
				uaIcon: 'PocketTunes.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Pocket Tunes'
			}
		},
		'343': {
			typeId: '15',
			metadata: {
				uaFamily: 'SharpReader',
				uaUrl: 'http://www.sharpreader.net/',
				uaCompany: 'Luke Hutteman',
				uaCompanyUrl: 'http://www.hutteman.com/',
				uaIcon: 'sharpreader.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SharpReader'
			}
		},
		'344': {
			typeId: '15',
			metadata: {
				uaFamily: 'YeahReader',
				uaUrl: 'http://www.yeahreader.com/',
				uaCompany: 'ExtraLabs Software',
				uaCompanyUrl: 'http://www.extralabs.net/',
				uaIcon: 'YeahReader.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=YeahReader'
			}
		},
		'345': {
			typeId: '0',
			metadata: {
				uaFamily: 'Pale Moon',
				uaUrl: 'http://www.palemoon.org/',
				uaCompany: 'Moonchild Productions',
				uaCompanyUrl: 'http://www.moonchildproductions.net/',
				uaIcon: 'pale_moon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Pale Moon'
			}
		},
		'346': {
			typeId: '20',
			metadata: {
				uaFamily: 'Holmes',
				uaUrl: 'http://www.ucw.cz/holmes/',
				uaCompany: 'Martin Mare\u0161 and Robert \u0160palek',
				uaCompanyUrl: '',
				uaIcon: 'holmes.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Holmes'
			}
		},
		'347': {
			typeId: '20',
			metadata: {
				uaFamily: 'Google Earth',
				uaUrl: 'http://earth.google.com/',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://google.com/',
				uaIcon: 'google_earth.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Google Earth'
			}
		},
		'348': {
			typeId: '5',
			metadata: {
				uaFamily: 'ROME library',
				uaUrl: 'https://rome.dev.java.net/',
				uaCompany: 'A. Abdelnur, P. Chanezon and E. Chien',
				uaCompanyUrl: '',
				uaIcon: 'ROME_lib.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=ROME library'
			}
		},
		'349': {
			typeId: '15',
			metadata: {
				uaFamily: 'Akregator',
				uaUrl: 'http://akregator.kde.org/',
				uaCompany: '',
				uaCompanyUrl: 's',
				uaIcon: 'akregator.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Akregator'
			}
		},
		'350': {
			typeId: '0',
			metadata: {
				uaFamily: 'Mini Browser',
				uaUrl: 'http://dmkho.tripod.com/',
				uaCompany: 'DMKHO',
				uaCompanyUrl: '',
				uaIcon: 'minibrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Mini Browser'
			}
		},
		'351': {
			typeId: '0',
			metadata: {
				uaFamily: 'Espial TV Browser',
				uaUrl: 'http://www.espial.com/products/evo_browser/',
				uaCompany: 'Espial Group',
				uaCompanyUrl: 'http://www.espial.com/',
				uaIcon: 'EspialTVBrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Espial TV Browser'
			}
		},
		'352': {
			typeId: '0',
			metadata: {
				uaFamily: 'UltraBrowser ',
				uaUrl: 'http://www.ultrabrowser.com/',
				uaCompany: 'UltraBrowser.com, Inc.',
				uaCompanyUrl: '',
				uaIcon: 'UltraBrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=UltraBrowser '
			}
		},
		'353': {
			typeId: '0',
			metadata: {
				uaFamily: 'BrowseX',
				uaUrl: 'http://pdqi.com/browsex/',
				uaCompany: 'Peter MacDonald',
				uaCompanyUrl: 'http://pdqi.com/',
				uaIcon: 'browsex.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=BrowseX'
			}
		},
		'354': {
			typeId: '3',
			metadata: {
				uaFamily: 'Android Webkit',
				uaUrl: 'http://developer.android.com/reference/android/webkit/package-summary.html',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'androidWebkit.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Android Webkit'
			}
		},
		'355': {
			typeId: '0',
			metadata: {
				uaFamily: 'Weltweitimnetz Browser',
				uaUrl: 'http://weltweitimnetz.de/software/Browser.en.page',
				uaCompany: 'Philipp Ruppel',
				uaCompanyUrl: 'http://weltweitimnetz.de/',
				uaIcon: 'WeltweitimnetzBrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Weltweitimnetz Browser'
			}
		},
		'356': {
			typeId: '4',
			metadata: {
				uaFamily: 'PocoMail',
				uaUrl: 'http://www.pocomail.com/',
				uaCompany: 'Poco Systems Inc',
				uaCompanyUrl: 'http://www.pocosystems.com/',
				uaIcon: 'pocomail.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=PocoMail'
			}
		},
		'357': {
			typeId: '0',
			metadata: {
				uaFamily: 'Element Browser',
				uaUrl: 'http://www.elementsoftware.co.uk/software/elementbrowser/',
				uaCompany: 'Element Software UK.',
				uaCompanyUrl: 'http://www.elementsoftware.co.uk/',
				uaIcon: 'elementbrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Element Browser'
			}
		},
		'358': {
			typeId: '0',
			metadata: {
				uaFamily: 'SlimBrowser',
				uaUrl: 'http://slimbrowser.flashpeak.com/',
				uaCompany: 'FlashPeak Inc.',
				uaCompanyUrl: 'http://www.flashpeak.com/',
				uaIcon: 'slimbrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SlimBrowser'
			}
		},
		'359': {
			typeId: '20',
			metadata: {
				uaFamily: 'LeechCraft',
				uaUrl: 'http://leechcraft.org/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'LeechCraft.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=LeechCraft'
			}
		},
		'360': {
			typeId: '5',
			metadata: {
				uaFamily: 'HTTP_Request2',
				uaUrl: 'http://pear.php.net/package/http_request2',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'php.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=HTTP_Request2'
			}
		},
		'361': {
			typeId: '0',
			metadata: {
				uaFamily: 'Conkeror',
				uaUrl: 'http://conkeror.org/',
				uaCompany: 'Mozilla Foundation',
				uaCompanyUrl: 'http://www.mozilla.org/',
				uaIcon: 'conkeror.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Conkeror'
			}
		},
		'362': {
			typeId: '3',
			metadata: {
				uaFamily: 'Dolphin',
				uaUrl: 'http://www.dolphin-browser.com/',
				uaCompany: 'Samsung',
				uaCompanyUrl: 'http://www.samsung.com/',
				uaIcon: 'dolphin.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Dolphin'
			}
		},
		'363': {
			typeId: '15',
			metadata: {
				uaFamily: 'Netvibes feed reader',
				uaUrl: '',
				uaCompany: 'Netvibes team',
				uaCompanyUrl: 'http://about.netvibes.com/',
				uaIcon: 'netvibes.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Netvibes feed reader'
			}
		},
		'364': {
			typeId: '5',
			metadata: {
				uaFamily: 'Chilkat HTTP .NET',
				uaUrl: 'http://www.chilkatsoft.com/HttpDotNet.asp',
				uaCompany: 'Chilkat Software, Inc.',
				uaCompanyUrl: 'http://www.chilkatsoft.com/',
				uaIcon: 'chilkat.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Chilkat HTTP .NET'
			}
		},
		'365': {
			typeId: '5',
			metadata: {
				uaFamily: 'IXR lib',
				uaUrl: 'http://scripts.incutio.com/xmlrpc/',
				uaCompany: 'Incutio Ltd.',
				uaCompanyUrl: 'http://www.incutio.com/',
				uaIcon: 'Incutio.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=IXR lib'
			}
		},
		'366': {
			typeId: '20',
			metadata: {
				uaFamily: 'Web-sniffer',
				uaUrl: 'http://web-sniffer.net/',
				uaCompany: 'Lingo4you GbR',
				uaCompanyUrl: 'http://www.lingo4u.de/',
				uaIcon: 'Web-sniffer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Web-sniffer'
			}
		},
		'367': {
			typeId: '20',
			metadata: {
				uaFamily: 'Atomic Email Hunter',
				uaUrl: 'http://www.massmailsoftware.com/extractweb/',
				uaCompany: 'AtomPark Software Inc.',
				uaCompanyUrl: 'http://www.atompark.com/',
				uaIcon: 'Atomic_Email_Hunter.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Atomic Email Hunter'
			}
		},
		'368': {
			typeId: '20',
			metadata: {
				uaFamily: 'iGetter',
				uaUrl: 'http://www.igetter.net/',
				uaCompany: 'Presenta Ltd.',
				uaCompanyUrl: '',
				uaIcon: 'iGetter.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=iGetter'
			}
		},
		'369': {
			typeId: '1',
			metadata: {
				uaFamily: 'webfetch',
				uaUrl: 'http://tony.aiu.to/sa/webfetch/',
				uaCompany: 'Tony Aiuto',
				uaCompanyUrl: 'http://tony.aiu.to/',
				uaIcon: 'terminal.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=webfetch'
			}
		},
		'370': {
			typeId: '20',
			metadata: {
				uaFamily: 'Apache Synapse',
				uaUrl: 'http://synapse.apache.org/',
				uaCompany: 'Apache Software Foundation',
				uaCompanyUrl: 'http://www.apache.org/',
				uaIcon: 'ab.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Apache Synapse'
			}
		},
		'371': {
			typeId: '0',
			metadata: {
				uaFamily: 'lolifox',
				uaUrl: 'http://lolifox.com/',
				uaCompany: 'Atachi Hayashime',
				uaCompanyUrl: '',
				uaIcon: 'lolifox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=lolifox'
			}
		},
		'372': {
			typeId: '0',
			metadata: {
				uaFamily: 'SkipStone',
				uaUrl: 'http://www.muhri.net/skipstone/',
				uaCompany: 'Maher Awamy',
				uaCompanyUrl: 'http://www.muhri.net/',
				uaIcon: 'skipStone.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SkipStone'
			}
		},
		'373': {
			typeId: '20',
			metadata: {
				uaFamily: 'Powermarks',
				uaUrl: 'http://www.kaylon.com/power.html',
				uaCompany: 'Kaylon Technologies Inc.',
				uaCompanyUrl: 'http://www.kaylon.com/',
				uaIcon: 'powermarks.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Powermarks'
			}
		},
		'374': {
			typeId: '15',
			metadata: {
				uaFamily: 'Safari RSS reader',
				uaUrl: 'http://www.apple.com/safari/',
				uaCompany: 'Apple Inc.',
				uaCompanyUrl: 'http://www.apple.com/',
				uaIcon: 'rss.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Safari RSS reader'
			}
		},
		'375': {
			typeId: '20',
			metadata: {
				uaFamily: 'Google Friend Connect',
				uaUrl: 'http://www.google.com/friendconnect/',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'google_friend_connect.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Google Friend Connect'
			}
		},
		'376': {
			typeId: '15',
			metadata: {
				uaFamily: 'Feed Viewer',
				uaUrl: 'http://feedviewer.codeplex.com/',
				uaCompany: 'vasek7',
				uaCompanyUrl: 'http://www.codeplex.com/site/users/view/vasek7',
				uaIcon: 'rss.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Feed Viewer'
			}
		},
		'377': {
			typeId: '0',
			metadata: {
				uaFamily: 'RockMelt',
				uaUrl: 'http://www.rockmelt.com/',
				uaCompany: 'Rockmelt, Inc.',
				uaCompanyUrl: 'http://www.rockmelt.com/',
				uaIcon: 'rockmelt.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=RockMelt'
			}
		},
		'378': {
			typeId: '0',
			metadata: {
				uaFamily: 'Epic',
				uaUrl: 'http://www.epicbrowser.com/',
				uaCompany: 'Hidden Reflex',
				uaCompanyUrl: 'http://www.hiddenreflex.com/',
				uaIcon: 'epic.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Epic'
			}
		},
		'379': {
			typeId: '0',
			metadata: {
				uaFamily: 'InternetSurfboard',
				uaUrl: 'http://inetsurfboard.sourceforge.net/',
				uaCompany: 'Philipp Ruppel',
				uaCompanyUrl: '',
				uaIcon: 'internetSurfboard.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=InternetSurfboard'
			}
		},
		'380': {
			typeId: '0',
			metadata: {
				uaFamily: 'Vonkeror',
				uaUrl: 'http://zzo38computer.cjb.net/vonkeror/',
				uaCompany: 'zzo38',
				uaCompanyUrl: 'http://zzo38computer.cjb.net/',
				uaIcon: 'conkeror.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Vonkeror'
			}
		},
		'381': {
			typeId: '15',
			metadata: {
				uaFamily: 'IE RSS reader',
				uaUrl: 'http://en.wikipedia.org/wiki/Windows_RSS_Platform',
				uaCompany: 'Microsoft',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'rss.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=IE RSS reader'
			}
		},
		'382': {
			typeId: '15',
			metadata: {
				uaFamily: 'Trileet NewsRoom',
				uaUrl: 'http://feedmonger.blogspot.com/',
				uaCompany: 'Trileet Inc.',
				uaCompanyUrl: 'http://www.trileet.com/',
				uaIcon: 'rss.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Trileet NewsRoom'
			}
		},
		'383': {
			typeId: '10',
			metadata: {
				uaFamily: 'Validator.nu',
				uaUrl: 'http://validator.nu/',
				uaCompany: 'Henri Sivonen',
				uaCompanyUrl: 'http://hsivonen.iki.fi/author/',
				uaIcon: 'validator_nu.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Validator.nu'
			}
		},
		'384': {
			typeId: '5',
			metadata: {
				uaFamily: 'Zend_Http_Client',
				uaUrl: 'http://framework.zend.com/manual/en/zend.http.html',
				uaCompany: 'Zend Technologies Ltd.',
				uaCompanyUrl: 'http://www.zend.com/',
				uaIcon: 'zend_http_client.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Zend_Http_Client'
			}
		},
		'385': {
			typeId: '3',
			metadata: {
				uaFamily: 'Skyfire',
				uaUrl: 'http://www.skyfire.com/',
				uaCompany: 'Skyfire Labs, Inc.',
				uaCompanyUrl: 'http://www.skyfire.com/about',
				uaIcon: 'skyfire.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Skyfire'
			}
		},
		'386': {
			typeId: '3',
			metadata: {
				uaFamily: 'GO Browser',
				uaUrl: 'http://www.gobrowser.cn/',
				uaCompany: 'GO Dev Team',
				uaCompanyUrl: '',
				uaIcon: 'go_browser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=GO Browser'
			}
		},
		'387': {
			typeId: '0',
			metadata: {
				uaFamily: 'Surf',
				uaUrl: 'http://surf.suckless.org/',
				uaCompany: 'suckless.org',
				uaCompanyUrl: 'http://suckless.org/',
				uaIcon: 'surf.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Surf'
			}
		},
		'388': {
			typeId: '20',
			metadata: {
				uaFamily: 'iGooMap',
				uaUrl: 'http://www.pointworks.de/software/igoomap/index.php',
				uaCompany: 'PointWorks.de',
				uaCompanyUrl: 'http://www.pointworks.de/',
				uaIcon: 'igoomap.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=iGooMap'
			}
		},
		'389': {
			typeId: '18',
			metadata: {
				uaFamily: 'iTunes',
				uaUrl: 'http://www.apple.com/itunes/',
				uaCompany: 'Apple Inc.',
				uaCompanyUrl: 'http://www.apple.com/',
				uaIcon: 'itunes.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=iTunes'
			}
		},
		'390': {
			typeId: '0',
			metadata: {
				uaFamily: 'BlackHawk',
				uaUrl: 'http://www.netgate.sk/blackhawk/help/welcome-to-blackhawk-web-browser.html',
				uaCompany: 'NETGATE Technologies s.r.o. ',
				uaCompanyUrl: 'http://www.netgate.sk/',
				uaIcon: 'blackhawk.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=BlackHawk'
			}
		},
		'392': {
			typeId: '3',
			metadata: {
				uaFamily: 'Kindle Browser',
				uaUrl: 'http://en.wikipedia.org/wiki/Amazon_Kindle',
				uaCompany: 'Amazon.com',
				uaCompanyUrl: 'http://www.amazon.com/',
				uaIcon: 'kindle.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Kindle Browser'
			}
		},
		'393': {
			typeId: '20',
			metadata: {
				uaFamily: 'Microsoft Office Existence Discovery',
				uaUrl: 'http://blogs.msdn.com/b/vsofficedeveloper/archive/2008/03/11/office-existence-discovery-protocol.aspx',
				uaCompany: 'Microsoft Corporation.',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'webdav.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Microsoft Office Existence Discovery'
			}
		},
		'394': {
			typeId: '3',
			metadata: {
				uaFamily: 'Mobile Safari',
				uaUrl: 'http://en.wikipedia.org/wiki/Safari_%28web_browser%29',
				uaCompany: 'Apple Inc.',
				uaCompanyUrl: 'http://www.apple.com/',
				uaIcon: 'safari.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Mobile Safari'
			}
		},
		'395': {
			typeId: '20',
			metadata: {
				uaFamily: 'BrownRecluse',
				uaUrl: 'http://softbytelabs.com/us/br/index.html',
				uaCompany: 'SoftByte Labs, Inc.',
				uaCompanyUrl: 'http://softbytelabs.com/',
				uaIcon: 'BrownRecluse.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=BrownRecluse'
			}
		},
		'396': {
			typeId: '20',
			metadata: {
				uaFamily: 'BookmarkTracker',
				uaUrl: 'http://www.bookmarktracker.com/',
				uaCompany: 'BookmarkTracker.com, Inc.',
				uaCompanyUrl: '',
				uaIcon: 'BookmarkTracker.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=BookmarkTracker'
			}
		},
		'397': {
			typeId: '5',
			metadata: {
				uaFamily: 'BinGet',
				uaUrl: 'http://www.bin-co.com/php/scripts/load/',
				uaCompany: 'Binny VA',
				uaCompanyUrl: 'http://binnyva.com/',
				uaIcon: 'php.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=BinGet'
			}
		},
		'399': {
			typeId: '0',
			metadata: {
				uaFamily: 'Webian Shell',
				uaUrl: 'http://webian.org/shell/',
				uaCompany: 'Ben Francis',
				uaCompanyUrl: 'http://tola.me.uk/',
				uaIcon: 'webianshell.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Webian Shell'
			}
		},
		'400': {
			typeId: '0',
			metadata: {
				uaFamily: 'Kylo',
				uaUrl: 'http://kylo.tv/',
				uaCompany: 'Hillcrest Laboratories',
				uaCompanyUrl: 'http://hillcrestlabs.com/',
				uaIcon: 'kylo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Kylo'
			}
		},
		'401': {
			typeId: '0',
			metadata: {
				uaFamily: 'Fireweb Navigator',
				uaUrl: 'http://www.arsslensoft.tk/?q=node/7',
				uaCompany: 'Arsslensoft Foundation',
				uaCompanyUrl: 'http://www.arsslensoft.fi5.us/',
				uaIcon: 'Fireweb.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Fireweb Navigator'
			}
		},
		'402': {
			typeId: '5',
			metadata: {
				uaFamily: 'Evolution/Camel.Stream',
				uaUrl: 'http://live.gnome.org/Evolution/Camel.Stream',
				uaCompany: 'GNOME Project',
				uaCompanyUrl: 'http://www.gnome.org/',
				uaIcon: 'DLLicon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Evolution/Camel.Stream'
			}
		},
		'403': {
			typeId: '5',
			metadata: {
				uaFamily: 'EventMachine',
				uaUrl: 'http://rubyeventmachine.com/',
				uaCompany: '',
				uaCompanyUrl: '',
				uaIcon: 'DLLicon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=EventMachine'
			}
		},
		'404': {
			typeId: '0',
			metadata: {
				uaFamily: 'Sundance',
				uaUrl: 'http://www.digola.com/sundance.html',
				uaCompany: 'Digola',
				uaCompanyUrl: 'http://www.digola.com/',
				uaIcon: 'sundance.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Sundance'
			}
		},
		'405': {
			typeId: '0',
			metadata: {
				uaFamily: 'Chromium',
				uaUrl: 'http://dev.chromium.org/Home',
				uaCompany: 'Google Inc. and contributors',
				uaCompanyUrl: '',
				uaIcon: 'chromium.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Chromium'
			}
		},
		'406': {
			typeId: '0',
			metadata: {
				uaFamily: 'Columbus',
				uaUrl: 'http://www.columbus-browser.com/',
				uaCompany: 'Hipgnosis Vision',
				uaCompanyUrl: 'http://www.hipgnosis.ro/',
				uaIcon: 'columbus.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Columbus'
			}
		},
		'407': {
			typeId: '18',
			metadata: {
				uaFamily: 'Plex Media Center',
				uaUrl: 'http://www.plexapp.com/',
				uaCompany: 'Plex comunity',
				uaCompanyUrl: '',
				uaIcon: 'plex.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Plex Media Center'
			}
		},
		'408': {
			typeId: '0',
			metadata: {
				uaFamily: 'WebRender',
				uaUrl: 'http://webrender.99k.org/',
				uaCompany: 'Anand Bose',
				uaCompanyUrl: 'http://anandbose.99k.org/',
				uaIcon: 'webrender.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WebRender'
			}
		},
		'409': {
			typeId: '0',
			metadata: {
				uaFamily: 'CoolNovo',
				uaUrl: 'http://coolnovo.com/',
				uaCompany: 'Maple Studio',
				uaCompanyUrl: '',
				uaIcon: 'coolnovo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=CoolNovo'
			}
		},
		'410': {
			typeId: '0',
			metadata: {
				uaFamily: 'Usejump',
				uaUrl: 'http://www.usejump.com/',
				uaCompany: 'Usejump team',
				uaCompanyUrl: '',
				uaIcon: 'usejump.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Usejump'
			}
		},
		'411': {
			typeId: '0',
			metadata: {
				uaFamily: 'Sundial',
				uaUrl: 'http://www.sundialbrowser.com/',
				uaCompany: 'Unifiedroot',
				uaCompanyUrl: 'http://www.unifiedroot.com/',
				uaIcon: 'sundial.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Sundial'
			}
		},
		'412': {
			typeId: '0',
			metadata: {
				uaFamily: 'Alienforce',
				uaUrl: 'http://sourceforge.net/projects/alienforce/',
				uaCompany: 'KBclub Universal',
				uaCompanyUrl: 'http://kbclub.users.sourceforge.net/',
				uaIcon: 'alienforce.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Alienforce'
			}
		},
		'413': {
			typeId: '20',
			metadata: {
				uaFamily: 'Google Rich Snippets Testing Tool',
				uaUrl: 'http://www.google.com/webmasters/tools/richsnippets',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'feedfetcher-google.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Google Rich Snippets Testing Tool'
			}
		},
		'414': {
			typeId: '20',
			metadata: {
				uaFamily: 'HTML2JPG',
				uaUrl: 'http://www.html2jpg.com/',
				uaCompany: 'BVBA Adygo',
				uaCompanyUrl: 'http://www.adygo.com/',
				uaIcon: 'html2jpg.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=HTML2JPG'
			}
		},
		'415': {
			typeId: '15',
			metadata: {
				uaFamily: 'iCatcher!',
				uaUrl: 'http://joeisanerd.com/apps/iCatcher',
				uaCompany: 'Joe Isanerd',
				uaCompanyUrl: 'http://joeisanerd.com/',
				uaIcon: 'iCatcher.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=iCatcher!'
			}
		},
		'416': {
			typeId: '0',
			metadata: {
				uaFamily: 'Baidu Browser',
				uaUrl: 'http://liulanqi.baidu.com/',
				uaCompany: 'Baidu, Inc.',
				uaCompanyUrl: 'http://www.baidu.com/',
				uaIcon: 'baidubrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Baidu Browser'
			}
		},
		'417': {
			typeId: '0',
			metadata: {
				uaFamily: 'Sogou Explorer',
				uaUrl: 'http://ie.sogou.com/',
				uaCompany: 'Sohu.com, Inc.',
				uaCompanyUrl: 'http://www.sohu.com/',
				uaIcon: 'sogouexplorer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Sogou Explorer'
			}
		},
		'418': {
			typeId: '18',
			metadata: {
				uaFamily: 'MPlayer2',
				uaUrl: 'http://www.mplayer2.org/',
				uaCompany: 'mplayer2 project',
				uaCompanyUrl: '',
				uaIcon: 'mplayer.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=MPlayer2'
			}
		},
		'419': {
			typeId: '0',
			metadata: {
				uaFamily: 'ZipZap',
				uaUrl: 'http://www.zipzaphome.com/',
				uaCompany: 'JE Rhoads Company, LLC',
				uaCompanyUrl: 'http://www.jerhoads.com/',
				uaIcon: 'zipzap.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=ZipZap'
			}
		},
		'420': {
			typeId: '0',
			metadata: {
				uaFamily: 'QupZilla',
				uaUrl: 'http://www.qupzilla.com/',
				uaCompany: 'David Rosca',
				uaCompanyUrl: '',
				uaIcon: 'qupzilla.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=QupZilla'
			}
		},
		'421': {
			typeId: '0',
			metadata: {
				uaFamily: 'Patriott',
				uaUrl: 'http://madgroup.x10.mx/patriott1.php',
				uaCompany: 'MadWorks Group.',
				uaCompanyUrl: 'http://madgroup.x10.mx/',
				uaIcon: 'patriott.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Patriott'
			}
		},
		'422': {
			typeId: '3',
			metadata: {
				uaFamily: 'Tizen Browser',
				uaUrl: 'https://www.tizen.org/',
				uaCompany: 'Tizen Project',
				uaCompanyUrl: 'https://www.tizen.org/',
				uaIcon: 'tizen.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Tizen Browser'
			}
		},
		'423': {
			typeId: '3',
			metadata: {
				uaFamily: 'Chrome Mobile',
				uaUrl: 'http://www.google.com/intl/en/chrome/browser/mobile/',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'chrome.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Chrome Mobile'
			}
		},
		'424': {
			typeId: '18',
			metadata: {
				uaFamily: 'Winamp for Android',
				uaUrl: 'http://www.winamp.com/android',
				uaCompany: 'Nullsoft, Inc.',
				uaCompanyUrl: 'http://en.wikipedia.org/wiki/Nullsoft',
				uaIcon: 'winamp.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Winamp for Android'
			}
		},
		'425': {
			typeId: '20',
			metadata: {
				uaFamily: 'Apache internal dummy connection',
				uaUrl: 'http://wiki.apache.org/httpd/InternalDummyConnection',
				uaCompany: 'Apache Software Foundation',
				uaCompanyUrl: 'http://www.apache.org/',
				uaIcon: 'ab.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Apache internal dummy connection'
			}
		},
		'426': {
			typeId: '3',
			metadata: {
				uaFamily: 'NineSky',
				uaUrl: 'http://ninesky.com/',
				uaCompany: 'ninesky.com',
				uaCompanyUrl: '',
				uaIcon: 'ninesky.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NineSky'
			}
		},
		'427': {
			typeId: '0',
			metadata: {
				uaFamily: 'Maple browser',
				uaUrl: 'http://www.freethetvchallenge.com/details/faq',
				uaCompany: 'Samsung',
				uaCompanyUrl: 'http://www.samsung.com/',
				uaIcon: 'maple.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Maple browser'
			}
		},
		'428': {
			typeId: '3',
			metadata: {
				uaFamily: 'wOSBrowser',
				uaUrl: '',
				uaCompany: 'Hewlett-Packard',
				uaCompanyUrl: 'http://www.hp.com/',
				uaIcon: 'webos.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=wOSBrowser'
			}
		},
		'429': {
			typeId: '20',
			metadata: {
				uaFamily: 'Nokia SyncML Client',
				uaUrl: 'http://www.developer.nokia.com/Community/Wiki/SyncML_Client_API',
				uaCompany: 'Nokia',
				uaCompanyUrl: 'http://www.nokia.com/',
				uaIcon: 'nokiaSyncML.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Nokia SyncML Client'
			}
		},
		'430': {
			typeId: '0',
			metadata: {
				uaFamily: 'Charon',
				uaUrl: 'http://en.wikipedia.org/wiki/Charon_%28web_browser%29',
				uaCompany: 'Vita Nuova Holdings Ltd',
				uaCompanyUrl: 'http://www.vitanuova.com/',
				uaIcon: 'charon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Charon'
			}
		},
		'432': {
			typeId: '20',
			metadata: {
				uaFamily: 'JS-Kit/Echo',
				uaUrl: 'http://sites.google.com/site/echocomments/home',
				uaCompany: 'Echo',
				uaCompanyUrl: 'http://aboutecho.com/',
				uaIcon: 'JS-Kit.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=JS-Kit/Echo'
			}
		},
		'433': {
			typeId: '20',
			metadata: {
				uaFamily: 'Podkicker',
				uaUrl: 'http://www.podkicker.com/',
				uaCompany: 'skiplist',
				uaCompanyUrl: '',
				uaIcon: 'podkicker.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Podkicker'
			}
		},
		'434': {
			typeId: '5',
			metadata: {
				uaFamily: 'Python-requests',
				uaUrl: 'http://python-requests.org/',
				uaCompany: 'Kenneth Reitz',
				uaCompanyUrl: 'http://kennethreitz.com/',
				uaIcon: 'pythonurllib.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Python-requests'
			}
		},
		'436': {
			typeId: '3',
			metadata: {
				uaFamily: 'Atomic Web Browser',
				uaUrl: 'http://atomicwebbrowser.com/',
				uaCompany: 'Richard Trautvetter',
				uaCompanyUrl: '',
				uaIcon: 'AtomicWebBrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Atomic Web Browser'
			}
		},
		'437': {
			typeId: '15',
			metadata: {
				uaFamily: 'Reeder',
				uaUrl: 'http://reederapp.com/',
				uaCompany: 'Silvio Rizzi',
				uaCompanyUrl: 'http://madeatgloria.com/',
				uaIcon: 'reader.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Reeder'
			}
		},
		'438': {
			typeId: '20',
			metadata: {
				uaFamily: 'WordPress pingback',
				uaUrl: 'http://codex.wordpress.org/Introduction_to_Blogging#Pingbacks',
				uaCompany: 'wordpress.org',
				uaCompanyUrl: 'http://wordpress.org/',
				uaIcon: 'wordpress.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=WordPress pingback'
			}
		},
		'439': {
			typeId: '0',
			metadata: {
				uaFamily: 'TenFourFox',
				uaUrl: 'http://www.floodgap.com/software/tenfourfox/',
				uaCompany: 'Cameron Kaiser',
				uaCompanyUrl: 'http://www.floodgap.com/',
				uaIcon: 'TenFourFox.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=TenFourFox'
			}
		},
		'440': {
			typeId: '5',
			metadata: {
				uaFamily: 'PEAR HTTP_Request',
				uaUrl: 'http://pear.php.net/package/HTTP_Request',
				uaCompany: 'Richard Heyes',
				uaCompanyUrl: '',
				uaIcon: 'php.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=PEAR HTTP_Request'
			}
		},
		'441': {
			typeId: '0',
			metadata: {
				uaFamily: 'D+',
				uaUrl: 'http://dplus-browser.sourceforge.net/',
				uaCompany: 'Benjamin Johnson',
				uaCompanyUrl: 'http://obeythepenguin.users.sourceforge.net/',
				uaIcon: 'dillo.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=D+'
			}
		},
		'442': {
			typeId: '0',
			metadata: {
				uaFamily: 'zBrowser',
				uaUrl: 'http://sites.google.com/site/zeromusparadoxe01/zbrowser',
				uaCompany: 'Bastien Pederencino',
				uaCompanyUrl: 'http://sites.google.com/site/zeromusparadoxe01/',
				uaIcon: 'zBrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=zBrowser'
			}
		},
		'443': {
			typeId: '0',
			metadata: {
				uaFamily: 'SlimBoat',
				uaUrl: 'http://slimboat.com/',
				uaCompany: 'FlashPeak Inc.',
				uaCompanyUrl: 'http://www.flashpeak.com/',
				uaIcon: 'slimboat.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SlimBoat'
			}
		},
		'445': {
			typeId: '5',
			metadata: {
				uaFamily: 'Mechanize',
				uaUrl: 'http://mechanize.rubyforge.org/',
				uaCompany: 'Aaron Patterson',
				uaCompanyUrl: 'http://tenderlovemaking.com/',
				uaIcon: 'ruby_on_rails.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Mechanize'
			}
		},
		'446': {
			typeId: '5',
			metadata: {
				uaFamily: 'HTMLayout',
				uaUrl: 'http://www.terrainformatica.com/htmlayout/main.whtm',
				uaCompany: 'Terra Informatica Software, Inc.',
				uaCompanyUrl: 'http://www.terrainformatica.com/',
				uaIcon: 'DLLicon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=HTMLayout'
			}
		},
		'447': {
			typeId: '0',
			metadata: {
				uaFamily: 'SaaYaa Explorer',
				uaUrl: 'http://www.saayaa.com/',
				uaCompany: 'RuanMei.com',
				uaCompanyUrl: 'http://www.ruanmei.com/',
				uaIcon: 'SaaYaa.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SaaYaa Explorer'
			}
		},
		'448': {
			typeId: '0',
			metadata: {
				uaFamily: 'Ryouko',
				uaUrl: 'http://sourceforge.net/projects/ryouko/',
				uaCompany: 'Daniel Sim',
				uaCompanyUrl: 'http://sourceforge.net/users/foxhead128/',
				uaIcon: 'ryouko.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Ryouko'
			}
		},
		'449': {
			typeId: '5',
			metadata: {
				uaFamily: 'Anemone',
				uaUrl: 'http://anemone.rubyforge.org/',
				uaCompany: 'Chris Kite',
				uaCompanyUrl: 'http://www.chriskite.com/',
				uaIcon: 'DLLicon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Anemone'
			}
		},
		'450': {
			typeId: '4',
			metadata: {
				uaFamily: 'Sparrow',
				uaUrl: 'http://sprw.me/',
				uaCompany: 'Google Inc.',
				uaCompanyUrl: 'http://www.google.com/',
				uaIcon: 'sparrow.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Sparrow'
			}
		},
		'451': {
			typeId: '18',
			metadata: {
				uaFamily: 'SubStream',
				uaUrl: 'http://itunes.apple.com/us/app/substream/id389906706?mt=8',
				uaCompany: 'Figment, Inc.',
				uaCompanyUrl: 'http://www.figmentdevelopment.com/',
				uaIcon: 'SubStream.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=SubStream'
			}
		},
		'452': {
			typeId: '4',
			metadata: {
				uaFamily: 'Barca',
				uaUrl: 'http://www.pocosystems.com/home/index.php?option=content&task=category&sectionid=2&id=9&Itemid=27',
				uaCompany: 'Poco Systems Inc',
				uaCompanyUrl: 'http://www.pocosystems.com/',
				uaIcon: 'barca.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Barca'
			}
		},
		'453': {
			typeId: '20',
			metadata: {
				uaFamily: 'A1 Sitemap Generator',
				uaUrl: 'http://www.microsystools.com/products/sitemap-generator/',
				uaCompany: 'Microsys',
				uaCompanyUrl: 'http://www.microsystools.com/home/microsys.php',
				uaIcon: 'A1sitemapGenerator.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=A1 Sitemap Generator'
			}
		},
		'454': {
			typeId: '3',
			metadata: {
				uaFamily: 'PS Vita browser',
				uaUrl: '',
				uaCompany: 'Sony Computer Entertainment',
				uaCompanyUrl: 'http://www.scei.co.jp/',
				uaIcon: 'ps-vita-browser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=PS Vita browser'
			}
		},
		'455': {
			typeId: '3',
			metadata: {
				uaFamily: 'QQbrowser',
				uaUrl: 'http://browser.qq.com/',
				uaCompany: 'Tencent Ltd.',
				uaCompanyUrl: 'http://www.tencent.com/',
				uaIcon: 'QQbrowser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=QQbrowser'
			}
		},
		'456': {
			typeId: '0',
			metadata: {
				uaFamily: 'Beamrise',
				uaUrl: 'http://www.beamrise.com/',
				uaCompany: 'SIEN S.A.',
				uaCompanyUrl: 'http://www.sien.com/',
				uaIcon: 'beamrise.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Beamrise'
			}
		},
		'457': {
			typeId: '0',
			metadata: {
				uaFamily: 'Yandex.Browser',
				uaUrl: 'http://browser.yandex.com/',
				uaCompany: 'Yandex ',
				uaCompanyUrl: 'http://yandex.com/',
				uaIcon: 'Yandex.Browser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Yandex.Browser'
			}
		},
		'458': {
			typeId: '3',
			metadata: {
				uaFamily: 'Silk',
				uaUrl: 'http://amazonsilk.wordpress.com/',
				uaCompany: 'Amazon.com, Inc.',
				uaCompanyUrl: 'http://www.amazon.com/',
				uaIcon: 'amazon_silk.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Silk'
			}
		},
		'459': {
			typeId: '5',
			metadata: {
				uaFamily: 'Apache-HttpClient',
				uaUrl: 'http://hc.apache.org/httpcomponents-client-ga/',
				uaCompany: 'Apache Software Foundation',
				uaCompanyUrl: 'http://www.apache.org/',
				uaIcon: 'jakarta.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Apache-HttpClient'
			}
		},
		'460': {
			typeId: '0',
			metadata: {
				uaFamily: 'Nintendo Browser',
				uaUrl: 'http://en.wikipedia.org/wiki/Wii_u',
				uaCompany: 'Nintendo of America Inc.',
				uaCompanyUrl: 'http://www.nintendo.com/',
				uaIcon: 'wii.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Nintendo Browser'
			}
		},
		'461': {
			typeId: '20',
			metadata: {
				uaFamily: 'Dell Web Monitor',
				uaUrl: '',
				uaCompany: 'Quest Software',
				uaCompanyUrl: 'http://www.quest.com/',
				uaIcon: 'dell.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Dell Web Monitor'
			}
		},
		'462': {
			typeId: '15',
			metadata: {
				uaFamily: 'FeedDemon',
				uaUrl: 'http://www.feeddemon.com/',
				uaCompany: 'NewsGator Technologies, Inc.',
				uaCompanyUrl: 'http://www.newsgator.com/',
				uaIcon: 'FeedDemon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=FeedDemon'
			}
		},
		'463': {
			typeId: '5',
			metadata: {
				uaFamily: 'XML-RPC for Ruby',
				uaUrl: 'http://www.ntecs.de/ruby/xmlrpc4r/howto.html',
				uaCompany: 'Michael Neumann',
				uaCompanyUrl: 'http://www.ntecs.de/',
				uaIcon: 'ruby-on-rails.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=XML-RPC for Ruby'
			}
		},
		'464': {
			typeId: '20',
			metadata: {
				uaFamily: 'Pattern',
				uaUrl: 'http://www.clips.ua.ac.be/pages/pattern',
				uaCompany: 'Computational Linguistics & Psycholinguistics Research Center ',
				uaCompanyUrl: 'http://www.clips.ua.ac.be/',
				uaIcon: 'pythonurllib.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Pattern'
			}
		},
		'465': {
			typeId: '4',
			metadata: {
				uaFamily: 'Eudora',
				uaUrl: 'http://www.eudora.com/archive.html',
				uaCompany: 'Qualcomm Incorporated.',
				uaCompanyUrl: 'http://www.qualcomm.com/',
				uaIcon: 'eudora.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Eudora'
			}
		},
		'466': {
			typeId: '4',
			metadata: {
				uaFamily: 'Apple Mail',
				uaUrl: 'http://en.wikipedia.org/wiki/Apple_mail',
				uaCompany: 'Apple Inc.',
				uaCompanyUrl: 'http://www.apple.com/',
				uaIcon: 'apple-mail.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Apple Mail'
			}
		},
		'467': {
			typeId: '0',
			metadata: {
				uaFamily: 'Polarity',
				uaUrl: 'http://polarityweb.webs.com/',
				uaCompany: 'Stanley Lim',
				uaCompanyUrl: '',
				uaIcon: 'polarity.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Polarity'
			}
		},
		'468': {
			typeId: '0',
			metadata: {
				uaFamily: 'Superbird',
				uaUrl: 'http://superbird.me/',
				uaCompany: 'The Superbird Authors',
				uaCompanyUrl: '',
				uaIcon: 'superbird.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Superbird'
			}
		},
		'469': {
			typeId: '3',
			metadata: {
				uaFamily: 'NetFront Life',
				uaUrl: 'http://gl.access-company.com/files/legacy/products/nflife/app_browser2.html',
				uaCompany: 'ACCESS CO., LTD.',
				uaCompanyUrl: 'http://www.access-company.com/',
				uaIcon: 'netfrontlife.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=NetFront Life'
			}
		},
		'470': {
			typeId: '0',
			metadata: {
				uaFamily: 'YRC Weblink',
				uaUrl: 'http://weblink.justyrc.com/',
				uaCompany: 'YRC Group Inc.',
				uaCompanyUrl: 'http://www.justyrc.com/',
				uaIcon: 'yrc_webling.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=YRC Weblink'
			}
		},
		'471': {
			typeId: '0',
			metadata: {
				uaFamily: 'IceDragon',
				uaUrl: 'http://www.comodo.com/home/browsers-toolbars/icedragon-browser.php',
				uaCompany: 'Comodo Group, Inc.',
				uaCompanyUrl: 'http://www.comodo.com/',
				uaIcon: 'icedragon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=IceDragon'
			}
		},
		'473': {
			typeId: '4',
			metadata: {
				uaFamily: 'Outlook 2013',
				uaUrl: 'http://en.wikipedia.org/wiki/Microsoft_Outlook',
				uaCompany: 'Microsoft Corporation.',
				uaCompanyUrl: 'http://www.microsoft.com/',
				uaIcon: 'outlook2013.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Outlook 2013'
			}
		},
		'474': {
			typeId: '5',
			metadata: {
				uaFamily: 'RestSharp',
				uaUrl: 'http://restsharp.org/',
				uaCompany: 'John Sheehan',
				uaCompanyUrl: 'http://john-sheehan.com/',
				uaIcon: 'DLLicon.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=RestSharp'
			}
		},
		'475': {
			typeId: '3',
			metadata: {
				uaFamily: 'Yandex.Browser mobile',
				uaUrl: 'http://mobil.yandex.com/',
				uaCompany: 'Yandex ',
				uaCompanyUrl: 'http://yandex.com/',
				uaIcon: 'Yandex.Browser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Yandex.Browser mobile'
			}
		},
		'476': {
			typeId: '3',
			metadata: {
				uaFamily: 'Puffin',
				uaUrl: 'http://www.puffinbrowser.com/',
				uaCompany: 'CloudMosa Inc.',
				uaCompanyUrl: 'http://www.cloudmosa.com/',
				uaIcon: 'puffin.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Puffin'
			}
		},
		'477': {
			typeId: '0',
			metadata: {
				uaFamily: 'Roccat browser',
				uaUrl: 'http://www.runecats.com/roccat.html',
				uaCompany: 'Runecats',
				uaCompanyUrl: 'http://runecats.com/',
				uaIcon: 'roccat.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Roccat browser'
			}
		},
		'478': {
			typeId: '4',
			metadata: {
				uaFamily: 'AirMail',
				uaUrl: 'http://airmailapp.com/',
				uaCompany: 'Bloop S.R.L.',
				uaCompanyUrl: 'http://bloop.info/',
				uaIcon: 'airmail.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=AirMail'
			}
		},
		'479': {
			typeId: '0',
			metadata: {
				uaFamily: '3DS Browser',
				uaUrl: 'http://en.wikipedia.org/wiki/Internet_Browser_(Nintendo_3DS)',
				uaCompany: 'Nintendo of America Inc.',
				uaCompanyUrl: 'http://www.nintendo.com/',
				uaIcon: '3DS-Browser.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=3DS Browser'
			}
		},
		'481': {
			typeId: '20',
			metadata: {
				uaFamily: 'BrowserEmulator',
				uaUrl: 'http://www.dejavu.org/emulator.htm',
				uaCompany: 'Metamatrix AB',
				uaCompanyUrl: 'http://www.metamatrix.se/',
				uaIcon: 'browseremulator.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=BrowserEmulator'
			}
		},
		'482': {
			typeId: '3',
			metadata: {
				uaFamily: 'Palm WebPro',
				uaUrl: 'http://www.hpwebos.com/us/support/handbooks/tungstent/webbrowser_hb.pdf',
				uaCompany: 'Palm Inc.',
				uaCompanyUrl: 'http://www.palm.com/',
				uaIcon: 'palmWebPro.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=Palm WebPro'
			}
		},
		'483': {
			typeId: '20',
			metadata: {
				uaFamily: 'PhantomJS',
				uaUrl: 'http://phantomjs.org/',
				uaCompany: 'Ariya Hidayat',
				uaCompanyUrl: 'http://ariya.ofilabs.com/about',
				uaIcon: 'PhantomJS.png',
				uaInfoUrl: '/list-of-ua/browser-detail?browser=PhantomJS'
			}
		},
		order: [
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'10',
			'11',
			'14',
			'15',
			'16',
			'17',
			'18',
			'19',
			'21',
			'22',
			'23',
			'24',
			'25',
			'27',
			'28',
			'29',
			'30',
			'31',
			'32',
			'33',
			'35',
			'39',
			'40',
			'41',
			'42',
			'43',
			'44',
			'45',
			'46',
			'47',
			'48',
			'49',
			'50',
			'51',
			'52',
			'53',
			'54',
			'55',
			'56',
			'57',
			'58',
			'59',
			'61',
			'62',
			'71',
			'74',
			'79',
			'81',
			'82',
			'85',
			'86',
			'87',
			'88',
			'89',
			'90',
			'91',
			'93',
			'94',
			'96',
			'99',
			'100',
			'105',
			'111',
			'117',
			'119',
			'120',
			'121',
			'122',
			'123',
			'124',
			'125',
			'126',
			'128',
			'129',
			'130',
			'131',
			'132',
			'133',
			'134',
			'135',
			'136',
			'137',
			'138',
			'139',
			'140',
			'141',
			'142',
			'143',
			'144',
			'145',
			'146',
			'147',
			'148',
			'149',
			'150',
			'151',
			'152',
			'153',
			'154',
			'155',
			'156',
			'157',
			'158',
			'159',
			'160',
			'161',
			'162',
			'163',
			'165',
			'166',
			'167',
			'168',
			'169',
			'170',
			'171',
			'172',
			'173',
			'174',
			'175',
			'176',
			'177',
			'178',
			'179',
			'180',
			'181',
			'182',
			'183',
			'184',
			'185',
			'187',
			'188',
			'189',
			'190',
			'191',
			'192',
			'193',
			'194',
			'195',
			'196',
			'197',
			'198',
			'199',
			'200',
			'201',
			'202',
			'204',
			'205',
			'206',
			'207',
			'208',
			'209',
			'210',
			'211',
			'212',
			'213',
			'214',
			'216',
			'217',
			'218',
			'219',
			'220',
			'221',
			'222',
			'223',
			'225',
			'226',
			'227',
			'228',
			'229',
			'230',
			'231',
			'232',
			'233',
			'234',
			'235',
			'236',
			'237',
			'238',
			'239',
			'240',
			'241',
			'242',
			'243',
			'244',
			'245',
			'246',
			'247',
			'248',
			'249',
			'250',
			'251',
			'252',
			'253',
			'254',
			'255',
			'256',
			'257',
			'258',
			'259',
			'260',
			'261',
			'262',
			'263',
			'264',
			'265',
			'266',
			'267',
			'268',
			'269',
			'270',
			'271',
			'272',
			'273',
			'274',
			'276',
			'277',
			'278',
			'279',
			'280',
			'281',
			'282',
			'283',
			'284',
			'285',
			'286',
			'287',
			'288',
			'289',
			'290',
			'291',
			'292',
			'293',
			'294',
			'296',
			'297',
			'298',
			'299',
			'300',
			'301',
			'302',
			'303',
			'304',
			'305',
			'306',
			'307',
			'308',
			'309',
			'310',
			'311',
			'312',
			'313',
			'314',
			'315',
			'316',
			'317',
			'318',
			'319',
			'320',
			'321',
			'322',
			'323',
			'324',
			'325',
			'326',
			'327',
			'328',
			'329',
			'330',
			'331',
			'332',
			'333',
			'334',
			'335',
			'336',
			'337',
			'338',
			'339',
			'340',
			'341',
			'342',
			'343',
			'344',
			'345',
			'346',
			'347',
			'348',
			'349',
			'350',
			'351',
			'352',
			'353',
			'354',
			'355',
			'356',
			'357',
			'358',
			'359',
			'360',
			'361',
			'362',
			'363',
			'364',
			'365',
			'366',
			'367',
			'368',
			'369',
			'370',
			'371',
			'372',
			'373',
			'374',
			'375',
			'376',
			'377',
			'378',
			'379',
			'380',
			'381',
			'382',
			'383',
			'384',
			'385',
			'386',
			'387',
			'388',
			'389',
			'390',
			'392',
			'393',
			'394',
			'395',
			'396',
			'397',
			'399',
			'400',
			'401',
			'402',
			'403',
			'404',
			'405',
			'406',
			'407',
			'408',
			'409',
			'410',
			'411',
			'412',
			'413',
			'414',
			'415',
			'416',
			'417',
			'418',
			'419',
			'420',
			'421',
			'422',
			'423',
			'424',
			'425',
			'426',
			'427',
			'428',
			'429',
			'430',
			'432',
			'433',
			'434',
			'436',
			'437',
			'438',
			'439',
			'440',
			'441',
			'442',
			'443',
			'445',
			'446',
			'447',
			'448',
			'449',
			'450',
			'451',
			'452',
			'453',
			'454',
			'455',
			'456',
			'457',
			'458',
			'459',
			'460',
			'461',
			'462',
			'463',
			'464',
			'465',
			'466',
			'467',
			'468',
			'469',
			'470',
			'471',
			'473',
			'474',
			'475',
			'476',
			'477',
			'478',
			'479',
			'481',
			'482',
			'483'
		]
	},
	browserType: {
		'0': 'Browser',
		'1': 'Offline Browser',
		'3': 'Mobile Browser',
		'4': 'Email client',
		'5': 'Library',
		'6': 'Wap Browser',
		'10': 'Validator',
		'15': 'Feed Reader',
		'18': 'Multimedia Player',
		'20': 'Other',
		'50': 'Useragent Anonymizer',
		order: [
			'0',
			'1',
			'3',
			'4',
			'5',
			'6',
			'10',
			'15',
			'18',
			'20',
			'50'
		]
	},
	browserReg: {
		'1': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*seamonkey\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '2'
		},
		'2': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*camino\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '1'
		},
		'3': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*firefox\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '3'
		},
		'4': {
			regexp: /mozilla[\s\S]*netscape[0-9]?\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '4'
		},
		'5': {
			regexp: /mozilla[\s\S]*gecko\/[0-9]+[\s\S]*epiphany\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '5'
		},
		'6': {
			regexp: /mozilla[\s\S]*gecko\/[0-9]+[\s\S]*galeon\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '6'
		},
		'7': {
			regexp: /mozilla[\s\S]*gecko\/[0-9]+[\s\S]*flock\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '7'
		},
		'8': {
			regexp: /mozilla[\s\S]*gecko\/[0-9]+[\s\S]*minimo\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '8'
		},
		'9': {
			regexp: /mozilla[\s\S]*gecko\/[0-9]+[\s\S]*k\-meleon\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '9'
		},
		'10': {
			regexp: /mozilla[\s\S]*gecko\/[0-9]+[\s\S]*k-ninja\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '10'
		},
		'11': {
			regexp: /mozilla[\s\S]*gecko[\s\S]*kazehakase\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '11'
		},
		'14': {
			regexp: /mozilla[\s\S]*rv[ :][0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*firebird\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '14'
		},
		'15': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*phoenix\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '15'
		},
		'16': {
			regexp: /mozilla[\s\S]*konqueror\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '16'
		},
		'17': {
			regexp: /mozilla[\s\S]*opera ([0-9][0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '17'
		},
		'18': {
			regexp: /^opera\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '17'
		},
		'19': {
			regexp: /mozilla[\s\S]*applewebkit\/[0-9]+[\s\S]*omniweb\/v[0-9\.]+/i,
			browserId: '18'
		},
		'20': {
			regexp: /mozilla[\s\S]*applewebkit\/[0-9]+[\s\S]*sunrisebrowser\/([0-9a-z\+\-\.]+)/i,
			browserId: '19'
		},
		'22': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*shiira\/([0-9a-z\+\-\.]+)[\s\S]*safari/i,
			browserId: '21'
		},
		'23': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*\/[0-9a-z\+\-\.]+[\s\S]*safari\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '22'
		},
		'24': {
			regexp: /dillo\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '23'
		},
		'25': {
			regexp: /icab[ \/]([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '24'
		},
		'26': {
			regexp: /^lynx\/([0-9a-z\.]+)[\s\S]*/i,
			browserId: '25'
		},
		'28': {
			regexp: /^elinks \(([0-9a-z\.]+)[\s\S]*/i,
			browserId: '27'
		},
		'29': {
			regexp: /^elinks\/([0-9a-z\.]+)[\s\S]*/i,
			browserId: '27'
		},
		'30': {
			regexp: /^elinks$/i,
			browserId: '27'
		},
		'31': {
			regexp: /^Wget\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '28'
		},
		'32': {
			regexp: /Amiga\-Aweb\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '29'
		},
		'33': {
			regexp: /AmigaVoyager\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '30'
		},
		'34': {
			regexp: /IBrowse\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '31'
		},
		'35': {
			regexp: /UP\.Browser\/([0-9a-zA-Z\.]+)[\s\S]*/,
			browserId: '32'
		},
		'36': {
			regexp: /UP\/([0-9a-zA-Z\.]+)[\s\S]*/,
			browserId: '32'
		},
		'37': {
			regexp: /NetFront\/([0-9a-z\.]+)[\s\S]*/i,
			browserId: '33'
		},
		'39': {
			regexp: /mozilla\/[\s\S]*MSIE ([0-9b\.]+)[\s\S]*/i,
			browserId: '35'
		},
		'42': {
			regexp: /offline explorer\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '39'
		},
		'44': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*AOL ([0-9a-z\+\-\.]+)/i,
			browserId: '40'
		},
		'45': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*America Online Browser ([0-9a-z\+\-\.]+)/i,
			browserId: '40'
		},
		'46': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*Avant Browser ([0-9a-z\+\-\.]+)/i,
			browserId: '41'
		},
		'47': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*Avant Browser/i,
			browserId: '41'
		},
		'48': {
			regexp: /mozilla[\s\S]*AvantGo ([0-9a-z\+\-\.]+)/i,
			browserId: '42'
		},
		'49': {
			regexp: /mozilla[\s\S]*Blazer\/([0-9a-z\+\-\.]+)/i,
			browserId: '43'
		},
		'50': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*Crazy Browser ([0-9a-z \+\-\.]+)/i,
			browserId: '44'
		},
		'51': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*Deepnet Explorer ([0-9a-z\+\-\.]+)/i,
			browserId: '45'
		},
		'52': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*Deepnet Explorer/i,
			browserId: '45'
		},
		'53': {
			regexp: /mozilla[\s\S]*HTTrack ([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '46'
		},
		'54': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*IceWeasel\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '47'
		},
		'55': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*iRider ([0-9a-z\+\-\.]+)/i,
			browserId: '48'
		},
		'56': {
			regexp: /[\s\S]*isilox\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '49'
		},
		'57': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*KKman([0-9a-z\+\-\.]+)/i,
			browserId: '50'
		},
		'58': {
			regexp: /libwww\-perl\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '51'
		},
		'59': {
			regexp: /mozilla[\s\S]*Lunascape\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '52'
		},
		'60': {
			regexp: /mozilla[\s\S]*Maxthon ([0-9a-z\+\-\.]+)/i,
			browserId: '53'
		},
		'61': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*MyIE2/i,
			browserId: '53'
		},
		'62': {
			regexp: /mozilla[\s\S]*(rv:[0-9\.]+)[\s\S]*gecko\/[0-9]+[\s\S]*/i,
			browserId: '54'
		},
		'63': {
			regexp: /mozilla[\s\S]*MultiZilla ([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '55'
		},
		'64': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*NetCaptor ([0-9a-z\+\-\.]+)/i,
			browserId: '56'
		},
		'65': {
			regexp: /Netgem\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '57'
		},
		'66': {
			regexp: /netsurf\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '58'
		},
		'67': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*Sleipnir\/([0-9a-z\+\-\.]+)/i,
			browserId: '59'
		},
		'69': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*firefox\/([0-9a-z\+\-\.]+)[\s\S]*swiftfox/i,
			browserId: '61'
		},
		'70': {
			regexp: /Teleport Pro\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '62'
		},
		'77': {
			regexp: /sunrise[ \/]([0-9a-z\+\-\.\/]+)/i,
			browserId: '19'
		},
		'78': {
			regexp: /mozilla[\s\S]*galeon\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '6'
		},
		'79': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*\(KHTML, like Gecko\)$/i,
			browserId: '466'
		},
		'80': {
			regexp: /Openwave/i,
			browserId: '32'
		},
		'81': {
			regexp: /MSIE ([0-9a-z\+\-\.]+)[\s\S]*windows ce/i,
			browserId: '157'
		},
		'82': {
			regexp: /mozilla[\s\S]*\/[0-9\.]+[\s\S]*gecko[\s\S]*firefox[\s\S]*/i,
			browserId: '3'
		},
		'83': {
			regexp: /mozilla[\s\S]*(rv:[0-9\.]+)[\s\S]*/i,
			browserId: '54'
		},
		'86': {
			regexp: /webcopier[\s\S]*v([0-9a-z\.]+)/i,
			browserId: '71'
		},
		'89': {
			regexp: /MSIE[\s\S]*PhaseOut/i,
			browserId: '74'
		},
		'94': {
			regexp: /^Mozilla[\s\S]*Thunderbird\/([0-9a-zA-Z\.]+)/i,
			browserId: '79'
		},
		'95': {
			regexp: /^DoCoMo\//i,
			browserId: '33'
		},
		'97': {
			regexp: /doris\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '81'
		},
		'98': {
			regexp: /^Enigma browser$/i,
			browserId: '82'
		},
		'100': {
			regexp: /lwp\-request\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '51'
		},
		'102': {
			regexp: /Jakarta Commons-HttpClient\/([0-9a-zA-Z\.\-]+)/i,
			browserId: '85'
		},
		'103': {
			regexp: /IBrowse/i,
			browserId: '31'
		},
		'104': {
			regexp: /^curl ([0-9a-zA-Z\.\-]+)/i,
			browserId: '86'
		},
		'105': {
			regexp: /Aweb[\s\S]*Amiga/i,
			browserId: '29'
		},
		'106': {
			regexp: /amaya\/([0-9a-zA-Z\.\-+]+)/i,
			browserId: '87'
		},
		'107': {
			regexp: /GetRight\/([0-9a-zA-Z\.\-\+]+)/i,
			browserId: '88'
		},
		'108': {
			regexp: /^Mozilla[\s\S]*OmniWeb\/([1-9a-zA-z\.\-]+)/i,
			browserId: '18'
		},
		'109': {
			regexp: /Mozilla[\s\S]*OffByOne/i,
			browserId: '89'
		},
		'110': {
			regexp: /Python\-urllib\/([0-9a-zA-Z\.\-]+)/i,
			browserId: '90'
		},
		'111': {
			regexp: /w3m\/([0-9a-zA-z\-\+\.]+)/i,
			browserId: '91'
		},
		'113': {
			regexp: /^WebZIP\/([0-9a-zA-Z\.\-]+)/i,
			browserId: '93'
		},
		'114': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Shiira\/([0-9a-zA-z\.\-]+)/i,
			browserId: '21'
		},
		'115': {
			regexp: /ICEbrowser\/([0-9a-z_\.\-]+)/i,
			browserId: '94'
		},
		'117': {
			regexp: /Blazer ([0-9\.]+)/i,
			browserId: '43'
		},
		'118': {
			regexp: /Iceape\/([0-9a-zA-z\.\-]+)/i,
			browserId: '96'
		},
		'120': {
			regexp: /Jakarta Commons\-HttpClient/i,
			browserId: '85'
		},
		'122': {
			regexp: /HotJava\/([0-9a-zA-Z\.\- ]+)/i,
			browserId: '99'
		},
		'123': {
			regexp: /JoBo\/([0-9a-z\.\-]+)/i,
			browserId: '100'
		},
		'126': {
			regexp: /Sleipnir Version ([0-9a-z\.]+)/i,
			browserId: '59'
		},
		'130': {
			regexp: /poe-component-client-http\/([0-9a-z\.\-]+)/i,
			browserId: '105'
		},
		'137': {
			regexp: /snoopy v([1-9\.]+)/i,
			browserId: '111'
		},
		'138': {
			regexp: /Lynx/i,
			browserId: '25'
		},
		'139': {
			regexp: /libwww\-perl/i,
			browserId: '51'
		},
		'141': {
			regexp: /NetFront([0-9a-z\.]+)[\s\S]*/i,
			browserId: '33'
		},
		'143': {
			regexp: /^opera ([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '17'
		},
		'147': {
			regexp: /NCSA_Mosaic\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '117'
		},
		'149': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*kapiko\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '119'
		},
		'150': {
			regexp: /mozilla[\s\S]*chrome\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '120'
		},
		'151': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*AdobeAIR\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '121'
		},
		'152': {
			regexp: /^lwp-trivial\/([0-9.]+)$/i,
			browserId: '122'
		},
		'153': {
			regexp: /^WWW-Mechanize\/([0-9a-z\+\-\.]+)/i,
			browserId: '123'
		},
		'155': {
			regexp: /^Xenu Link Sleuth ([0-9a-z\+\-\.]+)$/i,
			browserId: '124'
		},
		'156': {
			regexp: /^SiteSucker\/([0-9a-z\.]+)/i,
			browserId: '125'
		},
		'157': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*arora\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '126'
		},
		'160': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*Shiretoko\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '128'
		},
		'161': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*Minefield\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '129'
		},
		'162': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*iron\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '130'
		},
		'163': {
			regexp: /mozilla[\s\S][\s\S]*lobo\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '131'
		},
		'164': {
			regexp: /^links \(([0-9a-z\.]+)[\s\S]*/i,
			browserId: '132'
		},
		'165': {
			regexp: /mozilla[\s\S]*PlayStation\ Portable[\s\S]*/i,
			browserId: '33'
		},
		'166': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*Maxthon/i,
			browserId: '53'
		},
		'167': {
			regexp: /Netbox\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '57'
		},
		'169': {
			regexp: /^Mozilla\/(3\.0)[\s\S]*Sun\)$/i,
			browserId: '99'
		},
		'170': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*fennec\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '133'
		},
		'171': {
			regexp: /mozilla[\s\S]*Lotus-Notes\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '134'
		},
		'172': {
			regexp: /^klondike\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '135'
		},
		'173': {
			regexp: /^WapTiger\/5[\s\S]0 \(http:\/\/www\.waptiger\.com\/[\s\S]*/i,
			browserId: '136'
		},
		'174': {
			regexp: /^W3C_Validator\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '137'
		},
		'175': {
			regexp: /^W3C-checklink\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '138'
		},
		'176': {
			regexp: /^HTMLParser\/([0-9a-z\.]+)$/i,
			browserId: '139'
		},
		'177': {
			regexp: /^LWP::Simple\/([0-9a-z\.]+)$/i,
			browserId: '122'
		},
		'178': {
			regexp: /^Java\/([0-9a-z\._]+)/i,
			browserId: '140'
		},
		'179': {
			regexp: /Bolt\/([0-9\.]+)/i,
			browserId: '141'
		},
		'180': {
			regexp: /Demeter\/([0-9\.]+)/i,
			browserId: '142'
		},
		'181': {
			regexp: /^UniversalFeedParser\/([0-9\.]+)/i,
			browserId: '143'
		},
		'182': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*shiira[\s\S]*safari/i,
			browserId: '21'
		},
		'183': {
			regexp: /mozilla[\s\S]*firefox[\s\S]*orca\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '144'
		},
		'184': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*fluid\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '145'
		},
		'185': {
			regexp: /Bookdog\/([0-9\.]+)/i,
			browserId: '146'
		},
		'186': {
			regexp: /http:\/\/Anonymouse[\s\S]org\/ \(Unix\)/i,
			browserId: '147'
		},
		'187': {
			regexp: /^Midori\/([0-9\.]+)/i,
			browserId: '148'
		},
		'188': {
			regexp: /boxee[\s\S]*\([\s\S]*\ ([0-9a-zA-Z\.]+)\)/i,
			browserId: '149'
		},
		'189': {
			regexp: /^gPodder\/([0-9\.]+)/i,
			browserId: '150'
		},
		'190': {
			regexp: /^Samsung-[a-zA-Z09]+[\s\S]*AU-MIC-[a-zA-Z0-9]+\/([0-9\.]+)/i,
			browserId: '151'
		},
		'191': {
			regexp: /^SonyEricsson[\s\S]*SEMC-Browser\/([0-9\.]+)/i,
			browserId: '152'
		},
		'192': {
			regexp: /NF-Browser\/([0-9\.]+)/i,
			browserId: '33'
		},
		'193': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*GranParadiso\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '153'
		},
		'194': {
			regexp: /^WDG_Validator\/([0-9\.]+)/i,
			browserId: '154'
		},
		'195': {
			regexp: /^CSSCheck\/([0-9\.]+)/i,
			browserId: '155'
		},
		'196': {
			regexp: /^Page Valet\/([0-9a-z\.]+)/i,
			browserId: '156'
		},
		'197': {
			regexp: /IEMobile ([0-9\.]+)/i,
			browserId: '157'
		},
		'198': {
			regexp: /mozilla[\s\S]*Lunascape ([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '52'
		},
		'199': {
			regexp: /BlackBerry/i,
			browserId: '158'
		},
		'200': {
			regexp: /Obigo[\s\S]*Profile\/MIDP/i,
			browserId: '151'
		},
		'201': {
			regexp: /Browser\/Teleca|Teleca\/[\s\S]*MIDP/i,
			browserId: '151'
		},
		'202': {
			regexp: /Polaris\/([0-9\.]+)/i,
			browserId: '159'
		},
		'203': {
			regexp: /Hv3\/([0-9a-z\.])/i,
			browserId: '160'
		},
		'204': {
			regexp: /^WinWAP\/([0-9\.]+)/i,
			browserId: '161'
		},
		'205': {
			regexp: /^XBMC\/([0-9a-z\.\-]+)/i,
			browserId: '162'
		},
		'206': {
			regexp: /^XML-RPC for PHP ([0-9a-z\.]+)$/i,
			browserId: '163'
		},
		'207': {
			regexp: /^OmniWeb\/([0-9a-z\.\-]+)/i,
			browserId: '18'
		},
		'208': {
			regexp: /^FlyCast\/([0-9\.]+)/i,
			browserId: '165'
		},
		'209': {
			regexp: /^Bloglines\/([0-9\.]+)/i,
			browserId: '166'
		},
		'210': {
			regexp: /^Gregarius\/([0-9\.]+)/i,
			browserId: '167'
		},
		'211': {
			regexp: /^SimplePie\/([0-9a-z\. ]+)/i,
			browserId: '168'
		},
		'212': {
			regexp: /^PycURL\/([0-9\.]+)$/i,
			browserId: '169'
		},
		'213': {
			regexp: /^Apple-PubSub\/([0-9\.]+)$/i,
			browserId: '170'
		},
		'214': {
			regexp: /^Feedfetcher-Google[\s\S]*http:\/\/www\.google\.com\/feedfetcher\.html/i,
			browserId: '171'
		},
		'215': {
			regexp: /^FeedValidator\/([0-9\.]+)$/i,
			browserId: '172'
		},
		'216': {
			regexp: /^MagpieRSS\/([0-9\.]+)/i,
			browserId: '173'
		},
		'217': {
			regexp: /^BlogBridge ([0-9\.]+)/i,
			browserId: '174'
		},
		'218': {
			regexp: /Miro\/([0-9a-z\-\.]+)[\s\S]*http:\/\/www\.getmiro\.com\//i,
			browserId: '175'
		},
		'219': {
			regexp: /^Liferea\/([0-9\.]+)[\s\S]*http:\/\/liferea\.sf\.net\//i,
			browserId: '176'
		},
		'220': {
			regexp: /^HomePage Rss Reader ([0-9\.]+)/i,
			browserId: '177'
		},
		'221': {
			regexp: /^PHP\/([0-9a-z\.\-]+)$/i,
			browserId: '178'
		},
		'222': {
			regexp: /^REL Link Checker Lite ([0-9\.]+)$/i,
			browserId: '179'
		},
		'223': {
			regexp: /^CPG RSS Module File Reader/i,
			browserId: '180'
		},
		'224': {
			regexp: /^Dragonfly File Reader/i,
			browserId: '180'
		},
		'225': {
			regexp: /^CPG Dragonfly RSS Module Feed Viewer/i,
			browserId: '180'
		},
		'226': {
			regexp: /^newsbeuter\/([0-9\.]+)/i,
			browserId: '181'
		},
		'227': {
			regexp: /^Jigsaw\/[0-9\.]+ W3C_CSS_Validator_JFouffa\/([0-9\.]+)$/i,
			browserId: '182'
		},
		'228': {
			regexp: /^FPLinkChecker\/([0-9\.]+)$/i,
			browserId: '183'
		},
		'229': {
			regexp: /^GoldenPod ([0-9\.]+)/i,
			browserId: '184'
		},
		'230': {
			regexp: /Cheshire\/([0-9a-z\.]+)/i,
			browserId: '185'
		},
		'231': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*chimera\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '1'
		},
		'232': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*CometBird\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '187'
		},
		'233': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*IceCat\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '188'
		},
		'234': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*Stainless\/([0-9a-z\+\-\.]+)[\s\S]*safari/i,
			browserId: '189'
		},
		'235': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*Prism\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '190'
		},
		'236': {
			regexp: /^curl\/([0-9a-zA-Z\.\-]+)/i,
			browserId: '86'
		},
		'237': {
			regexp: /^MPlayer\//i,
			browserId: '191'
		},
		'238': {
			regexp: /^Mozilla\/4\.0[\s\S]*Win32[\s\S]*ActiveXperts\.Http\.([0-9\.]+)/i,
			browserId: '192'
		},
		'239': {
			regexp: /^MOT[\s\S]*MIB\/([0-9\.]+)/i,
			browserId: '193'
		},
		'240': {
			regexp: /^Abilon$/i,
			browserId: '194'
		},
		'241': {
			regexp: /^check_http\/([0-9a-z\.]+) \(nagios\-plugins/i,
			browserId: '195'
		},
		'242': {
			regexp: /^Windows\-Media\-Player\/([0-9\.]+)$/i,
			browserId: '196'
		},
		'243': {
			regexp: /^VLC media player \- version ([0-9a-z\-\.]+) [\s\S]* VideoLAN team$/i,
			browserId: '197'
		},
		'244': {
			regexp: /^P3P Validator$/i,
			browserId: '198'
		},
		'245': {
			regexp: /^CSE HTML Validator Lite Online/i,
			browserId: '199'
		},
		'246': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*Navigator\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '4'
		},
		'247': {
			regexp: /^JetBrains Omea Reader ([0-9\.]+)/i,
			browserId: '200'
		},
		'248': {
			regexp: /^GSiteCrawler\/([0-9a-z\.]+)/i,
			browserId: '201'
		},
		'249': {
			regexp: /^YahooFeedSeeker\/([0-9\.]+)/i,
			browserId: '202'
		},
		'250': {
			regexp: /^Democracy\/([0-9\.]+)/i,
			browserId: '175'
		},
		'251': {
			regexp: /^Java([0-9\._]+)$/i,
			browserId: '140'
		},
		'253': {
			regexp: /^mozilla\/[\s\S]*MSIE [0-9\.]+[\s\S]*TheWorld/i,
			browserId: '204'
		},
		'254': {
			regexp: /^webcollage\/([0-9\.]+)$/i,
			browserId: '205'
		},
		'255': {
			regexp: /^webcollage\-noporn\/([0-9\.]+)$/i,
			browserId: '205'
		},
		'256': {
			regexp: /^webcollage\.[a-z]+\/([0-9\.]+)$/i,
			browserId: '205'
		},
		'257': {
			regexp: /^webcollage1\/([0-9\.]+)$/i,
			browserId: '205'
		},
		'258': {
			regexp: /^NewsGatorOnline\/([0-9\.]+) \(http:\/\/www\.newsgator\.com/i,
			browserId: '206'
		},
		'259': {
			regexp: /^Mozilla[\s\S]*PRTG Network Monitor/i,
			browserId: '207'
		},
		'260': {
			regexp: /^Web Downloader\/([0-9\.]+)$/i,
			browserId: '39'
		},
		'261': {
			regexp: /^Opera\/[0-9\.]+[\s\S]*Presto\/[0-9\.]+ Version\/([0-9\.]+)$/i,
			browserId: '17'
		},
		'262': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*Songbird\/([0-9\.]+)/i,
			browserId: '208'
		},
		'263': {
			regexp: /^Avant Browser/i,
			browserId: '41'
		},
		'264': {
			regexp: /^RSS_Radio ([0-9\.]+)$/i,
			browserId: '209'
		},
		'265': {
			regexp: /^Feed::Find\/([0-9\.]+)$/i,
			browserId: '210'
		},
		'266': {
			regexp: /^Mozilla\/[\s\S]*webOS\/[0-9\.]+[\s\S]*AppleWebKit[\s\S]*Pre\/([0-9\.]+)$/i,
			browserId: '211'
		},
		'267': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*BonEcho\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '212'
		},
		'268': {
			regexp: /^QuickTime\/([0-9\.]+)/,
			browserId: '213'
		},
		'269': {
			regexp: /^QuickTime[\s\S]*qtver=([0-9\.a-z]+)/i,
			browserId: '213'
		},
		'270': {
			regexp: /^PHPCrawl$/i,
			browserId: '214'
		},
		'271': {
			regexp: /mozilla[\s\S]*Linux armv7l[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*Tablet browser ([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '260'
		},
		'272': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*GreenBrowser/i,
			browserId: '216'
		},
		'273': {
			regexp: /^Awasu\/([0-9a-z\.]+)$/i,
			browserId: '217'
		},
		'274': {
			regexp: /^CorePlayer[\s\S]*CorePlayer\/([0-9\._]+)$/i,
			browserId: '218'
		},
		'275': {
			regexp: /^Mozilla\/[\s\S]*AppleWebKit[\s\S]*QtWeb Internet Browser\/([0-9\.]+)/i,
			browserId: '219'
		},
		'276': {
			regexp: /^Mozilla\/[\s\S]*AppleWebKit[\s\S]*TeaShark\/([0-9\.]+)$/i,
			browserId: '220'
		},
		'277': {
			regexp: /^libsoup\/([0-9a-z\.]+)$/i,
			browserId: '221'
		},
		'278': {
			regexp: /^Mozilla\/[\s\S]*AppleWebKit[\s\S]*NetNewsWire\/([0-9a-z\.]+)$/i,
			browserId: '222'
		},
		'279': {
			regexp: /^NetNewsWire\/([0-9a-z\.]+)[\s\S]*http:\/\/www\.newsgator\.com\/Individuals\/NetNews/i,
			browserId: '222'
		},
		'280': {
			regexp: /http:\/\/code\.google\.com\/appengine/i,
			browserId: '223'
		},
		'281': {
			regexp: /UCWEB/i,
			browserId: '225'
		},
		'287': {
			regexp: /NokiaN93/i,
			browserId: '226'
		},
		'289': {
			regexp: /Nokia[\s\S]*SymbianOS[\s\S]*Series60/i,
			browserId: '226'
		},
		'292': {
			regexp: /SymbianOS[\s\S]*Series60[\s\S]*Nokia[\s\S]*AppleWebKit/i,
			browserId: '226'
		},
		'293': {
			regexp: /^lftp\/([0-9a-z\.]+)$/,
			browserId: '227'
		},
		'294': {
			regexp: /^WinWAP-SPBE\/([0-9\.]+)/i,
			browserId: '161'
		},
		'295': {
			regexp: /^Mozilla[\s\S]*RISC[\s\S]*Oregano ([0-9\.]+)/i,
			browserId: '228'
		},
		'296': {
			regexp: /^libsummer\/([0-9\.]+)/i,
			browserId: '229'
		},
		'297': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*Acoo Browser/i,
			browserId: '230'
		},
		'298': {
			regexp: /^Mozilla[\s\S]*NewsFox\/([0-9\.]+)/i,
			browserId: '231'
		},
		'299': {
			regexp: /^Mozilla[\s\S]*Danger hiptop/i,
			browserId: '33'
		},
		'300': {
			regexp: /Mozilla[\s\S]*MSIE[\s\S]*Hydra Browser/i,
			browserId: '232'
		},
		'301': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*wKiosk/i,
			browserId: '233'
		},
		'302': {
			regexp: /Mozilla\/[\s\S]*AppleWebKit[\s\S]*Paparazzi!\/([0-9a-z\.]+)/i,
			browserId: '234'
		},
		'303': {
			regexp: /^xine\/([0-9a-z\.]+)/i,
			browserId: '235'
		},
		'304': {
			regexp: /^webfs\/([0-9\.]+) \(plan 9\)$/i,
			browserId: '236'
		},
		'305': {
			regexp: /^Ilium Software NewsBreak/i,
			browserId: '237'
		},
		'306': {
			regexp: /^LinkbackPlugin\/([0-9a-z\.]+) Laconica\//i,
			browserId: '238'
		},
		'307': {
			regexp: /^Microsoft Data Access Internet Publishing Provider DAV/i,
			browserId: '239'
		},
		'308': {
			regexp: /^gvfs\/([0-9a-z\.]+)/i,
			browserId: '240'
		},
		'309': {
			regexp: /^Webkit\/[\s\S]*Uzbl/i,
			browserId: '241'
		},
		'310': {
			regexp: /^Uzbl[\s\S]*Webkit/i,
			browserId: '241'
		},
		'311': {
			regexp: /^Cynthia ([0-9\.]+)$/i,
			browserId: '242'
		},
		'312': {
			regexp: /^Mozilla\/5\.0 \(Sage\)$/i,
			browserId: '243'
		},
		'313': {
			regexp: /^Banshee ([0-9a-z\.]+)[\s\S]*http:\/\/banshee-project\.org/i,
			browserId: '244'
		},
		'314': {
			regexp: /^Mozilla\/[\s\S]*Gecko[\s\S]* Firefox[\s\S]*Wyzo\/([0-9a-z\.]+)/i,
			browserId: '245'
		},
		'315': {
			regexp: /^RSSOwl\/([0-9]\.[0-9]\.[0-9])/i,
			browserId: '246'
		},
		'316': {
			regexp: /^Mozilla\/[\s\S]*ABrowse ([0-9\.]+)[\s\S]*Syllable/i,
			browserId: '247'
		},
		'317': {
			regexp: /^Funambol Outlook Plug-in[\s\S]*([0-9\.]+)$/i,
			browserId: '248'
		},
		'318': {
			regexp: /^Funambol Mozilla Sync Client v([0-9\.]+)$/i,
			browserId: '249'
		},
		'319': {
			regexp: /^RSS Menu\/([0-9\.]+)/i,
			browserId: '250'
		},
		'320': {
			regexp: /^foobar2000\/([0-9a-z\._]+$)/i,
			browserId: '251'
		},
		'321': {
			regexp: /^GStreamer souphttpsrc libsoup\/[0-9\.]+$/i,
			browserId: '252'
		},
		'322': {
			regexp: /^Mozilla\/[\s\S]*Mobile Content Viewer\/([0-9\.]+)[\s\S]*NetFront/i,
			browserId: '253'
		},
		'323': {
			regexp: /^php-openid\/([0-9\.]+)/i,
			browserId: '254'
		},
		'324': {
			regexp: /NCSA Mosaic\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '117'
		},
		'325': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*Blackbird\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '255'
		},
		'326': {
			regexp: /^Mozilla\/4[\s\S]0 \(compatible; MSIE ([0-9\.]+); Windows/i,
			browserId: '35'
		},
		'327': {
			regexp: /ICE browser\/([0-9a-z_\.\-]+)/i,
			browserId: '94'
		},
		'328': {
			regexp: /^GreatNews\/([0-9\.]+)$/i,
			browserId: '256'
		},
		'329': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*DeskBrowse\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '257'
		},
		'330': {
			regexp: /^TulipChain\/([0-9\.]+)[\s\S]*ostermiller[\s\S]org\/tulipchain[\s\S]*Java/i,
			browserId: '258'
		},
		'331': {
			regexp: /^Mozilla\/[\s\S]*AppleWebKit\/[\s\S]*Maxthon\/([0-9\.]+)/i,
			browserId: '53'
		},
		'332': {
			regexp: /^Axel ([0-9\.]+)/i,
			browserId: '259'
		},
		'333': {
			regexp: /^Mozilla\/[\s\S]*Linux[\s\S]*AppleWebKit[\s\S]*tear/i,
			browserId: '261'
		},
		'334': {
			regexp: /^LinkExaminer\/([0-9\.]+) \(Windows\)$/i,
			browserId: '262'
		},
		'335': {
			regexp: /^Mozilla\/[\s\S]*MSIE[\s\S]*http:\/\/www\.Abolimba\.de/i,
			browserId: '263'
		},
		'336': {
			regexp: /^Mozilla\/[\s\S]*Gecko\/[\s\S]*Beonex\/([0-9a-z\.\-]+)/i,
			browserId: '264'
		},
		'337': {
			regexp: /^DocZilla\/([0-9\.]+)[\s\S]*Gecko\//i,
			browserId: '265'
		},
		'338': {
			regexp: /^retawq\/([0-9a-z\.]+)[\s\S]*\(text\)$/i,
			browserId: '266'
		},
		'339': {
			regexp: /^SAMSUNG[\s\S]*Jasmine\/([0-9\.]+)/i,
			browserId: '267'
		},
		'340': {
			regexp: /Opera\/[\s\S]*Opera Mini\/([0-9\.]+)/i,
			browserId: '268'
		},
		'341': {
			regexp: /Mozilla\/[\s\S]*AppleWebKit[\s\S]*Dooble/i,
			browserId: '269'
		},
		'342': {
			regexp: /Mozilla\/[\s\S]*Gecko[\s\S]*Firefox[\s\S]*Madfox\/([0-9a-z\.]+)/i,
			browserId: '270'
		},
		'343': {
			regexp: /^DownloadStudio\/([0-9\.]+)$/i,
			browserId: '271'
		},
		'344': {
			regexp: /^WinPodder[\s\S]*http:\/\/winpodder\.com/i,
			browserId: '272'
		},
		'345': {
			regexp: /^Bunjalloo\/([0-9\.]+)[\s\S]*Nintendo/i,
			browserId: '273'
		},
		'346': {
			regexp: /^LinkChecker\/([0-9\.]+)[\s\S]*linkchecker\.sourceforge\.net/i,
			browserId: '274'
		},
		'348': {
			regexp: /urlgrabber\/([0-9\.]+)/i,
			browserId: '276'
		},
		'349': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*Spicebird\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '277'
		},
		'350': {
			regexp: /[\s\S]*Obigo Browser ([0-9\.]+)/i,
			browserId: '151'
		},
		'351': {
			regexp: /ObigoInternetBrowser/i,
			browserId: '151'
		},
		'352': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*Namoroka\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '278'
		},
		'353': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*rekonq[\/]{0,1}([0-9a-z\.]+){0,1}[\s\S]*/i,
			browserId: '279'
		},
		'354': {
			regexp: /^W3C_Multipage_Validator\/([0-9a-z\.]+)[\s\S]*http:\/\/www\.validator\.ca\//i,
			browserId: '280'
		},
		'355': {
			regexp: /^X\-Smiles\/([0-9a-z\.]+)/i,
			browserId: '281'
		},
		'356': {
			regexp: /WinHttp/i,
			browserId: '282'
		},
		'357': {
			regexp: /^Xaldon_WebSpider\/([0-9a-z\.]+)/i,
			browserId: '283'
		},
		'358': {
			regexp: /^Xaldon WebSpider ([0-9a-z\.]+)/i,
			browserId: '283'
		},
		'359': {
			regexp: /\/szn-mobile-transcoder/i,
			browserId: '284'
		},
		'360': {
			regexp: /^SZN-Image-Resizer$/i,
			browserId: '284'
		},
		'361': {
			regexp: /Google Wireless Transcoder/i,
			browserId: '285'
		},
		'362': {
			regexp: /^Google-Listen\/([0-9a-z\.]+)/i,
			browserId: '286'
		},
		'363': {
			regexp: /^Typhoeus[\s\S]*http:\/\/github[\s\S]com\/pauldix\/typhoeus/i,
			browserId: '287'
		},
		'364': {
			regexp: /^Mozilla\/[\s\S]*Origyn Web Browser/i,
			browserId: '288'
		},
		'365': {
			regexp: /mozilla[\s\S]*MSIE [0-9a-z\+\-\.]+[\s\S]*Browzar/i,
			browserId: '289'
		},
		'366': {
			regexp: /^Claws Mail GtkHtml2 plugin ([0-9a-z\.]+)[\s\S]*http:\/\/www[\s\S]claws-mail[\s\S]org\/plugins[\s\S]php/i,
			browserId: '290'
		},
		'367': {
			regexp: /Python\-urllib$/i,
			browserId: '90'
		},
		'368': {
			regexp: /^Azureus ([0-9a-z\.]+)/i,
			browserId: '291'
		},
		'369': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*GlobalMojo\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '292'
		},
		'370': {
			regexp: /^GomPlayer ([0-9, ]+)/i,
			browserId: '293'
		},
		'371': {
			regexp: /^Python-webchecker\/([0-9]+)$/i,
			browserId: '294'
		},
		'372': {
			regexp: /^W3C-mobileOK\/DDC-([0-9\.]+)[\s\S]* http:\/\/www[\s\S]w3[\s\S]org\/2006\/07\/mobileok-ddc/i,
			browserId: '296'
		},
		'373': {
			regexp: /^JoeDog\/[\s\S]*Siege ([0-9\.]+)/i,
			browserId: '297'
		},
		'374': {
			regexp: /^iSiloXC\/([0-9\.]+)/i,
			browserId: '298'
		},
		'375': {
			regexp: /^ApacheBench\/([0-9a-z\-\.]+)$/i,
			browserId: '299'
		},
		'376': {
			regexp: /^anw webtool LoadControl\/([0-9\.]+)$/i,
			browserId: '300'
		},
		'377': {
			regexp: /^topSUBMIT[\s\S]de HTMLChecker\/([0-9\.]+)$/i,
			browserId: '301'
		},
		'378': {
			regexp: /^edbrowse\/([0-9\.\-]+)/i,
			browserId: '302'
		},
		'379': {
			regexp: /^muCommander v([0-9\.]+)/i,
			browserId: '303'
		},
		'380': {
			regexp: /^muCommander-file-API/i,
			browserId: '303'
		},
		'381': {
			regexp: /^XMPlay\/([0-9\.]+)$/i,
			browserId: '304'
		},
		'382': {
			regexp: /^NFReader\/([0-9\.]+)/i,
			browserId: '305'
		},
		'383': {
			regexp: /^Mozilla\/[\s\S]*uZardWeb\/([0-9\.]+)/i,
			browserId: '306'
		},
		'384': {
			regexp: /^Mozilla\/3[\s\S]0 \(compatible; Indy Library\)$/i,
			browserId: '307'
		},
		'385': {
			regexp: /^Mozilla\/[\s\S]*MSIE[\s\S]*Multi\-Browser ([0-9\.]+)[\s\S]*www\.multibrowser\.de/i,
			browserId: '308'
		},
		'386': {
			regexp: /^LinkWalker\/([0-9\.]+)[\s\S]*www\.seventwentyfour\.com/i,
			browserId: '309'
		},
		'387': {
			regexp: /^Mozilla[\s\S]*compatible[\s\S]*NetPositive\/([0-9\.]+)/i,
			browserId: '310'
		},
		'388': {
			regexp: /^Radio Downloader ([0-9\.]+)$/i,
			browserId: '311'
		},
		'389': {
			regexp: /^WebStripper\/([0-9\.]+)/i,
			browserId: '312'
		},
		'390': {
			regexp: /^Cyberduck\/([0-9\.]+)/i,
			browserId: '313'
		},
		'391': {
			regexp: /^WorldWideweb \(NEXT\)$/i,
			browserId: '314'
		},
		'392': {
			regexp: /^iVideo ([a-z0-9\.\ ]+)[\s\S]*iPhone OS/i,
			browserId: '315'
		},
		'393': {
			regexp: /^Mozilla\/4[\s\S]0 \(compatible; RSS Popper\)$/i,
			browserId: '316'
		},
		'394': {
			regexp: /^Win[\s\S]*Jamcast\/([0-9\.]+)/i,
			browserId: '317'
		},
		'395': {
			regexp: /^Jamcast ([0-9\.]+)$/i,
			browserId: '317'
		},
		'396': {
			regexp: /mozilla[\s\S]*Comodo_Dragon\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '318'
		},
		'397': {
			regexp: /Mozilla\/4[\s\S]*OS\/2/i,
			browserId: '4'
		},
		'398': {
			regexp: /^SuperBot\/([0-9\.]+)/i,
			browserId: '319'
		},
		'399': {
			regexp: /^MyIBrow\/([0-9\.]+)[\s\S]*Windows/i,
			browserId: '320'
		},
		'400': {
			regexp: /Opera mobi[\s\S]*Version\/([0-9\.]+)/i,
			browserId: '321'
		},
		'401': {
			regexp: /Opera Mobi[\s\S]*Opera ([0-9\.]+)/i,
			browserId: '321'
		},
		'402': {
			regexp: /Opera ([0-9\.]+)[\s\S]*Opera Mobi/i,
			browserId: '321'
		},
		'403': {
			regexp: /^Mozilla[\s\S]*Gecko[\s\S]*Strata\/([0-9\.]+)/i,
			browserId: '322'
		},
		'404': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*TencentTraveler/i,
			browserId: '323'
		},
		'405': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*TencentTraveler ([0-9\.]+)/i,
			browserId: '323'
		},
		'406': {
			regexp: /^Mozilla[\s\S]*rv:[0-9\.]+[\s\S]*Gecko[\s\S]*Firefox[\s\S]*LBrowser\/([0-9a-z\-\.]+)/i,
			browserId: '324'
		},
		'407': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*MSOffice 12/i,
			browserId: '325'
		},
		'408': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*MSOffice 14/i,
			browserId: '326'
		},
		'409': {
			regexp: /^Outlook-Express\/7\.0 \(MSIE 7\.0[\s\S]*Windows/i,
			browserId: '327'
		},
		'410': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*Windows[\s\S]*Tjusig ([0-9\.]+)/i,
			browserId: '328'
		},
		'411': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*Windows[\s\S]*SiteKiosk ([0-9\.]+)/,
			browserId: '329'
		},
		'412': {
			regexp: /^The Bat! ([0-9\.]+)$/i,
			browserId: '330'
		},
		'413': {
			regexp: /^Mozilla[\s\S]*compatible[\s\S]*BorderManager ([0-9\.]+)/i,
			browserId: '331'
		},
		'414': {
			regexp: /^Mozilla[\s\S]*Shredder\/([0-9a-zA-Z\.]+)/i,
			browserId: '332'
		},
		'415': {
			regexp: /^PublicRadioPlayer\/([0-9\.]+)/i,
			browserId: '333'
		},
		'416': {
			regexp: /^PublicRadioApp\/([0-9\.]+)/i,
			browserId: '333'
		},
		'417': {
			regexp: /PLAYSTATION 3/i,
			browserId: '33'
		},
		'418': {
			regexp: /^RssBandit\/([0-9\.]+)/i,
			browserId: '334'
		},
		'419': {
			regexp: /^Microsoft Office\/14[\s\S]*MSOffice 14/i,
			browserId: '326'
		},
		'420': {
			regexp: /^Mozilla[\s\S]*Postbox\/([0-9a-zA-Z\.]+)/i,
			browserId: '335'
		},
		'421': {
			regexp: /^Postbox ([0-9a-z\.]+)/i,
			browserId: '335'
		},
		'422': {
			regexp: /^2Bone_LinkChecker\/([0-9\.]+)/i,
			browserId: '336'
		},
		'423': {
			regexp: /^Checkbot\/([0-9\.]+)/i,
			browserId: '337'
		},
		'424': {
			regexp: /^GcMail Browser\/([0-9\.]+)/i,
			browserId: '338'
		},
		'425': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*Swiftweasel\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '339'
		},
		'426': {
			regexp: /^Fastladder FeedFetcher\/([0-9\.]+)[\s\S]*fastladder[\s\S]com/i,
			browserId: '340'
		},
		'427': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*Lorentz\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '341'
		},
		'428': {
			regexp: /^PocketTunes\/([0-9a-z\.]+)$/i,
			browserId: '342'
		},
		'429': {
			regexp: /^SharpReader\/([0-9\.]+)/i,
			browserId: '343'
		},
		'430': {
			regexp: /^YeahReader/i,
			browserId: '344'
		},
		'431': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*Palemoon\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '345'
		},
		'432': {
			regexp: /^holmes\/([0-9\.]+)/i,
			browserId: '346'
		},
		'433': {
			regexp: /^mozilla[\s\S]*AppleWebKit[\s\S]*Google Earth\/([0-9\.]+)/i,
			browserId: '347'
		},
		'434': {
			regexp: /mozilla[\s\S]*flock\/([0-9\.]+)[\s\S]*chrome/i,
			browserId: '7'
		},
		'435': {
			regexp: /^Rome Client \(http:\/\/tinyurl\.com\/64t5n\) Ver: ([0-9\.]+)/i,
			browserId: '348'
		},
		'436': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko[\s\S]*myibrow\/([0-9a-z\.]+)/i,
			browserId: '320'
		},
		'437': {
			regexp: /^Akregator\/([0-9\.]+)[\s\S]*librss\/remnants/i,
			browserId: '349'
		},
		'438': {
			regexp: /HTC[\s\S]*Opera\/([0-9\.]+)[\s\S]*Windows/i,
			browserId: '321'
		},
		'439': {
			regexp: /^Mozilla[\s\S]*Windows[\s\S]*AppleWebKit[\s\S]*MiniBrowser\/([0-9\.]+)/i,
			browserId: '350'
		},
		'440': {
			regexp: /^Mozilla[\s\S]*Escape ([0-9\.]+)/i,
			browserId: '351'
		},
		'441': {
			regexp: /^Mozilla[\s\S]*Windows[\s\S]*UltraBrowser ([0-9\.]+)/i,
			browserId: '352'
		},
		'442': {
			regexp: /^Mozilla[\s\S]*BrowseX \(([0-9\.]+)/i,
			browserId: '353'
		},
		'443': {
			regexp: /Mozilla[\s\S]*Linux[\s\S]*Android[\s\S]*AppleWebKit[\s\S]*Version\/([0-9\.]+)/i,
			browserId: '354'
		},
		'444': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*WeltweitimnetzBrowser\/([0-9\.]+)/i,
			browserId: '355'
		},
		'445': {
			regexp: /^Pocomail\/([0-9\.]+)/i,
			browserId: '356'
		},
		'446': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Element Browser ([0-9\.]+)/i,
			browserId: '357'
		},
		'447': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*SlimBrowser/i,
			browserId: '358'
		},
		'448': {
			regexp: /^LeechCraft/i,
			browserId: '359'
		},
		'449': {
			regexp: /^LeechCraft[\s\S]*LeechCraft\/Poshuku ([0-9a-z\-\.]+)/i,
			browserId: '359'
		},
		'450': {
			regexp: /^HTTP_Request2\/([0-9\.]+)/i,
			browserId: '360'
		},
		'451': {
			regexp: /^Mozilla[\s\S]*Gecko[\s\S]*Conkeror\/([0-9\.]+)/i,
			browserId: '361'
		},
		'452': {
			regexp: /^Mozilla[\s\S]*Dolfin\/([0-9\.]+)/i,
			browserId: '362'
		},
		'453': {
			regexp: /^SAMSUNG[\s\S]*Dolfin\/([0-9\.]+)/i,
			browserId: '362'
		},
		'455': {
			regexp: /^Netvibes[\s\S]*http:\/\/www\.netvibes\.com/i,
			browserId: '363'
		},
		'456': {
			regexp: /^Chilkat\/([0-9\.]+) \(\+http:\/\/www\.chilkatsoft\.com\/ChilkatHttpUA\.asp\)/i,
			browserId: '364'
		},
		'457': {
			regexp: /^The Incutio XML-RPC PHP Library/i,
			browserId: '365'
		},
		'458': {
			regexp: /^Web-sniffer\/([0-9\.]+)[\s\S]*web-sniffer\.net\/\)$/i,
			browserId: '366'
		},
		'459': {
			regexp: /^Atomic_Email_Hunter\/([0-9\.]+)$/i,
			browserId: '367'
		},
		'460': {
			regexp: /^iGetter\/([0-9a-z\.]+)[\s\S]*/i,
			browserId: '368'
		},
		'461': {
			regexp: /^webfetch\/([0-9\.]+)/i,
			browserId: '369'
		},
		'462': {
			regexp: /^Mozilla\/4\.0 \(compatible; Synapse\)$/i,
			browserId: '370'
		},
		'463': {
			regexp: /^Mozilla\/[\s\S]*Gecko[\s\S]*lolifox\/([0-9\.]+)/i,
			browserId: '371'
		},
		'464': {
			regexp: /^Mozilla[\s\S]*SkipStone ([0-9\.]+)/i,
			browserId: '372'
		},
		'465': {
			regexp: /^Mozilla\/[\s\S]*compatible[\s\S]*Powermarks\/([0-9\.]+)/i,
			browserId: '373'
		},
		'466': {
			regexp: /^AppleSyndication\/([0-9\.]+)$/i,
			browserId: '374'
		},
		'467': {
			regexp: /^GoogleFriendConnect\/([0-9\.]+)$/i,
			browserId: '375'
		},
		'468': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*RockMelt\/([0-9a-z\.]+)/i,
			browserId: '377'
		},
		'469': {
			regexp: /^Mozilla[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*Epic\/([0-9\.]+)/i,
			browserId: '378'
		},
		'470': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*InternetSurfboard\/([0-9\.a-z]+)/i,
			browserId: '379'
		},
		'471': {
			regexp: /^Mozilla[\s\S]*Gecko[\s\S]*Vonkeror\/([0-9\.]+)/i,
			browserId: '380'
		},
		'472': {
			regexp: /^Windows-RSS-Platform\/([0-9\.]+)[\s\S]*MSIE[\s\S]* Windows/i,
			browserId: '381'
		},
		'473': {
			regexp: /^Trileet NewsRoom[\s\S]*feedmonger\.blogspot\.com/i,
			browserId: '382'
		},
		'474': {
			regexp: /^Validator[\s\S]nu\/([0-9\.]+)$/i,
			browserId: '383'
		},
		'475': {
			regexp: /^Zend_Http_Client$/i,
			browserId: '384'
		},
		'476': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Skyfire\/([0-9\.]+)/i,
			browserId: '385'
		},
		'477': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*GoBrowser\/([0-9\.]+)/i,
			browserId: '386'
		},
		'478': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*GoBrowser/i,
			browserId: '386'
		},
		'479': {
			regexp: /\/GoBrowser\/([0-9\.]+)/i,
			browserId: '386'
		},
		'480': {
			regexp: /^Surf\/([0-9\.]+)[\s\S]*AppleWebKit/i,
			browserId: '387'
		},
		'481': {
			regexp: /^iGooMap\/([0-9a-z\.]+)[\s\S]*pointworks/i,
			browserId: '388'
		},
		'482': {
			regexp: /^Xenu Link Sleuth\/([0-9a-z\+\-\.]+)$/i,
			browserId: '124'
		},
		'483': {
			regexp: /^iTunes\/([0-9\.]+)/i,
			browserId: '389'
		},
		'484': {
			regexp: /^Mozilla[\s\S]*WebKi[\s\S]*BlackHawk\/([0-9\.]+)[\s\S]*Chrome/i,
			browserId: '390'
		},
		'485': {
			regexp: /^Typhoeus[\s\S]*http:\/\/github[\s\S]com\/dbalatero\/typhoeus/i,
			browserId: '287'
		},
		'486': {
			regexp: /^Mozilla[\s\S]*Linux[\s\S]*Kindle\/([0-9\.]+)/i,
			browserId: '392'
		},
		'487': {
			regexp: /^Microsoft Office Existence Discovery/i,
			browserId: '393'
		},
		'488': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*version\/([0-9a-z\+\-\.]+)[\s\S]*mobile[\s\S]*safari\/[0-9a-z\+\-\.]+[\s\S]*/i,
			browserId: '394'
		},
		'489': {
			regexp: /^Outlook-Express\/7\.0 \(MSIE 6\.0[\s\S]*Windows/i,
			browserId: '327'
		},
		'490': {
			regexp: /^BrownReclusePro v([0-9\.]+)[\s\S]*SoftByteLabs[\s\S]com/i,
			browserId: '395'
		},
		'491': {
			regexp: /^ColdFusion \(BookmarkTracker\.com\)$/i,
			browserId: '396'
		},
		'492': {
			regexp: /^BinGet\/([0-9a-zA-Z\.]+)/i,
			browserId: '397'
		},
		'493': {
			regexp: /^Mozilla[\s\S]*Gecko\/[0-9]+[\s\S]*WebianShell\/([0-9a-z\.]+)/i,
			browserId: '399'
		},
		'494': {
			regexp: /^Mozilla\/[\s\S]*Gecko\/[\s\S]*Firefox\/[\s\S]*Kylo\/([0-9\.]+)$/i,
			browserId: '400'
		},
		'495': {
			regexp: /^Outlook-Express\/7\.0 \(MSIE 8[\s\S]*Windows/i,
			browserId: '327'
		},
		'496': {
			regexp: /^Mozilla\/[\s\S]*Treco[\s\S]*Fireweb Navigator\/([0-9a-z\.]+)/i,
			browserId: '401'
		},
		'497': {
			regexp: /^CamelHttpStream\/([0-9\.]+)/i,
			browserId: '402'
		},
		'498': {
			regexp: /mozilla[\s\S]*AppleWebKit\/[\s\S]*epiphany\/([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '5'
		},
		'499': {
			regexp: /mozilla[\s\S]*rv:[0-9\.]+[\s\S]*Whistler[\s\S]*myibrow\/([0-9a-z\.]+)/i,
			browserId: '320'
		},
		'500': {
			regexp: /^Feed Viewer ([0-9\.]+)$/i,
			browserId: '376'
		},
		'501': {
			regexp: /^Mozilla[\s\S]*MSIE ([0-9\.]+)[\s\S]*XBLWP7/i,
			browserId: '157'
		},
		'502': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*Windows Phone[\s\S]*IEMobile\/([0-9\.]+)/i,
			browserId: '157'
		},
		'503': {
			regexp: /^EventMachine HttpClient/i,
			browserId: '403'
		},
		'504': {
			regexp: /Mozilla[\s\S]*Windows[\s\S]* Sundance\/([0-9a-z\.]+)/i,
			browserId: '404'
		},
		'505': {
			regexp: /Sundance[\s\S]*Windows[\s\S]*Version\/([0-9a-z\.]+)/i,
			browserId: '404'
		},
		'506': {
			regexp: /^Mozilla[\s\S]*Chromium\/([0-9a-z\+\-\.]+)[\s\S]*chrome[\s\S]*/i,
			browserId: '405'
		},
		'507': {
			regexp: /^Mozilla[\s\S]* AppleWebKit[\s\S]*Mobile/i,
			browserId: '394'
		},
		'508': {
			regexp: /Mozilla\/[\s\S]*AppleWebKit[\s\S]*Columbus\/([0-9\.]+)/i,
			browserId: '406'
		},
		'509': {
			regexp: /mozilla[\s\S]*iphone[\s\S]*os[\s\S]*/i,
			browserId: '394'
		},
		'510': {
			regexp: /Opera[\s\S]*Opera Mobi/i,
			browserId: '321'
		},
		'511': {
			regexp: /nokiac3[\s\S]*safari/i,
			browserId: '394'
		},
		'512': {
			regexp: /series60[\s\S]*applewebkit[\s\S]*/i,
			browserId: '226'
		},
		'513': {
			regexp: /mozilla[\s\S]*ipad[\s\S]*os[\s\S]*/i,
			browserId: '394'
		},
		'514': {
			regexp: /^Plex\/([0-9\.]+)[\s\S]*plexapp\.com/i,
			browserId: '407'
		},
		'515': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]* WebRender/i,
			browserId: '408'
		},
		'516': {
			regexp: /^Mozilla[\s\S]*RIM Tablet OS[\s\S]*AppleWebKit[\s\S]*Safari/i,
			browserId: '158'
		},
		'517': {
			regexp: /Mozilla[\s\S]*Chrome[\s\S]*CoolNovo\/([a-z0-9\.]+)/i,
			browserId: '409'
		},
		'518': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*Usejump\/([0-9a-z\.]+)/i,
			browserId: '410'
		},
		'519': {
			regexp: /Mozilla[\s\S]*Gecko[\s\S]*Sundial\/([0-9a-z_\.]+)/i,
			browserId: '411'
		},
		'520': {
			regexp: /Symbian[\s\S]* NokiaBrowser/i,
			browserId: '226'
		},
		'521': {
			regexp: /Mozilla[\s\S]*Gecko[\s\S]*Alienforce\/([0-9a-z\.]+)/i,
			browserId: '412'
		},
		'522': {
			regexp: /^Googlebot-richsnippets/i,
			browserId: '413'
		},
		'523': {
			regexp: /^HTML2JPG[\s\S]*http:\/\/www[\s\S]html2jpg[\s\S]com/i,
			browserId: '414'
		},
		'524': {
			regexp: /^iCatcher! ([0-9\.]+)[\s\S]*iPhone OS/i,
			browserId: '415'
		},
		'525': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*Chrome[\s\S]*baidubrowser\/([0-9a-z\.]+)/i,
			browserId: '416'
		},
		'526': {
			regexp: /Mozilla[\s\S]*MSIE[\s\S]*Windows[\s\S]*baidubrowser ([0-9a-z\.]+)/i,
			browserId: '416'
		},
		'527': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*Chrome[\s\S]*SE ([0-9a-z\.]+) MetaSr/i,
			browserId: '417'
		},
		'528': {
			regexp: /Mozilla[\s\S]*MSIE[\s\S]* Windows[\s\S]*SE ([0-9a-z\.]+) MetaSr/i,
			browserId: '417'
		},
		'529': {
			regexp: /^MPlayer ([0-9\.]+)/i,
			browserId: '418'
		},
		'530': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Chrome[\s\S]*ZipZap ([0-9\.]+)/i,
			browserId: '419'
		},
		'531': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*QupZilla\/([0-9a-z\.\-]+)/i,
			browserId: '420'
		},
		'532': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*Patriott::Browser\/([0-9\.]+)/i,
			browserId: '421'
		},
		'533': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*SLP Browser\/([0-9\.]+)/i,
			browserId: '422'
		},
		'534': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Tizen Browser|Tizenbrowser\/([0-9\.]+)/i,
			browserId: '422'
		},
		'535': {
			regexp: /Mozilla[\s\S]*Android[\s\S]*AppleWebKit[\s\S]*CrMo\/([0-9\.]+)/i,
			browserId: '423'
		},
		'536': {
			regexp: /^Plex\/([0-9\.]+)[\s\S]*Android/i,
			browserId: '407'
		},
		'537': {
			regexp: /^WAFA\/([0-9\.]+)[\s\S]*Android/i,
			browserId: '424'
		},
		'538': {
			regexp: /^Apache[\s\S]*internal dummy connection/i,
			browserId: '425'
		},
		'539': {
			regexp: /^Mozilla[\s\S]*Android [\s\S]*Ninesky\-android\-mobile\/([0-9\.]+)/i,
			browserId: '426'
		},
		'540': {
			regexp: /^Mozilla[\s\S]*Linux\/SmartTV[\s\S]*AppleWebKit[\s\S]*WebBrowser[\s\S]*SmartTV/i,
			browserId: '427'
		},
		'541': {
			regexp: /Mozilla[\s\S]*Linux[\s\S]*webOS[\s\S]*webOSBrowser\/([0-9\.]+)/i,
			browserId: '428'
		},
		'542': {
			regexp: /Mozilla[\s\S]*Linux[\s\S]*hpwOS[\s\S]*wOSBrowser\/([0-9\.]+)/i,
			browserId: '428'
		},
		'543': {
			regexp: /Nokia SyncML HTTP Client/i,
			browserId: '429'
		},
		'544': {
			regexp: /^Mozilla.*Charon.*Inferno/,
			browserId: '430'
		},
		'545': {
			regexp: /^JS\-Kit URL Resolver[\s\S]*js-kit\.com/i,
			browserId: '432'
		},
		'546': {
			regexp: /^Outlook-Express\/7\.0 \(MSIE 9[\s\S]*Windows/i,
			browserId: '327'
		},
		'547': {
			regexp: /^PocoMail ([0-9\.]+)/i,
			browserId: '356'
		},
		'548': {
			regexp: /^Podkicker\/([0-9\.]+)/i,
			browserId: '433'
		},
		'549': {
			regexp: /^Podkicker Pro\/([0-9\.]+)/i,
			browserId: '433'
		},
		'550': {
			regexp: /^python-requests\/([0-9\.]+)/i,
			browserId: '434'
		},
		'551': {
			regexp: /^AtomicBrowser\/([0-9\.]+)[\s\S]*CFNetwork/i,
			browserId: '436'
		},
		'552': {
			regexp: /^Reeder\/([0-9\.]+)[\s\S]*CFNetwork/i,
			browserId: '437'
		},
		'553': {
			regexp: /^Mozilla[\s\S]*Mobile[\s\S]*rv[\s\S]*Gecko[\s\S]*Firefox\/([0-9\.]+)/i,
			browserId: '133'
		},
		'554': {
			regexp: /Mozilla[\s\S]*Mac[\s\S]*rv[\s\S]*Gecko[\s\S]*Firefox\/([0-9a-b\.]+)[\s\S]*TenFourFox/i,
			browserId: '439'
		},
		'555': {
			regexp: /^PEAR HTTP_Request class \( http:\/\/pear[\s\S]php[\s\S]net\/ \)/i,
			browserId: '440'
		},
		'556': {
			regexp: /Mozilla[\s\S]*compatible[\s\S]*DPlus ([0-9\.]+)/i,
			browserId: '441'
		},
		'557': {
			regexp: /^WordPress\/[0-9\.]+; http:\/\//i,
			browserId: '438'
		},
		'558': {
			regexp: /Mozilla[\s\S]*Windows[\s\S]*Gecko[\s\S]*Firefox[\s\S]*AvantBrowser\/Tri-Core/i,
			browserId: '41'
		},
		'559': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*zBrowser\/SpringSun-([0-9\.]+)/i,
			browserId: '442'
		},
		'560': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*zBrowser\/NigtSky-([0-9\.]+)/i,
			browserId: '442'
		},
		'561': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*KHTML[\s\S]*SlimBoat\/([0-9\.]+)/i,
			browserId: '443'
		},
		'562': {
			regexp: /Opera[\s\S]*Opera Tablet[\s\S]*Presto[\s\S]*Version\/([0-9\.]+)/i,
			browserId: '321'
		},
		'563': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Chrome\/([0-9\.]+)[\s\S]*Mobile Safari/i,
			browserId: '423'
		},
		'564': {
			regexp: /^Mozilla[\s\S]*iPhone[\s\S]*AppleWebKit[\s\S]*CriOS\/([0-9\.]+)[\s\S]*Mobile[\s\S]*Safari/i,
			browserId: '423'
		},
		'565': {
			regexp: /^Mechanize\/([0-9\.]+)[\s\S]*Ruby[\s\S]*github[\s\S]com\/tenderlove\/mechanize/i,
			browserId: '445'
		},
		'566': {
			regexp: /^htmlayout ([0-9\.]+)[\s\S]*Win[\s\S]*www\.terrainformatica\.com/i,
			browserId: '446'
		},
		'567': {
			regexp: /^The Bat! Voyager ([0-9\.]+)$/i,
			browserId: '330'
		},
		'568': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*Windows[\s\S]*SaaYaa/i,
			browserId: '447'
		},
		'569': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Qt\/[0-9\.]+[\s\S]*Ryouko\/([0-9\.]+)[\s\S]*Safari/i,
			browserId: '448'
		},
		'570': {
			regexp: /^Anemone\/([0-9\.]+)$/i,
			browserId: '449'
		},
		'571': {
			regexp: /^Mozilla[\s\S]*OS X[\s\S]*AppleWebKit[\s\S]*KHTML[\s\S]*Sparrow\/([0-9\.]+)/i,
			browserId: '450'
		},
		'572': {
			regexp: /^SubStream\/([0-9\.]+)[\s\S]* CFNetwork/i,
			browserId: '451'
		},
		'573': {
			regexp: /^Mozilla[\s\S]*iPad[\s\S]*AppleWebKit[\s\S]*CriOS\/([0-9\.]+)[\s\S]*Mobile[\s\S]*Safari/i,
			browserId: '423'
		},
		'574': {
			regexp: /^Barca\/([0-9\.]+)/i,
			browserId: '452'
		},
		'575': {
			regexp: /^BarcaPro\/([0-9\.]+)/i,
			browserId: '452'
		},
		'576': {
			regexp: /A1 Sitemap Generator\/([0-9\.]+)[\s\S]*microsystools[\s\S]com/i,
			browserId: '453'
		},
		'577': {
			regexp: /^Mozilla[\s\S]*Playstation Vita[\s\S]*AppleWebKit[\s\S]*Silk\/([0-9\.]+)/i,
			browserId: '454'
		},
		'578': {
			regexp: /^MQQBrowser\/([0-9\.]+)/i,
			browserId: '455'
		},
		'579': {
			regexp: /^MQQBrowser\/(Mini[0-9\.]+)/i,
			browserId: '455'
		},
		'580': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Chrome[\s\S]*Beamrise\/([0-9\.]+)/i,
			browserId: '456'
		},
		'581': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Beamrise\/([0-9\.]+)[\s\S]*Chrome/i,
			browserId: '456'
		},
		'582': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Chrome[\s\S]*YaBrowser\/([0-9\.]+)/i,
			browserId: '457'
		},
		'583': {
			regexp: /^Mozilla[\s\S]*Silk\/([0-9\.\-]+)[\s\S]*safari/i,
			browserId: '458'
		},
		'584': {
			regexp: /^Apache-HttpClient\/([0-9\.]+)/i,
			browserId: '459'
		},
		'585': {
			regexp: /^Mozilla.*Nintendo WiiU.*AppleWebKit.*NX.*NintendoBrowser\/([0-9\.]+)/,
			browserId: '460'
		},
		'586': {
			regexp: /^DellWebMonitor\/([0-9\.]+)/,
			browserId: '461'
		},
		'587': {
			regexp: /^FeedDemon\/([0-9\.]+)[\s\S]*(www\.feeddemon\.com|www\.newsgator\.com)/i,
			browserId: '462'
		},
		'588': {
			regexp: /^XMLRPC::Client \(Ruby ([0-9\.]+)\)$/i,
			browserId: '463'
		},
		'589': {
			regexp: /^PocomailPE\/([0-9\.]+)/i,
			browserId: '356'
		},
		'590': {
			regexp: /Pattern\/([0-9\.]+)[\s\S]*[\s\S]clips\.ua\.ac\.be\/pages\/pattern/i,
			browserId: '464'
		},
		'592': {
			regexp: /^Eudora\/?([0-9a-z\.]+)*/i,
			browserId: '465'
		},
		'593': {
			regexp: /^Mozilla[\s\S]*Windows[\s\S]*Gecko[\s\S]*Polarity\/([0-9\.]+)/i,
			browserId: '467'
		},
		'594': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Superbird\/([0-9\.]+)/i,
			browserId: '468'
		},
		'595': {
			regexp: /^Microsoft Office\/14[\s\S]*Microsoft Outlook 14/i,
			browserId: '326'
		},
		'596': {
			regexp: /mozilla[\s\S]*AppleWebKit[\s\S]*NetFrontLifeBrowser\/([0-9\.]+)/i,
			browserId: '469'
		},
		'597': {
			regexp: /mozilla[\s\S]*applewebkit[\s\S]*\/[0-9a-z\+\-\.]+[\s\S]*version\/([0-9a-z\+\-\.]+)[\s\S]*safari\/[0-9a-z\+\-\.]+[\s\S]*/i,
			browserId: '22'
		},
		'598': {
			regexp: /^Mozilla[\s\S]*ASUS Transformer Pad[\s\S]*AppleWebKit[\s\S]*Chrome\/([0-9\.]+)[\s\S]*Safari/i,
			browserId: '423'
		},
		'599': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*AppleWebKit[\s\S]*Chrome[\s\S]*OPR\/([0-9\.]+)/i,
			browserId: '321'
		},
		'600': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*YRCWeblink\/([0-9\.]+)[\s\S]*Safari/i,
			browserId: '470'
		},
		'601': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Chrome[\s\S]*OPR\/([0-9\.]+)/i,
			browserId: '17'
		},
		'602': {
			regexp: /Mozilla[\s\S]*Gecko[\s\S]*Firefox[\s\S]*IceDragon\/([0-9\.]+)/i,
			browserId: '471'
		},
		'603': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*YaBrowser\/([0-9\.]+)[\s\S]*Chrome/i,
			browserId: '457'
		},
		'604': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Chrome[\s\S]*Safari[\s\S]*Midori\/([0-9\.]+)/i,
			browserId: '148'
		},
		'605': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*Dooble\/([0-9\.]+)[\s\S]*Safari/i,
			browserId: '269'
		},
		'606': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*UCBrowser\/([0-9\.]+)[\s\S]*Mobile[\s\S]*Safari/i,
			browserId: '225'
		},
		'607': {
			regexp: /^Microsoft Office\/15[\s\S]*Microsoft Outlook 15/i,
			browserId: '473'
		},
		'608': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*Microsoft Outlook 15/i,
			browserId: '473'
		},
		'609': {
			regexp: /^Typhoeus[\s\S]*https:\/\/github[\s\S]com\/typhoeus\/typhoeus/i,
			browserId: '287'
		},
		'610': {
			regexp: /^RestSharp ([0-9\.]+)$/i,
			browserId: '474'
		},
		'611': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*AppleWebKit[\s\S]*Chrome[\s\S]*YaBrowser\/([0-9\.]+)[\s\S]*Mobile/i,
			browserId: '475'
		},
		'612': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*Chrome[\s\S]*Safari[\s\S]*Puffin\/([0-9\.]+)/i,
			browserId: '476'
		},
		'613': {
			regexp: /Mozilla[\s\S]*Windows NT 6\.[\s\S]*Trident\/7\.0[\s\S]*rv:([0-9\.]+)/i,
			browserId: '35'
		},
		'614': {
			regexp: /Mozilla[\s\S]*AppleWebKit[\s\S]*Roccat\/([0-9\.]+)[\s\S]*R/i,
			browserId: '477'
		},
		'615': {
			regexp: /^Airmail ([0-9\.]+)[\s\S]*Mac OS X/i,
			browserId: '478'
		},
		'616': {
			regexp: /^Mozilla[\s\S]*Nintendo 3DS/i,
			browserId: '479'
		},
		'617': {
			regexp: /^Mozilla[\s\S]*Tizen 2[\s\S]*Version\/([0-9\.]+)[\s\S]*Mobile Safari/i,
			browserId: '422'
		},
		'619': {
			regexp: /mozilla[\s\S]*Linux armv7l[\s\S]*rv:[0-9\.]+[\s\S]*gecko\/[0-9]+[\s\S]*maemo browser ([0-9a-z\+\-\.]+)[\s\S]*/i,
			browserId: '260'
		},
		'620': {
			regexp: /^Mozilla[\s\S]*Polaris ([0-9\.])/i,
			browserId: '159'
		},
		'621': {
			regexp: /^Mozilla[\s\S]*BB10[\s\S]*Touch[\s\S]*AppleWebKit[\s\S]*Mobile/i,
			browserId: '158'
		},
		'622': {
			regexp: /^BrowserEmulator\/0\.9 see http:\/\/dejavu\.org/i,
			browserId: '481'
		},
		'623': {
			regexp: /^Mozilla\/5\.0[\s\S]*SymbianOS\/[0-9\.]+[\s\S]*AppleWebKit[\s\S]*KHTML[\s\S]*Safari\/[0-9\.]+/i,
			browserId: '226'
		},
		'624': {
			regexp: /^Mozilla[\s\S]*PalmOS[\s\S]*WebPro\/([0-9\.]+)[\s\S]*Palm/i,
			browserId: '482'
		},
		'625': {
			regexp: /^Mozilla[\s\S]*AppleWebKit[\s\S]*PhantomJS\/([0-9\.]+) Safari/i,
			browserId: '483'
		},
		order: [
			'599',
			'539',
			'596',
			'208',
			'583',
			'611',
			'2',
			'11',
			'49',
			'69',
			'94',
			'149',
			'197',
			'218',
			'359',
			'361',
			'414',
			'443',
			'535',
			'563',
			'564',
			'571',
			'573',
			'578',
			'579',
			'598',
			'612',
			'621',
			'199',
			'407',
			'408',
			'419',
			'541',
			'595',
			'608',
			'5',
			'593',
			'59',
			'117',
			'157',
			'175',
			'179',
			'180',
			'184',
			'203',
			'230',
			'232',
			'233',
			'234',
			'235',
			'266',
			'322',
			'396',
			'403',
			'406',
			'409',
			'439',
			'446',
			'489',
			'494',
			'495',
			'498',
			'533',
			'534',
			'546',
			'561',
			'577',
			'580',
			'581',
			'582',
			'594',
			'603',
			'614',
			'617',
			'170',
			'278',
			'410',
			'411',
			'444',
			'476',
			'506',
			'508',
			'515',
			'517',
			'520',
			'553',
			'554',
			'558',
			'559',
			'560',
			'600',
			'601',
			'602',
			'604',
			'605',
			'606',
			'7',
			'162',
			'22',
			'54',
			'60',
			'61',
			'114',
			'163',
			'182',
			'183',
			'314',
			'331',
			'340',
			'369',
			'431',
			'434',
			'436',
			'440',
			'441',
			'442',
			'452',
			'463',
			'468',
			'469',
			'470',
			'471',
			'484',
			'488',
			'496',
			'502',
			'507',
			'516',
			'519',
			'521',
			'525',
			'526',
			'527',
			'528',
			'530',
			'531',
			'532',
			'569',
			'499',
			'246',
			'400',
			'401',
			'402',
			'509',
			'513',
			'562',
			'438',
			'510',
			'511',
			'150',
			'261',
			'271',
			'342',
			'422',
			'486',
			'512',
			'619',
			'1',
			'3',
			'4',
			'6',
			'8',
			'9',
			'10',
			'14',
			'15',
			'16',
			'19',
			'20',
			'303',
			'24',
			'25',
			'26',
			'28',
			'29',
			'30',
			'31',
			'32',
			'33',
			'35',
			'36',
			'37',
			'223',
			'42',
			'304',
			'44',
			'45',
			'46',
			'48',
			'50',
			'51',
			'53',
			'55',
			'56',
			'57',
			'58',
			'63',
			'64',
			'65',
			'66',
			'67',
			'70',
			'77',
			'78',
			'80',
			'302',
			'86',
			'89',
			'97',
			'98',
			'100',
			'102',
			'104',
			'106',
			'107',
			'108',
			'109',
			'110',
			'111',
			'113',
			'115',
			'327',
			'118',
			'120',
			'122',
			'123',
			'371',
			'126',
			'130',
			'300',
			'169',
			'301',
			'137',
			'141',
			'147',
			'151',
			'152',
			'153',
			'156',
			'155',
			'160',
			'161',
			'164',
			'167',
			'171',
			'172',
			'173',
			'174',
			'176',
			'177',
			'178',
			'181',
			'185',
			'186',
			'187',
			'188',
			'189',
			'192',
			'194',
			'195',
			'196',
			'198',
			'204',
			'205',
			'206',
			'207',
			'209',
			'210',
			'211',
			'212',
			'213',
			'214',
			'215',
			'216',
			'217',
			'219',
			'220',
			'221',
			'222',
			'224',
			'225',
			'226',
			'227',
			'228',
			'229',
			'231',
			'236',
			'238',
			'241',
			'244',
			'247',
			'248',
			'249',
			'250',
			'251',
			'253',
			'258',
			'260',
			'262',
			'264',
			'265',
			'267',
			'272',
			'273',
			'274',
			'275',
			'276',
			'277',
			'279',
			'295',
			'293',
			'294',
			'287',
			'289',
			'296',
			'292',
			'297',
			'298',
			'305',
			'306',
			'307',
			'308',
			'311',
			'313',
			'316',
			'317',
			'318',
			'320',
			'321',
			'323',
			'324',
			'325',
			'328',
			'329',
			'330',
			'333',
			'334',
			'335',
			'336',
			'337',
			'338',
			'339',
			'341',
			'345',
			'346',
			'348',
			'349',
			'352',
			'353',
			'354',
			'355',
			'360',
			'362',
			'364',
			'365',
			'366',
			'367',
			'370',
			'372',
			'373',
			'374',
			'375',
			'376',
			'377',
			'378',
			'379',
			'381',
			'383',
			'384',
			'385',
			'386',
			'387',
			'388',
			'389',
			'390',
			'391',
			'393',
			'394',
			'395',
			'399',
			'405',
			'412',
			'413',
			'415',
			'416',
			'418',
			'420',
			'423',
			'424',
			'425',
			'426',
			'427',
			'428',
			'433',
			'435',
			'437',
			'445',
			'447',
			'449',
			'450',
			'451',
			'458',
			'459',
			'461',
			'466',
			'472',
			'473',
			'474',
			'475',
			'477',
			'478',
			'482',
			'487',
			'490',
			'493',
			'497',
			'500',
			'503',
			'504',
			'505',
			'514',
			'518',
			'524',
			'537',
			'540',
			'542',
			'543',
			'544',
			'545',
			'547',
			'548',
			'549',
			'550',
			'551',
			'552',
			'555',
			'556',
			'557',
			'565',
			'566',
			'567',
			'568',
			'570',
			'572',
			'576',
			'584',
			'585',
			'587',
			'588',
			'589',
			'590',
			'592',
			'607',
			'610',
			'613',
			'615',
			'616',
			'620',
			'622',
			'623',
			'624',
			'625',
			'17',
			'404',
			'47',
			'52',
			'79',
			'82',
			'166',
			'193',
			'239',
			'18',
			'34',
			'103',
			'105',
			'138',
			'139',
			'143',
			'190',
			'191',
			'201',
			'237',
			'242',
			'243',
			'245',
			'268',
			'269',
			'270',
			'280',
			'299',
			'309',
			'310',
			'312',
			'357',
			'358',
			'397',
			'455',
			'457',
			'479',
			'481',
			'491',
			'492',
			'501',
			'529',
			'536',
			'480',
			'62',
			'202',
			'240',
			'254',
			'255',
			'256',
			'257',
			'319',
			'350',
			'392',
			'462',
			'464',
			'465',
			'483',
			'522',
			'597',
			'23',
			'95',
			'165',
			'200',
			'259',
			'281',
			'315',
			'332',
			'343',
			'344',
			'363',
			'368',
			'380',
			'382',
			'398',
			'417',
			'421',
			'429',
			'430',
			'448',
			'453',
			'456',
			'460',
			'467',
			'485',
			'523',
			'538',
			'574',
			'575',
			'586',
			'609',
			'351',
			'83',
			'263',
			'432',
			'326',
			'39',
			'81',
			'356'
		]
	},
	browserOs: {
		'18': '44',
		'23': '19',
		'39': '43',
		'43': '35',
		'59': '43',
		'62': '43',
		'71': '43',
		'82': '43',
		'88': '43',
		'93': '43',
		'100': '47',
		'124': '43',
		'125': '44',
		'146': '44',
		'151': '10',
		'152': '47',
		'159': '10',
		'170': '44',
		'179': '43',
		'194': '43',
		'200': '43',
		'201': '43',
		'209': '43',
		'217': '43',
		'220': '10',
		'221': '19',
		'235': '19',
		'239': '43',
		'240': '19',
		'248': '43',
		'251': '43',
		'256': '43',
		'260': '75',
		'261': '75',
		'271': '43',
		'272': '43',
		'281': '47',
		'282': '43',
		'283': '43',
		'286': '62',
		'293': '43',
		'304': '43',
		'305': '43',
		'310': '33',
		'311': '43',
		'312': '43',
		'313': '44',
		'316': '43',
		'330': '43',
		'334': '43',
		'344': '43',
		'349': '19',
		'356': '43',
		'367': '43',
		'369': '43',
		'373': '43',
		'376': '43',
		'385': '114',
		'388': '86',
		'393': '43',
		'395': '43',
		'414': '43',
		'429': '34',
		'436': '65',
		'437': '65',
		'452': '43',
		'453': '43',
		order: [
			'18',
			'23',
			'39',
			'43',
			'59',
			'62',
			'71',
			'82',
			'88',
			'93',
			'100',
			'124',
			'125',
			'146',
			'151',
			'152',
			'159',
			'170',
			'179',
			'194',
			'200',
			'201',
			'209',
			'217',
			'220',
			'221',
			'235',
			'239',
			'240',
			'248',
			'251',
			'256',
			'260',
			'261',
			'271',
			'272',
			'281',
			'282',
			'283',
			'286',
			'293',
			'304',
			'305',
			'310',
			'311',
			'312',
			'313',
			'316',
			'330',
			'334',
			'344',
			'349',
			'356',
			'367',
			'369',
			'373',
			'376',
			'385',
			'388',
			'393',
			'395',
			'414',
			'429',
			'436',
			'437',
			'452',
			'453'
		]
	},
	osReg: {
		'1': {
			regexp: /windows nt 5\.1/i,
			osId: '1'
		},
		'3': {
			regexp: /windows nt 5\.0/i,
			osId: '2'
		},
		'4': {
			regexp: /[\s\S]*windows nt 5\.2( |;)[\s\S]*/i,
			osId: '3'
		},
		'5': {
			regexp: /[\s\S]*windows 95[\s\S]*/i,
			osId: '4'
		},
		'6': {
			regexp: /[\s\S]*win95[\s\S]*/i,
			osId: '4'
		},
		'7': {
			regexp: /windows 98/i,
			osId: '5'
		},
		'8': {
			regexp: /[\s\S]*win16( |;)[\s\S]*/i,
			osId: '6'
		},
		'9': {
			regexp: /[\s\S]*win98( |;)[\s\S]*/i,
			osId: '5'
		},
		'10': {
			regexp: /[\s\S]*windows 4\.10( |;)[\s\S]*/i,
			osId: '5'
		},
		'11': {
			regexp: /windows ce|PocketPC/i,
			osId: '7'
		},
		'12': {
			regexp: /[\s\S]*windows me( |;)[\s\S]*/i,
			osId: '8'
		},
		'13': {
			regexp: /[\s\S]*windows nt 6\.0( |;)[\s\S]*/i,
			osId: '9'
		},
		'14': {
			regexp: /j2me/i,
			osId: '10'
		},
		'15': {
			regexp: /centos/i,
			osId: '11'
		},
		'16': {
			regexp: /ubuntu/i,
			osId: '12'
		},
		'17': {
			regexp: /linux[\s\S]*debian/i,
			osId: '13'
		},
		'18': {
			regexp: /linux[\s\S]*fedora/i,
			osId: '14'
		},
		'19': {
			regexp: /linux[\s\S]*gentoo/i,
			osId: '15'
		},
		'20': {
			regexp: /linux[\s\S]*linspire/i,
			osId: '16'
		},
		'21': {
			regexp: /linux[\s\S]*mandriva/i,
			osId: '17'
		},
		'22': {
			regexp: /linux[\s\S]*mdk/i,
			osId: '17'
		},
		'23': {
			regexp: /linux[\s\S]*redhat/i,
			osId: '18'
		},
		'24': {
			regexp: /linux/i,
			osId: '19'
		},
		'25': {
			regexp: /linux[\s\S]*slackware/i,
			osId: '20'
		},
		'26': {
			regexp: /linux[\s\S]*kanotix/i,
			osId: '21'
		},
		'27': {
			regexp: /linux[\s\S]*suse/i,
			osId: '22'
		},
		'28': {
			regexp: /linux[\s\S]*knoppix/i,
			osId: '23'
		},
		'29': {
			regexp: /[\s\S]*netbsd[\s\S]*/i,
			osId: '24'
		},
		'30': {
			regexp: /[\s\S]*freebsd[\s\S]*/i,
			osId: '25'
		},
		'31': {
			regexp: /[\s\S]*openbsd[\s\S]*/i,
			osId: '26'
		},
		'34': {
			regexp: /sunos/i,
			osId: '29'
		},
		'35': {
			regexp: /amiga/i,
			osId: '30'
		},
		'36': {
			regexp: /irix/i,
			osId: '31'
		},
		'37': {
			regexp: /open[\s\S]*vms/i,
			osId: '32'
		},
		'38': {
			regexp: /beos/i,
			osId: '33'
		},
		'39': {
			regexp: /symbian/i,
			osId: '34'
		},
		'40': {
			regexp: /palm/i,
			osId: '35'
		},
		'42': {
			regexp: /webtv/i,
			osId: '37'
		},
		'43': {
			regexp: /os\/2[\s\S]*warp/i,
			osId: '39'
		},
		'44': {
			regexp: /os\/2/i,
			osId: '87'
		},
		'45': {
			regexp: /RISC[\s\S]OS/i,
			osId: '40'
		},
		'46': {
			regexp: /hp-ux/i,
			osId: '41'
		},
		'47': {
			regexp: /Nintendo[\s\S]Wii/i,
			osId: '42'
		},
		'48': {
			regexp: /windows/i,
			osId: '43'
		},
		'49': {
			regexp: /mac_powerpc/i,
			osId: '44'
		},
		'50': {
			regexp: /Macintosh/i,
			osId: '44'
		},
		'51': {
			regexp: /aix/i,
			osId: '45'
		},
		'52': {
			regexp: /Win32/i,
			osId: '43'
		},
		'53': {
			regexp: /winnt/i,
			osId: '46'
		},
		'54': {
			regexp: /java\/[0-9a-z\.]+/i,
			osId: '47'
		},
		'55': {
			regexp: /[\s\S]*windows XP[\s\S]*/i,
			osId: '1'
		},
		'56': {
			regexp: /Series80\/2\.0/i,
			osId: '34'
		},
		'57': {
			regexp: /SonyEricssonP900/i,
			osId: '34'
		},
		'58': {
			regexp: /plan 9/i,
			osId: '49'
		},
		'59': {
			regexp: /NetFront[\s\S]*Profile\/MIDP/i,
			osId: '10'
		},
		'60': {
			regexp: /BlackBerry/i,
			osId: '50'
		},
		'61': {
			regexp: /Series90[\s\S]*Nokia7710/i,
			osId: '34'
		},
		'63': {
			regexp: /linux[\s\S]*\(Dropline GNOME\)[\s\S]*/i,
			osId: '20'
		},
		'64': {
			regexp: /Win 9x 4\.90/i,
			osId: '8'
		},
		'65': {
			regexp: /WinNT4\.0/i,
			osId: '46'
		},
		'66': {
			regexp: /linux[\s\S]*red hat/i,
			osId: '18'
		},
		'67': {
			regexp: /Solaris/i,
			osId: '29'
		},
		'68': {
			regexp: /QNX x86pc/i,
			osId: '52'
		},
		'69': {
			regexp: /Red Hat modified/i,
			osId: '18'
		},
		'70': {
			regexp: /Windows\-NT/i,
			osId: '46'
		},
		'71': {
			regexp: /MorphOS/i,
			osId: '53'
		},
		'73': {
			regexp: /CYGWIN_NT\-5[\s\S]0/i,
			osId: '2'
		},
		'74': {
			regexp: /powerpc\-apple/i,
			osId: '44'
		},
		'75': {
			regexp: /^DoCoMo[\s\S]*F900i/i,
			osId: '34'
		},
		'76': {
			regexp: /Vector Linux/i,
			osId: '55'
		},
		'77': {
			regexp: /riscos/i,
			osId: '40'
		},
		'78': {
			regexp: /Linux Mint/i,
			osId: '56'
		},
		'79': {
			regexp: /SCO_SV/i,
			osId: '57'
		},
		'80': {
			regexp: /suse\-linux/i,
			osId: '22'
		},
		'81': {
			regexp: /Arch Linux ([0-9a-zA-Z\.\-]+)/i,
			osId: '58'
		},
		'82': {
			regexp: /Gentoo i686/i,
			osId: '15'
		},
		'83': {
			regexp: /SkyOS/i,
			osId: '59'
		},
		'84': {
			regexp: /[\s\S]*windows 3\.1[\s\S]*/i,
			osId: '6'
		},
		'85': {
			regexp: /[\s\S]*dragonfly[\s\S]*/i,
			osId: '61'
		},
		'86': {
			regexp: /Android ([0-9\.]+)/i,
			osId: '62'
		},
		'87': {
			regexp: /windows nt 6\.1/i,
			osId: '64'
		},
		'88': {
			regexp: /[\s\S]*windows 2000( |;)[\s\S]*/i,
			osId: '2'
		},
		'90': {
			regexp: /iPhone OS 2_0/i,
			osId: '65'
		},
		'92': {
			regexp: /iPhone OS ([0-9_]+) like Mac OS X/i,
			osId: '65'
		},
		'93': {
			regexp: /NT4\.0/i,
			osId: '46'
		},
		'94': {
			regexp: /java[0-9a-z\.]+/i,
			osId: '47'
		},
		'95': {
			regexp: /webOS\/[\s\S]*AppleWebKit/i,
			osId: '69'
		},
		'96': {
			regexp: /BeOS[\s\S]*Haiku BePC/i,
			osId: '70'
		},
		'98': {
			regexp: /Windows NT 6\.0/i,
			osId: '9'
		},
		'99': {
			regexp: /macos/i,
			osId: '44'
		},
		'100': {
			regexp: /Series 60/i,
			osId: '34'
		},
		'101': {
			regexp: /os=Mac/i,
			osId: '44'
		},
		'102': {
			regexp: /Series60/i,
			osId: '34'
		},
		'103': {
			regexp: /Danger hiptop [0-9\.]+/i,
			osId: '72'
		},
		'105': {
			regexp: /Konqueror[\s\S]*SUSE/i,
			osId: '22'
		},
		'106': {
			regexp: /Konqueror[\s\S]*Fedora/i,
			osId: '14'
		},
		'107': {
			regexp: /Obigo[\s\S]*MIDP/i,
			osId: '10'
		},
		'108': {
			regexp: /Teleca[\s\S]*MIDP/i,
			osId: '10'
		},
		'109': {
			regexp: /Syllable/i,
			osId: '74'
		},
		'110': {
			regexp: /Windows_XP\/5[\s\S]1/i,
			osId: '1'
		},
		'111': {
			regexp: /SO=MAC10,6/i,
			osId: '44'
		},
		'112': {
			regexp: /so=Mac 10[\s\S]5[\s\S]8/i,
			osId: '44'
		},
		'114': {
			regexp: /[\s\S]*windows 7[\s\S]*/i,
			osId: '64'
		},
		'115': {
			regexp: /iPhone OS [0-9\.]+/i,
			osId: '65'
		},
		'116': {
			regexp: /Mac OS X (10_6|10\.6)/i,
			osId: '85'
		},
		'117': {
			regexp: /Mac OS X (10_5|10\.5)/i,
			osId: '84'
		},
		'118': {
			regexp: /Mac OS X (10_4|10\.4)/i,
			osId: '83'
		},
		'119': {
			regexp: /Mac OS X/i,
			osId: '86'
		},
		'120': {
			regexp: /Mozilla[\s\S]*Linux[\s\S]*Maemo/i,
			osId: '75'
		},
		'121': {
			regexp: /Windows NT 4/i,
			osId: '46'
		},
		'122': {
			regexp: /Windows ME/i,
			osId: '8'
		},
		'123': {
			regexp: /Windows 2000/i,
			osId: '2'
		},
		'124': {
			regexp: /S60; SymbOS/i,
			osId: '34'
		},
		'125': {
			regexp: /Windows Mobile/i,
			osId: '88'
		},
		'126': {
			regexp: /Darwin 10\.3/i,
			osId: '90'
		},
		'127': {
			regexp: /Minix 3/i,
			osId: '91'
		},
		'128': {
			regexp: /iPhone/i,
			osId: '65'
		},
		'129': {
			regexp: /Darwin/i,
			osId: '44'
		},
		'130': {
			regexp: /PCLinuxOS\/([0-9a-z\.\-]+)/i,
			osId: '92'
		},
		'131': {
			regexp: /^Mozilla\/[\s\S]*Linux[\s\S]*Jolicloud/i,
			osId: '93'
		},
		'132': {
			regexp: /PLAYSTATION 3/i,
			osId: '94'
		},
		'133': {
			regexp: /PlayStation Portable/i,
			osId: '94'
		},
		'134': {
			regexp: /SymbianOS/i,
			osId: '34'
		},
		'135': {
			regexp: /AROS/i,
			osId: '95'
		},
		'136': {
			regexp: /iPhone[\s\S]*like Mac OS X/i,
			osId: '65'
		},
		'137': {
			regexp: /iPad[\s\S]*OS[\s\S]*like Mac OS X/i,
			osId: '65'
		},
		'138': {
			regexp: /^HTC_HD2[\s\S]*Opera[\s\S]*windows/i,
			osId: '96'
		},
		'139': {
			regexp: /^Mozilla[\s\S]*CrOS[\s\S]*Chrome/i,
			osId: '97'
		},
		'140': {
			regexp: /Android[\s\S]*Linux[\s\S]*Opera Mobi/i,
			osId: '62'
		},
		'141': {
			regexp: /Nintendo DS/i,
			osId: '98'
		},
		'142': {
			regexp: /^Opera[\s\S]*Android/i,
			osId: '62'
		},
		'143': {
			regexp: /NokiaN97/i,
			osId: '34'
		},
		'144': {
			regexp: /Nokia[\s\S]*XpressMusic/i,
			osId: '34'
		},
		'145': {
			regexp: /NokiaE66/i,
			osId: '34'
		},
		'146': {
			regexp: /Nokia6700/i,
			osId: '34'
		},
		'147': {
			regexp: /\(GNU;/i,
			osId: '99'
		},
		'148': {
			regexp: /Unix/i,
			osId: '19'
		},
		'149': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*Windows[\s\S]* XBLWP7/i,
			osId: '96'
		},
		'150': {
			regexp: /Windows Phone OS 7/,
			osId: '96'
		},
		'151': {
			regexp: /windows nt 6\.2/i,
			osId: '100'
		},
		'152': {
			regexp: /RIM Tablet OS 1[0-9\.]+/i,
			osId: '101'
		},
		'153': {
			regexp: /Android/i,
			osId: '62'
		},
		'154': {
			regexp: /Bada\/[0-9\.]+/i,
			osId: '102'
		},
		'155': {
			regexp: /Android 1[\s\S]0/i,
			osId: '110'
		},
		'156': {
			regexp: /Android 1[\s\S]5/i,
			osId: '103'
		},
		'157': {
			regexp: /Android 1[\s\S]6/i,
			osId: '104'
		},
		'158': {
			regexp: /Android 2[\s\S]0|Android 2[\s\S]1/i,
			osId: '105'
		},
		'159': {
			regexp: /Android 2[\s\S]2/i,
			osId: '106'
		},
		'160': {
			regexp: /Android 2[\s\S]3|Android 2[\s\S]4/i,
			osId: '107'
		},
		'161': {
			regexp: /Android 3[\s\S]/i,
			osId: '108'
		},
		'162': {
			regexp: /Android Donut/i,
			osId: '104'
		},
		'163': {
			regexp: /Android Eclair/i,
			osId: '105'
		},
		'164': {
			regexp: /Android 4[\s\S]/i,
			osId: '111'
		},
		'165': {
			regexp: /Mac OS X (10_7|10\.7)/i,
			osId: '112'
		},
		'166': {
			regexp: /^Mozilla[\s\S]*Tizen\/1/i,
			osId: '113'
		},
		'167': {
			regexp: /Android-4[\s\S]/i,
			osId: '111'
		},
		'168': {
			regexp: /Android\/3/i,
			osId: '108'
		},
		'169': {
			regexp: /Linux.*hpwOS/,
			osId: '69'
		},
		'170': {
			regexp: /^Mozilla.*Charon.*Inferno/,
			osId: '115'
		},
		'171': {
			regexp: /Mac OS X (10_8|10\.8)/i,
			osId: '116'
		},
		'172': {
			regexp: /[\s\S]*Windows\-Vista/i,
			osId: '9'
		},
		'173': {
			regexp: /iPhone OS 5_[0-9_]+/i,
			osId: '118'
		},
		'174': {
			regexp: /iPhone OS 4_[0-9_]+/i,
			osId: '117'
		},
		'175': {
			regexp: /iPad[\s\S]*OS 5_[0-9_]+/i,
			osId: '118'
		},
		'176': {
			regexp: /RIM Tablet OS 2[0-9\.]+/i,
			osId: '119'
		},
		'177': {
			regexp: /Android 4\.1/i,
			osId: '120'
		},
		'178': {
			regexp: /iPad[\s\S]*OS 6_[0-9_]+/i,
			osId: '121'
		},
		'179': {
			regexp: /iPhone OS 6_[0-9_]+/i,
			osId: '121'
		},
		'180': {
			regexp: /PlayStation Vita/i,
			osId: '122'
		},
		'181': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*Windows NT 6[\s\S]1[\s\S]* Xbox/i,
			osId: '123'
		},
		'182': {
			regexp: /^XBMC[\s\S]*Xbox[\s\S]*www\.xbmc\.org/i,
			osId: '123'
		},
		'183': {
			regexp: /Android 4\.2/i,
			osId: '124'
		},
		'184': {
			regexp: /^Mozilla\/5\.0 \(Mobile; rv:[0-9\.]+[\s\S]*\) Gecko\/[0-9\.]+ Firefox\/[0-9\.]+$/i,
			osId: '125'
		},
		'186': {
			regexp: /windows nt 6\.2[\s\S]*ARM/i,
			osId: '126'
		},
		'187': {
			regexp: /^Mozilla[\s\S]*Windows Phone 8[\s\S]0/i,
			osId: '127'
		},
		'188': {
			regexp: /Linux[\s\S]*Mageia/i,
			osId: '128'
		},
		'189': {
			regexp: /iPhone OS 7_[0-9_]+/i,
			osId: '129'
		},
		'190': {
			regexp: /Windows NT 6\.3/i,
			osId: '130'
		},
		'191': {
			regexp: /Android 4\.3/i,
			osId: '131'
		},
		'192': {
			regexp: /Mac OS X (10_9|10\.9)/i,
			osId: '132'
		},
		'193': {
			regexp: /iPad[\s\S]*OS 7_[0-9_]+/i,
			osId: '129'
		},
		'194': {
			regexp: /Samsung[\s\S]*SmartTV/i,
			osId: '19'
		},
		'195': {
			regexp: /AppleTV/i,
			osId: '86'
		},
		'196': {
			regexp: /VectorLinux/i,
			osId: '55'
		},
		'197': {
			regexp: /^Mozilla[\s\S]*Nintendo 3DS/i,
			osId: '133'
		},
		'198': {
			regexp: /^Mozilla[\s\S]*Tizen 2/i,
			osId: '134'
		},
		'199': {
			regexp: /^Mozilla[\s\S]*BB10[\s\S]*Touch[\s\S]*AppleWebKit[\s\S]*Mobile/i,
			osId: '50'
		},
		order: [
			'40',
			'64',
			'71',
			'173',
			'174',
			'175',
			'178',
			'179',
			'186',
			'189',
			'193',
			'92',
			'67',
			'90',
			'102',
			'136',
			'138',
			'181',
			'177',
			'183',
			'191',
			'60',
			'96',
			'149',
			'155',
			'156',
			'157',
			'158',
			'159',
			'160',
			'161',
			'162',
			'163',
			'164',
			'166',
			'167',
			'168',
			'198',
			'125',
			'1',
			'5',
			'3',
			'4',
			'56',
			'6',
			'7',
			'8',
			'9',
			'10',
			'11',
			'12',
			'13',
			'14',
			'15',
			'16',
			'17',
			'18',
			'19',
			'20',
			'21',
			'22',
			'23',
			'25',
			'26',
			'27',
			'28',
			'29',
			'30',
			'31',
			'116',
			'34',
			'35',
			'36',
			'37',
			'38',
			'42',
			'43',
			'45',
			'46',
			'47',
			'53',
			'57',
			'58',
			'59',
			'61',
			'63',
			'65',
			'66',
			'68',
			'69',
			'70',
			'137',
			'73',
			'75',
			'76',
			'77',
			'78',
			'79',
			'80',
			'81',
			'83',
			'84',
			'86',
			'87',
			'88',
			'117',
			'95',
			'98',
			'118',
			'103',
			'110',
			'134',
			'114',
			'115',
			'120',
			'124',
			'130',
			'131',
			'132',
			'139',
			'140',
			'150',
			'151',
			'152',
			'153',
			'154',
			'165',
			'169',
			'170',
			'171',
			'172',
			'176',
			'180',
			'182',
			'184',
			'188',
			'190',
			'192',
			'194',
			'195',
			'196',
			'197',
			'199',
			'119',
			'24',
			'82',
			'105',
			'106',
			'107',
			'108',
			'123',
			'121',
			'39',
			'44',
			'55',
			'85',
			'122',
			'187',
			'93',
			'133',
			'48',
			'49',
			'50',
			'51',
			'52',
			'54',
			'109',
			'74',
			'135',
			'94',
			'100',
			'101',
			'111',
			'112',
			'127',
			'141',
			'142',
			'143',
			'144',
			'145',
			'146',
			'147',
			'99',
			'126',
			'128',
			'148',
			'129'
		]
	},
	device: {
		'1': {
			deviceType: 'Other',
			deviceIcon: 'other.png',
			deviceInfoUrl: '/list-of-ua/device-detail?device=Other'
		},
		'2': {
			deviceType: 'Personal computer',
			deviceIcon: 'desktop.png',
			deviceInfoUrl: '/list-of-ua/device-detail?device=Personal computer'
		},
		'3': {
			deviceType: 'Smartphone',
			deviceIcon: 'phone.png',
			deviceInfoUrl: '/list-of-ua/device-detail?device=Smartphone'
		},
		'4': {
			deviceType: 'Tablet',
			deviceIcon: 'tablet.png',
			deviceInfoUrl: '/list-of-ua/device-detail?device=Tablet'
		},
		'5': {
			deviceType: 'Game console',
			deviceIcon: 'console.png',
			deviceInfoUrl: '/list-of-ua/device-detail?device=Game console'
		},
		'6': {
			deviceType: 'Smart TV',
			deviceIcon: 'smarttv.png',
			deviceInfoUrl: '/list-of-ua/device-detail?device=Smart TV'
		},
		'7': {
			deviceType: 'PDA',
			deviceIcon: 'pda.png',
			deviceInfoUrl: '/list-of-ua/device-detail?device=PDA'
		},
		order: [
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7'
		]
	},
	deviceReg: {
		'1': {
			regexp: /iPad[\s\S]*OS[\s\S]*like Mac OS X/i,
			deviceId: '4'
		},
		'2': {
			regexp: /Nintendo/i,
			deviceId: '5'
		},
		'3': {
			regexp: /Playstation/i,
			deviceId: '5'
		},
		'5': {
			regexp: /PlayBook|RIM Tablet/i,
			deviceId: '4'
		},
		'6': {
			regexp: /Bada\/[0-9\.]+/i,
			deviceId: '3'
		},
		'9': {
			regexp: /^HbbTV/i,
			deviceId: '6'
		},
		'10': {
			regexp: /^Mozilla[\s\S]*Escape [0-9\.]+/i,
			deviceId: '6'
		},
		'11': {
			regexp: /^Mozilla[\s\S]*Linux[\s\S]*Kindle\/[0-9\.]+/i,
			deviceId: '4'
		},
		'12': {
			regexp: /Kindle Fire/i,
			deviceId: '4'
		},
		'13': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*Transformer/i,
			deviceId: '4'
		},
		'14': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*Windows[\s\S]*ARM[\s\S]*Touch/i,
			deviceId: '4'
		},
		'15': {
			regexp: /^Mozilla[\s\S]*SmartHub[\s\S]*Linux/i,
			deviceId: '6'
		},
		'16': {
			regexp: /^Mozilla[\s\S]*SMART\-TV|SMARTTV[\s\S]*Linux/i,
			deviceId: '6'
		},
		'17': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SMARTTVBOX/i,
			deviceId: '6'
		},
		'18': {
			regexp: /^Opera[\s\S]*Linux[\s\S]*HbbTV/i,
			deviceId: '6'
		},
		'19': {
			regexp: /^Mozilla[\s\S]*Chrome[\s\S]*GoogleTV/i,
			deviceId: '6'
		},
		'20': {
			regexp: /AppleTV/i,
			deviceId: '6'
		},
		'21': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SGP311/i,
			deviceId: '4'
		},
		'22': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SGPT12/i,
			deviceId: '4'
		},
		'23': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*Sony Tablet P/i,
			deviceId: '4'
		},
		'24': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SonySGP311/i,
			deviceId: '4'
		},
		'25': {
			regexp: /^Mozilla[\s\S]*Gecko[\s\S]*Firefox[\s\S]*Kylo\/([0-9\.]+)$/i,
			deviceId: '6'
		},
		'26': {
			regexp: /^Mozilla[\s\S]*linux[\s\S]*KFTT[\s\S]*Silk/i,
			deviceId: '4'
		},
		'27': {
			regexp: /^Mozilla[\s\S]*linux[\s\S]*KFOT[\s\S]*Silk/i,
			deviceId: '4'
		},
		'28': {
			regexp: /^Mozilla[\s\S]*Android|Linux[\s\S]*KFJWI[\s\S]*Silk/i,
			deviceId: '4'
		},
		'29': {
			regexp: /^Mozilla[\s\S]*linux[\s\S]*KFJWA[\s\S]*Silk/i,
			deviceId: '4'
		},
		'30': {
			regexp: /j2me/i,
			deviceId: '3'
		},
		'31': {
			regexp: /Obigo[\s\S]*MIDP/i,
			deviceId: '3'
		},
		'32': {
			regexp: /Teleca[\s\S]*MIDP/i,
			deviceId: '3'
		},
		'33': {
			regexp: /^Mozilla[\s\S]*MSIE[\s\S]*Windows[\s\S]* Tablet PC [0-9\.]+/i,
			deviceId: '4'
		},
		'34': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SurfTab/i,
			deviceId: '4'
		},
		'35': {
			regexp: /xbox/i,
			deviceId: '5'
		},
		'36': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*OUYA/i,
			deviceId: '5'
		},
		'37': {
			regexp: /Opera Tablet/i,
			deviceId: '4'
		},
		'38': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*POV_TV-HDMI[\s\S]* Safari/i,
			deviceId: '6'
		},
		'40': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]* Enjoy/i,
			deviceId: '4'
		},
		'41': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SmartTab/i,
			deviceId: '4'
		},
		'42': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*ViewPad 10/i,
			deviceId: '4'
		},
		'43': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*GT\-N8005|N8010|N8013|N8020/i,
			deviceId: '4'
		},
		'44': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*GT\-P1000|P1010|P3100|P3105|P3110|P3113|P5100|P5110|P5113|P5200|P5210|P6200|P6201|P6210|P6211|P6800|P6810|P7110|P7300|P7310|P7320|P7500|P7510|P7511/i,
			deviceId: '4'
		},
		'45': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SPH\-P500/i,
			deviceId: '4'
		},
		'46': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SHW\-M380|M480K|M500|M305/i,
			deviceId: '4'
		},
		'47': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SHV\-E230|E140/i,
			deviceId: '4'
		},
		'48': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SGH\-I957M|I497|I467/i,
			deviceId: '4'
		},
		'49': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*SCH\-I925|I915/i,
			deviceId: '4'
		},
		'50': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*PocketBook A10|PocketBook A7/i,
			deviceId: '4'
		},
		'51': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*Obreey SURFpad/i,
			deviceId: '4'
		},
		'52': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*MZ505|MZ601|MZ603|MZ604|MZ605|MZ606|MZ607|MZ608|MZ609|MZ616|MZ617/i,
			deviceId: '4'
		},
		'53': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*Xoom/i,
			deviceId: '4'
		},
		'54': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*IdeaTab|SmartTabII7|Lenovo A1|K1 Build\/K1/i,
			deviceId: '4'
		},
		'55': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*LG\-F200K|F200L|F200S/i,
			deviceId: '4'
		},
		'56': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*HUAWEI MediaPad/i,
			deviceId: '4'
		},
		'57': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*HTC PG09410/i,
			deviceId: '4'
		},
		'58': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*Nexus 10/i,
			deviceId: '4'
		},
		'59': {
			regexp: /^Mozilla[\s\S]*Android[\s\S]*L-06C Build/i,
			deviceId: '4'
		},
		'60': {
			regexp: /^BlackBerry[0-9]+[\s\S]*Profile\/MIDP/i,
			deviceId: '3'
		},
		'61': {
			regexp: /^Mozilla[\s\S]*hp-tablet[\s\S]*hpwOS[\s\S]*TouchPad/i,
			deviceId: '4'
		},
		'62': {
			regexp: /^Mozilla[\s\S]*Linux[\s\S]*HbbTV/i,
			deviceId: '6'
		},
		'63': {
			regexp: /^Mozilla[\s\S]*Silk[\s\S]*Safari/i,
			deviceId: '4'
		},
		'64': {
			regexp: /^Mozilla[\s\S]*Tizen\/[0-9\.]+/i,
			deviceId: '3'
		},
		'65': {
			regexp: /^Mozilla[\s\S]*Windows Phone[\s\S]*ARM[\s\S]*NOKIA[\s\S]*Lumia 820/i,
			deviceId: '3'
		},
		'66': {
			regexp: /^Mozilla[\s\S]*linux[\s\S]*KFJWI[\s\S]*Silk/i,
			deviceId: '4'
		},
		'67': {
			regexp: /^Mozilla[\s\S]*linux[\s\S]*KFSOWI[\s\S]*Silk/i,
			deviceId: '4'
		},
		'68': {
			regexp: /^Mozilla[\s\S]*linux[\s\S]*KFTHWI[\s\S]*Silk/i,
			deviceId: '4'
		},
		'69': {
			regexp: /^Mozilla[\s\S]*linux[\s\S]*KFTHWA[\s\S]*Silk/i,
			deviceId: '4'
		},
		'70': {
			regexp: /^Mozilla[\s\S]*linux[\s\S]*KFAPWI[\s\S]*Silk/i,
			deviceId: '4'
		},
		'71': {
			regexp: /^Mozilla[\s\S]*linux[\s\S]*KFAPWA[\s\S]*Silk/i,
			deviceId: '4'
		},
		'72': {
			regexp: /^Mozilla[\s\S]*Windows Phone[\s\S]*ARM[\s\S]*NOKIA[\s\S]*Lumia 920/i,
			deviceId: '3'
		},
		'73': {
			regexp: /^Mozilla[\s\S]*PalmOS[\s\S]*WebPro[\s\S]*Palm/i,
			deviceId: '7'
		},
		'74': {
			regexp: /PalmSource[\s\S]*Blazer/i,
			deviceId: '7'
		},
		'75': {
			regexp: /^Mozilla[\s\S]*WebTV[\s\S]*MSIE/i,
			deviceId: '6'
		},
		order: [
			'9',
			'64',
			'65',
			'72',
			'51',
			'52',
			'50',
			'49',
			'47',
			'53',
			'75',
			'46',
			'45',
			'44',
			'43',
			'42',
			'41',
			'40',
			'54',
			'55',
			'74',
			'73',
			'71',
			'70',
			'69',
			'68',
			'66',
			'62',
			'61',
			'59',
			'58',
			'57',
			'56',
			'38',
			'1',
			'23',
			'22',
			'21',
			'10',
			'19',
			'18',
			'17',
			'16',
			'11',
			'15',
			'67',
			'24',
			'25',
			'26',
			'36',
			'34',
			'33',
			'13',
			'48',
			'29',
			'28',
			'27',
			'60',
			'5',
			'3',
			'6',
			'2',
			'12',
			'14',
			'63',
			'20',
			'31',
			'32',
			'37',
			'30',
			'35'
		]
	}
};