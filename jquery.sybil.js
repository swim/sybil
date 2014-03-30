/**
 * @file
 * jquery.sybil.js
 *
 * Sybil Carousel 0.4
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
    scrollPos: 1.6,
    currentSlide: '.current',
    nextSlide: '.next',
    animationIn: 'slideInLeft',
    animationOut: 'slideOutRight',
    imageSize: 'cover',
    scrollType: 'vertical',
    navigation: false,
    fullscreen: true,
    onScroll: true,
    autoPlay: true,
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

    this.images = this.config.images;
    this.count = this.config.images.length;
    this.currentSlide = 0;

    this.current = this.$instance.find(this.config.currentSlide);
    this.next = this.$instance.find(this.config.nextSlide);

    if (this.count > 1) {
      this.setup();
    }

    return this;
  };

  /**
   * Handles setup of default values, settings & elements.
   */
  sybil.prototype.setup = function() {
    // Set defaults.
    this.current.addClass(this.config.animationIn);
    this.current.css('background-size', this.config.imageSize);
    this.current.css('background-image', 'url(' + this.images[0] + ')');

    this.next.addClass('hidden');
    this.next.css('background-image', this.config.imageSize);
    this.next.css('background-image', 'url(' + this.images[1] + ')');

    // Convert animationSpeed to CSS valid property.
    var animationSpeed = this.config.animationSpeed / 1000 + 's';

    // Set default animation speed.
    this.current.css('animation-duration', animationSpeed);
    this.next.css('animation-duration', animationSpeed);

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
   * Handles on scroll events providing a
   * parallax effect.
   */
  sybil.prototype.watcher = function () {
    var scrollType = this.config.scrollType;
    var scrollPos = this.config.scrollPos;
    var current = this.current;
    var next = this.next;

    $(window).scroll(function(scroll) {
      if (scrollType == 'vertical') {
        var scroll = 'center ' + $(window).scrollTop() * scrollPos + 'px';
      }
      else if (scrollType == 'horizontal') {
        var scroll = '-' + $(window).scrollTop() * scrollPos + 'px center';
      }

      current.css('background-position', scroll);
      next.css('background-position', scroll);
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
    this.next.css('background-image', 'url(' + this.images[this.nextSlide] + ')');
    this.current.addClass(this.config.animationOut);
  };

  /**
   * Handles current slide transition.
   */
  sybil.prototype.currentAnimation = function() {
    var sybil = this;

    setTimeout(function() {
      sybil.current.css('background-image', 'url(' + sybil.images[sybil.nextSlide] + ')');
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
