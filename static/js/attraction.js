const bookingInfo = document.querySelector('.booking-info') // 景點圖片及訂購資訊
const imgContainer = bookingInfo.querySelector('.img-container') // 景點圖片
const imgIndex = bookingInfo.querySelector('.img-index') // 圖片輪播下面的圈圈
const profile = bookingInfo.querySelector('.profile') // 訂購資訊
const id = bookingInfo.querySelector('input[name="id"]') // 開始預訂行程的按鈕
const price = bookingInfo.querySelector('#price') // 選擇上半天或下半天的價格
const morningRadio = bookingInfo.querySelector('input[value="morning"]') // 選擇上半天
const afternoonRadio = bookingInfo.querySelector('input[value="afternoon"]') // 選擇下半天

// 景點資訊元素
const info = document.querySelector('.info')
const addressContainer = info.querySelector('.address')
const transportContainer = info.querySelector('.transport')

// 導覽價格
morningRadio.addEventListener('click', ()=>{
    price.innerText = 2000

})
afternoonRadio.addEventListener('click', ()=>{
    price.innerText = 2500
})

// fetch api
const ipUrl = "http://52.194.136.133";
const attractionId = document.URL.split('/').slice(-1);
const apiUrl = `http://${ipUrl}:3000/api/attraction/` + attractionId

const fetchAttraction = async () => {
    const result = await fetch(apiUrl)
    const data = await result.json()
    const attraction = data.data
    const imgUrls = attraction.image[0]

    imgUrls.forEach(imgUrl => {
        const img = document.createElement('img')
        const index = document.createElement('div')
        img.src = imgUrl
        imgContainer.append(img)
        imgIndex.append(index)
    })
    const firstImg = imgContainer.querySelector('img')
    const firstIndex = imgIndex.querySelector('div')
    firstImg.classList.add('show')
    firstIndex.classList.add('show')

    // 寫入profile 名稱 類別、捷運站
    const attractionName = document.createElement('h3')
    const category = document.createElement('p')
    attractionName.innerText = attraction.name
    if(attraction.mrt === null){
        category.innerText = attraction.category
    }else{
        category.innerText = `${attraction.category} at ${attraction.mrt}`
    }
    profile.insertAdjacentElement('afterbegin', category)
    profile.insertAdjacentElement('afterbegin', attractionName)

    // 寫入info 景點資訊
    const description = document.createElement('p')
    const address = document.createElement('p')
    const transport = document.createElement('p')
    description.innerText = attraction.description
    address.innerText = attraction.address
    transport.innerText = attraction.transport
    id.value = attraction.id

    info.insertAdjacentElement('afterbegin', description)
    addressContainer.append(address)
    transportContainer.append(transport)
}

fetchAttraction()
    .then(() => {
        // 景點圖片互動輪播功能
        const imgs = document.querySelectorAll('.img-container img')
        const indexBoxes = document.querySelectorAll('.img-index div')
        const preBtn = document.querySelector('#pre-btn')
        const nextBtn = document.querySelector('#next-btn')

        // 圖片
        const imgCount = imgs.length // 圖片總數
        let currentImgIndex = 0 // 圖片起始位置 = 0 (第一張)
        let preImgIndex = imgCount - 1 // 案上一頁，圖片位置 -1
        let nextImgIndex = currentImgIndex + 1 // 案下一頁，圖片位置 +1
        
        // 找到當前呈現圖片的索引
        function currentImg(){
            for(let i = 0; i < imgCount; i++){
                if(imgs[i].className.includes('show')){
                    currentImgIndex = i
                    preImgIndex = ( i === 0 ? imgCount-1 : i-1)
                    nextImgIndex = ( i === imgCount-1 ? 0 : i+1)
                }
            }
        }
        
        // 更換圖片
        function changeImg(index){
            imgs[index].classList.toggle('show')
            indexBoxes[index].classList.toggle('show')
            imgs[currentImgIndex].classList.toggle('show')
            indexBoxes[currentImgIndex].classList.toggle('show')
            currentImg()
        }
        
        // 上一張(向左)
        function showPreImg(){
            changeImg(preImgIndex)
        }

        // 下一張(向右)
        function showNextImg(){
            changeImg(nextImgIndex)
        }
 
        // 上一頁 // 監聽，當點擊上一張，執行函數 showPreImg
        preBtn.addEventListener('click',()=>{
            showPreImg()
        })

        // 下一頁 // 監聽，當點擊下一張，執行函數 showNextImg
        nextBtn.addEventListener('click',()=>{
            showNextImg()
        })
    })
