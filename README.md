# calendar
日程日历

```javascript
new Calendar({
         el:"#app",    //嵌入的父元素 
         onSelected:function(year,month,day){         //选择日期时响应
             console.log("selected:",year,month,day);
         },
         onCellRender:function(cell,year,month,day){  //日期单元格渲染时回调,year为0时为disabled的单元格
             //console.log("cell",year,month,day)
             if(year){
                 var date=year*10000+month*100+day;
                 if(activityData.indexOf(date)!==-1){
                     cell.insertAdjacentHTML("beforeEnd",'<span class="cld-dot"></span>');
                 }
             }
             else
             {

             }
         }
         ,today:20190224     //可设定今天，支持整型及Date对象
         ,selected:20180906,  //可设定选中日期，支持整型及Date对象
         ,limits:[20181010]   //有效日期范围，有效值[10000101,99990101]
     })
```javascript
