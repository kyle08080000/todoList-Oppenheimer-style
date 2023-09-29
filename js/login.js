const apiUrl = `https://todoo.5xcamp.us`;
let token = axios.defaults.headers.common['Authorization'];
// 存儲 token 到 localStorage
localStorage.setItem('token', token);

// 表單驗證
(function () {
    'use strict';

    var forms = document.querySelectorAll('.needs-validation');

    Array.prototype.slice.call(forms)
    .forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();
            const email = form.email.value;
            const password = form.password.value;

            if (form.checkValidity()) {
                logIn(email, password);
                Swal.fire({
                    icon: 'success',
                    title: '登入成功',
                    text: '準備進入...',
                    timer: 1500,  // 可选: 这行代码将在1.5秒后自动关闭弹窗
                    preConfirm: window.location.href = 'todoList.html',  // 登入成功后跳转到todolist.html
                });
            } else {
                form.classList.add('was-validated');
            }
        }, false);
    });
})();


function signUp(email,nickname,password){
    axios.post(`${apiUrl}/users`,{
        "user": {
            "email": email,
            "nickname": nickname,
            "password": password
        }
    })
    .then(response=>console.log(response))
    .catch(error=>console.log(error.response))
}

function logIn(email,password){
    return axios.post(`${apiUrl}/users/sign_in`,{
        "user": {
            "email": email,
            "password": password
        }
    })
    .then(response=>{
        axios.defaults.headers.common['Authorization'] = response.headers.authorization;
        localStorage.setItem('token', response.headers.authorization);  // 更新 localStorage
    })
    .catch(error=>console.log(error.response))
}