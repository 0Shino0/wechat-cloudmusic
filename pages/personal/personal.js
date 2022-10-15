import request from '../../utils/request'

let startY = 0; //手指起始坐标
let moveY = 0; //手指移动实时的坐标
let moveDistance = 0; //手指移动的距离

// pages/personal/personal.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform:'translateY(0)',
    coverTransition: '',
    userInfo: {}, // 存储用户信息
    recentPlayList: [], // 用户播放记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      // 读取本地用户的信息
      let userInfo = wx.getStorageSync('userInfo');
      if(userInfo){ // 说明用户登录
        this.setData({ 
          userInfo
        })
      }

      // 发请求获取用户播放记录
      this.getRecentPalyData(this.data.userInfo.userId);
  },

  // 发请求获取用户播放记录
  async getRecentPalyData(userId){
    let result = await request('/user/record',{uid: userId,type: 0})
    let index = 0;
    // 利用 map 对数据进行加工, 添加 id 为唯一标识
    let recentPlayList = result.allData.slice(0,10).map(item => {
      item.id = index++;
      return item;
    });
    // console.log(recentPlayList);

    this.setData({
      recentPlayList
    })
  },

  // 手指点击事件
  handleTouchStart(event){
    // 清除上一次 的过渡效果
    this.setData({
      coverTransition: ''
    })

    // 获取手指起始坐标
    startY = event.touches[0].clientY; //捕获第一个手指
  },
  // 手指移动事件
  handleTouchMove(event){
    // 
    moveY = event.touches[0].clientY;

    // 计算手指移动距离
    moveDistance = moveY - startY;
    if(moveDistance < 0 ){
      return;
    }
    if(moveDistance >=  80 ){
      moveDistance = 80;
    }

    // 控制cover移动，更新coverTransform的状态数据
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  // 手指离开事件
  handleTouchEnd(){
    this.setData({
      coverTransform: `translateY(0)`,
      coverTransition: 'transform 0.5s linear'
    })
  },

  // 个人中心
  toLogin(){
    if(this.data.userInfo.nickname){
      return;
    }

    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})