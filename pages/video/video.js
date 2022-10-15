// pages/video/video.js
import request from '../../utils/request'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList:[], // 导航标签数据
    navId: '',  // 导航标签的id标识
    videoList: [], // 视频列表数据
    videoId: '', // video标识
    videoUpdateTime: [],// 记录实时播放的时长
    isTriggered: false // 标记下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取导航标签数据的功能函数
    this.getVideoGroupList()
  },

  // 获取导航标签数据的功能函数
  async getVideoGroupList(){
    let result = await request('/video/group/list');
    // 更新 
    // slice  splice(会影响原数组)
    this.setData({
      videoGroupList: result.data.slice(0,14),
      navId: result.data[0].id
    })

    // 获取视频列表数据的功能函数
    this.getVideoList(this.data.navId)
  },

  // 获取视频列表数据的功能函数
  async getVideoList(navId){
    // 获取推荐视频列表 /video/group   该接口无法获取视频播放地址
    // 获取推荐视频 /video/timeline/recommend?offset=10
    let videoListData = await request('/video/timeline/recommend',{id:navId});
    // 防止没有cookies,参数错误， .map报错
    if(!videoListData.datas){
      return;
    }
    // console.log(videoListData)
    // 加工数组
    let videoList = videoListData.datas.map((item,index) => {
      item.id = index;
      return item;
    })

    // 关闭消息提示框
    wx.hideLoading();

    this.setData({
      videoList,
    })
  },

  // 点击导航切换的回调
  changeNav(event){
    let navId = event.currentTarget.id; // 会自动将 number转化成string
    // let navId =  event.currentTarget.dataset.id;
    // console.log(navId,typeof navId);
    // 修改navId的状态
      // 位移运算符
      // 将目标数据先转化成二进制，然后移动指定的位数，移出去的不要，不够的用零 补齐

      // 位移零位会强制转化数据类型为number
      // 布尔值: !!!
      
    this.setData({
      navId:navId >>> 0,  // 位移零位会强制转化数据类型为number
      videoList: [],
    })

    // 显示正在加载
    wx.showLoading({
      title: '正在加载'
    })

    this.getVideoList(this.data.navId)

  },

  // 点击播放/继续播放的回调  
  handlePlay(event){
    // 关闭定时器
    clearInterval(this.timerVideo)
    /*
      需求:
        1.当播放新的视频的时候关掉之前播放的视频
      思路:
        1. 找到关闭视频的方法  
        2. 必须找到上一个视频，然后关闭 
      设计模式：单例模式
        1. 需要创建多个对象的情况下，使用一个变量来保存,始终只有一个对象
        2. 当创建新的对象的时候会把之前的对象覆盖掉
        3. 节省内存空间
    */
    let vid = event.currentTarget.id;
    // this.videoContext // undefined || 某一个视频的上下文对象
    // this.videoContext && this.vid !== vid && this.videoContext.stop()
    // 
    this.vid = vid;
    
    // 当前点击的vid更新至data中videoId
    this.setData({
      videoId: vid
    })
    // 创建视频上下文对象
    // console.log(this.videoContext);
    this.videoContext = wx.createVideoContext(vid)

    // 判断当前是否有播放记录
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === vid);
    if(videoItem){
      // 跳转至指定位置 VideoContext.seek(number position)
      this.videoContext.seek(videoItem.currentTime);
    }

    // 播放当前视频
    // 开启定时器，延时播放视频， ——  点击视频有声音，没视频的情况
    this.timerVideo = setTimeout(() => {
      this.videoContext.play();
    },250)

    // console.log(this.videoContext);
  },

  // 视频播放进度实时变化的回调
  handleTimeUpdate(event){
    // 1. 整理数据
    let videoTimeObj = {vid:event.currentTarget.id,currentTime: event.detail.currentTime}

    // 2. 添加播放记录到 videoTimeUpdate
    /* 
      思路: 判断videoUpdateTime中是否已经有当前视频的播放记录
        1,如果有:修改播放的时长为当前的时长
        2.如果没有:将当前视频的播放时长记录添加至videoUpdateTime
    */
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === event.currentTarget.id);
    if(videoItem){ // 之前有过
      videoItem.currentTime = event.detail.currentTime;
    }else { // 之前没有过
      videoUpdateTime.push(videoTimeObj)
    }
    
    // 更新videoUpdateTime的状态
    this.setData({
      videoUpdateTime
    })
  },

  // 监听视频播放结束的事件
  handleEnded(event){
    // 将当前视频的播放记录从 videoUpdateTime中移除
    let {videoUpdateTime} = this.data;
    // videoUpdateTime.splice(startIndex,count);
    // videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id);
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id),1);
  },

  // 下拉刷新的回调
  handleRefresher(){
    // 发送请求获取最新的视频数据
    this.getVideoList(this.navId);

    setTimeout(() => {
      console.log(1);
      this.setData({
        isTriggered:false
      })
    },500)
  },

  // scroll-view 上拉触底的回调
  handleToLower(){
    // 模拟假数据
    let newVideoList = {}

    let {videoList} = this.data;
    videoList.push(...newVideoList)

    this.setData({
      videoList
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