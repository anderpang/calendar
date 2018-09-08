/*! <anderpang@foxmail.com> */
"use strict";
/**
 * 日历控件
 * 使用示例：
 * new Calendar({
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
     
     方法：
     calender.renderCells(function(cell,year,month,day){
          //渲染当前日期的单元格，cell为单元格dom对象
     });
 */

(function (global, factory){
    typeof exports === 'object' && typeof module === 'object' ?
       module.exports = factory():
       global.Calendar = factory();
  })(this,function (){
    
    function Calendar(settings){
        this.config(settings||{})
            .init();        
    }
    Calendar.prototype={
       noop:function(){},
       checkDate:function(date,limits){
          return !(date<limits[0] || date>limits[1]);
       },
       getDateFromObj:function(date){
         return date.getFullYear()*10000+(date.getMonth()+1)*100+date.getDate();
       },
       config:function(settings){
         var  d=document,
              today,
              year,
              month,
              tmp,
              limits=settings.limits,
              _limits=[10000101,99990101];  //时间限制1000年-9999年

          this.el=typeof settings.el==="string"?d.querySelector(settings.el):settings.el;

          //今日处理
          today=settings.today;
            if(typeof today==="number"){
                if(this.checkDate(today,_limits)){
                    this._today=today;
                }
                else{
                    this._today=this.getDateFromObj(new Date());
                }
            }
            else if(today instanceof Date){
               this._today=this.getDateFromObj(today);
            }
            else{
               this._today=this.getDateFromObj(new Date());
            }

          //选中
          tmp=settings.selected;          
            if(typeof tmp==="number"){
                this._selected_day=tmp;
            }
            else if(tmp instanceof Date){
                this._selected_day=this.getDateFromObj(tmp);
            }
            else{
                this._selected_day=0;
            }          

          //时间限制
          this._limits=_limits;
          if(limits){  
              tmp=limits[0];          
              if(typeof tmp==="number"){                
                 if(tmp>_limits[0]&&tmp<_limits[1]){
                     _limits[0]=tmp;
                 }
              }
              else if(tmp instanceof Date){
                 _limits[0]=this.getDateFromObj(tmp);
              }
              
              tmp=limits[1];
              if(typeof tmp==="number"){                
                if(tmp>_limits[0]&&tmp<_limits[1]){
                    _limits[1]=tmp;
                }
             }
             else if(tmp instanceof Date){
                _limits[1]=this.getDateFromObj(tmp);
             }

            if(_limits[0]>_limits[1]){
                _limits[0]+=_limits[1];
                _limits[1]=_limits[0]-_limits[1];
                _limits[0]-=_limits[1];
            }
          }

          //如果今天比限制的时间小，那用限制的时间
          tmp=Math.max(this._today,_limits[0]);
          year=tmp/10000|0;
          month=(tmp-year*10000)/100-1|0; 
          
          this._cur_date=[year,month]; //用于计算显示日历,month从0开始
          this._showIndex=0;
          
          this.onSelected=settings.onSelected||this.noop;
          //this.onCellRender=settings.onCellRender||this.noop;
          this.onChange=settings.onChange||this.noop;

          return this;
       },
       renderCells:function(f){
           var cells=this.shows[(this._showIndex%3+3)%3].children,
               cur_date=this._cur_date,
               year=cur_date[0],
               month=cur_date[1]+1,
               day=1,
               i=0,
               ii=cells.length;

            for(;i<ii;i++){
                cells[i].innerHTML&&
                f(cells[i],year,month,day++);
            }
            return this;
       },
       init:function(){
        var d=document,
            wrap=d.createElement("div"),
            tg=function(cls){
                var c=wrap.cloneNode(true);
                c.className=cls;
                return c;
            },
            header=tg("cld-header"),
            main=tg("cld-main"),
            yearBar=tg("cld-year-bar"),
            dateBar=tg("cld-date-bar"),
            monthBar=tg("cld-mon-bar"),
            weekBar=tg("cld-week-bar"),
            dateInner=tg("cld-date-inner cld-anim"),

            yearShow=tg("cld-year-show"),
            monShow=tg("cld-mon-show"),
            todayShow=tg("cld-today-show"),

            shows=[this.initDateShow()];

            shows[1]=shows[0].cloneNode(true);
            shows[2]=shows[0].cloneNode(true);

            this.header=header;
            this.main=main;
            this.yearBar=yearBar;

            this.monthBar=monthBar;
            this.dateInner=dateInner;

            this.yearShow=yearShow;
            this.monShow=monShow;

            this.shows=shows;

            /***   日历头部 start *****/
            todayShow.innerHTML="今天";
            header.appendChild(tg("cld-move-left"));
            header.appendChild(yearShow);
            header.appendChild(monShow);
            header.appendChild(todayShow);

            header.appendChild(tg("cld-move-right"));
            /***   日历头部 end *****/

            //初始化星期
            this.initWeek(weekBar)

                .fillDate(shows[0],0)  //初始化日期
                .fillDate(shows[1],1)
                .fillDate(shows[2],-1)
            
                .updateHeader();//更新头部日期

            dateInner.appendChild(shows[0]);
            dateInner.appendChild(shows[1]);
            dateInner.appendChild(shows[2]);

            dateBar.appendChild(weekBar);
            dateBar.appendChild(dateInner);

            main.appendChild(yearBar);
            main.appendChild(dateBar);
            main.appendChild(monthBar);

            wrap.appendChild(header);
            wrap.appendChild(main);

            wrap.className="calendar-wrap";

            //事件
            wrap.addEventListener("click",this,false);            
            if(typeof dateBar.ontouchstart!=="undefined"){
                this.evts.touchcancel=this.evts.touchend;
                dateBar.addEventListener("touchstart",this,false);
                dateBar.addEventListener("touchmove",this,false);
                dateBar.addEventListener("touchend",this,false);
                dateBar.addEventListener("touchcancel",this,false);
            }
            else
            {
                this.evts.mouseleave=this.evts.mouseup;
                dateBar.addEventListener("mousedown",this,false);
                dateBar.addEventListener("mousemove",this,false);
                dateBar.addEventListener("mouseup",this,false);
                dateBar.addEventListener("mouseleave",this,false);
            }
            

           this.el.appendChild(wrap);
           return this;
    
       },
       handleEvent:function(e){
           var tye=e.type,
               t,
               cls;

            if(tye==="click")
            {
                //拖拽时禁用点击事件
                if(this._disableClick){
                    this._disableClick=false;
                    return;
                }
                t=e.target;
                cls=t.className;
                if(cls){
                    if(cls==="cld-date-cell cld-date-today"){
                        this.evts["cld-date-cell"].call(this,t,e);
                    }
                    else{
                        this.evts[cls]&&this.evts[cls].call(this,t,e);
                    }              
                }
            }
            else
            {
                this.evts[tye]&&this.evts[tye].call(this,e);
            }
       },
       evts:{
           "cld-date-cell":function(t,e){
                var date=t._date,
                    old;

                    e.preventDefault();
                    e.stopPropagation();

                    this._selected_day=date;

                    old=this.dateInner.querySelector(".cld-date-sel");
                    old&&old.classList.remove("cld-date-sel");

                    t.classList.add("cld-date-sel");

                    this.triggerSelected();
            },
            "cld-move-left":function(t,e){
                var showIndex=--this._showIndex,
                    cur_date=this._cur_date,
                    year=cur_date[0],
                    month=cur_date[1];
                e.stopPropagation();

                if(year===1000 && month===0){
                    this._showIndex++;
                    return;
                }

                this.setTranslate(this.dateInner,"translate3d("+(showIndex*-100)+"%,0,0)");
                
                if(month===0){
                    month=11;
                    cur_date[0]--;
                }
                else
                {
                    month--;
                }
                this.changeMonth(month)
                    .updateHeader()
                    .fillDate(this.shows[(showIndex%3+3-1)%3],-1);
            },
            "cld-move-right":function(t,e){
                var showIndex=++this._showIndex,
                    cur_date=this._cur_date,
                    year=cur_date[0],
                    month=cur_date[1];
                e.stopPropagation();

                if(year===9999 && month===11){
                    this._showIndex--;
                    return;
                }

                this.setTranslate(this.dateInner,"translate3d("+(showIndex*-100)+"%,0,0)");
                             
                if(month===11){
                    month=0;
                    cur_date[0]++
                }
                else
                {
                    month++;
                }

                this.changeMonth(month)                
                     .updateHeader()
                     .fillDate(this.shows[(showIndex%3+3+1)%3],1);                    
                
            },
            //点击头部年份
            "cld-year-show":function(t,e){
                var year=this._cur_date[0],
                    main=this.main,
                    yearBar=this.yearBar,
                    count=yearBar.childElementCount;
                e.stopPropagation();
                
                this._year_page=0;
                count?this.fillYear(year,0):
                    this.initYearBar(year);
                
                this.setTranslate(main,"translate3d(0,100%,0)");
            },
            //点击头部月份
            "cld-mon-show":function(t,e){
                var month=this._cur_date[1],
                    main=this.main,
                    monthBar=this.monthBar,
                    count=monthBar.childElementCount,
                    cells,
                    cell;
                e.stopPropagation();

                if(count){                   
                   cell=this.monInner.querySelector(".cld-cur-mon");
                   cells=this.monInner.children;
                   if(cell!==cells[month]){
                       cell.classList.remove("cld-cur-mon");
                       cells[month].classList.add("cld-cur-mon");
                   }
                }
                else{
                   this.initMonthBar(month);
                }
                
                this.setTranslate(main,"translate3d(0,-100%,0)");
            },
            //点击头部今天按钮
            "cld-today-show":function(t,e){
                var cur_date=this._cur_date,
                    today=this._today,
                    year=today/10000|0,
                    month=(today-year*10000)/100-1|0;
                e.stopPropagation();
                if(cur_date[0]===year && cur_date[1]===month){
                    this.moveToDateBar();
                    return;
                }

                cur_date[0]=year;
                cur_date[1]=month;

                this.dateReset()
                    .updateHeader()
                    .moveToDateBar();
            },
            //返回按钮
            "cld-back-btn":function(t,e){                
                e.stopPropagation();
                this.moveToDateBar();
            },
            //年份往前
            "cld-year-prev":function(t,e){
                var year=this._cur_date[0];
                e.stopPropagation();
                this._year_page++;
                this.fillYear(year,-1);
            },
            //年份往后
            "cld-year-next":function(t,e){
                var year=this._cur_date[0];
                e.stopPropagation();
                this._year_page--;
                this.fillYear(year,1);
            },
            //选择年份
            "cld-year-cell":function(t,e){
                var cur_date=this._cur_date,
                    year=t.innerHTML*1;

                cur_date[0]=year;
                cur_date[1]=0;
                this.dateReset()
                    .updateHeader()
                    .moveToDateBar();
            },
            //选择月份
            "cld-mon-cell":function(t,e){
                var cur_date=this._cur_date,
                    month=t.innerHTML-1;

                cur_date[1]=month;
                this.dateReset()
                    .updateHeader()
                    .moveToDateBar();
            },

            //滑动切换事件
            mousedown:function(e){
                var t=e.currentTarget;
                this._ow=t.clientWidth;
                this._cy=e.clientY;
                this._cx=e.clientX;
                this._startTime=e.timeStamp;
                this._is_down=true;
                this._disableClick=false;
                this.dateInner.classList.remove("cld-anim");

            },
            mousemove:function(e){
                if(this._is_down){
                    var cy=e.clientY-this._cy,
                        cx=e.clientX-this._cx,
                        cx2=Math.abs(cx);
                    if(Math.abs(cy)<cx2){
                        this.setTranslate(this.dateInner,"translate3d("+(-this._showIndex*this._ow+cx-cx2/(this._ow*2)*cx)+"px,0,0)");
                    }
                }
            },
            mouseup:function(e){
                if(this._is_down){
                    var t=this.dateInner,
                        cy2=Math.abs(e.clientY-this._cy),
                        cx=e.clientX-this._cx,
                        cx2=Math.abs(cx),
                        time=e.timeStamp-this._startTime,
                        year=this._cur_date[0]*100+this._cur_date[1];

                    e.stopPropagation();

                    this._is_down=false;
                    t.classList.add("cld-anim");
                    t.offsetWidth;
                    
                    if(cy2<cx2){
                        if(time<300 || cx2>this._ow*0.2){
                            this._disableClick=true;
                            
                            if(cx>0){
                               //往右拖不能小于1000年00（即1月）
                               if(year!==100000){
                                   this.evts["cld-move-left"].call(this,t,e);
                                   return;
                               }
                            }
                            else
                            {
                               //往左拖不能天于9999年11（即12月）
                               if(year!==999911){
                                   this.evts["cld-move-right"].call(this,t,e);
                                   return;
                               }
                            }
                        }
                    } 

                    this.setTranslate(t,"translate3d("+(this._showIndex*-100)+"%,0,0)");
                    if(cy2+cx2>5){
                        this._disableClick=true;
                    }
                   
                }
            },
            touchstart:function(e){
                var touch=e.targetTouches[0];
                e.clientX=touch.clientX;
                e.clientY=touch.clientY;
                this.evts.mousedown.call(this,e);
            },
            touchmove:function(e){
                var touch=e.targetTouches[0];
                e.clientX=touch.clientX;
                e.clientY=touch.clientY;
                this.evts.mousemove.call(this,e);
            },
            touchend:function(e){
                var touch=e.changedTouches[0];
                e.clientX=touch.clientX;
                e.clientY=touch.clientY;
                this.evts.mouseup.call(this,e);
                this._disableClick=false;
            }
                
        },
        setTranslate:function(el,css){
            el.style.transform=el.style.webkitTransform=css;
            return this;
        },
        //移动日期面板
        moveToDateBar:function(){
            this.setTranslate(this.main,"translate3d(0,0,0)");
            return this;
        },
       initDateShow:function(){
          var show=document.createElement("div"),
              cell=show.cloneNode(false),
              i=41;  //一周7天 * 6行=42,减去1个

              cell.className="cld-date-cell";
              show.className="cld-date-show";
              show.appendChild(cell);
           while(i--){
              show.appendChild(cell.cloneNode(true));
           }
           
           return show;
       },
       weeks:["日","一","二","三","四","五","六"],
       initWeek:function (el){
          var span=document.createElement("span"),
              ws=this.weeks,
              i=1,
              ii=ws.length;
              span.className="cld-week-cell";
              span.innerHTML=ws[0];
              el.appendChild(span);
          for(;i<ii;i++){
              span=span.cloneNode(true);
              span.innerHTML=ws[i];
              el.appendChild(span);
          }

          return this;         
       },
       //填充日期
       fillDate:function (el,offset){
          var today=this._today,
              showIndex=this._showIndex,
              selected_day=this._selected_day,
              isSelected=!!selected_day,              
              cur_date=this._cur_date,
              year=cur_date[0],
              month=cur_date[1],
              date,    //一个月中最后一天
              lastDate,
              week,
              startIndex,
              index=1,
              i=0,
              cells=el.children,
              ii=cells.length,
              cell,
              comput,
              minDate=this._limits[0],
              maxDate=this._limits[1];

        //脱离流     
        el.style.display="none";
        
        //计算显示日期
        month+=offset;
        if(month<0){
            month=11;
            year--;
        }
        else if(month>11){
            month=0;
            year++;
        }
        month+=1;

        //出界的日期不显示
        if(year<1000 || year>9999){
            return this;
        }

        date=new Date(year,month,0);    //一个月中最后一天
        lastDate=date.getDate();
        week=date.getDay();
        startIndex=(week+8-lastDate%7)%7;

        //console.log(year,month,lastDate,"week:"+week,startIndex)
        el._date=year*100+month;

        for(;i<startIndex;i++){
            cell=cells[i];
            cell.innerHTML="";
            cell.className="cld-date-cell cld-date-disabled";
        }

        for(;index<=lastDate;i++,index++){
            comput=year*10000+month*100+index;
            cell=cells[i];

            cell.innerHTML=index;
            cell._date=comput;
            if(comput===today){
                cell.className=isSelected&&comput===selected_day?"cld-date-cell cld-date-today cld-date-sel":"cld-date-cell cld-date-today";
            }
            else if(comput===selected_day){
                cell.className="cld-date-cell cld-date-sel";
            }
            else
            {
                cell.className="cld-date-cell";
            }

            if(comput<minDate || comput>maxDate){
                cell.classList.add("cld-date-limit");
            }
        }

        for(;i<ii;i++){
            cell=cells[i];
            cell.innerHTML="";
            cell.className="cld-date-cell cld-date-disabled";
        }  
        
        el.style.left=(offset+showIndex)*100+"%";

        el.style.display="";

        return this;
      },
     //更新头部信息
      updateHeader:function (){
          var cur_date=this._cur_date,
              year=cur_date[0],
              month=cur_date[1]+1;
          
          this.yearShow.innerHTML=year;
          this.monShow.innerHTML=month;

          this.onChange(year,month);

          return this;
      },
      //更改显示的月份（滑动或点击选择面板,0-11)
      changeMonth:function (month){
           this._cur_date[1]=month;
           return this;
      },
      //初始化年份面板
      initYearBar:function(year){
        var d=document,
            s=d.createElement("span"),
            yearBar=this.yearBar,
            header=yearBar.cloneNode(false),
            yearInner=header.cloneNode(false),
            backBtn=s.cloneNode(false),
            frag=d.createDocumentFragment(),
            i=0,
            ii=10;

            header.className="cld-year-header";
            header.innerHTML="选择年份";

            backBtn.className="cld-back-btn";
            backBtn.innerHTML="返回";
            header.appendChild(backBtn);
            frag.appendChild(header);

            yearInner.className="cld-year-inner";
            s.className="cld-year-prev";
            s.innerHTML="往前";
            yearInner.appendChild(s);
            for(;i<ii;i++){
                s=s.cloneNode(false);
                yearInner.appendChild(s);
            }
            s=s.cloneNode(false);
            s.className="cld-year-next";
            s.innerHTML="往后";
            yearInner.appendChild(s);
            frag.appendChild(yearInner); 

            this.yearInner=yearInner;
            this._year_page=0;  //于用年份翻页
            yearBar.appendChild(frag);

            return this.fillYear(year,0);
      },
      //填充年份
      fillYear:function(year,dir){
           var  startYear=year-year%10,
                i=0,
                ii=10,
                page=this._year_page*10,  //每页10年
                cells,
                cell,
                n;

           startYear-=page;

           if(startYear<1000 || startYear>9999){
               this._year_page+=dir;  //把页数返回
               return this;
           }
           
           cells=this.yearInner.children;

           for(;i<ii;i++){
              cell=cells[i+1];
              n=startYear+i;
              cell.innerHTML=n;
              cell.className=year===n?"cld-year-cell cld-cur-year":"cld-year-cell";
           }
           return this;
      },
      //改变年份、月份后重置日期面板
      dateReset:function(){
          var shows=this.shows,
              dateInner=this.dateInner;
          this._showIndex=0;
          dateInner.style.display="none";
          this.fillDate(shows[0],0)
              .fillDate(shows[1],1)
              .fillDate(shows[2],-1)
              .setTranslate(dateInner,"translate3d(0,0,0)");
          dateInner.offsetHeight;
          dateInner.style.display="";

          return this;
      },   
      //初始化月份面板
      initMonthBar:function(month){
        var d=document,
            s=d.createElement("span"),
            monthBar=this.monthBar,
            header=monthBar.cloneNode(false),
            monInner=header.cloneNode(false),
            backBtn=s.cloneNode(false),
            frag=d.createDocumentFragment(),
            i=0,
            ii=12;

            header.className="cld-mon-header";
            header.innerHTML="选择月份";

            backBtn.className="cld-back-btn";
            backBtn.innerHTML="返回";
            header.appendChild(backBtn);
            frag.appendChild(header);

            monInner.className="cld-mon-inner";

            for(;i<ii;s=s.cloneNode(false),i++){
                s.innerHTML=i+1;
                s.className=i===month?"cld-mon-cell cld-cur-mon":"cld-mon-cell";
                monInner.appendChild(s);
            }
            frag.appendChild(monInner); 

            this.monInner=monInner;
            monthBar.appendChild(frag);

            return this;
      },
      triggerSelected:function(){
            if(!this._selected_day)return this;
            var date=this._selected_day,
                y=date/10000|0,
                m=(date-y*10000)/100|0,
                d=date%100;
               
                this.onSelected(y,m,d);
            return this;
       }
    };

    return Calendar;

 });
