const apiUrl = `https://todoo.5xcamp.us`;

document.addEventListener('DOMContentLoaded', (event) => {
// 登入頁面表單驗證
(function () {
        'use strict';

        var forms = document.querySelectorAll('.needs-validation');

        Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                event.stopPropagation();
                const email = form.email.value;
                // 检查密码和确认密码是否匹配
                const password = form.password.value;

                if (form.checkValidity()) {
                    logIn(email,password);
                } else {
                    form.classList.add('was-validated');
                }
            }, false);
        });
    })();
});


// logIn("qwert@yahoo.com","Kyle1234");
async function logIn(email,password){
    try {
        const response = await axios.post(`${apiUrl}/users/sign_in`, {
            "user": {
                "email": email,
                "password": password
            }
        });

        // 從回應 headers 中取得 Authorization token
        const authToken = response.headers['authorization'] || response.headers['Authorization'] || response.headers['AUTHORIZATION']; //若回傳有金鑰

        if (authToken) {
            // 將 Authorization token 設置為 axios 的預設 headers
            // axios.defaults.headers.common['Authorization'] = authToken; //kyle
            axios.defaults.headers.common['Authorization'] = response.headers.authorization;
            localStorage.setItem('token', response.headers.authorization);  // 更新 localStorage
            // 將 Authorization token 儲存在 localStorage 中
            // localStorage.setItem('token', authToken); ///kyle

            Swal.fire({
                icon: 'success',
                title: '登入成功',
                text: '準備進入...',
                allowOutsideClick: false,  // 阻止用户通过点击外部来关闭Swal对话框
                showConfirmButton: false,  // 这行代码将移除确认按钮
                timer: 1500,  // 可选: 这行代码将在1.5秒后自动关闭弹窗
                timerProgressBar: true,  // 显示倒计时进度条
                didClose: () => {  // 当弹窗关闭时执行的函数
                    window.location.href = './html/todoList.html';
                }
            });
        } else {
            // 如果没有找到 Authorization token，抛出错误
            throw new Error('Authorization token not found in response headers');
        }

    } catch(error) {
        if (error.response && error.response.status === 401) {
            // Handle 401 error
            Swal.fire({
                icon: 'error',
                title: '登入失敗',
                text: '無此用戶.'
            });
        } else {
            // Handle other errors
            Swal.fire({
                icon: 'error',
                title: '發生錯誤',
                text: '發生不可預期的錯誤.'
            });
        }
    }
}

