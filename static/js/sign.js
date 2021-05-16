const signBtn = document.querySelector('#sign-btn')
const signoutBtn = document.querySelector('#signout-btn')
const signBg = document.querySelector('.sign-bg')
const signCloseBtns = signBg.querySelectorAll('.close-btn')
const signContainers = document.querySelectorAll('.sign-container')

// 顯示登入、註冊畫面
function popUpSignScene(){
    signBg.classList.add('pop-up')
    signBtn.classList.add('active')
}

// 關閉登入、註冊畫面
function cancelPopUpSignScene(){
    signBg.classList.remove('pop-up')
    signBtn.classList.remove('active')
}

// 變換登入、註冊文字
function changeSignContainer(){
    signContainers.forEach(container=>{
        container.classList.toggle('show')
        window.location.reload();  // ************
    })
}

signBtn.addEventListener('click', popUpSignScene) // 顯示登入、註冊畫面
signCloseBtns.forEach(btn => {
    btn.addEventListener('click',cancelPopUpSignScene) // 關閉登入、註冊畫面
})

// 點選旁邊透明部分，也會離開登入｜註冊欄位
signBg.addEventListener('click', e => {
    if(e.path[0] === signBg){
        cancelPopUpSignScene() // 關閉登入、註冊畫面
    }
})

// 註冊畫面
signContainers.forEach(container => {
    const changeBtn = container.querySelector('.change-sign')
    changeBtn.addEventListener('click', changeSignContainer) // 變換登入、註冊文字
})


// 登入、註冊功能
const signupForm = document.querySelector('#signup')
const signinForm = document.querySelector('#signin')
const userAPI = '/api/user'

// signup
function signup(e){
    e.preventDefault()
    const data = {
        name : this.querySelector('input[name="name"]').value,
        email : this.querySelector('input[name="email"]').value,
        password : this.querySelector('input[name="password"]').value 
    }
    fetch(userAPI, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
    })
    .then(res => res.json())

    // response 結果
    .then(data => {
        const message = this.querySelector('.message')
        if(data.ok){
            alert("註冊成功")
            changeSignContainer() // 變換登入、註冊文字
        }else{
            message.innerText = data.message
        }
    })
}

// signin
function signin(e){
    e.preventDefault()
    const data = {
        email : this.querySelector('input[name="email"]').value,
        password : this.querySelector('input[name="password"]').value 
    }
    fetch(userAPI, {
        method: 'PATCH',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: new Headers({
          'Content-Type': 'application/json'
        })
    })
    .then(res => res.json())
    .then(data => {
        //如果有成功登入，回到原本頁面並將「註冊｜登入」按鈕改為「登出」按鈕
        if(data.ok === true){
            cancelPopUpSignScene()
            signinCheck()
            signBtn.classList.remove('show')
            signoutBtn.classList.add('show')
            alert("登入成功！歡迎")
            //頁面更新用
            try{ getUserData() }catch(e){}
            try{ getBookingData() }catch(e){}
            try{ fetchOrderAPI() }catch(e){}
        }else{
            const message = this.querySelector('.message')
            message.innerText = data.message
        }
    })
}

signupForm.addEventListener('submit', signup)
signinForm.addEventListener('submit', signin)


// logout
function signout(){
    fetch(userAPI, {
        method: 'DELETE'
    })
    .then(() => {
        signinCheck()
        alert("已登出！")
        //頁面更新用
        try{ getUserData() }catch(e){}
        try{ getBookingData() }catch(e){}
        try{ fetchOrderAPI() }catch(e){}
    })
}
signoutBtn.addEventListener('click', signout)

//檢查是否有登入，若get user api != Null，顯示 signoutBtn
function signinCheck(){
    fetch(userAPI)
        .then(res => res.json())
        .then(data => {
            if(data.data){
                signBtn.classList.remove('show')
                signoutBtn.classList.add('show')
            }else{
                signBtn.classList.add('show')
                signoutBtn.classList.remove('show')
            }
        })
}
//進入頁面後先檢查使用者有沒有登入
signinCheck()
