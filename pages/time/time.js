// pages/time/time.js
const db = wx.cloud.database()
var util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    yiyan: '', //短句
    msg: '', // 待办信息
    time: '', // 显示动态计时时间
    mun: '', //  总时间
    residue: '', //剩余时间
    march: 0, // 已进行 秒
    progress: 0, // 进度条百分数
    t: '', //定时器
    on: true, //计时进行中
    animation: 'running', //控制动画
    finishtime: 0 //用户已经完成的时间

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    this.audioCtx = wx.createAudioContext('myAudio')
    var data = JSON.parse(e.data)
    this.setData({
      msg: data,
    })
    //待办事件分类
    this.classify(data)
    //短句接口
    this.yiyan()
    this.getYiyan()
    this.getOpenid()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  // 定义调用云函数获取openid
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        console.log(res.result)
        var openid = res.result.openid
        that.setData({
          openid: openid
        })
        that.getFinishtime()
      }
    })
  },
  // 获取完成的时间
  getFinishtime() {
    // 查询当前用户的数据
    db.collection('users').where({
      _id: this.data.openid
    }).get({

      success: res => {
        this.setData({
          finishtime: res.data[0].time
        })
        // console.log('查询成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('失败：', err)
      }
    })
  },

  //一言接口
  yiyan: function () {
    var that = this;
    wx.request({
      url: 'https://v1.hitokoto.cn',
      header: {
        'Content-Type': 'application/json'
      },
      data: {},
      success: function (res) {
        // console.log(res.data)
        that.setData({
          yiyan: res.data,
        })
      },
      fail: function (res) {
        console.log('.........接口调用失败..........');
      }
    })
  },



  //短句30秒更新一次
  getYiyan() {
    var that = this;
    setInterval(function () {
      that.yiyan()
    }, 30000);

  },

  //待办事件分类
  classify(data) {
    // console.log(data)
    if (data.type2 == '倒计时') {
      // console.log(data.time)
      var mun = data.time * 60
      //开始倒计时方法
      this.start(mun)
      this.setData({
        mun: mun
      })
    } else if (data.type2 == '正计时') {
      this.setData({
        time: '待..'
      })
    }
  },

  //倒计时方法
  start(mun) {
    var that = this
    var march = that.data.march
    if (mun > 0) {
      var m = Math.floor(mun / 60 % 60);
      var s = Math.floor(mun % 60);
      m = m < 10 ? ("0" + m) : m;
      s = s < 10 ? ("0" + s) : s;
      var time = m + ":" + s;
      // console.log(time)
      march = march + 1
      var progress = (march / that.data.mun) * 100
      // console.log(march)
      // console.log(mun)
      progress = progress.toFixed(1); //保留一位小数
      // console.log(progress)

      var t = setTimeout(function () {
        that.start(mun - 1)
      }, 1000);

      that.setData({
        residue: mun,
        time: time,
        march: march,
        progress: progress,
        t: t
      })


    } else {
      // console.log("....................")
      that.setData({
        time: "00:00",
        animation: 'paused',
        on: false,
      })
      // 更新事件完成
      db.collection('event').doc(that.data.msg._id).update({
        data: {
          finish: true,
          ctime: util.formatTime(new Date),
        }
      }).then(res => {
        console.log(res)
      })
      // 更新时间完成总时间
      db.collection('users').doc(that.data.openid).update({
        data: {
          time: that.data.finishtime + that.data.msg.time,

        }
      }).then(res => {
        console.log(res)
      })


      wx.showModal({
        title: '提示',
        content: '恭喜您，\r\n 完成了您的此次充电任务！',
        showCancel: false,
        success() {
          //返回上一页面 并刷新
          var pages = getCurrentPages(); //当前页面栈
          if (pages.length > 1) {
            var beforePage = pages[pages.length - 2]; //获取上一个页面实例对象
            beforePage.refresh(); //触发父页面中的方法
          }
          wx.navigateBack({
            delta: 1
          })

        }
      })

    }

  },
  //暂停开始按钮
  stopCount() {
    if (this.data.on) {
      clearTimeout(this.data.t);
      this.setData({
        on: false,
        animation: 'paused'
      })
      var that = this
      wx.showModal({
        title: '提示',
        content: '暂停只是暂时的，\r\n 请继续完成您的任务哦！',
        confirmText: '继续',
        success(res) {
          if (res.confirm) {
            that.start(that.data.residue)
            that.setData({
              on: true,
              animation: 'running'
            })

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      this.start(this.data.residue)
      this.setData({
        on: true,
        animation: 'running'
      })
    }
  },
  // 选择音乐按钮
  music() {
    var that = this
    wx.showActionSheet({
      itemList: ['无声', '雨声', '平静', '钢琴', '欢快'],
      itemColor: "#2396F5",
      success(res) {
        // console.log(res.tapIndex)
        if (res.tapIndex === 0) {
          that.audioCtx.pause()
        } else if (res.tapIndex === 1) {
          that.audioCtx.setSrc("https://6368-charginglife-s2sgl-1302535336.tcb.qcloud.la/mp3/rain.mp3")
          that.audioCtx.play()
        } else if (res.tapIndex === 2) {
          that.audioCtx.setSrc("https://6368-charginglife-s2sgl-1302535336.tcb.qcloud.la/mp3/wind.mp3")
          that.audioCtx.play()
        } else if (res.tapIndex === 3) {
          that.audioCtx.setSrc("https://6368-charginglife-s2sgl-1302535336.tcb.qcloud.la/mp3/hunli.mp3")
          that.audioCtx.play()
        } else if (res.tapIndex === 4) {
          that.audioCtx.setSrc("https://6368-charginglife-s2sgl-1302535336.tcb.qcloud.la/mp3/happy%20.mp3")
          that.audioCtx.play()
        }

      },
    })
  },
  //放弃按钮
  giveUp() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确认放弃这件还没完成的任务吗？',
      success(res) {
        if (res.confirm) {
          // 删除数据库中数据
          db.collection('event').doc(that.data.msg._id).remove({
            success: function (res) {
              wx.showToast({
                title: '已删除此待办事件！',
                icon: 'success',
                duration: 2000
              })
              //返回上一页面 并刷新
              var pages = getCurrentPages(); //当前页面栈
              if (pages.length > 1) {
                var beforePage = pages[pages.length - 2]; //获取上一个页面实例对象
                beforePage.refresh(); //触发父页面中的方法
              }
              wx.navigateBack({
                delta: 1
              })
            },
          })
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      },
    })
  },

  // 加油！
  cheer() {
    wx.showToast({
      title: "加油！\r\n陌生人！",
      icon: 'none',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.audioCtx.pause()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.audioCtx.pause()
    clearTimeout(this.data.t);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})