(function () {
  'use strict';

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  /*!
   * GSAP 3.5.1
   * https://greensock.com
   *
   * @license Copyright 2008-2020, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */

  /* eslint-disable */
  var _config = {
    autoSleep: 120,
    force3D: "auto",
    nullTargetWarn: 1,
    units: {
      lineHeight: ""
    }
  },
      _defaults = {
    duration: .5,
    overwrite: false,
    delay: 0
  },
      _bigNum = 1e8,
      _tinyNum = 1 / _bigNum,
      _2PI = Math.PI * 2,
      _HALF_PI = _2PI / 4,
      _gsID = 0,
      _sqrt = Math.sqrt,
      _cos = Math.cos,
      _sin = Math.sin,
      _isString = function _isString(value) {
    return typeof value === "string";
  },
      _isFunction = function _isFunction(value) {
    return typeof value === "function";
  },
      _isNumber = function _isNumber(value) {
    return typeof value === "number";
  },
      _isUndefined = function _isUndefined(value) {
    return typeof value === "undefined";
  },
      _isObject = function _isObject(value) {
    return typeof value === "object";
  },
      _isNotFalse = function _isNotFalse(value) {
    return value !== false;
  },
      _windowExists = function _windowExists() {
    return typeof window !== "undefined";
  },
      _isFuncOrString = function _isFuncOrString(value) {
    return _isFunction(value) || _isString(value);
  },
      _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
      // note: IE10 has ArrayBuffer, but NOT ArrayBuffer.isView().
  _isArray = Array.isArray,
      _strictNumExp = /(?:-?\.?\d|\.)+/gi,
      //only numbers (including negatives and decimals) but NOT relative values.
  _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-\+]*\d*/g,
      //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
  _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
      _complexStringNumExp = /[-+=.]*\d+(?:\.|e-|e)*\d*/gi,
      //duplicate so that while we're looping through matches from exec(), it doesn't contaminate the lastIndex of _numExp which we use to search for colors too.
  _relExp = /[+-]=-?[\.\d]+/,
      _delimitedValueExp = /[#\-+.]*\b[a-z\d-=+%.]+/gi,
      _globalTimeline,
      _win,
      _coreInitted,
      _doc,
      _globals = {},
      _installScope = {},
      _coreReady,
      _install = function _install(scope) {
    return (_installScope = _merge(scope, _globals)) && gsap;
  },
      _missingPlugin = function _missingPlugin(property, value) {
    return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
  },
      _warn = function _warn(message, suppress) {
    return !suppress && console.warn(message);
  },
      _addGlobal = function _addGlobal(name, obj) {
    return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
  },
      _emptyFunc = function _emptyFunc() {
    return 0;
  },
      _reservedProps = {},
      _lazyTweens = [],
      _lazyLookup = {},
      _lastRenderedFrame,
      _plugins = {},
      _effects = {},
      _nextGCFrame = 30,
      _harnessPlugins = [],
      _callbackNames = "",
      _harness = function _harness(targets) {
    var target = targets[0],
        harnessPlugin,
        i;
    _isObject(target) || _isFunction(target) || (targets = [targets]);

    if (!(harnessPlugin = (target._gsap || {}).harness)) {
      i = _harnessPlugins.length;

      while (i-- && !_harnessPlugins[i].targetTest(target)) {}

      harnessPlugin = _harnessPlugins[i];
    }

    i = targets.length;

    while (i--) {
      targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
    }

    return targets;
  },
      _getCache = function _getCache(target) {
    return target._gsap || _harness(toArray(target))[0]._gsap;
  },
      _getProperty = function _getProperty(target, property, v) {
    return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
  },
      _forEachName = function _forEachName(names, func) {
    return (names = names.split(",")).forEach(func) || names;
  },
      //split a comma-delimited list of names into an array, then run a forEach() function and return the split array (this is just a way to consolidate/shorten some code).
  _round = function _round(value) {
    return Math.round(value * 100000) / 100000 || 0;
  },
      _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
    //searches one array to find matches for any of the items in the toFind array. As soon as one is found, it returns true. It does NOT return all the matches; it's simply a boolean search.
    var l = toFind.length,
        i = 0;

    for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}

    return i < l;
  },
      _parseVars = function _parseVars(params, type, parent) {
    //reads the arguments passed to one of the key methods and figures out if the user is defining things with the OLD/legacy syntax where the duration is the 2nd parameter, and then it adjusts things accordingly and spits back the corrected vars object (with the duration added if necessary, as well as runBackwards or startAt or immediateRender). type 0 = to()/staggerTo(), 1 = from()/staggerFrom(), 2 = fromTo()/staggerFromTo()
    var isLegacy = _isNumber(params[1]),
        varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
        vars = params[varsIndex],
        irVars;

    isLegacy && (vars.duration = params[1]);
    vars.parent = parent;

    if (type) {
      irVars = vars;

      while (parent && !("immediateRender" in irVars)) {
        // inheritance hasn't happened yet, but someone may have set a default in an ancestor timeline. We could do vars.immediateRender = _isNotFalse(_inheritDefaults(vars).immediateRender) but that'd exact a slight performance penalty because _inheritDefaults() also runs in the Tween constructor. We're paying a small kb price here to gain speed.
        irVars = parent.vars.defaults || {};
        parent = _isNotFalse(parent.vars.inherit) && parent.parent;
      }

      vars.immediateRender = _isNotFalse(irVars.immediateRender);
      type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1]; // "from" vars
    }

    return vars;
  },
      _lazyRender = function _lazyRender() {
    var l = _lazyTweens.length,
        a = _lazyTweens.slice(0),
        i,
        tween;

    _lazyLookup = {};
    _lazyTweens.length = 0;

    for (i = 0; i < l; i++) {
      tween = a[i];
      tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
    }
  },
      _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
    _lazyTweens.length && _lazyRender();
    animation.render(time, suppressEvents, force);
    _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
  },
      _numericIfPossible = function _numericIfPossible(value) {
    var n = parseFloat(value);
    return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
  },
      _passThrough = function _passThrough(p) {
    return p;
  },
      _setDefaults = function _setDefaults(obj, defaults) {
    for (var p in defaults) {
      p in obj || (obj[p] = defaults[p]);
    }

    return obj;
  },
      _setKeyframeDefaults = function _setKeyframeDefaults(obj, defaults) {
    for (var p in defaults) {
      p in obj || p === "duration" || p === "ease" || (obj[p] = defaults[p]);
    }
  },
      _merge = function _merge(base, toMerge) {
    for (var p in toMerge) {
      base[p] = toMerge[p];
    }

    return base;
  },
      _mergeDeep = function _mergeDeep(base, toMerge) {
    for (var p in toMerge) {
      base[p] = _isObject(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p];
    }

    return base;
  },
      _copyExcluding = function _copyExcluding(obj, excluding) {
    var copy = {},
        p;

    for (p in obj) {
      p in excluding || (copy[p] = obj[p]);
    }

    return copy;
  },
      _inheritDefaults = function _inheritDefaults(vars) {
    var parent = vars.parent || _globalTimeline,
        func = vars.keyframes ? _setKeyframeDefaults : _setDefaults;

    if (_isNotFalse(vars.inherit)) {
      while (parent) {
        func(vars, parent.vars.defaults);
        parent = parent.parent || parent._dp;
      }
    }

    return vars;
  },
      _arraysMatch = function _arraysMatch(a1, a2) {
    var i = a1.length,
        match = i === a2.length;

    while (match && i-- && a1[i] === a2[i]) {}

    return i < 0;
  },
      _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
    if (firstProp === void 0) {
      firstProp = "_first";
    }

    if (lastProp === void 0) {
      lastProp = "_last";
    }

    var prev = parent[lastProp],
        t;

    if (sortBy) {
      t = child[sortBy];

      while (prev && prev[sortBy] > t) {
        prev = prev._prev;
      }
    }

    if (prev) {
      child._next = prev._next;
      prev._next = child;
    } else {
      child._next = parent[firstProp];
      parent[firstProp] = child;
    }

    if (child._next) {
      child._next._prev = child;
    } else {
      parent[lastProp] = child;
    }

    child._prev = prev;
    child.parent = child._dp = parent;
    return child;
  },
      _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
    if (firstProp === void 0) {
      firstProp = "_first";
    }

    if (lastProp === void 0) {
      lastProp = "_last";
    }

    var prev = child._prev,
        next = child._next;

    if (prev) {
      prev._next = next;
    } else if (parent[firstProp] === child) {
      parent[firstProp] = next;
    }

    if (next) {
      next._prev = prev;
    } else if (parent[lastProp] === child) {
      parent[lastProp] = prev;
    }

    child._next = child._prev = child.parent = null; // don't delete the _dp just so we can revert if necessary. But parent should be null to indicate the item isn't in a linked list.
  },
      _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
    child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
    child._act = 0;
  },
      _uncache = function _uncache(animation, child) {
    if (animation && (!child || child._end > animation._dur || child._start < 0)) {
      // performance optimization: if a child animation is passed in we should only uncache if that child EXTENDS the animation (its end time is beyond the end)
      var a = animation;

      while (a) {
        a._dirty = 1;
        a = a.parent;
      }
    }

    return animation;
  },
      _recacheAncestors = function _recacheAncestors(animation) {
    var parent = animation.parent;

    while (parent && parent.parent) {
      //sometimes we must force a re-sort of all children and update the duration/totalDuration of all ancestor timelines immediately in case, for example, in the middle of a render loop, one tween alters another tween's timeScale which shoves its startTime before 0, forcing the parent timeline to shift around and shiftChildren() which could affect that next tween's render (startTime). Doesn't matter for the root timeline though.
      parent._dirty = 1;
      parent.totalDuration();
      parent = parent.parent;
    }

    return animation;
  },
      _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
    return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
  },
      _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
    return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
  },
      // feed in the totalTime and cycleDuration and it'll return the cycle (iteration minus 1) and if the playhead is exactly at the very END, it will NOT bump up to the next cycle.
  _animationCycle = function _animationCycle(tTime, cycleDuration) {
    return (tTime /= cycleDuration) && ~~tTime === tTime ? ~~tTime - 1 : ~~tTime;
  },
      _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
    return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
  },
      _setEnd = function _setEnd(animation) {
    return animation._end = _round(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
  },
      _alignPlayhead = function _alignPlayhead(animation, totalTime) {
    // adjusts the animation's _start and _end according to the provided totalTime (only if the parent's smoothChildTiming is true and the animation isn't paused). It doesn't do any rendering or forcing things back into parent timelines, etc. - that's what totalTime() is for.
    var parent = animation._dp;

    if (parent && parent.smoothChildTiming && animation._ts) {
      animation._start = _round(animation._dp._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));

      _setEnd(animation);

      parent._dirty || _uncache(parent, animation); //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
    }

    return animation;
  },

  /*
  _totalTimeToTime = (clampedTotalTime, duration, repeat, repeatDelay, yoyo) => {
  	let cycleDuration = duration + repeatDelay,
  		time = _round(clampedTotalTime % cycleDuration);
  	if (time > duration) {
  		time = duration;
  	}
  	return (yoyo && (~~(clampedTotalTime / cycleDuration) & 1)) ? duration - time : time;
  },
  */
  _postAddChecks = function _postAddChecks(timeline, child) {
    var t;

    if (child._time || child._initted && !child._dur) {
      //in case, for example, the _start is moved on a tween that has already rendered. Imagine it's at its end state, then the startTime is moved WAY later (after the end of this timeline), it should render at its beginning.
      t = _parentToChildTotalTime(timeline.rawTime(), child);

      if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
        child.render(t, true);
      }
    } //if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.


    if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
      //in case any of the ancestors had completed but should now be enabled...
      if (timeline._dur < timeline.duration()) {
        t = timeline;

        while (t._dp) {
          t.rawTime() >= 0 && t.totalTime(t._tTime); //moves the timeline (shifts its startTime) if necessary, and also enables it. If it's currently zero, though, it may not be scheduled to render until later so there's no need to force it to align with the current playhead position. Only move to catch up with the playhead.

          t = t._dp;
        }
      }

      timeline._zTime = -_tinyNum; // helps ensure that the next render() will be forced (crossingStart = true in render()), even if the duration hasn't changed (we're adding a child which would need to get rendered). Definitely an edge case. Note: we MUST do this AFTER the loop above where the totalTime() might trigger a render() because this _addToTimeline() method gets called from the Animation constructor, BEFORE tweens even record their targets, etc. so we wouldn't want things to get triggered in the wrong order.
    }
  },
      _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
    child.parent && _removeFromParent(child);
    child._start = _round(position + child._delay);
    child._end = _round(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));

    _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);

    timeline._recent = child;
    skipChecks || _postAddChecks(timeline, child);
    return timeline;
  },
      _scrollTrigger = function _scrollTrigger(animation, trigger) {
    return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
  },
      _attemptInitTween = function _attemptInitTween(tween, totalTime, force, suppressEvents) {
    _initTween(tween, totalTime);

    if (!tween._initted) {
      return 1;
    }

    if (!force && tween._pt && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
      _lazyTweens.push(tween);

      tween._lazy = [totalTime, suppressEvents];
      return 1;
    }
  },
      _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
    var prevRatio = tween.ratio,
        ratio = totalTime < 0 || !totalTime && prevRatio && !tween._start && tween._zTime > _tinyNum && !tween._dp._lock || (tween._ts < 0 || tween._dp._ts < 0) && tween.data !== "isFromStart" && tween.data !== "isStart" ? 0 : 1,
        // check parent's _lock because when a timeline repeats/yoyos and does its artificial wrapping, we shouldn't force the ratio back to 0. Also, if the tween or its parent is reversed and the totalTime is 0, we should go to a ratio of 0.
    repeatDelay = tween._rDelay,
        tTime = 0,
        pt,
        iteration,
        prevIteration;

    if (repeatDelay && tween._repeat) {
      // in case there's a zero-duration tween that has a repeat with a repeatDelay
      tTime = _clamp(0, tween._tDur, totalTime);
      iteration = _animationCycle(tTime, repeatDelay);
      prevIteration = _animationCycle(tween._tTime, repeatDelay);

      if (iteration !== prevIteration) {
        prevRatio = 1 - ratio;
        tween.vars.repeatRefresh && tween._initted && tween.invalidate();
      }
    }

    if (ratio !== prevRatio || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
      if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents)) {
        // if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
        return;
      }

      prevIteration = tween._zTime;
      tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0); // when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

      suppressEvents || (suppressEvents = totalTime && !prevIteration); // if it was rendered previously at exactly 0 (_zTime) and now the playhead is moving away, DON'T fire callbacks otherwise they'll seem like duplicates.

      tween.ratio = ratio;
      tween._from && (ratio = 1 - ratio);
      tween._time = 0;
      tween._tTime = tTime;
      suppressEvents || _callback(tween, "onStart");
      pt = tween._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }

      tween._startAt && totalTime < 0 && tween._startAt.render(totalTime, true, true);
      tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
      tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");

      if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
        ratio && _removeFromParent(tween, 1);

        if (!suppressEvents) {
          _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);

          tween._prom && tween._prom();
        }
      }
    } else if (!tween._zTime) {
      tween._zTime = totalTime;
    }
  },
      _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
    var child;

    if (time > prevTime) {
      child = animation._first;

      while (child && child._start <= time) {
        if (!child._dur && child.data === "isPause" && child._start > prevTime) {
          return child;
        }

        child = child._next;
      }
    } else {
      child = animation._last;

      while (child && child._start >= time) {
        if (!child._dur && child.data === "isPause" && child._start < prevTime) {
          return child;
        }

        child = child._prev;
      }
    }
  },
      _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
    var repeat = animation._repeat,
        dur = _round(duration) || 0,
        totalProgress = animation._tTime / animation._tDur;
    totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
    animation._dur = dur;
    animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _round(dur * (repeat + 1) + animation._rDelay * repeat);
    totalProgress && !leavePlayhead ? _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress) : animation.parent && _setEnd(animation);
    skipUncache || _uncache(animation.parent, animation);
    return animation;
  },
      _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
    return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
  },
      _zeroPosition = {
    _start: 0,
    endTime: _emptyFunc
  },
      _parsePosition = function _parsePosition(animation, position) {
    var labels = animation.labels,
        recent = animation._recent || _zeroPosition,
        clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur,
        //in case there's a child that infinitely repeats, users almost never intend for the insertion point of a new child to be based on a SUPER long value like that so we clip it and assume the most recently-added child's endTime should be used instead.
    i,
        offset;

    if (_isString(position) && (isNaN(position) || position in labels)) {
      //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
      i = position.charAt(0);

      if (i === "<" || i === ">") {
        return (i === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0);
      }

      i = position.indexOf("=");

      if (i < 0) {
        position in labels || (labels[position] = clippedDuration);
        return labels[position];
      }

      offset = +(position.charAt(i - 1) + position.substr(i + 1));
      return i > 1 ? _parsePosition(animation, position.substr(0, i - 1)) + offset : clippedDuration + offset;
    }

    return position == null ? clippedDuration : +position;
  },
      _conditionalReturn = function _conditionalReturn(value, func) {
    return value || value === 0 ? func(value) : func;
  },
      _clamp = function _clamp(min, max, value) {
    return value < min ? min : value > max ? max : value;
  },
      getUnit = function getUnit(value) {
    return (value = (value + "").substr((parseFloat(value) + "").length)) && isNaN(value) ? value : "";
  },
      // note: protect against padded numbers as strings, like "100.100". That shouldn't return "00" as the unit. If it's numeric, return no unit.
  clamp = function clamp(min, max, value) {
    return _conditionalReturn(value, function (v) {
      return _clamp(min, max, v);
    });
  },
      _slice = [].slice,
      _isArrayLike = function _isArrayLike(value, nonEmpty) {
    return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
  },
      _flatten = function _flatten(ar, leaveStrings, accumulator) {
    if (accumulator === void 0) {
      accumulator = [];
    }

    return ar.forEach(function (value) {
      var _accumulator;

      return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
    }) || accumulator;
  },
      //takes any value and returns an array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
  toArray = function toArray(value, leaveStrings) {
    return _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call(_doc.querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
  },
      shuffle = function shuffle(a) {
    return a.sort(function () {
      return .5 - Math.random();
    });
  },
      // alternative that's a bit faster and more reliably diverse but bigger:   for (let j, v, i = a.length; i; j = Math.floor(Math.random() * i), v = a[--i], a[i] = a[j], a[j] = v); return a;
  //for distributing values across an array. Can accept a number, a function or (most commonly) a function which can contain the following properties: {base, amount, from, ease, grid, axis, length, each}. Returns a function that expects the following parameters: index, target, array. Recognizes the following
  distribute = function distribute(v) {
    if (_isFunction(v)) {
      return v;
    }

    var vars = _isObject(v) ? v : {
      each: v
    },
        //n:1 is just to indicate v was a number; we leverage that later to set v according to the length we get. If a number is passed in, we treat it like the old stagger value where 0.1, for example, would mean that things would be distributed with 0.1 between each element in the array rather than a total "amount" that's chunked out among them all.
    ease = _parseEase(vars.ease),
        from = vars.from || 0,
        base = parseFloat(vars.base) || 0,
        cache = {},
        isDecimal = from > 0 && from < 1,
        ratios = isNaN(from) || isDecimal,
        axis = vars.axis,
        ratioX = from,
        ratioY = from;

    if (_isString(from)) {
      ratioX = ratioY = {
        center: .5,
        edges: .5,
        end: 1
      }[from] || 0;
    } else if (!isDecimal && ratios) {
      ratioX = from[0];
      ratioY = from[1];
    }

    return function (i, target, a) {
      var l = (a || vars).length,
          distances = cache[l],
          originX,
          originY,
          x,
          y,
          d,
          j,
          max,
          min,
          wrapAt;

      if (!distances) {
        wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum])[1];

        if (!wrapAt) {
          max = -_bigNum;

          while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}

          wrapAt--;
        }

        distances = cache[l] = [];
        originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
        originY = ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
        max = 0;
        min = _bigNum;

        for (j = 0; j < l; j++) {
          x = j % wrapAt - originX;
          y = originY - (j / wrapAt | 0);
          distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
          d > max && (max = d);
          d < min && (min = d);
        }

        from === "random" && shuffle(distances);
        distances.max = max - min;
        distances.min = min;
        distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
        distances.b = l < 0 ? base - l : base;
        distances.u = getUnit(vars.amount || vars.each) || 0; //unit

        ease = ease && l < 0 ? _invertEase(ease) : ease;
      }

      l = (distances[i] - distances.min) / distances.max || 0;
      return _round(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u; //round in order to work around floating point errors
    };
  },
      _roundModifier = function _roundModifier(v) {
    //pass in 0.1 get a function that'll round to the nearest tenth, or 5 to round to the closest 5, or 0.001 to the closest 1000th, etc.
    var p = v < 1 ? Math.pow(10, (v + "").length - 2) : 1; //to avoid floating point math errors (like 24 * 0.1 == 2.4000000000000004), we chop off at a specific number of decimal places (much faster than toFixed()

    return function (raw) {
      return Math.floor(Math.round(parseFloat(raw) / v) * v * p) / p + (_isNumber(raw) ? 0 : getUnit(raw));
    };
  },
      snap = function snap(snapTo, value) {
    var isArray = _isArray(snapTo),
        radius,
        is2D;

    if (!isArray && _isObject(snapTo)) {
      radius = isArray = snapTo.radius || _bigNum;

      if (snapTo.values) {
        snapTo = toArray(snapTo.values);

        if (is2D = !_isNumber(snapTo[0])) {
          radius *= radius; //performance optimization so we don't have to Math.sqrt() in the loop.
        }
      } else {
        snapTo = _roundModifier(snapTo.increment);
      }
    }

    return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function (raw) {
      is2D = snapTo(raw);
      return Math.abs(is2D - raw) <= radius ? is2D : raw;
    } : function (raw) {
      var x = parseFloat(is2D ? raw.x : raw),
          y = parseFloat(is2D ? raw.y : 0),
          min = _bigNum,
          closest = 0,
          i = snapTo.length,
          dx,
          dy;

      while (i--) {
        if (is2D) {
          dx = snapTo[i].x - x;
          dy = snapTo[i].y - y;
          dx = dx * dx + dy * dy;
        } else {
          dx = Math.abs(snapTo[i] - x);
        }

        if (dx < min) {
          min = dx;
          closest = i;
        }
      }

      closest = !radius || min <= radius ? snapTo[closest] : raw;
      return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
    });
  },
      random = function random(min, max, roundingIncrement, returnFunction) {
    return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
      return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min + Math.random() * (max - min)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
    });
  },
      pipe = function pipe() {
    for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
      functions[_key] = arguments[_key];
    }

    return function (value) {
      return functions.reduce(function (v, f) {
        return f(v);
      }, value);
    };
  },
      unitize = function unitize(func, unit) {
    return function (value) {
      return func(parseFloat(value)) + (unit || getUnit(value));
    };
  },
      normalize = function normalize(min, max, value) {
    return mapRange(min, max, 0, 1, value);
  },
      _wrapArray = function _wrapArray(a, wrapper, value) {
    return _conditionalReturn(value, function (index) {
      return a[~~wrapper(index)];
    });
  },
      wrap = function wrap(min, max, value) {
    // NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes problems (unrelated to GSAP).
    var range = max - min;
    return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
      return (range + (value - min) % range) % range + min;
    });
  },
      wrapYoyo = function wrapYoyo(min, max, value) {
    var range = max - min,
        total = range * 2;
    return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
      value = (total + (value - min) % total) % total || 0;
      return min + (value > range ? total - value : value);
    });
  },
      _replaceRandom = function _replaceRandom(value) {
    //replaces all occurrences of random(...) in a string with the calculated random value. can be a range like random(-100, 100, 5) or an array like random([0, 100, 500])
    var prev = 0,
        s = "",
        i,
        nums,
        end,
        isArray;

    while (~(i = value.indexOf("random(", prev))) {
      end = value.indexOf(")", i);
      isArray = value.charAt(i + 7) === "[";
      nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
      s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
      prev = end + 1;
    }

    return s + value.substr(prev, value.length - prev);
  },
      mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
    var inRange = inMax - inMin,
        outRange = outMax - outMin;
    return _conditionalReturn(value, function (value) {
      return outMin + ((value - inMin) / inRange * outRange || 0);
    });
  },
      interpolate = function interpolate(start, end, progress, mutate) {
    var func = isNaN(start + end) ? 0 : function (p) {
      return (1 - p) * start + p * end;
    };

    if (!func) {
      var isString = _isString(start),
          master = {},
          p,
          i,
          interpolators,
          l,
          il;

      progress === true && (mutate = 1) && (progress = null);

      if (isString) {
        start = {
          p: start
        };
        end = {
          p: end
        };
      } else if (_isArray(start) && !_isArray(end)) {
        interpolators = [];
        l = start.length;
        il = l - 2;

        for (i = 1; i < l; i++) {
          interpolators.push(interpolate(start[i - 1], start[i])); //build the interpolators up front as a performance optimization so that when the function is called many times, it can just reuse them.
        }

        l--;

        func = function func(p) {
          p *= l;
          var i = Math.min(il, ~~p);
          return interpolators[i](p - i);
        };

        progress = end;
      } else if (!mutate) {
        start = _merge(_isArray(start) ? [] : {}, start);
      }

      if (!interpolators) {
        for (p in end) {
          _addPropTween.call(master, start, p, "get", end[p]);
        }

        func = function func(p) {
          return _renderPropTweens(p, master) || (isString ? start.p : start);
        };
      }
    }

    return _conditionalReturn(progress, func);
  },
      _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
    //used for nextLabel() and previousLabel()
    var labels = timeline.labels,
        min = _bigNum,
        p,
        distance,
        label;

    for (p in labels) {
      distance = labels[p] - fromTime;

      if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
        label = p;
        min = distance;
      }
    }

    return label;
  },
      _callback = function _callback(animation, type, executeLazyFirst) {
    var v = animation.vars,
        callback = v[type],
        params,
        scope;

    if (!callback) {
      return;
    }

    params = v[type + "Params"];
    scope = v.callbackScope || animation;
    executeLazyFirst && _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.

    return params ? callback.apply(scope, params) : callback.call(scope);
  },
      _interrupt = function _interrupt(animation) {
    _removeFromParent(animation);

    animation.progress() < 1 && _callback(animation, "onInterrupt");
    return animation;
  },
      _quickTween,
      _createPlugin = function _createPlugin(config) {
    config = !config.name && config["default"] || config; //UMD packaging wraps things oddly, so for example MotionPathHelper becomes {MotionPathHelper:MotionPathHelper, default:MotionPathHelper}.

    var name = config.name,
        isFunc = _isFunction(config),
        Plugin = name && !isFunc && config.init ? function () {
      this._props = [];
    } : config,
        //in case someone passes in an object that's not a plugin, like CustomEase
    instanceDefaults = {
      init: _emptyFunc,
      render: _renderPropTweens,
      add: _addPropTween,
      kill: _killPropTweensOf,
      modifier: _addPluginModifier,
      rawVars: 0
    },
        statics = {
      targetTest: 0,
      get: 0,
      getSetter: _getSetter,
      aliases: {},
      register: 0
    };

    _wake();

    if (config !== Plugin) {
      if (_plugins[name]) {
        return;
      }

      _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics)); //static methods


      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics))); //instance methods


      _plugins[Plugin.prop = name] = Plugin;

      if (config.targetTest) {
        _harnessPlugins.push(Plugin);

        _reservedProps[name] = 1;
      }

      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin"; //for the global name. "motionPath" should become MotionPathPlugin
    }

    _addGlobal(name, Plugin);

    config.register && config.register(gsap, Plugin, PropTween);
  },

  /*
   * --------------------------------------------------------------------------------------
   * COLORS
   * --------------------------------------------------------------------------------------
   */
  _255 = 255,
      _colorLookup = {
    aqua: [0, _255, _255],
    lime: [0, _255, 0],
    silver: [192, 192, 192],
    black: [0, 0, 0],
    maroon: [128, 0, 0],
    teal: [0, 128, 128],
    blue: [0, 0, _255],
    navy: [0, 0, 128],
    white: [_255, _255, _255],
    olive: [128, 128, 0],
    yellow: [_255, _255, 0],
    orange: [_255, 165, 0],
    gray: [128, 128, 128],
    purple: [128, 0, 128],
    green: [0, 128, 0],
    red: [_255, 0, 0],
    pink: [_255, 192, 203],
    cyan: [0, _255, _255],
    transparent: [_255, _255, _255, 0]
  },
      _hue = function _hue(h, m1, m2) {
    h = h < 0 ? h + 1 : h > 1 ? h - 1 : h;
    return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
  },
      splitColor = function splitColor(v, toHSL, forceAlpha) {
    var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
        r,
        g,
        b,
        h,
        s,
        l,
        max,
        min,
        d,
        wasHSL;

    if (!a) {
      if (v.substr(-1) === ",") {
        //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
        v = v.substr(0, v.length - 1);
      }

      if (_colorLookup[v]) {
        a = _colorLookup[v];
      } else if (v.charAt(0) === "#") {
        if (v.length === 4) {
          //for shorthand like #9F0
          r = v.charAt(1);
          g = v.charAt(2);
          b = v.charAt(3);
          v = "#" + r + r + g + g + b + b;
        }

        v = parseInt(v.substr(1), 16);
        a = [v >> 16, v >> 8 & _255, v & _255];
      } else if (v.substr(0, 3) === "hsl") {
        a = wasHSL = v.match(_strictNumExp);

        if (!toHSL) {
          h = +a[0] % 360 / 360;
          s = +a[1] / 100;
          l = +a[2] / 100;
          g = l <= .5 ? l * (s + 1) : l + s - l * s;
          r = l * 2 - g;
          a.length > 3 && (a[3] *= 1); //cast as number

          a[0] = _hue(h + 1 / 3, r, g);
          a[1] = _hue(h, r, g);
          a[2] = _hue(h - 1 / 3, r, g);
        } else if (~v.indexOf("=")) {
          //if relative values are found, just return the raw strings with the relative prefixes in place.
          a = v.match(_numExp);
          forceAlpha && a.length < 4 && (a[3] = 1);
          return a;
        }
      } else {
        a = v.match(_strictNumExp) || _colorLookup.transparent;
      }

      a = a.map(Number);
    }

    if (toHSL && !wasHSL) {
      r = a[0] / _255;
      g = a[1] / _255;
      b = a[2] / _255;
      max = Math.max(r, g, b);
      min = Math.min(r, g, b);
      l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        h *= 60;
      }

      a[0] = ~~(h + .5);
      a[1] = ~~(s * 100 + .5);
      a[2] = ~~(l * 100 + .5);
    }

    forceAlpha && a.length < 4 && (a[3] = 1);
    return a;
  },
      _colorOrderData = function _colorOrderData(v) {
    // strips out the colors from the string, finds all the numeric slots (with units) and returns an array of those. The Array also has a "c" property which is an Array of the index values where the colors belong. This is to help work around issues where there's a mis-matched order of color/numeric data like drop-shadow(#f00 0px 1px 2px) and drop-shadow(0x 1px 2px #f00). This is basically a helper function used in _formatColors()
    var values = [],
        c = [],
        i = -1;
    v.split(_colorExp).forEach(function (v) {
      var a = v.match(_numWithUnitExp) || [];
      values.push.apply(values, a);
      c.push(i += a.length + 1);
    });
    values.c = c;
    return values;
  },
      _formatColors = function _formatColors(s, toHSL, orderMatchData) {
    var result = "",
        colors = (s + result).match(_colorExp),
        type = toHSL ? "hsla(" : "rgba(",
        i = 0,
        c,
        shell,
        d,
        l;

    if (!colors) {
      return s;
    }

    colors = colors.map(function (color) {
      return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
    });

    if (orderMatchData) {
      d = _colorOrderData(s);
      c = orderMatchData.c;

      if (c.join(result) !== d.c.join(result)) {
        shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
        l = shell.length - 1;

        for (; i < l; i++) {
          result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
        }
      }
    }

    if (!shell) {
      shell = s.split(_colorExp);
      l = shell.length - 1;

      for (; i < l; i++) {
        result += shell[i] + colors[i];
      }
    }

    return result + shell[l];
  },
      _colorExp = function () {
    var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b",
        //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.,
    p;

    for (p in _colorLookup) {
      s += "|" + p + "\\b";
    }

    return new RegExp(s + ")", "gi");
  }(),
      _hslExp = /hsl[a]?\(/,
      _colorStringFilter = function _colorStringFilter(a) {
    var combined = a.join(" "),
        toHSL;
    _colorExp.lastIndex = 0;

    if (_colorExp.test(combined)) {
      toHSL = _hslExp.test(combined);
      a[1] = _formatColors(a[1], toHSL);
      a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1])); // make sure the order of numbers/colors match with the END value.

      return true;
    }
  },

  /*
   * --------------------------------------------------------------------------------------
   * TICKER
   * --------------------------------------------------------------------------------------
   */
  _tickerActive,
      _ticker = function () {
    var _getTime = Date.now,
        _lagThreshold = 500,
        _adjustedLag = 33,
        _startTime = _getTime(),
        _lastUpdate = _startTime,
        _gap = 1000 / 240,
        _nextTime = _gap,
        _listeners = [],
        _id,
        _req,
        _raf,
        _self,
        _delta,
        _i,
        _tick = function _tick(v) {
      var elapsed = _getTime() - _lastUpdate,
          manual = v === true,
          overlap,
          dispatch,
          time,
          frame;

      elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
      _lastUpdate += elapsed;
      time = _lastUpdate - _startTime;
      overlap = time - _nextTime;

      if (overlap > 0 || manual) {
        frame = ++_self.frame;
        _delta = time - _self.time * 1000;
        _self.time = time = time / 1000;
        _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
        dispatch = 1;
      }

      manual || (_id = _req(_tick)); //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.

      if (dispatch) {
        for (_i = 0; _i < _listeners.length; _i++) {
          // use _i and check _listeners.length instead of a variable because a listener could get removed during the loop, and if that happens to an element less than the current index, it'd throw things off in the loop.
          _listeners[_i](time, _delta, frame, v);
        }
      }
    };

    _self = {
      time: 0,
      frame: 0,
      tick: function tick() {
        _tick(true);
      },
      deltaRatio: function deltaRatio(fps) {
        return _delta / (1000 / (fps || 60));
      },
      wake: function wake() {
        if (_coreReady) {
          if (!_coreInitted && _windowExists()) {
            _win = _coreInitted = window;
            _doc = _win.document || {};
            _globals.gsap = gsap;
            (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);

            _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});

            _raf = _win.requestAnimationFrame;
          }

          _id && _self.sleep();

          _req = _raf || function (f) {
            return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
          };

          _tickerActive = 1;

          _tick(2);
        }
      },
      sleep: function sleep() {
        (_raf ? _win.cancelAnimationFrame : clearTimeout)(_id);
        _tickerActive = 0;
        _req = _emptyFunc;
      },
      lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
        _lagThreshold = threshold || 1 / _tinyNum; //zero should be interpreted as basically unlimited

        _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
      },
      fps: function fps(_fps) {
        _gap = 1000 / (_fps || 240);
        _nextTime = _self.time * 1000 + _gap;
      },
      add: function add(callback) {
        _listeners.indexOf(callback) < 0 && _listeners.push(callback);

        _wake();
      },
      remove: function remove(callback) {
        var i;
        ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
      },
      _listeners: _listeners
    };
    return _self;
  }(),
      _wake = function _wake() {
    return !_tickerActive && _ticker.wake();
  },
      //also ensures the core classes are initialized.

  /*
  * -------------------------------------------------
  * EASING
  * -------------------------------------------------
  */
  _easeMap = {},
      _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
      _quotesExp = /["']/g,
      _parseObjectInString = function _parseObjectInString(value) {
    //takes a string like "{wiggles:10, type:anticipate})" and turns it into a real object. Notice it ends in ")" and includes the {} wrappers. This is because we only use this function for parsing ease configs and prioritized optimization rather than reusability.
    var obj = {},
        split = value.substr(1, value.length - 3).split(":"),
        key = split[0],
        i = 1,
        l = split.length,
        index,
        val,
        parsedVal;

    for (; i < l; i++) {
      val = split[i];
      index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
      parsedVal = val.substr(0, index);
      obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
      key = val.substr(index + 1).trim();
    }

    return obj;
  },
      _valueInParentheses = function _valueInParentheses(value) {
    var open = value.indexOf("(") + 1,
        close = value.indexOf(")"),
        nested = value.indexOf("(", open);
    return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
  },
      _configEaseFromString = function _configEaseFromString(name) {
    //name can be a string like "elastic.out(1,0.5)", and pass in _easeMap as obj and it'll parse it out and call the actual function like _easeMap.Elastic.easeOut.config(1,0.5). It will also parse custom ease strings as long as CustomEase is loaded and registered (internally as _easeMap._CE).
    var split = (name + "").split("("),
        ease = _easeMap[split[0]];
    return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
  },
      _invertEase = function _invertEase(ease) {
    return function (p) {
      return 1 - ease(1 - p);
    };
  },
      // allow yoyoEase to be set in children and have those affected when the parent/ancestor timeline yoyos.
  _propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
    var child = timeline._first,
        ease;

    while (child) {
      if (child instanceof Timeline) {
        _propagateYoyoEase(child, isYoyo);
      } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
        if (child.timeline) {
          _propagateYoyoEase(child.timeline, isYoyo);
        } else {
          ease = child._ease;
          child._ease = child._yEase;
          child._yEase = ease;
          child._yoyo = isYoyo;
        }
      }

      child = child._next;
    }
  },
      _parseEase = function _parseEase(ease, defaultEase) {
    return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
  },
      _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
    if (easeOut === void 0) {
      easeOut = function easeOut(p) {
        return 1 - easeIn(1 - p);
      };
    }

    if (easeInOut === void 0) {
      easeInOut = function easeInOut(p) {
        return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
      };
    }

    var ease = {
      easeIn: easeIn,
      easeOut: easeOut,
      easeInOut: easeInOut
    },
        lowercaseName;

    _forEachName(names, function (name) {
      _easeMap[name] = _globals[name] = ease;
      _easeMap[lowercaseName = name.toLowerCase()] = easeOut;

      for (var p in ease) {
        _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
      }
    });

    return ease;
  },
      _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
    return function (p) {
      return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
    };
  },
      _configElastic = function _configElastic(type, amplitude, period) {
    var p1 = amplitude >= 1 ? amplitude : 1,
        //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
    p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
        p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
        easeOut = function easeOut(p) {
      return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
    },
        ease = type === "out" ? easeOut : type === "in" ? function (p) {
      return 1 - easeOut(1 - p);
    } : _easeInOutFromOut(easeOut);

    p2 = _2PI / p2; //precalculate to optimize

    ease.config = function (amplitude, period) {
      return _configElastic(type, amplitude, period);
    };

    return ease;
  },
      _configBack = function _configBack(type, overshoot) {
    if (overshoot === void 0) {
      overshoot = 1.70158;
    }

    var easeOut = function easeOut(p) {
      return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
    },
        ease = type === "out" ? easeOut : type === "in" ? function (p) {
      return 1 - easeOut(1 - p);
    } : _easeInOutFromOut(easeOut);

    ease.config = function (overshoot) {
      return _configBack(type, overshoot);
    };

    return ease;
  }; // a cheaper (kb and cpu) but more mild way to get a parameterized weighted ease by feeding in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
  // _weightedEase = ratio => {
  // 	let y = 0.5 + ratio / 2;
  // 	return p => (2 * (1 - p) * p * y + p * p);
  // },
  // a stronger (but more expensive kb/cpu) parameterized weighted ease that lets you feed in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
  // _weightedEaseStrong = ratio => {
  // 	ratio = .5 + ratio / 2;
  // 	let o = 1 / 3 * (ratio < .5 ? ratio : 1 - ratio),
  // 		b = ratio - o,
  // 		c = ratio + o;
  // 	return p => p === 1 ? p : 3 * b * (1 - p) * (1 - p) * p + 3 * c * (1 - p) * p * p + p * p * p;
  // };


  _forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
    var power = i < 5 ? i + 1 : i;

    _insertEase(name + ",Power" + (power - 1), i ? function (p) {
      return Math.pow(p, power);
    } : function (p) {
      return p;
    }, function (p) {
      return 1 - Math.pow(1 - p, power);
    }, function (p) {
      return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
    });
  });

  _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;

  _insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());

  (function (n, c) {
    var n1 = 1 / c,
        n2 = 2 * n1,
        n3 = 2.5 * n1,
        easeOut = function easeOut(p) {
      return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
    };

    _insertEase("Bounce", function (p) {
      return 1 - easeOut(1 - p);
    }, easeOut);
  })(7.5625, 2.75);

  _insertEase("Expo", function (p) {
    return p ? Math.pow(2, 10 * (p - 1)) : 0;
  });

  _insertEase("Circ", function (p) {
    return -(_sqrt(1 - p * p) - 1);
  });

  _insertEase("Sine", function (p) {
    return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
  });

  _insertEase("Back", _configBack("in"), _configBack("out"), _configBack());

  _easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
    config: function config(steps, immediateStart) {
      if (steps === void 0) {
        steps = 1;
      }

      var p1 = 1 / steps,
          p2 = steps + (immediateStart ? 0 : 1),
          p3 = immediateStart ? 1 : 0,
          max = 1 - _tinyNum;
      return function (p) {
        return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
      };
    }
  };
  _defaults.ease = _easeMap["quad.out"];

  _forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
    return _callbackNames += name + "," + name + "Params,";
  });
  /*
   * --------------------------------------------------------------------------------------
   * CACHE
   * --------------------------------------------------------------------------------------
   */


  var GSCache = function GSCache(target, harness) {
    this.id = _gsID++;
    target._gsap = this;
    this.target = target;
    this.harness = harness;
    this.get = harness ? harness.get : _getProperty;
    this.set = harness ? harness.getSetter : _getSetter;
  };
  /*
   * --------------------------------------------------------------------------------------
   * ANIMATION
   * --------------------------------------------------------------------------------------
   */

  var Animation = /*#__PURE__*/function () {
    function Animation(vars, time) {
      var parent = vars.parent || _globalTimeline;
      this.vars = vars;
      this._delay = +vars.delay || 0;

      if (this._repeat = vars.repeat || 0) {
        this._rDelay = vars.repeatDelay || 0;
        this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
      }

      this._ts = 1;

      _setDuration(this, +vars.duration, 1, 1);

      this.data = vars.data;
      _tickerActive || _ticker.wake();
      parent && _addToTimeline(parent, this, time || time === 0 ? time : parent._time, 1);
      vars.reversed && this.reverse();
      vars.paused && this.paused(true);
    }

    var _proto = Animation.prototype;

    _proto.delay = function delay(value) {
      if (value || value === 0) {
        this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
        this._delay = value;
        return this;
      }

      return this._delay;
    };

    _proto.duration = function duration(value) {
      return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
    };

    _proto.totalDuration = function totalDuration(value) {
      if (!arguments.length) {
        return this._tDur;
      }

      this._dirty = 0;
      return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
    };

    _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
      _wake();

      if (!arguments.length) {
        return this._tTime;
      }

      var parent = this._dp;

      if (parent && parent.smoothChildTiming && this._ts) {
        _alignPlayhead(this, _totalTime); //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The start of that child would get pushed out, but one of the ancestors may have completed.


        while (parent.parent) {
          if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
            parent.totalTime(parent._tTime, true);
          }

          parent = parent.parent;
        }

        if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
          //if the animation doesn't have a parent, put it back into its last parent (recorded as _dp for exactly cases like this). Limit to parents with autoRemoveChildren (like globalTimeline) so that if the user manually removes an animation from a timeline and then alters its playhead, it doesn't get added back in.
          _addToTimeline(this._dp, this, this._start - this._delay);
        }
      }

      if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
        // check for _ptLookup on a Tween instance to ensure it has actually finished being instantiated, otherwise if this.reverse() gets called in the Animation constructor, it could trigger a render() here even though the _targets weren't populated, thus when _init() is called there won't be any PropTweens (it'll act like the tween is non-functional)
        this._ts || (this._pTime = _totalTime); // otherwise, if an animation is paused, then the playhead is moved back to zero, then resumed, it'd revert back to the original time at the pause

        _lazySafeRender(this, _totalTime, suppressEvents);
      }

      return this;
    };

    _proto.time = function time(value, suppressEvents) {
      return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % this._dur || (value ? this._dur : 0), suppressEvents) : this._time; // note: if the modulus results in 0, the playhead could be exactly at the end or the beginning, and we always defer to the END with a non-zero value, otherwise if you set the time() to the very end (duration()), it would render at the START!
    };

    _proto.totalProgress = function totalProgress(value, suppressEvents) {
      return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
    };

    _proto.progress = function progress(value, suppressEvents) {
      return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
    };

    _proto.iteration = function iteration(value, suppressEvents) {
      var cycleDuration = this.duration() + this._rDelay;

      return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
    } // potential future addition:
    // isPlayingBackwards() {
    // 	let animation = this,
    // 		orientation = 1; // 1 = forward, -1 = backward
    // 	while (animation) {
    // 		orientation *= animation.reversed() || (animation.repeat() && !(animation.iteration() & 1)) ? -1 : 1;
    // 		animation = animation.parent;
    // 	}
    // 	return orientation < 0;
    // }
    ;

    _proto.timeScale = function timeScale(value) {
      if (!arguments.length) {
        return this._rts === -_tinyNum ? 0 : this._rts; // recorded timeScale. Special case: if someone calls reverse() on an animation with timeScale of 0, we assign it -_tinyNum to remember it's reversed.
      }

      if (this._rts === value) {
        return this;
      }

      var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime; // make sure to do the parentToChildTotalTime() BEFORE setting the new _ts because the old one must be used in that calculation.
      // prioritize rendering where the parent's playhead lines up instead of this._tTime because there could be a tween that's animating another tween's timeScale in the same rendering loop (same parent), thus if the timeScale tween renders first, it would alter _start BEFORE _tTime was set on that tick (in the rendering loop), effectively freezing it until the timeScale tween finishes.

      this._rts = +value || 0;
      this._ts = this._ps || value === -_tinyNum ? 0 : this._rts; // _ts is the functional timeScale which would be 0 if the animation is paused.

      return _recacheAncestors(this.totalTime(_clamp(-this._delay, this._tDur, tTime), true));
    };

    _proto.paused = function paused(value) {
      if (!arguments.length) {
        return this._ps;
      }

      if (this._ps !== value) {
        this._ps = value;

        if (value) {
          this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()); // if the pause occurs during the delay phase, make sure that's factored in when resuming.

          this._ts = this._act = 0; // _ts is the functional timeScale, so a paused tween would effectively have a timeScale of 0. We record the "real" timeScale as _rts (recorded time scale)
        } else {
          _wake();

          this._ts = this._rts; //only defer to _pTime (pauseTime) if tTime is zero. Remember, someone could pause() an animation, then scrub the playhead and resume(). If the parent doesn't have smoothChildTiming, we render at the rawTime() because the startTime won't get updated.

          this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && (this._tTime -= _tinyNum) && Math.abs(this._zTime) !== _tinyNum); // edge case: animation.progress(1).pause().play() wouldn't render again because the playhead is already at the end, but the call to totalTime() below will add it back to its parent...and not remove it again (since removing only happens upon rendering at a new time). Offsetting the _tTime slightly is done simply to cause the final render in totalTime() that'll pop it off its timeline (if autoRemoveChildren is true, of course). Check to make sure _zTime isn't -_tinyNum to avoid an edge case where the playhead is pushed to the end but INSIDE a tween/callback, the timeline itself is paused thus halting rendering and leaving a few unrendered. When resuming, it wouldn't render those otherwise.
        }
      }

      return this;
    };

    _proto.startTime = function startTime(value) {
      if (arguments.length) {
        this._start = value;
        var parent = this.parent || this._dp;
        parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
        return this;
      }

      return this._start;
    };

    _proto.endTime = function endTime(includeRepeats) {
      return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts);
    };

    _proto.rawTime = function rawTime(wrapRepeats) {
      var parent = this.parent || this._dp; // _dp = detatched parent

      return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
    };

    _proto.globalTime = function globalTime(rawTime) {
      var animation = this,
          time = arguments.length ? rawTime : animation.rawTime();

      while (animation) {
        time = animation._start + time / (animation._ts || 1);
        animation = animation._dp;
      }

      return time;
    };

    _proto.repeat = function repeat(value) {
      if (arguments.length) {
        this._repeat = value;
        return _onUpdateTotalDuration(this);
      }

      return this._repeat;
    };

    _proto.repeatDelay = function repeatDelay(value) {
      if (arguments.length) {
        this._rDelay = value;
        return _onUpdateTotalDuration(this);
      }

      return this._rDelay;
    };

    _proto.yoyo = function yoyo(value) {
      if (arguments.length) {
        this._yoyo = value;
        return this;
      }

      return this._yoyo;
    };

    _proto.seek = function seek(position, suppressEvents) {
      return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
    };

    _proto.restart = function restart(includeDelay, suppressEvents) {
      return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
    };

    _proto.play = function play(from, suppressEvents) {
      from != null && this.seek(from, suppressEvents);
      return this.reversed(false).paused(false);
    };

    _proto.reverse = function reverse(from, suppressEvents) {
      from != null && this.seek(from || this.totalDuration(), suppressEvents);
      return this.reversed(true).paused(false);
    };

    _proto.pause = function pause(atTime, suppressEvents) {
      atTime != null && this.seek(atTime, suppressEvents);
      return this.paused(true);
    };

    _proto.resume = function resume() {
      return this.paused(false);
    };

    _proto.reversed = function reversed(value) {
      if (arguments.length) {
        !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0)); // in case timeScale is zero, reversing would have no effect so we use _tinyNum.

        return this;
      }

      return this._rts < 0;
    };

    _proto.invalidate = function invalidate() {
      this._initted = 0;
      this._zTime = -_tinyNum;
      return this;
    };

    _proto.isActive = function isActive() {
      var parent = this.parent || this._dp,
          start = this._start,
          rawTime;
      return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
    };

    _proto.eventCallback = function eventCallback(type, callback, params) {
      var vars = this.vars;

      if (arguments.length > 1) {
        if (!callback) {
          delete vars[type];
        } else {
          vars[type] = callback;
          params && (vars[type + "Params"] = params);
          type === "onUpdate" && (this._onUpdate = callback);
        }

        return this;
      }

      return vars[type];
    };

    _proto.then = function then(onFulfilled) {
      var self = this;
      return new Promise(function (resolve) {
        var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough,
            _resolve = function _resolve() {
          var _then = self.then;
          self.then = null; // temporarily null the then() method to avoid an infinite loop (see https://github.com/greensock/GSAP/issues/322)

          _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
          resolve(f);
          self.then = _then;
        };

        if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
          _resolve();
        } else {
          self._prom = _resolve;
        }
      });
    };

    _proto.kill = function kill() {
      _interrupt(this);
    };

    return Animation;
  }();

  _setDefaults(Animation.prototype, {
    _time: 0,
    _start: 0,
    _end: 0,
    _tTime: 0,
    _tDur: 0,
    _dirty: 0,
    _repeat: 0,
    _yoyo: false,
    parent: null,
    _initted: false,
    _rDelay: 0,
    _ts: 1,
    _dp: 0,
    ratio: 0,
    _zTime: -_tinyNum,
    _prom: 0,
    _ps: false,
    _rts: 1
  });
  /*
   * -------------------------------------------------
   * TIMELINE
   * -------------------------------------------------
   */


  var Timeline = /*#__PURE__*/function (_Animation) {
    _inheritsLoose(Timeline, _Animation);

    function Timeline(vars, time) {
      var _this;

      if (vars === void 0) {
        vars = {};
      }

      _this = _Animation.call(this, vars, time) || this;
      _this.labels = {};
      _this.smoothChildTiming = !!vars.smoothChildTiming;
      _this.autoRemoveChildren = !!vars.autoRemoveChildren;
      _this._sort = _isNotFalse(vars.sortChildren);
      _this.parent && _postAddChecks(_this.parent, _assertThisInitialized(_this));
      vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
      return _this;
    }

    var _proto2 = Timeline.prototype;

    _proto2.to = function to(targets, vars, position) {
      new Tween(targets, _parseVars(arguments, 0, this), _parsePosition(this, _isNumber(vars) ? arguments[3] : position));
      return this;
    };

    _proto2.from = function from(targets, vars, position) {
      new Tween(targets, _parseVars(arguments, 1, this), _parsePosition(this, _isNumber(vars) ? arguments[3] : position));
      return this;
    };

    _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
      new Tween(targets, _parseVars(arguments, 2, this), _parsePosition(this, _isNumber(fromVars) ? arguments[4] : position));
      return this;
    };

    _proto2.set = function set(targets, vars, position) {
      vars.duration = 0;
      vars.parent = this;
      _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
      vars.immediateRender = !!vars.immediateRender;
      new Tween(targets, vars, _parsePosition(this, position), 1);
      return this;
    };

    _proto2.call = function call(callback, params, position) {
      return _addToTimeline(this, Tween.delayedCall(0, callback, params), _parsePosition(this, position));
    } //ONLY for backward compatibility! Maybe delete?
    ;

    _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
      vars.duration = duration;
      vars.stagger = vars.stagger || stagger;
      vars.onComplete = onCompleteAll;
      vars.onCompleteParams = onCompleteAllParams;
      vars.parent = this;
      new Tween(targets, vars, _parsePosition(this, position));
      return this;
    };

    _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
      vars.runBackwards = 1;
      _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
      return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
    };

    _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
      toVars.startAt = fromVars;
      _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
      return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
    };

    _proto2.render = function render(totalTime, suppressEvents, force) {
      var prevTime = this._time,
          tDur = this._dirty ? this.totalDuration() : this._tDur,
          dur = this._dur,
          tTime = this !== _globalTimeline && totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
          crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
          time,
          child,
          next,
          iteration,
          cycleDuration,
          prevPaused,
          pauseTween,
          timeScale,
          prevStart,
          prevIteration,
          yoyo,
          isYoyo;

      if (tTime !== this._tTime || force || crossingStart) {
        if (prevTime !== this._time && dur) {
          //if totalDuration() finds a child with a negative startTime and smoothChildTiming is true, things get shifted around internally so we need to adjust the time accordingly. For example, if a tween starts at -30 we must shift EVERYTHING forward 30 seconds and move this timeline's startTime backward by 30 seconds so that things align with the playhead (no jump).
          tTime += this._time - prevTime;
          totalTime += this._time - prevTime;
        }

        time = tTime;
        prevStart = this._start;
        timeScale = this._ts;
        prevPaused = !timeScale;

        if (crossingStart) {
          dur || (prevTime = this._zTime); //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

          (totalTime || !suppressEvents) && (this._zTime = totalTime);
        }

        if (this._repeat) {
          //adjust the time for repeats and yoyos
          yoyo = this._yoyo;
          cycleDuration = dur + this._rDelay;
          time = _round(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

          if (tTime === tDur) {
            // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
            iteration = this._repeat;
            time = dur;
          } else {
            iteration = ~~(tTime / cycleDuration);

            if (iteration && iteration === tTime / cycleDuration) {
              time = dur;
              iteration--;
            }

            time > dur && (time = dur);
          }

          prevIteration = _animationCycle(this._tTime, cycleDuration);
          !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration); // edge case - if someone does addPause() at the very beginning of a repeating timeline, that pause is technically at the same spot as the end which causes this._time to get set to 0 when the totalTime would normally place the playhead at the end. See https://greensock.com/forums/topic/23823-closing-nav-animation-not-working-on-ie-and-iphone-6-maybe-other-older-browser/?tab=comments#comment-113005

          if (yoyo && iteration & 1) {
            time = dur - time;
            isYoyo = 1;
          }
          /*
          make sure children at the end/beginning of the timeline are rendered properly. If, for example,
          a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
          would get translated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
          could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
          we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
          ensure that zero-duration tweens at the very beginning or end of the Timeline work.
          */


          if (iteration !== prevIteration && !this._lock) {
            var rewinding = yoyo && prevIteration & 1,
                doesWrap = rewinding === (yoyo && iteration & 1);
            iteration < prevIteration && (rewinding = !rewinding);
            prevTime = rewinding ? 0 : dur;
            this._lock = 1;
            this.render(prevTime || (isYoyo ? 0 : _round(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
            !suppressEvents && this.parent && _callback(this, "onRepeat");
            this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);

            if (prevTime !== this._time || prevPaused !== !this._ts) {
              return this;
            }

            dur = this._dur; // in case the duration changed in the onRepeat

            tDur = this._tDur;

            if (doesWrap) {
              this._lock = 2;
              prevTime = rewinding ? dur : -0.0001;
              this.render(prevTime, true);
              this.vars.repeatRefresh && !isYoyo && this.invalidate();
            }

            this._lock = 0;

            if (!this._ts && !prevPaused) {
              return this;
            } //in order for yoyoEase to work properly when there's a stagger, we must swap out the ease in each sub-tween.


            _propagateYoyoEase(this, isYoyo);
          }
        }

        if (this._hasPause && !this._forcing && this._lock < 2) {
          pauseTween = _findNextPauseTween(this, _round(prevTime), _round(time));

          if (pauseTween) {
            tTime -= time - (time = pauseTween._start);
          }
        }

        this._tTime = tTime;
        this._time = time;
        this._act = !timeScale; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

        if (!this._initted) {
          this._onUpdate = this.vars.onUpdate;
          this._initted = 1;
          this._zTime = totalTime;
        }

        !prevTime && time && !suppressEvents && _callback(this, "onStart");

        if (time >= prevTime && totalTime >= 0) {
          child = this._first;

          while (child) {
            next = child._next;

            if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
              if (child.parent !== this) {
                // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
                return this.render(totalTime, suppressEvents, force);
              }

              child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);

              if (time !== this._time || !this._ts && !prevPaused) {
                //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
                pauseTween = 0;
                next && (tTime += this._zTime = -_tinyNum); // it didn't finish rendering, so flag zTime as negative so that so that the next time render() is called it'll be forced (to render any remaining children)

                break;
              }
            }

            child = next;
          }
        } else {
          child = this._last;
          var adjustedTime = totalTime < 0 ? totalTime : time; //when the playhead goes backward beyond the start of this timeline, we must pass that information down to the child animations so that zero-duration tweens know whether to render their starting or ending values.

          while (child) {
            next = child._prev;

            if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
              if (child.parent !== this) {
                // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
                return this.render(totalTime, suppressEvents, force);
              }

              child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force);

              if (time !== this._time || !this._ts && !prevPaused) {
                //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
                pauseTween = 0;
                next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum); // it didn't finish rendering, so adjust zTime so that so that the next time render() is called it'll be forced (to render any remaining children)

                break;
              }
            }

            child = next;
          }
        }

        if (pauseTween && !suppressEvents) {
          this.pause();
          pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;

          if (this._ts) {
            //the callback resumed playback! So since we may have held back the playhead due to where the pause is positioned, go ahead and jump to where it's SUPPOSED to be (if no pause happened).
            this._start = prevStart; //if the pause was at an earlier time and the user resumed in the callback, it could reposition the timeline (changing its startTime), throwing things off slightly, so we make sure the _start doesn't shift.

            _setEnd(this);

            return this.render(totalTime, suppressEvents, force);
          }
        }

        this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
        if (tTime === tDur && tDur >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
          (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

          if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
            _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

            this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
          }
        }
      }

      return this;
    };

    _proto2.add = function add(child, position) {
      var _this2 = this;

      if (!_isNumber(position)) {
        position = _parsePosition(this, position);
      }

      if (!(child instanceof Animation)) {
        if (_isArray(child)) {
          child.forEach(function (obj) {
            return _this2.add(obj, position);
          });
          return this;
        }

        if (_isString(child)) {
          return this.addLabel(child, position);
        }

        if (_isFunction(child)) {
          child = Tween.delayedCall(0, child);
        } else {
          return this;
        }
      }

      return this !== child ? _addToTimeline(this, child, position) : this; //don't allow a timeline to be added to itself as a child!
    };

    _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
      if (nested === void 0) {
        nested = true;
      }

      if (tweens === void 0) {
        tweens = true;
      }

      if (timelines === void 0) {
        timelines = true;
      }

      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = -_bigNum;
      }

      var a = [],
          child = this._first;

      while (child) {
        if (child._start >= ignoreBeforeTime) {
          if (child instanceof Tween) {
            tweens && a.push(child);
          } else {
            timelines && a.push(child);
            nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
          }
        }

        child = child._next;
      }

      return a;
    };

    _proto2.getById = function getById(id) {
      var animations = this.getChildren(1, 1, 1),
          i = animations.length;

      while (i--) {
        if (animations[i].vars.id === id) {
          return animations[i];
        }
      }
    };

    _proto2.remove = function remove(child) {
      if (_isString(child)) {
        return this.removeLabel(child);
      }

      if (_isFunction(child)) {
        return this.killTweensOf(child);
      }

      _removeLinkedListItem(this, child);

      if (child === this._recent) {
        this._recent = this._last;
      }

      return _uncache(this);
    };

    _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
      if (!arguments.length) {
        return this._tTime;
      }

      this._forcing = 1;

      if (!this._dp && this._ts) {
        //special case for the global timeline (or any other that has no parent or detached parent).
        this._start = _round(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
      }

      _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);

      this._forcing = 0;
      return this;
    };

    _proto2.addLabel = function addLabel(label, position) {
      this.labels[label] = _parsePosition(this, position);
      return this;
    };

    _proto2.removeLabel = function removeLabel(label) {
      delete this.labels[label];
      return this;
    };

    _proto2.addPause = function addPause(position, callback, params) {
      var t = Tween.delayedCall(0, callback || _emptyFunc, params);
      t.data = "isPause";
      this._hasPause = 1;
      return _addToTimeline(this, t, _parsePosition(this, position));
    };

    _proto2.removePause = function removePause(position) {
      var child = this._first;
      position = _parsePosition(this, position);

      while (child) {
        if (child._start === position && child.data === "isPause") {
          _removeFromParent(child);
        }

        child = child._next;
      }
    };

    _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      var tweens = this.getTweensOf(targets, onlyActive),
          i = tweens.length;

      while (i--) {
        _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
      }

      return this;
    };

    _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
      var a = [],
          parsedTargets = toArray(targets),
          child = this._first,
          isGlobalTime = _isNumber(onlyActive),
          // a number is interpreted as a global time. If the animation spans
      children;

      while (child) {
        if (child instanceof Tween) {
          if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
            // note: if this is for overwriting, it should only be for tweens that aren't paused and are initted.
            a.push(child);
          }
        } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
          a.push.apply(a, children);
        }

        child = child._next;
      }

      return a;
    };

    _proto2.tweenTo = function tweenTo(position, vars) {
      vars = vars || {};

      var tl = this,
          endTime = _parsePosition(tl, position),
          _vars = vars,
          startAt = _vars.startAt,
          _onStart = _vars.onStart,
          onStartParams = _vars.onStartParams,
          tween = Tween.to(tl, _setDefaults(vars, {
        ease: "none",
        lazy: false,
        time: endTime,
        overwrite: "auto",
        duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
        onStart: function onStart() {
          tl.pause();
          var duration = vars.duration || Math.abs((endTime - tl._time) / tl.timeScale());
          tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
          _onStart && _onStart.apply(tween, onStartParams || []); //in case the user had an onStart in the vars - we don't want to overwrite it.
        }
      }));

      return tween;
    };

    _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
      return this.tweenTo(toPosition, _setDefaults({
        startAt: {
          time: _parsePosition(this, fromPosition)
        }
      }, vars));
    };

    _proto2.recent = function recent() {
      return this._recent;
    };

    _proto2.nextLabel = function nextLabel(afterTime) {
      if (afterTime === void 0) {
        afterTime = this._time;
      }

      return _getLabelInDirection(this, _parsePosition(this, afterTime));
    };

    _proto2.previousLabel = function previousLabel(beforeTime) {
      if (beforeTime === void 0) {
        beforeTime = this._time;
      }

      return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
    };

    _proto2.currentLabel = function currentLabel(value) {
      return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
    };

    _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
      if (ignoreBeforeTime === void 0) {
        ignoreBeforeTime = 0;
      }

      var child = this._first,
          labels = this.labels,
          p;

      while (child) {
        if (child._start >= ignoreBeforeTime) {
          child._start += amount;
          child._end += amount;
        }

        child = child._next;
      }

      if (adjustLabels) {
        for (p in labels) {
          if (labels[p] >= ignoreBeforeTime) {
            labels[p] += amount;
          }
        }
      }

      return _uncache(this);
    };

    _proto2.invalidate = function invalidate() {
      var child = this._first;
      this._lock = 0;

      while (child) {
        child.invalidate();
        child = child._next;
      }

      return _Animation.prototype.invalidate.call(this);
    };

    _proto2.clear = function clear(includeLabels) {
      if (includeLabels === void 0) {
        includeLabels = true;
      }

      var child = this._first,
          next;

      while (child) {
        next = child._next;
        this.remove(child);
        child = next;
      }

      this._time = this._tTime = this._pTime = 0;
      includeLabels && (this.labels = {});
      return _uncache(this);
    };

    _proto2.totalDuration = function totalDuration(value) {
      var max = 0,
          self = this,
          child = self._last,
          prevStart = _bigNum,
          prev,
          start,
          parent;

      if (arguments.length) {
        return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
      }

      if (self._dirty) {
        parent = self.parent;

        while (child) {
          prev = child._prev; //record it here in case the tween changes position in the sequence...

          child._dirty && child.totalDuration(); //could change the tween._startTime, so make sure the animation's cache is clean before analyzing it.

          start = child._start;

          if (start > prevStart && self._sort && child._ts && !self._lock) {
            //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
            self._lock = 1; //prevent endless recursive calls - there are methods that get triggered that check duration/totalDuration when we add().

            _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
          } else {
            prevStart = start;
          }

          if (start < 0 && child._ts) {
            //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
            max -= start;

            if (!parent && !self._dp || parent && parent.smoothChildTiming) {
              self._start += start / self._ts;
              self._time -= start;
              self._tTime -= start;
            }

            self.shiftChildren(-start, false, -1e999);
            prevStart = 0;
          }

          child._end > max && child._ts && (max = child._end);
          child = prev;
        }

        _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);

        self._dirty = 0;
      }

      return self._tDur;
    };

    Timeline.updateRoot = function updateRoot(time) {
      if (_globalTimeline._ts) {
        _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));

        _lastRenderedFrame = _ticker.frame;
      }

      if (_ticker.frame >= _nextGCFrame) {
        _nextGCFrame += _config.autoSleep || 120;
        var child = _globalTimeline._first;
        if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
          while (child && !child._ts) {
            child = child._next;
          }

          child || _ticker.sleep();
        }
      }
    };

    return Timeline;
  }(Animation);

  _setDefaults(Timeline.prototype, {
    _lock: 0,
    _hasPause: 0,
    _forcing: 0
  });

  var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
    //note: we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
    var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
        index = 0,
        matchIndex = 0,
        result,
        startNums,
        color,
        endNum,
        chunk,
        startNum,
        hasRandom,
        a;
    pt.b = start;
    pt.e = end;
    start += ""; //ensure values are strings

    end += "";

    if (hasRandom = ~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }

    if (stringFilter) {
      a = [start, end];
      stringFilter(a, target, prop); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.

      start = a[0];
      end = a[1];
    }

    startNums = start.match(_complexStringNumExp) || [];

    while (result = _complexStringNumExp.exec(end)) {
      endNum = result[0];
      chunk = end.substring(index, result.index);

      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(") {
        color = 1;
      }

      if (endNum !== startNums[matchIndex++]) {
        startNum = parseFloat(startNums[matchIndex - 1]) || 0; //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: endNum.charAt(1) === "=" ? parseFloat(endNum.substr(2)) * (endNum.charAt(0) === "-" ? -1 : 1) : parseFloat(endNum) - startNum,
          m: color && color < 4 ? Math.round : 0
        };
        index = _complexStringNumExp.lastIndex;
      }
    }

    pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)

    pt.fp = funcParam;

    if (_relExp.test(end) || hasRandom) {
      pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
    }

    this._pt = pt; //start the linked list with this new PropTween. Remember, we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.

    return pt;
  },
      _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam) {
    _isFunction(end) && (end = end(index || 0, target, targets));
    var currentValue = target[prop],
        parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
        setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
        pt;

    if (_isString(end)) {
      if (~end.indexOf("random(")) {
        end = _replaceRandom(end);
      }

      if (end.charAt(1) === "=") {
        end = parseFloat(parsedStart) + parseFloat(end.substr(2)) * (end.charAt(0) === "-" ? -1 : 1) + (getUnit(parsedStart) || 0);
      }
    }

    if (parsedStart !== end) {
      if (!isNaN(parsedStart * end)) {
        pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
        funcParam && (pt.fp = funcParam);
        modifier && pt.modifier(modifier, this, target);
        return this._pt = pt;
      }

      !currentValue && !(prop in target) && _missingPlugin(prop, end);
      return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
    }
  },
      //creates a copy of the vars object and processes any function-based values (putting the resulting values directly into the copy) as well as strings with "random()" in them. It does NOT process relative values.
  _processVars = function _processVars(vars, index, target, targets, tween) {
    _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));

    if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
      return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
    }

    var copy = {},
        p;

    for (p in vars) {
      copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
    }

    return copy;
  },
      _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
    var plugin, pt, ptLookup, i;

    if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
      tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);

      if (tween !== _quickTween) {
        ptLookup = tween._ptLookup[tween._targets.indexOf(target)]; //note: we can't use tween._ptLookup[index] because for staggered tweens, the index from the fullTargets array won't match what it is in each individual tween that spawns from the stagger.

        i = plugin._props.length;

        while (i--) {
          ptLookup[plugin._props[i]] = pt;
        }
      }
    }

    return plugin;
  },
      _overwritingTween,
      //store a reference temporarily so we can avoid overwriting itself.
  _initTween = function _initTween(tween, time) {
    var vars = tween.vars,
        ease = vars.ease,
        startAt = vars.startAt,
        immediateRender = vars.immediateRender,
        lazy = vars.lazy,
        onUpdate = vars.onUpdate,
        onUpdateParams = vars.onUpdateParams,
        callbackScope = vars.callbackScope,
        runBackwards = vars.runBackwards,
        yoyoEase = vars.yoyoEase,
        keyframes = vars.keyframes,
        autoRevert = vars.autoRevert,
        dur = tween._dur,
        prevStartAt = tween._startAt,
        targets = tween._targets,
        parent = tween.parent,
        fullTargets = parent && parent.data === "nested" ? parent.parent._targets : targets,
        autoOverwrite = tween._overwrite === "auto",
        tl = tween.timeline,
        cleanVars,
        i,
        p,
        pt,
        target,
        hasPriority,
        gsData,
        harness,
        plugin,
        ptLookup,
        index,
        harnessVars,
        overwritten;
    tl && (!keyframes || !ease) && (ease = "none");
    tween._ease = _parseEase(ease, _defaults.ease);
    tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;

    if (yoyoEase && tween._yoyo && !tween._repeat) {
      //there must have been a parent timeline with yoyo:true that is currently in its yoyo phase, so flip the eases.
      yoyoEase = tween._yEase;
      tween._yEase = tween._ease;
      tween._ease = yoyoEase;
    }

    if (!tl) {
      //if there's an internal timeline, skip all the parsing because we passed that task down the chain.
      harness = targets[0] ? _getCache(targets[0]).harness : 0;
      harnessVars = harness && vars[harness.prop]; //someone may need to specify CSS-specific values AND non-CSS values, like if the element has an "x" property plus it's a standard DOM element. We allow people to distinguish by wrapping plugin-specific stuff in a css:{} object for example.

      cleanVars = _copyExcluding(vars, _reservedProps);
      prevStartAt && prevStartAt.render(-1, true).kill();

      if (startAt) {
        _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
          data: "isStart",
          overwrite: false,
          parent: parent,
          immediateRender: true,
          lazy: _isNotFalse(lazy),
          startAt: null,
          delay: 0,
          onUpdate: onUpdate,
          onUpdateParams: onUpdateParams,
          callbackScope: callbackScope,
          stagger: 0
        }, startAt))); //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, from, to).fromTo(e, to, from);


        if (immediateRender) {
          if (time > 0) {
            autoRevert || (tween._startAt = 0); //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in Timeline instances where immediateRender was false or when autoRevert is explicitly set to true.
          } else if (dur && !(time < 0 && prevStartAt)) {
            time && (tween._zTime = time);
            return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a Timeline, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
          }
        }
      } else if (runBackwards && dur) {
        //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
        if (prevStartAt) {
          !autoRevert && (tween._startAt = 0);
        } else {
          time && (immediateRender = false); //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0

          p = _setDefaults({
            overwrite: false,
            data: "isFromStart",
            //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
            lazy: immediateRender && _isNotFalse(lazy),
            immediateRender: immediateRender,
            //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
            stagger: 0,
            parent: parent //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y:gsap.utils.wrap([-100,100])})

          }, cleanVars);
          harnessVars && (p[harness.prop] = harnessVars); // in case someone does something like .from(..., {css:{}})

          _removeFromParent(tween._startAt = Tween.set(targets, p));

          if (!immediateRender) {
            _initTween(tween._startAt, _tinyNum); //ensures that the initial values are recorded

          } else if (!time) {
            return;
          }
        }
      }

      tween._pt = 0;
      lazy = dur && _isNotFalse(lazy) || lazy && !dur;

      for (i = 0; i < targets.length; i++) {
        target = targets[i];
        gsData = target._gsap || _harness(targets)[i]._gsap;
        tween._ptLookup[i] = ptLookup = {};
        _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)

        index = fullTargets === targets ? i : fullTargets.indexOf(target);

        if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
          tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);

          plugin._props.forEach(function (name) {
            ptLookup[name] = pt;
          });

          plugin.priority && (hasPriority = 1);
        }

        if (!harness || harnessVars) {
          for (p in cleanVars) {
            if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
              plugin.priority && (hasPriority = 1);
            } else {
              ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
            }
          }
        }

        tween._op && tween._op[i] && tween.kill(target, tween._op[i]);

        if (autoOverwrite && tween._pt) {
          _overwritingTween = tween;

          _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(0)); //Also make sure the overwriting doesn't overwrite THIS tween!!!


          overwritten = !tween.parent;
          _overwritingTween = 0;
        }

        tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
      }

      hasPriority && _sortPropTweensByPriority(tween);
      tween._onInit && tween._onInit(tween); //plugins like RoundProps must wait until ALL of the PropTweens are instantiated. In the plugin's init() function, it sets the _onInit on the tween instance. May not be pretty/intuitive, but it's fast and keeps file size down.
    }

    tween._from = !tl && !!vars.runBackwards; //nested timelines should never run backwards - the backwards-ness is in the child tweens.

    tween._onUpdate = onUpdate;
    tween._initted = (!tween._op || tween._pt) && !overwritten; // if overwrittenProps resulted in the entire tween being killed, do NOT flag it as initted or else it may render for one tick.
  },
      _addAliasesToVars = function _addAliasesToVars(targets, vars) {
    var harness = targets[0] ? _getCache(targets[0]).harness : 0,
        propertyAliases = harness && harness.aliases,
        copy,
        p,
        i,
        aliases;

    if (!propertyAliases) {
      return vars;
    }

    copy = _merge({}, vars);

    for (p in propertyAliases) {
      if (p in copy) {
        aliases = propertyAliases[p].split(",");
        i = aliases.length;

        while (i--) {
          copy[aliases[i]] = copy[p];
        }
      }
    }

    return copy;
  },
      _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
    return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
  },
      _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase",
      _staggerPropsToSkip = (_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger").split(",");
  /*
   * --------------------------------------------------------------------------------------
   * TWEEN
   * --------------------------------------------------------------------------------------
   */


  var Tween = /*#__PURE__*/function (_Animation2) {
    _inheritsLoose(Tween, _Animation2);

    function Tween(targets, vars, time, skipInherit) {
      var _this3;

      if (typeof vars === "number") {
        time.duration = vars;
        vars = time;
        time = null;
      }

      _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars), time) || this;
      var _this3$vars = _this3.vars,
          duration = _this3$vars.duration,
          delay = _this3$vars.delay,
          immediateRender = _this3$vars.immediateRender,
          stagger = _this3$vars.stagger,
          overwrite = _this3$vars.overwrite,
          keyframes = _this3$vars.keyframes,
          defaults = _this3$vars.defaults,
          scrollTrigger = _this3$vars.scrollTrigger,
          yoyoEase = _this3$vars.yoyoEase,
          parent = _this3.parent,
          parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
          tl,
          i,
          copy,
          l,
          p,
          curTarget,
          staggerFunc,
          staggerVarsToMerge;
      _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
      _this3._ptLookup = []; //PropTween lookup. An array containing an object for each target, having keys for each tweening property

      _this3._overwrite = overwrite;

      if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        vars = _this3.vars;
        tl = _this3.timeline = new Timeline({
          data: "nested",
          defaults: defaults || {}
        });
        tl.kill();
        tl.parent = _assertThisInitialized(_this3);

        if (keyframes) {
          _setDefaults(tl.vars.defaults, {
            ease: "none"
          });

          keyframes.forEach(function (frame) {
            return tl.to(parsedTargets, frame, ">");
          });
        } else {
          l = parsedTargets.length;
          staggerFunc = stagger ? distribute(stagger) : _emptyFunc;

          if (_isObject(stagger)) {
            //users can pass in callbacks like onStart/onComplete in the stagger object. These should fire with each individual tween.
            for (p in stagger) {
              if (~_staggerTweenProps.indexOf(p)) {
                staggerVarsToMerge || (staggerVarsToMerge = {});
                staggerVarsToMerge[p] = stagger[p];
              }
            }
          }

          for (i = 0; i < l; i++) {
            copy = {};

            for (p in vars) {
              if (_staggerPropsToSkip.indexOf(p) < 0) {
                copy[p] = vars[p];
              }
            }

            copy.stagger = 0;
            yoyoEase && (copy.yoyoEase = yoyoEase);
            staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
            curTarget = parsedTargets[i]; //don't just copy duration or delay because if they're a string or function, we'd end up in an infinite loop because _isFuncOrString() would evaluate as true in the child tweens, entering this loop, etc. So we parse the value straight from vars and default to 0.

            copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
            copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;

            if (!stagger && l === 1 && copy.delay) {
              // if someone does delay:"random(1, 5)", repeat:-1, for example, the delay shouldn't be inside the repeat.
              _this3._delay = delay = copy.delay;
              _this3._start += delay;
              copy.delay = 0;
            }

            tl.to(curTarget, copy, staggerFunc(i, curTarget, parsedTargets));
          }

          tl.duration() ? duration = delay = 0 : _this3.timeline = 0; // if the timeline's duration is 0, we don't need a timeline internally!
        }

        duration || _this3.duration(duration = tl.duration());
      } else {
        _this3.timeline = 0; //speed optimization, faster lookups (no going up the prototype chain)
      }

      if (overwrite === true) {
        _overwritingTween = _assertThisInitialized(_this3);

        _globalTimeline.killTweensOf(parsedTargets);

        _overwritingTween = 0;
      }

      parent && _postAddChecks(parent, _assertThisInitialized(_this3));

      if (immediateRender || !duration && !keyframes && _this3._start === _round(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
        _this3._tTime = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)

        _this3.render(Math.max(0, -delay)); //in case delay is negative

      }

      scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
      return _this3;
    }

    var _proto3 = Tween.prototype;

    _proto3.render = function render(totalTime, suppressEvents, force) {
      var prevTime = this._time,
          tDur = this._tDur,
          dur = this._dur,
          tTime = totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
          time,
          pt,
          iteration,
          cycleDuration,
          prevIteration,
          isYoyo,
          ratio,
          timeline,
          yoyoEase;

      if (!dur) {
        _renderZeroDurationTween(this, totalTime, suppressEvents, force);
      } else if (tTime !== this._tTime || !totalTime || force || this._startAt && this._zTime < 0 !== totalTime < 0) {
        //this senses if we're crossing over the start time, in which case we must record _zTime and force the render, but we do it in this lengthy conditional way for performance reasons (usually we can skip the calculations): this._initted && (this._zTime < 0) !== (totalTime < 0)
        time = tTime;
        timeline = this.timeline;

        if (this._repeat) {
          //adjust the time for repeats and yoyos
          cycleDuration = dur + this._rDelay;
          time = _round(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

          if (tTime === tDur) {
            // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
            iteration = this._repeat;
            time = dur;
          } else {
            iteration = ~~(tTime / cycleDuration);

            if (iteration && iteration === tTime / cycleDuration) {
              time = dur;
              iteration--;
            }

            time > dur && (time = dur);
          }

          isYoyo = this._yoyo && iteration & 1;

          if (isYoyo) {
            yoyoEase = this._yEase;
            time = dur - time;
          }

          prevIteration = _animationCycle(this._tTime, cycleDuration);

          if (time === prevTime && !force && this._initted) {
            //could be during the repeatDelay part. No need to render and fire callbacks.
            return this;
          }

          if (iteration !== prevIteration) {
            timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo); //repeatRefresh functionality

            if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
              this._lock = force = 1; //force, otherwise if lazy is true, the _attemptInitTween() will return and we'll jump out and get caught bouncing on each tick.

              this.render(_round(cycleDuration * iteration), true).invalidate()._lock = 0;
            }
          }
        }

        if (!this._initted) {
          if (_attemptInitTween(this, totalTime < 0 ? totalTime : time, force, suppressEvents)) {
            this._tTime = 0; // in constructor if immediateRender is true, we set _tTime to -_tinyNum to have the playhead cross the starting point but we can't leave _tTime as a negative number.

            return this;
          }

          if (dur !== this._dur) {
            // while initting, a plugin like InertiaPlugin might alter the duration, so rerun from the start to ensure everything renders as it should.
            return this.render(totalTime, suppressEvents, force);
          }
        }

        this._tTime = tTime;
        this._time = time;

        if (!this._act && this._ts) {
          this._act = 1; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

          this._lazy = 0;
        }

        this.ratio = ratio = (yoyoEase || this._ease)(time / dur);

        if (this._from) {
          this.ratio = ratio = 1 - ratio;
        }

        time && !prevTime && !suppressEvents && _callback(this, "onStart");
        pt = this._pt;

        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }

        timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * ratio, suppressEvents, force) || this._startAt && (this._zTime = totalTime);

        if (this._onUpdate && !suppressEvents) {
          totalTime < 0 && this._startAt && this._startAt.render(totalTime, true, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.

          _callback(this, "onUpdate");
        }

        this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");

        if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
          totalTime < 0 && this._startAt && !this._onUpdate && this._startAt.render(totalTime, true, true);
          (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if we're rendering at exactly a time of 0, as there could be autoRevert values that should get set on the next tick (if the playhead goes backward beyond the startTime, negative totalTime). Don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

          if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
            // if prevTime and tTime are zero, we shouldn't fire the onReverseComplete. This could happen if you gsap.to(... {paused:true}).play();
            _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

            this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
          }
        }
      }

      return this;
    };

    _proto3.targets = function targets() {
      return this._targets;
    };

    _proto3.invalidate = function invalidate() {
      this._pt = this._op = this._startAt = this._onUpdate = this._act = this._lazy = 0;
      this._ptLookup = [];
      this.timeline && this.timeline.invalidate();
      return _Animation2.prototype.invalidate.call(this);
    };

    _proto3.kill = function kill(targets, vars) {
      if (vars === void 0) {
        vars = "all";
      }

      if (!targets && (!vars || vars === "all")) {
        this._lazy = 0;

        if (this.parent) {
          return _interrupt(this);
        }
      }

      if (this.timeline) {
        var tDur = this.timeline.totalDuration();
        this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this); // if nothing is left tweenng, interrupt.

        this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1); // if a nested tween is killed that changes the duration, it should affect this tween's duration. We must use the ratio, though, because sometimes the internal timeline is stretched like for keyframes where they don't all add up to whatever the parent tween's duration was set to.

        return this;
      }

      var parsedTargets = this._targets,
          killingTargets = targets ? toArray(targets) : parsedTargets,
          propTweenLookup = this._ptLookup,
          firstPT = this._pt,
          overwrittenProps,
          curLookup,
          curOverwriteProps,
          props,
          p,
          pt,
          i;

      if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
        vars === "all" && (this._pt = 0);
        return _interrupt(this);
      }

      overwrittenProps = this._op = this._op || [];

      if (vars !== "all") {
        //so people can pass in a comma-delimited list of property names
        if (_isString(vars)) {
          p = {};

          _forEachName(vars, function (name) {
            return p[name] = 1;
          });

          vars = p;
        }

        vars = _addAliasesToVars(parsedTargets, vars);
      }

      i = parsedTargets.length;

      while (i--) {
        if (~killingTargets.indexOf(parsedTargets[i])) {
          curLookup = propTweenLookup[i];

          if (vars === "all") {
            overwrittenProps[i] = vars;
            props = curLookup;
            curOverwriteProps = {};
          } else {
            curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
            props = vars;
          }

          for (p in props) {
            pt = curLookup && curLookup[p];

            if (pt) {
              if (!("kill" in pt.d) || pt.d.kill(p) === true) {
                _removeLinkedListItem(this, pt, "_pt");
              }

              delete curLookup[p];
            }

            if (curOverwriteProps !== "all") {
              curOverwriteProps[p] = 1;
            }
          }
        }
      }

      this._initted && !this._pt && firstPT && _interrupt(this); //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.

      return this;
    };

    Tween.to = function to(targets, vars) {
      return new Tween(targets, vars, arguments[2]);
    };

    Tween.from = function from(targets, vars) {
      return new Tween(targets, _parseVars(arguments, 1));
    };

    Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
      return new Tween(callback, 0, {
        immediateRender: false,
        lazy: false,
        overwrite: false,
        delay: delay,
        onComplete: callback,
        onReverseComplete: callback,
        onCompleteParams: params,
        onReverseCompleteParams: params,
        callbackScope: scope
      });
    };

    Tween.fromTo = function fromTo(targets, fromVars, toVars) {
      return new Tween(targets, _parseVars(arguments, 2));
    };

    Tween.set = function set(targets, vars) {
      vars.duration = 0;
      vars.repeatDelay || (vars.repeat = 0);
      return new Tween(targets, vars);
    };

    Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
      return _globalTimeline.killTweensOf(targets, props, onlyActive);
    };

    return Tween;
  }(Animation);

  _setDefaults(Tween.prototype, {
    _targets: [],
    _lazy: 0,
    _startAt: 0,
    _op: 0,
    _onInit: 0
  }); //add the pertinent timeline methods to Tween instances so that users can chain conveniently and create a timeline automatically. (removed due to concerns that it'd ultimately add to more confusion especially for beginners)
  // _forEachName("to,from,fromTo,set,call,add,addLabel,addPause", name => {
  // 	Tween.prototype[name] = function() {
  // 		let tl = new Timeline();
  // 		return _addToTimeline(tl, this)[name].apply(tl, toArray(arguments));
  // 	}
  // });
  //for backward compatibility. Leverage the timeline calls.


  _forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
    Tween[name] = function () {
      var tl = new Timeline(),
          params = _slice.call(arguments, 0);

      params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
      return tl[name].apply(tl, params);
    };
  });
  /*
   * --------------------------------------------------------------------------------------
   * PROPTWEEN
   * --------------------------------------------------------------------------------------
   */


  var _setterPlain = function _setterPlain(target, property, value) {
    return target[property] = value;
  },
      _setterFunc = function _setterFunc(target, property, value) {
    return target[property](value);
  },
      _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
    return target[property](data.fp, value);
  },
      _setterAttribute = function _setterAttribute(target, property, value) {
    return target.setAttribute(property, value);
  },
      _getSetter = function _getSetter(target, property) {
    return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
  },
      _renderPlain = function _renderPlain(ratio, data) {
    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000, data);
  },
      _renderBoolean = function _renderBoolean(ratio, data) {
    return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
  },
      _renderComplexString = function _renderComplexString(ratio, data) {
    var pt = data._pt,
        s = "";

    if (!ratio && data.b) {
      //b = beginning string
      s = data.b;
    } else if (ratio === 1 && data.e) {
      //e = ending string
      s = data.e;
    } else {
      while (pt) {
        s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s; //we use the "p" property for the text inbetween (like a suffix). And in the context of a complex string, the modifier (m) is typically just Math.round(), like for RGB colors.

        pt = pt._next;
      }

      s += data.c; //we use the "c" of the PropTween to store the final chunk of non-numeric text.
    }

    data.set(data.t, data.p, s, data);
  },
      _renderPropTweens = function _renderPropTweens(ratio, data) {
    var pt = data._pt;

    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
  },
      _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
    var pt = this._pt,
        next;

    while (pt) {
      next = pt._next;
      pt.p === property && pt.modifier(modifier, tween, target);
      pt = next;
    }
  },
      _killPropTweensOf = function _killPropTweensOf(property) {
    var pt = this._pt,
        hasNonDependentRemaining,
        next;

    while (pt) {
      next = pt._next;

      if (pt.p === property && !pt.op || pt.op === property) {
        _removeLinkedListItem(this, pt, "_pt");
      } else if (!pt.dep) {
        hasNonDependentRemaining = 1;
      }

      pt = next;
    }

    return !hasNonDependentRemaining;
  },
      _setterWithModifier = function _setterWithModifier(target, property, value, data) {
    data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
  },
      _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
    var pt = parent._pt,
        next,
        pt2,
        first,
        last; //sorts the PropTween linked list in order of priority because some plugins need to do their work after ALL of the PropTweens were created (like RoundPropsPlugin and ModifiersPlugin)

    while (pt) {
      next = pt._next;
      pt2 = first;

      while (pt2 && pt2.pr > pt.pr) {
        pt2 = pt2._next;
      }

      if (pt._prev = pt2 ? pt2._prev : last) {
        pt._prev._next = pt;
      } else {
        first = pt;
      }

      if (pt._next = pt2) {
        pt2._prev = pt;
      } else {
        last = pt;
      }

      pt = next;
    }

    parent._pt = first;
  }; //PropTween key: t = target, p = prop, r = renderer, d = data, s = start, c = change, op = overwriteProperty (ONLY populated when it's different than p), pr = priority, _next/_prev for the linked list siblings, set = setter, m = modifier, mSet = modifierSetter (the original setter, before a modifier was added)


  var PropTween = /*#__PURE__*/function () {
    function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
      this.t = target;
      this.s = start;
      this.c = change;
      this.p = prop;
      this.r = renderer || _renderPlain;
      this.d = data || this;
      this.set = setter || _setterPlain;
      this.pr = priority || 0;
      this._next = next;

      if (next) {
        next._prev = this;
      }
    }

    var _proto4 = PropTween.prototype;

    _proto4.modifier = function modifier(func, tween, target) {
      this.mSet = this.mSet || this.set; //in case it was already set (a PropTween can only have one modifier)

      this.set = _setterWithModifier;
      this.m = func;
      this.mt = target; //modifier target

      this.tween = tween;
    };

    return PropTween;
  }(); //Initialization tasks

  _forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
    return _reservedProps[name] = 1;
  });

  _globals.TweenMax = _globals.TweenLite = Tween;
  _globals.TimelineLite = _globals.TimelineMax = Timeline;
  _globalTimeline = new Timeline({
    sortChildren: false,
    defaults: _defaults,
    autoRemoveChildren: true,
    id: "root",
    smoothChildTiming: true
  });
  _config.stringFilter = _colorStringFilter;
  /*
   * --------------------------------------------------------------------------------------
   * GSAP
   * --------------------------------------------------------------------------------------
   */

  var _gsap = {
    registerPlugin: function registerPlugin() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      args.forEach(function (config) {
        return _createPlugin(config);
      });
    },
    timeline: function timeline(vars) {
      return new Timeline(vars);
    },
    getTweensOf: function getTweensOf(targets, onlyActive) {
      return _globalTimeline.getTweensOf(targets, onlyActive);
    },
    getProperty: function getProperty(target, property, unit, uncache) {
      _isString(target) && (target = toArray(target)[0]); //in case selector text or an array is passed in

      var getter = _getCache(target || {}).get,
          format = unit ? _passThrough : _numericIfPossible;

      unit === "native" && (unit = "");
      return !target ? target : !property ? function (property, unit, uncache) {
        return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
      } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
    },
    quickSetter: function quickSetter(target, property, unit) {
      target = toArray(target);

      if (target.length > 1) {
        var setters = target.map(function (t) {
          return gsap.quickSetter(t, property, unit);
        }),
            l = setters.length;
        return function (value) {
          var i = l;

          while (i--) {
            setters[i](value);
          }
        };
      }

      target = target[0] || {};

      var Plugin = _plugins[property],
          cache = _getCache(target),
          p = cache.harness && (cache.harness.aliases || {})[property] || property,
          // in case it's an alias, like "rotate" for "rotation".
      setter = Plugin ? function (value) {
        var p = new Plugin();
        _quickTween._pt = 0;
        p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
        p.render(1, p);
        _quickTween._pt && _renderPropTweens(1, _quickTween);
      } : cache.set(target, p);

      return Plugin ? setter : function (value) {
        return setter(target, p, unit ? value + unit : value, cache, 1);
      };
    },
    isTweening: function isTweening(targets) {
      return _globalTimeline.getTweensOf(targets, true).length > 0;
    },
    defaults: function defaults(value) {
      value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
      return _mergeDeep(_defaults, value || {});
    },
    config: function config(value) {
      return _mergeDeep(_config, value || {});
    },
    registerEffect: function registerEffect(_ref) {
      var name = _ref.name,
          effect = _ref.effect,
          plugins = _ref.plugins,
          defaults = _ref.defaults,
          extendTimeline = _ref.extendTimeline;
      (plugins || "").split(",").forEach(function (pluginName) {
        return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
      });

      _effects[name] = function (targets, vars, tl) {
        return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
      };

      if (extendTimeline) {
        Timeline.prototype[name] = function (targets, vars, position) {
          return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
        };
      }
    },
    registerEase: function registerEase(name, ease) {
      _easeMap[name] = _parseEase(ease);
    },
    parseEase: function parseEase(ease, defaultEase) {
      return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
    },
    getById: function getById(id) {
      return _globalTimeline.getById(id);
    },
    exportRoot: function exportRoot(vars, includeDelayedCalls) {
      if (vars === void 0) {
        vars = {};
      }

      var tl = new Timeline(vars),
          child,
          next;
      tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);

      _globalTimeline.remove(tl);

      tl._dp = 0; //otherwise it'll get re-activated when adding children and be re-introduced into _globalTimeline's linked list (then added to itself).

      tl._time = tl._tTime = _globalTimeline._time;
      child = _globalTimeline._first;

      while (child) {
        next = child._next;

        if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
          _addToTimeline(tl, child, child._start - child._delay);
        }

        child = next;
      }

      _addToTimeline(_globalTimeline, tl, 0);

      return tl;
    },
    utils: {
      wrap: wrap,
      wrapYoyo: wrapYoyo,
      distribute: distribute,
      random: random,
      snap: snap,
      normalize: normalize,
      getUnit: getUnit,
      clamp: clamp,
      splitColor: splitColor,
      toArray: toArray,
      mapRange: mapRange,
      pipe: pipe,
      unitize: unitize,
      interpolate: interpolate,
      shuffle: shuffle
    },
    install: _install,
    effects: _effects,
    ticker: _ticker,
    updateRoot: Timeline.updateRoot,
    plugins: _plugins,
    globalTimeline: _globalTimeline,
    core: {
      PropTween: PropTween,
      globals: _addGlobal,
      Tween: Tween,
      Timeline: Timeline,
      Animation: Animation,
      getCache: _getCache,
      _removeLinkedListItem: _removeLinkedListItem
    }
  };

  _forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
    return _gsap[name] = Tween[name];
  });

  _ticker.add(Timeline.updateRoot);

  _quickTween = _gsap.to({}, {
    duration: 0
  }); // ---- EXTRA PLUGINS --------------------------------------------------------

  var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
    var pt = plugin._pt;

    while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
      pt = pt._next;
    }

    return pt;
  },
      _addModifiers = function _addModifiers(tween, modifiers) {
    var targets = tween._targets,
        p,
        i,
        pt;

    for (p in modifiers) {
      i = targets.length;

      while (i--) {
        pt = tween._ptLookup[i][p];

        if (pt && (pt = pt.d)) {
          if (pt._pt) {
            // is a plugin
            pt = _getPluginPropTween(pt, p);
          }

          pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
        }
      }
    }
  },
      _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
    return {
      name: name,
      rawVars: 1,
      //don't pre-process function-based values or "random()" strings.
      init: function init(target, vars, tween) {
        tween._onInit = function (tween) {
          var temp, p;

          if (_isString(vars)) {
            temp = {};

            _forEachName(vars, function (name) {
              return temp[name] = 1;
            }); //if the user passes in a comma-delimited list of property names to roundProps, like "x,y", we round to whole numbers.


            vars = temp;
          }

          if (modifier) {
            temp = {};

            for (p in vars) {
              temp[p] = modifier(vars[p]);
            }

            vars = temp;
          }

          _addModifiers(tween, vars);
        };
      }
    };
  }; //register core plugins


  var gsap = _gsap.registerPlugin({
    name: "attr",
    init: function init(target, vars, tween, index, targets) {
      var p, pt;

      for (p in vars) {
        pt = this.add(target, "setAttribute", (target.getAttribute(p) || 0) + "", vars[p], index, targets, 0, 0, p);
        pt && (pt.op = p);

        this._props.push(p);
      }
    }
  }, {
    name: "endArray",
    init: function init(target, value) {
      var i = value.length;

      while (i--) {
        this.add(target, i, target[i] || 0, value[i]);
      }
    }
  }, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap; //to prevent the core plugins from being dropped via aggressive tree shaking, we must include them in the variable declaration in this way.

  Tween.version = Timeline.version = gsap.version = "3.5.1";
  _coreReady = 1;

  if (_windowExists()) {
    _wake();
  }

  /*!
   * CSSPlugin 3.5.1
   * https://greensock.com
   *
   * Copyright 2008-2020, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */

  var _win$1,
      _doc$1,
      _docElement,
      _pluginInitted,
      _tempDiv,
      _tempDivStyler,
      _recentSetterPlugin,
      _windowExists$1 = function _windowExists() {
    return typeof window !== "undefined";
  },
      _transformProps = {},
      _RAD2DEG = 180 / Math.PI,
      _DEG2RAD = Math.PI / 180,
      _atan2 = Math.atan2,
      _bigNum$1 = 1e8,
      _capsExp = /([A-Z])/g,
      _horizontalExp = /(?:left|right|width|margin|padding|x)/i,
      _complexExp = /[\s,\(]\S/,
      _propertyAliases = {
    autoAlpha: "opacity,visibility",
    scale: "scaleX,scaleY",
    alpha: "opacity"
  },
      _renderCSSProp = function _renderCSSProp(ratio, data) {
    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
  },
      _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
    return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
  },
      _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
    return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
  },
      //if units change, we need a way to render the original unit/value when the tween goes all the way back to the beginning (ratio:0)
  _renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
    var value = data.s + data.c * ratio;
    data.set(data.t, data.p, ~~(value + (value < 0 ? -.5 : .5)) + data.u, data);
  },
      _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
    return data.set(data.t, data.p, ratio ? data.e : data.b, data);
  },
      _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
    return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
  },
      _setterCSSStyle = function _setterCSSStyle(target, property, value) {
    return target.style[property] = value;
  },
      _setterCSSProp = function _setterCSSProp(target, property, value) {
    return target.style.setProperty(property, value);
  },
      _setterTransform = function _setterTransform(target, property, value) {
    return target._gsap[property] = value;
  },
      _setterScale = function _setterScale(target, property, value) {
    return target._gsap.scaleX = target._gsap.scaleY = value;
  },
      _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
    var cache = target._gsap;
    cache.scaleX = cache.scaleY = value;
    cache.renderTransform(ratio, cache);
  },
      _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
    var cache = target._gsap;
    cache[property] = value;
    cache.renderTransform(ratio, cache);
  },
      _transformProp = "transform",
      _transformOriginProp = _transformProp + "Origin",
      _supports3D,
      _createElement = function _createElement(type, ns) {
    var e = _doc$1.createElementNS ? _doc$1.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc$1.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.

    return e.style ? e : _doc$1.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://greensock.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
  },
      _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
    var cs = getComputedStyle(target);
    return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || ""; //css variables may not need caps swapped out for dashes and lowercase.
  },
      _prefixes = "O,Moz,ms,Ms,Webkit".split(","),
      _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
    var e = element || _tempDiv,
        s = e.style,
        i = 5;

    if (property in s && !preferPrefix) {
      return property;
    }

    property = property.charAt(0).toUpperCase() + property.substr(1);

    while (i-- && !(_prefixes[i] + property in s)) {}

    return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
  },
      _initCore = function _initCore() {
    if (_windowExists$1() && window.document) {
      _win$1 = window;
      _doc$1 = _win$1.document;
      _docElement = _doc$1.documentElement;
      _tempDiv = _createElement("div") || {
        style: {}
      };
      _tempDivStyler = _createElement("div");
      _transformProp = _checkPropPrefix(_transformProp);
      _transformOriginProp = _transformProp + "Origin";
      _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0"; //make sure to override certain properties that may contaminate measurements, in case the user has overreaching style sheets.

      _supports3D = !!_checkPropPrefix("perspective");
      _pluginInitted = 1;
    }
  },
      _getBBoxHack = function _getBBoxHack(swapIfPossible) {
    //works around issues in some browsers (like Firefox) that don't correctly report getBBox() on SVG elements inside a <defs> element and/or <mask>. We try creating an SVG, adding it to the documentElement and toss the element in there so that it's definitely part of the rendering tree, then grab the bbox and if it works, we actually swap out the original getBBox() method for our own that does these extra steps whenever getBBox is needed. This helps ensure that performance is optimal (only do all these extra steps when absolutely necessary...most elements don't need it).
    var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
        oldParent = this.parentNode,
        oldSibling = this.nextSibling,
        oldCSS = this.style.cssText,
        bbox;

    _docElement.appendChild(svg);

    svg.appendChild(this);
    this.style.display = "block";

    if (swapIfPossible) {
      try {
        bbox = this.getBBox();
        this._gsapBBox = this.getBBox; //store the original

        this.getBBox = _getBBoxHack;
      } catch (e) {}
    } else if (this._gsapBBox) {
      bbox = this._gsapBBox();
    }

    if (oldParent) {
      if (oldSibling) {
        oldParent.insertBefore(this, oldSibling);
      } else {
        oldParent.appendChild(this);
      }
    }

    _docElement.removeChild(svg);

    this.style.cssText = oldCSS;
    return bbox;
  },
      _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
    var i = attributesArray.length;

    while (i--) {
      if (target.hasAttribute(attributesArray[i])) {
        return target.getAttribute(attributesArray[i]);
      }
    }
  },
      _getBBox = function _getBBox(target) {
    var bounds;

    try {
      bounds = target.getBBox(); //Firefox throws errors if you try calling getBBox() on an SVG element that's not rendered (like in a <symbol> or <defs>). https://bugzilla.mozilla.org/show_bug.cgi?id=612118
    } catch (error) {
      bounds = _getBBoxHack.call(target, true);
    }

    bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true)); //some browsers (like Firefox) misreport the bounds if the element has zero width and height (it just assumes it's at x:0, y:0), thus we need to manually grab the position in that case.

    return bounds && !bounds.width && !bounds.x && !bounds.y ? {
      x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
      y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
      width: 0,
      height: 0
    } : bounds;
  },
      _isSVG = function _isSVG(e) {
    return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
  },
      //reports if the element is an SVG on which getBBox() actually works
  _removeProperty = function _removeProperty(target, property) {
    if (property) {
      var style = target.style;

      if (property in _transformProps && property !== _transformOriginProp) {
        property = _transformProp;
      }

      if (style.removeProperty) {
        if (property.substr(0, 2) === "ms" || property.substr(0, 6) === "webkit") {
          //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
          property = "-" + property;
        }

        style.removeProperty(property.replace(_capsExp, "-$1").toLowerCase());
      } else {
        //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
        style.removeAttribute(property);
      }
    }
  },
      _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
    var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
    plugin._pt = pt;
    pt.b = beginning;
    pt.e = end;

    plugin._props.push(property);

    return pt;
  },
      _nonConvertibleUnits = {
    deg: 1,
    rad: 1,
    turn: 1
  },
      //takes a single value like 20px and converts it to the unit specified, like "%", returning only the numeric amount.
  _convertToUnit = function _convertToUnit(target, property, value, unit) {
    var curValue = parseFloat(value) || 0,
        curUnit = (value + "").trim().substr((curValue + "").length) || "px",
        // some browsers leave extra whitespace at the beginning of CSS variables, hence the need to trim()
    style = _tempDiv.style,
        horizontal = _horizontalExp.test(property),
        isRootSVG = target.tagName.toLowerCase() === "svg",
        measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"),
        amount = 100,
        toPixels = unit === "px",
        toPercent = unit === "%",
        px,
        parent,
        cache,
        isSVG;

    if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
      return curValue;
    }

    curUnit !== "px" && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
    isSVG = target.getCTM && _isSVG(target);

    if (toPercent && (_transformProps[property] || ~property.indexOf("adius"))) {
      //transforms and borderRadius are relative to the size of the element itself!
      return _round(curValue / (isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty]) * amount);
    }

    style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
    parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;

    if (isSVG) {
      parent = (target.ownerSVGElement || {}).parentNode;
    }

    if (!parent || parent === _doc$1 || !parent.appendChild) {
      parent = _doc$1.body;
    }

    cache = parent._gsap;

    if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time) {
      return _round(curValue / cache.width * amount);
    } else {
      (toPercent || curUnit === "%") && (style.position = _getComputedProperty(target, "position"));
      parent === target && (style.position = "static"); // like for borderRadius, if it's a % we must have it relative to the target itself but that may not have position: relative or position: absolute in which case it'd go up the chain until it finds its offsetParent (bad). position: static protects against that.

      parent.appendChild(_tempDiv);
      px = _tempDiv[measureProperty];
      parent.removeChild(_tempDiv);
      style.position = "absolute";

      if (horizontal && toPercent) {
        cache = _getCache(parent);
        cache.time = _ticker.time;
        cache.width = parent[measureProperty];
      }
    }

    return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
  },
      _get = function _get(target, property, unit, uncache) {
    var value;
    _pluginInitted || _initCore();

    if (property in _propertyAliases && property !== "transform") {
      property = _propertyAliases[property];

      if (~property.indexOf(",")) {
        property = property.split(",")[0];
      }
    }

    if (_transformProps[property] && property !== "transform") {
      value = _parseTransform(target, uncache);
      value = property !== "transformOrigin" ? value[property] : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
    } else {
      value = target.style[property];

      if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
        value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0); // note: some browsers, like Firefox, don't report borderRadius correctly! Instead, it only reports every corner like  borderTopLeftRadius
      }
    }

    return unit && !~(value + "").indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
  },
      _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
    //note: we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
    if (!start || start === "none") {
      // some browsers like Safari actually PREFER the prefixed property and mis-report the unprefixed value like clipPath (BUG). In other words, even though clipPath exists in the style ("clipPath" in target.style) and it's set in the CSS properly (along with -webkit-clip-path), Safari reports clipPath as "none" whereas WebkitClipPath reports accurately like "ellipse(100% 0% at 50% 0%)", so in this case we must SWITCH to using the prefixed property instead. See https://greensock.com/forums/topic/18310-clippath-doesnt-work-on-ios/
      var p = _checkPropPrefix(prop, target, 1),
          s = p && _getComputedProperty(target, p, 1);

      if (s && s !== start) {
        prop = p;
        start = s;
      } else if (prop === "borderColor") {
        start = _getComputedProperty(target, "borderTopColor"); // Firefox bug: always reports "borderColor" as "", so we must fall back to borderTopColor. See https://greensock.com/forums/topic/24583-how-to-return-colors-that-i-had-after-reverse/
      }
    }

    var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString),
        index = 0,
        matchIndex = 0,
        a,
        result,
        startValues,
        startNum,
        color,
        startValue,
        endValue,
        endNum,
        chunk,
        endUnit,
        startUnit,
        relative,
        endValues;
    pt.b = start;
    pt.e = end;
    start += ""; //ensure values are strings

    end += "";

    if (end === "auto") {
      target.style[prop] = end;
      end = _getComputedProperty(target, prop) || end;
      target.style[prop] = start;
    }

    a = [start, end];

    _colorStringFilter(a); //pass an array with the starting and ending values and let the filter do whatever it needs to the values. If colors are found, it returns true and then we must match where the color shows up order-wise because for things like boxShadow, sometimes the browser provides the computed values with the color FIRST, but the user provides it with the color LAST, so flip them if necessary. Same for drop-shadow().


    start = a[0];
    end = a[1];
    startValues = start.match(_numWithUnitExp) || [];
    endValues = end.match(_numWithUnitExp) || [];

    if (endValues.length) {
      while (result = _numWithUnitExp.exec(end)) {
        endValue = result[0];
        chunk = end.substring(index, result.index);

        if (color) {
          color = (color + 1) % 5;
        } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
          color = 1;
        }

        if (endValue !== (startValue = startValues[matchIndex++] || "")) {
          startNum = parseFloat(startValue) || 0;
          startUnit = startValue.substr((startNum + "").length);
          relative = endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;

          if (relative) {
            endValue = endValue.substr(2);
          }

          endNum = parseFloat(endValue);
          endUnit = endValue.substr((endNum + "").length);
          index = _numWithUnitExp.lastIndex - endUnit.length;

          if (!endUnit) {
            //if something like "perspective:300" is passed in and we must add a unit to the end
            endUnit = endUnit || _config.units[prop] || startUnit;

            if (index === end.length) {
              end += endUnit;
              pt.e += endUnit;
            }
          }

          if (startUnit !== endUnit) {
            startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
          } //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.


          pt._pt = {
            _next: pt._pt,
            p: chunk || matchIndex === 1 ? chunk : ",",
            //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
            s: startNum,
            c: relative ? relative * endNum : endNum - startNum,
            m: color && color < 4 ? Math.round : 0
          };
        }
      }

      pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)
    } else {
      pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
    }

    if (_relExp.test(end)) {
      pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
    }

    this._pt = pt; //start the linked list with this new PropTween. Remember, we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within another plugin too, thus "this" would refer to the plugin.

    return pt;
  },
      _keywordToPercent = {
    top: "0%",
    bottom: "100%",
    left: "0%",
    right: "100%",
    center: "50%"
  },
      _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
    var split = value.split(" "),
        x = split[0],
        y = split[1] || "50%";

    if (x === "top" || x === "bottom" || y === "left" || y === "right") {
      //the user provided them in the wrong order, so flip them
      value = x;
      x = y;
      y = value;
    }

    split[0] = _keywordToPercent[x] || x;
    split[1] = _keywordToPercent[y] || y;
    return split.join(" ");
  },
      _renderClearProps = function _renderClearProps(ratio, data) {
    if (data.tween && data.tween._time === data.tween._dur) {
      var target = data.t,
          style = target.style,
          props = data.u,
          cache = target._gsap,
          prop,
          clearTransforms,
          i;

      if (props === "all" || props === true) {
        style.cssText = "";
        clearTransforms = 1;
      } else {
        props = props.split(",");
        i = props.length;

        while (--i > -1) {
          prop = props[i];

          if (_transformProps[prop]) {
            clearTransforms = 1;
            prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
          }

          _removeProperty(target, prop);
        }
      }

      if (clearTransforms) {
        _removeProperty(target, _transformProp);

        if (cache) {
          cache.svg && target.removeAttribute("transform");

          _parseTransform(target, 1); // force all the cached values back to "normal"/identity, otherwise if there's another tween that's already set to render transforms on this element, it could display the wrong values.


          cache.uncache = 1;
        }
      }
    }
  },
      // note: specialProps should return 1 if (and only if) they have a non-zero priority. It indicates we need to sort the linked list.
  _specialProps = {
    clearProps: function clearProps(plugin, target, property, endValue, tween) {
      if (tween.data !== "isFromStart") {
        var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
        pt.u = endValue;
        pt.pr = -10;
        pt.tween = tween;

        plugin._props.push(property);

        return 1;
      }
    }
    /* className feature (about 0.4kb gzipped).
    , className(plugin, target, property, endValue, tween) {
    	let _renderClassName = (ratio, data) => {
    			data.css.render(ratio, data.css);
    			if (!ratio || ratio === 1) {
    				let inline = data.rmv,
    					target = data.t,
    					p;
    				target.setAttribute("class", ratio ? data.e : data.b);
    				for (p in inline) {
    					_removeProperty(target, p);
    				}
    			}
    		},
    		_getAllStyles = (target) => {
    			let styles = {},
    				computed = getComputedStyle(target),
    				p;
    			for (p in computed) {
    				if (isNaN(p) && p !== "cssText" && p !== "length") {
    					styles[p] = computed[p];
    				}
    			}
    			_setDefaults(styles, _parseTransform(target, 1));
    			return styles;
    		},
    		startClassList = target.getAttribute("class"),
    		style = target.style,
    		cssText = style.cssText,
    		cache = target._gsap,
    		classPT = cache.classPT,
    		inlineToRemoveAtEnd = {},
    		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
    		changingVars = {},
    		startVars = _getAllStyles(target),
    		transformRelated = /(transform|perspective)/i,
    		endVars, p;
    	if (classPT) {
    		classPT.r(1, classPT.d);
    		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
    	}
    	target.setAttribute("class", data.e);
    	endVars = _getAllStyles(target, true);
    	target.setAttribute("class", startClassList);
    	for (p in endVars) {
    		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
    			changingVars[p] = endVars[p];
    			if (!style[p] && style[p] !== "0") {
    				inlineToRemoveAtEnd[p] = 1;
    			}
    		}
    	}
    	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
    	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://greensock.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
    		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
    	}
    	_parseTransform(target, true); //to clear the caching of transforms
    	data.css = new gsap.plugins.css();
    	data.css.init(target, changingVars, tween);
    	plugin._props.push(...data.css._props);
    	return 1;
    }
    */

  },

  /*
   * --------------------------------------------------------------------------------------
   * TRANSFORMS
   * --------------------------------------------------------------------------------------
   */
  _identity2DMatrix = [1, 0, 0, 1, 0, 0],
      _rotationalProperties = {},
      _isNullTransform = function _isNullTransform(value) {
    return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
  },
      _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
    var matrixString = _getComputedProperty(target, _transformProp);

    return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
  },
      _getMatrix = function _getMatrix(target, force2D) {
    var cache = target._gsap || _getCache(target),
        style = target.style,
        matrix = _getComputedTransformMatrixAsArray(target),
        parent,
        nextSibling,
        temp,
        addedToDOM;

    if (cache.svg && target.getAttribute("transform")) {
      temp = target.transform.baseVal.consolidate().matrix; //ensures that even complex values like "translate(50,60) rotate(135,0,0)" are parsed because it mashes it into a matrix.

      matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
      return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
    } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
      //note: if offsetParent is null, that means the element isn't in the normal document flow, like if it has display:none or one of its ancestors has display:none). Firefox returns null for getComputedStyle() if the element is in an iframe that has display:none. https://bugzilla.mozilla.org/show_bug.cgi?id=548397
      //browsers don't report transforms accurately unless the element is in the DOM and has a display value that's not "none". Firefox and Microsoft browsers have a partial bug where they'll report transforms even if display:none BUT not any percentage-based values like translate(-50%, 8px) will be reported as if it's translate(0, 8px).
      temp = style.display;
      style.display = "block";
      parent = target.parentNode;

      if (!parent || !target.offsetParent) {
        // note: in 3.3.0 we switched target.offsetParent to _doc.body.contains(target) to avoid [sometimes unnecessary] MutationObserver calls but that wasn't adequate because there are edge cases where nested position: fixed elements need to get reparented to accurately sense transforms. See https://github.com/greensock/GSAP/issues/388 and https://github.com/greensock/GSAP/issues/375
        addedToDOM = 1; //flag

        nextSibling = target.nextSibling;

        _docElement.appendChild(target); //we must add it to the DOM in order to get values properly

      }

      matrix = _getComputedTransformMatrixAsArray(target);
      temp ? style.display = temp : _removeProperty(target, "display");

      if (addedToDOM) {
        nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
      }
    }

    return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
  },
      _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
    var cache = target._gsap,
        matrix = matrixArray || _getMatrix(target, true),
        xOriginOld = cache.xOrigin || 0,
        yOriginOld = cache.yOrigin || 0,
        xOffsetOld = cache.xOffset || 0,
        yOffsetOld = cache.yOffset || 0,
        a = matrix[0],
        b = matrix[1],
        c = matrix[2],
        d = matrix[3],
        tx = matrix[4],
        ty = matrix[5],
        originSplit = origin.split(" "),
        xOrigin = parseFloat(originSplit[0]) || 0,
        yOrigin = parseFloat(originSplit[1]) || 0,
        bounds,
        determinant,
        x,
        y;

    if (!originIsAbsolute) {
      bounds = _getBBox(target);
      xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
      yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
    } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
      //if it's zero (like if scaleX and scaleY are zero), skip it to avoid errors with dividing by zero.
      x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
      y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
      xOrigin = x;
      yOrigin = y;
    }

    if (smooth || smooth !== false && cache.smooth) {
      tx = xOrigin - xOriginOld;
      ty = yOrigin - yOriginOld;
      cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
      cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
    } else {
      cache.xOffset = cache.yOffset = 0;
    }

    cache.xOrigin = xOrigin;
    cache.yOrigin = yOrigin;
    cache.smooth = !!smooth;
    cache.origin = origin;
    cache.originIsAbsolute = !!originIsAbsolute;
    target.style[_transformOriginProp] = "0px 0px"; //otherwise, if someone sets  an origin via CSS, it will likely interfere with the SVG transform attribute ones (because remember, we're baking the origin into the matrix() value).

    if (pluginToAddPropTweensTo) {
      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);

      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);

      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);

      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
    }

    target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
  },
      _parseTransform = function _parseTransform(target, uncache) {
    var cache = target._gsap || new GSCache(target);

    if ("x" in cache && !uncache && !cache.uncache) {
      return cache;
    }

    var style = target.style,
        invertedScaleX = cache.scaleX < 0,
        px = "px",
        deg = "deg",
        origin = _getComputedProperty(target, _transformOriginProp) || "0",
        x,
        y,
        z,
        scaleX,
        scaleY,
        rotation,
        rotationX,
        rotationY,
        skewX,
        skewY,
        perspective,
        xOrigin,
        yOrigin,
        matrix,
        angle,
        cos,
        sin,
        a,
        b,
        c,
        d,
        a12,
        a22,
        t1,
        t2,
        t3,
        a13,
        a23,
        a33,
        a42,
        a43,
        a32;
    x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
    scaleX = scaleY = 1;
    cache.svg = !!(target.getCTM && _isSVG(target));
    matrix = _getMatrix(target, cache.svg);

    if (cache.svg) {
      t1 = !cache.uncache && target.getAttribute("data-svg-origin");

      _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
    }

    xOrigin = cache.xOrigin || 0;
    yOrigin = cache.yOrigin || 0;

    if (matrix !== _identity2DMatrix) {
      a = matrix[0]; //a11

      b = matrix[1]; //a21

      c = matrix[2]; //a31

      d = matrix[3]; //a41

      x = a12 = matrix[4];
      y = a22 = matrix[5]; //2D matrix

      if (matrix.length === 6) {
        scaleX = Math.sqrt(a * a + b * b);
        scaleY = Math.sqrt(d * d + c * c);
        rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).

        skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
        skewX && (scaleY *= Math.cos(skewX * _DEG2RAD));

        if (cache.svg) {
          x -= xOrigin - (xOrigin * a + yOrigin * c);
          y -= yOrigin - (xOrigin * b + yOrigin * d);
        } //3D matrix

      } else {
        a32 = matrix[6];
        a42 = matrix[7];
        a13 = matrix[8];
        a23 = matrix[9];
        a33 = matrix[10];
        a43 = matrix[11];
        x = matrix[12];
        y = matrix[13];
        z = matrix[14];
        angle = _atan2(a32, a33);
        rotationX = angle * _RAD2DEG; //rotationX

        if (angle) {
          cos = Math.cos(-angle);
          sin = Math.sin(-angle);
          t1 = a12 * cos + a13 * sin;
          t2 = a22 * cos + a23 * sin;
          t3 = a32 * cos + a33 * sin;
          a13 = a12 * -sin + a13 * cos;
          a23 = a22 * -sin + a23 * cos;
          a33 = a32 * -sin + a33 * cos;
          a43 = a42 * -sin + a43 * cos;
          a12 = t1;
          a22 = t2;
          a32 = t3;
        } //rotationY


        angle = _atan2(-c, a33);
        rotationY = angle * _RAD2DEG;

        if (angle) {
          cos = Math.cos(-angle);
          sin = Math.sin(-angle);
          t1 = a * cos - a13 * sin;
          t2 = b * cos - a23 * sin;
          t3 = c * cos - a33 * sin;
          a43 = d * sin + a43 * cos;
          a = t1;
          b = t2;
          c = t3;
        } //rotationZ


        angle = _atan2(b, a);
        rotation = angle * _RAD2DEG;

        if (angle) {
          cos = Math.cos(angle);
          sin = Math.sin(angle);
          t1 = a * cos + b * sin;
          t2 = a12 * cos + a22 * sin;
          b = b * cos - a * sin;
          a22 = a22 * cos - a12 * sin;
          a = t1;
          a12 = t2;
        }

        if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
          //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
          rotationX = rotation = 0;
          rotationY = 180 - rotationY;
        }

        scaleX = _round(Math.sqrt(a * a + b * b + c * c));
        scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
        angle = _atan2(a12, a22);
        skewX = Math.abs(angle) > 0.0002 ? angle * _RAD2DEG : 0;
        perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
      }

      if (cache.svg) {
        //sense if there are CSS transforms applied on an SVG element in which case we must overwrite them when rendering. The transform attribute is more reliable cross-browser, but we can't just remove the CSS ones because they may be applied in a CSS rule somewhere (not just inline).
        t1 = target.getAttribute("transform");
        cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
        t1 && target.setAttribute("transform", t1);
      }
    }

    if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
      if (invertedScaleX) {
        scaleX *= -1;
        skewX += rotation <= 0 ? 180 : -180;
        rotation += rotation <= 0 ? 180 : -180;
      } else {
        scaleY *= -1;
        skewX += skewX <= 0 ? 180 : -180;
      }
    }

    cache.x = ((cache.xPercent = x && Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0) ? 0 : x) + px;
    cache.y = ((cache.yPercent = y && Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0) ? 0 : y) + px;
    cache.z = z + px;
    cache.scaleX = _round(scaleX);
    cache.scaleY = _round(scaleY);
    cache.rotation = _round(rotation) + deg;
    cache.rotationX = _round(rotationX) + deg;
    cache.rotationY = _round(rotationY) + deg;
    cache.skewX = skewX + deg;
    cache.skewY = skewY + deg;
    cache.transformPerspective = perspective + px;

    if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) {
      style[_transformOriginProp] = _firstTwoOnly(origin);
    }

    cache.xOffset = cache.yOffset = 0;
    cache.force3D = _config.force3D;
    cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
    cache.uncache = 0;
    return cache;
  },
      _firstTwoOnly = function _firstTwoOnly(value) {
    return (value = value.split(" "))[0] + " " + value[1];
  },
      //for handling transformOrigin values, stripping out the 3rd dimension
  _addPxTranslate = function _addPxTranslate(target, start, value) {
    var unit = getUnit(start);
    return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
  },
      _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
    cache.z = "0px";
    cache.rotationY = cache.rotationX = "0deg";
    cache.force3D = 0;

    _renderCSSTransforms(ratio, cache);
  },
      _zeroDeg = "0deg",
      _zeroPx = "0px",
      _endParenthesis = ") ",
      _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
    var _ref = cache || this,
        xPercent = _ref.xPercent,
        yPercent = _ref.yPercent,
        x = _ref.x,
        y = _ref.y,
        z = _ref.z,
        rotation = _ref.rotation,
        rotationY = _ref.rotationY,
        rotationX = _ref.rotationX,
        skewX = _ref.skewX,
        skewY = _ref.skewY,
        scaleX = _ref.scaleX,
        scaleY = _ref.scaleY,
        transformPerspective = _ref.transformPerspective,
        force3D = _ref.force3D,
        target = _ref.target,
        zOrigin = _ref.zOrigin,
        transforms = "",
        use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true; // Safari has a bug that causes it not to render 3D transform-origin values properly, so we force the z origin to 0, record it in the cache, and then do the math here to offset the translate values accordingly (basically do the 3D transform-origin part manually)


    if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
      var angle = parseFloat(rotationY) * _DEG2RAD,
          a13 = Math.sin(angle),
          a33 = Math.cos(angle),
          cos;

      angle = parseFloat(rotationX) * _DEG2RAD;
      cos = Math.cos(angle);
      x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
      y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
      z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
    }

    if (transformPerspective !== _zeroPx) {
      transforms += "perspective(" + transformPerspective + _endParenthesis;
    }

    if (xPercent || yPercent) {
      transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
    }

    if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
      transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
    }

    if (rotation !== _zeroDeg) {
      transforms += "rotate(" + rotation + _endParenthesis;
    }

    if (rotationY !== _zeroDeg) {
      transforms += "rotateY(" + rotationY + _endParenthesis;
    }

    if (rotationX !== _zeroDeg) {
      transforms += "rotateX(" + rotationX + _endParenthesis;
    }

    if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
      transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
    }

    if (scaleX !== 1 || scaleY !== 1) {
      transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
    }

    target.style[_transformProp] = transforms || "translate(0, 0)";
  },
      _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
    var _ref2 = cache || this,
        xPercent = _ref2.xPercent,
        yPercent = _ref2.yPercent,
        x = _ref2.x,
        y = _ref2.y,
        rotation = _ref2.rotation,
        skewX = _ref2.skewX,
        skewY = _ref2.skewY,
        scaleX = _ref2.scaleX,
        scaleY = _ref2.scaleY,
        target = _ref2.target,
        xOrigin = _ref2.xOrigin,
        yOrigin = _ref2.yOrigin,
        xOffset = _ref2.xOffset,
        yOffset = _ref2.yOffset,
        forceCSS = _ref2.forceCSS,
        tx = parseFloat(x),
        ty = parseFloat(y),
        a11,
        a21,
        a12,
        a22,
        temp;

    rotation = parseFloat(rotation);
    skewX = parseFloat(skewX);
    skewY = parseFloat(skewY);

    if (skewY) {
      //for performance reasons, we combine all skewing into the skewX and rotation values. Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of 10 degrees.
      skewY = parseFloat(skewY);
      skewX += skewY;
      rotation += skewY;
    }

    if (rotation || skewX) {
      rotation *= _DEG2RAD;
      skewX *= _DEG2RAD;
      a11 = Math.cos(rotation) * scaleX;
      a21 = Math.sin(rotation) * scaleX;
      a12 = Math.sin(rotation - skewX) * -scaleY;
      a22 = Math.cos(rotation - skewX) * scaleY;

      if (skewX) {
        skewY *= _DEG2RAD;
        temp = Math.tan(skewX - skewY);
        temp = Math.sqrt(1 + temp * temp);
        a12 *= temp;
        a22 *= temp;

        if (skewY) {
          temp = Math.tan(skewY);
          temp = Math.sqrt(1 + temp * temp);
          a11 *= temp;
          a21 *= temp;
        }
      }

      a11 = _round(a11);
      a21 = _round(a21);
      a12 = _round(a12);
      a22 = _round(a22);
    } else {
      a11 = scaleX;
      a22 = scaleY;
      a21 = a12 = 0;
    }

    if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
      tx = _convertToUnit(target, "x", x, "px");
      ty = _convertToUnit(target, "y", y, "px");
    }

    if (xOrigin || yOrigin || xOffset || yOffset) {
      tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
      ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
    }

    if (xPercent || yPercent) {
      //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the translation to simulate it.
      temp = target.getBBox();
      tx = _round(tx + xPercent / 100 * temp.width);
      ty = _round(ty + yPercent / 100 * temp.height);
    }

    temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
    target.setAttribute("transform", temp);

    if (forceCSS) {
      //some browsers prioritize CSS transforms over the transform attribute. When we sense that the user has CSS transforms applied, we must overwrite them this way (otherwise some browser simply won't render the  transform attribute changes!)
      target.style[_transformProp] = temp;
    }
  },
      _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue, relative) {
    var cap = 360,
        isString = _isString(endValue),
        endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1),
        change = relative ? endNum * relative : endNum - startNum,
        finalValue = startNum + change + "deg",
        direction,
        pt;

    if (isString) {
      direction = endValue.split("_")[1];

      if (direction === "short") {
        change %= cap;

        if (change !== change % (cap / 2)) {
          change += change < 0 ? cap : -cap;
        }
      }

      if (direction === "cw" && change < 0) {
        change = (change + cap * _bigNum$1) % cap - ~~(change / cap) * cap;
      } else if (direction === "ccw" && change > 0) {
        change = (change - cap * _bigNum$1) % cap - ~~(change / cap) * cap;
      }
    }

    plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
    pt.e = finalValue;
    pt.u = "deg";

    plugin._props.push(property);

    return pt;
  },
      _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
    //for handling cases where someone passes in a whole transform string, like transform: "scale(2, 3) rotate(20deg) translateY(30em)"
    var style = _tempDivStyler.style,
        startCache = target._gsap,
        exclude = "perspective,force3D,transformOrigin,svgOrigin",
        endCache,
        p,
        startValue,
        endValue,
        startNum,
        endNum,
        startUnit,
        endUnit;
    style.cssText = getComputedStyle(target).cssText + ";position:absolute;display:block;"; //%-based translations will fail unless we set the width/height to match the original target (and padding/borders can affect it)

    style[_transformProp] = transforms;

    _doc$1.body.appendChild(_tempDivStyler);

    endCache = _parseTransform(_tempDivStyler, 1);

    for (p in _transformProps) {
      startValue = startCache[p];
      endValue = endCache[p];

      if (startValue !== endValue && exclude.indexOf(p) < 0) {
        //tweening to no perspective gives very unintuitive results - just keep the same perspective in that case.
        startUnit = getUnit(startValue);
        endUnit = getUnit(endValue);
        startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
        endNum = parseFloat(endValue);
        plugin._pt = new PropTween(plugin._pt, startCache, p, startNum, endNum - startNum, _renderCSSProp);
        plugin._pt.u = endUnit || 0;

        plugin._props.push(p);
      }
    }

    _doc$1.body.removeChild(_tempDivStyler);
  }; // handle splitting apart padding, margin, borderWidth, and borderRadius into their 4 components. Firefox, for example, won't report borderRadius correctly - it will only do borderTopLeftRadius and the other corners. We also want to handle paddingTop, marginLeft, borderRightWidth, etc.


  _forEachName("padding,margin,Width,Radius", function (name, index) {
    var t = "Top",
        r = "Right",
        b = "Bottom",
        l = "Left",
        props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function (side) {
      return index < 2 ? name + side : "border" + side + name;
    });

    _specialProps[index > 1 ? "border" + name : name] = function (plugin, target, property, endValue, tween) {
      var a, vars;

      if (arguments.length < 4) {
        // getter, passed target, property, and unit (from _get())
        a = props.map(function (prop) {
          return _get(plugin, prop, property);
        });
        vars = a.join(" ");
        return vars.split(a[0]).length === 5 ? a[0] : vars;
      }

      a = (endValue + "").split(" ");
      vars = {};
      props.forEach(function (prop, i) {
        return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
      });
      plugin.init(target, vars, tween);
    };
  });

  var CSSPlugin = {
    name: "css",
    register: _initCore,
    targetTest: function targetTest(target) {
      return target.style && target.nodeType;
    },
    init: function init(target, vars, tween, index, targets) {
      var props = this._props,
          style = target.style,
          startValue,
          endValue,
          endNum,
          startNum,
          type,
          specialProp,
          p,
          startUnit,
          endUnit,
          relative,
          isTransformRelated,
          transformPropTween,
          cache,
          smooth,
          hasPriority;
      _pluginInitted || _initCore();

      for (p in vars) {
        if (p === "autoRound") {
          continue;
        }

        endValue = vars[p];

        if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
          //plugins
          continue;
        }

        type = typeof endValue;
        specialProp = _specialProps[p];

        if (type === "function") {
          endValue = endValue.call(tween, index, target, targets);
          type = typeof endValue;
        }

        if (type === "string" && ~endValue.indexOf("random(")) {
          endValue = _replaceRandom(endValue);
        }

        if (specialProp) {
          if (specialProp(this, target, p, endValue, tween)) {
            hasPriority = 1;
          }
        } else if (p.substr(0, 2) === "--") {
          //CSS variable
          this.add(style, "setProperty", getComputedStyle(target).getPropertyValue(p) + "", endValue + "", index, targets, 0, 0, p);
        } else if (type !== "undefined") {
          startValue = _get(target, p);
          startNum = parseFloat(startValue);
          relative = type === "string" && endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;

          if (relative) {
            endValue = endValue.substr(2);
          }

          endNum = parseFloat(endValue);

          if (p in _propertyAliases) {
            if (p === "autoAlpha") {
              //special case where we control the visibility along with opacity. We still allow the opacity value to pass through and get tweened.
              if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
                //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
                startNum = 0;
              }

              _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
            }

            if (p !== "scale" && p !== "transform") {
              p = _propertyAliases[p];
              ~p.indexOf(",") && (p = p.split(",")[0]);
            }
          }

          isTransformRelated = p in _transformProps; //--- TRANSFORM-RELATED ---

          if (isTransformRelated) {
            if (!transformPropTween) {
              cache = target._gsap;
              cache.renderTransform || _parseTransform(target); // if, for example, gsap.set(... {transform:"translateX(50vw)"}), the _get() call doesn't parse the transform, thus cache.renderTransform won't be set yet so force the parsing of the transform here.

              smooth = vars.smoothOrigin !== false && cache.smooth;
              transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1); //the first time through, create the rendering PropTween so that it runs LAST (in the linked list, we keep adding to the beginning)

              transformPropTween.dep = 1; //flag it as dependent so that if things get killed/overwritten and this is the only PropTween left, we can safely kill the whole tween.
            }

            if (p === "scale") {
              this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, relative ? relative * endNum : endNum - cache.scaleY);
              props.push("scaleY", p);
              p += "X";
            } else if (p === "transformOrigin") {
              endValue = _convertKeywordsToPercentages(endValue); //in case something like "left top" or "bottom right" is passed in. Convert to percentages.

              if (cache.svg) {
                _applySVGOrigin(target, endValue, 0, smooth, 0, this);
              } else {
                endUnit = parseFloat(endValue.split(" ")[2]) || 0; //handle the zOrigin separately!

                endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);

                _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
              }

              continue;
            } else if (p === "svgOrigin") {
              _applySVGOrigin(target, endValue, 1, smooth, 0, this);

              continue;
            } else if (p in _rotationalProperties) {
              _addRotationalPropTween(this, cache, p, startNum, endValue, relative);

              continue;
            } else if (p === "smoothOrigin") {
              _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);

              continue;
            } else if (p === "force3D") {
              cache[p] = endValue;
              continue;
            } else if (p === "transform") {
              _addRawTransformPTs(this, endValue, target);

              continue;
            }
          } else if (!(p in style)) {
            p = _checkPropPrefix(p) || p;
          }

          if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
            startUnit = (startValue + "").substr((startNum + "").length);
            endNum || (endNum = 0); // protect against NaN

            endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
            startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
            this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, relative ? relative * endNum : endNum - startNum, endUnit === "px" && vars.autoRound !== false && !isTransformRelated ? _renderRoundedCSSProp : _renderCSSProp);
            this._pt.u = endUnit || 0;

            if (startUnit !== endUnit) {
              //when the tween goes all the way back to the beginning, we need to revert it to the OLD/ORIGINAL value (with those units). We record that as a "b" (beginning) property and point to a render method that handles that. (performance optimization)
              this._pt.b = startValue;
              this._pt.r = _renderCSSPropWithBeginning;
            }
          } else if (!(p in style)) {
            if (p in target) {
              //maybe it's not a style - it could be a property added directly to an element in which case we'll try to animate that.
              this.add(target, p, target[p], endValue, index, targets);
            } else {
              _missingPlugin(p, endValue);

              continue;
            }
          } else {
            _tweenComplexCSSString.call(this, target, p, startValue, endValue);
          }

          props.push(p);
        }
      }

      hasPriority && _sortPropTweensByPriority(this);
    },
    get: _get,
    aliases: _propertyAliases,
    getSetter: function getSetter(target, property, plugin) {
      //returns a setter function that accepts target, property, value and applies it accordingly. Remember, properties like "x" aren't as simple as target.style.property = value because they've got to be applied to a proxy object and then merged into a transform string in a renderer.
      var p = _propertyAliases[property];
      p && p.indexOf(",") < 0 && (property = p);
      return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
    },
    core: {
      _removeProperty: _removeProperty,
      _getMatrix: _getMatrix
    }
  };
  gsap.utils.checkPrefix = _checkPropPrefix;

  (function (positionAndScale, rotation, others, aliases) {
    var all = _forEachName(positionAndScale + "," + rotation + "," + others, function (name) {
      _transformProps[name] = 1;
    });

    _forEachName(rotation, function (name) {
      _config.units[name] = "deg";
      _rotationalProperties[name] = 1;
    });

    _propertyAliases[all[13]] = positionAndScale + "," + rotation;

    _forEachName(aliases, function (name) {
      var split = name.split(":");
      _propertyAliases[split[1]] = all[split[0]];
    });
  })("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");

  _forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (name) {
    _config.units[name] = "px";
  });

  gsap.registerPlugin(CSSPlugin);

  var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap,
      // to protect from tree shaking
  TweenMaxWithCSS = gsapWithCSS.core.Tween;

  function t(t,n){for(var r=0;r<n.length;r++){var i=n[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}function n(n,r,i){return r&&t(n.prototype,r),i&&t(n,i),n}function r(){return (r=Object.assign||function(t){for(var n=1;n<arguments.length;n++){var r=arguments[n];for(var i in r)Object.prototype.hasOwnProperty.call(r,i)&&(t[i]=r[i]);}return t}).apply(this,arguments)}function i(t,n){t.prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n;}function e(t){return (e=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function o(t,n){return (o=Object.setPrototypeOf||function(t,n){return t.__proto__=n,t})(t,n)}function u(t,n,r){return (u=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return !1}}()?Reflect.construct:function(t,n,r){var i=[null];i.push.apply(i,n);var e=new(Function.bind.apply(t,i));return r&&o(e,r.prototype),e}).apply(null,arguments)}function s(t){var n="function"==typeof Map?new Map:void 0;return (s=function(t){if(null===t||-1===Function.toString.call(t).indexOf("[native code]"))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==n){if(n.has(t))return n.get(t);n.set(t,r);}function r(){return u(t,arguments,e(this).constructor)}return r.prototype=Object.create(t.prototype,{constructor:{value:r,enumerable:!1,writable:!0,configurable:!0}}),o(r,t)})(t)}function f(t,n){try{var r=t();}catch(t){return n(t)}return r&&r.then?r.then(void 0,n):r}"undefined"!=typeof Symbol&&(Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator"))),"undefined"!=typeof Symbol&&(Symbol.asyncIterator||(Symbol.asyncIterator=Symbol("Symbol.asyncIterator")));var c,a="2.9.7",h=function(){};!function(t){t[t.off=0]="off",t[t.error=1]="error",t[t.warning=2]="warning",t[t.info=3]="info",t[t.debug=4]="debug";}(c||(c={}));var v=c.off,l=function(){function t(t){this.t=t;}t.getLevel=function(){return v},t.setLevel=function(t){return v=c[t]};var n=t.prototype;return n.error=function(){for(var t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];this.i(console.error,c.error,n);},n.warn=function(){for(var t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];this.i(console.warn,c.warning,n);},n.info=function(){for(var t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];this.i(console.info,c.info,n);},n.debug=function(){for(var t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];this.i(console.log,c.debug,n);},n.i=function(n,r,i){r<=t.getLevel()&&n.apply(console,["["+this.t+"] "].concat(i));},t}(),d=O,m=E,w=g,p=x,b=T,y="/",P=new RegExp(["(\\\\.)","(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?"].join("|"),"g");function g(t,n){for(var r,i=[],e=0,o=0,u="",s=n&&n.delimiter||y,f=n&&n.whitelist||void 0,c=!1;null!==(r=P.exec(t));){var a=r[0],h=r[1],v=r.index;if(u+=t.slice(o,v),o=v+a.length,h)u+=h[1],c=!0;else {var l="",d=r[2],m=r[3],w=r[4],p=r[5];if(!c&&u.length){var b=u.length-1,g=u[b];(!f||f.indexOf(g)>-1)&&(l=g,u=u.slice(0,b));}u&&(i.push(u),u="",c=!1);var E=m||w,x=l||s;i.push({name:d||e++,prefix:l,delimiter:x,optional:"?"===p||"*"===p,repeat:"+"===p||"*"===p,pattern:E?A(E):"[^"+k(x===s?x:x+s)+"]+?"});}}return (u||o<t.length)&&i.push(u+t.substr(o)),i}function E(t,n){return function(r,i){var e=t.exec(r);if(!e)return !1;for(var o=e[0],u=e.index,s={},f=i&&i.decode||decodeURIComponent,c=1;c<e.length;c++)if(void 0!==e[c]){var a=n[c-1];s[a.name]=a.repeat?e[c].split(a.delimiter).map((function(t){return f(t,a)})):f(e[c],a);}return {path:o,index:u,params:s}}}function x(t,n){for(var r=new Array(t.length),i=0;i<t.length;i++)"object"==typeof t[i]&&(r[i]=new RegExp("^(?:"+t[i].pattern+")$",R(n)));return function(n,i){for(var e="",o=i&&i.encode||encodeURIComponent,u=!i||!1!==i.validate,s=0;s<t.length;s++){var f=t[s];if("string"!=typeof f){var c,a=n?n[f.name]:void 0;if(Array.isArray(a)){if(!f.repeat)throw new TypeError('Expected "'+f.name+'" to not repeat, but got array');if(0===a.length){if(f.optional)continue;throw new TypeError('Expected "'+f.name+'" to not be empty')}for(var h=0;h<a.length;h++){if(c=o(a[h],f),u&&!r[s].test(c))throw new TypeError('Expected all "'+f.name+'" to match "'+f.pattern+'"');e+=(0===h?f.prefix:f.delimiter)+c;}}else if("string"!=typeof a&&"number"!=typeof a&&"boolean"!=typeof a){if(!f.optional)throw new TypeError('Expected "'+f.name+'" to be '+(f.repeat?"an array":"a string"))}else {if(c=o(String(a),f),u&&!r[s].test(c))throw new TypeError('Expected "'+f.name+'" to match "'+f.pattern+'", but got "'+c+'"');e+=f.prefix+c;}}else e+=f;}return e}}function k(t){return t.replace(/([.+*?=^!:${}()[\]|/\\])/g,"\\$1")}function A(t){return t.replace(/([=!:$/()])/g,"\\$1")}function R(t){return t&&t.sensitive?"":"i"}function T(t,n,r){for(var i=(r=r||{}).strict,e=!1!==r.start,o=!1!==r.end,u=r.delimiter||y,s=[].concat(r.endsWith||[]).map(k).concat("$").join("|"),f=e?"^":"",c=0;c<t.length;c++){var a=t[c];if("string"==typeof a)f+=k(a);else {var h=a.repeat?"(?:"+a.pattern+")(?:"+k(a.delimiter)+"(?:"+a.pattern+"))*":a.pattern;n&&n.push(a),f+=a.optional?a.prefix?"(?:"+k(a.prefix)+"("+h+"))?":"("+h+")?":k(a.prefix)+"("+h+")";}}if(o)i||(f+="(?:"+k(u)+")?"),f+="$"===s?"$":"(?="+s+")";else {var v=t[t.length-1],l="string"==typeof v?v[v.length-1]===u:void 0===v;i||(f+="(?:"+k(u)+"(?="+s+"))?"),l||(f+="(?="+k(u)+"|"+s+")");}return new RegExp(f,R(r))}function O(t,n,r){return t instanceof RegExp?function(t,n){if(!n)return t;var r=t.source.match(/\((?!\?)/g);if(r)for(var i=0;i<r.length;i++)n.push({name:i,prefix:null,delimiter:null,optional:!1,repeat:!1,pattern:null});return t}(t,n):Array.isArray(t)?function(t,n,r){for(var i=[],e=0;e<t.length;e++)i.push(O(t[e],n,r).source);return new RegExp("(?:"+i.join("|")+")",R(r))}(t,n,r):function(t,n,r){return T(g(t,r),n,r)}(t,n,r)}d.match=function(t,n){var r=[];return E(O(t,r,n),r)},d.regexpToFunction=m,d.parse=w,d.compile=function(t,n){return x(g(t,n),n)},d.tokensToFunction=p,d.tokensToRegExp=b;var S={container:"container",history:"history",namespace:"namespace",prefix:"data-barba",prevent:"prevent",wrapper:"wrapper"},j=new(function(){function t(){this.o=S,this.u=new DOMParser;}var n=t.prototype;return n.toString=function(t){return t.outerHTML},n.toDocument=function(t){return this.u.parseFromString(t,"text/html")},n.toElement=function(t){var n=document.createElement("div");return n.innerHTML=t,n},n.getHtml=function(t){return void 0===t&&(t=document),this.toString(t.documentElement)},n.getWrapper=function(t){return void 0===t&&(t=document),t.querySelector("["+this.o.prefix+'="'+this.o.wrapper+'"]')},n.getContainer=function(t){return void 0===t&&(t=document),t.querySelector("["+this.o.prefix+'="'+this.o.container+'"]')},n.removeContainer=function(t){document.body.contains(t)&&t.parentNode.removeChild(t);},n.addContainer=function(t,n){var r=this.getContainer();r?this.s(t,r):n.appendChild(t);},n.getNamespace=function(t){void 0===t&&(t=document);var n=t.querySelector("["+this.o.prefix+"-"+this.o.namespace+"]");return n?n.getAttribute(this.o.prefix+"-"+this.o.namespace):null},n.getHref=function(t){if(t.tagName&&"a"===t.tagName.toLowerCase()){if("string"==typeof t.href)return t.href;var n=t.getAttribute("href")||t.getAttribute("xlink:href");if(n)return this.resolveUrl(n.baseVal||n)}return null},n.resolveUrl=function(){for(var t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];var i=n.length;if(0===i)throw new Error("resolveUrl requires at least one argument; got none.");var e=document.createElement("base");if(e.href=arguments[0],1===i)return e.href;var o=document.getElementsByTagName("head")[0];o.insertBefore(e,o.firstChild);for(var u,s=document.createElement("a"),f=1;f<i;f++)s.href=arguments[f],e.href=u=s.href;return o.removeChild(e),u},n.s=function(t,n){n.parentNode.insertBefore(t,n.nextSibling);},t}()),M=new(function(){function t(){this.h=[],this.v=-1;}var i=t.prototype;return i.init=function(t,n){this.l="barba";var r={ns:n,scroll:{x:window.scrollX,y:window.scrollY},url:t};this.h.push(r),this.v=0;var i={from:this.l,index:0,states:[].concat(this.h)};window.history&&window.history.replaceState(i,"",t);},i.change=function(t,n,r){if(r&&r.state){var i=r.state,e=i.index;n=this.m(this.v-e),this.replace(i.states),this.v=e;}else this.add(t,n);return n},i.add=function(t,n){var r=this.size,i=this.p(n),e={ns:"tmp",scroll:{x:window.scrollX,y:window.scrollY},url:t};this.h.push(e),this.v=r;var o={from:this.l,index:r,states:[].concat(this.h)};switch(i){case"push":window.history&&window.history.pushState(o,"",t);break;case"replace":window.history&&window.history.replaceState(o,"",t);}},i.update=function(t,n){var i=n||this.v,e=r({},this.get(i),{},t);this.set(i,e);},i.remove=function(t){t?this.h.splice(t,1):this.h.pop(),this.v--;},i.clear=function(){this.h=[],this.v=-1;},i.replace=function(t){this.h=t;},i.get=function(t){return this.h[t]},i.set=function(t,n){return this.h[t]=n},i.p=function(t){var n="push",r=t,i=S.prefix+"-"+S.history;return r.hasAttribute&&r.hasAttribute(i)&&(n=r.getAttribute(i)),n},i.m=function(t){return Math.abs(t)>1?t>0?"forward":"back":0===t?"popstate":t>0?"back":"forward"},n(t,[{key:"current",get:function(){return this.h[this.v]}},{key:"state",get:function(){return this.h[this.h.length-1]}},{key:"previous",get:function(){return this.v<1?null:this.h[this.v-1]}},{key:"size",get:function(){return this.h.length}}]),t}()),L=function(t,n){try{var r=function(){if(!n.next.html)return Promise.resolve(t).then((function(t){var r=n.next;if(t){var i=j.toElement(t);r.namespace=j.getNamespace(i),r.container=j.getContainer(i),r.html=t,M.update({ns:r.namespace});var e=j.toDocument(t);document.title=e.title;}}))}();return Promise.resolve(r&&r.then?r.then((function(){})):void 0)}catch(t){return Promise.reject(t)}},$=d,_={__proto__:null,update:L,nextTick:function(){return new Promise((function(t){window.requestAnimationFrame(t);}))},pathToRegexp:$},q=function(){return window.location.origin},B=function(t){return void 0===t&&(t=window.location.href),U(t).port},U=function(t){var n,r=t.match(/:\d+/);if(null===r)/^http/.test(t)&&(n=80),/^https/.test(t)&&(n=443);else {var i=r[0].substring(1);n=parseInt(i,10);}var e,o=t.replace(q(),""),u={},s=o.indexOf("#");s>=0&&(e=o.slice(s+1),o=o.slice(0,s));var f=o.indexOf("?");return f>=0&&(u=D(o.slice(f+1)),o=o.slice(0,f)),{hash:e,path:o,port:n,query:u}},D=function(t){return t.split("&").reduce((function(t,n){var r=n.split("=");return t[r[0]]=r[1],t}),{})},F=function(t){return void 0===t&&(t=window.location.href),t.replace(/(\/#.*|\/|#.*)$/,"")},H={__proto__:null,getHref:function(){return window.location.href},getOrigin:q,getPort:B,getPath:function(t){return void 0===t&&(t=window.location.href),U(t).path},parse:U,parseQuery:D,clean:F};function I(t,n,r){return void 0===n&&(n=2e3),new Promise((function(i,e){var o=new XMLHttpRequest;o.onreadystatechange=function(){if(o.readyState===XMLHttpRequest.DONE)if(200===o.status)i(o.responseText);else if(o.status){var n={status:o.status,statusText:o.statusText};r(t,n),e(n);}},o.ontimeout=function(){var i=new Error("Timeout error ["+n+"]");r(t,i),e(i);},o.onerror=function(){var n=new Error("Fetch error");r(t,n),e(n);},o.open("GET",t),o.timeout=n,o.setRequestHeader("Accept","text/html,application/xhtml+xml,application/xml"),o.setRequestHeader("x-barba","yes"),o.send();}))}var C=function(t){return !!t&&("object"==typeof t||"function"==typeof t)&&"function"==typeof t.then};function N(t,n){return void 0===n&&(n={}),function(){for(var r=arguments.length,i=new Array(r),e=0;e<r;e++)i[e]=arguments[e];var o=!1,u=new Promise((function(r,e){n.async=function(){return o=!0,function(t,n){t?e(t):r(n);}};var u=t.apply(n,i);o||(C(u)?u.then(r,e):r(u));}));return u}}var X=new(function(t){function n(){var n;return (n=t.call(this)||this).logger=new l("@barba/core"),n.all=["ready","page","reset","currentAdded","currentRemoved","nextAdded","nextRemoved","beforeOnce","once","afterOnce","before","beforeLeave","leave","afterLeave","beforeEnter","enter","afterEnter","after"],n.registered=new Map,n.init(),n}i(n,t);var r=n.prototype;return r.init=function(){var t=this;this.registered.clear(),this.all.forEach((function(n){t[n]||(t[n]=function(r,i){t.registered.has(n)||t.registered.set(n,new Set),t.registered.get(n).add({ctx:i||{},fn:r});});}));},r.do=function(t){for(var n=this,r=arguments.length,i=new Array(r>1?r-1:0),e=1;e<r;e++)i[e-1]=arguments[e];if(this.registered.has(t)){var o=Promise.resolve();return this.registered.get(t).forEach((function(t){o=o.then((function(){return N(t.fn,t.ctx).apply(void 0,i)}));})),o.catch((function(r){n.logger.debug("Hook error ["+t+"]"),n.logger.error(r);}))}return Promise.resolve()},r.clear=function(){var t=this;this.all.forEach((function(n){delete t[n];})),this.init();},r.help=function(){this.logger.info("Available hooks: "+this.all.join(","));var t=[];this.registered.forEach((function(n,r){return t.push(r)})),this.logger.info("Registered hooks: "+t.join(","));},n}(h)),z=function(){function t(t){if(this.P=[],"boolean"==typeof t)this.g=t;else {var n=Array.isArray(t)?t:[t];this.P=n.map((function(t){return $(t)}));}}return t.prototype.checkHref=function(t){if("boolean"==typeof this.g)return this.g;var n=U(t).path;return this.P.some((function(t){return null!==t.exec(n)}))},t}(),G=function(t){function n(n){var r;return (r=t.call(this,n)||this).k=new Map,r}i(n,t);var e=n.prototype;return e.set=function(t,n,r){return this.k.set(t,{action:r,request:n}),{action:r,request:n}},e.get=function(t){return this.k.get(t)},e.getRequest=function(t){return this.k.get(t).request},e.getAction=function(t){return this.k.get(t).action},e.has=function(t){return !this.checkHref(t)&&this.k.has(t)},e.delete=function(t){return this.k.delete(t)},e.update=function(t,n){var i=r({},this.k.get(t),{},n);return this.k.set(t,i),i},n}(z),Q=function(){return !window.history.pushState},W=function(t){return !t.el||!t.href},J=function(t){var n=t.event;return n.which>1||n.metaKey||n.ctrlKey||n.shiftKey||n.altKey},K=function(t){var n=t.el;return n.hasAttribute("target")&&"_blank"===n.target},V=function(t){var n=t.el;return void 0!==n.protocol&&window.location.protocol!==n.protocol||void 0!==n.hostname&&window.location.hostname!==n.hostname},Y=function(t){var n=t.el;return void 0!==n.port&&B()!==B(n.href)},Z=function(t){var n=t.el;return n.getAttribute&&"string"==typeof n.getAttribute("download")},tt=function(t){return t.el.hasAttribute(S.prefix+"-"+S.prevent)},nt=function(t){return Boolean(t.el.closest("["+S.prefix+"-"+S.prevent+'="all"]'))},rt=function(t){var n=t.href;return F(n)===F()&&B(n)===B()},it=function(t){function n(n){var r;return (r=t.call(this,n)||this).suite=[],r.tests=new Map,r.init(),r}i(n,t);var r=n.prototype;return r.init=function(){this.add("pushState",Q),this.add("exists",W),this.add("newTab",J),this.add("blank",K),this.add("corsDomain",V),this.add("corsPort",Y),this.add("download",Z),this.add("preventSelf",tt),this.add("preventAll",nt),this.add("sameUrl",rt,!1);},r.add=function(t,n,r){void 0===r&&(r=!0),this.tests.set(t,n),r&&this.suite.push(t);},r.run=function(t,n,r,i){return this.tests.get(t)({el:n,event:r,href:i})},r.checkLink=function(t,n,r){var i=this;return this.suite.some((function(e){return i.run(e,t,n,r)}))},n}(z),et=function(t){function n(r,i){var e;void 0===i&&(i="Barba error");for(var o=arguments.length,u=new Array(o>2?o-2:0),s=2;s<o;s++)u[s-2]=arguments[s];return (e=t.call.apply(t,[this].concat(u))||this).error=r,e.label=i,Error.captureStackTrace&&Error.captureStackTrace(function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(e),n),e.name="BarbaError",e}return i(n,t),n}(s(Error)),ot=function(){function t(t){void 0===t&&(t=[]),this.logger=new l("@barba/core"),this.all=[],this.page=[],this.once=[],this.A=[{name:"namespace",type:"strings"},{name:"custom",type:"function"}],t&&(this.all=this.all.concat(t)),this.update();}var n=t.prototype;return n.add=function(t,n){switch(t){case"rule":this.A.splice(n.position||0,0,n.value);break;case"transition":default:this.all.push(n);}this.update();},n.resolve=function(t,n){var r=this;void 0===n&&(n={});var i=n.once?this.once:this.page;i=i.filter(n.self?function(t){return t.name&&"self"===t.name}:function(t){return !t.name||"self"!==t.name});var e=new Map,o=i.find((function(i){var o=!0,u={};return !(!n.self||"self"!==i.name)||(r.A.reverse().forEach((function(n){o&&(o=r.R(i,n,t,u),i.from&&i.to&&(o=r.R(i,n,t,u,"from")&&r.R(i,n,t,u,"to")),i.from&&!i.to&&(o=r.R(i,n,t,u,"from")),!i.from&&i.to&&(o=r.R(i,n,t,u,"to")));})),e.set(i,u),o)})),u=e.get(o),s=[];if(s.push(n.once?"once":"page"),n.self&&s.push("self"),u){var f,c=[o];Object.keys(u).length>0&&c.push(u),(f=this.logger).info.apply(f,["Transition found ["+s.join(",")+"]"].concat(c));}else this.logger.info("No transition found ["+s.join(",")+"]");return o},n.update=function(){var t=this;this.all=this.all.map((function(n){return t.T(n)})).sort((function(t,n){return t.priority-n.priority})).reverse().map((function(t){return delete t.priority,t})),this.page=this.all.filter((function(t){return void 0!==t.leave||void 0!==t.enter})),this.once=this.all.filter((function(t){return void 0!==t.once}));},n.R=function(t,n,r,i,e){var o=!0,u=!1,s=t,f=n.name,c=f,a=f,h=f,v=e?s[e]:s,l="to"===e?r.next:r.current;if(e?v&&v[f]:v[f]){switch(n.type){case"strings":default:var d=Array.isArray(v[c])?v[c]:[v[c]];l[c]&&-1!==d.indexOf(l[c])&&(u=!0),-1===d.indexOf(l[c])&&(o=!1);break;case"object":var m=Array.isArray(v[a])?v[a]:[v[a]];l[a]?(l[a].name&&-1!==m.indexOf(l[a].name)&&(u=!0),-1===m.indexOf(l[a].name)&&(o=!1)):o=!1;break;case"function":v[h](r)?u=!0:o=!1;}u&&(e?(i[e]=i[e]||{},i[e][f]=s[e][f]):i[f]=s[f]);}return o},n.O=function(t,n,r){var i=0;return (t[n]||t.from&&t.from[n]||t.to&&t.to[n])&&(i+=Math.pow(10,r),t.from&&t.from[n]&&(i+=1),t.to&&t.to[n]&&(i+=2)),i},n.T=function(t){var n=this;t.priority=0;var r=0;return this.A.forEach((function(i,e){r+=n.O(t,i.name,e+1);})),t.priority=r,t},t}(),ut=function(){function t(t){void 0===t&&(t=[]),this.logger=new l("@barba/core"),this.S=!1,this.store=new ot(t);}var r=t.prototype;return r.get=function(t,n){return this.store.resolve(t,n)},r.doOnce=function(t){var n=t.data,r=t.transition;try{var i=function(){e.S=!1;},e=this,o=r||{};e.S=!0;var u=f((function(){return Promise.resolve(e.j("beforeOnce",n,o)).then((function(){return Promise.resolve(e.once(n,o)).then((function(){return Promise.resolve(e.j("afterOnce",n,o)).then((function(){}))}))}))}),(function(t){e.S=!1,e.logger.debug("Transition error [before/after/once]"),e.logger.error(t);}));return Promise.resolve(u&&u.then?u.then(i):i())}catch(t){return Promise.reject(t)}},r.doPage=function(t){var n=t.data,r=t.transition,i=t.page,e=t.wrapper;try{var o=function(t){if(u)return t;s.S=!1;},u=!1,s=this,c=r||{},a=!0===c.sync||!1;s.S=!0;var h=f((function(){function t(){return Promise.resolve(s.j("before",n,c)).then((function(){var t=!1;function r(r){return t?r:Promise.resolve(s.remove(n)).then((function(){return Promise.resolve(s.j("after",n,c)).then((function(){}))}))}var o=function(){if(a)return f((function(){return Promise.resolve(s.add(n,e)).then((function(){return Promise.resolve(s.j("beforeLeave",n,c)).then((function(){return Promise.resolve(s.j("beforeEnter",n,c)).then((function(){return Promise.resolve(Promise.all([s.leave(n,c),s.enter(n,c)])).then((function(){return Promise.resolve(s.j("afterLeave",n,c)).then((function(){return Promise.resolve(s.j("afterEnter",n,c)).then((function(){}))}))}))}))}))}))}),(function(t){if(s.M(t))throw new et(t,"Transition error [sync]")}));var r=function(r){return t?r:f((function(){var t=function(){if(!1!==o)return Promise.resolve(s.add(n,e)).then((function(){return Promise.resolve(s.j("beforeEnter",n,c)).then((function(){return Promise.resolve(s.enter(n,c,o)).then((function(){return Promise.resolve(s.j("afterEnter",n,c)).then((function(){}))}))}))}))}();if(t&&t.then)return t.then((function(){}))}),(function(t){if(s.M(t))throw new et(t,"Transition error [before/after/enter]")}))},o=!1,u=f((function(){return Promise.resolve(s.j("beforeLeave",n,c)).then((function(){return Promise.resolve(Promise.all([s.leave(n,c),L(i,n)]).then((function(t){return t[0]}))).then((function(t){return o=t,Promise.resolve(s.j("afterLeave",n,c)).then((function(){}))}))}))}),(function(t){if(s.M(t))throw new et(t,"Transition error [before/after/leave]")}));return u&&u.then?u.then(r):r(u)}();return o&&o.then?o.then(r):r(o)}))}var r=function(){if(a)return Promise.resolve(L(i,n)).then((function(){}))}();return r&&r.then?r.then(t):t()}),(function(t){if(s.S=!1,t.name&&"BarbaError"===t.name)throw s.logger.debug(t.label),s.logger.error(t.error),t;throw s.logger.debug("Transition error [page]"),s.logger.error(t),t}));return Promise.resolve(h&&h.then?h.then(o):o(h))}catch(t){return Promise.reject(t)}},r.once=function(t,n){try{return Promise.resolve(X.do("once",t,n)).then((function(){return n.once?N(n.once,n)(t):Promise.resolve()}))}catch(t){return Promise.reject(t)}},r.leave=function(t,n){try{return Promise.resolve(X.do("leave",t,n)).then((function(){return n.leave?N(n.leave,n)(t):Promise.resolve()}))}catch(t){return Promise.reject(t)}},r.enter=function(t,n,r){try{return Promise.resolve(X.do("enter",t,n)).then((function(){return n.enter?N(n.enter,n)(t,r):Promise.resolve()}))}catch(t){return Promise.reject(t)}},r.add=function(t,n){try{return j.addContainer(t.next.container,n),X.do("nextAdded",t),Promise.resolve()}catch(t){return Promise.reject(t)}},r.remove=function(t){try{return j.removeContainer(t.current.container),X.do("currentRemoved",t),Promise.resolve()}catch(t){return Promise.reject(t)}},r.M=function(t){return t.message?!/Timeout error|Fetch error/.test(t.message):!t.status},r.j=function(t,n,r){try{return Promise.resolve(X.do(t,n,r)).then((function(){return r[t]?N(r[t],r)(n):Promise.resolve()}))}catch(t){return Promise.reject(t)}},n(t,[{key:"isRunning",get:function(){return this.S},set:function(t){this.S=t;}},{key:"hasOnce",get:function(){return this.store.once.length>0}},{key:"hasSelf",get:function(){return this.store.all.some((function(t){return "self"===t.name}))}},{key:"shouldWait",get:function(){return this.store.all.some((function(t){return t.to&&!t.to.route||t.sync}))}}]),t}(),st=function(){function t(t){var n=this;this.names=["beforeLeave","afterLeave","beforeEnter","afterEnter"],this.byNamespace=new Map,0!==t.length&&(t.forEach((function(t){n.byNamespace.set(t.namespace,t);})),this.names.forEach((function(t){X[t](n.L(t));})));}return t.prototype.L=function(t){var n=this;return function(r){var i=t.match(/enter/i)?r.next:r.current,e=n.byNamespace.get(i.namespace);return e&&e[t]?N(e[t],e)(r):Promise.resolve()}},t}();Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),Element.prototype.closest||(Element.prototype.closest=function(t){var n=this;do{if(n.matches(t))return n;n=n.parentElement||n.parentNode;}while(null!==n&&1===n.nodeType);return null});var ft={container:null,html:"",namespace:"",url:{hash:"",href:"",path:"",port:null,query:{}}},ct=new(function(){function t(){this.version=a,this.schemaPage=ft,this.Logger=l,this.logger=new l("@barba/core"),this.plugins=[],this.hooks=X,this.dom=j,this.helpers=_,this.history=M,this.request=I,this.url=H;}var i=t.prototype;return i.use=function(t,n){var r=this.plugins;r.indexOf(t)>-1?this.logger.warn("Plugin ["+t.name+"] already installed."):"function"==typeof t.install?(t.install(this,n),r.push(t)):this.logger.warn("Plugin ["+t.name+'] has no "install" method.');},i.init=function(t){var n=void 0===t?{}:t,i=n.transitions,e=void 0===i?[]:i,o=n.views,u=void 0===o?[]:o,s=n.schema,f=void 0===s?S:s,c=n.requestError,a=n.timeout,h=void 0===a?2e3:a,v=n.cacheIgnore,d=void 0!==v&&v,m=n.prefetchIgnore,w=void 0!==m&&m,p=n.preventRunning,b=void 0!==p&&p,y=n.prevent,P=void 0===y?null:y,g=n.debug,E=n.logLevel;if(l.setLevel(!0===(void 0!==g&&g)?"debug":void 0===E?"off":E),this.logger.info(this.version),Object.keys(f).forEach((function(t){S[t]&&(S[t]=f[t]);})),this.$=c,this.timeout=h,this.cacheIgnore=d,this.prefetchIgnore=w,this.preventRunning=b,this._=this.dom.getWrapper(),!this._)throw new Error("[@barba/core] No Barba wrapper found");this._.setAttribute("aria-live","polite"),this.q();var x=this.data.current;if(!x.container)throw new Error("[@barba/core] No Barba container found");if(this.cache=new G(d),this.prevent=new it(w),this.transitions=new ut(e),this.views=new st(u),null!==P){if("function"!=typeof P)throw new Error("[@barba/core] Prevent should be a function");this.prevent.add("preventCustom",P);}this.history.init(x.url.href,x.namespace),this.B=this.B.bind(this),this.U=this.U.bind(this),this.D=this.D.bind(this),this.F(),this.plugins.forEach((function(t){return t.init()}));var k=this.data;k.trigger="barba",k.next=k.current,k.current=r({},this.schemaPage),this.hooks.do("ready",k),this.once(k),this.q();},i.destroy=function(){this.q(),this.H(),this.history.clear(),this.hooks.clear(),this.plugins=[];},i.force=function(t){window.location.assign(t);},i.go=function(t,n,r){var i;if(void 0===n&&(n="barba"),this.transitions.isRunning)this.force(t);else if(!(i="popstate"===n?this.history.current&&this.url.getPath(this.history.current.url)===this.url.getPath(t):this.prevent.run("sameUrl",null,null,t))||this.transitions.hasSelf)return n=this.history.change(t,n,r),r&&(r.stopPropagation(),r.preventDefault()),this.page(t,n,i)},i.once=function(t){try{var n=this;return Promise.resolve(n.hooks.do("beforeEnter",t)).then((function(){function r(){return Promise.resolve(n.hooks.do("afterEnter",t)).then((function(){}))}var i=function(){if(n.transitions.hasOnce){var r=n.transitions.get(t,{once:!0});return Promise.resolve(n.transitions.doOnce({transition:r,data:t})).then((function(){}))}}();return i&&i.then?i.then(r):r()}))}catch(t){return Promise.reject(t)}},i.page=function(t,n,i){try{var e=function(){var t=o.data;return Promise.resolve(o.hooks.do("page",t)).then((function(){var n=f((function(){var n=o.transitions.get(t,{once:!1,self:i});return Promise.resolve(o.transitions.doPage({data:t,page:u,transition:n,wrapper:o._})).then((function(){o.q();}))}),(function(){0===l.getLevel()&&o.force(t.current.url.href);}));if(n&&n.then)return n.then((function(){}))}))},o=this;o.data.next.url=r({href:t},o.url.parse(t)),o.data.trigger=n;var u=o.cache.has(t)?o.cache.update(t,{action:"click"}).request:o.cache.set(t,o.request(t,o.timeout,o.onRequestError.bind(o,n)),"click").request,s=function(){if(o.transitions.shouldWait)return Promise.resolve(L(u,o.data)).then((function(){}))}();return Promise.resolve(s&&s.then?s.then(e):e())}catch(t){return Promise.reject(t)}},i.onRequestError=function(t){this.transitions.isRunning=!1;for(var n=arguments.length,r=new Array(n>1?n-1:0),i=1;i<n;i++)r[i-1]=arguments[i];var e=r[0],o=r[1],u=this.cache.getAction(e);return this.cache.delete(e),!(this.$&&!1===this.$(t,u,e,o)||("click"===u&&this.force(e),1))},i.prefetch=function(t){var n=this;this.cache.has(t)||this.cache.set(t,this.request(t,this.timeout,this.onRequestError.bind(this,"barba")).catch((function(t){n.logger.error(t);})),"prefetch");},i.F=function(){!0!==this.prefetchIgnore&&(document.addEventListener("mouseover",this.B),document.addEventListener("touchstart",this.B)),document.addEventListener("click",this.U),window.addEventListener("popstate",this.D);},i.H=function(){!0!==this.prefetchIgnore&&(document.removeEventListener("mouseover",this.B),document.removeEventListener("touchstart",this.B)),document.removeEventListener("click",this.U),window.removeEventListener("popstate",this.D);},i.B=function(t){var n=this,r=this.I(t);if(r){var i=this.dom.getHref(r);this.prevent.checkHref(i)||this.cache.has(i)||this.cache.set(i,this.request(i,this.timeout,this.onRequestError.bind(this,r)).catch((function(t){n.logger.error(t);})),"enter");}},i.U=function(t){var n=this.I(t);if(n)return this.transitions.isRunning&&this.preventRunning?(t.preventDefault(),void t.stopPropagation()):void this.go(this.dom.getHref(n),n,t)},i.D=function(t){this.go(this.url.getHref(),"popstate",t);},i.I=function(t){for(var n=t.target;n&&!this.dom.getHref(n);)n=n.parentNode;if(n&&!this.prevent.checkLink(n,t,this.dom.getHref(n)))return n},i.q=function(){var t=this.url.getHref(),n={container:this.dom.getContainer(),html:this.dom.getHtml(),namespace:this.dom.getNamespace(),url:r({href:t},this.url.parse(t))};this.C={current:n,next:r({},this.schemaPage),trigger:void 0},this.hooks.do("reset",this.data);},n(t,[{key:"data",get:function(){return this.C}},{key:"wrapper",get:function(){return this._}}]),t}());

  /*!
   * ScrollTrigger 3.5.1
   * https://greensock.com
   *
   * @license Copyright 2008-2020, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */

  /* eslint-disable */
  var gsap$1,
      _coreInitted$1,
      _win$2,
      _doc$2,
      _docEl,
      _body,
      _root,
      _resizeDelay,
      _raf,
      _request,
      _toArray,
      _clamp$1,
      _time2,
      _syncInterval,
      _refreshing,
      _pointerIsDown,
      _transformProp$1,
      _i,
      _prevWidth,
      _prevHeight,
      _autoRefresh,
      _sort,
      _limitCallbacks,
      // if true, we'll only trigger callbacks if the active state toggles, so if you scroll immediately past both the start and end positions of a ScrollTrigger (thus inactive to inactive), neither its onEnter nor onLeave will be called. This is useful during startup.
  _startup = 1,
      _proxies = [],
      _scrollers = [],
      _getTime = Date.now,
      _time1 = _getTime(),
      _lastScrollTime = 0,
      _enabled = 1,
      _passThrough$1 = function _passThrough(v) {
    return v;
  },
      _windowExists$2 = function _windowExists() {
    return typeof window !== "undefined";
  },
      _getGSAP = function _getGSAP() {
    return gsap$1 || _windowExists$2() && (gsap$1 = window.gsap) && gsap$1.registerPlugin && gsap$1;
  },
      _isViewport = function _isViewport(e) {
    return !!~_root.indexOf(e);
  },
      _getProxyProp = function _getProxyProp(element, property) {
    return ~_proxies.indexOf(element) && _proxies[_proxies.indexOf(element) + 1][property];
  },
      _getScrollFunc = function _getScrollFunc(element, _ref) {
    var s = _ref.s,
        sc = _ref.sc;

    var i = _scrollers.indexOf(element),
        offset = sc === _vertical.sc ? 1 : 2;

    !~i && (i = _scrollers.push(element) - 1);
    return _scrollers[i + offset] || (_scrollers[i + offset] = _getProxyProp(element, s) || (_isViewport(element) ? sc : function (value) {
      return arguments.length ? element[s] = value : element[s];
    }));
  },
      _getBoundsFunc = function _getBoundsFunc(element) {
    return _getProxyProp(element, "getBoundingClientRect") || (_isViewport(element) ? function () {
      _winOffsets.width = _win$2.innerWidth;
      _winOffsets.height = _win$2.innerHeight;
      return _winOffsets;
    } : function () {
      return _getBounds(element);
    });
  },
      _getSizeFunc = function _getSizeFunc(scroller, isViewport, _ref2) {
    var d = _ref2.d,
        d2 = _ref2.d2,
        a = _ref2.a;
    return (a = _getProxyProp(scroller, "getBoundingClientRect")) ? function () {
      return a()[d];
    } : function () {
      return (isViewport ? _win$2["inner" + d2] : scroller["client" + d2]) || 0;
    };
  },
      _getOffsetsFunc = function _getOffsetsFunc(element, isViewport) {
    return !isViewport || ~_proxies.indexOf(element) ? _getBoundsFunc(element) : function () {
      return _winOffsets;
    };
  },
      _maxScroll = function _maxScroll(element, _ref3) {
    var s = _ref3.s,
        d2 = _ref3.d2,
        d = _ref3.d,
        a = _ref3.a;
    return (s = "scroll" + d2) && (a = _getProxyProp(element, s)) ? a() - _getBoundsFunc(element)()[d] : _isViewport(element) ? Math.max(_docEl[s], _body[s]) - (_win$2["inner" + d2] || _docEl["client" + d2] || _body["client" + d2]) : element[s] - element["offset" + d2];
  },
      _iterateAutoRefresh = function _iterateAutoRefresh(func, events) {
    for (var i = 0; i < _autoRefresh.length; i += 3) {
      (!events || ~events.indexOf(_autoRefresh[i + 1])) && func(_autoRefresh[i], _autoRefresh[i + 1], _autoRefresh[i + 2]);
    }
  },
      _isString$1 = function _isString(value) {
    return typeof value === "string";
  },
      _isFunction$1 = function _isFunction(value) {
    return typeof value === "function";
  },
      _isNumber$1 = function _isNumber(value) {
    return typeof value === "number";
  },
      _isObject$1 = function _isObject(value) {
    return typeof value === "object";
  },
      _callIfFunc = function _callIfFunc(value) {
    return _isFunction$1(value) && value();
  },
      _combineFunc = function _combineFunc(f1, f2) {
    return function () {
      var result1 = _callIfFunc(f1),
          result2 = _callIfFunc(f2);

      return function () {
        _callIfFunc(result1);

        _callIfFunc(result2);
      };
    };
  },
      _abs = Math.abs,
      _scrollLeft = "scrollLeft",
      _scrollTop = "scrollTop",
      _left = "left",
      _top = "top",
      _right = "right",
      _bottom = "bottom",
      _width = "width",
      _height = "height",
      _Right = "Right",
      _Left = "Left",
      _Top = "Top",
      _Bottom = "Bottom",
      _padding = "padding",
      _margin = "margin",
      _Width = "Width",
      _Height = "Height",
      _px = "px",
      _horizontal = {
    s: _scrollLeft,
    p: _left,
    p2: _Left,
    os: _right,
    os2: _Right,
    d: _width,
    d2: _Width,
    a: "x",
    sc: function sc(value) {
      return arguments.length ? _win$2.scrollTo(value, _vertical.sc()) : _win$2.pageXOffset || _doc$2[_scrollLeft] || _docEl[_scrollLeft] || _body[_scrollLeft] || 0;
    }
  },
      _vertical = {
    s: _scrollTop,
    p: _top,
    p2: _Top,
    os: _bottom,
    os2: _Bottom,
    d: _height,
    d2: _Height,
    a: "y",
    op: _horizontal,
    sc: function sc(value) {
      return arguments.length ? _win$2.scrollTo(_horizontal.sc(), value) : _win$2.pageYOffset || _doc$2[_scrollTop] || _docEl[_scrollTop] || _body[_scrollTop] || 0;
    }
  },
      _getComputedStyle = function _getComputedStyle(element) {
    return _win$2.getComputedStyle(element);
  },
      _makePositionable = function _makePositionable(element) {
    return element.style.position = _getComputedStyle(element).position === "absolute" ? "absolute" : "relative";
  },
      // if the element already has position: absolute, leave that, otherwise make it position: relative
  _setDefaults$1 = function _setDefaults(obj, defaults) {
    for (var p in defaults) {
      p in obj || (obj[p] = defaults[p]);
    }

    return obj;
  },
      //_isInViewport = element => (element = _getBounds(element)) && !(element.top > (_win.innerHeight || _docEl.clientHeight) || element.bottom < 0 || element.left > (_win.innerWidth || _docEl.clientWidth) || element.right < 0) && element,
  _getBounds = function _getBounds(element, withoutTransforms) {
    var tween = withoutTransforms && _getComputedStyle(element)[_transformProp$1] !== "matrix(1, 0, 0, 1, 0, 0)" && gsap$1.to(element, {
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      rotation: 0,
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      skewX: 0,
      skewY: 0
    }).progress(1),
        bounds = element.getBoundingClientRect();
    tween && tween.progress(0).kill();
    return bounds;
  },
      _getSize = function _getSize(element, _ref4) {
    var d2 = _ref4.d2;
    return element["offset" + d2] || element["client" + d2] || 0;
  },
      _getLabels = function _getLabels(animation) {
    return function (value) {
      var a = [],
          labels = animation.labels,
          duration = animation.duration(),
          p;

      for (p in labels) {
        a.push(labels[p] / duration);
      }

      return gsap$1.utils.snap(a, value);
    };
  },
      _multiListener = function _multiListener(func, element, types, callback) {
    return types.split(",").forEach(function (type) {
      return func(element, type, callback);
    });
  },
      _addListener = function _addListener(element, type, func) {
    return element.addEventListener(type, func, {
      passive: true
    });
  },
      _removeListener = function _removeListener(element, type, func) {
    return element.removeEventListener(type, func);
  },
      _markerDefaults = {
    startColor: "green",
    endColor: "red",
    indent: 0,
    fontSize: "16px",
    fontWeight: "normal"
  },
      _defaults$1 = {
    toggleActions: "play",
    anticipatePin: 0
  },
      _keywords = {
    top: 0,
    left: 0,
    center: 0.5,
    bottom: 1,
    right: 1
  },
      _offsetToPx = function _offsetToPx(value, size) {
    if (_isString$1(value)) {
      var eqIndex = value.indexOf("="),
          relative = ~eqIndex ? +(value.charAt(eqIndex - 1) + 1) * parseFloat(value.substr(eqIndex + 1)) : 0;

      if (relative) {
        value.indexOf("%") > eqIndex && (relative *= size / 100);
        value = value.substr(0, eqIndex - 1);
      }

      value = relative + (value in _keywords ? _keywords[value] * size : ~value.indexOf("%") ? parseFloat(value) * size / 100 : parseFloat(value) || 0);
    }

    return value;
  },
      _createMarker = function _createMarker(type, name, container, direction, _ref5, offset, matchWidthEl) {
    var startColor = _ref5.startColor,
        endColor = _ref5.endColor,
        fontSize = _ref5.fontSize,
        indent = _ref5.indent,
        fontWeight = _ref5.fontWeight;

    var e = _doc$2.createElement("div"),
        useFixedPosition = _isViewport(container) || _getProxyProp(container, "pinType") === "fixed",
        isScroller = type.indexOf("scroller") !== -1,
        parent = useFixedPosition ? _body : container,
        isStart = type.indexOf("start") !== -1,
        color = isStart ? startColor : endColor,
        css = "border-color:" + color + ";font-size:" + fontSize + ";color:" + color + ";font-weight:" + fontWeight + ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";

    css += "position:" + (isScroller && useFixedPosition ? "fixed;" : "absolute;");
    (isScroller || !useFixedPosition) && (css += (direction === _vertical ? _right : _bottom) + ":" + (offset + parseFloat(indent)) + "px;");
    matchWidthEl && (css += "box-sizing:border-box;text-align:left;width:" + matchWidthEl.offsetWidth + "px;");
    e._isStart = isStart;
    e.setAttribute("class", "gsap-marker-" + type);
    e.style.cssText = css;
    e.innerText = name || name === 0 ? type + "-" + name : type;
    parent.insertBefore(e, parent.children[0]);
    e._offset = e["offset" + direction.op.d2];

    _positionMarker(e, 0, direction, isStart);

    return e;
  },
      _positionMarker = function _positionMarker(marker, start, direction, flipped) {
    var vars = {
      display: "block"
    },
        side = direction[flipped ? "os2" : "p2"],
        oppositeSide = direction[flipped ? "p2" : "os2"];
    marker._isFlipped = flipped;
    vars[direction.a + "Percent"] = flipped ? -100 : 0;
    vars[direction.a] = flipped ? 1 : 0;
    vars["border" + side + _Width] = 1;
    vars["border" + oppositeSide + _Width] = 0;
    vars[direction.p] = start;
    gsap$1.set(marker, vars);
  },
      _triggers = [],
      _ids = {},
      _sync = function _sync() {
    return _request || (_request = _raf(_updateAll));
  },
      _onScroll = function _onScroll() {
    if (!_request) {
      _request = _raf(_updateAll);
      _lastScrollTime || _dispatch("scrollStart");
      _lastScrollTime = _getTime();
    }
  },
      _onResize = function _onResize() {
    return !_refreshing && _resizeDelay.restart(true);
  },
      // ignore resizes triggered by refresh()
  _listeners = {},
      _emptyArray = [],
      _media = [],
      _creatingMedia,
      // when ScrollTrigger.matchMedia() is called, we record the current media key here (like "(min-width: 800px)") so that we can assign it to everything that's created during that call. Then we can revert just those when necessary. In the ScrollTrigger's init() call, the _creatingMedia is recorded as a "media" property on the instance.
  _lastMediaTick,
      _onMediaChange = function _onMediaChange(e) {
    var tick = gsap$1.ticker.frame,
        matches = [],
        i = 0,
        index;

    if (_lastMediaTick !== tick || _startup) {
      _revertAll();

      for (; i < _media.length; i += 4) {
        index = _win$2.matchMedia(_media[i]).matches;

        if (index !== _media[i + 3]) {
          // note: some browsers fire the matchMedia event multiple times, like when going full screen, so we shouldn't call the function multiple times. Check to see if it's already matched.
          _media[i + 3] = index;
          index ? matches.push(i) : _revertAll(1, _media[i]) || _isFunction$1(_media[i + 2]) && _media[i + 2](); // Firefox doesn't update the "matches" property of the MediaQueryList object correctly - it only does so as it calls its change handler - so we must re-create a media query here to ensure it's accurate.
        }
      }

      _revertRecorded(); // in case killing/reverting any of the animations actually added inline styles back.


      for (i = 0; i < matches.length; i++) {
        index = matches[i];
        _creatingMedia = _media[index];
        _media[index + 2] = _media[index + 1](e);
      }

      _creatingMedia = 0;

      _refreshAll(0, 1);

      _lastMediaTick = tick;

      _dispatch("matchMedia");
    }
  },
      _softRefresh = function _softRefresh() {
    return _removeListener(ScrollTrigger, "scrollEnd", _softRefresh) || _refreshAll(true);
  },
      _dispatch = function _dispatch(type) {
    return _listeners[type] && _listeners[type].map(function (f) {
      return f();
    }) || _emptyArray;
  },
      _savedStyles = [],
      // when ScrollTrigger.saveStyles() is called, the inline styles are recorded in this Array in a sequential format like [element, cssText, gsCache, media]. This keeps it very memory-efficient and fast to iterate through.
  _revertRecorded = function _revertRecorded(media) {
    for (var i = 0; i < _savedStyles.length; i += 4) {
      if (!media || _savedStyles[i + 3] === media) {
        _savedStyles[i].style.cssText = _savedStyles[i + 1];
        _savedStyles[i + 2].uncache = 1;
      }
    }
  },
      _revertAll = function _revertAll(kill, media) {
    var trigger;

    for (_i = 0; _i < _triggers.length; _i++) {
      trigger = _triggers[_i];

      if (!media || trigger.media === media) {
        if (kill) {
          trigger.kill(1);
        } else {
          trigger.scroll.rec || (trigger.scroll.rec = trigger.scroll()); // record the scroll positions so that in each refresh() we can ensure that it doesn't shift. Remember, pinning can make things change around, especially if the same element is pinned multiple times. If one was already recorded, don't re-record because unpinning may have occurred and made it shorter.

          trigger.revert();
        }
      }
    }

    _revertRecorded(media);

    media || _dispatch("revert");
  },
      _refreshAll = function _refreshAll(force, skipRevert) {
    if (_lastScrollTime && !force) {
      _addListener(ScrollTrigger, "scrollEnd", _softRefresh);

      return;
    }

    var refreshInits = _dispatch("refreshInit");

    _sort && ScrollTrigger.sort();
    skipRevert || _revertAll();

    for (_i = 0; _i < _triggers.length; _i++) {
      _triggers[_i].refresh();
    }

    refreshInits.forEach(function (result) {
      return result && result.render && result.render(-1);
    }); // if the onRefreshInit() returns an animation (typically a gsap.set()), revert it. This makes it easy to put things in a certain spot before refreshing for measurement purposes, and then put things back.

    _i = _triggers.length;

    while (_i--) {
      _triggers[_i].scroll.rec = 0;
    }

    _resizeDelay.pause();

    _dispatch("refresh");
  },
      _lastScroll = 0,
      _direction = 1,
      _updateAll = function _updateAll() {
    var l = _triggers.length,
        time = _getTime(),
        recordVelocity = time - _time1 >= 50,
        scroll = l && _triggers[0].scroll();

    _direction = _lastScroll > scroll ? -1 : 1;
    _lastScroll = scroll;

    if (recordVelocity) {
      if (_lastScrollTime && !_pointerIsDown && time - _lastScrollTime > 200) {
        _lastScrollTime = 0;

        _dispatch("scrollEnd");
      }

      _time2 = _time1;
      _time1 = time;
    }

    if (_direction < 0) {
      _i = l;

      while (_i--) {
        _triggers[_i] && _triggers[_i].update(0, recordVelocity);
      }

      _direction = 1;
    } else {
      for (_i = 0; _i < l; _i++) {
        _triggers[_i] && _triggers[_i].update(0, recordVelocity);
      }
    }

    _request = 0;
  },
      _propNamesToCopy = [_left, _top, _bottom, _right, _margin + _Bottom, _margin + _Right, _margin + _Top, _margin + _Left, "display", "flexShrink", "float"],
      _stateProps = _propNamesToCopy.concat([_width, _height, "boxSizing", "max" + _Width, "max" + _Height, "position", _margin, _padding, _padding + _Top, _padding + _Right, _padding + _Bottom, _padding + _Left]),
      _swapPinOut = function _swapPinOut(pin, spacer, state) {
    _setState(state);

    if (pin.parentNode === spacer) {
      var parent = spacer.parentNode;

      if (parent) {
        parent.insertBefore(pin, spacer);
        parent.removeChild(spacer);
      }
    }
  },
      _swapPinIn = function _swapPinIn(pin, spacer, cs, spacerState) {
    if (pin.parentNode !== spacer) {
      var i = _propNamesToCopy.length,
          spacerStyle = spacer.style,
          pinStyle = pin.style,
          p;

      while (i--) {
        p = _propNamesToCopy[i];
        spacerStyle[p] = cs[p];
      }

      spacerStyle.position = cs.position === "absolute" ? "absolute" : "relative";
      cs.display === "inline" && (spacerStyle.display = "inline-block");
      pinStyle[_bottom] = pinStyle[_right] = "auto";
      spacerStyle.overflow = "visible";
      spacerStyle.boxSizing = "border-box";
      spacerStyle[_width] = _getSize(pin, _horizontal) + _px;
      spacerStyle[_height] = _getSize(pin, _vertical) + _px;
      spacerStyle[_padding] = pinStyle[_margin] = pinStyle[_top] = pinStyle[_left] = "0";

      _setState(spacerState);

      pinStyle[_width] = pinStyle["max" + _Width] = cs[_width];
      pinStyle[_height] = pinStyle["max" + _Height] = cs[_height];
      pinStyle[_padding] = cs[_padding];
      pin.parentNode.insertBefore(spacer, pin);
      spacer.appendChild(pin);
    }
  },
      _capsExp$1 = /([A-Z])/g,
      _setState = function _setState(state) {
    if (state) {
      var style = state.t.style,
          l = state.length,
          i = 0,
          p,
          value;

      for (; i < l; i += 2) {
        value = state[i + 1];
        p = state[i];

        if (value) {
          style[p] = value;
        } else if (style[p]) {
          style.removeProperty(p.replace(_capsExp$1, "-$1").toLowerCase());
        }
      }
    }
  },
      _getState = function _getState(element) {
    // returns an array with alternating values like [property, value, property, value] and a "t" property pointing to the target (element). Makes it fast and cheap.
    var l = _stateProps.length,
        style = element.style,
        state = [],
        i = 0;

    for (; i < l; i++) {
      state.push(_stateProps[i], style[_stateProps[i]]);
    }

    state.t = element;
    return state;
  },
      _copyState = function _copyState(state, override, omitOffsets) {
    var result = [],
        l = state.length,
        i = omitOffsets ? 8 : 0,
        // skip top, left, right, bottom if omitOffsets is true
    p;

    for (; i < l; i += 2) {
      p = state[i];
      result.push(p, p in override ? override[p] : state[i + 1]);
    }

    result.t = state.t;
    return result;
  },
      _winOffsets = {
    left: 0,
    top: 0
  },
      _parsePosition$1 = function _parsePosition(value, trigger, scrollerSize, direction, scroll, marker, markerScroller, self, scrollerBounds, borderWidth, useFixedPosition, scrollerMax) {
    _isFunction$1(value) && (value = value(self));

    if (_isString$1(value) && value.substr(0, 3) === "max") {
      value = scrollerMax + (value.charAt(4) === "=" ? _offsetToPx("0" + value.substr(3), scrollerSize) : 0);
    }

    if (!_isNumber$1(value)) {
      _isFunction$1(trigger) && (trigger = trigger(self));

      var element = _toArray(trigger)[0] || _body,
          bounds = _getBounds(element) || {},
          offsets = value.split(" "),
          localOffset,
          globalOffset,
          display;

      if ((!bounds || !bounds.left && !bounds.top) && _getComputedStyle(element).display === "none") {
        // if display is "none", it won't report getBoundingClientRect() properly
        display = element.style.display;
        element.style.display = "block";
        bounds = _getBounds(element);
        display ? element.style.display = display : element.style.removeProperty("display");
      }

      localOffset = _offsetToPx(offsets[0], bounds[direction.d]);
      globalOffset = _offsetToPx(offsets[1] || "0", scrollerSize);
      value = bounds[direction.p] - scrollerBounds[direction.p] - borderWidth + localOffset + scroll - globalOffset;
      markerScroller && _positionMarker(markerScroller, globalOffset, direction, scrollerSize - globalOffset < 20 || markerScroller._isStart && globalOffset > 20);
      scrollerSize -= scrollerSize - globalOffset; // adjust for the marker
    } else if (markerScroller) {
      _positionMarker(markerScroller, scrollerSize, direction, true);
    }

    if (marker) {
      var position = value + scrollerSize,
          isStart = marker._isStart;
      scrollerMax = "scroll" + direction.d2;

      _positionMarker(marker, position, direction, isStart && position > 20 || !isStart && (useFixedPosition ? Math.max(_body[scrollerMax], _docEl[scrollerMax]) : marker.parentNode[scrollerMax]) <= position + 1);

      if (useFixedPosition) {
        scrollerBounds = _getBounds(markerScroller);
        useFixedPosition && (marker.style[direction.op.p] = scrollerBounds[direction.op.p] - direction.op.m - marker._offset + _px);
      }
    }

    return Math.round(value);
  },
      _prefixExp = /(?:webkit|moz|length|cssText)/i,
      _reparent = function _reparent(element, parent, top, left) {
    if (element.parentNode !== parent) {
      var style = element.style,
          p,
          cs;

      if (parent === _body) {
        element._stOrig = style.cssText; // record original inline styles so we can revert them later

        cs = _getComputedStyle(element);

        for (p in cs) {
          // must copy all relevant styles to ensure that nothing changes visually when we reparent to the <body>. Skip the vendor prefixed ones.
          if (!+p && !_prefixExp.test(p) && cs[p] && typeof style[p] === "string" && p !== "0") {
            style[p] = cs[p];
          }
        }

        style.top = top;
        style.left = left;
      } else {
        style.cssText = element._stOrig;
      }

      gsap$1.core.getCache(element).uncache = 1;
      parent.appendChild(element);
    }
  },
      // returns a function that can be used to tween the scroll position in the direction provided, and when doing so it'll add a .tween property to the FUNCTION itself, and remove it when the tween completes or gets killed. This gives us a way to have multiple ScrollTriggers use a central function for any given scroller and see if there's a scroll tween running (which would affect if/how things get updated)
  _getTweenCreator = function _getTweenCreator(scroller, direction) {
    var getScroll = _getScrollFunc(scroller, direction),
        prop = "_scroll" + direction.p2,
        // add a tweenable property to the scroller that's a getter/setter function, like _scrollTop or _scrollLeft. This way, if someone does gsap.killTweensOf(scroller) it'll kill the scroll tween.
    lastScroll1,
        lastScroll2,
        getTween = function getTween(scrollTo, vars, initialValue, change1, change2) {
      var tween = getTween.tween,
          onComplete = vars.onComplete,
          modifiers = {};
      tween && tween.kill();
      lastScroll1 = Math.round(initialValue);
      vars[prop] = scrollTo;
      vars.modifiers = modifiers;

      modifiers[prop] = function (value) {
        value = Math.round(getScroll()); // round because in some [very uncommon] Windows environments, it can get reported with decimals even though it was set without.

        if (value !== lastScroll1 && value !== lastScroll2) {
          // if the user scrolls, kill the tween. iOS Safari intermittently misreports the scroll position, it may be the most recently-set one or the one before that!
          tween.kill();
          getTween.tween = 0;
        } else {
          value = initialValue + change1 * tween.ratio + change2 * tween.ratio * tween.ratio;
        }

        lastScroll2 = lastScroll1;
        return lastScroll1 = Math.round(value);
      };

      vars.onComplete = function () {
        getTween.tween = 0;
        onComplete && onComplete.call(tween);
      };

      tween = getTween.tween = gsap$1.to(scroller, vars);
      return tween;
    };

    scroller[prop] = getScroll;
    return getTween;
  };

  _horizontal.op = _vertical;
  var ScrollTrigger = /*#__PURE__*/function () {
    function ScrollTrigger(vars, animation) {
      _coreInitted$1 || ScrollTrigger.register(gsap$1) || console.warn("Please gsap.registerPlugin(ScrollTrigger)");
      this.init(vars, animation);
    }

    var _proto = ScrollTrigger.prototype;

    _proto.init = function init(vars, animation) {
      this.progress = 0;
      this.vars && this.kill(1); // in case it's being initted again

      if (!_enabled) {
        this.update = this.refresh = this.kill = _passThrough$1;
        return;
      }

      vars = _setDefaults$1(_isString$1(vars) || _isNumber$1(vars) || vars.nodeType ? {
        trigger: vars
      } : vars, _defaults$1);

      var direction = vars.horizontal ? _horizontal : _vertical,
          _vars = vars,
          onUpdate = _vars.onUpdate,
          toggleClass = _vars.toggleClass,
          id = _vars.id,
          onToggle = _vars.onToggle,
          onRefresh = _vars.onRefresh,
          scrub = _vars.scrub,
          trigger = _vars.trigger,
          pin = _vars.pin,
          pinSpacing = _vars.pinSpacing,
          invalidateOnRefresh = _vars.invalidateOnRefresh,
          anticipatePin = _vars.anticipatePin,
          onScrubComplete = _vars.onScrubComplete,
          onSnapComplete = _vars.onSnapComplete,
          once = _vars.once,
          snap = _vars.snap,
          pinReparent = _vars.pinReparent,
          isToggle = !scrub && scrub !== 0,
          scroller = _toArray(vars.scroller || _win$2)[0],
          scrollerCache = gsap$1.core.getCache(scroller),
          isViewport = _isViewport(scroller),
          useFixedPosition = "pinType" in vars ? vars.pinType === "fixed" : isViewport || _getProxyProp(scroller, "pinType") === "fixed",
          callbacks = [vars.onEnter, vars.onLeave, vars.onEnterBack, vars.onLeaveBack],
          toggleActions = isToggle && vars.toggleActions.split(" "),
          markers = "markers" in vars ? vars.markers : _defaults$1.markers,
          borderWidth = isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0,
          self = this,
          onRefreshInit = vars.onRefreshInit && function () {
        return vars.onRefreshInit(self);
      },
          getScrollerSize = _getSizeFunc(scroller, isViewport, direction),
          getScrollerOffsets = _getOffsetsFunc(scroller, isViewport),
          tweenTo,
          pinCache,
          snapFunc,
          isReverted,
          scroll1,
          scroll2,
          start,
          end,
          markerStart,
          markerEnd,
          markerStartTrigger,
          markerEndTrigger,
          markerVars,
          change,
          pinOriginalState,
          pinActiveState,
          pinState,
          spacer,
          offset,
          pinGetter,
          pinSetter,
          pinStart,
          pinChange,
          spacingStart,
          spacerState,
          markerStartSetter,
          markerEndSetter,
          cs,
          snap1,
          snap2,
          scrubTween,
          scrubSmooth,
          snapDurClamp,
          snapDelayedCall,
          prevProgress,
          prevScroll,
          prevAnimProgress;

      self.media = _creatingMedia;
      anticipatePin *= 45;

      _triggers.push(self);

      self.scroller = scroller;
      self.scroll = _getScrollFunc(scroller, direction);
      scroll1 = self.scroll();
      self.vars = vars;
      animation = animation || vars.animation;
      "refreshPriority" in vars && (_sort = 1);
      scrollerCache.tweenScroll = scrollerCache.tweenScroll || {
        top: _getTweenCreator(scroller, _vertical),
        left: _getTweenCreator(scroller, _horizontal)
      };
      self.tweenTo = tweenTo = scrollerCache.tweenScroll[direction.p];

      if (animation) {
        animation.vars.lazy = false;
        animation._initted || animation.vars.immediateRender !== false && vars.immediateRender !== false && animation.render(0, true, true);
        self.animation = animation.pause();
        animation.scrollTrigger = self;
        scrubSmooth = _isNumber$1(scrub) && scrub;
        scrubSmooth && (scrubTween = gsap$1.to(animation, {
          ease: "power3",
          duration: scrubSmooth,
          onComplete: function onComplete() {
            return onScrubComplete && onScrubComplete(self);
          }
        }));
        snap1 = 0;
        id || (id = animation.vars.id);
      }

      if (snap) {
        _isObject$1(snap) || (snap = {
          snapTo: snap
        });
        gsap$1.set(isViewport ? [_body, _docEl] : scroller, {
          scrollBehavior: "auto"
        }); // smooth scrolling doesn't work with snap.

        snapFunc = _isFunction$1(snap.snapTo) ? snap.snapTo : snap.snapTo === "labels" ? _getLabels(animation) : gsap$1.utils.snap(snap.snapTo);
        snapDurClamp = snap.duration || {
          min: 0.1,
          max: 2
        };
        snapDurClamp = _isObject$1(snapDurClamp) ? _clamp$1(snapDurClamp.min, snapDurClamp.max) : _clamp$1(snapDurClamp, snapDurClamp);
        snapDelayedCall = gsap$1.delayedCall(snap.delay || scrubSmooth / 2 || 0.1, function () {
          if (Math.abs(self.getVelocity()) < 10 && !_pointerIsDown) {
            var totalProgress = animation && !isToggle ? animation.totalProgress() : self.progress,
                velocity = (totalProgress - snap2) / (_getTime() - _time2) * 1000 || 0,
                change1 = _abs(velocity / 2) * velocity / 0.185,
                naturalEnd = totalProgress + change1,
                endValue = _clamp$1(0, 1, snapFunc(naturalEnd, self)),
                scroll = self.scroll(),
                endScroll = Math.round(start + endValue * change),
                tween = tweenTo.tween;

            if (scroll <= end && scroll >= start && endScroll !== scroll) {
              if (tween && !tween._initted && tween.data <= Math.abs(endScroll - scroll)) {
                // there's an overlapping snap! So we must figure out which one is closer and let that tween live.
                return;
              }

              tweenTo(endScroll, {
                duration: snapDurClamp(_abs(Math.max(_abs(naturalEnd - totalProgress), _abs(endValue - totalProgress)) * 0.185 / velocity / 0.05 || 0)),
                ease: snap.ease || "power3",
                data: Math.abs(endScroll - scroll),
                // record the distance so that if another snap tween occurs (conflict) we can prioritize the closest snap.
                onComplete: function onComplete() {
                  snap1 = snap2 = animation && !isToggle ? animation.totalProgress() : self.progress;
                  onSnapComplete && onSnapComplete(self);
                }
              }, scroll, change1 * change, endScroll - scroll - change1 * change);
            }
          } else if (self.isActive) {
            snapDelayedCall.restart(true);
          }
        }).pause();
      }

      id && (_ids[id] = self);
      trigger = self.trigger = _toArray(trigger || pin)[0];
      pin = pin === true ? trigger : _toArray(pin)[0];
      _isString$1(toggleClass) && (toggleClass = {
        targets: trigger,
        className: toggleClass
      });

      if (pin) {
        pinSpacing === false || pinSpacing === _margin || (pinSpacing = !pinSpacing && _getComputedStyle(pin.parentNode).display === "flex" ? false : _padding); // if the parent is display: flex, don't apply pinSpacing by default.

        self.pin = pin;
        vars.force3D !== false && gsap$1.set(pin, {
          force3D: true
        });
        pinCache = gsap$1.core.getCache(pin);

        if (!pinCache.spacer) {
          // record the spacer and pinOriginalState on the cache in case someone tries pinning the same element with MULTIPLE ScrollTriggers - we don't want to have multiple spacers or record the "original" pin state after it has already been affected by another ScrollTrigger.
          pinCache.spacer = spacer = _doc$2.createElement("div");
          spacer.setAttribute("class", "pin-spacer" + (id ? " pin-spacer-" + id : ""));
          pinCache.pinState = pinOriginalState = _getState(pin);
        } else {
          pinOriginalState = pinCache.pinState;
        }

        self.spacer = spacer = pinCache.spacer;
        cs = _getComputedStyle(pin);
        spacingStart = cs[pinSpacing + direction.os2];
        pinGetter = gsap$1.getProperty(pin);
        pinSetter = gsap$1.quickSetter(pin, direction.a, _px); // pin.firstChild && !_maxScroll(pin, direction) && (pin.style.overflow = "hidden"); // protects from collapsing margins, but can have unintended consequences as demonstrated here: https://codepen.io/GreenSock/pen/1e42c7a73bfa409d2cf1e184e7a4248d so it was removed in favor of just telling people to set up their CSS to avoid the collapsing margins (overflow: hidden | auto is just one option. Another is border-top: 1px solid transparent).

        _swapPinIn(pin, spacer, cs);

        pinState = _getState(pin);
      }

      if (markers) {
        markerVars = _isObject$1(markers) ? _setDefaults$1(markers, _markerDefaults) : _markerDefaults;
        markerStartTrigger = _createMarker("scroller-start", id, scroller, direction, markerVars, 0);
        markerEndTrigger = _createMarker("scroller-end", id, scroller, direction, markerVars, 0, markerStartTrigger);
        offset = markerStartTrigger["offset" + direction.op.d2];
        markerStart = _createMarker("start", id, scroller, direction, markerVars, offset);
        markerEnd = _createMarker("end", id, scroller, direction, markerVars, offset);

        if (!useFixedPosition) {
          _makePositionable(scroller);

          gsap$1.set([markerStartTrigger, markerEndTrigger], {
            force3D: true
          });
          markerStartSetter = gsap$1.quickSetter(markerStartTrigger, direction.a, _px);
          markerEndSetter = gsap$1.quickSetter(markerEndTrigger, direction.a, _px);
        }
      }

      self.revert = function (revert) {
        var r = revert !== false || !self.enabled,
            prevRefreshing = _refreshing;

        if (r !== isReverted) {
          if (r) {
            prevScroll = Math.max(self.scroll(), self.scroll.rec || 0); // record the scroll so we can revert later (repositioning/pinning things can affect scroll position). In the static refresh() method, we first record all the scroll positions as a reference.

            prevProgress = self.progress;
            prevAnimProgress = animation && animation.progress();
          }

          markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function (m) {
            return m.style.display = r ? "none" : "block";
          });
          r && (_refreshing = 1);
          self.update(r); // make sure the pin is back in its original position so that all the measurements are correct.

          _refreshing = prevRefreshing;
          pin && (r ? _swapPinOut(pin, spacer, pinOriginalState) : (!pinReparent || !self.isActive) && _swapPinIn(pin, spacer, _getComputedStyle(pin), spacerState));
          isReverted = r;
        }
      };

      self.refresh = function (soft) {
        if (_refreshing || !self.enabled) {
          return;
        }

        if (pin && soft && _lastScrollTime) {
          _addListener(ScrollTrigger, "scrollEnd", _softRefresh);

          return;
        }

        _refreshing = 1;
        scrubTween && scrubTween.kill();
        invalidateOnRefresh && animation && animation.progress(0).invalidate();
        isReverted || self.revert();

        var size = getScrollerSize(),
            scrollerBounds = getScrollerOffsets(),
            max = _maxScroll(scroller, direction),
            offset = 0,
            otherPinOffset = 0,
            parsedEnd = vars.end,
            parsedEndTrigger = vars.endTrigger || trigger,
            parsedStart = vars.start || (vars.start === 0 ? 0 : pin || !trigger ? "0 0" : "0 100%"),
            triggerIndex = trigger && Math.max(0, _triggers.indexOf(self)) || 0,
            i = triggerIndex,
            cs,
            bounds,
            scroll,
            isVertical,
            override,
            curTrigger,
            curPin,
            oppositeScroll;

        while (i--) {
          // user might try to pin the same element more than once, so we must find any prior triggers with the same pin, revert them, and determine how long they're pinning so that we can offset things appropriately. Make sure we revert from last to first so that things "rewind" properly.
          curPin = _triggers[i].pin;
          curPin && (curPin === trigger || curPin === pin) && _triggers[i].revert();
        }

        start = _parsePosition$1(parsedStart, trigger, size, direction, self.scroll(), markerStart, markerStartTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max) || (pin ? -0.001 : 0);
        _isFunction$1(parsedEnd) && (parsedEnd = parsedEnd(self));

        if (_isString$1(parsedEnd) && !parsedEnd.indexOf("+=")) {
          if (~parsedEnd.indexOf(" ")) {
            parsedEnd = (_isString$1(parsedStart) ? parsedStart.split(" ")[0] : "") + parsedEnd;
          } else {
            offset = _offsetToPx(parsedEnd.substr(2), size);
            parsedEnd = _isString$1(parsedStart) ? parsedStart : start + offset; // _parsePosition won't factor in the offset if the start is a number, so do it here.

            parsedEndTrigger = trigger;
          }
        }

        end = Math.max(start, _parsePosition$1(parsedEnd || (parsedEndTrigger ? "100% 0" : max), parsedEndTrigger, size, direction, self.scroll() + offset, markerEnd, markerEndTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max)) || -0.001;
        change = end - start || (start -= 0.01) && 0.001;
        offset = 0;
        i = triggerIndex;

        while (i--) {
          curTrigger = _triggers[i];
          curPin = curTrigger.pin;

          if (curPin && curTrigger.start - curTrigger._pinPush < start) {
            cs = curTrigger.end - curTrigger.start;
            curPin === trigger && (offset += cs);
            curPin === pin && (otherPinOffset += cs);
          }
        }

        start += offset;
        end += offset;
        self._pinPush = otherPinOffset;

        if (markerStart && offset) {
          // offset the markers if necessary
          cs = {};
          cs[direction.a] = "+=" + offset;
          gsap$1.set([markerStart, markerEnd], cs);
        }

        if (pin) {
          cs = _getComputedStyle(pin);
          isVertical = direction === _vertical;
          scroll = self.scroll(); // recalculate because the triggers can affect the scroll

          pinStart = parseFloat(pinGetter(direction.a)) + otherPinOffset;
          !max && end > 1 && ((isViewport ? _body : scroller).style["overflow-" + direction.a] = "scroll"); // makes sure the scroller has a scrollbar, otherwise if something has width: 100%, for example, it would be too big (exclude the scrollbar). See https://greensock.com/forums/topic/25182-scrolltrigger-width-of-page-increase-where-markers-are-set-to-false/

          _swapPinIn(pin, spacer, cs);

          pinState = _getState(pin); // transforms will interfere with the top/left/right/bottom placement, so remove them temporarily. getBoundingClientRect() factors in transforms.

          bounds = _getBounds(pin, true);
          oppositeScroll = useFixedPosition && _getScrollFunc(scroller, isVertical ? _horizontal : _vertical)();

          if (pinSpacing) {
            spacerState = [pinSpacing + direction.os2, change + otherPinOffset + _px];
            spacerState.t = spacer;
            i = pinSpacing === _padding ? _getSize(pin, direction) + change + otherPinOffset : 0;
            i && spacerState.push(direction.d, i + _px); // for box-sizing: border-box (must include padding).

            _setState(spacerState);

            useFixedPosition && self.scroll(prevScroll);
          }

          if (useFixedPosition) {
            override = {
              top: bounds.top + (isVertical ? scroll - start : oppositeScroll) + _px,
              left: bounds.left + (isVertical ? oppositeScroll : scroll - start) + _px,
              boxSizing: "border-box",
              position: "fixed"
            };
            override[_width] = override["max" + _Width] = Math.ceil(bounds.width) + _px;
            override[_height] = override["max" + _Height] = Math.ceil(bounds.height) + _px;
            override[_margin] = override[_margin + _Top] = override[_margin + _Right] = override[_margin + _Bottom] = override[_margin + _Left] = "0";
            override[_padding] = cs[_padding];
            override[_padding + _Top] = cs[_padding + _Top];
            override[_padding + _Right] = cs[_padding + _Right];
            override[_padding + _Bottom] = cs[_padding + _Bottom];
            override[_padding + _Left] = cs[_padding + _Left];
            pinActiveState = _copyState(pinOriginalState, override, pinReparent);
          }

          if (animation) {
            // the animation might be affecting the transform, so we must jump to the end, check the value, and compensate accordingly. Otherwise, when it becomes unpinned, the pinSetter() will get set to a value that doesn't include whatever the animation did.
            animation.progress(1, true);
            pinChange = pinGetter(direction.a) - pinStart + change + otherPinOffset;
            change !== pinChange && pinActiveState.splice(pinActiveState.length - 2, 2); // transform is the last property/value set in the state Array. Since the animation is controlling that, we should omit it.

            animation.progress(0, true);
          } else {
            pinChange = change;
          }
        } else if (trigger && self.scroll()) {
          // it may be INSIDE a pinned element, so walk up the tree and look for any elements with _pinOffset to compensate because anything with pinSpacing that's already scrolled would throw off the measurements in getBoundingClientRect()
          bounds = trigger.parentNode;

          while (bounds && bounds !== _body) {
            if (bounds._pinOffset) {
              start -= bounds._pinOffset;
              end -= bounds._pinOffset;
            }

            bounds = bounds.parentNode;
          }
        }

        for (i = 0; i < triggerIndex; i++) {
          // make sure we revert from first to last to make sure things reach their end state properly
          curTrigger = _triggers[i].pin;
          curTrigger && (curTrigger === trigger || curTrigger === pin) && _triggers[i].revert(false);
        }

        self.start = start;
        self.end = end;
        scroll1 = scroll2 = self.scroll(); // reset velocity

        scroll1 < prevScroll && self.scroll(prevScroll);
        self.revert(false);
        _refreshing = 0;
        prevAnimProgress && isToggle && animation.progress(prevAnimProgress, true);

        if (prevProgress !== self.progress) {
          // ensures that the direction is set properly (when refreshing, progress is set back to 0 initially, then back again to wherever it needs to be) and that callbacks are triggered.
          scrubTween && animation.totalProgress(prevProgress, true); // to avoid issues where animation callbacks like onStart aren't triggered.

          self.progress = prevProgress;
          self.update();
        }

        pin && pinSpacing && (spacer._pinOffset = Math.round(self.progress * pinChange));
        onRefresh && onRefresh(self);
      };

      self.getVelocity = function () {
        return (self.scroll() - scroll2) / (_getTime() - _time2) * 1000 || 0;
      };

      self.update = function (reset, recordVelocity) {
        var scroll = self.scroll(),
            p = reset ? 0 : (scroll - start) / change,
            clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0,
            prevProgress = self.progress,
            isActive,
            wasActive,
            toggleState,
            action,
            stateChanged,
            toggled;

        if (recordVelocity) {
          scroll2 = scroll1;
          scroll1 = scroll;

          if (snap) {
            snap2 = snap1;
            snap1 = animation && !isToggle ? animation.totalProgress() : clipped;
          }
        } // anticipate the pinning a few ticks ahead of time based on velocity to avoid a visual glitch due to the fact that most browsers do scrolling on a separate thread (not synced with requestAnimationFrame).


        anticipatePin && !clipped && pin && !_refreshing && !_startup && _lastScrollTime && start < scroll + (scroll - scroll2) / (_getTime() - _time2) * anticipatePin && (clipped = 0.0001);

        if (clipped !== prevProgress && self.enabled) {
          isActive = self.isActive = !!clipped && clipped < 1;
          wasActive = !!prevProgress && prevProgress < 1;
          toggled = isActive !== wasActive;
          stateChanged = toggled || !!clipped !== !!prevProgress; // could go from start all the way to end, thus it didn't toggle but it did change state in a sense (may need to fire a callback)

          self.direction = clipped > prevProgress ? 1 : -1;
          self.progress = clipped;

          if (!isToggle) {
            if (scrubTween && !_refreshing && !_startup) {
              scrubTween.vars.totalProgress = clipped;
              scrubTween.invalidate().restart();
            } else if (animation) {
              animation.totalProgress(clipped, !!_refreshing);
            }
          }

          if (pin) {
            reset && pinSpacing && (spacer.style[pinSpacing + direction.os2] = spacingStart);

            if (!useFixedPosition) {
              pinSetter(pinStart + pinChange * clipped);
            } else if (stateChanged) {
              action = !reset && clipped > prevProgress && end + 1 > scroll && scroll + 1 >= _maxScroll(scroller, direction); // if it's at the VERY end of the page, don't switch away from position: fixed because it's pointless and it could cause a brief flash when the user scrolls back up (when it gets pinned again)

              if (pinReparent) {
                if (!reset && (isActive || action)) {
                  var bounds = _getBounds(pin, true),
                      _offset = scroll - start;

                  _reparent(pin, _body, bounds.top + (direction === _vertical ? _offset : 0) + _px, bounds.left + (direction === _vertical ? 0 : _offset) + _px);
                } else {
                  _reparent(pin, spacer);
                }
              }

              _setState(isActive || action ? pinActiveState : pinState);

              pinChange !== change && clipped < 1 && isActive || pinSetter(pinStart + (clipped === 1 && !action ? pinChange : 0));
            }
          }

          snap && !tweenTo.tween && !_refreshing && !_startup && snapDelayedCall.restart(true);
          toggleClass && (toggled || once && clipped && (clipped < 1 || !_limitCallbacks)) && _toArray(toggleClass.targets).forEach(function (el) {
            return el.classList[isActive || once ? "add" : "remove"](toggleClass.className);
          }); // classes could affect positioning, so do it even if reset or refreshing is true.

          onUpdate && !isToggle && !reset && onUpdate(self);

          if (stateChanged && !_refreshing) {
            toggleState = clipped && !prevProgress ? 0 : clipped === 1 ? 1 : prevProgress === 1 ? 2 : 3; // 0 = enter, 1 = leave, 2 = enterBack, 3 = leaveBack (we prioritize the FIRST encounter, thus if you scroll really fast past the onEnter and onLeave in one tick, it'd prioritize onEnter.

            if (isToggle) {
              action = !toggled && toggleActions[toggleState + 1] !== "none" && toggleActions[toggleState + 1] || toggleActions[toggleState]; // if it didn't toggle, that means it shot right past and since we prioritize the "enter" action, we should switch to the "leave" in this case (but only if one is defined)

              if (animation && (action === "complete" || action === "reset" || action in animation)) {
                if (action === "complete") {
                  animation.pause().totalProgress(1);
                } else if (action === "reset") {
                  animation.restart(true).pause();
                } else {
                  animation[action]();
                }
              }

              onUpdate && onUpdate(self);
            }

            if (toggled || !_limitCallbacks) {
              // on startup, the page could be scrolled and we don't want to fire callbacks that didn't toggle. For example onEnter shouldn't fire if the ScrollTrigger isn't actually entered.
              onToggle && toggled && onToggle(self);
              callbacks[toggleState] && callbacks[toggleState](self);
              once && (clipped === 1 ? self.kill(false, 1) : callbacks[toggleState] = 0); // a callback shouldn't be called again if once is true.

              if (!toggled) {
                // it's possible to go completely past, like from before the start to after the end (or vice-versa) in which case BOTH callbacks should be fired in that order
                toggleState = clipped === 1 ? 1 : 3;
                callbacks[toggleState] && callbacks[toggleState](self);
              }
            }
          } else if (isToggle && onUpdate && !_refreshing) {
            onUpdate(self);
          }
        } // update absolutely-positioned markers (only if the scroller isn't the viewport)


        if (markerEndSetter) {
          markerStartSetter(scroll + (markerStartTrigger._isFlipped ? 1 : 0));
          markerEndSetter(scroll);
        }
      };

      self.enable = function () {
        if (!self.enabled) {
          self.enabled = true;

          _addListener(scroller, "resize", _onResize);

          _addListener(scroller, "scroll", _onScroll);

          onRefreshInit && _addListener(ScrollTrigger, "refreshInit", onRefreshInit);
          !animation || !animation.add ? self.refresh() : gsap$1.delayedCall(0.01, function () {
            return start || end || self.refresh();
          }) && (change = 0.01) && (start = end = 0); // if the animation is a timeline, it may not have been populated yet, so it wouldn't render at the proper place on the first refresh(), thus we should schedule one for the next tick.
        }
      };

      self.disable = function (reset, allowAnimation) {
        if (self.enabled) {
          reset !== false && self.revert();
          self.enabled = self.isActive = false;
          allowAnimation || scrubTween && scrubTween.pause();
          prevScroll = 0;
          pinCache && (pinCache.uncache = 1);
          onRefreshInit && _removeListener(ScrollTrigger, "refreshInit", onRefreshInit);

          if (snapDelayedCall) {
            snapDelayedCall.pause();
            tweenTo.tween && tweenTo.tween.kill() && (tweenTo.tween = 0);
          }

          if (!isViewport) {
            var i = _triggers.length;

            while (i--) {
              if (_triggers[i].scroller === scroller && _triggers[i] !== self) {
                return; //don't remove the listeners if there are still other triggers referencing it.
              }
            }

            _removeListener(scroller, "resize", _onResize);

            _removeListener(scroller, "scroll", _onScroll);
          }
        }
      };

      self.kill = function (revert, allowAnimation) {
        self.disable(revert, allowAnimation);
        id && delete _ids[id];

        var i = _triggers.indexOf(self);

        _triggers.splice(i, 1);

        i === _i && _direction > 0 && _i--; // if we're in the middle of a refresh() or update(), splicing would cause skips in the index, so adjust...

        if (animation) {
          animation.scrollTrigger = null;
          revert && animation.render(-1);
          allowAnimation || animation.kill();
        }

        markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function (m) {
          return m.parentNode.removeChild(m);
        });
        pinCache && (pinCache.uncache = 1);
      };

      self.enable();
    };

    ScrollTrigger.register = function register(core) {
      if (!_coreInitted$1) {
        gsap$1 = core || _getGSAP();

        if (_windowExists$2() && window.document) {
          _win$2 = window;
          _doc$2 = document;
          _docEl = _doc$2.documentElement;
          _body = _doc$2.body;
        }

        if (gsap$1) {
          _toArray = gsap$1.utils.toArray;
          _clamp$1 = gsap$1.utils.clamp;
          gsap$1.core.globals("ScrollTrigger", ScrollTrigger); // must register the global manually because in Internet Explorer, functions (classes) don't have a "name" property.

          if (_body) {
            _raf = _win$2.requestAnimationFrame || function (f) {
              return setTimeout(f, 16);
            };

            _addListener(_win$2, "mousewheel", _onScroll);

            _root = [_win$2, _doc$2, _docEl, _body];

            _addListener(_doc$2, "scroll", _onScroll); // some browsers (like Chrome), the window stops dispatching scroll events on the window if you scroll really fast, but it's consistent on the document!


            var bodyStyle = _body.style,
                border = bodyStyle.borderTop,
                bounds;
            bodyStyle.borderTop = "1px solid #000"; // works around an issue where a margin of a child element could throw off the bounds of the _body, making it seem like there's a margin when there actually isn't. The border ensures that the bounds are accurate.

            bounds = _getBounds(_body);
            _vertical.m = Math.round(bounds.top + _vertical.sc()) || 0; // accommodate the offset of the <body> caused by margins and/or padding

            _horizontal.m = Math.round(bounds.left + _horizontal.sc()) || 0;
            border ? bodyStyle.borderTop = border : bodyStyle.removeProperty("border-top");
            _syncInterval = setInterval(_sync, 200);
            gsap$1.delayedCall(0.5, function () {
              return _startup = 0;
            });

            _addListener(_doc$2, "touchcancel", _passThrough$1); // some older Android devices intermittently stop dispatching "touchmove" events if we don't listen for "touchcancel" on the document.


            _addListener(_body, "touchstart", _passThrough$1); //works around Safari bug: https://greensock.com/forums/topic/21450-draggable-in-iframe-on-mobile-is-buggy/


            _multiListener(_addListener, _doc$2, "pointerdown,touchstart,mousedown", function () {
              return _pointerIsDown = 1;
            });

            _multiListener(_addListener, _doc$2, "pointerup,touchend,mouseup", function () {
              return _pointerIsDown = 0;
            });

            _transformProp$1 = gsap$1.utils.checkPrefix("transform");

            _stateProps.push(_transformProp$1);

            _coreInitted$1 = _getTime();
            _resizeDelay = gsap$1.delayedCall(0.2, _refreshAll).pause();
            _autoRefresh = [_doc$2, "visibilitychange", function () {
              var w = _win$2.innerWidth,
                  h = _win$2.innerHeight;

              if (_doc$2.hidden) {
                _prevWidth = w;
                _prevHeight = h;
              } else if (_prevWidth !== w || _prevHeight !== h) {
                _onResize();
              }
            }, _doc$2, "DOMContentLoaded", _refreshAll, _win$2, "load", function () {
              return _lastScrollTime || _refreshAll();
            }, _win$2, "resize", _onResize];

            _iterateAutoRefresh(_addListener);
          }
        }
      }

      return _coreInitted$1;
    };

    ScrollTrigger.defaults = function defaults(config) {
      for (var p in config) {
        _defaults$1[p] = config[p];
      }
    };

    ScrollTrigger.kill = function kill() {
      _enabled = 0;

      _triggers.slice(0).forEach(function (trigger) {
        return trigger.kill(1);
      });
    };

    ScrollTrigger.config = function config(vars) {
      "limitCallbacks" in vars && (_limitCallbacks = !!vars.limitCallbacks);
      var ms = vars.syncInterval;
      ms && clearInterval(_syncInterval) || (_syncInterval = ms) && setInterval(_sync, ms);
      "autoRefreshEvents" in vars && (_iterateAutoRefresh(_removeListener) || _iterateAutoRefresh(_addListener, vars.autoRefreshEvents || "none"));
    };

    ScrollTrigger.scrollerProxy = function scrollerProxy(target, vars) {
      var t = _toArray(target)[0];

      _isViewport(t) ? _proxies.unshift(_win$2, vars, _body, vars, _docEl, vars) : _proxies.unshift(t, vars);
    };

    ScrollTrigger.matchMedia = function matchMedia(vars) {
      // _media is populated in the following order: mediaQueryString, onMatch, onUnmatch, isMatched. So if there are two media queries, the Array would have a length of 8
      var mq, p, i, func, result;

      for (p in vars) {
        i = _media.indexOf(p);
        func = vars[p];
        _creatingMedia = p;

        if (p === "all") {
          func();
        } else {
          mq = _win$2.matchMedia(p);

          if (mq) {
            mq.matches && (result = func());

            if (~i) {
              _media[i + 1] = _combineFunc(_media[i + 1], func);
              _media[i + 2] = _combineFunc(_media[i + 2], result);
            } else {
              i = _media.length;

              _media.push(p, func, result);

              mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
            }

            _media[i + 3] = mq.matches;
          }
        }

        _creatingMedia = 0;
      }

      return _media;
    };

    ScrollTrigger.clearMatchMedia = function clearMatchMedia(query) {
      query || (_media.length = 0);
      query = _media.indexOf(query);
      query >= 0 && _media.splice(query, 4);
    };

    return ScrollTrigger;
  }();
  ScrollTrigger.version = "3.5.1";

  ScrollTrigger.saveStyles = function (targets) {
    return targets ? _toArray(targets).forEach(function (target) {
      var i = _savedStyles.indexOf(target);

      i >= 0 && _savedStyles.splice(i, 4);

      _savedStyles.push(target, target.style.cssText, gsap$1.core.getCache(target), _creatingMedia);
    }) : _savedStyles;
  };

  ScrollTrigger.revert = function (soft, media) {
    return _revertAll(!soft, media);
  };

  ScrollTrigger.create = function (vars, animation) {
    return new ScrollTrigger(vars, animation);
  };

  ScrollTrigger.refresh = function (safe) {
    return safe ? _onResize() : _refreshAll(true);
  };

  ScrollTrigger.update = _updateAll;

  ScrollTrigger.maxScroll = function (element, horizontal) {
    return _maxScroll(element, horizontal ? _horizontal : _vertical);
  };

  ScrollTrigger.getScrollFunc = function (element, horizontal) {
    return _getScrollFunc(_toArray(element)[0], horizontal ? _horizontal : _vertical);
  };

  ScrollTrigger.getById = function (id) {
    return _ids[id];
  };

  ScrollTrigger.getAll = function () {
    return _triggers.slice(0);
  };

  ScrollTrigger.isScrolling = function () {
    return !!_lastScrollTime;
  };

  ScrollTrigger.addEventListener = function (type, callback) {
    var a = _listeners[type] || (_listeners[type] = []);
    ~a.indexOf(callback) || a.push(callback);
  };

  ScrollTrigger.removeEventListener = function (type, callback) {
    var a = _listeners[type],
        i = a && a.indexOf(callback);
    i >= 0 && a.splice(i, 1);
  };

  ScrollTrigger.batch = function (targets, vars) {
    var result = [],
        varsCopy = {},
        interval = vars.interval || 0.016,
        batchMax = vars.batchMax || 1e9,
        proxyCallback = function proxyCallback(type, callback) {
      var elements = [],
          triggers = [],
          delay = gsap$1.delayedCall(interval, function () {
        callback(elements, triggers);
        elements = [];
        triggers = [];
      }).pause();
      return function (self) {
        elements.length || delay.restart(true);
        elements.push(self.trigger);
        triggers.push(self);
        batchMax <= elements.length && delay.progress(1);
      };
    },
        p;

    for (p in vars) {
      varsCopy[p] = p.substr(0, 2) === "on" && _isFunction$1(vars[p]) && p !== "onRefreshInit" ? proxyCallback(p, vars[p]) : vars[p];
    }

    if (_isFunction$1(batchMax)) {
      batchMax = batchMax();

      _addListener(ScrollTrigger, "refresh", function () {
        return batchMax = vars.batchMax();
      });
    }

    _toArray(targets).forEach(function (target) {
      var config = {};

      for (p in varsCopy) {
        config[p] = varsCopy[p];
      }

      config.trigger = target;
      result.push(ScrollTrigger.create(config));
    });

    return result;
  };

  ScrollTrigger.sort = function (func) {
    return _triggers.sort(func || function (a, b) {
      return (a.vars.refreshPriority || 0) * -1e6 + a.start - (b.start + (b.vars.refreshPriority || 0) * -1e6);
    });
  };

  _getGSAP() && gsap$1.registerPlugin(ScrollTrigger);

  /*!
   * strings: 3.5.1
   * https://greensock.com
   *
   * Copyright 2008-2020, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */
  var emojiExp = /([\uD800-\uDBFF][\uDC00-\uDFFF](?:[\u200D\uFE0F][\uD800-\uDBFF][\uDC00-\uDFFF]){2,}|\uD83D\uDC69(?:\u200D(?:(?:\uD83D\uDC69\u200D)?\uD83D\uDC67|(?:\uD83D\uDC69\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]\uFE0F|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDD6-\uDDDF])\u200D[\u2640\u2642]\uFE0F|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])\uFE0F|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC69\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708]))\uFE0F|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83D\uDC69\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\u200D(?:(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F)/;
  function getText(e) {
    var type = e.nodeType,
        result = "";

    if (type === 1 || type === 9 || type === 11) {
      if (typeof e.textContent === "string") {
        return e.textContent;
      } else {
        for (e = e.firstChild; e; e = e.nextSibling) {
          result += getText(e);
        }
      }
    } else if (type === 3 || type === 4) {
      return e.nodeValue;
    }

    return result;
  }

  /*!
   * SplitText: 3.5.1
   * https://greensock.com
   *
   * @license Copyright 2008-2020, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */

  var _doc$3,
      _win$3,
      _coreInitted$2,
      _stripExp = /(?:\r|\n|\t\t)/g,
      //find carriage returns, new line feeds and double-tabs.
  _multipleSpacesExp = /(?:\s\s+)/g,
      _initCore$1 = function _initCore() {
    _doc$3 = document;
    _win$3 = window;
    _coreInitted$2 = 1;
  },
      //<name>SplitText</name>
  _getComputedStyle$1 = function _getComputedStyle(element) {
    return _win$3.getComputedStyle(element);
  },
      _isArray$1 = Array.isArray,
      _slice$1 = [].slice,
      _toArray$1 = function _toArray(value, leaveStrings) {
    //takes any value and returns an array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
    var type;
    return _isArray$1(value) ? value : (type = typeof value) === "string" && !leaveStrings && value ? _slice$1.call(_doc$3.querySelectorAll(value), 0) : value && type === "object" && "length" in value ? _slice$1.call(value, 0) : value ? [value] : [];
  },
      _isAbsolute = function _isAbsolute(vars) {
    return vars.position === "absolute" || vars.absolute === true;
  },
      //some characters are combining marks (think diacritics/accents in European languages) which involve 2 or 4 characters that combine in the browser to form a single character. Pass in the remaining text and an array of the special characters to search for and if the text starts with one of those special characters, it'll spit back the number of characters to retain (often 2 or 4). Used in the specialChars features that was introduced in 0.6.0.
  _findSpecialChars = function _findSpecialChars(text, chars) {
    var i = chars.length,
        s;

    while (--i > -1) {
      s = chars[i];

      if (text.substr(0, s.length) === s) {
        return s.length;
      }
    }
  },
      _divStart = " style='position:relative;display:inline-block;'",
      _cssClassFunc = function _cssClassFunc(cssClass, tag) {
    if (cssClass === void 0) {
      cssClass = "";
    }

    var iterate = ~cssClass.indexOf("++"),
        num = 1;

    if (iterate) {
      cssClass = cssClass.split("++").join("");
    }

    return function () {
      return "<" + tag + _divStart + (cssClass ? " class='" + cssClass + (iterate ? num++ : "") + "'>" : ">");
    };
  },
      _swapText = function _swapText(element, oldText, newText) {
    var type = element.nodeType;

    if (type === 1 || type === 9 || type === 11) {
      for (element = element.firstChild; element; element = element.nextSibling) {
        _swapText(element, oldText, newText);
      }
    } else if (type === 3 || type === 4) {
      element.nodeValue = element.nodeValue.split(oldText).join(newText);
    }
  },
      _pushReversed = function _pushReversed(a, merge) {
    var i = merge.length;

    while (--i > -1) {
      a.push(merge[i]);
    }
  },
      _isBeforeWordDelimiter = function _isBeforeWordDelimiter(e, root, wordDelimiter) {
    var next;

    while (e && e !== root) {
      next = e._next || e.nextSibling;

      if (next) {
        return next.textContent.charAt(0) === wordDelimiter;
      }

      e = e.parentNode || e._parent;
    }
  },
      _deWordify = function _deWordify(e) {
    var children = _toArray$1(e.childNodes),
        l = children.length,
        i,
        child;

    for (i = 0; i < l; i++) {
      child = children[i];

      if (child._isSplit) {
        _deWordify(child);
      } else {
        if (i && child.previousSibling.nodeType === 3) {
          child.previousSibling.nodeValue += child.nodeType === 3 ? child.nodeValue : child.firstChild.nodeValue;
        } else if (child.nodeType !== 3) {
          e.insertBefore(child.firstChild, child);
        }

        e.removeChild(child);
      }
    }
  },
      _getStyleAsNumber = function _getStyleAsNumber(name, computedStyle) {
    return parseFloat(computedStyle[name]) || 0;
  },
      _setPositionsAfterSplit = function _setPositionsAfterSplit(element, vars, allChars, allWords, allLines, origWidth, origHeight) {
    var cs = _getComputedStyle$1(element),
        paddingLeft = _getStyleAsNumber("paddingLeft", cs),
        lineOffsetY = -999,
        borderTopAndBottom = _getStyleAsNumber("borderBottomWidth", cs) + _getStyleAsNumber("borderTopWidth", cs),
        borderLeftAndRight = _getStyleAsNumber("borderLeftWidth", cs) + _getStyleAsNumber("borderRightWidth", cs),
        padTopAndBottom = _getStyleAsNumber("paddingTop", cs) + _getStyleAsNumber("paddingBottom", cs),
        padLeftAndRight = _getStyleAsNumber("paddingLeft", cs) + _getStyleAsNumber("paddingRight", cs),
        lineThreshold = _getStyleAsNumber("fontSize", cs) * (vars.lineThreshold || 0.2),
        textAlign = cs.textAlign,
        charArray = [],
        wordArray = [],
        lineArray = [],
        wordDelimiter = vars.wordDelimiter || " ",
        tag = vars.tag ? vars.tag : vars.span ? "span" : "div",
        types = vars.type || vars.split || "chars,words,lines",
        lines = allLines && ~types.indexOf("lines") ? [] : null,
        words = ~types.indexOf("words"),
        chars = ~types.indexOf("chars"),
        absolute = _isAbsolute(vars),
        linesClass = vars.linesClass,
        iterateLine = ~(linesClass || "").indexOf("++"),
        spaceNodesToRemove = [],
        i,
        j,
        l,
        node,
        nodes,
        isChild,
        curLine,
        addWordSpaces,
        style,
        lineNode,
        lineWidth,
        offset;

    if (iterateLine) {
      linesClass = linesClass.split("++").join("");
    } //copy all the descendant nodes into an array (we can't use a regular nodeList because it's live and we may need to renest things)


    j = element.getElementsByTagName("*");
    l = j.length;
    nodes = [];

    for (i = 0; i < l; i++) {
      nodes[i] = j[i];
    } //for absolute positioning, we need to record the x/y offsets and width/height for every <div>. And even if we're not positioning things absolutely, in order to accommodate lines, we must figure out where the y offset changes so that we can sense where the lines break, and we populate the lines array.


    if (lines || absolute) {
      for (i = 0; i < l; i++) {
        node = nodes[i];
        isChild = node.parentNode === element;

        if (isChild || absolute || chars && !words) {
          offset = node.offsetTop;

          if (lines && isChild && Math.abs(offset - lineOffsetY) > lineThreshold && (node.nodeName !== "BR" || i === 0)) {
            //we found some rare occasions where a certain character like &#8209; could cause the offsetTop to be off by 1 pixel, so we build in a threshold.
            curLine = [];
            lines.push(curLine);
            lineOffsetY = offset;
          }

          if (absolute) {
            //record offset x and y, as well as width and height so that we can access them later for positioning. Grabbing them at once ensures we don't trigger a browser paint & we maximize performance.
            node._x = node.offsetLeft;
            node._y = offset;
            node._w = node.offsetWidth;
            node._h = node.offsetHeight;
          }

          if (lines) {
            if (node._isSplit && isChild || !chars && isChild || words && isChild || !words && node.parentNode.parentNode === element && !node.parentNode._isSplit) {
              curLine.push(node);
              node._x -= paddingLeft;

              if (_isBeforeWordDelimiter(node, element, wordDelimiter)) {
                node._wordEnd = true;
              }
            }

            if (node.nodeName === "BR" && (node.nextSibling && node.nextSibling.nodeName === "BR" || i === 0)) {
              //two consecutive <br> tags signify a new [empty] line. Also, if the entire block of content STARTS with a <br>, add a line.
              lines.push([]);
            }
          }
        }
      }
    }

    for (i = 0; i < l; i++) {
      node = nodes[i];
      isChild = node.parentNode === element;

      if (node.nodeName === "BR") {
        if (lines || absolute) {
          node.parentNode && node.parentNode.removeChild(node);
          nodes.splice(i--, 1);
          l--;
        } else if (!words) {
          element.appendChild(node);
        }

        continue;
      }

      if (absolute) {
        style = node.style;

        if (!words && !isChild) {
          node._x += node.parentNode._x;
          node._y += node.parentNode._y;
        }

        style.left = node._x + "px";
        style.top = node._y + "px";
        style.position = "absolute";
        style.display = "block"; //if we don't set the width/height, things collapse in older versions of IE and the origin for transforms is thrown off in all browsers.

        style.width = node._w + 1 + "px"; //IE is 1px short sometimes. Avoid wrapping

        style.height = node._h + "px";
      }

      if (!words && chars) {
        //we always start out wrapping words in their own <div> so that line breaks happen correctly, but here we'll remove those <div> tags if necessary and renest the characters directly into the element rather than inside the word <div>
        if (node._isSplit) {
          node._next = node.nextSibling;
          node.parentNode.appendChild(node); //put it at the end to keep the order correct.
        } else if (node.parentNode._isSplit) {
          node._parent = node.parentNode;

          if (!node.previousSibling && node.firstChild) {
            node.firstChild._isFirst = true;
          }

          if (node.nextSibling && node.nextSibling.textContent === " " && !node.nextSibling.nextSibling) {
            //if the last node inside a nested element is just a space (like T<span>nested </span>), remove it otherwise it'll get placed in the wrong order. Don't remove it right away, though, because we need to sense when words/characters are before a space like _isBeforeWordDelimiter(). Removing it now would make that a false negative.
            spaceNodesToRemove.push(node.nextSibling);
          }

          node._next = node.nextSibling && node.nextSibling._isFirst ? null : node.nextSibling;
          node.parentNode.removeChild(node);
          nodes.splice(i--, 1);
          l--;
        } else if (!isChild) {
          offset = !node.nextSibling && _isBeforeWordDelimiter(node.parentNode, element, wordDelimiter); //if this is the last letter in the word (and we're not breaking by lines and not positioning things absolutely), we need to add a space afterwards so that the characters don't just mash together

          if (node.parentNode._parent) {
            node.parentNode._parent.appendChild(node);
          }

          offset && node.parentNode.appendChild(_doc$3.createTextNode(" "));

          if (tag === "span") {
            node.style.display = "inline"; //so that word breaks are honored properly.
          }

          charArray.push(node);
        }
      } else if (node.parentNode._isSplit && !node._isSplit && node.innerHTML !== "") {
        wordArray.push(node);
      } else if (chars && !node._isSplit) {
        if (tag === "span") {
          node.style.display = "inline";
        }

        charArray.push(node);
      }
    }

    i = spaceNodesToRemove.length;

    while (--i > -1) {
      spaceNodesToRemove[i].parentNode.removeChild(spaceNodesToRemove[i]);
    }

    if (lines) {
      //the next 7 lines just give us the line width in the most reliable way and figure out the left offset (if position isn't relative or absolute). We must set the width along with text-align to ensure everything works properly for various alignments.
      if (absolute) {
        lineNode = _doc$3.createElement(tag);
        element.appendChild(lineNode);
        lineWidth = lineNode.offsetWidth + "px";
        offset = lineNode.offsetParent === element ? 0 : element.offsetLeft;
        element.removeChild(lineNode);
      }

      style = element.style.cssText;
      element.style.cssText = "display:none;"; //to improve performance, set display:none on the element so that the browser doesn't have to worry about reflowing or rendering while we're renesting things. We'll revert the cssText later.
      //we can't use element.innerHTML = "" because that causes IE to literally delete all the nodes and their content even though we've stored them in an array! So we must loop through the children and remove them.

      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }

      addWordSpaces = wordDelimiter === " " && (!absolute || !words && !chars);

      for (i = 0; i < lines.length; i++) {
        curLine = lines[i];
        lineNode = _doc$3.createElement(tag);
        lineNode.style.cssText = "display:block;text-align:" + textAlign + ";position:" + (absolute ? "absolute;" : "relative;");

        if (linesClass) {
          lineNode.className = linesClass + (iterateLine ? i + 1 : "");
        }

        lineArray.push(lineNode);
        l = curLine.length;

        for (j = 0; j < l; j++) {
          if (curLine[j].nodeName !== "BR") {
            node = curLine[j];
            lineNode.appendChild(node);
            addWordSpaces && node._wordEnd && lineNode.appendChild(_doc$3.createTextNode(" "));

            if (absolute) {
              if (j === 0) {
                lineNode.style.top = node._y + "px";
                lineNode.style.left = paddingLeft + offset + "px";
              }

              node.style.top = "0px";

              if (offset) {
                node.style.left = node._x - offset + "px";
              }
            }
          }
        }

        if (l === 0) {
          //if there are no nodes in the line (typically meaning there were two consecutive <br> tags, just add a non-breaking space so that things display properly.
          lineNode.innerHTML = "&nbsp;";
        } else if (!words && !chars) {
          _deWordify(lineNode);

          _swapText(lineNode, String.fromCharCode(160), " ");
        }

        if (absolute) {
          lineNode.style.width = lineWidth;
          lineNode.style.height = node._h + "px";
        }

        element.appendChild(lineNode);
      }

      element.style.cssText = style;
    } //if everything shifts to being position:absolute, the container can collapse in terms of height or width, so fix that here.


    if (absolute) {
      if (origHeight > element.clientHeight) {
        element.style.height = origHeight - padTopAndBottom + "px";

        if (element.clientHeight < origHeight) {
          //IE8 and earlier use a different box model - we must include padding and borders
          element.style.height = origHeight + borderTopAndBottom + "px";
        }
      }

      if (origWidth > element.clientWidth) {
        element.style.width = origWidth - padLeftAndRight + "px";

        if (element.clientWidth < origWidth) {
          //IE8 and earlier use a different box model - we must include padding and borders
          element.style.width = origWidth + borderLeftAndRight + "px";
        }
      }
    }

    _pushReversed(allChars, charArray);

    if (words) {
      _pushReversed(allWords, wordArray);
    }

    _pushReversed(allLines, lineArray);
  },
      _splitRawText = function _splitRawText(element, vars, wordStart, charStart) {
    var tag = vars.tag ? vars.tag : vars.span ? "span" : "div",
        types = vars.type || vars.split || "chars,words,lines",
        //words = (types.indexOf("words") !== -1),
    chars = ~types.indexOf("chars"),
        absolute = _isAbsolute(vars),
        wordDelimiter = vars.wordDelimiter || " ",
        space = wordDelimiter !== " " ? "" : absolute ? "&#173; " : " ",
        wordEnd = "</" + tag + ">",
        wordIsOpen = 1,
        specialChars = vars.specialChars ? typeof vars.specialChars === "function" ? vars.specialChars : _findSpecialChars : null,
        //specialChars can be an array or a function. For performance reasons, we always set this local "specialChars" to a function to which we pass the remaining text and whatever the original vars.specialChars was so that if it's an array, it works with the _findSpecialChars() function.
    text,
        splitText,
        i,
        j,
        l,
        character,
        hasTagStart,
        testResult,
        container = _doc$3.createElement("div"),
        parent = element.parentNode;

    parent.insertBefore(container, element);
    container.textContent = element.nodeValue;
    parent.removeChild(element);
    element = container;
    text = getText(element);
    hasTagStart = text.indexOf("<") !== -1;

    if (vars.reduceWhiteSpace !== false) {
      text = text.replace(_multipleSpacesExp, " ").replace(_stripExp, "");
    }

    if (hasTagStart) {
      text = text.split("<").join("{{LT}}"); //we can't leave "<" in the string, or when we set the innerHTML, it can be interpreted as a node
    }

    l = text.length;
    splitText = (text.charAt(0) === " " ? space : "") + wordStart();

    for (i = 0; i < l; i++) {
      character = text.charAt(i);

      if (specialChars && (testResult = specialChars(text.substr(i), vars.specialChars))) {
        // look for any specialChars that were declared. Remember, they can be passed in like {specialChars:["à¤®à¥€", "à¤ªà¤¾", "à¤¹à¥ˆ"]} or a function could be defined instead. Either way, the function should return the number of characters that should be grouped together for this "character".
        character = text.substr(i, testResult || 1);
        splitText += chars && character !== " " ? charStart() + character + "</" + tag + ">" : character;
        i += testResult - 1;
      } else if (character === wordDelimiter && text.charAt(i - 1) !== wordDelimiter && i) {
        splitText += wordIsOpen ? wordEnd : "";
        wordIsOpen = 0;

        while (text.charAt(i + 1) === wordDelimiter) {
          //skip over empty spaces (to avoid making them words)
          splitText += space;
          i++;
        }

        if (i === l - 1) {
          splitText += space;
        } else if (text.charAt(i + 1) !== ")") {
          splitText += space + wordStart();
          wordIsOpen = 1;
        }
      } else if (character === "{" && text.substr(i, 6) === "{{LT}}") {
        splitText += chars ? charStart() + "{{LT}}" + "</" + tag + ">" : "{{LT}}";
        i += 5;
      } else if (character.charCodeAt(0) >= 0xD800 && character.charCodeAt(0) <= 0xDBFF || text.charCodeAt(i + 1) >= 0xFE00 && text.charCodeAt(i + 1) <= 0xFE0F) {
        //special emoji characters use 2 or 4 unicode characters that we must keep together.
        j = ((text.substr(i, 12).split(emojiExp) || [])[1] || "").length || 2;
        splitText += chars && character !== " " ? charStart() + text.substr(i, j) + "</" + tag + ">" : text.substr(i, j);
        i += j - 1;
      } else {
        splitText += chars && character !== " " ? charStart() + character + "</" + tag + ">" : character;
      }
    }

    element.outerHTML = splitText + (wordIsOpen ? wordEnd : "");

    if (hasTagStart) {
      _swapText(parent, "{{LT}}", "<"); //note: don't perform this on "element" because that gets replaced with all new elements when we set element.outerHTML.

    }
  },
      _split = function _split(element, vars, wordStart, charStart) {
    var children = _toArray$1(element.childNodes),
        l = children.length,
        absolute = _isAbsolute(vars),
        i,
        child;

    if (element.nodeType !== 3 || l > 1) {
      vars.absolute = false;

      for (i = 0; i < l; i++) {
        child = children[i];

        if (child.nodeType !== 3 || /\S+/.test(child.nodeValue)) {
          if (absolute && child.nodeType !== 3 && _getComputedStyle$1(child).display === "inline") {
            //if there's a child node that's display:inline, switch it to inline-block so that absolute positioning works properly (most browsers don't report offsetTop/offsetLeft properly inside a <span> for example)
            child.style.display = "inline-block";
            child.style.position = "relative";
          }

          child._isSplit = true;

          _split(child, vars, wordStart, charStart); //don't split lines on child elements

        }
      }

      vars.absolute = absolute;
      element._isSplit = true;
      return;
    }

    _splitRawText(element, vars, wordStart, charStart);
  };

  var SplitText = /*#__PURE__*/function () {
    function SplitText(element, vars) {
      _coreInitted$2 || _initCore$1();
      this.elements = _toArray$1(element);
      this.chars = [];
      this.words = [];
      this.lines = [];
      this._originals = [];
      this.vars = vars || {};
       this.split(vars);
    }

    var _proto = SplitText.prototype;

    _proto.split = function split(vars) {
      this.isSplit && this.revert();
      this.vars = vars = vars || this.vars;
      this._originals.length = this.chars.length = this.words.length = this.lines.length = 0;

      var i = this.elements.length,
          tag = vars.tag ? vars.tag : vars.span ? "span" : "div",
          wordStart = _cssClassFunc(vars.wordsClass, tag),
          charStart = _cssClassFunc(vars.charsClass, tag),
          origHeight,
          origWidth,
          e; //we split in reversed order so that if/when we position:absolute elements, they don't affect the position of the ones after them in the document flow (shifting them up as they're taken out of the document flow).


      while (--i > -1) {
        e = this.elements[i];
        this._originals[i] = e.innerHTML;
        origHeight = e.clientHeight;
        origWidth = e.clientWidth;

        _split(e, vars, wordStart, charStart);

        _setPositionsAfterSplit(e, vars, this.chars, this.words, this.lines, origWidth, origHeight);
      }

      this.chars.reverse();
      this.words.reverse();
      this.lines.reverse();
      this.isSplit = true;
      return this;
    };

    _proto.revert = function revert() {
      var originals = this._originals;

      if (!originals) {
        throw "revert() call wasn't scoped properly.";
      }

      this.elements.forEach(function (e, i) {
        return e.innerHTML = originals[i];
      });
      this.chars = [];
      this.words = [];
      this.lines = [];
      this.isSplit = false;
      return this;
    };

    SplitText.create = function create(element, vars) {
      return new SplitText(element, vars);
    };

    return SplitText;
  }();
  SplitText.version = "3.5.1";

  /*!
   * paths 3.5.1
   * https://greensock.com
   *
   * Copyright 2008-2020, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */

  /* eslint-disable */
  var _svgPathExp = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig,
      _scientific = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/ig,
      _DEG2RAD$1 = Math.PI / 180,
      _sin$1 = Math.sin,
      _cos$1 = Math.cos,
      _abs$1 = Math.abs,
      _sqrt$1 = Math.sqrt,
      _isNumber$2 = function _isNumber(value) {
    return typeof value === "number";
  },
      _roundingNum = 1e5,
      //if progress lands on 1, the % will make it 0 which is why we || 1, but not if it's negative because it makes more sense for motion to end at 0 in that case.
  _round$1 = function _round(value) {
    return Math.round(value * _roundingNum) / _roundingNum || 0;
  };

  function transformRawPath(rawPath, a, b, c, d, tx, ty) {
    var j = rawPath.length,
        segment,
        l,
        i,
        x,
        y;

    while (--j > -1) {
      segment = rawPath[j];
      l = segment.length;

      for (i = 0; i < l; i += 2) {
        x = segment[i];
        y = segment[i + 1];
        segment[i] = x * a + y * c + tx;
        segment[i + 1] = x * b + y * d + ty;
      }
    }

    rawPath._dirty = 1;
    return rawPath;
  } // translates SVG arc data into a segment (cubic beziers). Angle is in degrees.

  function arcToSegment(lastX, lastY, rx, ry, angle, largeArcFlag, sweepFlag, x, y) {
    if (lastX === x && lastY === y) {
      return;
    }

    rx = _abs$1(rx);
    ry = _abs$1(ry);

    var angleRad = angle % 360 * _DEG2RAD$1,
        cosAngle = _cos$1(angleRad),
        sinAngle = _sin$1(angleRad),
        PI = Math.PI,
        TWOPI = PI * 2,
        dx2 = (lastX - x) / 2,
        dy2 = (lastY - y) / 2,
        x1 = cosAngle * dx2 + sinAngle * dy2,
        y1 = -sinAngle * dx2 + cosAngle * dy2,
        x1_sq = x1 * x1,
        y1_sq = y1 * y1,
        radiiCheck = x1_sq / (rx * rx) + y1_sq / (ry * ry);

    if (radiiCheck > 1) {
      rx = _sqrt$1(radiiCheck) * rx;
      ry = _sqrt$1(radiiCheck) * ry;
    }

    var rx_sq = rx * rx,
        ry_sq = ry * ry,
        sq = (rx_sq * ry_sq - rx_sq * y1_sq - ry_sq * x1_sq) / (rx_sq * y1_sq + ry_sq * x1_sq);

    if (sq < 0) {
      sq = 0;
    }

    var coef = (largeArcFlag === sweepFlag ? -1 : 1) * _sqrt$1(sq),
        cx1 = coef * (rx * y1 / ry),
        cy1 = coef * -(ry * x1 / rx),
        sx2 = (lastX + x) / 2,
        sy2 = (lastY + y) / 2,
        cx = sx2 + (cosAngle * cx1 - sinAngle * cy1),
        cy = sy2 + (sinAngle * cx1 + cosAngle * cy1),
        ux = (x1 - cx1) / rx,
        uy = (y1 - cy1) / ry,
        vx = (-x1 - cx1) / rx,
        vy = (-y1 - cy1) / ry,
        temp = ux * ux + uy * uy,
        angleStart = (uy < 0 ? -1 : 1) * Math.acos(ux / _sqrt$1(temp)),
        angleExtent = (ux * vy - uy * vx < 0 ? -1 : 1) * Math.acos((ux * vx + uy * vy) / _sqrt$1(temp * (vx * vx + vy * vy)));

    isNaN(angleExtent) && (angleExtent = PI); //rare edge case. Math.cos(-1) is NaN.

    if (!sweepFlag && angleExtent > 0) {
      angleExtent -= TWOPI;
    } else if (sweepFlag && angleExtent < 0) {
      angleExtent += TWOPI;
    }

    angleStart %= TWOPI;
    angleExtent %= TWOPI;

    var segments = Math.ceil(_abs$1(angleExtent) / (TWOPI / 4)),
        rawPath = [],
        angleIncrement = angleExtent / segments,
        controlLength = 4 / 3 * _sin$1(angleIncrement / 2) / (1 + _cos$1(angleIncrement / 2)),
        ma = cosAngle * rx,
        mb = sinAngle * rx,
        mc = sinAngle * -ry,
        md = cosAngle * ry,
        i;

    for (i = 0; i < segments; i++) {
      angle = angleStart + i * angleIncrement;
      x1 = _cos$1(angle);
      y1 = _sin$1(angle);
      ux = _cos$1(angle += angleIncrement);
      uy = _sin$1(angle);
      rawPath.push(x1 - controlLength * y1, y1 + controlLength * x1, ux + controlLength * uy, uy - controlLength * ux, ux, uy);
    } //now transform according to the actual size of the ellipse/arc (the beziers were noramlized, between 0 and 1 on a circle).


    for (i = 0; i < rawPath.length; i += 2) {
      x1 = rawPath[i];
      y1 = rawPath[i + 1];
      rawPath[i] = x1 * ma + y1 * mc + cx;
      rawPath[i + 1] = x1 * mb + y1 * md + cy;
    }

    rawPath[i - 2] = x; //always set the end to exactly where it's supposed to be

    rawPath[i - 1] = y;
    return rawPath;
  } //Spits back a RawPath with absolute coordinates. Each segment starts with a "moveTo" command (x coordinate, then y) and then 2 control points (x, y, x, y), then anchor. The goal is to minimize memory and maximize speed.


  function stringToRawPath(d) {
    var a = (d + "").replace(_scientific, function (m) {
      var n = +m;
      return n < 0.0001 && n > -0.0001 ? 0 : n;
    }).match(_svgPathExp) || [],
        //some authoring programs spit out very small numbers in scientific notation like "1e-5", so make sure we round that down to 0 first.
    path = [],
        relativeX = 0,
        relativeY = 0,
        twoThirds = 2 / 3,
        elements = a.length,
        points = 0,
        errorMessage = "ERROR: malformed path: " + d,
        i,
        j,
        x,
        y,
        command,
        isRelative,
        segment,
        startX,
        startY,
        difX,
        difY,
        beziers,
        prevCommand,
        flag1,
        flag2,
        line = function line(sx, sy, ex, ey) {
      difX = (ex - sx) / 3;
      difY = (ey - sy) / 3;
      segment.push(sx + difX, sy + difY, ex - difX, ey - difY, ex, ey);
    };

    if (!d || !isNaN(a[0]) || isNaN(a[1])) {
      console.log(errorMessage);
      return path;
    }

    for (i = 0; i < elements; i++) {
      prevCommand = command;

      if (isNaN(a[i])) {
        command = a[i].toUpperCase();
        isRelative = command !== a[i]; //lower case means relative
      } else {
        //commands like "C" can be strung together without any new command characters between.
        i--;
      }

      x = +a[i + 1];
      y = +a[i + 2];

      if (isRelative) {
        x += relativeX;
        y += relativeY;
      }

      if (!i) {
        startX = x;
        startY = y;
      } // "M" (move)


      if (command === "M") {
        if (segment) {
          if (segment.length < 8) {
            //if the path data was funky and just had a M with no actual drawing anywhere, skip it.
            path.length -= 1;
          } else {
            points += segment.length;
          }
        }

        relativeX = startX = x;
        relativeY = startY = y;
        segment = [x, y];
        path.push(segment);
        i += 2;
        command = "L"; //an "M" with more than 2 values gets interpreted as "lineTo" commands ("L").
        // "C" (cubic bezier)
      } else if (command === "C") {
        if (!segment) {
          segment = [0, 0];
        }

        if (!isRelative) {
          relativeX = relativeY = 0;
        } //note: "*1" is just a fast/short way to cast the value as a Number. WAAAY faster in Chrome, slightly slower in Firefox.


        segment.push(x, y, relativeX + a[i + 3] * 1, relativeY + a[i + 4] * 1, relativeX += a[i + 5] * 1, relativeY += a[i + 6] * 1);
        i += 6; // "S" (continuation of cubic bezier)
      } else if (command === "S") {
        difX = relativeX;
        difY = relativeY;

        if (prevCommand === "C" || prevCommand === "S") {
          difX += relativeX - segment[segment.length - 4];
          difY += relativeY - segment[segment.length - 3];
        }

        if (!isRelative) {
          relativeX = relativeY = 0;
        }

        segment.push(difX, difY, x, y, relativeX += a[i + 3] * 1, relativeY += a[i + 4] * 1);
        i += 4; // "Q" (quadratic bezier)
      } else if (command === "Q") {
        difX = relativeX + (x - relativeX) * twoThirds;
        difY = relativeY + (y - relativeY) * twoThirds;

        if (!isRelative) {
          relativeX = relativeY = 0;
        }

        relativeX += a[i + 3] * 1;
        relativeY += a[i + 4] * 1;
        segment.push(difX, difY, relativeX + (x - relativeX) * twoThirds, relativeY + (y - relativeY) * twoThirds, relativeX, relativeY);
        i += 4; // "T" (continuation of quadratic bezier)
      } else if (command === "T") {
        difX = relativeX - segment[segment.length - 4];
        difY = relativeY - segment[segment.length - 3];
        segment.push(relativeX + difX, relativeY + difY, x + (relativeX + difX * 1.5 - x) * twoThirds, y + (relativeY + difY * 1.5 - y) * twoThirds, relativeX = x, relativeY = y);
        i += 2; // "H" (horizontal line)
      } else if (command === "H") {
        line(relativeX, relativeY, relativeX = x, relativeY);
        i += 1; // "V" (vertical line)
      } else if (command === "V") {
        //adjust values because the first (and only one) isn't x in this case, it's y.
        line(relativeX, relativeY, relativeX, relativeY = x + (isRelative ? relativeY - relativeX : 0));
        i += 1; // "L" (line) or "Z" (close)
      } else if (command === "L" || command === "Z") {
        if (command === "Z") {
          x = startX;
          y = startY;
          segment.closed = true;
        }

        if (command === "L" || _abs$1(relativeX - x) > 0.5 || _abs$1(relativeY - y) > 0.5) {
          line(relativeX, relativeY, x, y);

          if (command === "L") {
            i += 2;
          }
        }

        relativeX = x;
        relativeY = y; // "A" (arc)
      } else if (command === "A") {
        flag1 = a[i + 4];
        flag2 = a[i + 5];
        difX = a[i + 6];
        difY = a[i + 7];
        j = 7;

        if (flag1.length > 1) {
          // for cases when the flags are merged, like "a8 8 0 018 8" (the 0 and 1 flags are WITH the x value of 8, but it could also be "a8 8 0 01-8 8" so it may include x or not)
          if (flag1.length < 3) {
            difY = difX;
            difX = flag2;
            j--;
          } else {
            difY = flag2;
            difX = flag1.substr(2);
            j -= 2;
          }

          flag2 = flag1.charAt(1);
          flag1 = flag1.charAt(0);
        }

        beziers = arcToSegment(relativeX, relativeY, +a[i + 1], +a[i + 2], +a[i + 3], +flag1, +flag2, (isRelative ? relativeX : 0) + difX * 1, (isRelative ? relativeY : 0) + difY * 1);
        i += j;

        if (beziers) {
          for (j = 0; j < beziers.length; j++) {
            segment.push(beziers[j]);
          }
        }

        relativeX = segment[segment.length - 2];
        relativeY = segment[segment.length - 1];
      } else {
        console.log(errorMessage);
      }
    }

    i = segment.length;

    if (i < 6) {
      //in case there's odd SVG like a M0,0 command at the very end.
      path.pop();
      i = 0;
    } else if (segment[0] === segment[i - 2] && segment[1] === segment[i - 1]) {
      segment.closed = true;
    }

    path.totalPoints = points + i;
    return path;
  } //populates the points array in alternating x/y values (like [x, y, x, y...] instead of individual point objects [{x, y}, {x, y}...] to conserve memory and stay in line with how we're handling segment arrays
  /*
  Takes any of the following and converts it to an all Cubic Bezier SVG data string:
  - A <path> data string like "M0,0 L2,4 v20,15 H100"
  - A RawPath, like [[x, y, x, y, x, y, x, y][[x, y, x, y, x, y, x, y]]
  - A Segment, like [x, y, x, y, x, y, x, y]

  Note: all numbers are rounded down to the closest 0.001 to minimize memory, maximize speed, and avoid odd numbers like 1e-13
  */

  function rawPathToString(rawPath) {
    if (_isNumber$2(rawPath[0])) {
      //in case a segment is passed in instead
      rawPath = [rawPath];
    }

    var result = "",
        l = rawPath.length,
        sl,
        s,
        i,
        segment;

    for (s = 0; s < l; s++) {
      segment = rawPath[s];
      result += "M" + _round$1(segment[0]) + "," + _round$1(segment[1]) + " C";
      sl = segment.length;

      for (i = 2; i < sl; i++) {
        result += _round$1(segment[i++]) + "," + _round$1(segment[i++]) + " " + _round$1(segment[i++]) + "," + _round$1(segment[i++]) + " " + _round$1(segment[i++]) + "," + _round$1(segment[i]) + " ";
      }

      if (segment.closed) {
        result += "z";
      }
    }

    return result;
  }
  /*
  // takes a segment with coordinates [x, y, x, y, ...] and converts the control points into angles and lengths [x, y, angle, length, angle, length, x, y, angle, length, ...] so that it animates more cleanly and avoids odd breaks/kinks. For example, if you animate from 1 o'clock to 6 o'clock, it'd just go directly/linearly rather than around. So the length would be very short in the middle of the tween.
  export function cpCoordsToAngles(segment, copy) {
  	var result = copy ? segment.slice(0) : segment,
  		x, y, i;
  	for (i = 0; i < segment.length; i+=6) {
  		x = segment[i+2] - segment[i];
  		y = segment[i+3] - segment[i+1];
  		result[i+2] = Math.atan2(y, x);
  		result[i+3] = Math.sqrt(x * x + y * y);
  		x = segment[i+6] - segment[i+4];
  		y = segment[i+7] - segment[i+5];
  		result[i+4] = Math.atan2(y, x);
  		result[i+5] = Math.sqrt(x * x + y * y);
  	}
  	return result;
  }

  // takes a segment that was converted with cpCoordsToAngles() to have angles and lengths instead of coordinates for the control points, and converts it BACK into coordinates.
  export function cpAnglesToCoords(segment, copy) {
  	var result = copy ? segment.slice(0) : segment,
  		length = segment.length,
  		rnd = 1000,
  		angle, l, i, j;
  	for (i = 0; i < length; i+=6) {
  		angle = segment[i+2];
  		l = segment[i+3]; //length
  		result[i+2] = (((segment[i] + Math.cos(angle) * l) * rnd) | 0) / rnd;
  		result[i+3] = (((segment[i+1] + Math.sin(angle) * l) * rnd) | 0) / rnd;
  		angle = segment[i+4];
  		l = segment[i+5]; //length
  		result[i+4] = (((segment[i+6] - Math.cos(angle) * l) * rnd) | 0) / rnd;
  		result[i+5] = (((segment[i+7] - Math.sin(angle) * l) * rnd) | 0) / rnd;
  	}
  	return result;
  }

  //adds an "isSmooth" array to each segment and populates it with a boolean value indicating whether or not it's smooth (the control points have basically the same slope). For any smooth control points, it converts the coordinates into angle (x, in radians) and length (y) and puts them into the same index value in a smoothData array.
  export function populateSmoothData(rawPath) {
  	let j = rawPath.length,
  		smooth, segment, x, y, x2, y2, i, l, a, a2, isSmooth, smoothData;
  	while (--j > -1) {
  		segment = rawPath[j];
  		isSmooth = segment.isSmooth = segment.isSmooth || [0, 0, 0, 0];
  		smoothData = segment.smoothData = segment.smoothData || [0, 0, 0, 0];
  		isSmooth.length = 4;
  		l = segment.length - 2;
  		for (i = 6; i < l; i += 6) {
  			x = segment[i] - segment[i - 2];
  			y = segment[i + 1] - segment[i - 1];
  			x2 = segment[i + 2] - segment[i];
  			y2 = segment[i + 3] - segment[i + 1];
  			a = _atan2(y, x);
  			a2 = _atan2(y2, x2);
  			smooth = (Math.abs(a - a2) < 0.09);
  			if (smooth) {
  				smoothData[i - 2] = a;
  				smoothData[i + 2] = a2;
  				smoothData[i - 1] = _sqrt(x * x + y * y);
  				smoothData[i + 3] = _sqrt(x2 * x2 + y2 * y2);
  			}
  			isSmooth.push(smooth, smooth, 0, 0, smooth, smooth);
  		}
  		//if the first and last points are identical, check to see if there's a smooth transition. We must handle this a bit differently due to their positions in the array.
  		if (segment[l] === segment[0] && segment[l+1] === segment[1]) {
  			x = segment[0] - segment[l-2];
  			y = segment[1] - segment[l-1];
  			x2 = segment[2] - segment[0];
  			y2 = segment[3] - segment[1];
  			a = _atan2(y, x);
  			a2 = _atan2(y2, x2);
  			if (Math.abs(a - a2) < 0.09) {
  				smoothData[l-2] = a;
  				smoothData[2] = a2;
  				smoothData[l-1] = _sqrt(x * x + y * y);
  				smoothData[3] = _sqrt(x2 * x2 + y2 * y2);
  				isSmooth[l-2] = isSmooth[l-1] = true; //don't change indexes 2 and 3 because we'll trigger everything from the END, and this will optimize file size a bit.
  			}
  		}
  	}
  	return rawPath;
  }
  export function pointToScreen(svgElement, point) {
  	if (arguments.length < 2) { //by default, take the first set of coordinates in the path as the point
  		let rawPath = getRawPath(svgElement);
  		point = svgElement.ownerSVGElement.createSVGPoint();
  		point.x = rawPath[0][0];
  		point.y = rawPath[0][1];
  	}
  	return point.matrixTransform(svgElement.getScreenCTM());
  }

  */

  /*!
   * CustomEase 3.5.1
   * https://greensock.com
   *
   * @license Copyright 2008-2020, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */

  var gsap$2,
      _coreInitted$3,
      _getGSAP$1 = function _getGSAP() {
    return gsap$2 || typeof window !== "undefined" && (gsap$2 = window.gsap) && gsap$2.registerPlugin && gsap$2;
  },
      _initCore$2 = function _initCore() {
    gsap$2 = _getGSAP$1();

    if (gsap$2) {
      gsap$2.registerEase("_CE", CustomEase.create);
      _coreInitted$3 = 1;
    } else {
      console.warn("Please gsap.registerPlugin(CustomEase)");
    }
  },
      _bigNum$2 = 1e20,
      _round$2 = function _round(value) {
    return ~~(value * 1000 + (value < 0 ? -.5 : .5)) / 1000;
  },
      //<name>CustomEase</name>
  _numExp$1 = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi,
      //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
  _needsParsingExp = /[cLlsSaAhHvVtTqQ]/g,
      _findMinimum = function _findMinimum(values) {
    var l = values.length,
        min = _bigNum$2,
        i;

    for (i = 1; i < l; i += 6) {
      +values[i] < min && (min = +values[i]);
    }

    return min;
  },
      //takes all the points and translates/scales them so that the x starts at 0 and ends at 1.
  _normalize = function _normalize(values, height, originY) {
    if (!originY && originY !== 0) {
      originY = Math.max(+values[values.length - 1], +values[1]);
    }

    var tx = +values[0] * -1,
        ty = -originY,
        l = values.length,
        sx = 1 / (+values[l - 2] + tx),
        sy = -height || (Math.abs(+values[l - 1] - +values[1]) < 0.01 * (+values[l - 2] - +values[0]) ? _findMinimum(values) + ty : +values[l - 1] + ty),
        i;

    if (sy) {
      //typically y ends at 1 (so that the end values are reached)
      sy = 1 / sy;
    } else {
      //in case the ease returns to its beginning value, scale everything proportionally
      sy = -sx;
    }

    for (i = 0; i < l; i += 2) {
      values[i] = (+values[i] + tx) * sx;
      values[i + 1] = (+values[i + 1] + ty) * sy;
    }
  },
      //note that this function returns point objects like {x, y} rather than working with segments which are arrays with alternating x, y values as in the similar function in paths.js
  _bezierToPoints = function _bezierToPoints(x1, y1, x2, y2, x3, y3, x4, y4, threshold, points, index) {
    var x12 = (x1 + x2) / 2,
        y12 = (y1 + y2) / 2,
        x23 = (x2 + x3) / 2,
        y23 = (y2 + y3) / 2,
        x34 = (x3 + x4) / 2,
        y34 = (y3 + y4) / 2,
        x123 = (x12 + x23) / 2,
        y123 = (y12 + y23) / 2,
        x234 = (x23 + x34) / 2,
        y234 = (y23 + y34) / 2,
        x1234 = (x123 + x234) / 2,
        y1234 = (y123 + y234) / 2,
        dx = x4 - x1,
        dy = y4 - y1,
        d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx),
        d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx),
        length;

    if (!points) {
      points = [{
        x: x1,
        y: y1
      }, {
        x: x4,
        y: y4
      }];
      index = 1;
    }

    points.splice(index || points.length - 1, 0, {
      x: x1234,
      y: y1234
    });

    if ((d2 + d3) * (d2 + d3) > threshold * (dx * dx + dy * dy)) {
      length = points.length;

      _bezierToPoints(x1, y1, x12, y12, x123, y123, x1234, y1234, threshold, points, index);

      _bezierToPoints(x1234, y1234, x234, y234, x34, y34, x4, y4, threshold, points, index + 1 + (points.length - length));
    }

    return points;
  };

  var CustomEase = /*#__PURE__*/function () {
    function CustomEase(id, data, config) {
      _coreInitted$3 || _initCore$2();
      this.id = id;
       this.setData(data, config);
    }

    var _proto = CustomEase.prototype;

    _proto.setData = function setData(data, config) {
      config = config || {};
      data = data || "0,0,1,1";
      var values = data.match(_numExp$1),
          closest = 1,
          points = [],
          lookup = [],
          precision = config.precision || 1,
          fast = precision <= 1,
          l,
          a1,
          a2,
          i,
          inc,
          j,
          point,
          prevPoint,
          p;
      this.data = data;

      if (_needsParsingExp.test(data) || ~data.indexOf("M") && data.indexOf("C") < 0) {
        values = stringToRawPath(data)[0];
      }

      l = values.length;

      if (l === 4) {
        values.unshift(0, 0);
        values.push(1, 1);
        l = 8;
      } else if ((l - 2) % 6) {
        throw "Invalid CustomEase";
      }

      if (+values[0] !== 0 || +values[l - 2] !== 1) {
        _normalize(values, config.height, config.originY);
      }

      this.segment = values;

      for (i = 2; i < l; i += 6) {
        a1 = {
          x: +values[i - 2],
          y: +values[i - 1]
        };
        a2 = {
          x: +values[i + 4],
          y: +values[i + 5]
        };
        points.push(a1, a2);

        _bezierToPoints(a1.x, a1.y, +values[i], +values[i + 1], +values[i + 2], +values[i + 3], a2.x, a2.y, 1 / (precision * 200000), points, points.length - 1);
      }

      l = points.length;

      for (i = 0; i < l; i++) {
        point = points[i];
        prevPoint = points[i - 1] || point;

        if ((point.x > prevPoint.x || prevPoint.y !== point.y && prevPoint.x === point.x || point === prevPoint) && point.x <= 1) {
          //if a point goes BACKWARD in time or is a duplicate, just drop it. Also it shouldn't go past 1 on the x axis, as could happen in a string like "M0,0 C0,0 0.12,0.68 0.18,0.788 0.195,0.845 0.308,1 0.32,1 0.403,1.005 0.398,1 0.5,1 0.602,1 0.816,1.005 0.9,1 0.91,1 0.948,0.69 0.962,0.615 1.003,0.376 1,0 1,0".
          prevPoint.cx = point.x - prevPoint.x; //change in x between this point and the next point (performance optimization)

          prevPoint.cy = point.y - prevPoint.y;
          prevPoint.n = point;
          prevPoint.nx = point.x; //next point's x value (performance optimization, making lookups faster in getRatio()). Remember, the lookup will always land on a spot where it's either this point or the very next one (never beyond that)

          if (fast && i > 1 && Math.abs(prevPoint.cy / prevPoint.cx - points[i - 2].cy / points[i - 2].cx) > 2) {
            //if there's a sudden change in direction, prioritize accuracy over speed. Like a bounce ease - you don't want to risk the sampling chunks landing on each side of the bounce anchor and having it clipped off.
            fast = 0;
          }

          if (prevPoint.cx < closest) {
            if (!prevPoint.cx) {
              prevPoint.cx = 0.001; //avoids math problems in getRatio() (dividing by zero)

              if (i === l - 1) {
                //in case the final segment goes vertical RIGHT at the end, make sure we end at the end.
                prevPoint.x -= 0.001;
                closest = Math.min(closest, 0.001);
                fast = 0;
              }
            } else {
              closest = prevPoint.cx;
            }
          }
        } else {
          points.splice(i--, 1);
          l--;
        }
      }

      l = 1 / closest + 1 | 0;
      inc = 1 / l;
      j = 0;
      point = points[0];

      if (fast) {
        for (i = 0; i < l; i++) {
          //for fastest lookups, we just sample along the path at equal x (time) distance. Uses more memory and is slightly less accurate for anchors that don't land on the sampling points, but for the vast majority of eases it's excellent (and fast).
          p = i * inc;

          if (point.nx < p) {
            point = points[++j];
          }

          a1 = point.y + (p - point.x) / point.cx * point.cy;
          lookup[i] = {
            x: p,
            cx: inc,
            y: a1,
            cy: 0,
            nx: 9
          };

          if (i) {
            lookup[i - 1].cy = a1 - lookup[i - 1].y;
          }
        }

        lookup[l - 1].cy = points[points.length - 1].y - a1;
      } else {
        //this option is more accurate, ensuring that EVERY anchor is hit perfectly. Clipping across a bounce, for example, would never happen.
        for (i = 0; i < l; i++) {
          //build a lookup table based on the smallest distance so that we can instantly find the appropriate point (well, it'll either be that point or the very next one). We'll look up based on the linear progress. So it's it's 0.5 and the lookup table has 100 elements, it'd be like lookup[Math.floor(0.5 * 100)]
          if (point.nx < i * inc) {
            point = points[++j];
          }

          lookup[i] = point;
        }

        if (j < points.length - 1) {
          lookup[i - 1] = points[points.length - 2];
        }
      } //this._calcEnd = (points[points.length-1].y !== 1 || points[0].y !== 0); //ensures that we don't run into floating point errors. As long as we're starting at 0 and ending at 1, tell GSAP to skip the final calculation and use 0/1 as the factor.


      this.ease = function (p) {
        var point = lookup[p * l | 0] || lookup[l - 1];

        if (point.nx < p) {
          point = point.n;
        }

        return point.y + (p - point.x) / point.cx * point.cy;
      };

      this.ease.custom = this;
      this.id && gsap$2.registerEase(this.id, this.ease);
      return this;
    };

    _proto.getSVGData = function getSVGData(config) {
      return CustomEase.getSVGData(this, config);
    };

    CustomEase.create = function create(id, data, config) {
      return new CustomEase(id, data, config).ease;
    };

    CustomEase.register = function register(core) {
      gsap$2 = core;

      _initCore$2();
    };

    CustomEase.get = function get(id) {
      return gsap$2.parseEase(id);
    };

    CustomEase.getSVGData = function getSVGData(ease, config) {
      config = config || {};
      var width = config.width || 100,
          height = config.height || 100,
          x = config.x || 0,
          y = (config.y || 0) + height,
          e = gsap$2.utils.toArray(config.path)[0],
          a,
          slope,
          i,
          inc,
          tx,
          ty,
          precision,
          threshold,
          prevX,
          prevY;

      if (config.invert) {
        height = -height;
        y = 0;
      }

      if (typeof ease === "string") {
        ease = gsap$2.parseEase(ease);
      }

      if (ease.custom) {
        ease = ease.custom;
      }

      if (ease instanceof CustomEase) {
        a = rawPathToString(transformRawPath([ease.segment], width, 0, 0, -height, x, y));
      } else {
        a = [x, y];
        precision = Math.max(5, (config.precision || 1) * 200);
        inc = 1 / precision;
        precision += 2;
        threshold = 5 / precision;
        prevX = _round$2(x + inc * width);
        prevY = _round$2(y + ease(inc) * -height);
        slope = (prevY - y) / (prevX - x);

        for (i = 2; i < precision; i++) {
          tx = _round$2(x + i * inc * width);
          ty = _round$2(y + ease(i * inc) * -height);

          if (Math.abs((ty - prevY) / (tx - prevX) - slope) > threshold || i === precision - 1) {
            //only add points when the slope changes beyond the threshold
            a.push(prevX, prevY);
            slope = (ty - prevY) / (tx - prevX);
          }

          prevX = tx;
          prevY = ty;
        }

        a = "M" + a.join(",");
      }

      e && e.setAttribute("d", a);
      return a;
    };

    return CustomEase;
  }();
  _getGSAP$1() && gsap$2.registerPlugin(CustomEase);
  CustomEase.version = "3.5.1";

  /*!
   * DrawSVGPlugin 3.5.1
   * https://greensock.com
   *
   * @license Copyright 2008-2020, GreenSock. All rights reserved.
   * Subject to the terms at https://greensock.com/standard-license or for
   * Club GreenSock members, the agreement issued with that membership.
   * @author: Jack Doyle, jack@greensock.com
  */

  /* eslint-disable */
  var gsap$3,
      _toArray$2,
      _win$4,
      _isEdge,
      _coreInitted$4,
      _windowExists$3 = function _windowExists() {
    return typeof window !== "undefined";
  },
      _getGSAP$2 = function _getGSAP() {
    return gsap$3 || _windowExists$3() && (gsap$3 = window.gsap) && gsap$3.registerPlugin && gsap$3;
  },
      _numExp$2 = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi,
      //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
  _types = {
    rect: ["width", "height"],
    circle: ["r", "r"],
    ellipse: ["rx", "ry"],
    line: ["x2", "y2"]
  },
      _round$3 = function _round(value) {
    return Math.round(value * 10000) / 10000;
  },
      _parseNum = function _parseNum(value) {
    return parseFloat(value || 0);
  },
      _getAttributeAsNumber = function _getAttributeAsNumber(target, attr) {
    return _parseNum(target.getAttribute(attr));
  },
      _sqrt$2 = Math.sqrt,
      _getDistance = function _getDistance(x1, y1, x2, y2, scaleX, scaleY) {
    return _sqrt$2(Math.pow((_parseNum(x2) - _parseNum(x1)) * scaleX, 2) + Math.pow((_parseNum(y2) - _parseNum(y1)) * scaleY, 2));
  },
      _warn$1 = function _warn(message) {
    return console.warn(message);
  },
      _hasNonScalingStroke = function _hasNonScalingStroke(target) {
    return target.getAttribute("vector-effect") === "non-scaling-stroke";
  },
      _bonusValidated = 1,
      //<name>DrawSVGPlugin</name>
  //accepts values like "100%" or "20% 80%" or "20 50" and parses it into an absolute start and end position on the line/stroke based on its length. Returns an an array with the start and end values, like [0, 243]
  _parse = function _parse(value, length, defaultStart) {
    var i = value.indexOf(" "),
        s,
        e;

    if (i < 0) {
      s = defaultStart !== undefined ? defaultStart + "" : value;
      e = value;
    } else {
      s = value.substr(0, i);
      e = value.substr(i + 1);
    }

    s = ~s.indexOf("%") ? _parseNum(s) / 100 * length : _parseNum(s);
    e = ~e.indexOf("%") ? _parseNum(e) / 100 * length : _parseNum(e);
    return s > e ? [e, s] : [s, e];
  },
      _getLength = function _getLength(target) {
    target = _toArray$2(target)[0];

    if (!target) {
      return 0;
    }

    var type = target.tagName.toLowerCase(),
        style = target.style,
        scaleX = 1,
        scaleY = 1,
        length,
        bbox,
        points,
        prevPoint,
        i,
        rx,
        ry;

    if (_hasNonScalingStroke(target)) {
      //non-scaling-stroke basically scales the shape and then strokes it at the screen-level (after transforms), thus we need to adjust the length accordingly.
      scaleY = target.getScreenCTM();
      scaleX = _sqrt$2(scaleY.a * scaleY.a + scaleY.b * scaleY.b);
      scaleY = _sqrt$2(scaleY.d * scaleY.d + scaleY.c * scaleY.c);
    }

    try {
      //IE bug: calling <path>.getTotalLength() locks the repaint area of the stroke to whatever its current dimensions are on that frame/tick. To work around that, we must call getBBox() to force IE to recalculate things.
      bbox = target.getBBox(); //solely for fixing bug in IE - we don't actually use the bbox.
    } catch (e) {
      //firefox has a bug that throws an error if the element isn't visible.
      _warn$1("Some browsers won't measure invisible elements (like display:none or masks inside defs).");
    }

    var _ref = bbox || {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
        x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height;

    if ((!bbox || !width && !height) && _types[type]) {
      //if the element isn't visible, try to discern width/height using its attributes.
      width = _getAttributeAsNumber(target, _types[type][0]);
      height = _getAttributeAsNumber(target, _types[type][1]);

      if (type !== "rect" && type !== "line") {
        //double the radius for circles and ellipses
        width *= 2;
        height *= 2;
      }

      if (type === "line") {
        x = _getAttributeAsNumber(target, "x1");
        y = _getAttributeAsNumber(target, "y1");
        width = Math.abs(width - x);
        height = Math.abs(height - y);
      }
    }

    if (type === "path") {
      prevPoint = style.strokeDasharray;
      style.strokeDasharray = "none";
      length = target.getTotalLength() || 0;

      if (scaleX !== scaleY) {
        _warn$1("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled.");
      }

      length *= (scaleX + scaleY) / 2;
      style.strokeDasharray = prevPoint;
    } else if (type === "rect") {
      length = width * 2 * scaleX + height * 2 * scaleY;
    } else if (type === "line") {
      length = _getDistance(x, y, x + width, y + height, scaleX, scaleY);
    } else if (type === "polyline" || type === "polygon") {
      points = target.getAttribute("points").match(_numExp$2) || [];

      if (type === "polygon") {
        points.push(points[0], points[1]);
      }

      length = 0;

      for (i = 2; i < points.length; i += 2) {
        length += _getDistance(points[i - 2], points[i - 1], points[i], points[i + 1], scaleX, scaleY) || 0;
      }
    } else if (type === "circle" || type === "ellipse") {
      rx = width / 2 * scaleX;
      ry = height / 2 * scaleY;
      length = Math.PI * (3 * (rx + ry) - _sqrt$2((3 * rx + ry) * (rx + 3 * ry)));
    }

    return length || 0;
  },
      _getPosition = function _getPosition(target, length) {
    target = _toArray$2(target)[0];

    if (!target) {
      return [0, 0];
    }

    if (!length) {
      length = _getLength(target) + 1;
    }

    var cs = _win$4.getComputedStyle(target),
        dash = cs.strokeDasharray || "",
        offset = _parseNum(cs.strokeDashoffset),
        i = dash.indexOf(",");

    if (i < 0) {
      i = dash.indexOf(" ");
    }

    dash = i < 0 ? length : _parseNum(dash.substr(0, i)) || 1e-5;

    if (dash > length) {
      dash = length;
    }

    return [Math.max(0, -offset), Math.max(0, dash - offset)];
  },
      _initCore$3 = function _initCore() {
    if (_windowExists$3()) {
      _win$4 = window;
      _coreInitted$4 = gsap$3 = _getGSAP$2();
      _toArray$2 = gsap$3.utils.toArray;
      _isEdge = ((_win$4.navigator || {}).userAgent || "").indexOf("Edge") !== -1; //Microsoft Edge has a bug that causes it not to redraw the path correctly if the stroke-linecap is anything other than "butt" (like "round") and it doesn't match the stroke-linejoin. A way to trigger it is to change the stroke-miterlimit, so we'll only do that if/when we have to (to maximize performance)
    }
  };

  var DrawSVGPlugin = {
    version: "3.5.1",
    name: "drawSVG",
    register: function register(core) {
      gsap$3 = core;

      _initCore$3();
    },
    init: function init(target, value, tween, index, targets) {
      if (!target.getBBox) {
        return false;
      }

      _coreInitted$4 || _initCore$3();
      var length = _getLength(target) + 1,
          start,
          end,
          overage,
          cs;
      this._style = target.style;
      this._target = target;

      if (value + "" === "true") {
        value = "0 100%";
      } else if (!value) {
        value = "0 0";
      } else if ((value + "").indexOf(" ") === -1) {
        value = "0 " + value;
      }

      start = _getPosition(target, length);
      end = _parse(value, length, start[0]);
      this._length = _round$3(length + 10);

      if (start[0] === 0 && end[0] === 0) {
        overage = Math.max(0.00001, end[1] - length); //allow people to go past the end, like values of 105% because for some paths, Firefox doesn't return an accurate getTotalLength(), so it could end up coming up short.

        this._dash = _round$3(length + overage);
        this._offset = _round$3(length - start[1] + overage);
        this._offsetPT = this.add(this, "_offset", this._offset, _round$3(length - end[1] + overage));
      } else {
        this._dash = _round$3(start[1] - start[0]) || 0.000001; //some browsers render artifacts if dash is 0, so we use a very small number in that case.

        this._offset = _round$3(-start[0]);
        this._dashPT = this.add(this, "_dash", this._dash, _round$3(end[1] - end[0]) || 0.00001);
        this._offsetPT = this.add(this, "_offset", this._offset, _round$3(-end[0]));
      }

      if (_isEdge) {
        //to work around a bug in Microsoft Edge, animate the stroke-miterlimit by 0.0001 just to trigger the repaint (unnecessary if it's "round" and stroke-linejoin is also "round"). Imperceptible, relatively high-performance, and effective. Another option was to set the "d" <path> attribute to its current value on every tick, but that seems like it'd be much less performant.
        cs = _win$4.getComputedStyle(target);

        if (cs.strokeLinecap !== cs.strokeLinejoin) {
          end = _parseNum(cs.strokeMiterlimit);
          this.add(target.style, "strokeMiterlimit", end, end + 0.01);
        }
      }

      this._live = _hasNonScalingStroke(target) || ~(value + "").indexOf("live");

      this._props.push("drawSVG");

      return _bonusValidated;
    },
    render: function render(ratio, data) {
      var pt = data._pt,
          style = data._style,
          length,
          lengthRatio,
          dash,
          offset;

      if (pt) {
        //when the element has vector-effect="non-scaling-stroke" and the SVG is resized (like on a window resize), it actually changes the length of the stroke! So we must sense that and make the proper adjustments.
        if (data._live) {
          length = _getLength(data._target) + 11;

          if (length !== data._length) {
            lengthRatio = length / data._length;
            data._length = length;
            data._offsetPT.s *= lengthRatio;
            data._offsetPT.c *= lengthRatio;

            if (data._dashPT) {
              data._dashPT.s *= lengthRatio;
              data._dashPT.c *= lengthRatio;
            } else {
              data._dash *= lengthRatio;
            }
          }
        }

        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }

        dash = data._dash;
        offset = data._offset;
        length = data._length;
        style.strokeDashoffset = data._offset;

        if (ratio === 1 || !ratio) {
          if (dash - offset < 0.001 && length - dash <= 10) {
            //works around a bug in Safari that caused strokes with rounded ends to still show initially when they shouldn't.
            style.strokeDashoffset = offset + 1;
          }

          style.strokeDasharray = offset < 0.001 && length - dash <= 10 ? "none" : offset === dash ? "0px, 999999px" : dash + "px," + length + "px";
        } else {
          style.strokeDasharray = dash + "px," + length + "px";
        }
      }
    },
    getLength: _getLength,
    getPosition: _getPosition
  };
  _getGSAP$2() && gsap$3.registerPlugin(DrawSVGPlugin);

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var asscroll = createCommonjsModule(function (module, exports) {
  (function webpackUniversalModuleDefinition(root, factory) {
  	module.exports = factory();
  })(self, function() {
  return /******/ (() => { // webpackBootstrap
  /******/ 	var __webpack_modules__ = ({

  /***/ 4672:
  /***/ ((module) => {

  const store = {
    html: document.documentElement,
    body: document.body,
    window: {
      w: window.innerWidth,
      h: window.innerHeight
    }
  };
  module.exports = store;

  /***/ }),

  /***/ 5336:
  /***/ ((module) => {

  module.exports = function debounce(fn, delay) {
    let timeoutID = null;
    return function () {
      clearTimeout(timeoutID);
      const args = arguments;
      const that = this;
      timeoutID = setTimeout(function () {
        fn.apply(that, args);
      }, delay);
    };
  };

  /***/ }),

  /***/ 6077:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var isObject = __webpack_require__(111);

  module.exports = function (it) {
    if (!isObject(it) && it !== null) {
      throw TypeError("Can't set " + String(it) + ' as a prototype');
    } return it;
  };


  /***/ }),

  /***/ 1223:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var wellKnownSymbol = __webpack_require__(5112);
  var create = __webpack_require__(30);
  var definePropertyModule = __webpack_require__(3070);

  var UNSCOPABLES = wellKnownSymbol('unscopables');
  var ArrayPrototype = Array.prototype;

  // Array.prototype[@@unscopables]
  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
  if (ArrayPrototype[UNSCOPABLES] == undefined) {
    definePropertyModule.f(ArrayPrototype, UNSCOPABLES, {
      configurable: true,
      value: create(null)
    });
  }

  // add a key to Array.prototype[@@unscopables]
  module.exports = function (key) {
    ArrayPrototype[UNSCOPABLES][key] = true;
  };


  /***/ }),

  /***/ 9670:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var isObject = __webpack_require__(111);

  module.exports = function (it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + ' is not an object');
    } return it;
  };


  /***/ }),

  /***/ 1318:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var toIndexedObject = __webpack_require__(5656);
  var toLength = __webpack_require__(7466);
  var toAbsoluteIndex = __webpack_require__(1400);

  // `Array.prototype.{ indexOf, includes }` methods implementation
  var createMethod = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare -- NaN check
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare -- NaN check
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) {
        if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  module.exports = {
    // `Array.prototype.includes` method
    // https://tc39.es/ecma262/#sec-array.prototype.includes
    includes: createMethod(true),
    // `Array.prototype.indexOf` method
    // https://tc39.es/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod(false)
  };


  /***/ }),

  /***/ 4326:
  /***/ ((module) => {

  var toString = {}.toString;

  module.exports = function (it) {
    return toString.call(it).slice(8, -1);
  };


  /***/ }),

  /***/ 9920:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var has = __webpack_require__(6656);
  var ownKeys = __webpack_require__(3887);
  var getOwnPropertyDescriptorModule = __webpack_require__(1236);
  var definePropertyModule = __webpack_require__(3070);

  module.exports = function (target, source) {
    var keys = ownKeys(source);
    var defineProperty = definePropertyModule.f;
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  };


  /***/ }),

  /***/ 8544:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var fails = __webpack_require__(7293);

  module.exports = !fails(function () {
    function F() { /* empty */ }
    F.prototype.constructor = null;
    // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
    return Object.getPrototypeOf(new F()) !== F.prototype;
  });


  /***/ }),

  /***/ 4994:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var IteratorPrototype = __webpack_require__(3383).IteratorPrototype;
  var create = __webpack_require__(30);
  var createPropertyDescriptor = __webpack_require__(9114);
  var setToStringTag = __webpack_require__(8003);
  var Iterators = __webpack_require__(7497);

  var returnThis = function () { return this; };

  module.exports = function (IteratorConstructor, NAME, next) {
    var TO_STRING_TAG = NAME + ' Iterator';
    IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
    setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
    Iterators[TO_STRING_TAG] = returnThis;
    return IteratorConstructor;
  };


  /***/ }),

  /***/ 8880:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var DESCRIPTORS = __webpack_require__(9781);
  var definePropertyModule = __webpack_require__(3070);
  var createPropertyDescriptor = __webpack_require__(9114);

  module.exports = DESCRIPTORS ? function (object, key, value) {
    return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };


  /***/ }),

  /***/ 9114:
  /***/ ((module) => {

  module.exports = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };


  /***/ }),

  /***/ 654:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var $ = __webpack_require__(2109);
  var createIteratorConstructor = __webpack_require__(4994);
  var getPrototypeOf = __webpack_require__(9518);
  var setPrototypeOf = __webpack_require__(7674);
  var setToStringTag = __webpack_require__(8003);
  var createNonEnumerableProperty = __webpack_require__(8880);
  var redefine = __webpack_require__(1320);
  var wellKnownSymbol = __webpack_require__(5112);
  var IS_PURE = __webpack_require__(1913);
  var Iterators = __webpack_require__(7497);
  var IteratorsCore = __webpack_require__(3383);

  var IteratorPrototype = IteratorsCore.IteratorPrototype;
  var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
  var ITERATOR = wellKnownSymbol('iterator');
  var KEYS = 'keys';
  var VALUES = 'values';
  var ENTRIES = 'entries';

  var returnThis = function () { return this; };

  module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
    createIteratorConstructor(IteratorConstructor, NAME, next);

    var getIterationMethod = function (KIND) {
      if (KIND === DEFAULT && defaultIterator) return defaultIterator;
      if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
      switch (KIND) {
        case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
        case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
        case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
      } return function () { return new IteratorConstructor(this); };
    };

    var TO_STRING_TAG = NAME + ' Iterator';
    var INCORRECT_VALUES_NAME = false;
    var IterablePrototype = Iterable.prototype;
    var nativeIterator = IterablePrototype[ITERATOR]
      || IterablePrototype['@@iterator']
      || DEFAULT && IterablePrototype[DEFAULT];
    var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
    var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
    var CurrentIteratorPrototype, methods, KEY;

    // fix native
    if (anyNativeIterator) {
      CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
      if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
        if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
          if (setPrototypeOf) {
            setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
          } else if (typeof CurrentIteratorPrototype[ITERATOR] != 'function') {
            createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR, returnThis);
          }
        }
        // Set @@toStringTag to native iterators
        setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
        if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
      }
    }

    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return nativeIterator.call(this); };
    }

    // define iterator
    if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
      createNonEnumerableProperty(IterablePrototype, ITERATOR, defaultIterator);
    }
    Iterators[NAME] = defaultIterator;

    // export additional methods
    if (DEFAULT) {
      methods = {
        values: getIterationMethod(VALUES),
        keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
        entries: getIterationMethod(ENTRIES)
      };
      if (FORCED) for (KEY in methods) {
        if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
          redefine(IterablePrototype, KEY, methods[KEY]);
        }
      } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
    }

    return methods;
  };


  /***/ }),

  /***/ 9781:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var fails = __webpack_require__(7293);

  // Detect IE8's incomplete defineProperty implementation
  module.exports = !fails(function () {
    // eslint-disable-next-line es/no-object-defineproperty -- required for testing
    return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
  });


  /***/ }),

  /***/ 317:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var global = __webpack_require__(7854);
  var isObject = __webpack_require__(111);

  var document = global.document;
  // typeof document.createElement is 'object' in old IE
  var EXISTS = isObject(document) && isObject(document.createElement);

  module.exports = function (it) {
    return EXISTS ? document.createElement(it) : {};
  };


  /***/ }),

  /***/ 8324:
  /***/ ((module) => {

  // iterable DOM collections
  // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
  module.exports = {
    CSSRuleList: 0,
    CSSStyleDeclaration: 0,
    CSSValueList: 0,
    ClientRectList: 0,
    DOMRectList: 0,
    DOMStringList: 0,
    DOMTokenList: 1,
    DataTransferItemList: 0,
    FileList: 0,
    HTMLAllCollection: 0,
    HTMLCollection: 0,
    HTMLFormElement: 0,
    HTMLSelectElement: 0,
    MediaList: 0,
    MimeTypeArray: 0,
    NamedNodeMap: 0,
    NodeList: 1,
    PaintRequestList: 0,
    Plugin: 0,
    PluginArray: 0,
    SVGLengthList: 0,
    SVGNumberList: 0,
    SVGPathSegList: 0,
    SVGPointList: 0,
    SVGStringList: 0,
    SVGTransformList: 0,
    SourceBufferList: 0,
    StyleSheetList: 0,
    TextTrackCueList: 0,
    TextTrackList: 0,
    TouchList: 0
  };


  /***/ }),

  /***/ 5268:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var classof = __webpack_require__(4326);
  var global = __webpack_require__(7854);

  module.exports = classof(global.process) == 'process';


  /***/ }),

  /***/ 8113:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var getBuiltIn = __webpack_require__(5005);

  module.exports = getBuiltIn('navigator', 'userAgent') || '';


  /***/ }),

  /***/ 7392:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var global = __webpack_require__(7854);
  var userAgent = __webpack_require__(8113);

  var process = global.process;
  var versions = process && process.versions;
  var v8 = versions && versions.v8;
  var match, version;

  if (v8) {
    match = v8.split('.');
    version = match[0] + match[1];
  } else if (userAgent) {
    match = userAgent.match(/Edge\/(\d+)/);
    if (!match || match[1] >= 74) {
      match = userAgent.match(/Chrome\/(\d+)/);
      if (match) version = match[1];
    }
  }

  module.exports = version && +version;


  /***/ }),

  /***/ 748:
  /***/ ((module) => {

  // IE8- don't enum bug keys
  module.exports = [
    'constructor',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'valueOf'
  ];


  /***/ }),

  /***/ 2109:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var global = __webpack_require__(7854);
  var getOwnPropertyDescriptor = __webpack_require__(1236).f;
  var createNonEnumerableProperty = __webpack_require__(8880);
  var redefine = __webpack_require__(1320);
  var setGlobal = __webpack_require__(3505);
  var copyConstructorProperties = __webpack_require__(9920);
  var isForced = __webpack_require__(4705);

  /*
    options.target      - name of the target object
    options.global      - target is the global object
    options.stat        - export as static methods of target
    options.proto       - export as prototype methods of target
    options.real        - real prototype method for the `pure` version
    options.forced      - export even if the native feature is available
    options.bind        - bind methods to the target, required for the `pure` version
    options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
    options.unsafe      - use the simple assignment of property instead of delete + defineProperty
    options.sham        - add a flag to not completely full polyfills
    options.enumerable  - export as enumerable property
    options.noTargetGet - prevent calling a getter on target
  */
  module.exports = function (options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;
    if (GLOBAL) {
      target = global;
    } else if (STATIC) {
      target = global[TARGET] || setGlobal(TARGET, {});
    } else {
      target = (global[TARGET] || {}).prototype;
    }
    if (target) for (key in source) {
      sourceProperty = source[key];
      if (options.noTargetGet) {
        descriptor = getOwnPropertyDescriptor(target, key);
        targetProperty = descriptor && descriptor.value;
      } else targetProperty = target[key];
      FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
      // contained in target
      if (!FORCED && targetProperty !== undefined) {
        if (typeof sourceProperty === typeof targetProperty) continue;
        copyConstructorProperties(sourceProperty, targetProperty);
      }
      // add a flag to not completely full polyfills
      if (options.sham || (targetProperty && targetProperty.sham)) {
        createNonEnumerableProperty(sourceProperty, 'sham', true);
      }
      // extend global
      redefine(target, key, sourceProperty, options);
    }
  };


  /***/ }),

  /***/ 7293:
  /***/ ((module) => {

  module.exports = function (exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };


  /***/ }),

  /***/ 5005:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var path = __webpack_require__(857);
  var global = __webpack_require__(7854);

  var aFunction = function (variable) {
    return typeof variable == 'function' ? variable : undefined;
  };

  module.exports = function (namespace, method) {
    return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
      : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
  };


  /***/ }),

  /***/ 7854:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var check = function (it) {
    return it && it.Math == Math && it;
  };

  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  module.exports =
    // eslint-disable-next-line es/no-global-this -- safe
    check(typeof globalThis == 'object' && globalThis) ||
    check(typeof window == 'object' && window) ||
    // eslint-disable-next-line no-restricted-globals -- safe
    check(typeof self == 'object' && self) ||
    check(typeof __webpack_require__.g == 'object' && __webpack_require__.g) ||
    // eslint-disable-next-line no-new-func -- fallback
    (function () { return this; })() || Function('return this')();


  /***/ }),

  /***/ 6656:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var toObject = __webpack_require__(7908);

  var hasOwnProperty = {}.hasOwnProperty;

  module.exports = function hasOwn(it, key) {
    return hasOwnProperty.call(toObject(it), key);
  };


  /***/ }),

  /***/ 3501:
  /***/ ((module) => {

  module.exports = {};


  /***/ }),

  /***/ 490:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var getBuiltIn = __webpack_require__(5005);

  module.exports = getBuiltIn('document', 'documentElement');


  /***/ }),

  /***/ 4664:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var DESCRIPTORS = __webpack_require__(9781);
  var fails = __webpack_require__(7293);
  var createElement = __webpack_require__(317);

  // Thank's IE8 for his funny defineProperty
  module.exports = !DESCRIPTORS && !fails(function () {
    // eslint-disable-next-line es/no-object-defineproperty -- requied for testing
    return Object.defineProperty(createElement('div'), 'a', {
      get: function () { return 7; }
    }).a != 7;
  });


  /***/ }),

  /***/ 8361:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var fails = __webpack_require__(7293);
  var classof = __webpack_require__(4326);

  var split = ''.split;

  // fallback for non-array-like ES3 and non-enumerable old V8 strings
  module.exports = fails(function () {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins -- safe
    return !Object('z').propertyIsEnumerable(0);
  }) ? function (it) {
    return classof(it) == 'String' ? split.call(it, '') : Object(it);
  } : Object;


  /***/ }),

  /***/ 2788:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var store = __webpack_require__(5465);

  var functionToString = Function.toString;

  // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
  if (typeof store.inspectSource != 'function') {
    store.inspectSource = function (it) {
      return functionToString.call(it);
    };
  }

  module.exports = store.inspectSource;


  /***/ }),

  /***/ 9909:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var NATIVE_WEAK_MAP = __webpack_require__(8536);
  var global = __webpack_require__(7854);
  var isObject = __webpack_require__(111);
  var createNonEnumerableProperty = __webpack_require__(8880);
  var objectHas = __webpack_require__(6656);
  var shared = __webpack_require__(5465);
  var sharedKey = __webpack_require__(6200);
  var hiddenKeys = __webpack_require__(3501);

  var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
  var WeakMap = global.WeakMap;
  var set, get, has;

  var enforce = function (it) {
    return has(it) ? get(it) : set(it, {});
  };

  var getterFor = function (TYPE) {
    return function (it) {
      var state;
      if (!isObject(it) || (state = get(it)).type !== TYPE) {
        throw TypeError('Incompatible receiver, ' + TYPE + ' required');
      } return state;
    };
  };

  if (NATIVE_WEAK_MAP) {
    var store = shared.state || (shared.state = new WeakMap());
    var wmget = store.get;
    var wmhas = store.has;
    var wmset = store.set;
    set = function (it, metadata) {
      if (wmhas.call(store, it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
      metadata.facade = it;
      wmset.call(store, it, metadata);
      return metadata;
    };
    get = function (it) {
      return wmget.call(store, it) || {};
    };
    has = function (it) {
      return wmhas.call(store, it);
    };
  } else {
    var STATE = sharedKey('state');
    hiddenKeys[STATE] = true;
    set = function (it, metadata) {
      if (objectHas(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
      metadata.facade = it;
      createNonEnumerableProperty(it, STATE, metadata);
      return metadata;
    };
    get = function (it) {
      return objectHas(it, STATE) ? it[STATE] : {};
    };
    has = function (it) {
      return objectHas(it, STATE);
    };
  }

  module.exports = {
    set: set,
    get: get,
    has: has,
    enforce: enforce,
    getterFor: getterFor
  };


  /***/ }),

  /***/ 4705:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var fails = __webpack_require__(7293);

  var replacement = /#|\.prototype\./;

  var isForced = function (feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL ? true
      : value == NATIVE ? false
      : typeof detection == 'function' ? fails(detection)
      : !!detection;
  };

  var normalize = isForced.normalize = function (string) {
    return String(string).replace(replacement, '.').toLowerCase();
  };

  var data = isForced.data = {};
  var NATIVE = isForced.NATIVE = 'N';
  var POLYFILL = isForced.POLYFILL = 'P';

  module.exports = isForced;


  /***/ }),

  /***/ 111:
  /***/ ((module) => {

  module.exports = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };


  /***/ }),

  /***/ 1913:
  /***/ ((module) => {

  module.exports = false;


  /***/ }),

  /***/ 3383:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var fails = __webpack_require__(7293);
  var getPrototypeOf = __webpack_require__(9518);
  var createNonEnumerableProperty = __webpack_require__(8880);
  var has = __webpack_require__(6656);
  var wellKnownSymbol = __webpack_require__(5112);
  var IS_PURE = __webpack_require__(1913);

  var ITERATOR = wellKnownSymbol('iterator');
  var BUGGY_SAFARI_ITERATORS = false;

  var returnThis = function () { return this; };

  // `%IteratorPrototype%` object
  // https://tc39.es/ecma262/#sec-%iteratorprototype%-object
  var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

  /* eslint-disable es/no-array-prototype-keys -- safe */
  if ([].keys) {
    arrayIterator = [].keys();
    // Safari 8 has buggy iterators w/o `next`
    if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
    else {
      PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
      if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
    }
  }

  var NEW_ITERATOR_PROTOTYPE = IteratorPrototype == undefined || fails(function () {
    var test = {};
    // FF44- legacy iterators case
    return IteratorPrototype[ITERATOR].call(test) !== test;
  });

  if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  if ((!IS_PURE || NEW_ITERATOR_PROTOTYPE) && !has(IteratorPrototype, ITERATOR)) {
    createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
  }

  module.exports = {
    IteratorPrototype: IteratorPrototype,
    BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
  };


  /***/ }),

  /***/ 7497:
  /***/ ((module) => {

  module.exports = {};


  /***/ }),

  /***/ 133:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var IS_NODE = __webpack_require__(5268);
  var V8_VERSION = __webpack_require__(7392);
  var fails = __webpack_require__(7293);

  // eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
  module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
    // eslint-disable-next-line es/no-symbol -- required for testing
    return !Symbol.sham &&
      // Chrome 38 Symbol has incorrect toString conversion
      // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
      (IS_NODE ? V8_VERSION === 38 : V8_VERSION > 37 && V8_VERSION < 41);
  });


  /***/ }),

  /***/ 8536:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var global = __webpack_require__(7854);
  var inspectSource = __webpack_require__(2788);

  var WeakMap = global.WeakMap;

  module.exports = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));


  /***/ }),

  /***/ 30:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var anObject = __webpack_require__(9670);
  var defineProperties = __webpack_require__(6048);
  var enumBugKeys = __webpack_require__(748);
  var hiddenKeys = __webpack_require__(3501);
  var html = __webpack_require__(490);
  var documentCreateElement = __webpack_require__(317);
  var sharedKey = __webpack_require__(6200);

  var GT = '>';
  var LT = '<';
  var PROTOTYPE = 'prototype';
  var SCRIPT = 'script';
  var IE_PROTO = sharedKey('IE_PROTO');

  var EmptyConstructor = function () { /* empty */ };

  var scriptTag = function (content) {
    return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
  };

  // Create object with fake `null` prototype: use ActiveX Object with cleared prototype
  var NullProtoObjectViaActiveX = function (activeXDocument) {
    activeXDocument.write(scriptTag(''));
    activeXDocument.close();
    var temp = activeXDocument.parentWindow.Object;
    activeXDocument = null; // avoid memory leak
    return temp;
  };

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var NullProtoObjectViaIFrame = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = documentCreateElement('iframe');
    var JS = 'java' + SCRIPT + ':';
    var iframeDocument;
    iframe.style.display = 'none';
    html.appendChild(iframe);
    // https://github.com/zloirock/core-js/issues/475
    iframe.src = String(JS);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(scriptTag('document.F=Object'));
    iframeDocument.close();
    return iframeDocument.F;
  };

  // Check for document.domain and active x support
  // No need to use active x approach when document.domain is not set
  // see https://github.com/es-shims/es5-shim/issues/150
  // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
  // avoid IE GC bug
  var activeXDocument;
  var NullProtoObject = function () {
    try {
      /* global ActiveXObject -- old IE */
      activeXDocument = document.domain && new ActiveXObject('htmlfile');
    } catch (error) { /* ignore */ }
    NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
    var length = enumBugKeys.length;
    while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
    return NullProtoObject();
  };

  hiddenKeys[IE_PROTO] = true;

  // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create
  module.exports = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      EmptyConstructor[PROTOTYPE] = anObject(O);
      result = new EmptyConstructor();
      EmptyConstructor[PROTOTYPE] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO] = O;
    } else result = NullProtoObject();
    return Properties === undefined ? result : defineProperties(result, Properties);
  };


  /***/ }),

  /***/ 6048:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var DESCRIPTORS = __webpack_require__(9781);
  var definePropertyModule = __webpack_require__(3070);
  var anObject = __webpack_require__(9670);
  var objectKeys = __webpack_require__(1956);

  // `Object.defineProperties` method
  // https://tc39.es/ecma262/#sec-object.defineproperties
  // eslint-disable-next-line es/no-object-defineproperties -- safe
  module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject(O);
    var keys = objectKeys(Properties);
    var length = keys.length;
    var index = 0;
    var key;
    while (length > index) definePropertyModule.f(O, key = keys[index++], Properties[key]);
    return O;
  };


  /***/ }),

  /***/ 3070:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

  var DESCRIPTORS = __webpack_require__(9781);
  var IE8_DOM_DEFINE = __webpack_require__(4664);
  var anObject = __webpack_require__(9670);
  var toPrimitive = __webpack_require__(7593);

  // eslint-disable-next-line es/no-object-defineproperty -- safe
  var $defineProperty = Object.defineProperty;

  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  exports.f = DESCRIPTORS ? $defineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (IE8_DOM_DEFINE) try {
      return $defineProperty(O, P, Attributes);
    } catch (error) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };


  /***/ }),

  /***/ 1236:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

  var DESCRIPTORS = __webpack_require__(9781);
  var propertyIsEnumerableModule = __webpack_require__(5296);
  var createPropertyDescriptor = __webpack_require__(9114);
  var toIndexedObject = __webpack_require__(5656);
  var toPrimitive = __webpack_require__(7593);
  var has = __webpack_require__(6656);
  var IE8_DOM_DEFINE = __webpack_require__(4664);

  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
  exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
    O = toIndexedObject(O);
    P = toPrimitive(P, true);
    if (IE8_DOM_DEFINE) try {
      return $getOwnPropertyDescriptor(O, P);
    } catch (error) { /* empty */ }
    if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
  };


  /***/ }),

  /***/ 8006:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

  var internalObjectKeys = __webpack_require__(6324);
  var enumBugKeys = __webpack_require__(748);

  var hiddenKeys = enumBugKeys.concat('length', 'prototype');

  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  // eslint-disable-next-line es/no-object-getownpropertynames -- safe
  exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return internalObjectKeys(O, hiddenKeys);
  };


  /***/ }),

  /***/ 5181:
  /***/ ((__unused_webpack_module, exports) => {

  // eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
  exports.f = Object.getOwnPropertySymbols;


  /***/ }),

  /***/ 9518:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var has = __webpack_require__(6656);
  var toObject = __webpack_require__(7908);
  var sharedKey = __webpack_require__(6200);
  var CORRECT_PROTOTYPE_GETTER = __webpack_require__(8544);

  var IE_PROTO = sharedKey('IE_PROTO');
  var ObjectPrototype = Object.prototype;

  // `Object.getPrototypeOf` method
  // https://tc39.es/ecma262/#sec-object.getprototypeof
  // eslint-disable-next-line es/no-object-getprototypeof -- safe
  module.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
    O = toObject(O);
    if (has(O, IE_PROTO)) return O[IE_PROTO];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectPrototype : null;
  };


  /***/ }),

  /***/ 6324:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var has = __webpack_require__(6656);
  var toIndexedObject = __webpack_require__(5656);
  var indexOf = __webpack_require__(1318).indexOf;
  var hiddenKeys = __webpack_require__(3501);

  module.exports = function (object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (has(O, key = names[i++])) {
      ~indexOf(result, key) || result.push(key);
    }
    return result;
  };


  /***/ }),

  /***/ 1956:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var internalObjectKeys = __webpack_require__(6324);
  var enumBugKeys = __webpack_require__(748);

  // `Object.keys` method
  // https://tc39.es/ecma262/#sec-object.keys
  // eslint-disable-next-line es/no-object-keys -- safe
  module.exports = Object.keys || function keys(O) {
    return internalObjectKeys(O, enumBugKeys);
  };


  /***/ }),

  /***/ 5296:
  /***/ ((__unused_webpack_module, exports) => {

  var $propertyIsEnumerable = {}.propertyIsEnumerable;
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

  // Nashorn ~ JDK8 bug
  var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

  // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
  exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
    var descriptor = getOwnPropertyDescriptor(this, V);
    return !!descriptor && descriptor.enumerable;
  } : $propertyIsEnumerable;


  /***/ }),

  /***/ 7674:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  /* eslint-disable no-proto -- safe */
  var anObject = __webpack_require__(9670);
  var aPossiblePrototype = __webpack_require__(6077);

  // `Object.setPrototypeOf` method
  // https://tc39.es/ecma262/#sec-object.setprototypeof
  // Works with __proto__ only. Old v8 can't work with null proto objects.
  // eslint-disable-next-line es/no-object-setprototypeof -- safe
  module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
    var CORRECT_SETTER = false;
    var test = {};
    var setter;
    try {
      // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
      setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
      setter.call(test, []);
      CORRECT_SETTER = test instanceof Array;
    } catch (error) { /* empty */ }
    return function setPrototypeOf(O, proto) {
      anObject(O);
      aPossiblePrototype(proto);
      if (CORRECT_SETTER) setter.call(O, proto);
      else O.__proto__ = proto;
      return O;
    };
  }() : undefined);


  /***/ }),

  /***/ 3887:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var getBuiltIn = __webpack_require__(5005);
  var getOwnPropertyNamesModule = __webpack_require__(8006);
  var getOwnPropertySymbolsModule = __webpack_require__(5181);
  var anObject = __webpack_require__(9670);

  // all object keys, includes non-enumerable and symbols
  module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
    var keys = getOwnPropertyNamesModule.f(anObject(it));
    var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
    return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
  };


  /***/ }),

  /***/ 857:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var global = __webpack_require__(7854);

  module.exports = global;


  /***/ }),

  /***/ 1320:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var global = __webpack_require__(7854);
  var createNonEnumerableProperty = __webpack_require__(8880);
  var has = __webpack_require__(6656);
  var setGlobal = __webpack_require__(3505);
  var inspectSource = __webpack_require__(2788);
  var InternalStateModule = __webpack_require__(9909);

  var getInternalState = InternalStateModule.get;
  var enforceInternalState = InternalStateModule.enforce;
  var TEMPLATE = String(String).split('String');

  (module.exports = function (O, key, value, options) {
    var unsafe = options ? !!options.unsafe : false;
    var simple = options ? !!options.enumerable : false;
    var noTargetGet = options ? !!options.noTargetGet : false;
    var state;
    if (typeof value == 'function') {
      if (typeof key == 'string' && !has(value, 'name')) {
        createNonEnumerableProperty(value, 'name', key);
      }
      state = enforceInternalState(value);
      if (!state.source) {
        state.source = TEMPLATE.join(typeof key == 'string' ? key : '');
      }
    }
    if (O === global) {
      if (simple) O[key] = value;
      else setGlobal(key, value);
      return;
    } else if (!unsafe) {
      delete O[key];
    } else if (!noTargetGet && O[key]) {
      simple = true;
    }
    if (simple) O[key] = value;
    else createNonEnumerableProperty(O, key, value);
  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, 'toString', function toString() {
    return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
  });


  /***/ }),

  /***/ 4488:
  /***/ ((module) => {

  // `RequireObjectCoercible` abstract operation
  // https://tc39.es/ecma262/#sec-requireobjectcoercible
  module.exports = function (it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };


  /***/ }),

  /***/ 3505:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var global = __webpack_require__(7854);
  var createNonEnumerableProperty = __webpack_require__(8880);

  module.exports = function (key, value) {
    try {
      createNonEnumerableProperty(global, key, value);
    } catch (error) {
      global[key] = value;
    } return value;
  };


  /***/ }),

  /***/ 8003:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var defineProperty = __webpack_require__(3070).f;
  var has = __webpack_require__(6656);
  var wellKnownSymbol = __webpack_require__(5112);

  var TO_STRING_TAG = wellKnownSymbol('toStringTag');

  module.exports = function (it, TAG, STATIC) {
    if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
      defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
    }
  };


  /***/ }),

  /***/ 6200:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var shared = __webpack_require__(2309);
  var uid = __webpack_require__(9711);

  var keys = shared('keys');

  module.exports = function (key) {
    return keys[key] || (keys[key] = uid(key));
  };


  /***/ }),

  /***/ 5465:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var global = __webpack_require__(7854);
  var setGlobal = __webpack_require__(3505);

  var SHARED = '__core-js_shared__';
  var store = global[SHARED] || setGlobal(SHARED, {});

  module.exports = store;


  /***/ }),

  /***/ 2309:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var IS_PURE = __webpack_require__(1913);
  var store = __webpack_require__(5465);

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.11.1',
    mode: IS_PURE ? 'pure' : 'global',
    copyright: 'Â© 2021 Denis Pushkarev (zloirock.ru)'
  });


  /***/ }),

  /***/ 1400:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var toInteger = __webpack_require__(9958);

  var max = Math.max;
  var min = Math.min;

  // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
  module.exports = function (index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max(integer + length, 0) : min(integer, length);
  };


  /***/ }),

  /***/ 5656:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  // toObject with fallback for non-array-like ES3 strings
  var IndexedObject = __webpack_require__(8361);
  var requireObjectCoercible = __webpack_require__(4488);

  module.exports = function (it) {
    return IndexedObject(requireObjectCoercible(it));
  };


  /***/ }),

  /***/ 9958:
  /***/ ((module) => {

  var ceil = Math.ceil;
  var floor = Math.floor;

  // `ToInteger` abstract operation
  // https://tc39.es/ecma262/#sec-tointeger
  module.exports = function (argument) {
    return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
  };


  /***/ }),

  /***/ 7466:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var toInteger = __webpack_require__(9958);

  var min = Math.min;

  // `ToLength` abstract operation
  // https://tc39.es/ecma262/#sec-tolength
  module.exports = function (argument) {
    return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
  };


  /***/ }),

  /***/ 7908:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var requireObjectCoercible = __webpack_require__(4488);

  // `ToObject` abstract operation
  // https://tc39.es/ecma262/#sec-toobject
  module.exports = function (argument) {
    return Object(requireObjectCoercible(argument));
  };


  /***/ }),

  /***/ 7593:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var isObject = __webpack_require__(111);

  // `ToPrimitive` abstract operation
  // https://tc39.es/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  module.exports = function (input, PREFERRED_STRING) {
    if (!isObject(input)) return input;
    var fn, val;
    if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
    if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    throw TypeError("Can't convert object to primitive value");
  };


  /***/ }),

  /***/ 9711:
  /***/ ((module) => {

  var id = 0;
  var postfix = Math.random();

  module.exports = function (key) {
    return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
  };


  /***/ }),

  /***/ 3307:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  /* eslint-disable es/no-symbol -- required for testing */
  var NATIVE_SYMBOL = __webpack_require__(133);

  module.exports = NATIVE_SYMBOL
    && !Symbol.sham
    && typeof Symbol.iterator == 'symbol';


  /***/ }),

  /***/ 5112:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var global = __webpack_require__(7854);
  var shared = __webpack_require__(2309);
  var has = __webpack_require__(6656);
  var uid = __webpack_require__(9711);
  var NATIVE_SYMBOL = __webpack_require__(133);
  var USE_SYMBOL_AS_UID = __webpack_require__(3307);

  var WellKnownSymbolsStore = shared('wks');
  var Symbol = global.Symbol;
  var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol : Symbol && Symbol.withoutSetter || uid;

  module.exports = function (name) {
    if (!has(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL || typeof WellKnownSymbolsStore[name] == 'string')) {
      if (NATIVE_SYMBOL && has(Symbol, name)) {
        WellKnownSymbolsStore[name] = Symbol[name];
      } else {
        WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
      }
    } return WellKnownSymbolsStore[name];
  };


  /***/ }),

  /***/ 6992:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  var toIndexedObject = __webpack_require__(5656);
  var addToUnscopables = __webpack_require__(1223);
  var Iterators = __webpack_require__(7497);
  var InternalStateModule = __webpack_require__(9909);
  var defineIterator = __webpack_require__(654);

  var ARRAY_ITERATOR = 'Array Iterator';
  var setInternalState = InternalStateModule.set;
  var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

  // `Array.prototype.entries` method
  // https://tc39.es/ecma262/#sec-array.prototype.entries
  // `Array.prototype.keys` method
  // https://tc39.es/ecma262/#sec-array.prototype.keys
  // `Array.prototype.values` method
  // https://tc39.es/ecma262/#sec-array.prototype.values
  // `Array.prototype[@@iterator]` method
  // https://tc39.es/ecma262/#sec-array.prototype-@@iterator
  // `CreateArrayIterator` internal method
  // https://tc39.es/ecma262/#sec-createarrayiterator
  module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
    setInternalState(this, {
      type: ARRAY_ITERATOR,
      target: toIndexedObject(iterated), // target
      index: 0,                          // next index
      kind: kind                         // kind
    });
  // `%ArrayIteratorPrototype%.next` method
  // https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
  }, function () {
    var state = getInternalState(this);
    var target = state.target;
    var kind = state.kind;
    var index = state.index++;
    if (!target || index >= target.length) {
      state.target = undefined;
      return { value: undefined, done: true };
    }
    if (kind == 'keys') return { value: index, done: false };
    if (kind == 'values') return { value: target[index], done: false };
    return { value: [index, target[index]], done: false };
  }, 'values');

  // argumentsList[@@iterator] is %ArrayProto_values%
  // https://tc39.es/ecma262/#sec-createunmappedargumentsobject
  // https://tc39.es/ecma262/#sec-createmappedargumentsobject
  Iterators.Arguments = Iterators.Array;

  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
  addToUnscopables('keys');
  addToUnscopables('values');
  addToUnscopables('entries');


  /***/ }),

  /***/ 3948:
  /***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

  var global = __webpack_require__(7854);
  var DOMIterables = __webpack_require__(8324);
  var ArrayIteratorMethods = __webpack_require__(6992);
  var createNonEnumerableProperty = __webpack_require__(8880);
  var wellKnownSymbol = __webpack_require__(5112);

  var ITERATOR = wellKnownSymbol('iterator');
  var TO_STRING_TAG = wellKnownSymbol('toStringTag');
  var ArrayValues = ArrayIteratorMethods.values;

  for (var COLLECTION_NAME in DOMIterables) {
    var Collection = global[COLLECTION_NAME];
    var CollectionPrototype = Collection && Collection.prototype;
    if (CollectionPrototype) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
        createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
      } catch (error) {
        CollectionPrototype[ITERATOR] = ArrayValues;
      }
      if (!CollectionPrototype[TO_STRING_TAG]) {
        createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
      }
      if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
        // some Chrome versions have non-configurable methods on DOMTokenList
        if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
          createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
        } catch (error) {
          CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
        }
      }
    }
  }


  /***/ })

  /******/ 	});
  /************************************************************************/
  /******/ 	// The module cache
  /******/ 	var __webpack_module_cache__ = {};
  /******/ 	
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
  /******/ 		// Check if module is in cache
  /******/ 		var cachedModule = __webpack_module_cache__[moduleId];
  /******/ 		if (cachedModule !== undefined) {
  /******/ 			return cachedModule.exports;
  /******/ 		}
  /******/ 		// Create a new module (and put it into the cache)
  /******/ 		var module = __webpack_module_cache__[moduleId] = {
  /******/ 			// no module.id needed
  /******/ 			// no module.loaded needed
  /******/ 			exports: {}
  /******/ 		};
  /******/ 	
  /******/ 		// Execute the module function
  /******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
  /******/ 	
  /******/ 		// Return the exports of the module
  /******/ 		return module.exports;
  /******/ 	}
  /******/ 	
  /************************************************************************/
  /******/ 	/* webpack/runtime/compat get default export */
  /******/ 	(() => {
  /******/ 		// getDefaultExport function for compatibility with non-harmony modules
  /******/ 		__webpack_require__.n = (module) => {
  /******/ 			var getter = module && module.__esModule ?
  /******/ 				() => (module['default']) :
  /******/ 				() => (module);
  /******/ 			__webpack_require__.d(getter, { a: getter });
  /******/ 			return getter;
  /******/ 		};
  /******/ 	})();
  /******/ 	
  /******/ 	/* webpack/runtime/define property getters */
  /******/ 	(() => {
  /******/ 		// define getter functions for harmony exports
  /******/ 		__webpack_require__.d = (exports, definition) => {
  /******/ 			for(var key in definition) {
  /******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
  /******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
  /******/ 				}
  /******/ 			}
  /******/ 		};
  /******/ 	})();
  /******/ 	
  /******/ 	/* webpack/runtime/global */
  /******/ 	(() => {
  /******/ 		__webpack_require__.g = (function() {
  /******/ 			if (typeof globalThis === 'object') return globalThis;
  /******/ 			try {
  /******/ 				return this || new Function('return this')();
  /******/ 			} catch (e) {
  /******/ 				if (typeof window === 'object') return window;
  /******/ 			}
  /******/ 		})();
  /******/ 	})();
  /******/ 	
  /******/ 	/* webpack/runtime/hasOwnProperty shorthand */
  /******/ 	(() => {
  /******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
  /******/ 	})();
  /******/ 	
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be in strict mode.
  (() => {

  // EXPORTS
  __webpack_require__.d(__webpack_exports__, {
    "default": () => (/* binding */ src)
  });

  // EXTERNAL MODULE: ./src/utils/debounce.js
  var debounce = __webpack_require__(5336);
  var debounce_default = /*#__PURE__*/__webpack_require__.n(debounce);
  // EXTERNAL MODULE: ./src/store.js
  var store = __webpack_require__(4672);
  var store_default = /*#__PURE__*/__webpack_require__.n(store);
  // Public: Create a new SelectorSet.
  function SelectorSet() {
    // Construct new SelectorSet if called as a function.
    if (!(this instanceof SelectorSet)) {
      return new SelectorSet();
    }

    // Public: Number of selectors added to the set
    this.size = 0;

    // Internal: Incrementing ID counter
    this.uid = 0;

    // Internal: Array of String selectors in the set
    this.selectors = [];

    // Internal: Map of selector ids to objects
    this.selectorObjects = {};

    // Internal: All Object index String names mapping to Index objects.
    this.indexes = Object.create(this.indexes);

    // Internal: Used Object index String names mapping to Index objects.
    this.activeIndexes = [];
  }

  // Detect prefixed Element#matches function.
  var docElem = window.document.documentElement;
  var matches =
    docElem.matches ||
    docElem.webkitMatchesSelector ||
    docElem.mozMatchesSelector ||
    docElem.oMatchesSelector ||
    docElem.msMatchesSelector;

  // Public: Check if element matches selector.
  //
  // Maybe overridden with custom Element.matches function.
  //
  // el       - An Element
  // selector - String CSS selector
  //
  // Returns true or false.
  SelectorSet.prototype.matchesSelector = function(el, selector) {
    return matches.call(el, selector);
  };

  // Public: Find all elements in the context that match the selector.
  //
  // Maybe overridden with custom querySelectorAll function.
  //
  // selectors - String CSS selectors.
  // context   - Element context
  //
  // Returns non-live list of Elements.
  SelectorSet.prototype.querySelectorAll = function(selectors, context) {
    return context.querySelectorAll(selectors);
  };

  // Public: Array of indexes.
  //
  // name     - Unique String name
  // selector - Function that takes a String selector and returns a String key
  //            or undefined if it can't be used by the index.
  // element  - Function that takes an Element and returns an Array of String
  //            keys that point to indexed values.
  //
  SelectorSet.prototype.indexes = [];

  // Index by element id
  var idRe = /^#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: 'ID',
    selector: function matchIdSelector(sel) {
      var m;
      if ((m = sel.match(idRe))) {
        return m[0].slice(1);
      }
    },
    element: function getElementId(el) {
      if (el.id) {
        return [el.id];
      }
    }
  });

  // Index by all of its class names
  var classRe = /^\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: 'CLASS',
    selector: function matchClassSelector(sel) {
      var m;
      if ((m = sel.match(classRe))) {
        return m[0].slice(1);
      }
    },
    element: function getElementClassNames(el) {
      var className = el.className;
      if (className) {
        if (typeof className === 'string') {
          return className.split(/\s/);
        } else if (typeof className === 'object' && 'baseVal' in className) {
          // className is a SVGAnimatedString
          // global SVGAnimatedString is not an exposed global in Opera 12
          return className.baseVal.split(/\s/);
        }
      }
    }
  });

  // Index by tag/node name: `DIV`, `FORM`, `A`
  var tagRe = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: 'TAG',
    selector: function matchTagSelector(sel) {
      var m;
      if ((m = sel.match(tagRe))) {
        return m[0].toUpperCase();
      }
    },
    element: function getElementTagName(el) {
      return [el.nodeName.toUpperCase()];
    }
  });

  // Default index just contains a single array of elements.
  SelectorSet.prototype.indexes['default'] = {
    name: 'UNIVERSAL',
    selector: function() {
      return true;
    },
    element: function() {
      return [true];
    }
  };

  // Use ES Maps when supported
  var Map;
  if (typeof window.Map === 'function') {
    Map = window.Map;
  } else {
    Map = (function() {
      function Map() {
        this.map = {};
      }
      Map.prototype.get = function(key) {
        return this.map[key + ' '];
      };
      Map.prototype.set = function(key, value) {
        this.map[key + ' '] = value;
      };
      return Map;
    })();
  }

  // Regexps adopted from Sizzle
  //   https://github.com/jquery/sizzle/blob/1.7/sizzle.js
  //
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;

  // Internal: Get indexes for selector.
  //
  // selector - String CSS selector
  //
  // Returns Array of {index, key}.
  function parseSelectorIndexes(allIndexes, selector) {
    allIndexes = allIndexes.slice(0).concat(allIndexes['default']);

    var allIndexesLen = allIndexes.length,
      i,
      j,
      m,
      dup,
      rest = selector,
      key,
      index,
      indexes = [];

    do {
      chunker.exec('');
      if ((m = chunker.exec(rest))) {
        rest = m[3];
        if (m[2] || !rest) {
          for (i = 0; i < allIndexesLen; i++) {
            index = allIndexes[i];
            if ((key = index.selector(m[1]))) {
              j = indexes.length;
              dup = false;
              while (j--) {
                if (indexes[j].index === index && indexes[j].key === key) {
                  dup = true;
                  break;
                }
              }
              if (!dup) {
                indexes.push({ index: index, key: key });
              }
              break;
            }
          }
        }
      }
    } while (m);

    return indexes;
  }

  // Internal: Find first item in Array that is a prototype of `proto`.
  //
  // ary   - Array of objects
  // proto - Prototype of expected item in `ary`
  //
  // Returns object from `ary` if found. Otherwise returns undefined.
  function findByPrototype(ary, proto) {
    var i, len, item;
    for (i = 0, len = ary.length; i < len; i++) {
      item = ary[i];
      if (proto.isPrototypeOf(item)) {
        return item;
      }
    }
  }

  // Public: Log when added selector falls under the default index.
  //
  // This API should not be considered stable. May change between
  // minor versions.
  //
  // obj - {selector, data} Object
  //
  //   SelectorSet.prototype.logDefaultIndexUsed = function(obj) {
  //     console.warn(obj.selector, "could not be indexed");
  //   };
  //
  // Returns nothing.
  SelectorSet.prototype.logDefaultIndexUsed = function() {};

  // Public: Add selector to set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.add = function(selector, data) {
    var obj,
      i,
      indexProto,
      key,
      index,
      objs,
      selectorIndexes,
      selectorIndex,
      indexes = this.activeIndexes,
      selectors = this.selectors,
      selectorObjects = this.selectorObjects;

    if (typeof selector !== 'string') {
      return;
    }

    obj = {
      id: this.uid++,
      selector: selector,
      data: data
    };
    selectorObjects[obj.id] = obj;

    selectorIndexes = parseSelectorIndexes(this.indexes, selector);
    for (i = 0; i < selectorIndexes.length; i++) {
      selectorIndex = selectorIndexes[i];
      key = selectorIndex.key;
      indexProto = selectorIndex.index;

      index = findByPrototype(indexes, indexProto);
      if (!index) {
        index = Object.create(indexProto);
        index.map = new Map();
        indexes.push(index);
      }

      if (indexProto === this.indexes['default']) {
        this.logDefaultIndexUsed(obj);
      }
      objs = index.map.get(key);
      if (!objs) {
        objs = [];
        index.map.set(key, objs);
      }
      objs.push(obj);
    }

    this.size++;
    selectors.push(selector);
  };

  // Public: Remove selector from set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.remove = function(selector, data) {
    if (typeof selector !== 'string') {
      return;
    }

    var selectorIndexes,
      selectorIndex,
      i,
      j,
      k,
      selIndex,
      objs,
      obj,
      indexes = this.activeIndexes,
      selectors = (this.selectors = []),
      selectorObjects = this.selectorObjects,
      removedIds = {},
      removeAll = arguments.length === 1;

    selectorIndexes = parseSelectorIndexes(this.indexes, selector);
    for (i = 0; i < selectorIndexes.length; i++) {
      selectorIndex = selectorIndexes[i];

      j = indexes.length;
      while (j--) {
        selIndex = indexes[j];
        if (selectorIndex.index.isPrototypeOf(selIndex)) {
          objs = selIndex.map.get(selectorIndex.key);
          if (objs) {
            k = objs.length;
            while (k--) {
              obj = objs[k];
              if (obj.selector === selector && (removeAll || obj.data === data)) {
                objs.splice(k, 1);
                removedIds[obj.id] = true;
              }
            }
          }
          break;
        }
      }
    }

    for (i in removedIds) {
      delete selectorObjects[i];
      this.size--;
    }

    for (i in selectorObjects) {
      selectors.push(selectorObjects[i].selector);
    }
  };

  // Sort by id property handler.
  //
  // a - Selector obj.
  // b - Selector obj.
  //
  // Returns Number.
  function sortById(a, b) {
    return a.id - b.id;
  }

  // Public: Find all matching decendants of the context element.
  //
  // context - An Element
  //
  // Returns Array of {selector, data, elements} matches.
  SelectorSet.prototype.queryAll = function(context) {
    if (!this.selectors.length) {
      return [];
    }

    var matches = {},
      results = [];
    var els = this.querySelectorAll(this.selectors.join(', '), context);

    var i, j, len, len2, el, m, match, obj;
    for (i = 0, len = els.length; i < len; i++) {
      el = els[i];
      m = this.matches(el);
      for (j = 0, len2 = m.length; j < len2; j++) {
        obj = m[j];
        if (!matches[obj.id]) {
          match = {
            id: obj.id,
            selector: obj.selector,
            data: obj.data,
            elements: []
          };
          matches[obj.id] = match;
          results.push(match);
        } else {
          match = matches[obj.id];
        }
        match.elements.push(el);
      }
    }

    return results.sort(sortById);
  };

  // Public: Match element against all selectors in set.
  //
  // el - An Element
  //
  // Returns Array of {selector, data} matches.
  SelectorSet.prototype.matches = function(el) {
    if (!el) {
      return [];
    }

    var i, j, k, len, len2, len3, index, keys, objs, obj, id;
    var indexes = this.activeIndexes,
      matchedIds = {},
      matches = [];

    for (i = 0, len = indexes.length; i < len; i++) {
      index = indexes[i];
      keys = index.element(el);
      if (keys) {
        for (j = 0, len2 = keys.length; j < len2; j++) {
          if ((objs = index.map.get(keys[j]))) {
            for (k = 0, len3 = objs.length; k < len3; k++) {
              obj = objs[k];
              id = obj.id;
              if (!matchedIds[id] && this.matchesSelector(el, obj.selector)) {
                matchedIds[id] = true;
                matches.push(obj);
              }
            }
          }
        }
      }
    }

    return matches.sort(sortById);
  };
  /**
   * Holds the SelectorSets for each event type
   * @type {{}}
   */
  const eventTypes = {};

  /**
   * Holds Bus event stacks
   * @type {{}}
   */
  const listeners = {};

  /**
   * Events that don't bubble
   * @type {string[]}
   */
  const nonBubblers = ['mouseenter', 'mouseleave'];

  /**
   * Make a bus stack if not already created.
   *
   * @param {string} event
   */
  function makeBusStack(event) {
      if (listeners[event] === undefined) {
          listeners[event] = [];
      }
  }

  /**
   * Trigger a bus stack.
   *
   * @param {string} event
   * @param args
   */
  function triggerBus(event, args) {
      if (listeners[event]) {
          for (let i = 0; i < listeners[event].length; i++) {
              listeners[event][i](...args);
          }
      }
  }

  /**
   * Maybe run querySelectorAll if input is a string.
   *
   * @param {HTMLElement|string} el
   * @returns {NodeListOf<Element>}
   */
  function maybeRunQuerySelector(el) {
      return typeof el === 'string' ? document.querySelectorAll(el) : el
  }

  /**
   * Handle delegated events
   *
   * @param {Event} e
   */
  function handleDelegation(e) {
      let matches = traverse(eventTypes[e.type], e.target);

      if (matches.length) {
          for (let i = 0; i < matches.length; i++) {
              for (let i2 = 0; i2 < matches[i].stack.length; i2++) {
                  if (nonBubblers.indexOf(e.type) !== -1) {
                      addDelegateTarget(e, matches[i].delegatedTarget);
                      if (e.target === matches[i].delegatedTarget) {
                          matches[i].stack[i2].data(e);
                      }
                  } else {
                      addDelegateTarget(e, matches[i].delegatedTarget);
                      matches[i].stack[i2].data(e);
                  }
              }
          }
      }
  }

  /**
   * Find a matching selector for delegation
   *
   * @param {SelectorSet} listeners
   * @param {HTMLElement|EventTarget} target
   * @returns {[]}
   */
  function traverse(listeners, target) {
      const queue = [];
      let node = target;

      do {
          if (node.nodeType !== 1) {
              break
          }

          const matches = listeners.matches(node);

          if (matches.length) {
              queue.push({delegatedTarget: node, stack: matches});
          }
      } while ((node = node.parentElement))

      return queue
  }

  /**
   * Add delegatedTarget attribute to dispatched delegated events
   *
   * @param {Event} event
   * @param {HTMLElement} delegatedTarget
   */
  function addDelegateTarget(event, delegatedTarget) {
      Object.defineProperty(event, 'currentTarget', {
          configurable: true,
          enumerable: true,
  		get: () => delegatedTarget
      });
  }

  /**
   * Creates a deep clone of an object.
   *
   * @param object
   * @returns {object|array}
   */
  function clone(object) {
  	return JSON.parse(JSON.stringify(object))
  }



  /**
   * Public API
   */
  class E {
      /**
       * Binds all provided methods to a provided context.
       *
       * @param {object} context
       * @param {array} [methods] Optional.
       */
      bindAll(context, methods) {
          if (methods === undefined) {
              methods = Object.getOwnPropertyNames(Object.getPrototypeOf(context));
          }

          for (let i = 0; i < methods.length; i++) {
              context[methods[i]] = context[methods[i]].bind(context);
          }
      }

      /**
  	 * Bind event to a string, NodeList, or element.
  	 *
  	 * @param {string} event
  	 * @param {string|NodeList|HTMLElement|Window|Document|array|function} el
  	 * @param {*} [callback]
  	 * @param {{}|boolean} [options]
  	 */
      on(event, el, callback, options) {
          if (typeof el === 'function' && callback === undefined) {
              makeBusStack(event);
              listeners[event].push(el);
              return
          }

          const events =  event.split(' ');

          for (let i = 0; i < events.length; i++) {
              if (el.nodeType && el.nodeType === 1 || el === window || el === document) {
                  el.addEventListener(events[i], callback, options);
                  continue
              }

              el = maybeRunQuerySelector(el);

              for (let n = 0; n < el.length; n++) {
                  el[n].addEventListener(events[i], callback, options);
              }
          }
      }

      /**
       * Add a delegated event.
       *
       * @param {string} event
       * @param {string|NodeList|HTMLElement} delegate
       * @param {*} [callback]
       */
      delegate(event, delegate, callback) {
          const events =  event.split(' ');

          for (let i = 0; i < events.length; i++) {
              let map = eventTypes[events[i]];

              if (map === undefined) {
                  map = new SelectorSet();
                  eventTypes[events[i]] = map;

                  if (nonBubblers.indexOf(events[i]) !== -1) {
                      document.addEventListener(events[i], handleDelegation, true);
                  } else {
                      document.addEventListener(events[i], handleDelegation);
                  }
              }

              map.add(delegate, callback);
          }
      }

      /**
       * Remove a callback from a DOM element, or one or all Bus events.
       *
       * @param {string} event
       * @param {string|NodeList|HTMLElement|window|Undefined} [el]
       * @param {*} [callback]
  	 * @param {{}|boolean} [options]
       */
      off(event, el, callback, options) {
          if (el === undefined) {
              listeners[event] = [];
              return
          }

          if (typeof el === 'function') {
              makeBusStack(event);

              for (let i = 0; i < listeners[event].length; i++) {
                  if (listeners[event][i] === el) {
                      listeners[event].splice(i, 1);
                  }
              }
              return
          }

          const events =  event.split(' ');

          for (let i = 0; i < events.length; i++) {
              const map = eventTypes[events[i]];

              if (map !== undefined) {
                  map.remove(el, callback);

                  if (map.size === 0) {
                      delete eventTypes[events[i]];
                      document.removeEventListener(events[i], handleDelegation);
                      continue
                  }
              }

              if (el.removeEventListener !== undefined) {
                  el.removeEventListener(events[i], callback, options);
                  continue
              }

              el = maybeRunQuerySelector(el);

              for (let n = 0; n < el.length;n++) {
                  el[n].removeEventListener(events[i], callback, options);
              }
          }
      }

      /**
       * Emit a DOM or Bus event.
       *
       * @param {string} event
       * @param {...*} [args]
       */
      emit(event, ...args) {
          triggerBus(event, args);
      }

      /**
       * Return a clone of the delegated event stack for debugging.
       *
       * @returns {{}}
       */
      debugDelegated() {
          return clone(eventTypes)
      }

      /**
       * Return a clone of the bus event stack for debugging.
       *
       * @returns {array}
       */
      debugBus() {
          return clone(listeners)
      }
  }

  /* harmony default export */ const src_E = (new E());
  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




  class Events {
    constructor(options = {}) {
      _defineProperty(this, "onRaf", () => {
        src_E.emit(Events.INTERNALRAF);
        if (this.options.disableRaf) return;
        requestAnimationFrame(this.onRaf);
      });

      this.options = options;
      this.addEvents();
    }

    addEvents() {
      if (!this.options.disableRaf) {
        requestAnimationFrame(this.onRaf);
      }

      if (!this.options.disableResize) {
        src_E.on('resize', window, debounce_default()(() => {
          this.onResize();
        }, 150));
      }

      this.onScroll();

      if ('ontouchstart' in document.documentElement) {
        (store_default()).isTouch = true; // touch has been detected in the browser, but let's check for a mouse input

        this.detectMouse();
      }
    }

    onScroll() {
      src_E.on('wheel', window, e => {
        src_E.emit(Events.WHEEL, {
          event: e
        });
      }, {
        passive: false
      });
      src_E.on('scroll', window, e => {
        src_E.emit(Events.INTERNALSCROLL, {
          event: e
        });
      }, {
        passive: true
      });
    }

    onResize({
      width,
      height
    } = {}) {
      (store_default()).window.w = width || window.innerWidth;
      (store_default()).window.h = height || window.innerHeight;
      src_E.emit(Events.RESIZE);
    }

    detectMouse() {
      window.addEventListener('mousemove', function detectMouse(e) {
        if (Math.abs(e.movementX) > 0 || Math.abs(e.movementY) > 0) {
          // mouse has moved on touch screen, not just a tap firing mousemove
          (store_default()).isTouch = false;
          src_E.emit(Events.MOUSEDETECTED);
          window.removeEventListener('mousemove', detectMouse);
        }
      });
    }

  }

  _defineProperty(Events, "INTERNALRAF", 'raf:internal');

  _defineProperty(Events, "EXTERNALRAF", 'raf:external');

  _defineProperty(Events, "WHEEL", 'wheel');

  _defineProperty(Events, "INTERNALSCROLL", 'scroll:internal');

  _defineProperty(Events, "EXTERNALSCROLL", 'scroll:external');

  _defineProperty(Events, "RESIZE", 'resize');

  _defineProperty(Events, "MOUSEDETECTED", 'mouseDetected');

  _defineProperty(Events, "SCROLLEND", 'scrollEnd');
  // EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom-collections.iterator.js
  var web_dom_collections_iterator = __webpack_require__(3948);
  function Scrollbar_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




  class Scrollbar {
    constructor(controller) {
      Scrollbar_defineProperty(this, "onMouseMove", e => {
        if (!this.mouseDown) return;
        this.mousePos = e.clientY;
        this.position -= this.prevMousePos - this.mousePos;
        this.position = Math.min(Math.max(this.position, 0), this.maxY);
        this.prevMousePos = this.mousePos;
        this.controller.targetPos = this.position / this.maxY * this.controller.maxScroll;
        this.controller.clamp();
        this.controller.syncScroll = true;
        this.transform();
        src_E.emit(Events.EXTERNALSCROLL, -this.controller.targetPos);
      });

      Scrollbar_defineProperty(this, "onMouseDown", e => {
        this.mousePos = this.prevMousePos = e.clientY;
        this.mouseDown = true;
        (store_default()).body.style.userSelect = 'none';
        this.el.classList.add('active');
      });

      Scrollbar_defineProperty(this, "onMouseUp", () => {
        this.mouseDown = false;
        store_default().body.style.removeProperty('user-select');
        this.el.classList.remove('active');
      });

      this.controller = controller;
      this.addHTML();
      this.el = document.querySelector(this.controller.options.scrollbarEl);
      this.handle = document.querySelector(this.controller.options.scrollbarHandleEl);
      this.position = 0;
      this.mousePos = 0;
      this.prevMousePos = 0;
      this.addStyles();
      this.addEvents();
    }

    transform() {
      let y;

      if (this.mouseDown) {
        y = this.position;
      } else {
        y = -this.controller.targetPos / -this.controller.maxScroll * ((store_default()).window.h - this.handleHeight);
        this.position = y;
      }

      this.handle.style.transform = "translate3d(0, ".concat(y, "px, 0)");
    }

    show() {
      this.el.classList.add('show');
    }

    hide() {
      this.el.classList.remove('show');
    }

    addEvents() {
      src_E.on('mousedown', this.handle, this.onMouseDown);
      src_E.on('mousemove', window, this.onMouseMove);
      src_E.on('mouseup', window, this.onMouseUp);
    }

    onResize() {
      this.scale = (-this.controller.maxScroll + (store_default()).window.h) / (store_default()).window.h;

      if (this.scale <= 1) {
        this.handle.style.height = 0;
        return;
      }

      this.trueSize = (store_default()).window.h / this.scale;
      this.handleHeight = Math.max(this.trueSize, 40);
      this.handle.style.height = "".concat(this.handleHeight, "px");
      this.maxY = (store_default()).window.h - this.handleHeight;
    }

    addHTML() {
      if (document.querySelector(this.controller.options.scrollbarEl)) return;
      const div = document.createElement('div');
      div.classList.add(this.controller.options.scrollbarEl.substring(1));
      div.innerHTML = "<div class=\"".concat(this.controller.options.scrollbarHandleEl.substring(1), "\"><div></div></div>");
      document.body.appendChild(div);
    }

    addStyles() {
      if (!this.controller.options.disableNativeScrollbar && !this.controller.options.scrollbarStyles) return;
      let styles = '';

      if (this.controller.options.disableNativeScrollbar) {
        styles += "html{scrollbar-width:none;}body{-ms-overflow-style:none;}body::-webkit-scrollbar{width:0;height:0;}";
      }

      if (this.controller.options.scrollbarStyles) {
        styles += "".concat(this.controller.options.scrollbarEl, " {position:fixed;top:0;right:0;width:20px;height:100%;z-index:900;}.is-touch ").concat(this.controller.options.scrollbarEl, " {display:none;}").concat(this.controller.options.scrollbarEl, " > div {padding:6px 0;width:10px;height:0;margin:0 auto;visibility:hidden;}").concat(this.controller.options.scrollbarEl, " > div > div {width:100%;height:100%;border-radius:10px;opacity:0.3;background-color:#000;}").concat(this.controller.options.scrollbarEl, " > div > div:hover {opacity:0.9;}").concat(this.controller.options.scrollbarEl, ":hover > div, ").concat(this.controller.options.scrollbarEl, ".show > div, ").concat(this.controller.options.scrollbarEl, ".active > div {visibility:visible;}").concat(this.controller.options.scrollbarEl, ".active > div > div {opacity:0.9;}");
      }

      const css = document.createElement('style');
      if (css.styleSheet) css.styleSheet.cssText = styles;else css.appendChild(document.createTextNode(styles));
      document.getElementsByTagName("head")[0].appendChild(css);
    }

    destroy() {
      src_E.off('mousedown', this.handle, this.onMouseDown);
      src_E.off('mousemove', window, this.onMouseMove);
      src_E.off('mouseup', window, this.onMouseUp);
    }

  }


  function Controller_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }





  class Controller {
    constructor(options = {}) {
      Controller_defineProperty(this, "onScroll", ({
        event
      }) => {
        if (!this.scrolling) {
          this.options.customScrollbar && this.scrollbar.show();
          this.toggleIframes();
          this.scrolling = true;
        }

        if (!(store_default()).isTouch && event.type === 'wheel') {
          event.preventDefault();
          this.syncScroll = true;
          this.targetPos += event.deltaY * -1;
        } else {
          if (this.preventResizeScroll) {
            this.preventResizeScroll = false;
            return;
          }

          if ((store_default()).isTouch && this.options.touchScrollType === 'scrollTop') {
            this.targetPos = this.horizontalScroll ? -this.containerElement.scrollLeft : -this.containerElement.scrollTop;
          } else {
            this.targetPos = -window.scrollY;
          }

          if ((store_default()).isTouch && this.options.touchScrollType !== 'transform') {
            this.currentPos = this.targetPos;
          }
        }

        this.clamp();
        this.options.customScrollbar && this.scrollbar.transform();
        src_E.emit(Events.EXTERNALSCROLL, -this.targetPos);
      });

      Controller_defineProperty(this, "onRAF", () => {
        if (this.testFps && this.options.limitLerpRate) {
          this.time = performance.now() * 0.001;
          this.delta = Math.min((this.time - this.startTime) * 60, 1);
          this.startTime = this.time;
        }

        if (!this.render) return;

        if (Math.abs(this.targetPos - this.currentPos) < 0.5) {
          this.currentPos = this.targetPos;

          if (this.scrolling && !this.syncScroll) {
            this.scrolling = false;
            this.options.customScrollbar && this.scrollbar.hide();
            this.toggleIframes(true);
            src_E.emit(Events.SCROLLEND, -this.targetPos);
          }

          if (this.syncScroll) {
            window.scrollTo(0, -this.targetPos);
            this.syncScroll = false;
          }
        } else {
          this.currentPos += (this.targetPos - this.currentPos) * this.ease * this.delta;
        }

        const x = this.horizontalScroll ? this.currentPos : 0;
        const y = this.horizontalScroll ? 0 : this.currentPos;
        this.applyTransform(x, y);
        src_E.emit(Events.EXTERNALRAF, {
          targetPos: -this.targetPos,
          currentPos: -this.currentPos
        });
      });

      Controller_defineProperty(this, "onResize", () => {
        if (this.scrollElementsLength > 1) {
          const lastTarget = this.scrollElements[this.scrollElementsLength - 1];
          const compStyle = window.getComputedStyle(lastTarget);
          const marginOffset = parseFloat(this.horizontalScroll ? compStyle.marginRight : compStyle.marginBottom);
          const bcr = lastTarget.getBoundingClientRect();
          const endPosition = this.horizontalScroll ? bcr.right : bcr.bottom;
          this.scrollLength = endPosition + marginOffset - this.currentPos;
        } else {
          this.scrollLength = this.horizontalScroll ? this.scrollElements[0].scrollWidth : this.scrollElements[0].scrollHeight;
        }

        const windowSize = this.horizontalScroll ? (store_default()).window.w : (store_default()).window.h;
        this.maxScroll = this.scrollLength > windowSize ? -(this.scrollLength - windowSize) : 0;
        this.clamp();

        if (!this.firstResize) {
          this.preventResizeScroll = true;
        }

        (store_default()).body.style.height = this.scrollLength + 'px';
        this.options.customScrollbar && this.scrollbar.onResize();
        this.firstResize = false;
      });

      Controller_defineProperty(this, "toggleFixedContainer", () => {
        this.containerElement.style.position = 'static';
        const scrollPos = this.currentPos;
        this.applyTransform(0, 0);
        requestAnimationFrame(() => {
          this.containerElement.style.position = 'fixed';
          const x = this.horizontalScroll ? scrollPos : 0;
          const y = this.horizontalScroll ? 0 : scrollPos;
          this.applyTransform(x, y);
        });
      });

      this.options = options;
      this.targetPos = this.currentPos = this.prevScrollPos = this.maxScroll = 0;
      this.enabled = false;
      this.render = false;
      this.scrolling = false;
      this.syncScroll = false;
      this.horizontalScroll = false;
      this.firstResize = true;
      this.preventResizeScroll = false;
      this.ease = (store_default()).isTouch ? this.options.touchEase : this.options.ease;
      this.originalScrollbarSetting = this.options.customScrollbar;
      this.testFps = true;
      this.delta = 1;
      this.time = this.startTime = performance.now();
      this.setElements();

      if ((store_default()).isTouch) {
        this.options.customScrollbar = false;

        if (this.options.touchScrollType === 'transform') {
          this.setupSmoothScroll();
        } else if (this.options.touchScrollType === 'scrollTop') {
          document.documentElement.classList.add('asscroll-touch');
          this.addTouchStyles();
          src_E.on('scroll', this.containerElement, e => {
            src_E.emit(Events.INTERNALSCROLL, {
              event: e
            });
          }, {
            passive: true
          });
        }
      } else {
        this.setupSmoothScroll();
      }

      this.addEvents();
    }

    setElements() {
      this.containerElement = typeof this.options.containerElement === 'string' ? document.querySelector(this.options.containerElement) : this.options.containerElement;

      if (this.containerElement === null) {
        console.error('ASScroll: could not find container element');
      }

      this.containerElement.setAttribute('asscroll-container', '');
      this.scrollElements = typeof this.options.scrollElements === 'string' ? document.querySelectorAll(this.options.scrollElements) : this.options.scrollElements;
      if (this.scrollElements.length) this.scrollElements = [...this.scrollElements];
      this.scrollElements = this.scrollElements.length ? this.scrollElements : [this.containerElement.firstElementChild];
      this.scrollElementsLength = this.scrollElements.length;
      this.scrollElements.forEach(el => el.setAttribute('asscroll', ''));
    }

    setupSmoothScroll() {
      Object.assign(this.containerElement.style, {
        position: 'fixed',
        top: '0px',
        left: '0px',
        width: '100%',
        height: '100%',
        contain: 'content'
      });

      if (this.options.customScrollbar) {
        this.scrollbar = new Scrollbar(this);
      }

      src_E.on(Events.INTERNALRAF, this.onRAF);
      src_E.on(Events.RESIZE, this.onResize);

      if (this.options.limitLerpRate) {
        setTimeout(() => {
          this.testFps = false;
          this.delta = Math.round(this.delta * 10) * 0.1;
        }, 2000);
      }
    }

    applyTransform(x, y) {
      for (let i = 0; i < this.scrollElementsLength; i++) {
        this.scrollElements[i].style.transform = "translate3d(".concat(x, "px, ").concat(y, "px, 0px)");
      }
    }

    enable({
      newScrollElements = false,
      reset = false,
      restore = false,
      horizontalScroll = false
    } = {}) {
      if (this.enabled) return;
      this.enabled = true;
      this.render = true;
      this.horizontalScroll = horizontalScroll;

      if (newScrollElements) {
        this.scrollElements = newScrollElements.length ? [...newScrollElements] : [newScrollElements];
        this.scrollElementsLength = this.scrollElements.length;
        this.scrollElements.forEach(el => el.setAttribute('asscroll', ''));
      }

      this.iframes = this.containerElement.querySelectorAll('iframe');

      if ((store_default()).isTouch && this.options.touchScrollType !== 'transform') {
        store_default().body.style.removeProperty('height');
        this.maxScroll = -this.containerElement.scrollHeight;

        if (reset) {
          this.targetPos = this.currentPos = 0;
          this.scrollTo(0, false);
        }
      } else {
        this.firstResize = true;

        if (reset) {
          this.targetPos = this.currentPos = 0;
          this.applyTransform(0, 0);
        }

        this.onResize();
      }

      if (restore) {
        this.scrollTo(this.prevScrollPos, false);
      }

      src_E.on(Events.WHEEL, this.onScroll);
      src_E.on(Events.INTERNALSCROLL, this.onScroll);
    }

    disable({
      inputOnly = false
    } = {}) {
      if (!this.enabled) return;
      this.enabled = false;

      if (!inputOnly) {
        this.render = false;
      }

      src_E.off(Events.WHEEL, this.onScroll);
      src_E.off(Events.INTERNALSCROLL, this.onScroll);
      this.prevScrollPos = this.targetPos;
      (store_default()).body.style.height = '0px';
    }

    clamp() {
      this.targetPos = Math.max(Math.min(this.targetPos, 0), this.maxScroll);
    }

    scrollTo(y, emitEvent = true) {
      this.targetPos = y;

      if ((store_default()).isTouch && this.options.touchScrollType !== 'transform') {
        if (this.horizontalScroll) {
          this.containerElement.scrollTo(-this.targetPos, 0);
        } else {
          this.containerElement.scrollTo(0, -this.targetPos);
        }
      }

      this.clamp();
      this.syncScroll = true;
      if (emitEvent) src_E.emit(Events.EXTERNALSCROLL, -this.targetPos);
    }

    toggleIframes(enable) {
      for (let i = 0; i < this.iframes.length; i++) {
        this.iframes[i].style.pointerEvents = enable ? 'auto' : 'none';
      }
    }

    blockScrollEvent(e) {
      e.stopPropagation();
    }

    addEvents() {
      // enable smooth scroll if mouse is detected
      src_E.on(Events.MOUSEDETECTED, () => {
        if (this.options.touchScrollType === 'transform') return;
        this.options.customScrollbar = this.originalScrollbarSetting;
        this.ease = this.options.ease;
        this.setupSmoothScroll();
        this.onResize();
      });

      if (!(store_default()).isTouch) {
        src_E.on('mouseleave', document, () => {
          window.scrollTo(0, -this.targetPos);
        });
        src_E.on('keydown', window, e => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown' || e.key === 'Home' || e.key === 'End' || e.key === 'Tab') {
            window.scrollTo(0, -this.targetPos);
          }

          if (e.key === 'Tab') {
            this.toggleFixedContainer();
          }
        });
        src_E.delegate('click', 'a[href^="#"]', this.toggleFixedContainer);
        src_E.delegate('wheel', this.options.blockScrollClass, this.blockScrollEvent);
      }
    }

    addTouchStyles() {
      const styles = ".asscroll-touch [asscroll-container] {position:absolute;top:0;left:0;right:0;bottom:-0.1px;overflow-y: auto;} .asscroll-touch [asscroll] {margin-bottom:0.1px;}";
      const css = document.createElement('style');
      if (css.styleSheet) css.styleSheet.cssText = styles;else css.appendChild(document.createTextNode(styles));
      document.getElementsByTagName("head")[0].appendChild(css);
    }

  }
  function src_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




  /**
  * Ash's Smooth Scroll ðŸ‘
  */

  class ASScroll {
    /**
    * Creates an ASScroll instance
    *
    * @typicalname asscroll
    * @param {object} [parameters]
    * @param {string|HTMLElement} [parameters.containerElement=[asscroll-container]] The selector string for the outer container element, or the element itself
    * @param {string|HTMLElement|NodeList} [parameters.scrollElements=[asscroll]] The selector string for the elements to scroll, or the elements themselves
    * @param {number} [parameters.ease=0.075] The ease amount for the transform lerp
    * @param {number} [parameters.touchEase=1] The ease amount for the transform lerp on touch devices
    * @param {string} [parameters.touchScrollType=none] Set the scrolling method on touch devices. Other options are 'transform' and 'scrollTop'. See the [Touch Devices](#touch-devices) section for more info
    * @param {string} [parameters.scrollbarEl=.asscrollbar] The selector string for the custom scrollbar element
    * @param {string} [parameters.scrollbarHandleEl=.asscrollbar__handle] The selector string for the custom scrollbar handle element
    * @param {boolean} [parameters.customScrollbar=true] Toggle the custom scrollbar
    * @param {boolean} [parameters.scrollbarStyles=true] Include the scrollbar CSS via Javascript
    * @param {boolean} [parameters.disableNativeScrollbar=true] Disable the native browser scrollbar
    * @param {boolean} [parameters.disableRaf=false] Disable internal requestAnimationFrame loop in order to use an external one
    * @param {boolean} [parameters.disableResize=false] Disable internal resize event on the window in order to use an external one
    * @param {boolean} [parameters.limitLerpRate=true] Match lerp speed on >60Hz displays to that of a 60Hz display
    * @param {string} [parameters.blockScrollClass=.asscroll-block] The class to add to elements that should block ASScroll when hovered
    */
    constructor(_parameters = {}) {
      src_defineProperty(this, "update", () => {
        this.events.onRaf();
      });

      src_defineProperty(this, "resize", parameters => {
        this.events.onResize(parameters);
      });

      const {
        containerElement = '[asscroll-container]',
        scrollElements = '[asscroll]',
        ease = 0.075,
        touchEase = 1,
        touchScrollType = 'none',
        scrollbarEl = '.asscrollbar',
        scrollbarHandleEl = '.asscrollbar__handle',
        customScrollbar = true,
        scrollbarStyles = true,
        disableNativeScrollbar = true,
        disableRaf = false,
        disableResize = false,
        limitLerpRate = true,
        blockScrollClass = '.asscroll-block'
      } = _parameters;
      this.events = new Events({
        disableRaf,
        disableResize
      });
      this.controller = new Controller({
        containerElement,
        scrollElements,
        ease,
        touchEase,
        customScrollbar,
        scrollbarEl,
        scrollbarHandleEl,
        scrollbarStyles,
        disableNativeScrollbar,
        touchScrollType,
        limitLerpRate,
        blockScrollClass
      });
    }
    /**
    * Enable ASScroll.
    *
    * @example <caption>Enables ASScroll on the '.page' element and resets the scroll position to 0</caption>
    * asscroll.enable({ newScrollElements: document.querySelector('.page'), reset: true })
    *
    * @example <caption>Enables ASScroll and restores to the previous position before ASScroll.disable() was called</caption>
    * asscroll.enable({ restore: true })
    *
    * @param {object} [parameters]
    * @param {boolean|NodeList|HTMLElement} [parameters.newScrollElements=false] Specify the new element(s) that should be scrolled
    * @param {boolean} [parameters.reset=false] Reset the scroll position to 0
    * @param {boolean} [parameters.restore=false] Restore the scroll position to where it was when disable() was called
    * @param {boolean} [parameters.horizontalScroll=false] Toggle horizontal scrolling
    */


    enable(parameters) {
      if (parameters !== undefined && typeof parameters !== 'object') {
        console.warn('ASScroll: Please pass an object with your parameters. Since 2.0');
      }

      this.controller.enable(parameters);
    }
    /**
    * Disable ASScroll.
    *
    * @example <caption>Disables the ability to manually scroll whilst still allowing position updates to be made via asscroll.currentPos, for example</caption>
    * asscroll.disable({ inputOnly: true })
    *
    * @param {object} [parameters]
    * @param {boolean} [parameters.inputOnly=false] Only disable the ability to manually scroll (still allow transforms)
    */


    disable(parameters) {
      if (parameters !== undefined && typeof parameters !== 'object') {
        console.warn('ASScroll: Please pass an object with your parameters. Since 2.0');
      }

      this.controller.disable(parameters);
    }
    /**
    * Call the internal animation frame request callback.
    * @function
    */


    /**
    * Add an event listener.
    *
    * @example <caption>Logs out the scroll position when the 'scroll' event is fired</caption>
    * asscroll.on('scroll', scrollPos => console.log(scrollPos))
    *
    * @example <caption>Returns the target scroll position and current scroll position during the internal update loop</caption>
    * asscroll.on('update', ({ targetPos, currentPos }) => console.log(targetPos, currentPos))
    *
    * @example <caption>Fires when the lerped scroll position has reached the target position</caption>
    * asscroll.on('scrollEnd', scrollPos => console.log(scrollPos))
    *
    * @param {string} eventName Name of the event you wish to listen for
    * @param {function} callback Callback function that should be executed when the event fires
    */
    on(eventName, callback) {
      if (typeof callback !== 'function') {
        console.error('ASScroll: Function not provided as second parameter');
        return;
      }

      if (eventName === 'scroll') {
        src_E.on(Events.EXTERNALSCROLL, callback);
        return;
      }

      if (eventName === 'update') {
        src_E.on(Events.EXTERNALRAF, callback);
        return;
      }

      if (eventName === 'scrollEnd') {
        src_E.on(Events.SCROLLEND, callback);
        return;
      }

      console.warn("ASScroll: \"".concat(eventName, "\" is not a valid event"));
    }
    /**
    * Remove an event listener.
    * @param {string} eventName Name of the event
    * @param {function} callback Callback function
    */


    off(eventName, callback) {
      if (typeof callback !== 'function') {
        console.error('ASScroll: Function not provided as second parameter');
        return;
      }

      if (eventName === 'scroll') {
        src_E.off(Events.EXTERNALSCROLL, callback);
        return;
      }

      if (eventName === 'update') {
        src_E.off(Events.EXTERNALRAF, callback);
        return;
      }

      if (eventName === 'scrollEnd') {
        src_E.off(Events.SCROLLEND, callback);
        return;
      }

      console.warn("ASScroll: \"".concat(eventName, "\" is not a valid event"));
    }
    /**
    * Scroll to a given position on the page.
    * @param {number} targetPos Target scroll position
    * @param {boolean} [emitEvent=true] Whether to emit the external scroll events or not
    */


    scrollTo(targetPos, emitEvent = true) {
      this.controller.scrollTo(-targetPos, emitEvent);
    }
    /**
    * Returns the target scroll position.
    *
    * @return {number} Target scroll position
    */


    get targetPos() {
      return -this.controller.targetPos;
    }
    /**
    * Gets or sets the current scroll position.
    *
    * @example <caption>Sets the scroll position to 200, bypassing any lerps</caption>
    * asscroll.currentPos = 200
    *
    * @param {number} scrollPos The desired scroll position
    * @return {number} Current scroll position
    */


    get currentPos() {
      return -this.controller.currentPos;
    }

    set currentPos(scrollPos) {
      this.controller.targetPos = this.controller.currentPos = -scrollPos;
    }
    /**
    * Returns the maximum scroll height of the page.
    * @return {number} Maxmium scroll height
    */


    get maxScroll() {
      return -this.controller.maxScroll;
    }
    /**
     * Returns the outer element that ASScroll is attached to.
     * @return {HTMLElement} The outer element
     */


    get containerElement() {
      return this.controller.containerElement;
    }
    /**
     * Returns the the element(s) that ASScroll is scrolling.
     * @return {Array} An array of elements ASScroll is scrolling
     */


    get scrollElements() {
      return this.controller.scrollElements;
    }
    /**
     * Returns whether or not ASScroll is in horizontal scroll mode
     * @return {boolean} The status of horizontal scroll
     */


    get isHorizontal() {
      return this.controller.horizontalScroll;
    }
    /**
     * @deprecated since 2.0.0 - use targetPos instead
     * @see {@link ASScroll#targetPos}
     */


    get scrollPos() {}
    /**
     * @deprecated since 2.0.0 - use currentPos instead
     * @see {@link ASScroll#currentPos}
     */


    get smoothScrollPos() {}
    /**
     * @deprecated since 2.0.0 - use update() instead
     * @see {@link ASScroll#update}
     */


    onRaf() {}
    /**
     * @deprecated since 2.0.0 - use resize() instead
     * @see {@link ASScroll#resize}
     */


    onResize() {}

  }

  /* harmony default export */ const src = (ASScroll);
  })();

  __webpack_exports__ = __webpack_exports__.default;
  /******/ 	return __webpack_exports__;
  /******/ })()
  ;
  });
  });

  var ASScroll = unwrapExports(asscroll);

  gsapWithCSS.registerPlugin(ScrollTrigger, SplitText, CustomEase, DrawSVGPlugin);
  CustomEase.create("cubic", "0.85, 0, 0.15, 1");
  CustomEase.create("quart", "0.76, 0, 0.24, 1");
  CustomEase.create("cubicOut", "0.33, 1, 0.68, 1");
  CustomEase.create("circ", "0.85, 0, 0.15, 1");
  CustomEase.create("shoot", "0.85, 0, 0.15, 1.32");
  gsapWithCSS.config({
    force3D: true,
    nullTargetWarn: false
  });
  var asscroll$1 = new ASScroll({
    disableResize: false,
    ease: 0.085,
    disableRaf: true,
    customScrollbar: false,
    touchScrollType: 'none'
  });

  if ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
    var element = document.getElementById("asscroll");
    var element2 = document.getElementById("asscroll-wrap");
    element.classList.add("touch");
    element2.classList.add("touch");
  } else {
    scrollProxy();
    asscroll$1.enable();
  }

  function scrollProxy() {
    if ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
      var element = document.getElementById("asscroll");
      var element2 = document.getElementById("asscroll-wrap");
      element.classList.add("touch");
      element2.classList.add("touch");
    }

    gsapWithCSS.ticker.add(asscroll$1.update);
    ScrollTrigger.defaults({
      scroller: '.inner'
    });
    ScrollTrigger.scrollerProxy('.inner', {
      scrollTop: function scrollTop(value) {
        return arguments.length ? asscroll$1.currentPos = value : asscroll$1.currentPos;
      },
      getBoundingClientRect: function getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      }
    });
    asscroll$1.on("update", ScrollTrigger.update);
    ScrollTrigger.addEventListener("refresh", asscroll$1.resize);
  }

  window.mobileAndTabletCheck = function () {
    var check = false;

    (function (a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);

    return check;
  };

  function blocks() {
    (function ($) {

      $(document).ready(function () {
        gsapWithCSS.set('.content', {
          x: 0
        });

        if ($('.hero__blink').length) {
          var eye = $('.hero__blink');
          eye.each(function () {
            var blink = gsapWithCSS.timeline({
              delay: 5,
              repeat: -1,
              repeatDelay: 3
            }),
                block = $(this);
            blink.to(block, {
              autoAlpha: 1,
              ease: 'none',
              duration: 0.01
            }).to(block, {
              autoAlpha: 0,
              ease: 'none',
              duration: 0.01
            }, 0.2).to(block, {
              autoAlpha: 1,
              ease: 'none',
              duration: 0.01
            }, 7).to(block, {
              autoAlpha: 0,
              ease: 'none',
              duration: 0.01
            }, 7.2).to(block, {
              autoAlpha: 1,
              ease: 'none',
              duration: 0.01
            }, 12.5).to(block, {
              autoAlpha: 0,
              ease: 'none',
              duration: 0.01
            }, 12.7).to(block, {
              autoAlpha: 1,
              ease: 'none',
              duration: 0.01
            }, 13).to(block, {
              autoAlpha: 0,
              ease: 'none',
              duration: 0.01
            }, 13.2);
          });
        }

        if ($('.px').length) {
          $('.px').each(function () {
            var block = $(this),
                dist = 22;

            if (block.hasClass('px--up')) {
              dist = -18;
            }

            gsapWithCSS.to(block, {
              scrollTrigger: {
                start: 5,
                trigger: block,
                scrub: true
              },
              yPercent: dist,
              z: 0.01,
              ease: "none"
            });
          });
        }

        if ($('.autoplay').length) {
          $('.autoplay').each(function () {
            var block = $(this),
                video = $(this).get()[0];
            ScrollTrigger.create({
              trigger: block,
              start: 'top 110%',
              end: 'bottom 0%',
              onEnter: function onEnter() {
                return video.play();
              },
              onEnterBack: function onEnterBack() {
                return video.play();
              },
              onLeave: function onLeave() {
                return video.pause();
              },
              onLeaveBack: function onLeaveBack() {
                return video.pause();
              }
            });
          });
        }

        if ($('.video-holder').length) {
          $('.video-holder').each(function () {
            var block = $(this),
                rotate = gsapWithCSS.timeline({
              scrollTrigger: {
                trigger: block,
                scrub: 0.2,
                start: 'top 100%',
                end: 'bottom 10%'
              }
            }).to(block, {
              rotation: 10,
              z: 0.01,
              duration: 50,
              ease: 'none'
            });
          });
        }

        if ($('.bios').length) {
          var img = $('.bio .img-wrap'),
              i = 1,
              r = 14;
          img.each(function () {
            if (i % 2 == 0) {
              r = -10;
            }

            var block = $(this),
                rotate = gsapWithCSS.timeline({
              scrollTrigger: {
                trigger: block,
                scrub: 0.2,
                start: 'top 100%',
                end: 'bottom 10%'
              }
            }).to(block, {
              rotation: r,
              z: 0.01,
              duration: 50,
              ease: 'none'
            });
            i++;
          });
        }
      });
    })(jQuery);
  }

  function lightbox() {
    (function ($) {

      $(document).ready(function () {
        if ($('.video-holder').length) {
          if ($('.lightbox').length) {
            $('.lightbox').remove();
          }

          $('body').prepend('<div class="lightbox"><svg version="1.1" class="exit" id="Group_2622" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 96 96" style="enable-background:new 0 0 96 96;" xml:space="preserve"><style type="text/css">.st0{fill:#FFFFFF;}</style><g id="Layer_2_1_"><g id="Layer_1-2"><circle cx="48" cy="48" r="48"/><path class="st0" d="M55.5,62.6l7.1,0L51.4,47c4.9-1.6,8.4-6.4,8.4-13.6l-9.2,0l1.3,11.4l-2,0l-8.2-11.3l-7.1,0l11,15.3 c-5.3,1.3-9.2,6.2-9.2,13.8l9.2,0l-1.3-11.4l3,0L55.5,62.6z"/></g></g></svg><div class="lightbox__top lightbox-bar"></div><div class="lightbox__content"></div><div class="lightbox__bottom lightbox-bar"></div></div>');
          $('.video-holder').each(function () {
            var src = $(this).attr('data-src'),
                sub = src.split("embed/"),
                id = sub[1].split("/"),
                vidID = id[0],
                play = $(this).find('.play'),
                lightbox = $('.lightbox'),
                lightboxBars = $('.lightbox-bar'),
                lightboxVideo = lightbox.find('.lightbox__content'),
                lightboxTl = gsapWithCSS.timeline({
              paused: true,
              onReverseComplete: function onReverseComplete() {
                lightboxTl.pause(0);
              }
            }); // gsap.set(lightbox, {
            //   pointerEvents: 'none',
            // })

            lightboxTl.to(lightbox, {
              autoAlpha: 1,
              duration: 0.6,
              ease: 'cubic.out' // pointerEvents: 'all',

            }, 0).to(lightboxBars, {
              scaleY: 0,
              ease: 'cubic',
              duration: 0.7
            }, 0.5).to(lightbox, {
              pointerEvents: 'all'
            }, 0.5);
            lightboxVideo.append('<iframe class="sproutvideo-player" src="' + src + '?playsinline=false&background=true" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen"></iframe>');
            var player = new SV.Player({
              videoId: vidID
            });
            player.bind('ready', function (e) {// player.setVolume(1);
            });
            play.on('click', function () {
              lightboxTl.play(0);
              player.seek(0);
              player.play();
            });
            lightbox.on('click', function () {
              // lightboxTl.timeScale(1.5).reverse();
              player.pause();
            });
            player.bind('pause', function (e) {
              lightboxTl.timeScale(1.5).reverse();
            });
          });

          if (!('ontouchstart' in window) || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
            var cursorUpdate = function cursorUpdate(e) {
              var x = e.clientX;
              var y = e.clientY;
              gsapWithCSS.to(cursorMove, {
                x: x,
                y: y,
                z: 0.01,
                duration: 0.3
              });
            };

            var cursorMove = $(".exit"),
                cursorIn = gsapWithCSS.timeline({
              paused: true
            });
            gsapWithCSS.set(cursorMove, {
              xPercent: -120,
              yPercent: -100,
              autoAlpha: 0,
              scale: 0,
              rotation: 90,
              transformOrigin: 'center'
            });
            cursorIn.to(cursorMove, {
              delay: 0.4,
              autoAlpha: 1,
              scale: 1,
              xPercent: -50,
              yPercent: -50,
              rotation: -30,
              duration: 0.7,
              ease: "circ"
            });
            $('.play').on('click', function () {
              if (!cursorIn.isActive()) {
                cursorIn.timeScale(1).play();
              }
            });
            $('.lightbox').on('click', function () {
              if (!cursorIn.isActive()) {
                cursorIn.timeScale(1.8).reverse();
              }
            });
            $(window).on('mousemove', cursorUpdate);
            $(window).resize(cursorUpdate);
          }
        }
      });
    })(jQuery);
  }

  function printMousePos(e) {
    (function ($) {

      var offset = $('.inner').offset(),
          cursorX = e.pageX - offset.left,
          cursorY = e.clientY;
      document.body.setAttribute('data-x', cursorX);
      document.body.setAttribute('data-y', cursorY);
    })(jQuery);
  }

  document.addEventListener('click', printMousePos, true);

  function mq() {
    (function ($) {

      $(document).ready(function () {
        if ($('.mq').length) {
          // function mqInit() {
          var m = 1;
          $('.mq').each(function () {
            var w = $(this).outerWidth();
            var block = $(this);
            var marquees = $(this).find(".mq__item");
            var s = $(this).attr('data-speed') * 10;
            var dir = '-=';
            var mw = marquees.outerWidth();
            var mp = marquees.parent();
            var ow = $(this).outerWidth();
            var mqtl = gsapWithCSS.timeline({// scrollTrigger:{
              //   trigger: block,
              //   start: 'top 95%',
              //   end: "bottom top",
              //   toggleActions: "play pause resume reset"
              // }
            });

            if ($(this).hasClass('mq--work')) {
              if (m % 2 == 0) {
                dir = '+=';
              }

              m++;
            }

            var nclone = Math.floor(w / mw) + 3;
            var inner = mp.html();
            mp.css("width", nclone * mw + "px");

            for (var i = 0; i < nclone; i++) {
              inner += mp.html();
            }

            mp.html(inner);
            mqtl.to(mp, {
              duration: s,
              // z: 0.01,
              rotate: 0.01,
              repeat: -1,
              x: dir + mw,
              modifiers: {
                x: function x(_x) {
                  return gsapWithCSS.utils.wrap(-mw, 0, parseFloat(_x)) + "px";
                }
              },
              ease: 'linear'
            });
            $(this).on('click', function () {
              mqtl.pause();
            });
            $(this).on('mouseenter', function () {
              gsapWithCSS.to(mqtl, {
                timeScale: 0.01
              });
            });
            $(this).on('mouseleave', function () {
              gsapWithCSS.to(mqtl, {
                timeScale: 1
              });
            });
          }); // }
        } // 
        // if ($('.hero--contact').length ) {
        //   var splitParent = new SplitText('.hero--contact h1', {type:'lines', linesClass: "bl"}),
        //   splitTitle = new SplitText(splitParent.lines, {type:'lines', linesClass: "lines" });
        //
        //
        //
        // }

      });
    })(jQuery);
  }

  function next() {
    (function ($) {

      $(document).ready(function () {
        if ($('.next-up').length) {
          var svg = $('.next-up .next-svg'),
              svgClass = $('.next-up .cls-1'),
              n = svg.find('.n-mask'),
              e = svg.find('.e-mask'),
              x = svg.find('.x-mask'),
              t = svg.find('.t-mask'),
              img = $('.next-up .img-wrap'),
              nextTl = gsapWithCSS.timeline({
            scrollTrigger: {
              trigger: '.next-up',
              start: 'top 40%'
            }
          });

          if (img.css('position') == 'absolute') {
            gsapWithCSS.set(img, {
              y: 20
            });
          }

          nextTl.to(n, {
            y: 0,
            webkitClipPath: 'circle(145% at 0% 0%)',
            duration: 0.78,
            ease: 'cubic.out'
          }, 0).to(e, {
            y: 0,
            webkitClipPath: 'circle(145% at 50% 100%)',
            duration: 0.7,
            ease: 'cubic.out'
          }, 0.08).to(x, {
            y: 0,
            webkitClipPath: 'circle(145% at 0% 0%)',
            duration: 0.85,
            ease: 'cubic.out'
          }, 0.2).to(t, {
            y: 0,
            webkitClipPath: 'circle(145% at 100% 0%)',
            duration: 0.78,
            ease: 'cubic.out'
          }, 0.3);

          if (img.css('position') == 'absolute') {
            nextTl.to(img, {
              autoAlpha: 1,
              y: 0
            }, 0.3);
          }
        }
      });
    })(jQuery);
  }

  function worktext() {
    (function ($) {

      $(document).ready(function () {
        if ($('.work-svg').length) {
          var svg = $('.work-svg'),
              svgClass = $('.work-svg .cls-1'),
              w = svg.find('.w-mask'),
              o = svg.find('.o-mask'),
              r = svg.find('.r-mask'),
              k = svg.find('.k-mask'),
              workTl = gsapWithCSS.timeline({
            scrollTrigger: {
              trigger: '.featured-work',
              start: 'top 90%'
            }
          });
          workTl.to(w, {
            y: 0,
            webkitClipPath: 'circle(145% at 0% 0%)',
            clipPath: 'circle(145% at 0% 0%)',
            duration: 0.98,
            ease: 'cubic.out'
          }, 0).to(o, {
            y: 0,
            webkitClipPath: 'circle(145% at 50% 100%)',
            clipPath: 'circle(145% at 50% 100%)',
            duration: 0.9,
            ease: 'cubic.out'
          }, 0.08).to(r, {
            y: 0,
            webkitClipPath: 'circle(145% at 0% 0%)',
            clipPath: 'circle(145% at 0% 0%)',
            duration: 0.95,
            ease: 'cubic.out'
          }, 0.2).to(k, {
            y: 0,
            webkitClipPath: 'circle(145% at 100% 0%)',
            clipPath: 'circle(145% at 100% 0%)',
            duration: 0.98,
            ease: 'cubic.out'
          }, 0.3);
        }
      });
    })(jQuery);
  }

  function work() {
    (function ($) {

      $(document).ready(function () {
        if ($('.featured-work').length) {
          var block = $('.featured-work'),
              item = block.find('.card, .feature-list__item');
          item.on('click', function () {
            $(this).addClass('project-leave');
            $(this).trigger('mouseleave');
          });
          item.each(function () {
            var block = $(this),
                cats = block.find('.cats'),
                catsSpan = block.find('.cats span'),
                xLeft = 35;

            if (cats.css('left') == '0px' && cats.css('right') != '0px') {
              xLeft = -35;
            }

            gsapWithCSS.set(cats, {
              autoAlpha: 0
            });
            gsapWithCSS.set(catsSpan, {
              autoAlpha: 0
            });
            var cardTL = gsapWithCSS.timeline({
              scrollTrigger: {
                trigger: block,
                start: 'top 115%'
              }
            }).to(cats, {
              autoAlpha: 1,
              delay: 0.4,
              x: xLeft,
              ease: 'shoot',
              duration: 0.9
            }, 0).to(catsSpan, {
              autoAlpha: 1,
              x: 0,
              ease: 'cubic',
              duration: 0.6
            }, 0.2);
          });
        }

        if ($('.feature-list').length) {
          var card = $('.post-wrap .card-container:not(.post-wrap .card-container:nth-of-type(1))'),
              listItem = $('.feature-list .feature-list__item'),
              listItemTitle = $('.feature-list .feature-list__item h2, .feature-list .feature-list__item span'),
              allCards = $('.post-wrap .card-container'),
              featured = $('.post-wrap .card-container:nth-of-type(1)'),
              title = $('.featured-work .featured-work__title'),
              proTitle = $('.featured-work .card-container h2, .featured-work .card-container p'),
              card = $('.featured-work .card-container');
          card.each(function () {
            var block = $(this),
                img = block.find('.img-container img'),
                imgC = block.find('.img-container'),
                imgMask = gsapWithCSS.timeline({
              scrollTrigger: {
                trigger: block,
                start: "top 100%"
              }
            });
            gsapWithCSS.set(img, {
              xPercent: 100 // rotation: 5,

            });
            gsapWithCSS.set(imgC, {
              xPercent: -100 // rotation: 5,

            });
            imgMask.to(img, {
              //  rotation: 0,
              duration: 1,
              xPercent: 0,
              ease: "power4.out",
              willChange: "transform"
            }, 0).to(imgC, {
              //  rotation: 0,
              duration: 1,
              xPercent: 0,
              ease: "power4.out",
              willChange: "transform",
              onComplete: function onComplete() {
                block.addClass('trans');
                gsapWithCSS.set(img, {
                  clearProps: 'all'
                });
                gsapWithCSS.set(imgC, {
                  clearProps: 'all'
                });
              }
            }, 0);
          });
          var splitLines = listItemTitle,
              title = splitLines,
              splitParent = new SplitText(title, {
            type: 'lines',
            linesClass: "bl"
          }),
              splitTitle = new SplitText(splitParent.lines, {
            type: 'lines',
            linesClass: "lines"
          });
          gsapWithCSS.set(splitLines, {
            visibility: 'visible'
          }); // if ($('.hero--contact').length) {
          //   let block = $(this),
          //   lines = block.find('.lines');
          //
          //   gsap.set(lines, {
          //     yPercent: 100,
          //   })
          //
          //   let linesTl = gsap.timeline({
          //     scrollTrigger:{
          //       trigger: lines,
          //       start: "top 125%",
          //     }
          //   })
          //   .to(lines, {
          //     autoAlpha: 0.999,
          //     yPercent: 0,
          //     z: 0.01,
          //     duration: 0.8,
          //     stagger: 0.1,
          //     ease: 'cubic',
          //     willChange: 'transform',
          //     onComplete: function() {
          //       gsap.set(lines, {
          //         clearProps: 'all',
          //       })
          //     }
          //   })
          // }

          listItem.each(function () {
            var block = $(this),
                lines = block.find('h2 .lines'),
                pLines = block.find('p .lines');
            gsapWithCSS.set(lines, {
              yPercent: 100,
              autoAlpha: 0.01
            });
            gsapWithCSS.set(pLines, {
              yPercent: 100,
              autoAlpha: 0.01
            });
            var linesTl = gsapWithCSS.timeline({
              scrollTrigger: {
                trigger: lines,
                start: "top 125%"
              }
            }).to(lines, {
              autoAlpha: 0.999,
              yPercent: 0,
              z: 0.01,
              duration: 1.2,
              stagger: 0.3,
              ease: 'cubic',
              willChange: 'transform',
              onComplete: function onComplete() {
                gsapWithCSS.set(lines, {
                  clearProps: 'all'
                });
              }
            });
            var pTl = gsapWithCSS.timeline({
              scrollTrigger: {
                trigger: pLines,
                start: "top 125%"
              }
            }).to(pLines, {
              autoAlpha: 0.999,
              yPercent: 0,
              duration: 1.1,
              stagger: 0.1,
              z: 0.01,
              ease: 'cubic',
              willChange: 'transform',
              onComplete: function onComplete() {
                gsapWithCSS.set(pLines, {
                  clearProps: 'all'
                });
              }
            });
          });
        }

        if ($('.case-study__content').length) {
          var content = $('.case-study__content div');
          gsapWithCSS.set(content, {
            autoAlpha: 0,
            y: 10,
            delay: 0.5
          });
          content.each(function () {
            var block = $(this),
                contentTL = gsapWithCSS.timeline({
              scrollTrigger: {
                trigger: block,
                start: 'top 110%'
              }
            }).to(block, {
              autoAlpha: 1,
              y: 0
            });
          });
        }

        if ($('.work-list, .next-up').length) {
          var block = $('.work-list'),
              title = block.find('.work__title'),
              item = block.find('.work-list__item, .project-list');
          item.on('click', function () {
            $(this).addClass('project-to');
            $(this).trigger('mouseleave');
          });
          title.each(function () {
            var block = $(this),
                tl = gsapWithCSS.timeline(),
                ltl = gsapWithCSS.timeline();
          });

          if (window.mobileAndTabletCheck() == false) {
            $('.work-list__item, .next-up .next-svg, .project-list').each(function () {
              var imgMove = $(this).find('.img-wrap'),
                  block = $(this),
                  imgWidth = imgMove.outerWidth(),
                  innerHeight = $('.work-list').outerHeight(),
                  vHeight = $(window).height(),
                  imgHeight = imgMove.outerHeight(),
                  imgIn = gsapWithCSS.timeline({
                paused: true
              });

              if ($('.next-up').length) {
                imgMove = $(this).parent().find('.img-wrap');
              }

              gsapWithCSS.set(imgMove, {
                xPercent: -100,
                autoAlpha: 0,
                scale: 1,
                rotation: 6,
                transformOrigin: 'top right'
              });
              imgIn.to(imgMove, {
                autoAlpha: 1,
                duration: 0.2
              });
              $(this).one('mouseenter', function (e) {
                imgSet(e);
              });
              $(this).on('mouseenter', function (e) {
                if (!$('.next-up').length) {
                  if (!imgIn.isActive()) {
                    imgIn.play().delay(0.02);
                  }
                } else {
                  imgIn.play().delay(0.02);
                }
              });
              $(this).on('mouseleave', function () {
                imgIn.delay(0).reverse();
              });
              $(this).on('click', function () {
                $(this).trigger('mouseleave');
              });

              function imgUpdate(e) {
                var offset = $('.inner').offset();
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
                var vX = e.pageX;
                var vY = e.pageY;
                var clientX = e.clientX;
                var docWidth = $(document).outerWidth();
                var docPos = Math.round(clientX / docWidth * 100);
                var p = 50 - docPos;
                gsapWithCSS.to(imgMove, {
                  xPercent: -docPos,
                  x: x,
                  y: y,
                  z: 0.01,
                  rotation: p / 6,
                  duration: 0.65,
                  ease: 'cubic.Out'
                });
              }

              function imgSet(e) {
                var offset = $('.inner').offset();
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
                var clientX = e.clientX;
                var docWidth = $(document).outerWidth();
                var docPos = Math.round(clientX / docWidth * 100);
                var p = 50 - docPos;
                gsapWithCSS.set(imgMove, {
                  xPercent: -docPos,
                  x: x,
                  y: y,
                  z: 0.01,
                  rotation: p / 6,
                  onComplete: function onComplete() {
                    $(window).on('mousemove', imgUpdate);
                  }
                });
              }

              $(window).resize(imgUpdate);
            });
          }
        }
      });
    })(jQuery);
  }

  function componentScripts() {
    blocks();
    work();
    next();
    lightbox();
    worktext();
  } // run this only one time
  // it's applied along your application lifecycle


  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  ct.hooks.after(function (data) {
    header();

    if ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
      var element = document.getElementById("asscroll");
      var element2 = document.getElementById("asscroll-wrap");
      element.classList.add("touch");
      element2.classList.add("touch");
    } else {
      asscroll$1.enable({
        newScrollElements: data.next.container.querySelector('.inner'),
        reset: true
      });
      scrollProxy();
    }
  });
  ct.hooks.beforeLeave(function (data) {
    asscroll$1.disable();
  });
  ct.hooks.enter(function (data) {
    if (data.next.container.querySelector('.mq')) {
      mq();
    }

    if ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
      window.scrollTo(0, 0);
    }
  });
  header();
  ct.hooks.after(function (data) {
    // if (!data.next.container.querySelector('.mq')){
    var Alltrigger = ScrollTrigger.getAll();

    for (var i = 0; i < Alltrigger.length; i++) {
      Alltrigger[i].kill(true);
    }

    textAnims();
    runScripts(); // }
  });
  textAnims();
  runScripts();
  header();
  mq();
  ct.init({
    debug: true,
    preventRunning: true,
    transitions: [{
      sync: true,
      name: 'mask',
      beforeLeave: function beforeLeave(data) {
        var content = data.next.container.querySelectorAll('.content'),
            homeHeader = document.querySelectorAll('.hero--home h1, .hero--home .shape--ab'),
            aboutHeader = document.querySelectorAll('.hero--about h1');

        if (data.next.container.querySelector('.fu')) {
          gsapWithCSS.fromTo('.fu', {
            autoAlpha: 0,
            y: 60
          }, {
            delay: 0.7,
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: 'cubicOut'
          });
        }

        if (data.next.container.querySelector('.hero--home')) {
          // alert('to home');
          if (!('ontouchstart' in window) || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
            gsapWithCSS.set(homeHeader, {
              x: '28vw',
              zIndex: -1,
              willChange: 'transform'
            });
            gsapWithCSS.to(homeHeader, {
              x: 0,
              duration: 1,
              ease: 'cubic',
              onComplete: function onComplete() {
                gsapWithCSS.set(homeHeader, {
                  clearProps: 'all'
                });
              }
            });
          }
        }

        if (data.current.container.querySelector('.hero--home')) {
          // alert('from home');
          if (!('ontouchstart' in window) || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
            gsapWithCSS.set(homeHeader, {
              x: '0vw',
              zIndex: -1,
              willChange: 'transform'
            });
            gsapWithCSS.to(homeHeader, {
              x: '28vw',
              duration: 1,
              ease: 'cubic',
              onComplete: function onComplete() {
                gsapWithCSS.set(homeHeader, {
                  clearProps: 'all'
                });
              }
            });
          }
        }

        if (data.next.container.querySelector('.hero--about')) {
          // alert('to about');
          var element = data.next.container.querySelector('.hero--about h1'),
              style = getComputedStyle(element),
              margin = style.marginLeft,
              reserve = 0;

          if (!('ontouchstart' in window) || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
            if (margin == '0px') {
              reserve = '28vw';
              gsapWithCSS.set(aboutHeader, {
                x: reserve,
                zIndex: -1,
                willChange: 'transform'
              });
            } else {
              gsapWithCSS.set(aboutHeader, {
                marginLeft: 0,
                zIndex: -1,
                willChange: 'transform'
              });
            }

            gsapWithCSS.to(aboutHeader, {
              x: margin,
              duration: 1,
              ease: 'cubic',
              onComplete: function onComplete() {
                gsapWithCSS.set(aboutHeader, {
                  clearProps: 'all'
                });
              }
            });
          }
        }

        if (data.next.container.querySelector('.hero--contact')) {
          gsapWithCSS.fromTo('.hero--contact h1', {
            y: 30
          }, {
            willChange: 'transform',
            delay: 0.5,
            y: 0,
            duration: 0.5,
            ease: 'cubicOut'
          });
        }

        if (data.current.container.querySelector('.hero--about')) {
          // alert('from about');
          var element = data.current.container.querySelector('.hero--about h1'),
              style = getComputedStyle(element),
              margin = style.marginLeft,
              reserve = '0vw';

          if (!('ontouchstart' in window) || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
            if (margin == '0px') {
              reserve = '28vw';
            }

            gsapWithCSS.set(aboutHeader, {
              x: margin,
              marginLeft: '0',
              zIndex: -1,
              willChange: 'transform'
            });
            gsapWithCSS.to(aboutHeader, {
              x: reserve,
              duration: 1,
              ease: 'cubic',
              onComplete: function onComplete() {
                gsapWithCSS.set(aboutHeader, {
                  clearProps: 'all'
                });
              }
            });
          }
        }

        gsapWithCSS.to('body', {
          height: '100%',
          // overflow: 'hidden',
          pointerEvents: 'none'
        }); // gsap.set(content, {
        //   x: 100,
        // })
      },
      leave: function leave(data) {
        var leaveTl = gsapWithCSS.timeline(),
            maskX = document.body.getAttribute('data-x'),
            maskY = document.body.getAttribute('data-y');
        return leaveTl.set(data.current.container, {
          opacity: 1,
          position: 'fixed',
          width: '100%',
          top: '0',
          left: '0',
          zIndex: '0'
        }).set(data.next.container, {
          webkitClipPath: 'circle(0% at ' + maskX + 'px ' + maskY + 'px)',
          clipPath: 'circle(0% at ' + maskX + 'px ' + maskY + 'px)',
          height: '100vh',
          // overflow: 'hidden',
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          willChange: 'transform, clip-path'
        }).to(data.next.container, {
          visibility: 'visible',
          zIndex: '99999',
          duration: 1.25,
          ease: 'circ'
        });
      },
      enter: function enter(data) {
        var enterTl = gsapWithCSS.timeline(),
            maskX = document.body.getAttribute('data-x'),
            maskY = document.body.getAttribute('data-y');
        return enterTl.to(data.next.container, {
          webkitClipPath: 'circle(200% at ' + maskX + 'px ' + maskY + 'px)',
          clipPath: 'circle(200% at ' + maskX + 'px ' + maskY + 'px)',
          visibility: 'visible',
          duration: 1.25,
          ease: 'circ',
          willChange: 'clip-path',
          onComplete: function onComplete() {
            gsapWithCSS.set('body', {
              clearProps: 'pointer-events'
            });
            gsapWithCSS.set(data.next.container, {
              clearProps: 'all'
            });
          },
          onStart: function onStart() {
            if (data.current.container.querySelector('.hero--large .detail') || data.next.container.querySelector('.hero--large .detail')) {
              gsapWithCSS.to('.detail', {
                scale: 0,
                onComplete: function onComplete() {// textAnims();
                  // runScripts();
                }
              });
            }
          }
        });
      },
      after: function after(data) {
        var bg = data.next.container,
            bgObj = bg.getAttribute('data-bg');
        gsapWithCSS.set('body', {
          background: bgObj
        });
      }
    }, {
      sync: false,
      name: 'work',
      from: {
        namespace: ['projects']
      },
      to: {
        namespace: ['work']
      },
      beforeLeave: function beforeLeave(data) {
        var caseLTL = gsapWithCSS.timeline({
          onComplete: function onComplete() {
            gsapWithCSS.set('.swipe', {
              clearProps: 'all'
            });
          }
        }),
            headerItems = data.current.container.querySelectorAll('header a');
        return caseLTL.to('body', {
          height: '100%',
          // overflow: 'hidden',
          pointerEvents: 'none'
        }).to('.project-to h2', {
          color: '#fff'
        }, 0).to('.swipe', {
          scaleY: 1,
          duration: 0.8,
          ease: 'cubic'
        }, 0).to('.project-to', {
          autoAlpha: 0,
          duration: 0.5,
          ease: 'cubicOut'
        }, 1.2).to('.project-to', {
          yPercent: -150,
          duration: 1.1,
          ease: 'cubic'
        }, 0.7).to(headerItems, {
          autoAlpha: 0
        }, 0.1);
      },
      beforeEnter: function beforeEnter(data) {
        var caseContent = data.next.container.querySelectorAll('.case-study__content'),
            caseTitle = data.next.container.querySelectorAll('h1'),
            caseIntro = data.next.container.querySelectorAll('.intro-item'),
            headerItems = data.next.container.querySelectorAll('header a');
        gsapWithCSS.set(caseContent, {
          autoAlpha: 0
        });
        gsapWithCSS.set(headerItems, {
          autoAlpha: 0
        });
        gsapWithCSS.set(caseTitle, {
          autoAlpha: 0,
          y: 50
        });
        gsapWithCSS.set(caseIntro, {
          autoAlpha: 0,
          y: 80
        });
      },
      leave: function leave(data) {// var titleTL = gsap.timeline();
        //
        // return titleTL.to('.project-to', {
        //   position: 'relative',
        //   zIndex: 99,
        //   y: -200,
        //   autoAlpha: 0,
        //   duration: 0.8,
        // }, 0)
        // .to('.project-to h2', {
        //   color: '#fff',
        // }, 0)
      },
      enter: function enter(data) {
        var caseContent = data.next.container.querySelectorAll('.case-study__content'),
            caseTitle = data.next.container.querySelectorAll('h1'),
            caseIntro = data.next.container.querySelectorAll('.intro-item'),
            headerItems = data.next.container.querySelectorAll('header a'),
            caseTl = gsapWithCSS.timeline({
          delay: 0.2
        });
        caseTl.to(caseTitle, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'cubicOut'
        }, 0).to(caseIntro, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'cubicOut'
        }, 0.1).to(caseContent, {
          autoAlpha: 1,
          duration: 2
        }, 0.4).to(headerItems, {
          autoAlpha: 1,
          ease: 'cubicOut',
          stagger: 0.1,
          duration: 0.9
        }, 0.4); // runScripts();
        // textAnims();
        // //header();
      },
      after: function after(data) {
        var bg = data.next.container,
            bgObj = bg.getAttribute('data-bg');
        gsapWithCSS.set('body', {
          background: bgObj,
          pointerEvents: 'all'
        }); // runScripts();
        // textAnims();
        //header();
      }
    }, {
      sync: false,
      name: 'work',
      from: {
        namespace: ['work']
      },
      to: {
        namespace: ['work']
      },
      beforeLeave: function beforeLeave(data) {
        var workTL = gsapWithCSS.timeline(),
            items = data.current.container.querySelectorAll('header a, footer div, .case-study, .img-wrap, .work-list'),
            n = data.current.container.querySelectorAll('.n-mask'),
            e = data.current.container.querySelectorAll('.e-mask'),
            x = data.current.container.querySelectorAll('.x-mask'),
            t = data.current.container.querySelectorAll('.t-mask');
        return workTL.to('body', {
          height: '100%',
          // overflow: 'hidden',
          pointerEvents: 'none'
        }).to(n, {
          y: -80,
          webkitClipPath: 'circle(0% at 0% 0%)',
          duration: 0.78,
          ease: 'cubic.out'
        }, 0).to(e, {
          y: -80,
          webkitClipPath: 'circle(0% at 50% 100%)',
          duration: 0.7,
          ease: 'cubic.out'
        }, 0.08).to(x, {
          y: -80,
          webkitClipPath: 'circle(0% at 0% 0%)',
          duration: 0.85,
          ease: 'cubic.out'
        }, 0.14).to(t, {
          y: -80,
          webkitClipPath: 'circle(0% at 100% 50%)',
          duration: 0.78,
          ease: 'cubic.out'
        }, 0.2).to(items, {
          autoAlpha: 0
        }, 0);
      },
      beforeEnter: function beforeEnter(data) {
        var caseContent = data.next.container.querySelectorAll('.case-study__content'),
            caseTitle = data.next.container.querySelectorAll('h1'),
            caseIntro = data.next.container.querySelectorAll('.intro-item'),
            headerItems = data.next.container.querySelectorAll('header a');
        gsapWithCSS.set(caseContent, {
          autoAlpha: 0
        });
        gsapWithCSS.set(headerItems, {
          autoAlpha: 0
        });
        gsapWithCSS.set(caseTitle, {
          autoAlpha: 0,
          y: 50
        });
        gsapWithCSS.set(caseIntro, {
          autoAlpha: 0,
          y: 80
        });
      },
      leave: function leave(data) {},
      enter: function enter(data) {
        var caseContent = data.next.container.querySelectorAll('.case-study__content'),
            caseTitle = data.next.container.querySelectorAll('h1'),
            caseIntro = data.next.container.querySelectorAll('.intro-item'),
            headerItems = data.next.container.querySelectorAll('header a'),
            caseTl = gsapWithCSS.timeline({// delay: 0.5,
        });
        caseTl.to(caseTitle, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'cubicOut'
        }, 0).to(caseIntro, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'cubicOut'
        }, 0.1).to(caseContent, {
          autoAlpha: 1,
          duration: 2
        }, 0.4).to(headerItems, {
          autoAlpha: 1,
          ease: 'cubicOut',
          stagger: 0.1,
          duration: 0.9
        }, 0.4); // runScripts();
        // textAnims();
        // //header();
      },
      after: function after(data) {
        var bg = data.next.container,
            bgObj = bg.getAttribute('data-bg');
        gsapWithCSS.set('body', {
          background: bgObj,
          pointerEvents: 'all'
        }); // runScripts();
        // textAnims();
        //header();
      }
    }, {
      sync: false,
      name: 'work-from-home',
      from: {
        namespace: ['home']
      },
      to: {
        namespace: ['work']
      },
      beforeLeave: function beforeLeave(data) {
        gsapWithCSS.set('.main-wrap', {
          clearProps: 'all',
          ease: 'none'
        });
        var caseLTL = gsapWithCSS.timeline({
          onComplete: function onComplete() {
            gsapWithCSS.set('.swipe', {
              clearProps: 'all'
            });
          }
        }),
            headerItems = data.current.container.querySelectorAll('header a'); // return caseLTL.to('body', {
        //   height: '100%',
        //   // overflow: 'hidden',
        //   pointerEvents: 'none',
        // })
        // .to('.cta, .footer, .hero, .secret-section', {
        //   autoAlpha: 0,
        //   duration: 0.5,
        //   ease: 'cubicOut',
        // },0)
        // .to('.swipe', {
        //   scaleY: 1,
        //   duration: 0.8,
        //   ease: 'cubic',
        // }, 0.3)
        // .to('.feature-list__item:not(.project-leave), .feature-list__item:not(.project-leave) .card-container', {
        //   // yPercent: -10,
        //   opacity: 0,
        //   duration: 0.8,
        //   ease: 'cubic',
        // }, 0.2)
        // .to('.project-leave', {
        //   yPercent: -10,
        //   // autoAlpha: 0,
        //   duration: 0.8,
        //   ease: 'cubic',
        // }, 0.3)
        // .to(headerItems, {
        //   autoAlpha:0,
        // }, 0.1)

        return caseLTL.to('body', {
          height: '100%',
          // overflow: 'hidden',
          pointerEvents: 'none'
        }).to('.feature-list__item:not(.project-leave), .cta, .footer, .hero, .secret-section', {
          autoAlpha: 0,
          duration: 0.5,
          ease: 'cubicOut'
        }, 0).to('.swipe', {
          scaleY: 1,
          duration: 0.8,
          ease: 'cubic'
        }, 0).to('.project-leave', {
          autoAlpha: 0,
          duration: 0.5,
          ease: 'cubicOut'
        }, 0.5).to('.project-leave .card-container', {
          yPercent: -120,
          duration: 1.1,
          ease: 'cubic'
        }, 0.3).to(headerItems, {
          autoAlpha: 0
        }, 0.1);
      },
      beforeEnter: function beforeEnter(data) {
        var caseContent = data.next.container.querySelectorAll('.case-study__content'),
            caseTitle = data.next.container.querySelectorAll('h1'),
            caseIntro = data.next.container.querySelectorAll('.intro-item'),
            headerItems = data.next.container.querySelectorAll('header a');
        gsapWithCSS.set(caseContent, {
          autoAlpha: 0
        });
        gsapWithCSS.set(headerItems, {
          autoAlpha: 0
        });
        gsapWithCSS.set(caseTitle, {
          autoAlpha: 0,
          y: 50
        });
        gsapWithCSS.set(caseIntro, {
          autoAlpha: 0,
          y: 80
        });
      },
      leave: function leave(data) {// var titleTL = gsap.timeline();
        //
        // return titleTL.to('.project-to', {
        //   position: 'relative',
        //   zIndex: 99,
        //   y: -200,
        //   autoAlpha: 0,
        //   duration: 0.8,
        // }, 0)
        // .to('.project-to h2', {
        //   color: '#fff',
        // }, 0)
      },
      enter: function enter(data) {
        var caseContent = data.next.container.querySelectorAll('.case-study__content'),
            caseTitle = data.next.container.querySelectorAll('h1'),
            caseIntro = data.next.container.querySelectorAll('.intro-item'),
            headerItems = data.next.container.querySelectorAll('header a'),
            caseTl = gsapWithCSS.timeline({// delay: 0.5,
        });
        caseTl.to(caseTitle, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'cubicOut'
        }, 0).to(caseIntro, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'cubicOut'
        }, 0.1).to(caseContent, {
          autoAlpha: 1,
          duration: 2
        }, 0.4).to(headerItems, {
          autoAlpha: 1,
          ease: 'cubicOut',
          stagger: 0.1,
          duration: 0.9
        }, 0.4); // runScripts();
        // textAnims();
        // //header();
      },
      after: function after(data) {
        var bg = data.next.container,
            bgObj = bg.getAttribute('data-bg');
        gsapWithCSS.set('body', {
          background: bgObj,
          pointerEvents: 'all'
        }); // runScripts();
        // textAnims();
        //header();
      }
    }]
  });

  function cursor() {
    (function ($) {

      $(document).ready(function () {
        if (window.mobileAndTabletCheck() == false) {
          var cursorUpdate = function cursorUpdate(e) {
            var offset = $('.inner').offset();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;
            gsapWithCSS.to(cursorMove, {
              x: x,
              y: y,
              z: 0.01,
              duration: 0.3
            });
          };

          var cursorMove = $(".cursor"),
              cursorIn = gsapWithCSS.timeline({
            paused: true
          });
          gsapWithCSS.set(cursorMove, {
            xPercent: -120,
            yPercent: -100,
            autoAlpha: 0,
            scale: 0,
            rotation: 90,
            transformOrigin: 'center'
          });
          cursorIn.to(cursorMove, {
            autoAlpha: 1,
            scale: 1,
            xPercent: -50,
            yPercent: -50,
            rotation: 0,
            duration: 0.7,
            ease: "circ"
          });
          $('.shh').on('mouseenter', function () {
            cursorIn.reverse();
          });
          $('.shh').on('mousemove', function () {
            return false;
          });
          $('.work-list a, .curs').on('mousemove', function () {
            // if (!cursorIn.isActive()) {
            cursorIn.play(); // }
          });
          $('.work-list a').on('mouseenter', function () {// gsap.fromTo(cursorMove, {
            //   rotation: 50,
            // }, {
            //   rotation: 90,
            //   duration: 0.6,
            // })
          });
          $('.work-list a, .curs').on('mouseleave', function () {
            cursorIn.reverse();
          });
          $(window).on('mousemove', cursorUpdate);
          $(window).resize(cursorUpdate); // Cursor Hovers

          $('').mouseover(function () {
            gsapWithCSS.to(cursorMove, {
              scale: 1,
              autoAlpha: 0.6,
              duration: 0.4,
              force3D: false
            });
          });
          $('').mouseout(function () {
            gsapWithCSS.to(cursorMove, {
              scale: 0.4,
              autoAlpha: 1,
              duration: 0.4
            });
          });
        }
      });
    })(jQuery);
  }

  function globals() {
    (function ($) {
      // First we get the viewport height and we multiple it by 1% to get a value for a vh unit

      var vh = window.innerHeight * 0.01; // Then we set the value in the --vh custom property to the root of the document

      document.documentElement.style.setProperty('--vh', "".concat(vh, "px"));
      $(window).on('resize', function () {
        var vh = window.innerHeight * 0.01; // Then we set the value in the --vh custom property to the root of the document

        document.documentElement.style.setProperty('--vh', "".concat(vh, "px"));
      });
      $(document).ready(function () {
        var bg = $('main'),
            bgObj = bg.attr('data-bg');
        gsapWithCSS.set('body', {
          background: bgObj,
          pointerEvents: 'all'
        });

        if ($('.pre-load').length) {
          window.scrollTo(0, 0);
          $('body').addClass('ready');
          $('.main-wrap').on('animationend webkitAnimationEnd', function () {
            // textAnims();
            setTimeout(function () {
              $('body').removeClass('ready');
              $('.pre-load').remove();
            }, 1200);
          });
        }
      });
    })(jQuery);
  }

  function header() {
    (function ($) {

      $(document).ready(function () {
        var scroller = false;
        var prev = 0;
        var $window = $(window);
        var nav = $('header');

        if ($('.asscroll-container').hasClass('touch')) {
          $window.on('scroll', function () {
            var scrollTop = $window.scrollTop();

            if (scrollTop > 100) {
              if (scrollTop > prev) {
                gsapWithCSS.to(nav, {
                  yPercent: -100,
                  x: 0,
                  onComplete: function onComplete() {
                    gsapWithCSS.set(nav, {
                      opacity: 0,
                      duration: 0.01
                    });
                  }
                });
              } else {
                gsapWithCSS.to(nav, {
                  yPercent: 0,
                  x: 0,
                  opacity: 1
                });
              }

              prev = scrollTop;
            }
          });
        } else {
          if (!scroller) {
            scroller = true;
            ScrollTrigger.create({
              trigger: "header",
              pin: true,
              // pin the trigger element while active
              pinSpacing: false,
              start: "top -1",
              // when the top of the trigger hits the top of the viewport
              end: "+=9999999" // end after scrolling 500px beyond the start

            });
          }

          var tick = 1;
          var navDown = gsapWithCSS.timeline({
            paused: true
          });
          navDown.from(nav, {
            yPercent: -100,
            autoAlpha: 0,
            duration: 0.4
          });
          navDown.pause(1);
          asscroll$1.on('scroll', function (scrollPos) {
            var scrollTop = scrollPos;
            ScrollTrigger.create({
              trigger: 'footer',
              start: 'top 100%',
              end: '=+500px',
              onEnter: function onEnter() {
                navDown.play();
              }
            });

            if (scrollTop > 100) {
              if (scrollTop > prev) {
                tick = 1; // nav up

                navDown.reverse();
              } else if (scrollTop != prev) {
                if (tick >= 30) {
                  // nav down
                  navDown.play();
                }

                tick = tick + 1;
              }

              prev = scrollTop;
            } else {
              if (!navDown.isActive()) {
                navDown.play();
              }
            }
          });
        }
      });
    })(jQuery);
  }

  function textAnims() {
    (function ($) {

      $(document).ready(function () {
        if ($('.hero--large .detail').length) {
          var detailTl = gsapWithCSS.timeline();
          detailTl.to('.detail', {
            scale: 1,
            x: 0,
            y: 0,
            ease: 'cubic',
            duration: 1.4,
            stagger: 0.2
          });
        } // $('.fu').each(function(){
        //
        //     let block = $(this);
        //
        //     let fadesTl = gsap.timeline({
        //       scrollTrigger:{
        //         trigger: block,
        //         start: "top 100%",
        //       }
        //     })
        //     .to(block, {
        //       delay: 0.6,
        //       autoAlpha: 1,
        //       y: 0,
        //       duration: 0.6,
        //       ease: 'cubicOut',
        //     })
        //
        // })


        if ($('.intro').length) {
          $('.intro').each(function () {
            var block = $(this);
            $(this).find('.intro__content p:not(.dark .intro__content p)').prepend('<svg class="crown-draw" xmlns="http://www.w3.org/2000/svg" width="63.289" height="56.381" viewBox="0 0 63.289 56.381"><g id="Group_2866" data-name="Group 2866" transform="translate(-5372.862 1058.614)"><path class="crown" id="Path_10867" data-name="Path 10867" d="M5408.874-1004.047l17.793-31s-15.366,10.556-18.6,10.826c-3.106.259-5.468-8.473-5.649-21.1a.8.8,0,0,0-1.273-.632c-3.2,2.409-11.563,8.694-14.377,10.64-2.711,1.879-7.039-6.417-8.857-10.264a.794.794,0,0,0-1.478.092c-1.3,4.2-2.127,13.98-2.562,21.045a1.57,1.57,0,0,0,1.331,1.653c5.08.766,22.446,4.027,29.739,13.63" transform="translate(0 0.449)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path class="c-circle" id="Path_10868" data-name="Path 10868" d="M5407.407-1053.379c1.032,2.284-.172,3.242-1.841,3.242a2.933,2.933,0,0,1-3.1-2.837c0-1.67,2.088-2.836,3.758-2.836" transform="translate(1.117 0.071)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path class="c-circle" id="Path_10869" data-name="Path 10869" d="M5374.981-1056.093c-.645,1.43.108,2.029,1.154,2.029a1.834,1.834,0,0,0,1.935-1.776c0-1.045-1.306-1.775-2.351-1.775" transform="translate(0.034)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path class="c-circle" id="Path_10870" data-name="Path 10870" d="M5431.116-1038.605c-1.773.821-2.529-.111-2.542-1.413a2.287,2.287,0,0,1,2.188-2.434c1.3-.012,2.229,1.608,2.24,2.91" transform="translate(2.139 0.593)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></g></svg>');
            var circl = $(this).find('.c-circle'),
                crown = $(this).find('.crown');
            var pathTl = gsapWithCSS.timeline({
              scrollTrigger: {
                trigger: block,
                start: "top 100%"
              }
            }).from(crown, {
              drawSVG: 0,
              duration: 1.4,
              ease: 'cubicOut'
            }, 0).from(circl, {
              drawSVG: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: 'cubicOut'
            }, 0.4);
          });
        }

        if ($('.intro p strong, p.process strong, .cta a, .contact-info p strong, .c-circle').length) {
          var block = $('.intro p strong, .cta a, .c-circle, .contact-info p strong, p.process strong'); // staticCirc = $('.contact-info p strong');

          $('.cta a').each(function () {
            $(this).append('<svg data-stroke="#fff" xmlns="http://www.w3.org/2000/svg" width="296.308" height="82.359" viewBox="0 0 296.308 82.359"><path class="p-circle" data-name="Path 10925" d="M4821.958,4941.682c46.126,12.008,92.91,65.1-110.994,59.665s-211.651-112.79,117.773-69.752" transform="translate(-4566.646 -4920.387)" fill="none" stroke="#000" stroke-linecap="round" stroke-width="2"/></svg>');
          });
          $('.c-circle').each(function () {
            $(this).append('<svg data-stroke="#fff" xmlns="http://www.w3.org/2000/svg" width="202.007" height="75.327" viewBox="0 0 202.007 75.327"><path class="p-circle" data-name="Path 12270" d="M8196.832-856.3c-96.583-20.014-189.468,22.226-103.276,48.136,82.193,24.708,239.479-1.327,118.643-53.274" transform="translate(-8002.188 1293.719) rotate(-3)" fill="none" stroke="#000" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2"/></svg>');
          });
          $('.intro p strong, .contact-info p strong, p.process strong').each(function () {
            $(this).append('<svg data-stroke="#000" xmlns="http://www.w3.org/2000/svg" width="185.957" height="61.128" viewBox="0 0 185.957 61.128"><path class="p-circle" data-name="Path 10926" d="M5123.9-918.415c-42.727-23.458-244.844-6.845-165.158,35.188,51.42,27.124,195.73,9.857,150.576-29.8" transform="translate(-4939.304 930.161)" fill="none" stroke="#000" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2"/></svg>');
          });
          block.each(function () {
            var that = $(this),
                path = $(this).find('.p-circle'),
                stroke = path.parent().attr('data-stroke'),
                dStroke = path.css('stroke'),
                drawTl = gsapWithCSS.timeline();
            var pathTl = gsapWithCSS.timeline({
              scrollTrigger: {
                trigger: that,
                start: "top 83%"
              }
            }).from(path, {
              drawSVG: 0,
              duration: 1,
              ease: 'cubicOut',
              clearProps: 'all'
            });
            that.on('mouseenter', function () {
              if (!drawTl.isActive()) {
                drawTl.fromTo(path, {
                  drawSVG: '0 100%'
                }, {
                  drawSVG: '100% 100%',
                  ease: 'cubic',
                  duration: 0.4,
                  onComplete: function onComplete() {
                    gsapWithCSS.set(path, {
                      stroke: stroke
                    });
                  }
                });
                drawTl.fromTo(path, {
                  drawSVG: 0
                }, {
                  drawSVG: '0 100%',
                  ease: 'cubic',
                  duration: 0.4
                });
              }
            });
            that.on('mouseleave', function () {
              gsapWithCSS.to(path, {
                stroke: dStroke,
                duration: 0.2
              });
            });
          }); // staticCirc.each(function(){
          //   var that = $(this),
          //   path = $(this).find('.p-circle'),
          //   drawTl = gsap.timeline();
          //
          //     let pathTl = gsap.timeline({
          //       scrollTrigger:{
          //         trigger: that,
          //         start: "top 100%",
          //       }
          //     })
          //     .from(path, {
          //       drawSVG: 0,
          //       duration: 1,
          //       ease: 'cubicOut',
          //     })
          //
          //     that.on('mouseenter', function(){
          //       if (!drawTl.isActive()) {
          //
          //         drawTl.fromTo(path, {
          //           drawSVG: '0 100%',
          //         },{
          //           drawSVG: '100% 100%',
          //           ease: 'cubic',
          //           duration: 0.8,
          //         })
          //
          //         drawTl.fromTo(path, {
          //           drawSVG: 0,
          //         },{
          //           drawSVG: '0 100%',
          //           ease: 'cubic',
          //           duration: 0.8,
          //         })
          //
          //
          //       }
          //     })
          // });
        } //Split lines


        var splitLines = $('.case-study__content .text-wrap'),
            title = splitLines.find('p'),
            splitParent = new SplitText(title, {
          type: 'lines',
          linesClass: "bl"
        }),
            splitTitle = new SplitText(splitParent.lines, {
          type: 'lines',
          linesClass: "lines"
        });
        gsapWithCSS.set(splitLines, {
          visibility: 'visible'
        });
        splitLines.each(function () {
          var block = $(this),
              lines = block.find('.lines');
          var linesTl = gsapWithCSS.timeline({
            scrollTrigger: {
              trigger: block,
              start: "top 110%"
            }
          }).fromTo(lines, {
            yPercent: 100,
            autoAlpha: 0.01
          }, {
            autoAlpha: 0.999,
            yPercent: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: 'cubic'
          });
        });
      });
    })(jQuery);
  }

  function globalScripts() {
    globals();
    cursor();
  }

  function runScripts() {
    componentScripts();
    globalScripts();
  }


}());
//# sourceMappingURL=main.js.map


