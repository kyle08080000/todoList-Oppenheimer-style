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
            const nickname = form.username.value;
            // 检查密码和确认密码是否匹配
            const password = form.password.value;
            const confirmPassword = form.confirmPassword.value;
            if (password !== confirmPassword) {
                form.confirmPassword.setCustomValidity('密码和确认密码不匹配');
            } else {
                form.confirmPassword.setCustomValidity('');
            }

            if (form.checkValidity()) {
                signUp(email,nickname,password);
            } else {
                form.classList.add('was-validated');
            }
        }, false);
    });
})();

async function signUp(email,nickname,password){
    try {
        const response = await axios.post(`${apiUrl}/users`,{
            "user": {
                "email": email,
                "nickname": nickname,
                "password": password
            }
        });
        Swal.fire({
            icon: 'success',
            title: '註冊成功',
            text: '請妥善保管您的帳號！',
            confirmButtonColor: '#6E1610',
            confirmButtonText: '開始使用！',
            preConfirm: async () => {
                try {
                    await logIn(email, password);
                    window.location.href = 'todoList.html';  // 登入成功后跳转到todolist.html
                } catch (error) {
                    Swal.showValidationMessage(`登入失败: ${error.message}`);
                }
            }
        });
    } catch(error) {
        if (error.response && error.response.status === 422) {
            // Handle 422 error
            Swal.fire({
                icon: 'error',
                title: '注册失败',
                text: '重复的电子邮件地址.'
            });
        } else {
            // Handle other errors
            Swal.fire({
                icon: 'error',
                title: '发生错误',
                text: error.message
            });
        }
    }
}

async function logIn(email,password){
    try{
        const response = await axios.post(`${apiUrl}/users/sign_in`,{
            "user": {
                "email": email,
                "password": password
            }
        });
        axios.defaults.headers.common['Authorization'] = response.headers.authorization;
        localStorage.setItem('token', response.headers.authorization);  // 更新 localStorage
    } catch(error) {
        Swal.showValidationMessage(`登入失败: ${error.message}`);
    }
}


