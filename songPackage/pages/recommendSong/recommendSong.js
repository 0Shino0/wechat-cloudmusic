import PubSub from 'pubsub-js'
import request from '../../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '',
    month: '',
    recommendList: [], // 每日推荐数据
    index: 0, // 点击个体的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 动态获取日期数据
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1
    })

    // 获取每日推荐
    this.getRecommendList()

    // 订阅songDetail发布的type消息
    PubSub.subscribe('switchType',(msg,switchType)=>{
      // console.log('来自songDetail发布的消息',msg,switchType);
      let {recommendList,index} = this.data;
      if(switchType === 'pre'){ //上一页
        // 第一首音乐 的 上一首是 最后一首
        (index === 0) && (index = recommendList.length)
        index -= 1;
      }else { // 下一首
        // 最后一首的下一首 是 第一首
        (index === recommendList.length-1) && (index = -1)
        index += 1;
      }
      // 更新index
      this.setData({
        index
      })
      let musicId = recommendList[index].id
      // 将最新musicid发送给 songDetail
      PubSub.publish('musicId',musicId);

    })
  },

  // 获取每日推荐recommendList数据的功能函数
  async getRecommendList(){
    let recommendListDate = await request('/recommend/songs')
    // 更新状态
    this.setData({
      recommendList: recommendListDate.data.dailySongs
    })
  },

  // 跳转至songDetail的回调
  toSongDetail(event){
    // let song = event.currentTarget.dataset.song;
    // let musicId = event.currentTarget.dataset.id;
    let {song,musicid,index} = event.currentTarget.dataset

    // 更新记录点击音乐
    this.setData({
      index
    })

    console.log(song);
    // 路由跳转传参: query 
    wx.navigateTo({
      // url: '/pages/songDetial/songDetial?song='+JSON.stringify(song),
      url: '/songPackage/pages/songDetial/songDetial?musicId='+musicid,
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