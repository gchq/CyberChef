/** @license
========================================================================
  Snowfall jquery plugin version 1.51 Dec 2nd 2012
  
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
  Developed by Jason Brown for any bugs or questions email me at loktar69@hotmail
  info on the plugin is located on Somethinghitme.com
*/

/*
  Version 1.51 Dec 2nd 2012
  // fixed bug where snow collection didn't happen if a valid doctype was declared.

  Version 1.5 Oct 5th 2011
  Added collecting snow! Uses the canvas element to collect snow. In order to initialize snow collection use the following

  $(document).snowfall({collection : 'element'});

  element = any valid jquery selector.

  The plugin then creates a canvas above every element that matches the selector, and collects the snow. If there are a varrying amount of elements the
  flakes get assigned a random one on start they will collide.

  Version 1.4 Dec 8th 2010
  Fixed issues (I hope) with scroll bars flickering due to snow going over the edge of the screen.
  Added round snowflakes via css, will not work for any version of IE. - Thanks to Luke Barker of http://www.infinite-eye.com/
  Added shadows as an option via css again will not work with IE. The idea behind shadows, is to show flakes on lighter colored web sites - Thanks Yutt

  Version 1.3.1 Nov 25th 2010
  Updated script that caused flakes not to show at all if plugin was initialized with no options, also added the fixes that Han Bongers suggested

  Developed by Jason Brown for any bugs or questions email me at loktar69@hotmail
  info on the plugin is located on Somethinghitme.com

  values for snow options are

  flakeCount,
  flakeColor,
  flakeIndex,
  minSize,
  maxSize,
  minSpeed,
  maxSpeed,
  round,      true or false, makes the snowflakes rounded if the browser supports it.
  shadow      true or false, gives the snowflakes a shadow if the browser supports it.

  Example Usage :
  $(document).snowfall({flakeCount : 100, maxSpeed : 10});

  -or-

  $('#element').snowfall({flakeCount : 800, maxSpeed : 5, maxSize : 5});

  -or with defaults-

  $(document).snowfall();

  - To clear -
  $('#element').snowfall('clear');
*/

// requestAnimationFrame polyfill from https://github.com/darius/requestAnimationFrame
if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    'use strict';

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

