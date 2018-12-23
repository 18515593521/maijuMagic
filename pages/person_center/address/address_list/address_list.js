//页面js
var app = getApp();   //获取应用实例
var util = require('../../../../utils/util.js');

Page({
  data: {
    isChoose: false,    //是否选择地址
    addressList: [],    //地址列表

    addressPannel_hidden: true,

    chooseAddress: null,  //选择的地址

    name: '',           //收货人
    phone: '',          //手机号码
    location: '请选择',  //所在地区
    address: '',        //详细地址

    formTitle: '',
    tips_hidden: true,  
    tipsInfo: '',       //提示信息

    provinceArr: null,    //省级
    cityArr: null,       //市级
    areaArr: null,       //区级
    addressArr: [0, 0, 0],  //地址下标信息
    province: null,    //省
    city: null,       //市
    area: null,       //区

    addressPicker_hidden: true,
  
  },

  //页面加载
  onLoad: function (options) {
    if (options.isChoose){
      this.setData({
        isChoose: options.isChoose
      });
    }
    // app.globalData.choosedOrderAddress = null;

    this.getAddressList();    //获取地址列表

    this.getProvinceData();    //获取省级数据
  
  },

  //获取地址列表
  getAddressList: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectCustomerAddress1',  //接口地址
      data: {   //请求参数
        customer_id: app.globalData.customerInfo.id
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (app.globalData.choosedOrderAddress){
          for (var i = 0; i < returnData.result.length; i++) {
            var addressObj = returnData.result[i];
            if (addressObj.id == app.globalData.choosedOrderAddress.id) {
              addressObj.choose = true;
            } else {
              addressObj.choose = false;
            }
          }
        }

        if (returnData.code == 0) { //成功
          thisPage.setData({
            addressList: returnData.result
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
  //添加新地址
  addNewAddress: function (e) {
    this.setData({
      formTitle: '添加地址',
      addressPannel_hidden: false,
      chooseAddress: null,
      name: '',
      phone: '',
      location: '请选择',
      address: '',
    })
  },
  //关闭地址面板
  closeAddressPannel: function (e) {
    this.setData({
      addressPannel_hidden: true,
      addressPicker_hidden: true
    })
  },

  //选择地区
  chooseAddress: function (e) {
    this.setData({
      addressPicker_hidden: false
    })
  },
  //【地区选择器】---取消
  pickerViewCancel: function (e) {
    this.setData({
      addressPicker_hidden: true
    })
  },
  //【地区选择器】---确定
  pickerViewSubmit: function (e) {
    var location = this.data.province.name + '-' + this.data.city.name + '-' + this.data.area.name;

    this.setData({
      addressPicker_hidden: true,
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
  getCityData: function (code1, code2, code3) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/getcity',  //接口地址
      data: {   //请求参数
        code: code1
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          if (code2){
            var index = util.getIndexFromArray(returnData.result, "code", code2);
            thisPage.setData({
              cityArr: returnData.result,
              city: returnData.result[index],       //市
              "addressArr[1]": index
            })
            thisPage.getAreaData(code2, code3);   //获取区级数据
          }else{
            thisPage.setData({
              cityArr: returnData.result,
              city: returnData.result[0],       //市
            })
            var cityCode = returnData.result[0].code;
            thisPage.getAreaData(cityCode);   //获取区级数据
          }
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
  //获取区级数据
  getAreaData: function (code2, code3) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/getcountry',  //接口地址
      data: {   //请求参数
        code: code2
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          if (code3){
            var index = util.getIndexFromArray(returnData.result, "code", code3);
            thisPage.setData({
              areaArr: returnData.result,
              area: returnData.result[index],      //区
              "addressArr[2]": index
            })
            thisPage.pickerViewSubmit();
          }else{
            thisPage.setData({
              areaArr: returnData.result,
              area: returnData.result[0]      //区
            })
          }
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

  //文本框输入值
  inputValue: function (e) {
    var dataSet = e.currentTarget.dataset;
    var key = dataSet.param;
    var value = e.detail.value;

    var obj = {};
    obj[key] = value;
    this.setData(obj)
  },
  //保存地址
  saveAddress: function (e) {
    var thisPage = this;
    var data = this.data;

    if (!data.name) {
      thisPage.setData({
        tips_hidden: false,
        tipsInfo: '请完善【收货人】信息！'
      })
      return;
    }
    if (!data.phone) {
      thisPage.setData({
        tips_hidden: false,
        tipsInfo: '请完善【手机号码】信息！'
      })
      return;
    }else{
      var phoneStr = /^1[3|4|5|7|8]\d{9}$/;
      if (!phoneStr.test(data.phone)){
        thisPage.setData({
          tips_hidden: false,
          tipsInfo: '请填写正确的【手机号码】！'
        })
        return;
      }
    }
    if (data.location =='请选择') {
      thisPage.setData({
        tips_hidden: false,
        tipsInfo: '请完善【省市区】信息！'
      })
      return;
    }
    if (!data.address) {
      thisPage.setData({
        tips_hidden: false,
        tipsInfo: '请完善【详细地址】信息！'
      })
      return;
    }

    thisPage.setData({
      tips_hidden: true
    })

    var requestUrl = '';
    var requestParam = {};
    var codeStr = thisPage.data.province.code + ',' + thisPage.data.city.code + ',' + thisPage.data.area.code;
    if (data.chooseAddress) {
      var editCode = thisPage.data.chooseAddress.region_code;
      var editLocation = thisPage.data.chooseAddress.province + '-' + thisPage.data.chooseAddress.city + '-' + thisPage.data.chooseAddress.district;

      requestUrl = '/app/updateCustomerAddress';
      requestParam = {
        id: data.chooseAddress.id,
        customer_id: app.globalData.customerInfo.id,
        receiver_name: data.name,
        phone_num: data.phone,
        region_code: (data.location == editLocation ? editCode : codeStr),
        address_details: data.address
      };
    } else {
      requestUrl = '/app/addCustomerAddress';
      requestParam = {
        customer_id: app.globalData.customerInfo.id,
        receiver_name: data.name,
        phone_num: data.phone,
        region_code: codeStr,
        address_details: data.address
      };
    }

    wx.request({
      url: app.globalData.domainName + requestUrl,  //接口地址
      data: requestParam,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.setData({
            addressPannel_hidden: true
          })
          thisPage.getAddressList();    //获取地址列表
        }else{
          console.error('error:',returnData);
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
  //操作地址
  operateAddress: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var addressId = dataSet.param;
    var operateType = dataSet.type;

    for (var i = 0; i < this.data.addressList.length; i++) {
      var addressObj = this.data.addressList[i];
      if (addressObj.id == addressId) {
        if (operateType==1){  //编辑
          thisPage.setData({
            chooseAddress: addressObj,
            formTitle: '编辑地址',
            addressPannel_hidden: false,
            addressPicker_hidden: true,
            tips_hidden: true,
            name: addressObj.receiver_name,
            phone: addressObj.phone_num,
            location: addressObj.province + '-' + addressObj.city + '-' + addressObj.district,
            address: addressObj.address_details
          })
        } else if (operateType == 2){ //删除
          thisPage.confirmDeleteAddress(addressId);   //是否删除地址
        }
        return; 
      }
    }
  },
  //设定显示的省份
  setShowProvince: function () {
    var thisPage = this;
    var provinceArr = thisPage.data.provinceArr;

    var region_code = thisPage.data.chooseAddress.region_code;
    var codeArr = region_code.split(",");
    var index = util.getIndexFromArray(provinceArr, "code", codeArr[0]);
    thisPage.setData({
      province: provinceArr[index],    //省
      addressArr: [index, 0, 0]
    })
    console.info("省index",index);
    thisPage.getCityData(codeArr[0], codeArr[1], codeArr[2]);   //获取市级数据
  },
  //是否删除地址
  confirmDeleteAddress: function (addressId) {
    var thisPage = this;

    wx.showModal({
      title: '提示',
      content: '请确认是否删除该地址？',
      success: function (res) {
        if (res.confirm) {
          thisPage.deleteAddress(addressId);    //删除地址
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },
  //删除地址
  deleteAddress: function (addressId) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/deleteCustomerAddress',  //接口地址
      data: {
        id: addressId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.getAddressList();    //获取地址列表
        } else {
          app.showWarnMessage("删除失败！");
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
  //设置默认地址
  setDefaultAddress: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var addressId = dataSet.param;

    wx.request({
      url: app.globalData.domainName + '/app/setDefaultAddress',  //接口地址
      data: {
        customer_id: app.globalData.customerInfo.id,
        id: addressId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.getAddressList();    //获取地址列表
        } else {
          app.showWarnMessage("设置失败！");
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
  //选择订单地址
  chooseOrderAddress: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var addressId = dataSet.param;

    if (thisPage.data.isChoose){
      for (var i = 0; i < thisPage.data.addressList.length; i++) {
        var addressObj = thisPage.data.addressList[i];
        if (addressObj.id == addressId) {
          addressObj.choose = true;
          app.globalData.choosedOrderAddress = addressObj;
        }else{
          addressObj.choose = false;
        }
      }

      this.setData({
        addressList: thisPage.data.addressList
      })
      app.pageBack(1);
    }
  },

 


})