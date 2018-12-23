var app = getApp();   //获取应用实例

var failMessageObj = {
  1: "授权位置信息失败",
  2: "授权用户信息失败"
};

Page({
  data: {
    failType: 0,      //失败类型
    failMessage: "",  //提示信息

  },

  //页面加载
  onLoad: function (options) {
    var failType = options.failType;    //失败类型
    var failMessage = failMessageObj[failType];

    this.setData({
      failType: failType,
      failMessage: failMessage
    });
  },
  onShow: function () {
    var thisPage = this;
    var failType = this.data.failType;    //失败类型
    wx.getSetting({
      success(res) {
        if (failType == 1) { //位置信息
          if (res.authSetting["scope.userLocation"]) {
            app.pageSkip("/pages/index/index", 2);
          } else {

          }
        } else if (failType == 2) { //用户信息
          if (!res.authSetting["scope.userLocation"]) {
            thisPage.setData({
              failMessage: failMessageObj[1]
            });

          } else if (!res.authSetting["scope.userInfo"]) {
            thisPage.setData({
              failMessage: failMessageObj[2]
            });
          } else {
            app.pageSkip("/pages/index/index", 2);
          }
        }

      }
    })
  },

  //重新授权
  reAuthorize: function () {
    var thisPage = this;
    var failType = this.data.failType;    //失败类型

    wx.getSetting({
      success(res) {
        console.log("授权信息", res);

        if (failType == 1) { //位置信息
          if (res.authSetting["scope.userLocation"]) {
            app.pageSkip("/pages/index/index", 2);
          } else {

          }
        } else if (failType == 2) { //用户信息
          if (!res.authSetting["scope.userLocation"]) {
            thisPage.setData({
              failMessage: failMessageObj[1]
            });

          } else if (!res.authSetting["scope.userInfo"]) {
            thisPage.setData({
              failMessage: failMessageObj[2]
            });
          } else {
            app.pageSkip("/pages/index/index", 2);
          }
        }
      }
    });
  }

})