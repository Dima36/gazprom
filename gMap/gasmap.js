/*   2DO
	проверить, чтобы от страны было две arc, если и СПГ и pipe
	попробовать посчитать все диаграммы заранее
	split длинные названия стран заранее

	! сдвигать линии относительно круговых диаграмм экспорта?

	scp -i ../ec2rul.pem ./gMap/* ubuntu@54.72.184.190:/var/www/gazprom/gMap
	scp -i ../ec2rul.pem index.html ubuntu@54.72.184.190:/var/www/gazprom
*/

// queque lib
!function(){function n(n){function e(){for(;i=a<c.length&&n>p;){var u=a++,e=c[u],o=t.call(e,1);o.push(l(u)),++p,e[0].apply(null,o)}}function l(n){return function(u,t){--p,null==s&&(null!=u?(s=u,a=d=0/0,o()):(c[n]=t,--d?i||e():o()))}}function o(){null!=s?m(s):f?m(s,c):m.apply(null,[s].concat(c))}var r,i,f,c=[],a=0,p=0,d=0,s=null,m=u;return n||(n=1/0),r={defer:function(){return s||(c.push(arguments),++d,e()),r},await:function(n){return m=n,f=!1,d||o(),r},awaitAll:function(n){return m=n,f=!0,d||o(),r}}}function u(){}var t=[].slice;n.version="1.0.7","function"==typeof define&&define.amd?define(function(){return n}):"object"==typeof module&&module.exports?module.exports=n:this.queue=n}();
gMap={
	//vars
        isEng:false,
		map:{
			width: 1200,
			height: 550,
			arrowLength:8,
			scale:{},
			arcs:{},
			arcsFiltered:{},
			margins:{ top:0, bottom:0, left: 0, right:0},
			countriesSelected:{}
		},
		zapasMin:101,
		legenda1st:true,
		zoom:{},
		chart:{
			svgSize: { width: 1200, height: 310},
			margins:{ top:56, bottom:134, left: 284, chartsGap:150, barsGap:35,axis:16,sameBar:9, zapas:316, right:30},
			svg:{}
		},
		tm:{
			svgSize: { width: 1200, height: 500, fHeight: 1220},
			margins:{ top:80, bottom:40, left: 50, right:50, middle:100 }
		},
		sankey:{
			svgSize: { width: 1200, height: 850},
			margins:{ top:70, bottom:20, left: 50, right:50}
		},
		path2js:'gMap/',
		scripts:['d3.v3.min.js','topojson.v1.min.js','ru_world.js','d3.geo.projection.v0.min.js','sankey3.js','jquery-1.11.1.min.js'],
		styleURL:'gasmap.css',
		k:3, // коэффициент вогнутости дуг
		data:{},
		controls:{},
		vizMode:'map',
		mapMode:'exp',
		mapModes:['exp','imp','zapas'],
		pipeMode:['pipe','spg'],
		mapModeNames:{
            'exp':'Экспорт газа',
            'imp':'Импорт газа',
            'zapas':'Запасы газа'
        },
		countries:[],
		ruNames:{
			'Other':'Другие страны',
			'Other Europe':'Остальная  Европа',
			'Other South and Cental America':'Остальная  Ю.Америка',
			'Other S. and Cent. America':'Остальная  Ю.Америка',
			'Other S. and Central America':'Остальная  Ю.Америка',
			'Other Europe and Eurasia':'Остальная  Евразия',
			'Middle East':'Ближний  Восток',
			'Other Former Soviet Union':'Остальной  экс-СССР',
			'Other Middle East':'Остальной  Бл.Восток',
			'Other Africa':'Остальная  Африка',
			'Other Asia Pacific':'Остальная  ЮВА'
		},
        enNames:{
			'Other':'Other',
			'Other Europe':'Other Europe',
			'Other South and Cental America':'Other South and Cental America',
			'Other S. and Cent. America':'Other S. and Cent. America',
			'Other S. and Central America':'Other S. and Central America',
			'Other Europe and Eurasia':'Other Europe and Eurasia',
			'Middle East':'Middle East',
			'Other Former Soviet Union':'Other Former Soviet Union',
			'Other Middle East':'Other Middle East',
			'Other Africa':'Other Africa',
			'Other Asia Pacific':'Other Asia Pacific'
		},
		continents:{},
		contNames:{
			'1':'ЕВРОПА',
			'2':'АЗИЯ',
			'3':'АМЕРИКА',
			'4':'АФРИКА',
			'5':' ',
			'6':' '
		},
        contNamesEn:{
			'1':'EUROPE',
			'2':'ASIA',
			'3':'AMERICA',
			'4':'AFRICA',
			'5':' ',
			'6':' '
		},
		cpaths:{
			exp:{}, imp:{}
		},
		uiDur:500,
		arcDur:750,
		isTouch:'ontouchstart' in document.documentElement,
		isIE:window.navigator.userAgent.indexOf('MSIE')>-1 ? true : false,
		is1bubbleClick:true,
		isScrolled:false,
		isScrollReset:true,
		isOnMap:false,
		icons:{
			close:"M 0.9375,0 A 1.20012,1.20012 0 0 0 0.34375,2.0625 L 10.625,12.34375 0.34375,22.625 A 1.2043419,1.2043419 0 1 0 2.0625,24.3125 L 12.34375,14.03125 22.625,24.3125 A 1.20012,1.20012 0 1 0 24.3125,22.625 L 14.03125,12.34375 24.3125,2.0625 A 1.2043419,1.2043419 0 1 0 22.625,0.34375 L 12.34375,10.625 2.0625,0.34375 A 1.20012,1.20012 0 0 0 0.9375,0 z"
			,close2:"M 0.51036906,0.01569094 A 0.67741155,0.67741155 0 0 0 0.17522498,1.1798754 L 5.9785092,6.9831602 0.17522498,12.786444 A 0.67979472,0.67979472 0 0 0 1.1453789,13.738959 L 6.9486632,7.9356745 12.751947,13.738959 a 0.67741155,0.67741155 0 1 0 0.952515,-0.952515 L 7.9011778,6.9831602 13.704462,1.1798754 A 0.67979471,0.67979471 0 1 0 12.751947,0.20972184 L 6.9486632,6.0130059 1.1453789,0.20972184 A 0.67741155,0.67741155 0 0 0 0.51036906,0.01569094 z"
			,left:"m 3.86893,3.53382 a 1.25012,1.25012 0 0 0 -0.875,0.4125 l -8.75,7.49998 a 1.25012,1.25012 0 0 0 -0.125,1.75 1.25012,1.25012 0 0 0 0.063,0.125 1.25012,1.25012 0 0 0 0.031,0 1.25012,1.25012 0 0 0 0.062,0 1.25012,1.25012 0 0 0 0.031,0 1.25012,1.25012 0 0 0 0.062,0.125 1.25012,1.25012 0 0 0 0.031,0 1.25012,1.25012 0 0 0 0.062,0 l 8.6875,7.4625 a 1.25012,1.25012 0 0 0 0.625,0.3125 1.25012,1.25012 0 0 0 1,-2.1875 l -6.375,-5.4625 25.09367,0 a 1.25012,1.25012 0 1 0 0,-2.5 l -25.06237,0 6.1874,-5.31248 a 1.25012,1.25012 0 0 0 -0.75,-2.2875 z"
			,toSankey:"m 17.5,-6.25e-6 -0.59375,0.5625 -3.96875,3.96875005 1.15625,1.15625 2.59375,-2.59375 0,10.8750002 1.59375,0 0,-10.8750002 2.59375,2.59375 1.15625,-1.15625 L 18.0625,0.56249375 17.5,-6.25e-6 z M 3.75,1.1562438 3.75,12.031244 1.125,9.4374938 0,10.562494 l 3.96875,3.96875 0.5625,0.5625 0.59375,-0.5625 3.96875,-3.96875 -1.15625,-1.1250002 -2.59375,2.5937502 0,-10.8750002 -1.59375,0 z"
		},
	init: function(){
		gMap.width=window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
		gMap.height=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
		if (!gMap.isResize) {
			gMap.q=queue(1);
			gMap.q.defer(gMap.loadCSS,gMap.styleURL);
			gMap.scripts.forEach(function(d){
				gMap.q.defer(gMap.loadJS,d);
			})
		}
		gMap.q.defer(gMap.initDivCont);
		gMap.q.defer(gMap.loadSVG, gMap.isEng ? 'gasmap3_en.svg' : 'gasmap3.svg','gasMapCont');
		gMap.q.defer(gMap.loadSVG, gMap.isEng ? 'gasfooter2_en.svg' : 'gasfooter2.svg','gasFooter');
		gMap.q.defer(gMap.initMapControls);
		gMap.q.defer(gMap.initMapSvg);
		//gMap.q.defer(gMap.initData);
		gMap.initData();;
		gMap.q.defer(gMap.initMapArcs,'exp')
		gMap.q.defer(gMap.initMapArcs,'imp');
		gMap.mapModes.forEach(function(d){
			gMap.q.defer(gMap.initMapBubbles,d) });
		gMap.q.defer(gMap.draw,true,false);
		gMap.q.defer(gMap.changeMode,'exp');
		gMap.q.defer(function(callback){
				gMap.map[gMap.mapModes[1]].each(function(){ this.parentNode.appendChild(this); });
				callback&&callback();
			});
		gMap.q.defer(gMap.initChartSvg);
		gMap.q.defer(gMap.initCloseTop);
		//gMap.q.defer(gMap.initTreeMaps);
		gMap.q.defer(gMap.initSankey);
		gMap.q.defer(gMap.initSocial);
		gMap.q.defer(gMap.changeViz,'map');
		gMap.q.defer(function(callback){
			d3.select('#loadingDiv').transition().style('opacity',0).remove();
			d3.select('#gasVizAll').transition().style('opacity',1);
			window.onresize=gMap.resize;
			callback&&callback();
		});
		//gMap.thirdpartyScripts.forEach(function(d){ gMap.q.defer(gMap.loadJS,d); })

	},

	loadJS: function(url,callback){
		var jsURL=url[0]=='h' ? url : gMap.path2js+url;
		var js = document.createElement('script');  js.async = true;
		js.onload=function(){callback();};
		js.src = jsURL; js.type='text/javascript';
		document.getElementsByTagName('head')[0].appendChild(js);
		//console.log(js);
	},
	loadCSS: function(url,callback){
		var cssURL=gMap.path2js+url;
		var css= document.createElement('link');  css.async = true;
		css.onload=function(){callback();};
		css.href = cssURL; css.type='text/css'; css.rel='stylesheet';
		document.getElementsByTagName('head')[0].appendChild(css);
		//console.log(css);
	},
	loadSVG: function(filename,divID,callback){
		d3.xml(gMap.path2js+filename, "image/svg+xml", function(xml) {
			console.log(divID)
  			document.getElementById(divID).appendChild(xml.documentElement);
  			callback();
		});
	},
	resize:function(){
		$(window).resize(function () {
		    waitForFinalEvent(function(){
				gMap.isResize=true;
				d3.select('#gasVizAll').attr('id','gasVizAllOld').remove();
				gMap.init();
		    }, 500, "some unique string");
		});
	},

	initDivCont: function(callback){
		var all=d3.select("body").insert('div',"script#gasmap").attr('id','gasVizAll').style('opacity',0);
		var viz=all.append('div').attr('id','gasViz');
		all.append('div').attr('id','gasFooter');
		viz.append('div').attr('id','gasLoading');
		viz.append('div').attr('id','gasMapCont').attr('class','gasVizmap').style('opacity',0);
		viz.append('div').attr('id','gasChart').attr('class','gasVizmap').style('display','none').style('opacity',0);
		viz.append('div').attr('id','gasTreeMap').attr('class','gasViztm').style('display','none').style('opacity',0);
		viz.append('div').attr('id','gasSankey').attr('class','gasVizsankey').style('display','none').style('opacity',0);
		all.append('div').attr('id','gasTopClose');
		gMap.width=Math.max(gMap.map.width,gMap.width);
		//gMap.height=Math.max(gMap.sankey.svgSize.height,gMap.height);
		callback();
	},
	initMapSvg: function(callback){
		if (gMap.width<gMap.map.width) gMap.width=gMap.map.width;
		gMap.map.svg = d3.select("#gasMapCont").select('svg').attr('width',gMap.width).attr('height',gMap.height);
		gMap.map.svg.select('defs').append("svg:clipPath")
	        .attr("id", "gasmapclip")
	        .append("svg:rect")
	        .attr("x", 0)
	        .attr("y", gMap.map.margins.top)
	        .attr("width", gMap.width)
	        .attr("height", gMap.height-gMap.map.margins.top-gMap.map.margins.bottom+98);
	    gMap.map.svg.select('#gasbackcont')
			.append('svg:rect').attr({x:0,y:0,width:gMap.width,height:gMap.height+98,id:'gasback',"clip-path":"url(#gasmapclip)"})
	    gMap.map.svg.select('#gasmaptittle').attr('transform','translate('+((gMap.width-gMap.map.width)/2)+',0)')
	    gMap.map.svg.select('#gaszoom').attr('transform','translate('+((gMap.width-gMap.map.width)/2-20)+',-120)')
	    gMap.map.svg.select('#gascompare').attr('transform','translate('+((gMap.width-gMap.map.width)/2)+','+(gMap.height-775-50)+')')
	    gMap.map.svg.select('#gasmenu').attr('transform','translate('+((gMap.width-gMap.map.width)/2+35)+',-40)')
	    gMap.map.svg.select('#viz_menu').attr('transform','translate('+((gMap.width-gMap.map.width)/2+40+35)+',114) scale(0.85)')
		gMap.map.svg=gMap.map.svg.select('g#gasMapG')
			.attr("clip-path", "url(#gasmapclip)");
		    //.attr("width", gMap.map.width)
		    //.attr("height", gMap.map.height);
    	gMap.map.svg.append("svg:rect").attr('opacity',0).attr('id','chartOpaBack')
	        .attr("x", 0)
	        .attr("y", gMap.map.margins.top)
	        .attr("width", gMap.width)
	        .attr("height", gMap.map.height);

	    d3.select('#chartMinimize').attr('transform','translate('+((gMap.width)/2)+','+gMap.height+') ').style('opacity',0);

		gMap.map.projection = d3.geo.naturalEarth() //d3.geo.mercator()
		    .center([10, 20 ])
		    .translate([gMap.width/2,(gMap.height)/2])
		    .scale(200)
		    //.translate(gMap.map.width/2,gMap.map.height/2)
        	.precision(1);
		gMap.map.path = d3.geo.path()
		    .projection(gMap.map.projection);
	    gMap.map.t = gMap.map.projection.translate(); // the projection's default translation
	    gMap.map.s = gMap.map.projection.scale() // the projection's default scale
	    gMap.map.eventScale=1;
	    gMap.map.eventTranslate=gMap.map.t;
	    gMap.map.zoom=d3.behavior.zoom().on("zoom", gMap.redraw).scaleExtent([1, 5])
		var drag = d3.behavior.drag()
		    //.origin(function(d) { return d; })
		    .on("dragstart", function(){ d3.select(this).classed('mapMove',true); })
		    .on("dragend", function(){ d3.select(this).classed('mapMove',false); });

		gMap.map.svg.call(gMap.map.zoom);
		gMap.map.svg.call(drag);
		gMap.map.paths=gMap.map.svg.append('g').attr('id','gMapPaths');
		gMap.map.paths.selectAll("path")
			.data(topojson.feature(gasworld, gasworld.objects.countries).features)
			.enter().append("svg:path").attr('class','countries').attr('id',function(d){return d.id.replace(/ /g,'_')})
			.attr("d", gMap.map.path)
			.on('mouseover',function(d){
					if (gMap.mapMode!=gMap.mapModes[2]) {
						var bars=false;
						var bars2=false;
						var sum, sums, y, y1, y2, that;
						if (gMap.gasBars) bars=gMap.gasBars.filter(function(dd){ return dd.country==d.id});
						if (gMap.spgBars) bars2=gMap.spgBars.filter(function(dd){ return dd.country==d.id});
						if (bars&&bars[0].length>0) {
							bars.each(function(dd){ d.that1=this; sum=dd.sum; sums=dd.sums; y1=dd.y1; y2=dd.y2; })
							d.barTexts=bars.selectAll('text').classed('active_'+gMap.mapMode,true);
							d.barLines=bars.selectAll('line').classed('active',true);

						}
						if (bars2&&bars2[0].length>0) {
							bars2.each(function(dd){ d.that2=this; sum=dd.sum; sums=dd.sums; y1=dd.y1; y2=dd.y2; })
							d.bar2Texts=bars2.selectAll('text').classed('active_'+gMap.mapMode,true);
							d.bar2Lines=bars2.selectAll('line').classed('active',true);
						}
						if (sums) {
							console.log('sums',d.that1,sums[0],y1,true,sums[1],y2);
							gMap.chartPopup(d.that1,sums[0],y1,true,sums[1],y2);
						}
						if (sum) {
							console.log('sum',d.that1,d.that2,sum,y1,y2);
							y1&&gMap.chartPopup(d.that1,sum,y1);
							y2&&gMap.chartPopup(d.that2,sum,y2);
						}
						if (!d.newMode) d.newMode=gMap.mapMode==gMap.mapModes[0] ? gMap.mapModes[1] : gMap.mapModes[0];
						//console.log(dd.name,d.id)
						if (!d.thatBubble) d.thatBubble=gMap.map[d.newMode].selectAll('g').filter(function(dd){ return dd.name==d.id;});
						if ((bars&&bars[0].length>0)||(bars2&&bars2[0].length>0)) gMap.chartCountryHover(d.id,true,d.thatBubble);
					}
				})
			.on('mouseout',function(d){
					if (gMap.mapMode!=gMap.mapModes[2]) {
						if (d.barLines) {
							d.barTexts.classed('active_'+gMap.mapMode,false);
							d.barLines.classed('active',false);
							gMap.chartPopup(d.that1);
						}
						if (d.bar2Lines) {
							d.bar2Texts.classed('active_'+gMap.mapMode,false);
							d.bar2Lines.classed('active',false);
							gMap.chartPopup(d.that2);
						}
						gMap.chartCountryHover(d.id,false,d.thatBubble);
					}
				})

		gMap.map.arc=d3.svg.arc()
	        .innerRadius(function(d) {
	        	//console.log(d)
	        	gMap.calcArcs(d);
	        	if (typeof (d.endAngle) == "undefined") d.endAngle=d.alfa1;
	        	if (typeof (d.startAngle) == "undefined") d.startAngle=d.alfa2;
	            return d.r;
	        })
	        .outerRadius(function(d) {return d.r; })
	        .startAngle(function(d) { return d.reverse ? d.alfa1 : d.startAngle; })
	        .endAngle(function(d) { return d.reverse ? d.endAngle : d.alfa2; });

	    callback&&callback();
	},
	initChartSvg: function(callback){
		//console.log('chartSVG')
		//gMap.chart.svg = gMap.map.svg.append('g')
		gMap.chart.svg = d3.select('#gasChart').append('svg')
		    .attr("width", gMap.chart.svgSize.width)
		    .attr("height", 0)

			//.attr('transform','translate(0,'+( gMap.height )+')');
		gMap.chart.svg.append('svg:rect').attr({x:0,y:0,width:gMap.width,height:gMap.chart.svgSize.height,id:'gaschartback'});
		gMap.close=gMap.chart.svg.append('g')
			.on('click',gMap.closeChartClick)
			.attr('transform','translate('+(gMap.chart.svgSize.width-gMap.chart.margins.right+5)+','+14+')')
			.attr('class','tmClose2');
		gMap.close.append('svg:rect').attr({x:-3,y:-3,width:37,height:37,opacity:0});
		gMap.close.append('svg:path').attr({d:gMap.icons.close,class:'closePath'});
		gMap.close.append('svg:path').attr({d:gMap.icons.left,class:'leftPath'});
		gMap.chart.svg.append('g').attr('id','chartMinChartCont');
		//gMap.chart.svg = gMap.chart.svg.append('g');
		callback&&callback();

	},
	closeChartClick:function(){
		var cur=gMap.close.classed('leftArrow');
		var newMode;
		if (cur) newMode=gMap.mapModes[2]
		else newMode=gMap.mapMode==gMap.mapModes[2] ? gMap.mapModes[0] : gMap.mapMode;
		gMap.changeMode(newMode);
		if (cur) gMap.close.classed('leftArrow',!cur);
	},
	initMapControls:function(callback){
		//var vizMenu=d3.select('#viz_menu').selectAll('g').data(['map','sankey']);
		d3.select('#viz_menu').on('click',function(d){gMap.changeViz('sankey');});
		d3.selectAll('.gasmenuitem.gas'+gMap.mapMode).classed('active',true);
		d3.selectAll('.gasmenudropdown').style('opacity',0).attr('pointer-events','none');
		d3.selectAll('.gasmenuitem')
			.data(gMap.mapModes)
			.on('mouseover',function(d){
					d3.select(this).classed('active',true);
					if (d==gMap.mapMode&&d!=gMap.mapModes[2]) {
						d3.select('#gasmenu'+d+'down').transition().style('opacity',1).attr('pointer-events',null);
						gMap.legenda1st=false;
						gMap.legenda1stDel=true;
					}
				})
			.on('mouseout',function(d){
					if (d!=gMap.mapMode) d3.select(this).classed('active',false);
					if (d==gMap.mapMode&d!=gMap.mapModes[2]) {
						d3.select('#gasmenu'+d+'down').transition().style('opacity',0).attr('pointer-events','none');
					}
				})
			.on('click',function(d){
				//console.log(this);
					//d3.select(this).transition().classed('active',true);
					gMap.changeMode(d);
				});
		d3.select('#gascompare').on('click',function(){gMap.changeViz('tm');});

        d3.select('#en-lang').on('click', function(){
            gMap.isEng = ! gMap.isEng;
            d3.select('#gasVizAll').remove(); gMap.init();
        });

        d3.select('#ru-lang').on('click', function(){
            gMap.isEng = ! gMap.isEng;
            d3.select('#gasVizAll').remove(); gMap.init();
        });

		d3.selectAll('.gascheckboxtick').classed('active',true)
		d3.selectAll('.gascheckboxrect')
			//.each(function(d){d=+this.id.replace('gascheckbox','')})
			.on('click',function(d){
				//console.log(this);
				var changeMode=d3.select(this).classed('gaspipe') ? 'gaspipe' : 'gasspg';
				var isCheck=d3.select('#gascheckboxtick'+this.id.replace('gascheckbox','')).classed('active');
				d3.selectAll('.gascheckboxtick.'+changeMode).classed('active',!isCheck);
				gMap.changePipeMode(changeMode,!isCheck);
				d3.event.stopPropagation();
			})
	    gMap.zoom.y=d3.scale.pow().exponent(0.01)
		    .domain([1, 5])
		    .range([0, -77]);
		gMap.zoom.slider=d3.select('#gaszoomslider');
		d3.select('#gaszoomminus').on('click',function(){gMap.zoomByFactor(0.67)});
		d3.select('#gaszoomplus').on('click',function(){gMap.zoomByFactor(1.5)});
		callback&&callback();
	},
	initSocial:function(callback){
		var url=document.URL,
			title=document.title,
			img='gMap/screenshot.png',
			desc=gMap.isEng ? 'Who, to whom, from whom, and how much gas buys and sells' : 'Кто, кому, у кого и сколько газа продает и покупает';

		d3.select('#shareFB').on('click',function(){
			//var url='http://www.facebook.com/sharer.php';
			//var url='http://www.facebook.com/sharer.php?s=100&p[url]=http://54.72.184.190&p[images][0]=http://54.72.184.190/gMap/screenshot.png&p[title]=Мировой газовый рынок';
			//window.open(url, 'Мировой газовый рынок', 'toolbar=0, status=0, width=548, height=325');
			gMap.share.facebook(url,title,img,desc)
		})

		//attr('xlink:href','http://www.facebook.com/sharer.php?u=http://54.72.184.190&media=http://54.72.184.190/gMap/screenshot.png&description=Мировой газовый рынок')
		d3.select('#shareVK').on('click',function(){
			gMap.share.vkontakte(url,title,img,desc)
		})
		d3.select('#shareTW').on('click',function(){
			gMap.share.twitter(url,title)
		})
		callback&&callback();
	},
	initData:function(callback){
		gMap.q.defer(function(callback1){
			d3.tsv(gMap.path2js+'gasexport.tsv',function(error,data){
				console.log(error,data);
				gMap.data.exp={};
				gMap.data.imp={};
				for(var c in data[0])
					if (c!='To') gMap.data.exp[c]={to:{},gas:0}
					//this.allCountries.push(c);
				data.forEach(function(d){
					//console.log(d);
					gMap.data.imp[d.To]={from:{},gas:0};
					for (c in d) {
						if (+d[c]>0) {
							//console.log(c,d.To,d[c]);
							if (c!='To') {
								gMap.data.exp[c].to[d.To]={gas:+d[c]};
								gMap.data.exp[c].gas+=+d[c];
								gMap.data.imp[d.To].from[c]={gas:+d[c]};
								gMap.data.imp[d.To].gas+=+d[c];
							}
						}
					}
				})
				callback1();
			})
		})
		gMap.q.defer(function(callback4){
			d3.tsv(gMap.path2js+'spgexport.tsv',function(error,data){
				//console.log(error,data);

				for(var c in data[0])
					if (c!='To') {
						if (!gMap.data.exp[c]) gMap.data.exp[c]={to:{},spg:0}
							else gMap.data.exp[c].spg=0;
					}
				data.forEach(function(d){
					//console.log(d);
					if (!gMap.data.imp[d.To]) gMap.data.imp[d.To]={from:{},spg:0}
						else gMap.data.imp[d.To].spg=0;;
					for (c in d) {
						if (+d[c]>0) {
							//console.log(c,d.To,d[c]);
							if (c!='To') {
								if (!gMap.data.exp[c].to[d.To]) gMap.data.exp[c].to[d.To]={};
								gMap.data.exp[c].to[d.To].spg=+d[c];
								gMap.data.exp[c].spg+=+d[c];
								if (!gMap.data.imp[d.To].from[c]) gMap.data.imp[d.To].from[c]={};
								gMap.data.imp[d.To].from[c].spg=+d[c];
								gMap.data.imp[d.To].spg+=+d[c];
							}
						}
					}
				});
				var cc,direction;
				['exp','imp'].forEach(function(d){
					direction=(d=='exp' ? 'to' : 'from');
					for (var c in gMap.data[d]) {
						cc=gMap.data[d][c];
						cc.sum=(cc.gas||0)+(cc.spg||0)
						for (var ccc in cc[direction])
							cc[direction][ccc].sum=(cc[direction][ccc].gas||0)+(cc[direction][ccc].spg||0)
					}
				})
				callback4();
			})
		})
		gMap.q.defer(function(callback2){
			d3.tsv(gMap.path2js+'gaszapas.tsv',function(error,data){
				//console.log(error,data);
				gMap.data.zapas={};
				other=0;
				data.forEach(function(d){
					if (+d.zapas>=gMap.zapasMin) gMap.data.zapas[d.country]={sum:+d.zapas}
						else other+=+d.zapas
				})
				gMap.data.zapas['Other']={sum:other};
				callback2();
			})
		})
		gMap.q.defer(function(callback3){
			d3.tsv(gMap.path2js+'centroids3.tsv',function(error,data){
				//console.log(error,data);
				data.forEach(function(d){
					//console.log(d.SHORT_NAME,gMap.data.exp[d.SHORT_NAME])
					if(gMap.data.exp[d.SHORT_NAME])
						gMap.data.exp[d.SHORT_NAME].coords=[+d.LONG,+d.LAT]
					for(var c in gMap.data.exp)
						if (gMap.data.exp[c].to[d.SHORT_NAME])
							gMap.data.exp[c].to[d.SHORT_NAME].coords=[+d.LONG2,+d.LAT2];
					if(gMap.data.imp[d.SHORT_NAME])
						gMap.data.imp[d.SHORT_NAME].coords=[+d.LONG,+d.LAT]
					for(c in gMap.data.imp)
						if (gMap.data.imp[c].from[d.SHORT_NAME])
							gMap.data.imp[c].from[d.SHORT_NAME].coords=[+d.LONG2,+d.LAT2];
					if(gMap.data.zapas[d.SHORT_NAME])
						gMap.data.zapas[d.SHORT_NAME].coords=[+d.LONG,+d.LAT];
					gMap.ruNames[d.SHORT_NAME]=d.RU_NAME;
                    gMap.enNames[d.SHORT_NAME]=d.SHORT_NAME;

					gasworld.objects.countries.geometries.forEach(function(g){
						if (g.properties.ISO2==d.ISO3136&&g.id!=d.SHORT_NAME) console.log(g.id,d.SHORT_NAME);
					})


				})
				//for (c in gMap.data.zapas)
				//	for (cc in gMap.data.exp[c].to)
				//		console.log(cc,gMap.data.exp[c].to[cc].coords,gMap.data.exp[c].to[cc].value);
				//		console.log(c,gMap.data.zapas[c].coords);
				callback3();
			})

		})
		gMap.q.defer(function(callback4){
			d3.tsv(gMap.path2js+'continents.tsv',function(error,data){
				//console.log(error,data);
				data.forEach(function(d){
					gMap.continents[d.country]=d.continent;
				})
				gMap.continents['Other']='6';
				callback4();
			})
		})
		//callback();
	},
	initMapBubbles:function(type,callback){
		var expArr=[];
		for (var c in gMap.data[type])
			if (gMap.data[type][c].coords&&gMap.data[type][c].sum)
				expArr.push({ 	name:c,
								coords:gMap.data[type][c].coords,
								sum:gMap.data[type][c].sum,
								pipe: gMap.data[type][c].gas ? gMap.data[type][c].gas : 0,
								spg: gMap.data[type][c].spg ? gMap.data[type][c].spg : 0});
		gMap.map.scale[type] = d3.scale.linear()
                            .domain([d3.min(expArr,function(d){return d.sum}),d3.max(expArr,function(d){return d.sum})])
                            .range([2, 40]);
        //console.log(expArr);
		gMap.map[type]=gMap.map.svg.append('g').attr('id','gMap'+type);
		gMap.map[type].selectAll('g')
			.data(expArr).enter()
			.append("g")
		        .attr("class","gasbubbles "+type+"_bubbles hover")
				.classed('zapas_bubble_clickable',function(d){
						if (type!=gMap.mapModes[2]) return false;
						d.thatBubble=gMap.map[gMap.mapModes[0]].selectAll('g').filter(function(dd){ return dd.name==d.name;});
						d.clickable=gMap.data[gMap.mapModes[0]][d.name]&&gMap.data[gMap.mapModes[0]][d.name].coords&&gMap.data[gMap.mapModes[0]][d.name].sum>0;
						return d.clickable;
					})
		        .on(gMap.isIE ? 'mousedown' : 'click',function(d){
			        	if (gMap.mapMode!=gMap.mapModes[2]) gMap.clickBubble(d.name,this)
			        	else if (d.clickable) {
							gMap.changeMode(gMap.mapModes[0]);
							gMap.clickBubble(d.name,d.thatBubble,true);
							gMap.close.classed('leftArrow',true);
			        	}
			        })
		        .on('mouseover',function(d){
		        		//console.log(d,d.name)
		        		if (!gMap.isIE) this.parentNode.appendChild(this);
			        	d3.select(this).classed("hover",true);
			        	gMap.highlightCountries(d.name,true);
			        	//d3.select(this.parentNode).select('text').style('display',null);
			        	if (gMap.isTouch)
			        		if (gMap.mapMode!=gMap.mapModes[2]) gMap.clickBubble(d.name,this);
			        	if (gMap.mapMode==gMap.mapModes[2]) {
							var bars=false;
							var sum, sums, y1, that;
							if (gMap.zapasBars) bars=gMap.zapasBars.filter(function(dd){ return dd.country==d.name});
							if (bars&&bars[0].length>0) {
								bars.each(function(dd){ d.that1=this; sum=dd.sum; y1=dd.y; })
								d.barTexts=bars.selectAll('text').classed('active_'+gMap.mapMode,true);
								d.barLines=bars.selectAll('line').classed('active',true);
							}
							console.log('sum',d.that1,d.that2,sum,y1);
							y1&&gMap.chartPopup(d.that1,sum,y1);
			        	}

			        })
		        .on('mouseout',function(d){
			        	d3.select(this).classed("hover",false)
			        	if (d.name!=gMap.countries[0]&&d.name!=gMap.countries[1])
			        		gMap.highlightCountries(d.name,false);;
			        	//d3.select(this.parentNode).select('text').style('display','none');
						if (d.barLines) {
							d.barTexts.classed('active_'+gMap.mapMode,false);
							d.barLines.classed('active',false);
							gMap.chartPopup(d.that1);
						}
			        })
		        .append("svg:circle").attr('r',0).attr('class','bubble_circle');
		gMap.map[type].selectAll('g').filter(function(d){return gMap.map.scale[type](d.sum)<12; }).append('circle').attr('r',12).attr('class','bubble4click');
		gMap.map[type].selectAll('g').append('circle').attr('r',1.5).attr('class','country_dot');
		gMap.map[type].selectAll('g').append('svg:text').attr('class','country_label label_name')
			.text(function(d) {return gMap.isEng ? gMap.enNames[d.name] : gMap.ruNames[d.name]; })
			.attr('dx',function(d){
				return -8;})
			.attr('dy',function(d){ return -10-6;});
		gMap.map[type].selectAll('g').append('svg:text').attr('class','country_label label_value')
			.text(function(d) {return (''+Math.round(10*d.sum)/10).replace('.',','); })
			.attr('dx',function(d){
				return +7;})
			.attr('dy',function(d){ return -10-5.5;});
		gMap.map[type].selectAll('g').append('svg:text').attr('class','country_label label_unit')
			.text(gMap.isEng ? 'bln м³' : 'млрд м³')
			.attr('dx',function(d){
				return +7;})
			.attr('dy',function(d){ return -10-6+11;});
		gMap.map[type].selectAll('g').append('svg:rect')
			.attr({class:'country_label label_name_rect',height:20})
			.attr('width',function(d){
				//console.log(this,this.parentNode,this.parentNode.children)
				//d.textWidth=this.parentNode.children[2].getBBox().width;
				d.textWidth=this.previousElementSibling.previousElementSibling.previousElementSibling.getBBox().width;
				//console.log(d.textWidth)
				return d.textWidth+14; })
			.attr('x',function(d){return -d.textWidth-14; })
			.attr('y',function(d){return -20-10; })
		gMap.map[type].selectAll('g').append('svg:rect')
			.attr({class:'country_label label_value_rect',height:30})
			.attr('width',function(d){
				//console.log(this.parentNode.children[4],this.parentNode.children[4].getBBox())
				var t2=this.previousElementSibling.previousElementSibling;
				var t1=t2.previousElementSibling;
				d.valueWidth=Math.max(t1.getBBox().width,t2.getBBox().width)
				return d.valueWidth+14; })
			.attr('x',function(d){return 0; })
			.attr('y',function(d){return -20-10; });
		gMap.map[type].selectAll('g').selectAll('text').each(function(){this.parentNode.appendChild(this); })
		gMap.map[type].selectAll('g').classed('hover',false)
		callback();
	},
	clickBubble:function(country,that,isSelD3){
		var sel;
		if (isSelD3) sel=that
			else sel=d3.select(that);
		console.log(sel);
		//window.scrollBy(0,100);
		if (gMap.legenda1st) {
			gMap.legenda1st=false;
			gMap.legenda1stDel=true;
			setTimeout(function(){d3.select('#gasmenu'+gMap.mapMode+'down').transition().style('opacity',1).attr('pointer-events',null);},1000);
		}
		var isExpImp=(gMap.mapMode==gMap.mapModes[0]||gMap.mapMode==gMap.mapModes[1]);
		if (country==gMap.countries[0]||country==gMap.countries[1]) {
	    	if (isExpImp) gMap.showArcs(gMap.mapMode,country,false);
			sel.classed("active",false);
			if (country==gMap.countries[0]) {
				if (gMap.countries[1]) gMap.countries[0]=gMap.countries[1]
					else gMap.countries.splice(0,1);
			}
			gMap.countries.splice(1,1);
		} else {
			sel.classed("active",true);
	    	if (isExpImp) gMap.showArcs(gMap.mapMode,country,true);
			if (!gMap.countries[0]&&!gMap.countries[1]) gMap.countries[0]=country
				else if (gMap.countries[0]&&!gMap.countries[1]) gMap.countries[1]=country
					else if (gMap.countries[0]&&gMap.countries[1]) {
							if (gMap.mapMode==gMap.mapModes[0]||gMap.mapMode==gMap.mapModes[1]) {
								gMap.showArcs(gMap.mapMode,gMap.countries[0],false);
							}
							gMap.countries[0]=gMap.countries[1];
							gMap.countries[1]=country;

							gMap.map[gMap.mapMode].selectAll('g').classed("active",function(d){
								if (d.name==gMap.countries[0]||d.name==gMap.countries[1])
									return true
								else return false;
							})
						}
		}
		gMap.highlightCountries();
		gMap.initChart();
		//document.getElementById("gasmenu").scrollIntoView(true);
	},
	chartCountryHover:function(country,isShow,bubble){
		var isDisplay=isShow ? 'none' : null;
		var isDisplay2=!isShow ? 'none' : null;
		//console.log(country,bubble.select('rect.label_name_rect'))
		gMap.map.paths.select('#'+country.replace(/ /g,'_')).classed('active_chart',isShow);
		bubble.selectAll('.country_label').style('display',isDisplay);
		bubble.selectAll('circle').style('display',null);
		bubble.select('rect.label_name_rect').style('display',null);
		bubble.select('text.label_name').style('display',null);
		bubble.classed('hover',isShow);
	},
	highlightCountries:function(country,isShow){
		console.log(country,gMap.countries.length)
		if (country) {
			gMap.map.paths.select('#'+country.replace(/ /g,'_')).classed('active',function(){
				this.parentNode.appendChild(this);
				return isShow;
			});
			return;
		};

		if (gMap.countries.length==0) {
			gMap.map.paths.selectAll("path").attr('class','countries');
			return;
		}
		gMap.map.paths.selectAll("path").attr('class','countries');
		gMap.countries.forEach(function (country) {
	    	gMap.pipeMode.forEach(function (type) {
				gMap.map.countriesSelected[gMap.mapMode][country][type]
						.classed('active_'+gMap.mapMode,true)
						.each(function(){ this.parentNode.appendChild(this); });
			});
		})
		gMap.countries.forEach(function (country) {
			gMap.map.paths.select('#'+country.replace(/ /g,'_')).classed('active',function(){
				this.parentNode.appendChild(this);
				return true
			});
		})
	},
	scroll:function(isDown){
		gMap.chart.svg.transition().duration(gMap.uiDur).attr('transform','translate(0,'+(isDown ? gMap.height-gMap.chart.svgSize.height : gMap.height )+')');
		d3.select('#gasmapclip').transition().duration(gMap.uiDur).attr("height", isDown ? gMap.height-gMap.chart.svgSize.height : gMap.height);
		d3.select('#gasback').transition().duration(gMap.uiDur).attr("height", isDown ? gMap.height-gMap.chart.svgSize.height : gMap.height);
	    d3.select("#gasMapCont").select('svg').transition().duration(gMap.uiDur)
	    	.attr('width',gMap.width).attr('height',isDown ? gMap.height-gMap.chart.svgSize.height : gMap.height);
	    d3.select("#gasChart").select('svg').transition().duration(gMap.uiDur)
	    	.attr('width',gMap.chart.svgSize.width).attr('height',isDown ? gMap.chart.svgSize.height : 0)
	    	.style('opacity',isDown ? 1 : 0);
	    d3.select("#chartOpaBack").transition().duration(gMap.uiDur).attr('width',gMap.width).attr('height',isDown ? gMap.height-gMap.chart.svgSize.height : gMap.height);

		gMap.isScrolled=isDown;
		if ((!isDown)&&gMap.isScrollReset) { gMap.isScrollReset=false; isDown=true; }
		if (gMap.isScrollReset) {
			d3.select('#gasmaptittle').transition().duration(gMap.uiDur).attr('transform','translate('+((gMap.width-gMap.map.width)/2)+','+(isDown ? -125 : 0)+')')	;
			d3.select('#viz_menu').transition().duration(gMap.uiDur).attr('transform','translate('+((gMap.width-gMap.map.width)/2+40+35)+','+(isDown ?  16 : 114)+') scale(0.85)')	;
			d3.select('#gasmenu').transition().duration(gMap.uiDur).attr('transform','translate('+((gMap.width-gMap.map.width)/2+35)+','+(isDown ? -138 : -40)+')')	;
			d3.select('#gaszoom').transition().duration(gMap.uiDur).attr('transform',
				'translate('+((gMap.width-gMap.map.width)/2-20)+','+(isDown ? -120-gMap.chart.svgSize.height/2 : -120)+')')	;
			d3.select('#gasMapG').transition().duration(gMap.uiDur).attr('transform','translate(0,'+(isDown ? -98 : 0)+')')
		}
		//d3.select('#gasMapG').transition().duration(gMap.uiDur).attr('transform','translate(0,'+(isDown ? -150 : 0)+')')	;
		gMap.draw(true,true);
	},
	moveSlider:function(scale){
		gMap.zoom.slider.attr('transform','translate(0,'+(gMap.zoom.y(scale))+')')
		//
	},
	changePipeMode:function(mode,check){
		mode=mode.replace('gas','');
		if (check) gMap.pipeMode.push(mode)
			else gMap.pipeMode.splice(gMap.pipeMode.indexOf(mode),1);
		d3.selectAll('.arc_'+mode).transition().style('opacity',check ? 1 : 0);
		gMap.countries.forEach(function(c){
			gMap.map.countriesSelected[gMap.mapMode][c][mode].classed('active_'+gMap.mapMode,check);
		});
		gMap.calcBubbles();
	},
	calcBubbles:function(){
		var sumName=(gMap.pipeMode.length>1||gMap.mapMode==gMap.mapModes[2]) ? 'sum' : gMap.pipeMode[0];
		gMap.map[gMap.mapMode].selectAll('.bubble_circle')
			.transition().duration(gMap.uiDur)
			.attr("r", function(d){ return (d.r=gMap.map.scale[gMap.mapMode](d[sumName])); });
		gMap.map[gMap.mapMode].selectAll('.label_value').text(function(d){return (''+Math.round(10*d[sumName])/10).replace('.',',')})
	},
	showTreemap:function(){
		d3.select('#gasMapCont').transition().duration(gMap.uiDur*2).style('opacity',0);
		d3.select('#gasChart').transition().duration(gMap.uiDur*2).style('opacity',0);
		d3.select('#gasTreeMap').style('opacity',0).style('display',null).transition().duration(gMap.uiDur*2).style('opacity',1);
	},
	showSankey:function(){
		d3.select('#gasTreeMap').transition().duration(gMap.uiDur*2).style('opacity',0);
		d3.select('#gasSankey').style('opacity',0).style('display',null).transition().duration(gMap.uiDur*2).style('opacity',1);
	},
	showArcs:function(mode,country,isShow){
		var arcs=country ? gMap.map.arcsFiltered[mode][country] : gMap.map.arcs[mode].selectAll('g') ;
		//console.log(arcs)
		if (isShow) {
			//arcs.style('display',null);
			arcs.select('path').transition()
		        //.attrTween("stroke-dasharray", gMap.tweenDashRev)
		        .call(gMap.arcTween,1)
		        .duration(gMap.arcDur);
		    arcs.style('display',null);
		    setTimeout(function(){
		    	if (mode==gMap.mapModes[0]) arcs.select('circle').classed('active',true);
		    },mode==gMap.mapModes[0] ? gMap.arcDur : 0);
		} else {
			arcs.select('path').transition()
		        //.attrTween("stroke-dasharray", gMap.tweenDashRev)
		        .call(gMap.arcTween,0)
		        .duration(gMap.arcDur/2);
		    setTimeout(function(){
		    	//console.log(mode,country)
		    	if (mode==gMap.mapModes[0]) arcs.select('circle').classed('active',false);
		    },mode==gMap.mapModes[0] ? 0 : gMap.arcDur/2);
		    setTimeout(function(){
		    		arcs.style('display','none')
		    	},gMap.arcDur/2);

		}
	},
	initChart:function(){
		gMap.spgBars=false;
		gMap.gasBars=false;
		if (gMap.countries.length>0||gMap.mapMode==gMap.mapModes[2]) {
			gMap.showChart(1);
			//gMap.chart.svg=d3.select('#gasChartSvg').append('g').style('opacity',0).transition().duration(gMap.uiDur).style('opacity',1);
			if (gMap.mapMode!=gMap.mapModes[2]) {
				if(gMap.countries.length==1){
					var gasArr=[], spgArr=[], zapas=[], a;
					d3.entries(gMap.data[gMap.mapMode][gMap.countries[0]][gMap.mapMode=='exp' ? 'to' : 'from']).forEach(function(d){
						a={country:d.key,sum:d.value.sum}
						if (d.value.gas) gasArr.push(a);
						if (d.value.spg) spgArr.push(a);
					})
					//console.log(gasArr,spgArr)
					gMap.initChart1(gasArr,spgArr);
				} else {
					var c2={},arr=[],cont={};
					for(var i=0;i<2;i++){
						d3.entries(gMap.data[gMap.mapMode][gMap.countries[i]][gMap.mapMode=='exp' ? 'to' : 'from']).forEach(function(d){
							if (!c2[d.key]) c2[d.key]=[0,0];
							c2[d.key][i]=d.value.sum;
						})
					}
					arr=d3.entries(c2).map(function(d){
						if (!cont[+gMap.continents[d.key]]) cont[+gMap.continents[d.key]]=0;
						cont[+gMap.continents[d.key]]++;
						return {country:d.key,sums:d.value}
					});
					arr.sort(function(a,b){
						//console.log(('_'+gMap.continents[a.country]+gMap.ruNames[a.country])>('_'+gMap.continents[b.country]+gMap.ruNames[b.country]),('_'+gMap.continents[a.country]+gMap.ruNames[a.country]),('_'+gMap.continents[b.country]+gMap.ruNames[b.country]))
						//if (typeof gMap.continents[a.country] == "undefined") console.log(a.country)
						if (gMap.continents[a.country]>gMap.continents[b.country]) return 1;
						if (gMap.continents[a.country]<gMap.continents[b.country]) return -1;
						var res=(gMap.isEng ? gMap.enNames[a.country] : gMap.ruNames[a.country])>(gMap.isEng ? gMap.enNames[b.country] : gMap.ruNames[b.country]);
						return res ? 1 : -1;
					})
					//console.log(arr,d3.entries(cont));
					gMap.initChart2(arr,d3.entries(cont));
				}
			} else {
				var cont={},
					arr=d3.entries(gMap.data[gMap.mapMode]).map(function(d){
						if (!cont[+gMap.continents[d.key]]) cont[+gMap.continents[d.key]]=0;
						cont[+gMap.continents[d.key]]++;
						return {country:d.key,sum:d.value.sum}
					})
				arr.sort(function(a,b){
					//console.log(('_'+gMap.continents[a.country]+gMap.ruNames[a.country])>('_'+gMap.continents[b.country]+gMap.ruNames[b.country]),('_'+gMap.continents[a.country]+gMap.ruNames[a.country]),('_'+gMap.continents[b.country]+gMap.ruNames[b.country]))
					//if (typeof gMap.continents[a.country] == "undefined") console.log(a.country)
					if (gMap.continents[a.country]>gMap.continents[b.country]) return 1;
					if (gMap.continents[a.country]<gMap.continents[b.country]) return -1;
					var res=(gMap.isEng ? gMap.enNames[a.country] : gMap.ruNames[a.country])>(gMap.isEng ? gMap.enNames[b.country] : gMap.ruNames[b.country]);
					return res ? 1 : -1;
				})
				//console.log(arr);
				gMap.initChartZapas(arr,d3.entries(cont))
			}
		} else gMap.showChart(0);
		if (!gMap.isOnMap) gMap.showMinimize(0);
	},
	initChart1:function(gasArr,spgArr){
		//console.log('chart1!',gasArr,spgArr)
		var chart=gMap.chart.svg.select('#all_chart')
		var y1=gMap.chart.svgSize.height-gMap.chart.margins.bottom,
			x1=gMap.chart.margins.barsGap*(gasArr.length-1),
			x1delta=gasArr.length>1 ? 0 : gMap.chart.margins.barsGap,
			x2=gMap.chart.margins.barsGap*(spgArr.length-1),
			chartsGap=gMap.chart.margins.chartsGap,
			xDelta=(gMap.chart.svgSize.width-x1-x2-x1delta-chartsGap-gMap.chart.margins.left-gMap.chart.margins.right);
		console.log(xDelta);
		if (xDelta<0) ;//!!!;
		if (xDelta<80&&xDelta>=0) chartsGap-=(80-xDelta);
		xDelta=gMap.chart.svgSize.width-x1-x2-x1delta-chartsGap-gMap.chart.margins.left-gMap.chart.margins.right;
		if (xDelta<0) {
			chartsGap=chartsGap/2;
			xDelta=0;
		};
		if (gasArr.length>0&&spgArr.length>0) xDelta=xDelta/2;
		if (xDelta>100) xDelta=100;
		//console.log(xDelta);
		var left=gMap.chart.margins.left+xDelta;
			chartsGap+=xDelta;
		var y = d3.scale.linear()
				.domain([0, Math.floor(d3.max([d3.max(gasArr,function(d){return d.sum}),d3.max(spgArr,function(d){return d.sum})]))+1])
				.range([0, gMap.chart.svgSize.height-gMap.chart.margins.top-gMap.chart.margins.bottom]);
		chart.append('text').attr({x:55,y:35,class:'chart_captions1'}).text(gMap.isEng ? 'COUNTRY' : 'СТРАНА');
		chart.append('path').attr({d:"m 46,26 0,95",class:'chart_aux_path'});
		chart.append('text').attr({x:46,y:y1,class:'chart_country chart_country_'+gMap.mapMode}).text(gMap.isEng ? gMap.enNames[gMap.countries[0]] : gMap.ruNames[gMap.countries[0]]);
		if (gasArr.length>0) {
			var gas=chart.append('g')
				.attr('transform','translate('+left+','+(y1+4)+')');
			gas.append('text').attr({x:-26-xDelta,y:35-(y1+4),class:'chart_caption1'}).text(gMap.mapMode=='exp' ? gMap.isEng ? 'GAS EXPORT' : 'ЭКСПОРТ ГАЗА' : gMap.isEng ? 'GAS IMPORT' : 'ИМПОРТ ГАЗА');
			gas.append('text').attr({x:-26-xDelta,y:53-(y1+4),class:'chart_caption1'}).text(gMap.isEng ? 'PIPELINES' : 'ПО ТРУБАМ');
			gas.append('text').attr({x:-26-xDelta,y:81-(y1+4),class:'chart_caption2'}).text(gMap.isEng ? 'bln м³' : 'млрд м³');
			gas.append('path').attr({d:"m -"+(34+xDelta)+",-150 0,150",class:"chart_aux_path"});
			var gasBars=gas.selectAll('g')
				.data(gasArr).enter().append('g')
					.attr('transform',function(d,i){return 'translate('+(i*gMap.chart.margins.barsGap)+',0)';})
					.on('mouseover',function(d){
						gMap.chartPopup(this,d.sum,d.y1);
						gMap.chartCountryHover(d.country,true,d.that);
					})
					.on('mouseout',function(d){
						gMap.chartPopup(this);
						gMap.chartCountryHover(d.country,false,d.that);
					})
					.classed('bar_clickable',function(d){
							d.y1=-y(Math.ceil(d.sum));
							d.newMode=gMap.mapMode==gMap.mapModes[0] ? gMap.mapModes[1] : gMap.mapModes[0];
							d.that=gMap.map[d.newMode].selectAll('g').filter(function(dd){ return dd.name==d.country;});
							d.clickable=gMap.data[d.newMode][d.country]&&gMap.data[d.newMode][d.country].coords&&gMap.data[d.newMode][d.country].sum>0;
							return d.clickable;
						})
					.on('click',function(d){
							gMap.chartCountryHover(d.country,false,d.that);
							if (d.clickable) {
								gMap.changeMode(d.newMode);
								gMap.clickBubble(d.country,d.that,true);
							}
						});
			gasBars.append('svg:line').attr('class','gas_bar gas_bar_'+gMap.mapMode)
				.attr({x1:0,x2:0,y1:0,y2:0})
				.transition().duration(gMap.uiDur)
				.attr('y1',function(d){return -y(d.sum);});
			gasBars.append('svg:text').attr("class", "chart_axis")
				.attr({x:0,y:16,dy:'4px',transform:function(d){ return 'rotate(-90,0,'+d3.select(this).attr('y')+')'; }})
				.text(function(d){return gMap.isEng ? gMap.ruNames[d.country] : gMap.enNames[d.country];});
			gas.append('line').attr({x1:-gMap.chart.margins.axis,y1:-4,x2:x1+gMap.chart.margins.axis,y2:-4,class:"chart_axe_path"});
			gMap.splitNames(gasBars);
		}
		if (spgArr.length>0) {
			var spg=chart.append('g')
				.attr('transform','translate('+(left+(gasArr.length==0 ? 0 : chartsGap+x1+x1delta))+','+(y1+4)+')');
			spg.append('text').attr({x:-26-xDelta,y:35-(y1+4),class:'chart_caption1 spg_chart_caption'}).text(gMap.mapMode=='exp' ? gMap.isEng ? 'EXPORT' : 'ЭКСПОРТ' : gMap.isEng ? 'IMPORT' : 'ИМПОРТ');
			spg.append('text').attr({x:-26-xDelta,y:53-(y1+4),class:'chart_caption1 spg_chart_caption'}).text(gMap.isEng ? 'LIQUID GAS' : 'СЖИЖЕННОГО ГАЗА');
			spg.append('text').attr({x:-26-xDelta,y:81-(y1+4),class:'chart_caption2 spg_chart_caption'}).text(gMap.isEng ? 'bln м³' : 'млрд м³');
			spg.append('path').attr({d:"m -"+(34+xDelta)+",-150 0,150",class:"chart_aux_path"});

			var spgBars=spg.selectAll('g')
				.data(spgArr).enter().append('g')
					.attr('transform',function(d,i){return 'translate('+(i*gMap.chart.margins.barsGap)+',0)';})
					.on('mouseover',function(d){gMap.chartCountryHover(d.country,true,d.that);gMap.chartPopup(this,d.sum,d.y2)})
					.on('mouseout',function(d){gMap.chartCountryHover(d.country,false,d.that);gMap.chartPopup(this)})
					.classed('bar_clickable',function(d){
							d.y2=-y(Math.ceil(d.sum));
							d.newMode=gMap.mapMode==gMap.mapModes[0] ? gMap.mapModes[1] : gMap.mapModes[0];
							d.that=gMap.map[d.newMode].selectAll('g').filter(function(dd){ return dd.name==d.country;});
							d.clickable=gMap.data[d.newMode][d.country]&&gMap.data[d.newMode][d.country].coords&&gMap.data[d.newMode][d.country].sum>0;
							return d.clickable;
						})
					.on('click',function(d){
							gMap.chartCountryHover(d.country,false,d.that);
							if (d.clickable) {
								gMap.changeMode(d.newMode);
								gMap.clickBubble(d.country,d.that,true);
							}
						});
			spgBars.append('svg:line').attr('class','gas_bar gas_bar_'+gMap.mapMode)
				.attr({x1:0,x2:0,y1:0,y2:0})
				.transition().duration(gMap.uiDur)
				.attr('y1',function(d){return -y(d.sum);})
			spgBars.append('svg:line').attr('class','spg_bar_fill')
				.attr({x1:0,x2:0,y1:0,y2:0})
				.transition().duration(gMap.uiDur)
				.attr('y1',function(d){return -y(d.sum);})
			spgBars.append('svg:text').attr("class", "chart_axis")
				.attr({x:0,y:16,dy:'4px',transform:function(d){ return 'rotate(-90,0,'+d3.select(this).attr('y')+')'; }})
				.text(function(d){return gMap.isEng ? gMap.enNames[d.country] : gMap.ruNames[d.country];});
			spg.append('line').attr({x1:-gMap.chart.margins.axis,y1:-4,x2:x2+gMap.chart.margins.axis,y2:-4,class:"chart_axe_path"});
			gMap.splitNames(spgBars);
		}
		chart.append('g').append('rect').attr({class:'axe_rect',x:gMap.chart.margins.left-24,y:y1,width:gMap.chart.svgSize.width,height:8})
		chart.transition().duration(gMap.uiDur).style('opacity',1);
		gMap.gasBars=gasBars;
		gMap.spgBars=spgBars;
	},
	initChart2:function(arr,cont){
		var barsGap=gMap.chart.margins.barsGap
		var y1=gMap.chart.svgSize.height-gMap.chart.margins.bottom,
			x1=barsGap*(arr.length-1),
			sameBar=gMap.chart.margins.sameBar/2;

		xDelta=(gMap.chart.svgSize.width-x1-gMap.chart.margins.left-gMap.chart.margins.right);
		if (xDelta<0) {
			barsGap+=xDelta/(arr.length-1)
			if (barsGap<28) sameBar-=1/2;
		}
		x1=barsGap*(arr.length-1);

		var y = d3.scale.linear()
				.domain([0, d3.max(arr,function(d){return Math.max(d.sums[0],d.sums[1]);})])
				.range([0, gMap.chart.svgSize.height-gMap.chart.margins.top-gMap.chart.margins.bottom]);

		var chart=gMap.chart.svg.select('#all_chart');

		chart.append('text').attr({x:55,y:35,class:'chart_captions1'}).text(gMap.isEng ? 'COUNTRY' : 'СТРАНА');
		chart.append('path').attr({d:"m 46,26 0,95",class:'chart_aux_path'});
		chart.append('text').attr({x:46,y:y1,class:'chart_country chart_country_'+gMap.mapMode}).text(gMap.isEng ? gMap.enNames[gMap.countries[0]] : gMap.ruNames[gMap.countries[0]]);
		chart.append('text').attr({x:46,y:y1-30,class:'chart_country chart_country2_'+gMap.mapMode}).text(gMap.isEng ? gMap.enNames[gMap.countries[1]] : gMap.ruNames[gMap.countries[1]]);
		chart.append('text').attr({x:258,y:35,class:'chart_caption1'}).text(gMap.mapMode=='exp' ? gMap.isEng ? 'GAS EXPORT,' : 'ЭКСПОРТ ГАЗА,' : gMap.isEng ? 'GAS IMPORT,' : 'ИМПОРТ ГАЗА,');
		chart.append('text').attr({x:380,y:35,class:'chart_caption2'}).text(gMap.isEng ? 'bln м³' : 'млрд м³');
		chart.append('path').attr({d:"m 250,26 0,150",class:'chart_aux_path'});

		var gas=chart.append('g')
			.attr('transform','translate('+gMap.chart.margins.left+','+(y1+4)+')');

		//console.log(arr)
		var gasBars=gas.append('g').selectAll('g')
			.data(arr).enter().append('g')
				.attr('transform',function(d,i){return 'translate('+(i*barsGap)+',0)';})
				.classed('bar_clickable',function(d){
						d.y1=-y(d.sums[0]);
						d.y2=-y(d.sums[1]);
						d.newMode=gMap.mapMode==gMap.mapModes[0] ? gMap.mapModes[1] : gMap.mapModes[0];
						d.that=gMap.map[d.newMode].selectAll('g').filter(function(dd){ return dd.name==d.country;});
						d.clickable=gMap.data[d.newMode][d.country]&&gMap.data[d.newMode][d.country].coords&&gMap.data[d.newMode][d.country].sum>0;
						return d.clickable;
					})
				.on('click',function(d){
						gMap.chartCountryHover(d.country,true,d.that);
						if (d.clickable) {
							gMap.changeMode(d.newMode);
							gMap.clickBubble(d.country,d.that,true);
						}
					})
				.on('mouseover',function(d){
						gMap.chartCountryHover(d.country,true,d.that);
						gMap.chartPopup(this,d.sums[0],d.y1,true,d.sums[1],d.y2)
					})
				.on('mouseout',function(d){
						gMap.chartCountryHover(d.country,false,d.that);
						gMap.chartPopup(this,-1,0,true)
					});

		gasBars.append('svg:line').attr('class','gas_bar gas_bar_'+gMap.mapMode)
			.attr({x1:-sameBar,x2:-sameBar,y1:0,y2:0})
			.transition().duration(gMap.uiDur)
			.attr('y1',function(d){return -y(Math.ceil(d.sums[0]));})
		gasBars.append('svg:line').attr('class','gas_bar gas_bar2_'+gMap.mapMode)
			.attr({x1:sameBar,x2:sameBar,y1:0,y2:0})
			.transition().duration(gMap.uiDur)
			.attr('y1',function(d){return -y(Math.ceil(d.sums[1]));})

		gasBars.append('svg:text').attr("class", "chart_axis chart_"+gMap.mapMode)
			.attr({x:0,y:25,dy:'4px',transform:function(d){ return 'rotate(-90,0,'+d3.select(this).attr('y')+')'; }})
			.text(function(d){return gMap.isEng ? gMap.enNames[d.country] : gMap.ruNames[d.country];})

		gMap.splitNames(gasBars);

		//gasBars.selectAll('text').on('mouseover',function(d){ d3.select(this.parentNode).selectAll('text').classed('active_'+gMap.mapMode,true);})
		//gasBars.selectAll('text').on('mouseout',function(d){ d3.select(this.parentNode).selectAll('text').classed('active_'+gMap.mapMode,false); })

		chart.append('line').attr({x1:gMap.chart.margins.left-gMap.chart.margins.axis,y1:y1,x2:x1+gMap.chart.margins.left+gMap.chart.margins.axis,y2:y1,class:"chart_axe_path"});

		gMap.continentsText(chart,cont,gMap.chart.margins.left,y1,barsGap)

		chart.append('g').append('rect').attr({class:'axe_rect',x:gMap.chart.margins.left-30,y:y1,width:gMap.chart.svgSize.width,height:8})

		chart.transition().duration(gMap.uiDur).style('opacity',1);

		gMap.gasBars=gasBars;
	},
	initChartZapas:function(arr,cont){
		console.log(arr,cont)
		var barsGap=gMap.chart.margins.barsGap
		var y1=gMap.chart.svgSize.height-gMap.chart.margins.bottom,
			x1=barsGap*(arr.length-1),
			left=70,
			xDelta=(gMap.chart.svgSize.width-x1-left-gMap.chart.margins.right);
		if (xDelta<0) {
			barsGap+=xDelta/(arr.length-1)
		}
		x1=barsGap*(arr.length-1);

		var y = d3.scale.linear()
				.domain([0, d3.max(arr,function(d){return d.sum;})])
				.range([0, gMap.chart.svgSize.height-gMap.chart.margins.top-gMap.chart.margins.bottom]);
		var chart=gMap.chart.svg.select('#all_chart');

		chart.append('text').attr({x:55,y:35,class:'chart_caption1'}).text(gMap.isEng ? 'GAS INVENTORY BY REGIONS' : 'ЗАПАСЫ ГАЗА ПО СТРАНАМ');
		chart.append('text').attr({x:55,y:63,class:'chart_caption2'}).text(gMap.isEng ? 'bln м³' : 'млрд м³');
		chart.append('path').attr({d:"m 46,26 0,150",class:'chart_aux_path'});

		var gas=chart.append('g')
			.attr('transform','translate('+left+','+(y1+4)+')');

		var gasBars=gas.append('g').selectAll('g')
			.data(arr).enter().append('g')
				.attr('transform',function(d,i){return 'translate('+(i*barsGap)+',0)';})
					.on('mouseover',function(d){gMap.chartCountryHover(d.country,true,d.that2); gMap.chartPopup(this,d.sum,d.y=-y(Math.ceil(d.sum)))})
					.on('mouseout',function(d){
							gMap.chartCountryHover(d.country,false,d.that2);
							gMap.chartPopup(this);
						})
					.classed('bar_clickable',function(d){
							d.y=-y(Math.ceil(d.sum));
							d.newMode=gMap.mapModes[0];
							d.that=gMap.map[d.newMode].selectAll('g').filter(function(dd){ return dd.name==d.country;});
							d.that2=gMap.map[gMap.mapModes[2]].selectAll('g').filter(function(dd){ return dd.name==d.country;});
							d.clickable=gMap.data[d.newMode][d.country]&&gMap.data[d.newMode][d.country].coords&&gMap.data[d.newMode][d.country].sum>0;
							return d.clickable;
						})
					.on('click',function(d){
							gMap.chartCountryHover(d.country,false,d.that2);
							if (d.clickable) {
								gMap.changeMode(d.newMode);
								gMap.clickBubble(d.country,d.that,true)
								gMap.close.classed('leftArrow',true);
							}
						});
		gasBars.append('svg:line').attr('class','gas_bar gas_bar_exp')
				.attr({x1:0,x2:0,y1:0,y2:0})
				.transition().duration(gMap.uiDur)
				.attr('y1',function(d){return -y(Math.ceil(d.sum));})

		gasBars.append('svg:text').attr("class", "chart_axis")
			.attr({x:0,y:25,dy:'4px',transform:function(d){ return 'rotate(-90,0,'+d3.select(this).attr('y')+')'; }})
			.text(function(d){return gMap.isEng ? gMap.enNames[d.country] : gMap.ruNames[d.country];});

		gMap.splitNames(gasBars);

		chart.append('line').attr({x1:70-gMap.chart.margins.axis,y1:y1,x2:x1+70+gMap.chart.margins.axis,y2:y1,class:"chart_axe_path"});

		gMap.continentsText(chart,cont,left,y1,barsGap)

		chart.append('g').append('rect').attr({class:'axe_rect',x:50,y:y1,width:gMap.chart.svgSize.width,height:8})

		chart.transition().duration(gMap.uiDur).style('opacity',1);
		gMap.zapasBars=gasBars;
	},
	continentsText:function(chart,cont,left,top,barsGap){
		chart.append('g').selectAll('text').data(cont).enter().append('text')
			.attr({class:'gas_continent',y:top+20,x:function(d,i){
				var xi=1;
				for (var ii=0;ii<i;ii++) xi+=cont[ii].value;
				return left+(xi+d.value/2-0.5)*barsGap;
			}}).text(function(d){return d.value>1 ? gMap.isEng ? gMap.contNamesEn[d.key] : gMap.contNames[d.key] : ''});
		cont.splice(cont.length-1,1);
		var xx=0,xxx;
		cont.forEach(function(d){
			chart.append('line').attr({class:'chart_aux_path',x1:xxx=(2+left+((xx+=d.value)-0.5)*barsGap),x2:xxx,y1:top,y2:gMap.chart.svgSize.height})
		})
	},
	splitNames:function(bars){
		bars
			.filter(function(d){ return gMap.isEng ? gMap.enNames[d.country].split(' ').length>2 : gMap.ruNames[d.country].split(' ').length>2})
			.select('text')
			.attr({dy:-3}).text(function(d){
				var words=gMap.isEng ? gMap.enNames[d.country].split(' ') : gMap.ruNames[d.country].split(' ');
				var text2='';
				for (var ii=2; ii<words.length; ii++) text2+=' '+words[ii];
				d3.select(this.parentNode.appendChild(this.cloneNode())).text(text2).attr('dy',10);
				//d3.select(this.parentNode).append(this.cloneNode())
				return words[0]+' '+words[1];
			});
	},
	chartPopup:function(that,sum,y,is2,sum2,y2){
		//console.log(sum,d3.format('.1f')(+sum));
		var sel=d3.select(that);
		var both=sum>0&&sum2>0;
		if (typeof sum == "undefined"||sum==-1) sel.select('.chart_popup').remove();
		else {
			var textG=sel.append('g').attr('class','chart_popup chart_popup_'+gMap.mapMode)
			if (sum>0) textG.append('text').text((''+d3.format('.1f')(sum)).replace('.',','))
				.attr({dy:-10,y:y,class:both ? 'chart_popup1' : '',dx:is2 ? -2 : 0});
			if (is2&&sum2>0)
				textG.append('text').text((''+d3.format('.1f')(sum2)).replace('.',','))
					.attr({dy:-10,y:y2,class:both ? 'chart_popup2' : '',dx: 2});
		}
		sel.selectAll('line').classed('active',sum>0||sum2>0);
		sel.selectAll('.chart_axis').classed('active_'+gMap.mapMode,sum>0||sum2>0);
	},
	showChart:function(isShow){
		//console.log('showChart',isShow)
		if (gMap.chart.svg[0]) {
			//gMap.chart.svg.transition().duration(gMap.uiDur*2).attr('height',isShow ? gMap.chart.svgSize.height : 20).attr('opacity',isShow ? 1 :0);
			if (gMap.chart.svg.select('#all_chart')[0].length>0) {
				gMap.chart.svg.select('#all_chart').selectAll('.gas_bar').transition().attr('y1',0).duration(gMap.uiDur-50);
				gMap.chart.svg.select('#all_chart').attr('id','old_chart').transition().style('opacity',0).duration(gMap.uiDur*2).remove()
			}
			if (isShow) {
				gMap.chart.svg.append('g').attr('id','all_chart').style('opacity',0);//.transition().duration(gMap.uiDur*2).style('opacity',1);
				//gMap.showMinimize(0);
				//gMap.minimizeChart(0);
				//d3.select('#chartMinimize').style('opacity',1)
			} else {
				gMap.gasBars=false;
				gMap.spgBars=false;
				//d3.select('#chartMinimize').style('opacity',0)
			}
		}
		if (gMap.isScrolled!=isShow) {
			gMap.scroll(isShow);
		}
	},
	showMinimize:function(isOnMap){
		document.getElementById(isOnMap ? 'chartMinMapCont' : 'chartMinChartCont').appendChild(document.getElementById('chartMinimize'));
		d3.select('#chartMinimize').style('opacity',1)
			.attr('transform','translate('+(isOnMap ? gMap.width/2 : gMap.chart.svgSize.width/2)+','+(isOnMap ? gMap.height-20: 0)+') rotate('+(isOnMap ? 180 : 0)+')')
			.on('click',function(){
					gMap.showMinimize(!isOnMap);
					gMap.minimizeChart(!isOnMap);
				})
			.on('mouseover',function(){
					if (isOnMap) {
						gMap.showMinimize(!isOnMap);
						gMap.minimizeChart(!isOnMap);
					}
				})
		gMap.isOnMap=isOnMap;
	},
	minimizeChart:function(isMin){
		gMap.chart.svg.transition().duration(gMap.uiDur).attr('transform','translate(0,'+(!isMin ? gMap.height-gMap.chart.svgSize.height : gMap.height-20 )+')');
		d3.select('#gasmapclip').transition().duration(gMap.uiDur).attr("height", !isMin ? gMap.height-gMap.chart.svgSize.height : gMap.height-20);
	    d3.select("#gasMapCont").select('svg').transition().duration(gMap.uiDur).attr('width',gMap.width)
	    	.attr('height',!isMin ? gMap.height-gMap.chart.svgSize.height : gMap.height-20);
	    d3.select("#gasChart").select('svg').transition().duration(gMap.uiDur)
	    	.attr('width',gMap.chart.svgSize.width).attr('height',!isMin ? gMap.chart.svgSize.height : 20);
	},
	initCloseTop:function(callback){
		gMap.closeTop=d3.select('#gasTopClose');
		var close=gMap.closeTop.append('svg').attr({width:gMap.width,height:45})
			.append('g')
			.on('click',function(){gMap.changeViz('map');})
			.attr('transform','translate('+(gMap.width-gMap.tm.margins.right-15)+','+14+')')
			.attr('class','tmClose');
		close.append('svg:rect').attr({x:-3,y:-3,width:30,height:30,opacity:0});
		close.append('svg:path').attr({d:gMap.icons.close2});
		callback&&callback();
	},
	initTreeMaps:function(callback){
		/*
		gMap.tm.svgExp=d3.select("#gasMapCont")
			.append("svg").attr('id','tm_exp_svg')
		    .attr("width", gMap.tm.svgSize.width)
		    .attr("height", gMap.tm.svgSize.height);
		gMap.tm.svgImp=d3.select("#gasMapCont")
			.append("svg").attr('id','tm_imp_svg')
		    .attr("width", gMap.tm.svgSize.width)
		    .attr("height", gMap.tm.svgSize.height);
		var tmExp=gMap.tm.svgExp.append('g').attr('#all_tm');
		var tmImp=gMap.tm.svgImp.append('g').attr('#all_tm');

		*/
		var svg=gMap.tm.svg=d3.select('#gasTreeMap').append('svg').attr({width:gMap.width,height:gMap.tm.svgSize.fHeight});
		var y2=gMap.tm.margins.top+gMap.tm.svgSize.height+gMap.tm.margins.middle;
		svg.append('svg:rect').attr({x:0,y:0,width:gMap.width,height:gMap.tm.svgSize.fHeight,id:'gasback'})
		svg.append('text').attr({x:gMap.tm.margins.left+16,y:gMap.tm.margins.top-25,class:'tm_caption1'}).text(gMap.isEng ? 'THE MAJOR GAS EXPORTERS' : 'КРУПНЕЙШИЕ ЭКСПОРТЕРЫ ГАЗА');
		svg.append('text').attr({x:gMap.tm.margins.left+16,y:y2-25,class:'tm_caption1'}).text(gMap.isEng ? 'THE MAJOR GAS IMPORTER' : 'КРУПНЕЙШИЕ ИМПОРТЕРЫ ГАЗА');
		svg.append('line').attr({x1:gMap.tm.margins.left+1,x2:gMap.tm.margins.left+1,y1:gMap.tm.margins.top-1,y2:gMap.tm.margins.top-40,class:'chart_aux_path'});
		svg.append('line').attr({x1:gMap.tm.margins.left+1,x2:gMap.tm.margins.left+1,y1:y2-1,y2:y2-40,class:'chart_aux_path'});

		var toSankey=svg.append('g').on('click',function(){gMap.changeViz('sankey');})
			.attr('transform','translate('+(gMap.width/2-160/2)+','+(gMap.tm.margins.top+gMap.tm.svgSize.height+gMap.tm.margins.middle/2-40/2)+')')
			.attr('class','toSankey');
		toSankey.append('svg:rect').attr({x:0,y:0,width:160,height:40})
		toSankey.append('svg:path').attr({d:gMap.icons.toSankey}).attr('transform','translate(16,12)');
		toSankey.append('svg:text').text(gMap.isEng ? 'COMPARE' : 'СРАВНИТЬ').attr({x:60,y:25});

		gMap.tm.exp=svg.append('g').attr('transform','translate('+(gMap.tm.margins.left)+','+(gMap.tm.margins.top)+')')
		gMap.tm.imp=svg.append('g').attr('transform','translate('+(gMap.tm.margins.left)+','+(y2)+')');

		['exp','imp'].forEach(function(d){
			var data=d3.entries(gMap.data[d])
									.filter(function(d){ return d.value.sum>2.5; })
									.map(function(d){  return {name:(gMap.isEng ? gMap.enNames[d.key] : gMap.ruNames[d.key]),country:d.key,size:(d.value.sum)}})
			gMap.initTreeMap(d,{name:'export',
								children: data })
		})

		callback&&callback();
	},
	initTreeMap:function(mode,root){
		var colorRange= mode=='exp' ? [d3.rgb(211, 236, 251),d3.rgb(0, 104, 151)] : [d3.rgb(176, 197, 210),d3.rgb(0, 0, 11)]
		root.children.sort(function(a,b){return b.size-a.size;});

		var cats=root.children.map(function(d){ return d.name});
		//console.log(cats)
		var color =d3.scale.ordinal()
					.domain(cats)
					.range(d3.range(cats.length).map(d3.scale.linear()
						.domain([0, cats.length-1 ])
						.range(colorRange)
						.interpolate(d3.interpolateLab)));
		var fontColorMiddle= mode=='exp' ? 2*cats.length/3 : cats.length/3;
		var width=gMap.width-gMap.tm.margins.left-gMap.tm.margins.right
			,height=gMap.tm.svgSize.height;
		var treemap = d3.layout.treemap()
		    .size([width, height])
		    .sticky(true)
		    .value(function(d) { return d.size; })
		    .sort(function(a,b){return a.size-b.size;})

		var svg = gMap.tm[mode];

		var cell = svg.data([root]).selectAll("g")
			  .data(treemap.nodes)
			.enter().append("g")
				.on('mouseover',function(){
					d3.select(this).select('rect').style("fill",function(d,i){return d.fc=='#00213e' ? "#fff" : "#00213e"})
					if (!gMap.isIE) this.parentNode.appendChild(this);
				})
				.on('mouseout',function(){
					d3.select(this).select('rect').style("fill", function(d) { return color(d.name) ; });
				})

				/*
				.on('click',function(d){
							var newMode=mode;
							if (gMap.data[newMode][d.country].coords&&gMap.data[newMode][d.country].sum>0) {
								gMap.changeViz('map');
								gMap.changeMode(newMode);
								gMap.clickBubble(d.country,gMap.map[mode].selectAll('g').filter(function(dd){ return dd.name==d.country;}),true);
							}
				})
				*/
			  .attr("class", "tm_node")
			  .attr("transform", function(d) { return "translate(" + d.x + "," + (d.y) + ")"; });
			  //.attr("transform", function(d) { return "translate(" + d.x + "," + (height-d.y-d.dy) + ")"; });

		cell.append("rect")
			.attr("width", function(d) { return d.dx; })
			.attr("height", function(d) { return d.dy; })
			.style("fill", function(d) { return color(d.name) ; });
			//.style("stroke",'#00213')
			//.style("stroke-width",'1px');

		var fontSize=d3.scale.linear()
						.domain([root.children[0].size, root.children[root.children.length-1].size])
						.range([7,25])
		cell.append("text")
			.attr("x", function(d) { return d.dx / 2; })
			.attr("y", function(d) { return d.dy / 2; })
			//.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.attr("font-size",function(d){return fontSize(d.size)})
			.style("fill",function(d,i){return d.fc=(i<fontColorMiddle ? "#00213e" : "#fff")})
			.text(function(d) { d.wordsNum=1; return d.name; });

		cell.selectAll('text').filter(function(d){ return d.name.split(' ').length>1})
			.text(function(d){
				var words=d.name.replace('  ',' ').split(' ');
				var text2='';
				d.wordsNum=words.length;
				for (var i=1; i<words.length; i++)
					d3.select(this.parentNode.appendChild(this.cloneNode())).text(words[i]).attr('dy',''+(i-words.length/2+0.5)*1.3*fontSize(d.size)+'px');
					d3.select(this).attr('dy',''+(-words.length/2+0.5)*1.3*fontSize(d.size)+'px');
				//d3.select(this.parentNode).append(this.cloneNode())
				return words[0];
			});
		var formatNumber = d3.format(".1f"),
		    format = function(d) { return formatNumber(d).replace('.',',') + gMap.isEng ? ' bln м³' : ' млрд м³'; };
		cell.append("text").attr('class','tm_value')
			.attr("x", function(d) { return d.dx / 2; })
			.attr("y", function(d) { return d.dy / 2; })
			.attr("dy", function(d) { return d.size ? (d.wordsNum/2+0.5)*1.3*fontSize(d.size) : 0;})
			.attr("text-anchor", "middle")
			.attr("font-size",function(d){return fontSize(d.size)})
			.style("fill",function(d,i){return i<fontColorMiddle ? "#00213e" : "#fff"})
			.text(function(d) { return format(d.value); });
	},
	initSankey:function(callback){
		var matrix=[];

		var arrayUnique = function(a) {
		    return a.reduce(function(p, c) {
		        if (p.indexOf(c) < 0) p.push(c);
		        return p;
		    }, []);
		};

		var exp=gMap.data.exp,
			imp=gMap.data.imp,
			data={nodes:[],links:[]},
			i=0, i1=-1, i2=-1;

		for (c in imp) {
			if (imp[c].sum>0) {
				data.nodes.push({name:gMap.isEng ? gMap.enNames[c] : gMap.ruNames[c],sum:imp[c].sum,i:i})
				imp[c].i=i++;
			}
		}
		for (c in exp) {
			if (exp[c].sum>0) {
				data.nodes.push({name:gMap.isEng ? gMap.enNames[c] : gMap.ruNames[c],sum:exp[c].sum,i:i})
				exp[c].i=i++;
			}
				//data.links.push({source: exp[c].i, target: imp[cc].i, value: exp[c].to[cc].sum})
		}
		data.nodes.sort(function(a,b){return b.sum-a.sum;})
		for (c in exp) {
			for (cc in exp[c].to)
				if (exp[c].to[cc].sum>0) {
					i1=data.nodes.indexOf(data.nodes.filter(function(d){return exp[c].i==d.i})[0]);
					i2=data.nodes.indexOf(data.nodes.filter(function(d){return imp[cc].i==d.i})[0]);
					//console.log(i1,i2,data.nodes[i1],data.nodes[i2],exp[c],imp[cc]);
					//data.nodes[i1].i=i1;
					//data.nodes[i2].i=i2;
					data.links.push({source: i1, target: i2, value: exp[c].to[cc].sum});
				}
				//data.links.push({source: exp[c].i, target: imp[cc].i, value: exp[c].to[cc].sum})
		}
		//console.log(data);


		var margin = {country: 150, top: gMap.sankey.margins.top, right: gMap.sankey.margins.right, bottom: gMap.sankey.margins.bottom, left: gMap.sankey.margins.left},
		    width = gMap.width - margin.left - margin.right,
		    height = Math.max(gMap.sankey.svgSize.height,gMap.height) - margin.top - margin.bottom;
		    gMap.sankey.svgSize.height=height+margin.top+margin.bottom;

		var formatNumber = d3.format(".1f"),
		    format = function(d) { return formatNumber(d).replace('.',',') + gMap.isEng ? ' bln м³' : ' млрд м³'; },
		    color = d3.scale.category20();

		var svg=d3.select('#gasSankey').append('svg').attr({width:gMap.width,height:height+margin.top+margin.bottom});

		svg.append('svg:rect').attr({x:0,y:0,width:gMap.width,height:height+margin.top+margin.bottom,id:'gasback2'})
		svg.append('text').attr({x:margin.left,y:margin.top-15,class:'tm_caption1'}).text(gMap.isEng ? 'THE MAJOR GAS EXPORTERS' : 'КРУПНЕЙШИЕ ЭКСПОРТЕРЫ ГАЗА');
		svg.append('text').attr({x:width+margin.left,y:margin.top-15,class:'tm_caption2'}).text(gMap.isEng ? 'THE MAJOR GAS IMPORTER' : 'КРУПНЕЙШИЕ ИМПОРТЕРЫ ГАЗА');

		svg=svg.append('g').attr('transform','translate('+(margin.left+margin.country)+','+(margin.top)+')')

		var sankey = d3.sankey()
		    .nodeWidth(10)
		    .nodePadding(8)
		    .size([width-2*margin.country,height])
		    .relaxLeft(false)
		    .relaxRight(false);

		var path = sankey.link(),
			node, selNodes;

		sankey
		  .nodes(data.nodes)
		  .links(data.links)
		  .layout(32);

		link = svg.append("g").selectAll(".sankey_link")
		  .data(data.links)
		.enter().append("path")
		  .attr("class", "sankey_link")
		  .attr("d", path)
		  .style("stroke-width", function(d) { return Math.max(1, d.dy); })
		  .sort(function(a, b) { return b.dy - a.dy; })
		  .on('mouseover',function(d){
		  		var x,y,bbox=this.getBBox();
		  		//console.log(bbox)
		  		x=bbox.x+bbox.width/2;
		  		y=bbox.y+bbox.height/2;
			  	gMap.sankey.label=svg.append('text')
			  			.attr({x:x,y:y,class:'sankey_label'})
			  			.text(d.source.name + " → " + d.target.name + "   " + format(d.value));
			  	//console.log(d3.mouse(gMap.sankey.svg))
			  	node.filter(function(dd){return d.source==dd||d.target==dd;}).classed('hover',true);
			  	if (!gMap.isIE) this.parentNode.appendChild(this);
			  })
		  .on("mouseout",function(){
			  	node.classed('hover',false);
			  	//if (selNodes) selNodes.classed('active',true);
		  		gMap.sankey.label.remove();
		  	})
		  .on('click',function(d){ highlight(d.source); })

		node = svg.append("g").selectAll(".sankey_node")
			  .data(data.nodes)
			.enter().append("g")
			  .attr("class", "sankey_node")
			  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
			  .on("click",function(d){ highlight(d); })

		function highlight(d) {
			var side=d.sourceLinks.length>0 ? 'Source' : 'Target';
		  	var arr= side=='Source' ? d.sourceLinks : d.targetLinks,
		  		isClick=false;
		  	//isClick=d.isClick=!d.isClick;
		  	//d['isClick'+side]=!d['isClick'+side];
		  	console.log(side,arr);
		  	link.filter(function(dd){
			  		return arr.indexOf(dd)>-1;
			  	}).classed('hover',function(dd){
			  		dd['isClick'+side]=!dd['isClick'+side];
			  		return (dd.isClickSource||dd.isClickTarget);
			  		//console.log(dd,dd.isClickSource,dd.isClickTarget,dd.source.name,dd.source.isClick,dd.target.name,dd.target.isClick);
			  	});
		  	node.classed('active',function(dd){
		  		isClick=false;
		  		arr= dd.sourceLinks.length>0 ? dd.sourceLinks : dd.targetLinks,
		  		arr.forEach(function(l){
		  			if (l.isClickSource||l.isClickTarget) isClick=true;
		  		})
		  		return isClick;
		  	});
		}
		node.append("rect")
		  .attr("height", function(d) { return d.dy; })
		  .attr("width", sankey.nodeWidth())
		.append("title")
		  .text(function(d) { return d.name + "\n" + format(d.value); });

		node.append("text")
		  .attr("x", 22)
		  .attr("y", function(d) { return d.dy / 2; })
		  .attr("dy", ".35em")
		  .attr("text-anchor", "start")
		  .attr("transform", null)
		  .text(function(d) { return d.name; })
		.filter(function(d) { return d.x < height / 2; })
		  .attr("x", -22 + sankey.nodeWidth())
		  .attr("text-anchor", "end")

		gMap.sankeyLinks=link;
		gMap.sankeyNodes=node;
	  	callback&&callback();
	},
	calcArcs:function(d,isFirst){
		//console.log(d.target.country,d.source.country,d.target.x,d.target,d)
    	d.target.x=gMap.map.projection(d.target.coords)[0];
    	d.target.y=gMap.map.projection(d.target.coords)[1];
    	d.source.x=gMap.map.projection(d.source.coords)[0];
    	d.source.y=gMap.map.projection(d.source.coords)[1];
		d.dx=d.target.x-d.source.x,
		d.dy=d.target.y-d.source.y;
        var  s2=d.dx*d.dx+d.dy*d.dy,
        	k=gMap.k,
            r2=k*k*s2,
            h2=r2-s2/4,
            s=Math.pow(s2,0.5),
            h=Math.pow(h2,0.5),
            alfa=Math.atan((d.target.y-d.source.y)/ (d.target.x-d.source.x))//-Math.PI/2;
            d.r=Math.pow(r2,0.5);
            d.alfa1=alfa-Math.acos(h/d.r);
            d.alfa2=alfa+Math.acos(h/d.r);
            d.x0=-d.r*Math.sin(d.alfa1)+Math.min(d.source.x,d.target.x);
            d.y0=d.r*Math.cos(d.alfa1)+(d.source.x>d.target.x ? d.target.y : d.source.y);
    		d.teta=d.source.x<d.target.x ? Math.PI/2-Math.atan(2*h/s) : -Math.PI/2+Math.atan(2*h/s);
    		d.reverse=d.dx>0;
    		//if (isFirst) d.endAngle=d.alfa1;
        //console.log('h,s,h/s,Math.atan(2*h/s),d.teta,d')
        //console.log(h,s,h/s,Math.atan(2*h/s),d.teta,d)
	},
	initMapArcs:function(mode,callback){
		//console.log('arcs')
		var expArr=[],ccc,
			direction=(mode=='exp' ? 'to' : 'from');
			direction2=(mode=='exp' ? 'source' : 'target');
		for (var c in gMap.data[mode])
			for (var cc in gMap.data[mode][c][direction]) {
				ccc=gMap.data[mode][c][direction][cc];
				if (ccc.coords&&gMap.data[mode][c].coords)
					expArr.push({
						source:mode=='exp' ? {country:c,coords:gMap.data[mode][c].coords} : {country:cc,coords:ccc.coords},
						target:mode=='imp' ? {country:c,coords:gMap.data[mode][c].coords} : {country:cc,coords:ccc.coords},
						sum:ccc.sum,
						isSpg: ccc.spg ? true : false
					})
			}
		//console.log(expArr);
		/*
		var arc_width=d3.scale.linear()
				.domain([d3.min(expArr,function(d){return d.sum}),d3.max(expArr,function(d){return d.sum})])
				.range([0.5,20]);
		*/
		gMap.map.arcs[mode]=gMap.map.svg.append('g').attr('id',mode+'_arcs');
		gMap.map.arcs[mode].selectAll('g')
			.data(expArr).enter()
			.append('g').style('display','none')
			.attr("class",function(d){return d[mode=='exp' ?'source':'target'].country.replace(/ /g,'_')+" "+mode+"_arcs gas_arcs "+(d.isSpg ? 'arc_spg' : 'arc_pipe');})
		    .append("svg:path")
			.each(gMap.calcArcs)
			//.style('stroke-width',function(d) { return arc_width(d.sum)})
		if (mode==gMap.mapModes[0]) {
			gMap.map.arcs[mode].selectAll('g').append('circle').attr('cx',0).attr('cy',0).attr('r',3).attr('class','arrow_point');
			//gMap.map.arcs[mode].selectAll('g').append('line').attr('x2',0).attr('y2',0).attr('class','arrow1 arc_arrow');
			//gMap.map.arcs[mode].selectAll('g').append('line').attr('x2',0).attr('y2',0).attr('class','arrow2 arc_arrow');
		}

		gMap.map.countriesSelected[mode]={};
		gMap.map.arcsFiltered[mode]={};
		for (c in gMap.data[mode]) {
			gMap.map.countriesSelected[mode][c]={}
			gMap.pipeMode.forEach(function (type) {
				gMap.map.countriesSelected[mode][c][type]=d3.selectAll('.countries')
					.filter(function(d){
						if (gMap.data[mode][c][direction] && gMap.data[mode][c][direction][d.id.replace(/_/g,' ')]
								&& (gMap.data[mode][c][direction][d.id.replace(/_/g,' ')][type.replace('pipe','gas')]>0)) return true
							else return false;
					})
			})
			gMap.map.arcsFiltered[mode][c]=gMap.map.arcs[mode].selectAll('g')
				.filter(function(d){
					if (d[direction2].country==c) return true
						else return false;
				})

		}
		callback();
	},
	arcTween: function (transition,isShow) {
	  	transition.attrTween("d", function(d) {
		    var interpolate = d.reverse ? d3.interpolate(d.endAngle, isShow ? d.alfa2 : d.alfa1) : d3.interpolate(d.startAngle, isShow ? d.alfa1 : d.alfa2);
		    return function(t) {
		      if (d.reverse) d.endAngle = interpolate(t)
		      	else d.startAngle = interpolate(t);
		      return gMap.map.arc(d);
		    }
		});
	},
	zoomByFactor: function(factor) {
		var zoom = gMap.map.zoom;
	    var scale = zoom.scale();
	    var extent = zoom.scaleExtent();
	    var newScale = (scale * factor);
	    if (newScale<extent[0]) newScale=extent[0];
	    if (newScale>extent[1]) newScale=extent[1];
	    gMap.moveSlider(newScale);
		var t = zoom.translate();
		var c = [gMap.map.width / 2, gMap.map.height / 2];
		zoom
			.scale(newScale)
			.translate(
				[c[0] + (t[0] - c[0]) / scale * newScale,
				 c[1] + (t[1] - c[1]) / scale * newScale])
			.event(gMap.map.svg.transition().duration(gMap.uiDur));
	},
	redraw:function(){
        var tx = gMap.map.t[0] * d3.event.scale + d3.event.translate[0];
        var ty = gMap.map.t[1] * d3.event.scale + d3.event.translate[1];
        gMap.map.projection.translate([tx, ty]);
        gMap.map.projection.scale(gMap.map.s * d3.event.scale);
        gMap.moveSlider(gMap.map.zoom.scale());
    	gMap.draw();
    },
    draw:function(isAll,isSmoth,callback){
    	gMap.map.svg.selectAll(".countries").attr("d", gMap.map.path);
    	var drawModes=isAll ? ['exp','imp','zapas'] : [gMap.mapMode];
    	drawModes.forEach(function(type){
    		gMap.map[type].selectAll('g')
		        .attr("transform", function(d){
		        	//d3.select(this.parentNode).select('text').attr('x',gMap.map.projection(d.coords)[0]).attr('y',gMap.map.projection(d.coords)[1])
		        	return 'translate('+gMap.map.projection(d.coords)[0]+','+gMap.map.projection(d.coords)[1]+')'  })
    		})
    	if (gMap.mapMode==gMap.mapModes[0]||gMap.mapMode==gMap.mapModes[1]) {
	    	drawModes.splice(2,1);
	    	drawModes.forEach(function(mode){
	    		//console.log(drawModes,gMap.mapModes,mode)
				gMap.map.arcs[mode].selectAll('path')
				    .attr("d", gMap.map.arc)
				    .attr("transform", function(d){
				    		//console.log(d)
				    		var coords=gMap.map.projection(d.target.coords );
				    		d3.select(this.parentNode).select('.arrow_point')
				    			.attr('transform',"translate(" + coords[0] + "," + coords[1] + ")")
				    		return "translate(" + d.x0 + "," + d.y0 + ")";
				    	})
	    	})
	    }
		callback&&callback();
	},
	changeMode:function(mapMode,callback){
		d3.select('#gasmenu'+mapMode+'down').transition().style('opacity',1).attr('pointer-events',null);
		d3.selectAll('.gasmenuitem.gas'+gMap.mapMode).classed('active',false);
		d3.selectAll('.gasmenuitem.gas'+mapMode).classed('active',true);
		d3.select('#gasmenu'+gMap.mapMode+'down').transition().style('opacity',0).attr('pointer-events','none');
		//console.log(mapMode)
		var oldMode=gMap.mapMode;
		gMap.mapMode=mapMode;
		gMap.draw();
		gMap.map[oldMode].selectAll('g').classed('active',false);
		if (oldMode!=mapMode) {
			gMap.map[oldMode].selectAll('.bubble_circle').transition().duration(gMap.uiDur).attr('r',0);
			gMap.map[oldMode].selectAll('.country_dot').classed('active',false);
			gMap.map[oldMode].selectAll('.bubble4click').classed('active',false);
		}
		gMap.calcBubbles();
		gMap.map[mapMode].selectAll('.country_dot').classed('active',true);
		gMap.map[mapMode].selectAll('.bubble4click').classed('active',true);
    	if (oldMode==gMap.mapModes[0]||oldMode==gMap.mapModes[1]) {
			gMap.showArcs(oldMode,'',0);
			gMap.map[oldMode].each(function(){ this.parentNode.appendChild(this); });
    	}
		gMap.countries=[];
		//gMap.showChart(true);
		if (mapMode==gMap.mapModes[2]) {
			gMap.initChart();
			d3.select('#gascompare').classed('active',false);
		} else {
			gMap.showChart(0);
			d3.select('#gascompare').classed('active',true);
		}
		if (gMap.isIE) d3.select('#gascompare').on('click',function(){gMap.changeViz('tm');});
		d3.selectAll('.countries').attr('class','countries')
		//console.log(oldMode,gMap.mapModes[0],gMap.legenda1stDel)

		if (oldMode==gMap.mapModes[0]&&gMap.legenda1stDel) {
			d3.select('#gasmenuexpdown').transition().style('opacity',0).attr('pointer-events','none');
			gMap.legenda1stDel=false;
		}
		gMap.highlightCountries();
		callback&&callback();
	},
	changeViz:function(vizMode,callback){
		var viz=d3.select('#gasViz');
		if (vizMode=='map') {
			viz.style('height',null);
			gMap.closeTop.classed('active',false);
		} else {
			gMap.closeTop.classed('active',true);
		}
		if (vizMode=='tm') {
			viz.style('height',gMap.tm.svgSize.fHeight+'px');
		}
		if (vizMode=='sankey') {
			viz.style('height',gMap.sankey.svgSize.height+'px');
			gMap.sankeyLinks.classed('hover',false);
			gMap.sankeyNodes.classed('active',false);
		}
		//console.log(vizMode)
		if (vizMode!=gMap.vizMode)
			d3.selectAll('.gasViz'+gMap.vizMode)
				.transition().duration(gMap.uiDur).style('opacity',0)
				.each('end',function(){d3.select(this).style('display','none'); })
		d3.selectAll('.gasViz'+vizMode).style('display',null).transition().duration(gMap.uiDur*2).style('opacity',1);
		gMap.vizMode=vizMode;
		$('html,body').stop().animate({ scrollTop: 0 });
		d3.select('#viz_menu').selectAll('g').style('opacity',1);
		d3.select('#viz_menu_'+gMap.vizMode).style('opacity',0.3);
		callback&&callback();
	},
	share : {
	    vkontakte: function(purl, ptitle, pimg, text) {
	        url  = 'http://vkontakte.ru/share.php?';
	        url += 'url='          + encodeURIComponent(purl);
	        url += '&title='       + encodeURIComponent(ptitle);
	        url += '&description=' + encodeURIComponent(text);
	        url += '&image='       + encodeURIComponent(pimg);
	        url += '&noparse=true';
	        gMap.share.popup(url);
	    },
	    facebook: function(purl, ptitle, pimg, text) {
	        url  = 'http://www.facebook.com/sharer.php?s=100';
	        url += '&p[title]='     + encodeURIComponent(ptitle);
	        url += '&p[summary]='   + encodeURIComponent(text);
	        url += '&p[url]='       + encodeURIComponent(purl);
	        url += '&p[images][0]=' + encodeURIComponent(pimg);
	        gMap.share.popup(url);
	    },
	    twitter: function(purl, ptitle) {
	        url  = 'http://twitter.com/share?';
	        url += 'text='      + encodeURIComponent(ptitle);
	        url += '&url='      + encodeURIComponent(purl);
	        url += '&counturl=' + encodeURIComponent(purl);
	        gMap.share.popup(url);
	    },
	    popup: function(url) {
	        window.open(url,'','toolbar=0,status=0,width=626,height=436');
	    }
	}
}
var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this twice without a uniqueId";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();
gMap.init();

