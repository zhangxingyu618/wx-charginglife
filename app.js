//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 云开发初始化
    wx.cloud.init({
      env: "charginglife-s2sgl",
      traceUser: true
    })


    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  // 获取用户openid
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        console.log('openid: ', res.result.openid)
        console.log('appid: ', res.result.appid)
        // var openid = res.result.openId;
        // that.setData({
        //   openid: openid
        // })
      }
    })
  },
  globalData: {
    userInfo: null
  },
  // 获取分秒时间
  getTime(e) {
    // let mun = 135
    console.log(e)
    let minute = e/60
    console.log(minute)
    let second = e %60
    console.log(second)
  }
})