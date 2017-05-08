/*写入-函数*/
	function setCookie(name,value,expires){
		document.cookie=name+"="+value
		+";expires="+expires.toGMTString();
	}

/*读取-函数*/
	function getCookie(name){
		var cookies=document.cookie;
		var namei=cookies.indexOf(name);
		if(namei!=-1){
			var starti=namei+name.length+1;
			var spi=cookies.indexOf(";",starti);
			var value=
			spi!=-1?cookies.slice(starti,spi):
			cookies.slice(starti);
			return value;
		}else{
			return "";
		}
	}



var game={
	data:null,//保存游戏的数据：二维数组
	RN:4,//总行数
	CN:4,//总列数
	score:0,//保存当前得分
	topScore:0,//保存最高分
	state:1,//保存游戏状态
	RUNNING:1,//运行中
	GAMEOVER:0,//游戏结束
	PLAYING:2,//有动画正在播放
	CSIZE:100,//格子的大小
	MARGIN:16,//格子的间距
	init:function(){
		/*动态生成gridPanel中的div*/
		//r从0开始，到<RN结束，同时创建空数组arr
			//c从0开始，到<CN结束
				//向数组中压入：""+r+c
		for(var r=0,arr=[];r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				arr.push(""+r+c);
			}
		}
		var strGrid='<div id="g'
			+arr.join('" class="grid"></div><div id="g')
			+'"class="grid"></div>';
		var strCell='<div id="c'
			+arr.join('" class="cell"></div><div id="c')
			+'" class="cell"></div>';
		//设置id为gridPanel的内容为strGrid+StrCell
		gridPanel.innerHTML=strGrid+strCell;
		//计算gridPanel的宽高
		var width=this.CN*116+16+"px";
		var height=this.RN*116+16+"px";
		//设置gridPanel的宽和高
		gridPanel.style.width=width;
		gridPanel.style.height=height;
	},
	
	//强调:
	//1.对象自己的方法访问自己的属性，都要用this.属性名
	//2.每个属性和方法之间必须用逗号分隔
	start:function(){
		//动态生成gridPanel中的div
		this.init();
		
		this.state=this.RUNNING;
		//从cookie中读取最高分
		this.topScore=getCookie("topScore");
		this.topScore==""&&(this.topScore=0);
		
		this.score=0;//分数归零
		/*初始化 data 为 RNxCN 的二维数组*/
		//新建空数组保存在当前对象的data属性中
		this.data=[];
		//r从0开始，到<RN结束，每次增1
		for(var r=0;r<this.RN;r++){
			//创建空数组，保存在data的r行
			this.data[r]=[];
			//c从0开始，到<CN结束，每次增1
			for(var c=0;c<this.CN;c++){	
				//设置data中r行c列为0
				this.data[r][c]=0;
				
			}
		}//(遍历结束)
		//调用2次randomNum方法，生成2个随机数
		this.randomNum();
		this.randomNum();
		this.updateView();//更新界面
		//绑定键盘事件
		document.onkeydown=function(e){
			//this(默认指.前的对象)->document
			if(this.state==this.RUNNING){//为了防止动画冲突，用RUNNING跟PLAYING来区分
			//用bind,this->start方法的this->game
				switch(e.keyCode){
					case 37:this.moveLeft();break;
					case 38:this.moveUp();break;
					case 39:this.moveRight();break;
					case 40:this.moveDown();break;
				}
			}
		}.bind(this);
	},
	
	/*********判断游戏是否结束*********/
	isGameOver:function(){
		//遍历data中每个元素
			//如果当前元素是0
				//返回false
			//如果c<CN-1，且当前元素等于右侧元素
				//返回false
			//如果r<RN-1，且当前元素等于下方元素
				//返回false
			//(遍历结束)
			//返回true
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if(this.data[r][c]==0){
					return false;
				}
				if((c<this.CN-1)&&(this.data[r][c]==this.data[r][c+1])){
					return false;
				}
				if((r<this.RN-1)&&(this.data[r][c]==this.data[r+1][c])){
					return false;
				}
			}
		}
		return true;
	},
	
	
	/********移动**********/
	move:function(iterator){
		//移动之前为data拍照
		var before=String(this.data);
		iterator();//this->game
		//给data拍照，保存在after中
		var after=String(this.data);
		//如果before!=after
		if(before!=after){
			this.state=this.PLAYING;//先执行动画，避免动画冲突，执行完在把this.state=this.RUNNING;
			animation.start(function(){
			this.randomNum();//随机生成新数
			//如果游戏结束
			if(this.isGameOver()){
				//修改游戏状态为GAMEOVER;
				this.state=this.GAMEOVER;
				//如果当前得分>最高分
				if(this.score>this.topScore){
					setCookie("topScore",this.score,new Date("2099/1/1"));
				}
			}
			this.updateView();//更新页面
			this.state=this.RUNNING;
			}.bind(this));
			
		}
	},
	
	/****************************左移*********************/
	moveLeft:function(){//移动所有行
		this.move(function(){
			//r从0开始，到<RN结束，遍历data中每一行
			for(var r=0;r<this.RN;r++){
				this.moveLeftInRow(r);
			}//(遍历结束)
		}.bind(this));
    },
	
	moveLeftInRow:function(r){//移动第r行
    //c从0开始，到<CN-1结束,遍历data中r行的每个元素
		for(var c=0;c<this.CN-1;c++){
			var nextc=this.getNextInRow(r,c);
			//如果nextc等于-1，退出循环
			if(nextc==-1){
				break;
			}else if(this.data[r][c]==0){
			//否则
				//如果data中r行c列等于0
				  //将data中r行c列的值设置为data中r行nextc列的值
				  //将data中r行nextc列的值置为0 
				this.data[r][c]=this.data[r][nextc];
				this.data[r][nextc]=0;
				animation.addTask(r,nextc,c-nextc,0);
				c--; //c留在原地
			}else if(this.data[r][c]==this.data[r][nextc]){
			//否则，如果data中r行c列等于data中r行nextc列的值
			  //将data中r行c列的值*2
			  //将data中r行nextc列的值置为0
				this.data[r][c]*=2;
				this.data[r][nextc]=0;
				//将r行c列的新值累加到score中
				this.score+=this.data[r][c];
				animation.addTask(r,nextc,c-nextc,0);
			}
		}
	},
	
	getNextInRow:function(r,c){
    /*查找r行c列右侧下一个不为0的位置*/
		//nextc从c+1开始，nextc到<CN结束
		
		for(var nextc=c+1; nextc<this.CN;nextc++){
			//如果data中r行nextc位置不等于0
			//(this.data[r][nextc]!=0)&&(return nextc);
			if(this.data[r][nextc]!=0){return nextc}
			
			//返回nextc
		}//(遍历结束)
		return -1;
		//返回-1
	},
	
	/****************************上移*********************/
	moveUp:function(){//上移所有列
		this.move(function(){
			for(var c=0;c<this.CN;c++){
			this.moveUpInCol(c);
			}//(遍历结束)
		}.bind(this));
    },
	
	moveUpInCol:function(c){//移动第c列
    //r从0开始，到<RN-1结束,递增1
		for(var r=0;r<this.RN-1;r++){
			var nextr=this.getNextInCol(r,c);
			//如果nextc等于-1，退出循环
			if(nextr==-1){
				break;
			}else if(this.data[r][c]==0){
			//否则
				//如果data中r行c列等于0
				  //将data中r行c列的值设置为data中r行nextc列的值
				  //将data中r行nextc列的值置为0
				this.data[r][c]=this.data[nextr][c];
				this.data[nextr][c]=0;
				animation.addTask(nextr,c,0,r-nextr);
				r--;//c留在原地
			}else if(this.data[r][c]==this.data[nextr][c]){
			//否则，如果data中r行c列等于data中r行nextc列的值
			  //将data中r行c列的值*2
			  //将data中r行nextc列的值置为0
				this.data[r][c]*=2;
				this.data[nextr][c]=0;
				//将r行c列的新值累加到score中
				this.score+=this.data[r][c];
				animation.addTask(nextr,c,0,r-nextr);
			}
		}
	},
	
	getNextInCol:function(r,c){
    /*查找c列r行下侧下一个不为0的位置*/
		//nextr从r+1开始，nextr到<RN结束
		
		for(var nextr=r+1; nextr<this.RN;nextr++){
			//如果data中r行nextr位置不等于0
			if(this.data[nextr][c]!=0){return nextr}
			
			//返回nextr
		}//(遍历结束)
		return -1;
		//返回-1
	},
	
	/****************************右移*********************/
	moveRight:function(){//右移所有行
		this.move(function(){
			//遍历data中每一行
			for(var r=0;r<this.RN;r++){
				this.moveRightInRow(r);
			}//(遍历结束)
		}.bind(this));
	},
	
	moveRightInRow:function(r){//右移第r行
	//c从CN-1开始，到>0结束,遍历data中r行的每个元素
		for(var c=this.CN-1;c>0;c--){
			var prevc=this.getPreInRow(r,c);
			//如果nextc等于-1，退出循环
			if(prevc==-1){
				break;
			}else if(this.data[r][c]==0){
			//否则
				//如果data中r行c列等于0
				  //将data中r行c列的值设置为data中r行nextc列的值
				  //将data中r行nextc列的值置为0  
				this.data[r][c]=this.data[r][prevc];
				this.data[r][prevc]=0;
				animation.addTask(r,prevc,c-prevc,0);
				c++;//c留在原地
			}else if(this.data[r][c]==this.data[r][prevc]){
			//否则，如果data中r行c列等于data中r行nextc列的值
			  //将data中r行c列的值*2
			  //将data中r行nextc列的值置为0
				this.data[r][c]*=2;
				this.data[r][prevc]=0;
				//将r行c列的新值累加到score中
				this.score+=this.data[r][c];
				animation.addTask(r,prevc,c-prevc,0);
			}
		}
	},
	
	getPreInRow:function(r,c){
    /*查找r行c列左侧前一个不为0的位置*/
		//prevc从c-1开始，到>=0结束,递减1
		for(var prevc=c-1; prevc>=0;prevc--){
			//如果data中r行nextc位置不等于0
			if(this.data[r][prevc]!=0){return prevc;}
			
			//返回nextc
		}//(遍历结束)
		return -1;
		//返回-1
	},
	
	/****************************下移*********************/
	moveDown:function(){//移动所有列
		this.move(function(){
			//遍历data中每一列
		for(var c=0;c<this.CN;c++){
			this.moveDownInCol(c);
		}//(遍历结束)
		}.bind(this));
    },
	
	moveDownInCol:function(c){//移动第c列
	//r从RN-1开始，到>0结束,遍历data中c列的每个元素
		for(var r=this.RN-1;r>0;r--){
			var prevr=this.getPrevInCol(r,c);
			//如果prevc等于-1，退出循环
			if(prevr==-1){
				break;
			}else {
			//否则
				if(this.data[r][c]==0){
				//如果data中r行c列等于0
				  //将data中r行c列的值设置为data中r行nextc列的值
				  //将data中r行nextc列的值置为0
				this.data[r][c]=this.data[prevr][c];
				this.data[prevr][c]=0;
				animation.addTask(prevr,c,0,r-prevr);
				r++;//c留在原地
				}else if(this.data[r][c]==this.data[prevr][c]){
			//否则，如果data中r行c列等于data中r行nextc列的值
			  //将data中r行c列的值*2
			  //将data中r行nextc列的值置为0
				this.data[r][c]*=2;
				this.data[prevr][c]=0;
				//将r行c列的新值累加到score中
				this.score+=this.data[r][c];
				animation.addTask(prevr,c,0,r-prevr);
				}
			}
		}
	},
	
	getPrevInCol:function(r,c){
    /*查找c列r行下侧下一个不为0的位置*/
		//nextr从r+1开始，nextr到<RN结束
		//prevr从r-1开始,prevr到>=0结束
		for(var prevr=r-1; prevr>=0;prevr--){
			//如果data中c列prevr位置不等于0
			if(this.data[prevr][c]!=0){return prevr;}
			
			//返回prevr
		}//(遍历结束)
		return -1;
		//返回-1
	},
	


	updateView:function(){
	 //设置id为topScore的元素内容为当前对象的topScore属性
	 topScore.innerHTML=this.topScore;
	 
	 
	 /*将data中的数据更新到页面对应的div中*/
		//遍历data中每个元素
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				//声明变量id，值为:"c"+r+c
				//找到id等于上面id的元素，保存在变量div
				var div=document.getElementById("c"+r+c);
				//如果data中r行c列不等于0
				if(this.data[r][c]!==0){
					//设置div的内容为data中r行c列的值
					div.innerHTML=this.data[r][c];
					//设置div的className属性为：
						//"cell n"+data中r行c列的值
					div.className="cell n"+this.data[r][c];
				//否则
				}else{
					//清除div的内容
					div.innerHTML=null;
					//注：在IE浏览器中，div.innerHTML="",否则null会显示在网页上
					//设置div的className属性为:"cell"
					div.className="cell";
				}
			}
		}
		//设置id为score的元素的内容为当前对象的score属性
		score.innerHTML=this.score;
		//如果游戏的状态是GAMEOVER
		if(this.state==this.GAMEOVER){
			//设置id为finalScore的span的内容为score属性
			finalScore.innerHTML=this.score;
			//找到id为gameOver的div，设置其显示
			gameOver.style.display="block";
		}else{//否则
			//找到id为gameOver的div，设置其隐藏
			gameOver.style.display="none";
		}
	},
	
	
	randomNum:function(){
	  /*在随机的空白位置，生成一个2或4*/
	  //循环
		while(true){
		//在0~ RN-1之间生成一个随机整数，保存在变量r中
		var r=parseInt(Math.random()*this.RN);
		//在0~ CN-1之间生成一个随机整数，保存在变量c中
		var c=parseInt(Math.random()*this.CN);
		
		console.log(r,c);//测试
		//如果data中r行c列等于0
			if(this.data[r][c]==0){
			//设置data中r行c列的值为：
				//调用Math.random(),如果>0.5,值为4，否则值为2;
				this.data[r][c]=Math.random()>0.5?4:2;
				break;//退出循环
			}
		}
	}
}
//页面加载后，启动游戏
window.onload=function(){
	animation.init();//初始化动画引擎
	game.start();
}