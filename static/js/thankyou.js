// 檢查會員登入狀態(if user doesn't login, redirect to home page)
document.querySelector('main').style.visibility = 'hidden'
function loginStatusCheck() {
    fetch('/api/user', { method: 'GET' })
    .then(function (response) {
        return response.json();
    })
    .then((result) => {
        if (result.data !== null) {
            userDetails(result.data);
            getOrderdata()
            // document.getElementById('navLogin').style.display = 'none';
            document.querySelector("main").style.visibility = "visible";

            document.getElementById("signout-btn").style.display = "inline-block";
            document.getElementById("booking-page").style.display = "inline-block";
        } else {
            window.location.href = "/"
        }
    })
};

loginStatusCheck();

function userDetails(data){
    userDetails={
        "id": data["id"],
        "name": data["name"],
        "email": data["email"]
    }
};
// 登出流程 (if user logout, redirect to home page)
function userLogout() {
    fetch('/api/user', { method: 'DELETE' }).then(function (response) {
        return response.json();
        console.log(response)
    }).then((result) => {
        console.log(result);
        let logoutDone = result['ok'];
        let logoutFailed = result['error'];

        if (logoutDone) {
            window.location.href = "/"
        } else {
            alert(result['message']);
        }
    })
}

function getOrderdata() {
    let Url = new URL(location.href);
    let orderNumber = Url.searchParams.get('number', null)
    apiUrl= `/api/order/${orderNumber}`;

    fetch( apiUrl, { method: 'GET' }).then(function (response) {
        return response.json();
    }).then((result) => {
        if (result.data !== null) {

            let userName = document.getElementById("user-name")
            userName.textContent = result.data["contact"]["name"]

            let orderImage = document.getElementById("order-image")
            orderImage.src = result.data["trip"]["attraction"]["images"].split(",")[0]

            let orderNumber = document.getElementById("order-number")
            orderNumber.textContent = result.data["number"];

            let attrAttr= document.getElementById("order-attr");
            attrAttr.textContent = result.data["trip"]["attraction"]["name"]

            let orderDate = document.getElementById("order-date")
            orderDate.textContent = result.data["trip"]["date"]

            let orderPrice = document.getElementById("order-price")
            orderPrice.textContent = result.data["price"]
        };
    });
}