// pages/member/member.js
var app = getApp();   //获取应用实例
Page({

  /**
   * 页面的初始数据
   */
  data: {
    vipData:[],  // 所有的用户类型
    indexData:null,  //当前的类型
     vipData:[
       {name:'普通会员',level:'1'},
       { name: 'VIP会员', level: '2' },
       { name: 'SVIP会员', level: '3' },
     ],
     linesWidth:['line1','line2'],
     vipType:null, //当前用户的VIP信息
     codeImageHidden:true,
    codeImage:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var thisPage = this;
    var vipType = 0;
    if (app.globalData.customerInfo.vipInfo.vip_type){
      vipType = app.globalData.customerInfo.vipInfo.vip_type
      if (app.globalData.customerInfo.vipInfo.vip_type == 1) {
        thisPage.selectCustomerVip1();
        thisPage.setData({
          vipType: vipType
        })
      } else {
        thisPage.selectCustomerVip2(vipType);
      }
    }else{

    }
    console.log(vipType)
    thisPage.getCodeImage();
    

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
    
    console.log(app.globalData.userInfo)

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
//点击
  skinUp:function(e){
    var dataSet = e.currentTarget.dataset;
    var url = dataSet.url;
    var type = dataSet.types;
    app.pageSkip(url, type);
  },
  selectCustomerVip1:function(){
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/selectCustomerVipInfo/ ' + app.globalData.customerInfo.id,  //接口地址
      method: 'post',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          var vipDatas = returnData.result.vipLevel;  //会员的所有数据
          for (var m = 0; m < vipDatas.length; m++) {  //遍历给加样式
            var level = parseInt(vipDatas[m].level);
            if (vipDatas.length / level == 1) {
              vipDatas[m].line = "line3";
            } else if (vipDatas.length / level == vipDatas.length) {
              vipDatas[m].line = "line1"
            } else {
              vipDatas[m].line = "line2"
            }
            if (level == returnData.result.vip_level) {
              vipDatas[m].color = "colors";
            } else {
              vipDatas[m].color = "";
            }
            if (vipDatas[m].level == returnData.result.vip_level) { //找出当前的会员等级数据
              var indexData = vipDatas[m];
            }
          }

          thisPage.setData({
            vipDatas: returnData.result,
            indexData: indexData
          })

        } else {  //失败
          app.showWarnMessage(returnData.message);
        }
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },
  selectCustomerVip2: function (vipType1) {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/selectCustomerVipInfo1/' + app.globalData.customerInfo.id,  //接口地址
      method: 'get',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          console.log(returnData)
          if (returnData.result){
            if (thisPage.data.vipType == 2 && returnData.result.use_type == 2){
              returnData.result.util = "元";
            } else if (thisPage.vipType == 3 && returnData.result.use_type == 2){
              returnData.result.util = "元";
            } else if (thisPage.data.vipType == 3 && returnData.result.use_type == 1){
              returnData.result.util = "次";
            } else if (thisPage.data.vipType == 2 && returnData.result.use_type == 1) {
              returnData.result.util = "元";
            }
            if (!returnData.result.the_period_of_validity){
              returnData.result.the_period_of_validity ='长期'
            }

            thisPage.setData({
              "indexData": returnData.result,
              "vipDatas.vip_code": returnData.result.vip_code,
               vipType: vipType1
            })
          }else{
            thisPage.setData({
              vipType: 0
            })
          }
        } else {  //失败
          app.showWarnMessage(returnData.message);
        }
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },
  getCodeImage: function () {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/qrCodeByCustomerId',  //接口地址
      data: {           //请求参数
        P1: 'M',
        P2: app.globalData.customerInfo.id,
        node3: app.globalData.customerInfo.factoryId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.setData({
            codeImage: returnData.result.replace("http", "https")
          })
        } else {  //失败
          console.log("接口异常！");
        }
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },
  //显示二维码图片
  showCodeImage: function (e) {
    this.setData({
      codeImageHidden: false
    });
  },
  //隐藏二维码图片
  hideCodeImage: function (e) {
    this.setData({
      codeImageHidden: true
    });
  },
  //图片下载
  imageDownload: function () {
    var thisPage = this;

    wx.getImageInfo({   //获取图片信息
      src: thisPage.data.codeImage,
      success: function (res1) {
        if (wx.saveImageToPhotosAlbum) {    //保存图片到系统相册
          wx.saveImageToPhotosAlbum({
            filePath: res1.path,
            success: function (res2) {
              app.showSuccessMessage("图片保存成功");
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
          })
        }
      },
      fail: function (res) {
        console.warn("获取图片信息fail", res);
      }
    })
  },

})