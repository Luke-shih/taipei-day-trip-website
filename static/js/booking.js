
// 檢查會員登入狀態
document.querySelector('main').style.visibility = 'hidden'
function loginStatusCheck() {
  fetch("/api/user", { method: "GET" })
    .then(function (response) {
      return response.json();
    })
    .then((result) => {
      if (result.data == undefined) {
        window.location.href = "/";
      } else {
        getBookingdata();
        document.querySelector("main").style.visibility = "visible";

        let username = document.getElementById("username");
        username.textContent = result.data.name;

        let orderName = document.getElementById("name");
        orderName.value = result.data.name;

        let useremail = document.getElementById("email");
        useremail.value = result.data.email;

        document.getElementById("signout-btn").style.display = "inline-block";
        document.getElementById("booking-page").style.display = "inline-block";
      }
    });
}

loginStatusCheck();

//登出
function userLogout() {
  fetch("/api/user", { method: "DELETE" })
    .then(function (response) {
      return response.json();
    })
    .then((result) => {
      let logoutDone = result["ok"];
      let logoutFailed = result["error"];
    });
}



function getBookingdata() {
  fetch("api/booking", { method: "GET" })
    .then(function (response) {
      return response.json();
    })
    .then((result) => {
      if (result.data === undefined) {
        document.querySelector("main section").style.display = "none";
        document.querySelector("footer").style.height = "100vh";
        let msgContent = document.createElement("p");
        msgContent.setAttribute("class", "msgContent");
        msgContent.appendChild(
          document.createTextNode("目前沒有任何待預訂的行程")
        );
        document.querySelector(".attrDisplay").appendChild(msgContent);
      } else {
        let attrName = document.getElementById("attraction");
        attrName.textContent = result.data["attraction"]["name"];

        let attrAddress = document.getElementById("address");
        attrAddress.textContent = result.data["attraction"]["address"];

        let attrImg = document.querySelector(".image");
        attrImg.src = result.data["attraction"]["image"].split(",")[0];

        let orderDate = document.getElementById("date");
        orderDate.textContent = result.data["date"];

        let orderTime = document.getElementById("time");
        if ((result.data["time"] = "forenoon")) {
          orderTime.textContent = "早上 9 點到下午 4 點";
        } else {
          orderTime.textContent = "下午 2 點到晚上 9 點";
        }

        let orderPrice = document.getElementById("price");
        orderPrice.textContent = result.data["price"];

        // 訂購項目總價格
        let totalPrice = 0;
        totalAmount = document.getElementById("amount");
        totalPrice += result.data["price"];
        totalAmount.innerText = totalPrice;

        orderDetails(result.data)
      }
    });
}

// 預定行程資料
function orderDetails(getBookingdata) {
  orderDetails = {
      "price": getBookingdata["price"],
      "trip": {
          "attraction": {
              "id": getBookingdata["attraction"]["id"],
              "name": getBookingdata["attraction"]["name"],
              "address": getBookingdata["attraction"]["address"],
              "image": getBookingdata["attraction"]["image"].split(",")[0]
          },
          "date": getBookingdata["date"],
          "time": getBookingdata["time"]
      }
  }
}

// 刪除預定行程
function deleteBooking() {
  fetch("api/booking", { method: "DELETE" })
    .then(function (response) {
      return response.json();
    })
    .then((result) => {
      console.log(result);
      let deleteDone = result["ok"];
      if (deleteDone) {
        window.location.reload();
        alert("已刪除景點");
      } else {
        alert(result["message"]);
      }
    });
}



// TopPay
// SetupSDK

TPDirect.setupSDK(20477, 'app_k1yTFSr7WNd6XUn0NIUnxg6k8BTfKi4n4lDA7fxssgfZjCNjNrYUZC9Omez8', 'sandbox')

// TPDirect.card.setup(config)
TPDirect.card.setup({
  fields: {
      number: {
          element: document.getElementById('card-number'),
          placeholder: '**** **** **** ****'
      },
      expirationDate: {
          element: '#card-expiration-date',
          placeholder: 'MM / YY'
      },
      ccv: {
          element: '#card-ccv',
          placeholder: 'CVV'
      }
  },
  styles: {
      'input': {
          'color': 'grey'
      },
      'input.ccv': {
          'font-size': '16px'
      },
      'input.expiration-date': {
          'font-size': '16px'
      },
      'input.card-number': {
          'font-size': '16px'
      },
      '.valid': {
          'color': 'green'
      },
      '.invalid': {
          'color': 'red'
      },
      '@media screen and (max-width: 400px)': {
          'input': {
              'color': 'orange'
          }
      }
  }
});

// 目前卡片資訊的輸入狀態
TPDirect.card.onUpdate(update => {
    const orderButton = document.getElementById('paySubmit');

    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        orderButton.removeAttribute('disabled');

    } else {
        // Disable submit Button to get prime.
        orderButton.setAttribute('disabled', true);

    }
});

// call TPDirect.card.getPrime when user submit form to get tappay prime
document.getElementById("paySubmit").addEventListener('click', getPrime);
function getPrime(event) {
    event.preventDefault()
    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()
    console.log(tappayStatus)
    // 確認是否可以 getPrime (if canGetPrime (boolean) = true 全部欄位皆正確，可呼叫 getPrime)
    if (tappayStatus.canGetPrime === false) {
        console.log('can not get prime')
        return
    }
    // Get prime
    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
          // console.log('get prime error ' + result)
          console.log(result)
          console.log(result.card)
      }
      console.log('get prime 成功，prime: ' + result.card.prime)
      let prime = result.card.prime;
       // send prime to server, to pay with Pay by Prime API.
       postOrder(prime);
  });

}

function postOrder(prime) {
  let name = document.getElementById('name').value
  let email = document.getElementById('email').value
  let phone = document.getElementById('phone').value

  fetch('/api/orders', {
      method: 'POST',
      headers: {
          'content-type': 'application/json'
      },
      body: JSON.stringify({
          "prime": prime,
          "price":document.querySelector('.amount'),
          "order":orderDetails,
          "contact": {
              "name": name,
              "email": email,
              "phone": phone,
          }
      })
  }).then(function (response) {
      return response.json()
  }).then((result) => {
      console.log(result)
      if (result['error']){
          alert(result['message']);
      }
    
      if (result["data"]["payment"]["status"] == 0){
          let orderNumber = result["data"]["number"];
          window.location.href = `/thankyou?number=${orderNumber}`
      }else{
          alert(result["data"]['payment']['message'] + "\r\n" + "\r\n" + result["data"]['number'])
      }
  }).catch(function(err){
      console.log(err)
  })
}

