var util = require('../../utils/util.js');
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    num: "",
    time: 25,
    color: 'blue',
    show: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
          })
        }
      })
    }
  },

  formSubmit: function (e) {
    this.getRandom(1, 30)
    var that = this;
    wx.cloud.init();
    const db = wx.cloud.database();
    // console.log(e.detail.value)
    console.log(that.data.userInfo)
    var name = e.detail.value.name;
    var type1 = e.detail.value.type1;
    var type2 = e.detail.value.type2;
    var time = e.detail.value.time;
    if (name == "") {
      wx.showToast({
        title: "待办事件名称不要为空哦！",
        icon: 'none',
      })
    } else {
      var username = that.data.userInfo.nickName;
      var head = that.data.userInfo.avatarUrl;
      var num = that.data.num;
      // console.log(e.detail.value)
      if (type2 == "正计时") {
        var time = 0;
      } else if (type2 == "不计时") {
        var time = "-";
      }

      db.collection('event').add({

        data: {
          head: head,
          username: username,
          ctime: util.formatTime(new Date),
          name: name,
          finish: false,
          type1: type1,
          type2: type2,
          time: time,
          num: num
        },

        success: function (res) {
          wx.showToast({
            title: "新建待办成功",
          })
          // 返回上一页面并刷新
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
    }
  },
  // 生成随机数
  getRandom(start, end, fixed = 0) {
    let differ = end - start
    let random = Math.random()
    let num = (start + differ * random).toFixed(fixed)
    // console.log(mun)
    this.setData({
      num: num
    })
  },
  time(e) {
    // console.log(e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
  group1(e) {
    console.log(e.detail.value)
    if (e.detail.value == '定目标') {
      this.setData({
        color: 'orange'
      })
    } else if (e.detail.value == '养习惯') {
      this.setData({
        color: 'purple'
      })
    } else {
      this.setData({
        color: 'blue'
      })
    }

  },
  group2(e) {
    console.log(e.detail.value)
    if (e.detail.value == '倒计时') {
      this.setData({
        show: true
      })
    } else {
      this.setData({
        show: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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