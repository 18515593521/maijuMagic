//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    location: "请选择",

    provinceArr: null,    //省级
    cityArr: null,       //市级
    areaArr: null,       //区级
    addressArr: [0, 0, 0],  //地址下标信息
    province: null,    //省
    city: null,       //市
    area: null,       //区

    addressPickerShow: false,
  
  },

  //页面加载
  onLoad: function (options) {
    this.getProvinceData();    //获取省级数据
  
  },


  //选择地区
  chooseAddress: function (e) {
    this.setData({
      addressPickerShow: true
    })
  },
  //【地区选择器】---取消
  pickerViewCancel: function (e) {
    this.setData({
      addressPickerShow: false
    })
  },
  //【地区选择器】---确定
  pickerViewSubmit: function (e) {
    var location = this.data.province.name + '-' + this.data.city.name + '-' + this.data.area.name;

    this.setData({
      addressPickerShow: false,
      location: location
    })
  },
  //地址改变
  addressChange: function (e) {
    var valueArr = e.detail.value;

    var provinceCode = this.data.provinceArr[valueArr[0]].code;
    if (provinceCode != this.data.province.code) {
      this.setData({
        province: this.data.provinceArr[valueArr[0]],
        addressArr: [valueArr[0], 0, 0]
      })
      this.getCityData(provinceCode);   //获取市级数据
      return;
    }

    var cityCode = this.data.cityArr[valueArr[1]].code;
    if (cityCode != this.data.city.code) {
      this.setData({
        city: this.data.cityArr[valueArr[1]],
        addressArr: [valueArr[0], valueArr[1], 0]
      })
      this.getAreaData(cityCode);   //获取区级数据
      return;
    }

    var areaCode = this.data.areaArr[valueArr[2]].code;
    if (areaCode != this.data.area.code) {
      this.setData({
        area: this.data.areaArr[valueArr[2]]
      })
    }
  },
  //获取省级数据
  getProvinceData: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/getprovince',  //接口地址
      data: {},   //请求参数
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.setData({
            provinceArr: returnData.result,
            province: returnData.result[0]    //省
          })
        }

        var provinceCode = returnData.result[0].code;
        thisPage.getCityData(provinceCode);   //获取市级数据
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },
  //获取市级数据
  getCityData: function (code) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/getcity',  //接口地址
      data: {   //请求参数
        code: code
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
            cityArr: returnData.result,
            city: returnData.result[0],       //市
          })
        }

        var cityCode = returnData.result[0].code;
        thisPage.getAreaData(cityCode);   //获取区级数据
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },
  //获取区级数据
  getAreaData: function (code) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/getcountry',  //接口地址
      data: {   //请求参数
        code: code
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
            areaArr: returnData.result,
            area: returnData.result[0]      //区
          })
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

  

 
})