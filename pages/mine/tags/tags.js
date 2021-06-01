const db = wx.cloud.database()
Page({
  data: {
    openid: '',
    count: '', //完后个数
    tag: '',
    tags: [],
    time: 0, //完成总时间
    name: [{
        t: 100,
        c: 5,
        tage: '充电学前班'
      }, {
        t: 280,
        c: 10,
        tage: '充电小学生'
      }, {
        t: 500,
        c: 20,
        tage: '时间刺客'
      }, {
        t: 1000,
        c: 50,
        tage: '时间管理大师'
      }

    ]

  },
  onLoad() {
    this.getOpenid()

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
      }
    })
  },
  //获取数据库数据
  getData: function () {

    // 查询用户完成的个数
    db.collection('event').where({
      _openid: this.data.openid,
      finish: true
    }).count({
      success: res => {
        this.setData({
          count: (res.total)
        })
        console.log('查询成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('失败：', err)
      }
    })
    // 查询用户个人数据
    db.collection('users').where({
      _id: this.data.openid
    }).get({
      success: res => {
        this.setData({
          tag: res.data[0].tag,
          tags: res.data[0].tags,
          time: res.data[0].time

        })
        console.log('查询成功: ', res)
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
  get(e) {
    var that = this
    // console.log(e.currentTarget.dataset.msg)
    var c = e.currentTarget.dataset.msg.c
    var t = e.currentTarget.dataset.msg.t
    var name = e.currentTarget.dataset.msg.tage

    if (this.data.count >= c && this.data.time >= t) {

      db.collection('users').doc(that.data.openid).update({
        data: {
          tag: name,
        }
      }).then(res => {
        wx.showToast({
          title: '获取成功',
          icon: 'success',
          duration: 2000
        })
        this.refresh()
      })

    } else {
      wx.showToast({
        title: '您未达到要求哦！',
        icon: 'none',
        duration: 2000
      })
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