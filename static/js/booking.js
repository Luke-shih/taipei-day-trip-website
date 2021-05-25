function openPopupForm(form) {
    console.log(form)
    document.getElementById('loginResult').textContent = '';
    if (document.body.classList.contains('openPopups')) {
        for (i = 0; i < document.querySelectorAll('.popUp').length; i++) {
            document.querySelectorAll('.popUp')[i].style.display = 'none';
        }
    } else {
        document.body.classList.add('openPopups');
    };
    document.getElementById(form).style.display = 'block';
    document.querySelector('.pageShadow').style.display = 'block';
}

function closePopup(e) {
    if (e.classList.contains("pageShadow")) {
        for (i = 0; i < document.querySelectorAll('.popUp').length; i++) {
            document.querySelectorAll('.popUp')[i].style.display = 'none';
        }
    } else {
        e.parentElement.style.display = 'none';
    };
    document.body.classList.remove("openpopups");
    document.querySelector('.pageShadow').style.display = 'none';
    document.getElementById('loginEmail').value=''
    document.getElementById('loginPassword').value='';
}

// 檢查會員登入狀態
document.querySelector('main').style.visibility='hidden'
function loginStatusCheck() {
    fetch('/api/user', { method: 'GET' }).then(function (response) {
        return response.json();
    }).then((result) => {  
        if(result.data == undefined){
            window.location.href="/"
        }else{
            getBookingdata()
            document.querySelector('main').style.visibility='visible'

            let username=document.getElementById('username')
            username.textContent=result.data.name

            let orderName=document.getElementById('name')
            orderName.value=result.data.name

            let useremail=document.getElementById('email')
            useremail.value=result.data.email

            document.getElementById('signout-btn').style.display = 'inline-block';
            document.getElementById('booking-page').style.display = 'inline-block';
        }
    })
};
loginStatusCheck();

//登出
function userLogout() {
    fetch('/api/user', { method: 'DELETE' }).then(function (response) {
        return response.json();
    }).then((result) => {
        let logoutDone = result['ok'];
        let logoutFailed = result['error'];
    })
}

function getBookingdata() {
    fetch('api/booking', { method: 'GET' }).then(function (response) {
        return response.json();
    }).then((result) => {
        if (result.data === undefined){

            document.querySelector('main section').style.display='none'
            document.querySelector('footer').style.height='100vh'
            let msgContent = document.createElement('p')
            msgContent.setAttribute('class', 'msgContent')
            msgContent.appendChild(document.createTextNode('目前沒有任何待預訂的行程'));
            document.querySelector('.attrDisplay').appendChild(msgContent)

        }else{

            let attrName=document.getElementById('attraction')
            attrName.textContent=result.data["attraction"]["name"]

            let attrAddress=document.getElementById('address')
            attrAddress.textContent=result.data["attraction"]["address"]

            let attrImg=document.querySelector('.image')
            attrImg.src=result.data["attraction"]["image"].split(',')[0]

            let orderDate=document.getElementById('date')
            orderDate.textContent=result.data["date"]

            let orderTime=document.getElementById('time')
            if (result.data["time"]='forenoon'){
                orderTime.textContent="早上 9 點到下午 4 點"
            }else{
                orderTime.textContent="下午 2 點到晚上 9 點"
            }

            let orderPrice=document.getElementById('price')
            orderPrice.textContent=result.data["price"]

            // 訂購項目總價格
            let totalPrice = 0
            totalAmount = document.getElementById('amount')
            totalPrice += result.data["price"]
            totalAmount.innerText = totalPrice

        }
    })
}

// 刪除預定行程
function deleteBooking(){
    fetch('api/booking', { method: 'DELETE' }).then(function (response) {
        return response.json();
    }).then((result) => {
        console.log(result)
        let deleteDone = result['ok'];
        // let deleteFailed = result['error'];
        if (deleteDone){
            window.location.reload()
            alert("已刪除景點")
        }else {
            alert(result['message']);
        }
    })
} 