(function($){
    $.snowfall = function(element, options){
        var flakes = [],
            defaults = {
                flakeCount : 35,
                flakeColor : '#ffffff',
				flakePosition: 'absolute',
                flakeIndex: 999999,
                minSize : 1,
                maxSize : 2,
                minSpeed : 1,
                maxSpeed : 5,
                round : false,
                shadow : false,
                collection : false,
                collectionHeight : 40,
                deviceorientation : false
            },
            options = $.extend(defaults, options),
            random = function random(min, max){
                return Math.round(min + Math.random()*(max-min));
            };

            $(element).data("snowfall", this);

            // Snow flake object
            function Flake(_x, _y, _size, _speed){
                // Flake properties
                this.x  = _x;
                this.y  = _y;
                this.size = _size;
                this.speed = _speed;
                this.step = 0;
                this.stepSize = random(1,10) / 100;

                if(options.collection){
                    this.target = canvasCollection[random(0,canvasCollection.length-1)];
                }

                var flakeMarkup = null;

                if(options.image){
                    flakeMarkup = document.createElement("img");
                    flakeMarkup.src = options.image;
                }else{
                    flakeMarkup = document.createElement("div");
                    $(flakeMarkup).css({'background' : options.flakeColor});
                }

                $(flakeMarkup).attr({
                    'class': 'snowfall-flakes', 
                }).css({
                    'width' : this.size, 
                    'height' : this.size, 
                    'position' : options.flakePosition, 
                    'top' : this.y, 
                    'left' : this.x, 
                    'fontSize' : 0, 
                    'zIndex' : options.flakeIndex
                });

                if($(element).get(0).tagName === $(document).get(0).tagName){
                    $('body').append($(flakeMarkup));
                    element = $('body');
                }else{
                    $(element).append($(flakeMarkup));
                }

                this.element = flakeMarkup;

                // Update function, used to update the snow flakes, and checks current snowflake against bounds
                this.update = function(){
                    this.y += this.speed;

                    if(this.y > (elHeight) - (this.size  + 6)){
                        this.reset();
                    }

                    this.element.style.top = this.y + 'px';
                    this.element.style.left = this.x + 'px';

                    this.step += this.stepSize;

                    if (doRatio === false) {
                        this.x += Math.cos(this.step);
                    } else {
                        this.x += (doRatio + Math.cos(this.step));
                    }

                    // Pileup check
                    if(options.collection){
                        if(this.x > this.target.x && this.x < this.target.width + this.target.x && this.y > this.target.y && this.y < this.target.height + this.target.y){
                            var ctx = this.target.element.getContext("2d"),
                                curX = this.x - this.target.x,
                                curY = this.y - this.target.y,
                                colData = this.target.colData;

                                if(colData[parseInt(curX)][parseInt(curY+this.speed+this.size)] !== undefined || curY+this.speed+this.size > this.target.height){
                                    if(curY+this.speed+this.size > this.target.height){
                                        while(curY+this.speed+this.size > this.target.height && this.speed > 0){
                                            this.speed *= .5;
                                        }

                                        ctx.fillStyle = "#fff";
										ctx.shadowOffsetX = 1;
										ctx.shadowOffsetY = 1;
										ctx.shadowColor = "#000";
										ctx.shadowBlur = 1;
										
                                        if(colData[parseInt(curX)][parseInt(curY+this.speed+this.size)] == undefined){
											// console.log("1");
                                            colData[parseInt(curX)][parseInt(curY+this.speed+this.size)] = 1;
                                            //ctx.fillRect(curX, (curY)+this.speed+this.size, this.size, this.size);
											
											ctx.beginPath();
											ctx.arc(curX, curY+this.speed+this.size, this.size / 2, 0, Math.PI * 2, true);
											ctx.closePath();
											ctx.fill();
											
                                        }else{
											// console.log("2");
                                            colData[parseInt(curX)][parseInt(curY+this.speed)] = 1;
                                            //ctx.fillRect(curX, curY+this.speed, this.size, this.size);
											
											// ctx.fillStyle = "#f00";
											ctx.beginPath();
											ctx.arc(curX, curY+this.speed+this.size, this.size, 0, Math.PI * 2, true);
											ctx.closePath();
											ctx.fill();
                                        }
                                        this.reset();
                                    }else{
                                        // flow to the sides
                                        this.speed = 1;
                                        this.stepSize = 0;
										
										// console.log("3");

                                        if(parseInt(curX)+1 < this.target.width && colData[parseInt(curX)+1][parseInt(curY)+1] == undefined ){
                                            // go left
                                            this.x++;
                                        }else if(parseInt(curX)-1 > 0 && colData[parseInt(curX)-1][parseInt(curY)+1] == undefined ){
                                            // go right
                                            this.x--;
                                        }else{
                                            //stop
                                            ctx.fillStyle = "#fff";
											ctx.shadowOffsetX = -4;
											ctx.shadowOffsetY = -4;
											ctx.shadowColor = "#000";
											ctx.shadowBlur = 4;
                                            //ctx.fillRect(curX, curY, this.size, this.size);
											
											ctx.beginPath();
											ctx.arc(curX, curY+this.speed+this.size, this.size, 0, Math.PI * 2, true);
											ctx.closePath();
											ctx.fill();
											
                                            colData[parseInt(curX)][parseInt(curY)] = 1;
                                            this.reset();
                                        }
                                    }
                                }
                        }
                    }

                    if(this.x + this.size > (elWidth) - widthOffset || this.x < widthOffset){
                        this.reset();
                    }
                }

                // Resets the snowflake once it reaches one of the bounds set
                this.reset = function(){
                    this.y = 0;
                    this.x = random(widthOffset, elWidth - widthOffset);
                    this.stepSize = random(1,10) / 100;
                    this.size = random((options.minSize * 100), (options.maxSize * 100)) / 100;
                    this.element.style.width = this.size + 'px';
                    this.element.style.height = this.size + 'px';
                    this.speed = random(options.minSpeed, options.maxSpeed);
                }
            }

            // local vars
            var i = 0,
                elHeight = $(element).height(),
                elWidth = $(element).width(),
                widthOffset = 0,
                snowTimeout = 0;

            // Collection Piece ******************************
            if(options.collection !== false){
                var testElem = document.createElement('canvas');
                if(!!(testElem.getContext && testElem.getContext('2d'))){
                    var canvasCollection = [],
                        elements = $(options.collection),
                        collectionHeight = options.collectionHeight;

                    for(var i =0; i < elements.length; i++){
                            var bounds = elements[i].getBoundingClientRect(),
                                $canvas = $('<canvas/>',
                                    {
                                        'class' : 'snowfall-canvas'
                                    }),
                                collisionData = [];

                            if(bounds.top-collectionHeight > 0){
                                $('body').append($canvas);

                                $canvas.css({
                                    'position' : options.flakePosition,
                                    'left'     : bounds.left + 'px',
                                    'top'      : bounds.top-collectionHeight + 'px'
                                })
                                .prop({
                                    width: bounds.width,
                                    height: collectionHeight
                                });

                                for(var w = 0; w < bounds.width; w++){
                                    collisionData[w] = [];
                                }

                                canvasCollection.push({
                                    element : $canvas.get(0), 
                                    x : bounds.left, 
                                    y : bounds.top-collectionHeight, 
                                    width : bounds.width, 
                                    height: collectionHeight, 
                                    colData : collisionData
                                });
                            }
                    }
                }else{
                    // Canvas element isnt supported
                    options.collection = false;
                }
            }
            // ************************************************

            // This will reduce the horizontal scroll bar from displaying, when the effect is applied to the whole page
            if($(element).get(0).tagName === $(document).get(0).tagName){
                widthOffset = 25;
            }

            // Bind the window resize event so we can get the innerHeight again
            $(window).bind("resize", function(){
                elHeight = $(element)[0].clientHeight;
                elWidth = $(element)[0].offsetWidth;
            });


            // initialize the flakes
            for(i = 0; i < options.flakeCount; i+=1){
                flakes.push(new Flake(random(widthOffset,elWidth - widthOffset), random(0, elHeight), random((options.minSize * 100), (options.maxSize * 100)) / 100, random(options.minSpeed, options.maxSpeed)));
            }

            // This adds the style to make the snowflakes round via border radius property
            if(options.round){
                $('.snowfall-flakes').css({'-moz-border-radius' : options.maxSize, '-webkit-border-radius' : options.maxSize, 'border-radius' : options.maxSize});
            }

            // This adds shadows just below the snowflake so they pop a bit on lighter colored web pages
            if(options.shadow){
                $('.snowfall-flakes').css({'-moz-box-shadow' : '1px 1px 1px #555', '-webkit-box-shadow' : '1px 1px 1px #555', 'box-shadow' : '1px 1px 1px #555'});
            }

            // On newer Macbooks Snowflakes will fall based on deviceorientation
            var doRatio = false;
            if (options.deviceorientation) {
                $(window).bind('deviceorientation', function(event) {
                    doRatio = event.originalEvent.gamma * 0.1;
                });
            }

            // this controls flow of the updating snow
            function snow(){
                for( i = 0; i < flakes.length; i += 1){
                    flakes[i].update();
                }

                snowTimeout = requestAnimationFrame(function(){snow()});
            }

            snow();

            // clears the snowflakes
            this.clear = function(){
                $('.snowfall-canvas').remove();
                $(element).children('.snowfall-flakes').remove();
                cancelAnimationFrame(snowTimeout);
            }
    };

    // Initialize the options and the plugin
    $.fn.snowfall = function(options){
        if(typeof(options) == "object" || options == undefined){
                 return this.each(function(i){
                    (new $.snowfall(this, options));
                });
        }else if (typeof(options) == "string") {
            return this.each(function(i){
                var snow = $(this).data('snowfall');
                if(snow){
                    snow.clear();
                }
            });
        }
    };
})(jQuery);