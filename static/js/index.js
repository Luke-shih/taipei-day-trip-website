const attractionsContainer = document.getElementById('attractionsContainer'); // 擷取 HTML 上 <div class="container" id="attractionsContainer">
const searchForm = document.getElementById('searchForm'); // 擷取 HTML上 <form action="#" class="search-form" id="searchForm">
const searchKeyword = document.getElementById('searchKeyword'); // 擷取 HTML 上 input 搜尋內容
const ipUrl = "52.194.136.133"; // app.py 連接資料位置

let nextPage = 0;
let attractionsArray = [];
let readyToLoadAgain = false;
let imagesLoadNum = 0;
let totalImagesToLoad;
let keyword = null;

loadAttractions();

// ======= 滾動載入後續頁面 =========

// Window.innerHeight = 瀏覽器窗口的視口（viewport）高度（以像素为單位）；如果有水平滾動條，也包括滾動條高度。
// Window.scrollY = 返回文檔在垂直方向已滾動的像素值。
// document.body.scrollHeight = 網頁正文全文高
if(nextPage !== null){
    window.addEventListener('scroll',()=>{
        var wScrollY = window.scrollY; // 當前滾動條位置
        var wInnerH = window.innerHeight; // 當前視窗高度 (不會變)
        var bcrollH = document.body.scrollHeight;
        if(wScrollY + wInnerH >= bcrollH){
            loadAttractions(keyword);
            readyToLoadAgain = false;
        }
    })
}

// 搜尋那欄
// attraction keyword search : submit search form
searchForm.addEventListener('submit',(event)=>{ // 設計監聽，當按下 submit 搜尋鍵，
    event.preventDefault();
    removeAttractions(); // 刪除原本景點資料
    nextPage = 0;
    keyword = searchKeyword.value;
    loadAttractions(keyword);  // 執行47行的 function
})

// 呼叫 getAttractionsData & showAttractions 函式
async function loadAttractions(keyword=null){  // async & await https://www.oxxostudio.tw/articles/201908/js-fetch.html
    if (keyword == ''){ // 當輸入空值
        const message = document.createElement('span');
        message.textContent = "請輸入關鍵字";
        attractionsContainer.appendChild(message);
    }
    else if(nextPage !== null){
        nextPage = await getAttractionsData(nextPage,keyword);
        showAttractions();
    }
}

// 案下 search 後 remove 原本景點資料
function removeAttractions(){
    while(attractionsContainer.firstChild){
        attractionsContainer.removeChild(attractionsContainer.lastChild);
    }
}
// fetch attractions API // fetch 網址

async function getAttractionsData(pageNum, keyword=null){
    let url;
    if(keyword){
        url = `http://${ipUrl}:3000/api/attractions?page=${pageNum}&keyword=${keyword}`;
    }else{
        url = `http://${ipUrl}:3000/api/attractions?page=${pageNum}`;
    }
    const response = await fetch(url);  // https://www.oxxostudio.tw/articles/201908/js-fetch.html
    const result = await response.json();
    nextPage = result.nextPage;
    attractionsArray = result.data; // json 
    return nextPage;
}

// 顯示那個 page 所有的景點
function showAttractions(){
    totalImagesToLoad = attractionsArray.length; // 看每頁資料筆數有幾筆，建立幾個 from (index.js 71 行)
    if(totalImagesToLoad){
        for(let attraction of attractionsArray){ // https://pjchender.blogspot.com/2017/01/javascript-es6-for-of.html
            const attractionBox = createAttractionItem(attraction);
            attractionsContainer.appendChild(attractionBox); // 將建立的 box 接到 HTML 上原本寫好的 <div class="container" id="attractionsContainer"> 裡面
        }
    }
    else if(!(attractionsContainer.firstChild)){
        const message = document.createElement('span');
        message.textContent = "查無資料，請重新搜尋";
        attractionsContainer.appendChild(message);
    }
}

// create attraction item & DOM appendChild()
function createAttractionItem(attraction){

    const attractionBox = document.createElement('div'); // 創建最外圈 <div class="attraction-box">
    attractionBox.classList.add('attraction-box'); 
    
    const linkContainer = document.createElement('a'); // 創建 a 連結，載入 `http://${ipUrl}:3000/attraction/${attraction.id}`
    linkContainer.href = `http://${ipUrl}:3000/attraction/${attraction.id}`
    linkContainer.setAttribute('target', '_blank'); // .setAttribute() 设置指定元素上的某个属性值。如果属性已经存在，则更新该值；否则，使用指定的名称和值添加一个新的属性。
    
    const attractionImage = document.createElement('img'); // 創建 img 節點
    attractionImage.src = attraction.images[0]
    
    const attractionTextContainer = document.createElement('div'); // 創建 box 裡面最下方景點說明的 div
    attractionTextContainer.classList.add('attraction-text-container');
    
    const attractionTitle = document.createElement('p'); // 創建最下方景點說明的 景點title
    attractionTitle.classList.add('attraction-title');
    attractionTitle.textContent = attraction.name;  // 載入 景點名稱
    
    const attractionInfo = document.createElement('div'); // 景點說明裡面在開一個 div 放 info 信息，放 mrt 跟 category
    attractionInfo.classList.add('attraction-info');
    
    const attractionMrt = document.createElement('p'); // 放 mrt 的值
    attractionMrt.classList.add('attraction-mrt');
    attractionMrt.textContent = attraction.mrt; // 載入 mrt 的值
    
    const attractionCategory = document.createElement('p'); // 放 category 的值
    attractionCategory.classList.add('attraction-category');
    attractionCategory.textContent = attraction.category; // 載入 category 的值
    attractionBox.appendChild(linkContainer); // 將 a 連結接在 attractionBox 裡面

    linkContainer.appendChild(attractionImage); // 將 img 接在 a 連結 (整個抓取的 attraction 資訊) 裡面
    linkContainer.appendChild(attractionTextContainer); // 將最下方景點說明 接在 a 連結 (整個抓取的 attraction 資訊) 裡面
    
    attractionTextContainer.appendChild(attractionTitle);　// 景點名稱 title 接在最下方 div 景點說明裡面 
    attractionTextContainer.appendChild(attractionInfo); // 景點信息 info 接在最下方 div 景點說明裡面 

    attractionInfo.appendChild(attractionMrt); // mrt 接在 info 裡面
    attractionInfo.appendChild(attractionCategory); // category 接在 info 裡面

    attractionImage.addEventListener('load',imageLoaded);
    return attractionBox;
}

// check if all item in a page is loaded 
function imageLoaded(){
    imagesLoadNum++;
    if(imagesLoadNum === totalImagesToLoad && nextPage !== null){
        readyToLoadAgain = true;
    }
}
