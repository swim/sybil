/**
 * @file
 * jquery.sybil.js
 *
 * Sybil is not a carousel replacement but an image feature wall
 * component. Sybil aims to provide a lightweight solution for 
 * parallax image containers.
 *
 * @todo
 * - Attempt preloading of slide images.
 * - Support json format.
 */

(function ($, undefined) {
  'use strict';

  var defaults = {
    speed: 7500,
    animationSpeed: 3000,
    scrollPos: 1.1,
    currentSlide: '.current',
    nextSlide: '.next',
    animationIn: 'bounceInUp',
    animationOut: 'bounceOutUp',
    imageSize: 'cover',
    scrollType: 'vertical',
    navigation: false,
    fullscreen: true,
    onScroll: true,
    autoPlay: true,
    preLoad: true,
    loop: true,
    onchange: '',
    images: []
  };

  /**
   * Handles Sybil instance.
   */
  function sybil(instance, options) {
    this.instance = instance;
    this.$instance = $(instance);
    this.config = $.extend({}, defaults, options, this.$instance.data());

    this.image = [];
    this.loaded = false;
    this.images = this.config.images;
    this.count = this.config.images.length;
    this.currentSlide = 0;

    this.current = this.$instance.find(this.config.currentSlide);
    this.next = this.$instance.find(this.config.nextSlide);

    if (this.count) {
      this.setup();
    }

    return this;
  };

  /**
   * Handles setup of Sybil.
   */
  sybil.prototype.setup = function() {
    this.setDefaults();

    if (this.config.fullscreen) {
      var height = $(window).height();
      this.current.css('height', height);
      this.next.css('height', height);
    }

    if (this.config.onScroll) {
      this.watcher();
    }

    if (this.config.autoPlay) {
      this.play();
    }
  };

  /**
   * Handles default settings.
   */
  sybil.prototype.setDefaults = function() {
    if (this.config.preLoad) {
      for (var i in this.images) {
        this.loadImage(this.images[i], true);
      }
    }
    else {
      // Pre load first images only, 
      // rest are loaded after slide transition.
      this.loadImage(this.images[0], true);
      this.loadImage(this.images[1], true);
    }

    // Set default settings.
    this.current.addClass(this.config.animationIn);
    this.current.css('background-size', this.config.imageSize);

    this.next.addClass('hidden');
    this.next.css('background-image', this.config.imageSize);

    // Convert animationSpeed to CSS valid property.
    var animationSpeed = this.config.animationSpeed / 1000 + 's';

    // Set animation speed.
    this.current.css('animation-duration', animationSpeed);
    this.next.css('animation-duration', animationSpeed);
  };
  
  /**
   * Load image by path.
   */
  sybil.prototype.loadImage = function(src, preload) {
    var sybil = this;

    var loadImage = function(deferred) {
      var image = new Image();
      image.onload = loaded;

      function loaded() {
        unbindEvents();

        sybil.loaded = true;
        sybil.image.push(image);
        deferred.resolve(image);

        // Update scroll position.
        sybil.watcher();

        if (preload) {
          // Default images.
          sybil.current.css('background-image', 'url(' + sybil.image[0].src + ')');

          if (typeof sybil.image[1] != 'undefined') {
            sybil.next.css('background-image', 'url(' + sybil.image[1].src + ')');
          }
        }
      }

      // Image path.
      image.src = src;

      function unbindEvents() {
        image.onload = null;
      }
    }

    return $.Deferred(loadImage).promise();
  };

  /**
   * Handles on scroll events providing a
   * parallax effect.
   */
  sybil.prototype.watcher = function() {
    var sybil = this;
    var currentSlide = sybil.currentSlide;

    $(window).scroll(function() {
      var difference = $(window).scrollTop();

      // Check if image height is greater than scroll height.
      if (typeof currentSlide === 'undefined') {
        currentSlide = 0;
      }

      if (sybil.loaded) {
        if ($(window).scrollTop() > sybil.image[currentSlide].height) {
          var difference = $(window).scrollTop() - sybil.image[currentSlide].height;
        }

        if (sybil.config.scrollType == 'vertical') {
          var scroll = 'center ' + difference * sybil.config.scrollPos + 'px';
        }
        else if (sybil.config.scrollType == 'horizontal') {
          var scroll = '-' + difference * sybil.config.scrollPos + 'px center';
        }

        sybil.current.css('background-position', scroll);
        sybil.next.css('background-position', scroll);
      }
    });

    // Set default scroll position.
    $(window).scroll();
  };

  /**
   * Initiate carousel instance.
   */
  sybil.prototype.play = function() {
    var sybil = this;

    this.timeoutID = setTimeout(function() {
      sybil.goTo('next');
    }, this.config.speed);
  };

  /**
   * Go to slide index or navigate to
   * next or previous.
   */
  sybil.prototype.goTo = function(slide) {
    if (slide == 'next') {
      slide = this.currentSlide + 1;
    }

    if (slide >= this.count) {
      slide = this.config.loop ? 0 : this.count - 1;
    }

    if (slide != this.currentSlide) {
      this.nextSlide = slide;
      this.slide();
    }

    if (!this.config.loop && slide == this.count) {
      this.stop();
    }

    this.play();

    if (this.config.onchange) {
      this.config.onchange.call(this, this.slide);
    }
  };

  /**
   * Handles slide animation.
   */
  sybil.prototype.slide = function() {
    // Slide speed must be greater than animation speed.
    if (this.config.speed < this.config.animationSpeed) {
      this.config.speed = this.config.animationSpeed;
    }

    this.nextAnimation();
    this.currentAnimation();
    this.reset();
  };

  /**
   * Handles next slide transition.
   */
  sybil.prototype.nextAnimation = function() {
    this.next.addClass(this.config.animationIn);
    this.next.css('background-size', this.config.imageSize);
    this.next.css('background-image', 'url(' + this.image[this.nextSlide].src + ')');
    this.current.addClass(this.config.animationOut);
  };

  /**
   * Handles current slide transition.
   */
  sybil.prototype.currentAnimation = function() {
    var sybil = this;

    setTimeout(function() {
      sybil.current.css('background-image', 'url(' + sybil.image[sybil.nextSlide].src + ')');
      sybil.current.removeClass(sybil.config.animationOut);
      // Provide as option? idk.
      sybil.next.removeClass(sybil.config.animationIn);
    }, this.config.animationSpeed);
  };

  /**
   * Stop Sybil.
   */
  sybil.prototype.stop = function() {
    this.paused = true;
    clearTimeout(this.timeoutID);
  };

  /**
   * Reset Sybil after slide animation.
   */
  sybil.prototype.reset = function() {
    this.currentSlide = this.nextSlide;

    if (this.currentSlide == 1) {
      // Remove initial animation class.
      this.current.removeClass(this.config.animationIn);
      this.next.removeClass('hidden');
    }
  };

  /**
   * Attach.
   */
  $.fn.extend({
    sybil: function(options) {
      return this.each(function() {
        if (!$.data(this, 'sybil')) {
          $.data(this, 'sybil', new sybil(this, options));
        }
      });
    }
  });

})(jQuery);
