const db = wx.cloud.database()
Page({
  data: {
    openid: '',
    msg: {},
    count:'',
    tag:'',
    tags:[],
    time:0

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
    const db = wx.cloud.database()
    // 查询当前用户待办的数据
    db.collection('event').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        this.setData({
          msg: (res.data)
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
          tag:res.data[0].tag,
          tags:res.data[0].tags,
          time:res.data[0].time
          
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