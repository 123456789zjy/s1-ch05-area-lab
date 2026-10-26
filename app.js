(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const state = {lang:'both',module:'formula',formula:'triangle',shape:'l',strategy:'cut',cutIndex:0,cutDone:[],drawing:null,hint:false,progress:0,fill:0,revealFormula:false,revealPolygon:false,animation:null,feedback:'start',view:{formula:{angle:0,scale:100},polygon:{angle:0,scale:100}}};
  const bg = '<defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#d9e6e0"/></pattern></defs><rect x="0" y="0" width="560" height="380" fill="url(#dots)"/>';
  const C = {teal:'#15a893',amber:'#efbb48',coral:'#ee8065',ink:'#173042',line:'#65838c'};
  const formulas = [
    {id:'square',name:['正方形','Square'],sub:['由單位方格出發','Start with unit squares'],question:['每行有多少格？一共有多少行？','How many squares per row, and how many rows?'],explain:['逐行數方格，便能看出「邊長 × 邊長」。','Count the grid by rows to see side × side.'],steps:[['數方格','Count squares'],['排成行和列','Rows and columns'],['寫出面積公式','Write the formula']],defaults:[6,6,6]},
    {id:'rectangle',name:['長方形','Rectangle'],sub:['先數方格，再把重複加法寫成乘法','Turn repeated addition into multiplication'],question:['5 行，每行 8 格，如何不用逐格數？','How can you count 5 rows of 8 without counting one by one?'],explain:['行數乘每行的格數，便是整個長方形的面積。','Multiply the number of rows by the number of squares in each row.'],steps:[['觀察方格','Look at the grid'],['數行與列','Count rows and columns'],['寫出面積公式','Write the formula']],defaults:[6,8,5]},
    {id:'parallelogram',name:['平行四邊形','Parallelogram'],sub:['切下一塊，移成長方形','Cut and move a piece to form a rectangle'],question:['切下一角並搬到另一邊，面積有改變嗎？','Does moving a cut-off corner change the area?'],explain:['圖形只是重新排列；長方形的寬是底，另一方向是垂直高。','Rearranging preserves area. The rectangle has the same base and perpendicular height.'],steps:[['找垂直高','Find perpendicular height'],['移動三角形','Move the triangle'],['比較長方形','Compare with a rectangle']],defaults:[6,8,5]},
    {id:'triangle',name:['三角形','Triangle'],sub:['複製一個全等三角形','Duplicate a congruent triangle'],question:['兩個相同的三角形，能拼成甚麼？','What can two identical triangles form?'],explain:['兩個全等三角形拼成一個平行四邊形，因此一個三角形佔一半。','Two congruent triangles form a parallelogram, so one triangle has half its area.'],steps:[['選底與高','Choose base and height'],['複製並拼合','Duplicate and join'],['取平行四邊形一半','Take half']],defaults:[6,8,5]},
    {id:'trapezium',name:['梯形','Trapezium'],sub:['複製並倒轉，拼成平行四邊形','Duplicate and rotate to form a parallelogram'],question:['拼合後，新的底由哪兩段組成？','Which two lengths make the new base?'],explain:['兩個全等梯形拼成底為 a + b、高為 h 的平行四邊形。','Two congruent trapezia form a parallelogram with base a + b and height h.'],steps:[['找兩條平行邊','Find the parallel sides'],['複製並拼合','Duplicate and join'],['取平行四邊形一半','Take half']],defaults:[5,9,4]}
  ];
  const shapes = [
    {id:'l',name:['L 形','L-shape'],title:['例子 A · L 形多邊形','Example A · L-shaped polygon'],sub:['外框 12 × 8；右上缺口 4 × 3（單位：cm）','Outer rectangle 12 × 8; top-right gap 4 × 3 (cm)'],question:['同一個 L 形，橫切和直切會得到甚麼？','How do horizontal and vertical cuts differ?'],explain:['選一種切法，畫線後比較算式；兩種切法應得相同面積。','Choose a cut, draw it, then compare the two area sums.'],poly:'100,80 340,80 340,170 460,170 460,320 100,320',bounds:[100,80,460,320],labels:[['8 cm',220,69],['4 cm',400,162],['3 cm',322,129],['8 cm',71,206],['12 cm',280,349]],fill:['340,80 460,80 460,170 340,170'],fillOffset:[[140,-70]],fillExp:'12 × 8 − 4 × 3 = 84 cm²',fillWhy:['大長方形減去右上缺口。','Subtract the top-right gap from the outer rectangle.'],cuts:[
      {id:'vertical',name:['直切','Vertical cut'],segments:[[[340,170],[340,320]]],parts:['100,80 340,80 340,320 100,320','340,170 460,170 460,320 340,320'],partLabels:[['8 × 8',220,235],['4 × 5',400,258]],exp:'8 × 8 + 4 × 5 = 84 cm²',why:['左邊 8 × 8，右邊 4 × 5。','Left rectangle 8 × 8; right rectangle 4 × 5.']},
      {id:'horizontal',name:['橫切','Horizontal cut'],segments:[[[100,170],[340,170]]],parts:['100,80 340,80 340,170 100,170','100,170 460,170 460,320 100,320'],partLabels:[['8 × 3',220,128],['12 × 5',280,258]],exp:'8 × 3 + 12 × 5 = 84 cm²',why:['上方 8 × 3，下方 12 × 5。','Top rectangle 8 × 3; bottom rectangle 12 × 5.']}
    ]},
    {id:'reverse',name:['反向 L','Reversed L'],title:['例子 B · 反向 L 形','Example B · Reversed L-shape'],sub:['外框 12 × 8；左下缺口 4 × 4（單位：cm）','Outer rectangle 12 × 8; bottom-left gap 4 × 4 (cm)'],question:['把直切改成橫切，算式會怎樣變？','What changes when you switch from a vertical to a horizontal cut?'],explain:['兩種切法分出的長方形不同，但總面積相同。','The rectangles differ, but their total area is the same.'],poly:'100,80 460,80 460,320 220,320 220,200 100,200',bounds:[100,80,460,320],labels:[['12 cm',280,69],['8 cm',482,204],['4 cm',159,193],['4 cm',202,269]],fill:['100,200 220,200 220,320 100,320'],fillOffset:[[-120,80]],fillExp:'12 × 8 − 4 × 4 = 80 cm²',fillWhy:['大長方形減去左下缺口。','Subtract the bottom-left gap from the outer rectangle.'],cuts:[
      {id:'vertical',name:['直切','Vertical cut'],segments:[[[220,80],[220,200]]],parts:['100,80 220,80 220,200 100,200','220,80 460,80 460,320 220,320'],partLabels:[['4 × 4',160,147],['8 × 8',340,230]],exp:'4 × 4 + 8 × 8 = 80 cm²',why:['左上 4 × 4，右邊 8 × 8。','Upper-left rectangle 4 × 4; right rectangle 8 × 8.']},
      {id:'horizontal',name:['橫切','Horizontal cut'],segments:[[[220,200],[460,200]]],parts:['100,80 460,80 460,200 100,200','220,200 460,200 460,320 220,320'],partLabels:[['12 × 4',280,145],['8 × 4',340,268]],exp:'12 × 4 + 8 × 4 = 80 cm²',why:['上方 12 × 4，下方 8 × 4。','Top rectangle 12 × 4; bottom rectangle 8 × 4.']}
    ]},
    {id:'house',name:['屋形','House'],title:['例子 C · 屋形五邊形','Example C · House-shaped pentagon'],sub:['屋身 10 × 6；屋頂三角形高 4（單位：cm）','Body 10 × 6; roof triangle height 4 (cm)'],question:['屋頂和屋身怎樣分開？','How can you separate the roof and body?'],explain:['上方是三角形，下方是長方形。','The roof is a triangle; the body is a rectangle.'],poly:'130,150 280,30 430,150 430,330 130,330',bounds:[130,30,430,330],labels:[['10 cm',280,354],['6 cm',455,250],['4 cm',293,97]],fill:['130,30 280,30 130,150','280,30 430,30 430,150'],fillOffset:[[-130,-50],[130,-50]],fillExp:'10 × 10 − 2 × (½ × 5 × 4) = 80 cm²',fillWhy:['補成 10 × 10 長方形，減去兩個三角形。','Complete a 10 × 10 rectangle, then subtract two triangles.'],cuts:[{id:'roof',name:['屋頂與屋身','Roof and body'],segments:[[[130,150],[430,150]]],parts:['130,150 430,150 430,330 130,330','130,150 280,30 430,150'],partLabels:[['10 × 6',280,255],['½ × 10 × 4',280,105]],exp:'10 × 6 + ½ × 10 × 4 = 80 cm²',why:['長方形 60，加上三角形 20。','Rectangle 60 plus triangle 20.']}]},
    {id:'banner',name:['梯形屋頂','Trapezium roof'],title:['例子 D · 梯形加長方形','Example D · Trapezium and rectangle'],sub:['下方 12 × 5；上方梯形兩底 6、12，高 3（單位：cm）','Lower rectangle 12 × 5; upper trapezium bases 6 and 12, height 3 (cm)'],question:['在哪裏橫切，便能用兩個公式？','Where can you cut to use two familiar formulas?'],explain:['先找出長方形與梯形的分界。','Find the boundary between the rectangle and trapezium.'],poly:'100,180 190,90 370,90 460,180 460,330 100,330',bounds:[100,90,460,330],labels:[['6 cm',280,77],['12 cm',280,352],['3 cm',478,137],['5 cm',479,264]],fill:['100,90 190,90 100,180','370,90 460,90 460,180'],fillOffset:[[-125,-55],[125,-55]],fillExp:'12 × 8 − 2 × (½ × 3 × 3) = 87 cm²',fillWhy:['大長方形 96，減去兩個各 4.5 的三角形。','Outer rectangle 96 minus two triangles of 4.5 each.'],cuts:[{id:'horizontal',name:['橫切','Horizontal cut'],segments:[[[100,180],[460,180]]],parts:['100,180 460,180 460,330 100,330','100,180 190,90 370,90 460,180'],partLabels:[['12 × 5',280,267],['½(6+12)×3',280,146]],exp:'12 × 5 + ½ × (6 + 12) × 3 = 87 cm²',why:['長方形 60，加上梯形 27。','Rectangle 60 plus trapezium 27.']}]},
    {id:'t',name:['T 形','T-shape'],title:['例子 E · T 形多邊形','Example E · T-shaped polygon'],sub:['上方橫條 12 × 3；中間直條 4 × 5（單位：cm）','Top bar 12 × 3; central stem 4 × 5 (cm)'],question:['怎樣把橫條和直條分開？','How can you separate the top bar and stem?'],explain:['一條短橫線便能分成兩個長方形。','A short horizontal line makes two rectangles.'],poly:'100,80 460,80 460,170 340,170 340,320 220,320 220,170 100,170',bounds:[100,80,460,320],labels:[['12 cm',280,68],['3 cm',479,132],['4 cm',280,344],['5 cm',356,251]],fill:['100,170 220,170 220,320 100,320','340,170 460,170 460,320 340,320'],fillOffset:[[-110,0],[110,0]],fillExp:'12 × 8 − 2 × (4 × 5) = 56 cm²',fillWhy:['補成 12 × 8，減去左右兩個 4 × 5 缺口。','Complete 12 × 8, then subtract two 4 × 5 gaps.'],cuts:[{id:'horizontal',name:['橫切','Horizontal cut'],segments:[[[220,170],[340,170]]],parts:['100,80 460,80 460,170 100,170','220,170 340,170 340,320 220,320'],partLabels:[['12 × 3',280,128],['4 × 5',280,258]],exp:'12 × 3 + 4 × 5 = 56 cm²',why:['橫條 36，加上直條 20。','Top bar 36 plus stem 20.']}]},
    {id:'u',name:['U 形','U-shape'],title:['例子 F · U 形多邊形','Example F · U-shaped polygon'],sub:['外框 12 × 8；上方中間缺口 4 × 5（單位：cm）','Outer rectangle 12 × 8; central top gap 4 × 5 (cm)'],question:['畫兩條直線，可分成哪三個長方形？','Which three rectangles do two vertical cuts make?'],explain:['這題要畫兩條線；每完成一條，會提示下一步。','Draw two lines. The guide tracks each completed cut.'],poly:'100,80 220,80 220,230 340,230 340,80 460,80 460,320 100,320',bounds:[100,80,460,320],labels:[['12 cm',280,348],['8 cm',482,208],['4 cm',280,223],['5 cm',359,156]],fill:['220,80 340,80 340,230 220,230'],fillOffset:[[0,-100]],fillExp:'12 × 8 − 4 × 5 = 76 cm²',fillWhy:['大長方形減去中央缺口。','Subtract the central gap from the outer rectangle.'],cuts:[{id:'twolines',name:['兩條直線','Two vertical cuts'],segments:[[[220,230],[220,320]],[[340,230],[340,320]]],parts:['100,80 220,80 220,320 100,320','220,230 340,230 340,320 220,320','340,80 460,80 460,320 340,320'],partLabels:[['4 × 8',160,270],['4 × 3',280,279],['4 × 8',400,270]],exp:'4 × 8 + 4 × 3 + 4 × 8 = 76 cm²',why:['左右各 32，中間底部 12。','The two sides are 32 each; the centre bottom is 12.']}]} 
  ];
  const ui = {
    '#brandTitle':['面積實驗室','Area Lab'],
    '#mastNote':['由圖形看見公式 · 用切割與填補解題','See formulas in shapes · solve by cutting and completing'],
    '#formulaTab':['01　公式怎樣來？','01　Where do formulas come from?'],
    '#polygonTab':['02　切割與填補','02　Cut and complete'],
    '#intro':['先觀察、再猜想，最後才揭示算式。所有圖形可用手指操作，適合 iPad 投影。','Observe, predict, then reveal the calculation. Touch-friendly for iPad teaching.'],
    '#progressLabel':['推導進度','Derivation progress'],
    '#formulaReset':['回到起點','Start again'],
    '#formulaReveal':['顯示／隱藏公式','Show / hide formula'],
    '#teacherPrompt':['先問學生：移動或複製圖形後，面積有沒有改變？哪一段才是垂直高？','Ask: does moving or duplicating a shape change its area? Which segment is the perpendicular height?'],
    '#cutBtn':['切割法：分開再加','Cut: split and add'],
    '#fillBtn':['填補法：補上再減','Complete: fill and subtract'],
    '#cutModeLabel':['選擇切法','Choose a cut'],
    '#cutHint':['提示起點','Hint: starting point'],
    '#cutShow':['顯示切法','Show cuts'],
    '#cutClear':['清除線段','Clear cuts'],
    '#fillLabel':['把缺口補成大圖形','Complete the outer shape'],
    '#fillPrompt':['拖動滑桿，看看要補上的部分在哪裏。','Move the slider to see the missing pieces.'],
    '#polygonReset':['重新探索','Explore again'],
    '#keyOriginal':['原圖形','Original'],
    '#keyCut':['切出來的部分','Cut parts'],
    '#keyFill':['補上的部分','Added parts'],
    '#footerText':['根據 S1 Chapter 5.1「Areas and Volumes (I)」的圖形與面積主題設計。尺寸是獨立教學例子，請以學校工作紙數值為準。無外部字型、圖片或資料服務。','Designed for S1 Chapter 5.1 Areas and Volumes (I). Dimensions are independent teaching examples; use your worksheet values for class exercises. No external fonts, images or data services.']
  };
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const fmt=n=>Number(n.toFixed(4)).toString();
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const plain=pair=>state.lang==='zh'?pair[0]:state.lang==='en'?pair[1]:pair[0]+' / '+pair[1];
  function put(selector,pair){const e=typeof selector==='string'?$(selector):selector;if(!e)return;if(state.lang==='both')e.innerHTML=`<span>${esc(pair[0])}</span><small class="dual-en">${esc(pair[1])}</small>`;else e.textContent=pair[state.lang==='zh'?0:1]}
  function line(x1,y1,x2,y2,color=C.line,width=2,dash=''){return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="'+dash+'"':''}/>`}
  function label(s,x,y,color=C.ink,size=17,anchor='middle',extra=''){return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-weight="800" class="${extra}">${esc(s)}</text>`}
  function polygon(points,fill,stroke=C.ink,opacity=1){return `<polygon points="${points}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`}
  function transform(module,content){const v=state.view[module];return bg+`<g transform="translate(280 190) rotate(${v.angle}) scale(${v.scale/100}) translate(-280 -190)">${content}</g>`}
  function syncView(module){const bar=$(`.view-toolbar[data-view="${module}"]`),v=state.view[module];bar.querySelector('.rotateRange').value=v.angle;bar.querySelector('.zoomRange').value=v.scale;bar.querySelector('.rotateValue').textContent=v.angle+'°';bar.querySelector('.zoomValue').textContent=v.scale+'%'}
  function resetView(module){state.view[module]={angle:0,scale:100};syncView(module);module==='formula'?drawFormula():drawShape()}
  function positive(id){const n=Number($(id).value);return Number.isFinite(n)&&n>0?n:null}
  function setActive(container,attr,id){$$(`${container} button`).forEach(b=>{const on=b.dataset[attr]===id;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))})}
  function switchModule(module){state.module=module;$('#formulaModule').classList.toggle('active',module==='formula');$('#polygonModule').classList.toggle('active',module==='polygon');$('#formulaTab').classList.toggle('active',module==='formula');$('#polygonTab').classList.toggle('active',module==='polygon');$('#formulaTab').setAttribute('aria-selected',String(module==='formula'));$('#polygonTab').setAttribute('aria-selected',String(module==='polygon'))}
  function stopAnimation(){if(state.animation){cancelAnimationFrame(state.animation);state.animation=null}put('#formulaPlay',['播放推導','Play derivation'])}
  function setFormula(id){state.formula=id;state.progress=0;state.revealFormula=false;stopAnimation();$('#formulaRange').value=0;const f=formulas.find(x=>x.id===id);$('#topInput').value=f.defaults[0];$('#baseInput').value=f.defaults[1];$('#heightInput').value=f.defaults[2];$('#topWrap').classList.toggle('hidden',id!=='trapezium');$('#heightWrap').classList.toggle('hidden',id==='square');resetView('formula');setActive('#formulaPick','formula',id);renderFormula()}
  function drawFormula(){const p=state.progress/100,id=state.formula;let out='';
    if(id==='square'||id==='rectangle'){
      const cols=id==='square'?6:8,rows=id==='square'?6:5,w=cols*42,h=rows*42,x=280-w/2,y=190-h/2;
      out+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#b9e8de" stroke="#173042" stroke-width="3"/>`;
      const shown=p<.33?Math.ceil(cols*p*3):cols;for(let i=1;i<cols;i++)if(i<=shown)out+=line(x+i*42,y,x+i*42,y+h,'#55ad9e',1.5);
      for(let j=1;j<rows;j++)if(p>.16)out+=line(x,y+j*42,x+w,y+j*42,'#55ad9e',1.5);
      if(p>.45){out+=label(id==='square'?'s':'b',x+w/2,y+h+28,'#0c7569',20);out+=label(id==='square'?'s':'h',x-23,y+h/2,'#0c7569',20)}
      if(p>.72)out+=label(cols+' × '+rows,280,40,'#254957',18);
    }
    if(id==='parallelogram'){
      out+=polygon('250,80 470,80 410,230 250,230','#b9e8de');
      out+=polygon(`${190+220*p},230 ${250+220*p},80 ${250+220*p},230`,'#efbb48','#b27a09');
      out+=line(250,80,250,230,'#ee8065',3,'7 5');out+=label('h',232,157,'#bf5c43',20);out+=label('b',355,264,'#0c7569',20);
      if(p<.05)out+=label(plain(['切下左邊三角形','Cut off the left triangle']),280,50,'#315763',16);
      if(p>.9)out+=label(plain(['同一面積 → 長方形','Same area → rectangle']),280,50,'#0c7569',16);
    }
    if(id==='triangle'){
      out+=polygon('120,230 390,230 210,80','#15a893');const dx=(1-p)*50,dy=(1-p)*-30;
      out+=polygon(`${390+dx},${230+dy} ${210+dx},${80+dy} ${480+dx},${80+dy}`,'#efbb48','#b27a09',.4+.6*p);
      out+=line(210,80,210,230,'#ee8065',3,'7 5');out+=label('h',193,159,'#bf5c43',20);out+=label('b',255,264,'#0c7569',20);
      if(p<.1)out+=label(plain(['找出底與垂直高','Find base and perpendicular height']),280,342,'#315763',15);
      if(p>.9)out+=label(plain(['兩個三角形 → 平行四邊形','Two triangles → parallelogram']),280,342,'#0c7569',15);
    }
    if(id==='trapezium'){
      out+=polygon('160,230 410,230 350,80 230,80','#15a893');const dx=(1-p)*-50,dy=(1-p)*-40;
      out+=polygon(`${410+dx},${230+dy} ${350+dx},${80+dy} ${600+dx},${80+dy} ${530+dx},${230+dy}`,'#efbb48','#b27a09',.4+.6*p);
      out+=line(230,80,230,230,'#ee8065',3,'7 5');out+=label('a',290,71,'#0c7569',20);out+=label('b',285,263,'#0c7569',20);out+=label('h',211,158,'#bf5c43',20);
      if(p<.1)out+=label(plain(['找兩條平行邊','Find the parallel sides']),280,342,'#315763',16);
      if(p>.9)out+=label(plain(['新底長 = a + b','New base = a + b']),280,342,'#0c7569',16);
    }
    $('#formulaSvg').innerHTML=transform('formula',out);
  }
  function renderFormula(){const f=formulas.find(x=>x.id===state.formula),p=state.progress,id=state.formula,step=Math.min(2,Math.floor(p/34));put('#formulaTitle',f.name);put('#formulaSubtitle',f.sub);put('#formulaQuestion',f.question);put('#formulaExplain',f.explain);put('#formulaBadge',f.steps[step]);put('#formulaStep',[`第 ${step+1} 步／3 步`,`Step ${step+1} of 3`]);$('#topWrap').firstChild.textContent=plain(['上底 a','Top base a']);$('#baseWrap').firstChild.textContent=plain(id==='square'?['邊長 s','Side s']:['底 b','Base b']);$('#heightWrap').firstChild.textContent=plain(['高 h','Height h']);drawFormula();
    const a=positive('#topInput'),b=positive('#baseInput'),h=positive('#heightInput');if((id==='trapezium'&&!a)||!b||(id!=='square'&&!h)){$('#formulaExpression').textContent=plain(['請輸入大於 0 的長度','Enter lengths greater than 0']);$('#formulaWorked').textContent='';return}
    let expr='',work='';if(id==='square'){expr='A = s²';work=`A = ${fmt(b)} × ${fmt(b)} = ${fmt(b*b)} cm²`}
    if(id==='rectangle'||id==='parallelogram'){expr='A = b × h';work=`A = ${fmt(b)} × ${fmt(h)} = ${fmt(b*h)} cm²`}
    if(id==='triangle'){expr='A = ½ × b × h';work=`A = ½ × ${fmt(b)} × ${fmt(h)} = ${fmt(b*h/2)} cm²`}
    if(id==='trapezium'){expr='A = ½ × (a + b) × h';work=`A = ½ × (${fmt(a)} + ${fmt(b)}) × ${fmt(h)} = ${fmt((a+b)*h/2)} cm²`}
    $('#formulaExpression').textContent=expr;$('#formulaWorked').textContent=work;$('#formulaExpression').classList.toggle('blurred',!state.revealFormula);$('#formulaWorked').classList.toggle('blurred',!state.revealFormula)
  }
  function playFormula(){if(state.animation){stopAnimation();return}const start=performance.now(),from=state.progress,duration=2300;put('#formulaPlay',['暫停','Pause']);function frame(now){const t=clamp((now-start)/duration,0,1);state.progress=from+(100-from)*(t*t*(3-2*t));$('#formulaRange').value=Math.round(state.progress);renderFormula();if(t<1)state.animation=requestAnimationFrame(frame);else stopAnimation()}state.animation=requestAnimationFrame(frame)}
  function currentShape(){return shapes.find(x=>x.id===state.shape)}
  function currentCut(){return currentShape().cuts[state.cutIndex]}
  function cutComplete(){return state.cutDone.length===currentCut().segments.length}
  function setFeedback(status){state.feedback=status;const e=$('#drawFeedback'),total=currentCut().segments.length,done=state.cutDone.length;let pair;if(status==='good')pair=['切得好！說出各部分是甚麼圖形，再把面積相加。','Well cut! Name each part, then add their areas.'];else if(status==='partial')pair=[`已完成 ${done}／${total} 條線，繼續畫下一條。`,`Completed ${done} of ${total} cuts. Draw the next one.`];else if(status==='warn')pair=['線段沒有落在選定的切法上。可按「提示起點」再試。','That line does not match this cut. Try the starting-point hint.'];else pair=total>1?['請在圖上畫兩條分割線。','Draw two cut lines on the shape.']:['請在圖上用手指或滑鼠畫一條分割線。','Draw one cut line with your finger or mouse.'];put(e,pair);e.className='feedback '+(status==='good'?'good':status==='warn'?'warn':'')}
  function renderCutChoices(){const s=currentShape();$('#cutPick').innerHTML=s.cuts.map((c,i)=>`<button type="button" data-cut="${i}" class="${i===state.cutIndex?'active':''}" aria-pressed="${i===state.cutIndex}"><span>${esc(c.name[0])}</span>${state.lang==='both'?`<small class="dual-en">${esc(c.name[1])}</small>`:state.lang==='en'?esc(c.name[1]):''}</button>`).join('');if(state.lang==='en')$$('#cutPick button').forEach((b,i)=>b.textContent=s.cuts[i].name[1])}
  function setCut(index){state.cutIndex=index;state.cutDone=[];state.drawing=null;state.hint=false;state.revealPolygon=false;renderShape();setFeedback('start')}
  function setShape(id){state.shape=id;state.strategy='cut';state.cutIndex=0;state.cutDone=[];state.drawing=null;state.hint=false;state.fill=0;state.revealPolygon=false;$('#fillRange').value=0;$('#fillAmount').textContent='0%';resetView('polygon');setActive('#shapePick','shape',id);setStrategy('cut');setFeedback('start')}
  function setStrategy(strategy){state.strategy=strategy;$('#cutBtn').classList.toggle('active',strategy==='cut');$('#fillBtn').classList.toggle('active',strategy==='fill');$('#cutControls').hidden=strategy!=='cut';$('#fillControls').hidden=strategy!=='fill';state.revealPolygon=false;renderShape()}
  function polyPts(s){return s.split(' ').map(p=>p.split(',').map(Number))}
  function drawShape(){const s=currentShape(),cut=currentCut(),complete=cutComplete();let out='';
    if(state.strategy==='cut'&&complete){cut.parts.forEach((part,i)=>out+=polygon(part,['#b9e8de','#ffdf8b','#c7dbff'][i%3],i?'#a8740e':C.ink))}else out+=polygon(s.poly,'#b9e8de');
    if(state.strategy==='cut'){
      state.cutDone.forEach(i=>{const [a,b]=cut.segments[i];out+=line(a[0],a[1],b[0],b[1],'#0c655d',5,'10 6')});
      if(state.hint&&!complete){const next=cut.segments.findIndex((_,i)=>!state.cutDone.includes(i));const [x,y]=cut.segments[next][0];out+=`<circle cx="${x}" cy="${y}" r="10" fill="#ee8065"/>${label(plain(['由此開始','Start here']),x+60,y-14,'#ab4f38',13)}`}
      if(state.drawing){const d=state.drawing;out+=line(d.start[0],d.start[1],d.end[0],d.end[1],'#ee8065',5,'9 5')}
      if(complete)cut.partLabels.forEach(([t,x,y])=>out+=label(t,x,y,'#154b55',18,'middle','part-label'));
    }else{
      const [minX,minY,maxX,maxY]=s.bounds;out+=`<rect x="${minX}" y="${minY}" width="${maxX-minX}" height="${maxY-minY}" fill="none" stroke="#ee8065" stroke-width="3" stroke-dasharray="9 6"/>`;
      s.fill.forEach((piece,i)=>{const pts=polyPts(piece).map(([x,y])=>[x+s.fillOffset[i][0]*(1-state.fill/100),y+s.fillOffset[i][1]*(1-state.fill/100)].join(',')).join(' ');out+=polygon(pts,'#ee8065','#aa583f',.38+.48*state.fill/100)});
    }
    s.labels.forEach(([t,x,y])=>{out+=`<rect x="${x-34}" y="${y-17}" width="68" height="22" rx="7" fill="#fff" fill-opacity=".9"/>${label(t,x,y,C.ink,15)}`});
    if(state.strategy==='cut'&&complete)out+=label(plain(['把各部分相加','Add the parts']),280,34,'#0c655d',15);
    if(state.strategy==='fill'&&state.fill>93)out+=label(plain(['大圖形 − 缺口','Outer shape − gaps']),280,34,'#a2503d',15);
    $('#polygonSvg').innerHTML=transform('polygon',out)
  }
  function renderShape(){const s=currentShape(),cut=currentCut();put('#shapeTitle',s.title);put('#shapeSubtitle',s.sub);put('#shapeQuestion',s.question);put('#shapeExplain',s.explain);put('#shapeBadge',state.strategy==='cut'?['切割法','Cutting']:['填補法','Completing']);renderCutChoices();$('#polygonExpression').textContent=state.revealPolygon?(state.strategy==='cut'?cut.exp:s.fillExp):plain(['先動手探索，再顯示算式','Explore first, then reveal the calculation']);$('#polygonWorked').textContent=state.revealPolygon?plain(state.strategy==='cut'?cut.why:s.fillWhy):plain(['答案暫時隱藏，讓學生先說出策略。','The answer is hidden. Ask students to explain their strategy.']);put('#polygonReveal',state.revealPolygon?['隱藏算式與答案','Hide calculation and answer']:['顯示算式與答案','Show calculation and answer']);drawShape()}
  function svgPoint(ev){const svg=$('#polygonSvg'),p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;const q=p.matrixTransform(svg.getScreenCTM().inverse()),v=state.view.polygon,theta=-v.angle*Math.PI/180,x=q.x-280,y=q.y-190,r=v.scale/100;return [(x*Math.cos(theta)-y*Math.sin(theta))/r+280,(x*Math.sin(theta)+y*Math.cos(theta))/r+190]}
  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  function handleCutStart(ev){if(state.strategy!=='cut')return;ev.preventDefault();$('#polygonSvg').setPointerCapture(ev.pointerId);const p=svgPoint(ev);state.drawing={start:p,end:p};drawShape()}
  function handleCutMove(ev){if(!state.drawing)return;ev.preventDefault();state.drawing.end=svgPoint(ev);drawShape()}
  function handleCutEnd(ev){if(!state.drawing)return;ev.preventDefault();state.drawing.end=svgPoint(ev);const cut=currentCut(),d=state.drawing;let match=-1,score=Infinity;cut.segments.forEach(([a,b],i)=>{if(state.cutDone.includes(i))return;const s=Math.min(distance(d.start,a)+distance(d.end,b),distance(d.start,b)+distance(d.end,a));if(s<score){score=s;match=i}});state.drawing=null;if(score<80){state.cutDone.push(match);state.hint=false;setFeedback(cutComplete()?'good':'partial')}else setFeedback('warn');renderShape()}
  function renderLanguage(){document.documentElement.lang=state.lang==='en'?'en':'zh-Hant';document.title=plain(['S1 5.1 面積實驗室｜公式、切割與填補','S1 5.1 Area Lab | Formulas, Cutting and Completing']);Object.entries(ui).forEach(([sel,pair])=>put(sel,pair));$$('.language button').forEach(b=>b.classList.toggle('active',b.dataset.lang===state.lang));$$('.rotateText').forEach(e=>put(e,['旋轉','Rotate']));$$('.zoomText').forEach(e=>put(e,['縮放','Zoom']));$$('.reset-view').forEach(e=>put(e,['重設視角','Reset view']));$('#formulaPick').innerHTML=formulas.map(f=>`<button class="chip" type="button" data-formula="${f.id}" aria-pressed="false"></button>`).join('');$$('#formulaPick button').forEach((b,i)=>put(b,formulas[i].name));$('#shapePick').innerHTML=shapes.map(s=>`<button class="chip" type="button" data-shape="${s.id}" aria-pressed="false"></button>`).join('');$$('#shapePick button').forEach((b,i)=>put(b,shapes[i].name));setActive('#formulaPick','formula',state.formula);setActive('#shapePick','shape',state.shape);put('#formulaPlay',state.animation?['暫停','Pause']:['播放推導','Play derivation']);renderFormula();renderShape();setFeedback(state.feedback)}
  $('#formulaPick').addEventListener('click',e=>{const b=e.target.closest('[data-formula]');if(b)setFormula(b.dataset.formula)});
  $('#shapePick').addEventListener('click',e=>{const b=e.target.closest('[data-shape]');if(b)setShape(b.dataset.shape)});
  $('#cutPick').addEventListener('click',e=>{const b=e.target.closest('[data-cut]');if(b)setCut(Number(b.dataset.cut))});
  $$('.language button').forEach(b=>b.onclick=()=>{state.lang=b.dataset.lang;renderLanguage()});
  $('#formulaTab').onclick=()=>switchModule('formula');$('#polygonTab').onclick=()=>switchModule('polygon');
  $('#formulaRange').oninput=e=>{stopAnimation();state.progress=Number(e.target.value);renderFormula()};
  $('#formulaPlay').onclick=playFormula;$('#formulaReset').onclick=()=>{stopAnimation();state.progress=0;$('#formulaRange').value=0;renderFormula()};
  $('#formulaReveal').onclick=()=>{state.revealFormula=!state.revealFormula;renderFormula()};
  ['#topInput','#baseInput','#heightInput'].forEach(id=>$(id).oninput=renderFormula);
  $('#cutBtn').onclick=()=>setStrategy('cut');$('#fillBtn').onclick=()=>setStrategy('fill');
  $('#cutHint').onclick=()=>{state.hint=true;drawShape()};$('#cutShow').onclick=()=>{state.cutDone=currentCut().segments.map((_,i)=>i);state.hint=false;setFeedback('good');renderShape()};$('#cutClear').onclick=()=>setCut(state.cutIndex);
  $('#fillRange').oninput=e=>{state.fill=Number(e.target.value);$('#fillAmount').textContent=state.fill+'%';drawShape()};
  $('#polygonReveal').onclick=()=>{state.revealPolygon=!state.revealPolygon;renderShape()};$('#polygonReset').onclick=()=>setShape(state.shape);
  const poly=$('#polygonSvg');poly.addEventListener('pointerdown',handleCutStart);poly.addEventListener('pointermove',handleCutMove);poly.addEventListener('pointerup',handleCutEnd);poly.addEventListener('pointercancel',()=>{state.drawing=null;drawShape()});
  $$('.view-toolbar').forEach(bar=>{const module=bar.dataset.view;bar.querySelector('.rotateRange').oninput=e=>{state.view[module].angle=Number(e.target.value);syncView(module);module==='formula'?drawFormula():drawShape()};bar.querySelector('.zoomRange').oninput=e=>{state.view[module].scale=Number(e.target.value);syncView(module);module==='formula'?drawFormula():drawShape()};bar.querySelector('.reset-view').onclick=()=>resetView(module)});
  renderLanguage();setFormula('triangle');setShape('l');switchModule('formula');
})();
