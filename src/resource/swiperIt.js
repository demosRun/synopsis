var swiperIt = {
  timer: null,
  init: function (cont, config) {
    this.config = config
    var _this = this
    var showSlider = _this.config.showSlider || 5
    var width = _this.config.width || 36
    var step = _this.config.step || 0.8
    this.styleList = []
    this.cont = cont
    // 轮播图总数量
    this.contL = cont.children
    // 算出活跃项目
    var activeIndex = Math.floor(showSlider / 2)
    this.activeIndex = activeIndex

    // 判断是否有分页器
    if (_this.config.pagination) {
      var html = ''
      for (var ind = 0; ind < this.contL.length; ind ++) {
        html += '<div class="pagination-item" ind="'+ ind +'"></div>'
      }
      _this.config.pagination.innerHTML = html
    }

    for (var ind = 0; ind < this.contL.length; ind++) {
      // 和活跃卡片位置的差距
      var disparity = Math.abs(ind - activeIndex)
      
      // 距离过远的不再计算位置因为不会显示出来
      if (disparity > activeIndex) disparity = activeIndex
      // console.log(disparity, activeIndex)
      this.styleList[ind] = {"classData":"swiper-item"}
      // 判断是否为可见卡片
      if (ind < showSlider) {
        this.styleList[ind].classData += ' show'
      } else {
        this.styleList[ind].classData += ' hide'
      }
      // 判断是否为活跃项目
      if (ind === activeIndex) this.styleList[ind].classData += ' active'
      
      var scale = Math.pow(step, disparity)
      
      // 计算出合适的宽度
      this.styleList[ind].width = (scale * width).toFixed(2) + '%'
      // 计算出合适的高度
      this.styleList[ind].height = Math.ceil(scale * 100) + '%'
      // 计算距离左边的位置
      var positionStep =  (100 - width) / 2 / activeIndex
      if (ind <= activeIndex) {
        this.styleList[ind].left = (ind * positionStep).toFixed(2) + '%'
      } else if (ind < showSlider) {
        // 因为缩小产生的偏移量
        var p = (1 - scale) * width
        this.styleList[ind].left = (ind * positionStep + p).toFixed(2) + '%'
      } else {
        this.styleList[ind].left = (100 - Math.ceil(scale * width)) / 2 + '%'
      }
      // 计算出层级关系
      this.styleList[ind].zIndex = ind < showSlider ? showSlider - disparity : -1
    }

    this.move()
    // 判断是否自动轮播
    if (_this.config.autoplay) {
      // 鼠标悬浮停止轮播
      cont.addEventListener('mouseover', function (e) {
        setTimeout(() => {
          if (!_this.isPause) _this.stopAutoPlay()
        }, 0);
      }, true);
      // 鼠标移出开始轮播
      cont.addEventListener('mouseout', function () {
        setTimeout(() => {
          if (_this.isPause) _this.startAutoPlay()
        }, 0);
      }, false);
      // 当前窗口得到焦点
      window.onfocus = _this.startAutoPlay.bind(_this)
      // 当前窗口失去焦点
      window.onblur = _this.stopAutoPlay.bind(_this)
      setTimeout(() => {
        _this.startAutoPlay()
      }, 0)
    }
    // 注册触摸事件
    var touchMoveX = 0
    var touchMoveXMove = 0
    cont.addEventListener('touchstart', function (e) {
      console.log('触摸开始!')
      touchMoveX = e.touches[0].pageX
      _this.isTouching = true
    }, false);
    cont.addEventListener('touchmove', function (e) {
      touchMoveXMove = e.touches[0].pageX
    }, false);
    cont.addEventListener('touchend', function () {
      console.log('触摸结束!', touchMoveXMove - touchMoveX)
      if ((touchMoveXMove - touchMoveX) > 100) {
        _this.prev()
      } else if ((touchMoveXMove - touchMoveX) < -100) {
        _this.next()
      }
      _this.isTouching = false
    }, false);
    return this
  },
  startAutoPlay: function () {
    var _this = this
    if (this.timer) return
    // 开启自动轮播
    this.timer = setInterval(function () {
      if (!_this.isPause && !_this.isTouching) _this.next()
    }, _this.config.autoplay)
    console.log('开启轮播!', _this.timer)
    // 事件回调
    if (_this.config.start) {
      _this.config.start(this.activeIndex)
    }
  },
  stopAutoPlay: function () {
    console.log('停止轮播!', this.timer)
    clearInterval(this.timer)
    this.timer = null
  },
  move: function () {
    if (this.config.pagination) {
      this.config.pagination.children[this.activeIndex].classList.add('active')
    }
    for (var i = 0; i < this.contL.length; i++) {
      this.animate(this.contL[i], this.styleList[i])
    }
    if (this.config.slideChange) {
      this.config.slideChange(this.activeIndex)
    }
  },
  isTouching: false,
  // 暂停计时器
  isPause: null,
  next: function () {
    // 避免频繁刷新
    if (this.isPause) clearTimeout(this.isPause)
    this.isPause = setTimeout(() => {
      this.isPause = null
    }, 3000)
    // 停止自动播放
    if (this.config.pagination) {
      this.config.pagination.children[this.activeIndex].classList.remove('active')
    }
    
    this.activeIndex++
    if (this.activeIndex >= this.contL.length) this.activeIndex = 0
    this.styleList.unshift(this.styleList.pop())
    this.move()
  },
  prev: function () {
    // 避免频繁刷新
    if (this.isPause) clearTimeout(this.isPause)
    this.isPause = setTimeout(() => {
      this.isPause = null
    }, 3000)
    
    if (this.config.pagination) {
      this.config.pagination.children[this.activeIndex].classList.remove('active')
    }
    this.activeIndex--
    
    if (this.activeIndex < 0) this.activeIndex = this.contL.length - 1
    this.styleList.push(this.styleList.shift())
    this.move()
  },
  animate: function (obj, styleList, fn) {
    setTimeout(function () {
      for(var styleItem in styleList) {
        var value = styleList[styleItem]
        if(styleItem == 'zIndex'){
          obj.style[styleItem] = styleList[styleItem];
        } else if(styleItem=='opacity'){
          obj.style[styleItem]=value/100;
          obj.style.filter='alpha(opacity='+value+')';
        } else if (styleItem == 'left') {
          obj.style[styleItem] = styleList[styleItem];
        } else if (styleItem == 'right') {
          obj.style[styleItem] = styleList[styleItem];
        } else if (styleItem == 'width') {
          obj.style[styleItem] = styleList[styleItem];
        } else if (styleItem == 'height') {
          obj.style[styleItem] = styleList[styleItem];
        } else if (styleItem != 'classData') {
          // console.log(value)
          obj.style[styleItem] = value + 'px';
        }
      }
      obj.setAttribute("class", styleList.classData);
      if (fn) {
        fn();
      }
    }, 10)
  }
}
