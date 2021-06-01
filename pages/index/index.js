const db = wx.cloud.database()
var util = require('../../utils/util.js');
const app = getApp()

Page({
  data: {
    openid: '',
    todo: {},

  },
  onLoad() {
    this.getOpenid()
    // this.getUserInfo()
    //显示当前页面可转发分享
    wx.showShareMenu({
      withShareTicket: true
    })

  },

  // 定义调用云函数获取openid
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        // console.log(res.result)
        var openid = res.result.openid
        that.setData({
          openid: openid
        })
        this.getData()
        this.creat()
      }
    })
  },
  //页面渲染完成
  onReady: function () {
    // this.creat()
  },
  //创建用户个人数据
  creat() {
    db.collection('users').add({
      data: {
        _id: this.data.openid,
        time: 0,
        tag: '暂无',
      },
      success: function (res) {
        // console.log(res)
      }
    })
  },

  //获取数据库事件数据
  getData: function () {
    const db = wx.cloud.database()
    // 查询当前用户的数据
    db.collection('event').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        this.setData({
          todo: (res.data)
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
  //添加
  add() {
    wx.navigateTo({
      url: "/pages/add/add"
    })
  },
  detail(e) {
    var msg = e.currentTarget.dataset.msg;
    var that = this;
    console.log(msg)
    wx.showModal({
      title: '详情',
      content: "事件名称:" + msg.name + "，\r\n事件类型:" + msg.type1 + "-" + msg.type2 + "，\r\n时间:" + msg.time + "分钟，\r\n创建时间:" + msg.ctime,
      cancelText: "放弃︵",
      cancelColor: '#D32424',
      confirmText: "加油！",
      success(res) {
        if (res.confirm) {

        } else if (res.cancel) {
          // console.log(msg)
          wx.showModal({
            title: '提示',
            content: '确认删除这条还没完成的事件吗？',
            success(res) {
              if (res.confirm) {
                // 删除数据库中数据
                db.collection('event').doc(msg._id).remove({
                  success: function (res) {
                    that.onPullDownRefresh()
                  },
                })
              } else if (res.cancel) {
                // console.log('用户点击取消')
              }
            },
          })
        }
      }
    })
  },
  // 开始
  start(e) {
    var msg = e.currentTarget.dataset.msg;
    // console.log(msg)

    if (msg.type2 == '不计时') {

      db.collection('event').doc(msg._id).update({
        data: {
          finish: true,
          ctime: util.formatTime(new Date),
        }
      }).then(res => {
        console.log(res)
      })
      wx.showToast({
        title: '已完成！',
        icon: 'success',
        duration: 2000
      })
      this.refresh()
    } else if (msg.type2 == '倒计时') {
      var data = JSON.stringify(msg)
      wx.navigateTo({
        url: '/pages/time/time' + '?data=' + data
      })
    } else if (msg.type2 == '正计时') {

      // var data = JSON.stringify(msg)

      // wx.navigateTo({
      //   url: '/pages/time/time' + '?data=' + data
      // })
    }
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getData()
    setTimeout(function () {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  },
  refresh() {
    this.onPullDownRefresh();
  }


})