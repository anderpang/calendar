# calendar
日程日历

<a target="_blank" href="http://htmlpreview.github.io/?http://github.com/anderpang/calendar/blob/master/index.html">演示地址</a>

```javascript
     var calender=new Calendar({
         el:"#app",    //嵌入的父元素 
         onSelected:function(year,month,day){     //选择日期时响应
             console.log("selected:",year,month,day);
         },
         onChange:function(year,month){           //切换日期时触发
            console.log("change",year,month);
         },
         ,today:20190224     //可设定今天，支持整型及Date对象
         ,selected:20180906,  //可设定选中日期，支持整型及Date对象
         ,limits:[20181010]   //有效日期范围，有效值[10000101,99990101]
     });
     
     //方法：
     calender.renderCells(function(cell,year,month,day){
          //渲染当前日期的单元格，cell为单元格dom对象
     });
```

### 如果不加载日程，可当普通日历选择控件来用

